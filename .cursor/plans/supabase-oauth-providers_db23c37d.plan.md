---
name: supabase-oauth-providers
overview: Add Google, Apple, and GitHub OAuth sign-in/sign-up for the community app using the existing Supabase auth stack, with an auth callback route and profile creation already covered by the current DB trigger.
todos:
 - id: add-auth-callback-route
   content: Add Next.js route at apps/community/src/app/auth/callback that exchanges code for session, sets cookies, and redirects to intended destination.
   status: completed
 - id: configure-supabase-providers
   content: Enable Google, Apple, and GitHub in Supabase dashboard; set redirect URL to {SITE_URL}/auth/callback and add provider client IDs/secrets.
   status: completed
 - id: add-oauth-buttons
   content: Add Google/Apple/GitHub buttons to CommunityAuthCard (sign-up and sign-in) using signInWithOAuth with redirectTo pointing at the new callback URL.
   status: completed
 - id: verify-oauth-profile-trigger
   content: Confirm handle_new_community_user trigger works for OAuth (name/email from provider); optionally improve trigger to map provider-specific metadata.
   status: completed
 - id: document-oauth-setup
   content: Update SUPABASE_SETUP.md with OAuth provider setup steps and required redirect URLs.
   status: completed
 - id: test-oauth-flows
   content: Test sign-up and sign-in for each provider (local + production URLs), including redirect and profile creation.
   status: completed
isProject: false
---

### Goal

Enable Google, Apple, and GitHub OAuth for the community app so new users can sign up/sign in with a provider. Email/password flow stays unchanged. New OAuth users get a `community_users` row automatically via the existing trigger.

### Current state

- **Auth**: [CommunityAuthCard](apps/community/src/components/pages/community/CommunityAuthCard.tsx) handles email/password sign-up/sign-in and writes to `community_users` on sign-up. No OAuth and no auth callback route yet.
- **Profile on sign-up**: [handle_new_community_user](supabase/migrations/20260227000000_add_community_feature.sql) runs on `auth.users` INSERT and creates a `community_users` row with `name` from `raw_user_meta_data->>'name'` (or email local part), `username` = `'user_' || first 12 chars of UUID`, `email`, and optional `bio`/`avatar_url` from metadata. OAuth sign-ups will trigger this same path.
- **Redirect handling**: `redirectDestination` is derived from `?redirect=` and validated against `siteUrl` / `blogUrl` / `mainUrl`. OAuth must redirect back to a callback that then sends the user to this destination.
- **Site URL**: [site-urls](apps/community/src/lib/site-urls.ts) exposes `siteUrl` (community base). Callback and Supabase redirect URL should use this (e.g. `{siteUrl}/auth/callback`).

### Implementation order

1. **Auth callback route** (required for OAuth to work)

- Add `**apps/community/src/app/auth/callback/route.ts` (GET handler).
- Read `code` and optional `next` (or `redirect`) from query. Use server Supabase client with cookie read/write (same pattern as [middleware](apps/community/src/lib/supabase/middleware.ts): `createServerClient` with `getAll`/`setAll` cookies from `request`/`response`).
- Call `supabase.auth.exchangeCodeForSession(code)`, then redirect to `next` if allowed (same origin/path validation as `resolveRedirectDestination`), else `/dashboard`.
- Supabase redirects to `redirect_uri?code=...` after provider sign-in; `redirect_uri` must be exactly the callback URL (e.g. `https://codingbay.community/auth/callback`). Pass intended post-login path via `redirectTo` when calling `signInWithOAuth` (Supabase can append it as a query param to the callback URL if we build it into the redirect URL we give Supabase).

1. **Supabase dashboard**

- Auth → Providers: enable Google, GitHub, Apple. Per provider: paste Client ID and Secret (and Apple Services ID / key as per Supabase/Apple docs).
- Auth → URL configuration: set "Redirect URLs" to include `{NEXT_PUBLIC_SITE_URL}/auth/callback` (and localhost equivalent for dev).
- No code change; credentials come from env or dashboard.

1. **CommunityAuthCard**

- Add a row of provider buttons above or below the email/password form in both "Create account" and "Sign in" modes.
- On click: `supabase.auth.signInWithOAuth({ provider: 'google' | 'github' | 'apple', options: { redirectTo: callbackUrlWithNext } })`. Build `callbackUrlWithNext` as `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback?next=${encodeURIComponent(redirectDestination)}` (origin from client; for SSR-safe default use `siteUrl` from env or pass from a small helper). Supabase will redirect the user to the provider, then to `redirectTo` with `?code=...`; our callback route will exchange code and redirect to `next`.
- Handle loading and errors (e.g. provider disabled) in the card.

1. **Profile trigger**

- Existing trigger already inserts `community_users` with name/username/email. Supabase fills `raw_user_meta_data` from OAuth (e.g. Google full_name, email, avatar). If any provider uses different keys, add a small migration to extend `handle_new_community_user()` to prefer e.g. `full_name` / `avatar_url` from metadata. Otherwise leave as-is and verify with one provider.

1. **Username / onboarding**

- Trigger assigns `user_<uuid_prefix>`; users can change username later in dashboard profile. Optional follow-up: redirect new OAuth users (e.g. by `created_at` or a "profile complete" flag) to a "Choose your username" step—not in scope for this plan unless you want it.

1. **Docs**

- In [SUPABASE_SETUP.md](SUPABASE_SETUP.md): add a short "OAuth (Google, GitHub, Apple)" section listing redirect URL, where to set it in dashboard and in each provider console, and that client ID/secret are configured in Supabase (or via env if you use that pattern).

### Key files

- **OAuth callback**: New — `apps/community/src/app/auth/callback/route.ts`
- **OAuth buttons + redirectTo**: `apps/community/src/components/pages/community/CommunityAuthCard.tsx`
- **Session/cookies (reference)**: `apps/community/src/lib/supabase/middleware.ts`
- **Profile on new user**: `supabase/migrations/20260227000000_add_community_feature.sql` (`handle_new_community_user`)
- **Base URL for redirect**: `apps/community/src/lib/site-urls.ts` (`siteUrl`)

### Complexity and scope

- **Callback + buttons + config**: ~0.5–1 day.
- **Apple**: Same code path; extra time only for Apple Developer setup (certificates, Services ID).
- **Trigger tweak**: Only if provider metadata doesn't match; otherwise verify and document.

Overall: **low–medium**; ready to implement in the order above.
