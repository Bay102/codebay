## Followed Creators Newsletter Digest

The Community app can email subscribers a digest of **new blog posts and discussions** from people they **follow**, with per-user frequency, content toggles, and optional **mute** rules for specific followed accounts.

## User-Facing Flow

- **Where to configure:** `/settings` (and the same blocks on `/dashboard/profile`) - **Newsletter** (`NewsletterPreferencesSection`) lets signed-in users set:
  - **Frequency:** `none`, `weekly`, `biweekly`, or `monthly` (stored enum `newsletter_digest_frequency`).
  - **Include blog** / **Include discussions:** booleans (`include_blog`, `include_discussions`); defaults match in-app defaults when no row exists yet (`weekly`, both on).
  - **Muted follows:** users they still follow but whose content should **not** appear in the digest (rows in `newsletter_muted_follows`).
- **Server actions:** `getNewsletterSettingsAction`, `setNewsletterSettingsAction`, and `setNewsletterMutedFollowsAction` in `apps/community/src/lib/newsletter.ts` read/write these preferences under the authenticated user. Mutes are validated so only real `user_follows` pairs for the subscriber can be stored.
- **Unsubscribe from email:** the digest footer includes a signed link to `GET /newsletter/unsubscribe?token=...`, which verifies the token and upserts `newsletter_settings` with `frequency = 'none'` for that user (`apps/community/src/app/newsletter/unsubscribe/route.ts`). Manage-preferences links point at `/settings`.
- **Email content:** React Email template `FollowedCreatorsDigestEmail` (`apps/community/src/components/emails/FollowedCreatorsDigestEmail.tsx`), rendered to HTML via `@react-email/render` and sent with **Resend**.

## Data Model (Supabase)

Defined in `supabase/migrations/20260321120000_add_newsletter_digest_tables.sql` (and reflected in generated DB types):

- **`newsletter_settings`** - one row per `community_users.id`: `frequency`, `include_blog`, `include_discussions`, `last_digest_sent_at` (updated after a successful send).
- **`newsletter_muted_follows`** - `(subscriber_id, following_id)` with a foreign key to `user_follows` so mutes only apply to relationships that actually exist.
- **`newsletter_send_log`** - idempotency and traceability: unique on `(user_id, frequency, period_key)`; stores `content_count`, optional `provider_message_id`, `sent_at`.

RLS restricts reads/writes on settings and mutes to the owning user; the digest **job** uses the **service role** client and bypasses RLS for batch processing.

## When Does an Email Actually Send?

**Cron trigger:** root `vercel.json` schedules `GET` to `/api/cron/newsletter` **daily at 13:00 UTC** (`0 13 * * *`). Vercel Cron invokes that path on the deployed app; the handler also accepts `POST` for manual runs.

**Route security:** `apps/community/src/app/api/cron/newsletter/route.ts` requires `process.env.CRON_SECRET` or `process.env.VERCEL_CRON_SECRET` to be set, and the request must send that value as either `Authorization: Bearer <secret>` or header `x-cron-secret: <secret>`. Optional query `?limit=<n>` caps how many **users** are scanned (default **200** in `runNewsletterDigestJob`).

**Per-user eligibility** (`runNewsletterDigestJob` in `apps/community/src/lib/newsletter/digest-job.ts`):

1. Load up to `limit` users from `community_users` (newest by `created_at`) and merge `newsletter_settings` when present.
2. **Skip** if `frequency = 'none'` or if not **due:** due means no `last_digest_sent_at`, or elapsed time >= **7 / 14 / 30 days** for weekly / biweekly / monthly respectively.
3. Build digest items only for **followed** authors not in `newsletter_muted_follows`. If both content types are off (or the user follows nobody un-muted), the digest is empty.
4. **Content time window:** posts and discussions use `created_at >= now - (7|14|30 days)` matching the user's frequency (same day counts as the cadence).
5. **Blog:** `blog_posts` with `status = 'published'`, `author_id` in the allowed follow set, up to **30** rows ordered by `created_at` desc. Links use `baseUrl/blog/<username>/<slug>`.
6. **Discussions:** `discussions` with `author_id` in the allowed set, same window and limit; links use `baseUrl/discussions/<slug>`.
7. **Skip send** if there are **zero** items after filters (user is counted as skipped; no email).
8. **Idempotency:** insert a row into `newsletter_send_log` with a **period key** derived from frequency and a time bucket. If the insert fails (duplicate for that user/frequency/period), the user is skipped.
9. On **Resend success:** update the log row with `provider_message_id` and upsert `newsletter_settings` including `last_digest_sent_at = now`. On Resend failure, the log row for that period is deleted so a later run can retry.

**Base URL for links** in emails: `NEXT_PUBLIC_SITE_URL` if set, otherwise derived from the incoming cron request URL.

## Operations: Environment Variables

| Variable | Role |
|----------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (job + unsubscribe use it with service role). |
| `SUPABASE_SERVICE_ROLE_KEY` | **Required** for the digest job and unsubscribe handler (server-only; never `NEXT_PUBLIC_`). |
| `RESEND_API_KEY` | Resend API key. |
| `RESEND_FROM_EMAIL` | Verified sender address in Resend (for example `newsletter@yourdomain`). |
| `CRON_SECRET` or `VERCEL_CRON_SECRET` | Shared secret for `/api/cron/newsletter`; also used to sign unsubscribe tokens if `NEWSLETTER_UNSUBSCRIBE_SECRET` is omitted. |
| `NEWSLETTER_UNSUBSCRIBE_SECRET` | Optional dedicated secret for unsubscribe links (otherwise falls back to cron secret). |
| `NEXT_PUBLIC_SITE_URL` | Optional canonical site origin for links in emails. |

If `SUPABASE_SERVICE_ROLE_KEY` (or other required vars) are missing, the cron route returns **500** with an error message from the job.

## Local and Staging Testing

- Set all required env vars in `apps/community/.env` (or the deployment environment).
- Call the cron endpoint manually, for example:
  `curl -H "Authorization: Bearer $CRON_SECRET" "http://localhost:3002/api/cron/newsletter"`
  (adjust host/port to your dev server).
- Expect `usersEmailed: 0` if no user is due, has no eligible follows, has everything muted, or has no content in the window - that is normal.
- Use `?limit=5` to keep test runs small.

**Monorepo note:** `vercel.json` lives at the repository root. Cron paths apply to whichever Vercel project uses that config as its deployment root; if the Community app is deployed with a different root, configure an equivalent scheduled request to `/api/cron/newsletter` there.
