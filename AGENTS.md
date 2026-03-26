# AGENTS.md - Joson Furniture Website

This is a Next.js 14 + TypeScript project for Joson Furniture, a Filipino furniture e-commerce site.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Forms**: React Hook Form + Zod
- **Testing**: Playwright (e2e), @axe-core/playwright (accessibility)
- **Package Manager**: npm

## Essential Commands

```bash
# Install dependencies
npm install

# Development
npm run dev              # Start dev server on localhost:3000
npm run build           # Build for production
npm run start           # Start production server

# Linting
npm run lint            # Run ESLint (Next.js ESLint with core-web-vitals rules)

# Testing
npm run test:e2e                    # Run Playwright e2e tests
npm run test:e2e --project=chromium # Run on specific browser only
npm run test:estimator               # Run estimator script tests
npm run test:fabricators             # Run fabricators script tests

# Run a single test file
npx playwright test tests/conversations.spec.ts

# Run a single test by name
npx playwright test --grep "test name"

# E2E server (manual testing on port 3010, no auth)
npm run start:e2e
```

## Code Style Guidelines

### TypeScript Conventions

- **Strict mode enabled** in tsconfig.json
- Use explicit types for function parameters and return values
- Prefer `interface` over `type` for object shapes
- Use `ClassValue` from `clsx` for className prop types

### Component Patterns

```typescript
// Client components must have "use client" directive
"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  title: string
  href: string
  items?: Array<{ name: string; href: string }>
}

export default function ProductCard({ title, href, items = [] }: ProductCardProps) {
  return (
    <Link href={href}>
      <Button aria-label={`Browse ${title}`}>{title}</Button>
    </Link>
  )
}
```

### API Route Patterns

```typescript
import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import path from "path"

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "projects.json")
    const raw = await readFile(filePath, "utf-8")
    const data = JSON.parse(raw)
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: "Failed to load projects" }, { status: 500 })
  }
}
```

### Import Organization

```typescript
// 1. React / Next.js imports
import React, { useState, useEffect } from "react"
import Link from "next/link"

// 2. Third-party library imports (alphabetical)
import { clsx, type ClassValue } from "clsx"
import { format } from "date-fns"
import { MoreHorizontal } from "lucide-react"

// 3. shadcn/ui components (@ alias)
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// 4. Local utilities and data
import { cn } from "@/lib/utils"
import { projects } from "@/lib/projects-data"
```

### Tailwind CSS

- Use `@/` path alias for imports (`@/components/...`, `@/lib/...`)
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Use design system tokens: `text-primary`, `bg-background`, `border-border`
- Use `container mx-auto px-4 max-w-7xl` for page sections
- Use `text-muted-foreground` for secondary text

### Accessibility

- Always include `aria-label` on interactive elements without visible text
- Use semantic HTML (`<section>`, `<article>`, `<nav>`, `<main>`)
- Add `aria-labelledby` to sections with headings
- Use `role` attributes where semantic HTML isn't sufficient
- Include `alt` text on images, `loading="lazy" decoding="async"`
- Test with `@axe-core/playwright` for WCAG 2A/2AA compliance

### File Naming

- Components: `PascalCase.tsx` (e.g., `Header.tsx`)
- Utils/lib: `kebab-case.ts` or `camelCase.ts`
- Pages/routes: `kebab-case/page.tsx`
- Test files: `*.spec.ts`

## Project Structure

```
joson-website/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Home page
│   ├── products/          # Product pages
│   ├── projects/          # Project showcase pages
│   ├── admin/             # Admin dashboard pages
│   └── api/               # API routes
├── components/
│   └── ui/                # shadcn/ui components (Button, Card, etc.)
├── lib/                   # Utilities and data
│   ├── utils.ts           # cn() helper (clsx + tailwind-merge)
│   ├── auth.ts            # Authentication utilities
│   └── projects-data.ts   # Static project data
├── data/                  # JSON data files
├── tests/                 # Playwright e2e tests
└── docs/                  # Documentation
```

## Environment Variables

- `SKIP_AUTH=1` - Skip authentication in e2e tests
- `PLAYWRIGHT_BASE_URL` - Base URL for tests (default: http://localhost:3010)

## Testing Patterns

```typescript
import { test, expect } from '@playwright/test'
import { AxeBuilder } from '@axe-core/playwright'

test('page loads and is accessible', async ({ page }) => {
  await page.goto('/path')
  
  // Accessibility scan
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze()
  expect(results.violations).toEqual([])
})
```
