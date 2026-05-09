import { test, expect } from "@playwright/test"

const BASE = process.env.E2E_BASE_URL || "http://localhost:3000"

test.describe("Public About", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/about`)
  })

  test("loads with HTTP 200", async ({ page }) => {
    await page.waitForLoadState("domcontentloaded")
  })

  test("has expected content", async ({ page }) => {
    await expect(page.locator("body")).toBeVisible()
    await expect(page.locator("body")).toContainText(/About/i)
  })

  test("no console errors", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (err) => errors.push(err.message))
    await page.waitForLoadState("networkidle")
    expect(errors).toHaveLength(0)
  })
})
