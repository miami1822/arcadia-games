# Afterglow Arcade — v1.0.0

A story-driven boardwalk tycoon made for Arcadia. Grandpa left you a shuttered pier; reopen attractions, welcome visitors, and prepare for the Lantern Festival.

## Play or publish
Upload the complete contents of this folder to a static host, keeping the asset paths intact, and serve index.html. Or unzip and open index.html locally in a modern browser. No build process, packages, login, or external network requests are needed. The ZIP has index.html at its root.

## Controls
- Mouse or touch: select a venue, tap an empty lot to build; tap an attraction to collect tips or upgrade.
- 1–8: select venue cards in order when unlocked.
- Space: pause/resume when a cutscene is closed.
- Escape: dismiss the current menu or cutscene.
- Buttons: End day early, Save game, sound, fullscreen, menu, story, and tutorial.

A day lasts 78 active seconds, or press End day early. Visitor count grows with attractions, appeal and reputation. Income accumulates as tips at each attraction, collected by tapping it. Power starts at 5; Power Stations add 5. Different adjacent earning attractions earn a 15% bonus. New attractions unlock at story milestones. The final chapter triggers a festival cutscene; play continues afterward. Events are deterministic every fourth day.

## Save & embed
Autosave uses localStorage key arcadia-afterglow-v1 after purchases, upgrades, collections, chapter changes and day advances. Manual Save game is also available. Save data remains on the same device and browser profile. In an iframe, allow fullscreen (for example allow="fullscreen"). Some third-party iframe/privacy policies block localStorage; the game then remains playable for that session but cannot persist. The game pauses on hidden tabs and when cutscenes/menus open. No platform APIs are assumed; the ArcadiaAdapter in game.js is a clearly separated local save boundary with null placeholders for cloud saves, achievements and leaderboards. Wire them only after official Arcadia API specifications are supplied.

## Assets and audio
- assets/kenney-arrow.png: UI Pack (Yellow/Double/arrow_basic_e.png) by Kenney, CC0 1.0. Official pack: https://kenney.nl/assets/ui-pack . Source copy: https://github.com/shorepine/kenney . License text included in assets/KENNEY-LICENSE.txt.
- thumbnail.svg and the game's layout, styling, copy and story: original work created for this package.
- System emoji represent buildings and may look different between operating systems.
- Sound effects and a quiet looping melody are synthesized locally using Web Audio after interaction; no audio files or streaming are needed. Sound can be disabled.

## Catalog
Title: Afterglow Arcade
Genre: Story-driven tycoon / strategy
Short description: Grandpa left you a dark boardwalk. Build an arcade from scratch, keep the power on, and bring the city back for the Lantern Festival.
Thumbnail: thumbnail.svg (1200 × 675 vector art).
Recommended age: Teen/general. Single player; offline; no purchases.

## Changelog
v1.0.0 — Six story chapters and cutscenes, eight buildings, power and adjacency strategy, visitors, tips, upgrades, rotating day events, local saves, touch/keyboard input, synthesized effects and music, responsive layout, fullscreen, original thumbnail.

## Expansion opportunities
Location-themed piers, NPC customer requests, building variants, story choices, an optional sandbox mode, and Arcadia achievements/cloud saves after official API details exist.

## Verification limits
JavaScript syntax and a scripted game-state flow were checked. A real browser/device playthrough, accessibility audit, fullscreen iframe behavior, sound output and Chromebook frame-rate measurement were unavailable in this execution environment.
