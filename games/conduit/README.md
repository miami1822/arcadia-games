# Conduit v1.0.0
Static browser game: plain HTML, CSS and ES modules. No dependencies, no build step, no external requests.
## Run / deploy
Upload the folder as a static site (`index.html` is the entry). Do not open via `file://`; use any static server, e.g. `python3 -m http.server`.
## How levels work
Each puzzle is a random spanning tree of wires that is then scrambled, so every level is solvable. Levels use fixed seeds; the daily puzzle seeds from the UTC date. Par is the minimum clockwise turns that restore the original tree.
## Source
`src/main.js` (game), `src/arcadia.js` (integration adapter, placeholders only: no official Arcadia API was provided).
## Saves
localStorage key `conduit.save.v1` (stars per level, daily results, sound).
## Future ideas
Locked tiles, wrap-around edges, timed mode, hints, leaderboards and achievements via the Arcadia adapter, themes.
