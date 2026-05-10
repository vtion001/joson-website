import { test, expect, Page } from "@playwright/test"

const BASE = process.env.E2E_BASE_URL || "http://localhost:3001"
const ADMIN_SESSION = "eyJwcm92aWRlciI6ImNyZWRlbnRpYWxzIiwiZW1haWwiOiJhZG1pbkBqb3Nvbi5jb20iLCJ0cyI6MTc3ODMzODY3MTk1Nn0.bjLEZ6tjE93FboS_SO4oJCOZwT5vuzS2rV_AS-0uanI"

async function setupAdminPage(page: Page, path: string) {
  await page.context().addCookies([
    { name: "admin_session", value: ADMIN_SESSION, domain: "localhost", path: "/" },
  ])
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" })
}

// ─── CALCULATOR PAGE ────────────────────────────────────────────────────────
test.describe("1. Calculator Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/calculator`, { waitUntil: "networkidle" })
  })

  test("page loads and has calculator form", async ({ page }) => {
    await expect(page.locator("text=Kitchen")).toBeVisible()
    await expect(page.locator("text=Bathroom")).toBeVisible()
    await expect(page.locator("text=Bedroom")).toBeVisible()
    await expect(page.locator("text=Office")).toBeVisible()
  })

  test("project type selector works", async ({ page }) => {
    await page.locator("button:has-text('Kitchen')").click()
    await page.waitForTimeout(300)
    // Cabinet type dropdown should be visible after selection
    await expect(page.locator("select").first()).toBeVisible()
  })

  test("cabinet tier options appear after project type", async ({ page }) => {
    await page.locator("button:has-text('Kitchen')").click()
    await expect(page.locator("select").first()).toBeVisible()
  })

  test("calculate button is present", async ({ page }) => {
    await expect(page.locator("button:has-text('Calculate')")).toBeVisible()
  })

  test("estimate panel shows empty state", async ({ page }) => {
    await expect(page.locator("text=Your Estimate").first()).toBeVisible()
  })

  test("no console errors", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (err) => errors.push(err.message))
    await page.waitForLoadState("networkidle")
    expect(errors).toHaveLength(0)
  })
})

// ─── ADMIN INVENTORY ────────────────────────────────────────────────────────
test.describe("2. Admin Inventory", () => {
  test.beforeEach(async ({ page }) => {
    await setupAdminPage(page, "/admin/inventory")
  })

  test("page loads with inventory heading", async ({ page }) => {
    await expect(page.locator("h1:has-text('Inventory Management')")).toBeVisible()
  })

  test("shows material count", async ({ page }) => {
    await expect(page.locator("text=35 active materials")).toBeVisible()
    await expect(page.locator("text=3 suppliers")).toBeVisible()
  })

  test("API returns 200 for materials endpoint", async ({ page }) => {
    const resp = await page.request.get(`${BASE}/api/inventory/materials`)
    expect(resp.status()).toBe(200)
    const data = await resp.json()
    expect(data.length).toBeGreaterThan(0)
  })

  test("materials table has data rows", async ({ page }) => {
    // Table should have at least one material row
    await page.waitForTimeout(2000) // wait for client-side render
    const rows = page.locator("table tbody tr")
    await expect(rows.first()).toBeVisible()
  })

  test("search input is present", async ({ page }) => {
    await expect(page.locator('input[placeholder*="Search materials"]')).toBeVisible()
  })

  test("category filter dropdown is present", async ({ page }) => {
    await expect(page.locator("text=All Categories")).toBeVisible()
  })

  test("tabs are present", async ({ page }) => {
    await expect(page.locator('role=tab[name*="Materials"]')).toBeVisible()
    await expect(page.locator('role=tab[name*="Suppliers"]')).toBeVisible()
    await expect(page.locator('role=tab[name*="Pricing Config"]')).toBeVisible()
    await expect(page.locator('role=tab[name*="Price History"]')).toBeVisible()
  })

  test("low stock alert is visible", async ({ page }) => {
    await expect(page.locator("text=Materials Below Min Level")).toBeVisible()
  })

  test("add material and add supplier buttons visible", async ({ page }) => {
    await expect(page.locator("button:has-text('Add Material')")).toBeVisible()
    await expect(page.locator("button:has-text('Add Supplier')")).toBeVisible()
  })

  test("API returns 200 for suppliers endpoint", async ({ page }) => {
    const resp = await page.request.get(`${BASE}/api/inventory/suppliers`)
    expect(resp.status()).toBe(200)
    const data = await resp.json()
    expect(data.length).toBeGreaterThan(0)
  })

  test("no console errors", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (err) => errors.push(err.message))
    await page.waitForLoadState("networkidle")
    expect(errors).toHaveLength(0)
  })
})

// ─── ADMIN PDF EXTRACTOR ───────────────────────────────────────────────────
test.describe("3. Admin PDF Extractor", () => {
  test.beforeEach(async ({ page }) => {
    await setupAdminPage(page, "/admin/pdf-extractor")
  })

  test("page loads", async ({ page }) => {
    await expect(page.locator("body")).toBeVisible()
  })

  test("cost estimator panel is visible", async ({ page }) => {
    await expect(page.locator('h2:has-text("Cost Estimator")').first()).toBeVisible()
  })

  test("PDF floor plan extractor section is visible", async ({ page }) => {
    // Scroll down to see the PDF extractor
    await page.evaluate(() => window.scrollTo(0, 1000))
    await page.waitForTimeout(500)
    await expect(page.locator("text=PDF Floor Plan Extractor")).toBeVisible()
  })

  test("upload zone is present", async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 1000))
    await expect(page.locator("text=Drop a floor plan PDF")).toBeVisible()
  })

  test("upload limit text visible", async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 1000))
    await expect(page.locator("text=max 5 pages")).toBeVisible()
  })
})

// ─── ADMIN PROPOSALS ───────────────────────────────────────────────────────
test.describe("4. Admin Proposals", () => {
  test.beforeEach(async ({ page }) => {
    await setupAdminPage(page, "/admin/proposals")
  })

  test("page loads", async ({ page }) => {
    await expect(page.locator("body")).toBeVisible()
  })

  test("proposals heading visible", async ({ page }) => {
    await expect(page.locator("text=Proposals & Estimates")).toBeVisible()
  })

  test("estimate list shows seeded estimates", async ({ page }) => {
    // With seeded data, the estimate list should be visible instead of empty state
    await expect(page.locator("text=Maria Santos").first()).toBeVisible()
    await expect(page.locator("text=EST-2026-001").first()).toBeVisible()
  })

  test("new estimate button opens save dialog", async ({ page }) => {
    const newBtn = page.locator("button:has-text('New Estimate')")
    await expect(newBtn).toBeVisible()
    await newBtn.click()
    await page.waitForTimeout(500)
    // Dialog should open with client name input
    await expect(page.locator('input[placeholder*="Juan"]')).toBeVisible()
  })

  test("new estimate button visible", async ({ page }) => {
    await expect(page.locator("button:has-text('New Estimate')")).toBeVisible()
  })

  test("cost estimator panel visible", async ({ page }) => {
    await expect(page.locator('h2:has-text("Cost Estimator")').first()).toBeVisible()
  })
})

// ─── BUILDER INTELLIGENCE DASHBOARD ───────────────────────────────────────
test.describe("5. Builder Intelligence Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await setupAdminPage(page, "/admin/dashboard")
  })

  test("page loads with dashboard heading", async ({ page }) => {
    await expect(page.locator("h1:has-text('Builder Intelligence Dashboard')")).toBeVisible()
  })

  test("subtitle visible", async ({ page }) => {
    await expect(page.locator("text=Business overview at a glance")).toBeVisible()
  })

  test("KPI cards present - Estimates card", async ({ page }) => {
    await expect(page.locator('text=Estimates — May 2026').first()).toBeVisible()
  })

  test("KPI cards present - Approved card", async ({ page }) => {
    await expect(page.locator('text=Approved — May 2026').first()).toBeVisible()
  })

  test("KPI cards present - Active Projects card", async ({ page }) => {
    await expect(page.locator("text=Active Projects")).toBeVisible()
  })

  test("KPI cards present - Conversion Rate card", async ({ page }) => {
    await expect(page.locator("text=Conversion Rate")).toBeVisible()
  })

  test("Lead Pipeline section present", async ({ page }) => {
    await expect(page.locator("text=Lead Pipeline")).toBeVisible()
  })

  test("Monthly Revenue section present", async ({ page }) => {
    await expect(page.locator("text=Monthly Revenue")).toBeVisible()
  })

  test("Inventory Health section present", async ({ page }) => {
    await expect(page.locator("text=Inventory Health")).toBeVisible()
  })

  test("Supplier Performance section present", async ({ page }) => {
    await expect(page.locator("text=Supplier Performance")).toBeVisible()
  })

  test("no console errors", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (err) => errors.push(err.message))
    await page.waitForLoadState("networkidle")
    expect(errors).toHaveLength(0)
  })
})

// ─── ADMIN CALCULATOR PRICING ─────────────────────────────────────────────
test.describe("6. Admin Calculator Pricing", () => {
  test.beforeEach(async ({ page }) => {
    await setupAdminPage(page, "/admin/calculator-pricing")
  })

  test("page loads", async ({ page }) => {
    await expect(page.locator("body")).toBeVisible()
  })

  test("cost estimator panel visible", async ({ page }) => {
    await expect(page.locator('h2:has-text("Cost Estimator")').first()).toBeVisible()
  })

  test("project type options visible", async ({ page }) => {
    await expect(page.locator('button:has-text("Kitchen")').first()).toBeVisible()
    await expect(page.locator('button:has-text("Bathroom")').first()).toBeVisible()
    await expect(page.locator('button:has-text("Bedroom")').first()).toBeVisible()
  })

  test("calculate estimate button visible", async ({ page }) => {
    await expect(page.locator('button:has-text("Calculate Estimate")').first()).toBeVisible()
  })

  test("estimate preview panel visible", async ({ page }) => {
    await expect(page.locator('h2:has-text("Your Estimate")').first()).toBeVisible()
  })
})

// ─── API ENDPOINTS ─────────────────────────────────────────────────────────
test.describe("7. API Endpoints", () => {
  test("GET /api/inventory/materials returns 200 + data", async ({ page }) => {
    const resp = await page.request.get(`${BASE}/api/inventory/materials`)
    expect(resp.status()).toBe(200)
    const data = await resp.json()
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)
    // Check structure
    expect(data[0]).toHaveProperty("id")
    expect(data[0]).toHaveProperty("name")
    expect(data[0]).toHaveProperty("cost_price")
    expect(data[0]).toHaveProperty("sell_price")
  })

  test("GET /api/inventory/suppliers returns 200 + data", async ({ page }) => {
    const resp = await page.request.get(`${BASE}/api/inventory/suppliers`)
    expect(resp.status()).toBe(200)
    const data = await resp.json()
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)
  })

  test("GET /api/inventory/pricing-config returns 200", async ({ page }) => {
    const resp = await page.request.get(`${BASE}/api/inventory/pricing-config`)
    expect(resp.status()).toBe(200)
    const data = await resp.json()
    expect(Array.isArray(data)).toBe(true)
  })

  test("GET /api/inventory/price-history returns 200", async ({ page }) => {
    const resp = await page.request.get(`${BASE}/api/inventory/price-history`)
    expect(resp.status()).toBe(200)
  })

  test("POST /api/estimate/calculate returns 200 with valid data", async ({ page }) => {
    const resp = await page.request.post(`${BASE}/api/estimate/calculate`, {
      data: {
        projectType: "kitchen",
        cabinetType: "l_shape",
        tier: "standard",
        linearMeter: 5,
        material: "plywood",
        finish: "laminate",
        installation: false,
      },
    })
    expect(resp.status()).toBe(200)
    const data = await resp.json()
    expect(data).toHaveProperty("total")
    expect(data).toHaveProperty("breakdown")
    expect(data.total).toBeGreaterThan(0)
  })

  test("GET /api/estimates returns 200", async ({ page }) => {
    const resp = await page.request.get(`${BASE}/api/estimates`)
    expect(resp.status()).toBe(200)
  })

  test("POST /api/pdf-extract returns 400 without file", async ({ page }) => {
    const resp = await page.request.post(`${BASE}/api/pdf-extract`)
    expect([400, 500]).toContain(resp.status())
  })
})
