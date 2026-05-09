# Joson Dev Watcher

## Overview

Automatically captures Playwright screenshots when code changes are detected and sends them to Telegram.

## Components

1. **`scripts/watch-dev.js`** — File watcher + screenshot capture (Node.js, runs in background)
2. **OpenClaw cron job** — Reads queue and delivers screenshots to Telegram every 60s

## Setup

### 1. Start the dev server
```bash
cd ~/Desktop/REPOSITORY/joson-website
npm run dev
```

### 2. Start the watcher
```bash
cd ~/Desktop/REPOSITORY/joson-website
node scripts/watch-dev.js
```

### 3. Cron job (auto-configured, runs every 60s)
The watcher writes screenshots to `/tmp/joson-watch-queue.json`. An OpenClaw cron agent picks these up and sends them to Telegram.

## How it works

```
File change detected
  → debounce 2.5s
  → Playwright captures affected pages
  → writes to /tmp/joson-watch-queue.json
  → OpenClaw cron (60s) reads queue
  → sends screenshots to Telegram (Vincent)
  → clears queue
```

## Page → URL mapping

| File changed | Pages captured |
|---|---|
| `app/admin/page.tsx` + admin components | Dashboard |
| `app/admin/inquiries/page.tsx` | Inquiries |
| `app/admin/projects/page.tsx` | Projects |
| `app/admin/products/page.tsx` | Products |
| `app/admin/blog/page.tsx` | Blog |
| `app/admin/fabricators/page.tsx` | Fabricators |
| `app/admin/crm/page.tsx` | CRM |
| `app/admin/clients/page.tsx` | Clients |
| `app/admin/social/page.tsx` | Social Planner |
| `app/admin/email/page.tsx` | Email |
| `app/admin/conversations/page.tsx` | Conversations |
| `app/admin/settings/page.tsx` | Settings |
| `app/admin/help/page.tsx` | Help |
| `app/page.tsx`, header/footer | Homepage |
| `app/products/page.tsx` | Products (public) |
| `app/services/page.tsx` | Services |
| `app/about/page.tsx` | About |
| `app/contact/page.tsx` | Contact |
| `app/gallery/page.tsx` | Gallery |

## Cooldown

Max 1 Telegram delivery per 45 seconds to prevent spam during rapid edits.

## Stop

```bash
# Find and kill the watcher
ps aux | grep watch-dev
kill <PID>
```
