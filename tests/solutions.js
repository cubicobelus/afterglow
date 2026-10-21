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
  // First hang a shade in the air as a step and jump from it to the lantern; then record the shade on the plate.
  Bot.record("shade");
  Bot.walkTo(156, 3);
  Bot.jumpKey(true);
  let found = false;
  for (let i = 0; i < 80; i++) {
    Bot.tick();
    const h = 300 - Bot.feet();
    if (i > 8 && G.p.vy > 0 && h <= 40 && h >= 28) { found = true; break; }
  }
  Bot.expect(found, "a hover window beside the lantern");
  Bot.jumpKey(false);
  Bot.stop();
  Bot.waitUntil(() => G.echoes.shade.restT > 30, 900, "the step to settle");
  const e = G.echoes.shade;
  Bot.walkTo(e.x + 6 - 30, 3);
  Bot.jumpTo(e.x + 6, 24);
  Bot.expect(G.p.stand === e, "standing on the step");
  Bot.jumpKey(true);
  for (let i = 0; i < 30; i++) Bot.tick();
  Bot.jumpKey(false);
  Bot.expect(G.lanternsGot === 1, "the lantern above the step");
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
  Bot.walkTo(150);
  Bot.run(6);
  Bot.stop();
  // The hatch dissolves once the phase echo is there; drop in and stand on the plate.
  Bot.walkTo(150, 3);
  Bot.waitUntil(echoDone("phase"), 600, "phase echo to settle");
  Bot.record("shade");
  Bot.walkTo(150, 3);
  Bot.waitUntil(() => G.p.onGround && G.p.y > 320, 160, "player to drop into the vault");
  Bot.walkTo(150, 3);
  Bot.expect(G.L.plates[0].pressed, "plate pressed in the vault");
  Bot.run(6);
  Bot.stop();
  Bot.walkTo(90);
  Bot.waitUntil(() => G.L.doorOpen.a && echoDone("phase")() && echoDone("shade")(), 900, "door open");
  // Drop into the vault for the lantern, then climb back out to the left through the open hatch.
  Bot.dir(1);
  for (let i = 0; i < 200 && !(G.p.onGround && G.p.y > 320); i++) Bot.tick();
  Bot.dir(-1);
  for (let i = 0; i < 200 && G.lanternsGot < 1; i++) Bot.tick();
  Bot.dir(0);
  Bot.expect(G.lanternsGot === 1, "the lantern under the left lip");
  Bot.walkTo(150);
  Bot.jumpTo(105, 24);
  Bot.walkTo(110);
  Bot.jumpTo(195, 24);
  Bot.walkTo(400);
  Bot.walkTo(570);
};

// 9 TWO KEYS
// 10 OVERHEAD
SOLUTIONS["OVERHEAD"] = () => {
  // A low tunnel with a pit in the floor: the flip echo stands at the lip and the ceiling is the road across.
  // First a flip next to the spawn lifts you up to the lantern above it; the flip is then recorded again at the pit.
  const rest = () => G.echoes.flip && G.echoes.flip.restT > 30;
  Bot.record("flip");
  Bot.walkTo(84, 3);
  Bot.run(10);
  Bot.stop();
  Bot.waitUntil(rest, 600, "the first flip to settle");
  Bot.waitUntil(() => G.lanternsGot === 1, 300, "the lift to the lantern");
  Bot.record("flip");
  Bot.walkTo(228, 3);
  Bot.run(10);
  Bot.stop();
  Bot.waitUntil(rest, 600, "flip echo to settle");
  Bot.dir(1);
  for (let i = 0; i < 300 && !(G.p.onGround && Bot.px() > 340); i++) Bot.tick();
  Bot.dir(0);
  Bot.expect(G.p.onGround && Bot.px() > 340, "across the pit");
  Bot.expect(G.lanternsGot === 1, "the lantern above the spawn");
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
// HALL OF MIRRORS
SOLUTIONS["HALL OF MIRRORS"] = () => {
  // slots: shade, phase, flip. The phase stands on the floor plate, which holds the wall open and one door. The flip lifts the
  // shade onto the shelf plate (the other door), then is recorded again at the foot of the exit block.
  const rest = (k) => () => G.echoes[k] && G.echoes[k].restT > 30;
  const pastWall = () => {
    Bot.walkTo(90);
    Bot.waitUntil(rest("phase"), 900, "the glass to give way");
    Bot.walkTo(172);
  };
  Bot.record("phase");
  Bot.walkTo(110, 3);
  Bot.run(10);
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
  Bot.walkTo(370, 3);
  Bot.expect(G.L.plates.some((p) => p.id === "b" && p.pressed), "the shelf plate pressed");
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
  // The lantern lies at the bottom right, past the thorn bed. A glow hung over the middle of the bed lights nine of the
  // fourteen thorn tiles, and the dark ones at either end are short enough to jump. Then the glow is recorded again, beside
  // the gate (the one slot does both jobs).
  const climb = () => {
    Bot.walkTo(88);
    Bot.jumpTo(118, 24); // ledge A
    Bot.jumpTo(182, 24); // ledge B
    Bot.jumpTo(242, 24); // ledge C
    Bot.jumpTo(305, 24); // platform D
  };
  // First recording: jump off ledge A and stop in mid air over the bed.
  Bot.record("glow");
  Bot.walkTo(88);
  Bot.jumpTo(118, 24);
  Bot.walkTo(128);
  Bot.jumpKey(true);
  Bot.dir(1);
  let hung = false;
  for (let i = 0; i < 80; i++) {
    Bot.tick();
    if (G.dead) Bot.fail("died hanging the glow");
    if (i > 10 && G.p.vy > 0 && G.p.y >= 232) { hung = true; break; }
  }
  Bot.expect(hung, "the glow hangs over the thorns");
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.stop();
  // A real run for the lantern (it only counts outside a recording): hop the dark thorns at each end, walk the lit ones.
  Bot.waitUntil(() => G.L.thorns.filter((t) => t.lit).length >= 9, 900, "the thorns to wither");
  Bot.walkTo(92);
  Bot.jumpTo(172, 24);
  Bot.walkTo(330);
  Bot.jumpTo(390, 24);
  Bot.expect(G.lanternsGot === 1, "the lantern at the bottom right");
  Bot.jumpTo(320, 24);
  Bot.walkTo(172);
  Bot.jumpTo(88, 24);
  // Second recording: the glow goes to the platform beside the gate.
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

SOLUTIONS["GATEHOUSE"] = () => {
  // slots: shade, glow. The shade hangs in the air beside the ledge as a step. The glow is recorded climbing it and resting
  // by the gate. Both are needed again on the real run.
  Bot.record("shade");
  Bot.walkTo(256);
  Bot.jumpKey(true);
  Bot.dir(1);
  let found = false;
  for (let i = 0; i < 90; i++) {
    Bot.tick();
    const h = 300 - Bot.feet();
    if (i > 8 && G.p.vy > 0 && h <= 44 && h >= 28) { found = true; break; }
  }
  Bot.expect(found, "a hover window beside the ledge");
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.stop();
  const climb = () => {
    Bot.waitUntil(() => G.echoes.shade.restT > 30 && (!G.echoes.glow || G.echoes.glow.restT > 30), 900, "the echoes to settle");
    Bot.walkTo(240);
    Bot.jumpTo(G.echoes.shade.x + PW / 2, 24);
    Bot.expect(G.p.stand === G.echoes.shade, "standing on the step");
    Bot.jumpTo(330, 24);
    Bot.expect(G.p.onGround && G.p.y < 190, "up on the ledge");
  };
  Bot.record("glow");
  climb();
  Bot.walkTo(390);
  Bot.run(6);
  Bot.stop();
  climb();
  Bot.walkTo(380);
  Bot.waitUntil(() => G.L.gates.every((x) => x.open), 900, "the gate to open");
  Bot.walkTo(570);
};

SOLUTIONS["SWITCHBOARD"] = () => {
  // slots: shade, glow. The plate that lights the bridge lamp is up on a ledge. The glow hangs in mid jump beside the block as a step,
  // the shade climbs it and stands on the plate. After that the step is not needed: the shade jumps up the block on every attempt and
  // you ride it, so it is the lift as well as the holder, and the glow is recorded again on the island.
  const rest = (k) => () => G.echoes[k] && G.echoes[k].restT > 30;
  const ride = () => {
    Bot.run(5);
    Bot.jumpTo(Bot.px(), 12);
    Bot.expect(G.p.stand === G.echoes.shade, "standing on the shade");
    Bot.waitUntil(rest("shade"), 900, "the shade to settle on the plate");
    Bot.expect(G.p.y < 215, "up on the ledge");
  };
  const toIsland = () => {
    Bot.walkTo(188);
    Bot.waitUntil(() => G.lights.length > 0, 900, "the switch lamp to light");
    Bot.jumpTo(212, 24);
    Bot.walkTo(392);
  };
  Bot.record("glow");
  Bot.walkTo(76);
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
  Bot.record("shade");
  Bot.waitUntil(() => !G.echoes.glow.moving, 600, "the step to settle");
  Bot.run(40); // wait at the spawn: later you board it there
  Bot.walkTo(55);
  Bot.jumpTo(G.echoes.glow.x + PW / 2, 24);
  Bot.expect(G.p.stand === G.echoes.glow, "standing on the step");
  Bot.jumpTo(130, 24);
  Bot.expect(G.p.onGround && G.p.y < 210, "up on the ledge");
  Bot.walkTo(130);
  Bot.run(6);
  Bot.stop();
  Bot.record("glow"); // the step goes: the shade carries you instead
  ride();
  toIsland();
  Bot.run(6);
  Bot.stop();
  ride();
  toIsland();
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
  // slots: shade, tide (the lift, and the holder of the second plate), glow (the second step, then the gate).
  // The ledge is too high for anything but a two-step stair: the shade stands on the floor and the glow hangs in mid air above it.
  // Once the tide knows the way up and ends by waiting on the second plate, the shade is recorded again onto the first plate and the
  // glow moves to the gate.
  const rest = (k) => () => G.echoes[k] && G.echoes[k].restT > 30;
  const ride = () => {
    boardAtSpawn();
    Bot.waitUntil(() => G.p.y < 150 && Bot.px() > 200, 1800, "the ride up onto the ledge");
  };
  Bot.record("shade");
  Bot.walkTo(170);
  Bot.run(6);
  Bot.stop();
  Bot.record("glow");
  Bot.walkTo(150);
  Bot.waitUntil(rest("shade"), 600, "the first step to settle");
  Bot.jumpTo(170, 24);
  Bot.expect(G.p.stand === G.echoes.shade, "standing on the first step");
  Bot.jumpKey(true);
  for (let i = 0; i < 60; i++) {
    Bot.tick();
    if (G.p.vy < -150 && G.p.y <= 226 && G.p.y >= 212) break;
  }
  Bot.jumpKey(false);
  Bot.stop(); // frozen in mid air about 64 px above the first step
  Bot.record("tide");
  Bot.run(60); // the tide waits at the spawn so you can board it there
  Bot.walkTo(150);
  Bot.waitUntil(() => rest("shade")() && rest("glow")(), 600, "the stair to settle");
  Bot.jumpTo(170, 6); // a short hop: a higher arc would pass the hover step and be caught by it when ridden later
  Bot.expect(G.p.stand === G.echoes.shade, "standing on the first step");
  Bot.jumpTo(170, 24);
  Bot.expect(G.p.stand === G.echoes.glow, "standing on the hover step");
  Bot.jumpTo(172, 24);
  Bot.expect(G.p.y + PH < 170, "up on the ledge");
  Bot.walkTo(390);
  Bot.expect(G.L.plates[1].pressed, "second plate pressed");
  Bot.run(420); // a long wait: the tide holds the plate for as long as you did
  Bot.stop();
  Bot.record("shade");
  ride();
  Bot.walkTo(330);
  Bot.expect(G.L.plates[0].pressed, "first plate pressed");
  Bot.run(6);
  Bot.stop();
  Bot.record("glow");
  ride();
  Bot.walkTo(400);
  Bot.waitUntil(() => G.L.doorOpen.a, 1200, "the door to open");
  Bot.walkTo(500);
  Bot.run(6);
  Bot.stop();
  ride();
  Bot.walkTo(400);
  Bot.waitUntil(() => G.L.doorOpen.a, 1200, "the door to open");
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

SOLUTIONS["STAGECOACH"] = () => {
  // slots: shade, spring. A bed of spikes lies between you and the block. A shade hung in mid-jump over the bed is the step the spring
  // is recorded from; the spring ends at the foot of the block, so it carries you over the spikes and then throws you up the block.
  // The shade is then recorded again, riding the spring up, to stand on the plate that opens the door at the top.
  const ride = () => {
    Bot.jumpTo(Bot.px(), 12);
    Bot.expect(G.p.stand === G.echoes.spring, "standing on the spring");
    Bot.waitUntil(() => G.echoes.spring.restT > 10, 3000, "the ride over the spikes");
  };
  Bot.record("shade");
  Bot.walkTo(110);
  Bot.jumpKey(true);
  Bot.dir(1);
  let found = false;
  for (let i = 0; i < 90; i++) {
    Bot.tick();
    const h = 300 - Bot.feet();
    if (i > 8 && G.p.vy > 0 && h <= 44 && h >= 28) { found = true; break; }
  }
  Bot.expect(found, "a hover window over the spikes");
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.stop();
  Bot.record("spring");
  Bot.run(90);
  Bot.waitUntil(() => !G.echoes.shade.moving, 300, "the step to settle");
  Bot.walkTo(110);
  Bot.jumpTo(G.echoes.shade.x + PW / 2, 24);
  Bot.expect(G.p.stand === G.echoes.shade, "standing on the step");
  Bot.jumpTo(310, 24);
  Bot.expect(G.p.onGround && Bot.px() > 264, "across the spikes");
  Bot.walkTo(350);
  Bot.run(6);
  Bot.stop();
  Bot.record("shade");
  ride();
  jumpToSpring(350, 1);
  Bot.expect(G.p.y < 160 && Bot.px() > 402, "up on the block");
  Bot.walkTo(450);
  Bot.run(6);
  Bot.stop();
  ride();
  jumpToSpring(350, 1);
  Bot.expect(G.p.y < 160 && Bot.px() > 402, "up on the block again");
  Bot.walkTo(500);
  Bot.waitUntil(() => G.L.doorOpen.a, 300, "the door to open");
  Bot.walkTo(592);
};

SOLUTIONS["WEATHERVANE"] = () => {
  // slots: shade, gust. You start on a platform between two pits. The exit is across the left pit behind a door, and the plate that opens
  // it is across the right pit. A gust facing right gets a shade over to the plate; the gust is then recorded again facing left, so it
  // blows you over to the door.
  const rest = (k) => () => G.echoes[k] && G.echoes[k].restT > 30;
  const jumpAcross = (dir, from, target) => {
    Bot.dir(dir);
    for (let i = 0; i < 300 && (dir > 0 ? Bot.px() < from : Bot.px() > from); i++) { Bot.tick(); if (G.dead) Bot.fail("died on the run-up"); }
    Bot.jumpTo(target, 24);
  };
  Bot.record("gust");
  Bot.walkTo(392);
  Bot.run(6);
  Bot.stop();
  Bot.record("shade");
  Bot.waitUntil(rest("gust"), 900, "the wind to blow");
  jumpAcross(1, 380, 570);
  Bot.expect(G.p.onGround && Bot.px() > 545, "across the right pit");
  Bot.walkTo(570);
  Bot.run(6);
  Bot.stop();
  Bot.record("gust");
  Bot.walkTo(290);
  Bot.run(6);
  Bot.stop();
  Bot.waitUntil(() => rest("gust")() && rest("shade")(), 900, "the wind and the shade");
  jumpAcross(-1, 296, 100);
  Bot.expect(G.p.onGround && Bot.px() < 142, "across the left pit");
  Bot.waitUntil(() => G.L.doorOpen.a, 300, "the door to open");
  Bot.walkTo(30);
};


SOLUTIONS["LOOKING GLASS"] = () => {
  // slots: shade, phase, flip. A flip hung in the air lifts the shade to the ceiling button. The flip's zone also covers the low
  // door, so it is recorded again at the lip of the pit. The phase is then recorded standing on the ceiling road over the pit,
  // where its circle reaches the wall of glass at the far edge.
  const rest = (k) => () => G.echoes[k] && G.echoes[k].restT > 30;
  const onCeiling = () => G.p.g === -1 && G.p.onGround && G.p.y < 205;
  Bot.record("flip");
  Bot.walkTo(125, 3);
  Bot.jumpKey(true);
  for (let i = 0; i < 10; i++) Bot.tick();
  Bot.jumpKey(false);
  Bot.stop();
  Bot.record("shade");
  Bot.waitUntil(rest("flip"), 900, "the hanging flip to settle");
  Bot.dir(1);
  for (let i = 0; i < 400 && !onCeiling(); i++) Bot.tick();
  Bot.expect(onCeiling(), "on the porch ceiling");
  Bot.dir(-1);
  for (let i = 0; i < 400 && Bot.px() > 112; i++) Bot.tick();
  Bot.dir(0);
  Bot.run(10);
  Bot.expect(G.L.plates[0].pressed, "the ceiling button pressed");
  Bot.run(20);
  Bot.stop();
  Bot.record("flip");
  Bot.waitUntil(() => rest("shade")() && G.L.doorOpen.a, 900, "the low door to open");
  Bot.walkTo(228, 3);
  Bot.run(10);
  Bot.stop();
  Bot.record("phase");
  Bot.waitUntil(() => rest("shade")() && rest("flip")() && G.L.doorOpen.a, 900, "the shade and the flip to settle");
  Bot.walkTo(200, 3);
  Bot.dir(1);
  for (let i = 0; i < 300 && !(G.p.g === -1 && G.p.onGround); i++) Bot.tick();
  Bot.expect(G.p.g === -1 && G.p.onGround, "on the ceiling road");
  for (let i = 0; i < 300 && Bot.px() < 280; i++) Bot.tick();
  Bot.dir(0);
  Bot.run(20);
  Bot.stop();
  Bot.waitUntil(() => rest("shade")() && rest("flip")() && rest("phase")() && G.L.doorOpen.a, 1200, "all three to settle");
  Bot.dir(1);
  for (let i = 0; i < 1200 && !(G.p.onGround && G.p.g === 1 && Bot.px() > 380); i++) Bot.tick();
  Bot.dir(0);
  Bot.expect(G.p.onGround && Bot.px() > 380, "across the pit and through the glass");
  Bot.walkTo(570);
};

SOLUTIONS["HALF OPEN"] = () => {
  // One phase, placed off to one side of the plug: it opens part of the glass and the rest is the second step.
  const rest = (k) => () => G.echoes[k] && G.echoes[k].restT > 30;
  Bot.record("phase");
  Bot.walkTo(255, 3);
  Bot.dir(1);
  for (let i = 0; i < 300 && Bot.px() < 270; i++) Bot.tick();
  Bot.dir(0);
  Bot.run(10);
  Bot.stop();
  Bot.waitUntil(rest("phase"), 900, "the phase echo to settle");
  Bot.walkTo(590, 3);
  Bot.expect(G.lanternsGot === 1, "the lantern at the dead end of the tunnel");
  Bot.walkTo(270, 3);
  Bot.dir(1);
  for (let i = 0; i < 300 && Bot.px() < 286; i++) Bot.tick();
  Bot.dir(0);
  // First jump through the opening onto the leftover glass, second jump out of the shaft.
  for (let rep = 0; rep < 3 && !(G.p.onGround && G.p.y < 175); rep++) {
    Bot.jumpKey(true);
    for (let i = 0; i < 45; i++) { Bot.dir(i > 14 ? 1 : 0); Bot.tick(); }
    Bot.jumpKey(false);
    for (let i = 0; i < 40; i++) { Bot.dir(1); Bot.tick(); }
  }
  Bot.dir(0);
  Bot.expect(G.p.y < 175, "up in the room");
  Bot.walkTo(Bot.px() + 1);
  // Cross the shaft in the room floor and reach the door.
  Bot.dir(1);
  for (let i = 0; i < 600 && !G.won; i++) {
    if (G.p.onGround && Bot.px() > 330 && Bot.px() < 345) Bot.jumpKey(true); else if (G.p.onGround) Bot.jumpKey(false);
    Bot.tick();
  }
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.expect(G.won, "at the door");
};

SOLUTIONS["SKYLIGHT"] = () => {
  // slots: phase, flip, flip2. The phase hangs at the top of a jump under the glass; the flip hangs lower, so its field lifts you
  // far enough to go through the hole. The second flip is recorded up in the room at the lip of the pit in the low road.
  const rest = (k) => () => G.echoes[k] && G.echoes[k].restT > 30;
  Bot.record("phase");
  Bot.walkTo(310, 3);
  Bot.jumpKey(true);
  for (let i = 0; i < 18; i++) Bot.tick();
  Bot.jumpKey(false);
  Bot.stop();
  Bot.record("flip");
  Bot.waitUntil(rest("phase"), 900, "the phase echo to settle");
  Bot.walkTo(290, 3);
  Bot.jumpKey(true);
  for (let i = 0; i < 8; i++) Bot.tick();
  Bot.jumpKey(false);
  Bot.stop();
  Bot.record("flip2");
  Bot.waitUntil(() => rest("phase")() && rest("flip")(), 900, "the phase and the flip to settle");
  Bot.dir(1);
  for (let i = 0; i < 700 && !(G.p.onGround && G.p.g === 1 && G.p.y < 170 && Bot.px() > 350); i++) Bot.tick();
  Bot.dir(0);
  Bot.expect(G.p.onGround && G.p.y < 170, "up in the room");
  Bot.walkTo(388, 3);
  Bot.run(10);
  Bot.stop();
  Bot.waitUntil(() => rest("phase")() && rest("flip")() && rest("flip2")(), 1500, "all three to settle");
  Bot.dir(1);
  for (let i = 0; i < 1500 && !G.won; i++) Bot.tick();
  Bot.dir(0);
  Bot.expect(G.won, "across the pit and out");
};

SOLUTIONS["LONG CROSSING"] = () => {
  // slots: tide, tide2, spring. The first tide hangs out over the gap. The second is recorded while riding the first, so it is
  // a longer ferry, and the first tide is free afterwards. The spring is recorded on the far bank, at the foot of the block.
  // The first slot is then used again as a lift down into the chasm for the lantern.
  const A = () => G.echoes.tide, B = () => G.echoes.tide2;
  const edge = (t, lo, hi) => Math.abs(t().x + PW / 2 - 112) < 3 && t().y >= lo && t().y <= hi;
  const rideTo = (t, minX) => {
    let prev = -1;
    for (let i = 0; i < 700; i++) {
      Bot.tick();
      const x = t().x;
      if (x < prev - 0.01 && x > minX) return;
      prev = x;
    }
    Bot.fail("the ferry never reached its far end");
  };
  const boardResting = (t, lo, hi) => {
    Bot.walkTo(112, 3);
    Bot.waitUntil(() => edge(t, lo, hi), 1500, "the ferry to wait at the edge");
    Bot.jumpKey(true);
    for (let i = 0; i < 40 && G.p.stand !== t(); i++) Bot.tick();
    Bot.jumpKey(false);
  };
  // 1: the first ferry
  Bot.record("tide");
  Bot.walkTo(112, 3);
  Bot.run(120);
  Bot.jumpKey(true);
  Bot.dir(1);
  for (let i = 0; i < 36; i++) Bot.tick();
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.stop();
  // 2: the second ferry, recorded while riding the first
  Bot.record("tide2");
  Bot.walkTo(112, 3);
  Bot.waitUntil(() => edge(A, 280, 300) && G.t < 200, 900, "the first ferry to wait at the edge");
  Bot.jumpTo(A().x + PW / 2, 12);
  Bot.expect(G.p.stand === A(), "standing on the first ferry");
  rideTo(A, 170);
  Bot.jumpKey(true);
  Bot.dir(1);
  for (let i = 0; i < 32; i++) { if (i === 24) Bot.jumpKey(false); Bot.tick(); }
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.stop();
  // 3: the spring at the foot of the block, reached on the second ferry
  Bot.record("spring");
  boardResting(B, 262, 272);
  rideTo(B, 230);
  Bot.jumpKey(true);
  Bot.dir(1);
  for (let i = 0; i < 140; i++) {
    if (i === 24) Bot.jumpKey(false);
    Bot.tick();
    if (i > 10 && G.p.onGround) break;
  }
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.expect(G.p.onGround && Bot.px() > 345, "on the far bank");
  Bot.walkTo(412, 3);
  Bot.run(6);
  Bot.stop();
  // 4: the first slot again, as a lift down into the chasm
  Bot.record("tide");
  Bot.walkTo(112, 2);
  Bot.run(40);
  Bot.dir(1);
  for (let i = 0; i < 200; i++) {
    if (i === 8) Bot.dir(0);
    Bot.tick();
    if (G.p.y >= 336) break;
  }
  Bot.dir(0);
  Bot.stop();
  Bot.walkTo(112, 3);
  Bot.waitUntil(() => edge(A, 280, 300) && G.t < 70, 900, "the lift to wait at the edge");
  Bot.jumpTo(A().x + PW / 2, 12);
  Bot.expect(G.p.stand === A(), "standing on the lift");
  for (let i = 0; i < 300 && G.lanternsGot < 1; i++) Bot.tick();
  Bot.expect(G.lanternsGot === 1, "the lantern at the bottom of the chasm");
  // 5: the way across
  Bot.waitUntil(() => edge(A, 280, 300) && G.p.stand === A(), 600, "the lift to come back up to the edge");
  Bot.dir(-1);
  for (let i = 0; i < 14; i++) Bot.tick();
  Bot.dir(0);
  boardResting(B, 262, 272);
  rideTo(B, 230);
  Bot.jumpKey(true);
  Bot.dir(1);
  for (let i = 0; i < 140; i++) {
    if (i === 24) Bot.jumpKey(false);
    Bot.tick();
    if (i > 10 && G.p.onGround) break;
  }
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.expect(G.p.onGround && Bot.px() > 345, "on the far bank");
  Bot.walkTo(412, 3);
  Bot.waitUntil(restOf("spring"), 900, "the spring to settle");
  jumpToSpring(412, 1);
  Bot.expect(G.p.y < 130, "up on the block");
  Bot.walkTo(570);
};

// ---------------------------------------------------------------- tier 6 to 10 temporary levels: just run and jump
const runAndJump = (xs, hold) => {
  const done = new Set();
  let held = 0;
  Bot.dir(1);
  for (let i = 0; i < 1500 && !G.won; i++) {
    const x = Bot.px();
    if (held === 0 && G.p.onGround) {
      for (const jx of xs) if (!done.has(jx) && x >= jx) { done.add(jx); held = hold || 24; Bot.jumpKey(true); break; }
    }
    Bot.tick();
    if (Bot.px() > 0 && held > 0) { held--; if (held === 0) Bot.jumpKey(false); }
    if (G.dead) Bot.fail("died on the way");
  }
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.expect(G.won, "reached the door");
};
SOLUTIONS["SHALLOWS TEMP"] = () => runAndJump([168, 266, 428]);
SOLUTIONS["WRECK TEMP"] = () => runAndJump([148, 268, 408]);
SOLUTIONS["GARDEN TEMP"] = () => runAndJump([128, 328]);
SOLUTIONS["TRENCH TEMP"] = () => runAndJump([168, 308]);
SOLUTIONS["FOUNDATION TEMP"] = () => runAndJump([128, 190, 308]);

// ---------------------------------------------------------------- the lab: one room per new echo
SOLUTIONS["CALM"] = () => {
  // The vent blows back across the gap; a calm by the edge silences it.
  Bot.record("calm");
  Bot.walkTo(176, 8);
  Bot.run(10);
  Bot.stop();
  Bot.waitUntil(() => G.echoes.calm.restT > 40, 900, "the calm to settle");
  Bot.dir(1);
  for (let i = 0; i < 300 && Bot.px() < 192; i++) Bot.tick();
  Bot.jumpKey(true);
  for (let i = 0; i < 160; i++) { if (i === 26) Bot.jumpKey(false); Bot.tick(); if (G.dead) Bot.fail("fell in the gap"); if (G.p.onGround && i > 20) break; }
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.expect(G.p.onGround && Bot.px() > 266, "across the gap");
  Bot.walkTo(570);
};
SOLUTIONS["MIRROR"] = () => {
  // Walk right a little: the puppet walks left from the far side and stands on the plate behind the door.
  Bot.record("mirror");
  Bot.walkTo(146, 3);
  Bot.run(10);
  Bot.stop();
  Bot.waitUntil(() => G.L.doorOpen.a, 900, "the door to open");
  Bot.walkTo(570);
};
SOLUTIONS["FLOAT"] = () => {
  Bot.record("float");
  Bot.walkTo(330, 3);
  Bot.run(10);
  Bot.stop();
  Bot.waitUntil(() => G.echoes.float.restT > 40, 900, "the float to settle");
  Bot.walkTo(372, 3);
  Bot.dir(1);
  Bot.jumpKey(true);
  for (let i = 0; i < 200; i++) { if (i === 40) Bot.jumpKey(false); Bot.tick(); if (G.p.onGround && i > 30) break; }
  Bot.jumpKey(false);
  Bot.expect(G.p.onGround && G.p.y < 190, "up on the ledge");
  Bot.walkTo(570);
};
SOLUTIONS["PULL"] = () => {
  // A pull hung in the air over the middle of the gap catches you mid jump and holds you there until you walk out of it.
  Bot.record("pull");
  Bot.walkTo(174, 3);
  Bot.dir(1);
  Bot.jumpKey(true);
  for (let i = 0; i < 28; i++) { if (i === 22) Bot.jumpKey(false); Bot.tick(); }
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.stop();
  Bot.waitUntil(() => G.echoes.pull.restT > 40, 900, "the pull to settle");
  Bot.dir(1);
  for (let i = 0; i < 200 && Bot.px() < 172; i++) Bot.tick();
  Bot.jumpKey(true);
  for (let i = 0; i < 300; i++) { if (i === 22) Bot.jumpKey(false); Bot.tick(); if (G.dead) Bot.fail("fell into the gap"); if (i > 20 && G.p.onGround && Bot.px() > 305) break; }
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.expect(G.p.onGround && Bot.px() > 305, "across the gap");
  Bot.walkTo(570);
};
SOLUTIONS["SLOW"] = () => {
  // The tide passes over the plate and the door is three tiles thick. A slow ring around the plate makes the tide linger.
  Bot.record("tide");
  Bot.walkTo(250, 3);
  Bot.run(30);
  Bot.stop();
  Bot.record("slow");
  Bot.walkTo(150, 3);
  Bot.run(10);
  Bot.stop();
  Bot.waitUntil(() => G.echoes.slow.restT > 30, 900, "the slow ring to settle");
  Bot.walkTo(268, 3);
  for (let i = 0; i < 900 && Bot.px() < 350; i++) {
    if (G.L.doorOpen.a) Bot.dir(1); else if (Bot.px() > 272) Bot.dir(-1); else Bot.dir(0);
    Bot.tick();
    if (G.dead) Bot.fail("crushed by the door");
  }
  Bot.expect(Bot.px() > 350, "through the door");
  Bot.walkTo(570);
};
SOLUTIONS["SHRINK"] = () => {
  Bot.record("shrink");
  Bot.walkTo(200, 3);
  Bot.run(10);
  Bot.stop();
  Bot.waitUntil(() => G.echoes.shrink.restT > 30, 900, "the shrink ring to settle");
  Bot.dir(1);
  for (let i = 0; i < 700 && !G.won; i++) Bot.tick();
  Bot.dir(0);
  Bot.expect(G.won, "through the tunnel");
};
SOLUTIONS["VINE"] = () => {
  Bot.record("vine");
  Bot.walkTo(388, 3);
  Bot.run(10);
  Bot.stop();
  Bot.walkTo(388, 3);
  Bot.waitUntil(() => G.vines.length && G.vines[0].base - G.vines[0].top >= 118, 400, "the vine to grow");
  Bot.walkTo(G.vines[0].x, 2);
  Bot.jumpKey(true);
  for (let i = 0; i < 400 && !G.won; i++) {
    Bot.dir(G.p.y < 190 ? 1 : 0);
    Bot.tick();
    if (G.dead) Bot.fail("fell");
    if (G.p.onGround && G.p.y < 170 && Bot.px() > 405) Bot.jumpKey(false);
  }
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.expect(G.won, "up the vine and to the door");
};

SOLUTIONS["BEAM"] = () => {
  // A beam recorded facing the thorns lights the whole bed.
  Bot.record("beam");
  Bot.walkTo(130, 3);
  Bot.run(10);
  Bot.stop();
  Bot.waitUntil(() => G.echoes.beam.restT > 30, 900, "the beam to settle");
  Bot.walkTo(130, 3);
  Bot.dir(1);
  for (let i = 0; i < 700 && !G.won; i++) { Bot.tick(); if (G.dead) Bot.fail("died on the thorns"); }
  Bot.dir(0);
  Bot.expect(G.won, "across the thorns");
};
SOLUTIONS["REFLECTOR"] = () => {
  // Stand in the beam from the ceiling facing left (a backslash) and it turns toward the gate.
  Bot.record("reflector");
  Bot.walkTo(424, 3);
  Bot.dir(-1);
  for (let i = 0; i < 100 && Bot.px() > 411; i++) Bot.tick();
  Bot.dir(0);
  Bot.run(10);
  Bot.stop();
  Bot.waitUntil(() => G.echoes.reflector.restT > 30, 900, "the reflector to settle");
  Bot.waitUntil(() => G.L.gates.some((g) => g.open), 300, "the gate to open");
  Bot.walkTo(570);
};
SOLUTIONS["FORK"] = () => {
  // Stay on the first plate, then go to the second and stay. The twin repeats it later, so for a while both plates are held.
  Bot.record("fork");
  Bot.walkTo(170, 3);
  Bot.run(240);
  Bot.walkTo(230, 3);
  Bot.run(10);
  Bot.stop();
  Bot.walkTo(300, 3);
  for (let i = 0; i < 1500 && Bot.px() < 350; i++) {
    if (G.L.doorOpen.a) Bot.dir(1); else Bot.dir(Bot.px() > 304 ? -1 : 0);
    Bot.tick();
    if (G.dead) Bot.fail("crushed by the door");
  }
  Bot.expect(Bot.px() > 350, "through the door");
  Bot.walkTo(570);
};
SOLUTIONS["SHIFT"] = () => {
  // A shift ring inside the tunnel: the dark bridge appears and the gold block vanishes.
  Bot.record("shift");
  Bot.walkTo(170, 3);
  Bot.run(10);
  Bot.stop();
  Bot.waitUntil(() => G.echoes.shift.restT > 30, 900, "the shift ring to settle");
  Bot.dir(1);
  for (let i = 0; i < 700 && !G.won; i++) { Bot.tick(); if (G.dead) Bot.fail("fell off the bridge"); }
  Bot.dir(0);
  Bot.expect(G.won, "across the bridge and through the block");
};
