# Quiet Street v1.0.0
Static browser game (Three.js bundled locally into `dist/game.js`, no external requests).
## Run / deploy
Upload this folder as a static site (`index.html` is the entry). Do not open via `file://`; use any static server, e.g. `python3 -m http.server`.
## Source
`src/main.js` (game, including the house map and neighbor AI), `src/arcadia.js` (integration adapter, placeholders only: no official Arcadia API was provided).
Rebuild: `npm i three esbuild` then `npx esbuild src/main.js --bundle --minify --format=esm --outfile=dist/game.js`.
## Neighbor AI
States: patrol, investigate (noise), chase (sight), search. Heat map of tiles you visit is saved across attempts; he biases patrols toward them, places up to 3+act traps on them, and checks wardrobes more often the more you hide.
## Saves
localStorage key `quietstreet.save.v1` (act reached, learned heat map, hide count, graphics).
## Future ideas
More houses, upstairs, cameras and locked windows, more item puzzles, difficulty modes, leaderboards and achievements via the Arcadia adapter.
