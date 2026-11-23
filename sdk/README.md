# Arcadia Game SDK v0.1.0

The Arcadia Game SDK is a **zero-dependency browser JavaScript SDK** for games hosted by Arcadia. It does not require a developer account or a player account.

This directory contains the SDK source supplied for Arcadia, TypeScript signatures, a trusted-frame host adapter, and an interactive demo.

## Try it

- [Standalone SDK demo](example.html)
- [Trusted host + iframe integration demo](host-demo.html)
- [Arcadia Creator](../creator.html)

Run over an HTTP server or GitHub Pages. For example, from the repository root:

\`\`\`bash
python3 -m http.server 8080
\`\`\`

Open \`http://localhost:8080/sdk/example.html\` or \`http://localhost:8080/sdk/host-demo.html\`.

## API

| API | Purpose | v0.1.0 persistence |
| --- | --- | --- |
| \`ready({title,features})\` | Announces game metadata | Host notification |
| \`session.start/pause/resume/end()\` | Lifecycle events | Host notification |
| \`storage.save(slot,value)\` | Save JSON state | Browser LocalStorage |
| \`storage.load(slot)\` | Load a save or \`null\` | Browser LocalStorage |
| \`storage.remove(slot)\` | Remove a save | Browser LocalStorage |
| \`storage.list()\` | List saved slots | Browser LocalStorage |
| \`scores.submit(score,options)\` | Record score | Browser LocalStorage |
| \`scores.top(limit)\` | List top scores | Browser LocalStorage |
| \`achievements.unlock(id,metadata)\` | Unlock achievement | Browser LocalStorage |
| \`achievements.list()\` | List unlocks | Browser LocalStorage |
| \`ui.fullscreen()\` | Browser fullscreen request | Fullscreen API |
| \`on()/off()/emit()\` | Game/host events | postMessage |
| \`getEnvironment()\` | Inspect current backing | Local capability object |

Only local saves, scores, and achievements exist. There are **no cloud saves, global leaderboards, multiplayer services, sign-in, or public publishing APIs**.

## Using the SDK inside a first-party browser game

Load the script from your game's relative path. For a game located at the root of the Arcadia repository:

\`\`\`html
<script src="sdk/arcadia-sdk.js"></script>
<script>
(async () => {
  const sdk = new ArcadiaSDK({ gameId: 'my-game' });
  sdk.ready({ title: 'My Game', features: ['saves', 'scores', 'achievements'] });
  sdk.session.start();

  await sdk.storage.save('slot-1', { level: 2 });
  const save = await sdk.storage.load('slot-1');
  await sdk.achievements.unlock('first-win');
  await sdk.scores.submit(1200, { mode: 'classic' });
  sdk.session.end({ score: 1200, result: 'victory' });
})();
</script>
\`\`\`

If a game is under \`games/my-game/index.html\`, its relative SDK URL would be \`../../sdk/arcadia-sdk.js\`.

IDs for games, saves, and achievements must be 2–64 characters, with lowercase ASCII letters, digits, hyphens or underscores, starting with a letter/digit.

## How the existing Arcadia site uses it

- \`game.html\` and \`school.html\` load the SDK before executing any **built-in** game scripts.
- For a built-in game, the page creates \`window.arcadiaGame = new ArcadiaSDK({gameId: game.id})\`.
- Built-in games can call \`window.arcadiaGame.storage\`, \`.scores\`, \`.achievements\`, and \`.session\` directly.
- **Neon Snake** demonstrates events, score submission, and achievements through this object.
- The supplied \`arcadia-host.js\` is demonstrated at \`sdk/host-demo.html\`; it is not automatically attached to hosted games or external embedded games.

## Trusted iframe host usage

\`\`\`html
<iframe id="game" allow="fullscreen"></iframe>
<script src="sdk/arcadia-sdk.js"></script>
<script src="sdk/arcadia-host.js"></script>
<script>
  const frame = document.getElementById('game');
  const host = new ArcadiaHost(frame, { gameId:'sdk-example' });
  frame.src = 'sdk/example.html';
  // Call host.destroy() if you replace the frame.
</script>
\`\`\`

The example game configures \`allowedParentOrigins: [location.origin]\` and the host checks the iframe window, origin, protocol, game ID and channel. The adapter is designed for **trusted first-party, same-origin** content, not arbitrary uploaded code.

## Security and privacy boundaries

- **Never run unreviewed third-party games on Arcadia's privileged origin.** Untrusted games need a separate origin and strict sandbox/CSP restrictions.
- \`localStorage\` is scoped to a browser origin, not a logged-in user; clearing browser data erases saves.
- Locally stored scores are not cheat-resistant, authoritative, or globally ranked.
- Don't treat \`postMessage\` events as verified account identity, and don't supply tokens or secret keys to game code.
- A sandboxed Creator preview that blocks same-origin access cannot rely on localStorage or a same-origin host handshake. The current Creator alpha is a local editor, not a hosted SDK service.

## Source files

- \`arcadia-sdk.js\` — game SDK global \`ArcadiaSDK\`
- \`arcadia-sdk.d.ts\` — TypeScript declarations
- \`arcadia-host.js\` — trusted, same-origin host adapter
- \`example.html\` — standalone local API demo
- \`host-demo.html\` — parent host example

Version **0.1.0**; postMessage protocol **1**.
