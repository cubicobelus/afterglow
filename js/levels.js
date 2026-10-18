"use strict";

// levels.js: chapters and level layouts.
// Grid is 32 x 18 tiles (20px each). Floor surface is row 15, so spawn at row 14 stands on it.
// Tiles: # wall, % crystal, ~ shadow plank, ^ v spikes, t thorns, a-d floor plates, 1-4 ceiling plates (a-d),
// A-D doors, L lamp, @ spawn, X exit.

const TITLE = "AFTERGLOW";

const CHAPTERS = [
  {
    name: "THE CELLAR", line: "SOMETHING REMEMBERS YOU.", theme: "cellar", mood: 0,
    unlock: "SHADE ECHO: PRESS E TO RECORD, E AGAIN TO STOP. YOUR ECHO REPLAYS AND HOLDS PLATES.",
    pal: { bg1: "#0d1d2a", bg2: "#1b3a47", wall: "#33495b", wallHi: "#4d6f86", wallLo: "#1e2e3c", mortar: "#15232f", accent: "#7fd0c0", moss: "#4d8a5e" },
  },
  {
    name: "THE ARCHIVE", line: "LIGHT IS A KIND OF MEMORY.", theme: "archive", mood: 1,
    unlock: "GLOW ECHO: IT CARRIES LIGHT. SHADOW PLANKS ONLY HOLD IN LIGHT, AND THORNS WITHER.",
    pal: { bg1: "#1b120e", bg2: "#35241a", wall: "#5d4533", wallHi: "#82624a", wallLo: "#35261b", mortar: "#26190f", accent: "#ffc857" },
  },
  {
    name: "THE GALLERY", line: "EVERYTHING HERE IS A REFLECTION.", theme: "gallery", mood: 2,
    unlock: "PHASE ECHO: CRYSTAL FADES AWAY AROUND IT.",
    pal: { bg1: "#160f2c", bg2: "#2f2558", wall: "#4b4474", wallHi: "#6e66a4", wallLo: "#2a2549", mortar: "#1b1735", accent: "#c78bff" },
  },
  {
    name: "THE REVERSAL", line: "UP IS ONLY A POINT OF VIEW.", theme: "reversal", mood: 3,
    unlock: "FLIP ECHO: GRAVITY IS REVERSED AROUND IT. FALL UPWARD.",
    pal: { bg1: "#09201d", bg2: "#14463f", wall: "#2f6058", wallHi: "#48908a", wallLo: "#1a3c37", mortar: "#0f2f2b", accent: "#4fe3c1" },
  },
  {
    name: "THE BEACON", line: "RELIGHT THE LAMP.", theme: "beacon", mood: 4,
    unlock: "SWAP: PRESS Q TO TRADE PLACES WITH THE SELECTED ECHO. IT TAKES YOUR SPOT.",
    pal: { bg1: "#080c2a", bg2: "#243b70", wall: "#4b5b83", wallHi: "#7488b8", wallLo: "#2b3656", mortar: "#1d2740", accent: "#fff0b0" },
  },
];

const LEVELS = [];
function def(chapter, name, opts, build) {
  LEVELS.push(Object.assign({ chapter, name, build }, opts));
}

// ---------------------------------------------------------------- chapter 1: the cellar
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

def(0, "THE PLATE", {
  echoes: ["shade"], recMax: 8,
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

def(0, "STEPPING STONE", {
  echoes: ["shade"], recMax: 8,
  hint: "ECHOES FREEZE WHERE YOU STOP. JUMP OUT OVER THE GAP, STOP RECORDING IN MID AIR, THEN STAND ON YOUR ECHO.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(13, 17);
  g.fill(28, 13, 28, 14, "X");
  g.set(5, 8, "L").set(15, 5, "L").set(25, 8, "L");
});

// ---------------------------------------------------------------- chapter 2: the archive
def(1, "LAMPLIGHT", {
  echoes: ["glow"], recMax: 10, dark: true,
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

def(1, "THORN HALL", {
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

def(1, "RELAY", {
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

// ---------------------------------------------------------------- chapter 3: the gallery
def(2, "GLASS WALL", {
  echoes: ["phase"], recMax: 8,
  hint: "STAND NEXT TO THE CRYSTAL AND RECORD. WHEREVER YOUR ECHO STANDS, THE GLASS GIVES WAY.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(15, 1, 16, 14, "%");
  g.fill(22, 14, 23, 14, "^");
  g.fill(28, 13, 28, 14, "X");
  g.set(6, 8, "L").set(20, 6, "L");
});

def(2, "UNDER GLASS", {
  echoes: ["phase", "shade"], recMax: 10,
  hint: "A PLATE SITS IN A VAULT UNDER GLASS. OPEN THE GLASS FIRST, THEN SEND IN A SHADE.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(14, 16, 18, 16, ".");
  g.fill(15, 15, 17, 15, "%");
  g.set(16, 16, "a");
  g.fill(23, 1, 23, 8, "#");
  g.fill(23, 9, 23, 14, "A");
  g.fill(28, 13, 28, 14, "X");
  g.set(6, 8, "L").set(26, 8, "L");
});

def(2, "TWO KEYS", {
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

// ---------------------------------------------------------------- chapter 4: the reversal
def(3, "UPDRAFT", {
  echoes: ["flip"], recMax: 8,
  hint: "STEP INTO THE FLIP ZONE AND FALL UPWARD. LET GO AT THE TOP AND DRIFT ONTO THE LEDGE.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(20, 9, 30, 14, "#");
  g.fill(28, 7, 28, 8, "X");
  g.set(6, 9, "L").set(14, 6, "L");
});

def(3, "CEILING PLATE", {
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

def(3, "HIGH PLATE", {
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

// ---------------------------------------------------------------- chapter 5: the beacon
def(4, "LEAPFROG", {
  echoes: ["glow"], recMax: 8, dark: true, swap: true,
  hint: "THE BRIDGE IS LONGER THAN ONE LIGHT. WALK TO THE EDGE OF THE LIGHT, THEN PRESS Q.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(6, 25);
  g.fill(6, 14, 25, 14, "~");
  g.fill(28, 13, 28, 14, "X");
  g.set(27, 10, "L");
});

def(4, "SECOND WIND", {
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

def(4, "THE BEACON", {
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
