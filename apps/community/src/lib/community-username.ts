/**
 * Community usernames: DB check is `^[a-z0-9_]{3,32}$` (see Supabase migrations).
 * OAuth sign-up creates a row via `handle_new_community_user` with username
 * `user_` + first 12 hex chars of the auth user id (no hyphens).
 */
export const COMMUNITY_USERNAME_REGEX = /^[a-z0-9_]{3,32}$/;

export function isValidCommunityUsername(raw: string): boolean {
  return COMMUNITY_USERNAME_REGEX.test(raw.trim().toLowerCase());
}

export function oauthPlaceholderUsernameFromUserId(userId: string): string {
  const hex = userId.replace(/-/g, "").toLowerCase().slice(0, 12);
  return `user_${hex}`;
}

/** True when the user still has the auto-generated OAuth placeholder and may claim a username. */
export function isUsernamePlaceholderPendingClaim(userId: string, username: string): boolean {
  return username.trim().toLowerCase() === oauthPlaceholderUsernameFromUserId(userId);
}
