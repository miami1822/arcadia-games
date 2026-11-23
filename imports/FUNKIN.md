# Friday Night Funkin' → Arcadia integration

**Status:** Source and licensing inspected, HTML5 staging build workflow added; game is **not yet deployed or listed in the public catalog**.

**Official source:** https://github.com/FunkinCrew/Funkin  
**Pinned test release:** `v0.8.6` (2026-08-12)  
**Code license:** Apache 2.0 — https://github.com/FunkinCrew/Funkin/blob/main/LICENSE.md  
**Asset license:** proprietary, with public redistribution restricted by default — https://github.com/FunkinCrew/funkin.assets/blob/main/LICENSE.md

The Arcadia owner reports direct permission to host and distribute the official content, including original music, visual assets, the Arcadia website and monetization. **No agreement has been supplied for independent review**, so record its scope before public deployment. Keep attribution and trademark notices intact.

## Build

The workflow `.github/workflows/build-funkin.yml` is intentionally manual (`workflow_dispatch`) and **only produces a private build artifact**. It does not publish to Arcadia or change the public catalog. It clones the official project and matching submodules, builds HTML5 in the Funkin Crew's build dependency container, checks for the output entrypoint, and uploads the result as `fnf-html5-staging`. Release source is pinned to `v0.8.6` by default.

## Release gate

1. Obtain a successfully built, inspectable HTML5 artifact.
2. Measure compressed/uncompressed size and file counts. GitHub Pages has deployment size limits and may not be suitable for the full official game; use appropriate static asset hosting if necessary.
3. Check the source commit and assets are allowed by the permission, preserve copyright/license notices and credits.
4. Verify the actual game boots, music plays after user interaction, and keyboard focus works.
5. Verify responsive/fullscreen player and same-page School Edition embed; some external iframe hosts restrict fullscreen.
6. Only then add the following item to `catalog.json`, changing the path to the real, verified deployed build:

```json
{
  "id": "friday-night-funkin",
  "title": "Friday Night Funkin'",
  "description": "The Funkin Crew's official rhythm battle game.",
  "category": "Rhythm",
  "emoji": "🎤",
  "accent": "#ff67c8",
  "type": "hosted",
  "path": "games/friday-night-funkin/index.html",
  "featured": true
}
```

Arcadia's current hosted-game validator requires the folder path to match the game ID, so `games/friday-night-funkin/index.html` will be recognized when deployed. **Do not publish the catalog entry without the real built game.**

## Build issues to watch

The official build pipeline uses project-specific patched Haxe libraries and application tokens for some CI mirrors. Public asset submodules may not be identical to the Crew's internal mirrors. If the staging build fails, inspect the exact first failing step before changing any dependencies. The build may exceed free runner disk, time, or artifact limits.
