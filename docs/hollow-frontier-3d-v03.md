# Hollow Frontier: The Meridian Signal — 3D Browser Beta v0.3.0

**Lucion Games / Lucion Entertainment** · November 23, 2026

A playable, original 3D browser survival game built for Arcadia's existing built-in game loader. The browser build is self-contained WebGL 1 with no runtime engine or third-party asset downloads. This is an expanded beta—not a finished AAA-style open-world multiplayer game.

## Changes from v0.2

- **Expanded wilderness:** an approximately 610 × 610 world-coordinate area compared with the previous ~224 × 224 playable map. Different terrain and vegetation styles define Emerald Wilds, Ashwood Expanse, Lumen Marsh, Ironfall Quarry, and Frostline Ridge.
- **Explorable landmarks:** Meridian Relay, the lost Ashwood Archive, Frostline Observatory, Ironfall Vault, and the separate Lumen expedition location.
- **Graphical upgrades:** independently drawn sky gradient with moon/stars and sunrise/sunset effects; improved shader lighting, material color variation and fog; layered tree models and broadleaf variations; dynamic shadow patches; improved explorer model and shorter third-person camera.
- **Real 3D cinematics:** story cameras now fly around landmarks while subtitles/dialogue play, with scene navigation and skip controls. Characters include Kade Vale, Dr. Mara Voss and Echo Seven.
- **Campaign chapters:** The Arrival → The First Signal → Ashwood Archive → Frostline Observatory → Ironfall Vault. The final chapter allows the player to **Contain** or **Listen** to the network. The choice persists per save slot.
- **Creatures and machinery:** Watchers, Remnants and Wisps now have different 3D shapes and behaviors. Generators and collectors receive simple looping 3D animations.
- **Field map and HUD:** hide/show map with `M` or MAP, open crafting with PACK, graphics quality toggle (HQ / ECO), and a more cinematic unobstructed default game view.
- **Performance:** independent static-world mesh chunks with distance/frustum-ish culling, and optional lower-resolution ECO mode. Sustained slow frame rates automatically enable ECO if HQ was not manually selected. Hardware-accelerated browsers strongly recommended.
- **Audio:** optional original synthesized low-key wind/hum environment and feedback tones. The game is silent until audio is enabled.
- **Save compatibility:** existing `hollow-frontier-worlds-3d-v2` local save key and JSON backup format remain supported; classic 2D imports remain non-destructive. Three free browser-local worlds. No Robux in the browser.

## Controls

| Input | Action |
|---|---|
| W, A, S, D / arrows | Walk |
| Shift | Sprint |
| Drag mouse / swipe | Orbit camera |
| V / VIEW | Toggle first-/third-person |
| E / GATHER | Collect resources or interact with landmarks |
| Space / SCAN | Use crafted Signal Scanner |
| J | Frontier Journal, export backup |
| M / MAP | Show or hide field map |
| PACK | Craft and place machines |
| HQ / ECO | Choose graphics quality |
| Fullscreen button | Expand the game stage |

## Files to deploy in the Arcadia web root

- `arcadia/hollow-frontier.js`: improved 3D browser game (same catalog ID / built-in script filename).
- `arcadia/hollow-frontier-classic.js`: original 2D fallback; do not delete.
- `arcadia/hollow-frontier-play.html`: dedicated full-viewport page.
- `arcadia/assets/hollow-frontier-cover.webp`: original screenshot art provided separately for site reuse (game itself embeds the image, so it is optional at runtime).
- `arcadia/preview-3d.html`: local preview scaffold.

The main Arcadia catalog entry should remain `id: hollow-frontier`, `type: built-in`. Avoid switching to untrusted iframe embeds. The existing Arcadia fullscreen controls continue to work on the main player; dedicated `hollow-frontier-play.html` offers a more spacious layout.

## Tested

From the project root, run under a software-enabled Xvfb Chromium environment if needed:

```bash
xvfb-run -a python tests/three_d_smoke.py
xvfb-run -a python tests/three_d_save_migration.py
xvfb-run -a python tests/v03_story_perf.py
```

The scripted checks cover WebGL startup, movement, constructing and fueling machines, automated resource production, entering/leaving the Lumen expedition, local save/load, legacy 2D data migration, story objective progression, separate story choices, and desktop/mobile UI. The scripted visual test also captures a 3D cinematic screenshot.

## Caveats and upcoming work

This build uses stylized procedural geometry, **not photoreal assets**. Its 3D cutscenes use animated cameras and dialogue over the live game world, **not full character lip-sync/performance capture**. The map does not stream infinite terrain: all five regions share a finite world, with static mesh chunk culling. Multiplayer, cloud saves, full NPC dialogue and behavior, vehicles, complex logistics and large-scale quest systems remain future work. Performance testing on actual gaming PCs, school laptops, phones and tablets is still required; software WebGL Chromium can have low frame rates even with ECO selected.

There are no ads, analytics, age-restricted purchase prompts, remote asset requests, copyrighted third-party models, or payment API calls in this browser build. Do not represent source commits as a confirmed live deployment until hosting has been checked.