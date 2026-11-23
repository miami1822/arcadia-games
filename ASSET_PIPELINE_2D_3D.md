# Arcadia Creator — 2D & 3D Asset Workflow

Arcadia Creator's asset library now supports **real imported 2D images, sprite sheets, and self-contained 3D GLB models**. Both work without developer accounts. This is a local-first asset workflow; importing a GLB does **not** make it a playable 3D character.

## 2D assets (playable in Visual Builder)

The Asset Library offers **22 original sprites** and links to officially published CC0 game packs. Select an object in Visual Builder, then choose an original or imported sprite via **Asset Library → Use on object**. The image replaces the object's rectangle in both the level editor and the 2D game preview.

### 2D Sprite Sheet Cutter

1. Open a project and select **Asset Library**.
2. In **2D Sprite Sheet Cutter**, choose a PNG, JPEG or WebP atlas.
3. Set frame width, height and number of frames, then click **Slice & Import Frames**.
4. Open **My imports**, select a scene object in Visual Builder and apply a generated frame.

The cutter reads a regular frame grid in row-major order (left-to-right, top-to-bottom). It supports 8–512 px frames, up to 16 frames per operation, and up to 2 MB input sheets (max 4096 × 4096 pixels). It currently does not parse TexturePacker metadata, transparent trim rectangles, animation timelines, rotation flags, padding or tile spacing.

A cut frame becomes a real PNG under `sprites/<sheet>-frame-XX.png`, stored in the current project and available in game preview and export. Frame animation authoring is a future feature; a cut frame is currently a static sprite.

## 3D models (inspect, import, export)

Open **3D Models** in Game Studio or select **Explore 3D models** from the Creator Hub.

The original 3D starter kit includes eight dynamically generated glTF 2.0 GLB models:

| Model | Intended use |
|---|---|
| Cargo Crate | Environment prop |
| Low-poly Tree | Outdoor environment |
| Energy Crystal | Collectible or decoration |
| Floating Platform | Level geometry |
| Friendly Bot | Character reference |
| Rock Formation | Natural environment |
| Observation Tower | Buildings |
| Scout Ship | Vehicle prop |

Click **Preview** to inspect a model, **Add GLB** to save its binary file to your game, or **Download selected GLB** to download it separately. The preview uses Google's [model-viewer](https://modelviewer.dev/) 4.4.0 component, pinned by version and loaded over the internet. It supports orbit and zoom.

### Importing external 3D assets

- Import one `.glb` (up to **1.25 MB**) with **Import GLB**.
- Import multiple matching small GLB files from a ZIP (ZIP up to 5 MB) with **Import 3D ZIP** and the optional filename filter.
- The inspector checks the GLB magic/header, version, binary chunk bounds, mesh/node counts, embedded textures, external references and required extensions.
- Only self-contained, uncompressed glTF 2.0 GLB files with embedded PNG, JPEG or WebP textures are supported. Models requiring external paths, Draco/Meshopt/KTX decoders or separate `.bin` files must first be converted into a compatible standalone GLB.
- Save licenses and credits when importing third-party packs. A model being free to download does not establish publishing rights.

**External sources:**

- [Kenney Nature Kit](https://kenney.nl/assets/nature-kit) (CC0)
- [Kenney Platformer Kit](https://kenney.nl/assets/platformer-kit) (CC0)
- [Kenney Space Kit](https://kenney.nl/assets/space-kit) (CC0)
- [Kenney Modular Space Kit](https://kenney.nl/assets/modular-space-kit) (CC0)
- [Kenney City Kit (Commercial)](https://kenney.nl/assets/city-kit-commercial) (CC0)
- [Poly Haven 3D Models](https://polyhaven.com/models) (CC0)
- [ambientCG](https://ambientcg.com/) (CC0 materials)
- [Quaternius](https://quaternius.com/) (check the precise downloaded pack terms)

## Export behavior

Select **Export ZIP** in Creator:

- 2D games retain playable sprite sheets/individual sprite images and audio in the current 2D runtime.
- 3D models are included as individual files under `models/*.glb`.
- When a game contains GLB assets, it also includes `arcadia-3d-assets.json` listing the model paths and clearly stating that a 3D gameplay engine is not included.
- `arcadia-release.json` and `ASSET-CREDITS.txt` record the source and declared license of imported assets for reviewer verification.
- A visual game exports as a **2D playable HTML game**, even if 3D models are attached in the library. The 3D files are packaged for future or custom 3D engine development.

The current editor maintains up to 32 local assets per project. Browser localStorage has strict size limits; keep ZIP backups and favor smaller assets. The public anonymous submission API, when configured, has a separate 2 MB ZIP limit; larger games may require another upload flow.

## Technical boundaries and security

- The existing 2D Playtest stays sandboxed without same-origin privileges. The 3D model inspector is part of the Creator interface, not a way to run uploaded game code.
- The 3D viewer requires WebGL and the external, pinned `model-viewer` component. If the script is blocked, the 3D inspector may not display; imported files and exported files remain independent of that preview.
- GLB validation reduces simple format and remote-resource risks but does not replace malware scanning, moderation, or independent browser security testing.
- A real 3D world editor, object placement, rigging, animations, gameplay controls, collisions and 3D physics are **not implemented** in this asset milestone. The next engineering milestone is a 3D game runtime.

Additional licensing and audio sources are documented in [ASSET_SOURCES.md](ASSET_SOURCES.md). Implementation details and other constraints are in [CREATOR.md](CREATOR.md).
