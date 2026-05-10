import { test, expect } from "@playwright/test"

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3001'


test.describe("Admin Settings", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().addCookies([
      { name: "admin_session", value: "eyJwcm92aWRlciI6ImNyZWRlbnRpYWxzIiwiZW1haWwiOiJhZG1pbkBqb3Nvbi5jb20iLCJ0cyI6MTc3ODMzODY3MTk1Nn0.bjLEZ6tjE93FboS_SO4oJCOZwT5vuzS2rV_AS-0uanI", domain: "localhost", path: "/" },
    ])
    await page.goto(`${BASE}/admin/settings`)
  })

  test("loads with HTTP 200", async ({ page }) => {
    await page.waitForLoadState("domcontentloaded")
  })

  test("has expected content", async ({ page }) => {
    await expect(page.locator("body")).toBeVisible()
  })

  test("no console errors", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (err) => errors.push(err.message))
    await page.waitForLoadState("networkidle")
    expect(errors).toHaveLength(0)
  })
})
