# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Joson Furniture Website — a Next.js 14 + TypeScript e-commerce site for a Filipino furniture brand. The site includes a public storefront (`/`), admin CMS (`/admin/*`), cost estimator (`/calculator`), blog (`/blog/*`), and AI-powered features (autofill, image generation via OpenAI).

## Related Documentation

- `AGENTS.md` — Detailed code patterns, component conventions, accessibility guidelines, and import order for implementation work.
- `coordination.md` — Task coordination, branch strategy, commit conventions, and multi-agent communication protocols.

## Project Name

`package.json` name is `"my-v0-project"` — should be `"joson-website"`.

## Path Alias

`@/*` maps to the repo root. Use it for all imports:
```typescript
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
```

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint with Next.js core-web-vitals rules (ESLint 9 flat config)
npm run test:e2e     # Playwright e2e tests
npm run start:e2e    # Start prod server on port 3010 (no auth, for manual testing)
npx playwright test tests/<file>.spec.ts           # Run single test file
npx playwright test --grep "test name"             # Run tests matching name
npm run test:estimator    # Run estimator cost calculation tests
npm run test:fabricators  # Run fabricators script tests
```

## Architecture

### App Router Structure
- `app/` — Next.js 14 App Router pages
- `app/page.tsx` — Home page
- `app/products/` — Product catalog pages (wardrobes, kitchen-cabinets, etc.)
- `app/projects/` — Project showcase with dynamic `[id]` routes
- `app/calculator/` — Cost estimator page
- `app/admin/` — Admin CMS dashboard (protected by auth)
- `app/api/` — API routes for data operations, uploads, AI, OAuth
- `app/blog/` — Blog with dynamic `[slug]` routes

### Authentication
- **Edge-compatible**: `middleware.ts` uses Web Crypto API (`crypto.subtle`) for session verification at the edge
- **Server-side**: `lib/auth.ts` uses Node.js `crypto` for the same operations in Server Components
- Session is a HMAC-SHA256 signed cookie (`admin_session`)
- Auth is skipped when `SKIP_AUTH=1` env var is set (e2e testing)
- Admin login page at `/admin/login` bypasses auth check (it's the login form itself)

### Data Storage
- All data stored as JSON files in `/data/` directory
- Key files: `products.json`, `projects.json`, `blog.json`, `inquiries.json`, `crm.json`, `conversations.json`, `fabricators.json`, `calculator-pricing.json`
- API routes read/write these files directly with `fs/promises`
- `lib/file-utils.ts` provides `atomicWrite()` with a file-based lock to prevent race conditions during concurrent writes
- No external database — files are the source of truth

### Image Handling
- Images hosted on Cloudinary (configured in `lib/cloudinary.ts`)
- Next.js image optimization disabled (`unoptimized: true` in next.config.mjs)
- Remote patterns: `res.cloudinary.com` and `images.unsplash.com`

### Key API Routes
- `app/api/products/route.ts` — CRUD for products
- `app/api/inquiries/route.ts` — Form submissions with file attachments
- `app/api/cloudinary/upload/route.ts` — Image uploads
- `app/api/ai/autofill/route.ts` — AI-powered form autofill (OpenAI)
- `app/api/gmail/send/route.ts` — Email via Gmail OAuth
- `app/api/oauth/google/callback/route.ts` — OAuth flow handler

### Components
- `components/ui/` — shadcn/ui component library (Button, Card, Dialog, etc.)
- `components/admin/` — Admin-specific components (side panel, toasts, estimator panel)
- `components/header.tsx` / `components/footer.tsx` — Site-wide navigation and footer
- `components/search-modal.tsx` — Global search overlay
- `components/live-chat.tsx` — Customer chat widget
- `components/conditional-header.tsx` / `components/conditional-footer.tsx` — Conditional rendering: admin header/footer on `/admin/*` routes, public header/footer on all other routes

### Utilities
- `lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)
- `lib/auth.ts` — Session sign/verify with HMAC-SHA256 (Node.js crypto)
- `lib/cloudinary.ts` — Cloudinary configuration and signature generation
- `lib/estimator.js` — Cost estimation logic (pure JS, shared between Next.js browser context and Node.js scripts — do not convert to TypeScript)
- `lib/file-utils.ts` — Atomic file writes with locking, safe JSON parsing

### Storybook
- `.storybook/` — Storybook configuration (devDependencies installed, no npm script configured)
- `stories/` — Story stories

## Environment Variables

```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
SESSION_SECRET=<min-32-char-secret>
GOOGLE_CLIENT_ID=<oauth-client-id>
GOOGLE_CLIENT_SECRET=<oauth-secret>
ADMIN_EMAIL=<admin-email>
OPENAI_API_KEY=<sk-...>
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>
SKIP_AUTH=1  # Skip auth in e2e tests (never commit changes requiring this)
PLAYWRIGHT_BASE_URL=http://localhost:3010  # For e2e tests
```

## TypeScript Conventions

- Strict mode enabled
- Prefer `interface` over `type` for object shapes
- Use `ClassValue` from `clsx` for `className` prop types
- Explicit return types on public functions
- Tailwind CSS v4 (uses `@tailwindcss/postcss`, not the v3-style `tailwind.config.js`)

## Import Order

1. React / Next.js imports
2. Third-party libraries (alphabetical)
3. shadcn/ui components (`@/components/ui/...`)
4. Local utilities and data (`@/lib/...`, `@/data/...`)

## Accessibility Requirements

- Always add `aria-label` on interactive elements without visible text
- Use semantic HTML (`<main>`, `<nav>`, `<section>`, `<article>`)
- Include `alt` text and `loading="lazy" decoding="async"` on images
- Test with `@axe-core/playwright` for WCAG 2A/2AA compliance
