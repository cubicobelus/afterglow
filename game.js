"use strict";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const GRAVITY = 1800;
const MOVE_SPEED = 220;
const JUMP_SPEED = 620;
const MAX_FALL = 900;

// Platforms: x, y, width, height
const platforms = [
  { x: 0, y: 320, w: 640, h: 40 },
  { x: 120, y: 250, w: 100, h: 16 },
  { x: 280, y: 190, w: 100, h: 16 },
  { x: 440, y: 130, w: 120, h: 16 },
];

const player = { x: 40, y: 280, w: 24, h: 32, vx: 0, vy: 0, onGround: false };

const keys = {};
window.addEventListener("keydown", (e) => {
  keys[e.code] = true;
  if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
});
window.addEventListener("keyup", (e) => { keys[e.code] = false; });

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function update(dt) {
  const left = keys.ArrowLeft || keys.KeyA;
  const right = keys.ArrowRight || keys.KeyD;
  const jump = keys.Space || keys.ArrowUp || keys.KeyW;

  player.vx = ((right ? 1 : 0) - (left ? 1 : 0)) * MOVE_SPEED;
  if (jump && player.onGround) {
    player.vy = -JUMP_SPEED;
    player.onGround = false;
  }
  player.vy = Math.min(player.vy + GRAVITY * dt, MAX_FALL);

  // Move one axis at a time so collisions resolve cleanly.
  player.x += player.vx * dt;
  for (const p of platforms) {
    if (overlaps(player, p)) {
      player.x = player.vx > 0 ? p.x - player.w : p.x + p.w;
    }
  }

  player.y += player.vy * dt;
  player.onGround = false;
  for (const p of platforms) {
    if (overlaps(player, p)) {
      if (player.vy > 0) {
        player.y = p.y - player.h;
        player.onGround = true;
      } else {
        player.y = p.y + p.h;
      }
      player.vy = 0;
    }
  }

  player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));
  if (player.y > canvas.height + 100) {
    player.x = 40; player.y = 280; player.vy = 0;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#3b6b3a";
  for (const p of platforms) ctx.fillRect(p.x, p.y, p.w, p.h);
  ctx.fillStyle = "#d94f4f";
  ctx.fillRect(Math.round(player.x), Math.round(player.y), player.w, player.h);
}

let last = performance.now();
function frame(now) {
  const dt = Math.min((now - last) / 1000, 1 / 30);
  last = now;
  update(dt);
  draw();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
