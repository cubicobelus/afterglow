"use strict";

// Small throwaway levels that check each piece of the engine on its own.
const MECHANICS = [];
function mech(name, fn) { MECHANICS.push({ name, fn }); }
const tiny = (opts, build) => Object.assign({ chapter: 0, name: "TEST", build }, opts);
const ensure = (cond, msg) => { if (!cond) throw new Error(msg); };

mech("one-way platform: jump up through it and land on top", () => {
  Bot.load(tiny({ echoes: [] }, (g) => { g.base(); g.set(2, 14, "@"); g.fill(8, 12, 10, 12, "="); }));
  G.p.x = 176; G.p.y = 284;
  Bot.run(4);
  Bot.jumpTo(180, 24);
  ensure(Math.abs(G.p.y + PH - 240) < 1, "should stand on the ledge at 240, feet at " + (G.p.y + PH));
});

mech("one-way platform: walking sideways into it at floor level passes under", () => {
  Bot.load(tiny({ echoes: [] }, (g) => { g.base(); g.set(2, 14, "@"); g.fill(8, 13, 10, 13, "="); }));
  Bot.walkTo(300);
  ensure(Bot.px() > 280, "walked under the ledge");
});

mech("light gate: open near a lamp, shut without light", () => {
  const build = (lampCol) => (g) => {
    g.base(); g.set(2, 14, "@"); g.fill(14, 1, 14, 12, "#"); g.fill(14, 13, 14, 14, "G"); g.set(lampCol, 13, "L");
  };
  Bot.load(tiny({ dark: true, echoes: [] }, build(10)));
  Bot.run(2);
  ensure(G.L.gates.every((x) => x.open), "gate should be open next to a lamp");
  Bot.load(tiny({ dark: true, echoes: [] }, build(1)));
  Bot.run(2);
  ensure(G.L.gates.every((x) => !x.open), "gate should be shut without light");
  Bot.walkTo(260);
  Bot.dir(1);
  Bot.run(60);
  ensure(Bot.px() < 280, "player should be blocked by the shut gate");
});

mech("light sensor plate opens a door while lit", () => {
  const build = (lampCol) => (g) => {
    g.base(); g.set(2, 14, "@"); g.set(10, 14, "5"); g.fill(16, 1, 16, 12, "#"); g.fill(16, 13, 16, 14, "A"); g.set(lampCol, 13, "L");
  };
  Bot.load(tiny({ dark: true, echoes: [] }, build(9)));
  Bot.run(3);
  ensure(G.L.doorOpen.a === true, "door should open when the sensor is lit");
  Bot.load(tiny({ dark: true, echoes: [] }, build(1)));
  Bot.run(3);
  ensure(!G.L.doorOpen.a, "door should stay shut in the dark");
});

mech("switch lamp burns only while its plate is held", () => {
  Bot.load(tiny({ dark: true, echoes: [] }, (g) => { g.base(); g.set(2, 14, "@"); g.set(8, 14, "a"); g.set(20, 10, "P"); }));
  Bot.run(3);
  ensure(G.lights.length === 0, "lamp should be off before the plate is pressed");
  Bot.walkTo(170);
  Bot.run(5);
  ensure(G.lights.length === 1, "lamp should be on while the plate is held");
  Bot.walkTo(260);
  Bot.run(5);
  ensure(G.lights.length === 0, "lamp should go off when the plate is released");
});

mech("lantern pickup", () => {
  Bot.load(tiny({ echoes: [] }, (g) => { g.base(); g.set(2, 14, "@"); g.set(8, 14, "o"); }));
  ensure(G.L.lanterns.length === 1, "one lantern parsed");
  Bot.walkTo(190);
  Bot.run(3);
  ensure(G.lanternsGot === 1 && G.L.lanterns[0].got, "lantern collected");
});

mech("tide: ping-pongs along its path and carries the player", () => {
  Bot.load(tiny({ echoes: ["tide"], recMax: 8 }, (g) => { g.base(); g.set(2, 14, "@"); }));
  Bot.record(0);
  Bot.walkTo(200);
  Bot.run(6);
  Bot.stop();
  const e = G.echoes.tide;
  const n = e.trace.length;
  Bot.run(n - 2);
  const far = e.x;
  ensure(far > 150, "reaches the far end of the path (x " + far + ")");
  Bot.run(n - 1);
  ensure(e.x < 80, "comes back to the start (x " + e.x + ")");
  ensure(e.moving, "never comes to rest");
  // Carry: stand on it while it travels.
  Game.restartAttempt();
  Bot.run(40);
  G.p.x = e.x; G.p.y = e.y - PH - 1; G.p.vy = 0;
  const x0 = e.x;
  Bot.run(30);
  ensure(G.p.stand === e || G.p.onGround, "standing on the tide echo");
  ensure(Math.abs(G.p.x - e.x) < 8, "rides along with it (player " + G.p.x + ", echo " + e.x + ")");
  ensure(e.x - x0 > 20, "the echo actually moved (" + (e.x - x0) + ")");
});

mech("spring: bounces higher, and higher still with jump held", () => {
  Bot.load(tiny({ echoes: ["spring"], recMax: 8 }, (g) => { g.base(); g.set(2, 14, "@"); }));
  Bot.record(0);
  Bot.walkTo(200);
  Bot.run(6);
  Bot.stop();
  Bot.walkTo(100);
  Bot.waitUntil(() => !G.echoes.spring.moving && G.echoes.spring.restT > 10, 600);
  const e = G.echoes.spring;
  const rise = (held) => {
    G.p.x = e.x; G.p.y = e.y - 70; G.p.vy = 0; G.p.vx = 0;
    let minY = 1e9, bounced = false;
    for (let i = 0; i < 120; i++) {
      Bot.jumpKey(held);
      Bot.tick();
      minY = Math.min(minY, G.p.y);
      if (G.p.vy < -300) bounced = true;
      if (bounced && G.p.vy > 0) break;
    }
    Bot.jumpKey(false);
    return { top: e.y - PH - minY, bounced };
  };
  const a = rise(false);
  ensure(a.bounced, "bounced");
  ensure(a.top > 95 && a.top < 140, "plain bounce height " + a.top);
  Bot.run(40);
  const b = rise(true);
  ensure(b.top > 150, "held bounce height " + b.top);
  ensure(b.top > a.top + 30, "held bounce should be clearly higher");
});

mech("gust: carries a jump farther in the direction it faced", () => {
  const jumpDist = (withGust) => {
    Bot.load(tiny({ echoes: ["gust"], recMax: 8 }, (g) => { g.base(); g.set(2, 14, "@"); }));
    if (withGust) {
      Bot.record(0);
      Bot.walkTo(260);
      Bot.run(6);
      Bot.stop();
      Bot.run(120);
    }
    G.p.x = 190; G.p.y = 284; G.p.vx = 0; G.p.vy = 0; G.p.windV = 0;
    Bot.run(3);
    const x0 = G.p.x;
    Bot.dir(1);
    Bot.jumpKey(true);
    let airborne = false;
    for (let i = 0; i < 90; i++) {
      Bot.jumpKey(i < 24);
      Bot.tick();
      if (!G.p.onGround) airborne = true;
      if (airborne && G.p.onGround) break;
    }
    Bot.dir(0);
    return G.p.x - x0;
  };
  const plain = jumpDist(false), windy = jumpDist(true);
  ensure(windy > plain + 25, "wind should add distance: plain " + Math.round(plain) + ", windy " + Math.round(windy));
});

mech("two echoes of one kind: separate slots, both hold plates, one can be re-recorded alone", () => {
  Bot.load(tiny({ echoes: ["shade", "shade"], recMax: 8 }, (g) => { g.base(); g.set(2, 14, "@"); g.set(6, 14, "a"); g.set(9, 14, "b"); g.fill(20, 9, 20, 14, "A"); g.fill(21, 9, 21, 14, "B"); }));
  ensure(G.L.slotKeys.join() === "shade,shade2", "slot keys " + G.L.slotKeys.join());
  Bot.record(0);
  Bot.walkTo(130);
  Bot.run(6);
  Bot.stop();
  Bot.record(1);
  Bot.walkTo(190);
  Bot.run(6);
  Bot.stop();
  ensure(G.echoes.shade && G.echoes.shade2, "both echoes exist");
  Bot.walkTo(100);
  Bot.run(200);
  ensure(G.L.plates.every((p) => p.pressed), "both plates held at once");
  // re-record the second slot somewhere else; the first must stay
  Bot.record(1);
  Bot.walkTo(260);
  Bot.run(6);
  Bot.stop();
  ensure(G.echoes.shade && G.echoes.shade2 && Math.abs(G.echoes.shade2.trace[G.echoes.shade2.trace.length - 1].x + PW / 2 - 260) < 6, "second slot replaced, first kept");
});

mech("two gusts of opposite facing both blow", () => {
  Bot.load(tiny({ echoes: ["gust", "gust"], recMax: 8 }, (g) => { g.base(); g.set(2, 14, "@"); }));
  Bot.record(0);
  Bot.walkTo(150);
  Bot.run(6);
  Bot.stop();
  Bot.record(1);
  Bot.walkTo(400);
  Bot.walkTo(380);
  Bot.dir(-1);
  Bot.run(8);
  Bot.dir(0);
  Bot.run(6);
  Bot.stop();
  Bot.run(260);
  ensure(G.winds.length === 2, "two winds active, got " + G.winds.length);
  ensure(G.winds.some((w) => w.dir === 1) && G.winds.some((w) => w.dir === -1), "one blows each way");
});

mech("riding an echo that jumps into a low ceiling does not carry you through it", () => {
  Bot.load(tiny({ echoes: ["shade"], recMax: 8 }, (g) => { g.base(); g.fill(1, 1, 30, 11, "#"); g.set(2, 14, "@"); }));
  Bot.record(0);
  Bot.run(60); // wait at the start so it can be boarded
  Bot.jumpKey(true);
  Bot.run(8); // then jump into the ceiling
  Bot.jumpKey(false);
  Bot.run(30);
  Bot.stop();
  Bot.run(5);
  Bot.jumpTo(Bot.px(), 6);
  ensure(G.p.stand === G.echoes.shade, "boarded the shade");
  let minY = 1e9;
  for (let i = 0; i < 140; i++) { Bot.tick(); minY = Math.min(minY, G.p.y); }
  ensure(!G.dead, "still alive");
  ensure(minY >= 239, "the rider was pushed into or above the ceiling (top at " + Math.round(minY) + ")");
});

mech("the level clock waits for the first control input", () => {
  Bot.load(tiny({ echoes: [] }, (g) => { g.base(); g.set(2, 14, "@"); }));
  Bot.run(60);
  ensure(G.time === 0, "the clock ran before any input (" + G.time + ")");
  Bot.press("Enter"); // a menu key is not a control
  Bot.run(10);
  ensure(G.time === 0, "a menu key started the clock");
  Bot.dir(1);
  Bot.run(30);
  Bot.dir(0);
  ensure(G.time > 0.4 && G.time < 0.6, "the clock should have run about half a second (" + G.time + ")");
});

mech("a click or K starts and stops a recording while you run, for keyboards that cannot take W, D and E together", () => {
  Bot.load(tiny({ echoes: ["shade"] }, (g) => { g.base(); g.set(2, 14, "@"); }));
  Bot.dir(1);
  Bot.press("Mouse0");
  Bot.tick();
  ensure(G.rec, "a click did not start the recording");
  Bot.run(10);
  Bot.press("KeyK");
  Bot.tick();
  ensure(!G.rec, "K did not stop the recording");
  Bot.dir(0);
  ensure(Input.bind.record.includes("Mouse0"), "click is not a default record binding");
});

mech("an echo that presses a rider a pixel into a ceiling does not throw the rider over it", () => {
  // The slab is 220 px thick. An echo whose top is 15 px under it leaves the rider overlapping the slab by a pixel;
  // that used to be resolved as landing on top of the slab.
  Bot.load(tiny({ echoes: ["shade"], recMax: 8 }, (g) => { g.base(); g.fill(1, 1, 30, 11, "#"); g.set(2, 14, "@"); }));
  const trace = [];
  for (let i = 0; i < 400; i++) trace.push({ x: 100, y: 255, f: 1, s: 0, g: 1 });
  G.echoes.shade = makeEcho("shade", trace, "shade");
  G.p.x = 94; G.p.y = 239; G.p.vy = 0; G.p.stand = G.echoes.shade; G.p.onGround = true;
  for (let i = 0; i < 60; i++) Bot.tick();
  ensure(!G.dead, "died");
  ensure(G.p.y > 230 && G.p.y < 260, "the rider ended at y " + Math.round(G.p.y) + ", through the slab");
});

mech("a player pressed a pixel into a wide ceiling is pushed out downward, not thrown to its end", () => {
  Bot.load(tiny({ echoes: [] }, (g) => { g.base(); g.fill(1, 1, 30, 11, "#"); g.set(2, 14, "@"); }));
  G.p.x = 300; G.p.y = 239; G.p.vy = 0;
  Bot.dir(-1);
  Bot.run(4);
  Bot.dir(0);
  ensure(Math.abs(G.p.x - 300) < 12, "thrown sideways to x " + Math.round(G.p.x));
  ensure(G.p.y >= 239 && G.p.y < 262, "ended at y " + Math.round(G.p.y));
});

mech("swapping into a phase hole while the zone moves away crushes you in the wall that closes", () => {
  Bot.load(tiny({ echoes: ["phase"], recMax: 8, swap: true }, (g) => { g.base(); g.set(2, 14, "@"); g.fill(10, 1, 12, 14, "%"); }));
  Bot.record(0);
  Bot.walkTo(190);
  Bot.run(6);
  Bot.stop();
  Bot.waitUntil(() => G.echoes.phase.restT > 40, 900, "the phase to open the wall");
  Bot.walkTo(230);
  ensure(!G.dead && Bot.px() > 215, "stood in the hole");
  Bot.swap(); // the phase is now frozen inside the wall, you are back outside
  Bot.run(20);
  ensure(!G.dead, "died too early");
  Bot.walkTo(80);
  Bot.swap(); // you land in the hole, the zone moves to where you stood
  Bot.run(3);
  ensure(G.dead, "the wall closed around the player and should have crushed them");
});

mech("two echoes at the same height under a ceiling do not embed or lift the rider through it", () => {
  Bot.load(tiny({ echoes: ["shade", "glow"], recMax: 8 }, (g) => { g.base(); g.fill(1, 1, 30, 11, "#"); g.set(2, 14, "@"); }));
  const mk = (y) => { const tr = []; for (let i = 0; i < 400; i++) tr.push({ x: 100, y, f: 1, s: 0, g: 1 }); return tr; };
  G.echoes.shade = makeEcho("shade", mk(250), "shade");
  G.echoes.glow = makeEcho("glow", mk(250), "glow");
  G.p.x = 94; G.p.y = 234; G.p.vy = 0; G.p.stand = G.echoes.shade; G.p.onGround = true;
  let minY = 1e9;
  for (let i = 0; i < 60; i++) { Bot.tick(); minY = Math.min(minY, G.p.y); }
  ensure(minY >= 239.5, "the rider was embedded in or lifted through the slab (top at " + minY.toFixed(1) + ")");
});

mech("a tide that stays put is refused, so it cannot stand in for a shade", () => {
  Bot.load(tiny({ echoes: ["tide"], recMax: 8 }, (g) => { g.base(); g.set(2, 14, "@"); g.set(2, 13, "a"); }));
  Bot.record(0);
  Bot.run(60);
  Bot.stop();
  ensure(!G.echoes.tide, "a tide that never moved should not be kept");
  Bot.record(0);
  Bot.walkTo(150);
  Bot.run(6);
  Bot.stop();
  ensure(G.echoes.tide, "a tide that travelled is kept");
});
