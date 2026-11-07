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
  recWait("calm", 114, 12);
  Bot.record("shade");
  Bot.run(40);
  Bot.walkTo(112, 4);
  Bot.run(8);
  Bot.dir(1);
  Bot.jumpKey(true);
  for (let i = 0; i < 160; i++) { if (i === 24) Bot.jumpKey(false); Bot.tick(); if (G.dead) Bot.fail("fell in the first gap"); if (G.p.onGround && i > 10) break; }
  Bot.dir(0);
  Bot.expect(Bot.px() > 190, "on the island");
  walkThrough(250);
  Bot.run(20);
  Bot.stop();
  Bot.record("calm");
  board("shade");
  Bot.waitUntil(() => !G.echoes.shade.moving, 900, "the shade to reach the plate");
  Bot.walkTo(312, 3);
  Bot.run(14);
  Bot.stop();
  board("shade");
  Bot.waitUntil(() => !G.echoes.shade.moving, 900, "the shade to reach the plate");
  settle("calm");
  Bot.walkTo(312, 3);
  Bot.dir(1);
  Bot.jumpKey(true);
  for (let i = 0; i < 160; i++) { if (i === 24) Bot.jumpKey(false); Bot.tick(); if (G.dead) Bot.fail("fell in the second gap"); if (G.p.onGround && i > 10) break; }
  Bot.dir(0);
  Bot.expect(Bot.px() > 370, "across the second gap");
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
  recWait("mirror", 150, 10);
  Bot.walkTo(150, 3);
  Bot.waitUntil(() => G.echoes.mirror.restT > 12, 900, "the puppet to arrive");
  Bot.swap();
  Bot.expect(Bot.px() > 340, "on the far side of the wall");
  Bot.waitUntil(() => G.L.doorOpen.a, 300, "the door to open");
  Bot.walkTo(590);
};

SOLUTIONS["PASSENGER"] = () => {
  // The shade holds the plate. The puppet is recorded walking the solid floor from the middle of the room back toward the plate, so on the
  // other side of the glass it walks over the spikes from their near end to the door, and it waits at the near end long enough to board.
  recWait("shade", 30, 12);
  Bot.record("mirror");
  Bot.walkTo(190, 3);
  Bot.jumpTo(240, 16);
  Bot.walkTo(300, 2);
  Bot.run(150);
  Bot.walkTo(240, 3);
  Bot.jumpTo(186, 16);
  Bot.walkTo(64, 2);
  Bot.run(6);
  Bot.stop();
  Bot.walkTo(190, 3);
  Bot.jumpTo(240, 16);
  Bot.walkTo(326, 2);
  Bot.waitUntil(() => { const e = G.echoes.mirror; return e && e.x + PW / 2 < 346; }, 900, "the puppet at the near end of the spikes");
  Bot.jumpTo(Bot.px() + 10, 12);
  Bot.expect(G.p.stand === G.echoes.mirror, "riding the puppet");
  Bot.waitUntil(() => !G.echoes.mirror.moving, 1500, "the ride to the door");
  Bot.expect(G.L.doorOpen.a, "the door open");
  Bot.walkTo(612);
};

// Climb the lens: walk to x, jump straight up and stop the recording at the top of the jump.
const lensTop = (x) => {
  Bot.walkTo(x, 2);
  Bot.run(4);
  Bot.jumpKey(true);
  for (let i = 0; i < 60; i++) { Bot.tick(); if (i > 4 && G.p.vy > -20) break; }
  Bot.jumpKey(false);
  Bot.stop();
};
// Swap with a puppet once it hangs at the top of its jump, then land on the ledge below it.
const lensSwap = (key) => {
  settle(key, 10);
  Bot.select(key);
  Bot.swap();
  Bot.waitUntil(() => G.p.onGround || G.won, 120, "landing after the swap with " + key);
};
SOLUTIONS["THE LENS"] = () => {
  // Four puppets. Each recording climbs the ledges the earlier puppets reach, swapping with each in turn, and ends at the top of one more
  // jump: its puppet hangs on the other side of the wall just above the next ledge. Where each ledge is jumped from picks the ledge landed on.
  const spots = [250, 540, 240, 480];
  const keys = ["mirror", "mirror2", "mirror3", "mirror4"];
  for (let k = 0; k < 4; k++) {
    Bot.record(keys[k]);
    for (let j = 0; j < k; j++) {
      Bot.walkTo(spots[j], 2);
      lensSwap(keys[j]);
    }
    lensTop(spots[k]);
  }
  for (let j = 0; j < 4 && !G.won; j++) {
    Bot.walkTo(spots[j], 2);
    lensSwap(keys[j]);
  }
  if (!G.won) Bot.walkTo(170, 3);
  Bot.expect(G.won, "at the lamp");
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
  // Lantern first: facing right (a slash) the mirror turns the beam left, along the floor into the pocket behind the spawn.
  Bot.record("reflector");
  Bot.walkTo(396, 3);
  Bot.dir(1);
  for (let i = 0; i < 100 && Bot.px() < 409; i++) Bot.tick();
  Bot.dir(0);
  Bot.run(10);
  Bot.stop();
  settle("reflector", 30);
  Bot.waitUntil(() => G.L.gates.find((g) => g.tx === 3).open, 300, "the pocket to open");
  Bot.walkTo(30);
  Bot.expect(G.lanternsGot === 1, "the lantern in the pocket");
  // Then stand in the beam facing left (a backslash) and it turns toward the gate.
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
SOLUTIONS["PERISCOPE"] = () => {
  // The bubbles lift you onto the shelf. Walk off its edge facing left and stop while level with the light: that mirror turns the
  // light down. A second mirror on the floor right under it, facing left, turns it again along the floor into the gate.
  const shelf = () => {
    Bot.walkTo(250, 3);
    Bot.waitUntil(() => G.p.y + PH < 178, 600, "to be lifted");
    Bot.dir(-1);
    for (let i = 0; i < 200 && !(G.p.onGround && G.p.y + PH <= 181); i++) Bot.tick();
    Bot.dir(0);
    Bot.expect(G.p.onGround && G.p.y + PH <= 181, "on the shelf");
  };
  // Lantern first: while nothing turns the light, it keeps the nook in the far wall open. A mirror hung under it is a step.
  Bot.record("reflector");
  Bot.walkTo(440, 2);
  Bot.jumpKey(true);
  for (let i = 0; i < 90; i++) { Bot.tick(); const h = 300 - Bot.feet(); if (i > 8 && G.p.vy > 0 && h <= 52 && h >= 44) break; }
  Bot.jumpKey(false);
  Bot.stop();
  settle("reflector", 30);
  const st = G.echoes.reflector;
  Bot.walkTo(st.x + 6 - 30, 3);
  Bot.jumpTo(st.x + 6, 24);
  Bot.expect(G.p.stand === st, "standing on the step");
  Bot.dir(1); Bot.jumpKey(true);
  for (let i = 0; i < 50 && !G.lanternsGot; i++) Bot.tick();
  Bot.jumpKey(false); Bot.dir(0);
  Bot.expect(G.lanternsGot === 1, "the lantern in the nook");
  Bot.run(30);
  Bot.record("reflector");
  shelf();
  Bot.walkTo(206, 2);
  Bot.dir(1);
  for (let i = 0; i < 60 && !(Bot.px() > 225 && !G.p.onGround); i++) Bot.tick();
  Bot.dir(-1);
  for (let i = 0; i < 40 && (i < 2 || G.p.y + PH / 2 < 170); i++) Bot.tick();
  Bot.dir(0);
  Bot.stop();
  const x1 = G.echoes.reflector.trace[G.echoes.reflector.trace.length - 1].x + PW / 2;
  Bot.record("reflector2");
  Bot.walkTo(x1 + 2, 1);
  Bot.dir(-1); Bot.tick(); Bot.dir(0);
  Bot.run(6);
  Bot.stop();
  Bot.waitUntil(() => G.L.gates.every((g) => g.open), 900, "the gate to open");
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
SOLUTIONS["DOLDRUMS"] = () => {
  // A gust at the edge facing the pit. The calm is stopped late in a wind jump, low over the pit: a step far enough from the gust to
  // leave its wind alone. A jump off the calm step stays in its still air nearly all the way to the bank, past the vent.
  const windJump = () => {
    Bot.walkTo(100, 5);
    Bot.dir(1);
    Bot.run(8);
    Bot.jumpKey(true);
  };
  Bot.record("gust");
  Bot.walkTo(132, 2);
  Bot.dir(1);
  Bot.run(2);
  Bot.dir(0);
  Bot.run(12);
  Bot.stop();
  Bot.record("calm");
  settle("gust");
  windJump();
  Bot.run(40);
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.stop();
  Bot.waitUntil(() => G.echoes.gust.restT > 40 && G.echoes.calm.restT > 40, 900, "the gust and the calm");
  windJump();
  for (let i = 0; i < 120; i++) { Bot.tick(); if (G.dead) Bot.fail("fell before the calm"); if (G.p.onGround && i > 5) break; }
  Bot.jumpKey(false);
  Bot.expect(G.p.stand === G.echoes.calm, "standing on the calm");
  Bot.dir(1);
  Bot.jumpKey(true);
  for (let i = 0; i < 160; i++) { if (i === 24) Bot.jumpKey(false); Bot.tick(); if (G.dead) Bot.fail("fell short of the bank"); if (G.p.onGround && i > 5) break; }
  Bot.expect(G.p.onGround && Bot.px() > 316, "on the bank");
  Bot.walkTo(570);
};

SOLUTIONS["CALM"] = SOLUTIONS["STILL AIR"];

// ================================================================ tier 7: the wreck (pull, cargo platforms)
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
SOLUTIONS["CRANE"] = () => {
  // The phase rides the platform over and stops at the glass, which opens around it. The shade rides over next, walks through the hole and
  // stays on the plate, which holds the door back home.
  const ride = (x) => {
    Bot.walkTo(262, 4);
    Bot.waitUntil(() => G.t > 250, 900, "the platform to cross");
    Bot.walkTo(x, 3);
  };
  Bot.record("phase");
  ride(448);
  Bot.run(10);
  Bot.stop();
  Bot.record("shade");
  ride(440);
  settle("phase", 30);
  Bot.walkTo(490, 3);
  Bot.run(20);
  Bot.stop();
  Bot.waitUntil(() => G.L.doorOpen.a, 900, "the shade to reach the plate");
  Bot.walkTo(44);
};

// ================================================================ tier 8: the garden (vine, mushrooms, roots)
SOLUTIONS["SPROUT"] = SOLUTIONS["VINE"];

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


SOLUTIONS["HANGING VINE"] = () => {
  // Lantern first: a vine recorded at the top of a jump off the roots grows from up there, nearly to the ceiling.
  Bot.record("vine");
  Bot.walkTo(176, 3);
  Bot.jumpTo(224, 22);
  Bot.walkTo(250, 2);
  Bot.jumpKey(true);
  for (let i = 0; i < 20; i++) Bot.tick();
  Bot.jumpKey(false);
  Bot.stop();
  Bot.waitUntil(() => G.vines.length && G.vines[0].base - G.vines[0].top >= 118, 900, "the high vine to grow");
  Bot.walkTo(176, 3);
  Bot.jumpTo(224, 22);
  Bot.walkTo(G.vines[0].x, 2);
  Bot.jumpKey(true);
  for (let i = 0; i < 300 && !G.lanternsGot; i++) { Bot.tick(); if (G.dead) Bot.fail("fell"); }
  Bot.jumpKey(false);
  Bot.expect(G.lanternsGot === 1, "the lantern up by the ceiling");
  Bot.press("KeyR"); Bot.tick();
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
SOLUTIONS["HUSH"] = () => {
  // A calm stopped late in a jump off the edge, low over the pit: it puts the six mushrooms in the pit to sleep and leaves the last one, past
  // the pit, awake. Walk across, bounce on the last one with the jump held and record a vine at the top of the bounce. Then bounce again, grab
  // the vine and climb to the ledge.
  const across = () => {
    settle("calm", 40);
    Bot.walkTo(150, 3);
    Bot.jumpTo(190, 12);
    Bot.expect(G.p.onGround && !G.dead, "on the sleeping mushrooms");
    Bot.walkTo(300, 3);
  };
  const bounce = () => {
    Bot.dir(1);
    Bot.jumpKey(true);
    let b = false;
    for (let i = 0; i < 300; i++) {
      if (G.p.vy < -600) b = true;
      if (!b) Bot.dir(Math.abs(330 - Bot.px()) < 3 ? 0 : Math.sign(330 - Bot.px()));
      else Bot.dir(0);
      if (b && G.p.vy > -30) return;
      Bot.tick();
      if (G.dead) Bot.fail("fell");
    }
    Bot.fail("no bounce");
  };
  Bot.record("calm");
  Bot.walkTo(150, 3);
  Bot.dir(1);
  Bot.jumpKey(true);
  for (let i = 0; i < 33; i++) { if (i === 26) Bot.jumpKey(false); Bot.tick(); }
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.stop();
  Bot.record("vine");
  across();
  bounce();
  Bot.jumpKey(false);
  Bot.stop();
  across();
  Bot.waitUntil(() => G.vines.length && G.vines[0].top <= 25, 900, "the vine to grow");
  const vx = G.vines[0].x;
  Bot.dir(1);
  Bot.jumpKey(true);
  let bounced = false;
  for (let i = 0; i < 400; i++) {
    if (G.p.vy < -600) bounced = true;
    if (!bounced) Bot.dir(Math.abs(330 - Bot.px()) < 3 ? 0 : Math.sign(330 - Bot.px()));
    else Bot.dir(Math.abs(vx - Bot.px()) < 4 ? 0 : Math.sign(vx - Bot.px()));
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
  // The closet opens in the second half of each five second cycle. The glow slips in and stands on the one safe tile, lighting the thorns, so
  // the shade can cross them to the plate. Then the glow is recorded again before the thorns on the road to the exit.
  Bot.record("glow");
  Bot.waitUntil(() => G.t > 152, 600, "the closet door to open");
  Bot.walkTo(150, 3);
  Bot.run(10);
  Bot.stop();
  Bot.record("shade");
  Bot.waitUntil(() => G.t > 152 && G.echoes.glow && G.echoes.glow.restT > 30, 600, "the door and the light");
  Bot.walkTo(30, 3);
  Bot.run(20);
  Bot.stop();
  Bot.record("glow");
  Bot.waitUntil(() => G.L.doorOpen.a, 600, "the shade to reach the plate");
  Bot.walkTo(326, 3);
  Bot.run(10);
  Bot.stop();
  Bot.waitUntil(() => G.L.doorOpen.a && G.echoes.glow.restT > 30, 600, "the plate and the light");
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
  // Lantern first: a ring recorded by the spawn opens the gold cupboard behind it.
  recWait("shift", 70, 12);
  settle("shift", 30);
  Bot.walkTo(28);
  Bot.expect(G.lanternsGot === 1, "the lantern in the cupboard");
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


// ---------------------------------------------------------------- chains: levels made of stations in a row, each needing its own echo
// A station has `key` (its echo slot), place() (go to where its echo is recorded, wait, stop recording) and pass() (get across it once its
// echo is in place, ending on the far side). Echoes are recorded in order, each recording crossing the stations before it; then the whole route.
// A replaying echo that is still walking cuts any beam it crosses and can be in the way, so wait for every echo to be at rest before crossing.
// Big rooms on page three have recordings of a minute or more, so the wait scales with the longest recording.
const settleAll = () => Bot.waitUntil(() => Object.values(G.echoes).every((e) => e.kind === "tide" || (!e.moving && e.restT > 30)), G.L.def.cols ? 7200 : 2400, "every echo to settle"); // a tide never stops
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
const stBridge2 = (key, pitCol, afterX) => ({
  key,
  place() { walkThrough(pitCol * 20 - 10, 3); Bot.run(12); Bot.stop(); },
  pass() { settle(key, 40); walkThrough(afterX); },
});
SOLUTIONS["THE FIRST LIGHT"] = () => {
  // The whole tower in a row: calm for the vent, shift for the bridge, pull for the water, vine for the wall.
  runChain([
    { key: "calm", place: stVent("calm", 6).place, pass() { settle("calm", 40); Bot.walkTo(110, 3); leap(196, 24); walkThrough(212); } },
    stBridge2("shift", 12, 350),
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
  // A pull hung over the well. The shade waits a long while on the bank, then rides the platform, crosses the well in the pull and stands on
  // the first plate. Its path is a ride from the bank to the far side for whoever stands on it while it waits. The pull is recorded again
  // riding it, to the second plate, and the final run rides it the same way.
  const rideShade = () => {
    Bot.walkTo(80, 3);
    Bot.waitUntil(() => { const e = G.echoes.shade; return e && Math.abs(e.x + PW / 2 - 110) < 3; }, 600, "the shade waiting on the bank");
    Bot.run(4);
    Bot.jumpTo(110, 14);
    Bot.expect(G.p.stand === G.echoes.shade, "standing on the shade");
    Bot.waitUntil(() => !G.echoes.shade.moving, 2400, "the ride across");
    Bot.expect(Bot.px() > 470, "across the well");
  };
  Bot.record("pull");
  stFerry().pass();
  stPull("pull", 320, 455).place();
  Bot.record("shade");
  Bot.walkTo(110, 2);
  Bot.run(200);
  stFerry().pass();
  stPull("pull", 320, 455).pass();
  Bot.walkTo(490, 3);
  Bot.run(12);
  Bot.stop();
  Bot.record("pull");
  rideShade();
  Bot.walkTo(530, 3);
  Bot.run(12);
  Bot.stop();
  rideShade();
  Bot.waitUntil(() => G.L.doorOpen.a, 1500, "the door to open");
  Bot.walkTo(592);
};
SOLUTIONS["DEEP END"] = () => {
  // The calm by the gap silences the vent. The fork is recorded crossing the gap and the clock door: stay on the first plate a long while,
  // then move to the second. In the final run do not wait for the twin: cross early and be at the door when the plates are both held.
  const cross = () => {
    settle("calm", 40);
    Bot.walkTo(112, 3);
    leap(200, 24);
    walkThrough(228, 3);
  };
  recWait("calm", 114, 12);
  Bot.record("fork");
  cross();
  throughTimed("T", 232, 290);
  Bot.walkTo(310, 3);
  Bot.run(170);
  Bot.walkTo(370, 3);
  Bot.run(20);
  Bot.stop();
  cross();
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
  // A running jump from under the low ceiling lands on the spring with the jump held: a big bounce. Record the puppet at the top of it: it hangs high on the
  // other side of the wall, above the ledge. The puppet stays up there without the spring, so the spring is recorded again on the plate under the
  // low roof (where it cannot bounce anyone), which holds the door. Then swap with the puppet and walk through.
  recWait("spring", 156, 12);
  Bot.record("mirror");
  settle("spring", 30);
  Bot.walkTo(86, 3);
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
  Bot.select("spring");
  Bot.record("spring");
  Bot.walkTo(164, 3);
  Bot.jumpTo(226, 10);
  Bot.walkTo(230, 2);
  Bot.run(6);
  Bot.stop();
  Bot.waitUntil(() => G.L.doorOpen.a, 900, "the spring to hold the plate");
  settle("mirror", 14);
  Bot.select("mirror");
  Bot.swap();
  Bot.run(20);
  Bot.expect(Bot.px() > 400 && G.p.onGround && Bot.feet() < 125, "on the ledge on the other side");
  Bot.walkTo(572);
};
SOLUTIONS["PULSE"] = () => {
  // The first mirror under the ceiling beam sends it along the floor; the clock door passes it for half of every five seconds. Cross the
  // thorns while it is open and record the second mirror just inside the bubbles, facing right: it turns the beam up into the hatch.
  // Then, in a later window, step into the bubbles and ride up through the lit hatch.
  const open = () => { const k = G.L.timedGroups[0].clk % 300; return k >= 152 && k < 160; };
  const crossThorns = () => {
    Bot.walkTo(164, 3);
    Bot.waitUntil(open, 900, "the clock door to open");
    Bot.dir(1);
    for (let i = 0; i < 200 && Bot.px() < 340; i++) { Bot.tick(); if (G.dead) Bot.fail("caught by the thorns or the door"); }
    Bot.dir(0);
  };
  Bot.record("reflector");
  Bot.walkTo(124, 3);
  Bot.dir(-1);
  for (let i = 0; i < 100 && Bot.px() > 110; i++) Bot.tick();
  Bot.dir(0);
  Bot.run(10);
  Bot.stop();
  settle("reflector", 30);
  Bot.record("reflector2");
  crossThorns();
  Bot.dir(1);
  for (let i = 0; i < 300 && Bot.px() < 498; i++) Bot.tick();
  Bot.dir(0);
  Bot.stop();
  settle("reflector2", 30);
  crossThorns();
  Bot.walkTo(470, 3);
  Bot.waitUntil(open, 900, "the clock door to open again");
  Bot.dir(1);
  for (let i = 0; i < 60 && Bot.px() < 500; i++) Bot.tick();
  // stay under the middle of the hatch while the bubbles lift you
  for (let i = 0; i < 300 && !(G.p.y + PH < 178); i++) {
    const dx = 502 - Bot.px();
    Bot.dir(Math.abs(dx) < 2 ? 0 : Math.sign(dx));
    Bot.tick();
    if (G.dead) Bot.fail("died");
  }
  Bot.expect(G.p.y + PH < 178, "risen through the hatch");
  Bot.dir(1);
  for (let i = 0; i < 300 && !G.won; i++) { Bot.tick(); if (G.dead) Bot.fail("fell"); }
  Bot.expect(G.won, "up through the hatch to the exit");
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
  // the air so that it brings up the first two steps. The vent on the ledge blows the last jump back, so a calm is recorded at the top of a
  // jump from the second step: high enough to leave the steps alone, close enough to silence the vent.
  const crossBridge = () => {
    settle("shift", 30);
    Bot.walkTo(250, 4);
    Bot.run(2);
    Bot.select("shift");
    Bot.swap();
    Bot.run(14);
    Bot.walkTo(372, 4);
  };
  const climb = () => {
    settle("shift2", 30);
    Bot.walkTo(406, 3);
    Bot.jumpTo(452, 24);
    Bot.expect(G.p.onGround && Bot.feet() < 245, "on the first step");
    Bot.jumpTo(522, 24);
    Bot.expect(G.p.onGround && Bot.feet() < 185, "on the second step");
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
  Bot.record("calm");
  crossBridge();
  climb();
  Bot.walkTo(520, 3);
  Bot.dir(1);
  Bot.jumpKey(true);
  Bot.run(18);
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.stop();
  settleAll();
  crossBridge();
  climb();
  Bot.walkTo(530, 3);
  Bot.jumpTo(592, 24);
  Bot.expect(G.p.onGround && Bot.feet() < 125, "up on the ledge");
  Bot.walkTo(610);
};

// New echoes in the lab: branch, swing, portal.
SOLUTIONS["BRANCH"] = () => {
  // Stand at the edge facing across and record: the bough grows over the gap, under the low ceiling.
  Bot.record("branch");
  Bot.walkTo(214, 2);
  Bot.dir(1); Bot.tick(); Bot.dir(0);
  Bot.run(10);
  Bot.stop();
  Bot.waitUntil(() => G.branches.length && G.branches[0].w >= 118, 600, "the bough to grow");
  Bot.walkTo(570);
};
// Swing on a rope from x: grab it from the ledge, pump with the swing, let go going forward past relTh. Ends when landed.
const swingAcross = (fromX, hold, relTh) => {
  Bot.walkTo(fromX, 2);
  Bot.dir(1); Bot.jumpKey(true);
  let grabbed = -1, rel = -1;
  for (let i = 0; i < 900; i++) {
    if (G.p.rope) {
      if (grabbed < 0) grabbed = i;
      const r = G.p.rope;
      Bot.jumpKey(false);
      Bot.dir(r.w > 0 ? 1 : -1);
      if (r.th > relTh && r.w > 0 && i - grabbed > 40) { Bot.jumpKey(true); rel = i; }
    } else if (grabbed >= 0) { Bot.dir(1); if (i - rel > 8) Bot.jumpKey(false); }
    else if (i > hold) Bot.jumpKey(false);
    Bot.tick();
    if (G.dead) Bot.fail("fell off the rope");
    if (G.won || (rel >= 0 && G.p.onGround)) break;
  }
  Bot.jumpKey(false); Bot.dir(0);
  Bot.expect(rel >= 0, "let go of the rope");
};
SOLUTIONS["SWING"] = () => {
  // Jump off the ledge and stop on the way down: the rope hangs from there, over the drop, clear of the ledge.
  Bot.record("swing");
  Bot.walkTo(150, 2);
  Bot.dir(1); Bot.jumpKey(true);
  for (let i = 0; i < 40; i++) Bot.tick();
  Bot.dir(0); Bot.jumpKey(false);
  Bot.stop();
  Bot.waitUntil(() => G.ropes.length && G.ropes[0].len >= 119, 600, "the rope");
  swingAcross(150, 10, 0.5);
  Bot.walkTo(570);
};
SOLUTIONS["PORTAL"] = () => {
  // The shade holds the near door while a portal is left between the doors, and its twin goes by the spawn. Then the shade drops to the
  // plate below for the far door, and the portals are the way back past the near door, which has shut.
  recWait("shade", 450, 10);
  Bot.record("portal");
  settle("shade", 10);
  Bot.walkTo(432, 3);
  Bot.jumpTo(388, 12);
  Bot.waitUntil(() => G.L.doorOpen.b, 600, "the near door");
  Bot.walkTo(350, 2);
  Bot.run(8);
  Bot.stop();
  recWait("portal2", 556, 10);
  Bot.record("shade");
  Bot.walkTo(410, 2);
  Bot.waitUntil(() => G.p.onGround && Bot.feet() > 290, 300, "the drop");
  Bot.walkTo(90, 2);
  Bot.run(8);
  Bot.stop();
  Bot.waitUntil(() => portalOn(G.echoes.portal) && portalOn(G.echoes.portal2) && G.L.doorOpen.a, 1500, "both portals and the far door");
  Bot.dir(1);
  for (let i = 0; i < 200 && Bot.px() > 400; i++) Bot.tick();
  Bot.dir(0);
  Bot.expect(Bot.px() < 370 && Bot.px() > 330, "between the doors");
  Bot.walkTo(290);
};

// The Wreck.
SOLUTIONS["GRAPPLE"] = () => {
  // Lantern first: a well hung low in the gap is a net. It catches you down by the lantern; then start again.
  Bot.record("pull");
  Bot.walkTo(160, 3);
  Bot.dir(1); Bot.jumpKey(true);
  for (let i = 0; i < 80 && (i < 6 || G.p.y + PH / 2 < 292); i++) { if (i === 12) Bot.jumpKey(false); Bot.tick(); }
  Bot.jumpKey(false); Bot.dir(0);
  Bot.stop();
  settle("pull", 40);
  Bot.dir(1);
  for (let i = 0; i < 200 && Bot.px() < 160; i++) Bot.tick();
  Bot.jumpKey(true);
  for (let i = 0; i < 240 && !G.lanternsGot; i++) { if (i === 12) Bot.jumpKey(false); if (i === 30) Bot.dir(0); Bot.tick(); if (G.dead) Bot.fail("missed the net"); }
  Bot.jumpKey(false); Bot.dir(0);
  Bot.expect(G.lanternsGot === 1, "the lantern in the gap");
  Bot.press("KeyR"); Bot.tick();
  SOLUTIONS["PULL"]();
};
SOLUTIONS["SAFETY NET"] = () => {
  // A well hung over the water holds you until the platform comes to its near end; then step out onto it and ride.
  Bot.record("pull");
  Bot.walkTo(124, 3);
  Bot.dir(1); Bot.jumpKey(true);
  for (let i = 0; i < 26; i++) { if (i === 22) Bot.jumpKey(false); Bot.tick(); }
  Bot.jumpKey(false); Bot.dir(0);
  Bot.stop();
  settle("pull", 40);
  const m = G.L.movers[0];
  Bot.dir(1);
  for (let i = 0; i < 200 && Bot.px() < 124; i++) Bot.tick();
  Bot.jumpKey(true);
  for (let i = 0; i < 26; i++) { if (i === 22) Bot.jumpKey(false); Bot.tick(); }
  Bot.jumpKey(false); Bot.dir(0);
  Bot.waitUntil(() => G.pulls.some((z) => inZone(z, Bot.px(), G.p.y + PH / 2)) && Math.abs(G.p.vy) < 20, 300, "to hang in the well");
  Bot.waitUntil(() => m.x <= 262 && m.dx === 0, 1200, "the platform at its near end");
  Bot.dir(1);
  for (let i = 0; i < 200 && !(G.p.stand === m); i++) { Bot.tick(); if (G.dead) Bot.fail("fell in"); }
  Bot.dir(0);
  Bot.expect(G.p.stand === m, "on the platform");
  Bot.waitUntil(() => m.x >= 440, 1200, "the far side");
  Bot.walkTo(570);
};
SOLUTIONS["ROPE"] = () => {
  // Lantern first: swing hard and let go at the back end; the throw carries you up under the ledge, to the lantern.
  Bot.record("swing");
  Bot.walkTo(150, 2);
  Bot.dir(1); Bot.jumpKey(true);
  for (let i = 0; i < 40; i++) Bot.tick();
  Bot.dir(0); Bot.jumpKey(false);
  Bot.stop();
  Bot.waitUntil(() => G.ropes.length && G.ropes[0].len >= 119, 600, "the rope");
  Bot.walkTo(150, 2);
  Bot.dir(1); Bot.jumpKey(true);
  let grabbed = -1;
  for (let i = 0; i < 900 && !G.lanternsGot; i++) {
    if (G.p.rope) {
      if (grabbed < 0) grabbed = i;
      const r = G.p.rope;
      Bot.jumpKey(false);
      Bot.dir(r.w > 0 ? 1 : -1);
      if (r.th < -REL_BACK && r.w < 0 && i - grabbed > 120) Bot.jumpKey(true);
    } else if (grabbed >= 0) Bot.dir(-1);
    else if (i > 10) Bot.jumpKey(false);
    Bot.tick();
    if (G.dead) break;
  }
  Bot.jumpKey(false); Bot.dir(0);
  Bot.expect(G.lanternsGot === 1, "the lantern under the ledge");
  for (let i = 0; i < 80 && G.dead; i++) Bot.tick();
  Bot.press("KeyR"); Bot.tick();
  Bot.waitUntil(() => G.ropes.length && G.ropes[0].len >= 119, 600, "the rope");
  swingAcross(150, 10, 0.5);
  Bot.walkTo(570);
};
var REL_BACK = 0.3;
SOLUTIONS["HAUL ACROSS"] = () => {
  // The rope first. Then record the shade while you swing across on it: the shade crosses the way you did and stays on the plate.
  Bot.record("swing");
  Bot.walkTo(150, 2);
  Bot.dir(1); Bot.jumpKey(true);
  for (let i = 0; i < 40; i++) Bot.tick();
  Bot.dir(0); Bot.jumpKey(false);
  Bot.stop();
  Bot.waitUntil(() => G.ropes.length && G.ropes[0].len >= 119, 600, "the rope");
  Bot.record("shade");
  Bot.waitUntil(() => G.ropes.length && G.ropes[0].len >= 119, 600, "the rope");
  swingAcross(150, 10, 0.5);
  Bot.walkTo(510, 2);
  Bot.run(10);
  Bot.stop();
  Bot.waitUntil(() => G.ropes.length && G.ropes[0].len >= 119, 600, "the rope");
  swingAcross(150, 10, 0.5);
  Bot.waitUntil(() => G.L.doorOpen.a, 900, "the door to open");
  Bot.walkTo(590);
};
SOLUTIONS["RIGGING"] = () => {
  // Ride the platform out from under the low ceiling, jump off its far end and stop at the top of the jump: the rope hangs out there,
  // and walking off the platform end drops you into it.
  const m = G.L.movers[0];
  const ride = () => {
    Bot.waitUntil(() => m.x <= 121 && m.dx === 0, 1200, "the platform at the dock");
    Bot.walkTo(m.x + 30, 3);
    Bot.waitUntil(() => G.p.stand === m, 300, "on the platform");
    // walk along the moving platform to near its front edge
    for (let i = 0; i < 120 && Bot.px() - m.x < 50; i++) { Bot.dir(1); Bot.tick(); }
    Bot.dir(0);
    Bot.waitUntil(() => G.p.stand === m && m.x >= 259, 1200, "the far end");
  };
  Bot.record("swing");
  ride();
  Bot.dir(1); Bot.jumpKey(true);
  for (let i = 0; i < 19; i++) Bot.tick();
  Bot.dir(0); Bot.jumpKey(false);
  Bot.stop();
  Bot.waitUntil(() => G.ropes.length && G.ropes[0].len >= 119, 900, "the rope");
  ride();
  Bot.dir(1);
  let grabbed = -1, rel = -1;
  for (let i = 0; i < 900 && !G.won; i++) {
    if (G.p.rope) {
      if (grabbed < 0) grabbed = i;
      const r = G.p.rope;
      Bot.jumpKey(false);
      Bot.dir(r.w > 0 ? 1 : -1);
      if (r.th > RIG_REL && r.w > 0 && i - grabbed > 40 && rel < 0) { Bot.jumpKey(true); rel = i; }
    } else { Bot.dir(1); if (rel >= 0 && i - rel > 8) Bot.jumpKey(false); }
    Bot.tick();
    if (G.dead) Bot.fail("fell");
    if (rel >= 0 && G.p.onGround) break;
  }
  Bot.walkTo(590);
};
SOLUTIONS["FLING"] = () => {
  // A well over the gap first. Then, hanging in it, walk out the far side and stop on the way down: the rope hangs out there.
  const intoWell = () => {
    settle("pull", 30);
    Bot.dir(1);
    for (let i = 0; i < 200 && Bot.px() < 124; i++) Bot.tick();
    Bot.jumpKey(true);
    for (let i = 0; i < 26; i++) { if (i === 22) Bot.jumpKey(false); Bot.tick(); }
    Bot.jumpKey(false); Bot.dir(0);
    Bot.waitUntil(() => G.pulls.some((z) => inZone(z, Bot.px(), G.p.y + PH / 2)) && Math.abs(G.p.vy) < 20, 300, "to hang in the well");
  };
  Bot.record("pull");
  Bot.walkTo(124, 3);
  Bot.dir(1); Bot.jumpKey(true);
  for (let i = 0; i < 26; i++) { if (i === 22) Bot.jumpKey(false); Bot.tick(); }
  Bot.jumpKey(false); Bot.dir(0);
  Bot.stop();
  settle("pull", 40);
  Bot.record("swing");
  intoWell();
  Bot.dir(1);
  for (let i = 0; i < 200 && !(G.p.vy > 60 && !G.pulls.some((z) => inZone(z, Bot.px(), G.p.y + PH / 2))); i++) Bot.tick();
  for (let i = 0; i < FLING_DROP; i++) Bot.tick();
  Bot.dir(0);
  Bot.stop();
  Bot.waitUntil(() => G.ropes.length && G.ropes[0].len >= 99, 900, "the rope");
  intoWell();
  Bot.dir(1);
  let grabbed = -1, rel = -1;
  for (let i = 0; i < 900 && !G.won; i++) {
    if (G.p.rope) {
      if (grabbed < 0) grabbed = i;
      const r = G.p.rope;
      Bot.jumpKey(false);
      Bot.dir(r.w > 0 ? 1 : -1);
      if (r.th > 0.5 && r.w > 0 && i - grabbed > 40 && rel < 0) { Bot.jumpKey(true); rel = i; }
    } else { Bot.dir(1); if (rel >= 0 && i - rel > 8) Bot.jumpKey(false); }
    Bot.tick();
    if (G.dead) Bot.fail("fell");
  }
  Bot.expect(G.won, "across to the far bank");
};
var FLING_DROP = 2;
// Grab the rope from x, pump, let go going forward past relTh, then hold right until done() or a landing.
const flingTo = (fromX, relTh, done) => {
  Bot.walkTo(fromX, 2);
  Bot.dir(1); Bot.jumpKey(true);
  let grabbed = -1, rel = -1;
  for (let i = 0; i < 900; i++) {
    if (G.p.rope) {
      if (grabbed < 0) grabbed = i;
      const r = G.p.rope;
      Bot.jumpKey(false);
      Bot.dir(r.w > 0 ? 1 : -1);
      if (r.th > relTh && r.w > 0 && i - grabbed > 40) { Bot.jumpKey(true); rel = i; }
    } else if (grabbed >= 0) { Bot.dir(1); if (i - rel > 8) Bot.jumpKey(false); if (done()) return; }
    else if (i > 10) Bot.jumpKey(false);
    Bot.tick();
    if (G.dead) Bot.fail("fell off the rope");
    if (G.won) return;
  }
  Bot.fail("the throw never got there");
};
var RIG_REL = 0.8;

// The Garden.
SOLUTIONS["BOUGH"] = SOLUTIONS["BRANCH"];
// A running jump from the bank onto the root.
const rootHop = () => {
  Bot.walkTo(70, 3);
  Bot.dir(1);
  for (let i = 0; i < 100 && Bot.px() < 134; i++) Bot.tick();
  Bot.jumpTo(240, 24);
};
SOLUTIONS["ROOT BRIDGE"] = () => {
  // Jump onto the root and record the branch there, facing the far bank, before it gives way. The bough stays when the root goes.
  Bot.record("branch");
  rootHop();
  Bot.expect(G.p.stand && G.p.stand.kind === "root", "on the root");
  Bot.walkTo(252, 2);
  Bot.dir(1); Bot.tick(); Bot.dir(0);
  Bot.run(4);
  Bot.stop();
  Bot.waitUntil(() => G.branches.length && G.branches[0].w >= 118, 900, "the bough to grow");
  rootHop();
  Bot.dir(1);
  for (let i = 0; i < 200 && Bot.px() < 360; i++) { Bot.tick(); if (G.dead) Bot.fail("fell"); }
  Bot.jumpKey(true);
  for (let i = 0; i < 80 && !(i > 8 && G.p.onGround); i++) { if (i === 20) Bot.jumpKey(false); Bot.tick(); if (G.dead) Bot.fail("fell short"); }
  Bot.jumpKey(false);
  Bot.walkTo(570);
};
SOLUTIONS["TRELLIS"] = () => {
  // A vine at the foot of the pillar; then, from the top of the pillar, a branch across to the ledge.
  recWait("vine", 192, 12);
  Bot.record("branch");
  climbVine("vine", 180, 1);
  Bot.walkTo(252, 2);
  Bot.dir(1); Bot.tick(); Bot.dir(0);
  Bot.run(6);
  Bot.stop();
  climbVine("vine", 180, 1);
  Bot.waitUntil(() => G.branches.length && G.branches[0].w >= 118, 900, "the bough to grow");
  Bot.dir(1);
  for (let i = 0; i < 200 && Bot.px() < 362; i++) { Bot.tick(); if (G.dead) Bot.fail("fell"); }
  Bot.jumpKey(true);
  for (let i = 0; i < 80 && !(i > 8 && G.p.onGround); i++) { if (i === 20) Bot.jumpKey(false); Bot.tick(); if (G.dead) Bot.fail("fell short"); }
  Bot.jumpKey(false);
  Bot.walkTo(570);
};
SOLUTIONS["GREEN DARK"] = () => {
  // The vine takes you up the left wall; the glow is recorded up there beside the thorn bed, and lights it.
  recWait("vine", 288, 12);
  Bot.record("glow");
  climbVine("vine", 180, -1);
  Bot.walkTo(248, 3);
  Bot.run(14);
  Bot.stop();
  climbVine("vine", 180, -1);
  Bot.walkTo(248, 3);
  settle("glow", 30);
  Bot.dir(-1);
  for (let i = 0; i < 500 && !G.won; i++) { Bot.tick(); if (G.dead) Bot.fail("died on the thorns"); }
  Bot.dir(0);
  Bot.expect(G.won, "across the thorns");
};
SOLUTIONS["KNOT"] = () => {
  // No room to jump in the tunnel: a branch from its mouth reaches under the shelf. A vine recorded standing at the end of the bough
  // grows up the face of the shelf.
  Bot.record("branch");
  Bot.walkTo(134, 2);
  Bot.dir(1); Bot.tick(); Bot.dir(0);
  Bot.run(6);
  Bot.stop();
  Bot.waitUntil(() => G.branches.length && G.branches[0].w >= 100, 900, "the bough to grow");
  Bot.record("vine");
  Bot.waitUntil(() => G.branches.length && G.branches[0].w >= 100, 900, "the bough to grow");
  Bot.walkTo(232, 2);
  Bot.run(10);
  Bot.stop();
  Bot.waitUntil(() => G.branches.length && G.branches[0].w >= 100, 900, "the bough to grow");
  Bot.walkTo(200, 3);
  climbVine("vine", 180, 1);
  Bot.walkTo(570);
};

// The Trench: slow.
SOLUTIONS["MILLSTONE"] = () => {
  // A slow ring beside the blade: it turns at a crawl inside it, and there is time to pass while it is level.
  recWait("slow", 240, 10);
  settle("slow", 40);
  Bot.walkTo(262, 2);
  const b = G.L.blades[0];
  Bot.waitUntil(() => { const a = ((bladeAngle(b) % Math.PI) + Math.PI) % Math.PI; return a > 2.75; }, 1500, "the blade to come level");
  Bot.dir(1);
  for (let i = 0; i < 200 && Bot.px() < 360; i++) { Bot.tick(); if (G.dead) Bot.fail("hit by the blade"); }
  Bot.walkTo(570);
};
SOLUTIONS["LONG SHUTTER"] = () => {
  // A slow ring in front of the thick clock door holds its clock back, so it stays open long enough to walk through.
  recWait("slow", 250, 10);
  settle("slow", 40);
  Bot.walkTo(250, 2);
  Bot.waitUntil(() => !doorShut(G.L.timed[0]), 3000, "the door to open");
  Bot.dir(1);
  for (let i = 0; i < 300 && Bot.px() < 360; i++) { Bot.tick(); if (G.dead) Bot.fail("crushed by the door"); }
  Bot.walkTo(570);
};
SOLUTIONS["THE GRINDER"] = () => {
  // The blade sweeps the vine every few ticks. A slow ring near its hub makes it crawl; climb just after it has gone past.
  recWait("vine", 348, 12);
  recWait("slow", 300, 10);
  settle("slow", 40);
  Bot.waitUntil(() => G.vines.length && G.vines[0].base - G.vines[0].top >= 118, 900, "the vine to grow");
  Bot.walkTo(348, 2);
  const b = G.L.blades[0];
  Bot.waitUntil(() => { const a = ((bladeAngle(b) % Math.PI) + Math.PI) % Math.PI; return a > 0.35 && a < 0.5; }, 1500, "the blade to be clear of the vine");
  climbVine("vine", 180, 1);
  Bot.walkTo(572);
};

// The Foundation: portals.
SOLUTIONS["WAY BACK"] = SOLUTIONS["PORTAL"];
SOLUTIONS["GOLD SEAL"] = () => {
  // The ring at the edge of the dark bridge to cross it. A portal beyond the bridge, and its twin by the spawn. Then the ring again, at the gold wall,
  // reached through the portals because the bridge has gone.
  recWait("shift", 174, 12);
  settle("shift", 30);
  Bot.record("portal");
  settle("shift", 30);
  Bot.walkTo(410, 3);
  Bot.run(8);
  Bot.stop();
  recWait("portal2", 110, 10);
  const through = () => {
    Bot.waitUntil(() => portalOn(G.echoes.portal) && portalOn(G.echoes.portal2), 1200, "both portals");
    // the portal by the spawn is on the way: walking right steps into it
    Bot.dir(1);
    for (let i = 0; i < 200 && Bot.px() < 300; i++) { Bot.tick(); if (G.dead) Bot.fail("fell"); }
    Bot.dir(0);
    Bot.expect(Bot.px() > 300, "through the portal");
  };
  Bot.record("shift");
  through();
  Bot.walkTo(428, 2);
  Bot.run(10);
  Bot.stop();
  through();
  settle("shift", 30);
  Bot.walkTo(570);
};

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

SOLUTIONS["FOUR CORNERS"] = () => {
  // The second fork goes into the closet when the clock door opens (at 2.5 s): first plate, then the second. The first fork stands on the near
  // plate a little longer, so its moment (twin on the near plate, first on the far one) starts while the closet pair's moment is still on.
  // Then wait by the door and go through while all four are held.
  const tOpen = () => !doorShut(G.L.timed[0]);
  Bot.record("fork2");
  Bot.walkTo(480, 3);
  Bot.waitUntil(tOpen, 600, "the closet to open");
  Bot.walkTo(550, 2);
  Bot.waitUntil(() => G.t >= 200, 300, "a moment on the first plate");
  Bot.walkTo(590, 2);
  Bot.run(30);
  Bot.stop();
  Bot.record("fork");
  Bot.walkTo(390, 2);
  Bot.waitUntil(() => G.t >= 236, 400, "a moment on the near plate");
  Bot.walkTo(450, 2);
  Bot.run(30);
  Bot.stop();
  Bot.walkTo(210, 3);
  Bot.waitUntil(() => G.L.doorOpen.a, 900, "the door to open");
  Bot.dir(-1);
  for (let i = 0; i < 200 && !G.won; i++) { Bot.tick(); if (G.dead) Bot.fail("crushed by the door"); }
  Bot.expect(G.won, "through the door");
};

// ================================================================ page three: the afterglow
SOLUTIONS["THE LONG WAY"] = () => {
  // A chain of eight. Lower floor left to right: glow for the thorns, phase for the glass, calm for the vent, the second glow for the
  // planks, the vine up the shaft. Upper floor right to left: shade on the plate, shift at the gold wall, pull over the spikes.
  runChain([
    stThorns("glow", 90, 222),
    stCrystal("phase", 250, 292),
    { key: "calm", place() { Bot.walkTo(374, 3); Bot.run(12); Bot.stop(); }, pass() { settle("calm", 40); Bot.walkTo(372, 3); leap(456, 24); walkThrough(470); } },
    { key: "glow2", place() { walkThrough(490, 4); Bot.run(12); Bot.stop(); }, pass() { settle("glow2", 40); walkThrough(610); } },
    { key: "vine", place() { Bot.walkTo(880, 3); Bot.run(12); Bot.stop(); }, pass() { climbVine("vine", 320, -1); } },
    { key: "shade", place() { Bot.walkTo(810, 3); Bot.run(12); Bot.stop(); }, pass() { Bot.waitUntil(() => G.L.doorOpen.a, 1500, "the door"); Bot.walkTo(700, 3); } },
    stCrystal("shift", 652, 560),
    {
      key: "pull",
      place() {
        Bot.walkTo(506, 3);
        Bot.dir(-1);
        Bot.jumpKey(true);
        for (let i = 0; i < 28; i++) { if (i === 22) Bot.jumpKey(false); Bot.tick(); if (G.dead) Bot.fail("fell"); }
        Bot.jumpKey(false);
        Bot.dir(0);
        Bot.stop();
      },
      pass() {
        settle("pull", 40);
        Bot.dir(-1);
        for (let i = 0; i < 900; i++) { Bot.tick(); if (G.dead) Bot.fail("fell on the spikes"); if (G.p.onGround && Bot.px() < 372) break; }
        Bot.dir(0);
      },
    },
  ], () => Bot.walkTo(70));
};

SOLUTIONS["GOLD LEAF"] = () => {
  // The vent gap is too wide for a step without wind, so the gust is hung over it, facing across: a step whose wind carries the jump off
  // it. (The calm, the obvious tool for a vent, is wanted at the bridge.) The shade holds the plate that lights the thorns. The shift stands
  // by the gold wall, and the calm on the bridge between them: near enough to keep the gold the shift takes, far enough from the shift, the
  // wall and the lit thorns to leave them alone.
  const crossVent = () => {
    settle("gust", 40);
    const e = G.echoes.gust;
    Bot.walkTo(70, 3);
    Bot.jumpTo(e.x + PW / 2, 24);
    Bot.expect(G.p.stand === e, "standing on the gust");
    Bot.run(4);
    Bot.dir(1);
    Bot.jumpKey(true);
    for (let i = 0; i < 200; i++) { if (i === 24) Bot.jumpKey(false); Bot.tick(); if (G.dead) Bot.fail("fell in the vent gap"); if (G.p.onGround && i > 5) break; }
    Bot.jumpKey(false);
    Bot.dir(0);
    Bot.expect(Bot.px() > 262, "across the vent gap");
  };
  Bot.record("gust");
  Bot.walkTo(70, 3);
  Bot.dir(1);
  Bot.run(6);
  Bot.jumpKey(true);
  for (let i = 0; i < 34; i++) { if (i === 22) Bot.jumpKey(false); Bot.tick(); }
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.stop();
  Bot.record("shade");
  crossVent();
  walkThrough(310, 4);
  Bot.run(12);
  Bot.stop();
  const toBridge = () => {
    crossVent();
    Bot.waitUntil(() => G.L.doorOpen.a, 900, "the lamp over the thorns");
    walkThrough(370, 4);
    Bot.run(30);
  };
  Bot.record("calm");
  toBridge();
  Bot.walkTo(580, 3);
  Bot.run(12);
  Bot.stop();
  Bot.record("shift");
  toBridge();
  Bot.walkTo(690, 3);
  Bot.run(12);
  Bot.stop();
  Bot.record("phase");
  toBridge();
  settle("calm", 40);
  settle("shift", 40);
  Bot.walkTo(750, 3);
  Bot.run(12);
  Bot.stop();
  toBridge();
  settleAll();
  Bot.walkTo(810);
};

SOLUTIONS["SECOND THOUGHTS"] = () => {
  // The calm first stands at the edge of the mushroom pit, where it puts the four mushrooms to sleep but not the one past the pit. The
  // shade waits a long while at the edge, then walks across the sleeping mushrooms. A vine is hung at the top of a bounce on the last
  // mushroom. Then the calm is recorded again on the bridge above, and every later run crosses the pit riding the shade, over mushrooms
  // that are awake again.
  const walkIn = () => Bot.walkTo(270, 3);
  const hopOnto = (x) => {
    Bot.dir(1);
    Bot.jumpKey(true);
    for (let i = 0; i < 80; i++) { if (i === 3) Bot.jumpKey(false); Bot.tick(); if (G.dead) Bot.fail("died hopping into the pit"); if (G.p.onGround && i > 3 && Bot.px() >= x) break; }
    Bot.dir(0);
  };
  const bounceAndClimb = (record) => {
    const vx = () => { const v = G.vines.find((q) => q.echo === G.echoes.vine); return v ? v.x : 510; };
    if (!record) Bot.waitUntil(() => { const v = G.vines.find((q) => q.echo === G.echoes.vine); return v && v.base - v.top >= 118; }, 900, "the vine to grow");
    Bot.dir(1);
    Bot.jumpKey(true);
    let b = false;
    for (let i = 0; i < 400; i++) {
      if (G.p.vy < -600) b = true;
      if (!b) Bot.dir(Math.abs(510 - Bot.px()) < 3 ? 0 : Math.sign(510 - Bot.px()));
      else if (record) { Bot.dir(0); if (G.p.vy > -30) break; }
      else Bot.dir(Bot.feet() <= 150 ? 1 : Math.abs(vx() - Bot.px()) < 4 ? 0 : Math.sign(vx() - Bot.px()));
      Bot.tick();
      if (G.dead) Bot.fail("fell");
      if (!record && b && G.p.onGround && Bot.feet() <= 141) break;
    }
    Bot.jumpKey(false);
    Bot.dir(0);
    if (record) Bot.stop();
    else Bot.expect(G.p.onGround && Bot.feet() <= 141, "up on the upper floor");
  };
  const rideShade = () => {
    walkIn();
    walkThrough(340, 4);
    Bot.waitUntil(() => { const e = G.echoes.shade; return e && Math.abs(e.x + PW / 2 - 370) < 3; }, 900, "the shade waiting at the pit");
    Bot.run(4);
    Bot.jumpTo(370, 12);
    Bot.expect(G.p.stand === G.echoes.shade, "standing on the shade");
    Bot.waitUntil(() => !G.echoes.shade.moving, 2400, "the ride across the pit");
    Bot.expect(Bot.px() > 480 && !G.dead, "across the pit");
    bounceAndClimb(false);
  };
  // the calm at the pit, for now
  Bot.record("calm");
  walkIn();
  walkThrough(390, 4);
  Bot.run(12);
  Bot.stop();
  // the shade, which waits, then crosses the sleeping mushrooms
  Bot.record("shade");
  walkIn();
  settle("calm", 40);
  walkThrough(370, 4);
  Bot.run(300);
  hopOnto(412);
  Bot.walkTo(490, 3);
  Bot.run(12);
  Bot.stop();
  // the vine at the top of a bounce on the last mushroom
  Bot.record("vine");
  walkIn();
  settle("calm", 40);
  walkThrough(380, 4);
  hopOnto(412);
  Bot.walkTo(490, 3);
  bounceAndClimb(true);
  // the calm again, now on the bridge
  Bot.record("calm");
  rideShade();
  Bot.walkTo(670, 3);
  Bot.run(12);
  Bot.stop();
  Bot.record("shift");
  rideShade();
  Bot.walkTo(750, 3);
  Bot.run(12);
  Bot.stop();
  Bot.record("phase");
  rideShade();
  settle("calm", 40);
  settle("shift", 40);
  Bot.walkTo(850, 3);
  Bot.run(12);
  Bot.stop();
  rideShade();
  settleAll();
  Bot.walkTo(930);
};

SOLUTIONS["THE OTHER HALF"] = () => {
  // The phase opens the glass closet. A calm hung just past the edge of the vent gap gets you across it and up onto the block, where the
  // shift stands against the wall: its ring opens the gold on the other side. The puppet waits on the left floor, so it stands on the right
  // floor. Swapping from the plate in the closet leaves the puppet on that plate, holding the near door on the right; a shade, recorded
  // through that same swap, holds the far plate on the right.
  const swapFromPlate = () => {
    settle("phase", 40);
    Bot.waitUntil(() => G.echoes.mirror && !G.echoes.mirror.moving, 900, "the puppet to stop");
    Bot.walkTo(70, 3);
    Bot.run(4);
    Bot.select("mirror");
    Bot.swap();
    Bot.run(6);
    Bot.expect(Bot.px() > 500, "on the other side");
  };
  recWait("phase", 130, 10);
  Bot.record("calm");
  Bot.walkTo(232, 3);
  Bot.dir(1);
  Bot.jumpKey(true);
  Bot.run(6);
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.stop();
  Bot.record("shift");
  settle("calm", 40);
  Bot.walkTo(222, 3);
  Bot.jumpTo(310, 24);
  Bot.walkTo(306, 3);
  Bot.jumpTo(350, 24);
  Bot.expect(G.p.onGround && Bot.feet() <= 381, "up on the block");
  Bot.walkTo(450, 3);
  Bot.run(12);
  Bot.stop();
  recWait("mirror", 200, 10);
  Bot.record("shade");
  swapFromPlate();
  Bot.walkTo(890, 3);
  Bot.run(12);
  Bot.stop();
  swapFromPlate();
  settleAll();
  Bot.waitUntil(() => G.L.doorOpen.a && G.L.doorOpen.b, 600, "both doors");
  Bot.walkTo(490);
};

SOLUTIONS["CROSSCURRENT"] = () => {
  // The puppet must stay on the far plate to hold the lamp room's door, so the player cannot swap with it on the real run. Each recording
  // swaps through it instead: the spring is left hanging over the pit, and the tide, recorded through the same swap and over that spring,
  // carries the swap in its path. On the run the player swaps to the tide where it waits by the door.
  const swapToPuppet = () => {
    Bot.waitUntil(() => G.echoes.mirror && !G.echoes.mirror.moving, 900, "the puppet to stop");
    Bot.walkTo(70, 3);
    Bot.run(4);
    Bot.select("mirror");
    Bot.swap();
    Bot.run(6);
    Bot.expect(Bot.px() > 840, "on the far floor");
  };
  recWait("mirror", 70, 20);
  settle("mirror", 40);
  Bot.expect(G.L.doorOpen.b, "the puppet holds the door");
  // the spring: off the far lip and stopped on the way down, over the pit
  Bot.record("spring");
  swapToPuppet();
  Bot.walkTo(848, 2);
  Bot.dir(-1);
  Bot.jumpKey(true);
  Bot.run(24);
  Bot.jumpKey(false);
  Bot.run(16);
  Bot.stop();
  Bot.dir(0);
  // the tide: off the lip onto the spring, bounced over to the floor by the door, and left waiting there
  Bot.record("tide");
  swapToPuppet();
  Bot.walkTo(848, 2);
  settle("spring", 30);
  const sx = G.echoes.spring.x + PW / 2;
  let bounced = false;
  for (let i = 0; i < 240 && !(bounced && G.p.onGround); i++) {
    Bot.dir(bounced || Bot.px() > sx + 2 ? -1 : Bot.px() < sx - 2 ? 1 : 0);
    Bot.jumpKey(true);
    Bot.run(1);
    if (G.p.vy < -300 && Bot.px() < 836) bounced = true;
  }
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.expect(bounced && Bot.px() < 660, "over the pit");
  Bot.walkTo(575, 3);
  Bot.run(60);
  Bot.stop();
  // the run: swap to the tide while it waits by the open door
  Bot.waitUntil(() => G.L.doorOpen.b && G.echoes.tide && G.echoes.tide.x > 540 && G.echoes.tide.x < 600, 6000, "the tide by the door");
  Bot.select("tide");
  Bot.swap();
  Bot.run(4);
  Bot.walkTo(490);
};

// ---------------------------------------------------------------- the finale, Every Echo: one station per echo, floor by floor
// Floor one runs left to right on the ground (feet at y 620).
const EVERY_ECHO = [
  {
    key: "tide",
    // a gap a jump cannot clear: a tide that waits at the edge, then jumps out over the gap, ferries you to its far end
    place() { Bot.walkTo(72, 3); Bot.run(120); Bot.jumpKey(true); Bot.dir(1); Bot.run(36); Bot.jumpKey(false); Bot.dir(0); Bot.stop(); },
    pass() {
      Bot.walkTo(72, 3);
      // board early in its wait at the edge, on its way out (a tide plays its path forward, then back)
      const tr = G.echoes.tide.trace, at = tr.map((t, i) => (Math.abs(t.x + PW / 2 - 72) < 2 ? i : -1)).filter((i) => i >= 0);
      const i0 = at[0], i1 = at[at.length - 1];
      Bot.waitUntil(() => { const e = G.echoes.tide, n = e.trace.length, k = Math.floor(e.clk) % (2 * (n - 1)); return k >= i0 + 40 && k <= (i0 + i1) / 2; }, 9000, "the tide waiting at the edge");
      Bot.jumpTo(72, 12);
      // later echoes recorded riding the tide ride along with it, so standing on any of them is the same ride
      Bot.expect(G.p.stand && G.p.stand.trace, "on the tide or something riding it");
      const n = G.echoes.tide.trace.length;
      Bot.waitUntil(() => { const e = G.echoes.tide; return Math.floor(e.clk) % (2 * (n - 1)) >= n - 3; }, 900, "the ride out over the gap");
      Bot.jumpTo(222, 24);
      Bot.expect(G.p.onGround && Bot.px() > 205 && Bot.px() < 236, "across the first gap");
    },
  },
  stThorns("glow", 230, 352),
  {
    key: "fork",
    // stay on the first plate a long while, then the second: for a while the twin holds the first
    place() { Bot.walkTo(370, 3); Bot.run(240); Bot.walkTo(410, 3); Bot.run(10); Bot.stop(); },
    pass() {
      Bot.walkTo(424, 3);
      for (let i = 0; i < 2000 && Bot.px() < 466; i++) { Bot.dir(G.L.doorOpen.c ? 1 : Bot.px() > 426 ? -1 : 0); Bot.tick(); if (G.dead) Bot.fail("crushed by door c"); }
      Bot.dir(0);
      Bot.expect(Bot.px() > 466, "through door c");
    },
  },
  {
    key: "calm",
    place() { Bot.walkTo(512, 3); Bot.dir(1); Bot.jumpKey(true); Bot.run(6); Bot.jumpKey(false); Bot.dir(0); Bot.stop(); },
    pass() { settle("calm", 40); Bot.walkTo(502, 3); Bot.jumpTo(592, 24); walkThrough(610); },
  },
  {
    key: "gust",
    place() { walkThrough(690, 4); Bot.dir(1); Bot.run(6); Bot.jumpKey(true); for (let i = 0; i < 34; i++) { if (i === 22) Bot.jumpKey(false); Bot.tick(); } Bot.jumpKey(false); Bot.dir(0); Bot.stop(); },
    pass() {
      settle("gust", 40);
      const e = G.echoes.gust;
      walkThrough(690, 4);
      Bot.jumpTo(e.x + PW / 2, 24);
      Bot.expect(G.p.stand === e, "standing on the gust");
      Bot.run(4);
      Bot.dir(1); Bot.jumpKey(true);
      for (let i = 0; i < 200; i++) { if (i === 24) Bot.jumpKey(false); Bot.tick(); if (G.dead) Bot.fail("fell in the gust gap"); if (G.p.onGround && i > 5) break; }
      Bot.jumpKey(false); Bot.dir(0);
      Bot.expect(Bot.px() > 882, "across the gust gap");
      walkThrough(940);
    },
  },
  {
    key: "shade",
    // a gap a jump cannot clear: a shade stopped over it is the step
    place() { Bot.walkTo(972, 3); Bot.dir(1); Bot.jumpKey(true); for (let i = 0; i < 26; i++) { if (i === 10) Bot.jumpKey(false); Bot.tick(); } Bot.jumpKey(false); Bot.dir(0); Bot.stop(); },
    pass() {
      settle("shade", 20);
      const e = G.echoes.shade;
      walkThrough(966, 4);
      Bot.walkTo(972, 3);
      Bot.jumpTo(e.x + PW / 2, 24);
      Bot.expect(G.p.stand === e, "standing on the shade");
      Bot.run(4);
      Bot.dir(1); Bot.jumpKey(true);
      for (let i = 0; i < 200; i++) { if (i === 12) Bot.jumpKey(false); Bot.tick(); if (G.dead) Bot.fail("fell in the step gap"); if (G.p.onGround && i > 4) break; }
      Bot.jumpKey(false); Bot.dir(0);
      Bot.expect(G.p.onGround && Bot.px() > 1105, "across the step gap");
    },
  },
  {
    key: "spring",
    place() { Bot.walkTo(1190, 3); Bot.run(8); Bot.stop(); },
    pass() {
      settle("spring", 30);
      Bot.walkTo(1150, 3);
      Bot.jumpKey(true);
      let b = false;
      for (let i = 0; i < 300; i++) {
        if (G.p.vy < -520) b = true;
        Bot.dir(!b ? (Math.abs(1190 - Bot.px()) < 3 ? 0 : Math.sign(1190 - Bot.px())) : Bot.feet() < 455 ? -1 : 0);
        Bot.tick();
        if (G.dead) Bot.fail("fell");
        if (b && G.p.onGround) break;
      }
      Bot.jumpKey(false); Bot.dir(0);
      Bot.expect(G.p.onGround && Bot.feet() <= 461, "up on floor two");
    },
  },
  // Floor two runs right to left (feet at y 460).
  { key: "mirror", place() { Bot.walkTo(1170, 3); Bot.run(10); Bot.stop(); }, pass() { Bot.waitUntil(() => G.L.doorOpen.d, 2400, "the puppet on plate d"); Bot.walkTo(1000, 3); } },
  {
    key: "pull",
    place() { Bot.walkTo(966, 3); Bot.dir(-1); Bot.jumpKey(true); for (let i = 0; i < 28; i++) { if (i === 22) Bot.jumpKey(false); Bot.tick(); if (G.dead) Bot.fail("fell"); } Bot.jumpKey(false); Bot.dir(0); Bot.stop(); },
    pass() {
      settle("pull", 40);
      Bot.dir(-1);
      for (let i = 0; i < 900; i++) { Bot.tick(); if (G.dead) Bot.fail("fell on the spikes"); if (G.p.onGround && Bot.px() < 832) break; }
      Bot.dir(0);
    },
  },
  {
    key: "slow",
    place() { Bot.walkTo(740, 3); Bot.run(10); Bot.stop(); },
    pass() {
      settle("slow", 40);
      Bot.walkTo(718, 2);
      const bl = G.L.blades[0];
      Bot.waitUntil(() => { const a = ((bladeAngle(bl) % Math.PI) + Math.PI) % Math.PI; return a > 2.75; }, 1500, "the blade to come level");
      Bot.dir(-1);
      for (let i = 0; i < 200 && Bot.px() > 590; i++) { Bot.tick(); if (G.dead) Bot.fail("hit by the blade"); }
      Bot.dir(0);
    },
  },
  {
    key: "phase",
    place() { Bot.walkTo(510, 3); Bot.run(10); Bot.stop(); },
    pass() {
      settle("phase", 40);
      Bot.walkTo(400, 3);
      // the mushroom under the shaft: a held bounce, then over onto floor three
      Bot.jumpKey(true);
      let b = false;
      for (let i = 0; i < 300; i++) {
        if (G.p.vy < -520) b = true;
        Bot.dir(!b ? (Math.abs(370 - Bot.px()) < 3 ? 0 : Math.sign(370 - Bot.px())) : Bot.feet() < 296 ? 1 : 0);
        Bot.tick();
        if (G.dead) Bot.fail("fell");
        if (b && G.p.onGround) break;
      }
      Bot.jumpKey(false); Bot.dir(0);
      Bot.expect(G.p.onGround && Bot.feet() <= 301, "up on floor three");
    },
  },
  // Floor three runs left to right (feet at y 300).
  { key: "shift", place() { Bot.walkTo(790, 3); Bot.run(10); Bot.stop(); }, pass() { settle("shift", 30); Bot.walkTo(846, 3); } },
  {
    key: "flip",
    place() { Bot.walkTo(888, 3); Bot.run(10); Bot.stop(); },
    pass() {
      settle("flip", 30);
      Bot.walkTo(870, 3);
      Bot.dir(1);
      for (let i = 0; i < 300 && !(G.p.onGround && Bot.px() > 975 && G.p.g > 0); i++) { Bot.tick(); if (G.dead) Bot.fail("died under the low ceiling"); }
      Bot.dir(0);
      Bot.expect(G.p.onGround && Bot.px() > 975, "past the spikes");
    },
  },
  {
    key: "swing",
    // the rope hangs from a jump stopped on its way down into the hole
    place() { Bot.walkTo(990, 2); Bot.run(6); Bot.dir(1); Bot.jumpKey(true); for (let i = 0; i < 34; i++) Bot.tick(); Bot.dir(0); Bot.jumpKey(false); Bot.stop(); },
    pass() {
      Bot.waitUntil(() => { const r = G.ropes.find((q) => q.echo === G.echoes.swing); return r && r.len >= 119; }, 900, "the rope");
      swingAcross(990, 10, 0.5);
      Bot.expect(G.p.onGround && Bot.feet() <= 301 && Bot.px() > 1125, "across the hole");
    },
  },
  // The hatch over the last mushroom opens only for a beam turned upward: the beam shines along the floor and the reflector, standing in it,
  // sends it up the shaft. (The beam alone shines past; a reflector alone has no beam to turn.)
  { key: "beam", place() { Bot.walkTo(1132, 3); Bot.walkTo(1150, 3); Bot.run(10); Bot.stop(); }, pass() { settle("beam", 30); } },
  {
    key: "reflector",
    // a reflector sends a beam the opposite way to the way it faces: standing in a beam that runs right and facing right, it turns it up
    place() { Bot.walkTo(1198, 3); Bot.run(10); Bot.stop(); },
    pass() {
      settle("reflector", 30);
      // wait clear of the beam (earlier runs' echoes stand where you stand, and an echo in the beam cuts it), until the hatch has stayed open a while
      Bot.walkTo(1132, 3);
      const open = () => G.L.gates.some((gt) => gt.tx === 60 && gt.ty === 7 && gt.open);
      let c = 0;
      Bot.waitUntil(() => { c = open() ? c + 1 : 0; return c >= 40; }, 3000, "the hatch");
      Bot.walkTo(1170, 3);
      Bot.jumpKey(true);
      let b = false;
      for (let i = 0; i < 300; i++) {
        if (G.p.vy < -520) b = true;
        const tx = !b ? 1210 : Bot.feet() < 136 ? -1 : 1210;
        Bot.dir(tx === -1 ? -1 : Math.abs(tx - Bot.px()) < 3 ? 0 : Math.sign(tx - Bot.px()));
        Bot.tick();
        if (G.dead) Bot.fail("fell");
        if (b && G.p.onGround) break;
      }
      Bot.jumpKey(false); Bot.dir(0);
      Bot.expect(G.p.onGround && Bot.feet() <= 141, "up on floor four");
    },
  },
  // Floor four runs right to left (feet at y 140).
  { key: "vine", place() { Bot.walkTo(950, 3); Bot.run(12); Bot.stop(); }, pass() { climbVine("vine", 60, -1); Bot.walkTo(860, 3); } },
  {
    key: "branch",
    // the tunnel is too low to jump the hole: a bough grown from the edge, the way you faced, is the bridge
    place() { Bot.walkTo(686, 2); Bot.dir(-1); Bot.tick(); Bot.dir(0); Bot.run(10); Bot.stop(); },
    pass() { Bot.waitUntil(() => { const br = G.branches.find((q) => q.echo === G.echoes.branch); return br && br.w >= 100; }, 900, "the bough"); Bot.walkTo(556, 3); },
  },
  // Two doors and one second shade: it holds the near plate while a portal is left between the doors, its twin hangs in the air
  // by the block, and then the shade drops through the hole to the plate in the pocket below, which holds the far door.
  { key: "shade2", place() { Bot.walkTo(350, 3); Bot.run(12); Bot.stop(); }, pass() {} },
  { key: "portal", place() { Bot.walkTo(332, 3); Bot.jumpTo(286, 12); Bot.expect(Bot.feet() < 145, "over the hole"); Bot.waitUntil(() => G.L.doorOpen.b, 900, "door b"); Bot.walkTo(250, 3); Bot.run(10); Bot.stop(); }, pass() {} },
  { key: "portal2", place() { Bot.walkTo(420, 3); Bot.jumpKey(true); for (let i = 0; i < 60; i++) { Bot.tick(); if (i > 4 && G.p.vy > -20) break; } Bot.jumpKey(false); Bot.stop(); }, pass() {} },
  {
    key: "shade2",
    place() { Bot.walkTo(310, 2); Bot.waitUntil(() => G.p.onGround && Bot.feet() > 290, 300, "the drop to the pocket"); Bot.walkTo(110, 3); Bot.run(12); Bot.stop(); },
    pass() {
      Bot.waitUntil(() => portalOn(G.echoes.portal) && portalOn(G.echoes.portal2) && G.L.doorOpen.a, 2400, "the portals and door a");
      Bot.walkTo(440, 3);
      // jump up into the hanging portal; stop steering once it has put you between the doors
      Bot.jumpKey(true);
      for (let i = 0; i < 120 && Bot.px() > 300; i++) { Bot.dir(Math.abs(420 - Bot.px()) < 3 ? 0 : Math.sign(420 - Bot.px())); Bot.tick(); if (G.dead) Bot.fail("fell"); }
      Bot.jumpKey(false); Bot.dir(0);
      Bot.expect(Bot.px() < 262 && Bot.px() > 230, "through the portals");
      Bot.walkTo(190, 3);
    },
  },
];
SOLUTIONS["EVERY ECHO"] = () => {
  // Each station's echo is recorded getting past every station before it, then one last run through all of them. No waiting for every
  // echo to settle between recordings: the fork's two plates are only both held for a while, at the same time in every run.
  const st = EVERY_ECHO;
  for (let k = 0; k < st.length; k++) {
    Bot.record(st[k].key);
    for (let j = 0; j < k; j++) st[j].pass();
    st[k].place();
  }
  for (const s of st) s.pass();
  Bot.expect(G.won, "at the lamp");
};
