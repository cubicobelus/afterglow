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

// ================================================================ tier 6: the shallows (beam, reflector)
SOLUTIONS["SHAFT"] = () => {
  // A beam recorded facing the thorns lights the whole bed.
  recWait("beam", 130, 10);
  settle("beam", 30);
  Bot.walkTo(130, 3);
  Bot.dir(1);
  for (let i = 0; i < 700 && !G.won; i++) { Bot.tick(); if (G.dead) Bot.fail("died on the thorns"); }
  Bot.dir(0);
  Bot.expect(G.won, "across the thorns");
};
SOLUTIONS["TURRET"] = () => {
  // Stand in the beam from the ceiling facing left (a backslash) and it turns toward the gate.
  Bot.record("reflector");
  Bot.walkTo(424, 3);
  Bot.dir(-1);
  for (let i = 0; i < 100 && Bot.px() > 411; i++) Bot.tick();
  Bot.dir(0);
  Bot.run(10);
  Bot.stop();
  settle("reflector", 30);
  Bot.waitUntil(() => G.L.gates.some((g) => g.open), 300, "the gate to open");
  Bot.walkTo(570);
};
SOLUTIONS["WELLSPRING"] = () => {
  // Ride the bubbles to the top of the column, drift onto the ledge and record the beam up there, facing the gate.
  const rise = () => {
    Bot.walkTo(170, 3);
    Bot.waitUntil(() => G.p.y + PH < 185, 600, "to be lifted");
    Bot.run(8);
    Bot.dir(1);
    for (let i = 0; i < 200 && !(G.p.onGround && G.p.y + PH < 190); i++) Bot.tick();
    Bot.dir(0);
    Bot.expect(G.p.onGround && G.p.y + PH < 190, "on the ledge");
  };
  Bot.record("beam");
  rise();
  Bot.walkTo(340, 3);
  Bot.run(14);
  Bot.stop();
  rise();
  Bot.walkTo(340, 3);
  Bot.waitUntil(() => G.L.gates.some((g) => g.open), 900, "the gate to open");
  Bot.walkTo(570);
};
SOLUTIONS["HATCH"] = () => {
  // A beam along the floor, and a reflector facing right (a slash) under the hatch turns it up.
  recWait("beam", 100, 10);
  recWait("reflector", 290, 10);
  settle("beam", 30);
  settle("reflector", 30);
  Bot.waitUntil(() => G.L.gates.some((g) => g.open), 300, "the hatch to open");
  Bot.walkTo(290, 3);
  Bot.jumpTo(336, 28);
  Bot.expect(G.p.onGround && G.p.y + PH < 245, "up through the hatch");
  Bot.walkTo(570);
};
SOLUTIONS["GRAZE"] = () => {
  // Hang the beam in the air at the height of the planks (about 50 px up), left of the ledge, facing the bridge.
  hoverAt("beam", 82, 43, 55);
  settle("beam", 30);
  Bot.walkTo(92, 3);
  Bot.jumpTo(128, 24);
  Bot.expect(G.p.onGround && G.p.y + PH < 265, "on the ledge");
  Bot.jumpTo(172, 14);
  Bot.expect(G.p.onGround && G.p.y + PH < 245, "up on the planks");
  Bot.walkTo(570);
};
SOLUTIONS["STAIRWELL"] = () => {
  // Ride the bubbles to the ledge. The wall beam crosses it at the height of a standing reflector: facing right, it turns the beam up
  // into the hatch.
  const rise = () => {
    Bot.walkTo(170, 3);
    Bot.waitUntil(() => G.p.y + PH < 185, 600, "to be lifted");
    Bot.run(8);
    Bot.dir(1);
    for (let i = 0; i < 200 && !(G.p.onGround && G.p.y + PH < 190); i++) Bot.tick();
    Bot.dir(0);
    Bot.expect(G.p.onGround && G.p.y + PH < 190, "on the ledge");
  };
  Bot.record("reflector");
  rise();
  Bot.walkTo(450, 3);
  Bot.run(12);
  Bot.stop();
  rise();
  Bot.walkTo(450, 3);
  Bot.waitUntil(() => G.L.gates.some((g) => g.open), 900, "the hatch to open");
  Bot.jumpTo(472, 28);
  Bot.expect(G.p.onGround && G.p.y + PH < 125, "up through the hatch");
  Bot.walkTo(570);
};
SOLUTIONS["SURFACE LIGHT"] = () => {
  // Ride the bubbles up the light shaft. At the top, face left and record a reflector: it turns the shaft toward the gate.
  const rise = () => {
    Bot.walkTo(170, 3);
    Bot.waitUntil(() => G.p.y + PH < 185, 600, "to be lifted");
    Bot.run(8);
  };
  Bot.record("reflector");
  rise();
  Bot.dir(-1);
  Bot.run(2);
  Bot.dir(0);
  Bot.run(12);
  Bot.stop();
  rise();
  Bot.waitUntil(() => G.L.gates.every((g) => g.open), 900, "the gate to open");
  Bot.dir(1);
  for (let i = 0; i < 160 && Bot.px() < 232; i++) Bot.tick();
  Bot.dir(0);
  Bot.walkTo(570);
};

// Hang an echo in the air above a surface whose top is at baseY, at x (a player centre): jump straight up and stop recording on the way
// down, when the feet are between lo and hi pixels above that surface. Starts from where the player stands (no walking).
const hoverHere = (slot, lo, hi, baseY) => {
  Bot.record(slot);
  Bot.dir(0);
  Bot.jumpKey(true);
  let found = false;
  for (let i = 0; i < 90; i++) {
    Bot.tick();
    if (G.dead) Bot.fail("died while hovering");
    const h = baseY - Bot.feet();
    if (i > 8 && G.p.vy > 0 && h <= hi && h >= lo) { found = true; break; }
  }
  Bot.expect(found, "a hover window");
  Bot.jumpKey(false);
  Bot.stop();
};

SOLUTIONS["TWO TIERS"] = () => {
  // Beam one hangs beside the first bridge. Beam two is recorded standing on the middle block, hung at the height of the second bridge.
  hoverAt("beam", 82, 43, 55);
  settle("beam", 30);
  const toMiddle = () => {
    Bot.walkTo(92, 3);
    Bot.jumpTo(128, 24);
    Bot.jumpTo(172, 14);
    Bot.walkTo(318, 3);
  };
  Bot.record("beam2");
  settle("beam", 30);
  toMiddle();
  Bot.walkTo(314, 3);
  Bot.jumpKey(true);
  let found = false;
  for (let i = 0; i < 90; i++) {
    Bot.tick();
    if (G.dead) Bot.fail("died while hovering");
    const h = 240 - Bot.feet();
    if (i > 8 && G.p.vy > 0 && h <= 36 && h >= 22) { found = true; break; }
  }
  Bot.expect(found, "a hover window above the middle block");
  Bot.jumpKey(false);
  Bot.stop();
  settle("beam", 30);
  settle("beam2", 30);
  toMiddle();
  Bot.jumpTo(352, 24);
  Bot.expect(G.p.onGround && G.p.y + PH < 205, "up on the second bridge");
  Bot.walkTo(570);
};
SOLUTIONS["OPEN DOOR"] = () => {
  // The beam stands on the plate facing the door: it holds the door open, and its light goes through to the thorns.
  recWait("beam", 150, 12);
  settle("beam", 30);
  Bot.waitUntil(() => G.L.doorOpen.a, 300, "the door to open");
  Bot.walkTo(240, 3);
  Bot.dir(1);
  for (let i = 0; i < 700 && !G.won; i++) { Bot.tick(); if (G.dead) Bot.fail("died on the thorns"); }
  Bot.dir(0);
  Bot.expect(G.won, "across the thorns");
};

// The lab room for the calm is the same room as Still Air.
SOLUTIONS["CALM"] = SOLUTIONS["STILL AIR"];

// ================================================================ tier 7: the wreck (pull, cargo platforms)
SOLUTIONS["GRAPPLE"] = SOLUTIONS["PULL"];
SOLUTIONS["THE LONG HAUL"] = () => {
  // Ride the platform to its far end, jump off and stop recording at the top of the jump: the pull hangs there. Then ride and jump the
  // same way: the pull catches you in mid air and holds you while you drift out toward the far bank.
  const ride = () => {
    Bot.walkTo(130, 4);
    Bot.waitUntil(() => G.t > 190, 600, "the platform to reach the far end");
  };
  Bot.record("pull");
  ride();
  Bot.dir(1);
  Bot.jumpKey(true);
  for (let i = 0; i < 18; i++) { if (i === 22) Bot.jumpKey(false); Bot.tick(); if (G.dead) Bot.fail("fell"); }
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.stop();
  ride();
  Bot.dir(1);
  Bot.jumpKey(true);
  for (let i = 0; i < 200; i++) {
    if (i === 22) Bot.jumpKey(false);
    Bot.tick();
    if (G.dead) Bot.fail("fell into the pit");
    if (i > 24 && G.p.onGround && Bot.px() > 370) break;
  }
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.expect(G.p.onGround && Bot.px() > 362, "across the pit");
  Bot.walkTo(570);
};
SOLUTIONS["HOIST"] = () => {
  // Ride the lift up and, while it waits at the top, jump and stop recording a shade 40 px above it. The lift goes back down but the shade
  // stays: from the top of the lift you can step up onto it, and from it up onto the ledge.
  const ride = () => {
    Bot.walkTo(172, 4);
    Bot.walkTo(208, 3);
    Bot.waitUntil(() => G.t > 320, 800, "the lift to reach the top");
  };
  Bot.record("shade");
  ride();
  Bot.jumpKey(true);
  let found = false;
  for (let i = 0; i < 90; i++) {
    Bot.tick();
    if (G.dead) Bot.fail("fell");
    const h = 160 - Bot.feet();
    if (i > 8 && G.p.vy > 0 && h <= 44 && h >= 32) { found = true; break; }
  }
  Bot.expect(found, "a hover window above the lift");
  Bot.jumpKey(false);
  Bot.stop();
  ride();
  settle("shade", 30);
  const e = G.echoes.shade;
  Bot.jumpTo(e.x + 6, 22);
  Bot.expect(G.p.stand === e, "standing on the shade");
  Bot.jumpTo(262, 26);
  Bot.expect(G.p.onGround && G.p.y + PH < 85, "up on the ledge");
  Bot.walkTo(570);
};
SOLUTIONS["BOUNCE WELL"] = () => {
  // A spring at the edge, a bounce held to the top, and a pull recorded at the top of the bounce: it holds you there while you drift
  // over to the ledge.
  const bounce = (stopAtApex) => {
    settle("spring", 30);
    Bot.walkTo(100, 3);
    Bot.jumpKey(true);
    let bounced = false;
    for (let i = 0; i < 160; i++) {
      if (!bounced && G.p.vy < -600) { bounced = true; Bot.dir(1); }
      if (bounced && stopAtApex && G.p.vy > -30) { Bot.jumpKey(false); Bot.dir(0); Bot.stop(); return; }
      Bot.tick();
      if (G.dead) Bot.fail("fell");
      if (bounced && !stopAtApex && i > 60 && G.p.onGround) break;
    }
    Bot.jumpKey(false);
    Bot.dir(0);
  };
  recWait("spring", 100, 12);
  Bot.record("pull");
  bounce(true);
  Bot.expect(G.echoes.pull, "the pull recorded");
  bounce(false);
  Bot.expect(G.p.onGround && Bot.px() > 250, "up on the ledge");
  Bot.walkTo(570);
};
SOLUTIONS["SLOW BOAT"] = () => {
  // Wait for the platform at the near end, ride it across, step off.
  Bot.walkTo(150, 4);
  Bot.waitUntil(() => G.t > 310, 800, "the platform to cross");
  Bot.walkTo(570);
};
SOLUTIONS["CRANE"] = () => {
  // Ride the platform over and walk to the plate on the far side; the shade stays there and holds the door back home.
  Bot.record("shade");
  Bot.walkTo(262, 4);
  Bot.waitUntil(() => G.t > 250, 900, "the platform to cross");
  Bot.walkTo(490, 3);
  Bot.run(20);
  Bot.stop();
  Bot.waitUntil(() => G.L.doorOpen.a, 900, "the shade to reach the plate");
  Bot.walkTo(44);
};
SOLUTIONS["WINDLASS"] = () => {
  // The first pull hangs at the top of a jump from the edge. The second is recorded where the first one lets go of you: walk into the
  // first well, which lifts you and carries you, drift out of it, and stop in mid air. Each well reaches about 96 px, together they reach
  // the far bank.
  Bot.record("pull");
  Bot.walkTo(112, 3);
  Bot.dir(1);
  Bot.jumpKey(true);
  for (let i = 0; i < 24; i++) { if (i === 22) Bot.jumpKey(false); Bot.tick(); }
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.stop();
  settle("pull", 30);
  const A = G.echoes.pull;
  const ax = A.x + 6, ay = A.y + 8;
  Bot.record("pull2");
  settle("pull", 30);
  Bot.dir(1);
  let stopped = false;
  for (let i = 0; i < 600; i++) {
    Bot.tick();
    if (G.dead) Bot.fail("fell into the pit");
    if (Bot.px() > ax && Math.hypot(Bot.px() - ax, G.p.y + 8 - ay) > 92) { stopped = true; break; }
  }
  Bot.expect(stopped, "to leave the first well");
  Bot.dir(0);
  Bot.stop();
  settle("pull", 30);
  settle("pull2", 30);
  Bot.dir(1);
  for (let i = 0; i < 900; i++) {
    Bot.tick();
    if (G.dead) Bot.fail("fell into the pit");
    if (G.p.onGround && Bot.px() > 345) break;
  }
  Bot.dir(0);
  Bot.expect(G.p.onGround && Bot.px() > 345, "across the pit");
  Bot.walkTo(570);
};
SOLUTIONS["DELIVERY"] = () => {
  // Ride the platform across and record the spring at the foot of the wall: it stays there. Then ride across again and bounce up the wall.
  const cross = () => {
    Bot.walkTo(150, 4);
    Bot.waitUntil(() => G.t > 310, 900, "the platform to cross");
  };
  Bot.record("spring");
  cross();
  Bot.walkTo(452, 3);
  Bot.run(12);
  Bot.stop();
  cross();
  Bot.walkTo(452, 3);
  settle("spring", 30);
  Bot.jumpKey(true);
  let bounced = false;
  for (let i = 0; i < 200; i++) {
    if (!bounced && G.p.vy < -600) { bounced = true; Bot.dir(1); }
    Bot.tick();
    if (G.dead) Bot.fail("fell");
    if (bounced && i > 60 && G.p.onGround) break;
  }
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.expect(G.p.onGround && G.p.y + PH < 125, "up on the wall");
  Bot.walkTo(570);
};

// ================================================================ tier 8: the garden (vine, mushrooms, roots)
SOLUTIONS["SPROUT"] = SOLUTIONS["VINE"];
SOLUTIONS["SPORE LIFT"] = () => {
  // A running jump from the spawn lands on the mushroom with the jump key held: a big bounce. Stop recording a shade on the way down at the
  // end of it. Bounce again a moment later and land on the shade, then jump from it onto the wall.
  const bounce = (delay, stopWhen) => {
    for (let i = 0; i < delay; i++) Bot.tick();
    Bot.dir(1);
    Bot.jumpKey(true);
    let bounced = false;
    for (let i = 0; i < 300; i++) {
      if (G.p.vy < -600) bounced = true;
      if (stopWhen && bounced && stopWhen()) { Bot.jumpKey(false); Bot.dir(0); Bot.stop(); return true; }
      Bot.tick();
      if (G.dead) Bot.fail("fell");
      if (G.p.stand && G.p.stand.kind === "shade") return true;
    }
    return false;
  };
  Bot.record("shade");
  Bot.expect(bounce(0, () => G.p.vy > 0 && G.p.y + PH >= 142 && Bot.px() > 225), "a shade hung at the end of the bounce");
  settle("shade", 30);
  Bot.run(2);
  Bot.expect(bounce(10), "landing on the shade");
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.jumpTo(300, 24);
  Bot.expect(G.p.onGround && G.p.y + PH < 85, "up on the wall");
  Bot.walkTo(570);
};
SOLUTIONS["ROOTWALK"] = () => {
  // Hop from root ledge to root ledge without stopping.
  Bot.walkTo(126, 3);
  Bot.jumpTo(180, 20);
  Bot.expect(G.p.onGround && G.p.y + PH < 265, "on the first roots");
  Bot.jumpTo(262, 22);
  Bot.expect(G.p.onGround && G.p.y + PH < 245, "on the second roots");
  Bot.jumpTo(342, 20);
  Bot.expect(G.p.onGround && G.p.y + PH < 265, "on the third roots");
  Bot.jumpTo(422, 22);
  Bot.expect(G.p.onGround && G.p.y + PH < 245, "on the fourth roots");
  Bot.jumpTo(498, 20);
  Bot.walkTo(570);
};

// Climb a vine: stand at its column, hold jump, and step sideways onto the ledge when the feet reach topY.
const climbVine = (vineKey, topY, sideDir) => {
  const v = () => G.vines.find((q) => q.echo === G.echoes[vineKey]);
  Bot.waitUntil(() => v() && v().base - v().top >= 118, 600, "the " + vineKey + " to grow");
  Bot.walkTo(v().x, 2);
  Bot.jumpKey(true);
  for (let i = 0; i < 500; i++) {
    Bot.dir(Bot.feet() <= topY + 10 ? sideDir : 0);
    Bot.tick();
    if (G.dead) Bot.fail("fell off the vine");
    if (G.p.onGround && Bot.feet() <= topY + 1) break;
  }
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.expect(G.p.onGround && Bot.feet() <= topY + 1, "on the ledge at " + topY);
};

SOLUTIONS["TWO VINES"] = () => {
  // The first vine takes you to the shelf, where the second one is recorded. Both stay: the second grows up from the shelf.
  recWait("vine", 328, 12);
  Bot.record("vine2");
  climbVine("vine", 180, 1);
  Bot.walkTo(408, 3);
  Bot.run(14);
  Bot.stop();
  climbVine("vine", 180, 1);
  climbVine("vine2", 80, 1);
  Bot.walkTo(570);
};

SOLUTIONS["HANGING VINE"] = () => {
  // Jump onto the roots and record the vine at the wall within the time they hold. Later, wait for the vine to grow, hop onto the roots and
  // climb at once.
  Bot.record("vine");
  Bot.walkTo(176, 3);
  Bot.jumpTo(224, 22);
  Bot.expect(G.p.onGround && Bot.feet() < 245, "on the roots");
  Bot.walkTo(268, 3);
  Bot.stop();
  Bot.waitUntil(() => G.vines.length && G.vines[0].base - G.vines[0].top >= 118, 600, "the vine to grow");
  Bot.walkTo(176, 3);
  Bot.jumpTo(224, 22);
  Bot.walkTo(268, 3);
  Bot.jumpKey(true);
  for (let i = 0; i < 400; i++) {
    Bot.dir(Bot.feet() <= 130 ? 1 : 0);
    Bot.tick();
    if (G.dead) Bot.fail("fell off the vine");
    if (G.p.onGround && Bot.feet() <= 121) break;
  }
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.expect(G.p.onGround && Bot.feet() <= 121, "up on the wall");
  Bot.walkTo(570);
};
SOLUTIONS["GREEN DARK"] = () => {
  // The vine takes you to the ledge; the glow is recorded up there beside the thorn bed, and lights it.
  recWait("vine", 388, 12);
  Bot.record("glow");
  climbVine("vine", 180, 1);
  Bot.walkTo(412, 3);
  Bot.run(14);
  Bot.stop();
  climbVine("vine", 180, 1);
  Bot.walkTo(412, 3);
  settle("glow", 30);
  Bot.dir(1);
  for (let i = 0; i < 500 && !G.won; i++) { Bot.tick(); if (G.dead) Bot.fail("died on the thorns"); }
  Bot.dir(0);
  Bot.expect(G.won, "across the thorns");
};
SOLUTIONS["TREETOP"] = () => {
  // A running jump from the spawn onto the mushroom, jump held: a big bounce. Record the vine at the top of it, hanging in the air. When it has
  // grown, bounce again, grab it at the top and climb to the high ledge.
  Bot.record("vine");
  Bot.dir(1);
  Bot.jumpKey(true);
  let bounced = false;
  for (let i = 0; i < 300; i++) {
    if (G.p.vy < -600) bounced = true;
    if (bounced && G.p.vy > -30) break;
    Bot.tick();
    if (G.dead) Bot.fail("fell");
  }
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.stop();
  Bot.waitUntil(() => G.vines.length && G.vines[0].top <= 25, 900, "the vine to grow");
  const vx = G.vines[0].x;
  Bot.dir(1);
  Bot.jumpKey(true);
  bounced = false;
  for (let i = 0; i < 400; i++) {
    if (G.p.vy < -600) bounced = true;
    if (bounced) Bot.dir(Math.abs(vx - Bot.px()) < 4 ? 0 : Math.sign(vx - Bot.px()));
    if (bounced && Bot.feet() <= 62) Bot.dir(1);
    Bot.tick();
    if (G.dead) Bot.fail("fell");
    if (bounced && G.p.onGround && Bot.feet() <= 61) break;
  }
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.expect(G.p.onGround && Bot.feet() <= 61, "up on the high ledge");
  Bot.walkTo(570);
};
SOLUTIONS["SPORE WIND"] = () => {
  // A running jump from the spawn onto the mushroom, jump held, gives a big bounce. Record a gust at the top of it, facing right. Bounce again:
  // the wind carries you the rest of the way to the ledge.
  Bot.record("gust");
  Bot.dir(1);
  Bot.jumpKey(true);
  let bounced = false;
  for (let i = 0; i < 300; i++) {
    if (G.p.vy < -600) bounced = true;
    if (bounced && G.p.vy > -30) break;
    Bot.tick();
    if (G.dead) Bot.fail("fell");
  }
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.stop();
  settle("gust", 40);
  Bot.dir(1);
  Bot.jumpKey(true);
  for (let i = 0; i < 300; i++) {
    Bot.tick();
    if (G.dead) Bot.fail("fell in the pit");
    if (i > 20 && G.p.onGround) break;
  }
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.expect(G.p.onGround && Bot.px() > 305, "on the ledge");
  Bot.walkTo(570);
};
SOLUTIONS["ESCALATOR"] = () => {
  // The first vine is the first climb. A tide recorded while climbing it repeats the whole route, so it is a lift: ride it to the shelf, and the vine
  // slot is free to be recorded again up there for the second climb.
  const rideToShelf = () => {
    board("tide");
    Bot.waitUntil(() => Bot.feet() <= 168, 1200, "to be lifted to the shelf");
    Bot.dir(1);
    for (let i = 0; i < 160 && !(G.p.onGround && !G.p.stand && Bot.feet() <= 181); i++) Bot.tick();
    Bot.dir(0);
    Bot.expect(G.p.onGround && Bot.feet() <= 181, "on the shelf");
  };
  recWait("vine", 328, 12);
  Bot.record("tide");
  Bot.run(40);
  Bot.walkTo(328, 3);
  climbVine("vine", 180, 1);
  Bot.walkTo(360, 3);
  Bot.run(20);
  Bot.stop();
  Bot.record("vine");
  rideToShelf();
  Bot.walkTo(408, 3);
  Bot.run(14);
  Bot.stop();
  rideToShelf();
  Bot.walkTo(408, 3);
  climbVine("vine", 80, 1);
  Bot.walkTo(570);
};

// ================================================================ tier 9: the trench (fork, blades, timed doors)
SOLUTIONS["PAIR"] = SOLUTIONS["FORK"];
SOLUTIONS["CLOSET"] = () => {
  // The closet opens in the second half of each five second cycle. Slip in, stand on the plate and record, and the shade keeps the plate.
  Bot.record("shade");
  Bot.waitUntil(() => G.t > 152, 600, "the closet door to open");
  Bot.walkTo(50, 3);
  Bot.run(24);
  Bot.stop();
  Bot.waitUntil(() => G.L.doorOpen.a, 600, "the shade to reach the plate");
  Bot.walkTo(570);
};
SOLUTIONS["TURNSTILE"] = () => {
  // Stand on the first plate and watch the blade. Leave it when the blade is level (a window comes every 3.3 s) and run through to the second plate.
  // The twin holds the first plate while the original holds the second, and the door opens for about a second. In the end run, cross early,
  // wait by the door and go through when it opens.
  Bot.record("fork");
  Bot.walkTo(130, 3);
  Bot.waitUntil(() => G.t >= 356, 900, "the blade to come level");
  Bot.dir(1);
  for (let i = 0; i < 300 && Bot.px() < 350; i++) { Bot.tick(); if (G.dead) Bot.fail("hit by the blade"); }
  Bot.dir(0);
  Bot.walkTo(350, 3);
  Bot.run(20);
  Bot.stop();
  Bot.walkTo(130, 3);
  Bot.waitUntil(() => G.t >= 156, 900, "the blade to come level");
  Bot.dir(1);
  for (let i = 0; i < 300 && Bot.px() < 366; i++) { Bot.tick(); if (G.dead) Bot.fail("hit by the blade"); }
  Bot.dir(0);
  Bot.waitUntil(() => G.L.doorOpen.a, 900, "the door to open");
  Bot.walkTo(570);
};

// Walk through a timed door of kind T or U (a player centre x just before it) once it has been open a moment, to x on the other side.
const throughTimed = (kind, xBefore, xAfter) => {
  Bot.walkTo(xBefore, 3);
  Bot.waitUntil(() => { const p = G.t % 300; return kind === "T" ? p >= 154 && p < 230 : p >= 4 && p < 80; }, 900, "the " + kind + " door to open");
  Bot.dir(1);
  for (let i = 0; i < 200 && Bot.px() < xAfter; i++) { Bot.tick(); if (G.dead) Bot.fail("crushed by the door"); }
  Bot.dir(0);
};

SOLUTIONS["SLIDING DOORS"] = () => {
  // The plate is in the first room: slip through the first door when it opens, record a shade on the plate. Then walk the rooms in order, waiting
  // in each for the next door's turn.
  Bot.record("shade");
  throughTimed("T", 172, 230);
  Bot.walkTo(230, 3);
  Bot.run(24);
  Bot.stop();
  throughTimed("T", 172, 250);
  throughTimed("U", 250, 310);
  throughTimed("T", 310, 400);
  Bot.walkTo(570);
};
SOLUTIONS["TRIPLE"] = () => {
  // The shade holds the third plate. The fork holds the first for a long while, then goes to the second: its twin takes over the first for a time
  // while the original sits on the second, so for about two seconds all three are held.
  recWait("shade", 210, 12);
  Bot.record("fork");
  Bot.walkTo(90, 3);
  Bot.run(170);
  Bot.walkTo(150, 3);
  Bot.run(20);
  Bot.stop();
  Bot.walkTo(290, 3);
  Bot.waitUntil(() => G.L.doorOpen.a, 900, "the door to open");
  Bot.walkTo(570);
};
SOLUTIONS["THORN PAIR"] = () => {
  // The glow by the thorn bed lights it. The fork stays on the first plate for a long while, crosses the lit bed and stops on the second plate: the
  // twin is on the first while the original is on the second, and the door opens.
  recWait("glow", 170, 12);
  Bot.record("fork");
  settle("glow", 40);
  Bot.walkTo(90, 3);
  Bot.run(170);
  Bot.walkTo(310, 3);
  Bot.run(20);
  Bot.stop();
  settle("glow", 40);
  Bot.walkTo(330, 3);
  Bot.waitUntil(() => G.L.doorOpen.a, 900, "the door to open");
  Bot.walkTo(570);
};
SOLUTIONS["CLOCK TOWER"] = () => {
  // The left closet is open in the second half of each cycle and the right one in the first half of the next. Stand on the left plate for a while,
  // slip out just before its door shuts, go to the right plate as its door opens. The twin is half a cycle behind: it is on the left plate
  // while the original is on the right one, and the hatch opens.
  Bot.record("fork");
  Bot.walkTo(126, 3);
  Bot.waitUntil(() => G.t >= 152, 600, "the left door to open");
  Bot.walkTo(50, 3);
  Bot.waitUntil(() => G.t >= 268, 600, "the stay on the plate");
  Bot.dir(1);
  for (let i = 0; i < 80 && Bot.px() < 112; i++) { Bot.tick(); if (G.dead) Bot.fail("crushed"); }
  Bot.dir(0);
  Bot.waitUntil(() => G.t >= 306, 600, "the right door to open");
  Bot.dir(1);
  for (let i = 0; i < 200 && Bot.px() < 232; i++) { Bot.tick(); if (G.dead) Bot.fail("crushed"); }
  Bot.dir(0);
  Bot.walkTo(250, 3);
  Bot.run(20);
  Bot.stop();
  Bot.walkTo(150, 3);
  Bot.waitUntil(() => G.L.doorOpen.a, 900, "the hatch to open");
  Bot.jumpKey(true);
  for (let i = 0; i < 80; i++) {
    Bot.dir(Bot.feet() < 236 ? 1 : 0);
    Bot.tick();
    if (G.dead) Bot.fail("crushed by the hatch");
    if (i > 6 && G.p.onGround && Bot.feet() <= 241) break;
  }
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.expect(G.p.onGround && G.p.y + PH < 245, "up through the hatch");
  Bot.walkTo(570);
};

// ================================================================ tier 10: the foundation (shift, then everything)
SOLUTIONS["THRESHOLD"] = SOLUTIONS["SHIFT"];
SOLUTIONS["NIGHT STAIRS"] = () => {
  // The first ring hangs in the air over the floor and brings up the first two steps. Climb them and record the second ring on the second step:
  // it brings up the third. Both stay.
  hoverAt("shift", 250, 44, 56);
  settle("shift", 30);
  Bot.record("shift2");
  settle("shift", 30);
  Bot.walkTo(186, 3);
  Bot.jumpTo(232, 24);
  Bot.expect(G.p.onGround && Bot.feet() < 245, "on the first step");
  Bot.jumpTo(300, 24);
  Bot.expect(G.p.onGround && Bot.feet() < 185, "on the second step");
  Bot.walkTo(318, 3);
  Bot.run(14);
  Bot.stop();
  settle("shift", 30);
  settle("shift2", 30);
  Bot.walkTo(186, 3);
  Bot.jumpTo(232, 24);
  Bot.jumpTo(300, 24);
  Bot.jumpTo(380, 24);
  Bot.expect(G.p.onGround && Bot.feet() < 125, "on the third step");
  Bot.walkTo(396, 3);
  Bot.jumpTo(462, 24);
  Bot.expect(G.p.onGround && Bot.feet() < 65, "up on the ledge");
  Bot.walkTo(570);
};
SOLUTIONS["THE SPAN"] = () => {
  // A ring at the left bank brings up the first part of the bridge. Walk to the edge of it and swap: you go back to the ring's old place and the ring
  // moves to where you were, bringing up the next part. Repeat.
  recWait("shift", 150, 12);
  settle("shift", 30);
  const hop = (x) => {
    Bot.walkTo(x, 3);
    Bot.run(2);
    Bot.swap();
    Bot.run(14);
  };
  Bot.walkTo(240, 4);
  hop(250);
  Bot.walkTo(344, 4);
  hop(350);
  Bot.walkTo(444, 4);
  hop(450);
  Bot.walkTo(570);
};
SOLUTIONS["KEYSTONE"] = () => {
  // Stand against the gold wall and record the ring: it opens the wall for as long as it stays. Then walk through and record a shade on the plate.
  recWait("shift", 228, 12);
  settle("shift", 30);
  Bot.record("shade");
  settle("shift", 30);
  Bot.walkTo(310, 3);
  Bot.run(14);
  Bot.stop();
  settle("shift", 30);
  Bot.walkTo(570);
};

// Jump a gap from the current spot toward x (a player centre) holding the jump for `hold` ticks, and land.
const leap = (x, hold) => Bot.jumpTo(x, hold === undefined ? 24 : hold);

SOLUTIONS["ARCHWAY"] = () => {
  // Calm at the vent gap, then the ring at the dark bridge (recorded after crossing the gap with the calm), then the shade on the plate.
  recWait("calm", 130, 12);
  Bot.record("shift");
  settle("calm", 40);
  Bot.walkTo(130, 3);
  leap(198, 24);
  walkThrough(250);
  Bot.run(12);
  Bot.stop();
  Bot.record("shade");
  settle("calm", 40);
  settle("shift", 40);
  Bot.walkTo(130, 3);
  leap(198, 24);
  walkThrough(250);
  Bot.walkTo(420, 3);
  Bot.run(12);
  Bot.stop();
  settle("calm", 40);
  settle("shift", 40);
  Bot.walkTo(130, 3);
  leap(198, 24);
  walkThrough(250);
  Bot.walkTo(430, 3);
  Bot.waitUntil(() => G.L.doorOpen.a, 900, "the door to open");
  Bot.walkTo(570);
};

// ---------------------------------------------------------------- chains: levels made of stations in a row, each needing its own echo
// A station has `key` (its echo slot), place() (go to where its echo is recorded, wait, stop recording) and pass() (get across it once its
// echo is in place, ending on the far side). Echoes are recorded in order, each recording crossing the stations before it; then the whole route.
// A replaying echo that is still walking cuts any beam it crosses and can be in the way, so wait for every echo to be at rest before crossing.
const settleAll = () => Bot.waitUntil(() => Object.values(G.echoes).every((e) => !e.moving && e.restT > 30), 2400, "every echo to settle");
const runChain = (stations, finish) => {
  for (let k = 0; k < stations.length; k++) {
    if (!stations[k].key) continue;
    Bot.record(stations[k].key);
    settleAll();
    for (let j = 0; j < k; j++) stations[j].pass();
    stations[k].place();
  }
  settleAll();
  for (const st of stations) st.pass();
  if (finish) finish();
};

const stThorns = (key, spotX, endX) => ({
  key,
  place() { Bot.walkTo(spotX, 3); Bot.run(12); Bot.stop(); },
  pass() { settle(key, 40); Bot.walkTo(endX, 3); },
});
const stVent = (key, pitCol, afterX) => ({
  key,
  place() { Bot.walkTo(pitCol * 20 - 10, 3); Bot.run(12); Bot.stop(); },
  pass() { settle(key, 40); Bot.walkTo(pitCol * 20 - 10, 3); leap((pitCol + 2) * 20 + 18, 24); walkThrough(afterX); },
});
const stBridge = (key, pitCol, afterX) => ({
  key,
  place() { Bot.walkTo(pitCol * 20 - 10, 3); Bot.run(12); Bot.stop(); },
  pass() { settle(key, 40); Bot.walkTo(afterX, 3); },
});
const stPlate = (key, plateX, waitX) => ({
  key,
  place() { Bot.walkTo(plateX, 3); Bot.run(12); Bot.stop(); },
  pass() { Bot.walkTo(waitX, 3); },
});

SOLUTIONS["LAMP HALL"] = () => {
  // Light the thorns, calm the vent, hold the plate: each recording is made crossing what the earlier ones opened.
  runChain([
    stThorns("glow", 110, 250),
    stVent("calm", 15, 400),
    stPlate("shade", 450, 470),
  ], () => {
    Bot.waitUntil(() => G.L.doorOpen.a, 900, "the door to open");
    Bot.walkTo(592);
  });
};
const stCrystal = (key, spotX, afterX) => ({
  key,
  place() { Bot.walkTo(spotX, 3); Bot.run(12); Bot.stop(); },
  pass() { settle(key, 40); Bot.walkTo(afterX, 3); },
});
SOLUTIONS["GILDED GLASS"] = () => {
  // Open the glass, light the thorns with a beam (light passes through glass), bring up the bridge.
  runChain([
    stCrystal("phase", 110, 184),
    stThorns("beam", 184, 372),
    stBridge("shift", 19, 490),
  ], () => Bot.walkTo(572));
};
const stPull = (key, edgeX, farX) => ({
  key,
  place() {
    Bot.walkTo(edgeX - 6, 3);
    Bot.dir(1);
    Bot.jumpKey(true);
    for (let i = 0; i < 28; i++) { if (i === 22) Bot.jumpKey(false); Bot.tick(); if (G.dead) Bot.fail("fell"); }
    Bot.jumpKey(false);
    Bot.dir(0);
    Bot.stop();
  },
  pass() {
    settle(key, 40);
    Bot.dir(1);
    for (let i = 0; i < 900; i++) {
      Bot.tick();
      if (G.dead) Bot.fail("fell into the pit");
      if (G.p.onGround && Bot.px() > farX) break;
    }
    Bot.dir(0);
  },
});
const stVine = (key, spotX, topY) => ({
  key,
  place() { Bot.walkTo(spotX, 3); Bot.run(12); Bot.stop(); },
  pass() { climbVine(key, topY, 1); },
});
SOLUTIONS["UNDERTOW"] = () => {
  runChain([
    stPull("pull", 140, 275),
    stVine("vine", 328, 180),
    stPlate("shade", 450, 500),
  ], () => {
    Bot.waitUntil(() => G.L.doorOpen.a, 900, "the door to open");
    Bot.walkTo(590);
  });
};
const stBridge2 = (key, pitCol, afterX) => ({
  key,
  place() { walkThrough(pitCol * 20 - 10, 3); Bot.run(12); Bot.stop(); },
  pass() { settle(key, 40); walkThrough(afterX); },
});
SOLUTIONS["THE FIRST LIGHT"] = () => {
  // The whole tower in a row: calm for the vent, shift for the bridge, pull for the water, vine for the wall.
  runChain([
    stVent("calm", 6, 212),
    stBridge2("shift", 12, 346),
    stPull("pull", 360, 495),
    stVine("vine", 528, 180),
  ], () => Bot.walkTo(592));
};
const stFerry = () => ({
  pass() {
    const m = G.L.movers[0];
    Bot.walkTo(108, 4);
    Bot.waitUntil(() => { const k = G.t % m.cycle; return k >= 3 && k < m.dwell - 25; }, 1500, "the platform to wait at the near end");
    Bot.walkTo(140, 3);
    Bot.waitUntil(() => { const k = G.t % m.cycle; return k >= m.dwell + m.travel + 12 && k < 2 * m.dwell + m.travel - 20; }, 900, "the platform to reach the far end");
    Bot.dir(1);
    for (let i = 0; i < 80 && Bot.px() < 300; i++) Bot.tick();
    Bot.dir(0);
  },
});
SOLUTIONS["SALVAGE"] = () => {
  runChain([
    stFerry(),
    stPull("pull", 320, 455),
    stPlate("shade", 490, 520),
  ], () => {
    Bot.waitUntil(() => G.L.doorOpen.a, 900, "the door to open");
    Bot.walkTo(592);
  });
};
SOLUTIONS["THE GRINDER"] = () => {
  // The blade sweeps the vine twice a turn. Wait at the foot until it has just gone past, then climb.
  recWait("vine", 348, 12);
  Bot.waitUntil(() => G.vines.length && G.vines[0].base - G.vines[0].top >= 118, 900, "the vine to grow");
  Bot.walkTo(348, 2);
  Bot.waitUntil(() => { const k = G.t % 300; return k >= 30 && k < 38; }, 900, "the blade to be clear of the vine");
  climbVine("vine", 180, 1);
  Bot.walkTo(572);
};
SOLUTIONS["DEEP END"] = () => {
  // The glow lights the thorns. The fork is recorded crossing them and the clock door: stay on the first plate a long while, then move to the
  // second. In the final run do not wait for the twin: cross early and be at the door when the plates are both held.
  recWait("glow", 110, 12);
  Bot.record("fork");
  settle("glow", 40);
  Bot.walkTo(228, 3);
  throughTimed("T", 232, 290);
  Bot.walkTo(310, 3);
  Bot.run(170);
  Bot.walkTo(370, 3);
  Bot.run(20);
  Bot.stop();
  settle("glow", 40);
  Bot.walkTo(228, 3);
  throughTimed("T", 232, 290);
  Bot.walkTo(408, 3);
  Bot.waitUntil(() => G.L.doorOpen.a, 1500, "the door to open");
  Bot.walkTo(572);
};

// ================================================================ bonus levels
SOLUTIONS["WINDFALL"] = () => {
  // Record the ferry as in Ferry: wait at the edge, jump out, stop in mid air. Then ride it and record a gust at the top of a jump from its
  // far end, facing the far bank. Ride it again a cycle later and jump the same way: the wind carries you across.
  const tideOf = () => G.echoes.tide;
  Bot.record("tide");
  Bot.walkTo(172);
  Bot.run(120);
  Bot.jumpKey(true);
  Bot.dir(1);
  for (let i = 0; i < 36; i++) Bot.tick();
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.stop();
  const cycle = 2 * (tideOf().trace.length - 1);
  Bot.record("gust");
  Bot.walkTo(172);
  Bot.waitUntil(() => Math.abs(tideOf().x + PW / 2 - 172) < 2 && G.t < 100, 600, "the tide to wait at the edge");
  Bot.jumpTo(tideOf().x + PW / 2, 12);
  Bot.waitUntil(() => G.t >= 205, 400, "the ferry to reach its far end");
  Bot.dir(1);
  Bot.jumpKey(true);
  for (let i = 0; i < 60; i++) {
    if (i === 24) Bot.jumpKey(false);
    if (i > 10 && G.p.vy > -20) { Bot.jumpKey(false); Bot.dir(0); Bot.stop(); break; }
    Bot.tick();
    if (G.dead) Bot.fail("fell");
  }
  Bot.walkTo(172);
  Bot.waitUntil(() => G.t > cycle - 20 && Math.abs(tideOf().x + PW / 2 - 172) < 2, 1500, "the tide to be back at the edge");
  Bot.jumpTo(tideOf().x + PW / 2, 12);
  Bot.waitUntil(() => (G.t % cycle) >= 205, 900, "the ferry to reach its far end");
  Bot.dir(1);
  Bot.jumpKey(true);
  for (let i = 0; i < 160; i++) {
    if (i === 24) Bot.jumpKey(false);
    Bot.tick();
    if (G.dead) Bot.fail("fell in the gap");
    if (i > 20 && G.p.onGround) break;
  }
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.expect(G.p.onGround && Bot.px() > 384, "across the gap");
  Bot.walkTo(572);
};
SOLUTIONS["OVER THE WALL"] = () => {
  // A running jump from the spawn lands on the spring with the jump held: a big bounce. Record the puppet at the top of it: it hangs high on the other
  // side of the wall, above the ledge. Then swap with it and drop onto the ledge.
  recWait("spring", 130, 12);
  Bot.record("mirror");
  settle("spring", 30);
  Bot.dir(1);
  Bot.jumpKey(true);
  let bounced = false;
  for (let i = 0; i < 300; i++) {
    if (G.p.vy < -600) bounced = true;
    if (bounced && G.p.vy > -30) break;
    Bot.tick();
    if (G.dead) Bot.fail("fell");
  }
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.stop();
  settle("mirror", 14);
  Bot.select("mirror");
  Bot.swap();
  Bot.run(20);
  Bot.expect(Bot.px() > 400 && G.p.onGround && Bot.feet() < 125, "on the ledge on the other side");
  Bot.walkTo(572);
};
SOLUTIONS["PULSE"] = () => {
  // The reflector under the ceiling beam sends it along the floor. The clock door passes it for half of every five seconds, lighting the thorns
  // and opening the gate. Wait for the door and run the thorns while it is open.
  Bot.record("reflector");
  Bot.walkTo(124, 3);
  Bot.dir(-1);
  for (let i = 0; i < 100 && Bot.px() > 110; i++) Bot.tick();
  Bot.dir(0);
  Bot.run(10);
  Bot.stop();
  settle("reflector", 30);
  Bot.walkTo(164, 3);
  Bot.waitUntil(() => { const k = G.t % 300; return k >= 156 && k < 168; }, 900, "the clock door to open");
  Bot.dir(1);
  for (let i = 0; i < 400 && !G.won; i++) { Bot.tick(); if (G.dead) Bot.fail("caught by the thorns or the door"); }
  Bot.dir(0);
  Bot.expect(G.won, "through the door, the thorns and the gate");
};
SOLUTIONS["CANOPY"] = () => {
  // Bounce from the spawn onto the mushroom, record the vine at the top of the bounce and climb it to the shelf; record the gust on the shelf at its
  // edge, facing the far side; then do it all again and let the wind carry the last jump.
  const bounceUp = () => {
    Bot.dir(1);
    Bot.jumpKey(true);
    let bounced = false;
    for (let i = 0; i < 400; i++) {
      if (G.p.vy < -600) bounced = true;
      if (bounced && G.p.vy > -30) return true;
      Bot.tick();
      if (G.dead) Bot.fail("fell");
    }
    return false;
  };
  const climbToShelf = () => {
    const vx = G.vines[0].x;
    Bot.waitUntil(() => G.vines.length && G.vines[0].top <= 25, 900, "the vine to grow");
    Bot.dir(1);
    Bot.jumpKey(true);
    let bounced = false;
    for (let i = 0; i < 400; i++) {
      if (G.p.vy < -600) bounced = true;
      if (bounced) Bot.dir(Math.abs(vx - Bot.px()) < 4 ? 0 : Math.sign(vx - Bot.px()));
      if (bounced && Bot.feet() <= 62) Bot.dir(1);
      Bot.tick();
      if (G.dead) Bot.fail("fell");
      if (bounced && G.p.onGround && Bot.feet() <= 61) break;
    }
    Bot.jumpKey(false);
    Bot.dir(0);
    Bot.expect(G.p.onGround && Bot.feet() <= 61, "up on the shelf");
  };
  Bot.record("vine");
  Bot.expect(bounceUp(), "the top of the bounce");
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.stop();
  Bot.record("gust");
  settleAll();
  climbToShelf();
  Bot.walkTo(366, 3);
  Bot.dir(1);
  Bot.jumpKey(true);
  for (let i = 0; i < 60; i++) {
    if (i === 24) Bot.jumpKey(false);
    if (i > 10 && G.p.vy > 0 && Bot.feet() >= 74) { Bot.jumpKey(false); Bot.dir(0); Bot.stop(); break; }
    Bot.tick();
    if (G.dead) Bot.fail("fell");
  }
  settleAll();
  climbToShelf();
  Bot.walkTo(366, 3);
  Bot.dir(1);
  Bot.jumpKey(true);
  for (let i = 0; i < 160; i++) {
    if (i === 24) Bot.jumpKey(false);
    Bot.tick();
    if (G.dead) Bot.fail("fell in the gap");
    if (i > 20 && G.p.onGround) break;
  }
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.expect(G.p.onGround && Bot.px() > 474 && Bot.feet() <= 141, "across the gap");
  Bot.walkTo(572);
};
SOLUTIONS["FOUR CORNERS"] = () => {
  // Two forks, each standing on its first plate for a long while and then moving to its second; the windows overlap for a little over a second.
  Bot.record("fork");
  Bot.walkTo(90, 3);
  Bot.run(170);
  Bot.walkTo(150, 3);
  Bot.run(20);
  Bot.stop();
  Bot.record("fork2");
  Bot.walkTo(210, 3);
  Bot.run(170);
  Bot.walkTo(270, 3);
  Bot.run(20);
  Bot.stop();
  Bot.walkTo(346, 3);
  Bot.waitUntil(() => G.L.doorOpen.a, 1500, "the door to open");
  Bot.walkTo(572);
};
SOLUTIONS["FOUR CORNERS"] = () => {
  // Two forks, each standing on its first plate for a long while and then moving to its second; the windows overlap for a little over a second.
  Bot.record("fork");
  Bot.walkTo(90, 3);
  Bot.run(170);
  Bot.walkTo(150, 3);
  Bot.run(20);
  Bot.stop();
  Bot.record("fork2");
  Bot.walkTo(210, 3);
  Bot.run(170);
  Bot.walkTo(270, 3);
  Bot.run(20);
  Bot.stop();
  Bot.walkTo(346, 3);
  Bot.waitUntil(() => G.L.doorOpen.a, 1500, "the door to open");
  Bot.walkTo(572);
};
// A lift (the second mover): stand at its foot, step on while it waits at the bottom, and ride to the top.
const boardLift = (footX, onX) => {
  const m = G.L.movers[1];
  Bot.walkTo(footX, 4);
  Bot.waitUntil(() => { const k = G.t % m.cycle; return k >= 4 && k < 40; }, 1500, "the lift to wait at the bottom");
  Bot.walkTo(onX, 3);
  Bot.waitUntil(() => (G.t % m.cycle) >= m.dwell + m.travel + 20, 900, "the lift to reach the top");
};
const stHoist = (key, footX, onX, shadeAbove, ledgeX) => ({
  key,
  place() {
    boardLift(footX, onX);
    Bot.jumpKey(true);
    let found = false;
    for (let i = 0; i < 90; i++) {
      Bot.tick();
      if (G.dead) Bot.fail("fell");
      const h = 160 - Bot.feet();
      if (i > 8 && G.p.vy > 0 && h <= 44 && h >= 32) { found = true; break; }
    }
    Bot.expect(found, "a hover window above the lift");
    Bot.jumpKey(false);
    Bot.stop();
  },
  pass() {
    settle(key, 30);
    boardLift(footX, onX);
    const e = G.echoes[key];
    Bot.jumpTo(e.x + 6, 22);
    Bot.expect(G.p.stand === e, "standing on the shade");
    Bot.jumpTo(ledgeX, 26);
    Bot.expect(G.won || (G.p.onGround && G.p.y + PH < 85), "up on the ledge");
  },
});
SOLUTIONS["DOCKSIDE"] = () => {
  runChain([
    stFerry(),
    stPull("pull", 320, 455),
    stHoist("shade", 472, 528, 0, 582),
  ], () => { if (!G.won) Bot.walkTo(592); });
};
SOLUTIONS["GOLDEN HOUR"] = () => {
  // Ring one at the left bank; a swap brings it to the middle of the bridge. Ring two is recorded at the foot of the stairs after crossing, hung in
  // the air so that it brings up the first two steps.
  const crossBridge = () => {
    settle("shift", 30);
    Bot.walkTo(250, 4);
    Bot.run(2);
    Bot.select("shift");
    Bot.swap();
    Bot.run(14);
    Bot.walkTo(372, 4);
  };
  recWait("shift", 150, 12);
  Bot.record("shift2");
  crossBridge();
  Bot.walkTo(440, 3);
  Bot.jumpKey(true);
  let found = false;
  for (let i = 0; i < 90; i++) {
    Bot.tick();
    if (G.dead) Bot.fail("fell");
    const h = 300 - Bot.feet();
    if (i > 8 && G.p.vy > 0 && h <= 56 && h >= 44) { found = true; break; }
  }
  Bot.expect(found, "a hover window");
  Bot.jumpKey(false);
  Bot.stop();
  settleAll();
  crossBridge();
  Bot.walkTo(406, 3);
  Bot.jumpTo(452, 24);
  Bot.expect(G.p.onGround && Bot.feet() < 245, "on the first step");
  Bot.jumpTo(522, 24);
  Bot.expect(G.p.onGround && Bot.feet() < 185, "on the second step");
  Bot.walkTo(530, 3);
  Bot.jumpTo(592, 24);
  Bot.expect(G.p.onGround && Bot.feet() < 125, "up on the ledge");
  Bot.walkTo(610);
};
