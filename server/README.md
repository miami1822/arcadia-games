# Arcadia Creator Review API (not deployed)

This is a **gated** Node/Express review intake for anonymous browser-game submissions. It is included in the GitHub repository but is **not running yet**. The static Creator UI enables its **Submit for review** button only when the public configuration points to a secure API and includes a Turnstile public site key.

## Architecture

- Account-free submission -> CAPTCHA -> validation -> private database -> receipt code -> staff moderation -> manually promoted approved release.
- No ZIP is ever executed by this API, and unapproved ZIPs never receive a public URL.
- The API accepts ZIPs of up to **2 MB** with a root `index.html`, up to 250 entries and a 16 MB uncompressed manifest limit.
- Anonymous rate limit: **3 submissions per hashed IP within 24 hours**. Total pending queue maximum: 250.
- Public status checks require an unpredictable secret receipt token. Only its SHA-256 digest is stored.
- Uploaded files, metadata, status and review decisions live in a **private PostgreSQL database**, never in localStorage or public source files.
- Staff endpoints require a high-entropy server-side bearer token. This is an interim gate; use Lucion Identity organization-based RBAC before wide public launch.

## Startup

Use a recent Node 22+ runtime. From the `server` directory, install dependencies and run:

```bash
npm install
npm start
```

The service initializes `schema.sql` on start. Set the following **server-only** environment variables in the hosting dashboard:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Private PostgreSQL connection string |
| `IP_HASH_SECRET` | Random secret used for HMAC-based anonymous rate limits |
| `TURNSTILE_SECRET_KEY` | CAPTCHA server-side secret |
| `ADMIN_REVIEW_TOKEN` | Long random staff review bearer token (server-side only) |
| `ALLOWED_ORIGINS` | Comma-separated exact Creator website origins |
| `PORT` | Optional; defaults to 10000 |

Never commit these values into GitHub. The API responds with a disabled status until the required database and anti-spam settings are present.

## Frontend configuration

In public `assets/creator-config.js`, set only:

```js
window.ArcadiaCreatorConfig = {
  submissionApiBase: 'https://your-review-api.example.com',
  turnstileSiteKey: 'PUBLIC_TURNSTILE_SITE_KEY',
  identityEnabled: false
};
```

The site key is public; the secret remains on the server. Turnstile must be configured to allow Arcadia's Creator origin, with the action `arcadia-submit`. The server verifies both **action and allowed hostname**.

The Creator automatically displays the account-free Submit for Review control when these public configuration values are present. It saves submitted receipts locally and shows a copyable receipt, but public publication only happens after staff approval.

## Endpoints

| Method | Path | Access |
|---|---|---|
| GET | `/health` | Public service and readiness |
| POST | `/api/v1/creator/submissions` | Anonymous; verified CAPTCHA and ZIP |
| GET | `/api/v1/creator/submissions/:id/status` | Secret `X-Arcadia-Receipt` header |
| GET | `/api/v1/admin/submissions` | Staff bearer token |
| GET | `/api/v1/admin/submissions/:id/download` | Staff bearer token |
| POST | `/api/v1/admin/submissions/:id/decision` | Staff bearer token |

Admin decisions are `changes_requested`, `rejected`, `approved_pending_release`, and `published`. Staff must enter a reason. A `published` decision requires a verified HTTPS release URL and should only follow a separate GitHub catalog commit.

## Deployment and review checklist

1. Choose **persistent database storage** and private backups. Avoid temporary databases that automatically expire; game submissions should not be lost.
2. Configure CAPTCHA, keys, and exact CORS origins. Do not run without these protections.
3. Test ZIP parsing with malformed paths, decompression-size boundaries, empty archives and unsupported extensions.
4. Review the moderation workflow and documented content/rights policies. Scan uploads before staff downloads them.
5. Keep the review API on a privileged domain distinct from public executable game content.
6. Wire a staff-owned process that promotes approved, immutable builds to GitHub and updates the Main/School catalog separately.
7. Add Lucion Identity OIDC with authorization code + PKCE, a dedicated client, signed session cookies, and verified issuer/subject profile binding. **This is not implemented in the current API.**
8. Run browser and server integration tests before enabling anonymous public submissions.

## Security limitations

This is a first API implementation, **not an independently security-audited service**. ZIP validation checks paths, file types and uncompressed metadata, but does not perform full malware scanning or content review. There is no automated server-side release publishing or Lucion Identity account link yet. Do not deploy as a public upload service before security testing and the moderation process are operational.

## Cost consideration

Render free PostgreSQL expires after 30 days, so don't use it to permanently store user-submitted game packages. Select a durable storage plan with backup/retention policies before launch.
