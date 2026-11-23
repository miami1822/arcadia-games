# Arcadia Creator: anonymous publishing and optional Lucion Identity

**Status: implementation design; not an active upload or authentication service.**

Arcadia Creator has a local-first visual editor, Block Studio, Code Studio, Asset Library, and ZIP exporting. The currently deployed website is static. Public game publishing requires a protected submission backend, moderation, immutable builds, and approved release promotion. This document defines the contract so the anonymous and signed-in pathways can share one pipeline.

## Product principles

1. **No developer account required.** A visitor can build, playtest and submit a game anonymously once the review API launches.
2. **Optional Lucion Identity.** Signed-in developers can link reviewed games to a public Arcadia creator profile, own project updates, manage game submissions, and receive expanded project/build limits.
3. **School Edition has no sign-in.** There must be no Lucion Identity buttons, SDK authentication tokens, or creator-account requirements in the School Edition player or page.
4. **No anonymous auto-publication.** Every new game and updated executable build is quarantined for validation and moderator review before release.
5. **Trust and visibility are separate.** An anonymous game may be public after approval without having a named creator; public attribution to a profile requires verified identity and an explicit display choice.
6. **Privacy by default.** Creator display names are optional pseudonyms, profile discoverability defaults off for young users, and personal contact details are never automatically displayed.

## Two publication pathways

### Anonymous

- Create the game with no sign-in. Export a ZIP with the release manifest and credited/licensed asset metadata.
- Upload the ZIP and metadata to the submission API when available. The site verifies ZIP size and integrity, uses anti-spam protections, and issues an unpredictable submission receipt token.
- The receipt lets its holder check review status without accounts. The API stores a hash of the token, not the token itself.
- Moderators review safety, compatibility, licensing, School Edition eligibility and game content.
- When approved, an Arcadia maintainer promotes the exact reviewed version to the static game origin and adds it to the public catalog.
- Anonymous releases receive an unattributed game page unless the person later proves ownership using their receipt and signs in.

### Linked to Lucion Identity

- Explicitly click **Sign in with Lucion Identity** in the Main Creator (never the School Edition). Use authorization code + PKCE, a dedicated Arcadia OIDC client, and server-side sessions.
- Verify issuer, audience, nonce, signature, expiry and callback redirect on the server; bind `sub` and issuer as the immutable account identity.
- Let the user opt in to a public creator profile with a pseudonymous display name. Never use email or an editable display name as the permission key.
- Submissions carry the authenticated account binding server-side, not from a JSON field supplied by the browser.
- Game updates and withdrawal requests require verified ownership or an authorized moderation role.
- Expanded limits can be configured by admins; they are quotas on drafts, builds, asset storage, and analytics, **not** a moderation bypass.

## API contract (proposed)

```text
POST /api/v1/creator/submissions                # anonymous or authenticated, CAPTCHA, ZIP, metadata
GET  /api/v1/creator/submissions/:id/status       # receipt token (anonymous) or owner session
GET  /api/v1/creator/me                           # optional session details
GET  /api/v1/creator/me/games                     # verified user's linked projects
POST /api/v1/creator/games/:id/claim               # receipt + signed-in identity
GET  /api/v1/creator/auth/lucion                  # initiate PKCE
GET  /api/v1/creator/auth/lucion/callback         # validate code and state, create session
POST /api/v1/creator/auth/logout                  # revoke session
GET  /api/v1/admin/submissions                    # staff-only queue
POST /api/v1/admin/submissions/:id/decision       # approve / request changes / reject
POST /api/v1/admin/releases/:id/promote           # only after reviewed, immutable build
```

The public browser must never hold a service-role database key, OIDC client secret, private signing key, or privileged GitHub token. Backend secrets belong in the deployment provider's environment settings.

## Proposed backend records

- `creator_submissions`: submission ID, anonymous receipt hash, upload digest, metadata, channel requests, review status, timestamps
- `submission_files`: quarantined object key, SHA-256, file manifest, scanned state
- `creator_accounts`: issuer + OIDC subject, pseudonymous public profile, privacy preference
- `game_ownership`: game ID, creator subject or anonymous receipt claim, version history
- `reviews`: admin subject, decision, reason, record timestamp
- `releases`: immutable approved package digest, catalog ID, distribution channels, rollback pointer
- `quotas`: anonymous/linked release limits and storage limits enforced by the API

## Safety and operations

- Use short upload limits, archive traversal checks, decompression limits, malware checks, file type checks, content review and abuse reporting.
- Run new games in an isolated game-serving origin and restrictive iframe; never allow an uploaded package to execute with Creator's browser session origin.
- Enforce CAPTCHA and server-side rate limiting on anonymous submissions.
- Store raw ZIPs privately. Never serve unreviewed ZIP contents as executable pages.
- Protect staff review with Lucion Identity organization-based authorization and audit logs, not a browser-only admin toggle.
- Automatically delete rejected uploads after a defined retention period.
- Give School Edition a separate eligibility review and no login buttons.
- Don't automatically ingest art from third-party sites. Respect each pack's license and preserve required attribution.

## Launch prerequisites

1. A deployment destination for the review API, private object storage, and a persistent database.
2. Server-side anti-spam credentials and an abuse policy for public file submissions.
3. Dedicated Lucion Identity OIDC application registration with exact callback URL, allowed origins and appropriate public profile scopes.
4. Verified organization membership / admin role claims for moderation.
5. Publisher-specific privacy and content guidelines, plus a support path for rights disputes.
6. Real browser testing, moderation testing, and an approved publishing/rollback rehearsal.

Until these exist, the Creator UI must honestly label its publishing controls as **export/preparation only**. There is no live submission queue yet.
