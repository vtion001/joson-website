#!/usr/bin/env node
/**
 * watch-dev.js — Joson Website Dev Watcher
 *
 * Watches for file changes and automatically:
 *   1. Captures Playwright screenshots of affected pages
 *   2. Writes to a queue file for OpenClaw agent to deliver via Telegram
 *
 * Usage: node scripts/watch-dev.js
 * (Run from the joson-website root directory)
 *
 * Requirements:
 *   - Dev server running (npm run dev)
 *   - playwright installed (npm i -D playwright)
 */

"use strict";
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const crypto = require("crypto");

// ─── Config ───────────────────────────────────────────────────────────────────

const REPO_ROOT = process.cwd();
const DEV_URL = "http://localhost:3000";
const QUEUE_FILE = "/tmp/joson-watch-queue.json";
const DEBOUNCE_MS = 2500;    // Wait after last change before shooting
const COOLDOWN_MS = 45000;   // Min 45s between Telegram sends
const SESSION_SECRET = process.env.SESSION_SECRET || "joson-admin-secret-2026";
const COOKIE_NAME = "admin_session";
const MAX_PAGES_PER_RUN = 5;  // Cap screenshots per trigger to avoid spam

// ─── Page mapping: file → URL(s) ─────────────────────────────────────────────

const PAGE_MAP = [
  // Admin — dashboard & shared components
  { patterns: ["app/admin/page.tsx"], pages: [{ url: "/admin", label: "Dashboard" }] },
  { patterns: ["components/admin/stat-card.tsx"], pages: [{ url: "/admin", label: "Dashboard" }] },
  { patterns: ["components/admin/analytics-dashboard.tsx"], pages: [{ url: "/admin", label: "Dashboard" }] },
  { patterns: ["components/admin/recent-inquiries.tsx"], pages: [{ url: "/admin", label: "Dashboard" }] },
  { patterns: ["components/admin/admin-estimator-panel.tsx"], pages: [{ url: "/admin", label: "Dashboard" }] },
  { patterns: ["components/admin/admin-side-panel.tsx"], pages: [{ url: "/admin", label: "Dashboard" }] },
  // Admin — individual pages
  { patterns: ["app/admin/inquiries/page.tsx"], pages: [{ url: "/admin/inquiries", label: "Inquiries" }] },
  { patterns: ["app/admin/projects/page.tsx"], pages: [{ url: "/admin/projects", label: "Projects" }] },
  { patterns: ["app/admin/products/page.tsx"], pages: [{ url: "/admin/products", label: "Products" }] },
  { patterns: ["app/admin/blog/page.tsx"], pages: [{ url: "/admin/blog", label: "Blog" }] },
  { patterns: ["app/admin/fabricators/page.tsx"], pages: [{ url: "/admin/fabricators", label: "Fabricators" }] },
  { patterns: ["app/admin/crm/page.tsx"], pages: [{ url: "/admin/crm", label: "CRM" }] },
  { patterns: ["app/admin/clients/page.tsx"], pages: [{ url: "/admin/clients", label: "Clients" }] },
  { patterns: ["app/admin/social/page.tsx"], pages: [{ url: "/admin/social", label: "Social Planner" }] },
  { patterns: ["app/admin/email/page.tsx"], pages: [{ url: "/admin/email", label: "Email" }] },
  { patterns: ["app/admin/conversations/page.tsx"], pages: [{ url: "/admin/conversations", label: "Conversations" }] },
  { patterns: ["app/admin/settings/page.tsx"], pages: [{ url: "/admin/settings", label: "Settings" }] },
  { patterns: ["app/admin/help/page.tsx"], pages: [{ url: "/admin/help", label: "Help" }] },
  { patterns: ["app/admin/project-management/page.tsx"], pages: [{ url: "/admin/project-management", label: "Project Mgmt" }] },
  // Public pages
  { patterns: ["app/page.tsx", "components/header.tsx", "components/footer.tsx", "app/layout.tsx"], pages: [{ url: "/", label: "Homepage" }] },
  { patterns: ["app/products/page.tsx"], pages: [{ url: "/products", label: "Products" }] },
  { patterns: ["app/services/page.tsx"], pages: [{ url: "/services", label: "Services" }] },
  { patterns: ["app/about/page.tsx"], pages: [{ url: "/about", label: "About" }] },
  { patterns: ["app/contact/page.tsx"], pages: [{ url: "/contact", label: "Contact" }] },
  { patterns: ["app/gallery/page.tsx"], pages: [{ url: "/gallery", label: "Gallery" }] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function log(msg) {
  const ts = new Date().toISOString().slice(11, 23);
  console.log(`[${ts}] ${msg}`);
}

function getPages(file) {
  for (const entry of PAGE_MAP) {
    for (const p of entry.patterns) {
      if (file.includes(p)) return entry.pages;
    }
  }
  return null;
}

function makeToken() {
  const b64 = (input) =>
    Buffer.from(input).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const payload = { provider: "credentials", email: "admin@joson.com", ts: Date.now() };
  const data = b64(JSON.stringify(payload));
  const sig = b64(crypto.createHmac("sha256", SESSION_SECRET).update(data).digest());
  return data + "." + sig;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function writeQueue(items) {
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(items, null, 2));
  log(`   📋 Queue written: ${QUEUE_FILE}`);
}

function readQueue() {
  if (!fs.existsSync(QUEUE_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(QUEUE_FILE, "utf8"));
  } catch {
    return [];
  }
}

// ─── Playwright capture ───────────────────────────────────────────────────────

async function capturePage(browser, url, label) {
  const context = await browser.newContext({ ignoreHttpsErrors: true });
  if (url.startsWith("/admin")) {
    await context.addCookies([
      { name: COOKIE_NAME, value: makeToken(), domain: "localhost", path: "/", httpOnly: true },
    ]);
  }

  const page = await context.newPage();
  const id = `${Date.now()}-${label.replace(/\s+/g, "-").toLowerCase()}`;
  const outputPath = `/tmp/joson-watch-${id}.png`;

  try {
    await page.goto(`${DEV_URL}${url}`, { waitUntil: "load", timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: outputPath, fullPage: false });
    log(`   ✓$ ${label}`);
    return { file: outputPath, label, url };
  } catch (err) {
    log(`   ⚠ ${label}: ${err.message}`);
    return null;
  } finally {
    await context.close();
  }
}

async function captureAll(pages) {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });
  const results = [];
  for (const p of pages.slice(0, MAX_PAGES_PER_RUN)) {
    const r = await capturePage(browser, p.url, p.label);
    if (r) results.push(r);
  }
  await browser.close();
  return results;
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n╔══════════════════════════════════════╗`);
  console.log(`║   Joson Dev Watcher — v1.0           ║`);
  console.log(`╚══════════════════════════════════════╝\n`);

  // Verify dev server
  try {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), 3000);
    const res = await fetch(`${DEV_URL}`, { signal: ctrl.signal });
    clearTimeout(id);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch {
    log(`✖ Dev server NOT running at ${DEV_URL}`);
    log("  Start it first:  npm run dev\n");
    process.exit(1);
  }
  log(`✓ Dev server running at ${DEV_URL}`);
  log(`✓ Watching: app/ and components/`);
  log(`✓ Queue file: ${QUEUE_FILE}`);
  log("  Open http://localhost:3000/admin in browser\n");
  log("  Press Ctrl+C to stop\n");

  let debounceTimer = null;
  let pendingFiles = new Set();
  let lastSendTime = 0;

  const shoot = async () => {
    const files = Array.from(pendingFiles);
    pendingFiles.clear();

    // Collect affected pages
    const pageMap = new Map();
    for (const f of files) {
      const pages = getPages(f);
      if (pages) {
        for (const p of pages) pageMap.set(p.url, p);
      }
    }

    if (pageMap.size === 0) {
      log("  No tracked pages affected — skipping");
      return;
    }

    const pages = Array.from(pageMap.values());
    log(`▶ Change detected — capturing ${pages.length} page(s)...`);

    const captured = await captureAll(pages);

    if (captured.length === 0) return;

    const changedFiles = files
      .map((f) => `  • ${f.replace(REPO_ROOT + "/", "")}`)
      .join("\n");
    const pageNames = captured.map((c) => `• ${c.label}`).join("\n");

    const now = Date.now();
    if (now - lastSendTime > COOLDOWN_MS) {
      const queueItems = captured.map((c) => ({
        id: Date.now(),
        label: c.label,
        url: c.url,
        screenshotPath: c.file,
        changedFiles: changedFiles,
        timestamp: new Date().toISOString(),
      }));
      writeQueue(queueItems);
      lastSendTime = now;
      log(`✓ Queue updated — OpenClaw agent will send to Telegram`);
    } else {
      const remaining = Math.round((COOLDOWN_MS - (now - lastSendTime)) / 1000);
      log(`⏳ Cooldown active (${remaining}s left) — skipping Telegram`);
    }
  };

  const watch = (dir) => {
    fs.watch(dir, { recursive: true }, (evt, fname) => {
      if (!fname) return;
      if (
        fname.includes(".next/") ||
        fname.includes(".git/") ||
        fname.includes("node_modules/") ||
        fname.endsWith(".map") ||
        fname.includes("__pycache__") ||
        fname.includes(".css") ||
        fname.includes(".next-ts")
      )
        return;

      const fullPath = path.join(dir, fname);
      pendingFiles.add(fullPath);
      process.stdout.write(`\r\u001b[2K  ✏️  ${fname}   `);

      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(shoot, DEBOUNCE_MS);
    });
  };

  watch(path.join(REPO_ROOT, "app"));
  watch(path.join(REPO_ROOT, "components"));

  process.on("SIGINT", () => {
    console.log("\n\n✓ Watcher stopped");
    process.exit(0);
  });
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
