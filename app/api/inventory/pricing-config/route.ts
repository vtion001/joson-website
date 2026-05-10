import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifySession } from "@/lib/auth"
import { getPricingConfigRows, updatePricingConfig } from "@/lib/services/pricing"

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

export async function GET() {
  const auth = await authCheck()
  if (auth) return auth
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
  } catch {
    console.error("[GET /api/inventory/pricing-config]")
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await authCheck()
  if (auth) return auth
  try {
    const body = await req.json()
    const { key, value } = body
    if (!key || !value) return NextResponse.json({ error: "key and value are required" }, { status: 400 })
    await updatePricingConfig(key, value)
    return NextResponse.json({ success: true })
  } catch {
    console.error("[PATCH /api/inventory/pricing-config]")
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
