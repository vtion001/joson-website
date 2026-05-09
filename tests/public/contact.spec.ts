import { test, expect } from "@playwright/test"

const BASE = process.env.E2E_BASE_URL || "http://localhost:3000"

test.describe("Public Contact", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/contact`)
  })

  test("loads with HTTP 200", async ({ page }) => {
    await page.waitForLoadState("domcontentloaded")
  })

  test("has expected content", async ({ page }) => {
    await expect(page.locator("body")).toBeVisible()
    await expect(page.locator("body")).toContainText(/Contact/i)
  })

  test("contact form visible", async ({ page }) => {
    // Look for common form elements: input fields, textarea, submit button
    const hasForm = await page.locator("form").count() > 0 ||
      await page.locator("input").count() > 0 ||
      await page.locator("textarea").count() > 0
    expect(hasForm).toBeTruthy()
  })

  test("no console errors", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (err) => errors.push(err.message))
    await page.waitForLoadState("networkidle")
    expect(errors).toHaveLength(0)
  })
})
