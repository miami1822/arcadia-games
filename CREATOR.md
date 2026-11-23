# Arcadia Creator Alpha

Arcadia Creator is available at [arcadia-creator.onrender.com/creator.html](https://arcadia-creator.onrender.com/creator.html).
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

There is no Lucion Identity sign-in, creator account, cloud sync, published game catalog ingestion, server-side moderation, or production submission endpoint yet. Drafts remain in the user's current browser. There is no fictional 'submitted' state.

The game runner uses `iframe sandbox="allow-scripts allow-pointer-lock"` **without** `allow-same-origin` and injects a restrictive Content Security Policy that prevents external network requests. This improves isolation but means some complex third-party games will not run. Imported code may still be unsafe as data, so never treat ZIP upload or local playtesting as an approval for publishing.

The ZIP importer is limited to 3 MB, at most 50 files, and common text/image/audio formats. It supports simple local asset references but not all generated game bundles, JavaScript modules, WebAssembly applications, or remote dependencies. The web CDN JSZip dependency must load for ZIP import and export; if it does not, self-contained HTML fallback export is provided.

## How to try the editor

1. Go to `creator.html` and select **Create a game**.
2. Choose **Visual Builder** to arrange objects, then **Playtest**.
3. Or choose **Code Studio**, edit the three files, and **Playtest**.
4. Use **Export ZIP** frequently to back up your game.
5. In **Release Center**, document your game, run the checklist, and export. The submit button is intentionally disabled until secure review infrastructure is available.

## Local development

Serve the repository using `python -m http.server 8000` and open `http://localhost:8000/creator.html`.
`file://` launches might differ in browser behavior.

## Hosting

The new Render static site **arcadia-creator** deploys from the `main` branch of `miami1822/arcadia-games`, with no build dependencies. The same static hosting includes the existing Main Edition and School Edition. Future pushes to `main` are configured for auto-deploy.

## Next release gates

1. Create and configure an **Arcadia Creator** Lucion Identity OIDC client with correct redirect URIs and allowed origins. Keep client secrets server-side.
2. Build a backend service, relational database, and object storage for projects/builds. Do not use browser storage as a public identity or trust source.
3. Implement authenticated upload and immutable build scanning with strict ZIP resource limits and disposable isolation.
4. Add creator-owned project access, optional team membership, audit logs, and admin RBAC verified on the server.
5. Create the moderation queue, rights declaration, School Edition-specific review, versioned release promotion, and rollback.
6. Wire approved releases to a safely isolated public game origin and to catalog ingestion, and perform browser/device acceptance tests.
