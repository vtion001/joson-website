import { NextRequest, NextResponse } from "next/server"
import { getPricingConfigRows, updatePricingConfig } from "@/lib/services/pricing"

export async function GET() {
  try {
    const configs = await getPricingConfigRows()
    // Parse JSON strings → objects for each row
    const result = configs.map((c) => ({
      key:      c.key_name,
      value:    typeof c.config_json === "string"
                  ? JSON.parse(c.config_json) as Record<string, number>
                  : c.config_json as Record<string, number>,
      description: c.description,
    }))
    return NextResponse.json(result)
  } catch (err) {
    console.error("[GET /api/inventory/pricing-config]", err)
    return NextResponse.json({ error: "Failed to fetch pricing config" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { key, value } = body
    if (!key || !value) return NextResponse.json({ error: "key and value are required" }, { status: 400 })
    await updatePricingConfig(key, value)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[PATCH /api/inventory/pricing-config]", err)
    return NextResponse.json({ error: "Failed to update pricing config" }, { status: 500 })
  }
}
