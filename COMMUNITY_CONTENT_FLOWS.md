## Community Content Flows

This content has been split into focused docs under `docs/community-content-flows/` to keep flow documentation maintainable and easier to navigate.

## Flow Docs Index

- [`docs/community-content-flows/landing-page-flows.md`](docs/community-content-flows/landing-page-flows.md)
  - Landing sections, featured blog posts, trending discussions/profiles/topics, and "For you" behavior.
- [`docs/community-content-flows/explore-flows.md`](docs/community-content-flows/explore-flows.md)
  - `/explore` behavior branches, query model, and shared filtering/sorting semantics.
- [`docs/community-content-flows/scored-content-discovery.md`](docs/community-content-flows/scored-content-discovery.md)
  - Shared score model (`hot` / `quality`), score params, and score-driven UI.
- [`docs/community-content-flows/followed-creators-newsletter.md`](docs/community-content-flows/followed-creators-newsletter.md)
  - Digest settings, job execution, idempotency, environment requirements, and testing.

## Source Coverage

These docs describe logic primarily in:

- `apps/community/src/app/page.tsx`
- `apps/community/src/lib/landing.ts`
- `apps/community/src/lib/discussions.ts`
- `apps/community/src/app/explore/page.tsx`
- `apps/community/src/lib/newsletter/digest-job.ts`

plus related route handlers and UI components.

