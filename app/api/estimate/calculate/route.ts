import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifySession } from "@/lib/auth"
import { estimateCabinetCost } from "@/lib/estimator"
import { getCabinetPricingConfig } from "@/lib/services/pricing"

async function authCheck() {
  if (process.env.SKIP_AUTH === "1") return null
  const cookieStore = cookies()
  const token = cookieStore.get("admin_session")?.value
  const session = token ? verifySession(token) : null
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return null
}

export async function POST(req: NextRequest) {
  const auth = await authCheck()
  if (auth) return auth
  try {
    const body = await req.json()

    // Fetch live pricing config from MySQL
    const cfg = await getCabinetPricingConfig()

    const result = estimateCabinetCost({
      projectType:  body.projectType,
      cabinetType:  body.cabinetType,
      linearMeter:  body.linearMeter,
      installation: body.installation,
      cabinetCategory: body.cabinetCategory || "base",
      tier:          body.tier         || "",
      kitchenScope:  body.kitchenScope || "",
      material:      body.material      || "",
      finish:       body.finish        || "",
      hardware:     body.hardware      || "",
      units:         body.units         || [],
      discount:      body.discount      || 0,
      applyTax:      body.applyTax     ?? true,
      taxRate:       body.taxRate      ?? 0.12,
      includeFees:   body.includeFees  ?? false,
      // Pass live MySQL config to estimator
      baseRates:             cfg.baseRates,
      feeInclusiveRates:     cfg.feeInclusiveRates,
      tierMultipliers:       cfg.tierMultipliers,
      cabinetTypeMultipliers: cfg.cabinetTypeMultipliers,
      materialMultipliers:   cfg.materialMultipliers,
      finishMultipliers:     cfg.finishMultipliers,
      hardwareMultipliers:   cfg.hardwareMultipliers,
      installationRate:      cfg.installationRate,
      projectTypeMultipliers: cfg.projectTypeMultipliers,
    })

    return NextResponse.json(result)
  } catch {
    console.error("[POST /api/estimate/calculate]")
    return NextResponse.json({ error: "Internal server error" }, { status: 400 })
  }
}
