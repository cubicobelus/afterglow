"use strict";

// engine.js: input, physics, echoes and world rules. No drawing in here.

const TILE = 20, COLS = 32, ROWS = 18, W = COLS * TILE, H = ROWS * TILE, DT = 1 / 60;
const PW = 12, PH = 16;
const RUN = 140, JUMP = 460, GRAV = 1500, MAXFALL = 620;
const ACC_G = 1500, DEC_G = 1800, ACC_A = 950, DEC_A = 520;
const COYOTE = 0.1, JUMP_BUF = 0.12;
const GLOW_R = 108, LAMP_R = 100, FLIP_R = 72, PHASE_R = 64;
const MIN_REC = 20;
const RAMP = 24;
const PED_W = 26, PED_H = 4; // spawn slab
const STEP = 5;              // small ledges up to this tall are stepped onto without a jump
const SPRING_V = 600, SPRING_V_HELD = 720; // bounce speeds (about 120 and 173 px high)
const GUST_R = 72, GUST_ACC = 900, GUST_V = 170, GUST_GROUND = 90, WIND_DECAY = 300;

const KINDS = {
  shade: { name: "SHADE", color: "#8fb4ff", blurb: "HOLDS PLATES AND IS SOLID TO STAND ON." },
  glow: { name: "GLOW", color: "#ffc857", blurb: "CARRIES LIGHT. FAINT SHADOW PLANKS TURN SOLID IN IT AND THORNS WITHER." },
  phase: { name: "PHASE", color: "#c78bff", blurb: "CRYSTAL FADES AWAY AROUND IT." },
  flip: { name: "FLIP", color: "#4fe3c1", blurb: "REVERSES GRAVITY AROUND IT." },
  tide: { name: "TIDE", color: "#ff8f8f", blurb: "REPLAYS ITS PATH BACK AND FORTH FOREVER, WAITING WHERE YOU WAITED." },
  spring: { name: "SPRING", color: "#a6e86a", blurb: "BOUNCES YOU HIGH. HOLD JUMP FOR A BIGGER BOUNCE." },
  gust: { name: "GUST", color: "#dff3ff", blurb: "BLOWS A WIND IN THE DIRECTION IT WAS FACING." },
};
// Slots always appear in this order, whatever order a level lists its echoes in, so the numbers on the keys
// never spell out the order you should record in.
const KIND_ORDER = ["shade", "glow", "phase", "flip", "tide", "spring", "gust"];
const PLATE_COLORS = { a: "#4fd1ff", b: "#ffb347", c: "#ff6fae", d: "#9cff6f" };

// Settings the player can change (the UI loads and saves these).
const Settings = { music: 0.6, sfx: 0.9, shake: true };

// ---------------------------------------------------------------- input
const DEFAULT_BIND = {
  left: ["ArrowLeft", "KeyA"],
  right: ["ArrowRight", "KeyD"],
  jump: ["Space", "ArrowUp", "KeyW"],
  record: ["KeyE"],
  swap: ["KeyQ", "ShiftLeft", "ShiftRight"],
  restart: ["KeyR"],
  clear: ["KeyX"],
  hint: ["KeyH"],
  pause: ["Escape", "KeyP"],
  fullscreen: ["KeyF"],
};

const Input = (() => {
  const down = {}, pressed = {};
  const GAME_KEYS = ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Tab"];
  const bind = JSON.parse(JSON.stringify(DEFAULT_BIND));
  const any = (codes) => codes.some((c) => down[c]);
  if (typeof window !== "undefined") {
    window.addEventListener("keydown", (e) => {
      if (!down[e.code]) pressed[e.code] = true;
      down[e.code] = true;
      if (GAME_KEYS.includes(e.code)) e.preventDefault();
    });
    window.addEventListener("keyup", (e) => { down[e.code] = false; });
    window.addEventListener("blur", () => { for (const k in down) down[k] = false; });
  }
  return {
    down, pressed, bind,
    left: () => any(bind.left),
    right: () => any(bind.right),
    jump: () => any(bind.jump),
    hit(code) { const v = !!pressed[code]; pressed[code] = false; return v; },
    hitAny(codes) { let v = false; for (const c of codes) { if (pressed[c]) { v = true; pressed[c] = false; } } return v; },
    hitBind(name) { return this.hitAny(bind[name]); },
    clear() { for (const k in pressed) pressed[k] = false; },
    resetBind() { for (const k in DEFAULT_BIND) bind[k] = DEFAULT_BIND[k].slice(); },
  };
})();

const SFX = (name, arg) => { if (typeof Sfx !== "undefined") Sfx.play(name, arg); };

// Short readable name for a key code, for hints and the key settings.
function keyName(code) {
  if (!code) return "NONE";
  const map = { Space: "SPACE", ArrowLeft: "LEFT", ArrowRight: "RIGHT", ArrowUp: "UP", ArrowDown: "DOWN", ShiftLeft: "SHIFT", ShiftRight: "SHIFT", Escape: "ESC", Enter: "ENTER", Backspace: "BKSP", Tab: "TAB", ControlLeft: "CTRL", ControlRight: "CTRL", AltLeft: "ALT", AltRight: "ALT" };
  if (map[code]) return map[code];
  if (code.startsWith("Key")) return code.slice(3);
  if (code.startsWith("Digit")) return code.slice(5);
  if (code.startsWith("Numpad")) return "NUM" + code.slice(6);
  return code.toUpperCase();
}

// ---------------------------------------------------------------- geometry
function overlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function rectDist2(px, py, r) {
  const nx = Math.max(r.x, Math.min(px, r.x + r.w));
  const ny = Math.max(r.y, Math.min(py, r.y + r.h));
  return (nx - px) * (nx - px) + (ny - py) * (ny - py);
}

// ---------------------------------------------------------------- world state
const G = {
  L: null, t: 0, p: null, echoes: {}, rec: null, sel: 0,
  lights: [], flips: [], phases: [], winds: [],
  dead: false, deadT: 0, won: false, winT: 0,
  deaths: 0, time: 0, timing: false, recCount: 0, swapCd: 0, lanternsGot: 0, notice: null,
  particles: [], shake: 0, onWin: null,
};

function makeGrid() {
  const a = Array.from({ length: ROWS }, () => Array(COLS).fill("."));
  const g = {
    set(c, r, ch) { if (c >= 0 && c < COLS && r >= 0 && r < ROWS) a[r][c] = ch; return g; },
    fill(c0, r0, c1, r1, ch) { for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) g.set(c, r, ch); return g; },
    // Walls on three sides, a ceiling and a floor three rows thick (surface at row 15).
    base() { g.fill(0, 0, COLS - 1, 0, "#").fill(0, 0, 0, ROWS - 1, "#").fill(COLS - 1, 0, COLS - 1, ROWS - 1, "#").fill(0, 15, COLS - 1, ROWS - 1, "#"); return g; },
    pit(c0, c1) { return g.fill(c0, 15, c1, ROWS - 1, "."); },
    rows() { return a.map((r) => r.join("")); },
  };
  return g;
}

// Accepts a level index into LEVELS, or a level definition (used by the mechanic tests).
function parseLevel(which) {
  const idx = typeof which === "number" ? which : -1;
  const def = typeof which === "number" ? LEVELS[which] : which;
  const g = makeGrid();
  def.build(g);
  const rows = g.rows();
  const L = {
    idx, def, name: def.name, chapter: def.chapter, dark: !!def.dark,
    echoes: (def.echoes || []).slice().sort((a, b) => KIND_ORDER.indexOf(a) - KIND_ORDER.indexOf(b)), recMax: def.recMax || 10, swap: !!def.swap, hint: def.hint || "",
    rows, walls: [], doorTiles: [], plates: [], planks: [], crystals: [], spikes: [], thorns: [], lamps: [],
    oneways: [], gates: [], lanterns: [],
    spawn: { x: 40, y: 100 }, exit: null, doorOpen: {}, hasDoor: {}, hasLamp: {},
  };
  // A level may list a kind more than once. The first slot of a kind is keyed by its name, later ones as name2, name3.
  const seen = {};
  L.slotKeys = L.echoes.map((k) => { seen[k] = (seen[k] || 0) + 1; return seen[k] === 1 ? k : k + seen[k]; });
  L.slotNum = L.echoes.map((k, i) => L.slotKeys[i] === k ? 1 : Number(L.slotKeys[i].slice(k.length)));
  L.dupKinds = new Set(L.echoes.filter((k) => L.echoes.filter((x) => x === k).length > 1));
  let ex0 = 1e9, ey0 = 1e9, ex1 = -1, ey1 = -1;
  for (let r = 0; r < ROWS; r++) {
    let run = -1;
    for (let c = 0; c <= COLS; c++) {
      const ch = c < COLS ? rows[r][c] : ".";
      const x = c * TILE, y = r * TILE;
      if (ch === "#") {
        if (run < 0) run = c;
        continue;
      }
      if (run >= 0) {
        L.walls.push({ x: run * TILE, y, w: (c - run) * TILE, h: TILE });
        run = -1;
      }
      if (c >= COLS) continue;
      if (ch === "%") L.crystals.push({ x, y });
      else if (ch === "~") L.planks.push({ x, y });
      else if (ch === "^") L.spikes.push({ x: x + 3, y: y + 11, w: 14, h: 9, dir: 1, tx: c, ty: r });
      else if (ch === "v") L.spikes.push({ x: x + 3, y, w: 14, h: 9, dir: -1, tx: c, ty: r });
      else if (ch === "t") L.thorns.push({ x: x + 1, y: y + 8, w: 18, h: 12, cx: x + 10, cy: y + 14, tx: c, ty: r, lit: false, wither: 0 });
      else if (ch >= "a" && ch <= "d") L.plates.push({ id: ch, x: x + 2, y: y + 14, w: 16, h: 6, ceil: false, pressed: false, amt: 0 });
      else if (ch >= "1" && ch <= "4") L.plates.push({ id: "abcd"[Number(ch) - 1], x: x + 2, y, w: 16, h: 6, ceil: true, pressed: false, amt: 0 });
      else if (ch >= "5" && ch <= "8") L.plates.push({ id: "abcd"[Number(ch) - 5], x: x + 2, y: y + 14, w: 16, h: 6, ceil: false, sensor: true, pressed: false, amt: 0 });
      else if (ch >= "A" && ch <= "D") {
        const id = ch.toLowerCase();
        L.doorTiles.push({ id, x, y, w: TILE, h: TILE, door: true, amt: 0, tx: c, ty: r });
        L.hasDoor[id] = true;
      } else if (ch === "=") L.oneways.push({ x, y, w: TILE, h: 6, ow: true, src: null });
      else if (ch === "G") L.gates.push({ x, y, w: TILE, h: TILE, door: true, amt: 0, tx: c, ty: r, open: false });
      else if (ch === "o") L.lanterns.push({ x: x + 10, y: y + 10, tx: c, ty: r, got: false });
      else if (ch === "L") L.lamps.push({ x: x + 10, y: y + 10, tx: c, ty: r });
      else if (ch >= "P" && ch <= "S") {
        const id = "abcd"[ch.charCodeAt(0) - 80];
        L.lamps.push({ x: x + 10, y: y + 10, tx: c, ty: r, switchId: id });
        L.hasLamp[id] = true;
      }
      else if (ch === "@") {
        // The spawn stands on a small gray slab: a solid step PED_H tall.
        L.ped = { x: x + TILE / 2 - PED_W / 2, y: y + TILE - PED_H, w: PED_W, h: PED_H };
        L.spawn = { x: x + (TILE - PW) / 2, y: y + TILE - PED_H - PH };
      }
      else if (ch === "X") {
        ex0 = Math.min(ex0, x); ey0 = Math.min(ey0, y); ex1 = Math.max(ex1, x + TILE); ey1 = Math.max(ey1, y + TILE);
      }
    }
  }
  if (ex1 > 0) L.exit = { x: ex0, y: ey0, w: ex1 - ex0, h: ey1 - ey0 };
  if (L.ped) L.walls.push(L.ped);
  return L;
}

// ---------------------------------------------------------------- particles
function emit(o) {
  if (G.particles.length > 500) return;
  G.particles.push(Object.assign({ x: 0, y: 0, vx: 0, vy: 0, life: 0.5, max: 0.5, size: 2, grav: 0, color: "#fff", add: false }, o));
}

function burst(x, y, n, color, speed, life, size, grav) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = speed * (0.35 + Math.random() * 0.65);
    const l = life * (0.6 + Math.random() * 0.4);
    emit({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: l, max: l, size, grav: grav || 0, color });
  }
}

function updateParticles() {
  const ps = G.particles;
  for (let i = ps.length - 1; i >= 0; i--) {
    const p = ps[i];
    p.life -= DT;
    if (p.life <= 0) { ps.splice(i, 1); continue; }
    p.vy += p.grav * DT;
    p.x += p.vx * DT;
    p.y += p.vy * DT;
  }
  if (G.shake > 0) G.shake = Math.max(0, G.shake - 0.4);
}

// ---------------------------------------------------------------- fields (light, gravity, phase)
function litRect(r) {
  for (const l of G.lights) {
    if (rectDist2(l.x, l.y, r) <= l.r * l.r) return true;
  }
  return false;
}

function litPoint(x, y) {
  for (const l of G.lights) {
    const dx = x - l.x, dy = y - l.y;
    if (dx * dx + dy * dy <= l.r * l.r) return true;
  }
  return false;
}

function inPhase(r) {
  for (const f of G.phases) {
    if (rectDist2(f.x, f.y, r) <= f.r * f.r) return true;
  }
  return false;
}

function computeFields() {
  const L = G.L;
  // Switch lamps burn only while their plate is held.
  G.lights = L.lamps.filter((l) => !l.switchId || L.doorOpen[l.switchId]).map((l) => ({ x: l.x, y: l.y, r: LAMP_R }));
  G.flips = [];
  G.phases = [];
  G.winds = [];
  // Echo powers switch on only once the echo has come to rest, growing in over a short ramp.
  const power = (echo) => (echo.moving ? 0 : Math.min(1, (echo.restT + 1) / RAMP));
  for (const k in G.echoes) {
    const e = G.echoes[k], pw = power(e);
    if (pw <= 0) continue;
    const cx = e.x + PW / 2, cy = e.y + PH / 2;
    if (e.kind === "glow") G.lights.push({ x: cx, y: cy, r: GLOW_R * pw, echo: true });
    else if (e.kind === "flip") G.flips.push({ x: cx, y: cy, r: FLIP_R * pw });
    else if (e.kind === "phase") G.phases.push({ x: cx, y: cy, r: PHASE_R * pw });
    else if (e.kind === "gust") G.winds.push({ x: cx, y: cy, r: GUST_R * pw, dir: e.face >= 0 ? 1 : -1 });
  }
  for (const gt of L.gates) gt.open = litRect(gt);
}

// ---------------------------------------------------------------- echoes
function makeEcho(kind, trace, key) {
  const s = trace[0];
  return { kind, key: key || kind, trace, x: s.x, y: s.y, px: s.x, py: s.y, dx: 0, dy: 0, face: s.f, st: s.s, g: s.g, frozen: null, i: 0, moving: true, restT: 0 };
}

function placeEchoes() {
  for (const k in G.echoes) {
    const e = G.echoes[k];
    const s = e.trace[0];
    e.frozen = null;
    e.x = e.px = s.x; e.y = e.py = s.y; e.dx = e.dy = 0;
    e.face = s.f; e.st = s.s; e.g = s.g; e.i = 0; e.moving = true; e.restT = 0;
  }
}

function updateEchoes() {
  for (const k in G.echoes) {
    const e = G.echoes[k];
    e.px = e.x; e.py = e.y;
    if (e.frozen) {
      e.x = e.frozen.x; e.y = e.frozen.y;
      e.moving = false;
    } else if (e.kind === "tide" && e.trace.length > 1) {
      // Tide plays its path forward, then backward, forever: smooth, never snapping back to the start.
      const n = e.trace.length, period = 2 * (n - 1), k = G.t % period;
      const fwd = k < n;
      const i = fwd ? k : period - k;
      const s = e.trace[i];
      e.x = s.x; e.y = s.y; e.face = fwd ? s.f : -s.f; e.st = s.s; e.g = s.g; e.i = i;
      e.moving = true;
    } else {
      const i = Math.min(G.t, e.trace.length - 1);
      const s = e.trace[i];
      e.x = s.x; e.y = s.y; e.face = s.f; e.st = s.s; e.g = s.g; e.i = i;
      e.moving = G.t < e.trace.length - 1;
    }
    e.dx = e.x - e.px;
    e.dy = e.y - e.py;
    e.restT = e.moving ? 0 : e.restT + 1;
    if (e.bounceT > 0) e.bounceT--;
  }
}

// ---------------------------------------------------------------- attempt / recording flow
function restartAttempt() {
  const L = G.L, s = L.spawn;
  G.t = 0;
  G.dead = false;
  G.deadT = 0;
  G.p = { x: s.x, y: s.y, w: PW, h: PH, vx: 0, vy: 0, windV: 0, onGround: false, face: 1, coy: 0, buf: 0, jumping: false, stand: null, g: 1, sq: 0 };
  placeEchoes();
  computeFields();
}

function cancelRec() {
  const r = G.rec;
  if (!r) return;
  G.rec = null;
  if (r.prev) G.echoes[r.key] = r.prev;
}

function startRec() {
  const L = G.L;
  const kind = L.echoes[G.sel], key = L.slotKeys[G.sel];
  if (!kind) return;
  const prev = G.echoes[key];
  delete G.echoes[key];
  G.rec = { kind, key, trace: [], prev };
  restartAttempt();
  SFX("recStart");
}

// A tide that barely moves would just be a second shade, so it has to travel at least this far.
const TIDE_MIN_TRAVEL = 40;
function travelled(trace) {
  let far = 0;
  for (const s of trace) far = Math.max(far, Math.hypot(s.x - trace[0].x, s.y - trace[0].y));
  return far;
}

function stopRec() {
  const r = G.rec;
  if (!r) return;
  G.rec = null;
  if (r.kind === "tide" && r.trace.length >= MIN_REC && travelled(r.trace) < TIDE_MIN_TRAVEL) {
    if (r.prev) G.echoes[r.key] = r.prev;
    G.notice = { text: "A TIDE HAS TO TRAVEL", t: 150 };
    SFX("nope");
    restartAttempt();
    return;
  }
  if (r.trace.length >= MIN_REC) {
    G.echoes[r.key] = makeEcho(r.kind, r.trace, r.key);
    G.recCount++;
    SFX("recStop", r.kind);
    const s0 = G.L.spawn;
    burst(s0.x + PW / 2, s0.y + PH / 2, 16, KINDS[r.kind].color, 80, 0.6, 2, -20);
  } else {
    if (r.prev) G.echoes[r.key] = r.prev;
    SFX("cancel");
  }
  restartAttempt();
}

function clearSelected() {
  const key = G.L.slotKeys[G.sel];
  if (key && G.echoes[key] && !G.rec) {
    delete G.echoes[key];
    SFX("cancel");
    restartAttempt();
  }
}

function doSwap() {
  const L = G.L, p = G.p;
  const kind = L.echoes[G.sel], key = L.slotKeys[G.sel];
  const e = key && G.echoes[key];
  if (!e || G.swapCd > 0 || (G.rec && G.rec.key === key)) { SFX("nope"); return; }
  const probe = { x: e.x, y: e.y, w: PW, h: PH };
  for (const s of buildSolids(probe, false)) {
    if (overlap(probe, s)) { SFX("nope"); return; }
  }
  const old = { x: p.x, y: p.y };
  burst(p.x + PW / 2, p.y + PH / 2, 14, KINDS[kind].color, 90, 0.5, 2, 0);
  burst(e.x + PW / 2, e.y + PH / 2, 14, "#ffffff", 90, 0.5, 2, 0);
  p.x = e.x; p.y = e.y; p.vx = 0; p.vy = 0; p.stand = null; p.onGround = false; p.coy = 0;
  e.frozen = { x: old.x, y: old.y };
  e.moving = false;
  e.restT = Math.max(e.restT, RAMP); // its power should be at full strength where it lands
  G.swapCd = 12;
  SFX("swap");
}

function kill() {
  if (G.dead || G.won) return;
  const p = G.p;
  G.dead = true;
  G.deadT = 0;
  G.deaths++;
  cancelRec();
  burst(p.x + PW / 2, p.y + PH / 2, 26, "#ffe9b0", 150, 0.7, 2, 200);
  G.shake = 7;
  SFX("die");
}

function win() {
  if (G.won || G.dead) return;
  G.won = true;
  G.winT = 0;
  SFX("win");
  burst(G.p.x + PW / 2, G.p.y + PH / 2, 30, "#fff3b0", 120, 1, 2, -30);
  if (G.onWin) G.onWin();
}

// ---------------------------------------------------------------- solids and player step
function buildSolids(p, withEchoes, g) {
  const L = G.L, out = [];
  for (const w of L.walls) out.push(w);
  for (const d of L.doorTiles) if (!L.doorOpen[d.id]) out.push(d);
  for (const gt of L.gates) if (!gt.open) out.push(gt);
  if (g !== undefined) {
    for (const o of L.oneways) {
      if (g > 0 ? p.y + PH <= o.y + 4 : p.y >= o.y + o.h - 4) out.push(o);
    }
  }
  const pad = 36;
  for (const pl of L.planks) {
    if (pl.x > p.x - pad - TILE && pl.x < p.x + PW + pad && pl.y > p.y - pad - TILE && pl.y < p.y + PH + pad) {
      for (let i = 0; i < 5; i++) {
        const s = { x: pl.x + i * 4, y: pl.y, w: 4, h: 6 };
        if (litRect(s)) out.push(s);
      }
    }
  }
  for (const c of L.crystals) {
    if (c.x > p.x - pad - TILE && c.x < p.x + PW + pad && c.y > p.y - pad - TILE && c.y < p.y + PH + pad) {
      for (let cy = 0; cy < 5; cy++) {
        for (let cx = 0; cx < 5; cx++) {
          const s = { x: c.x + cx * 4, y: c.y + cy * 4, w: 4, h: 4, crystal: true };
          if (!inPhase(s)) out.push(s);
        }
      }
    }
  }
  if (withEchoes) {
    for (const k in G.echoes) {
      const e = G.echoes[k];
      const ok = g > 0 ? p.y + PH <= e.y + 4 : p.y >= e.y + PH - 4;
      if (ok) out.push({ x: e.x, y: e.y, w: PW, h: PH, ow: true, src: e });
    }
  }
  return out;
}

function playerState(p) {
  if (!p.onGround) return p.vy * p.g < 0 ? 2 : 3;
  return Math.abs(p.vx) > 20 ? 1 : 0;
}

function stepPlayer() {
  const L = G.L, p = G.p;
  const cx = p.x + PW / 2, cy = p.y + PH / 2;
  let g = 1;
  for (const f of G.flips) {
    const dx = cx - f.x, dy = cy - f.y;
    if (dx * dx + dy * dy <= f.r * f.r) g = -1;
  }
  if (g !== p.g) {
    p.g = g;
    SFX("flip");
    burst(cx, cy, 10, "#4fe3c1", 70, 0.5, 2, 0);
  }

  const dir = (Input.right() ? 1 : 0) - (Input.left() ? 1 : 0);
  const jumpHeld = Input.jump();
  const jumpPressed = Input.hitBind("jump");

  let acc = p.onGround ? (dir ? ACC_G : DEC_G) : (dir ? ACC_A : DEC_A);
  if (dir && p.vx * dir < 0) acc *= 1.7;
  const target = dir * RUN;
  if (p.vx < target) p.vx = Math.min(target, p.vx + acc * DT);
  else if (p.vx > target) p.vx = Math.max(target, p.vx - acc * DT);
  if (dir) p.face = dir;

  // Wind from a gust echo adds a sideways drift on top of your own running.
  let windTarget = 0;
  for (const w of G.winds) {
    const dx = cx - w.x, dy = cy - w.y;
    if (dx * dx + dy * dy <= w.r * w.r) windTarget += w.dir * GUST_V;
  }
  windTarget = Math.max(-GUST_V, Math.min(GUST_V, windTarget));
  // On the ground the wind only helps or hinders while you move, and never beats your running speed.
  if (p.onGround) windTarget = dir === 0 ? 0 : Math.max(-GUST_GROUND, Math.min(GUST_GROUND, windTarget));
  const wacc = windTarget !== 0 ? GUST_ACC : (p.onGround ? GUST_ACC : WIND_DECAY);
  if (p.windV < windTarget) p.windV = Math.min(windTarget, p.windV + wacc * DT);
  else if (p.windV > windTarget) p.windV = Math.max(windTarget, p.windV - wacc * DT);

  p.buf = jumpPressed ? JUMP_BUF : Math.max(0, p.buf - DT);
  p.coy = p.onGround ? COYOTE : Math.max(0, p.coy - DT);
  if (p.buf > 0 && p.coy > 0) {
    p.vy = -JUMP * g;
    p.buf = 0; p.coy = 0; p.jumping = true; p.onGround = false; p.stand = null;
    p.sq = -0.25;
    SFX("jump");
    burst(p.x + PW / 2, p.y + (g > 0 ? PH : 0), 5, "#cfd8e8", 40, 0.3, 2, 0);
  }
  if (p.jumping) {
    if (p.vy * g >= 0) p.jumping = false;
    else if (!jumpHeld) { p.vy *= 0.45; p.jumping = false; }
  }
  let gr = GRAV;
  if (!p.onGround && Math.abs(p.vy) < 80 && jumpHeld) gr *= 0.65;
  p.vy += gr * g * DT;
  // Terminal speed applies to falling only, so strong bounces are not clipped.
  const along = p.vy * g;
  if (along > MAXFALL) p.vy = MAXFALL * g;
  else if (along < -900) p.vy = -900 * g;

  const prevStand = p.stand;
  if (prevStand) {
    p.x += prevStand.dx; p.y += prevStand.dy;
    // An echo ignores walls but you do not: if the ride would push you into one (a jump into a low ceiling), let go
    // instead of being shoved through it onto the far side.
    const probe = buildSolids(p, false, g);
    if (probe.some((o) => !o.ow && overlap(p, o))) { p.x -= prevStand.dx; p.y -= prevStand.dy; }
  }
  p.stand = null;

  const solids = buildSolids(p, true, g);
  // Resolve the echo you were standing on first, so overlapping echoes never steal the rider.
  if (prevStand) {
    const k = solids.findIndex((s) => s.src === prevStand);
    if (k > 0) solids.unshift(solids.splice(k, 1)[0]);
  }

  const evx = p.vx + p.windV;
  p.x += evx * DT;
  if (evx !== 0) {
    for (const s of solids) {
      if (s.ow) continue;
      if (!overlap(p, s)) continue;
      const rise = p.y + PH - s.y;
      if (g > 0 && p.onGround && rise > 0 && rise <= STEP) {
        const up = { x: p.x, y: s.y - PH, w: PW, h: PH };
        if (!solids.some((o) => !o.ow && overlap(up, o))) { p.y = up.y; continue; }
      }
      p.x = evx > 0 ? s.x - PW : s.x + s.w;
    }
  }

  const vyBefore = p.vy;
  p.y += p.vy * DT;
  let hitDown = false, hitUp = false, bounced = null;
  for (const s of solids) {
    if (!overlap(p, s)) continue;
    if (s.ow) {
      if (g > 0 ? p.vy >= 0 : p.vy <= 0) {
        if (g > 0) p.y = s.y - PH; else p.y = s.y + s.h;
        if (s.src && s.src.kind === "spring" && s.src.restT >= 6) {
          // Landing on a resting spring throws you back up (higher if jump is held).
          p.vy = -g * (jumpHeld ? SPRING_V_HELD : SPRING_V);
          p.jumping = false;
          bounced = s.src;
          continue;
        }
        if (g > 0) hitDown = true; else hitUp = true;
        p.vy = 0;
        // Keep riding the echo you were already on if two overlap.
        if (!p.stand || s.src === prevStand) p.stand = s.src;
      }
      continue;
    }
    if (p.vy > 0 || (p.vy === 0 && g > 0)) { p.y = s.y - PH; hitDown = true; }
    else { p.y = s.y + s.h; hitUp = true; }
    p.vy = 0;
  }
  const wasGround = p.onGround;
  p.onGround = g > 0 ? hitDown : hitUp;
  if (p.onGround && !wasGround && Math.abs(vyBefore) > 140) {
    p.sq = 0.28;
    SFX("land");
    burst(p.x + PW / 2, p.y + (g > 0 ? PH : 0), 6, "#cfd8e8", 50, 0.3, 2, 0);
  }
  if (bounced) {
    bounced.bounceT = 14;
    p.sq = -0.4;
    SFX("spring");
    burst(p.x + PW / 2, p.y + (g > 0 ? PH : 0), 8, KINDS.spring.color, 80, 0.4, 2, 0);
  }
  p.sq *= 0.82;

  p.x = Math.max(0, Math.min(W - PW, p.x));

  // Crushed by something that solidified around the player.
  for (const s of solids) {
    if ((s.crystal || s.door) && overlap({ x: p.x + 1, y: p.y + 1, w: PW - 2, h: PH - 2 }, s)) { kill(); return; }
  }

  if (p.onGround && Math.abs(p.vx) > 70 && G.t % 7 === 0) {
    emit({ x: p.x + PW / 2 - p.face * 4, y: p.y + (g > 0 ? PH : 0) - 1, vx: -p.face * 14, vy: -g * 10, life: 0.3, max: 0.3, size: 2, color: "#aab7c9" });
  }
}

function updatePlates() {
  const L = G.L;
  const bodies = [];
  if (!G.dead) bodies.push(G.p);
  for (const k in G.echoes) bodies.push(G.echoes[k]);
  const count = {}, pressed = {};
  for (const pl of L.plates) count[pl.id] = (count[pl.id] || 0) + 1;
  for (const pl of L.plates) {
    let on = false;
    if (pl.sensor) on = litRect(pl); // light sensors are pressed by light, not by weight
    else {
      for (const b of bodies) {
        if (b.x < pl.x + pl.w && b.x + PW > pl.x && b.y < pl.y + pl.h && b.y + PH > pl.y) { on = true; break; }
      }
    }
    if (on && !pl.pressed) { SFX("plateOn"); burst(pl.x + 8, pl.y + 3, 6, PLATE_COLORS[pl.id], 50, 0.4, 2, 0); }
    if (!on && pl.pressed) SFX("plateOff");
    pl.pressed = on;
    if (on) pressed[pl.id] = (pressed[pl.id] || 0) + 1;
  }
  for (const id in count) {
    const open = pressed[id] === count[id];
    if (open !== !!L.doorOpen[id]) {
      L.doorOpen[id] = open;
      if (L.hasDoor[id]) SFX("door");
    }
  }
}

function handleActions() {
  const L = G.L;
  if (Input.hitBind("restart")) {
    if (G.rec) { cancelRec(); SFX("cancel"); }
    restartAttempt();
  }
  const n = L.echoes.length;
  // The selected slot is both what E records and what Q swaps with, so it can change while recording.
  for (let i = 0; i < n; i++) {
    if (Input.hit("Digit" + (i + 1)) || Input.hit("Numpad" + (i + 1))) { G.sel = i; SFX("ui"); }
  }
  if (!G.rec && Input.hitBind("clear")) clearSelected();
  if (n && Input.hitBind("record")) {
    if (G.rec) stopRec();
    else startRec();
  }
  if (L.swap && Input.hitBind("swap")) doSwap();
}

// The level clock waits for the first real input: moving, a fresh press of a control key, or picking a slot.
// A key still held from the menu does not count.
function controlInput() {
  if (Input.left() || Input.right()) return true;
  for (const n of ["jump", "record", "swap", "restart", "clear"]) if (Input.bind[n].some((c) => Input.pressed[c])) return true;
  for (let i = 1; i <= 9; i++) if (Input.pressed["Digit" + i] || Input.pressed["Numpad" + i]) return true;
  return false;
}

function tick() {
  const L = G.L;
  if (!L) return;
  if (G.won) { G.winT++; updateParticles(); return; }
  if (G.dead) {
    G.deadT++;
    if (G.deadT >= 40) restartAttempt();
    updateParticles();
    return;
  }
  if (!G.timing && controlInput()) G.timing = true;
  if (G.timing) G.time += DT;
  if (G.swapCd > 0) G.swapCd--;
  if (G.notice && G.notice.t > 0) G.notice.t--;
  handleActions();
  if (G.dead) return;
  updateEchoes();
  computeFields();
  updatePlates();
  stepPlayer();
  if (G.dead) { updateParticles(); return; }

  const p = G.p;
  if (p.y > H + 24 || p.y + PH < -24) { kill(); updateParticles(); return; }
  for (const sp of L.spikes) {
    if (overlap({ x: p.x + 2, y: p.y + 2, w: PW - 4, h: PH - 4 }, sp)) { kill(); updateParticles(); return; }
  }
  for (const th of L.thorns) {
    const lit = litPoint(th.cx, th.cy);
    if (lit && !th.lit) { SFX("wither"); burst(th.cx, th.cy - 4, 5, "#9fe3a0", 40, 0.5, 2, 0); }
    th.lit = lit;
    if (!lit && overlap({ x: p.x + 2, y: p.y + 2, w: PW - 4, h: PH - 4 }, th)) { kill(); updateParticles(); return; }
  }
  const pcx = p.x + PW / 2, pcy = p.y + PH / 2;
  for (const ln of L.lanterns) {
    if (!ln.got && Math.abs(pcx - ln.x) < 11 && Math.abs(pcy - ln.y) < 13) {
      ln.got = true;
      G.lanternsGot++;
      burst(ln.x, ln.y, 18, "#ffe08a", 90, 0.8, 2, -30);
      SFX("lantern");
    }
  }
  if (L.exit) {
    const ex = L.exit;
    if (pcx > ex.x && pcx < ex.x + ex.w && pcy > ex.y && pcy < ex.y + ex.h) win();
  }
  if (G.rec) {
    G.rec.trace.push({ x: p.x, y: p.y, f: p.face, s: playerState(p), g: p.g });
    if (G.rec.trace.length >= L.recMax * 60) {
      stopRec();
      updateParticles();
      return;
    }
  }
  G.t++;
  updateParticles();
}

// ---------------------------------------------------------------- public API
const Game = {
  load(which) {
    G.L = parseLevel(which);
    G.echoes = {};
    G.rec = null;
    G.sel = 0;
    G.deaths = 0;
    G.time = 0;
    G.timing = false;
    G.recCount = 0;
    G.lanternsGot = 0;
    G.won = false;
    G.winT = 0;
    G.swapCd = 0;
    G.notice = null;
    G.particles.length = 0;
    G.shake = 0;
    restartAttempt();
    Input.clear();
  },
  tick,
  restartAttempt,
};
