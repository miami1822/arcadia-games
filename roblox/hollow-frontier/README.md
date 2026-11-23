# HOLLOW FRONTIER: FIRST LIGHT
### Lucion Games · Lucion Entertainment · Roblox Studio playable alpha source v0.2

**This is a buildable Roblox Studio project, not a published Roblox experience.** It is the first native Roblox vertical slice for Hollow Frontier. The Arcadia browser version remains separate and is not affected by installing this project.

## What works in source

- Server-generated 3D terrain/landmarks: Verdant Reach, Ashwood Expanse, Frostline Ridge, Mirewater Basin, Ironfall Works.
- Roblox's native, rigged and animated player avatars (R15 where enabled), standard camera-relative controls, default keyboard/gamepad/touch input.
- Persistent **three free worlds**, with up to three additional slot **pass placeholders** (`0`, disabled until configured).
- Server-controlled supplies: wood, stone, scrap, berries, Lumen. Resource prompts regrow each in-game day.
- Buildable shelter, campfire, generator, extractor, processor, floodlight, wall and wildlife habitat.
- Basic powered automation: fuel generator near base, extract resources periodically, process scrap into Lumen, toggle lamps.
- Five wildlife species with roaming/avoidance reactions; two eerie mechanical/forest entities with night activity. Scanning wildlife records it in the Field Journal.
- Procedural atmospheric lighting, day/night, starvation floor, opening arrival camera shot, Station Nine relay repair, Ashwood archive recording.
- Server-owned resources, range/recipe checks, simple action throttling, DataStore session lease, autosaves, quit saves and read-only v1 migration.
- Studio preview gracefully falls back to **temporary unsaved mode** if DataStore API access is unavailable. Public-server save failures never silently create a replacement profile.

## Open and play in Roblox Studio

1. Install the **Rojo** CLI and Studio plugin: <https://create.roblox.com/docs/projects/rojo>.
2. From this extracted directory, run `rojo build default.project.json -o HollowFrontier-FirstLight.rbxl`.
3. Open the generated `.rbxl` in **Roblox Studio**. Use **Play** to enter the lobby, choose a free slot, and enter your Frontier.
4. For persistent saves, **publish a private test experience**, then enable **Studio Access to API Services** only for that test experience in Game Settings → Security. Do not enable production data access for unreviewed experiments.
5. Use the E prompt near resources. Craft a Signal Scanner from the PACK menu, restore Meridian Station Nine with materials, then travel to the Ashwood Archive.
6. Test two Studio clients using **Test → Start** with multiple players; they will have separate world plots. Shared co-op settlements are **not** implemented yet.

## Controls

- WASD / left stick / touch thumbstick: move; mouse/right stick/touch swipe: camera.
- E / proximity action / touch interaction: gather, observe wildlife, restore relay.
- B: craft and build menu. J: field journal. R: save. UI buttons work for touch/gamepad navigation.
- Cutscenes: click NEXT or SKIP independently. Native Roblox avatar animation controls the player.

## Save and purchase safety

`src/server/ProfileStore.luau` contains DataStore access and one-server leases. `Config.ExtraSlotPasses[4..6]` are all `0` (not for sale). If the Roblox game later uses game passes, create three *distinct* passes in the Creator Dashboard and enter their real IDs, with a price/region/legal review before publishing. There is no live purchase or real-money integration in this source.

Existing **Roblox v0.1** world data is read-only migrated when available. Arcadia/browser local saves cannot be imported directly and are not advertised as shared progression. World structures survive reopening; independent world plots are generated per server session rather than persistent spatial server instances.

## Art, licensing, and performance

The base art is generated from Roblox primitives and original code. Roblox provides native avatars and core character animations; no third-party model licenses are required for this build. The fully rigged WebGL GLB from Arcadia is *not* imported here. Every generated player world creates a few hundred Parts: benchmark on real devices before public release. StreamingEnabled is enabled in `default.project.json`; the first build does **not** yet use region chunking or mesh LOD.

## Honest limitations

This source has passed **static structural tests only**; it has not yet been executed inside Roblox Studio in this environment. Real multiplayer invites, owner permissions, enemy navigation/pathfinding, cinematic voice/audio, custom rigged character outfits, full campaign endings, paid passes, a shared cross-platform account, monetization and public Roblox deployment are future milestones. The day/night sky is server-wide while each world has its own persisted day counter.

## Files

- `default.project.json` — Rojo mapping
- `src/shared/` — config, lore, region math
- `src/server/` — save leases, world geometry, wildlife, server gameplay
- `src/client/` — world select, HUD, crafting, journal and 3D cinematic cameras
- `tests/check_project.py` — static integrity tests (run `python tests/check_project.py`)
- `docs/` — story and development milestones

© Lucion Games. Original code supplied for this project. Roblox and Roblox Studio are trademarks of their respective owner.