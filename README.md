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
You can have one echo of each kind at a time, and an echo's power switches on once it comes to rest.

The game has 37 levels in four tiers, each with its own scenery. A tier teaches one echo in three levels, then the
next echo in three more, then mixes them.

| Echo | What it does |
|---|---|
| Shade | Holds down plates, and you can stand on it. |
| Glow | Carries light. Dark planks and light gates hold in it, light sensors fire, and thorns wither. |
| Phase | Crystal fades away around it. |
| Flip | Reverses gravity in a zone around it, so you can fall upward and walk on ceilings. |
| Tide | Replays its path back and forth forever, waiting where you waited. Ride it like a ferry or a lift. |
| Spring | Bounces you high when you land on it. Hold jump for a bigger bounce. |
| Gust | Blows a wind the way it was facing, which carries a jump much farther. |

Late in the game you can also press **Q** to **swap** places with an echo.

Every level also scores up to three stars: finishing it, beating its par time, and using no more recordings than
its par. A few levels hide a lantern worth finding.

## Controls

| Action | Keys |
|---|---|
| Move | Arrow keys or A and D |
| Jump | Space, Up or W |
| Record, stop | E |
| Pick an echo kind | 1 to 4 |
| Swap places with the picked echo (late game) | Q |
| Restart the attempt | R |
| Clear the picked echo | X |
| Hint | H |
| Fullscreen on or off | F (Play, Continue and Levels on the title screen also go fullscreen) |
| Pause | Esc or P |

Every key above can be changed in Settings, which also has music and effects volume and a screen-shake switch.

## Checking the levels

`tests/index.html` runs, through the real game engine, small checks of each mechanic, a layout check on every
level, and a scripted solution for every level that must reach the exit (and pick up the level's lantern, if it
has one). Open it from a local web server. Adding or changing a level means writing or re-running its solution in
`tests/solutions.js`.

`demos/` holds the three small mechanic demos the game grew out of.

## Privacy

Everything runs in your browser. The game makes no network requests and sends nothing anywhere. It keeps your
progress and settings in your browser's local storage.

## License

MIT, see `LICENSE`.
