"use strict";

const SPAWN = { x: 40, y: 288 };
const THROW_SPEED = 640;
const MARKER_GRAVITY = 900;
const MARKER_SIZE = 12;

const solids = [
  { x: 0, y: 320, w: 160, h: 40 },
  { x: 480, y: 320, w: 160, h: 40 },
  { x: 300, y: 220, w: 40, h: 140 },
  { x: 520, y: 150, w: 120, h: 12 },
];
const goal = { x: 596, y: 110, w: 24, h: 40 };

let player, marker, solved;

function reset() {
  player = Core.makeBody(SPAWN.x, SPAWN.y);
  marker = { state: "none", x: 0, y: 0, vx: 0, vy: 0 };
  solved = false;
}

function throwVelocity() {
  const cx = player.x + player.w / 2;
  const cy = player.y + player.h / 2;
  const dx = Core.mouse.x - cx;
  const dy = Core.mouse.y - cy;
  const len = Math.hypot(dx, dy) || 1;
  return { x: cx, y: cy, vx: dx / len * THROW_SPEED, vy: dy / len * THROW_SPEED };
}

// One marker step. Returns "fly", "hit" or "out"; only updates the marker when it keeps flying.
function markerStep(m) {
  const vy = m.vy + MARKER_GRAVITY * Core.DT;
  const nx = m.x + m.vx * Core.DT;
  const ny = m.y + vy * Core.DT;
  const probe = { x: nx - MARKER_SIZE / 2, y: ny - MARKER_SIZE / 2, w: MARKER_SIZE, h: MARKER_SIZE };
  if (solids.some((s) => Core.overlaps(probe, s))) return "hit";
  m.x = nx;
  m.y = ny;
  m.vy = vy;
  if (nx < 0 || nx > Core.W || ny > Core.H + 50) return "out";
  return "fly";
}

function swapToMarker() {
  if (marker.state !== "landed") return;
  const old = { x: player.x, y: player.y };
  player.x = marker.x - player.w / 2;
  player.y = marker.y - player.h / 2;
  player.x = Math.max(0, Math.min(Core.W - player.w, player.x));
  let tries = 0;
  while (solids.some((s) => Core.overlaps(player, s)) && tries < 45) {
    player.y -= 2;
    tries++;
  }
  if (solids.some((s) => Core.overlaps(player, s))) {
    player.x = old.x;
    player.y = old.y;
    return;
  }
  player.vy = 0;
  marker.state = "none";
}

function update() {
  if (Core.wasPressed("KeyR")) reset();

  if (Core.wasClicked(0)) {
    const t = throwVelocity();
    marker = { state: "flying", x: t.x, y: t.y, vx: t.vx, vy: t.vy };
  }
  if (Core.wasClicked(2) || Core.wasPressed("KeyF")) swapToMarker();

  if (marker.state === "flying") {
    const r = markerStep(marker);
    if (r === "hit") marker.state = "landed";
    else if (r === "out") marker.state = "none";
  }

  Core.step(player, Core.input(), solids);
  if (player.y > Core.H + 100) reset();
  if (Core.overlaps(player, goal)) solved = true;
}

function draw(ctx) {
  ctx.clearRect(0, 0, Core.W, Core.H);

  ctx.fillStyle = "#3b6b3a";
  for (const s of solids) ctx.fillRect(s.x, s.y, s.w, s.h);

  ctx.fillStyle = "#f2c230";
  ctx.fillRect(goal.x, goal.y, 4, goal.h);
  ctx.fillRect(goal.x, goal.y, goal.w, 14);

  if (Core.mouse.moved && marker.state !== "flying") {
    const t = throwVelocity();
    const sim = { x: t.x, y: t.y, vx: t.vx, vy: t.vy };
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    for (let i = 0; i < 90; i++) {
      if (markerStep(sim) !== "fly") break;
      if (i % 4 === 0) ctx.fillRect(sim.x - 1.5, sim.y - 1.5, 3, 3);
    }
  }

  if (marker.state !== "none") {
    ctx.fillStyle = marker.state === "landed" ? "#ffe94a" : "#ffffff";
    ctx.fillRect(marker.x - MARKER_SIZE / 2, marker.y - MARKER_SIZE / 2, MARKER_SIZE, MARKER_SIZE);
    ctx.strokeStyle = "#222";
    ctx.strokeRect(marker.x - MARKER_SIZE / 2 + 0.5, marker.y - MARKER_SIZE / 2 + 0.5, MARKER_SIZE - 1, MARKER_SIZE - 1);
  }

  ctx.fillStyle = "#d94f4f";
  ctx.fillRect(Math.round(player.x), Math.round(player.y), player.w, player.h);

  const lines = ["Move: arrows or WASD   Jump: space   Click: throw marker   Right-click or F: swap   R: reset"];
  if (solved) lines.push("Solved!");
  Core.hud(ctx, lines);
}

reset();
Core.start(document.getElementById("game"), update, draw);
