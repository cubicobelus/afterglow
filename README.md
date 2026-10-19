# Afterglow

A puzzle platformer in your browser. You are a wick-spirit climbing a drowned lighthouse to relight its lamp,
and the only help you have is your own past: record a run, and it comes back as an **echo** that replays
your path and then holds the spot where you stopped. Echoes press plates, carry light, melt crystal, bend
gravity, bounce you, ferry you and blow you across gaps. Plain HTML and JavaScript on a canvas, no build step,
no dependencies. Every picture and sound is drawn or synthesized in code.

## Play

**[▶ Play in your browser](https://cubicobelus.github.io/afterglow/)**: nothing to download or install.

To run it offline, download the repo and open `index.html` from a local web server (for example
`python -m http.server` in the folder). Progress and settings are saved in your browser only.

## How it works

Press **E** to start recording and **E** again to stop. You go back to the start and your echo walks the path you
just took, then stays wherever you stopped, even in mid-jump, so a frozen jump makes a stepping stone in the air.
Each slot along the bottom of the screen holds one echo, and an echo's power switches on once it comes to rest. While you record, a dashed ring shows how far that power will reach where you stop. Slots always appear in the same order (shade, glow, phase, flip, tide, spring, gust), so the numbers never tell you what to record first.
Later levels give you several slots, sometimes two or three of the same kind. An echo does not care about walls or
glass, so one you no longer need can be recorded again somewhere else.

The game has 35 levels in four tiers, each with its own scenery. Every echo gets one or two easy levels, then the
tiers mix them and climb to levels where the order matters, an echo has to be recorded again halfway through, and
what you recorded earlier can carry you or lead you through doors.

| Echo | What it does |
|---|---|
| Shade | Holds down plates, and you can stand on it. |
| Glow | Carries light. Dark planks and light gates hold in it, light sensors fire, and thorns wither. |
| Phase | Crystal fades away around it. |
| Flip | Reverses gravity in a zone around it, so you can fall upward and walk on ceilings. |
| Tide | Replays its path back and forth forever, waiting where you waited. Ride it like a ferry or a lift. |
| Spring | Bounces you high when you land on it. Hold jump for a bigger bounce. |
| Gust | Blows a wind the way it was facing, which carries a jump much farther. |

**Swap** is an ability, not an echo. Press **Q** to trade places with the picked echo, whatever kind it is. Only some levels switch it on, and those show a swap sign beside the level name and on the level select.

Every level also scores up to three stars: finishing it, beating its par time, and using no more recordings than
its par. A few levels hide a lantern worth finding.

## Controls

| Action | Keys |
|---|---|
| Move | Arrow keys or A and D |
| Jump | Space, Up or W |
| Record, stop | E |
| Pick an echo slot | 1 to 7 |
| Swap places with the picked echo (only on swap levels) | Q |
| Restart the attempt | R |
| Clear the picked echo | X |
| Hint | H |
| Fullscreen on or off | F (Play, Continue and Levels on the title screen also go fullscreen) |
| Pause | Esc or P |

Every key above can be changed in Settings, which also has music and effects volume, a screen-shake switch, and a
reset button that erases all saved times, stars, lanterns and settings.

## Checking the levels

`tests/index.html` runs, through the real game engine, small checks of each mechanic, a layout check on every
level, and a scripted solution for every level that must reach the exit (and pick up the level's lantern, if it
has one). `tests/shortcuts.html` makes sure no level can be won by a bot that only runs right and jumps. Open them
from a local web server. Adding or changing a level means writing or re-running its solution in `tests/solutions.js`.

`demos/` holds the three small mechanic demos the game grew out of.

## Privacy

Everything runs in your browser. The game makes no network requests and sends nothing anywhere. It keeps your
progress and settings in your browser's local storage.

## License

MIT, see `LICENSE`.
