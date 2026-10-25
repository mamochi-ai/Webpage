/* ------------------------------------------------------------------
   mamochi のアクセスランキング用 Worker（Cloudflare Workers + D1）

   POST /hit      { id: "作品のid", kind: "view" | "open" }
                  view = 作品の詳細を開いた / open = 「サイトを見る」「遊んでみる」を押した
                  同じ人・同じ作品・同じ種類は 1 日 1 回だけ数える
   GET  /ranking?days=30   直近 30 日（days=all で累計）の回数

   おまけゲーム Mochi Hop のスコア
   GET  /names    名前に使える言葉の一覧（自由入力はできない。前半＋後半の組み合わせ）
   POST /player   { key, first, second } 名前を予約する（同じ key なら名前の付け替え）
                  key は端末で作った合言葉。サーバーには元に戻せない形でだけ保存する
                  ほかの人が予約済みの名前は使えない
   POST /run      ゲーム開始の合図。署名つきの整理券（token）を返す
   POST /score    { token, key, score } 整理券 1 枚につき 1 回だけ登録できる
                  開始からの経過時間でありえない点数（1 秒あたり約 60 点が上限）は受け付けない
   GET  /scores?period=week   今週（直近 7 日）の上位 10（period=all で全期間）。1 人 1 行（最高点）

   保存するのは「日付・作品・種類・回数」だけ。IP アドレスや端末の情報は保存しない
   （1 日 1 回の判定には、IP などを推測できない形に変換した値を使い、2 日で消す）。
   D1 のバインド名は DB。表は最初のアクセスで自動で作る。
------------------------------------------------------------------- */

const ALLOWED_ORIGINS = [
  "https://mamochi-ai.github.io",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
];
const ID_RE = /^[a-z0-9-]{1,40}$/;
const KINDS = new Set(["view", "open"]);

const SCHEMA = [
  "CREATE TABLE IF NOT EXISTS hits (day TEXT NOT NULL, id TEXT NOT NULL, kind TEXT NOT NULL, n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (day, id, kind))",
  "CREATE TABLE IF NOT EXISTS seen (day TEXT NOT NULL, k TEXT NOT NULL, PRIMARY KEY (day, k))",
  "CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS players (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, keyhash TEXT NOT NULL UNIQUE, created TEXT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS plays (id INTEGER PRIMARY KEY AUTOINCREMENT, game TEXT NOT NULL, player INTEGER NOT NULL, score INTEGER NOT NULL, day TEXT NOT NULL, run TEXT NOT NULL UNIQUE)",
  "CREATE INDEX IF NOT EXISTS plays_rank ON plays (game, day, score DESC)",
];
const GAMES = new Set(["mochihop"]);
const POINTS_PER_SEC = 60;
const KEY_RE = /^[0-9a-f]{32,64}$/;

/** 名前に使える言葉（前半＋後半をつなげて「はやいビーバー」のようにする） */
const NAME_FIRST = [
  "はやい", "ねむい", "まじめな", "ごきげん", "くいしんぼう", "こわがり", "のんびり", "ちいさな", "おおきな", "ふわふわ",
  "ぴかぴか", "はらぺこ", "まいごの", "てれやの", "げんきな", "しずかな", "すばやい", "ほかほか", "ひんやり", "ぽかぽか",
];
const NAME_SECOND = [
  "ビーバー", "おもち", "だんご", "トラック", "ピンポン", "こけし", "ゆきうさぎ", "みかん",
  "おにぎり", "たいやき", "かえる", "ねこ", "いぬ", "ペンギン", "ロボット", "てるてる",
];
let ready = null;

function setup(db) {
  if (!ready) ready = db.batch(SCHEMA.map((q) => db.prepare(q))).catch((e) => { ready = null; throw e; });
  return ready;
}

/** 日本時間の日付（YYYY-MM-DD） */
function jstDay(offsetDays = 0) {
  return new Date(Date.now() + 9 * 3600e3 + offsetDays * 86400e3).toISOString().slice(0, 10);
}

async function salt(db) {
  const row = await db.prepare("SELECT value FROM meta WHERE key = 'salt'").first();
  if (row) return row.value;
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const value = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  await db.prepare("INSERT OR IGNORE INTO meta (key, value) VALUES ('salt', ?)").bind(value).run();
  return (await db.prepare("SELECT value FROM meta WHERE key = 'salt'").first()).value;
}

async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmac(db, text) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(await salt(db)), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(text));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** 一覧の言葉からだけ名前を作る（一覧にない言葉は null） */
function makeName(first, second) {
  return NAME_FIRST.includes(first) && NAME_SECOND.includes(second) ? `${first}${second}` : null;
}

async function playerByKey(db, key) {
  if (!KEY_RE.test(key)) return null;
  return db.prepare("SELECT id, name FROM players WHERE keyhash = ?").bind(await sha256(`player|${key}`)).first();
}

function cors(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(data, status, headers) {
  return new Response(JSON.stringify(data), { status, headers: { ...headers, "Content-Type": "application/json; charset=utf-8" } });
}

async function hit(request, env, headers) {
  const origin = request.headers.get("Origin") || "";
  if (!ALLOWED_ORIGINS.includes(origin)) return json({ error: "origin" }, 403, headers);

  let body;
  try { body = JSON.parse(await request.text()); } catch { return json({ error: "body" }, 400, headers); }
  const id = String(body?.id || "");
  const kind = String(body?.kind || "");
  if (!ID_RE.test(id) || !KINDS.has(kind)) return json({ error: "input" }, 400, headers);

  const day = jstDay();
  const who = `${request.headers.get("CF-Connecting-IP") || ""}|${request.headers.get("User-Agent") || ""}`;
  const k = await sha256(`${await salt(env.DB)}|${day}|${who}|${id}|${kind}`);

  const first = await env.DB.prepare("INSERT OR IGNORE INTO seen (day, k) VALUES (?, ?)").bind(day, k).run();
  if (first.meta.changes === 1) {
    await env.DB.batch([
      env.DB.prepare("INSERT INTO hits (day, id, kind, n) VALUES (?, ?, ?, 1) ON CONFLICT (day, id, kind) DO UPDATE SET n = n + 1").bind(day, id, kind),
      env.DB.prepare("DELETE FROM seen WHERE day < ?").bind(jstDay(-1)),
    ]);
  }
  return new Response(null, { status: 204, headers });
}

async function readBody(request) {
  try { return JSON.parse(await request.text()); } catch { return null; }
}

/** ゲーム開始：整理券 = 開始時刻.乱数.署名 */
async function runStart(request, env, headers) {
  if (!ALLOWED_ORIGINS.includes(request.headers.get("Origin") || "")) return json({ error: "origin" }, 403, headers);
  const body = await readBody(request);
  const game = String(body?.game || "");
  if (!GAMES.has(game)) return json({ error: "input" }, 400, headers);
  const nonce = [...crypto.getRandomValues(new Uint8Array(9))].map((b) => b.toString(16).padStart(2, "0")).join("");
  const head = `${game}.${Date.now()}.${nonce}`;
  return json({ token: `${head}.${await hmac(env.DB, head)}` }, 200, headers);
}

async function player(request, env, headers) {
  if (!ALLOWED_ORIGINS.includes(request.headers.get("Origin") || "")) return json({ error: "origin" }, 403, headers);
  const body = await readBody(request);
  const key = String(body?.key || "");
  const name = makeName(String(body?.first || ""), String(body?.second || ""));
  if (!KEY_RE.test(key) || !name) return json({ error: "input" }, 400, headers);

  const me = await playerByKey(env.DB, key);
  if (me && me.name === name) return json({ ok: true, name }, 200, headers);
  const owner = await env.DB.prepare("SELECT id FROM players WHERE name = ?").bind(name).first();
  if (owner) return json({ error: "taken" }, 409, headers);
  try {
    if (me) await env.DB.prepare("UPDATE players SET name = ? WHERE id = ?").bind(name, me.id).run();
    else await env.DB.prepare("INSERT INTO players (name, keyhash, created) VALUES (?, ?, ?)").bind(name, await sha256(`player|${key}`), jstDay()).run();
  } catch {
    return json({ error: "taken" }, 409, headers); // 同時に同じ名前が予約された
  }
  return json({ ok: true, name }, 200, headers);
}

async function scoreSubmit(request, env, headers) {
  if (!ALLOWED_ORIGINS.includes(request.headers.get("Origin") || "")) return json({ error: "origin" }, 403, headers);
  const body = await readBody(request);
  const parts = String(body?.token || "").split(".");
  if (parts.length !== 4) return json({ error: "token" }, 400, headers);
  const [game, startedAt, nonce, sig] = parts;
  const head = `${game}.${startedAt}.${nonce}`;
  if (!GAMES.has(game) || sig !== (await hmac(env.DB, head))) return json({ error: "token" }, 400, headers);

  const elapsed = (Date.now() - Number(startedAt)) / 1000;
  const score = Number(body?.score);
  if (!Number.isInteger(score) || score < 1) return json({ error: "score" }, 400, headers);
  if (elapsed > 3600) return json({ error: "expired" }, 400, headers);
  if (score > elapsed * POINTS_PER_SEC * 1.05 + 30) return json({ error: "score" }, 400, headers);

  const me = await playerByKey(env.DB, String(body?.key || ""));
  if (!me) return json({ error: "player" }, 400, headers);
  const prev = await env.DB.prepare("SELECT MAX(score) AS best FROM plays WHERE game = ? AND player = ?").bind(game, me.id).first();
  const res = await env.DB
    .prepare("INSERT OR IGNORE INTO plays (game, player, score, day, run) VALUES (?, ?, ?, ?, ?)")
    .bind(game, me.id, score, jstDay(), await sha256(head))
    .run();
  if (res.meta.changes !== 1) return json({ error: "used" }, 409, headers);
  const best = await env.DB.prepare("SELECT MAX(score) AS best FROM plays WHERE game = ? AND player = ?").bind(game, me.id).first();
  const rank = await env.DB
    .prepare("SELECT COUNT(*) + 1 AS rank FROM (SELECT player, MAX(score) AS s FROM plays WHERE game = ? GROUP BY player) WHERE s > ?")
    .bind(game, best.best)
    .first();
  return json({ ok: true, name: me.name, score, prev: prev.best, best: best.best, rank: rank.rank }, 200, headers);
}

async function scoreList(url, env, headers) {
  const game = url.searchParams.get("game") || "mochihop";
  if (!GAMES.has(game)) return json({ error: "input" }, 400, headers);
  const period = url.searchParams.get("period") === "all" ? "all" : "week";
  const from = period === "all" ? "0000-00-00" : jstDay(-6);
  const { results } = await env.DB
    .prepare("SELECT p.name AS name, MAX(s.score) AS score FROM plays s JOIN players p ON p.id = s.player WHERE s.game = ? AND s.day >= ? GROUP BY s.player ORDER BY score DESC LIMIT 10")
    .bind(game, from)
    .all();
  return json({ game, period, items: results }, 200, { ...headers, "Cache-Control": "public, max-age=30" });
}

async function ranking(url, env, headers) {
  const days = url.searchParams.get("days") === "all" ? "all" : 30;
  const from = days === "all" ? "0000-00-00" : jstDay(-(days - 1));
  const { results } = await env.DB
    .prepare("SELECT id, kind, SUM(n) AS n FROM hits WHERE day >= ? GROUP BY id, kind")
    .bind(from)
    .all();
  const items = {};
  for (const r of results) {
    items[r.id] ||= { id: r.id, view: 0, open: 0 };
    items[r.id][r.kind] = r.n;
  }
  return json(
    { days, from: days === "all" ? null : from, items: Object.values(items) },
    200,
    { ...headers, "Cache-Control": "public, max-age=300" },
  );
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = cors(request.headers.get("Origin") || "");
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (!env.DB) return json({ error: "D1 のバインド（名前: DB）が設定されていません" }, 500, headers);

    try {
      await setup(env.DB);
      if (request.method === "POST" && url.pathname === "/hit") return await hit(request, env, headers);
      if (request.method === "GET" && url.pathname === "/ranking") return await ranking(url, env, headers);
      if (request.method === "GET" && url.pathname === "/names") return json({ first: NAME_FIRST, second: NAME_SECOND }, 200, { ...headers, "Cache-Control": "public, max-age=3600" });
      if (request.method === "POST" && url.pathname === "/player") return await player(request, env, headers);
      if (request.method === "POST" && url.pathname === "/run") return await runStart(request, env, headers);
      if (request.method === "POST" && url.pathname === "/score") return await scoreSubmit(request, env, headers);
      if (request.method === "GET" && url.pathname === "/scores") return await scoreList(url, env, headers);
      if (request.method === "GET" && url.pathname === "/") return json({ ok: true, service: "mamochi-stats" }, 200, headers);
      return json({ error: "not found" }, 404, headers);
    } catch (e) {
      return json({ error: "server" }, 500, headers);
    }
  },
};
