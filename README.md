# Arcadia — browser game site

An original, responsive arcade starter with four playable games, searchable catalog, favorites, and a local visual catalog editor. No third-party game assets or embeds included.

## Preview locally

Run `python -m http.server 8000` from this folder and open `http://localhost:8000`. Opening `index.html` directly as a `file://` URL won't load the JSON catalog in most browsers.

## Publish automatically with GitHub Pages

1. Create a **new** GitHub repository and upload these files to its `main` branch, including `.github/workflows/deploy.yml`.
2. In repository **Settings → Pages**, select **GitHub Actions** as the build/deployment source.
3. Every push to `main` triggers automatic deployment. GitHub Actions minutes and permissions are subject to your account/org settings.
4. On `admin.html`, edit the catalog and **Export catalog.json**. Commit the exported file at the root of your repository. This publishes game catalog changes automatically.

## Important limitations

- The `admin.html` catalog editor uses localStorage, **not** server-side authentication or a database. Changes are local to the browser until committed. Anyone visiting the page can edit their own local copy, but not the published catalog.
- New built-in games require a corresponding JavaScript module under `games/`. Other games can be linked by HTTPS iframe when the game's publisher permits embedding; some hosts prohibit iframe embeds.
- Favorites and high scores are local to the player's browser.
- Do not host copyrighted games without proper permission. School network restrictions and acceptable-use policies still apply; this project does not bypass filtering.
- This is a static-host starter. For authenticated shared admin editing and automatic ingestion of games, you'd need a backend and moderation/review process.

## File layout

- `catalog.json`: published catalog
- `index.html`: searchable homepage
- `game.html`: playable game view
- `admin.html`: local catalog editor
- `assets/`: CSS, catalog/home/editor/player scripts
- `games/`: four standalone original games
- `.github/workflows/deploy.yml`: GitHub Pages auto-deployment

## License

Project source is supplied for your use and customization. No external game content is included.


## Two editions, one catalog (v0.2)

- `index.html` is the primary browser arcade. `plus.html` is a **coming-soon concept**, not a functioning billing or subscription system.
- `school.html` is the lightweight school-friendly edition, sharing the same `catalog.json` as the main site. It has no network-filter bypassing and no tracking or ads.
- To create the Google Sites companion: publish this site to HTTPS first. In the Google Sites editor, choose **Insert → Embed → URL**, enter the published absolute URL of `/school.html`, adjust the iframe size, and publish the Google Site. If your Google Workspace administrator blocks embedding or access to the host, follow that policy. The Google Site itself must be manually created/published with an authorized account.
- To add a new original built-in game, add `games/<id>.js` and a matching `catalog.json` entry. Run `python scripts/check_catalog.py` to check metadata and module presence. More thorough browser/gameplay tests are still needed before public releases.
- `assets/player.js` now supports additional built-in JavaScript game files referenced by a validated catalog ID. Code review is essential because game scripts run on your site.
- The deployment workflow validates the catalog before publishing. The Google Sites embed automatically reflects changes on the hosted `school.html`, subject to normal caching. It does **not** automatically create/update native Google Sites pages.

## Revenue plan (not yet active)

Keep the school edition free; do not depend on Google Sites for AdSense, because Google Sites does not offer a reliable native AdSense integration. If ads are pursued, they should be on a separately hosted, eligible, approved website, subject to ad placement/privacy/child-directed audience requirements. AdSense's publisher must be 18+ or a parent/guardian can apply on their own account. Do not deploy ads without approval and a privacy/legal review. `plus.html` intentionally does **not** collect payment or simulate a real checkout. Premium should focus on cosmetic customization and convenience while core gameplay stays free. Adult-managed payment onboarding may be required for minors.

## Weekly game drops

A ChatGPT weekly task has been scheduled separately. Its success in editing a live repository depends on available access at the time of each run. This package does not itself automatically generate new games; the GitHub action only validates and publishes changes pushed to `main`. Do not assume scheduled creation equals confirmed live deployment.
