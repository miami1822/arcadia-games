# Vesper // Signal Run

Arcadia original game · v1.0.0 · November 23, 2026

**Catalog description:** Pilot a salvage craft through three abandoned frontier outposts. Recover scattered signals, dodge sentry drones, unleash an energy pulse, choose upgrades, and race for the extraction gate. Every short run is a chance to beat your best score.

## Play and deploy

The ZIP is a complete static website. Upload its *contents* to a static host with `index.html` at the site root and preserve the `src/`, `vendor/`, and `assets/` directories. No build step, account, external API, or runtime CDN is required. Modules and GLB models must be served via HTTP(S); opening `index.html` as `file://` is not supported by browsers. For local development, run `python3 -m http.server 8000` in this folder and open http://localhost:8000.

For Arcadia, publish the folder as an independent static game URL; embed it in an iframe with fullscreen permission (`allowfullscreen` and `allow="fullscreen"`) if the platform uses iframe hosting. The game uses its own fullscreen button in the pause menu. Saving uses the browser's localStorage, so saves are tied to the game URL and browser.

## Controls

| Action | Desktop | Touch |
| --- | --- | --- |
| Move | WASD or arrows | Left virtual stick |
| Boost | Space or Shift | BOOST |
| Pulse (costs 24 energy) | F or click gameplay | PULSE |
| Pause | P, Esc, or HUD pause button | HUD pause button |
| Fullscreen | Pause menu | Pause menu |

Collect all signal fragments in a sector and pass through the gate in the north. Pulse disables nearby drones; each sentry takes two pulses. Repair and energy cells provide recovery. Pick an upgrade after the first and second sector. The run ends on hull depletion or after all three gates. Best score and completed runs persist locally.

## Architecture

`src/main.js` handles input, UI, combat, sound synthesis, frame timing and flow. `src/world.js` constructs the procedural world and loads embedded GLB models. `src/state.js` defines sectors, save data and a deliberately inert Arcadia integration adapter. There are **no working Arcadia platform API calls**. When an official specification exists, replace the adapter methods after confirming the expected score, achievement and save contracts.

The procedural terrain, lighting, particles, pickup meshes, gate effects, HUD, UI, ship accent parts, and title design are original. Eight selected GLB space models originate with Kenney's Space Kit (CC0). Three.js v0.181.0 is bundled under the MIT license. Exact origins and licenses are recorded in `CREDITS.md`. No external requests are made during gameplay.

## Performance and browser notes

Adaptive resolution lowers pixel density on consistently slow hardware. A manual quality setting is in the pause menu. Rendering runs when the page is visible; gameplay pauses if the tab loses focus. Touch controls appear on coarse-pointer devices. WebGL is required. Sound is synthesized after player interaction and can be disabled.

## Changelog

- **1.0.0**: First playable release: three sectors, enemy patrol and projectiles, movement, boost, pulse, pickups, gates, scoring, upgrade choices, checkpoints, touch support, pause, fullscreen, local save, adaptive resolution and custom menus.

## Future expansion

More route layouts, enemy behaviors, ship configurations, collectible lore, music and verified platform achievements/leaderboards are good next additions. Browser-based device testing across actual Chromebook and mobile hardware is recommended before a wider launch.
