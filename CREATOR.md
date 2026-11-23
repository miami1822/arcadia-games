# Arcadia Creator Alpha

Arcadia Creator is maintained in this GitHub repository. Once GitHub Pages is enabled from `main` / `/(root)`, its expected public address is `https://miami1822.github.io/arcadia-games/creator.html`. See [GitHub Pages setup](GITHUB_PAGES.md).
The Creator UI is also linked from the main `index.html`.

## What works now

- Responsive Creator Hub with real local project counts and search/sort.
- Create, duplicate, rename, delete, and persist draft projects in browser `localStorage`.
- 2D Visual Builder: add, select, drag, resize, recolor, and remove players, platforms, coins, hazards, and goals.
- Generated playable platformer, keyboard controls, collision, collectibles, score, finish zone.
- Code Studio for `index.html`, `style.css`, and `game.js`.
- Sandboxed game preview, restart and fullscreen.
- Import a single self-contained `.html` file or a small `.zip` archive with an `index.html` entrypoint.
- Save release metadata and export ZIP packages.

## Important boundaries

**This is a local-first alpha, not a public user-upload service.**

**Developer accounts are not required.** There is no sign-in, cloud sync, published game catalog ingestion, server-side moderation, or automatic submission endpoint. Drafts remain in the user's current browser. Export a ZIP to share with Arcadia staff for manual review. There is no fictional 'submitted' state.

The game runner uses `iframe sandbox="allow-scripts allow-pointer-lock"` **without** `allow-same-origin` and injects a restrictive Content Security Policy that prevents external network requests. This improves isolation but means some complex third-party games will not run. Imported code may still be unsafe as data, so never treat ZIP upload or local playtesting as an approval for publishing.

The ZIP importer is limited to 3 MB, at most 50 files, and common text/image/audio formats. It supports simple local asset references but not all generated game bundles, JavaScript modules, WebAssembly applications, or remote dependencies. The web CDN JSZip dependency must load for ZIP import and export; if it does not, self-contained HTML fallback export is provided.

## How to try the editor

1. Go to `creator.html` and select **Create a game**.
2. Choose **Visual Builder** to arrange objects, then **Playtest**.
3. Or choose **Code Studio**, edit the three files, and **Playtest**.
4. Use **Export ZIP** frequently to back up your game.
5. In **Release Center**, document your game, run the checklist, and export. No direct submit button is provided. Share the exported game ZIP with Arcadia staff for manual review before it is added to the public catalog.

## SDK-powered Playtest (v0.1.0)

Create or open a project and select **Playtest**. Creator automatically initializes `window.arcadiaGame` inside the game. For example:

    await window.arcadiaGame.storage.save('progress', {level: 2});
    const progress = await window.arcadiaGame.storage.load('progress');
    await window.arcadiaGame.scores.submit(500, {mode: 'arcade'});
    await window.arcadiaGame.achievements.unlock('first-win');

**Run SDK Test** inside the inspector writes a sample `sdk-test` save, a `sdk-ready` achievement, and a 250-point score, entirely through the preview bridge. Subsequent tests add more scores. **Refresh data** reads saves, top scores, and achievements; **Clear Playtest data** clears only the current project's preview SDK data.

Playtest uses a `preview-<project-id>` namespace, while standalone exports use `game-<project-id>`. Their data is separate. Exported HTML and ZIP games automatically include the SDK. Visual Builder games unlock first-coin and level-complete achievements and record a finishing score.

The preview iframe stays sandboxed without `allow-same-origin`. A fresh per-preview nonce and dedicated MessagePort allow only game-scoped local SDK methods. This never exposes Creator projects, arbitrary localStorage keys, account credentials, or cloud APIs.

Limits: 16 save slots, 48 KiB per save, 64 achievements, up to 100 stored scores, and 60 requests per ten seconds. External fetches remain blocked in Playtest. All data is browser-local, with no cloud saves, online leaderboards, or accounts.

## Local development

Serve the repository using `python -m http.server 8000` and open `http://localhost:8000/creator.html`.
`file://` launches might differ in browser behavior.

## Hosting

**GitHub Pages is the preferred static hosting target.** Enable it in repository Settings → Pages → Deploy from a branch → `main` / `/(root)`. The repository includes `.nojekyll`; see [GITHUB_PAGES.md](GITHUB_PAGES.md). The previous Render site is a fallback until the Pages site is confirmed active.

## Future work (without developer accounts)

1. Improve the importer and runtime for larger HTML5 games while keeping previews isolated.
2. Standardize manual ZIP review and distribution-rights checks for Arcadia staff.
3. Add approved game files and catalog entries to GitHub through maintainer review.
4. Keep School Edition eligibility and safety review independent of Main Edition.
5. If anonymous direct uploads are added later, use a protected intake service with rate limits, strict file checks, and human approval; do not give anonymous users write access to GitHub.
6. Perform browser, mobile, and fullscreen smoke tests after GitHub Pages is active.
