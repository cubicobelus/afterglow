# Afterglow

A puzzle platformer in your browser. You are a wick-spirit climbing a drowned lighthouse to relight its lamp,
and the only help you have is your own past: record a run, and it comes back as an **echo** that replays
your path and then holds the spot where you stopped. Echoes press plates, carry light, melt crystal and bend
gravity. Plain HTML and JavaScript on a canvas, no build step, no dependencies. Every picture and sound is
drawn or synthesized in code.

## Play

**[▶ Play in your browser](https://cubicobelus.github.io/afterglow/)**: nothing to download or install.

To run it offline, download the repo and open `index.html` from a local web server (for example
`python -m http.server` in the folder). Progress is saved in your browser only.

## How it works

Press **E** to start recording and **E** again to stop. You go back to the start and your echo walks the path you
just took, then stays wherever you stopped, even in mid-jump, so a frozen jump makes a stepping stone in the
air. Each kind of echo has its own power, and you only get one of each kind at a time.

| Echo | What it does |
|---|---|
| Shade | Holds down plates, and you can stand on it. |
| Glow | Carries light. Dark planks hold only where light touches them, and thorns wither in it. |
| Phase | Crystal fades away around it. |
| Flip | Reverses gravity in a zone around it, so you can fall upward and walk on ceilings. |

Echoes switch on once they come to rest. In the last chapter you can press **Q** to trade places with an echo.

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
| Pause | Esc or P |

## Checking the levels

`tests/index.html` runs a scripted solution for every level through the real game engine, plus a layout check on
each level. Open it from a local web server. Adding or changing a level means writing or re-running its solution
in `tests/solutions.js`.

`demos/` holds the three small mechanic demos the game grew out of.

## Privacy

Everything runs in your browser. The game makes no network requests and sends nothing anywhere. It keeps your
progress and settings in your browser's local storage.

## License

MIT, see `LICENSE`.
