var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker.js
var ALLOWED_ORIGINS = [
  "https://mamochi-ai.github.io",
  "http://localhost:8000",
  "http://127.0.0.1:8000"
];
var ID_RE = /^[a-z0-9-]{1,40}$/;
var KINDS = /* @__PURE__ */ new Set(["view", "open"]);
var SCHEMA = [
  "CREATE TABLE IF NOT EXISTS hits (day TEXT NOT NULL, id TEXT NOT NULL, kind TEXT NOT NULL, n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (day, id, kind))",
  "CREATE TABLE IF NOT EXISTS seen (day TEXT NOT NULL, k TEXT NOT NULL, PRIMARY KEY (day, k))",
  "CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS players (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, keyhash TEXT NOT NULL UNIQUE, created TEXT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS plays (id INTEGER PRIMARY KEY AUTOINCREMENT, game TEXT NOT NULL, player INTEGER NOT NULL, score INTEGER NOT NULL, day TEXT NOT NULL, run TEXT NOT NULL UNIQUE)",
  "CREATE INDEX IF NOT EXISTS plays_rank ON plays (game, day, score DESC)"
];
var GAMES = /* @__PURE__ */ new Set(["mochihop"]);
var POINTS_PER_SEC = 60;
var KEY_RE = /^[0-9a-f]{32,64}$/;
var NAME_FIRST = [
  "\u306F\u3084\u3044",
  "\u306D\u3080\u3044",
  "\u307E\u3058\u3081\u306A",
  "\u3054\u304D\u3052\u3093",
  "\u304F\u3044\u3057\u3093\u307C\u3046",
  "\u3053\u308F\u304C\u308A",
  "\u306E\u3093\u3073\u308A",
  "\u3061\u3044\u3055\u306A",
  "\u304A\u304A\u304D\u306A",
  "\u3075\u308F\u3075\u308F",
  "\u3074\u304B\u3074\u304B",
  "\u306F\u3089\u307A\u3053",
  "\u307E\u3044\u3054\u306E",
  "\u3066\u308C\u3084\u306E",
  "\u3052\u3093\u304D\u306A",
  "\u3057\u305A\u304B\u306A",
  "\u3059\u3070\u3084\u3044",
  "\u307B\u304B\u307B\u304B",
  "\u3072\u3093\u3084\u308A",
  "\u307D\u304B\u307D\u304B"
];
var NAME_SECOND = [
  "\u30D3\u30FC\u30D0\u30FC",
  "\u304A\u3082\u3061",
  "\u3060\u3093\u3054",
  "\u30C8\u30E9\u30C3\u30AF",
  "\u30D4\u30F3\u30DD\u30F3",
  "\u3053\u3051\u3057",
  "\u3086\u304D\u3046\u3055\u304E",
  "\u307F\u304B\u3093",
  "\u304A\u306B\u304E\u308A",
  "\u305F\u3044\u3084\u304D",
  "\u304B\u3048\u308B",
  "\u306D\u3053",
  "\u3044\u306C",
  "\u30DA\u30F3\u30AE\u30F3",
  "\u30ED\u30DC\u30C3\u30C8",
  "\u3066\u308B\u3066\u308B"
];
var ready = null;
function setup(db) {
  if (!ready) ready = db.batch(SCHEMA.map((q) => db.prepare(q))).catch((e) => {
    ready = null;
    throw e;
  });
  return ready;
}
__name(setup, "setup");
function jstDay(offsetDays = 0) {
  return new Date(Date.now() + 9 * 36e5 + offsetDays * 864e5).toISOString().slice(0, 10);
}
__name(jstDay, "jstDay");
async function salt(db) {
  const row = await db.prepare("SELECT value FROM meta WHERE key = 'salt'").first();
  if (row) return row.value;
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const value = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  await db.prepare("INSERT OR IGNORE INTO meta (key, value) VALUES ('salt', ?)").bind(value).run();
  return (await db.prepare("SELECT value FROM meta WHERE key = 'salt'").first()).value;
}
__name(salt, "salt");
async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(sha256, "sha256");
async function hmac(db, text) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(await salt(db)), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(text));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(hmac, "hmac");
function makeName(first, second) {
  return NAME_FIRST.includes(first) && NAME_SECOND.includes(second) ? `${first}${second}` : null;
}
__name(makeName, "makeName");
async function playerByKey(db, key) {
  if (!KEY_RE.test(key)) return null;
  return db.prepare("SELECT id, name FROM players WHERE keyhash = ?").bind(await sha256(`player|${key}`)).first();
}
__name(playerByKey, "playerByKey");
function cors(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin"
  };
}
__name(cors, "cors");
function json(data, status, headers) {
  return new Response(JSON.stringify(data), { status, headers: { ...headers, "Content-Type": "application/json; charset=utf-8" } });
}
__name(json, "json");
async function hit(request, env, headers) {
  const origin = request.headers.get("Origin") || "";
  if (!ALLOWED_ORIGINS.includes(origin)) return json({ error: "origin" }, 403, headers);
  let body;
  try {
    body = JSON.parse(await request.text());
  } catch {
    return json({ error: "body" }, 400, headers);
  }
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
      env.DB.prepare("DELETE FROM seen WHERE day < ?").bind(jstDay(-1))
    ]);
  }
  return new Response(null, { status: 204, headers });
}
__name(hit, "hit");
async function readBody(request) {
  try {
    return JSON.parse(await request.text());
  } catch {
    return null;
  }
}
__name(readBody, "readBody");
async function runStart(request, env, headers) {
  if (!ALLOWED_ORIGINS.includes(request.headers.get("Origin") || "")) return json({ error: "origin" }, 403, headers);
  const body = await readBody(request);
  const game = String(body?.game || "");
  if (!GAMES.has(game)) return json({ error: "input" }, 400, headers);
  const nonce = [...crypto.getRandomValues(new Uint8Array(9))].map((b) => b.toString(16).padStart(2, "0")).join("");
  const head = `${game}.${Date.now()}.${nonce}`;
  return json({ token: `${head}.${await hmac(env.DB, head)}` }, 200, headers);
}
__name(runStart, "runStart");
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
    return json({ error: "taken" }, 409, headers);
  }
  return json({ ok: true, name }, 200, headers);
}
__name(player, "player");
async function scoreSubmit(request, env, headers) {
  if (!ALLOWED_ORIGINS.includes(request.headers.get("Origin") || "")) return json({ error: "origin" }, 403, headers);
  const body = await readBody(request);
  const parts = String(body?.token || "").split(".");
  if (parts.length !== 4) return json({ error: "token" }, 400, headers);
  const [game, startedAt, nonce, sig] = parts;
  const head = `${game}.${startedAt}.${nonce}`;
  if (!GAMES.has(game) || sig !== await hmac(env.DB, head)) return json({ error: "token" }, 400, headers);
  const elapsed = (Date.now() - Number(startedAt)) / 1e3;
  const score = Number(body?.score);
  if (!Number.isInteger(score) || score < 1) return json({ error: "score" }, 400, headers);
  if (elapsed > 3600) return json({ error: "expired" }, 400, headers);
  if (score > elapsed * POINTS_PER_SEC * 1.05 + 30) return json({ error: "score" }, 400, headers);
  const me = await playerByKey(env.DB, String(body?.key || ""));
  if (!me) return json({ error: "player" }, 400, headers);
  const prev = await env.DB.prepare("SELECT MAX(score) AS best FROM plays WHERE game = ? AND player = ?").bind(game, me.id).first();
  const res = await env.DB.prepare("INSERT OR IGNORE INTO plays (game, player, score, day, run) VALUES (?, ?, ?, ?, ?)").bind(game, me.id, score, jstDay(), await sha256(head)).run();
  if (res.meta.changes !== 1) return json({ error: "used" }, 409, headers);
  const best = await env.DB.prepare("SELECT MAX(score) AS best FROM plays WHERE game = ? AND player = ?").bind(game, me.id).first();
  const rank = await env.DB.prepare("SELECT COUNT(*) + 1 AS rank FROM (SELECT player, MAX(score) AS s FROM plays WHERE game = ? GROUP BY player) WHERE s > ?").bind(game, best.best).first();
  return json({ ok: true, name: me.name, score, prev: prev.best, best: best.best, rank: rank.rank }, 200, headers);
}
__name(scoreSubmit, "scoreSubmit");
async function scoreList(url, env, headers) {
  const game = url.searchParams.get("game") || "mochihop";
  if (!GAMES.has(game)) return json({ error: "input" }, 400, headers);
  const period = url.searchParams.get("period") === "all" ? "all" : "week";
  const from = period === "all" ? "0000-00-00" : jstDay(-6);
  const { results } = await env.DB.prepare("SELECT p.name AS name, MAX(s.score) AS score FROM plays s JOIN players p ON p.id = s.player WHERE s.game = ? AND s.day >= ? GROUP BY s.player ORDER BY score DESC LIMIT 10").bind(game, from).all();
  return json({ game, period, items: results }, 200, { ...headers, "Cache-Control": "public, max-age=30" });
}
__name(scoreList, "scoreList");
async function ranking(url, env, headers) {
  const days = url.searchParams.get("days") === "all" ? "all" : 30;
  const from = days === "all" ? "0000-00-00" : jstDay(-(days - 1));
  const { results } = await env.DB.prepare("SELECT id, kind, SUM(n) AS n FROM hits WHERE day >= ? GROUP BY id, kind").bind(from).all();
  const items = {};
  for (const r of results) {
    items[r.id] ||= { id: r.id, view: 0, open: 0 };
    items[r.id][r.kind] = r.n;
  }
  return json(
    { days, from: days === "all" ? null : from, items: Object.values(items) },
    200,
    { ...headers, "Cache-Control": "public, max-age=300" }
  );
}
__name(ranking, "ranking");
var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = cors(request.headers.get("Origin") || "");
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (!env.DB) return json({ error: "D1 \u306E\u30D0\u30A4\u30F3\u30C9\uFF08\u540D\u524D: DB\uFF09\u304C\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093" }, 500, headers);
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
  }
};

// ../../../../tmp/claude-0/-home-user-Webpage/bdc99c9d-23d8-553c-8c44-98d4b37fbc48/scratchpad/wr/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../../tmp/claude-0/-home-user-Webpage/bdc99c9d-23d8-553c-8c44-98d4b37fbc48/scratchpad/wr/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-1YiaPy/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// ../../../../tmp/claude-0/-home-user-Webpage/bdc99c9d-23d8-553c-8c44-98d4b37fbc48/scratchpad/wr/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-1YiaPy/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map
