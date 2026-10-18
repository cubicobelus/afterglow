"use strict";

// Shared platformer core: input, fixed-step loop and body-vs-rectangle physics.
const Core = (() => {
  const W = 640, H = 360, DT = 1 / 60;
  const GRAVITY = 1800, MOVE = 220, JUMP = 620, MAX_FALL = 900;

  const keys = {};
  const pressed = {};
  const clicks = {};
  const mouse = { x: W / 2, y: H / 2, moved: false };

  window.addEventListener("keydown", (e) => {
    if (!e.repeat) pressed[e.code] = true;
    keys[e.code] = true;
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
  });
  window.addEventListener("keyup", (e) => { keys[e.code] = false; });

  function overlaps(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function makeBody(x, y) {
    return { x, y, w: 24, h: 32, vx: 0, vy: 0, onGround: false };
  }

  function input() {
    return {
      left: !!(keys.ArrowLeft || keys.KeyA),
      right: !!(keys.ArrowRight || keys.KeyD),
      jump: !!(keys.Space || keys.ArrowUp || keys.KeyW),
    };
  }

  // True once per key press.
  function wasPressed(code) {
    const p = !!pressed[code];
    pressed[code] = false;
    return p;
  }

  // True once per mouse click (button 0 = left, 2 = right).
  function wasClicked(button) {
    const c = !!clicks[button];
    clicks[button] = false;
    return c;
  }

  // Advance one body by one fixed step against a list of solid rectangles.
  function step(body, inp, solids) {
    body.vx = ((inp.right ? 1 : 0) - (inp.left ? 1 : 0)) * MOVE;
    if (inp.jump && body.onGround) {
      body.vy = -JUMP;
      body.onGround = false;
    }
    body.vy = Math.min(body.vy + GRAVITY * DT, MAX_FALL);

    body.x += body.vx * DT;
    if (body.vx !== 0) {
      for (const s of solids) {
        if (overlaps(body, s)) body.x = body.vx > 0 ? s.x - body.w : s.x + s.w;
      }
    }

    body.y += body.vy * DT;
    body.onGround = false;
    for (const s of solids) {
      if (overlaps(body, s)) {
        if (body.vy > 0) {
          body.y = s.y - body.h;
          body.onGround = true;
        } else {
          body.y = s.y + s.h;
        }
        body.vy = 0;
      }
    }

    body.x = Math.max(0, Math.min(W - body.w, body.x));
  }

  function start(canvas, update, draw) {
    const ctx = canvas.getContext("2d");
    const toCanvas = (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) * W / r.width;
      mouse.y = (e.clientY - r.top) * H / r.height;
    };
    canvas.addEventListener("mousemove", (e) => { toCanvas(e); mouse.moved = true; });
    canvas.addEventListener("mousedown", (e) => { toCanvas(e); mouse.moved = true; clicks[e.button] = true; });
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());

    let last = performance.now();
    let acc = 0;
    function frame(now) {
      acc += Math.min((now - last) / 1000, 0.1);
      last = now;
      while (acc >= DT) {
        update();
        acc -= DT;
      }
      draw(ctx);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function hud(ctx, lines) {
    ctx.font = "13px system-ui, sans-serif";
    ctx.textBaseline = "top";
    lines.forEach((line, i) => {
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillText(line, 11, 11 + i * 18);
      ctx.fillStyle = "#fff";
      ctx.fillText(line, 10, 10 + i * 18);
    });
  }

  return { W, H, DT, mouse, overlaps, makeBody, input, wasPressed, wasClicked, step, start, hud };
})();
