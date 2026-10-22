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
  {
    name: "THE MIRROR", line: "STEP THROUGH. SOMETHING TAKES YOUR PLACE.", theme: "mirror", mood: 3,
    pal: { bg1: "#210f1d", bg2: "#5a2a48", wall: "#74506c", wallHi: "#c08fb6", wallLo: "#412639", mortar: "#2a1426", accent: "#ff9fc8" },
  },
  // Page two, the drowned half of the tower: planned, no levels yet (the level select shows them as empty rows).
  // Each tier is meant to introduce one new echo. The theme names are placeholders until there is scenery for them.
  {
    name: "THE SHALLOWS", line: "THE SURFACE IS A CEILING NOW.", theme: "shallows", mood: 5, planned: true,
    pal: { bg1: "#06222c", bg2: "#14707a", wall: "#3d7480", wallHi: "#8fd0d4", wallLo: "#264b54", mortar: "#0d2f38", accent: "#7ff0e0" },
  },
  {
    name: "THE WRECK", line: "SOMETHING BIGGER WENT DOWN HERE.", theme: "wreck", mood: 6, planned: true,
    pal: { bg1: "#1c120c", bg2: "#4a3320", wall: "#6b5440", wallHi: "#a8896a", wallLo: "#3d2e22", mortar: "#241810", accent: "#ffb067" },
  },
  {
    name: "THE GARDEN", line: "NOTHING HERE STAYS WHERE YOU LEFT IT.", theme: "garden", mood: 7, planned: true,
    pal: { bg1: "#06200f", bg2: "#1d5a2c", wall: "#3f6b48", wallHi: "#86c58f", wallLo: "#264a2e", mortar: "#0c2a14", accent: "#a6ff9a" },
  },
  {
    name: "THE TRENCH", line: "THE LIGHT STOPS HERE.", theme: "trench", mood: 8, planned: true,
    pal: { bg1: "#02070a", bg2: "#06222a", wall: "#2b4650", wallHi: "#5f9aa8", wallLo: "#16282f", mortar: "#08161c", accent: "#4dffd8" },
  },
  {
    name: "THE FOUNDATION", line: "WHERE THE FIRST LIGHT WAS LIT.", theme: "foundation", mood: 9, planned: true,
    pal: { bg1: "#1a1204", bg2: "#5c4310", wall: "#7a6a40", wallHi: "#d8c27a", wallLo: "#463a1c", mortar: "#2a1f08", accent: "#ffe27a" },
  },
  // Not part of the game: a room per new echo, to try each one. Shows up on the last page of the level select when the dev
  // switch (backslash) has unlocked everything.
  {
    name: "THE LAB", line: "TRY THE NEW ECHOES.", theme: "lab", mood: 0, lab: true,
    pal: { bg1: "#10131f", bg2: "#1d2640", wall: "#445070", wallHi: "#7f8fb8", wallLo: "#262d45", mortar: "#161b2c", accent: "#9fe3ff" },
  },
];

// The level select shows five tiers per page.
const PAGES = [{ name: "THE TOWER" }, { name: "THE REFLECTION" }, { name: "THE LAB", dev: true }];
const TIERS_PER_PAGE = 5;

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
  g.set(7, 8, "o");
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

def(0, "STAIRCASE", {
  echoes: ["shade", "shade", "shade"], recMax: 12,
  hint: "ONE STEP IN THE AIR IS NOT ENOUGH FOR THIS LEDGE. BUILD THE STAIRS FROM YOUR OWN JUMPS, THEN LEAVE SOMEONE ON THE PLATE.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(10, 7, 14, 14, "#");
  g.set(12, 6, "a");
  g.fill(18, 1, 18, 8, "#").fill(18, 9, 18, 14, "A");
  g.fill(28, 13, 28, 14, "X");
  g.set(5, 9, "L").set(16, 7, "L").set(24, 9, "L");
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
  g.set(19, 14, "o");
  g.set(1, 10, "L").set(27, 3, "L");
});

def(0, "GATEHOUSE", {
  echoes: ["shade", "glow"], recMax: 14, dark: true,
  hint: "THE LEDGE IS TOO HIGH, AND THE GATE OPENS ONLY WHILE LIGHT FALLS ON IT. A STEP FIRST, THEN THE LIGHT.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(14, 10, 30, 14, "#");
  g.fill(21, 1, 21, 6, "#").fill(21, 7, 21, 9, "G");
  g.fill(28, 8, 28, 9, "X");
  g.set(2, 8, "L").set(29, 5, "L");
});

def(0, "RELAY", {
  echoes: ["shade", "glow"], recMax: 12, dark: true,
  hint: "THE PLATE IS UP ON THE SLAB AND THE THORNS ARE UNDER IT. ALL YOUR ECHOES REPLAY TOGETHER, SO WHAT YOU RECORD FIRST CAN HELP THE NEXT.",
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
  bonus: 20, echoes: ["shade", "glow"], recMax: 14, dark: true,
  hint: "THE LAMP OVER THE BRIDGE BURNS ONLY WHILE ITS PLATE IS HELD, AND THE PLATE IS UP ON THE LEDGE. THE ISLAND NEEDS A GLOW. AN ECHO THAT IS STILL MOVING CAN CARRY YOU WHILE YOU RECORD ANOTHER.",
}, (g) => {
  g.base();
  g.set(1, 14, "@");
  g.fill(5, 11, 7, 14, "#");
  g.set(6, 10, "a");
  g.pit(10, 25);
  g.fill(10, 14, 15, 14, "~");
  g.fill(16, 14, 19, 17, "#");
  g.fill(20, 14, 25, 14, "~");
  g.set(12, 10, "P");
  g.fill(28, 13, 28, 14, "X");
  g.set(2, 8, "L").set(29, 8, "L");
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
  hint: "THE PLATE IS SEALED UNDER GLASS. ONE ECHO OPENS THE WAY AND ANOTHER HOLDS THE PLATE.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(5, 16, 9, 16, ".");
  g.fill(6, 15, 8, 15, "%");
  g.set(7, 16, "a");
  g.set(5, 16, "o");
  g.fill(23, 1, 23, 8, "#");
  g.fill(23, 9, 23, 14, "A");
  g.fill(28, 13, 28, 14, "X");
  g.set(6, 8, "L").set(26, 8, "L");
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

def(1, "OVERHEAD", {
  unlock: "flip", echoes: ["flip"], recMax: 8,
  hint: "RECORD AT THE EDGE OF THE PIT. THEN STEP INTO THE FLIP ZONE, FALL UPWARD AND WALK THE CEILING ACROSS.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(12, 15);
  g.fill(8, 1, 20, 12, "#");
  g.set(2, 8, "o");
  g.fill(28, 13, 28, 14, "X");
  g.set(5, 8, "L").set(26, 8, "L");
});

def(1, "CEILING PLATE", {
  echoes: ["flip", "shade"], recMax: 10,
  hint: "THE FLIP ZONE LETS YOU WALK THE CEILING. THE ECHO THAT MAKES THE ZONE CAN STAND ON A PLATE TOO.",
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

def(1, "LOOKING GLASS", {
  echoes: ["shade", "phase", "flip"], recMax: 16,
  hint: "THE BUTTON IS ON THE CEILING, HIGHER THAN YOU CAN JUMP. A FLIP HUNG HIGH IN THE AIR LIFTS YOU TO IT. ECHOES CAN BE RECORDED AGAIN WHEN THEIR JOB IS DONE.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(1, 1, 30, 9, "#");
  g.fill(8, 10, 30, 12, "#");
  g.set(5, 10, "1");
  g.fill(8, 13, 8, 14, "A");
  g.pit(12, 15);
  g.fill(16, 13, 16, 14, "%");
  g.fill(28, 13, 28, 14, "X");
  g.set(4, 12, "L");
});

def(1, "HALF OPEN", {
  echoes: ["phase"], recMax: 10,
  hint: "THE ROOM ABOVE IS TOO HIGH TO JUMP INTO. OPEN ONLY PART OF THE GLASS. WHAT IS LEFT IS A STEP.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(8, 1, 30, 12, "#");
  g.fill(10, 5, 29, 8, ".");
  g.fill(14, 9, 16, 11, ".");
  g.fill(14, 12, 16, 12, "%");
  g.set(29, 14, "o");
  g.fill(27, 7, 27, 8, "X");
  g.set(5, 8, "L").set(12, 6, "L");
});

def(1, "HALL OF MIRRORS", {
  echoes: ["phase", "shade", "flip"], recMax: 24,
  hint: "ONE ECHO CAN HOLD A PLATE AND DO ITS OWN JOB. AND NOT EVERY ECHO HAS TO STAY WHERE YOU FIRST PUT IT.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(7, 1, 7, 14, "%");
  g.set(5, 14, "a");
  g.fill(15, 10, 20, 11, "#");
  g.set(18, 9, "b");
  g.fill(21, 1, 21, 8, "#").fill(21, 9, 21, 14, "B");
  g.fill(22, 1, 22, 8, "#").fill(22, 9, 22, 14, "A");
  g.fill(28, 9, 30, 14, "#");
  g.fill(29, 7, 29, 8, "X");
  g.set(10, 12, "L").set(24, 5, "L");
});

def(1, "SKYLIGHT", {
  bonus: 20, echoes: ["phase", "flip", "flip"], recMax: 20,
  hint: "A FLIP ON THE FLOOR CANNOT LIFT YOU HIGH ENOUGH. RECORD THE PHASE AT THE TOP OF A JUMP UNDER THE GLASS, THEN A FLIP PART WAY UP A JUMP. A SECOND FLIP FOR THE ROAD ABOVE.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(8, 1, 30, 9, "#");
  g.fill(10, 2, 16, 8, ".");
  g.fill(17, 7, 29, 8, ".");
  g.fill(14, 9, 16, 9, "%");
  g.fill(20, 9, 23, 9, "^");
  g.fill(20, 10, 23, 10, "#");
  g.fill(28, 7, 28, 8, "X");
  g.set(5, 8, "L").set(12, 4, "L");
});


// ================================================================ tier 3: the tideworks
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
  hint: "A SPRING CAN HANG IN THE AIR TOO. RECORD ONE IN MID JUMP AND LAND ON IT.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(9, 15);
  g.fill(16, 5, 30, 14, "#");
  g.fill(28, 3, 28, 4, "X");
  g.set(5, 8, "L").set(12, 4, "L");
});

def(2, "STAGECOACH", {
  echoes: ["shade", "spring"], recMax: 24,
  hint: "A SPRING THAT CARRIES YOU CAN STILL THROW YOU WHEN IT STOPS. WHAT YOU NEEDED TO MAKE IT IS NOT NEEDED AFTER.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(6, 14, 12, 14, "^");
  g.fill(20, 8, 30, 14, "#");
  g.set(22, 7, "a");
  g.fill(26, 1, 26, 3, "#").fill(26, 4, 26, 7, "A");
  g.fill(29, 6, 29, 7, "X");
  g.set(4, 9, "L").set(16, 9, "L").set(23, 4, "L");
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

def(2, "TWO STAGES", {
  echoes: ["spring", "tide"], recMax: 14,
  hint: "THE SPRING IS NO USE DOWN HERE, IT HAS TO BE UP ON THE LEDGE. A TIDE REMEMBERS A CLIMB.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(10, 9, 14, 14, "#");
  g.fill(18, 5, 30, 14, "#");
  g.fill(28, 3, 28, 4, "X");
  g.set(5, 9, "L").set(16, 3, "L");
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

def(2, "FERRY LIGHT", {
  echoes: ["glow", "tide"], recMax: 14, dark: true,
  hint: "THE LIGHT CANNOT BE IN TWO PLACES. THE TIDE STILL REMEMBERS THE WAY ACROSS.",
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

def(2, "PUMP ROOM", {
  echoes: ["shade", "tide", "glow"], recMax: 28, dark: true,
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

def(2, "LONG CROSSING", {
  bonus: 20, echoes: ["tide", "tide", "spring"], recMax: 28,
  hint: "THE GAP IS TOO WIDE FOR ONE FERRY. YOU CAN RECORD WHILE RIDING A FERRY.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(6, 16);
  g.set(6, 16, "o");
  g.fill(22, 7, 30, 14, "#");
  g.fill(28, 5, 28, 6, "X");
  g.set(4, 9, "L").set(12, 5, "L").set(18, 8, "L");
});

// ================================================================ tier 4: the beacon
def(3, "BREEZE", {
  unlock: "gust", echoes: ["gust"], recMax: 8,
  hint: "A GUST BLOWS THE WAY YOU FACED WHEN YOU STOPPED. STAND AT THE EDGE FACING THE GAP, THEN JUMP INTO THE WIND.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(9, 14);
  g.fill(28, 13, 28, 14, "X");
  g.set(5, 8, "L").set(13, 5, "L").set(24, 8, "L");
});

def(3, "SAIL", {
  echoes: ["gust", "gust"], recMax: 14,
  hint: "A GUST FROZEN IN MID-AIR IS A STEP WITH A WIND OF ITS OWN. ONE IS NOT ENOUGH FOR THIS PIT.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(9, 22);
  g.fill(28, 13, 28, 14, "X");
  g.set(5, 8, "L").set(15, 5, "L").set(26, 8, "L");
});

def(3, "STILL AIR", {
  unlock: "calm", echoes: ["calm"], recMax: 8,
  hint: "THE VENT BLOWS ALL THE TIME AND PUSHES ANYONE IN THE AIR BACK. A CALM SILENCES EVERY POWER INSIDE ITS RING. RECORD ONE BY THE GAP.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(10, 11);
  g.set(13, 14, "<");
  g.fill(28, 13, 28, 14, "X");
  g.set(5, 8, "L").set(17, 7, "L").set(25, 8, "L");
});

def(3, "SLACK WATER", {
  echoes: ["shade", "calm"], recMax: 16,
  hint: "A VENT GUARDS EACH GAP AND THERE IS ONE CALM. AN ECHO THAT WALKS ACROSS CAN CARRY YOU WITH IT, IF YOU CATCH IT AT THE START.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(6, 7);
  g.set(9, 14, "<");
  g.set(11, 14, "a");
  g.pit(15, 16);
  g.set(18, 14, "<");
  g.fill(23, 1, 23, 8, "#").fill(23, 9, 23, 14, "A");
  g.fill(28, 13, 28, 14, "X");
  g.set(4, 8, "L").set(12, 7, "L").set(20, 8, "L").set(26, 8, "L");
});

def(3, "GALLOP", {
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

def(3, "WEATHERVANE", {
  echoes: ["gust", "shade"], recMax: 20,
  hint: "A GUST BLOWS THE WAY IT FACED WHEN YOU STOPPED. THE DOOR IS ON ONE SIDE AND ITS PLATE IS ON THE OTHER, AND ONE GUST CANNOT FACE BOTH WAYS.",
}, (g) => {
  g.base();
  g.set(16, 14, "@");
  g.pit(7, 13);
  g.pit(20, 26);
  g.set(28, 14, "a");
  g.fill(3, 1, 3, 8, "#").fill(3, 9, 3, 14, "A");
  g.fill(1, 13, 1, 14, "X");
  g.set(5, 9, "L").set(16, 8, "L").set(26, 9, "L");
});

def(3, "UP AND OVER", {
  echoes: ["spring", "shade"], recMax: 20,
  hint: "ONE SPRING, TWO CLIMBS, AND THEY ARE NOT IN THE SAME PLACE. WHAT YOU SEND UP THE FIRST CLIMB CAN STAY THERE.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(1, 7, 5, 7, "#");
  g.set(3, 6, "a");
  g.fill(12, 1, 12, 8, "#").fill(12, 9, 12, 14, "A");
  g.fill(17, 8, 30, 14, "#");
  g.fill(28, 6, 28, 7, "X");
  g.set(8, 9, "L").set(15, 5, "L").set(24, 5, "L");
});

def(3, "AFTERIMAGE", {
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

def(3, "CHORUS", {
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
  g.set(4, 12, "L").set(24, 12, "L").set(9, 4, "L").set(17, 4, "L");
});

// ================================================================ tier 5: the mirror
// The puppet comes first (it needs no swap). Swap (Q) is on in the levels that show the swap sign, which are the ones after Other Side.
def(4, "REFLECTION", {
  unlock: "mirror", echoes: ["mirror"], recMax: 8,
  hint: "THE PLATE IS IN A ROOM YOU CANNOT ENTER. YOUR PUPPET STARTS ON THE OTHER SIDE OF THE ROOM AND WALKS THE OPPOSITE WAY.",
}, (g) => {
  g.base();
  g.set(3, 14, "@");
  g.fill(24, 1, 24, 14, "#");
  g.set(26, 14, "a");
  g.fill(13, 1, 13, 8, "#").fill(13, 9, 13, 14, "A");
  g.fill(19, 13, 19, 14, "X");
  g.set(6, 8, "L").set(17, 7, "L").set(27, 8, "L");
});

def(4, "OTHER SIDE", {
  echoes: ["shade", "mirror"], recMax: 24,
  hint: "THE PLATE IS ON TOP OF THE FAR BLOCK, WHICH YOU CANNOT REACH. WHEREVER YOU STAND, YOUR PUPPET STANDS ON THE OTHER SIDE OF THE ROOM AT THE SAME HEIGHT.",
}, (g) => {
  g.base();
  g.set(3, 14, "@");
  g.fill(6, 10, 9, 14, "#");
  g.fill(22, 10, 25, 14, "#");
  g.set(24, 9, "a");
  g.fill(12, 1, 12, 8, "#").fill(12, 9, 12, 14, "A");
  g.fill(18, 13, 18, 14, "X");
  g.set(4, 7, "L").set(15, 6, "L").set(28, 8, "L");
});

def(4, "LEAPFROG", {
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

def(4, "STAY BEHIND", {
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

def(4, "APEX", {
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

def(4, "UPSIDE DOWN", {
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

def(4, "GLASS CEILING", {
  echoes: ["flip", "phase"], recMax: 30, swap: true,
  hint: "A WALL OF GLASS STANDS ACROSS THE CEILING ROAD. YOUR SWAPS ARE KEPT IN WHAT YOU RECORD, SO AN ECHO CAN BE LEFT WHERE YOU WILL NEED IT.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(1, 1, 30, 11, "#");
  g.fill(5, 14, 24, 14, "^");
  g.fill(14, 12, 14, 14, "%");
  g.fill(29, 13, 29, 14, "X");
  g.set(4, 12, "L").set(26, 12, "L");
});

def(4, "STEP THROUGH", {
  echoes: ["mirror"], recMax: 12, swap: true,
  hint: "THE WALL GOES ALL THE WAY UP, AND YOUR PUPPET IS ON THE OTHER SIDE OF IT. WHAT YOU SWAP WITH TAKES YOUR PLACE, AND STAYS THERE.",
}, (g) => {
  g.base();
  g.set(3, 14, "@");
  g.fill(15, 1, 16, 14, "#");
  g.set(8, 14, "a");
  g.fill(24, 1, 24, 8, "#").fill(24, 9, 24, 14, "A");
  g.fill(28, 13, 28, 14, "X");
  g.set(5, 8, "L").set(11, 8, "L").set(20, 8, "L").set(27, 8, "L");
});

def(4, "NIGHT TRAIN", {
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

// ================================================================ tier 6 to 10: temporary levels, one per tier, to see the scenery
// Each is a blank room: a floor, a few blocks, some lamps, a door of light. They are placeholders for the real levels.
// ================================================================ tier 6: the shallows (beam, reflector)
def(5, "SHAFT", {
  unlock: "beam", echoes: ["beam"], recMax: 8,
  hint: "THE THORNS WITHER IN LIGHT. A BEAM LIGHTS EVERYTHING ALONG ITS LENGTH. STAND FACING THE THORNS AND RECORD.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(8, 14, 20, 14, "t");
  g.fill(28, 13, 28, 14, "X");
  g.set(5, 8, "L").set(24, 8, "L");
});

def(5, "TURRET", {
  unlock: "reflector", echoes: ["reflector"], recMax: 8,
  hint: "A BEAM FALLS FROM THE CEILING AND THE GATE WANTS LIGHT. STAND IN THE BEAM AND RECORD A REFLECTOR: FACING LEFT IT TURNS THE BEAM TO THE RIGHT.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.set(20, 1, "s");
  g.fill(24, 1, 24, 12, "#").fill(24, 13, 24, 14, "G");
  g.fill(28, 13, 28, 14, "X");
  g.set(5, 8, "L").set(14, 6, "L");
});

def(5, "WELLSPRING", {
  autoHint: true, echoes: ["beam"], recMax: 14,
  hint: "BUBBLES LIFT WHOEVER STANDS IN THEM, UP TO THE TOP OF THE COLUMN. THE GATE UP THERE WANTS LIGHT.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.set(8, 14, "u");
  g.fill(10, 9, 30, 14, "#");
  g.fill(20, 1, 20, 6, "#").fill(20, 7, 20, 8, "G");
  g.fill(28, 7, 28, 8, "X");
  g.set(5, 7, "L");
});

def(5, "HATCH", {
  echoes: ["beam", "reflector"], recMax: 14,
  hint: "THE HATCH IN THE CEILING WANTS LIGHT, AND LIGHT TRAVELS IN STRAIGHT LINES. A MIRROR CAN TURN IT TO FACE UP.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(1, 12, 13, 12, "#").set(14, 12, "G").fill(15, 12, 30, 12, "#");
  g.fill(28, 10, 28, 11, "X");
  g.set(5, 8, "L");
});

def(5, "OPEN DOOR", {
  echoes: ["beam"], recMax: 12,
  hint: "THE THORNS NEED LIGHT, BUT THE DOOR IN THE WAY STOPS IT. AN ECHO HOLDS A PLATE AS WELL AS A LIGHT.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.set(7, 14, "a");
  g.fill(12, 1, 12, 8, "#").fill(12, 9, 12, 14, "A");
  g.fill(14, 14, 22, 14, "t");
  g.fill(28, 13, 28, 14, "X");
  g.set(4, 8, "L").set(17, 7, "L").set(26, 8, "L");
});

def(5, "GRAZE", {
  echoes: ["beam"], recMax: 14,
  hint: "THE PLANKS ARE SOLID ONLY IN LIGHT, AND A BEAM LIGHTS ONLY WHAT IT TRAVELS THROUGH. HANG IT IN THE AIR AT THE HEIGHT OF THE BRIDGE.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(8, 21);
  g.fill(5, 13, 7, 14, "#");
  g.fill(8, 12, 21, 12, "~");
  g.fill(22, 12, 30, 14, "#");
  g.fill(28, 10, 28, 11, "X");
  g.set(5, 4, "L").set(16, 3, "L").set(26, 4, "L");
});

def(5, "STAIRWELL", {
  echoes: ["reflector"], recMax: 16,
  hint: "A BEAM CROSSES THE ROOM HIGH UP FROM THE WALL. THE BUBBLES CARRY YOU UP TO IT. THE HATCH ABOVE THE LEDGE WANTS LIGHT.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.set(1, 8, "e");
  g.set(8, 14, "u");
  g.fill(10, 9, 30, 14, "#");
  g.fill(1, 6, 21, 6, "#").set(22, 6, "G").fill(23, 6, 30, 6, "#");
  g.fill(28, 4, 28, 5, "X");
  g.set(5, 3, "L");
});

def(5, "SURFACE LIGHT", {
  echoes: ["reflector"], recMax: 16,
  hint: "A SHAFT OF LIGHT FALLS FROM THE SURFACE, RIGHT DOWN THE BUBBLES. THE GATE IS AT THE TOP OF THE COLUMN. A MIRROR HUNG THERE CAN TURN THE LIGHT INTO IT.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.set(8, 1, "s");
  g.set(8, 14, "u");
  g.fill(9, 9, 9, 14, "#");
  g.fill(10, 1, 10, 7, "#").set(10, 8, "G").fill(10, 9, 10, 14, "#");
  g.fill(28, 13, 28, 14, "X");
  g.set(4, 4, "L");
});

def(5, "TWO TIERS", {
  echoes: ["beam", "beam"], recMax: 24,
  hint: "TWO BRIDGES AT TWO HEIGHTS, AND A BEAM LIGHTS ONLY ONE OF THEM. THE SECOND ONE HAS TO BE HUNG FROM WHERE THE FIRST ONE ENDS.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(8, 24);
  g.fill(5, 13, 7, 14, "#");
  g.fill(8, 12, 14, 12, "~");
  g.fill(15, 12, 16, 14, "#");
  g.fill(17, 10, 24, 10, "~");
  g.fill(25, 10, 30, 14, "#");
  g.fill(28, 8, 28, 9, "X");
  g.set(5, 4, "L").set(16, 3, "L").set(27, 4, "L");
});

def(6, "WRECK TEMP", {
  temp: true, echoes: [], hint: "A BLANK ROOM TO SEE THE SCENERY OF THE WRECK.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(8, 12, 10, 14, "#");
  g.fill(13, 9, 17, 9, "=");
  g.set(14, 14, "^");
  g.fill(21, 12, 24, 14, "#");
  g.fill(28, 13, 28, 14, "X");
  g.set(4, 9, "L").set(15, 5, "L").set(26, 8, "L");
});

def(7, "GARDEN TEMP", {
  temp: true, echoes: [], hint: "A BLANK ROOM TO SEE THE SCENERY OF THE GARDEN.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(7, 12, 9, 14, "#");
  g.fill(12, 9, 14, 9, "=");
  g.fill(17, 12, 19, 14, "#");
  g.fill(23, 10, 25, 10, "=");
  g.fill(28, 13, 28, 14, "X");
  g.set(5, 8, "L").set(13, 5, "L").set(22, 7, "L");
});

def(8, "TRENCH TEMP", {
  temp: true, echoes: [], dark: true, hint: "A BLANK ROOM TO SEE THE SCENERY OF THE TRENCH. IT IS DARK.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(9, 12);
  g.fill(9, 14, 12, 14, "~");
  g.fill(16, 12, 18, 14, "#");
  g.fill(22, 9, 24, 9, "=");
  g.fill(28, 13, 28, 14, "X");
  g.set(4, 10, "L").set(10, 12, "L").set(17, 8, "L").set(27, 11, "L");
});

def(9, "FOUNDATION TEMP", {
  temp: true, echoes: [], hint: "A BLANK ROOM TO SEE THE SCENERY OF THE FOUNDATION.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(7, 12, 9, 14, "#");
  g.fill(10, 10, 12, 14, "#");
  g.fill(16, 12, 18, 14, "#");
  g.fill(28, 13, 28, 14, "X");
  g.set(4, 9, "L").set(12, 5, "L").set(19, 7, "L").set(26, 8, "L");
});

// ================================================================ the lab: one room per new echo (the benched ones last)
def(10, "CALM", {
  lab: true, unlock: "calm", echoes: ["calm"], recMax: 8,
  hint: "A VENT BLOWS ACROSS THE GAP. RECORD A CALM BY THE EDGE: IT SILENCES THE WIND AROUND IT.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(10, 11);
  g.set(13, 14, "<");
  g.fill(28, 13, 28, 14, "X");
  g.set(5, 8, "L").set(24, 8, "L");
});

def(10, "MIRROR", {
  lab: true, unlock: "mirror", echoes: ["mirror"], recMax: 8,
  hint: "THE PLATE IS BEHIND THE DOOR. WALK RIGHT AND YOUR PUPPET WALKS LEFT FROM THE OTHER SIDE. THE ROOM IS SYMMETRIC.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(15, 1, 15, 8, "#").fill(15, 9, 15, 14, "A");
  g.set(24, 14, "a");
  g.fill(28, 13, 28, 14, "X");
  g.set(5, 9, "L").set(25, 9, "L");
});

def(10, "VINE", {
  lab: true, unlock: "vine", echoes: ["vine"], recMax: 8,
  hint: "RECORD A VINE AT THE FOOT OF THE WALL AND WAIT. HOLD JUMP TO CLIMB IT. LET GO AND YOU SLIDE.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(20, 9, 30, 14, "#");
  g.fill(28, 7, 28, 8, "X");
  g.set(5, 8, "L").set(14, 5, "L");
});

def(10, "PULL", {
  lab: true, unlock: "pull", echoes: ["pull"], recMax: 8,
  hint: "THE GAP IS TOO WIDE TO JUMP. RECORD A PULL IN THE AIR OVER THE MIDDLE: IT CATCHES YOU MID JUMP AND HOLDS YOU THERE.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(9, 14);
  g.fill(28, 13, 28, 14, "X");
  g.set(5, 8, "L").set(13, 5, "L").set(24, 8, "L");
});

def(10, "BEAM", {
  lab: true, unlock: "beam", echoes: ["beam"], recMax: 8,
  hint: "THE THORNS WITHER IN LIGHT. A BEAM LIGHTS EVERYTHING ALONG ITS LENGTH. STAND FACING THE THORNS AND RECORD.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(8, 14, 20, 14, "t");
  g.fill(28, 13, 28, 14, "X");
  g.set(5, 8, "L").set(24, 8, "L");
});

def(10, "REFLECTOR", {
  lab: true, unlock: "reflector", echoes: ["reflector"], recMax: 8,
  hint: "A BEAM FALLS FROM THE CEILING AND THE GATE WANTS LIGHT. STAND IN THE BEAM AND RECORD A REFLECTOR: FACING LEFT IT TURNS THE BEAM TO THE RIGHT.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.set(20, 1, "s");
  g.fill(24, 1, 24, 12, "#").fill(24, 13, 24, 14, "G");
  g.fill(28, 13, 28, 14, "X");
  g.set(5, 8, "L").set(14, 6, "L");
});

def(10, "FORK", {
  lab: true, unlock: "fork", echoes: ["fork"], recMax: 14,
  hint: "THE DOOR NEEDS BOTH PLATES. STAND ON THE FIRST FOR A WHILE, THEN WALK TO THE SECOND AND STAY. YOUR TWIN FOLLOWS A FEW SECONDS LATER.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.set(8, 14, "a").set(11, 14, "a");
  g.fill(16, 1, 16, 8, "#").fill(16, 9, 16, 14, "A");
  g.fill(28, 13, 28, 14, "X");
  g.set(5, 8, "L").set(22, 8, "L");
});

def(10, "SHIFT", {
  lab: true, unlock: "shift", echoes: ["shift"], recMax: 8,
  hint: "THE GOLD BLOCK AND THE DARK BRIDGE ARE THE SAME ROOM SEEN FROM TWO SIDES. INSIDE THE RING GOLD VANISHES AND DARK APPEARS. RECORD INSIDE THE TUNNEL.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(8, 1, 20, 12, "#");
  g.fill(9, 15, 12, 17, ".");
  g.fill(9, 15, 12, 15, "*");
  g.fill(13, 13, 13, 14, "+");
  g.fill(28, 13, 28, 14, "X");
  g.set(5, 8, "L").set(25, 8, "L");
});

def(10, "FLOAT", {
  lab: true, benched: true, unlock: "float", echoes: ["float"], recMax: 8,
  hint: "BENCHED. THE LEDGE IS A LITTLE HIGHER THAN A JUMP. GRAVITY IS WEAK INSIDE THE RING.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(20, 10, 30, 14, "#");
  g.fill(28, 8, 28, 9, "X");
  g.set(5, 8, "L").set(14, 6, "L");
});

def(10, "SLOW", {
  lab: true, benched: true, unlock: "slow", echoes: ["tide", "slow"], recMax: 14,
  hint: "BENCHED. THE DOOR OPENS ONLY WHILE THE TIDE PASSES OVER THE PLATE, AND IT IS FAR TOO THICK TO CROSS IN THAT TIME. A SLOW RING MAKES THE TIDE LINGER.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.set(8, 14, "a");
  g.fill(14, 1, 16, 8, "#").fill(14, 9, 16, 14, "A");
  g.fill(28, 13, 28, 14, "X");
  g.set(5, 8, "L").set(21, 8, "L");
});

def(10, "SHRINK", {
  lab: true, benched: true, unlock: "shrink", echoes: ["shrink"], recMax: 8,
  hint: "BENCHED. THE TUNNEL IS HALF A TILE HIGH. YOU ARE HALF SIZE INSIDE THE RING, AND STAY SMALL UNTIL THERE IS ROOM TO GROW.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(12, 1, 20, 13, "#");
  g.fill(12, 14, 20, 14, "-");
  g.fill(28, 13, 28, 14, "X");
  g.set(5, 8, "L").set(25, 8, "L");
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
  "SWITCHBOARD": { t: 40, r: 3 },
  "GLASS WALL": { t: 20, r: 1 },
  "UNDER GLASS": { t: 30, r: 2 },
  "OVERHEAD": { t: 20, r: 1 },
  "CEILING PLATE": { t: 25, r: 2 },
  "GHOST GLASS": { t: 20, r: 3 },
  "HALL OF MIRRORS": { t: 50, r: 4 },
  "LOOKING GLASS": { t: 55, r: 4 },
  "HALF OPEN": { t: 25, r: 1 },
  "SKYLIGHT": { t: 55, r: 3 },
  "LONG CROSSING": { t: 45, r: 3 },
  "FERRY": { t: 25, r: 1 },
  "TRAMPOLINE": { t: 20, r: 1 },
  "SKYHOOK": { t: 20, r: 1 },
  "TWO STAGES": { t: 40, r: 3 },
  "FERRY LIGHT": { t: 45, r: 3 },
  "SLUICE": { t: 30, r: 3 },
  "SLINGSHOT": { t: 55, r: 4 },
  "PUMP ROOM": { t: 65, r: 5 },
  "BREEZE": { t: 15, r: 1 },
  "GALLOP": { t: 35, r: 3 },
  "LEAPFROG": { t: 25, r: 1 },
  "AFTERIMAGE": { t: 55, r: 4 },
  "CHORUS": { t: 100, r: 6 },
  "SAIL": { t: 25, r: 2 },
  "STAY BEHIND": { t: 20, r: 1 },
  "APEX": { t: 20, r: 1 },
  "UPSIDE DOWN": { t: 22, r: 1 },
  "NIGHT TRAIN": { t: 50, r: 2 },
  "THREE PANES": { t: 32, r: 3 },
  "GLASS CEILING": { t: 35, r: 2 },
  "UP AND OVER": { t: 40, r: 3 },
  "STAIRCASE": { t: 45, r: 3 },
  "GATEHOUSE": { t: 40, r: 2 },
  "STAGECOACH": { t: 35, r: 3 },
  "WEATHERVANE": { t: 20, r: 3 },
  "STILL AIR": { t: 20, r: 1 },
  "SLACK WATER": { t: 35, r: 3 },
  "REFLECTION": { t: 15, r: 1 },
  "OTHER SIDE": { t: 25, r: 2 },
  "STEP THROUGH": { t: 15, r: 1 },
  "SHAFT": { t: 20, r: 1 },
  "TURRET": { t: 25, r: 1 },
  "WELLSPRING": { t: 20, r: 1 },
  "HATCH": { t: 25, r: 2 },
  "OPEN DOOR": { t: 20, r: 1 },
  "GRAZE": { t: 20, r: 1 },
  "STAIRWELL": { t: 25, r: 1 },
  "SURFACE LIGHT": { t: 20, r: 1 },
  "TWO TIERS": { t: 35, r: 2 },
};
for (const l of LEVELS) l.par = PAR[l.name];
