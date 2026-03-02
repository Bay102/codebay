---
name: supabase-oauth-providers
overview: Add Google, Apple, and GitHub OAuth sign-in/sign-up for the existing Supabase-backed community app, ensuring new accounts get proper profiles and a clean UX.
todos:
 - id: review-current-auth
   content: Review existing Supabase auth usage and profile model in the community app (email/password flows, `community_users` table).
   status: pending
 - id: configure-supabase-providers
   content: Enable Google, Apple, and GitHub providers in Supabase dashboard and set correct redirect URLs for local and production.
   status: pending
 - id: add-oauth-buttons
   content: Update `CommunityAuthCard` to add Google/Apple/GitHub sign-in/sign-up buttons calling `supabase.auth.signInWithOAuth` with correct redirect handling.
   status: pending
 - id: ensure-profile-creation
   content: Add mechanism (DB trigger or onboarding screen) to create `community_users` rows for first-time OAuth users and resolve username rules/collisions.
   status: pending
 - id: test-oauth-flows
   content: Test OAuth sign-up/sign-in for all providers across local and production-like environments, including error and edge cases.
   status: pending
isProject: false
---

### Goal

Add Supabase OAuth providers (Google, Apple, GitHub) to the existing community authentication so new users can create accounts via social login, while preserving the current email/password flow and profile model.

### High-level approach

- **Reuse existing Supabase setup**: Leverage the current browser Supabase client and auth flows in `apps/community` rather than introducing new clients or auth stacks.
- **Configure providers in Supabase**: Enable Google, Apple, and GitHub in the Supabase dashboard, wiring client IDs/secrets and allowed redirect URLs for local and production.
- **Wire OAuth buttons into the UI**: Add provider buttons to the existing `CommunityAuthCard` sign-up/sign-in views, using `supabase.auth.signInWithOAuth` and existing redirect handling.
- **Ensure profile row creation for OAuth users**: Make sure `community_users` rows are created on first OAuth sign-in, either via a DB trigger on `auth.users` or a small post-sign-in profile-completion flow.
- **Handle username and profile UX**: Decide how to collect usernames for OAuth signups (e.g., auto-generate + editable later, or a dedicated “complete your profile” screen after first login).
- **Test and harden**: Verify happy paths and edge cases (failed OAuth, existing email collisions, repeated sign-ins, provider-disabled environments).

### Key files and changes

- **Auth UI**: Update `[apps/community/src/components/pages/community/CommunityAuthCard.tsx](apps/community/src/components/pages/community/CommunityAuthCard.tsx)` to:
  - Add Google/Apple/GitHub buttons in both sign-up and sign-in modes.
  - Call `supabase.auth.signInWithOAuth({ provider, options: { redirectTo } })` and reuse the existing `redirectDestination` logic.
- **Profile creation for OAuth users**:
  - Preferred: add a SQL function + trigger in a new Supabase migration under `supabase/migrations/` to insert into `community_users` whenever a new `auth.users` row appears (mapping `user_metadata` into name/username where available).
  - Alternative: add a “post-OAuth onboarding” page under `apps/community/src/app/` that detects first login without a profile and prompts for username/name, then writes to `community_users`.
- **Environment and config**:
  - Document required provider client IDs/secrets in `SUPABASE_SETUP.md` and ensure redirect URLs (e.g. `https://community.codingbay.<tld>/auth/callback`) are added in provider consoles and Supabase Auth settings.

### Rough complexity & timeline

- **Config & wiring (Google + GitHub)**: Low–medium; ~0.5 day once provider credentials exist.
- **Apple Sign In**: Medium; most work is in Apple Developer console setup, but code-side integration is the same as other providers.
- **Profile/username handling**: Medium; 0.5–1 day depending on whether we do a DB trigger-only approach or build a dedicated onboarding screen.

Overall, this is a **medium-complexity change** in this codebase: mostly configuration plus a few focused UI + migration changes, likely 1–2 engineering days including testing.
