"use strict";

// levels.js: tiers and level layouts.
// Grid is 32 x 18 tiles (20px each). Floor surface is row 15, so spawn at row 14 stands on it.
// Tiles: # wall, % crystal, ~ shadow plank, = one-way ledge (jump up through it), ^ v spikes, t thorns,
// a-d floor plates, 1-4 ceiling plates, 5-8 light-sensor plates (a-d), A-D doors, G light gate,
// L lamp, P-S lamps that burn only while plate a-d is held, o lantern, @ spawn, X exit, _ - half blocks, < > wind vents, u bubble draft,
// e w n s light emitters, + gold block (gone inside a ring of shift), * dark block (only inside one), m mushroom, r root ledge, T U timed doors.
// Moving platforms and rotating blades are added with g.mover and g.blade.
// Each tier has its own scenery and teaches its echoes in turn, then mixes them.

const TITLE = "AFTERGLOW";

// Each tier has a name, one line, and a few lines of story for its card. The story: you are the flame of a drowned lighthouse and the echoes are the
// keeper's memories. Page one climbs to the lamp, and lighting it costs the keeper's last memory (the interlude after the Mirror); page two is the
// reflection of the tower in the water, going down to where the first light was lit.
const CHAPTERS = [
  {
    name: "THE CELLAR", line: "SOMETHING REMEMBERS YOU.", theme: "cellar", mood: 0,
    story: ["THE OIL WAS KEPT DOWN HERE.", "THE KEEPER COUNTED EVERY DROP."],
    pal: { bg1: "#0d1d2a", bg2: "#1b3a47", wall: "#33495b", wallHi: "#4d6f86", wallLo: "#1e2e3c", mortar: "#15232f", accent: "#7fd0c0", moss: "#4d8a5e" },
  },
  {
    name: "THE GALLERY", line: "EVERYTHING HERE IS A REFLECTION.", theme: "gallery", mood: 2,
    story: ["THE KEEPER HUNG HIS PORTRAITS HERE.", "THEY LOOK BACK AT YOU."],
    pal: { bg1: "#160f2c", bg2: "#2f2558", wall: "#4b4474", wallHi: "#6e66a4", wallLo: "#2a2549", mortar: "#1b1735", accent: "#c78bff" },
  },
  {
    name: "THE TIDEWORKS", line: "THE WATER REMEMBERS EVERY ROUTE.", theme: "tideworks", mood: 1,
    story: ["THE PUMPS STILL TURN.", "THE SEA CAME IN THE NIGHT THE LAMP WENT OUT."],
    pal: { bg1: "#06182a", bg2: "#0d4a5c", wall: "#3f5f70", wallHi: "#79a5b4", wallLo: "#243d4b", mortar: "#12212c", accent: "#7fe0e6" },
  },
  {
    name: "THE BEACON", line: "THE WIND HAS BEEN WAITING FOR YOU.", theme: "beacon", mood: 4,
    story: ["THE LAMP ROOM IS ABOVE.", "RELIGHT THE LAMP."],
    pal: { bg1: "#080c2a", bg2: "#243b70", wall: "#4b5b83", wallHi: "#7488b8", wallLo: "#2b3656", mortar: "#1d2740", accent: "#fff0b0" },
  },
  {
    name: "THE MIRROR", line: "STEP THROUGH. SOMETHING TAKES YOUR PLACE.", theme: "mirror", mood: 3,
    story: ["THE LAMP BURNS ONLY THROUGH THE LENS.", "THE LENS KEEPS WHAT PASSES THROUGH IT."],
    pal: { bg1: "#210f1d", bg2: "#5a2a48", wall: "#74506c", wallHi: "#c08fb6", wallLo: "#412639", mortar: "#2a1426", accent: "#ff9fc8" },
  },
  // Page two, the drowned half of the tower seen in the water.
  {
    name: "THE SHALLOWS", line: "THE SURFACE IS A CEILING NOW.", theme: "shallows", mood: 5,
    story: ["THE FLAME WENT THROUGH THE LENS", "AND INTO THE WATER BELOW."],
    pal: { bg1: "#06222c", bg2: "#14707a", wall: "#3d7480", wallHi: "#8fd0d4", wallLo: "#264b54", mortar: "#0d2f38", accent: "#7ff0e0" },
  },
  {
    name: "THE WRECK", line: "SOMETHING BIGGER WENT DOWN HERE.", theme: "wreck", mood: 6,
    story: ["THE KEEPER'S SHIP SANK WITH HIS LAST WATCH.", "ITS CARGO STILL MOVES."],
    pal: { bg1: "#1c120c", bg2: "#4a3320", wall: "#6b5440", wallHi: "#a8896a", wallLo: "#3d2e22", mortar: "#241810", accent: "#ffb067" },
  },
  {
    name: "THE GARDEN", line: "NOTHING HERE STAYS WHERE YOU LEFT IT.", theme: "garden", mood: 7,
    story: ["HE PLANTED IT FOR HIS DAUGHTER.", "IT GREW WITHOUT HIM."],
    pal: { bg1: "#06200f", bg2: "#1d5a2c", wall: "#3f6b48", wallHi: "#86c58f", wallLo: "#264a2e", mortar: "#0c2a14", accent: "#a6ff9a" },
  },
  {
    name: "THE TRENCH", line: "THE LIGHT STOPS HERE.", theme: "trench", mood: 8,
    story: ["THE DEEPEST MEMORIES COME BACK LAST.", "THEY COME BACK LATE, AND TWICE."],
    pal: { bg1: "#02070a", bg2: "#06222a", wall: "#2b4650", wallHi: "#5f9aa8", wallLo: "#16282f", mortar: "#08161c", accent: "#4dffd8" },
  },
  {
    name: "THE FOUNDATION", line: "WHERE THE FIRST LIGHT WAS LIT.", theme: "foundation", mood: 9,
    story: ["UNDER THE TOWER, BEFORE THE KEEPER.", "SOMEONE LIT IT FIRST."],
    pal: { bg1: "#1a1204", bg2: "#5c4310", wall: "#7a6a40", wallHi: "#d8c27a", wallLo: "#463a1c", mortar: "#2a1f08", accent: "#ffe27a" },
  },
  // Not part of the game: a room per echo, to try each one. Shows up on the last page of the level select when the dev
  // switch (backslash) has unlocked everything.
  {
    name: "THE LAB", line: "TRY THE NEW ECHOES.", theme: "lab", mood: 0, lab: true,
    pal: { bg1: "#10131f", bg2: "#1d2640", wall: "#445070", wallHi: "#7f8fb8", wallLo: "#262d45", mortar: "#161b2c", accent: "#9fe3ff" },
  },
];

// Story screens. The interlude plays after the last level of The Mirror (the lamp is lit, and it costs the keeper his last memory); the ending plays
// after the last level of the game.
const INTERLUDE = {
  after: "NIGHT TRAIN",
  title: "THE LAMP BURNS AGAIN.",
  lines: [
    "THE BEAM SWEEPS THE DARK WATER.",
    "THE KEEPER'S LAST MEMORY FADES INTO THE LIGHT.",
    "",
    "BUT THE FLAME IS NOT DONE.",
    "THE LENS IS STILL OPEN, AND THE WATER BELOW IS A MIRROR.",
    "IT STEPS THROUGH.",
  ],
};
const ENDING = {
  title: "THE FIRST LIGHT WAS YOURS.",
  lines: [
    "THE KEEPER NEVER LIT IT. HE ONLY KEPT IT.",
    "",
    "BEFORE THE TOWER, BEFORE THE SEA, THERE WAS A FLAME",
    "AND A PLACE TO STAND, AND THE FIRST THING IT DID",
    "WAS REMEMBER ITSELF. THAT WAS THE FIRST ECHO.",
    "",
    "EVERY ECHO YOU LEFT BEHIND WAS THAT SAME FLAME.",
    "THE LAMP BURNS AGAIN, AND THIS TIME IT WILL NOT GO OUT.",
    "",
    "THEY WERE ALWAYS YOU.",
  ],
};

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

def(3, "WINDFALL", {
  bonus: 20, echoes: ["tide", "gust"], recMax: 30,
  hint: "THE FERRY ONLY TAKES YOU PART OF THE WAY. YOU CAN RECORD WHILE YOU RIDE IT: JUMP OFF AT ITS FAR END AND STOP IN MID AIR, FACING THE FAR BANK.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(9, 18);
  g.fill(28, 13, 28, 14, "X");
  g.set(5, 8, "L").set(14, 4, "L").set(24, 8, "L");
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

def(4, "OVER THE WALL", {
  bonus: 20, echoes: ["spring", "mirror"], recMax: 24, swap: true,
  hint: "THE WALL GOES TO THE CEILING AND THE LEDGE IS HIGH. YOUR PUPPET HANGS WHEREVER YOU STOP, SEEN IN THE GLASS. A SPRING CAN TAKE YOU HIGHER THAN A JUMP, AND SWAP TAKES YOU TO THE PUPPET.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(15, 1, 16, 14, "#");
  g.fill(21, 6, 30, 14, "#");
  g.fill(28, 4, 28, 5, "X");
  g.set(5, 8, "L").set(11, 4, "L").set(24, 3, "L");
});

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

def(5, "PULSE", {
  bonus: 20, echoes: ["reflector"], recMax: 20,
  hint: "THE CLOCK DOOR LETS THE LIGHT THROUGH ONLY WHILE IT IS OPEN, AND THE THORNS AND THE GATE LIVE ON THAT LIGHT. BE THROUGH BEFORE IT SHUTS.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.set(5, 1, "s");
  g.fill(9, 1, 9, 10, "#").fill(9, 11, 9, 14, "T");
  g.fill(11, 14, 15, 14, "t");
  g.fill(17, 1, 17, 12, "#").fill(17, 13, 17, 14, "G");
  g.fill(28, 13, 28, 14, "X");
  g.set(3, 8, "L").set(13, 5, "L").set(24, 8, "L");
});

// ================================================================ tier 7: the wreck (pull, cargo platforms)
def(6, "GRAPPLE", {
  unlock: "pull", echoes: ["pull"], recMax: 8,
  hint: "THE GAP IS TOO WIDE TO JUMP. RECORD A PULL IN THE AIR OVER THE MIDDLE: IT CATCHES YOU MID JUMP AND HOLDS YOU THERE.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(9, 14);
  g.fill(28, 13, 28, 14, "X");
  g.set(5, 8, "L").set(13, 5, "L").set(24, 8, "L");
});

def(6, "SLOW BOAT", {
  autoHint: true, echoes: [],
  hint: "THE CARGO PLATFORM RUNS BACK AND FORTH ON ITS OWN. HOP ON WHEN IT COMES, AND OFF WHEN IT ARRIVES.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(7, 16);
  g.mover(6, 15, 14, 15, 3, { sp: 40, dwell: 60 });
  g.fill(28, 13, 28, 14, "X");
  g.set(4, 8, "L").set(12, 5, "L").set(23, 8, "L");
});

def(6, "CRANE", {
  echoes: ["shade"], recMax: 20,
  hint: "THE DOOR IS BACK HOME AND THE PLATE IS ACROSS THE WATER. SOMETHING THAT RODE THE PLATFORM OVER CAN STAY THERE.",
}, (g) => {
  g.base();
  g.set(10, 14, "@");
  g.fill(5, 1, 5, 8, "#").fill(5, 9, 5, 14, "A");
  g.fill(2, 13, 2, 14, "X");
  g.pit(13, 20);
  g.mover(12, 15, 18, 15, 3, { sp: 40, dwell: 60 });
  g.set(24, 14, "a");
  g.set(8, 8, "L").set(16, 5, "L").set(26, 8, "L");
});

def(6, "DELIVERY", {
  echoes: ["spring"], recMax: 24,
  hint: "THE WALL OVER THERE IS TOO HIGH TO CLIMB, AND THE SPRING THAT WOULD THROW YOU UP IT HAS TO BE ON THE OTHER SIDE OF THE WATER.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(7, 16);
  g.mover(6, 15, 14, 15, 3, { sp: 40, dwell: 60 });
  g.fill(24, 6, 30, 14, "#");
  g.fill(28, 4, 28, 5, "X");
  g.set(4, 8, "L").set(12, 5, "L").set(21, 4, "L");
});

def(6, "HOIST", {
  autoHint: true, echoes: ["shade"], recMax: 20,
  hint: "THE LIFT STOPS A LONG WAY BELOW THE LEDGE. AN ECHO CAN HANG IN THE AIR WHERE THE LIFT TOOK YOU, LONG AFTER THE LIFT HAS GONE.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.mover(8, 15, 8, 8, 3, { sp: 40, dwell: 90 });
  g.fill(12, 4, 30, 14, "#");
  g.fill(28, 2, 28, 3, "X");
  g.set(4, 8, "L").set(7, 3, "L").set(22, 2, "L");
});

def(6, "THE LONG HAUL", {
  autoHint: true, echoes: ["pull"], recMax: 20,
  hint: "THE CARGO PLATFORM CARRIES YOU PART OF THE WAY. YOU CAN RECORD WHILE YOU RIDE IT. JUMP OFF AT THE FAR END AND STOP IN MID AIR.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(6, 17);
  g.mover(5, 15, 9, 15, 3, { sp: 40, dwell: 60 });
  g.fill(28, 13, 28, 14, "X");
  g.set(4, 8, "L").set(12, 5, "L").set(24, 8, "L");
});

def(6, "BOUNCE WELL", {
  echoes: ["spring", "pull"], recMax: 20,
  hint: "THE SPRING THROWS YOU HIGH ENOUGH BUT NOT FAR ENOUGH. A PULL HUNG AT THE TOP OF THE BOUNCE WILL HOLD YOU THERE WHILE YOU DRIFT ACROSS.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(6, 11);
  g.fill(12, 6, 30, 14, "#");
  g.fill(28, 4, 28, 5, "X");
  g.set(4, 8, "L").set(9, 4, "L").set(22, 3, "L");
});

def(6, "WINDLASS", {
  echoes: ["pull", "pull"], recMax: 24,
  hint: "ONE WELL REACHES ONLY HALF WAY. THE SECOND ONE HAS TO BE HUNG WHERE THE FIRST ONE LETS GO OF YOU.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(6, 16);
  g.fill(28, 13, 28, 14, "X");
  g.set(5, 8, "L").set(11, 4, "L").set(24, 8, "L");
});

def(6, "SALVAGE", {
  echoes: ["pull", "shade"], recMax: 40,
  hint: "THE PLATFORM TAKES YOU TO THE ISLAND, A WELL TAKES YOU OFF IT, AND THE DOOR WANTS A PLATE HELD ON THE FAR BANK. WHAT YOU RECORD LATER IS RECORDED RIDING WHAT YOU RECORDED BEFORE.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(7, 13);
  g.mover(6, 15, 11, 15, 3, { sp: 40, dwell: 60 });
  g.pit(16, 21);
  g.set(24, 14, "a");
  g.fill(27, 1, 27, 8, "#").fill(27, 9, 27, 14, "A");
  g.fill(29, 13, 29, 14, "X");
  g.set(4, 8, "L").set(10, 5, "L").set(17, 4, "L").set(25, 8, "L");
});

def(6, "DOCKSIDE", {
  bonus: 20, echoes: ["pull", "shade"], recMax: 60,
  hint: "A PLATFORM, A WELL AND A LIFT, IN THAT ORDER. THE LIFT STOPS FAR BELOW THE LEDGE: AN ECHO HUNG AT THE TOP OF ITS TRAVEL IS THE STEP THAT REACHES IT.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(7, 13);
  g.mover(6, 15, 11, 15, 3, { sp: 40, dwell: 60 });
  g.pit(16, 21);
  g.mover(24, 15, 24, 8, 3, { sp: 40, dwell: 90 });
  g.fill(28, 4, 30, 14, "#");
  g.fill(29, 2, 29, 3, "X");
  g.set(4, 8, "L").set(10, 5, "L").set(17, 4, "L").set(25, 3, "L");
});

// ================================================================ tier 8: the garden (vine, mushrooms, roots)
def(7, "SPROUT", {
  unlock: "vine", echoes: ["vine"], recMax: 8,
  hint: "RECORD A VINE AT THE FOOT OF THE WALL AND WAIT. HOLD JUMP TO CLIMB IT. LET GO AND YOU SLIDE.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(20, 9, 30, 14, "#");
  g.fill(28, 7, 28, 8, "X");
  g.set(5, 8, "L").set(14, 5, "L");
});

def(7, "ROOTWALK", {
  autoHint: true, echoes: [],
  hint: "THE ROOT LEDGES GIVE WAY SOON AFTER YOU STAND ON THEM, AND GROW BACK LATER. KEEP MOVING.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(7, 23);
  g.fill(8, 13, 9, 13, "r");
  g.fill(12, 12, 13, 12, "r");
  g.fill(16, 13, 17, 13, "r");
  g.fill(20, 12, 21, 12, "r");
  g.fill(28, 13, 28, 14, "X");
  g.set(5, 8, "L").set(14, 5, "L").set(24, 8, "L");
});

def(7, "SPORE LIFT", {
  autoHint: true, echoes: ["shade"], recMax: 16,
  hint: "THE MUSHROOM THROWS YOU HIGH. A STEP HUNG IN THE AIR AT THE END OF A BOUNCE IS HIGHER THAN ANYTHING YOU CAN JUMP TO.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.set(6, 14, "m");
  g.fill(14, 4, 30, 14, "#");
  g.fill(28, 2, 28, 3, "X");
  g.set(4, 8, "L").set(9, 3, "L").set(22, 2, "L");
});

def(7, "HANGING VINE", {
  echoes: ["vine"], recMax: 14,
  hint: "A VINE GROWS UP FROM WHEREVER ITS ECHO STANDS, SO STAND HIGHER. THE ROOTS GIVE WAY IF YOU STAY, BUT THE VINE DOES NOT NEED THEM.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(10, 12, 13, 12, "r");
  g.fill(14, 6, 30, 14, "#");
  g.fill(28, 4, 28, 5, "X");
  g.set(5, 8, "L").set(9, 4, "L").set(22, 3, "L");
});

def(7, "SPORE WIND", {
  echoes: ["gust"], recMax: 20,
  hint: "THE MUSHROOM THROWS YOU HIGH BUT NOT FAR. A GUST HUNG AT THE TOP OF THE BOUNCE WILL BLOW YOU THE REST OF THE WAY.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.set(6, 14, "m");
  g.pit(8, 14);
  g.fill(15, 9, 30, 14, "#");
  g.fill(28, 7, 28, 8, "X");
  g.set(4, 8, "L").set(11, 4, "L").set(22, 5, "L");
});

def(7, "TWO VINES", {
  echoes: ["vine", "vine"], recMax: 24,
  hint: "THE WALL IS TWICE AS TALL AS A VINE. A VINE GROWS UP FROM WHEREVER ITS ECHO STANDS, SO THE SECOND ONE CAN START ON THE SHELF.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(17, 9, 20, 14, "#");
  g.fill(21, 4, 30, 14, "#");
  g.fill(28, 2, 28, 3, "X");
  g.set(5, 8, "L").set(12, 5, "L").set(24, 2, "L");
});

def(7, "TREETOP", {
  echoes: ["vine"], recMax: 24,
  hint: "THE MUSHROOM THROWS YOU HIGHER THAN ANY VINE REACHES FROM THE GROUND. A VINE HUNG IN THE AIR AT THE TOP OF A BOUNCE REACHES HIGHER STILL.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.set(6, 14, "m");
  g.fill(11, 3, 30, 14, "#");
  g.fill(28, 1, 28, 2, "X");
  g.set(4, 8, "L").set(8, 3, "L");
});

def(7, "GREEN DARK", {
  echoes: ["vine", "glow"], recMax: 24, dark: true,
  hint: "THE THORNS ON THE LEDGE NEED LIGHT, AND THE LIGHT HAS TO BE UP THERE WITH THEM. A VINE IS THE ONLY WAY UP.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(20, 9, 30, 14, "#");
  g.fill(22, 8, 25, 8, "t");
  g.fill(28, 7, 28, 8, "X");
  g.set(6, 6, "L");
});

def(7, "ESCALATOR", {
  echoes: ["tide", "vine"], recMax: 40,
  hint: "TWO CLIMBS AND ONE VINE. A TIDE REPEATS YOUR WHOLE ROUTE BACK AND FORTH, UP THE WALL TOO, AND YOU CAN STAND ON IT. WAIT AT THE START SO YOU CAN CATCH IT.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(17, 9, 20, 14, "#");
  g.fill(21, 4, 30, 14, "#");
  g.fill(28, 2, 28, 3, "X");
  g.set(5, 8, "L").set(12, 5, "L").set(24, 2, "L");
});

def(7, "CANOPY", {
  bonus: 20, echoes: ["vine", "gust"], recMax: 40,
  hint: "THE MUSHROOM THROWS YOU TO THE TOP OF A BOUNCE, AND A VINE HUNG THERE REACHES THE SHELF. THE GAP ON THE SHELF IS A LITTLE TOO WIDE FOR A JUMP: THE WIND CAN HELP, IF YOU RECORD IT FROM UP THERE.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.set(6, 14, "m");
  g.fill(11, 3, 18, 14, "#");
  g.fill(24, 7, 30, 14, "#");
  g.fill(28, 5, 28, 6, "X");
  g.set(4, 8, "L").set(8, 3, "L").set(21, 3, "L");
});

// ================================================================ tier 9: the trench (fork, blades, timed doors; dark)
def(8, "PAIR", {
  unlock: "fork", echoes: ["fork"], recMax: 14, dark: true,
  hint: "THE DOOR NEEDS BOTH PLATES. STAND ON THE FIRST FOR A WHILE, THEN WALK TO THE SECOND AND STAY. YOUR TWIN FOLLOWS A FEW SECONDS LATER.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.set(8, 14, "a").set(11, 14, "a");
  g.fill(16, 1, 16, 8, "#").fill(16, 9, 16, 14, "A");
  g.fill(28, 13, 28, 14, "X");
  g.set(4, 10, "L").set(14, 11, "L").set(22, 8, "L");
});

def(8, "CLOSET", {
  autoHint: true, echoes: ["shade"], recMax: 16, dark: true,
  hint: "THE PLATE IS IN A CLOSET WHOSE DOOR OPENS AND SHUTS ON A CLOCK. AN ECHO DOES NOT NEED THE DOOR TO BE OPEN.",
}, (g) => {
  g.base();
  g.set(8, 14, "@");
  g.fill(1, 1, 4, 10, "#");
  g.fill(5, 1, 5, 10, "#").fill(5, 11, 5, 14, "T");
  g.set(2, 14, "a");
  g.fill(14, 1, 14, 8, "#").fill(14, 9, 14, 14, "A");
  g.fill(28, 13, 28, 14, "X");
  g.set(8, 10, "L").set(3, 12, "L").set(20, 10, "L");
});

def(8, "SLIDING DOORS", {
  echoes: ["shade"], recMax: 16, dark: true,
  hint: "T DOORS ARE SHUT FOR THE FIRST HALF OF EVERY FIVE SECONDS AND U DOORS FOR THE SECOND HALF. THE LAST DOOR WANTS A PLATE HELD, AND THE PLATE IS IN THE FIRST ROOM.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(6, 1, 26, 11, "#");
  g.fill(9, 12, 9, 14, "T");
  g.set(11, 14, "a");
  g.fill(13, 12, 13, 14, "U");
  g.fill(17, 12, 17, 14, "T");
  g.fill(22, 12, 22, 14, "A");
  g.fill(28, 13, 28, 14, "X");
  g.set(3, 9, "L").set(11, 12, "L").set(19, 12, "L").set(24, 12, "L");
});

def(8, "TURNSTILE", {
  autoHint: true, echoes: ["fork"], recMax: 20, dark: true,
  hint: "THE BLADE TURNS IN THE TUNNEL AND YOU CAN ONLY PASS WHEN IT IS NEARLY LEVEL. THE DOOR OPENS ONLY WHILE BOTH PLATES ARE HELD, AND YOUR TWIN IS A FEW SECONDS BEHIND YOU.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.set(6, 14, "a");
  g.fill(7, 1, 16, 11, "#");
  g.blade(11, 13, 24, 1.5, 0);
  g.set(17, 14, "a");
  g.fill(19, 1, 19, 8, "#").fill(19, 9, 19, 14, "A");
  g.fill(28, 13, 28, 14, "X");
  g.set(3, 9, "L").set(22, 10, "L").set(26, 8, "L");
});

def(8, "THE GRINDER", {
  echoes: ["vine"], recMax: 40, dark: true,
  hint: "THE VINE GROWS AT THE FOOT OF THE WALL, AND THE BLADE SWEEPS THE VINE ON EVERY TURN. CLIMB WHILE IT IS ON THE FAR SIDE.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(18, 9, 30, 14, "#");
  g.fill(28, 7, 28, 8, "X");
  g.blade(15, 11, 40, 2.0, 0);
  g.set(4, 10, "L").set(9, 9, "L").set(15, 14, "L").set(24, 6, "L");
});

def(8, "TRIPLE", {
  echoes: ["shade", "fork"], recMax: 24, dark: true,
  hint: "THREE PLATES, ONE DOOR, AND NOT ENOUGH OF YOU. ONE RECORDING CAN BE IN TWO PLACES, BUT THE SECOND ONLY LATER.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.set(4, 14, "a").set(7, 14, "a").set(10, 14, "a");
  g.fill(15, 1, 15, 8, "#").fill(15, 9, 15, 14, "A");
  g.fill(28, 13, 28, 14, "X");
  g.set(5, 10, "L").set(12, 10, "L").set(22, 8, "L");
});

def(8, "THORN PAIR", {
  echoes: ["glow", "fork"], recMax: 24, dark: true,
  hint: "THE THORNS NEED LIGHT, THE DOOR NEEDS TWO PLATES, AND THE PLATES ARE FAR APART. THE TWIN COVERS THE FIRST ONE WHILE YOU ARE AT THE SECOND.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.set(4, 14, "a");
  g.fill(9, 14, 13, 14, "t");
  g.set(15, 14, "a");
  g.fill(17, 1, 17, 8, "#").fill(17, 9, 17, 14, "A");
  g.fill(28, 13, 28, 14, "X");
  g.set(2, 9, "L").set(24, 8, "L");
});

def(8, "CLOCK TOWER", {
  echoes: ["fork"], recMax: 24, dark: true,
  hint: "TWO CLOSETS, ONE PLATE EACH, AND THEIR DOORS TAKE TURNS: T IS OPEN WHILE U IS SHUT. THE HATCH WANTS BOTH PLATES. YOUR TWIN IS EXACTLY HALF A CYCLE BEHIND YOU.",
}, (g) => {
  g.base();
  g.set(6, 14, "@");
  g.fill(1, 12, 30, 12, "#");
  g.fill(4, 13, 4, 14, "T");
  g.set(2, 14, "a");
  g.fill(10, 13, 10, 14, "U");
  g.set(12, 14, "a");
  g.set(7, 12, "A");
  g.fill(14, 13, 30, 14, "#");
  g.fill(16, 10, 16, 11, "X");
  g.set(4, 9, "L").set(12, 8, "L").set(24, 8, "L").set(3, 12, "L").set(8, 13, "L");
});

def(8, "DEEP END", {
  echoes: ["glow", "fork"], recMax: 40, dark: true,
  hint: "THE THORNS, THE CLOCK DOOR AND THE TWO PLATES, IN THAT ORDER. THE TWIN SLIPS THROUGH THE CLOCK DOOR ON ITS OWN SCHEDULE, SO ONLY YOU HAVE TO WAIT FOR IT.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(6, 14, 9, 14, "t");
  g.fill(12, 1, 12, 8, "#").fill(12, 9, 12, 14, "T");
  g.set(15, 14, "a").set(18, 14, "a");
  g.fill(21, 1, 21, 8, "#").fill(21, 9, 21, 14, "A");
  g.fill(28, 13, 28, 14, "X");
  g.set(4, 10, "L").set(14, 10, "L").set(24, 8, "L");
});

def(8, "FOUR CORNERS", {
  bonus: 20, echoes: ["fork", "fork"], recMax: 30, dark: true,
  hint: "FOUR PLATES AND ONE DOOR. EACH FORK CAN BE IN TWO PLACES, BUT ONLY WHILE ITS TWIN IS STILL A FEW SECONDS BEHIND IT. LINE THE TWO UP.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.set(4, 14, "a").set(7, 14, "a").set(10, 14, "a").set(13, 14, "a");
  g.fill(18, 1, 18, 8, "#").fill(18, 9, 18, 14, "A");
  g.fill(28, 13, 28, 14, "X");
  g.set(5, 10, "L").set(12, 10, "L").set(23, 8, "L");
});

// ================================================================ tier 10: the foundation (shift, then everything)
def(9, "THRESHOLD", {
  unlock: "shift", echoes: ["shift"], recMax: 8,
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

def(9, "NIGHT STAIRS", {
  echoes: ["shift", "shift"], recMax: 20,
  hint: "THE STAIRS ARE ONLY THERE INSIDE A RING OF SHIFT, AND ONE RING DOES NOT REACH ALL OF THEM. A SECOND ONE CAN BE RECORDED WHILE YOU STAND ON THE FIRST STEP.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(10, 12, 12, 12, "*");
  g.fill(14, 9, 16, 9, "*");
  g.fill(18, 6, 20, 6, "*");
  g.fill(22, 3, 30, 14, "#");
  g.fill(28, 1, 28, 2, "X");
  g.set(5, 8, "L").set(15, 3, "L").set(26, 1, "L");
});

def(9, "THE SPAN", {
  echoes: ["shift"], recMax: 14, swap: true,
  hint: "THE DARK BRIDGE IS LONGER THAN ONE RING. WHAT YOU SWAP WITH TAKES YOUR PLACE, AND ITS RING GOES WITH IT, SO THE RING CAN BE LEAPT ALONG.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(8, 15, 23, 17, ".");
  g.fill(8, 15, 23, 15, "*");
  g.fill(28, 13, 28, 14, "X");
  g.set(5, 8, "L").set(15, 5, "L").set(26, 8, "L");
});

def(9, "KEYSTONE", {
  echoes: ["shift", "shade"], recMax: 20,
  hint: "A WALL OF GOLD HIDES THE PLATE. THE RING THAT OPENS IT HAS TO BE RECORDED STANDING AGAINST THE WALL. AN ECHO CAN HOLD A PLATE BUT NOT THE WALL OPEN, SO THE WALL NEEDS ITS OWN.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(12, 1, 12, 14, "+");
  g.set(15, 14, "a");
  g.fill(21, 1, 21, 8, "#").fill(21, 9, 21, 14, "A");
  g.fill(28, 13, 28, 14, "X");
  g.set(5, 8, "L").set(16, 8, "L").set(25, 8, "L");
});

def(9, "ARCHWAY", {
  echoes: ["shade", "calm", "shift"], recMax: 36,
  hint: "THREE THINGS IN A ROW: A VENT, A DARK BRIDGE AND A DOOR WITH A PLATE. EACH ECHO HELPS YOU REACH WHERE THE NEXT ONE IS NEEDED.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(7, 8);
  g.set(10, 14, "<");
  g.fill(13, 15, 16, 17, ".");
  g.fill(13, 15, 16, 15, "*");
  g.set(21, 14, "a");
  g.fill(25, 1, 25, 8, "#").fill(25, 9, 25, 14, "A");
  g.fill(28, 13, 28, 14, "X");
  g.set(4, 8, "L").set(11, 5, "L").set(19, 8, "L").set(27, 8, "L");
});

def(9, "LAMP HALL", {
  echoes: ["shade", "glow", "calm"], recMax: 40, dark: true,
  hint: "THORNS, A VENT AND A DOOR, IN THAT ORDER, AND AN ECHO FOR EACH. THE LIGHT HAS TO STAY CLEAR OF THE CALM: A CALM SILENCES LIGHT TOO.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(6, 14, 9, 14, "t");
  g.pit(15, 16);
  g.set(18, 14, "<");
  g.set(22, 14, "a");
  g.fill(26, 1, 26, 8, "#").fill(26, 9, 26, 14, "A");
  g.fill(29, 13, 29, 14, "X");
  g.set(4, 10, "L").set(13, 11, "L").set(21, 11, "L").set(28, 9, "L");
});

def(9, "GILDED GLASS", {
  echoes: ["phase", "beam", "shift"], recMax: 40,
  hint: "GLASS, THORNS AND A BRIDGE THAT ISN'T THERE. LIGHT GOES THROUGH GLASS, AND SO DO YOU, IF YOU OPEN IT FIRST.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(6, 1, 7, 14, "%");
  g.fill(11, 14, 16, 14, "t");
  g.fill(19, 15, 22, 17, ".");
  g.fill(19, 15, 22, 15, "*");
  g.fill(28, 13, 28, 14, "X");
  g.set(4, 8, "L").set(12, 4, "L").set(24, 8, "L");
});

def(9, "UNDERTOW", {
  echoes: ["shade", "pull", "vine"], recMax: 40,
  hint: "A WELL TO CROSS THE WATER, A VINE TO CLIMB THE WALL, AND A PLATE UP THERE FOR THE DOOR. EACH ONE IS RECORDED CROSSING WHAT THE LAST ONE OPENED.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(7, 12);
  g.fill(17, 9, 30, 14, "#");
  g.set(22, 8, "a");
  g.fill(26, 1, 26, 4, "#").fill(26, 5, 26, 8, "A");
  g.fill(29, 7, 29, 8, "X");
  g.set(4, 8, "L").set(10, 4, "L").set(14, 8, "L");
});

def(9, "THE FIRST LIGHT", {
  echoes: ["calm", "pull", "vine", "shift"], recMax: 60,
  hint: "EVERYTHING THE TOWER AND THE WATER TAUGHT YOU, IN ORDER: A VENT, A BRIDGE THAT IS NOT THERE, A WELL AND A WALL. EACH ECHO IS RECORDED CROSSING WHAT THE LAST ONE OPENED. THE LAMP IS AT THE TOP.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.pit(6, 7);
  g.set(9, 14, "<");
  g.fill(12, 15, 15, 17, ".");
  g.fill(12, 15, 15, 15, "*");
  g.pit(18, 23);
  g.fill(27, 9, 30, 14, "#");
  g.fill(29, 7, 29, 8, "X");
  g.set(4, 8, "L").set(10, 5, "L").set(16, 4, "L").set(24, 5, "L");
});

def(9, "GOLDEN HOUR", {
  bonus: 20, echoes: ["shift", "shift"], recMax: 40, swap: true,
  hint: "A LONG BRIDGE AND THEN A STAIRCASE, BOTH ONLY THERE IN A RING OF SHIFT. THE FIRST RING CAN BE LEAPT ACROSS THE BRIDGE BY SWAPPING. THE SECOND IS RECORDED AT THE STAIRS, AFTER YOU HAVE CROSSED.",
}, (g) => {
  g.base();
  g.set(2, 14, "@");
  g.fill(8, 15, 17, 17, ".");
  g.fill(8, 15, 17, 15, "*");
  g.fill(21, 12, 23, 12, "*");
  g.fill(25, 9, 27, 9, "*");
  g.fill(29, 6, 30, 14, "#");
  g.fill(30, 4, 30, 5, "X");
  g.set(5, 8, "L").set(13, 5, "L").set(20, 6, "L");
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
  "GRAPPLE": { t: 20, r: 1 },
  "SLOW BOAT": { t: 20, r: 0 },
  "CRANE": { t: 25, r: 1 },
  "DELIVERY": { t: 35, r: 1 },
  "HOIST": { t: 35, r: 1 },
  "THE LONG HAUL": { t: 25, r: 1 },
  "BOUNCE WELL": { t: 25, r: 2 },
  "WINDLASS": { t: 30, r: 2 },
  "SPROUT": { t: 25, r: 1 },
  "SPORE LIFT": { t: 20, r: 1 },
  "ROOTWALK": { t: 15, r: 0 },
  "TWO VINES": { t: 45, r: 2 },
  "HANGING VINE": { t: 25, r: 1 },
  "GREEN DARK": { t: 45, r: 2 },
  "TREETOP": { t: 20, r: 1 },
  "SPORE WIND": { t: 20, r: 1 },
  "ESCALATOR": { t: 45, r: 3 },
  "PAIR": { t: 30, r: 1 },
  "CLOSET": { t: 25, r: 1 },
  "TURNSTILE": { t: 35, r: 1 },
  "SLIDING DOORS": { t: 30, r: 1 },
  "TRIPLE": { t: 25, r: 2 },
  "THORN PAIR": { t: 35, r: 2 },
  "CLOCK TOWER": { t: 30, r: 1 },
  "THRESHOLD": { t: 20, r: 1 },
  "NIGHT STAIRS": { t: 40, r: 2 },
  "THE SPAN": { t: 25, r: 1 },
  "KEYSTONE": { t: 30, r: 2 },
  "ARCHWAY": { t: 45, r: 3 },
  "LAMP HALL": { t: 50, r: 3 },
  "GILDED GLASS": { t: 40, r: 3 },
  "UNDERTOW": { t: 55, r: 3 },
  "THE FIRST LIGHT": { t: 90, r: 4 },
  "WINDFALL": { t: 40, r: 2 },
  "OVER THE WALL": { t: 20, r: 2 },
  "PULSE": { t: 20, r: 1 },
  "SALVAGE": { t: 70, r: 2 },
  "DOCKSIDE": { t: 130, r: 2 },
  "CANOPY": { t: 35, r: 2 },
  "THE GRINDER": { t: 35, r: 1 },
  "DEEP END": { t: 35, r: 2 },
  "FOUR CORNERS": { t: 35, r: 2 },
  "GOLDEN HOUR": { t: 40, r: 2 },
};
for (const l of LEVELS) l.par = PAR[l.name];

// The keeper's diary: each hidden lantern holds one line, shown on the level complete screen once the lantern has been found.
const DIARY = {
  "THE PLATE": "DAY ONE. THE LAMP NEEDS OIL AND I NEED A REASON TO CLIMB.",
  "STEPPING STONE": "I COUNT THE BARRELS EVERY NIGHT. THEY NEVER COME OUT EVEN.",
  "SUNKEN GATE": "SOMETHING FOLLOWS ME DOWN THE STAIRS. IT WALKS WHEN I WALK.",
  "UNDER GLASS": "I HUNG MY MOTHER HERE. SHE WATCHES THE DOOR.",
  "OVERHEAD": "THE GLASS REMEMBERS WHAT STOOD IN FRONT OF IT.",
  "HALF OPEN": "A FACE IN THE FRAME BLINKED. I DID NOT.",
  "TRAMPOLINE": "THE PUMPS WERE MY FATHER'S WORK. I ONLY OIL THEM.",
  "SLINGSHOT": "THE TIDE KNOWS MY ROUTE BETTER THAN I DO.",
  "LONG CROSSING": "WATER IN THE ENGINE ROOM AGAIN. I CALLED IT A DREAM.",
};
for (const l of LEVELS) if (DIARY[l.name]) l.diary = DIARY[l.name];
