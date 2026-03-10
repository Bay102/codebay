## Learned User Preferences

- Prefer professional, technical communication focused on React and TypeScript development.
- Prefer precise React 18+ and modern TypeScript terminology when discussing architecture or implementation details.
- Prefer type-safe implementations with strict TypeScript patterns and avoid loose typing unless absolutely necessary.
- Prioritize performance optimization and clean code principles in React and TypeScript changes.

## Learned Workspace Facts

- `codebay` is a monorepo with app code under `apps/*` and shared packages under `packages/*`.
- The community app lives in `apps/community` and its local dev server runs on port `3002`.
- The blog creation dashboard route in the community app is `apps/community/src/app/dashboard/blog/new/page.tsx`.
- Shared UI components are commonly sourced from `@codebay/ui`.
- Tailwind responsive utilities in this workspace should use mobile-first order: base, `sm`, `md`, `lg`, `xl`, `2xl`.
- Prefer small, focused components and avoid large “god components”; extract reusable UI by feature when files grow too large.
