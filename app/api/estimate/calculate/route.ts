import { NextRequest, NextResponse } from "next/server"
import { estimateCabinetCost } from "@/lib/estimator"
import { getCabinetPricingConfig } from "@/lib/services/pricing"

export async function POST(req: NextRequest) {
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
  } catch (err) {
    console.error("[POST /api/estimate/calculate]", err)
    const message = err instanceof Error ? err.message : "Calculation failed"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
