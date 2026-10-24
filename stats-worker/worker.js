/* ------------------------------------------------------------------
   mamochi のアクセスランキング用 Worker（Cloudflare Workers + D1）

   POST /hit      { id: "作品のid", kind: "view" | "open" }
                  view = 作品の詳細を開いた / open = 「サイトを見る」「遊んでみる」を押した
                  同じ人・同じ作品・同じ種類は 1 日 1 回だけ数える
   GET  /ranking?days=30   直近 30 日（days=all で累計）の回数

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
      if (request.method === "GET" && url.pathname === "/") return json({ ok: true, service: "mamochi-stats" }, 200, headers);
      return json({ error: "not found" }, 404, headers);
    } catch (e) {
      return json({ error: "server" }, 500, headers);
    }
  },
};
