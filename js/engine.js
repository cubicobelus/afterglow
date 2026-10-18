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

const KINDS = {
  shade: { name: "SHADE", color: "#8fb4ff", blurb: "HOLDS PLATES AND IS SOLID TO STAND ON." },
  glow: { name: "GLOW", color: "#ffc857", blurb: "CARRIES LIGHT. SHADOW PLANKS HOLD IN IT AND THORNS WITHER." },
  phase: { name: "PHASE", color: "#c78bff", blurb: "CRYSTAL FADES AWAY AROUND IT." },
  flip: { name: "FLIP", color: "#4fe3c1", blurb: "REVERSES GRAVITY AROUND IT." },
};
const PLATE_COLORS = { a: "#4fd1ff", b: "#ffb347", c: "#ff6fae", d: "#9cff6f" };

// ---------------------------------------------------------------- input
const Input = (() => {
  const down = {}, pressed = {};
  const GAME_KEYS = ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Tab"];
  const LEFT = ["ArrowLeft", "KeyA"], RIGHT = ["ArrowRight", "KeyD"];
  const JUMP_KEYS = ["Space", "ArrowUp", "KeyW"];
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
    down, pressed, JUMP_KEYS,
    left: () => any(LEFT),
    right: () => any(RIGHT),
    jump: () => any(JUMP_KEYS),
    hit(code) { const v = !!pressed[code]; pressed[code] = false; return v; },
    hitAny(codes) { let v = false; for (const c of codes) { if (pressed[c]) { v = true; pressed[c] = false; } } return v; },
    clear() { for (const k in pressed) pressed[k] = false; },
  };
})();

const SFX = (name, arg) => { if (typeof Sfx !== "undefined") Sfx.play(name, arg); };

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
  lights: [], flips: [], phases: [],
  dead: false, deadT: 0, won: false, winT: 0,
  deaths: 0, time: 0, recCount: 0, swapCd: 0,
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

function parseLevel(idx) {
  const def = LEVELS[idx];
  const g = makeGrid();
  def.build(g);
  const rows = g.rows();
  const L = {
    idx, def, name: def.name, chapter: def.chapter, dark: !!def.dark,
    echoes: def.echoes || [], recMax: def.recMax || 10, swap: !!def.swap, hint: def.hint || "",
    rows, walls: [], doorTiles: [], plates: [], planks: [], crystals: [], spikes: [], thorns: [], lamps: [],
    spawn: { x: 40, y: 100 }, exit: null, doorOpen: {}, hasDoor: {},
  };
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
      else if (ch >= "A" && ch <= "D") {
        const id = ch.toLowerCase();
        L.doorTiles.push({ id, x, y, w: TILE, h: TILE, door: true, amt: 0, tx: c, ty: r });
        L.hasDoor[id] = true;
      } else if (ch === "L") L.lamps.push({ x: x + 10, y: y + 10, tx: c, ty: r });
      else if (ch === "@") L.spawn = { x: x + (TILE - PW) / 2, y: y + TILE - PH };
      else if (ch === "X") {
        ex0 = Math.min(ex0, x); ey0 = Math.min(ey0, y); ex1 = Math.max(ex1, x + TILE); ey1 = Math.max(ey1, y + TILE);
      }
    }
  }
  if (ex1 > 0) L.exit = { x: ex0, y: ey0, w: ex1 - ex0, h: ey1 - ey0 };
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
  G.lights = L.lamps.map((l) => ({ x: l.x, y: l.y, r: LAMP_R }));
  G.flips = [];
  G.phases = [];
  // Echo powers switch on only once the echo has come to rest, growing in over a short ramp.
  const e = G.echoes;
  const power = (echo) => (echo.moving ? 0 : Math.min(1, (echo.restT + 1) / RAMP));
  if (e.glow && power(e.glow) > 0) G.lights.push({ x: e.glow.x + PW / 2, y: e.glow.y + PH / 2, r: GLOW_R * power(e.glow), echo: true });
  if (e.flip && power(e.flip) > 0) G.flips.push({ x: e.flip.x + PW / 2, y: e.flip.y + PH / 2, r: FLIP_R * power(e.flip) });
  if (e.phase && power(e.phase) > 0) G.phases.push({ x: e.phase.x + PW / 2, y: e.phase.y + PH / 2, r: PHASE_R * power(e.phase) });
}

// ---------------------------------------------------------------- echoes
function makeEcho(kind, trace) {
  const s = trace[0];
  return { kind, trace, x: s.x, y: s.y, px: s.x, py: s.y, dx: 0, dy: 0, face: s.f, st: s.s, g: s.g, frozen: null, i: 0, moving: true, restT: 0 };
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
    } else {
      const i = Math.min(G.t, e.trace.length - 1);
      const s = e.trace[i];
      e.x = s.x; e.y = s.y; e.face = s.f; e.st = s.s; e.g = s.g; e.i = i;
      e.moving = G.t < e.trace.length - 1;
    }
    e.dx = e.x - e.px;
    e.dy = e.y - e.py;
    e.restT = e.moving ? 0 : e.restT + 1;
  }
}

// ---------------------------------------------------------------- attempt / recording flow
function restartAttempt() {
  const L = G.L, s = L.spawn;
  G.t = 0;
  G.dead = false;
  G.deadT = 0;
  G.p = { x: s.x, y: s.y, w: PW, h: PH, vx: 0, vy: 0, onGround: false, face: 1, coy: 0, buf: 0, jumping: false, stand: null, g: 1, sq: 0 };
  placeEchoes();
  computeFields();
}

function cancelRec() {
  const r = G.rec;
  if (!r) return;
  G.rec = null;
  if (r.prev) G.echoes[r.kind] = r.prev;
}

function startRec() {
  const L = G.L;
  const kind = L.echoes[G.sel];
  if (!kind) return;
  const prev = G.echoes[kind];
  delete G.echoes[kind];
  G.rec = { kind, trace: [], prev };
  restartAttempt();
  SFX("recStart");
}

function stopRec() {
  const r = G.rec;
  if (!r) return;
  G.rec = null;
  if (r.trace.length >= MIN_REC) {
    G.echoes[r.kind] = makeEcho(r.kind, r.trace);
    G.recCount++;
    SFX("recStop", r.kind);
    const s0 = G.L.spawn;
    burst(s0.x + PW / 2, s0.y + PH / 2, 16, KINDS[r.kind].color, 80, 0.6, 2, -20);
  } else {
    if (r.prev) G.echoes[r.kind] = r.prev;
    SFX("cancel");
  }
  restartAttempt();
}

function clearSelected() {
  const kind = G.L.echoes[G.sel];
  if (kind && G.echoes[kind] && !G.rec) {
    delete G.echoes[kind];
    SFX("cancel");
    restartAttempt();
  }
}

function doSwap() {
  const L = G.L, p = G.p;
  const kind = L.echoes[G.sel];
  const e = kind && G.echoes[kind];
  if (!e || G.swapCd > 0 || (G.rec && G.rec.kind === kind)) { SFX("nope"); return; }
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
  const jumpPressed = Input.hitAny(Input.JUMP_KEYS);

  let acc = p.onGround ? (dir ? ACC_G : DEC_G) : (dir ? ACC_A : DEC_A);
  if (dir && p.vx * dir < 0) acc *= 1.7;
  const target = dir * RUN;
  if (p.vx < target) p.vx = Math.min(target, p.vx + acc * DT);
  else if (p.vx > target) p.vx = Math.max(target, p.vx - acc * DT);
  if (dir) p.face = dir;

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
  p.vy = Math.max(-MAXFALL, Math.min(MAXFALL, p.vy));

  if (p.stand) { p.x += p.stand.dx; p.y += p.stand.dy; }
  p.stand = null;

  const solids = buildSolids(p, true, g);

  p.x += p.vx * DT;
  if (p.vx !== 0) {
    for (const s of solids) {
      if (s.ow) continue;
      if (overlap(p, s)) p.x = p.vx > 0 ? s.x - PW : s.x + s.w;
    }
  }

  const vyBefore = p.vy;
  p.y += p.vy * DT;
  let hitDown = false, hitUp = false;
  for (const s of solids) {
    if (!overlap(p, s)) continue;
    if (s.ow) {
      if (g > 0 ? p.vy >= 0 : p.vy <= 0) {
        if (g > 0) { p.y = s.y - PH; hitDown = true; } else { p.y = s.y + s.h; hitUp = true; }
        p.vy = 0;
        p.stand = s.src;
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
    for (const b of bodies) {
      if (b.x < pl.x + pl.w && b.x + PW > pl.x && b.y < pl.y + pl.h && b.y + PH > pl.y) { on = true; break; }
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
  if (Input.hit("KeyR")) {
    if (G.rec) { cancelRec(); SFX("cancel"); }
    restartAttempt();
  }
  const n = L.echoes.length;
  // The selected slot is both what E records and what Q swaps with, so it can change while recording.
  for (let i = 0; i < n; i++) {
    if (Input.hit("Digit" + (i + 1)) || Input.hit("Numpad" + (i + 1))) { G.sel = i; SFX("ui"); }
  }
  if (!G.rec && Input.hit("KeyX")) clearSelected();
  if (n && Input.hit("KeyE")) {
    if (G.rec) stopRec();
    else startRec();
  }
  if (L.swap && Input.hitAny(["KeyQ", "ShiftLeft", "ShiftRight"])) doSwap();
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
  G.time += DT;
  if (G.swapCd > 0) G.swapCd--;
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
  if (L.exit) {
    const ex = L.exit;
    const pcx = p.x + PW / 2, pcy = p.y + PH / 2;
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
  load(idx) {
    G.L = parseLevel(idx);
    G.echoes = {};
    G.rec = null;
    G.sel = 0;
    G.deaths = 0;
    G.time = 0;
    G.recCount = 0;
    G.won = false;
    G.winT = 0;
    G.swapCd = 0;
    G.particles.length = 0;
    G.shake = 0;
    restartAttempt();
    Input.clear();
  },
  tick,
  restartAttempt,
};
