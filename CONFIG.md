# Configuration Guide

This document explains the core configuration settings for the CodeBay application. Understanding these configurations will help you customize the application to your needs.

## Table of Contents

- [Environment Variables](#environment-variables)
- [Vite Configuration](#vite-configuration)
- [TypeScript Configuration](#typescript-configuration)
- [Tailwind CSS Configuration](#tailwind-css-configuration)
- [PostCSS Configuration](#postcss-configuration)
- [ESLint Configuration](#eslint-configuration)
- [Component Configuration (shadcn/ui)](#component-configuration-shadcnui)
- [Testing Configuration (Vitest)](#testing-configuration-vitest)
- [Supabase Edge Functions Configuration](#supabase-edge-functions-configuration)

---

## Environment Variables

**File:** `.env` (create from `.env.example`)

### Required Variables

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Secrets

The OpenAI API key is configured as a Supabase secret (not in `.env`):

```bash
supabase secrets set OPENAI_API_KEY=your_openai_api_key
```

### Usage

Environment variables prefixed with `VITE_` are exposed to the client-side code via `import.meta.env`. The Supabase client (`src/lib/supabase.ts`) reads these values at runtime.

---

## Vite Configuration

**File:** `vite.config.ts`

### Key Settings

- **Server Configuration:**
  - Host: `::` (listens on all network interfaces)
  - Port: `8080`
  - HMR Overlay: Disabled (`overlay: false`)

- **Plugins:**
  - `@vitejs/plugin-react-swc`: React plugin using SWC for fast compilation
  - `lovable-tagger`: Component tagging plugin (development only)

- **Path Aliases:**
  - `@/*` → `./src/*` (enables `@/components`, `@/lib`, etc.)

### Development Server

```bash
npm run dev  # Starts dev server on http://localhost:8080
```

---

## TypeScript Configuration

The project uses a multi-config setup with three TypeScript configuration files:

### Root Config (`tsconfig.json`)

- **Purpose:** Base configuration that references app and node configs
- **Key Settings:**
  - Path aliases: `@/*` → `./src/*`
  - Relaxed strictness: `noImplicitAny: false`, `strictNullChecks: false`
  - Excludes: `supabase` directory

### App Config (`tsconfig.app.json`)

- **Purpose:** TypeScript configuration for application source code
- **Target:** ES2020
- **JSX:** React JSX transform (`react-jsx`)
- **Module Resolution:** Bundler mode (for Vite)
- **Strict Mode:** Disabled (relaxed for faster development)
- **Includes:** `src` directory

### Node Config (`tsconfig.node.json`)

- **Purpose:** TypeScript configuration for Node.js scripts (e.g., `vite.config.ts`)
- **Target:** ES2022
- **Strict Mode:** Enabled
- **Includes:** `vite.config.ts`

---

## Tailwind CSS Configuration

**File:** `tailwind.config.ts`

### Theme Configuration

- **Dark Mode:** Class-based (`darkMode: ["class"]`)
- **Content Paths:** Scans `./src/**/*.{ts,tsx}` and other common paths

### Custom Theme Extensions

#### Fonts

- **Sans:** Inter (300, 400, 500, 600)
- **Display:** Plus Jakarta Sans (300, 400, 500, 600, 700)

#### Color System

Uses CSS variables (HSL format) defined in `src/index.css`:

- `primary`: Orange accent (`hsl(24, 95%, 53%)`)
- `accent`: Matching primary color
- `background`: Black (`hsl(0, 0%, 0%)`)
- `foreground`: White (`hsl(0, 0%, 100%)`)
- Additional semantic colors: `secondary`, `muted`, `destructive`, `card`, `popover`

#### Border Radius

- Uses CSS variable `--radius` (0.5rem)
- Calculated variants: `md` (radius - 2px), `sm` (radius - 4px)

#### Custom Animations

- `pulse-glow`: Opacity pulse animation (3s)
- `float`: Vertical float animation (6s)
- `accordion-down/up`: Radix UI accordion animations

### Plugins

- `tailwindcss-animate`: Provides animation utilities

---

## PostCSS Configuration

**File:** `postcss.config.js`

### Plugins

- **tailwindcss:** Processes Tailwind directives
- **autoprefixer:** Adds vendor prefixes for browser compatibility

---

## ESLint Configuration

**File:** `eslint.config.js`

### Configuration Stack

- Base: `@eslint/js` recommended config
- TypeScript: `typescript-eslint` recommended config
- React: React Hooks and React Refresh plugins

### Key Rules

- React Hooks rules enforced
- React Refresh: Warns on non-component exports (allows constants)
- TypeScript unused vars: Disabled (`@typescript-eslint/no-unused-vars: "off"`)

### Ignored Paths

- `dist` directory (build output)

---

## Component Configuration (shadcn/ui)

**File:** `components.json`

### Settings

- **Style:** `default`
- **RSC:** `false` (not using React Server Components)
- **TSX:** `true`

### Tailwind Integration

- **Config:** `tailwind.config.ts`
- **CSS:** `src/index.css`
- **Base Color:** `slate`
- **CSS Variables:** Enabled
- **Prefix:** None (empty string)

### Path Aliases

- `components`: `@/components`
- `utils`: `@/lib/utils`
- `ui`: `@/components/ui`
- `lib`: `@/lib`
- `hooks`: `@/hooks`

---

## Testing Configuration (Vitest)

**File:** `vitest.config.ts`

### Test Environment

- **Environment:** `jsdom` (simulates browser DOM)
- **Globals:** Enabled (no need to import `describe`, `it`, etc.)
- **Setup File:** `src/test/setup.ts`

### Test Patterns

- **Include:** `src/**/*.{test,spec}.{ts,tsx}`
- **Path Alias:** `@` → `./src` (matches Vite config)

### Usage

```bash
npm run test        # Run tests once
npm run test:watch  # Run tests in watch mode
```

---

## Supabase Edge Functions Configuration

### Deno Configuration (`supabase/functions/deno.json`)

- **Runtime:** Deno
- **Strict Mode:** Enabled
- **Standard Library:** Deno std@0.168.0

### TypeScript Configuration (`supabase/functions/tsconfig.json`)

- **Strict Mode:** Enabled
- **Allow JS:** Enabled
- **No Implicit Any:** Disabled
- **Includes:** All `.ts` files and `deno.d.ts`

### Edge Functions

### (Don't forget to sync edge functions with supabase after making any changes to them)

- npx supabase functions deploy chat
- npx supabase functions deploy connect-human

The project includes Supabase Edge Functions:

- `chat`: Handles chat message processing
- `connect-human`: Handles human connection requests

### Secrets Management

Set secrets using the Supabase CLI:

```bash
supabase secrets set OPENAI_API_KEY=your_key_here
```

---

## CSS Variables (Design System)

**File:** `src/index.css`

### Color Variables

All colors use HSL format without the `hsl()` wrapper:

```css
--primary: 24 95% 53%; /* Orange */
--accent: 24 95% 53%; /* Matching primary */
--background: 0 0% 0%; /* Black */
--foreground: 0 0% 100%; /* White */
--radius: 0.5rem; /* Border radius */
```

### Custom CSS Classes

- `.glass-nav`: Glass morphism effect with backdrop blur
- `.liquid-glass-nav`: Enhanced glass effect with shimmer animation
- `.liquid-indicator`: Gradient indicator with glass effect
- `.gradient-text`: Gradient text effect
- `.gradient-btn`: Gradient button with hover effects
- `.icon-btn`: Icon button styling
- `.video-placeholder`: Radial gradient background

### Font Loading

Google Fonts are loaded via `@import`:

- Inter (sans-serif)
- Plus Jakarta Sans (display font)

---

## Summary

### Quick Reference

| Config File          | Purpose               | Key Setting                                   |
| -------------------- | --------------------- | --------------------------------------------- |
| `.env`               | Environment variables | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| `vite.config.ts`     | Build tool config     | Port 8080, path aliases                       |
| `tsconfig.app.json`  | App TypeScript config | ES2020, relaxed strictness                    |
| `tailwind.config.ts` | Styling config        | Custom colors, animations                     |
| `components.json`    | shadcn/ui config      | Path aliases, CSS variables                   |
| `vitest.config.ts`   | Test config           | jsdom environment                             |
| `eslint.config.js`   | Linting config        | React + TypeScript rules                      |

### Development Workflow

1. **Setup:** Copy `.env.example` to `.env` and fill in Supabase credentials
2. **Development:** Run `npm run dev` (starts on port 8080)
3. **Testing:** Run `npm run test:watch` for TDD
4. **Building:** Run `npm run build` for production build
5. **Linting:** Run `npm run lint` to check code quality

---

For more information about specific configurations, refer to the official documentation:

- [Vite](https://vitejs.dev/config/)
- [TypeScript](https://www.typescriptlang.org/tsconfig)
- [Tailwind CSS](https://tailwindcss.com/docs/configuration)
- [shadcn/ui](https://ui.shadcn.com/docs)
- [Vitest](https://vitest.dev/config/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
