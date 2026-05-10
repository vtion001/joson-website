import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifySession } from "@/lib/auth"
import { getMaterials, createMaterial, updateMaterial, archiveMaterial } from "@/lib/services/inventory"

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
    const materials = await getMaterials({ activeOnly: false })
    return NextResponse.json(materials)
  } catch {
    console.error("[GET /api/inventory/materials]")
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await authCheck()
  if (auth) return auth
  try {
    const body = await req.json()
    const material = await createMaterial({
      name:             body.name,
      category:         body.category,
      subcategory:      body.subcategory || null,
      unit:             body.unit,
      unit_size_sqft:   body.unit_size_sqft || null,
      unit_size_sqm:   body.unit_size_sqm || null,
      cost_price:      parseFloat(body.cost_price) || 0,
      sell_price:      parseFloat(body.sell_price) || 0,
      supplier_id:     body.supplier_id || null,
      supplier_sku:    body.supplier_sku || null,
      in_stock:        body.in_stock !== false,
      stock_qty:       parseFloat(body.stock_qty) || 0,
      min_stock_level: parseFloat(body.min_stock_level) || 0,
      lead_time_days:  parseInt(body.lead_time_days) || 0,
      notes:           body.notes || null,
      is_active:       body.is_active !== false,
    })
    return NextResponse.json(material, { status: 201 })
  } catch {
    console.error("[POST /api/inventory/materials]")
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await authCheck()
  if (auth) return auth
  try {
    const body = await req.json()
    if (!body.id) return NextResponse.json({ error: "Material ID required" }, { status: 400 })
    const material = await updateMaterial(body.id, body)
    return NextResponse.json(material)
  } catch {
    console.error("[PATCH /api/inventory/materials]")
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await authCheck()
  if (auth) return auth
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })
    await archiveMaterial(id)
    return NextResponse.json({ success: true })
  } catch {
    console.error("[DELETE /api/inventory/materials]")
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
