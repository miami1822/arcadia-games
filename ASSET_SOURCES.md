# Arcadia Creator — Free Asset and Audio Sources

These are **creator-facing source links**, not hidden copies or automatically downloaded bundles. Arcadia Creator includes a library of 22 original SVG sprites and **13 generated original audio tracks and sound effects** that can be immediately added to a project. Packs from the websites below can be downloaded at their original source and imported using **Asset Library → Import ZIP Pack** or **Sound & Music Studio → Import Audio ZIP**.

## Verified CC0 sources

| Source | Example packs | Typical content | Terms |
|---|---|---|---|
| [Kenney](https://kenney.nl/assets) | [UI Audio](https://kenney.nl/assets/ui-audio), [Interface Sounds](https://kenney.nl/assets/interface-sounds), [Music Jingles](https://kenney.nl/assets/music-jingles), [Sci-fi Sounds](https://kenney.nl/assets/sci-fi-sounds), [Music Loops](https://kenney.nl/assets/music-loops) | Browser-game SFX, stingers, UI feedback, short music and 2D assets | The cited pack pages identify Creative Commons CC0; check individual pack before publishing |
| [Poly Haven](https://polyhaven.com/) | [Textures](https://polyhaven.com/textures), [3D models](https://polyhaven.com/models), [HDRIs](https://polyhaven.com/hdris) | Realistic 3D art and texture reference resources | [Official CC0 license](https://polyhaven.com/license); current Creator scene editor is 2D |
| [ambientCG](https://ambientcg.com/) | Concrete, rock, wood, foliage and environmental materials | PBR textures, HDRIs, and 3D materials | [Official CC0 license](https://ambientcg.com/) |
| [OpenGameArt](https://opengameart.org/) | [12 Music Loops](https://opengameart.org/content/12-music-loops), [Short Loops Background Music Pack](https://opengameart.org/content/short-loops-background-music-pack) | CC0-labeled looping music packs | **Each asset page has its own license**; the two linked packs state CC0 |

## Sources requiring per-item license review

- [Freesound](https://freesound.org/search/?q=game) features CC0, CC BY, and other licenses. Check the actual audio page; CC BY may require attribution. For straightforward commercial use, search specifically for CC0 sounds; do not assume every result is public domain. [Freesound official FAQ](https://freesound.org/help/faq/).
- [OpenGameArt](https://opengameart.org/) hosts materials with different licenses. Look for explicitly CC0-labelled works, or save the creator's exact attribution requirements for CC BY content.
- [itch.io game assets](https://itch.io/game-assets) have per-creator terms. Some assets are free to download but have restrictions for redistribution or commercial games.

Only download packs through legitimate creator-hosted download pages. Arcadia Creator does **not** scrape these sites, host their galleries, bypass their download controls, or claim every external work is CC0.

## Original audio ready to use inside Creator

The Sound & Music Studio includes original waveform-generated WAV files:

| Category | Included sounds |
|---|---|
| Feedback and UI | Crystal Coin, Menu Click, UI Confirm, UI Error |
| Gameplay | Soft Jump, Gentle Bump, Power Up, Portal Hum, Footstep, Level Complete |
| Short music loops | Arcade Pulse, Calm Circuit, Mystery Lights |

Select **Preview** to hear a sample, then **Add to game**. This generates a short WAV locally and stores it under `audio/arcadia-<name>.wav`. These original sounds can be used inside Arcadia projects without outside attribution.

To play them from Block Studio, use the **Sound → Play Audio Asset** block and enter the local audio path (example: `audio/arcadia-coin.wav`). The **Loop Music Asset** block takes a similar path (example: `audio/arcadia-ambient-pulse.wav`), and **Stop Background Music** stops looping music. Imported audio works the same way.

Browsers may block autoplay until the player interacts with the game. Start music after a keypress or interaction, rather than assuming music will start immediately on page load.

## Imports, packaging and rights

- The current local alpha accepts PNG, JPEG, GIF, WebP, WAV, MP3, OGG, and small standalone 3D GLB files. The 2D Sprite Sheet Cutter converts PNG/JPEG/WebP sheets into individual frames. Choose small files for browser storage.
- Image imports: up to 350 KB each. Audio imports: up to 350 KB each. Total local asset limit: 32 resources per project.
- ZIP imports scan filenames and sizes and import up to a subset of images/sounds. Use the filename filter to choose from large source packs; no drag-and-drop of complete 1 GB packs is supported yet.
- `arcadia-release.json` contains per-asset `source` and `license` metadata; exported ZIP games also include `ASSET-CREDITS.txt`.
- A note like *verify license* is a reminder, **not** proof that an asset is licensed. Review original source metadata and honor attribution requirements before publication.
- 3D packs are links for research and future 3D tooling. The 3D Model Arsenal now imports and previews compact self-contained GLB files, then exports those models in release ZIPs. The playable Visual Builder still runs 2D scenes and does not position, rig or animate 3D meshes.

## Verified reference sources (November 2026)

- Kenney UI Audio / Sci-fi Sounds / Music Jingles pack pages show Creative Commons CC0.
- Poly Haven's [official license](https://polyhaven.com/license) declares assets CC0.
- ambientCG's [official homepage](https://ambientcg.com/) declares assets CC0.
- Freesound's [official FAQ](https://freesound.org/help/faq/) explains multiple sound licenses.

Sources may update licensing or file offerings. Confirm terms at download time; this document does not grant rights to files hosted by others.

## New 3D Model Arsenal

Eight original downloadable GLB models are now built into Creator, with a live orbit/zoom WebGL model inspector and a filtered external-GLB ZIP importer. Individual GLB files are capped at 1.25 MB. The 3D source browser links to [Kenney Nature Kit](https://kenney.nl/assets/nature-kit), [Kenney Platformer Kit](https://kenney.nl/assets/platformer-kit), [Kenney Space Kit](https://kenney.nl/assets/space-kit), [Kenney City Kit Commercial](https://kenney.nl/assets/city-kit-commercial), [Poly Haven Models](https://polyhaven.com/models), and other original source sites. Quaternius downloads require checking their individual pack terms.

[Detailed 2D and 3D asset workflow](ASSET_PIPELINE_2D_3D.md).
