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
