---
name: community-cirqit-rebrand
overview: Rebrand the community app from CodingBay/CodeBay to Cirqit and migrate the public domain to cirqit.space, including metadata/SEO URL sources, user-facing copy, email templates, and cross-app URL constants. Include a deployment-safe rollout checklist and external platform updates required for redirect/auth/search continuity.
todos:
 - id: url-source-update
   content: Update community and cross-app URL constants/env examples to use cirqit.space as canonical community domain.
   status: pending
 - id: branding-copy-seo
   content: Replace CodingBay/CodeBay naming in metadata, OG/schema, navigation, and key community page copy.
   status: pending
 - id: email-and-fallbacks
   content: Rebrand digest templates/subjects and fallback author/org names to remove legacy brand strings.
   status: pending
 - id: external-rollout
   content: Prepare external migration checklist (DNS, hosting redirects, Supabase/OAuth, Search Console, analytics) and rollout order.
   status: pending
 - id: verification
   content: Define post-deploy verification for canonical tags, auth callbacks, email links, and residual legacy-brand scans.
   status: pending
isProject: false
---

# Cirqit Rebrand Plan

## Goals

- Rename community branding from `CodingBay`/`CodeBay` to `Cirqit` in user-facing UI and metadata.
- Move community canonical/public URL from `codingbay.community` to `cirqit.space`.
- Preserve SEO equity and auth/email flows during rollout.

## In-Repo Changes

### 1) Update canonical URL source of truth

- Replace default community domain fallback in `[apps/community/src/lib/site-urls.ts](/Users/zakbay/Desktop/CodeBay/codebay/apps/community/src/lib/site-urls.ts)` from `https://codingbay.community` to `https://cirqit.space`.
- Keep env-first behavior; ensure `siteUrl`, `communityUrl`, and `blogUrl` remain derived from the same source.
- Review cross-app consumer in `[apps/codebay/src/lib/site-urls.ts](/Users/zakbay/Desktop/CodeBay/codebay/apps/codebay/src/lib/site-urls.ts)` so links from main site point to `https://cirqit.space`.

### 2) Rebrand global/community metadata and page-level SEO

- Update app-wide metadata in `[apps/community/src/app/layout.tsx](/Users/zakbay/Desktop/CodeBay/codebay/apps/community/src/app/layout.tsx)` (`title`, `description`, `metadataBase`).
- Update high-traffic page metadata strings in:
  - `[apps/community/src/app/page.tsx](/Users/zakbay/Desktop/CodeBay/codebay/apps/community/src/app/page.tsx)`
  - `[apps/community/src/app/blog/page.tsx](/Users/zakbay/Desktop/CodeBay/codebay/apps/community/src/app/blog/page.tsx)`
  - `[apps/community/src/app/blog/[username]/page.tsx](/Users/zakbay/Desktop/CodeBay/codebay/apps/community/src/app/blog/[username]/page.tsx)`
  - `[apps/community/src/app/[username]/page.tsx](/Users/zakbay/Desktop/CodeBay/codebay/apps/community/src/app/[username]/page.tsx)`
  - `[apps/community/src/app/about/page.tsx](/Users/zakbay/Desktop/CodeBay/codebay/apps/community/src/app/about/page.tsx)`
  - `[apps/community/src/app/dashboard/page.tsx](/Users/zakbay/Desktop/CodeBay/codebay/apps/community/src/app/dashboard/page.tsx)`
  - `[apps/community/src/app/dashboard/admin/page.tsx](/Users/zakbay/Desktop/CodeBay/codebay/apps/community/src/app/dashboard/admin/page.tsx)`
  - `[apps/community/src/app/settings/page.tsx](/Users/zakbay/Desktop/CodeBay/codebay/apps/community/src/app/settings/page.tsx)`
- In blog metadata, update `openGraph.siteName`, schema publisher names, and keyword text to Cirqit naming.

### 3) Rebrand user-facing app copy and nav labels

- Update prominent community UI strings in:
  - `[apps/community/src/components/AppHeader.tsx](/Users/zakbay/Desktop/CodeBay/codebay/apps/community/src/components/AppHeader.tsx)`
  - `[apps/community/src/app/join/page.tsx](/Users/zakbay/Desktop/CodeBay/codebay/apps/community/src/app/join/page.tsx)`
  - `[apps/community/src/components/pages/about/AboutPageView.tsx](/Users/zakbay/Desktop/CodeBay/codebay/apps/community/src/components/pages/about/AboutPageView.tsx)`
  - dashboard section headers/pages with `CodingBay Community` wording
- Update remaining visible legacy labels (e.g. `CodeBay Insights`) where they appear in blog/discussion experiences.

### 4) Rebrand notification/email surfaces

- Update email template branding and CTA labels in `[apps/community/src/components/emails/FollowedCreatorsDigestEmail.tsx](/Users/zakbay/Desktop/CodeBay/codebay/apps/community/src/components/emails/FollowedCreatorsDigestEmail.tsx)`.
- Update digest subject text in `[apps/community/src/lib/newsletter/digest-job.ts](/Users/zakbay/Desktop/CodeBay/codebay/apps/community/src/lib/newsletter/digest-job.ts)`.
- Update unsubscribe/settings copy in `[apps/community/src/app/newsletter/unsubscribe/route.ts](/Users/zakbay/Desktop/CodeBay/codebay/apps/community/src/app/newsletter/unsubscribe/route.ts)`.

### 5) Replace fallback author/org naming

- Replace default/fallback `CodeBay`/`CodeBay Team` author strings in:
  - `[apps/community/src/lib/blog.ts](/Users/zakbay/Desktop/CodeBay/codebay/apps/community/src/lib/blog.ts)`
  - `[apps/community/src/lib/dashboard.ts](/Users/zakbay/Desktop/CodeBay/codebay/apps/community/src/lib/dashboard.ts)`
  - `[apps/community/src/lib/landing.ts](/Users/zakbay/Desktop/CodeBay/codebay/apps/community/src/lib/landing.ts)`
  - `[apps/community/src/components/pages/blog/ForYouSection.tsx](/Users/zakbay/Desktop/CodeBay/codebay/apps/community/src/components/pages/blog/ForYouSection.tsx)`

### 6) Align env examples and domain-sensitive placeholders

- Update domain examples in:
  - `[apps/community/.env.example](/Users/zakbay/Desktop/CodeBay/codebay/apps/community/.env.example)`
  - `[apps/codebay/.env.example](/Users/zakbay/Desktop/CodeBay/codebay/apps/codebay/.env.example)`
- Update placeholder email domain text where it reflects old brand:
  - `[apps/community/src/components/pages/community/CommunityAuthCard.tsx](/Users/zakbay/Desktop/CodeBay/codebay/apps/community/src/components/pages/community/CommunityAuthCard.tsx)`
  - `[packages/ui/src/AuthEmailPasswordForm.tsx](/Users/zakbay/Desktop/CodeBay/codebay/packages/ui/src/AuthEmailPasswordForm.tsx)`

### 7) SEO hardening for new domain

- Add `301` redirect rules from `codingbay.community/*` to `cirqit.space/$1` at hosting/edge layer (external, not code).
- Optionally add community `robots`/`sitemap` route files if missing to ensure clean domain migration signaling and explicit host references.
- Ensure canonical and OG URLs resolve to new domain in rendered HTML after env updates.

### 8) Verification and rollout safety

- Run targeted checks for app metadata, auth callback links, newsletter links, and blog canonical tags against staging with `NEXT_PUBLIC_COMMUNITY_SITE_URL=https://cirqit.space`.
- Validate no residual `codingbay.community`, `CodingBay`, or `CodeBay` strings in community runtime paths except intentional historical references.
- Smoke test login/OAuth, email magic links, blog sharing previews, unsubscribe/preferences links.

## Outside-This-Codebase Adjustments

- DNS and domain setup:
  - Provision `cirqit.space` + SSL.
  - Point DNS to hosting provider.
  - Keep `codingbay.community` active long enough for redirects.
- Hosting/platform config (e.g. Vercel/Netlify/Cloudflare):
  - Add new production domain.
  - Configure permanent wildcard redirects from old domain.
  - Update environment variables in each environment (`NEXT_PUBLIC_COMMUNITY_SITE_URL`, `NEXT_PUBLIC_MAIN_URL`, and `NEXT_PUBLIC_SITE_URL` if used by cron route).
- Supabase Auth configuration:
  - Update Site URL.
  - Add new callback/redirect URLs for email + OAuth on `cirqit.space`.
  - Keep old domain temporarily in allowlist during transition.
- OAuth providers (Google/GitHub/etc):
  - Update authorized redirect URIs to new callback domain.
- Email provider (Resend/Postmark/etc):
  - Verify sender domain, SPF/DKIM/DMARC for rebranded sending identity.
  - Update brand/display names in templates/provider settings.
- Search/indexing tools:
  - Google Search Console + Bing Webmaster: add/verify `cirqit.space` property.
  - Submit new sitemap; request re-crawl.
  - Use Change of Address workflow where supported.
- Analytics/monitoring/CDN services:
  - Update allowed domains and site URL settings (analytics, session replay, error tracking, CSP, rate limiting).
- Social/link preview platform settings:
  - Update organization/site URL in social profiles and OG validators.

## Rollout Sequence

1. Configure external platform/domain/auth prerequisites in staging.
2. Merge in-repo rebrand and URL-source changes.
3. Deploy with new env vars.
4. Enable production 301 redirects from old domain.
5. Submit search/index updates and monitor 404/auth errors for 1-2 weeks.
