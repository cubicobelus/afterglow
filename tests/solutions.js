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

// HALL OF MIRRORS
SOLUTIONS["HALL OF MIRRORS"] = () => {
  // slots: shade, glow, phase, flip.
  // The plate on the shelf with an eye is a light sensor (the glow shines up through the shelf); the other plate
  // needs a shade, which needs the flip to reach the shelf. The flip is then recorded again at the foot of the exit ledge.
  const rest = (k) => () => G.echoes[k] && G.echoes[k].restT > 30;
  const pastWall = () => {
    Bot.walkTo(70);
    Bot.waitUntil(rest("phase"), 900, "the glass to give way");
    Bot.walkTo(150);
  };
  Bot.record("phase");
  Bot.walkTo(70);
  Bot.run(6);
  Bot.stop();
  Bot.record("glow");
  pastWall();
  Bot.walkTo(330);
  Bot.run(6);
  Bot.stop();
  Bot.record("flip");
  pastWall();
  Bot.walkTo(260);
  Bot.run(6);
  Bot.stop();
  Bot.record("shade");
  pastWall();
  Bot.waitUntil(rest("flip"), 900, "the updraft to open");
  Bot.dir(1);
  for (let i = 0; i < 300 && !(G.p.onGround && Bot.px() > 310 && G.p.y < 190); i++) Bot.tick();
  Bot.dir(0);
  Bot.expect(G.p.onGround && G.p.y < 190, "up on the shelf");
  Bot.walkTo(390);
  Bot.expect(G.L.plates[1].pressed, "the plate on the shelf pressed");
  Bot.run(6);
  Bot.stop();
  Bot.record("flip");
  pastWall();
  Bot.waitUntil(() => G.L.doorOpen.a && G.L.doorOpen.b, 900, "the doors to open");
  Bot.walkTo(520);
  Bot.run(6);
  Bot.stop();
  pastWall();
  Bot.waitUntil(() => G.L.doorOpen.a && G.L.doorOpen.b, 900, "the doors to open");
  Bot.walkTo(405);
  Bot.waitUntil(rest("flip"), 900, "the exit updraft to open");
  Bot.dir(1);
  for (let i = 0; i < 300 && !G.won && !(G.p.onGround && Bot.px() > 565 && G.p.y < 170); i++) Bot.tick();
  Bot.dir(0);
  if (!G.won) Bot.walkTo(590);
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
  // The lantern hangs top left. A held bounce straight up from a spring there reaches it; the spring is then
  // recorded again at the foot of the ledge.
  Bot.record("spring");
  Bot.walkTo(70);
  Bot.run(6);
  Bot.stop();
  Bot.walkTo(70);
  Bot.waitUntil(restOf("spring"), 600, "the spring to settle");
  Bot.jumpKey(true);
  for (let i = 0; i < 160 && G.lanternsGot < 1; i++) {
    Bot.dir(Math.abs(70 - Bot.px()) < 3 ? 0 : Math.sign(70 - Bot.px()));
    Bot.tick();
  }
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.expect(G.lanternsGot === 1, "the lantern top left");
  Bot.record("spring");
  Bot.walkTo(372);
  Bot.run(6);
  Bot.stop();
  Bot.walkTo(372);
  Bot.waitUntil(restOf("spring"), 600, "the spring to settle");
  jumpToSpring(372, 1);
  Bot.expect(G.p.y < 130, "up on the ledge");
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

SOLUTIONS["WAYPOINT"] = () => {
  // slots: shade, phase (swap on). The exit is in a room inside a sealed building: crystal wall, then another crystal wall.
  // One phase opens only one of them, but a swap works through walls, even while recording.
  // The phase opens the front, a shade walks in and waits inside, then the phase is recorded again: during that
  // recording you swap to the shade (so you are inside the building) and walk to the inner wall.
  const rest = (k) => () => G.echoes[k] && G.echoes[k].restT > 30;
  Bot.record("phase");
  Bot.walkTo(205);
  Bot.run(6);
  Bot.stop();
  Bot.record("shade");
  Bot.walkTo(205);
  Bot.waitUntil(rest("phase"), 900, "the front wall to give way");
  Bot.walkTo(330);
  Bot.run(6);
  Bot.stop();
  Bot.record("phase");
  Bot.waitUntil(rest("shade"), 900, "the shade to settle inside");
  Bot.select("shade");
  Bot.swap();
  Bot.expect(Bot.px() > 280 && Bot.px() < 540, "inside the building");
  Bot.walkTo(430);
  Bot.run(6);
  Bot.stop();
  Bot.waitUntil(() => rest("shade")() && rest("phase")(), 900, "the echoes to settle");
  Bot.select("shade");
  Bot.swap();
  Bot.expect(Bot.px() > 280 && Bot.px() < 540, "inside the building again");
  Bot.walkTo(430);
  Bot.walkTo(510);
};

SOLUTIONS["SAIL"] = () => {
  // slots: gust, gust2. The first gust stands at the edge. The second is recorded in mid-air at the end of a wind jump: a step
  // with a wind of its own. A jump from the edge lands on it, and a second wind jump from it carries across.
  const rest = (k) => () => G.echoes[k] && G.echoes[k].restT > 30;
  const windJump = () => {
    Bot.jumpKey(true);
    Bot.dir(1);
  };
  Bot.record("gust");
  Bot.walkTo(172);
  Bot.run(6);
  Bot.stop();
  Bot.record("gust2");
  Bot.waitUntil(rest("gust"), 900, "the first gust to blow");
  Bot.walkTo(172);
  windJump();
  let found = false;
  for (let i = 0; i < 90; i++) {
    Bot.tick();
    const h = 300 - Bot.feet();
    if (i > 8 && G.p.vy > 0 && h <= 44 && h >= 28) { found = true; break; }
  }
  Bot.expect(found, "a hover window over the pit");
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.stop();
  Bot.waitUntil(() => rest("gust")() && rest("gust2")(), 900, "both gusts to blow");
  Bot.walkTo(172);
  const e = G.echoes.gust2;
  Bot.jumpTo(e.x + PW / 2, 24);
  Bot.expect(G.p.stand === e, "standing on the second gust");
  Bot.jumpTo(500, 24);
  Bot.expect(G.p.onGround && Bot.px() > 465, "across the pit");
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

SOLUTIONS["SLUICE"] = () => {
  // slots: shade, tide. The shade holds the first plate while the tide learns the route, then moves to the last plate.
  // The tide keeps visiting the first two plates, so each of those doors opens only while it is standing there.
  const convoy = () => {
    Bot.walkTo(150);
    Bot.waitUntil(() => G.L.doorOpen.a, 1500, "the tide to open the first door");
    Bot.walkTo(280, 4);
    Bot.waitUntil(() => G.L.doorOpen.b && Bot.px() < 290, 1500, "the tide to open the second door");
    Bot.walkTo(380, 4);
  };
  Bot.record("shade");
  Bot.walkTo(130);
  Bot.run(6);
  Bot.stop();
  Bot.record("tide");
  Bot.walkTo(130);
  Bot.run(90);
  Bot.walkTo(250);
  Bot.run(90);
  Bot.stop();
  Bot.record("shade");
  convoy();
  Bot.walkTo(370);
  Bot.run(6);
  Bot.stop();
  convoy();
  Bot.waitUntil(() => G.L.doorOpen.c, 300, "the last door to open");
  Bot.walkTo(570);
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

SOLUTIONS["GALLOP"] = () => {
  // slots: shade, gust. A shade hangs in the air over the first pit as a step, only so a gust can be recorded crossing
  // it. That gust then carries you over the first pit and, where it stops, blows you over the second. The shade is
  // free again and goes onto the plate.
  const rest = (k) => () => G.echoes[k] && G.echoes[k].restT > 30;
  Bot.record("shade");
  Bot.walkTo(92);
  Bot.jumpKey(true);
  Bot.dir(1);
  for (let i = 0; i < 36; i++) Bot.tick();
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.stop(); // frozen in mid air over the first pit
  Bot.record("gust");
  Bot.run(90); // it waits at the start so you can climb on later
  Bot.walkTo(92);
  Bot.waitUntil(rest("shade"), 900, "the step to settle");
  Bot.jumpTo(Bot.px() + 80, 24);
  Bot.expect(G.p.stand === G.echoes.shade, "standing on the step");
  Bot.jumpTo(264, 24);
  Bot.expect(G.p.onGround && Bot.px() > 244, "across the first pit");
  Bot.walkTo(332);
  Bot.run(6);
  Bot.stop();
  const rideAndBlow = () => {
    Bot.jumpTo(Bot.px(), 12);
    Bot.expect(G.p.stand === G.echoes.gust, "standing on the gust echo");
    Bot.waitUntil(() => Bot.px() > 320 && G.p.onGround, 3000, "the ride over the first pit");
    Bot.walkTo(300);
    Bot.waitUntil(rest("gust"), 900, "the gust to blow");
    runJump(326, 500);
    Bot.expect(G.p.onGround && Bot.px() > 464, "across the second pit");
  };
  Bot.record("shade");
  rideAndBlow();
  Bot.walkTo(510);
  Bot.run(6);
  Bot.stop();
  rideAndBlow();
  Bot.walkTo(520);
  Bot.waitUntil(() => G.L.doorOpen.a, 600, "the door to open");
  Bot.walkTo(592);
};

SOLUTIONS["AFTERIMAGE"] = () => {
  // slots: glow, phase, shade. The glow lights the far thorns once so the phase echo can cross them. After that the
  // phase echo carries you over the dark thorns, and it ends up beside the crystal wall, so it opens that too.
  // The shade holds the plate for the door, and the glow is free to go to the gate.
  const rest = (k) => () => G.echoes[k] && G.echoes[k].restT > 30;
  const toIsland = () => {
    Bot.walkTo(265);
    Bot.waitUntil(rest("glow"), 900, "the glow to light the far thorns");
  };
  const acrossOnFoot = () => {
    toIsland();
    Bot.walkTo(372);
    Bot.jumpTo(412, 24);
  };
  const ridePhase = () => {
    Bot.jumpTo(Bot.px(), 12);
    Bot.expect(G.p.stand === G.echoes.phase, "standing on the phase echo");
    Bot.waitUntil(() => Bot.px() > 425 && G.p.onGround, 2400, "the ride across the thorns");
  };
  Bot.record("glow");
  Bot.walkTo(265);
  Bot.run(6);
  Bot.stop();
  Bot.record("phase");
  Bot.run(90); // it waits at the start so you can climb on later
  acrossOnFoot();
  Bot.walkTo(430);
  Bot.run(6);
  Bot.stop();
  Bot.record("shade");
  acrossOnFoot();
  Bot.walkTo(430);
  Bot.waitUntil(rest("phase"), 900, "the crystal to give way");
  Bot.walkTo(490);
  Bot.run(6);
  Bot.stop();
  Bot.record("glow");
  ridePhase();
  Bot.waitUntil(() => G.L.doorOpen.a, 900, "the door to open");
  Bot.walkTo(548);
  Bot.run(6);
  Bot.stop();
  ridePhase();
  Bot.waitUntil(() => G.L.doorOpen.a, 900, "the door to open");
  Bot.walkTo(548);
  Bot.waitUntil(() => G.L.gates.every((x) => x.open), 900, "the gate to open");
  Bot.walkTo(612);
};

SOLUTIONS["CHORUS"] = () => {
  // slots: gust, gust2, spring, shade.
  // Gusts carry a shade over the two ground gaps; the spring sits on the plate that opens the upper door and is the
  // way up. The shade then carries you over all of that, so both gusts are free to be recorded again for the upper gaps.
  const rest = (k) => () => G.echoes[k] && G.echoes[k].restT > 30;
  const runJumpLeft = (xJump, targetX) => {
    Bot.dir(-1);
    for (let i = 0; i < 300 && Bot.px() > xJump; i++) {
      Bot.tick();
      if (G.dead) Bot.fail("died on the run-up");
    }
    Bot.jumpTo(targetX, 24);
  };
  // Echoes that are still replaying are platforms you can land on by accident, so let them all settle first.
  const settled = () => Object.values(G.echoes).every((e) => !e.moving);
  const firstGap = () => {
    Bot.walkTo(96);
    Bot.waitUntil(() => rest("gust")() && settled(), 1500, "the first gust to blow");
    runJump(104, 270);
    Bot.expect(G.p.onGround && Bot.px() > 238 && Bot.px() < 302, "on the island");
  };
  const secondGap = () => {
    Bot.waitUntil(() => rest("gust2")() && settled(), 1500, "the island gust to blow");
    runJump(288, 455);
    Bot.expect(G.p.onGround && Bot.px() > 424, "across the ground gaps");
  };
  const bounceUp = () => {
    Bot.walkTo(570);
    Bot.waitUntil(restOf("spring"), 900, "the spring to settle");
    Bot.jumpKey(true);
    let bounced = false;
    for (let i = 0; i < 300; i++) {
      const dx = 570 - Bot.px();
      Bot.dir(!bounced ? (Math.abs(dx) < 3 ? 0 : Math.sign(dx)) : Bot.px() > 510 ? -1 : 0);
      Bot.tick();
      if (G.dead) Bot.fail("died in the shaft");
      if (G.p.vy < -520) bounced = true;
      if (bounced && G.p.onGround) break;
    }
    Bot.jumpKey(false);
    Bot.dir(0);
    Bot.expect(G.p.y < 150 && Bot.px() > 482 && Bot.px() < 540, "up on the slab, right of the door");
  };
  const boardShade = () => {
    Bot.jumpTo(Bot.px(), 12);
    Bot.expect(G.p.stand === G.echoes.shade, "standing on the shade");
    Bot.waitUntil(() => G.p.y < 150 && Bot.px() < 450, 3000, "the ride up and over");
  };
  // 1 and 2: the gusts for the ground gaps
  Bot.record("gust");
  Bot.walkTo(112);
  Bot.run(6);
  Bot.stop();
  Bot.record("gust2");
  firstGap();
  Bot.walkTo(290);
  Bot.run(6);
  Bot.stop();
  // 3: the spring on the plate
  Bot.record("spring");
  firstGap();
  secondGap();
  Bot.walkTo(570);
  Bot.run(6);
  Bot.stop();
  // 4: the shade that will carry you
  Bot.record("shade");
  Bot.run(90);
  firstGap();
  secondGap();
  bounceUp();
  Bot.waitUntil(() => G.L.doorOpen.a, 300, "the upper door to open");
  Bot.walkTo(435);
  Bot.run(6);
  Bot.stop();
  // 5 and 6: ride over the ground, then record both gusts again for the upper gaps
  Bot.record("gust");
  boardShade();
  Bot.walkTo(432);
  Bot.run(6);
  Bot.stop();
  Bot.record("gust2");
  boardShade();
  Bot.walkTo(440);
  Bot.waitUntil(rest("gust"), 900, "the first upper gust to blow");
  runJumpLeft(428, 271);
  Bot.expect(G.p.onGround && Bot.px() > 238 && Bot.px() < 302, "on the upper island");
  Bot.walkTo(252);
  Bot.run(6);
  Bot.stop();
  // the climb
  boardShade();
  Bot.walkTo(440);
  Bot.waitUntil(rest("gust"), 900, "the first upper gust to blow");
  runJumpLeft(428, 271);
  Bot.walkTo(270);
  Bot.jumpTo(270, 24); // the lantern floating over the upper island
  Bot.expect(G.lanternsGot === 1, "the lantern over the upper island");
  Bot.waitUntil(rest("gust2"), 900, "the island gust to blow");
  Bot.dir(-1);
  for (let i = 0; i < 80 && Bot.px() > 248; i++) Bot.tick();
  Bot.jumpTo(92, 24);
  Bot.expect(G.p.onGround && G.p.y < 150 && Bot.px() < 124, "across the last gap");
  Bot.walkTo(40);
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

SOLUTIONS["SLINGSHOT"] = () => {
  // slots: glow, spring. The glow lights the planks once so a spring can walk across; that spring ends up at the foot of
  // the tall ledge, so it carries you over the dark planks and then launches you up. The glow goes to the gate.
  const rest = (k) => () => G.echoes[k] && G.echoes[k].restT > 30;
  const crossOnFoot = () => {
    Bot.walkTo(92);
    Bot.waitUntil(rest("glow"), 900, "the glow to light the planks");
    Bot.jumpTo(115, 24);
    Bot.walkTo(190);
    Bot.jumpTo(274, 24);
  };
  const rideAndLaunch = () => {
    Bot.jumpTo(Bot.px(), 12);
    Bot.expect(G.p.stand === G.echoes.spring, "standing on the spring echo");
    Bot.waitUntil(() => Bot.px() > 440 && G.p.onGround, 3000, "the ride over the planks");
    Bot.waitUntil(restOf("spring"), 600, "the spring to settle");
    jumpToSpring(455, 1);
    Bot.expect(G.p.y < 130, "up on the ledge");
  };
  Bot.record("glow");
  Bot.walkTo(92);
  Bot.run(6);
  Bot.stop();
  // The lantern hangs high over the landing. A held bounce from a spring there reaches it, but that spring has to
  // be recorded again afterwards, at the foot of the ledge.
  Bot.record("spring");
  crossOnFoot();
  Bot.walkTo(290);
  Bot.run(6);
  Bot.stop();
  crossOnFoot();
  Bot.walkTo(290);
  Bot.waitUntil(restOf("spring"), 900, "the spring to settle");
  Bot.jumpKey(true);
  for (let i = 0; i < 160 && G.lanternsGot < 1; i++) {
    Bot.dir(Math.abs(290 - Bot.px()) < 3 ? 0 : Math.sign(290 - Bot.px()));
    Bot.tick();
  }
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.expect(G.lanternsGot === 1, "the lantern over the landing");
  Bot.record("spring");
  Bot.run(90); // it waits at the start so you can climb on later
  crossOnFoot();
  Bot.walkTo(455);
  Bot.run(6);
  Bot.stop();
  Bot.record("glow");
  rideAndLaunch();
  Bot.walkTo(500);
  Bot.run(6);
  Bot.stop();
  rideAndLaunch();
  Bot.walkTo(500);
  Bot.waitUntil(() => G.L.gates.every((x) => x.open), 900, "the gate to open");
  Bot.walkTo(592);
};

SOLUTIONS["PUMP ROOM"] = () => {
  // slots: shade, shade2 (the second one hangs in mid air, a hover step above the first), tide (the lift), glow (the gate).
  // The ledge is too high for anything but that hover stair. Once the tide knows the way up, both shades are
  // recorded again onto the two plates.
  const rest = (k) => () => G.echoes[k] && G.echoes[k].restT > 30;
  const ride = () => {
    boardAtSpawn();
    Bot.waitUntil(() => G.p.y < 150 && Bot.px() > 200, 1800, "the ride up onto the ledge");
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
  Bot.jumpKey(true);
  for (let i = 0; i < 60; i++) {
    Bot.tick();
    if (G.p.vy < -150 && G.p.y <= 226 && G.p.y >= 212) break;
  }
  Bot.jumpKey(false);
  Bot.stop(); // frozen in mid air about 64 px above the first shade
  Bot.record("tide");
  Bot.run(60); // the tide waits at the spawn so you can board it there
  Bot.walkTo(150);
  Bot.waitUntil(() => rest("shade")() && rest("shade2")(), 600, "the stair to settle");
  Bot.jumpTo(170, 6); // a short hop: a higher arc would pass the hover step and be caught by it when ridden later
  Bot.expect(G.p.stand === G.echoes.shade, "standing on the first shade");
  Bot.jumpTo(170, 24);
  Bot.expect(G.p.stand === G.echoes.shade2, "standing on the hover step");
  Bot.jumpTo(172, 24);
  Bot.expect(G.p.y + PH < 170, "up on the ledge");
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

SOLUTIONS["STAY BEHIND"] = () => {
  // One spring. It carries you up onto the block; on the plate you swap with it, so you are back down here and the
  // spring stays on the plate, holding the door open.
  Bot.record("spring");
  Bot.walkTo(270);
  Bot.run(6);
  Bot.stop();
  Bot.waitUntil(restOf("spring"), 900, "the spring to settle");
  Bot.walkTo(230);
  jumpToSpring(270, 1);
  Bot.expect(G.p.onGround && G.p.y < 160 && Bot.px() > 342, "up on the block");
  Bot.walkTo(430);
  Bot.expect(G.L.plates[0].pressed, "standing on the plate");
  Bot.swap();
  Bot.expect(Bot.px() < 300 && G.p.y > 250, "back down at the spring's place");
  Bot.waitUntil(() => G.L.doorOpen.a, 300, "the door to open");
  Bot.walkTo(30);
};

SOLUTIONS["APEX"] = () => {
  // One spring. It throws you up to the hanging plate; at the top of the bounce you swap with it, so the spring is left
  // up there holding the plate and you land back where it stood, with the door open.
  Bot.record("spring");
  Bot.walkTo(230);
  Bot.run(6);
  Bot.stop();
  Bot.waitUntil(restOf("spring"), 900, "the spring to settle");
  Bot.walkTo(190);
  const plate = G.L.plates[0];
  Bot.jumpKey(true);
  let bounced = false, swapped = false;
  for (let i = 0; i < 260 && !swapped; i++) {
    const dx = 230 - Bot.px();
    Bot.dir(bounced ? 0 : Math.abs(dx) < 3 ? 0 : Math.sign(dx));
    Bot.tick();
    if (G.dead) Bot.fail("died on the way up");
    if (G.p.vy < -520) bounced = true;
    if (bounced && overlap(G.p, plate)) { Bot.jumpKey(false); Bot.swap(); swapped = true; }
  }
  Bot.jumpKey(false);
  Bot.expect(swapped, "reached the plate at the top of the bounce");
  Bot.run(20);
  Bot.expect(G.L.doorOpen.a, "the spring holds the hanging plate");
  Bot.walkTo(570);
};

SOLUTIONS["TWO BANKS"] = () => {
  // slots: shade, spring. The door answers to a plate on the block and a plate hanging in the air.
  // The spring is recorded first. The shade is then recorded riding it up onto the block, so it holds that plate.
  // Last, you bounce on the spring and swap with it at the top of the bounce: the spring stays up there on the
  // hanging plate and you land back on the floor, with the door open.
  Bot.record("spring");
  Bot.walkTo(370);
  Bot.run(6);
  Bot.stop();
  Bot.waitUntil(restOf("spring"), 900, "the spring to settle");
  Bot.record("shade");
  Bot.walkTo(410);
  jumpToSpring(370, -1);
  Bot.expect(G.p.onGround && G.p.y < 160 && Bot.px() < 298, "up on the block");
  Bot.walkTo(210);
  Bot.run(6);
  Bot.stop();
  Bot.waitUntil(() => restOf("spring")() && restOf("shade")(), 1500, "the echoes to settle");
  Bot.walkTo(410);
  Bot.select("spring");
  const hang = G.L.plates.find((q) => q.ceil);
  Bot.jumpKey(true);
  let bounced = false, swapped = false;
  for (let i = 0; i < 260 && !swapped; i++) {
    const dx = 370 - Bot.px();
    Bot.dir(bounced ? 0 : Math.abs(dx) < 3 ? 0 : Math.sign(dx));
    Bot.tick();
    if (G.dead) Bot.fail("died on the way up");
    if (G.p.vy < -520) bounced = true;
    if (bounced && overlap(G.p, hang)) { Bot.jumpKey(false); Bot.swap(); swapped = true; }
  }
  Bot.jumpKey(false);
  Bot.expect(swapped, "reached the hanging plate at the top of the bounce");
  Bot.expect(G.p.onGround || G.p.y > 250, "back on the floor");
  Bot.waitUntil(() => G.L.doorOpen.a, 300, "the door to open");
  Bot.walkTo(610);
};

SOLUTIONS["UPSIDE DOWN"] = () => {
  // One flip. It starts at the foot of the corridor; you fall up to the ceiling inside its zone and walk along it.
  // At the edge of the zone you swap: you go back to the echo, and the echo (with its zone) is left where you stood.
  const flipRest = () => G.echoes.flip && G.echoes.flip.restT > 30;
  const onCeiling = () => G.p.g === -1 && G.p.onGround;
  Bot.record("flip");
  Bot.walkTo(70);
  Bot.run(6);
  Bot.stop();
  Bot.waitUntil(flipRest, 600, "the zone to open");
  Bot.walkTo(90);
  Bot.waitUntil(onCeiling, 400, "to fall up to the ceiling");
  const stops = [118, 182, 246, 310, 374, 440]; // the last swap is made under the plate, so the echo is left holding it
  for (const x of stops) {
    Bot.dir(1);
    for (let i = 0; i < 400 && Bot.px() < x; i++) { Bot.tick(); if (G.dead) Bot.fail("died on the ceiling walk at " + Math.round(Bot.px())); }
    Bot.dir(0);
    Bot.run(6);
    Bot.swap();
    Bot.waitUntil(onCeiling, 300, "back on the ceiling after the swap at " + x);
  }
  Bot.expect(G.L.plates[0].pressed, "the echo holds the ceiling plate");
  Bot.dir(1);
  for (let i = 0; i < 600 && !(G.p.g === 1 && G.p.onGround && Bot.px() > 505); i++) { Bot.tick(); if (G.dead) Bot.fail("died on the last stretch at " + Math.round(Bot.px())); }
  Bot.dir(0);
  Bot.expect(G.p.onGround && Bot.px() > 505, "down on the far platform");
  Bot.waitUntil(() => G.L.doorOpen.a, 120, "the door to open");
  Bot.walkTo(590);
};

SOLUTIONS["NIGHT TRAIN"] = () => {
  // slots: glow, spring. The planks are only solid in the glow's light, and one glow does not reach across, so you
  // hop it forward with swap. The spring is recorded during such a crossing, so it ends up waiting at the foot of the
  // block on the far bank; the real crossing then ends with a bounce.
  const rest = (k) => () => G.echoes[k] && G.echoes[k].restT > 30;
  const crossBridge = () => {
    Bot.waitUntil(rest("glow"), 900, "the glow to settle");
    Bot.walkTo(110);
    Bot.jumpTo(150, 24);
    Bot.walkTo(200);
    Bot.swap();
    Bot.run(20);
    Bot.walkTo(110);
    Bot.jumpTo(150, 24);
    Bot.walkTo(300);
    Bot.swap();
    Bot.run(20);
    Bot.walkTo(395);
    Bot.swap();
    Bot.run(20);
    Bot.walkTo(470);
    Bot.expect(G.p.onGround && Bot.px() > 440, "across the bridge and through the gate");
  };
  Bot.record("glow");
  Bot.walkTo(100);
  Bot.run(6);
  Bot.stop();
  Bot.record("spring");
  Bot.select("glow");
  crossBridge();
  Bot.walkTo(490);
  Bot.run(6);
  Bot.stop();
  Bot.select("glow");
  Bot.waitUntil(() => rest("spring")() && rest("glow")(), 4000, "both echoes to settle");
  crossBridge();
  Bot.waitUntil(rest("spring"), 600, "the spring to be ready");
  Bot.walkTo(445);
  jumpToSpring(490, 1);
  Bot.expect(G.p.y < 160 && Bot.px() > 542, "up on the block");
  Bot.walkTo(590);
};

SOLUTIONS["THREE PANES"] = () => {
  // slots: phase, phase2. The first phase opens the first wall. The second stands between the first two walls, near
  // enough to both for its circle to hold them open. The first is then recorded again between walls two and three.
  const rest = (k) => () => G.echoes[k] && G.echoes[k].restT > 30;
  Bot.record("phase");
  Bot.walkTo(100);
  Bot.run(6);
  Bot.stop();
  Bot.record("phase2");
  Bot.waitUntil(rest("phase"), 900, "the first wall to give way");
  Bot.walkTo(170);
  Bot.run(6);
  Bot.stop();
  Bot.record("phase");
  Bot.waitUntil(rest("phase2"), 900, "the first two walls to give way");
  Bot.walkTo(250);
  Bot.run(6);
  Bot.stop();
  Bot.waitUntil(() => rest("phase")() && rest("phase2")(), 900, "all three walls to give way");
  Bot.walkTo(590);
};

SOLUTIONS["STEP UP"] = () => {
  // slots: shade, shade2. The first shade is recorded in mid-jump against the block, a step in the air.
  // The second climbs it, walks onto the ledge and stands on the plate.
  Bot.record("shade");
  Bot.walkTo(176);
  Bot.jumpKey(true);
  Bot.dir(1);
  let found = false;
  for (let i = 0; i < 90; i++) {
    Bot.tick();
    const h = 300 - Bot.feet();
    if (i > 8 && G.p.vy > 0 && h <= 44 && h >= 28) { found = true; break; }
  }
  Bot.expect(found, "a hover window beside the block");
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.stop();
  Bot.record("shade2");
  Bot.waitUntil(() => !G.echoes.shade.moving, 600, "the step to settle");
  const step = G.echoes.shade;
  Bot.walkTo(160);
  Bot.jumpTo(step.x + PW / 2, 24);
  Bot.expect(G.p.stand === step, "standing on the step");
  Bot.jumpTo(250, 24);
  Bot.expect(G.p.onGround && G.p.y < 210, "up on the ledge");
  Bot.walkTo(250);
  Bot.run(6);
  Bot.stop();
  Bot.waitUntil(() => !G.echoes.shade.moving && !G.echoes.shade2.moving, 900, "the echoes to settle");
  Bot.walkTo(160);
  Bot.jumpTo(step.x + PW / 2, 24);
  Bot.jumpTo(280, 24);
  Bot.walkTo(335);
  Bot.waitUntil(() => G.L.doorOpen.a, 300, "the door to open");
  Bot.walkTo(570);
};

SOLUTIONS["FOUR PANES"] = () => {
  // slots: phase, phase2, phase3. Each circle holds two walls open if it stands between them.
  // phase at the first wall, phase2 between walls 1 and 2, phase3 between 2 and 3, then phase again between 3 and 4.
  const rest = (k) => () => G.echoes[k] && G.echoes[k].restT > 30;
  Bot.record("phase");
  Bot.walkTo(100);
  Bot.run(6);
  Bot.stop();
  Bot.record("phase2");
  Bot.waitUntil(rest("phase"), 900, "the first wall to give way");
  Bot.walkTo(170);
  Bot.run(6);
  Bot.stop();
  Bot.record("phase3");
  Bot.waitUntil(rest("phase2"), 900, "the first two walls to give way");
  Bot.walkTo(250);
  Bot.run(6);
  Bot.stop();
  Bot.record("phase");
  Bot.waitUntil(() => rest("phase2")() && rest("phase3")(), 900, "walls 1 to 3 to give way");
  Bot.walkTo(330);
  Bot.run(6);
  Bot.stop();
  Bot.waitUntil(() => rest("phase")() && rest("phase2")() && rest("phase3")(), 900, "all four walls to give way");
  Bot.walkTo(590);
};

SOLUTIONS["WATCHTOWER"] = () => {
  // slots: shade, spring. The door needs both hanging plates. At the top of a straight bounce you swap with the shade, which
  // stays up on the first plate. At the top of a bounce that drifts right you swap with the spring, which stays on the second.
  const restB = () => restOf("spring")() && restOf("shade")();
  const bounceAndSwap = (plate, drift, slot) => {
    Bot.select(slot);
    Bot.jumpKey(true);
    let bounced = false, swapped = false;
    for (let i = 0; i < 300 && !swapped; i++) {
      const dx = 230 - Bot.px();
      Bot.dir(bounced ? (drift ? 1 : 0) : Math.abs(dx) < 3 ? 0 : Math.sign(dx));
      Bot.tick();
      if (G.dead) Bot.fail("died on the way up");
      if (G.p.vy < -520) bounced = true;
      if (bounced && overlap(G.p, plate)) { Bot.jumpKey(false); Bot.swap(); swapped = true; }
    }
    Bot.jumpKey(false);
    Bot.dir(0);
    Bot.expect(swapped, "reached the plate at the top of the bounce");
  };
  Bot.record("spring");
  Bot.walkTo(230);
  Bot.run(6);
  Bot.stop();
  Bot.record("shade");
  Bot.walkTo(190);
  Bot.run(6);
  Bot.stop();
  Bot.waitUntil(restB, 1200, "the echoes to settle");
  const plates = G.L.plates;
  Bot.walkTo(205);
  bounceAndSwap(plates[0], false, "shade");
  Bot.run(20);
  Bot.walkTo(205);
  bounceAndSwap(plates[1], true, "spring");
  Bot.run(20);
  Bot.expect(G.L.doorOpen.a, "both plates held");
  Bot.walkTo(570);
};

SOLUTIONS["GLASS CEILING"] = () => {
  // slots: flip, phase. The flip zone is hopped along the ceiling with swap, as in Upside Down. A wall of glass stands across
  // the road, so the phase is recorded during such a walk and left hanging on the ceiling just before the wall.
  const flipRest = () => G.echoes.flip && G.echoes.flip.restT > 30;
  const phaseRest = () => G.echoes.phase && G.echoes.phase.restT > 30;
  const onCeiling = () => G.p.g === -1 && G.p.onGround;
  const hopTo = (x) => {
    Bot.dir(1);
    for (let i = 0; i < 500 && Bot.px() < x; i++) { Bot.tick(); if (G.dead) Bot.fail("died on the ceiling walk at " + Math.round(Bot.px())); }
    Bot.dir(0);
    Bot.run(6);
  };
  const hop = (x) => {
    hopTo(x);
    Bot.select("flip");
    Bot.swap();
    Bot.waitUntil(onCeiling, 300, "back on the ceiling after the swap at " + x);
  };
  Bot.record("flip");
  Bot.walkTo(70);
  Bot.run(6);
  Bot.stop();
  Bot.record("phase");
  Bot.waitUntil(flipRest, 600, "the zone to open");
  Bot.walkTo(90);
  Bot.waitUntil(onCeiling, 400, "to fall up to the ceiling");
  hop(118);
  hop(182);
  hopTo(240);
  Bot.stop();
  Bot.waitUntil(() => flipRest() && phaseRest(), 3000, "both echoes to settle");
  Bot.walkTo(90);
  Bot.waitUntil(onCeiling, 400, "to fall up to the ceiling");
  for (const x of [118, 182, 246, 310, 374, 438]) hop(x);
  Bot.dir(1);
  for (let i = 0; i < 700 && !(G.p.g === 1 && G.p.onGround && Bot.px() > 505); i++) { Bot.tick(); if (G.dead) Bot.fail("died on the last stretch at " + Math.round(Bot.px())); }
  Bot.dir(0);
  Bot.expect(G.p.onGround && Bot.px() > 505, "down on the far platform");
  Bot.walkTo(590);
};

SOLUTIONS["CLOCKWORK"] = () => {
  // slots: shade, tide, tide2. Each door answers to the plate before it. The shade holds the first plate for good. The first tide
  // waits on the second plate and the second tide on the third; you slip through each door while its tide is standing there.
  const rest = (k) => () => G.echoes[k] && G.echoes[k].restT > 30;
  // the shade holds the first plate
  Bot.record("shade");
  Bot.walkTo(110);
  Bot.run(6);
  Bot.stop();
  // the first tide waits on the second plate
  Bot.record("tide");
  Bot.waitUntil(rest("shade"), 600, "the first door to open");
  Bot.walkTo(230);
  Bot.run(260);
  Bot.stop();
  // the second tide waits on the third plate; the first door is held open, the second while the first tide stands there
  Bot.record("tide2");
  Bot.waitUntil(rest("shade"), 600, "the first door to open");
  Bot.walkTo(290);
  Bot.waitUntil(() => G.L.doorOpen.b, 2500, "the first tide to open the second door");
  Bot.walkTo(350);
  Bot.run(260);
  Bot.stop();
  // the real run
  Bot.waitUntil(rest("shade"), 600, "the first door to open");
  Bot.walkTo(290);
  Bot.waitUntil(() => G.L.doorOpen.b, 2500, "the first tide to open the second door");
  Bot.walkTo(390);
  Bot.waitUntil(() => G.L.doorOpen.c, 2500, "the second tide to open the third door");
  Bot.walkTo(570);
};

SOLUTIONS["UP AND OVER"] = () => {
  // slots: shade, spring. The plate is on a ledge high on the left; the exit is up a block on the right. The spring is recorded
  // under the ledge so a shade can go up and stand on the plate (opening the door), then recorded again at the foot of the block.
  Bot.record("spring");
  Bot.walkTo(130);
  Bot.run(6);
  Bot.stop();
  Bot.record("shade");
  Bot.waitUntil(restOf("spring"), 900, "the spring to settle");
  Bot.walkTo(100);
  // straight up beside the ledge, then left once above it (steering left too early bumps the underside)
  Bot.jumpKey(true);
  let bounced = false;
  for (let i = 0; i < 300; i++) {
    const dx = 130 - Bot.px();
    Bot.dir(bounced ? (Bot.feet() < 134 ? -1 : 0) : Math.abs(dx) < 3 ? 0 : Math.sign(dx));
    Bot.tick();
    if (G.dead) Bot.fail("died on the way to the ledge");
    if (G.p.vy < -520) bounced = true;
    if (bounced && G.p.onGround) break;
  }
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.expect(G.p.onGround && G.p.y < 140, "up on the ledge");
  Bot.walkTo(70);
  Bot.run(6);
  Bot.stop();
  Bot.record("spring");
  Bot.waitUntil(() => G.L.doorOpen.a, 900, "the shade to open the door");
  Bot.walkTo(295);
  Bot.run(6);
  Bot.stop();
  Bot.waitUntil(() => G.L.doorOpen.a && restOf("spring")(), 900, "the door and the spring");
  Bot.walkTo(250);
  jumpToSpring(295, 1);
  Bot.expect(G.p.y < 160 && Bot.px() > 342, "up on the block");
  Bot.walkTo(580);
};

SOLUTIONS["TWO UPDRAFTS"] = () => {
  // slots: shade, flip. Both ledges are too high to jump. The flip zone at the foot of the left ledge throws a shade up onto the plate
  // (which opens the door); the flip is then recorded again at the foot of the right ledge and throws you up to the exit.
  const rest = (k) => () => G.echoes[k] && G.echoes[k].restT > 30;
  Bot.record("flip");
  Bot.walkTo(140);
  Bot.run(6);
  Bot.stop();
  // the shade rides the first zone up onto the left ledge and stands on the plate
  Bot.record("shade");
  Bot.waitUntil(rest("flip"), 600, "the zone to open");
  Bot.dir(-1);
  for (let i = 0; i < 300 && !(G.p.onGround && Bot.px() < 90 && G.p.y < 170); i++) { Bot.tick(); if (G.dead) Bot.fail("died on the way up"); }
  Bot.dir(0);
  Bot.expect(G.p.onGround && G.p.y < 170, "up on the left ledge");
  Bot.walkTo(50);
  Bot.run(6);
  Bot.stop();
  // the flip moves to the foot of the right ledge
  Bot.record("flip");
  Bot.waitUntil(() => G.L.doorOpen.a, 900, "the shade to open the door");
  Bot.walkTo(360);
  Bot.run(6);
  Bot.stop();
  // the real run
  Bot.waitUntil(() => G.L.doorOpen.a && rest("flip")(), 900, "the door and the zone");
  Bot.walkTo(300);
  Bot.dir(1);
  for (let i = 0; i < 300 && !(G.p.onGround && Bot.px() > 420 && G.p.y < 170); i++) { Bot.tick(); if (G.dead) Bot.fail("died on the way up"); }
  Bot.dir(0);
  Bot.expect(G.p.onGround && G.p.y < 170, "up on the right ledge");
  Bot.walkTo(570);
};

SOLUTIONS["STAIRCASE"] = () => {
  // slots: shade, shade2, shade3. The ledge is 160 px up. The first shade hangs in mid-jump against the block, the second is
  // recorded by jumping off the first and hanging higher, and the third climbs both and stands on the plate.
  const hover = (loHeight, hiHeight, fromX) => {
    Bot.jumpKey(true);
    Bot.dir(1);
    let found = false;
    for (let i = 0; i < 100; i++) {
      Bot.tick();
      const h = 300 - Bot.feet();
      if (i > 8 && G.p.vy > 0 && h <= hiHeight && h >= loHeight) { found = true; break; }
    }
    Bot.expect(found, "a hover window at " + loHeight + " to " + hiHeight);
    Bot.jumpKey(false);
    Bot.dir(0);
    Bot.stop();
  };
  Bot.record("shade");
  Bot.walkTo(170);
  hover(30, 40);
  Bot.record("shade2");
  Bot.waitUntil(() => !G.echoes.shade.moving, 600, "the first step to settle");
  const s1 = G.echoes.shade;
  Bot.walkTo(150);
  Bot.jumpTo(s1.x + PW / 2, 24);
  Bot.expect(G.p.stand === s1, "standing on the first step");
  // jump from the first step toward the block and hang near the top of the jump
  Bot.jumpKey(true);
  Bot.dir(1);
  let found = false;
  for (let i = 0; i < 100; i++) {
    Bot.tick();
    if (i > 6 && G.p.vy > 0 && G.p.y >= 192 && G.p.y <= 206) { found = true; break; }
  }
  Bot.expect(found, "a hover window on the way down from the second jump");
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.stop();
  Bot.record("shade3");
  Bot.waitUntil(() => !G.echoes.shade.moving && !G.echoes.shade2.moving, 900, "the stairs to settle");
  const s2 = G.echoes.shade2;
  Bot.walkTo(150);
  Bot.jumpTo(s1.x + PW / 2, 24);
  Bot.expect(G.p.stand === s1, "on the first step");
  Bot.jumpTo(s2.x + PW / 2, 24);
  Bot.expect(G.p.stand === s2, "on the second step");
  Bot.jumpTo(250, 24);
  Bot.expect(G.p.onGround && G.p.y < 150, "up on the ledge");
  Bot.walkTo(250);
  Bot.run(6);
  Bot.stop();
  Bot.waitUntil(() => ["shade", "shade2", "shade3"].every((k) => !G.echoes[k].moving), 1200, "the echoes to settle");
  Bot.walkTo(150);
  Bot.jumpTo(s1.x + PW / 2, 24);
  Bot.jumpTo(s2.x + PW / 2, 24);
  Bot.jumpTo(280, 24);
  Bot.walkTo(335);
  Bot.waitUntil(() => G.L.doorOpen.a, 300, "the door to open");
  Bot.walkTo(570);
};

SOLUTIONS["STONE AND SAIL"] = () => {
  // slots: gust. The pit is too wide to jump, too wide for a step plus a jump, and too wide for wind alone. A gust frozen in mid-air over
  // the pit is a step, and standing on it you are inside its wind, so the second jump carries across.
  Bot.record("gust");
  Bot.walkTo(130);
  Bot.jumpKey(true);
  Bot.dir(1);
  let found = false;
  for (let i = 0; i < 90; i++) {
    Bot.tick();
    const h = 300 - Bot.feet();
    if (i > 8 && G.p.vy > 0 && h <= 44 && h >= 28) { found = true; break; }
  }
  Bot.expect(found, "a hover window over the pit");
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.stop();
  Bot.walkTo(104);
  Bot.waitUntil(() => G.echoes.gust.restT > 30, 900, "the gust to settle");
  const e = G.echoes.gust;
  Bot.jumpTo(e.x + PW / 2, 24);
  Bot.expect(G.p.stand === e, "standing on the gust");
  Bot.jumpTo(420, 24);
  Bot.expect(G.p.onGround && Bot.px() > 345, "across the pit");
  Bot.walkTo(570);
};

SOLUTIONS["LIGHT STEP"] = () => {
  // slots: glow. The planks are solid only in light, and a light on the ground at the edge reaches less than half of them.
  // A glow frozen in mid-air over the pit lights most of the bridge, and the last stretch is a short jump.
  Bot.record("glow");
  Bot.walkTo(130);
  Bot.jumpKey(true);
  Bot.dir(1);
  let found = false;
  for (let i = 0; i < 90; i++) {
    Bot.tick();
    const h = 300 - Bot.feet();
    if (i > 8 && G.p.vy > 0 && h <= 44 && h >= 28) { found = true; break; }
  }
  Bot.expect(found, "a hover window over the pit");
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.stop();
  Bot.walkTo(120);
  Bot.waitUntil(() => G.echoes.glow.restT > 30, 900, "the glow to settle");
  Bot.jumpTo(160, 24);
  Bot.walkTo(290);
  Bot.jumpTo(420, 24);
  Bot.expect(G.p.onGround && G.p.y > 270 && Bot.px() > 372, "across the pit");
  Bot.walkTo(570);
};
