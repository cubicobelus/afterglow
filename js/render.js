"use strict";

// render.js: all drawing. Backgrounds and tiles are baked once per level; everything else is drawn per frame.
const Render = (() => {
  const TAU = Math.PI * 2;

  function mulberry(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hash(a, b) {
    let h = (Math.imul(a, 374761393) + Math.imul(b, 668265263)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }

  function parse(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function rgba(hex, a) {
    const c = parse(hex);
    return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")";
  }

  // Lighten (f > 0) or darken (f < 0) a hex colour.
  function tint(hex, f) {
    const c = parse(hex).map((v) => Math.max(0, Math.min(255, Math.round(f >= 0 ? v + (255 - v) * f : v * (1 + f)))));
    return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")";
  }

  function mkCanvas(w, h) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  }

  const darkCanvas = mkCanvas(W, H);
  const darkCtx = darkCanvas.getContext("2d");
  const vignette = mkCanvas(W, H);
  {
    const x = vignette.getContext("2d");
    const g = x.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.5)");
    x.fillStyle = g;
    x.fillRect(0, 0, W, H);
  }

  // A 5x5 emblem per echo kind, so kinds can be told apart without relying on colour.
  const EMBLEMS = {
    shade: ["..#..", ".###.", "#####", ".###.", "..#.."],
    glow: ["#.#.#", ".###.", "#####", ".###.", "#.#.#"],
    phase: ["#####", "#...#", "#...#", "#...#", "#####"],
    flip: ["..#..", ".###.", ".....", ".###.", "..#.."],
    tide: [".#.#.", "#.#.#", ".....", ".#.#.", "#.#.#"],
    spring: ["..#..", ".###.", "#.#.#", "..#..", "..#.."],
    gust: ["###..", ".....", "#####", ".....", "###.."],
  };

  // ------------------------------------------------------------ baking
  function solidAt(L, c, r) {
    if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return true;
    return L.rows[r][c] === "#";
  }

  function drawWallTile(x, L, c, r, pal, theme) {
    const px = c * TILE, py = r * TILE;
    const up = solidAt(L, c, r - 1), dn = solidAt(L, c, r + 1), lf = solidAt(L, c - 1, r), rt = solidAt(L, c + 1, r);
    const deep = up && dn && lf && rt;
    const v = hash(c, r) * 0.1 - 0.05;
    x.fillStyle = tint(pal.wall, deep ? -0.18 + v : v);
    x.fillRect(px, py, TILE, TILE);
    // brick pattern
    x.fillStyle = pal.mortar;
    x.globalAlpha = deep ? 0.55 : 0.9;
    x.fillRect(px, py + 9, TILE, 1);
    x.fillRect(px, py + 19, TILE, 1);
    x.fillRect(px + 10, py, 1, 9);
    x.fillRect(px, py + 10, 1, 9);
    x.globalAlpha = 1;
    // speckles
    for (let i = 0; i < 4; i++) {
      const sx = Math.floor(hash(c * 7 + i, r * 3) * 18) + 1, sy = Math.floor(hash(c * 5, r * 11 + i) * 18) + 1;
      x.fillStyle = hash(c + i, r * 9) > 0.5 ? rgba(pal.wallHi, 0.35) : rgba(pal.mortar, 0.5);
      x.fillRect(px + sx, py + sy, hash(c, r + i) > 0.6 ? 2 : 1, 1);
    }
    // exposed edges
    if (!up) { x.fillStyle = pal.wallHi; x.fillRect(px, py, TILE, 2); x.fillStyle = tint(pal.wallHi, 0.25); x.fillRect(px, py, TILE, 1); }
    if (!dn) { x.fillStyle = pal.wallLo; x.fillRect(px, py + 17, TILE, 3); }
    if (!lf) { x.fillStyle = tint(pal.wallHi, -0.1); x.fillRect(px, py, 1, TILE); }
    if (!rt) { x.fillStyle = pal.wallLo; x.fillRect(px + 19, py, 1, TILE); }
    if (theme === "cellar" && !up) {
      x.fillStyle = pal.moss;
      let cx = px;
      while (cx < px + TILE) {
        const w = 2 + Math.floor(hash(cx, r) * 5), h = 2 + Math.floor(hash(r, cx) * 3);
        if (hash(cx, r * 3) > 0.35) x.fillRect(cx, py, w, h);
        cx += w + 1;
      }
      if (hash(c, r) > 0.7) x.fillRect(px + Math.floor(hash(r, c) * 16), py + 2, 1, 5);
    }
    if (theme === "tideworks") {
      // copper rivets, and a wet sheen on top edges
      if (hash(c, r) > 0.3) { x.fillStyle = "#c98a5a"; x.fillRect(px + 2, py + 2, 2, 2); x.fillRect(px + 16, py + 2, 2, 2); }
      if (!up && hash(c * 5, r) > 0.45) { x.fillStyle = "rgba(127,224,230,0.4)"; x.fillRect(px + 3, py + 2, 12, 1); }
    }
    if (theme === "gallery" && hash(c * 3, r) > 0.8) {
      x.fillStyle = rgba(pal.accent, 0.5);
      x.fillRect(px + 4, py + 4, 1, 1);
      x.fillRect(px + 5, py + 5, 1, 1);
    }
    if (theme === "mirror" && hash(c * 5, r * 3) > 0.72) {
      // a glint across the glass
      x.fillStyle = "rgba(255,255,255,0.22)";
      for (let i = 0; i < 6; i++) x.fillRect(px + 4 + i * 2, py + 14 - i * 2, 2, 1);
    }
  }

  function drawSpike(x, sp) {
    const tx = sp.tx * TILE, ty = sp.ty * TILE;
    const up = sp.dir === 1;
    x.fillStyle = "#2a2e38";
    x.fillRect(tx + 1, up ? ty + 17 : ty, 18, 3);
    for (let i = 0; i < 3; i++) {
      const bx = tx + 2 + i * 6;
      x.fillStyle = "#9aa4b5";
      x.beginPath();
      if (up) { x.moveTo(bx, ty + 17); x.lineTo(bx + 3, ty + 8); x.lineTo(bx + 6, ty + 17); } else { x.moveTo(bx, ty + 3); x.lineTo(bx + 3, ty + 12); x.lineTo(bx + 6, ty + 3); }
      x.closePath();
      x.fill();
      x.fillStyle = "#e2e8f2";
      x.beginPath();
      if (up) { x.moveTo(bx + 1, ty + 16); x.lineTo(bx + 3, ty + 9); x.lineTo(bx + 3, ty + 16); } else { x.moveTo(bx + 1, ty + 4); x.lineTo(bx + 3, ty + 11); x.lineTo(bx + 3, ty + 4); }
      x.closePath();
      x.fill();
    }
  }

  function bakeTiles(L) {
    const pal = CHAPTERS[L.chapter].pal, theme = CHAPTERS[L.chapter].theme;
    const c = mkCanvas(W, H), x = c.getContext("2d");
    for (let r = 0; r < ROWS; r++) {
      for (let col = 0; col < COLS; col++) {
        if (L.rows[r][col] === "#") drawWallTile(x, L, col, r, pal, theme);
      }
    }
    for (const sp of L.spikes) drawSpike(x, sp);
    drawOneWays(x, L, pal);
    return c;
  }

  function bakeBackground(L) {
    const th = CHAPTERS[L.chapter], pal = th.pal;
    const c = mkCanvas(W, H), x = c.getContext("2d");
    const rng = mulberry(9100 + L.idx * 131);
    const g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, pal.bg1);
    g.addColorStop(1, pal.bg2);
    x.fillStyle = g;
    x.fillRect(0, 0, W, H);

    if (th.theme === "cellar") {
      for (let i = -1; i < 7; i++) {
        const x0 = i * 110 + 10;
        x.fillStyle = "rgba(0,0,0,0.22)";
        x.beginPath();
        x.moveTo(x0, H); x.lineTo(x0, 120); x.arc(x0 + 45, 120, 45, Math.PI, TAU); x.lineTo(x0 + 90, H);
        x.closePath(); x.fill();
        x.strokeStyle = rgba(pal.accent, 0.1);
        x.lineWidth = 2;
        x.beginPath(); x.arc(x0 + 45, 120, 49, Math.PI, TAU); x.stroke();
      }
      for (let i = 0; i < 4; i++) {
        const px = 60 + i * 170;
        x.fillStyle = "rgba(255,255,255,0.035)";
        x.fillRect(px, 0, 16, H);
        x.fillRect(px - 3, 0, 22, 8);
        x.fillRect(px - 3, H - 8, 22, 8);
      }
      for (let i = 0; i < 9; i++) {
        const cx = Math.floor(rng() * W), len = 30 + Math.floor(rng() * 70);
        x.fillStyle = "rgba(160,190,200,0.14)";
        x.fillRect(cx, 0, 1, len);
        for (let k = 3; k < len; k += 4) x.fillRect(cx - 1, k, 3, 1);
      }
    } else if (th.theme === "tideworks") {
      const gear = (gx, gy, r, teeth, rot) => {
        x.save();
        x.translate(gx, gy);
        x.rotate(rot);
        x.fillStyle = "rgba(0,0,0,0.26)";
        x.beginPath();
        for (let i = 0; i <= teeth * 4; i++) {
          const ang = (i / (teeth * 4)) * TAU, rad = (i % 4 < 2) ? r + 8 : r;
          if (i === 0) x.moveTo(Math.cos(ang) * rad, Math.sin(ang) * rad); else x.lineTo(Math.cos(ang) * rad, Math.sin(ang) * rad);
        }
        x.closePath();
        x.fill();
        x.fillStyle = "rgba(127,224,230,0.07)";
        x.beginPath(); x.arc(0, 0, r * 0.38, 0, TAU); x.fill();
        x.strokeStyle = "rgba(127,224,230,0.1)";
        x.lineWidth = 3;
        for (let k = 0; k < 4; k++) { x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(k * TAU / 4) * r * 0.9, Math.sin(k * TAU / 4) * r * 0.9); x.stroke(); }
        x.restore();
      };
      gear(90, 110, 46, 10, 0.2);
      gear(300, 64, 30, 8, 0.5);
      gear(530, 150, 58, 12, 0.1);
      gear(210, 300, 40, 9, 0.35);
      x.fillStyle = "rgba(201,138,90,0.2)";
      x.fillRect(0, 36, W, 8);
      x.fillRect(150, 0, 7, H);
      x.fillRect(396, 0, 7, H);
      x.fillStyle = "rgba(201,138,90,0.32)";
      for (let k = 40; k < W; k += 96) x.fillRect(k, 33, 5, 14);
      for (let k = 60; k < H; k += 80) { x.fillRect(147, k, 13, 4); x.fillRect(393, k + 20, 13, 4); }
      for (let i = 0; i < 3; i++) {
        const bx = 60 + i * 230;
        x.fillStyle = "rgba(127,224,230,0.045)";
        x.beginPath(); x.moveTo(bx, 0); x.lineTo(bx + 50, 0); x.lineTo(bx + 130, H); x.lineTo(bx + 40, H); x.closePath(); x.fill();
      }
      const wg = x.createLinearGradient(0, H - 90, 0, H);
      wg.addColorStop(0, "rgba(127,224,230,0)");
      wg.addColorStop(1, "rgba(127,224,230,0.16)");
      x.fillStyle = wg;
      x.fillRect(0, H - 90, W, 90);
    } else if (th.theme === "gallery") {
      for (let i = 0; i < 5; i++) {
        const fx = 30 + i * 130 + Math.floor(rng() * 20), fy = 36 + Math.floor(rng() * 30), fw = 64, fh = 120;
        x.fillStyle = "rgba(255,255,255,0.045)";
        x.fillRect(fx, fy, fw, fh);
        x.strokeStyle = rgba(pal.wallHi, 0.4);
        x.lineWidth = 4;
        x.strokeRect(fx, fy, fw, fh);
        x.strokeStyle = "rgba(255,255,255,0.09)";
        x.lineWidth = 6;
        x.beginPath(); x.moveTo(fx + 10, fy + fh - 6); x.lineTo(fx + fw - 14, fy + 8); x.stroke();
        x.lineWidth = 2;
        x.beginPath(); x.moveTo(fx + 24, fy + fh - 6); x.lineTo(fx + fw - 2, fy + 28); x.stroke();
      }
      for (let i = 0; i < 16; i++) {
        const sx = rng() * W, sy = H - rng() * 90, sh = 10 + rng() * 28;
        x.fillStyle = rgba(pal.accent, 0.12 + rng() * 0.1);
        x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx + 6, sy - sh); x.lineTo(sx + 12, sy); x.closePath(); x.fill();
      }
    } else if (th.theme === "mirror") {
      // tall panes of glass with glints, a faint centre line, and a floor that shines
      for (let i = 0; i < 6; i++) {
        const fx = 12 + i * 106 + Math.floor(rng() * 14), fy = 22 + Math.floor(rng() * 18), fw = 56, fh = 188;
        x.fillStyle = "rgba(255,255,255,0.035)";
        x.fillRect(fx, fy, fw, fh);
        x.strokeStyle = rgba(pal.wallHi, 0.34);
        x.lineWidth = 3;
        x.strokeRect(fx, fy, fw, fh);
        x.strokeStyle = "rgba(255,255,255,0.1)";
        x.lineWidth = 6;
        x.beginPath(); x.moveTo(fx + 8, fy + fh - 12); x.lineTo(fx + fw - 18, fy + 12); x.stroke();
        x.lineWidth = 2;
        x.beginPath(); x.moveTo(fx + 24, fy + fh - 12); x.lineTo(fx + fw - 4, fy + 40); x.stroke();
      }
      x.fillStyle = rgba(pal.accent, 0.1);
      for (let yy = 0; yy < H; yy += 8) x.fillRect(W / 2 - 1, yy, 2, 4);
      const fl = x.createLinearGradient(0, H - 110, 0, H);
      fl.addColorStop(0, rgba(pal.accent, 0));
      fl.addColorStop(1, rgba(pal.accent, 0.14));
      x.fillStyle = fl;
      x.fillRect(0, H - 110, W, 110);
      for (let i = 0; i < 40; i++) {
        x.fillStyle = rgba(pal.accent, 0.12 + rng() * 0.12);
        x.fillRect(Math.floor(rng() * W), Math.floor(rng() * H), 1, 1);
      }
    } else {
      for (let i = 0; i < 110; i++) {
        const sx = Math.floor(rng() * W), sy = Math.floor(rng() * H * 0.8), a = 0.2 + rng() * 0.6;
        x.fillStyle = "rgba(255,255,255," + a + ")";
        x.fillRect(sx, sy, rng() < 0.15 ? 2 : 1, 1);
      }
      const mg = x.createRadialGradient(500, 70, 4, 500, 70, 60);
      mg.addColorStop(0, "rgba(255,248,214,0.35)");
      mg.addColorStop(1, "rgba(255,248,214,0)");
      x.fillStyle = mg;
      x.fillRect(430, 0, 140, 140);
      x.fillStyle = "#f4ecc8";
      x.beginPath(); x.arc(500, 70, 22, 0, TAU); x.fill();
      x.fillStyle = "rgba(180,170,140,0.5)";
      x.beginPath(); x.arc(493, 64, 5, 0, TAU); x.arc(508, 78, 4, 0, TAU); x.arc(510, 60, 3, 0, TAU); x.fill();
      const sea = x.createLinearGradient(0, 230, 0, H);
      sea.addColorStop(0, "rgba(10,20,60,0)");
      sea.addColorStop(1, "rgba(5,10,30,0.7)");
      x.fillStyle = sea;
      x.fillRect(0, 230, W, H - 230);
      x.fillStyle = "rgba(255,255,255,0.06)";
      for (let i = 0; i < 18; i++) x.fillRect(Math.floor(rng() * W), 250 + Math.floor(rng() * 100), 10 + Math.floor(rng() * 30), 1);
      for (let i = 0; i < 3; i++) {
        const ax = 40 + i * 220;
        x.fillStyle = "rgba(0,0,12,0.28)";
        x.beginPath();
        x.moveTo(ax, H); x.lineTo(ax, 150); x.arc(ax + 50, 150, 50, Math.PI, TAU); x.lineTo(ax + 100, H);
        x.closePath(); x.fill();
      }
    }
    return c;
  }

  function bake(L) {
    L.bg = bakeBackground(L);
    L.tiles = bakeTiles(L);
    L.motes = [];
    const rng = mulberry(500 + L.idx);
    for (let i = 0; i < 34; i++) L.motes.push({ x: rng() * W, y: rng() * H, s: 0.3 + rng() * 0.7, ph: rng() * TAU });
  }

  // ------------------------------------------------------------ characters
  function drawFlame(ctx, x, y, t, color, core, lean, size) {
    const k = size || 1;
    const f = Math.sin(t * 0.37 + x) > 0.2 ? 1 : 0;
    const f2 = Math.sin(t * 0.23 + 1.7) > 0 ? 1 : 0;
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x - 2 * k + lean), Math.round(y - 3 * k), Math.round(4 * k), Math.round(3 * k));
    ctx.fillRect(Math.round(x - 1 * k + lean * 1.5), Math.round(y - (4 + f) * k), Math.round(2 * k), Math.round((1 + f) * k + k));
    if (f2) ctx.fillRect(Math.round(x + lean * 2), Math.round(y - 6 * k), Math.max(1, Math.round(k)), Math.max(1, Math.round(k)));
    ctx.fillStyle = core;
    ctx.fillRect(Math.round(x - 1 * k + lean * 0.5), Math.round(y - 3 * k), Math.round(2 * k), Math.round(2 * k));
  }

  function glowAt(ctx, x, y, r, color, a) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(color, a));
    g.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // x,y: top-left of the hitbox. o: face, st, g, t, sq, vx, cloak, cloakDark, eye, flame, core, alpha, outline
  function drawActor(ctx, x, y, o) {
    const g = o.g || 1;
    const t = o.t || 0;
    ctx.save();
    if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
    ctx.translate(Math.round(x + PW / 2), Math.round(g > 0 ? y + PH : y));
    ctx.scale(1, g);
    const sq = o.sq || 0;
    let sx = 1 + sq * 0.5, sy = 1 - sq * 0.5;
    if (o.st === 3) { sx = 0.95; sy = 1.06; }
    ctx.scale(sx, sy);
    const fo = o.face >= 0 ? 1 : -1;
    const run = o.st === 1;
    const ph = Math.floor(t / 5) % 2;
    const bob = run ? (ph ? 1 : 0) : (Math.sin(t * 0.06) > 0.5 ? 1 : 0);
    const lean = Math.max(-1, Math.min(1, Math.round(-(o.vx || 0) / 70)));

    const body = (col, grow) => {
      ctx.fillStyle = col;
      const gr = grow || 0;
      ctx.fillRect(-6 - gr, -9 - gr - bob * 0, 12 + gr * 2, 7 + gr);
      ctx.fillRect(-5 - gr, -11 - gr - bob, 10 + gr * 2, 3 + gr);
      ctx.fillRect(-5 - gr, -15 - gr - bob, 10 + gr * 2, 5 + gr);
      ctx.fillRect(-4 - gr, -16 - gr - bob, 8 + gr * 2, 1);
    };
    if (o.outline) body(o.outline, 1);
    body(o.cloak);
    ctx.fillStyle = o.cloakDark;
    ctx.fillRect(-6, -3, 12, 1);
    ctx.fillRect(-6, -9, 2, 6);
    if (o.emblem) {
      const pat = EMBLEMS[o.emblem];
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) if (pat[r][c] === "#") ctx.fillRect(-2 + c, -8 + r - Math.round(bob * 0), 1, 1);
    }
    // feet
    const lift = run ? 2 : 0;
    ctx.fillStyle = o.cloakDark;
    ctx.fillRect(-4, -2 - (ph ? lift : 0), 3, 2);
    ctx.fillRect(1, -2 - (ph ? 0 : lift), 3, 2);
    // face
    ctx.fillStyle = "#07090f";
    ctx.fillRect(-3 + fo, -14 - bob, 7, 4);
    ctx.fillStyle = o.eye;
    if (!o.eyesClosed && (t % 230) > 7) {
      ctx.fillRect(-2 + fo, -13 - bob, 2, 2);
      ctx.fillRect(1 + fo, -13 - bob, 2, 2);
    } else {
      ctx.fillRect(-2 + fo, -12 - bob, 2, 1);
      ctx.fillRect(1 + fo, -12 - bob, 2, 1);
    }
    drawFlame(ctx, 0, -17 - bob, t, o.flame, o.core, lean, 1);
    ctx.restore();
  }

  const PLAYER_LOOK = { cloak: "#e9e2d0", cloakDark: "#b9b19a", eye: "#fff8d6", flame: "#ffb347", core: "#fff3b0", outline: "#0a0c14" };

  function actorLook(kind) {
    const k = KINDS[kind];
    return { cloak: rgbaSolid(k.color, 0.5), cloakDark: rgbaSolid(k.color, 0.28), eye: "#ffffff", flame: k.color, core: "#ffffff", emblem: kind };
  }

  function rgbaSolid(hex, a) { return rgba(hex, a); }

  // ------------------------------------------------------------ world pieces
  function drawPlate(ctx, pl, t) {
    const col = PLATE_COLORS[pl.id];
    pl.amt += ((pl.pressed ? 1 : 0) - pl.amt) * 0.3;
    const d = Math.round(pl.amt * 3);
    ctx.save();
    if (pl.ceil) { ctx.translate(0, pl.y * 2 + 6); ctx.scale(1, -1); }
    ctx.fillStyle = "#1c2029";
    ctx.fillRect(pl.x - 2, pl.y + 3, pl.w + 4, 3);
    ctx.fillStyle = "#333a48";
    ctx.fillRect(pl.x - 1, pl.y + 2, pl.w + 2, 1);
    ctx.fillStyle = tint(col, pl.pressed ? 0.2 : -0.35);
    ctx.fillRect(pl.x, pl.y + d, pl.w, 3 - d + 1);
    ctx.fillStyle = tint(col, pl.pressed ? 0.7 : 0.1);
    ctx.fillRect(pl.x + 1, pl.y + d, pl.w - 2, 1);
    if (pl.sensor) {
      // a light sensor: a small eye on the plate that opens when lit
      ctx.fillStyle = "#0c0f16";
      ctx.fillRect(pl.x + 5, pl.y + d, 6, 3);
      ctx.fillStyle = pl.pressed ? "#ffffff" : tint(col, -0.2);
      ctx.fillRect(pl.x + 7, pl.y + d, 2, 2);
    }
    ctx.restore();
    if (pl.pressed) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      glowAt(ctx, pl.x + pl.w / 2, pl.y + 2, 22, col, 0.35);
      ctx.restore();
    }
  }

  function drawDoorTile(ctx, d, open, t, L) {
    d.amt += ((open ? 1 : 0) - d.amt) * 0.12;
    const col = PLATE_COLORS[d.id];
    const x = d.x, y = d.y;
    const h = Math.round(TILE * (1 - d.amt));
    ctx.fillStyle = "#1a1d26";
    ctx.fillRect(x, y, 3, TILE);
    ctx.fillRect(x + 17, y, 3, TILE);
    ctx.fillStyle = col;
    ctx.globalAlpha = 0.25 + d.amt * 0.5;
    ctx.fillRect(x, y, 1, TILE);
    ctx.fillRect(x + 19, y, 1, TILE);
    ctx.globalAlpha = 1;
    if (h > 0) {
      ctx.fillStyle = "#4a5160";
      for (let i = 0; i < 3; i++) ctx.fillRect(x + 4 + i * 5, y, 3, h);
      ctx.fillStyle = "#7c8598";
      for (let i = 0; i < 3; i++) ctx.fillRect(x + 4 + i * 5, y, 1, h);
      ctx.fillStyle = tint(col, -0.1);
      ctx.fillRect(x + 3, y + 8, 14, 2);
    }
  }

  // A light gate: iron bars with a sun mark that lift while light falls on them.
  function drawGate(ctx, gt, t) {
    gt.amt += ((gt.open ? 1 : 0) - gt.amt) * 0.12;
    const x = gt.x, y = gt.y, h = Math.round(TILE * (1 - gt.amt));
    ctx.fillStyle = "#1a1d26";
    ctx.fillRect(x, y, 3, TILE);
    ctx.fillRect(x + 17, y, 3, TILE);
    ctx.fillStyle = "#ffd27a";
    ctx.globalAlpha = 0.25 + gt.amt * 0.5;
    ctx.fillRect(x, y, 1, TILE);
    ctx.fillRect(x + 19, y, 1, TILE);
    ctx.globalAlpha = 1;
    if (h > 0) {
      ctx.fillStyle = "#5a5446";
      for (let i = 0; i < 3; i++) ctx.fillRect(x + 4 + i * 5, y, 3, h);
      ctx.fillStyle = "#a89d80";
      for (let i = 0; i < 3; i++) ctx.fillRect(x + 4 + i * 5, y, 1, h);
      if (h > 12) {
        ctx.fillStyle = "#ffd27a";
        ctx.fillRect(x + 8, y + 8, 4, 4);
        ctx.fillRect(x + 9, y + 6, 2, 8);
        ctx.fillRect(x + 6, y + 9, 8, 2);
      }
    }
  }

  function drawLantern(ctx, ln, t) {
    if (ln.got) return;
    const bob = Math.sin(t * 0.06 + ln.tx) * 2;
    const x = ln.x, y = ln.y + bob;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    glowAt(ctx, x, y, 22, "#ffe08a", 0.3 + 0.1 * Math.sin(t * 0.1));
    ctx.restore();
    ctx.fillStyle = "#2b2f3c";
    ctx.fillRect(x - 1, y - 8, 2, 3);
    ctx.fillRect(x - 4, y - 5, 8, 2);
    ctx.fillRect(x - 4, y + 4, 8, 2);
    ctx.fillStyle = "rgba(255,236,170,0.55)";
    ctx.fillRect(x - 3, y - 3, 6, 7);
    drawFlame(ctx, x, y + 2, t + ln.tx * 7, "#ffd35a", "#ffffff", 0, 1);
  }

  function drawOneWays(x, L, pal) {
    for (const o of L.oneways) {
      x.fillStyle = pal.wallLo;
      x.fillRect(o.x, o.y + 2, TILE, 4);
      x.fillStyle = pal.wallHi;
      x.fillRect(o.x, o.y, TILE, 3);
      x.fillStyle = tint(pal.wallHi, 0.4);
      x.fillRect(o.x, o.y, TILE, 1);
      x.fillStyle = pal.mortar;
      x.fillRect(o.x + 3, o.y + 3, 1, 1);
      x.fillRect(o.x + 16, o.y + 3, 1, 1);
    }
  }

  function drawPlanks(ctx, L, t) {
    const pal = CHAPTERS[L.chapter].pal;
    for (const pl of L.planks) {
      if (!pl.a) pl.a = [0, 0, 0, 0, 0];
      for (let i = 0; i < 5; i++) {
        const s = { x: pl.x + i * 4, y: pl.y, w: 4, h: 6 };
        const lit = litRect(s);
        pl.a[i] += ((lit ? 1 : 0) - pl.a[i]) * 0.25;
        const a = pl.a[i];
        if (a > 0.05) {
          ctx.globalAlpha = Math.min(1, a);
          ctx.fillStyle = "#c79a5c";
          ctx.fillRect(s.x, s.y, 4, 6);
          ctx.fillStyle = "#f3d59c";
          ctx.fillRect(s.x, s.y, 4, 1);
          ctx.fillStyle = "#8a6334";
          ctx.fillRect(s.x, s.y + 5, 4, 1);
          if ((pl.x / TILE + i) % 2 === 0) { ctx.fillStyle = "#a47a44"; ctx.fillRect(s.x + 1, s.y + 2, 2, 1); }
          ctx.globalAlpha = 1;
        }
      }
      // Unlit boards stay readable as a ghost: a faint fill, a dashed top edge and a slow shimmer.
      for (let i = 0; i < 5; i++) {
        const gone = 1 - Math.min(1, pl.a[i] * 2);
        if (gone <= 0) continue;
        const sx = pl.x + i * 4;
        ctx.fillStyle = rgba(pal.accent, 0.13 * gone);
        ctx.fillRect(sx, pl.y, 4, 6);
        ctx.fillStyle = rgba(pal.accent, (0.5 + 0.2 * Math.sin(t * 0.06 + (pl.x + sx) * 0.08)) * gone);
        ctx.fillRect(sx, pl.y, 3, 1);
        ctx.fillStyle = rgba(pal.accent, 0.3 * gone);
        ctx.fillRect(sx, pl.y + 5, 3, 1);
      }
    }
  }

  function drawCrystals(ctx, L, t) {
    const pal = CHAPTERS[L.chapter].pal;
    const tones = [rgba("#a56bff", 0.78), rgba("#c79bff", 0.78), rgba("#8a52e0", 0.78)];
    for (const c of L.crystals) {
      let solid = 0;
      for (let cy = 0; cy < 5; cy++) {
        for (let cx = 0; cx < 5; cx++) {
          const cell = { x: c.x + cx * 4, y: c.y + cy * 4, w: 4, h: 4 };
          if (inPhase(cell)) continue;
          solid++;
          ctx.fillStyle = tones[(cx + cy * 2 + Math.floor(c.x / TILE)) % 3];
          ctx.fillRect(cell.x, cell.y, 4, 4);
        }
      }
      if (solid === 25) {
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.fillRect(c.x + 1, c.y + 1, 2, 8);
        ctx.fillRect(c.x + 3, c.y + 1, 6, 1);
        if (Math.floor(t * 0.02 + c.x * 0.1 + c.y) % 9 === 0) { ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.fillRect(c.x + 12, c.y + 12, 2, 2); }
      }
    }
  }

  function drawThorns(ctx, L, t) {
    for (const th of L.thorns) {
      th.wither += ((th.lit ? 1 : 0) - th.wither) * 0.07;
      const w = th.wither;
      const baseX = th.tx * TILE, baseY = th.ty * TILE + TILE;
      for (let i = 0; i < 4; i++) {
        const sx = baseX + 2 + i * 5;
        const hgt = (14 - w * 8) * (0.8 + hash(th.tx + i, th.ty) * 0.4);
        const sway = Math.sin(t * 0.05 + i + th.tx) * (2 - w * 1.5);
        ctx.strokeStyle = w > 0.5 ? "#7b8a68" : "#3a1f3f";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sx, baseY);
        ctx.quadraticCurveTo(sx + sway, baseY - hgt * 0.5, sx + sway * 1.6 + (i % 2 ? 2 : -2) * (1 - w), baseY - hgt);
        ctx.stroke();
        if (w < 0.6) {
          ctx.fillStyle = "#b02a5a";
          ctx.fillRect(Math.round(sx + sway * 1.6 + (i % 2 ? 2 : -2)), Math.round(baseY - hgt - 1), 2, 2);
          ctx.fillRect(Math.round(sx + sway * 0.8 - 3), Math.round(baseY - hgt * 0.5), 2, 1);
        } else {
          ctx.fillStyle = "#e9ecd0";
          ctx.fillRect(Math.round(sx + sway * 1.2), Math.round(baseY - hgt), 2, 2);
        }
      }
    }
  }

  function drawLamp(ctx, lamp, t, dark, on) {
    const x = lamp.x, y = lamp.y;
    ctx.fillStyle = "#1b1e27";
    ctx.fillRect(x - 1, y + 2, 2, 8);
    ctx.fillRect(x - 5, y + 8, 10, 2);
    ctx.fillRect(x - 4, y - 6, 8, 2);
    ctx.fillStyle = on ? "rgba(255,225,160,0.35)" : "rgba(160,170,190,0.18)";
    ctx.fillRect(x - 3, y - 4, 6, 8);
    ctx.fillStyle = "#2a2f3c";
    ctx.fillRect(x - 4, y - 4, 1, 8);
    ctx.fillRect(x + 3, y - 4, 1, 8);
    if (lamp.switchId) {
      // a switch lamp wears its plate's colour on the frame
      ctx.fillStyle = PLATE_COLORS[lamp.switchId];
      ctx.fillRect(x - 4, y - 6, 8, 1);
      ctx.fillRect(x - 5, y + 8, 10, 1);
    }
    if (on) drawFlame(ctx, x, y + 2, t + lamp.tx * 13, "#ffb347", "#fff3b0", 0, 1.2);
    else { ctx.fillStyle = "#3a3f4d"; ctx.fillRect(x - 1, y + 3, 2, 2); }
  }

  function drawExit(ctx, L, t) {
    const ex = L.exit;
    if (!ex) return;
    const cx = ex.x + ex.w / 2;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    glowAt(ctx, cx, ex.y + ex.h / 2, 64, "#fff0b0", 0.22 + Math.sin(t * 0.05) * 0.04);
    ctx.restore();
    const pal = CHAPTERS[L.chapter].pal;
    ctx.fillStyle = pal.wallHi;
    ctx.fillRect(ex.x - 2, ex.y + 6, 3, ex.h - 6);
    ctx.fillRect(ex.x + ex.w - 1, ex.y + 6, 3, ex.h - 6);
    ctx.fillRect(ex.x, ex.y + 2, ex.w, 4);
    ctx.fillStyle = tint(pal.wallHi, 0.3);
    ctx.fillRect(ex.x - 2, ex.y + 6, 1, ex.h - 6);
    ctx.fillRect(ex.x, ex.y + 2, ex.w, 1);
    const inner = ctx.createLinearGradient(0, ex.y + 6, 0, ex.y + ex.h);
    inner.addColorStop(0, "#fff7d0");
    inner.addColorStop(1, "#ffd27a");
    ctx.fillStyle = inner;
    ctx.globalAlpha = 0.8 + Math.sin(t * 0.07) * 0.1;
    ctx.fillRect(ex.x + 1, ex.y + 6, ex.w - 2, ex.h - 6);
    ctx.globalAlpha = 1;
    for (let i = 0; i < 5; i++) {
      const a = t * 0.04 + i * 1.3;
      const mx = cx + Math.sin(a) * (ex.w / 2 - 4), my = ex.y + ex.h - ((t * 0.5 + i * 11) % (ex.h - 8)) - 2;
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.fillRect(Math.round(mx), Math.round(my), 2, 2);
    }
  }

  // Faint cues that stay visible in the dark: plank outlines, thorn glints, plates and doors.
  function drawDarkHints(ctx, L, t) {
    const pal = CHAPTERS[L.chapter].pal;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const pl of L.planks) {
      for (let i = 0; i < 5; i++) {
        const gone = 1 - Math.min(1, (pl.a ? pl.a[i] : 0) * 2);
        if (gone <= 0) continue;
        const sx = pl.x + i * 4;
        ctx.fillStyle = rgba(pal.accent, 0.3 * gone);
        ctx.fillRect(sx, pl.y, 4, 6);
        ctx.fillStyle = rgba(pal.accent, (0.75 + 0.2 * Math.sin(t * 0.06 + (pl.x + sx) * 0.08)) * gone);
        ctx.fillRect(sx, pl.y, 3, 1);
        ctx.fillStyle = rgba(pal.accent, 0.35 * gone);
        ctx.fillRect(sx, pl.y + 5, 3, 1);
      }
    }
    ctx.fillStyle = rgba(pal.accent, 0.3);
    for (const th of L.thorns) {
      if (th.lit) continue;
      if (Math.sin(t * 0.07 + th.tx * 1.7) > 0.2) {
        ctx.fillStyle = "rgba(255,70,100,0.9)";
        ctx.fillRect(th.cx - 4, th.cy - 7, 1, 1);
        ctx.fillRect(th.cx + 3, th.cy - 9, 1, 1);
      }
    }
    for (const pl of L.plates) glowAt(ctx, pl.x + pl.w / 2, pl.y + 3, 11, PLATE_COLORS[pl.id], 0.32);
    for (const d of L.doorTiles) {
      ctx.fillStyle = rgba(PLATE_COLORS[d.id], L.doorOpen[d.id] ? 0.8 : 0.45);
      ctx.fillRect(d.x + 9, d.y + 9, 2, 2);
    }
    ctx.restore();
  }

  function drawZones(ctx, t) {
    ctx.save();
    for (const f of G.flips) {
      const g = ctx.createRadialGradient(f.x, f.y, f.r * 0.2, f.x, f.y, f.r);
      g.addColorStop(0, "rgba(79,227,193,0.04)");
      g.addColorStop(0.85, "rgba(79,227,193,0.16)");
      g.addColorStop(1, "rgba(79,227,193,0.0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, TAU); ctx.fill();
      ctx.strokeStyle = "rgba(79,227,193,0.55)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.lineDashOffset = -t * 0.3;
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r - 0.5, 0, TAU); ctx.stroke();
      ctx.setLineDash([]);
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * TAU + 1.3, rr = f.r * (0.2 + 0.7 * ((i * 0.37) % 1));
        const px = f.x + Math.cos(a) * rr * 0.9, span = f.r * 1.4;
        const py = f.y + f.r * 0.8 - (((t * 1.6 + i * 23) % span));
        if ((px - f.x) ** 2 + (py - f.y) ** 2 < f.r * f.r * 0.9) {
          ctx.fillStyle = "rgba(190,255,238,0.75)";
          ctx.fillRect(Math.round(px), Math.round(py), 1, 3);
        }
      }
    }
    for (const w of G.winds) {
      ctx.strokeStyle = "rgba(223,243,255,0.45)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.lineDashOffset = -t * 0.3 * w.dir;
      ctx.beginPath(); ctx.arc(w.x, w.y, w.r - 0.5, 0, TAU); ctx.stroke();
      ctx.setLineDash([]);
      // streaks drifting the way the wind blows
      for (let i = 0; i < 12; i++) {
        const lane = ((i * 37) % 100) / 100;
        const py = w.y - w.r * 0.8 + lane * w.r * 1.6;
        const half = Math.sqrt(Math.max(0, w.r * w.r - (py - w.y) * (py - w.y)));
        const span = half * 2 || 1;
        const px = w.x - half + ((((t * 1.3 + i * 31) * w.dir) % span) + span) % span;
        ctx.fillStyle = "rgba(235,248,255," + (0.35 + 0.3 * lane) + ")";
        ctx.fillRect(Math.round(px), Math.round(py), 4, 1);
      }
    }
    for (const f of G.phases) {
      ctx.strokeStyle = "rgba(199,139,255,0.5)";
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      ctx.lineDashOffset = t * 0.25;
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, TAU); ctx.stroke();
      ctx.setLineDash([]);
      for (let i = 0; i < 6; i++) {
        const a = t * 0.02 + i * (TAU / 6);
        ctx.fillStyle = "rgba(230,200,255,0.8)";
        ctx.fillRect(Math.round(f.x + Math.cos(a) * f.r), Math.round(f.y + Math.sin(a) * f.r), 2, 2);
      }
    }
    ctx.restore();
  }

  // A small rune plate under the spawn point. Echoes fade in here at the start of every attempt.
  function drawPedestal(ctx, L, t) {
    const pal = CHAPTERS[L.chapter].pal, ped = L.ped, sp = L.spawn;
    const cx = Math.round(sp.x + PW / 2), fy = ped.y;
    // Echo keys can be "shade2", so ask each echo for its kind.
    const kinds = Object.values(G.echoes).map((e) => e.kind);
    // a plain gray slab
    ctx.fillStyle = "#4b515e";
    ctx.fillRect(ped.x, ped.y, ped.w, ped.h);
    ctx.fillStyle = "#8a92a3";
    ctx.fillRect(ped.x, ped.y, ped.w, 2);
    ctx.fillStyle = "#b4bccb";
    ctx.fillRect(ped.x, ped.y, ped.w, 1);
    ctx.fillStyle = "#363b46";
    ctx.fillRect(ped.x, ped.y + ped.h - 1, ped.w, 1);
    ctx.fillStyle = "#6c7384";
    ctx.fillRect(ped.x, ped.y + 2, 1, ped.h - 3);
    const color = kinds.length ? KINDS[kinds[Math.floor(t / 70) % kinds.length]].color : pal.accent;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    if (kinds.length && G.t < 22) {
      const a = 1 - G.t / 22;
      ctx.fillStyle = rgba(color, 0.35 * a);
      ctx.fillRect(cx - 5, fy - 26 * (1 - a * 0.4), 10, 26 * (1 - a * 0.4));
    }
    ctx.restore();
  }

  function drawEcho(ctx, e, t) {
    const k = KINDS[e.kind];
    const look = actorLook(e.kind);
    const rec = G.rec;
    const emerge = Math.min(1, G.t / 14);
    if (e.kind === "tide") {
      // a faint dotted line along the path it shuttles back and forth on
      ctx.fillStyle = rgba(k.color, 0.3);
      for (let i = 0; i < e.trace.length; i += 4) {
        const s = e.trace[i];
        ctx.fillRect(Math.round(s.x + PW / 2), Math.round(s.y + (s.g < 0 ? 0 : PH)), 1, 1);
      }
    }
    if (e.kind === "spring" && !e.moving) {
      const b = e.bounceT > 0 ? (14 - e.bounceT) : 0;
      ctx.save();
      ctx.strokeStyle = rgba(k.color, e.bounceT > 0 ? 0.8 * (e.bounceT / 14) : 0.0);
      ctx.beginPath(); ctx.ellipse(e.x + PW / 2, e.y + (e.g < 0 ? PH : 0), 8 + b, 2 + b * 0.3, 0, 0, TAU); ctx.stroke();
      ctx.restore();
    }
    if (e.moving) {
      for (let n = 4; n >= 1; n--) {
        const idx = Math.max(0, e.i - n * 3);
        const s = e.trace[idx];
        drawActor(ctx, s.x, s.y, Object.assign({ face: s.f, st: s.s, g: s.g, t, sq: 0, vx: 0, alpha: 0.12 * (5 - n) / 4 }, look));
      }
    } else {
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.08);
      ctx.save();
      ctx.strokeStyle = rgba(k.color, 0.35 + pulse * 0.3);
      ctx.lineWidth = 1;
      const fy = e.g < 0 ? e.y : e.y + PH;
      ctx.beginPath(); ctx.ellipse(e.x + PW / 2, fy, 9 + pulse * 2, 3, 0, 0, TAU); ctx.stroke();
      ctx.restore();
    }
    drawActor(ctx, e.x, e.y, Object.assign({ face: e.face, st: e.st, g: e.g, t, sq: 0, vx: e.dx * 60, alpha: 0.85 * emerge, eyesClosed: false }, look));
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    glowAt(ctx, e.x + PW / 2, e.y + (e.g < 0 ? PH + 2 : -3), 16, k.color, 0.28);
    ctx.restore();
    if (G.L.dupKinds.has(e.kind)) {
      // several echoes of one kind: number them like the slots in the bar
      Font.draw(ctx, String(G.L.slotKeys.indexOf(e.key) + 1), e.x + PW / 2, e.y - 24, { scale: 1, color: k.color, align: "center", shadow: null });
    }
    if (G.L.swap && G.L.slotKeys[G.sel] === e.key && !(rec && rec.key === e.key)) {
      Font.draw(ctx, "Q", e.x + PW / 2, e.y - 17, { scale: 1, color: k.color, align: "center", alpha: 0.7 + 0.3 * Math.sin(t * 0.1) });
    }
  }

  // While recording, a dashed ring shows how far the echo's power will reach where you stop.
  function drawRecRing(ctx, t) {
    const r = { glow: GLOW_R, phase: PHASE_R, flip: FLIP_R, gust: GUST_R }[G.rec.kind];
    if (!r) return;
    const p = G.p, k = KINDS[G.rec.kind];
    const cx = p.x + PW / 2, cy = p.y + PH / 2;
    ctx.save();
    ctx.strokeStyle = rgba(k.color, 0.4 + 0.12 * Math.sin(t * 0.12));
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);
    ctx.lineDashOffset = -t * 0.2;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
    ctx.setLineDash([]);
    if (G.rec.kind === "gust") {
      const d = p.face >= 0 ? 1 : -1;
      ctx.fillStyle = rgba(k.color, 0.55);
      for (let i = 0; i < 3; i++) {
        // a chevron whose point leads: tall at the back, a single pixel at the front
        const ax = cx + d * (14 + i * 9 + ((t * 0.5) % 9)), ay = cy - 2;
        ctx.fillRect(Math.round(ax - 2 * d), Math.round(ay), 1, 5);
        ctx.fillRect(Math.round(ax - d), Math.round(ay + 1), 1, 3);
        ctx.fillRect(Math.round(ax), Math.round(ay + 2), 1, 1);
      }
    }
    ctx.restore();
  }

  function drawPlayer(ctx, t) {
    const p = G.p;
    if (G.dead) return;
    if (G.rec) drawRecRing(ctx, t);
    let look = Object.assign({}, PLAYER_LOOK);
    if (G.rec) {
      const k = KINDS[G.rec.kind];
      look.flame = k.color;
      look.core = "#ffffff";
      if (Math.floor(t / 20) % 2 === 0) look.eye = k.color;
    }
    let a = 1;
    if (G.won) a = Math.max(0, 1 - G.winT / 40);
    if (G.rec) {
      const tr = G.rec.trace, ghost = actorLook(G.rec.kind);
      for (let n = 4; n >= 1; n--) {
        const s = tr[tr.length - 1 - n * 3];
        if (s) drawActor(ctx, s.x, s.y, Object.assign({ face: s.f, st: s.s, g: s.g, t, sq: 0, vx: 0, alpha: 0.1 * (5 - n) / 4 }, ghost));
      }
    }
    drawActor(ctx, p.x, p.y, Object.assign({ face: p.face, st: playerState(p), g: p.g, t, sq: p.sq, vx: p.vx, alpha: a }, look));
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    glowAt(ctx, p.x + PW / 2, p.y + (p.g < 0 ? PH + 2 : -3), 22, look.flame, 0.22 * a);
    ctx.restore();
  }

  function drawParticles(ctx) {
    for (const p of G.particles) {
      const a = Math.max(0, Math.min(1, p.life / p.max));
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  function drawDarkness(ctx, L, t) {
    const d = darkCtx;
    d.globalCompositeOperation = "source-over";
    d.clearRect(0, 0, W, H);
    d.fillStyle = "rgba(3,4,12,0.9)";
    d.fillRect(0, 0, W, H);
    d.globalCompositeOperation = "destination-out";
    const holes = L.exit ? G.lights.concat([{ x: L.exit.x + L.exit.w / 2, y: L.exit.y + L.exit.h / 2, r: 54 }]) : G.lights;
    for (const l of holes) {
      const fl = 1 + Math.sin(t * 0.11 + l.x) * 0.015;
      const r = l.r * fl;
      const g = d.createRadialGradient(l.x, l.y, r * 0.15, l.x, l.y, r);
      g.addColorStop(0, "rgba(0,0,0,1)");
      g.addColorStop(0.7, "rgba(0,0,0,0.85)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      d.fillStyle = g;
      d.fillRect(l.x - r, l.y - r, r * 2, r * 2);
    }
    d.globalCompositeOperation = "source-over";
    ctx.drawImage(darkCanvas, 0, 0);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const l of G.lights) glowAt(ctx, l.x, l.y, l.r * 0.9, "#ffcf7a", 0.1);
    ctx.restore();
  }

  // ------------------------------------------------------------ world
  function world(ctx, T) {
    const L = G.L;
    if (!L.bg) bake(L);
    const t = T;
    const pal = CHAPTERS[L.chapter].pal;
    ctx.save();
    if (G.shake > 0 && Settings.shake) ctx.translate(Math.round((Math.random() - 0.5) * G.shake), Math.round((Math.random() - 0.5) * G.shake));
    ctx.drawImage(L.bg, 0, 0);
    if (CHAPTERS[L.chapter].theme === "beacon") {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const a = t * 0.012;
      ctx.fillStyle = "rgba(255,240,180,0.045)";
      ctx.beginPath();
      ctx.moveTo(560, 50);
      ctx.lineTo(560 + Math.cos(a) * 700 - Math.sin(a) * 60, 50 + Math.sin(a) * 700 + Math.cos(a) * 60);
      ctx.lineTo(560 + Math.cos(a) * 700 + Math.sin(a) * 60, 50 + Math.sin(a) * 700 - Math.cos(a) * 60);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    const bubbles = CHAPTERS[L.chapter].theme === "tideworks";
    for (const m of L.motes) {
      let x, y;
      if (bubbles) {
        x = m.x + Math.sin(t * 0.03 * m.s + m.ph) * 4;
        y = ((m.y - t * 0.35 * m.s) % H + H) % H;
      } else {
        x = (m.x + Math.sin(t * 0.01 * m.s + m.ph) * 14 + t * 0.05 * m.s) % W;
        y = (m.y + Math.cos(t * 0.008 * m.s + m.ph) * 8 + H) % H;
      }
      ctx.fillStyle = rgba(pal.accent, 0.12 + 0.12 * Math.sin(t * 0.03 + m.ph));
      ctx.fillRect(Math.round(x), Math.round(y), bubbles && m.s > 0.7 ? 2 : 1, bubbles && m.s > 0.7 ? 2 : 1);
    }
    ctx.drawImage(L.tiles, 0, 0);
    drawPedestal(ctx, L, t);
    for (const pl of L.plates) drawPlate(ctx, pl, t);
    drawCrystals(ctx, L, t);
    drawPlanks(ctx, L, t);
    drawThorns(ctx, L, t);
    const lampOn = (l) => !l.switchId || !!L.doorOpen[l.switchId];
    for (const lamp of L.lamps) drawLamp(ctx, lamp, t, L.dark, lampOn(lamp));
    drawExit(ctx, L, t);
    for (const d of L.doorTiles) drawDoorTile(ctx, d, !!L.doorOpen[d.id], t, L);
    for (const gt of L.gates) drawGate(ctx, gt, t);
    for (const ln of L.lanterns) drawLantern(ctx, ln, t);
    if (L.dark) {
      drawDarkness(ctx, L, t);
      drawDarkHints(ctx, L, t);
    } else {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (const l of L.lamps) if (lampOn(l)) glowAt(ctx, l.x, l.y, 46, "#ffb860", 0.16);
      ctx.restore();
    }
    drawZones(ctx, t);
    for (const k in G.echoes) drawEcho(ctx, G.echoes[k], t);
    drawPlayer(ctx, t);
    drawParticles(ctx);
    ctx.restore();
    ctx.drawImage(vignette, 0, 0);
  }

  // ------------------------------------------------------------ HUD
  function slotIcon(ctx, x, y, kind, t, on) {
    const k = KINDS[kind];
    const pat = EMBLEMS[kind];
    ctx.fillStyle = on ? k.color : rgba(k.color, 0.45);
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) if (pat[r][c] === "#") ctx.fillRect(x - 5 + c * 2, y - 5 + r * 2, 2, 2);
  }

  function drawLanternIcon(ctx, x, y, got) {
    ctx.fillStyle = got ? "#ffd35a" : "rgba(160,168,185,0.35)";
    ctx.fillRect(x - 1, y - 5, 2, 2);
    ctx.fillRect(x - 3, y - 3, 6, 6);
    ctx.fillStyle = got ? "#fff3b0" : "rgba(20,24,34,0.9)";
    ctx.fillRect(x - 2, y - 2, 4, 4);
    ctx.fillStyle = got ? "#ffd35a" : "rgba(160,168,185,0.35)";
    ctx.fillRect(x - 3, y + 3, 6, 1);
  }

  // Two arrows pointing opposite ways: the swap ability. (x, y) is the centre; 9 by 7 pixels.
  function drawSwapIcon(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x - 4, y - 2, 7, 1);
    ctx.fillRect(x + 2, y - 3, 1, 3);
    ctx.fillRect(x + 3, y - 2, 1, 1);
    ctx.fillRect(x - 2, y + 2, 7, 1);
    ctx.fillRect(x - 2, y + 1, 1, 3);
    ctx.fillRect(x - 3, y + 2, 1, 1);
  }

  function hud(ctx, T, num) {
    const L = G.L;
    Font.draw(ctx, num + "  " + L.name, 8, 6, { scale: 1, color: "#e8e2d0" });
    if (L.swap) {
      // swap is an ability some levels switch on, not an echo, so it gets its own chip away from the echo slots
      const kq = keyName(Input.bind.swap[0]);
      const label = "SWAP " + kq;
      const w = 20 + label.length * 6;
      ctx.fillStyle = "rgba(6,8,16,0.75)";
      ctx.fillRect(8, 18, w, 13);
      ctx.strokeStyle = "rgba(255,255,255,0.65)";
      ctx.lineWidth = 1;
      ctx.strokeRect(8.5, 18.5, w - 1, 12);
      drawSwapIcon(ctx, 18, 24, "#ffffff");
      Font.draw(ctx, label, 28, 21, { scale: 1, color: "#ffffff", shadow: null });
    }
    if (L.echoes.length) {
      const n = L.echoes.length, bw = n > 5 ? 72 : 76, gap = n > 5 ? 3 : 6;
      const total = n * bw + (n - 1) * gap;
      let x0 = Math.round((W - total) / 2);
      const y0 = H - 30;
      for (let i = 0; i < n; i++) {
        const kind = L.echoes[i], k = KINDS[kind], key = L.slotKeys[i];
        const x = x0 + i * (bw + gap);
        const sel = G.sel === i;
        const recording = G.rec && G.rec.key === key;
        const have = !!G.echoes[key];
        const label = k.name + (L.dupKinds.has(kind) ? " " + L.slotNum[i] : "");
        ctx.fillStyle = "rgba(6,8,16,0.72)";
        ctx.fillRect(x, y0, bw, 24);
        ctx.strokeStyle = sel ? k.color : "rgba(255,255,255,0.18)";
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y0 + 0.5, bw - 1, 23);
        if (sel) { ctx.fillStyle = rgba(k.color, 0.14); ctx.fillRect(x + 1, y0 + 1, bw - 2, 22); }
        slotIcon(ctx, x + 14, y0 + 13, kind, T, have || recording);
        Font.draw(ctx, String(i + 1), x + 4, y0 + 3, { scale: 1, color: "#9fa7b8", shadow: null });
        Font.draw(ctx, label, x + 24, y0 + 4, { scale: 1, color: sel ? "#ffffff" : "#b6bdcc", shadow: null });
        const status = recording ? "REC" : have ? "READY" : "EMPTY";
        const sc = recording ? (Math.floor(T / 15) % 2 ? "#ff6b6b" : "#ffb0b0") : have ? k.color : "#6b7385";
        Font.draw(ctx, status, x + 24, y0 + 14, { scale: 1, color: sc, shadow: null });
      }
      if (G.rec) {
        const frac = G.rec.trace.length / (L.recMax * 60);
        const bwid = 200, bx = Math.round((W - bwid) / 2);
        ctx.fillStyle = "rgba(6,8,16,0.7)";
        ctx.fillRect(bx - 1, 5, bwid + 2, 7);
        ctx.fillStyle = frac > 0.8 ? "#ff6b6b" : KINDS[G.rec.kind].color;
        ctx.fillRect(bx, 6, Math.round(bwid * frac), 5);
        Font.draw(ctx, "RECORDING  " + keyName(Input.bind.record[0]) + " TO STOP", W / 2, 15, { scale: 1, color: "#ffd0d0", align: "center" });
      }
      if (G.notice && G.notice.t > 0) {
        const a = Math.min(1, G.notice.t / 30);
        Font.draw(ctx, G.notice.text, W / 2, H - 54, { scale: 1, color: "#ffb0b0", align: "center", alpha: a });
      }
      const kn = (name) => keyName(Input.bind[name][0]);
      // The clear hint only appears once there is an echo to clear.
      const keys = kn("record") + " " + (G.rec ? "STOP" : "RECORD") + "   " + kn("restart") + " RESTART" + (L.swap ? "   " + kn("swap") + " SWAP" : "") + (Object.keys(G.echoes).length ? "   " + kn("clear") + " CLEAR" : "");
      Font.draw(ctx, keys, W / 2, H - 41, { scale: 1, color: "rgba(220,226,240,0.55)", align: "center", shadow: null });
    } else {
      Font.draw(ctx, keyName(Input.bind.restart[0]) + " RESTART", W / 2, H - 14, { scale: 1, color: "rgba(220,226,240,0.45)", align: "center", shadow: null });
    }
    Font.draw(ctx, keyName(Input.bind.pause[0]) + " MENU", W - 8, 6, { scale: 1, color: "rgba(220,226,240,0.45)", align: "right", shadow: null });
    if (L.lanterns.length) drawLanternIcon(ctx, W - 14, 28, G.lanternsGot > 0);
  }

  return { world, hud, bake, drawSwapIcon, drawActor, drawFlame, glowAt, drawLanternIcon, slotIcon, EMBLEMS, PLAYER_LOOK, rgba, tint, mulberry, hash };
})();
