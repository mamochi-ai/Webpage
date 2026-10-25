(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = (n) => String(n).padStart(2, "0");

  const WORKS = window.WORKS || [];
  const SETS = window.STICKER_SETS || {};
  const SITE = window.SITE || {};
  const CAT = {
    web: { label: "Web System", ja: "ウェブシステム", color: "var(--web)" },
    game: { label: "Game", ja: "ゲーム", color: "var(--game)" },
    sticker: { label: "LINE Sticker", ja: "LINEスタンプ", color: "var(--sticker)" },
    booth: { label: "BOOTH", ja: "BOOTH", color: "var(--booth)" },
  };

  function rng(seed) {
    let a = seed >>> 0 || 1;
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* =======================================================
     Art: thumbnails (generated, so no images are required)
     ======================================================= */
  function thumbWeb(t) {
    const r = rng(t.seed);
    const A = t.accent;
    const lines = (x, y, n, w, gap = 12) => Array.from({ length: n }, (_, i) =>
      `<rect x="${x}" y="${y + i * gap}" width="${w * (0.45 + r() * 0.55)}" height="5" rx="2.5" fill="#151513" opacity="${i === 0 ? .8 : .18}"/>`).join("");
    let content = "";
    const X = 112, Y = 76;
    if (t.layout === "kanban") {
      content = [0, 1, 2].map((c) => {
        const cx = X + c * 88;
        const n = 2 + Math.floor(r() * 3);
        return `<rect x="${cx}" y="${Y}" width="80" height="196" rx="8" fill="#F1EEE7"/>
          <text x="${cx + 10}" y="${Y + 18}" font-family="JetBrains Mono, monospace" font-size="8" fill="#151513" opacity=".55">${["TODO", "DOING", "DONE"][c]}</text>
          ${Array.from({ length: n }, (_, i) => `<g transform="translate(${cx + 7} ${Y + 28 + i * 44})">
            <rect width="66" height="38" rx="6" fill="#fff" stroke="#151513" stroke-opacity=".1"/>
            <rect x="8" y="9" width="${24 + r() * 26}" height="4" rx="2" fill="#151513" opacity=".7"/>
            <rect x="8" y="18" width="${18 + r() * 30}" height="4" rx="2" fill="#151513" opacity=".15"/>
            <circle cx="56" cy="28" r="5" fill="${i % 2 ? A : "#151513"}" opacity="${i % 2 ? 1 : .2}"/>
            ${c === 1 && i === 0 ? `<rect x="8" y="27" width="20" height="4" rx="2" fill="${A}"/>` : ""}
          </g>`).join("")}`;
      }).join("");
    } else if (t.layout === "calendar") {
      content = `<text x="${X}" y="${Y + 8}" font-family="Inter Tight, sans-serif" font-weight="600" font-size="15" fill="#151513">October</text>` +
        Array.from({ length: 35 }, (_, i) => {
          const cx = X + (i % 7) * 37, cy = Y + 20 + Math.floor(i / 7) * 36;
          const on = r() > .55;
          return `<rect x="${cx}" y="${cy}" width="33" height="32" rx="5" fill="${i === 17 ? A : "#F1EEE7"}"/>
            <text x="${cx + 5}" y="${cy + 11}" font-family="JetBrains Mono, monospace" font-size="7" fill="${i === 17 ? "#fff" : "#151513"}" opacity=".7">${(i % 31) + 1}</text>
            ${on && i !== 17 ? `<rect x="${cx + 5}" y="${cy + 18}" width="${12 + r() * 14}" height="4" rx="2" fill="${A}" opacity=".75"/>` : ""}`;
        }).join("");
    } else if (t.layout === "dashboard") {
      const pts = Array.from({ length: 12 }, (_, i) => `${X + 4 + i * 23},${Y + 176 - (20 + r() * 50 + i * 4)}`).join(" ");
      content = [0, 1, 2].map((i) => `<g transform="translate(${X + i * 88} ${Y})"><rect width="80" height="56" rx="8" fill="#F1EEE7"/>
          <rect x="10" y="12" width="30" height="4" rx="2" fill="#151513" opacity=".3"/>
          <text x="10" y="42" font-family="Inter Tight, sans-serif" font-size="19" font-weight="600" fill="${i === 0 ? A : "#151513"}">${Math.floor(r() * 90 + 10)}${i === 2 ? "%" : ""}</text></g>`).join("") +
        `<rect x="${X}" y="${Y + 66}" width="256" height="130" rx="8" fill="#F1EEE7"/>
        <polyline points="${pts}" fill="none" stroke="${A}" stroke-width="2.5" stroke-linejoin="round"/>
        ${Array.from({ length: 12 }, (_, i) => `<rect x="${X + 10 + i * 20.5}" y="${Y + 186 - (r() * 26 + 6)}" width="10" height="40" fill="#151513" opacity=".08"/>`).join("")}`;
    } else {
      content = Array.from({ length: 6 }, (_, i) => `<g transform="translate(${X} ${Y + i * 32})">
          <rect width="256" height="26" rx="6" fill="${i === 1 ? "#fff" : "#F1EEE7"}" stroke="${i === 1 ? A : "none"}" stroke-width="1.5"/>
          <circle cx="13" cy="13" r="6" fill="${[A, "#151513"][i % 2]}" opacity="${i % 2 ? .2 : .9}"/>
          <rect x="26" y="8" width="${50 + r() * 40}" height="4" rx="2" fill="#151513" opacity=".7"/>
          <rect x="26" y="15" width="${30 + r() * 30}" height="3" rx="1.5" fill="#151513" opacity=".2"/>
          ${Array.from({ length: 7 }, (_, d) => `<rect x="${140 + d * 15}" y="7" width="11" height="12" rx="3" fill="${r() > .5 ? A : "#151513"}" opacity="${r() > .5 ? .85 : .1}"/>`).join("")}
        </g>`).join("");
    }
    return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="400" height="300" fill="${A}"/>
      <rect width="400" height="300" fill="#fff" opacity=".82"/>
      <g transform="rotate(${(r() - .5) * 2} 200 150)">
        <rect x="22" y="26" width="372" height="290" rx="12" fill="#151513" opacity=".12" transform="translate(6 8)"/>
        <rect x="22" y="26" width="372" height="290" rx="12" fill="#fff" stroke="#151513" stroke-width="1.5"/>
        <path d="M22 50h372" stroke="#151513" stroke-opacity=".12"/>
        <circle cx="38" cy="38" r="4" fill="#FF5F57"/><circle cx="51" cy="38" r="4" fill="#FEBC2E"/><circle cx="64" cy="38" r="4" fill="#28C840"/>
        <rect x="150" y="32" width="120" height="12" rx="6" fill="#151513" opacity=".07"/>
        <rect x="22" y="51" width="76" height="265" fill="#F7F5F0"/>
        <rect x="34" y="64" width="18" height="18" rx="5" fill="${A}"/>
        ${lines(34, 98, 6, 50, 16)}
        <text x="${112}" y="${68}" font-family="Inter Tight, sans-serif" font-size="9" font-weight="600" fill="#151513" opacity=".5">${esc(t.title || "")}</text>
        ${content}
      </g>
    </svg>`;
  }

  function thumbGame(t) {
    const r = rng(t.seed);
    const W = 40, H = 30, S = 10;
    const px = [];
    const P = {
      hop: { sky: ["#BFE3FF", "#D8EEFF", "#EAF6FF"], ground: "#6CC36C", dirt: "#B9824F", acc: "#FF5A1F" },
      kitchen: { sky: ["#241A3D", "#2E2150", "#3A2A63"], ground: "#FF4FA0", dirt: "#1A1230", acc: "#2EF2D1" },
      stars: { sky: ["#0B1030", "#121A45", "#1B2560"], ground: "#2B3570", dirt: "#151B40", acc: "#FFE066" },
    }[t.scene] || {};
    const rect = (x, y, w, h, c) => px.push(`<rect x="${x * S}" y="${y * S}" width="${w * S}" height="${h * S}" fill="${c}"/>`);
    // sky bands
    rect(0, 0, W, 10, P.sky[0]); rect(0, 10, W, 8, P.sky[1]); rect(0, 18, W, 12, P.sky[2]);
    if (t.scene === "stars") {
      const stars = Array.from({ length: 8 }, () => [Math.floor(r() * 36) + 2, Math.floor(r() * 16) + 2]);
      px.push(`<polyline points="${stars.slice(0, 6).map(([x, y]) => `${x * S + 5},${y * S + 5}`).join(" ")}" fill="none" stroke="${P.acc}" stroke-width="2" stroke-dasharray="4 4" opacity=".7"/>`);
      stars.forEach(([x, y], i) => { rect(x, y, 1, 1, i < 6 ? P.acc : "#fff"); if (i < 6) { rect(x - 1, y, 1, 1, P.acc + "88"); rect(x + 1, y, 1, 1, P.acc + "88"); rect(x, y - 1, 1, 1, P.acc + "88"); rect(x, y + 1, 1, 1, P.acc + "88"); } });
      for (let i = 0; i < 30; i++) rect(Math.floor(r() * W), Math.floor(r() * 20), 1, 1, "rgba(255,255,255,.35)");
      rect(31, 3, 4, 4, "#FFF3C4"); rect(30, 4, 1, 2, "#FFF3C4"); rect(35, 4, 1, 2, "#FFF3C4"); rect(32, 3, 2, 1, "#F2E2A0");
    } else if (t.scene === "kitchen") {
      for (let x = 0; x < W; x += 4) for (let y = 0; y < 22; y += 4) if ((x + y) % 8 === 0) rect(x, y, 4, 4, "rgba(255,255,255,.04)");
      [[5, 9, "#2EF2D1"], [16, 7, "#FF4FA0"], [27, 10, "#FFE066"]].forEach(([x, y, c]) => {
        rect(x, y, 7, 1, c); rect(x, y + 4, 7, 1, c); rect(x, y, 1, 5, c); rect(x + 6, y, 1, 5, c);
        rect(x + 2, y + 2, 3, 1, c + "99");
      });
      for (let i = 0; i < 6; i++) rect(4 + i * 6, 19, 3, 2, ["#FFE066", "#FF4FA0", "#2EF2D1"][i % 3]);
    } else {
      [[4, 4], [24, 2], [33, 7]].forEach(([x, y]) => { rect(x, y + 1, 6, 2, "#fff"); rect(x + 1, y, 3, 1, "#fff"); });
      for (let i = 0; i < 3; i++) { const x = 18 + i * 8; const h = 2 + Math.floor(r() * 2); rect(x + 1, 22 - h * 2 - 1, 1, h * 2 + 1, "#8B5A2B"); for (let k = 0; k < h; k++) rect(x, 22 - (k + 1) * 2, 3, 2, ["#FF9EB5", "#FFFFFF", "#9AD67A"][k % 3]); }
      for (let i = 0; i < 4; i++) rect(Math.floor(r() * 30) + 4, 16 - Math.floor(r() * 6), 1, 1, P.acc);
    }
    // ground
    rect(0, 22, W, 2, P.ground); rect(0, 24, W, 6, P.dirt);
    for (let x = 0; x < W; x += 3) rect(x + (Math.floor(x / 3) % 2), 25 + Math.floor(r() * 4), 1, 1, "rgba(0,0,0,.18)");
    // pixel mochi
    const sprite = ["..XXXX..", ".XWWWWX.", "XWWWWWWX", "XWBWWBWX", "XPWWWWPX", ".XXXXXX."];
    const mx = 7, my = t.scene === "hop" ? 13 : 16;
    sprite.forEach((row, y) => [...row].forEach((c, x) => {
      const col = { X: "#151513", W: "#FFFFFF", B: "#151513", P: "#FFB3B3" }[c];
      if (col) rect(mx + x, my + y, 1, 1, col);
    }));
    if (t.scene === "hop") rect(mx + 1, 21, 6, 1, "rgba(0,0,0,.15)");
    return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${px.join("")}</svg>`;
  }

  const stkSrc = (setId, src) => `assets/img/stickers/${setId}/${src}.png`;
  function thumbSticker(w) {
    const set = SETS[w.set];
    if (!set) return "";
    const imgs = set.stickers.slice(0, 3).map((s, i) =>
      `<img src="${stkSrc(w.set, s.src)}" alt="" loading="lazy" style="--r:${[-6, 4, -3][i]}deg">`).join("");
    return `<span class="stk-thumb" style="--bg:${set.bg}"><img class="stk-thumb__cover" src="${stkSrc(w.set, set.cover)}" alt="" loading="lazy">${imgs}</span>`;
  }

  /* 塗り絵の紙を重ねた絵（BOOTH の商品画像が用意できるまでの代わり） */
  function thumbBooth(w) {
    const flower = (cx, cy, r) => Array.from({ length: 5 }, (_, i) => {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      return `<ellipse cx="${cx + Math.cos(a) * r * .62}" cy="${cy + Math.sin(a) * r * .62}" rx="${r * .5}" ry="${r * .42}" transform="rotate(${(a * 180) / Math.PI + 90} ${cx + Math.cos(a) * r * .62} ${cy + Math.sin(a) * r * .62})"/>`;
    }).join("") + `<circle cx="${cx}" cy="${cy}" r="${r * .22}"/>`;
    const page = (x, y, rot, title, fill) => `<g transform="translate(${x} ${y}) rotate(${rot})">
      <rect x="-70" y="-98" width="140" height="196" rx="3" fill="#fff" stroke="#151513" stroke-opacity=".12"/>
      <g fill="${fill || "none"}" stroke="#151513" stroke-width="1.6" stroke-linejoin="round">
        ${flower(-12, -18, 30)}${flower(30, 20, 20)}
        <path d="M-50 70q30-40 60-30t50-20" fill="none"/>
        <ellipse cx="-30" cy="40" rx="18" ry="8" transform="rotate(-30 -30 40)" fill="${fill ? "#7DA36B" : "none"}"/>
      </g>
      <text x="0" y="-70" text-anchor="middle" font-family="'Zen Maru Gothic', sans-serif" font-weight="900" font-size="20" fill="${fill ? "#C8323C" : "#fff"}" stroke="#151513" stroke-width="1.2" paint-order="stroke">${title}</text>
    </g>`;
    return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="400" height="300" fill="#EDE4D6"/>
      ${page(110, 160, -8, "梅の花")}${page(290, 150, 7, "水仙")}${page(200, 156, -1, "寒椿", "#E9545D")}
    </svg>`;
  }

  const thumb = (w) => w.image
    ? `<img src="${esc(w.image)}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;object-position:top left">`
    : w.type === "web" ? thumbWeb({ ...w.thumb, title: w.title })
    : w.type === "game" ? thumbGame(w.thumb)
    : w.type === "booth" ? thumbBooth(w)
    : thumbSticker(w);

  /* =======================================================
     Render
     ======================================================= */
  const byType = (t) => WORKS.filter((w) => w.type === t);

  // hero
  const CHARA = (pose) => `assets/img/chara/${pose}.png`;
  $("#hero-mochi").innerHTML = `<img class="hero__chara" src="${CHARA("big")}" alt="" width="672" height="493"><img class="hero__chara hero__chara--flat" src="${CHARA("flat")}" alt="" width="484" height="192">`;
  $("#hero-counts").innerHTML = [["web", "#web"], ["game", "#games"], ["sticker", "#stickers"], ["booth", "#booth"]].map(([t, href]) =>
    `<li><a href="${href}" style="--c:${CAT[t].color}"><b>${pad(byType(t).length)}</b><span>${CAT[t].label}${t === "sticker" ? " sets" : t === "booth" ? " items" : "s"}</span><small>${CAT[t].ja}</small></a></li>`).join("");

  // index
  $("#index-count").textContent = `(${pad(WORKS.length)})`;
  $("#index-list").innerHTML = WORKS.map((w, i) => `
    <li class="row" data-type="${w.type}" style="view-transition-name: row-${esc(w.id)}">
      <button type="button" class="row__btn" data-open="${esc(w.id)}">
        <span class="row__no">${pad(i + 1)}</span>
        <span class="row__thumb">${thumb(w)}</span>
        <span class="row__title">${esc(w.title)}<small>${esc(w.titleJa)}</small></span>
        <span class="row__cat"><i class="dot dot--${w.type}"></i>${CAT[w.type].label}</span>
        <span class="row__stack">${esc(w.stack.join(" · "))}</span>
        <span class="row__year">${w.year}</span>
        <span class="row__arrow" aria-hidden="true">→</span>
      </button>
    </li>`).join("");

  const LOCK = `<svg viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="5.5" width="8" height="6" rx="1.2" fill="currentColor"/><path d="M4 5.5V4a2 2 0 0 1 4 0v1.5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>`;
  const cardHtml = (w, i) => `
    <button type="button" class="card" data-open="${esc(w.id)}" data-reveal style="transition-delay:${(i % 2) * 90}ms">
      <span class="card__media ${w.type === "game" ? "card__media--pixel" : ""}">${thumb(w)}</span>
      <span class="card__meta mono"><span>${CAT[w.type].label} / ${pad(i + 1)}</span><span>${w.year}</span></span>
      <h3 class="card__title">${esc(w.title)}<small>${esc(w.titleJa)}</small></h3>
      <p class="card__sum">${esc(w.summary)}</p>
      ${w.local ? `<span class="badge-local">${LOCK}データは端末内だけ</span>` : ""}
      <p class="card__desc">${esc(w.description)}</p>
      <span class="card__cta mono">詳しく見る →</span>
      <ul class="tags">${w.stack.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
    </button>`;
  $("#web-grid").innerHTML = byType("web").map(cardHtml).join("");
  $("#game-list").innerHTML = byType("game").filter((w) => !w.playable).map(cardHtml).join("");
  $("#booth-list").innerHTML = byType("booth").map(cardHtml).join("");

  // contact
  if (SITE.email) {
    $("#mail").href = `mailto:${SITE.email}`;
    $("#mail-text").textContent = SITE.email;
  }
  $("#links").innerHTML = (SITE.links || []).map((l) => `<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a></li>`).join("");
  $("#year").textContent = new Date().getFullYear();

  /* =======================================================
     Header: scroll state, current section, mobile menu, theme
     ======================================================= */
  const hdr = $(".hdr");
  const onScroll = () => hdr.classList.toggle("is-scrolled", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  const navLinks = $$(".hdr__nav a");
  const secObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const s = e.target;
      $("#now-no").textContent = s.dataset.section;
      $("#now-label").textContent = s.dataset.label;
      navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${s.id}`));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("[data-section]").forEach((s) => secObs.observe(s));

  const menuBtn = $("#menu"), nav = $("#nav");
  const setMenu = (open) => {
    menuBtn.setAttribute("aria-expanded", open);
    nav.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  };
  menuBtn.addEventListener("click", () => setMenu(menuBtn.getAttribute("aria-expanded") !== "true"));
  navLinks.forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && nav.classList.contains("is-open")) setMenu(false); });

  const themeColor = () => $('meta[name="theme-color"]').setAttribute("content", getComputedStyle(document.body).backgroundColor);
  $("#theme").addEventListener("click", () => {
    const root = document.documentElement;
    const isDark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    const next = isDark ? "light" : "dark";
    const apply = () => { root.dataset.theme = next; store.set("theme", next); game.refreshColors(); setTimeout(themeColor, 450); };
    if (document.startViewTransition && !reduced) document.startViewTransition(apply); else apply();
  });

  // Tokyo clock
  const clock = $("#clock");
  const fmt = new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const tick = () => { clock.textContent = fmt.format(new Date()); };
  tick(); setInterval(tick, 1000);

  // reveal
  const revObs = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("is-in"); revObs.unobserve(e.target); }
  }), { rootMargin: "0px 0px -8% 0px" });
  $$("[data-reveal]").forEach((el) => revObs.observe(el));

  /* =======================================================
     Hero character: leans toward the pointer, flattens on click
     ======================================================= */
  const heroM = $("#hero-mochi");
  let leanRaf = 0;
  addEventListener("pointermove", (e) => {
    if (leanRaf) return;
    leanRaf = requestAnimationFrame(() => {
      leanRaf = 0;
      const b = heroM.getBoundingClientRect();
      const dx = e.clientX - (b.left + b.width / 2);
      const k = Math.max(-1, Math.min(1, dx / 600));
      heroM.style.setProperty("--lean", `${k * 5}deg`);
    });
  }, { passive: true });
  let flatT = 0;
  heroM.addEventListener("click", () => {
    heroM.classList.add("is-flat");
    clearTimeout(flatT);
    flatT = setTimeout(() => {
      heroM.classList.remove("is-flat", "is-boing"); void heroM.offsetWidth; heroM.classList.add("is-boing");
    }, 650);
  });

  /* =======================================================
     Index: filter (with View Transitions) + hover peek
     ======================================================= */
  const chips = $$(".filters .chip");
  chips.forEach((c) => c.addEventListener("click", () => {
    const f = c.dataset.filter;
    const apply = () => {
      chips.forEach((x) => { const on = x === c; x.classList.toggle("is-on", on); x.setAttribute("aria-pressed", on); });
      let n = 0;
      $$(".row").forEach((r) => { const show = f === "all" || r.dataset.type === f; r.hidden = !show; if (show) n++; });
      $("#index-count").textContent = `(${pad(n)})`;
    };
    if (document.startViewTransition && !reduced) document.startViewTransition(apply); else apply();
  }));

  const peek = $("#peek");
  if (matchMedia("(hover: hover) and (min-width: 861px)").matches) {
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0, current = null;
    const loop = () => {
      x += (tx - x) * .18; y += (ty - y) * .18;
      peek.style.left = `${x}px`; peek.style.top = `${y}px`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > .3 ? requestAnimationFrame(loop) : 0;
    };
    $("#index-list").addEventListener("pointermove", (e) => {
      tx = e.clientX + 180; ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
      const btn = e.target.closest(".row__btn");
      if (btn && btn.dataset.open !== current) {
        current = btn.dataset.open;
        const w = WORKS.find((w) => w.id === current);
        peek.innerHTML = thumb(w);
        peek.style.setProperty("--rot", `${(Math.random() - .5) * 8}deg`);
        if (!peek.classList.contains("is-on")) { x = tx; y = ty; }
        peek.classList.add("is-on");
      }
    });
    $("#index-list").addEventListener("pointerleave", () => { peek.classList.remove("is-on"); current = null; });
  }

  /* =======================================================
     Access ranking (counts kept by stats-worker/worker.js)
     ======================================================= */
  const STATS = (SITE.statsApi || "").replace(/\/$/, "");
  const RANKED = new Set(["web", "game"]);
  function track(id, kind) {
    const w = WORKS.find((w) => w.id === id);
    if (!STATS || !w || !RANKED.has(w.type)) return;
    const key = `hit:${id}:${kind}`;
    try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, "1"); } catch (e) {}
    const body = JSON.stringify({ id, kind });
    try {
      if (!navigator.sendBeacon || !navigator.sendBeacon(`${STATS}/hit`, body)) {
        fetch(`${STATS}/hit`, { method: "POST", body, keepalive: true, mode: "cors" }).catch(() => {});
      }
    } catch (e) {}
  }

  const rankEl = $("#ranking");
  if (STATS && rankEl) {
    const rank = { type: "web", days: "30", data: {} };
    const load = (days) => rank.data[days] || (rank.data[days] = fetch(`${STATS}/ranking?days=${days === "all" ? "all" : 30}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => d.items || [])
      .catch(() => { delete rank.data[days]; return null; }));
    const render = async () => {
      const list = $("#rank-list");
      const items = await load(rank.days);
      if (items === null) { list.innerHTML = `<li class="rank__empty">ランキングを読み込めませんでした。</li>`; return; }
      const score = (x) => x.view + x.open;
      const rows = items
        .map((x) => ({ ...x, w: WORKS.find((w) => w.id === x.id) }))
        .filter((x) => x.w && x.w.type === rank.type && score(x) > 0)
        .sort((a, b) => score(b) - score(a) || b.open - a.open)
        .slice(0, 5);
      if (!rows.length) { list.innerHTML = `<li class="rank__empty">まだ集計中です。作品を開くと、ここに順位が出ます。</li>`; return; }
      const top = score(rows[0]);
      list.innerHTML = rows.map((x, i) => `
        <li class="rank__row">
          <button type="button" class="rank__btn" data-open="${esc(x.w.id)}">
            <span class="rank__no">${i + 1}</span>
            <span class="rank__thumb">${thumb(x.w)}</span>
            <span class="rank__title">${esc(x.w.title)}<small>${esc(x.w.summary)}</small></span>
            <span class="rank__score">
              <span class="rank__bar"><i style="width:${Math.max(6, Math.round((score(x) / top) * 100))}%"></i></span>
              <span class="mono">詳細 ${x.view}・開いた ${x.open}</span>
            </span>
          </button>
        </li>`).join("");
    };
    rankEl.addEventListener("click", (e) => {
      const b = e.target.closest("[data-rank-type], [data-rank-days]");
      if (!b) return;
      if (b.dataset.rankType) rank.type = b.dataset.rankType;
      if (b.dataset.rankDays) rank.days = b.dataset.rankDays;
      $$("[data-rank-type]", rankEl).forEach((x) => x.setAttribute("aria-pressed", x.dataset.rankType === rank.type));
      $$("[data-rank-days]", rankEl).forEach((x) => x.setAttribute("aria-pressed", x.dataset.rankDays === rank.days));
      render();
    });
    rankEl.hidden = false;
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { render(); o.disconnect(); } }, { rootMargin: "200px" }).observe(rankEl);
  }

  /* =======================================================
     Detail sheet
     ======================================================= */
  const sheet = $("#sheet");
  function openWork(id) {
    const w = WORKS.find((w) => w.id === id);
    if (!w) return;
    if (w.playable) { $("#play").scrollIntoView({ behavior: reduced ? "auto" : "smooth" }); setTimeout(() => $("#game").focus({ preventScroll: true }), 600); return; }
    const isExternal = /^https?:/.test(w.url);
    $("#sheet-media").innerHTML = thumb(w);
    $("#sheet-body").innerHTML = `
      <span class="sheet__cat mono"><i class="dot dot--${w.type}"></i>${CAT[w.type].label} — ${w.year}</span>
      <h3 id="sheet-title">${esc(w.title)}<small>${esc(w.titleJa)}</small></h3>
      <p>${esc(w.description)}</p>
      ${w.local ? `<span class="badge-local">${LOCK}入力したデータは端末の中だけに保存され、外部に送信されません</span>` : ""}
      <dl>
        <div><dt class="mono">Role</dt><dd>${esc(w.role)}</dd></div>
        <div><dt class="mono">${w.type === "sticker" || w.type === "booth" ? "Info" : "Stack"}</dt><dd>${esc(w.stack.join(" / "))}</dd></div>
      </dl>
      <div class="sheet__actions">
        ${w.type === "sticker"
          ? `<a class="btn btn--line" href="${esc(w.url)}" target="_blank" rel="noopener">LINE STOREで見る ↗</a><button type="button" class="btn btn--ghost" data-goto-set="${esc(w.set)}">トークで試す</button>`
          : `<a class="btn" href="${esc(w.url)}" data-track-open="${esc(w.id)}" ${isExternal ? 'target="_blank" rel="noopener"' : ""}>${w.type === "game" ? "遊んでみる" : w.type === "booth" ? "BOOTHで見る" : "サイトを見る"} ↗</a>`}
      </div>`;
    sheet.style.setProperty("--cat", CAT[w.type].color);
    sheet.showModal();
    track(w.id, "view");
  }
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-track-open]");
    if (t) track(t.dataset.trackOpen, "open");
    const o = e.target.closest("[data-open]");
    if (o) { openWork(o.dataset.open); return; }
    const g = e.target.closest("[data-goto-set]");
    if (g) { sheet.close(); selectSet(g.dataset.gotoSet); $("#stickers").scrollIntoView({ behavior: reduced ? "auto" : "smooth" }); }
  });
  $("#sheet-close").addEventListener("click", () => sheet.close());
  sheet.addEventListener("click", (e) => { if (e.target === sheet) sheet.close(); });

  /* =======================================================
     Stickers + chat preview
     ======================================================= */
  const stickerWorks = byType("sticker");
  const chat = $("#chat");
  let activeSet = stickerWorks[0] && stickerWorks[0].set;
  const nowTime = () => { const d = new Date(); return `${d.getHours()}:${pad(d.getMinutes())}`; };
  const avatar = `<span class="msg__av"><img src="${CHARA("icon")}" alt=""></span>`;
  function addMsg(html, me) {
    const el = document.createElement("div");
    el.className = `msg${me ? " msg--me" : ""}`;
    el.innerHTML = `${me ? "" : avatar}${html}<span class="msg__time">${me ? "既読<br>" : ""}${nowTime()}</span>`;
    chat.appendChild(el);
    while (chat.children.length > 14) chat.firstElementChild.remove();
    chat.scrollTop = chat.scrollHeight;
  }
  addMsg(`<span class="msg__bubble">おつかれ〜！今日どうだった？</span>`, false);
  addMsg(`<span class="msg__bubble">下のスタンプを押して返信してみて</span>`, false);

  $("#stk-tabs").innerHTML = stickerWorks.map((w) =>
    `<button type="button" class="chip" role="tab" data-set="${esc(w.set)}" aria-selected="false">${esc(w.title)}</button>`).join("");

  function selectSet(id) {
    const w = stickerWorks.find((w) => w.set === id);
    const set = SETS[id];
    if (!w || !set) return;
    activeSet = id;
    $$("#stk-tabs .chip").forEach((b) => b.setAttribute("aria-selected", b.dataset.set === id));
    $("#stk-info").innerHTML = `
      <h3>${esc(w.title)}</h3>
      <p>${esc(w.summary)}</p>
      <span class="mono">${esc(w.stack.join(" / "))} — ${w.year}${/生成AI/.test(w.role) ? " / イラストは生成AIを使用" : ""}</span>
      <a class="btn btn--line" href="${esc(w.url)}" target="_blank" rel="noopener">LINE STOREで見る ↗</a>`;
    const grid = $("#stk-grid");
    grid.innerHTML = set.stickers.map((s, i) =>
      `<button type="button" class="stk__item" style="--i:${i}" data-stk="${i}" aria-label="スタンプ「${esc(s.label)}」を送る"><img src="${stkSrc(id, s.src)}" alt="" loading="lazy"></button>`).join("");
    grid.classList.remove("is-swap"); void grid.offsetWidth; grid.classList.add("is-swap");
  }
  $("#stk-tabs").addEventListener("click", (e) => { const b = e.target.closest("[data-set]"); if (b) selectSet(b.dataset.set); });
  $("#stk-tabs").addEventListener("keydown", (e) => {
    if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
    const tabs = $$("#stk-tabs .chip"); const i = tabs.indexOf(document.activeElement);
    const n = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
    n.focus(); selectSet(n.dataset.set);
  });

  let replyTimer = 0;
  $("#stk-grid").addEventListener("click", (e) => {
    const b = e.target.closest("[data-stk]");
    if (!b) return;
    const set = SETS[activeSet];
    const s = set.stickers[+b.dataset.stk];
    b.classList.remove("is-sent"); void b.offsetWidth; b.classList.add("is-sent");
    addMsg(`<img class="msg__stk" src="${stkSrc(activeSet, s.src)}" alt="${esc(s.label)}">`, true);
    clearTimeout(replyTimer);
    replyTimer = setTimeout(() => {
      const others = set.stickers.filter((x) => x !== s);
      const rep = others[Math.floor(Math.random() * others.length)];
      addMsg(`<img class="msg__stk" src="${stkSrc(activeSet, rep.src)}" alt="${esc(rep.label)}">`, false);
    }, 1100);
  });
  if (activeSet) selectSet(activeSet);

  /* =======================================================
     Copy email + toast
     ======================================================= */
  const toast = $("#toast");
  let toastT = 0;
  const say = (msg) => { toast.textContent = msg; toast.classList.add("is-on"); clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove("is-on"), 2200); };
  $("#copy").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(SITE.email); say("コピーしました — " + SITE.email); }
    catch (e) { say(SITE.email); }
  });

  /* =======================================================
     Mini game: Mochi Hop
     ======================================================= */
  /* =======================================================
     Mochi Hop score ranking (same worker as the access ranking)
     ======================================================= */
  const hop = (() => {
    const off = { start() {}, over() {} };
    const form = $("#hop-submit"), board = $("#hop-board");
    if (!STATS || !form || !board) return off;
    let token = null, pending = null, period = "week";
    const msg = $("#hop-msg"), nameEl = $("#hop-name");
    nameEl.value = store.get("mochihop-name") || "";

    const post = (path, body) => fetch(`${STATS}${path}`, { method: "POST", body: JSON.stringify(body), mode: "cors" })
      .then((r) => r.json().catch(() => ({})).then((d) => ({ ok: r.ok, status: r.status, ...d })));
    const render = (items, mine) => {
      const list = $("#hop-list");
      if (!items) { board.hidden = true; return; }
      board.hidden = false;
      if (!items.length) { list.innerHTML = `<li class="hop-board__empty">まだ記録がありません。1位になれるチャンスです。</li>`; return; }
      list.innerHTML = items.map((x, i) => `
        <li class="hop-board__row${mine && x.name === mine.name && x.score === mine.score ? " is-mine" : ""}">
          <span class="hop-board__no">${i + 1}</span><span class="hop-board__name">${esc(x.name)}</span><span class="hop-board__score mono">${x.score}</span>
        </li>`).join("");
    };
    const load = (mine) => fetch(`${STATS}/scores?game=mochihop&period=${period}`, { cache: mine ? "no-store" : "default" })
      .then((r) => (r.ok ? r.json() : Promise.reject())).then((d) => render(d.items || [], mine)).catch(() => render(null));

    board.addEventListener("click", (e) => {
      const b = e.target.closest("[data-hop-period]");
      if (!b) return;
      period = b.dataset.hopPeriod;
      $$("[data-hop-period]", board).forEach((x) => x.setAttribute("aria-pressed", x === b));
      load();
    });
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { load(); o.disconnect(); } }, { rootMargin: "400px" }).observe($("#play"));

    const close = () => { form.hidden = true; pending = null; };
    $("#hop-skip").addEventListener("click", close);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!pending) return;
      const name = nameEl.value.trim();
      store.set("mochihop-name", name);
      msg.textContent = "登録しています…";
      const r = await post("/score", { token: pending.token, score: pending.score, name }).catch(() => ({ ok: false }));
      if (r.ok) {
        msg.textContent = `${r.rank}位で登録しました。`;
        setTimeout(close, 1400);
        load({ name: r.name, score: r.score });
      } else {
        msg.textContent = r.error === "used" ? "このプレイは登録済みです。" : "登録できませんでした。";
      }
    });

    return {
      start() {
        close();
        token = null;
        post("/run", { game: "mochihop" }).then((r) => { if (r.ok) token = r.token; }).catch(() => {});
      },
      over(score) {
        if (!token || score < 1) return;
        pending = { token, score };
        token = null;
        $("#hop-score").textContent = score;
        msg.textContent = "";
        form.hidden = false;
      },
    };
  })();

  const game = (() => {
    const cv = $("#game");
    const ctx = cv.getContext("2d");
    const sprite = {};
    ["sit", "hop", "flat"].forEach((k) => { const im = new Image(); im.onload = () => draw(); im.src = CHARA(k); sprite[k] = im; });
    let W = 0, H = 0, dpr = 1, ground = 0, unit = 1;
    let col = {};
    let state = "idle", raf = 0, last = 0, visible = false;
    let speed, score, scoreF, best = +store.get("mochihop-best") || 0, obs, clouds, spawnIn, t = 0;
    const p = { x: 0, y: 0, vy: 0, size: 0, squash: 1, onGround: true };
    $("#g-best").textContent = best;

    function refreshColors() {
      const cs = getComputedStyle(document.documentElement);
      col = { bg: cs.getPropertyValue("--card").trim(), ink: cs.getPropertyValue("--ink").trim(), muted: cs.getPropertyValue("--muted").trim(), line: cs.getPropertyValue("--line-2").trim(), acc: cs.getPropertyValue("--game").trim() };
      draw();
    }
    function resize() {
      const b = cv.getBoundingClientRect();
      dpr = Math.min(2, devicePixelRatio || 1);
      W = b.width; H = b.height;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      unit = H / 320;
      ground = H - 52 * unit;
      p.size = 64 * unit; p.x = Math.max(40, W * .12);
      if (state !== "run") p.y = ground;
      draw();
    }
    function reset() {
      speed = 6.2; score = 0; scoreF = 0; obs = []; spawnIn = 60; t = 0;
      clouds = Array.from({ length: 5 }, (_, i) => ({ x: (i / 5) * W + Math.random() * 80, y: (20 + Math.random() * 90) * unit, s: .6 + Math.random() * .6 }));
      p.y = ground; p.vy = 0; p.onGround = true;
    }
    function jump() {
      if (state !== "run") { reset(); state = "run"; hop.start(); last = performance.now(); loop(last); return; }
      if (p.onGround) { p.vy = -15.5 * unit; p.onGround = false; p.squash = .75; }
    }
    function drawMochi(x, y, s, sq, dead) {
      const im = dead ? sprite.flat : p.onGround ? sprite.sit : sprite.hop;
      if (!im.complete || !im.naturalWidth) return;
      const w = s * 1.3, h = w * (im.naturalHeight / im.naturalWidth);
      ctx.save();
      ctx.translate(x, y + 2 * unit);
      ctx.scale(dead ? 1 : 2 - sq, dead ? 1 : sq);
      ctx.drawImage(im, -w / 2, -h, w, h);
      ctx.restore();
    }
    function drawDango(o) {
      const r = o.r;
      ctx.strokeStyle = "#151513"; ctx.lineWidth = 2.5 * unit;
      ctx.fillStyle = "#B9824F";
      ctx.fillRect(o.x - 2 * unit, ground - o.h - 10 * unit, 4 * unit, o.h + 10 * unit);
      const colors = ["#9AD67A", "#FFFFFF", "#FF9EB5"];
      for (let k = 0; k < o.n; k++) {
        ctx.beginPath(); ctx.arc(o.x, ground - r - 8 * unit - k * r * 1.9, r, 0, 7);
        ctx.fillStyle = colors[(k + o.c) % 3]; ctx.fill(); ctx.stroke();
      }
    }
    function draw() {
      if (!W) return;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = col.bg; ctx.fillRect(0, 0, W, H);
      // clouds
      (clouds || []).forEach((c) => {
        ctx.fillStyle = col.line;
        const w = 70 * c.s * unit, h = 10 * c.s * unit;
        ctx.beginPath(); ctx.roundRect(c.x, c.y, w, h, h); ctx.fill();
        ctx.beginPath(); ctx.roundRect(c.x + w * .2, c.y - h * .8, w * .45, h * 1.2, h); ctx.fill();
      });
      // ground
      ctx.strokeStyle = col.ink; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(0, ground + 1); ctx.lineTo(W, ground + 1); ctx.stroke();
      ctx.fillStyle = col.muted;
      const off = (t * speed) % 40;
      for (let x = -off; x < W; x += 40) ctx.fillRect(x, ground + 12 * unit, 10, 1.5);
      (obs || []).forEach(drawDango);
      // shadow
      const lift = Math.max(0, ground - p.y);
      ctx.fillStyle = "rgba(0,0,0,.12)";
      ctx.beginPath(); ctx.ellipse(p.x, ground + 3, p.size * .5 * (1 - Math.min(.5, lift / 300)), 4 * unit, 0, 0, 7); ctx.fill();
      drawMochi(p.x, p.y, p.size, p.squash, state === "over");
      // overlay text
      ctx.fillStyle = col.ink; ctx.textAlign = "center";
      if (state === "idle" || state === "over") {
        ctx.font = `600 ${Math.max(22, 40 * unit)}px "Inter Tight", sans-serif`;
        ctx.fillText(state === "idle" ? "Mochi Hop" : "Game over", W / 2, H * .36);
        ctx.font = `500 ${Math.max(12, 15 * unit)}px "Zen Kaku Gothic New", sans-serif`;
        ctx.fillStyle = col.muted;
        ctx.fillText(state === "idle" ? "クリック / スペースでスタート" : `スコア ${score}　—　もう一回？`, W / 2, H * .36 + 34 * unit);
      }
      if (state === "run") {
        ctx.textAlign = "right"; ctx.font = `500 ${Math.max(13, 16 * unit)}px "JetBrains Mono", monospace`;
        ctx.fillText(String(score).padStart(5, "0"), W - 18, 32 * unit);
      }
    }
    function step(f) {
      t += f;
      speed += .0025 * f;
      p.vy += .82 * unit * f; p.y += p.vy * f;
      if (p.y >= ground) { if (!p.onGround) p.squash = .8; p.y = ground; p.vy = 0; p.onGround = true; }
      p.squash += (1 - p.squash) * .2 * f;
      if (!p.onGround) p.squash = Math.min(p.squash, 1.08);
      spawnIn -= f;
      if (spawnIn <= 0) {
        const n = 2 + (Math.random() < Math.min(.6, score / 1500) ? 1 : 0);
        const r = 13 * unit;
        obs.push({ x: W + 30, n, r, h: n * r * 1.9 + 8 * unit, c: Math.floor(Math.random() * 3) });
        spawnIn = 48 + Math.random() * 70 - Math.min(26, speed * 1.4);
      }
      obs.forEach((o) => { o.x -= speed * unit * 1.25 * f; });
      obs = obs.filter((o) => o.x > -40);
      clouds.forEach((c) => { c.x -= speed * .15 * c.s * f; if (c.x < -120) c.x = W + Math.random() * 60; });
      // collide
      const half = p.size * .42, top = p.y - p.size * .62;
      for (const o of obs) {
        if (Math.abs(o.x - p.x) < half + o.r * .7 && p.y > ground - o.h + 4 * unit && top < ground) { over(); return; }
      }
      scoreF += f;
      score = Math.floor(scoreF);
      $("#g-score").textContent = score;
    }
    function over() {
      state = "over";
      if (score > best) { best = score; store.set("mochihop-best", best); $("#g-best").textContent = best; }
      draw();
      hop.over(score);
    }
    function loop(now) {
      if (state !== "run" || !visible) { raf = 0; return; }
      const f = Math.min(3, (now - last) / 16.67);
      last = now;
      step(f);
      draw();
      if (state === "run") raf = requestAnimationFrame(loop);
    }

    cv.addEventListener("pointerdown", (e) => { e.preventDefault(); cv.focus({ preventScroll: true }); jump(); });
    cv.addEventListener("keydown", (e) => {
      if (e.code === "Space" || e.key === "ArrowUp" || e.key === "Enter") { e.preventDefault(); jump(); }
    });
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && state === "run" && !raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
    }).observe(cv);
    new ResizeObserver(resize).observe(cv);
    refreshColors();
    if (document.fonts) document.fonts.ready.then(draw);
    return { refreshColors };
  })();
})();
