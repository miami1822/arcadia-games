# Hollow Frontier 3D — Arcadia Beta v0.2.0

**Lucion Games / Lucion Entertainment** · November 23, 2026

An original self-contained **WebGL 3D browser survival game** with no external dependencies, no advertisements, and no third-party game assets. Play in Arcadia with `game.html?id=hollow-frontier`, in Arcadia School Edition with `school.html?game=hollow-frontier`, or on the dedicated immersive page `hollow-frontier-play.html`. WebGL is required. When unavailable, the screen offers the original 2D classic as a fallback.

## What's working

- Procedurally generated forest with hilly terrain, trees, mining resources, abandoned Meridian relay tower, and experimental Lumen expedition zone
- Third-person 3D explorer, first-person toggle, mouse-drag camera rotation, sprint and mobile movement controls
- Five-minute real-time day/night cycle, atmospheric fog, limited night creatures, local light sources, and occasional storms
- Survival meters for health, stamina and hunger; resource collecting; berry consumption; scanner crafting
- Placeable campfires, generators, extractors, floodlights, walls and beacons
- Generator fueling; working automated extractors producing stone and scrap; reactive lighting from powered lamps
- Cinematic-text opening and narrative chapter scenes, Meridian relay objective, expedition ruins and persistent Frontier Journal
- Three distinct free browser-local world slots; save-on-demand, autosave, classic 2D save migration; world backup export and import
- Separate mobile HUD with collapsible pack, touch buttons and fullscreen support
- Dedicated immersive browser page in addition to Arcadia's normal in-page player
- Basic synthesized atmospheric sound only after player enables audio

## Limitations (intentional beta scope)

This is the first **3D playable foundation**, not a finished full-scale game: the world is a finite local map, the character and creatures use stylized original low-poly placeholder geometry, and the main story is only an introductory narrative. Multiplayer, advanced creature AI, full cinematic animations, authored biomes, advanced automation/logistics, and cross-device cloud saves are not yet implemented. Saves stay in local browser storage and never sync with Roblox. Browser storage may be unavailable in private mode or some embedded site contexts. **Robux purchases are only planned for Roblox and are not enabled or offered in the browser version.**

## Controls

| Input | Function |
|---|---|
| WASD / arrows | Move |
| Shift | Sprint |
| Mouse drag / touch drag | Rotate third-person camera |
| V or View | Switch first/third person |
| E / Gather | Collect nearby resource, restore relay, or use nearby site |
| Space / Scan | Search nearby resources after crafting scanner |
| J / Journal | Review lore and export world backup |
| Select build, then click terrain | Place a structure near the player |
| Mobile PACK | Open crafting and inventory panel |
| Fullscreen icon | Expand the 3D game view |

## Arcadia integration

Copy these files into Arcadia's web root:

- `arcadia/hollow-frontier.js` — WebGL 3D game, native classic-script module consumed by Arcadia's built-in loader
- `arcadia/hollow-frontier-classic.js` — 2D fallback
- `arcadia/hollow-frontier-play.html` — dedicated immersive page

Keep catalog entry ID `hollow-frontier`, type `built-in`. Do not switch to an iframe or external game entry. `hollow-frontier.js` creates its own UI inside `#game-stage` and operates without network or assets. For local testing, serve files from a static file server, or open the preview HTML. Browser extension/script policies may affect `file://` behavior. The game should be published only after smoke testing on the target host.

## Verification

`tests/three_d_smoke.py` uses Playwright with Chromium and WebGL/SwiftShader. In a Linux test environment with software GPU blocked, run under Xvfb: `xvfb-run -a python tests/three_d_smoke.py`. The tests check rendering context creation, UI slots, initial lore, movement, structure placement, powered automation, expedition round trip, save/reload and mobile controls. Also manually test mobile hardware and keyboard/pointer behavior before declaring release-ready.

## Next milestones

v0.3: multiplayer design and security model, low-end-device performance budget, environmental audio expansion, authored puzzles and improved terrain/map streaming. v0.4: creatures' distinct behaviors, story-driven events, 3D cinematics, multiple biomes, stronger automation networks. v0.5: co-op persistence and sharing, content moderation, accessibility audit, performance and stability testing.

There are no external copyrighted assets, no payment API calls, no behavioral analytics and no third-party network requests in this browser edition.