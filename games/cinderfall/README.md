# Cinderfall v1.0.0
Static browser game: plain HTML, CSS and ES modules. No dependencies, no build step, no external requests.
## Run / deploy
Upload the folder as a static site (`index.html` is the entry). Do not open via `file://`; use any static server, e.g. `python3 -m http.server`.
## Source
`src/main.js` (game), `src/arcadia.js` (integration adapter, placeholders only: no official Arcadia API was provided).
## Saves
localStorage key `cinderfall.save.v1` (embers, Forge upgrades, best time, wins, graphics).
## Future ideas
Boss waves, more weapons and enemy types, daily seeds, achievements and leaderboards via the Arcadia adapter, multiple save slots, volume settings.
