import { test, expect } from "@playwright/test"

const BASE = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000"

test.describe("Admin Login", () => {
  test("login page loads with HTTP 200", async ({ page }) => {
    const res = await page.goto(`${BASE}/admin/login`)
    expect(res?.status()).toBe(200)
  })

  test("login page has required form elements", async ({ page }) => {
    await page.goto(`${BASE}/admin/login`)
    // Check form fields exist in the HTML (server-rendered)
    const html = await page.content()
    expect(html).toContain('name="email"')
    expect(html).toContain('name="password"')
    expect(html).toContain("Sign in")
  })

  test("login page renders without redirect loop", async ({ page }) => {
    await page.goto(`${BASE}/admin/login`)
    // Should NOT redirect infinitely — verify URL stays at /admin/login
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test("admin dashboard accessible with valid session", async ({ page }) => {
    // Set a pre-signed valid session cookie
    await page.context().addCookies([
      { name: "admin_session", value: "eyJwcm92aWRlciI6ImNyZWRlbnRpYWxzIiwiZW1haWwiOiJhZG1pbkBqb3Nvbi5jb20iLCJ0cyI6MTc3ODMwNTM3NzY4OX0.GNuXoDJvPx6Qa48pxHs99g3XRZNMZF98mWyYLY5gw14", domain: "localhost", path: "/" },
    ])
    await page.goto(`${BASE}/admin`)
    await expect(page).toHaveURL(/\/admin/)
    await expect(page.locator("body")).toContainText("Projects")
  })
})
