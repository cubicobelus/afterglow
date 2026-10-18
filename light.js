"use strict";

const SPAWN = { x: 40, y: 288 };
const RADIUS = 110;

const always = [
  { x: 0, y: 320, w: 130, h: 40 },
  { x: 510, y: 320, w: 130, h: 40 },
];
const lightOnly = [
  { x: 160, y: 280, w: 60, h: 12 },
  { x: 260, y: 230, w: 60, h: 12 },
  { x: 360, y: 190, w: 60, h: 12 },
  { x: 450, y: 250, w: 60, h: 12 },
];
const goal = { x: 596, y: 280, w: 24, h: 40 };

let player, solved;

function reset() {
  player = Core.makeBody(SPAWN.x, SPAWN.y);
  solved = false;
}

function lightPos() {
  if (Core.mouse.moved) return { x: Core.mouse.x, y: Core.mouse.y };
  return { x: player.x + player.w / 2, y: player.y + player.h / 2 };
}

// A platform exists if any part of it is inside the light circle.
function isLit(r, l) {
  const nx = Math.max(r.x, Math.min(l.x, r.x + r.w));
  const ny = Math.max(r.y, Math.min(l.y, r.y + r.h));
  return (nx - l.x) ** 2 + (ny - l.y) ** 2 <= RADIUS * RADIUS;
}

function update() {
  if (Core.wasPressed("KeyR")) reset();
  const l = lightPos();
  const solids = [...always, ...lightOnly.filter((p) => isLit(p, l))];
  Core.step(player, Core.input(), solids);
  if (player.y > Core.H + 100) reset();
  if (Core.overlaps(player, goal)) solved = true;
}

function draw(ctx) {
  const l = lightPos();
  ctx.fillStyle = "#07080d";
  ctx.fillRect(0, 0, Core.W, Core.H);

  ctx.fillStyle = "#1d2a1d";
  for (const p of always) ctx.fillRect(p.x, p.y, p.w, p.h);

  ctx.save();
  ctx.beginPath();
  ctx.arc(l.x, l.y, RADIUS, 0, Math.PI * 2);
  ctx.clip();
  const g = ctx.createRadialGradient(l.x, l.y, 10, l.x, l.y, RADIUS);
  g.addColorStop(0, "#3a3f52");
  g.addColorStop(1, "#12141c");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, Core.W, Core.H);
  ctx.fillStyle = "#7fd17a";
  for (const p of [...always, ...lightOnly]) ctx.fillRect(p.x, p.y, p.w, p.h);
  ctx.fillStyle = "#ffd84a";
  ctx.fillRect(goal.x, goal.y, 4, goal.h);
  ctx.fillRect(goal.x, goal.y, goal.w, 14);
  ctx.restore();

  ctx.fillStyle = "#d94f4f";
  ctx.fillRect(Math.round(player.x), Math.round(player.y), player.w, player.h);

  const lines = ["Move: arrows or WASD   Jump: space   Mouse: aim light   R: reset"];
  if (solved) lines.push("Solved!");
  Core.hud(ctx, lines);
}

reset();
Core.start(document.getElementById("game"), update, draw);
