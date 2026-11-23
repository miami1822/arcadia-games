# Arcadia — browser game site

An original, responsive arcade starter with 14 playable games, searchable catalog, favorites, and a local visual catalog editor. No third-party game assets or embeds included.

## Preview locally

Run `python -m http.server 8000` from this folder and open `http://localhost:8000`. Opening `index.html` directly as a `file://` URL won't load the JSON catalog in most browsers.

## Publish on GitHub Pages

This repository is ready for GitHub Pages (static files from the main branch).

Open https://github.com/miami1822/arcadia-games/settings/pages and select **Deploy from a branch**, branch **main**, folder **/(root)**, then **Save**. GitHub Pages must show a successful deployment before the published site can be treated as live.

See [GITHUB_PAGES.md](GITHUB_PAGES.md) for expected URLs, a step-by-step guide, and safety limitations.

The Arcadia staff publishes reviewed games by committing files and updating catalog.json. Edits in admin.html are local until committed.

## Important limitations

- The `admin.html` catalog editor uses localStorage, **not** server-side authentication or a database. Changes are local to the browser until committed. Anyone visiting the page can edit their own local copy, but not the published catalog.
- New built-in games require a corresponding JavaScript module under `games/`. Other games can be linked by HTTPS iframe when the game's publisher permits embedding; some hosts prohibit iframe embeds.
- Favorites and high scores are local to the player's browser.
- Do not host copyrighted games without proper permission. School network restrictions and acceptable-use policies still apply; this project does not bypass filtering.
- This is a static-host starter. Arcadia Creator deliberately requires no developer accounts. Public games still require manual maintainer review and GitHub commits.

## File layout

- `catalog.json`: published catalog
- `index.html`: searchable homepage
- `game.html`: playable game view
- `admin.html`: local catalog editor
- `assets/`: CSS, catalog/home/editor/player scripts
- `games/`: four standalone original games
- `creator.html` and `assets/creator.*`: Creator alpha (no developer accounts)
- `sdk/`: Arcadia Game SDK v0.1.0 (browser-local saves, scores, achievements, sessions; same-origin iframe host adapter)

## License

Project source is supplied for your use and customization. No external game content is included.


## Two editions, one catalog (v0.2)

- `index.html` is the primary browser arcade. `plus.html` is a **coming-soon concept**, not a functioning billing or subscription system.
- `school.html` is the lightweight school-friendly edition, sharing the same `catalog.json` as the main site. It has no network-filter bypassing and no tracking or ads.
- To create the Google Sites companion: publish this site to HTTPS first. In the Google Sites editor, choose **Insert → Embed → URL**, enter the published absolute URL of `/school.html`, adjust the iframe size, and publish the Google Site. If your Google Workspace administrator blocks embedding or access to the host, follow that policy. The Google Site itself must be manually created/published with an authorized account.
- To add a new original built-in game, add `games/<id>.js` and a matching `catalog.json` entry. More thorough browser/gameplay tests are still needed before public releases.
- `assets/player.js` now supports additional built-in JavaScript game files referenced by a validated catalog ID. Code review is essential because game scripts run on your site.
- Changes to the catalog should be reviewed before a maintainer commits them. The Google Sites embed automatically reflects changes on the hosted `school.html`, subject to normal caching. It does **not** automatically create/update native Google Sites pages.

## Revenue plan (not yet active)

Keep the school edition free; do not depend on Google Sites for AdSense, because Google Sites does not offer a reliable native AdSense integration. If ads are pursued, they should be on a separately hosted, eligible, approved website, subject to ad placement/privacy/child-directed audience requirements. AdSense's publisher must be 18+ or a parent/guardian can apply on their own account. Do not deploy ads without approval and a privacy/legal review. `plus.html` intentionally does **not** collect payment or simulate a real checkout. Premium should focus on cosmetic customization and convenience while core gameplay stays free. Adult-managed payment onboarding may be required for minors.

## Weekly game drops

A ChatGPT weekly task has been scheduled separately. Its success in editing a live repository depends on available access at the time of each run. This package does not itself automatically generate new games. Do not assume scheduled creation equals confirmed live deployment.


## Arcadia Creator alpha (November 2026)

Arcadia Creator is an **account-free**, local-first tool at `creator.html`. It provides a responsive dashboard, playable 2D Visual Builder, HTML/CSS/JavaScript Code Studio, sandboxed playtest, small HTML/ZIP import and ZIP export.

Creators need no sign-in or developer accounts. Drafts are stored in the current browser, not GitHub. Export backups. Arcadia staff manually review game packages before publishing them to the game catalog.

GitHub Pages is the preferred hosting target. After it is enabled, the expected Creator URL is https://miami1822.github.io/arcadia-games/creator.html. The previous Render static site can stay available until Pages is confirmed live.

See [CREATOR.md](CREATOR.md) and [GITHUB_PAGES.md](GITHUB_PAGES.md) for the details.


## Arcadia Game SDK v0.1.0

The uploaded Arcadia Game SDK is integrated at [`sdk/`](sdk/README.md) and requires no developer accounts. The Main Edition and School Edition initialize `window.arcadiaGame` for reviewed built-in games, and **Neon Snake** records scores and unlocks achievements through it.

Try [`sdk/example.html`](sdk/example.html) for a standalone demo or [`sdk/host-demo.html`](sdk/host-demo.html) for the trusted iframe host adapter. Local saves and scores remain on the current browser/device; there are no online leaderboards, cloud saves or automatic anonymous publishing APIs. Hosted/external games are not automatically granted host access.


## Advanced Creator: Blocks, sprites and publishing intake

Arcadia Creator now includes an advanced Blockly-based Block Studio with **25 custom game blocks** plus built-in control, logic, math, text and variable blocks. Visual games can be **converted one-way** into editable JavaScript in Code Studio. The sprite library includes 22 original starter assets and browsable links to Kenney CC0 packs and per-license community packs, along with filtered ZIP/image imports. All changes remain account-free during the editor alpha.

A gated **anonymous game review API** now exists under [`server/`](server/README.md), but **is not deployed or configured for public submissions**. The main website continues to export game ZIPs locally; enabling web uploads requires a durable database, CAPTCHA, approved moderation workflow and tests. Future optional Lucion Identity profile linking will remain outside School Edition. See [PUBLISHING.md](PUBLISHING.md) for the planned anonymous/linked release model.


## Sound & Music Studio

Arcadia Creator now includes **13 original previewable sounds and music loops**, 3 additional game-audio blocks, per-project WAV/MP3/OGG imports and filtered audio ZIP importing. The curated library has 24 added links to official CC0 or individually licensed audio, art, texture and model sources. Some are external references only, not files already included in the game. Game exports include source metadata and `ASSET-CREDITS.txt`. See [ASSET_SOURCES.md](ASSET_SOURCES.md) and [CREATOR.md](CREATOR.md).


## 2D Sprite Sheet Cutter and 3D Model Arsenal

Arcadia Creator now includes a **2D Sprite Sheet Cutter** (PNG/JPEG/WebP sheet → individual sprites) and a **3D Model Arsenal** with eight original, generated GLB models, a WebGL viewer, compact GLB uploads, and ZIP pack import. The 2D sprites work in the existing game runtime; GLB models are previewable and exported as assets, but **full 3D gameplay is not implemented**. The release ZIP contains any imported `models/*.glb`, a `arcadia-3d-assets.json` manifest, and source credits.

For use and limitations, see [ASSET_PIPELINE_2D_3D.md](ASSET_PIPELINE_2D_3D.md).
