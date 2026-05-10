import { test, expect, Page } from "@playwright/test"

const BASE = process.env.E2E_BASE_URL || "http://localhost:3001"
const ADMIN_SESSION = "eyJwcm92aWRlciI6ImNyZWRlbnRpYWxzIiwiZW1haWwiOiJhZG1pbkBqb3Nvbi5jb20iLCJ0cyI6MTc3ODMzODY3MTk1Nn0.bjLEZ6tjE93FboS_SO4oJCOZwT5vuzS2rV_AS-0uanI"

async function setupAdminPage(page: Page, path: string) {
  await page.context().addCookies([
    { name: "admin_session", value: ADMIN_SESSION, domain: "localhost", path: "/" },
  ])
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" })
}

// ─── ESTIMATE SAVE PIPELINE ─────────────────────────────────────────────────
// Tests the full flow: Calculator → localStorage → Proposals → Save → Dashboard
test.describe("Estimate Save Pipeline", () => {

  test("Calculator: calculate and save to localStorage", async ({ page }) => {
    await page.goto(`${BASE}/calculator`, { waitUntil: "networkidle" })

    // Select Kitchen project type
    await page.locator("button:has-text('Kitchen')").click()
    await page.waitForTimeout(500)

    // Select Cabinet Quality: Basic (required before calculation can proceed)
    await page.locator('button:has-text("Basic")').click()
    await page.waitForTimeout(300)

    // Enable base units checkbox
    await page.locator('input[type="checkbox"]').first().check()

    // Set linear meter to 5
    await page.locator('input[type="number"]').first().fill("5")

    // Click Calculate
    const calcButton = page.locator("button:has-text('Calculate Estimate')")
    await expect(calcButton).toBeVisible()
    await calcButton.click()

    // Wait for API response + UI update
    await page.waitForTimeout(3000)

    // Verify localStorage was written
    const savedData = await page.evaluate(() => {
      return localStorage.getItem("joson_last_estimate")
    })
    expect(savedData).not.toBeNull()
    const estimate = JSON.parse(savedData!)
    expect(estimate.total).toBeGreaterThan(0)
    console.log(`Calculator saved estimate: PHP ${estimate.total.toLocaleString()}`)
  })

  test("Proposals: open save dialog and save estimate", async ({ page }) => {
    await setupAdminPage(page, "/admin/proposals")
    await page.waitForTimeout(2000)

    // Open save dialog
    const newEstimateBtn = page.locator("button:has-text('New Estimate')")
    await expect(newEstimateBtn).toBeVisible()
    await newEstimateBtn.click()
    await page.waitForTimeout(1000)

    // Fill in client details using placeholders
    await page.locator('input[placeholder="Juan dela Cruz"]').fill("Test Client")
    await page.locator('input[type="email"]').fill("test@example.com")
    await page.locator('input[placeholder="0917-123-4567"]').fill("09171234567")

    // Submit save
    const saveBtn = page.locator("button:has-text('Save Estimate')")
    await expect(saveBtn).toBeVisible()
    await saveBtn.click()
    await page.waitForTimeout(4000)

    // Verify estimate appears in list
    const bodyText = await page.locator("body").innerText()
    expect(bodyText).toContain("Test Client")
  })

  test("Proposals: saved estimate shows in list", async ({ page }) => {
    await setupAdminPage(page, "/admin/proposals")
    await page.waitForTimeout(2000)

    const bodyText = await page.locator("body").innerText()
    expect(bodyText).toContain("Test Client")
    expect(bodyText).not.toContain("No estimates yet")
  })

  test("Dashboard: KPIs show after seeded estimates", async ({ page }) => {
    await setupAdminPage(page, "/admin/dashboard")
    await page.waitForTimeout(2000)

    const bodyText = await page.locator("body").innerText()
    expect(bodyText).toContain("Estimates")
    expect(bodyText).toContain("Builder Intelligence Dashboard")
  })

  test("API: GET /api/estimates returns all seeded estimates", async ({ page }) => {
    const resp = await page.request.get(`${BASE}/api/estimates`)
    expect(resp.status()).toBe(200)
    const data = await resp.json()
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)
    // Seeded data: Maria Santos (sent), Juan Cruz (draft), Ana Reyes (approved)
    const names = data.map((r: any) => r.client_name)
    expect(names).toContain("Maria Santos")
    expect(names).toContain("Ana Reyes")
    console.log(`API: ${data.length} estimates — ${names.join(", ")}`)
  })

  test("Dashboard: Lead Pipeline shows pipeline sections", async ({ page }) => {
    await setupAdminPage(page, "/admin/dashboard")
    await page.waitForTimeout(2000)
    await page.evaluate(() => window.scrollTo(0, 600))
    await page.waitForTimeout(1000)
    const bodyText = await page.locator("body").innerText()
    expect(bodyText).toContain("Lead Pipeline")
  })
})
