"use strict";

// One scripted solution per level, in LEVELS order. Each runs against the real engine.
const SOLUTIONS = [];

// Helper: wait for an echo to finish its replay.
const echoDone = (kind) => () => !G.echoes[kind].moving;

// 1 FIRST STEPS
SOLUTIONS["FIRST STEPS"] = () => {
  Bot.route([
    ["to", 98], ["jump", 180],
    ["jump", 226],
    ["to", 262], ["jump", 360],
    ["to", 372], ["jump", 398],
    ["jump", 458],
    ["jump", 518],
    ["jump", 582],
    ["to", 590],
  ]);
};

// 2 THE PLATE
SOLUTIONS["THE PLATE"] = () => {
  Bot.record("shade");
  Bot.walkTo(190);
  Bot.run(8);
  Bot.stop();
  Bot.waitUntil(() => G.L.doorOpen.a, 400, "door open");
  Bot.route([["to", 420], ["jump", 500], ["to", 550]]);
};

// 3 STEPPING STONE: freeze an echo in mid air over the gap, stand on it, hop across.
SOLUTIONS["STEPPING STONE"] = () => {
  Bot.record("shade");
  Bot.walkTo(250);
  Bot.jumpKey(true);
  Bot.dir(1);
  let found = false;
  for (let i = 0; i < 90; i++) {
    Bot.tick();
    const h = 300 - Bot.feet();
    if (i > 8 && G.p.vy > 0 && h <= 44 && h >= 28) { found = true; break; }
  }
  Bot.expect(found, "a hover window over the gap");
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.stop();
  Bot.walkTo(250);
  Bot.waitUntil(echoDone("shade"), 600, "echo to settle");
  const e = G.echoes.shade;
  Bot.jumpTo(e.x + PW / 2, 24);
  Bot.expect(G.p.stand === e, "standing on the echo");
  Bot.jumpTo(310, 24); // hop up for the lantern above the gap
  Bot.expect(G.p.stand === e, "back on the echo after the lantern hop");
  Bot.jumpTo(420, 24);
  Bot.walkTo(570);
};

// Shared route: from spawn onto the platform in the thorn levels (L5, L6). Ends standing at the landing spot.
const toThornPlatform = () => {
  Bot.walkTo(150);
  Bot.jumpTo(180, 24); // onto the step
  Bot.jumpTo(235, 24); // across the gap onto the platform
};

SOLUTIONS["TWIN PLATES"] = () => {
  // slots: shade, shade2. The first holds the low plate and is the step for the second.
  Bot.record("shade");
  Bot.walkTo(190);
  Bot.run(6);
  Bot.stop();
  const up = () => {
    Bot.walkTo(172);
    Bot.waitUntil(echoDone("shade"), 600, "the first shade to settle");
    Bot.jumpTo(190, 24);
    Bot.expect(G.p.stand === G.echoes.shade, "standing on the first shade");
    Bot.jumpTo(215, 24);
    Bot.expect(G.p.y + PH < 230, "up on the block");
  };
  Bot.record("shade2");
  up();
  Bot.walkTo(270);
  Bot.run(6);
  Bot.stop();
  up();
  Bot.walkTo(335);
  Bot.waitUntil(() => G.L.doorOpen.a, 400, "the door to open");
  Bot.route([["to", 420], ["jump", 500], ["to", 550]]);
};

// 4 LAMPLIGHT
SOLUTIONS["LAMPLIGHT"] = () => {
  const toIsland = () => {
    Bot.walkTo(150);
    Bot.jumpTo(175, 24);
    Bot.walkTo(348);
  };
  Bot.record("glow");
  toIsland();
  Bot.run(6);
  Bot.stop();
  toIsland();
  Bot.waitUntil(echoDone("glow"), 600, "glow echo to settle");
  Bot.walkTo(446);
  Bot.jumpTo(500, 24);
  Bot.walkTo(570);
};

// 6 RELAY
SOLUTIONS["RELAY"] = () => {
  Bot.record("glow");
  toThornPlatform();
  Bot.walkTo(310);
  Bot.run(6);
  Bot.stop();
  Bot.record("shade");
  toThornPlatform();
  Bot.walkTo(250);
  Bot.run(6);
  Bot.stop();
  Bot.walkTo(150);
  Bot.jumpTo(210, 24);
  Bot.waitUntil(() => G.L.thorns.every((t) => t.lit) && G.L.doorOpen.a, 900, "thorns lit and door open");
  Bot.walkTo(440);
  Bot.walkTo(570);
};

// 7 GLASS WALL
SOLUTIONS["GLASS WALL"] = () => {
  Bot.record("phase");
  Bot.walkTo(290);
  Bot.run(6);
  Bot.stop();
  Bot.walkTo(290);
  Bot.waitUntil(echoDone("phase"), 600, "phase echo to settle");
  Bot.walkTo(420);
  Bot.jumpTo(506, 24);
  Bot.walkTo(560);
};

// 8 UNDER GLASS
SOLUTIONS["UNDER GLASS"] = () => {
  Bot.record("phase");
  Bot.walkTo(330);
  Bot.run(6);
  Bot.stop();
  // The hatch dissolves once the phase echo is there; drop in and stand on the plate.
  Bot.walkTo(330, 3);
  Bot.waitUntil(echoDone("phase"), 600, "phase echo to settle");
  Bot.record("shade");
  Bot.walkTo(330, 3);
  Bot.waitUntil(() => G.p.onGround && G.p.y > 320, 160, "player to drop into the vault");
  Bot.walkTo(330, 3);
  Bot.expect(G.L.plates[0].pressed, "plate pressed in the vault");
  Bot.run(6);
  Bot.stop();
  Bot.walkTo(270);
  Bot.waitUntil(() => G.L.doorOpen.a && echoDone("phase")() && echoDone("shade")(), 900, "door open");
  // Drop into the vault for the lantern, then climb back out to the left through the open hatch.
  Bot.dir(1);
  for (let i = 0; i < 200 && !(G.p.onGround && G.p.y > 320 && Bot.px() > 362); i++) Bot.tick();
  Bot.dir(0);
  Bot.expect(G.lanternsGot === 1, "the lantern in the vault");
  Bot.walkTo(330);
  Bot.jumpTo(285, 24);
  Bot.walkTo(290);
  Bot.jumpTo(375, 24);
  Bot.walkTo(520);
  Bot.walkTo(570);
};

// 9 TWO KEYS
SOLUTIONS["TWO KEYS"] = () => {
  const throughWall = () => {
    Bot.walkTo(190);
    Bot.waitUntil(echoDone("phase"), 600, "phase echo to settle");
    Bot.walkTo(224);
    Bot.jumpTo(262, 24); // onto the step
  };
  Bot.record("phase");
  Bot.walkTo(190);
  Bot.run(6);
  Bot.stop();
  Bot.record("glow");
  throughWall();
  Bot.jumpTo(310, 24); // onto the platform
  Bot.walkTo(390);
  Bot.run(6);
  Bot.stop();
  throughWall();
  Bot.walkTo(296); // off the step and into the corridor
  Bot.waitUntil(() => G.L.thorns.every((t) => t.lit), 900, "thorns to wither");
  Bot.walkTo(500);
  Bot.walkTo(570);
};

// 10 UPDRAFT
SOLUTIONS["UPDRAFT"] = () => {
  Bot.record("flip");
  Bot.walkTo(360);
  Bot.run(6);
  Bot.stop();
  Bot.walkTo(280);
  Bot.waitUntil(() => G.echoes.flip.restT > 30, 600, "flip echo to settle");
  Bot.dir(1);
  for (let i = 0; i < 260 && !G.won; i++) {
    if (G.p.onGround && Bot.px() > 420) break;
    Bot.tick();
  }
  Bot.dir(0);
  Bot.expect(G.p.onGround && G.p.y < 170, "landed on the ledge");
  Bot.walkTo(570);
};

// 11 CEILING PLATE
SOLUTIONS["CEILING PLATE"] = () => {
  const flipRest = () => G.echoes.flip.restT > 30;
  Bot.record("flip");
  Bot.walkTo(250);
  Bot.jumpTo(310, 24); // up onto the pedestal
  Bot.run(6);
  Bot.stop();
  // Record the shade walking along the ceiling to the hanging plate.
  Bot.record("shade");
  Bot.walkTo(236);
  Bot.waitUntil(flipRest, 900, "flip zone to open");
  Bot.dir(1);
  for (let i = 0; i < 200 && !(G.p.g === -1 && G.p.onGround); i++) Bot.tick();
  Bot.expect(G.p.g === -1 && G.p.onGround, "standing on the ceiling");
  Bot.walkTo(290);
  Bot.expect(G.L.plates[0].pressed, "ceiling plate pressed");
  Bot.run(6);
  Bot.stop();
  Bot.walkTo(236);
  Bot.waitUntil(() => flipRest() && G.L.doorOpen.a, 900, "zone and door");
  Bot.walkTo(570);
};

// 13 LEAPFROG: carry the light across a long dark bridge by swapping with the glow echo.
SOLUTIONS["LEAPFROG"] = () => {
  Bot.record("glow");
  Bot.walkTo(100);
  Bot.run(6);
  Bot.stop();
  Bot.walkTo(100);
  Bot.waitUntil(() => G.echoes.glow.restT > 30, 600, "glow to settle");
  Bot.walkTo(110);
  Bot.jumpTo(150, 24);
  Bot.walkTo(200);
  Bot.swap();
  Bot.expect(G.p.x < 120, "swapped back to the start");
  Bot.run(20);
  Bot.walkTo(110);
  Bot.jumpTo(150, 24);
  Bot.walkTo(300);
  Bot.swap();
  Bot.run(20);
  Bot.walkTo(395);
  Bot.swap();
  Bot.run(20);
  Bot.walkTo(490);
  Bot.swap();
  Bot.run(20);
  Bot.walkTo(512);
  Bot.jumpTo(545, 24);
  Bot.walkTo(570);
};

// 14 SECOND WIND: ride zone 1 to place a shade on the ledge, then swap to it while recording the flip,
// so the flip ends up on the ledge. Finally swap up and ride zone 2 to the exit.
SOLUTIONS["SECOND WIND"] = () => {
  const flipRest = () => G.echoes.flip && G.echoes.flip.restT > 30;
  const shadeRest = () => G.echoes.shade && G.echoes.shade.restT > 30;
  // slot 0 = shade, slot 1 = flip
  Bot.record("flip");
  Bot.walkTo(215);
  Bot.run(6);
  Bot.stop();
  Bot.record("shade");
  Bot.walkTo(130);
  Bot.waitUntil(flipRest, 900, "flip zone to open");
  Bot.dir(1);
  for (let i = 0; i < 300 && !(G.p.onGround && Bot.px() > 250 && G.p.y < 170); i++) Bot.tick();
  Bot.dir(0);
  Bot.expect(G.p.onGround && G.p.y < 170, "landed on ledge A");
  Bot.walkTo(335);
  Bot.run(6);
  Bot.stop();
  // Record the flip again; the old one vanishes, so use the shade to get up to the ledge.
  Bot.record("flip");
  Bot.select("shade");
  Bot.waitUntil(shadeRest, 900, "shade to reach the ledge");
  Bot.swap();
  Bot.expect(G.p.y < 170 && G.p.x > 240, "swapped onto ledge A");
  Bot.run(10);
  Bot.stop();
  // Final run.
  Bot.select("shade");
  Bot.waitUntil(() => shadeRest() && flipRest(), 900, "echoes to settle");
  Bot.swap();
  Bot.expect(G.p.y < 170, "swapped onto ledge A (final)");
  Bot.dir(1);
  for (let i = 0; i < 300 && !(G.p.onGround && Bot.px() > 400 && G.p.y < 50); i++) Bot.tick();
  Bot.dir(0);
  Bot.expect(G.p.onGround && G.p.y < 50, "landed on the top ledge");
  Bot.walkTo(550);
};

// HALL OF MIRRORS (the old Beacon, now the last level of tier 2)
SOLUTIONS["HALL OF MIRRORS"] = () => {
  const rest = (k) => () => G.echoes[k] && G.echoes[k].restT > 30;
  const throughWall = () => {
    Bot.walkTo(110);
    Bot.waitUntil(rest("phase"), 900, "phase to settle");
    Bot.walkTo(170);
  };
  const upToPlatform = () => {
    throughWall();
    Bot.jumpTo(200, 24);
    Bot.jumpTo(255, 24);
  };
  // slots: phase, glow, shade, flip
  Bot.record("phase");
  Bot.walkTo(110);
  Bot.run(6);
  Bot.stop();
  Bot.record("glow");
  upToPlatform();
  Bot.walkTo(320);
  Bot.run(6);
  Bot.stop();
  Bot.record("shade");
  upToPlatform();
  Bot.walkTo(250);
  Bot.expect(G.L.plates[0].pressed, "plate pressed");
  Bot.run(6);
  Bot.stop();
  const corridor = (x) => {
    throughWall();
    Bot.jumpTo(230, 24);
    Bot.waitUntil(() => rest("glow")() && G.L.doorOpen.a && G.L.thorns.every((t) => t.lit), 900, "light and door");
    Bot.walkTo(x);
  };
  Bot.record("flip");
  corridor(510);
  Bot.run(6);
  Bot.stop();
  corridor(425);
  Bot.waitUntil(rest("flip"), 600, "flip zone to open");
  Bot.dir(1);
  for (let i = 0; i < 300 && !(G.p.onGround && Bot.px() > 545 && G.p.y < 170); i++) Bot.tick();
  Bot.dir(0);
  Bot.expect(G.p.onGround && G.p.y < 170, "landed on the final ledge");
  Bot.walkTo(590);
};

// ---------------------------------------------------------------- tier 1 additions

SOLUTIONS["SUNKEN GATE"] = () => {
  const climb = () => {
    Bot.walkTo(88);
    Bot.jumpTo(118, 24); // ledge A
    Bot.jumpTo(182, 24); // ledge B
    Bot.jumpTo(242, 24); // ledge C
    Bot.jumpTo(250, 24); // hop up for the lantern above it
    Bot.jumpTo(305, 24); // platform D
  };
  Bot.record("glow");
  climb();
  Bot.walkTo(362);
  Bot.run(6);
  Bot.stop();
  climb();
  Bot.walkTo(366);
  Bot.waitUntil(() => G.L.gates.every((x) => x.open), 600, "the gate to open");
  Bot.walkTo(570);
};

SOLUTIONS["SWITCHBOARD"] = () => {
  const rest = (k) => () => G.echoes[k] && G.echoes[k].restT > 30;
  const toIsland = () => {
    Bot.walkTo(188);
    Bot.waitUntil(() => G.lights.length > 0, 900, "the switch lamp to light");
    Bot.jumpTo(212, 24);
    Bot.walkTo(392);
  };
  Bot.record("shade"); // shade on the plate
  Bot.walkTo(130);
  Bot.run(6);
  Bot.stop();
  Bot.record("glow"); // glow on the island
  toIsland();
  Bot.run(6);
  Bot.stop();
  toIsland();
  Bot.waitUntil(rest("glow"), 600, "glow to settle");
  Bot.walkTo(494);
  Bot.jumpTo(545, 24);
  Bot.walkTo(570);
};

// ---------------------------------------------------------------- tier 2 additions

// ---------------------------------------------------------------- tier 3: the tideworks
const tideOf = () => G.echoes.tide;
// Hop onto the tide echo while it waits at its start (the pedestal).
const boardAtSpawn = () => {
  Bot.jumpTo(Bot.px(), 12);
  Bot.expect(G.p.stand === tideOf(), "standing on the tide echo");
};

SOLUTIONS["FERRY"] = () => {
  Bot.record("tide");
  Bot.walkTo(172); // the left floor ends at x 180
  Bot.run(120); // wait at the edge: the echo waits too
  Bot.jumpKey(true);
  Bot.dir(1);
  for (let i = 0; i < 36; i++) Bot.tick();
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.stop();
  Bot.walkTo(172);
  Bot.waitUntil(() => Math.abs(tideOf().x + PW / 2 - 172) < 2 && G.t < 160, 600, "the tide to wait at the edge");
  Bot.jumpTo(tideOf().x + PW / 2, 12);
  Bot.expect(G.p.stand === tideOf(), "standing on the tide echo");
  const n = tideOf().trace.length;
  Bot.waitUntil(() => G.t >= 120 + 50 + 33, 900, "the ride out over the gap");
  Bot.jumpTo(345, 24);
  Bot.walkTo(570);
};

// Jump (key held) toward a resting spring, bounce on it, then steer in dirAfter until landing.
const jumpToSpring = (sx, dirAfter) => {
  Bot.jumpKey(true);
  let bounced = false;
  for (let i = 0; i < 260 && !G.won; i++) {
    const dx = sx - Bot.px();
    Bot.dir(bounced ? dirAfter : Math.abs(dx) < 3 ? 0 : Math.sign(dx));
    Bot.tick();
    if (G.dead) Bot.fail("died on the way to the spring");
    if (G.p.vy < -520) bounced = true;
    if (bounced && G.p.onGround) break;
  }
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.expect(bounced, "the spring bounced the player");
};
const restOf = (k) => () => G.echoes[k] && G.echoes[k].restT > 20;

SOLUTIONS["LIFT"] = () => {
  // slots: shade, tide
  Bot.record("shade");
  Bot.walkTo(110);
  Bot.run(6);
  Bot.stop();
  Bot.record("tide");
  Bot.run(110);
  Bot.walkTo(222);
  Bot.jumpTo(262, 24);
  Bot.jumpTo(322, 24);
  Bot.jumpTo(382, 24);
  Bot.jumpTo(442, 24);
  Bot.walkTo(462);
  Bot.run(110);
  Bot.stop();
  Bot.record("shade");
  Bot.walkTo(170);
  Bot.run(6);
  Bot.stop();
  boardAtSpawn();
  Bot.waitUntil(() => G.p.y < 112 && Bot.px() > 430, 1500, "the ride to the top");
  Bot.walkTo(590);
};

SOLUTIONS["TRAMPOLINE"] = () => {
  Bot.record("spring");
  Bot.walkTo(372);
  Bot.run(6);
  Bot.stop();
  Bot.walkTo(372);
  Bot.waitUntil(restOf("spring"), 600, "the spring to settle");
  jumpToSpring(372, 1);
  Bot.expect(G.p.y < 130, "up on the ledge");
  Bot.walkTo(470);
  Bot.jumpTo(470, 24); // the lantern high over the ledge
  Bot.walkTo(570);
};

SOLUTIONS["SKYHOOK"] = () => {
  Bot.record("spring");
  Bot.walkTo(172);
  Bot.jumpKey(true);
  Bot.dir(1);
  for (let i = 0; i < 36; i++) Bot.tick();
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.stop();
  Bot.walkTo(172);
  Bot.waitUntil(restOf("spring"), 600, "the spring to settle");
  const sx = G.echoes.spring.x + PW / 2;
  jumpToSpring(sx, 1);
  Bot.expect(G.p.y < 110, "up on the high ledge");
  Bot.walkTo(570);
};

SOLUTIONS["TWO STAGES"] = () => {
  // slots: spring, tide
  Bot.record("spring");
  Bot.walkTo(190);
  Bot.run(6);
  Bot.stop();
  Bot.record("tide");
  Bot.run(110);
  Bot.walkTo(190);
  Bot.waitUntil(restOf("spring"), 600, "the spring to settle");
  jumpToSpring(190, 1);
  Bot.expect(G.p.y < 190, "up on the middle ledge");
  Bot.walkTo(260);
  Bot.run(110);
  Bot.stop();
  Bot.record("spring");
  boardAtSpawn();
  Bot.waitUntil(() => G.p.y < 190 && Bot.px() > 205, 1500, "the ride up to the middle ledge");
  Bot.walkTo(292);
  Bot.run(6);
  Bot.stop();
  boardAtSpawn();
  Bot.waitUntil(() => G.p.y < 190 && Bot.px() > 205, 1500, "the ride up to the middle ledge");
  Bot.walkTo(292);
  Bot.waitUntil(restOf("spring"), 900, "the spring to settle on the ledge");
  jumpToSpring(292, 1);
  Bot.expect(G.p.y < 110, "up on the top ledge");
  Bot.walkTo(570);
};

SOLUTIONS["FERRY LIGHT"] = () => {
  // slots: glow, tide
  const toIsland = () => {
    Bot.walkTo(150);
    Bot.jumpTo(175, 24);
    Bot.walkTo(352);
  };
  Bot.record("glow");
  toIsland();
  Bot.run(6);
  Bot.stop();
  Bot.record("tide");
  Bot.run(110);
  toIsland();
  Bot.waitUntil(restOf("glow"), 600, "the glow to light the far planks");
  Bot.walkTo(470);
  Bot.run(110);
  Bot.stop();
  Bot.record("glow");
  boardAtSpawn();
  Bot.waitUntil(() => Bot.px() > 450 && G.p.y > 255, 1800, "the ride across the dark bridge");
  Bot.walkTo(490);
  Bot.run(6);
  Bot.stop();
  boardAtSpawn();
  Bot.waitUntil(() => Bot.px() > 450 && G.p.y > 255, 1800, "the ride across the dark bridge");
  Bot.walkTo(490);
  Bot.waitUntil(() => G.L.gates.every((x) => x.open), 900, "the gate to open");
  Bot.walkTo(590);
};

// ---------------------------------------------------------------- tier 4: the beacon
// Run up to xJump, then jump toward targetX (keeps the running speed into the jump).
const runJump = (xJump, targetX) => {
  Bot.dir(1);
  for (let i = 0; i < 300 && Bot.px() < xJump; i++) {
    Bot.tick();
    if (G.dead) Bot.fail("died on the run-up");
  }
  Bot.jumpTo(targetX, 24);
};
const gustReady = () => G.echoes.gust && G.echoes.gust.restT > 30;
// From the start, cross the 6 wide gap with the wind at its edge.
const crossWithWind = (target) => {
  Bot.walkTo(110);
  Bot.waitUntil(gustReady, 600, "the gust to start blowing");
  runJump(164, target);
};

SOLUTIONS["BREEZE"] = () => {
  Bot.record("gust");
  Bot.walkTo(172);
  Bot.run(6);
  Bot.stop();
  crossWithWind(335);
  Bot.walkTo(570);
};

SOLUTIONS["TAXI"] = () => {
  // slots: shade, tide
  Bot.record("shade");
  Bot.walkTo(90);
  Bot.run(6);
  Bot.stop();
  Bot.record("tide");
  Bot.run(110);
  Bot.walkTo(190);
  Bot.waitUntil(() => G.lights.length > 0, 600, "the bridge lamps to light");
  Bot.jumpTo(212, 24);
  Bot.walkTo(540);
  Bot.run(110);
  Bot.stop();
  Bot.record("shade");
  Bot.walkTo(150);
  Bot.run(6);
  Bot.stop();
  Bot.select("tide");
  Bot.waitUntil(() => tideOf().x + PW / 2 > 520, 900, "the tide to reach the far side");
  Bot.swap();
  Bot.expect(Bot.px() > 500, "swapped to the far side");
  Bot.waitUntil(() => G.L.doorOpen.b, 300, "door b to open");
  Bot.walkTo(610);
};

SOLUTIONS["SAIL"] = () => {
  // slots: gust, tide
  Bot.record("gust");
  Bot.walkTo(172);
  Bot.run(6);
  Bot.stop();
  Bot.record("tide");
  Bot.run(110);
  Bot.walkTo(172);
  Bot.jumpKey(true);
  Bot.dir(1);
  for (let i = 0; i < 42; i++) Bot.tick();
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.stop();
  boardAtSpawn();
  const end = tideOf().trace.length - 1;
  Bot.waitUntil(() => G.t >= end - 6, 900, "the ride out over the pit");
  Bot.jumpTo(410, 24);
  Bot.walkTo(570);
};

SOLUTIONS["CHANDELIER"] = () => {
  // slots: flip, flip2, flip3. Each zone is recorded from inside the one before it, up on the ceiling.
  const rest = (k) => () => G.echoes[k] && G.echoes[k].restT > 30;
  const toCeiling = () => {
    Bot.walkTo(100);
    Bot.waitUntil(rest("flip"), 900, "the first zone to open");
    Bot.waitUntil(() => G.p.g === -1 && G.p.onGround, 120, "to be on the ceiling");
  };
  Bot.record("flip");
  Bot.walkTo(135);
  Bot.run(6);
  Bot.stop();
  Bot.record("flip2");
  toCeiling();
  Bot.walkTo(190);
  Bot.run(6);
  Bot.stop();
  Bot.record("flip3");
  toCeiling();
  Bot.walkTo(190);
  Bot.waitUntil(rest("flip2"), 900, "the second zone to open");
  Bot.walkTo(250);
  Bot.run(6);
  Bot.stop();
  toCeiling();
  Bot.walkTo(190);
  Bot.waitUntil(rest("flip2") && rest("flip3"), 900, "the other zones to open");
  Bot.walkTo(250);
  Bot.dir(1);
  for (let i = 0; i < 300 && !(G.p.g === 1 && G.p.onGround && Bot.px() > 345); i++) Bot.tick();
  Bot.dir(0);
  Bot.expect(G.p.g === 1 && G.p.onGround && G.p.y < 60, "dropped onto the far platform");
  Bot.walkTo(560);
};

SOLUTIONS["STACKED SPRINGS"] = () => {
  // slots: spring (floor), spring2 (low ledge), glow (top, by the gate)
  // The lantern hangs right over the first spring: bounce straight up, land on the spring again, then bounce across.
  const toLedge = (lantern) => {
    Bot.walkTo(110);
    Bot.waitUntil(restOf("spring"), 600, "the first spring to settle");
    const need = lantern ? 2 : 1;
    let n = 0, prev = 0;
    Bot.jumpKey(true);
    for (let i = 0; i < 400 && !(n >= need && G.p.onGround); i++) {
      const dx = 110 - Bot.px();
      Bot.dir(n >= need ? 1 : Math.abs(dx) < 3 ? 0 : Math.sign(dx));
      Bot.tick();
      if (G.dead) Bot.fail("died at the first spring");
      if (G.p.vy < -520 && prev >= -520) n++;
      prev = G.p.vy;
    }
    Bot.jumpKey(false);
    Bot.dir(0);
    Bot.expect(G.p.y < 130, "up on the low ledge");
  };
  const toTop = (lantern) => {
    toLedge(lantern);
    Bot.walkTo(240);
    Bot.waitUntil(restOf("spring2"), 900, "the second spring to settle");
    // Let the glow echo finish replaying its own climb first, or you can land on it mid-air.
    Bot.waitUntil(() => !G.echoes.glow || !G.echoes.glow.moving, 1500, "the glow echo to finish its replay");
    jumpToSpring(240, 0);
    Bot.expect(G.p.y < 50, "up on the top ledge");
  };
  Bot.record("spring");
  Bot.walkTo(110);
  Bot.run(6);
  Bot.stop();
  Bot.record("spring2");
  toLedge(false);
  Bot.walkTo(240);
  Bot.run(6);
  Bot.stop();
  Bot.record("glow");
  toTop(true);
  Bot.expect(G.lanternsGot === 1, "the lantern over the first spring");
  Bot.walkTo(470);
  Bot.run(6);
  Bot.stop();
  toTop(false);
  Bot.walkTo(470);
  Bot.waitUntil(() => G.L.gates.every((x) => x.open), 900, "the gate to open");
  Bot.walkTo(570);
};

SOLUTIONS["CHORUS"] = () => {
  // slots: gust (right, over the floor pit), spring (shaft), gust2 (left, over the upper gap), shade (plate), glow (gate)
  const rest = (k) => () => G.echoes[k] && G.echoes[k].restT > 30;
  const runJumpLeft = (xJump, targetX) => {
    Bot.dir(-1);
    for (let i = 0; i < 300 && Bot.px() > xJump; i++) {
      Bot.tick();
      if (G.dead) Bot.fail("died on the run-up");
    }
    Bot.jumpTo(targetX, 24);
  };
  const crossFloorPit = () => {
    Bot.walkTo(110);
    Bot.waitUntil(rest("gust"), 900, "the first gust to blow");
    runJump(164, 335);
  };
  const upShaft = (lantern) => {
    Bot.walkTo(590);
    Bot.waitUntil(restOf("spring"), 900, "the spring to settle");
    jumpToSpring(590, -1);
    Bot.expect(G.p.y < 150 && Bot.px() < 560, "up on the slab");
    if (lantern) {
      Bot.walkTo(430);
      Bot.jumpTo(430, 24); // the lantern floating over the long slab
      Bot.expect(G.lanternsGot === 1, "the lantern over the slab");
    }
  };
  const crossUpperGap = () => {
    Bot.walkTo(330, 8); // the wind from the second gust makes a precise stop here awkward
    Bot.waitUntil(rest("gust2"), 900, "the second gust to blow");
    runJumpLeft(306, 139);
    Bot.expect(G.p.y < 150 && Bot.px() < 180, "across the upper gap");
  };
  Bot.record("gust");
  Bot.walkTo(172);
  Bot.run(6);
  Bot.stop();
  Bot.record("spring");
  crossFloorPit();
  Bot.walkTo(590);
  Bot.run(6);
  Bot.stop();
  Bot.record("gust2");
  crossFloorPit();
  upShaft();
  Bot.walkTo(306);
  Bot.run(6);
  Bot.stop();
  Bot.record("shade");
  crossFloorPit();
  upShaft();
  crossUpperGap();
  Bot.walkTo(150);
  Bot.run(6);
  Bot.stop();
  Bot.record("glow");
  crossFloorPit();
  upShaft();
  crossUpperGap();
  Bot.waitUntil(() => G.L.doorOpen.a, 300, "the door to open");
  Bot.walkTo(90);
  Bot.run(6);
  Bot.stop();
  crossFloorPit();
  upShaft(true);
  crossUpperGap();
  Bot.walkTo(90);
  Bot.waitUntil(() => G.L.gates.every((x) => x.open) && G.L.doorOpen.a, 600, "the gate to open");
  Bot.walkTo(30);
};

SOLUTIONS["GHOST GLASS"] = () => {
  // One phase slot, used twice: first to let a shade into the sealed plate, then moved to the wall on the route.
  Bot.record("phase");
  Bot.walkTo(112);
  Bot.run(6);
  Bot.stop();
  Bot.record("shade");
  Bot.walkTo(112);
  Bot.waitUntil(echoDone("phase"), 600, "the phase echo to settle");
  Bot.walkTo(30);
  Bot.expect(G.L.plates[0].pressed, "plate pressed in the sealed room");
  Bot.run(6);
  Bot.stop();
  Bot.record("phase");
  Bot.walkTo(232);
  Bot.run(6);
  Bot.stop();
  Bot.walkTo(232);
  Bot.waitUntil(echoDone("phase"), 600, "the phase echo to settle at the second wall");
  Bot.walkTo(330);
  Bot.waitUntil(() => G.L.doorOpen.a, 600, "the door to open");
  Bot.walkTo(570);
};

SOLUTIONS["THE BEACON"] = () => {
  // slots: phase (low wall), phase2 (high wall), shade (plate), glow (gate), glow2 (thorns), spring (shaft), flip (exit ledge)
  const rest = (k) => () => G.echoes[k] && G.echoes[k].restT > 30;
  const lower = () => {
    Bot.walkTo(110);
    Bot.waitUntil(rest("phase"), 900, "the low wall to dissolve");
    Bot.walkTo(190);
  };
  const toGate = () => {
    lower();
    Bot.waitUntil(() => G.L.doorOpen.a, 900, "the door to open");
    Bot.walkTo(390);
    Bot.waitUntil(() => G.L.gates.every((x) => x.open), 900, "the gate to open");
  };
  const upShaft = () => {
    Bot.walkTo(570);
    Bot.waitUntil(restOf("spring"), 900, "the spring to settle");
    // Straight up for the lantern at the top of the shaft, then drift left onto the slab.
    Bot.jumpKey(true);
    let bounced = false;
    for (let i = 0; i < 300; i++) {
      const dx = 570 - Bot.px();
      if (!bounced) Bot.dir(Math.abs(dx) < 3 ? 0 : Math.sign(dx));
      else Bot.dir(G.lanternsGot >= 1 || G.p.vy > 0 && G.p.y > 130 ? -1 : 0);
      Bot.tick();
      if (G.dead) Bot.fail("died in the shaft");
      if (G.p.vy < -520) bounced = true;
      if (bounced && G.p.onGround) break;
    }
    Bot.jumpKey(false);
    Bot.dir(0);
    Bot.expect(G.p.y < 130 && Bot.px() < 540, "up on the slab");
  };
  const toThorns = () => {
    toGate();
    upShaft();
    Bot.walkTo(395);
  };
  const crossThorns = () => {
    toThorns();
    Bot.waitUntil(() => G.L.thorns.every((t) => t.lit), 900, "the thorns to wither");
    Bot.walkTo(250);
  };
  Bot.record("phase");
  Bot.walkTo(110);
  Bot.run(6);
  Bot.stop();
  Bot.record("shade");
  lower();
  Bot.walkTo(210);
  Bot.run(6);
  Bot.stop();
  Bot.record("glow");
  lower();
  Bot.waitUntil(() => G.L.doorOpen.a, 900, "the door to open");
  Bot.walkTo(390);
  Bot.run(6);
  Bot.stop();
  Bot.record("spring");
  toGate();
  Bot.walkTo(570);
  Bot.run(6);
  Bot.stop();
  Bot.record("glow2");
  toGate();
  upShaft();
  Bot.walkTo(395);
  Bot.run(6);
  Bot.stop();
  Bot.record("phase2");
  crossThorns();
  Bot.run(6);
  Bot.stop();
  Bot.record("flip");
  crossThorns();
  Bot.waitUntil(rest("phase2"), 900, "the high wall to dissolve");
  Bot.walkTo(100);
  Bot.run(6);
  Bot.stop();
  crossThorns();
  Bot.waitUntil(rest("phase2") && rest("flip"), 900, "the high wall and the updraft");
  Bot.dir(-1);
  for (let i = 0; i < 300 && !G.won && !(G.p.onGround && G.p.y < 60 && Bot.px() < 85); i++) Bot.tick();
  Bot.dir(0);
  if (!G.won) {
    Bot.expect(G.p.onGround && G.p.y < 60, "landed on the exit ledge");
    Bot.walkTo(50);
  }
};

SOLUTIONS["PUMP ROOM"] = () => {
  // slots: shade, shade2 (a two-step stair for recording the tide), tide (the lift), glow (the gate).
  // Once the tide knows the way up, both shades are recorded again onto the two plates.
  const rest = (k) => () => G.echoes[k] && G.echoes[k].restT > 30;
  const ride = () => {
    boardAtSpawn();
    Bot.waitUntil(() => G.p.y < 190 && Bot.px() > 200, 1500, "the ride up onto the ledge");
  };
  Bot.record("shade");
  Bot.walkTo(170);
  Bot.run(6);
  Bot.stop();
  Bot.record("shade2");
  Bot.walkTo(150);
  Bot.waitUntil(rest("shade"), 600, "the first shade to settle");
  Bot.jumpTo(170, 24);
  Bot.expect(G.p.stand === G.echoes.shade, "standing on the first shade");
  Bot.run(6);
  Bot.stop();
  Bot.record("tide");
  Bot.run(60); // the tide waits at the spawn so you can board it there
  Bot.walkTo(150);
  Bot.waitUntil(() => rest("shade")() && rest("shade2")(), 600, "the stair to settle");
  Bot.jumpTo(170, 24);
  Bot.expect(G.p.stand === G.echoes.shade2, "standing on the second shade");
  Bot.jumpTo(172, 24);
  Bot.expect(G.p.y + PH < 210, "up on the ledge");
  Bot.walkTo(290);
  Bot.run(6);
  Bot.stop();
  Bot.record("shade");
  ride();
  Bot.walkTo(330);
  Bot.expect(G.L.plates[0].pressed, "first plate pressed");
  Bot.run(6);
  Bot.stop();
  Bot.record("shade2");
  ride();
  Bot.walkTo(390);
  Bot.expect(G.L.plates[1].pressed, "second plate pressed");
  Bot.run(6);
  Bot.stop();
  Bot.record("glow");
  ride();
  Bot.walkTo(400);
  Bot.waitUntil(() => G.L.doorOpen.a, 900, "the door to open");
  Bot.walkTo(500);
  Bot.run(6);
  Bot.stop();
  ride();
  Bot.walkTo(400);
  Bot.waitUntil(() => G.L.doorOpen.a, 900, "the door to open");
  Bot.walkTo(500);
  Bot.waitUntil(() => G.L.gates.every((x) => x.open), 900, "the gate to open");
  Bot.walkTo(570);
};

