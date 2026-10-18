"use strict";

// ui.js: screens, menus, save data and the main loop.
const App = (() => {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const params = new URLSearchParams(location.search);
  const UNLOCK_ALL = params.has("unlock");

  // ---------------------------------------------------------------- save
  const SAVE_KEY = "afterglow.save";
  let save = { done: [], best: {} };
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) save = Object.assign(save, JSON.parse(raw));
  } catch (e) { /* storage unavailable */ }
  function persist() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* ignore */ }
  }
  const isDone = (i) => !!save.done[i];
  const isUnlocked = (i) => UNLOCK_ALL || i === 0 || isDone(i - 1) || isDone(i);
  const firstOpen = () => {
    for (let i = 0; i < LEVELS.length; i++) if (!isDone(i)) return i;
    return 0;
  };

  const levelNum = LEVELS.map((l, i) => {
    let n = 0;
    for (let k = 0; k <= i; k++) if (LEVELS[k].chapter === l.chapter) n++;
    return (l.chapter + 1) + "-" + n;
  });

  // ---------------------------------------------------------------- state
  const A = {
    state: "title", T: 0, idx: 0, sel: 0, hits: [], pausedFrom: null,
    fade: 1, fadeTarget: 0, fadeCb: null, cardT: 0, introT: 0, hintT: 0, hintForce: 0,
    result: null, selLevel: 0, endT: 0,
  };

  function fadeTo(cb) {
    A.fadeTarget = 1;
    A.fadeCb = cb;
  }

  const fmtTime = (s) => {
    const m = Math.floor(s / 60), r = Math.floor(s % 60);
    return m + ":" + (r < 10 ? "0" : "") + r;
  };

  // ---------------------------------------------------------------- flow
  function startLevel(i, instant) {
    const go = () => {
      A.idx = i;
      Game.load(i);
      Sfx.setMood(CHAPTERS[LEVELS[i].chapter].mood);
      A.introT = 0;
      A.hintT = 0;
      A.hintForce = 0;
      const first = LEVELS.findIndex((l) => l.chapter === LEVELS[i].chapter) === i;
      if (first && !isDone(i)) {
        A.state = "chapter";
        A.cardT = 0;
        Sfx.play("card");
      } else {
        A.state = "play";
      }
      A.sel = 0;
    };
    if (instant) go(); else fadeTo(go);
  }

  G.onWin = () => {
    const i = A.idx;
    const t = G.time;
    const prevBest = save.best[i];
    const newBest = prevBest === undefined || t < prevBest;
    save.done[i] = true;
    if (newBest) save.best[i] = Math.round(t * 10) / 10;
    persist();
    A.result = { time: t, deaths: G.deaths, echoes: G.recCount, newBest };
  };

  function goSelect() {
    fadeTo(() => { A.state = "select"; A.selLevel = Math.min(A.idx, LEVELS.length - 1); });
  }

  function goTitle() {
    fadeTo(() => { A.state = "title"; A.sel = 0; });
  }

  // ---------------------------------------------------------------- menus
  function menu(items, hits, cx, y0, step, opts) {
    opts = opts || {};
    items.forEach((it, i) => {
      const y = y0 + i * step;
      const on = A.sel === i;
      const w = Font.width(it.label, 2);
      const col = it.disabled ? "#5b6275" : on ? "#ffe9a8" : "#aab2c5";
      Font.draw(ctx, (on ? "> " : "  ") + it.label, cx - w / 2 - 6, y, { scale: 2, color: col });
      hits.push({ x: cx - w / 2 - 20, y: y - 4, w: w + 40, h: 22, i, act: it.act });
    });
  }

  function navMenu(items) {
    if (Input.hitAny(["ArrowUp", "KeyW"])) { A.sel = (A.sel + items.length - 1) % items.length; Sfx.play("ui"); }
    if (Input.hitAny(["ArrowDown", "KeyS"])) { A.sel = (A.sel + 1) % items.length; Sfx.play("ui"); }
    if (Input.hitAny(["Enter", "Space"])) {
      const it = items[A.sel];
      if (it && !it.disabled) { Sfx.play("ok"); it.act(); }
    }
  }

  const soundLabel = () => "SOUND " + (Sfx.isMuted() ? "OFF" : "ON");
  const toggleSound = () => { Sfx.toggleMute(); };

  function titleItems() {
    const any = save.done.some(Boolean);
    return [
      { label: any ? "CONTINUE" : "PLAY", fs: true, act: () => startLevel(any ? Math.min(firstOpen(), LEVELS.length - 1) : 0) },
      { label: "LEVELS", fs: true, act: () => { fadeTo(() => { A.state = "select"; A.selLevel = Math.min(firstOpen(), LEVELS.length - 1); }); } },
      { label: soundLabel(), act: toggleSound },
    ];
  }

  function pauseItems() {
    return [
      { label: "RESUME", act: () => { A.state = "play"; } },
      { label: "RESTART LEVEL", act: () => startLevel(A.idx) },
      { label: "LEVELS", act: goSelect },
      { label: soundLabel(), act: toggleSound },
    ];
  }

  function completeItems() {
    const last = A.idx >= LEVELS.length - 1;
    return [
      { label: last ? "FINISH" : "NEXT LEVEL", act: () => { if (last) fadeTo(() => { A.state = "ending"; A.endT = 0; Sfx.play("card"); }); else startLevel(A.idx + 1); } },
      { label: "RETRY", act: () => startLevel(A.idx) },
      { label: "LEVELS", act: goSelect },
    ];
  }

  // ---------------------------------------------------------------- update
  function update() {
    A.T++;
    if (A.fadeTarget === 1 && A.fade < 1) A.fade = Math.min(1, A.fade + 0.07);
    else if (A.fadeTarget === 1 && A.fade >= 1) {
      const cb = A.fadeCb;
      A.fadeCb = null;
      A.fadeTarget = 0;
      if (cb) cb();
      Input.clear();
    } else if (A.fadeTarget === 0 && A.fade > 0) A.fade = Math.max(0, A.fade - 0.05);
    if (A.fadeTarget === 1) return;

    switch (A.state) {
      case "title": {
        navMenu(titleItems());
        break;
      }
      case "select": {
        let d = 0;
        if (Input.hitAny(["ArrowRight", "KeyD"])) d = 1;
        if (Input.hitAny(["ArrowLeft", "KeyA"])) d = -1;
        if (Input.hitAny(["ArrowDown", "KeyS"])) d = 3;
        if (Input.hitAny(["ArrowUp", "KeyW"])) d = -3;
        if (d) { A.selLevel = (A.selLevel + d + LEVELS.length) % LEVELS.length; Sfx.play("ui"); }
        if (Input.hitAny(["Enter", "Space"])) {
          if (isUnlocked(A.selLevel)) { Sfx.play("ok"); startLevel(A.selLevel); } else Sfx.play("nope");
        }
        if (Input.hitAny(["Escape", "Backspace"])) goTitle();
        break;
      }
      case "chapter": {
        A.cardT++;
        if (A.cardT > 30 && Input.hitAny(["Enter", "Space"])) { A.state = "play"; Input.clear(); }
        break;
      }
      case "play": {
        A.introT++;
        A.hintT++;
        if (Input.hit("KeyH")) A.hintForce = 480;
        if (A.hintForce > 0) A.hintForce--;
        if (Input.hitAny(["Escape", "KeyP"])) { A.state = "pause"; A.sel = 0; Sfx.play("ui"); break; }
        if (Input.hit("KeyM")) toggleSound();
        Game.tick();
        if (G.won && G.winT > 55 && A.state === "play") {
          A.state = "complete";
          A.sel = 0;
        }
        break;
      }
      case "pause": {
        navMenu(pauseItems());
        if (Input.hitAny(["Escape", "KeyP"])) A.state = "play";
        break;
      }
      case "complete": {
        navMenu(completeItems());
        break;
      }
      case "ending": {
        A.endT++;
        if (A.endT > 60 && Input.hitAny(["Enter", "Space", "Escape"])) goTitle();
        break;
      }
    }
  }

  // ---------------------------------------------------------------- scenes
  const stars = [];
  {
    const rng = Render.mulberry(42);
    for (let i = 0; i < 120; i++) stars.push({ x: rng() * W, y: rng() * H * 0.75, p: rng() * 6, s: rng() < 0.15 ? 2 : 1 });
  }

  function drawTitleScene() {
    const t = A.T;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#050827");
    g.addColorStop(0.7, "#1d3566");
    g.addColorStop(1, "#2c4a80");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    for (const s of stars) {
      ctx.fillStyle = "rgba(255,255,255," + (0.35 + 0.45 * Math.sin(t * 0.03 + s.p)) + ")";
      ctx.fillRect(s.x, s.y, s.s, s.s);
    }
    ctx.fillStyle = "#f4ecc8";
    ctx.beginPath(); ctx.arc(588, 56, 20, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,248,214,0.12)";
    ctx.beginPath(); ctx.arc(588, 56, 34, 0, Math.PI * 2); ctx.fill();
    // sea
    ctx.fillStyle = "#0a1535";
    ctx.fillRect(0, 262, W, H - 262);
    for (let i = 0; i < 26; i++) {
      const wy = 266 + (i * 7) % 90, wx = (i * 83 + t * (0.15 + (i % 3) * 0.1)) % (W + 40) - 20;
      ctx.fillStyle = "rgba(160,190,255," + (0.07 + (i % 4) * 0.02) + ")";
      ctx.fillRect(wx, wy, 14 + (i % 5) * 6, 1);
    }
    // beam
    const lx = 470, ly = 112;
    const a = t * 0.012;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const dir of [0, Math.PI]) {
      ctx.fillStyle = "rgba(255,240,180,0.07)";
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx + Math.cos(a + dir) * 900 - Math.sin(a + dir) * 90, ly + Math.sin(a + dir) * 140 * 0.5 + Math.cos(a + dir) * 20 - 40);
      ctx.lineTo(lx + Math.cos(a + dir) * 900 + Math.sin(a + dir) * 90, ly + Math.sin(a + dir) * 140 * 0.5 + 40);
      ctx.closePath();
      ctx.fill();
    }
    Render.glowAt(ctx, lx, ly, 90, "#ffe2a0", 0.35);
    ctx.restore();
    // tower
    ctx.fillStyle = "#0b0f24";
    ctx.beginPath();
    ctx.moveTo(430, 262); ctx.lineTo(446, 150); ctx.lineTo(494, 150); ctx.lineTo(510, 262);
    ctx.closePath(); ctx.fill();
    ctx.fillRect(440, 136, 60, 14);
    ctx.fillRect(448, 100, 44, 36);
    ctx.fillStyle = "#ffd88a";
    ctx.fillRect(454, 108, 32, 22);
    ctx.fillStyle = "#0b0f24";
    ctx.fillRect(468, 108, 4, 22);
    ctx.beginPath(); ctx.moveTo(444, 100); ctx.lineTo(470, 80); ctx.lineTo(496, 100); ctx.closePath(); ctx.fill();
    // rocks
    ctx.fillStyle = "#070a1a";
    ctx.beginPath();
    ctx.moveTo(360, H); ctx.lineTo(380, 262); ctx.lineTo(420, 256); ctx.lineTo(520, 256); ctx.lineTo(560, 270); ctx.lineTo(590, H);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, H); ctx.lineTo(0, 296); ctx.lineTo(70, 288); ctx.lineTo(150, 300); ctx.lineTo(210, H);
    ctx.closePath(); ctx.fill();
    // the spirit and an echo looking at the light
    Render.drawActor(ctx, 100, 272, Object.assign({ face: 1, st: 0, g: 1, t, sq: 0, vx: 0 }, Render.PLAYER_LOOK));
    const ek = ["shade", "glow", "phase", "flip"][Math.floor(t / 90) % 4];
    const ecol = KINDS[ek].color;
    Render.drawActor(ctx, 126, 273, { face: 1, st: 0, g: 1, t, sq: 0, vx: 0, alpha: 0.7, cloak: Render.rgba(ecol, 0.5), cloakDark: Render.rgba(ecol, 0.28), eye: "#ffffff", flame: ecol, core: "#ffffff" });
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    Render.glowAt(ctx, 106, 252, 26, "#ffb347", 0.25);
    Render.glowAt(ctx, 132, 252, 26, ecol, 0.25);
    ctx.restore();
  }

  function drawPlainBg(accentTop) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#0a0e22");
    g.addColorStop(1, "#18284a");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    for (const s of stars) {
      ctx.fillStyle = "rgba(255,255,255," + (0.15 + 0.25 * Math.sin(A.T * 0.03 + s.p)) + ")";
      ctx.fillRect(s.x, s.y, s.s, s.s);
    }
  }

  function drawTitle(hits) {
    drawTitleScene();
    Font.draw(ctx, TITLE, 200, 30, { scale: 5, color: "#ffe9a8", align: "center" });
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    Render.glowAt(ctx, 200, 50, 120, "#ffb347", 0.12);
    ctx.restore();
    Font.draw(ctx, "YOUR PAST SELVES CAN HELP", 200, 78, { scale: 1, color: "#aab8dd", align: "center" });
    menu(titleItems(), hits, 200, 150, 28);
    Font.draw(ctx, "ARROWS OR WASD + ENTER   F FULLSCREEN", 200, H - 22, { scale: 1, color: "rgba(200,210,235,0.5)", align: "center" });
  }

  function drawSelect(hits) {
    drawPlainBg();
    Font.draw(ctx, "LEVELS", W / 2, 14, { scale: 3, color: "#ffe9a8", align: "center" });
    const tw = 112, th = 40, x0 = 260;
    for (let ch = 0; ch < CHAPTERS.length; ch++) {
      const y = 54 + ch * 52;
      Font.draw(ctx, CHAPTERS[ch].name, 24, y + 8, { scale: 1, color: CHAPTERS[ch].pal.accent });
      let n = 0;
      for (let i = 0; i < LEVELS.length; i++) {
        if (LEVELS[i].chapter !== ch) continue;
        const x = x0 + n * (tw + 8);
        n++;
        const sel = A.selLevel === i, open = isUnlocked(i), done = isDone(i);
        ctx.fillStyle = open ? "rgba(20,28,56,0.92)" : "rgba(14,16,28,0.9)";
        ctx.fillRect(x, y, tw, th);
        ctx.strokeStyle = sel ? "#ffe9a8" : open ? CHAPTERS[ch].pal.accent : "#2b3042";
        ctx.lineWidth = sel ? 2 : 1;
        ctx.strokeRect(x + 0.5, y + 0.5, tw - 1, th - 1);
        Font.draw(ctx, levelNum[i], x + 6, y + 5, { scale: 1, color: open ? "#ffffff" : "#4d5468", shadow: null });
        Font.draw(ctx, LEVELS[i].name, x + 6, y + 19, { scale: 1, color: open ? "#c9d0e2" : "#4d5468", shadow: null });
        if (done) {
          ctx.strokeStyle = "#8fe39a";
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(x + tw - 18, y + 9); ctx.lineTo(x + tw - 14, y + 13); ctx.lineTo(x + tw - 7, y + 4); ctx.stroke();
        } else if (!open) {
          ctx.fillStyle = "#4d5468";
          ctx.fillRect(x + tw - 16, y + 8, 9, 7);
          ctx.strokeStyle = "#4d5468";
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(x + tw - 11.5, y + 8, 3, Math.PI, 0); ctx.stroke();
        }
        hits.push({ x, y, w: tw, h: th, level: i });
      }
    }
    const L = LEVELS[A.selLevel];
    let line = levelNum[A.selLevel] + "  " + L.name;
    if (save.best[A.selLevel] !== undefined) line += "   BEST " + fmtTime(save.best[A.selLevel]);
    if (!isUnlocked(A.selLevel)) line += "   LOCKED";
    Font.draw(ctx, line, W / 2, H - 38, { scale: 1, color: "#e8e2d0", align: "center" });
    Font.draw(ctx, "ARROWS MOVE   ENTER PLAY   ESC BACK", W / 2, H - 20, { scale: 1, color: "rgba(200,210,235,0.5)", align: "center" });
  }

  function drawChapterCard() {
    const ch = CHAPTERS[LEVELS[A.idx].chapter];
    ctx.fillStyle = "#05060e";
    ctx.fillRect(0, 0, W, H);
    const a = Math.min(1, A.cardT / 30);
    ctx.globalAlpha = a;
    Font.draw(ctx, "CHAPTER " + (LEVELS[A.idx].chapter + 1), W / 2, 70, { scale: 1, color: "#8d96ad", align: "center" });
    Font.draw(ctx, ch.name, W / 2, 90, { scale: 4, color: ch.pal.accent, align: "center" });
    Font.draw(ctx, ch.line, W / 2, 140, { scale: 1, color: "#d9deec", align: "center" });
    const lines = Font.wrap(ch.unlock, 420, 1);
    lines.forEach((l, i) => Font.draw(ctx, l, W / 2, 190 + i * 12, { scale: 1, color: "#ffe9a8", align: "center" }));
    if (A.cardT > 30 && Math.floor(A.T / 30) % 2 === 0) Font.draw(ctx, "PRESS ENTER", W / 2, 300, { scale: 1, color: "#9aa3bb", align: "center" });
    ctx.globalAlpha = 1;
  }

  function drawPlay() {
    Render.world(ctx, A.T);
    Render.hud(ctx, A.T, levelNum[A.idx]);
    if (A.introT < 120) {
      const a = A.introT < 20 ? A.introT / 20 : Math.max(0, 1 - (A.introT - 70) / 50);
      if (a > 0) {
        Font.draw(ctx, levelNum[A.idx], W / 2, 96, { scale: 2, color: "#9aa3bb", align: "center", alpha: a });
        Font.draw(ctx, LEVELS[A.idx].name, W / 2, 118, { scale: 4, color: "#ffe9a8", align: "center", alpha: a });
      }
    }
    const L = G.L;
    const hintOn = A.hintForce > 0 || (A.hintT > 90 && A.hintT < 90 + 720 && L.hint);
    if (hintOn && L.hint) {
      const lines = Font.wrap(L.hint, 380, 1);
      const h = lines.length * 10 + 8, w = 392;
      const fadeIn = Math.min(1, (A.hintT - 90) / 20), fadeOut = A.hintForce > 0 ? 1 : Math.max(0, Math.min(1, (90 + 720 - A.hintT) / 30));
      const a = A.hintForce > 0 ? 1 : Math.min(fadeIn, fadeOut);
      ctx.globalAlpha = a;
      ctx.fillStyle = "rgba(5,6,14,0.78)";
      ctx.fillRect((W - w) / 2, 28, w, h);
      lines.forEach((l, i) => Font.draw(ctx, l, W / 2, 32 + i * 10, { scale: 1, color: "#ffe9a8", align: "center", shadow: null }));
      ctx.globalAlpha = 1;
    } else if (L.hint && A.hintT >= 90 + 720) {
      Font.draw(ctx, "H HINT", W - 8, 18, { scale: 1, color: "rgba(220,226,240,0.35)", align: "right", shadow: null });
    }
    if (G.won) {
      ctx.fillStyle = "rgba(255,244,200," + Math.min(0.55, G.winT / 90) + ")";
      ctx.fillRect(0, 0, W, H);
    }
  }

  function dim(a) {
    ctx.fillStyle = "rgba(4,5,12," + a + ")";
    ctx.fillRect(0, 0, W, H);
  }

  function drawPause(hits) {
    drawPlay();
    dim(0.7);
    Font.draw(ctx, "PAUSED", W / 2, 80, { scale: 4, color: "#ffe9a8", align: "center" });
    menu(pauseItems(), hits, W / 2, 150, 28);
    Font.draw(ctx, "ESC TO RESUME", W / 2, H - 24, { scale: 1, color: "rgba(200,210,235,0.5)", align: "center" });
  }

  function drawComplete(hits) {
    drawPlay();
    dim(0.7);
    const r = A.result || { time: 0, deaths: 0, echoes: 0, newBest: false };
    Font.draw(ctx, "LEVEL COMPLETE", W / 2, 70, { scale: 4, color: "#ffe9a8", align: "center" });
    Font.draw(ctx, levelNum[A.idx] + "  " + LEVELS[A.idx].name, W / 2, 110, { scale: 1, color: "#c9d0e2", align: "center" });
    Font.draw(ctx, "TIME " + fmtTime(r.time) + "     ECHOES " + r.echoes + "     DEATHS " + r.deaths, W / 2, 130, { scale: 1, color: "#ffffff", align: "center" });
    if (r.newBest) Font.draw(ctx, "NEW BEST", W / 2, 148, { scale: 1, color: "#8fe39a", align: "center" });
    menu(completeItems(), hits, W / 2, 185, 28);
  }

  function drawEnding() {
    drawTitleScene();
    dim(0.55);
    const lines = [
      "THE LAMP BURNS AGAIN.",
      "",
      "THE BEACON SWEEPS THE DARK WATER,",
      "AND EVERY ECHO YOU LEFT BEHIND",
      "FADES INTO THE LIGHT.",
      "",
      "THEY WERE ALWAYS YOU.",
    ];
    const a = Math.min(1, A.endT / 90);
    ctx.globalAlpha = a;
    Font.draw(ctx, "THANK YOU FOR PLAYING", W / 2, 50, { scale: 3, color: "#ffe9a8", align: "center" });
    lines.forEach((l, i) => Font.draw(ctx, l, W / 2, 110 + i * 14, { scale: 1, color: "#e5e9f5", align: "center" }));
    if (A.endT > 60 && Math.floor(A.T / 30) % 2 === 0) Font.draw(ctx, "PRESS ENTER", W / 2, H - 30, { scale: 1, color: "#9aa3bb", align: "center" });
    ctx.globalAlpha = 1;
  }

  function render() {
    A.hits = [];
    ctx.imageSmoothingEnabled = false;
    switch (A.state) {
      case "title": drawTitle(A.hits); break;
      case "select": drawSelect(A.hits); break;
      case "chapter": drawChapterCard(); break;
      case "play": drawPlay(); break;
      case "pause": drawPause(A.hits); break;
      case "complete": drawComplete(A.hits); break;
      case "ending": drawEnding(); break;
    }
    if (A.fade > 0) {
      ctx.fillStyle = "rgba(0,0,0," + A.fade + ")";
      ctx.fillRect(0, 0, W, H);
    }
  }

  // ---------------------------------------------------------------- pointer
  function toCanvas(e) {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height };
  }

  canvas.addEventListener("mousemove", (e) => {
    const p = toCanvas(e);
    for (const h of A.hits) {
      if (p.x >= h.x && p.x < h.x + h.w && p.y >= h.y && p.y < h.y + h.h) {
        if (h.level !== undefined) A.selLevel = h.level; else A.sel = h.i;
      }
    }
  });

  canvas.addEventListener("mousedown", (e) => {
    Sfx.resume();
    const p = toCanvas(e);
    for (const h of A.hits) {
      if (p.x >= h.x && p.x < h.x + h.w && p.y >= h.y && p.y < h.y + h.h) {
        if (A.fadeTarget === 1) return;
        if (h.level !== undefined) {
          A.selLevel = h.level;
          if (isUnlocked(h.level)) { Sfx.play("ok"); startLevel(h.level); } else Sfx.play("nope");
        } else if (h.act) {
          A.sel = h.i;
          Sfx.play("ok");
          if (A.state === "title" && titleItems()[h.i] && titleItems()[h.i].fs) enterFullscreen();
          h.act();
        }
        return;
      }
    }
    if (A.state === "chapter" && A.cardT > 30) { A.state = "play"; Input.clear(); }
    if (A.state === "ending" && A.endT > 60) goTitle();
  });

  // ---------------------------------------------------------------- fullscreen
  // Browsers only allow fullscreen from a key press or click, so it is requested straight from the event handlers.
  const fsElement = () => document.fullscreenElement || document.webkitFullscreenElement;

  function enterFullscreen() {
    if (fsElement()) return;
    const el = document.documentElement;
    const req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!req) return;
    try {
      const p = req.call(el);
      if (p && p.catch) p.catch(() => { /* refused: stay windowed */ });
    } catch (e) { /* refused: stay windowed */ }
  }

  function toggleFullscreen() {
    if (!fsElement()) { enterFullscreen(); return; }
    try {
      const ex = document.exitFullscreen || document.webkitExitFullscreen;
      const p = ex.call(document);
      if (p && p.catch) p.catch(() => { /* ignore */ });
    } catch (e) { /* ignore */ }
  }

  window.addEventListener("keydown", (e) => {
    Sfx.resume();
    if (e.repeat) return;
    if (e.code === "KeyF") { toggleFullscreen(); return; }
    if (A.state === "title" && A.fadeTarget !== 1 && (e.code === "Enter" || e.code === "Space" || e.code === "NumpadEnter")) {
      const it = titleItems()[A.sel];
      if (it && it.fs) enterFullscreen();
    }
  });

  function fit() {
    const w = window.innerWidth, h = window.innerHeight;
    const s = Math.min(w / W, h / H);
    canvas.style.width = Math.floor(W * s) + "px";
    canvas.style.height = Math.floor(H * s) + "px";
  }
  window.addEventListener("resize", fit);
  fit();

  // Leaving fullscreen with Esc never reaches the game, so pause instead of losing the moment.
  function onFullscreenChange() {
    fit();
    if (!fsElement() && A.state === "play" && !G.won) { A.state = "pause"; A.sel = 0; }
  }
  document.addEventListener("fullscreenchange", onFullscreenChange);
  document.addEventListener("webkitfullscreenchange", onFullscreenChange);

  // ---------------------------------------------------------------- loop
  let last = performance.now(), acc = 0;
  function frame(now) {
    acc += Math.min(0.1, (now - last) / 1000);
    last = now;
    while (acc >= DT) {
      if (!window.__manual) update();
      acc -= DT;
    }
    render();
    requestAnimationFrame(frame);
  }

  const startIdx = params.has("level") ? Math.max(0, Math.min(LEVELS.length - 1, Number(params.get("level")) || 0)) : -1;
  if (startIdx >= 0) startLevel(startIdx, true);
  A.fade = 0;
  requestAnimationFrame(frame);

  return { state: A, startLevel, update, render, save, isUnlocked, levelNum };
})();
