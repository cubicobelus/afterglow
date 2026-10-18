"use strict";

// levels.js: tiers and level layouts.
// Grid is 32 x 18 tiles (20px each). Floor surface is row 15, so spawn at row 14 stands on it.
// Tiles: # wall, % crystal, ~ shadow plank, = one-way ledge (jump up through it), ^ v spikes, t thorns,
// a-d floor plates, 1-4 ceiling plates, 5-8 light-sensor plates (a-d), A-D doors, G light gate,
// L lamp, P-S lamps that burn only while plate a-d is held, o lantern, @ spawn, X exit.
// Each tier has its own scenery and teaches its echoes in turn, then mixes them.

const TITLE = "AFTERGLOW";

const CHAPTERS = [
  {
    name: "THE CELLAR", line: "SOMETHING REMEMBERS YOU.", theme: "cellar", mood: 0,
    pal: { bg1: "#0d1d2a", bg2: "#1b3a47", wall: "#33495b", wallHi: "#4d6f86", wallLo: "#1e2e3c", mortar: "#15232f", accent: "#7fd0c0", moss: "#4d8a5e" },
  },
  {
    name: "THE GALLERY", line: "EVERYTHING HERE IS A REFLECTION.", theme: "gallery", mood: 2,
    pal: { bg1: "#160f2c", bg2: "#2f2558", wall: "#4b4474", wallHi: "#6e66a4", wallLo: "#2a2549", mortar: "#1b1735", accent: "#c78bff" },
  },
  {
    name: "THE TIDEWORKS", line: "THE WATER REMEMBERS EVERY ROUTE.", theme: "tideworks", mood: 1,
    pal: { bg1: "#06182a", bg2: "#0d4a5c", wall: "#3f5f70", wallHi: "#79a5b4", wallLo: "#243d4b", mortar: "#12212c", accent: "#7fe0e6" },
  },
  {
    name: "THE BEACON", line: "RELIGHT THE LAMP.", theme: "beacon", mood: 4,
    pal: { bg1: "#080c2a", bg2: "#243b70", wall: "#4b5b83", wallHi: "#7488b8", wallLo: "#2b3656", mortar: "#1d2740", accent: "#fff0b0" },
  },
];

const LEVELS = [];
function def(chapter, name, opts, build) {
  LEVELS.push(Object.assign({ chapter, name, build }, opts));
}

// ================================================================ tier 1: the cellar
// ---------------------------------------------------------------- intro
def(0, "FIRST STEPS", {
  echoes: [],
  hint: "ARROWS OR A AND D TO MOVE. SPACE TO JUMP. REACH THE DOOR OF LIGHT.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(6, 14, 7, 14, "^");
  g.fill(10, 13, 11, 14, "#");
  g.pit(14, 16);
  g.fill(19, 14, 20, 14, "#");
  g.fill(22, 13, 23, 14, "#");
  g.fill(25, 12, 26, 14, "#");
  g.fill(28, 11, 30, 14, "#");
  g.fill(29, 9, 29, 10, "X");
  g.set(4, 9, "L").set(16, 7, "L").set(24, 8, "L");
});

// ---------------------------------------------------------------- shade
def(0, "THE PLATE", {
  unlock: "shade", echoes: ["shade"], recMax: 8,
  hint: "PRESS E TO RECORD. WALK TO THE PLATE. PRESS E AGAIN. YOUR ECHO WILL HOLD IT FOR YOU.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.set(9, 14, "a");
  g.fill(18, 1, 18, 8, "#");
  g.fill(18, 9, 18, 14, "A");
  g.fill(22, 14, 23, 14, "^");
  g.fill(27, 13, 27, 14, "X");
  g.set(5, 9, "L").set(14, 6, "L").set(25, 9, "L");
});

def(0, "BOOST", {
  echoes: ["shade"], recMax: 8,
  hint: "AN ECHO IS A STEP. LEAVE ONE BY THE WALL, JUMP ON IT, THEN JUMP ON TO THE TOP.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(14, 11, 15, 14, "#");
  g.fill(17, 14, 18, 14, "^");
  g.fill(27, 13, 27, 14, "X");
  g.set(6, 8, "L").set(16, 6, "L").set(24, 8, "L");
});

def(0, "STEPPING STONE", {
  echoes: ["shade"], recMax: 8,
  hint: "ECHOES FREEZE WHERE YOU STOP. JUMP OUT OVER THE GAP, STOP RECORDING IN MID AIR, THEN STAND ON YOUR ECHO.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(13, 17);
  g.set(16, 9, "o");
  g.fill(28, 13, 28, 14, "X");
  g.set(5, 8, "L").set(15, 5, "L").set(25, 8, "L");
});

// ---------------------------------------------------------------- glow
def(0, "LAMPLIGHT", {
  unlock: "glow", echoes: ["glow"], recMax: 10, dark: true,
  hint: "THE DARK PLANKS ARE REAL ONLY WHERE LIGHT TOUCHES THEM. ECHO A GLOW ON THE ISLAND.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(8, 23);
  g.fill(8, 14, 13, 14, "~");
  g.fill(14, 14, 17, 17, "#");
  g.fill(18, 14, 23, 14, "~");
  g.set(10, 12, "L");
  g.fill(28, 13, 28, 14, "X");
  g.set(29, 10, "L");
});

def(0, "THORN HALL", {
  echoes: ["glow"], recMax: 10, dark: true,
  hint: "THORNS KILL IN THE DARK AND WITHER IN THE LIGHT. THE PLATFORM ABOVE HAS A GOOD VIEW.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(8, 14, 9, 14, "#");
  g.fill(11, 12, 19, 12, "#");
  g.fill(12, 14, 18, 14, "t");
  g.fill(20, 1, 20, 12, "#");
  g.fill(28, 13, 28, 14, "X");
  g.set(4, 11, "L").set(26, 11, "L");
});

def(0, "SUNKEN GATE", {
  echoes: ["glow"], recMax: 10, dark: true,
  hint: "A LIGHT GATE OPENS WHILE LIGHT FALLS ON IT. CLIMB THE LEDGES AND LEAVE A GLOW NEAR THE GATE.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(5, 14, 18, 14, "t");
  g.fill(5, 12, 6, 12, "=");
  g.fill(8, 9, 9, 9, "=");
  g.fill(11, 6, 12, 6, "=");
  g.fill(14, 6, 19, 6, "#");
  g.fill(20, 1, 20, 14, "#");
  g.fill(20, 4, 20, 5, "G");
  g.fill(21, 6, 30, 14, "#");
  g.fill(28, 4, 28, 5, "X");
  g.set(1, 10, "L").set(27, 3, "L");
});

// ---------------------------------------------------------------- mix
def(0, "RELAY", {
  echoes: ["shade", "glow"], recMax: 12, dark: true,
  hint: "ONE ECHO OF EACH KIND AT A TIME. RECORD THEM IN ORDER. THEY ALL REPLAY TOGETHER.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(8, 14, 9, 14, "#");
  g.fill(11, 12, 19, 12, "#");
  g.fill(12, 14, 18, 14, "t");
  g.set(12, 11, "a");
  g.fill(20, 1, 20, 12, "#");
  g.fill(20, 13, 20, 14, "A");
  g.fill(28, 13, 28, 14, "X");
  g.set(4, 11, "L").set(26, 11, "L");
});

def(0, "SWITCHBOARD", {
  echoes: ["shade", "glow"], recMax: 12, dark: true,
  hint: "THE LAMP OVER THE BRIDGE BURNS ONLY WHILE ITS PLATE IS HELD. THE ISLAND NEEDS A GLOW.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.set(6, 14, "a");
  g.pit(10, 25);
  g.fill(10, 14, 15, 14, "~");
  g.fill(16, 14, 19, 17, "#");
  g.fill(20, 14, 25, 14, "~");
  g.set(12, 10, "P");
  g.fill(28, 13, 28, 14, "X");
  g.set(29, 8, "L");
});

// ================================================================ tier 2: the gallery
// ---------------------------------------------------------------- phase
def(1, "GLASS WALL", {
  unlock: "phase", echoes: ["phase"], recMax: 8,
  hint: "STAND NEXT TO THE CRYSTAL AND RECORD. WHEREVER YOUR ECHO STANDS, THE GLASS GIVES WAY.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(15, 1, 16, 14, "%");
  g.fill(22, 14, 23, 14, "^");
  g.fill(28, 13, 28, 14, "X");
  g.set(6, 8, "L").set(20, 6, "L");
});

def(1, "UNDER GLASS", {
  echoes: ["phase", "shade"], recMax: 10,
  hint: "A PLATE SITS IN A VAULT UNDER GLASS. OPEN THE GLASS FIRST, THEN SEND IN A SHADE.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(14, 16, 18, 16, ".");
  g.fill(15, 15, 17, 15, "%");
  g.set(16, 16, "a");
  g.set(17, 16, "o");
  g.fill(23, 1, 23, 8, "#");
  g.fill(23, 9, 23, 14, "A");
  g.fill(28, 13, 28, 14, "X");
  g.set(6, 8, "L").set(26, 8, "L");
});

def(1, "TRAPDOOR", {
  echoes: ["phase"], recMax: 8,
  hint: "THE FLOOR ITSELF IS GLASS. STAND ON IT, RECORD, AND LET IT FADE. THE WAY ON IS BELOW.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(10, 15, 12, 15, "%");
  g.fill(10, 16, 27, 16, ".");
  g.fill(18, 1, 18, 14, "#");
  g.fill(24, 15, 25, 15, ".");
  g.fill(28, 13, 28, 14, "X");
  g.set(6, 8, "L").set(22, 8, "L");
});

// ---------------------------------------------------------------- flip
def(1, "UPDRAFT", {
  unlock: "flip", echoes: ["flip"], recMax: 8,
  hint: "STEP INTO THE FLIP ZONE AND FALL UPWARD. LET GO AT THE TOP AND DRIFT ONTO THE LEDGE.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(20, 9, 30, 14, "#");
  g.fill(28, 7, 28, 8, "X");
  g.set(6, 9, "L").set(14, 6, "L");
});

def(1, "CEILING PLATE", {
  echoes: ["flip", "shade"], recMax: 10,
  hint: "THE PLATE HANGS FROM THE CEILING. A FLIP ZONE LETS YOU WALK UP THERE.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(8, 1, 23, 10, "#");
  g.set(15, 14, "#");
  g.set(14, 11, "1");
  g.fill(23, 11, 23, 14, "A");
  g.fill(28, 13, 28, 14, "X");
  g.set(5, 9, "L").set(26, 9, "L");
});

def(1, "HIGH PLATE", {
  echoes: ["flip", "shade"], recMax: 12,
  hint: "A PLATE ON A HIGH LEDGE. YOUR SHADE CAN RIDE THE UPDRAFT FOR YOU.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(12, 9, 16, 14, "#");
  g.set(14, 8, "a");
  g.fill(22, 1, 22, 8, "#");
  g.fill(22, 9, 22, 14, "A");
  g.fill(28, 13, 28, 14, "X");
  g.set(5, 9, "L").set(26, 9, "L");
});

// ---------------------------------------------------------------- mix
def(1, "TWO KEYS", {
  echoes: ["phase", "glow"], recMax: 12, dark: true,
  hint: "YOU CANNOT REACH THE PLATFORM WITHOUT THE PHASE. THE THORNS NEED THE GLOW.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(10, 1, 11, 14, "%");
  g.fill(12, 14, 13, 14, "#");
  g.fill(15, 12, 23, 12, "#");
  g.fill(16, 14, 22, 14, "t");
  g.fill(24, 1, 24, 12, "#");
  g.fill(28, 13, 28, 14, "X");
  g.set(5, 11, "L").set(27, 11, "L");
});

def(1, "TWIN ECHOES", {
  echoes: ["phase", "flip"], recMax: 10,
  hint: "THE UPDRAFT IS BEHIND GLASS. OPEN THE GLASS, THEN PLACE THE FLIP.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(8, 1, 9, 14, "%");
  g.fill(20, 9, 30, 14, "#");
  g.fill(28, 7, 28, 8, "X");
  g.set(5, 8, "L").set(14, 6, "L");
});

def(1, "LANTERN LIFT", {
  echoes: ["flip", "glow"], recMax: 12, dark: true,
  hint: "RIDE THE UPDRAFT UP TO THE LEDGE. THE PLANKS BEYOND NEED A GLOW.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(12, 9, 16, 14, "#");
  g.fill(19, 6, 22, 6, "~");
  g.fill(23, 6, 30, 14, "#");
  g.fill(28, 4, 28, 5, "X");
  g.set(4, 10, "L").set(27, 2, "L");
});

// ================================================================ tier 3: the tideworks
// (levels are added tier by tier)

// ================================================================ tier 4: the beacon
def(3, "LEAPFROG", {
  unlock: "swap", echoes: ["glow"], recMax: 8, dark: true, swap: true,
  hint: "THE BRIDGE IS LONGER THAN ONE LIGHT. WALK TO THE EDGE OF THE LIGHT, THEN PRESS Q.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(6, 25);
  g.fill(6, 14, 25, 14, "~");
  g.fill(28, 13, 28, 14, "X");
  g.set(27, 10, "L");
});

def(3, "SECOND WIND", {
  echoes: ["shade", "flip"], recMax: 14, swap: true,
  hint: "SWAP WORKS WHILE RECORDING TOO. USE ONE ECHO TO PLACE ANOTHER.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(12, 9, 17, 14, "#");
  g.fill(19, 3, 30, 14, "#");
  g.fill(27, 1, 27, 2, "X");
  g.set(5, 9, "L").set(22, 1, "L");
});

def(3, "THE BEACON", {
  echoes: ["phase", "glow", "shade", "flip"], recMax: 14, dark: true, swap: true,
  hint: "EVERYTHING YOU HAVE LEARNED. THE LAMP IS AT THE TOP.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(6, 1, 7, 14, "%");
  g.fill(9, 14, 10, 14, "#");
  g.fill(12, 12, 19, 12, "#");
  g.fill(13, 14, 18, 14, "t");
  g.set(12, 11, "a");
  g.fill(20, 1, 20, 12, "#");
  g.fill(20, 13, 20, 14, "A");
  g.fill(27, 9, 30, 14, "#");
  g.fill(29, 7, 29, 8, "X");
  g.set(4, 11, "L").set(23, 11, "L");
});
