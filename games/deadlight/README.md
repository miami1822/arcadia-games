# Deadlight v1.0.0
Static browser game (Three.js bundled locally, no external requests).
## Run / deploy
Upload this folder's contents as a static site (`index.html` is the entry). Do not open via `file://`; use any static server, e.g. `python3 -m http.server`.
## Source
`src/main.js` (game), `src/arcadia.js` (integration adapter, placeholders only: no official Arcadia API was provided). Rebuild: `npm i three esbuild` then `npx esbuild src/main.js --bundle --minify --format=esm --outfile=dist/game.js`.
## Saves
localStorage key `deadlight.save.v1` (level reached, best times, Nightmare unlock, graphics).
## Future ideas
Hiding spots, more enemy types, daily seeds, leaderboards and cloud saves via the Arcadia adapter, more levels, settings for mouse sensitivity.
