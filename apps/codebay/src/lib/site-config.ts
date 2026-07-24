export function isSitePaused(): boolean {
  return process.env.SITE_PAUSED === "true";
}
