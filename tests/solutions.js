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
  Bot.record(0);
  Bot.walkTo(190);
  Bot.run(8);
  Bot.stop();
  Bot.waitUntil(() => G.L.doorOpen.a, 400, "door open");
  Bot.route([["to", 420], ["jump", 500], ["to", 550]]);
};

// 3 STEPPING STONE: freeze an echo in mid air over the gap, stand on it, hop across.
SOLUTIONS["STEPPING STONE"] = () => {
  Bot.record(0);
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
  Bot.jumpTo(420, 24);
  Bot.walkTo(560);
};

// Shared route: from spawn onto the platform in the thorn levels (L5, L6). Ends standing at the landing spot.
const toThornPlatform = () => {
  Bot.walkTo(150);
  Bot.jumpTo(180, 24); // onto the step
  Bot.jumpTo(235, 24); // across the gap onto the platform
};

// 4 LAMPLIGHT
SOLUTIONS["LAMPLIGHT"] = () => {
  const toIsland = () => {
    Bot.walkTo(150);
    Bot.jumpTo(175, 24);
    Bot.walkTo(348);
  };
  Bot.record(0);
  toIsland();
  Bot.run(6);
  Bot.stop();
  toIsland();
  Bot.waitUntil(echoDone("glow"), 600, "glow echo to settle");
  Bot.walkTo(446);
  Bot.jumpTo(500, 24);
  Bot.walkTo(570);
};

// 5 THORN HALL
SOLUTIONS["THORN HALL"] = () => {
  Bot.record(0);
  toThornPlatform();
  Bot.walkTo(310);
  Bot.run(6);
  Bot.stop();
  Bot.walkTo(150);
  Bot.jumpTo(210, 24);
  Bot.waitUntil(() => G.L.thorns.every((t) => t.lit), 900, "thorns to wither");
  Bot.walkTo(440);
  Bot.walkTo(570);
};

// 6 RELAY
SOLUTIONS["RELAY"] = () => {
  Bot.record(1);
  toThornPlatform();
  Bot.walkTo(310);
  Bot.run(6);
  Bot.stop();
  Bot.record(0);
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
  Bot.record(0);
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
  Bot.record(0);
  Bot.walkTo(330);
  Bot.run(6);
  Bot.stop();
  // The hatch dissolves once the phase echo is there; drop in and stand on the plate.
  Bot.walkTo(330, 3);
  Bot.waitUntil(echoDone("phase"), 600, "phase echo to settle");
  Bot.record(1);
  Bot.walkTo(330, 3);
  Bot.waitUntil(() => G.p.onGround && G.p.y > 320, 160, "player to drop into the vault");
  Bot.walkTo(330, 3);
  Bot.expect(G.L.plates[0].pressed, "plate pressed in the vault");
  Bot.run(6);
  Bot.stop();
  Bot.walkTo(270);
  Bot.waitUntil(() => G.L.doorOpen.a && echoDone("phase")() && echoDone("shade")(), 900, "door open");
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
  Bot.record(0);
  Bot.walkTo(190);
  Bot.run(6);
  Bot.stop();
  Bot.record(1);
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
  Bot.record(0);
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
  Bot.record(0);
  Bot.walkTo(250);
  Bot.jumpTo(310, 24); // up onto the pedestal
  Bot.run(6);
  Bot.stop();
  // Record the shade walking along the ceiling to the hanging plate.
  Bot.record(1);
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

// 12 HIGH PLATE
SOLUTIONS["HIGH PLATE"] = () => {
  const flipRest = () => G.echoes.flip.restT > 30;
  const rideUp = () => {
    Bot.walkTo(130);
    Bot.waitUntil(flipRest, 900, "flip zone to open");
    Bot.dir(1);
    for (let i = 0; i < 300 && !(G.p.onGround && Bot.px() > 250 && G.p.y < 170); i++) Bot.tick();
    Bot.dir(0);
    Bot.expect(G.p.onGround && G.p.y < 170, "landed on the high ledge");
  };
  Bot.record(0);
  Bot.walkTo(215);
  Bot.run(6);
  Bot.stop();
  Bot.record(1);
  rideUp();
  Bot.walkTo(290);
  Bot.expect(G.L.plates[0].pressed, "high plate pressed");
  Bot.run(6);
  Bot.stop();
  rideUp();
  Bot.walkTo(330);
  Bot.dir(1);
  for (let i = 0; i < 200 && !(G.p.onGround && G.p.y > 250); i++) Bot.tick();
  Bot.dir(0);
  Bot.waitUntil(() => G.L.doorOpen.a, 300, "door open");
  Bot.walkTo(570);
};

// 13 LEAPFROG: carry the light across a long dark bridge by swapping with the glow echo.
SOLUTIONS["LEAPFROG"] = () => {
  Bot.record(0);
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
  Bot.record(1);
  Bot.walkTo(215);
  Bot.run(6);
  Bot.stop();
  Bot.record(0);
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
  Bot.record(1);
  Bot.select(0);
  Bot.waitUntil(shadeRest, 900, "shade to reach the ledge");
  Bot.swap();
  Bot.expect(G.p.y < 170 && G.p.x > 240, "swapped onto ledge A");
  Bot.run(10);
  Bot.stop();
  // Final run.
  Bot.select(0);
  Bot.waitUntil(() => shadeRest() && flipRest(), 900, "echoes to settle");
  Bot.swap();
  Bot.expect(G.p.y < 170, "swapped onto ledge A (final)");
  Bot.dir(1);
  for (let i = 0; i < 300 && !(G.p.onGround && Bot.px() > 400 && G.p.y < 50); i++) Bot.tick();
  Bot.dir(0);
  Bot.expect(G.p.onGround && G.p.y < 50, "landed on the top ledge");
  Bot.walkTo(550);
};

// 15 THE BEACON
SOLUTIONS["THE BEACON"] = () => {
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
  // slots: 0 phase, 1 glow, 2 shade, 3 flip
  Bot.record(0);
  Bot.walkTo(110);
  Bot.run(6);
  Bot.stop();
  Bot.record(1);
  upToPlatform();
  Bot.walkTo(320);
  Bot.run(6);
  Bot.stop();
  Bot.record(2);
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
  Bot.record(3);
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

SOLUTIONS["BOOST"] = () => {
  Bot.record(0);
  Bot.walkTo(272);
  Bot.run(6);
  Bot.stop();
  Bot.walkTo(236);
  Bot.waitUntil(echoDone("shade"), 600, "shade to settle by the wall");
  const e = G.echoes.shade;
  Bot.jumpTo(e.x + PW / 2, 24);
  Bot.expect(G.p.stand === e, "standing on the echo");
  Bot.jumpTo(305, 24);
  Bot.expect(G.p.y + PH < 230, "up on the wall top");
  Bot.jumpTo(425, 24); // over the spikes
  Bot.walkTo(560);
};

SOLUTIONS["SUNKEN GATE"] = () => {
  const climb = () => {
    Bot.walkTo(88);
    Bot.jumpTo(118, 24); // ledge A
    Bot.jumpTo(182, 24); // ledge B
    Bot.jumpTo(242, 24); // ledge C
    Bot.jumpTo(305, 24); // platform D
  };
  Bot.record(0);
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
  Bot.record(0); // shade on the plate
  Bot.walkTo(130);
  Bot.run(6);
  Bot.stop();
  Bot.record(1); // glow on the island
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

SOLUTIONS["TRAPDOOR"] = () => {
  Bot.record(0);
  Bot.walkTo(230);
  Bot.run(6);
  Bot.stop();
  Bot.walkTo(230);
  Bot.waitUntil(() => G.p.onGround && G.p.y > 320, 600, "to drop into the tunnel");
  Bot.walkTo(490);
  Bot.jumpTo(542, 24);
  Bot.walkTo(570);
};

SOLUTIONS["TWIN ECHOES"] = () => {
  const rest = (k) => () => G.echoes[k] && G.echoes[k].restT > 30;
  Bot.record(0);
  Bot.walkTo(150);
  Bot.run(6);
  Bot.stop();
  Bot.record(1);
  Bot.walkTo(150);
  Bot.waitUntil(rest("phase"), 600, "phase to settle");
  Bot.walkTo(360);
  Bot.run(6);
  Bot.stop();
  Bot.walkTo(150);
  Bot.waitUntil(rest("phase"), 600, "phase to settle");
  Bot.walkTo(280);
  Bot.waitUntil(rest("flip"), 600, "flip to settle");
  Bot.dir(1);
  for (let i = 0; i < 300 && !(G.p.onGround && Bot.px() > 420 && G.p.y < 170); i++) Bot.tick();
  Bot.dir(0);
  Bot.expect(G.p.onGround && G.p.y < 170, "landed on the ledge");
  Bot.walkTo(570);
};

SOLUTIONS["LANTERN LIFT"] = () => {
  const rest = (k) => () => G.echoes[k] && G.echoes[k].restT > 30;
  const rideUp = () => {
    Bot.walkTo(130);
    Bot.waitUntil(rest("flip"), 900, "flip zone to open");
    Bot.dir(1);
    for (let i = 0; i < 300 && !(G.p.onGround && Bot.px() > 250 && G.p.y < 170); i++) Bot.tick();
    Bot.dir(0);
    Bot.expect(G.p.onGround && G.p.y < 170, "landed on ledge A");
  };
  Bot.record(0); // flip
  Bot.walkTo(215);
  Bot.run(6);
  Bot.stop();
  Bot.record(1); // glow on the ledge
  rideUp();
  Bot.walkTo(330);
  Bot.run(6);
  Bot.stop();
  rideUp();
  Bot.walkTo(330);
  Bot.waitUntil(rest("glow"), 600, "glow to settle");
  Bot.jumpTo(392, 24);
  Bot.walkTo(422);
  Bot.jumpTo(486, 24);
  Bot.walkTo(570);
};

// ---------------------------------------------------------------- tier 3: the tideworks
const tideOf = () => G.echoes.tide;
// Hop onto the tide echo while it waits at its start (the pedestal).
const boardAtSpawn = () => {
  Bot.jumpTo(Bot.px(), 12);
  Bot.expect(G.p.stand === tideOf(), "standing on the tide echo");
};

SOLUTIONS["FERRY"] = () => {
  Bot.record(0);
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
  // slots: 0 shade, 1 tide
  Bot.record(0);
  Bot.walkTo(110);
  Bot.run(6);
  Bot.stop();
  Bot.record(1);
  Bot.run(110);
  Bot.walkTo(222);
  Bot.jumpTo(262, 24);
  Bot.jumpTo(322, 24);
  Bot.jumpTo(382, 24);
  Bot.jumpTo(442, 24);
  Bot.walkTo(462);
  Bot.run(110);
  Bot.stop();
  Bot.record(0);
  Bot.walkTo(170);
  Bot.run(6);
  Bot.stop();
  boardAtSpawn();
  Bot.waitUntil(() => G.p.y < 112 && Bot.px() > 430, 1500, "the ride to the top");
  Bot.walkTo(590);
};

SOLUTIONS["SLUICE"] = () => {
  Bot.record(0);
  Bot.walkTo(150);
  Bot.run(150);
  Bot.walkTo(214);
  Bot.run(4);
  Bot.stop();
  Bot.walkTo(285);
  Bot.waitUntil(() => G.L.doorOpen.a, 900, "the door to open");
  Bot.walkTo(420);
  Bot.jumpTo(505, 24);
  Bot.walkTo(570);
};

SOLUTIONS["TRAMPOLINE"] = () => {
  Bot.record(0);
  Bot.walkTo(372);
  Bot.run(6);
  Bot.stop();
  Bot.walkTo(372);
  Bot.waitUntil(restOf("spring"), 600, "the spring to settle");
  jumpToSpring(372, 1);
  Bot.expect(G.p.y < 130, "up on the ledge");
  Bot.walkTo(570);
};

SOLUTIONS["BOUNCE COURSE"] = () => {
  const toPillar = () => {
    Bot.walkTo(172);
    Bot.jumpTo(215, 24);
    Bot.walkTo(250);
  };
  Bot.record(0);
  toPillar();
  Bot.run(6);
  Bot.stop();
  toPillar();
  Bot.waitUntil(restOf("spring"), 600, "the spring to settle");
  jumpToSpring(250, 1);
  Bot.expect(G.p.y < 130, "up on the far ledge");
  Bot.walkTo(570);
};

SOLUTIONS["SKYHOOK"] = () => {
  Bot.record(0);
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
  // slots: 0 spring, 1 tide
  Bot.record(0);
  Bot.walkTo(190);
  Bot.run(6);
  Bot.stop();
  Bot.record(1);
  Bot.run(110);
  Bot.walkTo(190);
  Bot.waitUntil(restOf("spring"), 600, "the spring to settle");
  jumpToSpring(190, 1);
  Bot.expect(G.p.y < 190, "up on the middle ledge");
  Bot.walkTo(260);
  Bot.run(110);
  Bot.stop();
  Bot.record(0);
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
  // slots: 0 glow, 1 tide
  const toIsland = () => {
    Bot.walkTo(150);
    Bot.jumpTo(175, 24);
    Bot.walkTo(352);
  };
  Bot.record(0);
  toIsland();
  Bot.run(6);
  Bot.stop();
  Bot.record(1);
  Bot.run(110);
  toIsland();
  Bot.waitUntil(restOf("glow"), 600, "the glow to light the far planks");
  Bot.walkTo(470);
  Bot.run(110);
  Bot.stop();
  Bot.record(0);
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

SOLUTIONS["HIGH WATER"] = () => {
  // slots: 0 tide, 1 spring
  const ferryOver = () => {
    Bot.walkTo(172);
    Bot.waitUntil(() => Math.abs(tideOf().x + PW / 2 - 172) < 2 && G.t < 160, 600, "the tide to wait at the edge");
    Bot.jumpTo(tideOf().x + PW / 2, 12);
    Bot.expect(G.p.stand === tideOf(), "standing on the tide echo");
    Bot.waitUntil(() => G.t >= 120 + 50 + 33, 900, "the ride out over the gap");
    Bot.jumpTo(345, 24);
  };
  Bot.record(0);
  Bot.walkTo(172);
  Bot.run(120);
  Bot.jumpKey(true);
  Bot.dir(1);
  for (let i = 0; i < 36; i++) Bot.tick();
  Bot.jumpKey(false);
  Bot.dir(0);
  Bot.stop();
  Bot.record(1);
  ferryOver();
  Bot.walkTo(430);
  Bot.run(6);
  Bot.stop();
  ferryOver();
  Bot.walkTo(430);
  Bot.waitUntil(restOf("spring"), 900, "the spring to settle");
  jumpToSpring(430, 1);
  Bot.expect(G.p.y < 150, "up on the wall");
  Bot.walkTo(570);
};
