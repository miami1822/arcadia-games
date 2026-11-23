# Hollow Frontier — Wildlife & Rigging Beta v0.4

**Lucion Games · Arcadia Browser Edition**  
November 23, 2026

This is a playable 3D WebGL beta, not the completed open-world multiplayer game. This version preserves Arcadia's existing game-loader integration and the v0.3 browser save key (`hollow-frontier-worlds-3d-v2`).

## Gameplay additions

- **Real pre-rigged character pipeline.** The game now loads a third-party, pre-rigged glTF 2.0 humanoid with actual skin joints and keyframe animation. Its CPU-skinned geometry is drawn through Hollow Frontier's custom WebGL renderer. The model is hosted by Arcadia at `assets/hollow-frontier-scout.glb`. On file:// standalone previews, it is loaded from the corresponding public GitHub-hosted asset URL. An original articulated explorer is displayed if the model cannot be loaded.
- **Character gyro / orientation.** Smooth camera-relative turn orientation and an optional sensor-based camera gyro. Select `GYRO OFF` or press `G`. Sensor access is requested only after a player action on supporting devices; mouse and touch work without it. The gyro state resets when leaving a world.
- **Wildlife ecosystem.** Five animated species: Frostwood deer, Ashwood fox, Meadow hare, Quarry boar, and Night owl. Each has lightweight roaming, grazing, avoidance, habitat attraction, and biome/day-night behavior. Animals do not use combat behaviors.
- **Wildlife Field Guide.** Scan with a crafted Signal Scanner to record species. First discovery of a species earns a small scrap reward. The guide persists per world.
- **Wildlife Habitat.** New craftable settlement structure. Attracts nearby wildlife and has its own visible 3D structure.
- **Expanded mysterious mobs.** The Hollow and Mireling appear in addition to Watchers, Remnants, and Wisps. More variation by biome and night encounters, including distinct silhouettes, movements and light-response behavior.
- **Preserved campaign and automation.** Five regions, Meridian Signal chapters and story choices, generators, extractors, player-built settlements, expeditions, backup import/export and classic 2D save migration remain available.

## Source and credits

Pre-rigged scout model: **CesiumMan**, © Cesium, made available in KhronosGroup's glTF Sample Assets. Model license: **Creative Commons Attribution 4.0 International (CC BY 4.0)**. Source: https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/CesiumMan . License: https://github.com/KhronosGroup/glTF-Sample-Assets/blob/main/Models/CesiumMan/LICENSE.md . **The original model contains a Cesium branding texture, which this beta renderer intentionally does not render.** Cesium is not affiliated with Lucion Games. Replace any trademarks or brand-associated source assets with an original character before commercial release.

Remaining wildlife and creatures, survival systems, code and field-guide rendering are original prototypes authored for Lucion Games. The test-only synthetic rig included in `tests/` is for automated loading checks, not a production avatar.

## Performance and compatibility

The beta uses WebGL 1 with CPU skinning for one player character. High-quality mode is intended for hardware-accelerated browsers; use **ECO** on weaker Chromebooks and phones. Software-only WebGL tests render slowly. Experimental browser device gyroscope controls need explicit permission on eligible devices and have not been verified on physical iOS/Android devices.

**Offline behavior:** The base game runs without third-party network resources. The optional pre-rigged character needs `assets/hollow-frontier-scout.glb` beside the hosted game or network access to the GitHub asset when opening the standalone HTML directly. The fallback explorer is always available.

**Save behavior:** Three independent free browser-local worlds. There is no cross-device sync, paid browser slot system, multiplayer server or Roblox publishing workflow in this beta. The Roblox source is separate and is not automatically updated by this browser-only release.

## Verification

- `node --check hollow-frontier.js`: JavaScript syntax.
- `tests/v04_smoke.py` run under headed Chromium + Xvfb + SwiftShader: existing movement, automation, expeditions and mobile touch controls.
- `tests/v04_features_smoke.py`: skinning parser with an instrumented tiny glTF 2.0 test rig, five animal types, research journal, habitat persistence, gyro fallback.
- `tests/v04_save_migration.py`: non-destructive classic 2D-to-3D import and export/restore into a second world.
- `tests/v04_story_perf.py`: Meridian relay → Ashwood Archive → Frostline Observatory → Ironfall Vault → ending choice, survives reload. Software raster rendering averaged ~8 FPS in that local QA environment; do not extrapolate real-device FPS.

**Not yet verified:** Actual Khronos/CesiumMan render on real player devices; browser sensor gyro across physical phones; production hosting and CDN cache propagation; full multiplayer; complete animation and creature behavior polish.