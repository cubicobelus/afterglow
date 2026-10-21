"use strict";

// ui.js: screens, menus, settings, save data and the main loop.
const App = (() => {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const params = new URLSearchParams(location.search);
  const UNLOCK_ALL = params.has("unlock");
  // Temporary dev tools: the backtick key opens a small panel with an unlock-all switch (remembered between visits).
  const DEV_KEY = "afterglow.dev";
  const dev = { open: false, unlockAll: false, rect: null };
  try { dev.unlockAll = localStorage.getItem(DEV_KEY) === "1"; } catch (e) { /* storage unavailable */ }
  function setDevUnlock(on) {
    dev.unlockAll = on;
    try { localStorage.setItem(DEV_KEY, on ? "1" : "0"); } catch (e) { /* ignore */ }
  }

  // ---------------------------------------------------------------- save
  const SAVE_KEY = "afterglow.save";
  const SETTINGS_KEY = "afterglow.settings";
  const SAVE_VERSION = 15;
  let save = { done: [], best: {}, stars: {}, lanterns: {}, seen: {} };
  let hadSave = false;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) { save = Object.assign(save, JSON.parse(raw)); hadSave = true; }
  } catch (e) { /* storage unavailable */ }
  function persist() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* ignore */ }
  }
  // Saves are keyed by level number, so when the level list changes the old result has to follow its level by name.
  if (hadSave && (!save.v || save.v < SAVE_VERSION)) {
    const ORDERS = {
      1: ["FIRST STEPS", "THE PLATE", "BOOST", "STEPPING STONE", "LAMPLIGHT", "THORN HALL", "SUNKEN GATE", "RELAY", "SWITCHBOARD",
        "GLASS WALL", "UNDER GLASS", "TRAPDOOR", "UPDRAFT", "CEILING PLATE", "HIGH PLATE", "TWO KEYS", "TWIN ECHOES", "LANTERN LIFT",
        "FERRY", "LIFT", "SLUICE", "TRAMPOLINE", "BOUNCE COURSE", "SKYHOOK", "TWO STAGES", "FERRY LIGHT", "HIGH WATER",
        "BREEZE", "LOW TUNNEL", "TAILWIND", "LEAPFROG", "SECOND WIND", "TAXI", "DELIVERY", "LANTERN WIND", "SAIL", "THE BEACON"],
      2: ["FIRST STEPS", "THE PLATE", "STEPPING STONE", "TWIN PLATES", "LAMPLIGHT", "SUNKEN GATE", "RELAY", "SWITCHBOARD",
        "GLASS WALL", "UNDER GLASS", "UPDRAFT", "CEILING PLATE", "TWO KEYS", "GHOST GLASS", "CHANDELIER", "HALL OF MIRRORS",
        "FERRY", "LIFT", "TRAMPOLINE", "SKYHOOK", "TWO STAGES", "FERRY LIGHT", "SLUICE", "STACKED SPRINGS", "PUMP ROOM",
        "BREEZE", "SAIL", "LEAPFROG", "SECOND WIND", "TAXI", "AFTERIMAGE", "CHORUS", "THE BEACON"],
      3: ["FIRST STEPS", "THE PLATE", "STEPPING STONE", "TWIN PLATES", "LAMPLIGHT", "SUNKEN GATE", "RELAY", "SWITCHBOARD",
        "GLASS WALL", "UNDER GLASS", "UPDRAFT", "CEILING PLATE", "TWO KEYS", "GHOST GLASS", "CHANDELIER", "HALL OF MIRRORS",
        "FERRY", "LIFT", "TRAMPOLINE", "SKYHOOK", "TWO STAGES", "FERRY LIGHT", "SLUICE", "STACKED SPRINGS", "SLINGSHOT", "PUMP ROOM",
        "BREEZE", "SAIL", "GALLOP", "LEAPFROG", "SECOND WIND", "WAYPOINT", "AFTERIMAGE", "CHORUS", "THE BEACON"],
      4: ["FIRST STEPS", "THE PLATE", "STEPPING STONE", "TWIN PLATES", "LAMPLIGHT", "SUNKEN GATE", "RELAY", "SWITCHBOARD",
        "GLASS WALL", "UNDER GLASS", "UPDRAFT", "CEILING PLATE", "TWO KEYS", "GHOST GLASS", "THREE PANES", "CHANDELIER", "HALL OF MIRRORS",
        "FERRY", "LIFT", "TRAMPOLINE", "SKYHOOK", "TWO STAGES", "FERRY LIGHT", "SLUICE", "STACKED SPRINGS", "SLINGSHOT", "PUMP ROOM",
        "LEAPFROG", "SECOND WIND", "STAY BEHIND", "APEX", "WAYPOINT", "UPSIDE DOWN", "TWO BANKS", "NIGHT TRAIN",
        "BREEZE", "SAIL", "GALLOP", "AFTERIMAGE", "CHORUS", "THE BEACON"],
      5: ["FIRST STEPS", "THE PLATE", "STEPPING STONE", "TWIN PLATES", "STEP UP", "STAIRCASE", "LAMPLIGHT", "LIGHT STEP", "SUNKEN GATE", "RELAY", "SWITCHBOARD",
        "GLASS WALL", "UNDER GLASS", "UPDRAFT", "CEILING PLATE", "TWO KEYS", "GHOST GLASS", "THREE PANES", "FOUR PANES", "CHANDELIER", "HALL OF MIRRORS",
        "FERRY", "LIFT", "TRAMPOLINE", "SKYHOOK", "TWO STAGES", "FERRY LIGHT", "SLUICE", "STACKED SPRINGS", "SLINGSHOT", "PUMP ROOM",
        "LEAPFROG", "SECOND WIND", "STAY BEHIND", "APEX", "WAYPOINT", "UPSIDE DOWN", "WATCHTOWER", "GLASS CEILING", "TWO BANKS", "NIGHT TRAIN",
        "BREEZE", "STONE AND SAIL", "SAIL", "GALLOP", "CLOCKWORK", "UP AND OVER", "TWO UPDRAFTS", "AFTERIMAGE", "CHORUS"],
      6: ["FIRST STEPS", "THE PLATE", "STEPPING STONE", "TWIN PLATES", "STEP UP", "STAIRCASE", "LAMPLIGHT", "SUNKEN GATE", "RELAY", "SWITCHBOARD",
        "GLASS WALL", "UNDER GLASS", "UPDRAFT", "CEILING PLATE", "GHOST GLASS", "THREE PANES", "HALL OF MIRRORS",
        "FERRY", "TRAMPOLINE", "SKYHOOK", "TWO STAGES", "FERRY LIGHT", "SLUICE", "STAGECOACH", "SLINGSHOT", "PUMP ROOM",
        "LEAPFROG", "STAY BEHIND", "APEX", "WAYPOINT", "UPSIDE DOWN", "GLASS CEILING", "NIGHT TRAIN",
        "BREEZE", "SAIL", "GALLOP", "WEATHERVANE", "UP AND OVER", "AFTERIMAGE", "CHORUS"],
      7: ["FIRST STEPS", "THE PLATE", "STEPPING STONE", "TWIN PLATES", "STAIRCASE", "LAMPLIGHT", "SUNKEN GATE", "RELAY", "SWITCHBOARD",
        "GLASS WALL", "UNDER GLASS", "UPDRAFT", "CEILING PLATE", "GHOST GLASS", "THREE PANES", "HALL OF MIRRORS",
        "FERRY", "TRAMPOLINE", "SKYHOOK", "TWO STAGES", "FERRY LIGHT", "SLUICE", "STAGECOACH", "SLINGSHOT", "PUMP ROOM",
        "LEAPFROG", "STAY BEHIND", "APEX", "UPSIDE DOWN", "GLASS CEILING", "NIGHT TRAIN",
        "BREEZE", "SAIL", "GALLOP", "WEATHERVANE", "UP AND OVER", "AFTERIMAGE", "CHORUS"],
      8: ["FIRST STEPS", "THE PLATE", "STEPPING STONE", "TWIN PLATES", "STAIRCASE", "LAMPLIGHT", "SUNKEN GATE", "RELAY", "SWITCHBOARD",
        "GLASS WALL", "UNDER GLASS", "UPDRAFT", "CEILING PLATE", "GHOST GLASS", "THREE PANES", "HALL OF MIRRORS",
        "FERRY", "TRAMPOLINE", "SKYHOOK", "TWO STAGES", "FERRY LIGHT", "SLUICE", "STAGECOACH", "SLINGSHOT", "PUMP ROOM",
        "LEAPFROG", "STAY BEHIND", "APEX", "UPSIDE DOWN", "GLASS CEILING", "NIGHT TRAIN",
        "BREEZE", "SAIL", "GALLOP", "WEATHERVANE", "UP AND OVER", "AFTERIMAGE", "CHORUS"],
      9: ["FIRST STEPS", "THE PLATE", "STEPPING STONE", "TWIN PLATES", "STAIRCASE", "LAMPLIGHT", "SUNKEN GATE", "RELAY", "EYE", "GATEHOUSE", "SWITCHBOARD",
        "GLASS WALL", "UNDER GLASS", "UPDRAFT", "CEILING PLATE", "GHOST GLASS", "THREE PANES", "HALL OF MIRRORS",
        "FERRY", "TRAMPOLINE", "SKYHOOK", "TWO STAGES", "FERRY LIGHT", "SLUICE", "STAGECOACH", "SLINGSHOT", "PUMP ROOM",
        "LEAPFROG", "STAY BEHIND", "APEX", "UPSIDE DOWN", "GLASS CEILING", "NIGHT TRAIN",
        "BREEZE", "SAIL", "GALLOP", "WEATHERVANE", "UP AND OVER", "AFTERIMAGE", "CHORUS"],
      10: ["FIRST STEPS", "THE PLATE", "STEPPING STONE", "TWIN PLATES", "STAIRCASE", "LAMPLIGHT", "SUNKEN GATE", "RELAY", "GATEHOUSE", "SWITCHBOARD",
        "GLASS WALL", "UNDER GLASS", "UPDRAFT", "CEILING PLATE", "GHOST GLASS", "THREE PANES", "HALL OF MIRRORS",
        "FERRY", "TRAMPOLINE", "SKYHOOK", "TWO STAGES", "FERRY LIGHT", "SLUICE", "STAGECOACH", "SLINGSHOT", "PUMP ROOM",
        "LEAPFROG", "STAY BEHIND", "APEX", "UPSIDE DOWN", "GLASS CEILING", "NIGHT TRAIN",
        "BREEZE", "SAIL", "GALLOP", "WEATHERVANE", "UP AND OVER", "AFTERIMAGE", "CHORUS"],
      11: ["FIRST STEPS", "THE PLATE", "STEPPING STONE", "TWIN PLATES", "STAIRCASE", "LAMPLIGHT", "SUNKEN GATE", "GATEHOUSE", "RELAY", "SWITCHBOARD",
        "GLASS WALL", "UNDER GLASS", "UPDRAFT", "CEILING PLATE", "GHOST GLASS", "THREE PANES", "HALL OF MIRRORS",
        "FERRY", "TRAMPOLINE", "SKYHOOK", "TWO STAGES", "FERRY LIGHT", "SLUICE", "STAGECOACH", "SLINGSHOT", "PUMP ROOM",
        "LEAPFROG", "STAY BEHIND", "APEX", "UPSIDE DOWN", "GLASS CEILING", "NIGHT TRAIN",
        "BREEZE", "SAIL", "GALLOP", "WEATHERVANE", "UP AND OVER", "AFTERIMAGE", "CHORUS"],
      12: ["FIRST STEPS", "THE PLATE", "STEPPING STONE", "TWIN PLATES", "STAIRCASE", "LAMPLIGHT", "SUNKEN GATE", "LANTERN RISE", "RELAY", "SWITCHBOARD",
        "GLASS WALL", "UNDER GLASS", "UPDRAFT", "CEILING PLATE", "GHOST GLASS", "THREE PANES", "HALL OF MIRRORS",
        "FERRY", "TRAMPOLINE", "SKYHOOK", "TWO STAGES", "FERRY LIGHT", "SLUICE", "STAGECOACH", "SLINGSHOT", "PUMP ROOM",
        "LEAPFROG", "STAY BEHIND", "APEX", "UPSIDE DOWN", "GLASS CEILING", "NIGHT TRAIN",
        "BREEZE", "SAIL", "GALLOP", "WEATHERVANE", "UP AND OVER", "AFTERIMAGE", "CHORUS"],
      13: ["FIRST STEPS", "THE PLATE", "STEPPING STONE", "TWIN PLATES", "STAIRCASE", "LAMPLIGHT", "SUNKEN GATE", "GATEHOUSE", "RELAY", "SWITCHBOARD",
        "GLASS WALL", "UNDER GLASS", "UPDRAFT", "CEILING PLATE", "GHOST GLASS", "THREE PANES", "HALL OF MIRRORS",
        "FERRY", "TRAMPOLINE", "SKYHOOK", "TWO STAGES", "FERRY LIGHT", "SLUICE", "STAGECOACH", "SLINGSHOT", "PUMP ROOM",
        "LEAPFROG", "STAY BEHIND", "APEX", "UPSIDE DOWN", "GLASS CEILING", "NIGHT TRAIN",
        "BREEZE", "SAIL", "GALLOP", "WEATHERVANE", "UP AND OVER", "AFTERIMAGE", "CHORUS"],
      14: ["FIRST STEPS", "THE PLATE", "STEPPING STONE", "TWIN PLATES", "STAIRCASE", "LAMPLIGHT", "SUNKEN GATE", "GATEHOUSE", "RELAY", "SWITCHBOARD",
        "GLASS WALL", "UNDER GLASS", "THREE PANES", "GHOST GLASS", "OVERHEAD", "CEILING PLATE", "LOOKING GLASS", "HALF OPEN", "HALL OF MIRRORS", "SKYLIGHT",
        "FERRY", "TRAMPOLINE", "SKYHOOK", "TWO STAGES", "FERRY LIGHT", "SLUICE", "STAGECOACH", "SLINGSHOT", "PUMP ROOM",
        "LEAPFROG", "STAY BEHIND", "APEX", "UPSIDE DOWN", "GLASS CEILING", "NIGHT TRAIN",
        "BREEZE", "SAIL", "GALLOP", "WEATHERVANE", "UP AND OVER", "AFTERIMAGE", "CHORUS"],
    };
    // Same name but a different puzzle now: the old result no longer applies.
    const REDESIGNED = {
      1: { "THE BEACON": true, "SLUICE": true, "SAIL": true, "SWITCHBOARD": true },
      2: { "PUMP ROOM": true, "THE BEACON": true, "AFTERIMAGE": true, "SAIL": true, "SWITCHBOARD": true },
      3: { "SAIL": true, "SWITCHBOARD": true },
      4: { "SAIL": true, "SWITCHBOARD": true },
      5: { "SWITCHBOARD": true },
      6: {},
      7: {},
      8: {},
      9: {},
      10: {},
      11: {},
      12: {},
      13: {},
      14: { "LOOKING GLASS": true, "SKYLIGHT": true },
    };
    // The level is the same but its lantern moved, so the old pickup no longer counts.
    // Value: the save version in which the lantern moved; older saves lose that pickup.
    const LANTERN_MOVED = { "TRAMPOLINE": 6, "SUNKEN GATE": 8, "UNDER GLASS": 15 };
    const from = save.v || 1;
    const order = ORDERS[from] || ORDERS[2];
    const redesigned = Object.assign({ "HALL OF MIRRORS": true }, REDESIGNED[from] || REDESIGNED[2]); // rebuilt in v14
    const where = {};
    LEVELS.forEach((l, i) => { where[l.name] = i; });
    const moved = { v: SAVE_VERSION, done: [], best: {}, stars: {}, lanterns: {}, seen: save.seen || {} };
    order.forEach((name, oi) => {
      const ni = redesigned[name] ? undefined : where[name];
      if (ni === undefined) return;
      if (save.done && save.done[oi]) moved.done[ni] = true;
      if (save.best && save.best[oi] !== undefined) moved.best[ni] = save.best[oi];
      if (save.stars && save.stars[oi]) moved.stars[ni] = save.stars[oi];
      if (save.lanterns && save.lanterns[oi] && !(LANTERN_MOVED[name] > from)) moved.lanterns[ni] = save.lanterns[oi];
    });
    save = moved;
    persist();
  }
  save.v = SAVE_VERSION;
  const isDone = (i) => !!save.done[i];
  // A bonus level (`bonus: N` in its definition) sits outside the main path: the level before it in the list does not
  // unlock it, the level after it does not wait for it, and it opens once N stars are earned in its tier.
  const mainPrev = (i) => { for (let j = i - 1; j >= 0; j--) if (!LEVELS[j].bonus) return j; return -1; };
  const mainNext = (i) => { for (let j = i + 1; j < LEVELS.length; j++) if (!LEVELS[j].bonus) return j; return -1; };
  const tierStars = (t) => tierLevels[t].reduce((n, i) => n + (LEVELS[i].bonus ? 0 : starsOf(i)), 0);
  const isUnlocked = (i) => {
    if (UNLOCK_ALL || dev.unlockAll || i === 0) return true;
    const L = LEVELS[i];
    if (L.bonus) return isDone(i) || tierStars(L.chapter) >= L.bonus;
    return isDone(mainPrev(i)) || isDone(i);
  };
  const firstOpen = () => {
    for (let i = 0; i < LEVELS.length; i++) if (!LEVELS[i].bonus && !isDone(i)) return i;
    return 0;
  };

  function applySettings() {
    Sfx.setVolumes(Settings.music, Settings.sfx);
  }
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (typeof s.music === "number") Settings.music = Math.max(0, Math.min(1, s.music));
      if (typeof s.sfx === "number") Settings.sfx = Math.max(0, Math.min(1, s.sfx));
      if (typeof s.shake === "boolean") Settings.shake = s.shake;
      if (s.keys) for (const k in DEFAULT_BIND) if (Array.isArray(s.keys[k]) && s.keys[k].length) Input.bind[k] = s.keys[k].slice(0, 3);
      // Saved settings from before click and K were added: an untouched record key picks up the new defaults.
      if (s.keys && Array.isArray(s.keys.record) && s.keys.record.length === 1 && s.keys.record[0] === "KeyE") Input.bind.record = DEFAULT_BIND.record.slice();
    }
  } catch (e) { /* ignore */ }
  applySettings();
  function persistSettings() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify({ music: Settings.music, sfx: Settings.sfx, shake: Settings.shake, keys: Input.bind })); } catch (e) { /* ignore */ }
  }

  const levelNum = LEVELS.map((l, i) => {
    let n = 0;
    for (let k = 0; k <= i; k++) if (LEVELS[k].chapter === l.chapter) n++;
    return (l.chapter + 1) + "-" + n;
  });
  const tierLevels = CHAPTERS.map((c, t) => LEVELS.map((l, i) => i).filter((i) => LEVELS[i].chapter === t));
  const tierKinds = CHAPTERS.map((c, t) => tierLevels[t].map((i) => LEVELS[i].unlock).filter(Boolean));
  const totalLanterns = LEVELS.filter((l) => levelHasLantern(l)).length;

  function levelHasLantern(def) {
    const g = makeGrid();
    def.build(g);
    return g.rows().some((r) => r.includes("o"));
  }
  const lanternLevels = LEVELS.map((l) => levelHasLantern(l));

  // ---------------------------------------------------------------- state
  const A = {
    state: "title", T: 0, idx: 0, sel: 0, hits: [], settingsBack: "title",
    fade: 1, fadeTarget: 0, fadeCb: null, cards: [], cardT: 0, introT: 0, hintT: 0, hintForce: 0,
    result: null, selLevel: 0, endT: 0, rebind: null, resetArm: 0, toast: null,
  };

  function fadeTo(cb) {
    A.fadeTarget = 1;
    A.fadeCb = cb;
  }

  const fmtTime = (s) => {
    const m = Math.floor(s / 60), r = Math.floor(s % 60);
    return m + ":" + (r < 10 ? "0" : "") + r;
  };

  const starsOf = (i) => {
    const s = save.stars[i];
    return s ? s.filter(Boolean).length : 0;
  };
  const totalStars = () => LEVELS.reduce((n, l, i) => n + starsOf(i), 0);
  const totalLanternsGot = () => Object.keys(save.lanterns).filter((k) => save.lanterns[k]).length;

  // ---------------------------------------------------------------- cards
  // Cards show once ever: a tier card on its first level, and an echo card on the level that unlocks it.
  const ABILITIES = {
    swap: { name: "SWAP", color: "#ffffff", blurb: "PRESS Q TO TRADE PLACES WITH THE SELECTED ECHO. IT TAKES YOUR SPOT.", emblem: null },
  };

  function cardsFor(i) {
    const def = LEVELS[i], list = [];
    const t = def.chapter;
    if (tierLevels[t][0] === i && !save.seen["tier" + t]) list.push({ type: "tier", tier: t, key: "tier" + t });
    if (def.unlock && !save.seen["echo_" + def.unlock]) list.push({ type: "echo", kind: def.unlock, key: "echo_" + def.unlock });
    return list;
  }

  // ---------------------------------------------------------------- flow
  function startLevel(i, instant, skipCards) {
    const go = () => {
      A.idx = i;
      Game.load(i);
      Sfx.setMood(CHAPTERS[LEVELS[i].chapter].mood);
      A.introT = 0;
      A.hintT = 0;
      A.hintForce = 0;
      A.cards = skipCards ? [] : cardsFor(i);
      if (A.cards.length) {
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

  function nextCard() {
    const c = A.cards.shift();
    if (c) { save.seen[c.key] = true; persist(); }
    if (A.cards.length) { A.cardT = 0; Sfx.play("card"); } else { A.state = "play"; Input.clear(); }
  }

  G.onWin = () => {
    const i = A.idx, def = LEVELS[i];
    const t = G.time;
    const prevBest = save.best[i];
    const newBest = prevBest === undefined || t < prevBest;
    const par = def.par || { t: 9999, r: 99 };
    const earned = [true, t <= par.t, G.recCount <= par.r];
    const old = save.stars[i] || [false, false, false];
    save.stars[i] = earned.map((v, k) => v || !!old[k]);
    save.done[i] = true;
    if (newBest) save.best[i] = Math.round(t * 10) / 10;
    const gotLantern = G.lanternsGot > 0;
    if (gotLantern) save.lanterns[i] = true;
    persist();
    A.result = { time: t, deaths: G.deaths, echoes: G.recCount, newBest, earned, lantern: gotLantern, par };
  };

  function goSelect() {
    fadeTo(() => { A.state = "select"; A.selLevel = Math.min(A.idx, LEVELS.length - 1); });
  }

  function goTitle() {
    fadeTo(() => { A.state = "title"; A.sel = 0; });
  }

  // ---------------------------------------------------------------- menus
  function menu(items, hits, cx, y0, step) {
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
    const it = items[A.sel];
    if (it && it.adjust) {
      if (Input.hitAny(["ArrowLeft", "KeyA"])) { it.adjust(-1); Sfx.play("ui"); }
      if (Input.hitAny(["ArrowRight", "KeyD"])) { it.adjust(1); Sfx.play("ui"); }
    }
    if (Input.hitAny(["Enter", "Space"])) {
      if (it && !it.disabled) { Sfx.play("ok"); it.act(); }
    }
  }

  const soundLabel = () => "SOUND " + (Sfx.isMuted() ? "OFF" : "ON");
  const toggleSound = () => { Sfx.toggleMute(); };

  function openSettings(back) {
    A.settingsBack = back;
    A.state = "settings";
    A.sel = 0;
  }

  function titleItems() {
    const any = save.done.some(Boolean);
    return [
      { label: any ? "CONTINUE" : "PLAY", fs: true, act: () => startLevel(any ? Math.min(firstOpen(), LEVELS.length - 1) : 0) },
      { label: "LEVELS", fs: true, act: () => { fadeTo(() => { A.state = "select"; A.selLevel = Math.min(firstOpen(), LEVELS.length - 1); }); } },
      { label: "SETTINGS", act: () => openSettings("title") },
    ];
  }

  function pauseItems() {
    return [
      { label: "RESUME", act: () => { A.state = "play"; } },
      { label: "RESTART LEVEL", act: () => startLevel(A.idx) },
      { label: fsElement() ? "LEAVE FULLSCREEN" : "FULLSCREEN", fsToggle: true, act: () => {} },
      { label: "SETTINGS", act: () => openSettings("pause") },
      { label: "LEVELS", act: goSelect },
    ];
  }

  function completeItems() {
    const nxt = mainNext(A.idx), last = nxt < 0;
    return [
      { label: last ? "FINISH" : "NEXT LEVEL", act: () => { if (last) fadeTo(() => { A.state = "ending"; A.endT = 0; Sfx.play("card"); }); else startLevel(nxt); } },
      { label: "RETRY", act: () => startLevel(A.idx) },
      { label: "LEVELS", act: goSelect },
    ];
  }

  // Erases every saved time, star, lantern and setting, as if the game had never been opened here.
  function wipeAllData() {
    try {
      localStorage.removeItem(SAVE_KEY);
      localStorage.removeItem(SETTINGS_KEY);
      localStorage.removeItem("afterglow.muted");
    } catch (e) { /* storage unavailable */ }
    save.done = [];
    save.best = {};
    save.stars = {};
    save.lanterns = {};
    save.seen = {};
    Settings.music = 0.6;
    Settings.sfx = 0.9;
    Settings.shake = true;
    Input.resetBind();
    Sfx.setMuted(false);
    applySettings();
    A.resetArm = 0;
    A.selLevel = 0;
    Sfx.play("cancel");
    fadeTo(() => { A.state = "title"; A.sel = 0; });
  }

  const resetArmed = () => A.resetArm > 0 && A.T - A.resetArm < 360;

  const steps = (v) => Math.round(v * 10);
  function settingsItems() {
    return [
      { label: "MUSIC", type: "slider", get: () => Settings.music, adjust: (d) => { Settings.music = Math.max(0, Math.min(1, Math.round((Settings.music + d * 0.1) * 10) / 10)); applySettings(); persistSettings(); }, act: () => {} },
      { label: "EFFECTS", type: "slider", get: () => Settings.sfx, adjust: (d) => { Settings.sfx = Math.max(0, Math.min(1, Math.round((Settings.sfx + d * 0.1) * 10) / 10)); applySettings(); persistSettings(); Sfx.play("ok"); }, act: () => {} },
      { label: "SCREEN SHAKE", type: "toggle", get: () => Settings.shake, adjust: () => { Settings.shake = !Settings.shake; persistSettings(); }, act: () => { Settings.shake = !Settings.shake; persistSettings(); } },
      { label: "SOUND", type: "toggle", get: () => !Sfx.isMuted(), adjust: toggleSound, act: toggleSound },
      { label: "FULLSCREEN", type: "toggle", get: () => !!fsElement(), fsToggle: true, adjust: () => {}, act: () => {} },
      { label: "KEYS", type: "link", act: () => { A.state = "keys"; A.sel = 0; A.rebind = null; } },
      { label: resetArmed() ? "SURE? PRESS AGAIN" : "RESET ALL DATA", type: "danger", act: () => { if (resetArmed()) wipeAllData(); else A.resetArm = A.T; } },
      { label: "BACK", type: "link", act: () => { A.state = A.settingsBack; A.sel = 0; } },
    ];
  }

  const KEY_ROWS = [
    ["left", "MOVE LEFT"], ["right", "MOVE RIGHT"], ["jump", "JUMP"], ["record", "RECORD"], ["swap", "SWAP"],
    ["restart", "RESTART"], ["clear", "CLEAR ECHO"], ["hint", "HINT"], ["pause", "PAUSE"], ["fullscreen", "FULLSCREEN"],
  ];

  function keyItems() {
    const items = KEY_ROWS.map(([name, label]) => ({ label, name, act: () => { A.rebind = name; } }));
    items.push({ label: "RESET KEYS", act: () => { Input.resetBind(); persistSettings(); } });
    items.push({ label: "BACK", act: () => { A.state = "settings"; A.sel = 5; } });
    return items;
  }

  // The next key pressed becomes the binding. Digits and Enter are reserved for echo slots and menus.
  function captureRebind() {
    for (const code in Input.pressed) {
      if (!Input.pressed[code]) continue;
      Input.pressed[code] = false;
      if (code === "Escape") { A.rebind = null; return; }
      if (code === "Enter" || code.startsWith("Digit") || code.startsWith("Numpad")) { Sfx.play("nope"); return; }
      const name = A.rebind;
      const oldFirst = Input.bind[name][0];
      for (const k in Input.bind) {
        if (k === name) continue;
        const idx = Input.bind[k].indexOf(code);
        if (idx >= 0) {
          Input.bind[k].splice(idx, 1);
          if (!Input.bind[k].length && oldFirst) Input.bind[k].push(oldFirst);
        }
      }
      Input.bind[name] = [code];
      persistSettings();
      A.rebind = null;
      Sfx.play("ok");
      return;
    }
  }

  // ---------------------------------------------------------------- update
  function update() {
    A.T++;
    if (Input.hit("Backslash")) { dev.open = !dev.open; Sfx.play("ui"); Input.clear(); }
    if (dev.open) {
      if (Input.hitAny(["Enter", "Space"])) { setDevUnlock(!dev.unlockAll); Sfx.play("ok"); }
      if (Input.hit("Escape")) dev.open = false;
      Input.clear();
      return;
    }
    if (A.fadeTarget === 1 && A.fade < 1) A.fade = Math.min(1, A.fade + 0.07);
    else if (A.fadeTarget === 1 && A.fade >= 1) {
      const cb = A.fadeCb;
      A.fadeCb = null;
      A.fadeTarget = 0;
      if (cb) cb();
      Input.clear();
    } else if (A.fadeTarget === 0 && A.fade > 0) A.fade = Math.max(0, A.fade - 0.05);
    if (A.fadeTarget === 1) return;

    // Temporary dev tool: = goes to the next level and - to the previous one, from play or pause.
    if ((A.state === "play" || A.state === "pause") && A.fade === 0) {
      const step = Input.hit("Equal") ? 1 : Input.hit("Minus") ? -1 : 0;
      const to = A.idx + step;
      if (step && to >= 0 && to < LEVELS.length) {
        A.toast = { text: "DEV: " + levelNum[to] + " " + LEVELS[to].name, t: A.T };
        startLevel(to, false, true);
        return;
      }
    }

    switch (A.state) {
      case "title": {
        navMenu(titleItems());
        break;
      }
      case "settings": {
        navMenu(settingsItems());
        if (A.sel !== 6) A.resetArm = 0; // moving off the reset item cancels it
        if (Input.hitAny(["Escape", "Backspace"])) { A.state = A.settingsBack; A.sel = 0; }
        break;
      }
      case "keys": {
        if (A.rebind) { captureRebind(); break; }
        navMenu(keyItems());
        if (Input.hitAny(["Escape", "Backspace"])) { A.state = "settings"; A.sel = 5; }
        break;
      }
      case "select": {
        // Each tier is a row; move along it with left and right, between tiers with up and down.
        const cur = A.selLevel, t = LEVELS[cur].chapter, pos = tierLevels[t].indexOf(cur);
        let next = cur;
        if (Input.hitAny(["ArrowRight", "KeyD"])) next = tierLevels[t][Math.min(tierLevels[t].length - 1, pos + 1)];
        if (Input.hitAny(["ArrowLeft", "KeyA"])) next = tierLevels[t][Math.max(0, pos - 1)];
        const stepTier = (d) => {
          let nt = t;
          for (let k = 0; k < CHAPTERS.length; k++) {
            nt = (nt + d + CHAPTERS.length) % CHAPTERS.length;
            if (tierLevels[nt].length) return nt;
          }
          return t;
        };
        if (Input.hitAny(["ArrowDown", "KeyS"])) { const nt = stepTier(1); next = tierLevels[nt][Math.min(pos, tierLevels[nt].length - 1)]; }
        if (Input.hitAny(["ArrowUp", "KeyW"])) { const nt = stepTier(-1); next = tierLevels[nt][Math.min(pos, tierLevels[nt].length - 1)]; }
        if (next !== cur) { A.selLevel = next; Sfx.play("ui"); }
        if (Input.hitAny(["Enter", "Space"])) {
          if (isUnlocked(A.selLevel)) { Sfx.play("ok"); startLevel(A.selLevel); } else Sfx.play("nope");
        }
        if (Input.hitAny(["Escape", "Backspace"])) goTitle();
        break;
      }
      case "chapter": {
        A.cardT++;
        if (A.cardT > 30 && Input.hitAny(["Enter", "Space"])) nextCard();
        break;
      }
      case "play": {
        A.introT++;
        A.hintT++;
        if (Input.hitBind("hint")) A.hintForce = 480;
        if (A.hintForce > 0) A.hintForce--;
        if (Input.hitBind("pause")) { A.state = "pause"; A.sel = 0; Sfx.play("ui"); break; }
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
        if (Input.hitBind("pause")) A.state = "play";
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
    const kinds = Object.keys(KINDS);
    const ek = kinds[Math.floor(t / 90) % kinds.length];
    const ecol = KINDS[ek].color;
    Render.drawActor(ctx, 126, 273, { face: 1, st: 0, g: 1, t, sq: 0, vx: 0, alpha: 0.7, cloak: Render.rgba(ecol, 0.5), cloakDark: Render.rgba(ecol, 0.28), eye: "#ffffff", flame: ecol, core: "#ffffff", emblem: ek });
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    Render.glowAt(ctx, 106, 252, 26, "#ffb347", 0.25);
    Render.glowAt(ctx, 132, 252, 26, ecol, 0.25);
    ctx.restore();
  }

  function drawPlainBg() {
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
    const sx = totalStars(), lx = totalLanternsGot();
    if (sx || lx) Font.draw(ctx, "STARS " + sx + "/" + (LEVELS.length * 3) + "   LANTERNS " + lx + "/" + totalLanterns, 200, 96, { scale: 1, color: "#ffd35a", align: "center" });
  }

  function slider(x, y, v, on) {
    for (let k = 0; k < 10; k++) {
      ctx.fillStyle = k < steps(v) ? (on ? "#ffe9a8" : "#9fa7b8") : "rgba(255,255,255,0.14)";
      ctx.fillRect(x + k * 9, y, 7, 10);
    }
  }

  function drawSettings(hits) {
    drawPlainBg();
    Font.draw(ctx, "SETTINGS", W / 2, 22, { scale: 3, color: "#ffe9a8", align: "center" });
    settingsItems().forEach((it, i) => {
      const y = 80 + i * 29, on = A.sel === i;
      const col = it.type === "danger" && resetArmed() ? "#ff8f8f" : on ? "#ffe9a8" : "#aab2c5";
      Font.draw(ctx, (on ? "> " : "  ") + it.label, 150, y, { scale: 2, color: col });
      if (it.type === "slider") slider(380, y + 2, it.get(), on);
      else if (it.type === "toggle") Font.draw(ctx, it.get() ? "ON" : "OFF", 380, y, { scale: 2, color: it.get() ? "#8fe39a" : "#ff8f8f" });
      hits.push({ x: 140, y: y - 4, w: 360, h: 24, i, act: it.act });
    });
    Font.draw(ctx, resetArmed() ? "THIS ERASES ALL TIMES, STARS, LANTERNS AND SETTINGS" : "UP AND DOWN PICK   LEFT AND RIGHT CHANGE   ESC BACK", W / 2, H - 24, { scale: 1, color: resetArmed() ? "#ff8f8f" : "rgba(200,210,235,0.5)", align: "center" });
  }

  function drawKeys(hits) {
    drawPlainBg();
    Font.draw(ctx, "KEYS", W / 2, 14, { scale: 3, color: "#ffe9a8", align: "center" });
    keyItems().forEach((it, i) => {
      const y = 48 + i * 22, on = A.sel === i;
      Font.draw(ctx, (on ? "> " : "  ") + it.label, 160, y, { scale: 1, color: on ? "#ffe9a8" : "#aab2c5" });
      if (it.name) {
        const waiting = A.rebind === it.name;
        Font.draw(ctx, waiting ? "PRESS A KEY" : Input.bind[it.name].map(keyName).join(" / "), 380, y, { scale: 1, color: waiting ? "#ff8f8f" : "#ffffff" });
      }
      hits.push({ x: 150, y: y - 4, w: 340, h: 18, i, act: it.act });
    });
    Font.draw(ctx, A.rebind ? "PRESS THE NEW KEY   ESC CANCELS" : "ENTER TO CHANGE A KEY   ESC BACK", W / 2, H - 22, { scale: 1, color: "rgba(200,210,235,0.5)", align: "center" });
  }

  function drawStarPips(x, y, i, size, gap) {
    const s = save.stars[i] || [false, false, false];
    for (let k = 0; k < 3; k++) {
      const px = x + k * (size + gap);
      ctx.fillStyle = s[k] ? "#ffd35a" : "rgba(255,255,255,0.12)";
      ctx.fillRect(px, y, size, size);
      if (s[k]) { ctx.fillStyle = "#fff3b0"; ctx.fillRect(px, y, size, 1); }
    }
  }

  function drawSelect(hits) {
    drawPlainBg();
    Font.draw(ctx, "LEVELS", W / 2, 10, { scale: 3, color: "#ffe9a8", align: "center" });
    const tw = 40, th = 46, x0 = 150, gap = 3;
    const bonusX = x0 + 9 * (tw + gap) + 16;
    ctx.fillStyle = "rgba(200,210,235,0.12)";
    ctx.fillRect(bonusX - 9, 42, 1, (CHAPTERS.length - 1) * 54 + th);
    for (let t = 0; t < CHAPTERS.length; t++) {
      const y = 42 + t * 54;
      const pal = CHAPTERS[t].pal;
      Font.draw(ctx, CHAPTERS[t].name, 12, y + 4, { scale: 1, color: pal.accent });
      tierKinds[t].forEach((kind, k) => {
        if (Render.EMBLEMS[kind]) Render.slotIcon(ctx, 18 + k * 18, y + 26, kind, 0, true);
        else Render.drawSwapIcon(ctx, 22 + k * 18, y + 26, "#ffffff");
      });
      tierLevels[t].forEach((i, n) => {
        // Bonus levels stand apart in a column of their own at the right.
        const x = LEVELS[i].bonus ? bonusX : x0 + n * (tw + gap);
        const sel = A.selLevel === i, open = isUnlocked(i);
        ctx.fillStyle = open ? "rgba(20,28,56,0.92)" : "rgba(14,16,28,0.9)";
        ctx.fillRect(x, y, tw, th);
        ctx.strokeStyle = sel ? "#ffe9a8" : open ? pal.accent : "#2b3042";
        ctx.lineWidth = sel ? 2 : 1;
        ctx.strokeRect(x + 0.5, y + 0.5, tw - 1, th - 1);
        Font.draw(ctx, levelNum[i], x + 5, y + 5, { scale: 1, color: open ? "#ffffff" : "#4d5468", shadow: null });
        if (open) drawStarPips(x + 5, y + 20, i, 9, 3);
        if (!open) {
          ctx.fillStyle = "#4d5468";
          ctx.fillRect(x + 15, y + 22, 10, 8);
          ctx.strokeStyle = "#4d5468";
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(x + 20, y + 22, 3.5, Math.PI, 0); ctx.stroke();
        }
        if (lanternLevels[i]) Render.drawLanternIcon(ctx, x + tw - 9, y + th - 11, !!save.lanterns[i]);
        if (LEVELS[i].swap) Render.drawSwapIcon(ctx, x + 9, y + th - 9, open ? "#ffffff" : "#4d5468");
        hits.push({ x, y, w: tw, h: th, level: i });
      });
    }
    const L = LEVELS[A.selLevel];
    let line = levelNum[A.selLevel] + "  " + L.name;
    if (!isUnlocked(A.selLevel)) line += L.bonus ? "   BONUS: " + tierStars(L.chapter) + "/" + L.bonus + " STARS IN " + CHAPTERS[L.chapter].name : "   LOCKED";
    else {
      if (L.bonus) line += "   BONUS";
      if (save.best[A.selLevel] !== undefined) line += "   BEST " + fmtTime(save.best[A.selLevel]);
      if (L.par) line += "   PAR " + fmtTime(L.par.t) + " / " + L.par.r + " ECHO" + (L.par.r === 1 ? "" : "ES");
    }
    Font.draw(ctx, line, W / 2, H - 38, { scale: 1, color: "#e8e2d0", align: "center" });
    Font.draw(ctx, "STARS " + totalStars() + "/" + (LEVELS.length * 3) + "   LANTERNS " + totalLanternsGot() + "/" + totalLanterns, W - 10, 10, { scale: 1, color: "#ffd35a", align: "right" });
    Font.draw(ctx, "ARROWS MOVE   ENTER PLAY   ESC BACK", W / 2, H - 20, { scale: 1, color: "rgba(200,210,235,0.5)", align: "center" });
  }

  function drawCard() {
    const c = A.cards[0];
    ctx.fillStyle = "#05060e";
    ctx.fillRect(0, 0, W, H);
    const a = Math.min(1, A.cardT / 30);
    ctx.globalAlpha = a;
    if (c.type === "tier") {
      const ch = CHAPTERS[c.tier];
      Font.draw(ctx, "TIER " + (c.tier + 1), W / 2, 90, { scale: 1, color: "#8d96ad", align: "center" });
      Font.draw(ctx, ch.name, W / 2, 112, { scale: 4, color: ch.pal.accent, align: "center" });
      Font.draw(ctx, ch.line, W / 2, 170, { scale: 1, color: "#d9deec", align: "center" });
    } else {
      const info = c.kind === "swap" ? ABILITIES.swap : KINDS[c.kind];
      const color = info.color;
      Font.draw(ctx, c.kind === "swap" ? "NEW ABILITY, NOT AN ECHO" : "NEW ECHO", W / 2, 60, { scale: 1, color: "#8d96ad", align: "center" });
      const pat = Render.EMBLEMS[c.kind];
      if (pat) {
        ctx.fillStyle = color;
        for (let r = 0; r < 5; r++) for (let k = 0; k < 5; k++) if (pat[r][k] === "#") ctx.fillRect(W / 2 - 25 + k * 10, 84 + r * 10, 10, 10);
      } else {
        ctx.save();
        ctx.translate(W / 2, 108);
        ctx.scale(6, 6);
        Render.drawSwapIcon(ctx, 0, 0, color);
        ctx.restore();
      }
      Font.draw(ctx, info.name, W / 2, 150, { scale: 4, color, align: "center" });
      const blurb = c.kind === "swap" ? "PRESS " + keyName(Input.bind.swap[0]) + " TO TRADE PLACES WITH THE SELECTED ECHO, OF ANY KIND. IT TAKES YOUR SPOT. ONLY SOME LEVELS SWITCH IT ON: THEY SHOW THE SWAP SIGN IN THE LEVEL SELECT AND NEXT TO THE LEVEL NAME." : info.blurb;
      Font.wrap(blurb, 420, 1).forEach((l, i) => Font.draw(ctx, l, W / 2, 200 + i * 12, { scale: 1, color: "#ffe9a8", align: "center" }));
    }
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
        if (LEVELS[A.idx].swap) Font.draw(ctx, "SWAP ON: " + keyName(Input.bind.swap[0]) + " TRADES PLACES WITH THE SELECTED ECHO", W / 2, 150, { scale: 1, color: "#ffffff", align: "center", alpha: a });
      }
    }
    const L = G.L;
    // Hints pop up on their own only in the first tier and on levels that unlock an echo; elsewhere you ask for one.
    const autoHint = !!L.def.unlock || L.chapter === 0;
    const hintOn = A.hintForce > 0 || (autoHint && A.hintT > 90 && A.hintT < 90 + 720 && L.hint);
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
    } else if (L.hint && (A.hintT >= 90 + 720 || (!autoHint && A.hintT > 90))) {
      Font.draw(ctx, keyName(Input.bind.hint[0]) + " HINT", W - 8, 18, { scale: 1, color: "rgba(220,226,240,0.35)", align: "right", shadow: null });
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
    Font.draw(ctx, "PAUSED", W / 2, 70, { scale: 4, color: "#ffe9a8", align: "center" });
    menu(pauseItems(), hits, W / 2, 140, 28);
    Font.draw(ctx, keyName(Input.bind.pause[0]) + " TO RESUME   " + keyName(Input.bind.fullscreen[0]) + " FULLSCREEN", W / 2, H - 24, { scale: 1, color: "rgba(200,210,235,0.5)", align: "center" });
  }

  function drawComplete(hits) {
    drawPlay();
    dim(0.7);
    const r = A.result || { time: 0, deaths: 0, echoes: 0, newBest: false, earned: [true, false, false], lantern: false, par: { t: 0, r: 0 } };
    const def = LEVELS[A.idx];
    Font.draw(ctx, "LEVEL COMPLETE", W / 2, 50, { scale: 4, color: "#ffe9a8", align: "center" });
    Font.draw(ctx, levelNum[A.idx] + "  " + def.name, W / 2, 90, { scale: 1, color: "#c9d0e2", align: "center" });
    // three stars: finished, under par time, within par echoes
    const labels = ["FINISHED", "PAR " + fmtTime(r.par.t), "PAR " + r.par.r + " ECHO" + (r.par.r === 1 ? "" : "ES")];
    for (let k = 0; k < 3; k++) {
      const cx = W / 2 - 110 + k * 110;
      ctx.fillStyle = r.earned[k] ? "#ffd35a" : "rgba(255,255,255,0.14)";
      ctx.fillRect(cx - 9, 108, 18, 18);
      if (r.earned[k]) { ctx.fillStyle = "#fff3b0"; ctx.fillRect(cx - 9, 108, 18, 3); }
      Font.draw(ctx, labels[k], cx, 132, { scale: 1, color: r.earned[k] ? "#ffe9a8" : "#7c859b", align: "center" });
    }
    Font.draw(ctx, "TIME " + fmtTime(r.time) + "     ECHOES " + r.echoes + "     DEATHS " + r.deaths, W / 2, 152, { scale: 1, color: "#ffffff", align: "center" });
    if (r.newBest) Font.draw(ctx, "NEW BEST", W / 2, 168, { scale: 1, color: "#8fe39a", align: "center" });
    if (lanternLevels[A.idx]) {
      Render.drawLanternIcon(ctx, W / 2 - 38, 187, r.lantern || !!save.lanterns[A.idx]);
      Font.draw(ctx, r.lantern ? "LANTERN FOUND" : save.lanterns[A.idx] ? "LANTERN HAD" : "LANTERN MISSED", W / 2 - 26, 183, { scale: 1, color: r.lantern ? "#ffd35a" : "#7c859b" });
    }
    menu(completeItems(), hits, W / 2, 212, 26);
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
    Font.draw(ctx, "STARS " + totalStars() + "/" + (LEVELS.length * 3) + "   LANTERNS " + totalLanternsGot() + "/" + totalLanterns, W / 2, 230, { scale: 1, color: "#ffd35a", align: "center" });
    if (A.endT > 60 && Math.floor(A.T / 30) % 2 === 0) Font.draw(ctx, "PRESS ENTER", W / 2, H - 30, { scale: 1, color: "#9aa3bb", align: "center" });
    ctx.globalAlpha = 1;
  }

  function render() {
    A.hits = [];
    ctx.imageSmoothingEnabled = false;
    switch (A.state) {
      case "title": drawTitle(A.hits); break;
      case "settings": drawSettings(A.hits); break;
      case "keys": drawKeys(A.hits); break;
      case "select": drawSelect(A.hits); break;
      case "chapter": drawCard(); break;
      case "play": drawPlay(); break;
      case "pause": drawPause(A.hits); break;
      case "complete": drawComplete(A.hits); break;
      case "ending": drawEnding(); break;
    }
    if (dev.unlockAll && !dev.open) Font.draw(ctx, "DEV: ALL LEVELS UNLOCKED", W - 8, H - 12, { scale: 1, color: "rgba(159,227,160,0.55)", align: "right", shadow: null });
    if (dev.open) {
      ctx.fillStyle = "rgba(4,5,12,0.82)";
      ctx.fillRect(0, 0, W, H);
      const bw = 320, bh = 112, bx = Math.round((W - bw) / 2), by = Math.round((H - bh) / 2);
      ctx.fillStyle = "rgba(18,22,44,0.97)";
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = "#ffe9a8";
      ctx.lineWidth = 1;
      ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
      Font.draw(ctx, "DEV TOOLS", W / 2, by + 10, { scale: 2, color: "#ffe9a8", align: "center" });
      const ty = by + 46;
      ctx.fillStyle = dev.unlockAll ? "rgba(90,200,120,0.28)" : "rgba(255,255,255,0.08)";
      ctx.fillRect(bx + 20, ty - 5, bw - 40, 19);
      Font.draw(ctx, "UNLOCK ALL LEVELS   " + (dev.unlockAll ? "ON" : "OFF"), W / 2, ty, { scale: 1, color: dev.unlockAll ? "#9fe3a0" : "#e8e2d0", align: "center" });
      Font.draw(ctx, "= NEXT LEVEL   - PREVIOUS LEVEL", W / 2, by + bh - 34, { scale: 1, color: "rgba(200,210,235,0.6)", align: "center", shadow: null });
      Font.draw(ctx, "ENTER OR CLICK TOGGLES   \\ OR ESC CLOSES", W / 2, by + bh - 18, { scale: 1, color: "rgba(200,210,235,0.6)", align: "center", shadow: null });
      dev.rect = { x: bx + 20, y: ty - 5, w: bw - 40, h: 19 };
    }
    if (A.toast && A.T - A.toast.t < 240) {
      const a = Math.min(1, (240 - (A.T - A.toast.t)) / 40);
      const w = Font.width(A.toast.text, 1) + 20;
      ctx.globalAlpha = a;
      ctx.fillStyle = "rgba(5,6,14,0.85)";
      ctx.fillRect((W - w) / 2, 6, w, 18);
      Font.draw(ctx, A.toast.text, W / 2, 11, { scale: 1, color: "#ffe9a8", align: "center", shadow: null });
      ctx.globalAlpha = 1;
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
        if (h.level !== undefined) A.selLevel = h.level; else if (!A.rebind) A.sel = h.i;
      }
    }
  });

  canvas.addEventListener("mousedown", (e) => {
    Sfx.resume();
    const p = toCanvas(e);
    if (dev.open) {
      const r = dev.rect;
      if (r && p.x >= r.x && p.x < r.x + r.w && p.y >= r.y && p.y < r.y + r.h) { setDevUnlock(!dev.unlockAll); Sfx.play("ok"); }
      return;
    }
    for (const h of A.hits) {
      if (p.x >= h.x && p.x < h.x + h.w && p.y >= h.y && p.y < h.y + h.h) {
        if (A.fadeTarget === 1 || A.rebind) return;
        if (h.level !== undefined) {
          A.selLevel = h.level;
          if (isUnlocked(h.level)) { Sfx.play("ok"); startLevel(h.level); } else Sfx.play("nope");
        } else if (h.act) {
          A.sel = h.i;
          Sfx.play("ok");
          const clicked = menuItemFor(A.state, h.i);
          if (clicked && clicked.fs) enterFullscreen();
          else if (clicked && clicked.fsToggle) toggleFullscreen();
          h.act();
        }
        return;
      }
    }
    // A click records and stops too, for keyboards that cannot register W, D and E together.
    if (A.state === "play" && e.button === 0) Input.pressed.Mouse0 = true;
    if (A.state === "chapter" && A.cardT > 30) nextCard();
    if (A.state === "ending" && A.endT > 60) goTitle();
  });

  // ---------------------------------------------------------------- fullscreen
  // Browsers only allow fullscreen from a key press or click, so it is requested straight from the event handlers.
  const fsElement = () => document.fullscreenElement || document.webkitFullscreenElement;

  // Chrome and Edge can hand Esc to the page while fullscreen, so one tap of Esc leaves fullscreen like F does.
  function lockEsc() {
    try {
      if (navigator.keyboard && navigator.keyboard.lock) navigator.keyboard.lock(["Escape"]).catch(() => { /* not allowed */ });
    } catch (e) { /* not supported */ }
  }

  function unlockEsc() {
    try {
      if (navigator.keyboard && navigator.keyboard.unlock) navigator.keyboard.unlock();
    } catch (e) { /* not supported */ }
  }

  function enterFullscreen() {
    if (fsElement()) return;
    const el = document.documentElement;
    const req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!req) return;
    try {
      const p = req.call(el);
      if (p && p.then) {
        p.then(() => {
          lockEsc();
          A.toast = { text: keyName(Input.bind.fullscreen[0]) + " OR ESC LEAVES FULLSCREEN", t: A.T };
        }).catch(() => { /* refused: stay windowed */ });
      }
    } catch (e) { /* refused: stay windowed */ }
  }

  function exitFullscreen() {
    try {
      const ex = document.exitFullscreen || document.webkitExitFullscreen;
      const p = ex.call(document);
      if (p && p.catch) p.catch(() => { /* ignore */ });
    } catch (e) { /* ignore */ }
  }

  function toggleFullscreen() {
    if (!fsElement()) enterFullscreen(); else exitFullscreen();
  }

  // The menu item under the cursor for the screens that have a fullscreen entry. Called from the key and click
  // handlers themselves, because browsers only allow fullscreen straight from a user action.
  function menuItemFor(state, i) {
    const items = state === "title" ? titleItems() : state === "pause" ? pauseItems() : state === "settings" ? settingsItems() : null;
    return items ? items[i] : null;
  }

  window.addEventListener("keydown", (e) => {
    Sfx.resume();
    if (e.repeat || A.rebind) return;
    if (Input.bind.fullscreen.includes(e.code)) { toggleFullscreen(); return; }
    if (e.code === "Escape" && fsElement()) {
      Input.pressed.Escape = false;
      exitFullscreen();
      return;
    }
    if (A.fadeTarget !== 1 && (e.code === "Enter" || e.code === "Space" || e.code === "NumpadEnter")) {
      const it = menuItemFor(A.state, A.sel);
      if (it && it.fs) enterFullscreen();
      else if (it && it.fsToggle) toggleFullscreen();
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
    if (!fsElement()) unlockEsc();
    if (!fsElement() && A.state === "play" && !G.won) { A.state = "pause"; A.sel = 0; }
  }
  document.addEventListener("fullscreenchange", onFullscreenChange);
  document.addEventListener("webkitfullscreenchange", onFullscreenChange);

  // ---------------------------------------------------------------- loop
  let last = performance.now(), acc = 0, frameErrors = 0;
  function frame(now) {
    acc += Math.min(0.1, (now - last) / 1000);
    last = now;
    // A thrown error must not end the loop: before this, one bad frame froze the screen on a half-painted picture.
    try {
      while (acc >= DT) {
        if (!window.__manual) update();
        acc -= DT;
      }
      render();
    } catch (e) {
      acc = 0;
      if (frameErrors++ < 5) console.error(e);
    }
    requestAnimationFrame(frame);
  }

  const startIdx = params.has("level") ? Math.max(0, Math.min(LEVELS.length - 1, Number(params.get("level")) || 0)) : -1;
  if (startIdx >= 0) startLevel(startIdx, true);
  A.fade = 0;
  requestAnimationFrame(frame);

  return { state: A, dev, startLevel, update, render, save, isUnlocked, levelNum };
})();
