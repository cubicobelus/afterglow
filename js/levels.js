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

def(0, "STEPPING STONE", {
  echoes: ["shade"], recMax: 8,
  hint: "ECHOES FREEZE WHERE YOU STOP. JUMP OUT OVER THE GAP, STOP RECORDING IN MID AIR, THEN STAND ON YOUR ECHO.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(13, 17);
  g.set(15, 9, "o");
  g.fill(28, 13, 28, 14, "X");
  g.set(5, 8, "L").set(15, 5, "L").set(25, 8, "L");
});

def(0, "TWIN PLATES", {
  echoes: ["shade", "shade"], recMax: 10,
  hint: "TWO SHADE SLOTS: PRESS 1 OR 2 TO CHOOSE. THE DOOR NEEDS BOTH PLATES HELD, AND AN ECHO IS ALSO A STEP.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.set(9, 14, "a");
  g.fill(10, 11, 15, 14, "#");
  g.set(13, 10, "a");
  g.fill(18, 1, 18, 8, "#");
  g.fill(18, 9, 18, 14, "A");
  g.fill(22, 14, 23, 14, "^");
  g.fill(27, 13, 27, 14, "X");
  g.set(5, 9, "L").set(13, 6, "L").set(25, 9, "L");
});

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
  g.set(12, 3, "o");
  g.set(1, 10, "L").set(27, 3, "L");
});

def(0, "RELAY", {
  echoes: ["shade", "glow"], recMax: 12, dark: true,
  hint: "EACH SLOT HOLDS ONE ECHO. RECORD THEM IN ORDER. THEY ALL REPLAY TOGETHER.",
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

def(1, "GHOST GLASS", {
  echoes: ["phase", "shade"], recMax: 10,
  hint: "THE PLATE IS SEALED BEHIND GLASS AND SO IS THE WAY ON. YOU CAN RECORD THE PHASE AGAIN, AND AN ECHO DOES NOT CARE ABOUT GLASS.",
}, (g) => {
  g.base();
  g.set(7, 14, "@");
  g.fill(3, 1, 4, 14, "%");
  g.set(1, 14, "a");
  g.fill(12, 1, 13, 14, "%");
  g.fill(20, 1, 20, 8, "#");
  g.fill(20, 9, 20, 14, "A");
  g.fill(27, 13, 27, 14, "X");
  g.set(9, 8, "L").set(16, 8, "L").set(24, 8, "L").set(1, 9, "L");
});

def(1, "CHANDELIER", {
  echoes: ["flip", "flip", "flip"], recMax: 12,
  hint: "INSIDE A FLIP ZONE THE CEILING IS YOUR FLOOR. EACH NEW ZONE HAS TO BE RECORDED FROM INSIDE THE LAST.",
}, (g) => {
  g.base();
  g.fill(1, 3, 7, 14, "#");
  g.set(2, 2, "@");
  g.fill(8, 14, 16, 14, "^");
  g.fill(17, 3, 30, 14, "#");
  g.fill(27, 1, 27, 2, "X");
  g.set(12, 7, "L");
});

def(1, "HALL OF MIRRORS", {
  echoes: ["phase", "glow", "shade", "flip"], recMax: 14, dark: true,
  hint: "FOUR KINDS, ONE ROUTE. WORK OUT WHAT MUST BE IN PLACE BEFORE EACH RECORDING.",
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

// ================================================================ tier 3: the tideworks
def(2, "FERRY", {
  unlock: "tide", echoes: ["tide"], recMax: 10,
  hint: "TIDE REPLAYS YOUR PATH BACK AND FORTH, WAITING WHERE YOU WAITED. WAIT AT THE EDGE, JUMP OUT, STOP IN MID AIR, THEN RIDE IT.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(9, 15);
  g.fill(28, 13, 28, 14, "X");
  g.set(5, 8, "L").set(12, 5, "L").set(25, 8, "L");
});

def(2, "LIFT", {
  echoes: ["shade", "tide"], recMax: 14, dark: true,
  hint: "THE STAIRS LIGHT UP ONLY WHILE PLATE ONE IS HELD. RIDE YOUR TIDE UP, AND LET THE SHADE GO TO THE OTHER PLATE.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.set(5, 14, "a");
  g.set(8, 14, "b");
  g.fill(12, 12, 13, 12, "~");
  g.fill(15, 9, 16, 9, "~");
  g.fill(18, 6, 19, 6, "~");
  g.fill(21, 6, 24, 6, "#");
  g.fill(25, 1, 25, 14, "#");
  g.fill(25, 4, 25, 5, "B");
  g.fill(26, 6, 30, 14, "#");
  g.fill(29, 4, 29, 5, "X");
  g.set(14, 11, "P").set(18, 8, "P");
  g.set(27, 3, "L");
});

def(2, "TRAMPOLINE", {
  unlock: "spring", echoes: ["spring"], recMax: 8,
  hint: "LAND ON A SPRING TO BOUNCE. HOLD JUMP AS YOU LAND FOR A MUCH BIGGER BOUNCE.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(20, 7, 30, 14, "#");
  g.fill(28, 5, 28, 6, "X");
  g.set(23, 4, "o");
  g.set(6, 9, "L").set(14, 6, "L");
});

def(2, "SKYHOOK", {
  echoes: ["spring"], recMax: 8,
  hint: "FREEZE A SPRING IN MID AIR OVER THE GAP, LAND ON IT, AND HOLD JUMP.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(9, 15);
  g.fill(16, 5, 30, 14, "#");
  g.fill(28, 3, 28, 4, "X");
  g.set(5, 8, "L").set(12, 4, "L");
});

def(2, "TWO STAGES", {
  echoes: ["spring", "tide"], recMax: 14,
  hint: "THE SPRING MUST BE ON THE LEDGE. USE YOUR TIDE TO GET IT THERE.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(10, 9, 14, 14, "#");
  g.fill(18, 5, 30, 14, "#");
  g.fill(28, 3, 28, 4, "X");
  g.set(5, 9, "L").set(16, 3, "L");
});

def(2, "FERRY LIGHT", {
  echoes: ["glow", "tide"], recMax: 14, dark: true,
  hint: "LIGHT THE BRIDGE, SEND A TIDE ACROSS, THEN MOVE THE GLOW TO THE GATE. THE TIDE CARRIES YOU OVER THE DARK.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(8, 21);
  g.fill(8, 14, 13, 14, "~");
  g.fill(14, 14, 17, 17, "#");
  g.fill(18, 14, 21, 14, "~");
  g.set(10, 12, "L");
  g.fill(26, 1, 26, 12, "#");
  g.fill(26, 13, 26, 14, "G");
  g.fill(29, 13, 29, 14, "X");
  g.set(30, 8, "L");
});

def(2, "STACKED SPRINGS", {
  echoes: ["spring", "spring", "glow"], recMax: 14, dark: true,
  hint: "A HELD BOUNCE REACHES THE LOW LEDGE. A SECOND SPRING UP THERE REACHES THE TOP. THE GATE NEEDS A GLOW BESIDE IT.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(9, 7, 13, 14, "#");
  g.fill(10, 3, 30, 3, "=");
  g.fill(25, 1, 25, 2, "G");
  g.fill(28, 1, 28, 2, "X");
  g.set(5, 5, "o");
  g.set(3, 11, "L").set(11, 5, "L").set(19, 11, "L");
});

def(2, "PUMP ROOM", {
  echoes: ["shade", "shade", "tide", "glow"], recMax: 24, dark: true,
  hint: "A TIDE RIDES THE ROUTE YOU TOOK, AND ECHOES YOU NO LONGER NEED CAN BE RECORDED AGAIN.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.set(8, 10, "=");
  g.fill(9, 10, 30, 14, "#");
  g.set(16, 9, "a").set(19, 9, "a");
  g.fill(23, 1, 23, 6, "#").fill(23, 7, 23, 9, "A");
  g.fill(26, 1, 26, 6, "#").fill(26, 7, 26, 9, "G");
  g.fill(28, 8, 28, 9, "X");
  g.set(4, 11, "L").set(11, 6, "L").set(17, 5, "L");
});

// ================================================================ tier 4: the beacon
def(3, "BREEZE", {
  unlock: "gust", echoes: ["gust"], recMax: 8,
  hint: "A GUST BLOWS THE WAY YOU FACED WHEN YOU STOPPED. STAND AT THE EDGE FACING THE GAP, THEN JUMP INTO THE WIND.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(9, 14);
  g.set(13, 11, "o");
  g.fill(28, 13, 28, 14, "X");
  g.set(5, 8, "L").set(13, 5, "L").set(24, 8, "L");
});

def(3, "SAIL", {
  echoes: ["gust", "tide"], recMax: 14,
  hint: "RECORD THE TIDE'S JUMP WITH THE WIND BEHIND YOU, AND IT REACHES FARTHER THAN YOU COULD ALONE.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(9, 18);
  g.fill(28, 13, 28, 14, "X");
  g.set(5, 8, "L").set(14, 5, "L").set(25, 8, "L");
});

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

def(3, "TAXI", {
  echoes: ["shade", "tide"], recMax: 14, dark: true, swap: true,
  hint: "THE BRIDGE LIGHTS UP ONLY WHILE PLATE ONE IS HELD. SEND A TIDE ACROSS, FREE THE SHADE, THEN SWAP TO WHEREVER THE TIDE IS.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.set(4, 14, "a");
  g.set(7, 14, "b");
  g.pit(10, 24);
  g.fill(10, 14, 24, 14, "~");
  g.set(12, 10, "P").set(19, 10, "P").set(23, 10, "P");
  g.fill(28, 1, 28, 12, "#");
  g.fill(28, 13, 28, 14, "B");
  g.fill(30, 13, 30, 14, "X");
});

def(3, "CHORUS", {
  echoes: ["gust", "spring", "gust", "shade", "glow"], recMax: 22, dark: true,
  hint: "TWO GUSTS, ONE FACING EACH WAY. THE LAST ROOM NEEDS A SHADE FOR THE DOOR AND A GLOW FOR THE GATE.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(9, 14);
  g.fill(1, 8, 8, 9, "#");
  g.fill(15, 8, 27, 9, "#");
  g.fill(5, 1, 5, 5, "#").fill(5, 6, 5, 7, "A").set(7, 7, "a");
  g.fill(3, 1, 3, 5, "#").fill(3, 6, 3, 7, "G");
  g.fill(1, 6, 1, 7, "X");
  g.set(21, 5, "o");
  g.set(6, 13, "L").set(16, 12, "L").set(24, 12, "L").set(20, 5, "L").set(12, 5, "L").set(29, 10, "L");
});

def(3, "THE BEACON", {
  echoes: ["phase", "phase", "shade", "glow", "glow", "spring", "flip"], recMax: 40, dark: true,
  hint: "THE WHOLE LIGHTHOUSE IN ONE CLIMB. EVERY STEP NEEDS WHAT YOU PLACED BEFORE IT, AND SOME THINGS COME IN PAIRS.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(1, 7, 26, 8, "#").fill(30, 7, 30, 8, "#");
  g.fill(6, 9, 7, 14, "%");
  g.set(10, 14, "a");
  g.fill(14, 9, 14, 14, "A");
  g.fill(20, 9, 20, 14, "G");
  g.fill(15, 6, 18, 6, "t");
  g.fill(10, 1, 11, 6, "%");
  g.fill(1, 3, 3, 6, "#");
  g.fill(2, 1, 2, 2, "X");
  g.set(28, 5, "o");
  g.set(3, 12, "L").set(12, 12, "L").set(26, 12, "L").set(24, 4, "L").set(7, 5, "L");
});

// Par for the two bonus stars: finish under par.t seconds, and use no more than par.r recordings.
// Set from the scripted solutions in tests/ with plenty of slack for a person.
const PAR = {
  "FIRST STEPS": { t: 15, r: 0 },
  "THE PLATE": { t: 20, r: 1 },
  "STEPPING STONE": { t: 20, r: 1 },
  "TWIN PLATES": { t: 25, r: 2 },
  "LAMPLIGHT": { t: 20, r: 1 },
  "SUNKEN GATE": { t: 20, r: 1 },
  "RELAY": { t: 25, r: 2 },
  "SWITCHBOARD": { t: 25, r: 2 },
  "GLASS WALL": { t: 20, r: 1 },
  "UNDER GLASS": { t: 30, r: 2 },
  "UPDRAFT": { t: 20, r: 1 },
  "CEILING PLATE": { t: 25, r: 2 },
  "TWO KEYS": { t: 25, r: 2 },
  "GHOST GLASS": { t: 20, r: 3 },
  "CHANDELIER": { t: 30, r: 3 },
  "HALL OF MIRRORS": { t: 40, r: 4 },
  "FERRY": { t: 25, r: 1 },
  "LIFT": { t: 30, r: 3 },
  "TRAMPOLINE": { t: 20, r: 1 },
  "SKYHOOK": { t: 20, r: 1 },
  "TWO STAGES": { t: 40, r: 3 },
  "FERRY LIGHT": { t: 45, r: 3 },
  "STACKED SPRINGS": { t: 40, r: 3 },
  "PUMP ROOM": { t: 70, r: 6 },
  "BREEZE": { t: 15, r: 1 },
  "LEAPFROG": { t: 25, r: 1 },
  "SECOND WIND": { t: 35, r: 3 },
  "TAXI": { t: 35, r: 3 },
  "CHORUS": { t: 90, r: 5 },
  "THE BEACON": { t: 110, r: 7 },
  "SAIL": { t: 25, r: 2 },
};
for (const l of LEVELS) l.par = PAR[l.name];
