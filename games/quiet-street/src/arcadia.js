/* Arcadia integration adapter — PLACEHOLDERS ONLY.
 * No official Arcadia API spec was provided, so nothing here calls a real service.
 * Replace the bodies below once the spec exists; the game only talks to this file. */
export const Arcadia = {
  connected: false,
  /** Connect to the host page (accounts, cloud saves). Resolve true when linked. */
  init() { return Promise.resolve(false); },
  /** Called when a level is cleared. TODO: achievements / leaderboard submit. */
  onLevelComplete(level, seconds, nightmare) {},
  /** Called when the player is caught. TODO: telemetry if the platform allows. */
  onGameOver(level) {},
  /** TODO: cloud save. Return the save object or null to fall back to localStorage. */
  loadCloud() { return Promise.resolve(null); },
  saveCloud(data) { return Promise.resolve(false); }
};
