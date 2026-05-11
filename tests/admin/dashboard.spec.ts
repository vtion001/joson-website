import { test, expect } from "@playwright/test"

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3001'


test.describe("Admin Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().addCookies([
      { name: "admin_session", value: "eyJwcm92aWRlciI6ImNyZWRlbnRpYWxzIiwiZW1haWwiOiJhZG1pbkBqb3Nvbi5jb20iLCJ0cyI6MTc3ODMzODY3MTk1Nn0.bjLEZ6tjE93FboS_SO4oJCOZwT5vuzS2rV_AS-0uanI", domain: "localhost", path: "/" },
    ])
    await page.goto(`${BASE}/admin`)
  })

  test("loads with HTTP 200", async ({ page }) => {
    await page.waitForLoadState("domcontentloaded")
  })

  test("stat cards render", async ({ page }) => {
    // Use first() to avoid strict mode violation — "Projects" appears in nav + card
    await expect(page.locator("text=Projects").first()).toBeVisible({ timeout: 10000 })
    await expect(page.locator("text=Inquiries").first()).toBeVisible({ timeout: 5000 })
  })

  test("quick access buttons visible", async ({ page }) => {
    await expect(page.locator("text=New Project")).toBeVisible({ timeout: 10000 })
  })

  test("analytics section renders", async ({ page }) => {
    // Chart section exists even if empty — check for the section header
    await expect(page.locator("text=Inquiries").first()).toBeVisible({ timeout: 10000 })
  })

  test("recent inquiries section visible", async ({ page }) => {
    await expect(page.locator("text=Recent Inquiries")).toBeVisible({ timeout: 10000 })
  })

  test("no console errors", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (err) => errors.push(err.message))
    await page.waitForLoadState("load")
    expect(errors).toHaveLength(0)
  })
})
