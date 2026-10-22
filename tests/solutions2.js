"use strict";

// Scripted solutions for the levels added in the second build (tiers 4 and 5 fill-in, and page two). Same rules as solutions.js.

// Record a stationary echo: walk to x (a player centre), wait a moment, stop.
const recWait = (slot, x, wait, tol) => {
  Bot.record(slot);
  Bot.walkTo(x, tol || 3);
  Bot.run(wait === undefined ? 10 : wait);
  Bot.stop();
};
// Wait for an echo to be at rest long enough for its power to be at full strength.
const settle = (key, ticks) => Bot.waitUntil(() => G.echoes[key] && G.echoes[key].restT > (ticks || 40), 1200, "the " + key + " to settle");
// Hold the jump key for `hold` ticks while steering toward x (a player centre), then land.
const hop = (x, hold) => Bot.jumpTo(x, hold === undefined ? 24 : hold);

// ================================================================ tier 4: the beacon (calm)
SOLUTIONS["STILL AIR"] = () => {
  // The vent past the gap blows back anyone in the air. A calm by the edge silences it inside its ring.
  recWait("calm", 190, 12);
  settle("calm");
  Bot.walkTo(190, 3);
  hop(270, 24);
  Bot.expect(G.p.onGround && Bot.px() > 250, "across the gap");
  Bot.walkTo(570);
};

// Walk to x through a vent: Bot.walkTo brakes too early when the wind holds you back, so hold the key until you are close.
const walkThrough = (x, tol) => {
  tol = tol || 4;
  for (let i = 0; i < 900; i++) {
    if (G.dead) Bot.fail("player died");
    const dx = x - Bot.px();
    if (Math.abs(dx) <= tol) break;
    Bot.dir(Math.sign(dx));
    Bot.tick();
  }
  Bot.dir(0);
  Bot.run(8);
};

// Catch an echo that waits at the spawn: hop up and land on its head, then stay put and be carried.
const board = (key) => {
  Bot.run(4);
  Bot.jumpTo(Bot.px(), 14);
  Bot.expect(G.p.stand === G.echoes[key], "standing on the " + key);
};

SOLUTIONS["SLACK WATER"] = () => {
  // Calm at the first gap, then a shade that waits at the spawn, crosses the gap and stands on the plate. The shade carries you across
  // again, so the calm slot is free for the second gap.
  recWait("calm", 108, 12);
  Bot.record("shade");
  Bot.run(40);
  Bot.walkTo(108, 4);
  Bot.run(8);
  Bot.dir(1);
  Bot.jumpKey(true);
  for (let i = 0; i < 160; i++) { if (i === 24) Bot.jumpKey(false); Bot.tick(); if (G.dead) Bot.fail("fell in the first gap"); if (G.p.onGround && i > 10) break; }
  Bot.dir(0);
  Bot.expect(Bot.px() > 170, "on the island");
  walkThrough(230);
  Bot.run(20);
  Bot.stop();
  Bot.record("calm");
  board("shade");
  Bot.waitUntil(() => !G.echoes.shade.moving, 900, "the shade to reach the plate");
  Bot.walkTo(288, 3);
  Bot.run(14);
  Bot.stop();
  board("shade");
  Bot.waitUntil(() => !G.echoes.shade.moving, 900, "the shade to reach the plate");
  settle("calm");
  Bot.walkTo(288, 3);
  Bot.dir(1);
  Bot.jumpKey(true);
  for (let i = 0; i < 160; i++) { if (i === 24) Bot.jumpKey(false); Bot.tick(); if (G.dead) Bot.fail("fell in the second gap"); if (G.p.onGround && i > 10) break; }
  Bot.dir(0);
  Bot.expect(Bot.px() > 340, "across the second gap");
  Bot.walkTo(570);
};

// ================================================================ tier 5: the mirror (puppet)
SOLUTIONS["REFLECTION"] = () => {
  // Walk right a little: the puppet starts in the sealed room and walks left onto the plate.
  recWait("mirror", 110, 10);
  Bot.waitUntil(() => G.L.doorOpen.a, 900, "the puppet to press the plate");
  Bot.walkTo(396);
};

// Hang an echo in the air at x (a player centre): jump straight up there and stop recording on the way down, when the feet are
// between lo and hi pixels above the floor (row 15, y 300).
const hoverAt = (slot, x, lo, hi) => {
  Bot.record(slot);
  Bot.walkTo(x, 3);
  Bot.jumpKey(true);
  let found = false;
  for (let i = 0; i < 90; i++) {
    Bot.tick();
    if (G.dead) Bot.fail("died while hovering");
    const h = 300 - Bot.feet();
    if (i > 8 && G.p.vy > 0 && h <= hi && h >= lo) { found = true; break; }
  }
  Bot.expect(found, "a hover window at x " + x);
  Bot.jumpKey(false);
  Bot.stop();
};

SOLUTIONS["OTHER SIDE"] = () => {
  // The near block is 100 px tall: a shade hung against it is the step. Stand on top of the block while recording the puppet:
  // it stands at the same height on the far block, on the plate, and the door opens.
  hoverAt("shade", 100, 34, 44);
  settle("shade", 30);
  const up = () => {
    const e = G.echoes.shade;
    Bot.walkTo(e.x + 6 - 24, 3);
    Bot.jumpTo(e.x + 6, 24);
    Bot.expect(G.p.stand === e, "standing on the step");
    Bot.jumpTo(150, 26);
    Bot.expect(G.p.onGround && G.p.y < 190 && Bot.px() > 124, "on top of the near block");
  };
  Bot.record("mirror");
  settle("shade", 30);
  up();
  Bot.walkTo(150, 3);
  Bot.run(20);
  Bot.stop();
  settle("shade", 30);
  up();
  Bot.walkTo(150, 3);
  Bot.waitUntil(() => G.L.doorOpen.a, 1200, "the puppet to reach the far plate");
  Bot.jumpTo(224, 20);
  Bot.walkTo(366);
};

SOLUTIONS["STEP THROUGH"] = () => {
  // The puppet is already on the far side of the wall. Stand on the plate and swap with it: you land on the other side, and the
  // puppet stays on the plate and holds the door open.
  recWait("mirror", 170, 10);
  Bot.walkTo(170, 3);
  Bot.waitUntil(() => G.echoes.mirror.restT > 12, 900, "the puppet to arrive");
  Bot.swap();
  Bot.expect(Bot.px() > 340, "on the far side of the wall");
  Bot.waitUntil(() => G.L.doorOpen.a, 300, "the door to open");
  Bot.walkTo(570);
};
