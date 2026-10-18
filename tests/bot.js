"use strict";

// A scripted player for checking that every level can be solved. Drives the real engine tick by tick.
const Bot = (() => {
  const held = { left: false, right: false, jump: false };
  const px = () => G.p.x + PW / 2;
  const feet = () => G.p.y + PH;

  function applyKeys() {
    Input.down.ArrowLeft = held.left;
    Input.down.ArrowRight = held.right;
    Input.down.Space = held.jump;
  }

  function tick() {
    applyKeys();
    Game.tick();
  }

  function run(n) {
    for (let i = 0; i < n; i++) tick();
  }

  function dir(d) {
    held.left = d < 0;
    held.right = d > 0;
  }

  function jumpKey(on) {
    if (on && !held.jump) Input.pressed.Space = true;
    held.jump = on;
  }

  function press(code) {
    Input.pressed[code] = true;
  }

  function fail(msg) {
    throw new Error(msg + " (tick " + G.t + ", at " + Math.round(G.p.x) + "," + Math.round(G.p.y) + ")");
  }

  function needAlive() {
    if (G.dead) fail("player died");
  }

  // Walk until the player centre is within tol of x, then brake.
  function walkTo(x, tol, max) {
    tol = tol || 2;
    max = max || 900;
    let still = 0; // a rest a few pixels short of the target counts as arrived
    for (let i = 0; i < max; i++) {
      needAlive();
      if (G.won) return;
      const dx = x - px();
      still = Math.abs(G.p.vx) < 1 && Math.abs(dx) < 5 ? still + 1 : 0;
      if (still > 20) { dir(0); return; }
      if (Math.abs(dx) <= tol && Math.abs(G.p.vx) < 12) { dir(0); tick(); return; }
      let d = Math.abs(dx) < 5 && Math.abs(G.p.vx) < 40 ? 0 : Math.sign(dx);
      if (Math.abs(dx) < Math.abs(G.p.vx) * Math.abs(G.p.vx) / 3400 + 1.5) d = 0;
      dir(d);
      tick();
    }
    dir(0);
    fail("walkTo " + x + " timed out");
  }

  // Jump (holding the key for `hold` ticks) while steering toward x. Ends when landed.
  function jumpTo(x, hold, max) {
    hold = hold === undefined ? 24 : hold;
    max = max || 160;
    needAlive();
    let airborne = false;
    for (let i = 0; i < max; i++) {
      needAlive();
      if (G.won) break;
      jumpKey(i < hold);
      const dx = x - px();
      dir(Math.abs(dx) < 3 ? 0 : Math.sign(dx));
      tick();
      if (!G.p.onGround) airborne = true;
      if (airborne && G.p.onGround) break;
    }
    jumpKey(false);
    dir(0);
    if (!G.p.onGround && !G.won) fail("jumpTo " + x + " never landed");
  }

  // Run a short route: ["to", x] | ["jump", x, hold].
  function route(steps) {
    for (const s of steps) {
      if (s[0] === "to") walkTo(s[1]);
      else if (s[0] === "jump") jumpTo(s[1], s[2]);
      else if (s[0] === "wait") run(s[1]);
    }
  }

  function waitUntil(fn, max, what) {
    max = max || 600;
    for (let i = 0; i < max; i++) {
      needAlive();
      if (fn()) return;
      dir(0);
      tick();
    }
    fail("timed out waiting for " + (what || "condition"));
  }

  const expect = (cond, msg) => { if (!cond) fail("expected: " + msg); };

  function record(slot) {
    if (slot !== undefined) select(slot);
    dir(0);
    press("KeyE");
    tick();
    expect(G.rec, "recording started");
  }

  function stop() {
    press("KeyE");
    tick();
    expect(!G.rec, "recording stopped");
  }

  // A slot is a number or a slot key such as "shade2"; keys do not depend on the order the HUD shows.
  function select(slot) {
    const i = typeof slot === "string" ? G.L.slotKeys.indexOf(slot) : slot;
    if (i < 0) fail("no slot " + slot);
    press("Digit" + (i + 1));
    tick();
  }

  function swap() {
    press("KeyQ");
    tick();
  }

  function load(i) {
    held.left = held.right = held.jump = false;
    for (const k in Input.down) Input.down[k] = false;
    Game.load(i);
  }

  return { px, feet, run, tick, dir, jumpKey, press, walkTo, jumpTo, route, waitUntil, expect, record, stop, select, swap, load, fail, held };
})();
