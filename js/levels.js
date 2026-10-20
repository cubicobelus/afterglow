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
    name: "THE MIRROR", line: "STEP THROUGH. SOMETHING TAKES YOUR PLACE.", theme: "mirror", mood: 3,
    pal: { bg1: "#210f1d", bg2: "#5a2a48", wall: "#74506c", wallHi: "#c08fb6", wallLo: "#412639", mortar: "#2a1426", accent: "#ff9fc8" },
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
  g.pit(13, 18);
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
  hint: "FAINT PLANKS ARE SOLID ONLY IN LIGHT. WALK TO THE ISLAND AND RECORD: THE RING SHOWS WHERE YOUR ECHO WILL SHINE.",
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
  hint: "THE PLATE IS UNDER GLASS. WHAT COULD STAND ON IT FOR YOU?",
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
  hint: "THE PLATE IS OUT OF REACH. NOT EVERY ROAD IS ON THE FLOOR.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(8, 1, 23, 10, "#");
  g.set(15, 14, "#");
  g.set(14, 11, "1");
  g.set(15, 13, "a");
  g.fill(23, 11, 23, 14, "A");
  g.fill(28, 13, 28, 14, "X");
  g.set(5, 9, "L").set(26, 9, "L");
});

def(1, "TWO KEYS", {
  echoes: ["phase", "glow"], recMax: 12, dark: true,
  hint: "TWO OBSTACLES, TWO ECHOES. WHICH ONE FIRST?",
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
  hint: "TWO WALLS OF GLASS AND ONE PHASE. AN ECHO IS ONLY A MEMORY.",
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

def(1, "THREE PANES", {
  echoes: ["phase", "phase"], recMax: 16,
  hint: "THREE WALLS AND TWO PHASES. ONE CIRCLE IS WIDE ENOUGH FOR TWO WALLS IF YOU STAND BETWEEN THEM.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(6, 1, 6, 14, "%");
  g.fill(10, 1, 10, 14, "%");
  g.fill(14, 1, 14, 14, "%");
  g.fill(28, 13, 28, 14, "X");
  g.set(4, 9, "L").set(12, 9, "L").set(22, 9, "L");
});

def(1, "CHANDELIER", {
  echoes: ["flip", "flip", "flip"], recMax: 12,
  hint: "THE FLOOR IS DEATH, SO LOOK UP. EACH ZONE ONLY REACHES SO FAR.",
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
  echoes: ["phase", "glow", "shade", "flip"], recMax: 24,
  hint: "NOT EVERY BUTTON IS PRESSED THE SAME WAY. AND NOT EVERY ECHO HAS TO STAY WHERE YOU FIRST PUT IT.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(4, 1, 5, 14, "%");
  g.fill(15, 10, 20, 11, "#");
  g.set(16, 9, "5").set(19, 9, "b");
  g.fill(21, 1, 21, 8, "#").fill(21, 9, 21, 14, "A");
  g.fill(22, 1, 22, 8, "#").fill(22, 9, 22, 14, "B");
  g.fill(28, 9, 30, 14, "#");
  g.fill(29, 7, 29, 8, "X");
  g.set(9, 12, "L").set(24, 5, "L");
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
  hint: "THE STAIRS ARE LIT ONLY WHILE A PLATE IS HELD. A TIDE IS A MOVING FLOOR.",
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
  g.set(3, 5, "o");
  g.set(6, 9, "L").set(14, 6, "L");
});

def(2, "SKYHOOK", {
  echoes: ["spring"], recMax: 8,
  hint: "A SPRING CAN HANG IN THE AIR TOO.",
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
  hint: "THE SPRING IS NO USE DOWN HERE. SOMETHING ELSE HAS TO GET UP THERE FIRST.",
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
  hint: "THE LIGHT CANNOT BE IN TWO PLACES. THE TIDE STILL REMEMBERS THE WAY.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(8, 21);
  g.fill(8, 14, 13, 14, "~");
  g.fill(14, 14, 17, 17, "#");
  g.fill(18, 14, 21, 14, "~");
  g.fill(18, 1, 21, 11, "#");
  g.set(10, 12, "L");
  g.fill(26, 1, 26, 12, "#");
  g.fill(26, 13, 26, 14, "G");
  g.fill(29, 13, 29, 14, "X");
  g.set(30, 8, "L");
});

def(2, "SLUICE", {
  echoes: ["shade", "tide"], recMax: 14,
  hint: "THREE DOORS AND ONE SHADE. A TIDE NEVER RESTS, BUT IT KEEPS VISITING.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.set(6, 14, "a").fill(9, 1, 9, 8, "#").fill(9, 9, 9, 14, "A");
  g.set(12, 14, "b").fill(15, 1, 15, 8, "#").fill(15, 9, 15, 14, "B");
  g.set(18, 14, "c").fill(22, 1, 22, 8, "#").fill(22, 9, 22, 14, "C");
  g.fill(27, 13, 27, 14, "X");
  g.set(4, 9, "L").set(13, 6, "L").set(25, 9, "L");
});

def(2, "STACKED SPRINGS", {
  echoes: ["spring", "spring", "glow"], recMax: 14, dark: true,
  hint: "HOLD JUMP AS YOU LAND FOR A BIGGER BOUNCE. WHAT CAN A SPRING DO FROM UP THERE?",
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

def(2, "SLINGSHOT", {
  echoes: ["glow", "spring"], recMax: 24, dark: true,
  hint: "ONE ECHO CAN BE THE FERRY AND THE LAUNCHER. THE LIGHT HAS TO BE IN TWO PLACES, SO IT CANNOT STAY IN THE FIRST.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(5, 12).fill(5, 14, 12, 14, "~");
  g.fill(24, 7, 30, 14, "#");
  g.fill(27, 1, 27, 6, "G");
  g.fill(29, 5, 29, 6, "X");
  g.set(14, 5, "o");
  g.set(2, 7, "L").set(13, 5, "L").set(20, 9, "L");
});

def(2, "PUMP ROOM", {
  echoes: ["shade", "shade", "tide", "glow"], recMax: 24, dark: true,
  hint: "ONCE AN ECHO HAS DONE ITS JOB, DOES IT HAVE TO STAY? A STEP DOES NOT HAVE TO TOUCH THE FLOOR.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.set(8, 8, "=");
  g.fill(9, 8, 30, 14, "#");
  g.set(16, 7, "a").set(19, 7, "a");
  g.fill(23, 1, 23, 4, "#").fill(23, 5, 23, 7, "A");
  g.fill(26, 1, 26, 4, "#").fill(26, 5, 26, 7, "G");
  g.fill(28, 6, 28, 7, "X");
  g.set(4, 11, "L").set(11, 5, "L").set(17, 4, "L");
});

// ================================================================ tier 4: the mirror
// Swap (Q) is on in every level of this tier and nowhere else.
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

def(3, "STAY BEHIND", {
  echoes: ["spring"], recMax: 14, swap: true,
  hint: "THE PLATE IS UP ON THE BLOCK AND THE DOOR IS DOWN HERE. WHAT YOU SWAP WITH TAKES YOUR PLACE, AND STAYS THERE.",
}, (g) => {
  g.base();
  g.set(5, 14, "@");
  g.fill(3, 1, 3, 8, "#").fill(3, 9, 3, 14, "A");
  g.fill(1, 13, 1, 14, "X");
  g.fill(17, 8, 25, 14, "#");
  g.set(21, 7, "a");
  g.set(8, 9, "L").set(28, 9, "L");
});

def(3, "APEX", {
  echoes: ["spring"], recMax: 12, swap: true,
  hint: "THE DOOR ANSWERS TO A PLATE THAT HANGS WHERE ONLY A BOUNCE REACHES, AND NOTHING CAN STAND THERE. SWAP DOES NOT NEED SOLID GROUND.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.set(11, 5, "1");
  g.fill(16, 1, 16, 8, "#").fill(16, 9, 16, 14, "A");
  g.fill(28, 13, 28, 14, "X");
  g.set(6, 9, "L").set(20, 9, "L").set(25, 9, "L");
});

def(3, "WAYPOINT", {
  echoes: ["phase", "shade"], recMax: 24, swap: true,
  hint: "A SWAP DOES NOT CARE ABOUT WALLS. AND A WALL IS ONLY IN THE WAY WHILE IT IS THERE.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(11, 8, 27, 8, "#");
  g.fill(11, 9, 12, 14, "%");
  g.fill(27, 9, 27, 14, "#");
  g.fill(22, 9, 23, 14, "%");
  g.fill(25, 13, 25, 14, "X");
  g.set(5, 9, "L").set(16, 12, "L");
});

def(3, "UPSIDE DOWN", {
  echoes: ["flip"], recMax: 10, swap: true,
  hint: "THE FLOOR IS DEATH ALL THE WAY ACROSS AND ONE ZONE ONLY REACHES SO FAR. WHEREVER YOU SWAP FROM, THE ZONE GOES THERE, AND THE DOOR WANTS SOMETHING LEFT ON ITS PLATE.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(1, 1, 30, 11, "#");
  g.fill(5, 14, 24, 14, "^");
  g.set(22, 12, "1");
  g.fill(26, 12, 26, 14, "A");
  g.fill(29, 13, 29, 14, "X");
  g.set(4, 12, "L").set(14, 12, "L").set(28, 12, "L");
});

def(3, "TWO BANKS", {
  echoes: ["spring", "shade"], recMax: 20, swap: true,
  hint: "THE DOOR WANTS BOTH PLATES: ONE ON THE BLOCK, ONE IN THE AIR. THE SPRING THAT THROWS YOU UP CAN BE THE ONE YOU LEAVE UP THERE.",
}, (g) => {
  g.base();
  g.set(26, 14, "@");
  g.fill(28, 1, 28, 8, "#").fill(28, 9, 28, 14, "A");
  g.fill(30, 13, 30, 14, "X");
  g.fill(6, 8, 14, 14, "#");
  g.set(10, 7, "a");
  g.set(18, 5, "1");
  g.set(3, 9, "L").set(22, 9, "L");
});

def(3, "NIGHT TRAIN", {
  echoes: ["glow", "spring"], recMax: 40, dark: true, swap: true,
  hint: "A RECORDING KEEPS EVERYTHING YOU DID, SWAPS TOO. SOMETHING HAS TO BE WAITING ON THE FAR BANK BEFORE YOU GET THERE FOR REAL.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(6, 21);
  g.fill(6, 14, 21, 14, "~");
  g.fill(22, 1, 22, 8, "#").fill(22, 9, 22, 14, "G");
  g.fill(27, 8, 30, 14, "#");
  g.fill(29, 6, 29, 7, "X");
  g.set(28, 5, "L");
});

// ================================================================ tier 5: the beacon
def(4, "BREEZE", {
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

def(4, "SAIL", {
  echoes: ["gust", "tide"], recMax: 14,
  hint: "A TIDE REMEMBERS A JUMP. WHAT IF THE JUMP HAD HELP?",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(9, 18);
  g.fill(28, 13, 28, 14, "X");
  g.set(5, 8, "L").set(14, 5, "L").set(25, 8, "L");
});

def(4, "GALLOP", {
  echoes: ["shade", "gust"], recMax: 24,
  hint: "A GUST THAT CARRIES YOU CAN STILL BLOW WHEN IT STOPS. THE SHADE ONLY HAS TO BE A STEP WHILE YOU RECORD.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(5, 11).pit(17, 22);
  g.set(25, 14, "a").fill(27, 1, 27, 8, "#").fill(27, 9, 27, 14, "A");
  g.fill(29, 13, 29, 14, "X");
  g.set(3, 9, "L").set(14, 9, "L").set(24, 9, "L");
});

def(4, "AFTERIMAGE", {
  echoes: ["glow", "phase", "shade"], recMax: 28, dark: true,
  hint: "THE THORNS ARE ONLY SAFE WHILE LIT. WHAT YOU RECORDED CROSSING THEM STILL WALKS THERE. NOTHING SAYS WHICH ECHO HAS TO CARRY YOU.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(6, 14, 11, 14, "t");
  g.fill(14, 14, 19, 14, "t");
  g.fill(22, 1, 23, 14, "%");
  g.set(24, 14, "a").fill(26, 1, 26, 8, "#").fill(26, 9, 26, 14, "A");
  g.fill(28, 1, 28, 8, "#").fill(28, 9, 28, 14, "G");
  g.fill(30, 13, 30, 14, "X");
  g.set(8, 11, "L").set(17, 6, "L").set(5, 12, "L");
});

def(4, "CHORUS", {
  echoes: ["gust", "gust", "spring", "shade"], recMax: 30,
  hint: "THE DOOR UP HERE ANSWERS TO A PLATE DOWN BELOW. WIND ONLY HAS TO BE THERE WHEN YOU RECORD, IF SOMETHING ELSE CAN CARRY YOU.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(6, 11).pit(15, 20);
  // The slab is one piece, so the two floors are shut off from each other. The upper gaps are shallow spike beds.
  g.fill(1, 8, 26, 9, "#").fill(30, 8, 30, 9, "#");
  g.fill(6, 8, 11, 8, "^").fill(15, 8, 20, 8, "^");
  g.set(28, 14, "a");
  g.fill(23, 1, 23, 3, "#").fill(23, 4, 23, 7, "A");
  g.fill(2, 6, 2, 7, "X");
  g.set(13, 5, "o");
  g.set(4, 12, "L").set(24, 12, "L").set(9, 4, "L").set(17, 4, "L");
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
  "HALL OF MIRRORS": { t: 60, r: 5 },
  "FERRY": { t: 25, r: 1 },
  "LIFT": { t: 30, r: 3 },
  "TRAMPOLINE": { t: 20, r: 1 },
  "SKYHOOK": { t: 20, r: 1 },
  "TWO STAGES": { t: 40, r: 3 },
  "FERRY LIGHT": { t: 45, r: 3 },
  "SLUICE": { t: 30, r: 3 },
  "STACKED SPRINGS": { t: 40, r: 3 },
  "SLINGSHOT": { t: 55, r: 4 },
  "PUMP ROOM": { t: 75, r: 6 },
  "BREEZE": { t: 15, r: 1 },
  "GALLOP": { t: 35, r: 3 },
  "LEAPFROG": { t: 25, r: 1 },
  "SECOND WIND": { t: 35, r: 3 },
  "WAYPOINT": { t: 35, r: 3 },
  "AFTERIMAGE": { t: 55, r: 4 },
  "CHORUS": { t: 100, r: 6 },
  "SAIL": { t: 25, r: 2 },
  "STAY BEHIND": { t: 20, r: 1 },
  "APEX": { t: 20, r: 1 },
  "TWO BANKS": { t: 28, r: 2 },
  "UPSIDE DOWN": { t: 22, r: 1 },
  "NIGHT TRAIN": { t: 50, r: 2 },
  "THREE PANES": { t: 32, r: 3 },
};
for (const l of LEVELS) l.par = PAR[l.name];
