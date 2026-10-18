"use strict";

const SPAWN = { x: 40, y: 288 };
const MAX_REC = 8 * 60;
const IDLE = { left: false, right: false, jump: false };

const floor = { x: 0, y: 320, w: 640, h: 40 };
const door = { x: 420, y: 180, w: 20, h: 140 };
const plate = { x: 200, y: 312, w: 48, h: 8 };
const goal = { x: 570, y: 280, w: 24, h: 40 };

let player, ghost, ghostInputs, ghostIndex, rec, mode, solved, doorOpen;

function respawn() {
  player = Core.makeBody(SPAWN.x, SPAWN.y);
}

function resetAll() {
  respawn();
  ghost = null;
  ghostInputs = null;
  ghostIndex = 0;
  rec = [];
  mode = "play";
  solved = false;
  doorOpen = false;
}

function startRecording() {
  ghost = null;
  ghostInputs = null;
  rec = [];
  mode = "rec";
  respawn();
}

function stopRecording() {
  ghostInputs = rec;
  ghostIndex = 0;
  ghost = Core.makeBody(SPAWN.x, SPAWN.y);
  rec = [];
  mode = "play";
  respawn();
}

function update() {
  if (Core.wasPressed("KeyR")) resetAll();
  if (Core.wasPressed("KeyE")) {
    if (mode === "rec") stopRecording();
    else startRecording();
  }

  doorOpen = Core.overlaps(player, plate) || (ghost !== null && Core.overlaps(ghost, plate));
  const fixed = doorOpen ? [floor] : [floor, door];

  const inp = Core.input();
  if (mode === "rec") {
    rec.push(inp);
    if (rec.length >= MAX_REC) stopRecording();
  }

  if (ghost) {
    const gi = ghostIndex < ghostInputs.length ? ghostInputs[ghostIndex++] : IDLE;
    Core.step(ghost, gi, fixed);
  }
  // The ghost is a one-way platform: solid only when the player is above it.
  const ghostSolid = ghost && player.y + player.h <= ghost.y + 6;
  Core.step(player, inp, ghostSolid ? [...fixed, ghost] : fixed);

  if (Core.overlaps(player, goal)) solved = true;
}

function draw(ctx) {
  ctx.clearRect(0, 0, Core.W, Core.H);

  ctx.fillStyle = "#3b6b3a";
  ctx.fillRect(floor.x, floor.y, floor.w, floor.h);

  ctx.fillStyle = doorOpen ? "#e8d77a" : "#9a6b2f";
  ctx.fillRect(plate.x, plate.y, plate.w, plate.h);

  if (doorOpen) {
    ctx.strokeStyle = "rgba(154,107,47,0.6)";
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(door.x + 0.5, door.y + 0.5, door.w - 1, door.h - 1);
    ctx.setLineDash([]);
  } else {
    ctx.fillStyle = "#7a4a1f";
    ctx.fillRect(door.x, door.y, door.w, door.h);
  }

  ctx.fillStyle = "#f2c230";
  ctx.fillRect(goal.x, goal.y, 4, goal.h);
  ctx.fillRect(goal.x, goal.y, goal.w, 14);

  if (ghost) {
    ctx.fillStyle = "rgba(60,90,200,0.55)";
    ctx.fillRect(Math.round(ghost.x), Math.round(ghost.y), ghost.w, ghost.h);
  }
  ctx.fillStyle = "#d94f4f";
  ctx.fillRect(Math.round(player.x), Math.round(player.y), player.w, player.h);

  const lines = ["Move: arrows or WASD   Jump: space   E: record / stop   R: reset"];
  if (mode === "rec") lines.push("RECORDING " + (rec.length / 60).toFixed(1) + "s of 8s. Press E to stop and send your echo.");
  else if (!ghost) lines.push("Press E to record, then stand on the plate.");
  else lines.push("Echo is replaying. Press E to record a new one.");
  if (solved) lines.push("Solved!");
  Core.hud(ctx, lines);

  if (mode === "rec") {
    ctx.fillStyle = "#e33";
    ctx.beginPath();
    ctx.arc(Core.W - 20, 20, 7, 0, Math.PI * 2);
    ctx.fill();
  }
}

resetAll();
Core.start(document.getElementById("game"), update, draw);
