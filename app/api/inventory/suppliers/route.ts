import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifySession } from "@/lib/auth"
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from "@/lib/services/inventory"

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
    const suppliers = await getSuppliers()
    return NextResponse.json(suppliers)
  } catch {
    console.error("[GET /api/inventory/suppliers]")
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await authCheck()
  if (auth) return auth
  try {
    const body = await req.json()
    if (!body.name?.trim()) return NextResponse.json({ error: "Supplier name required" }, { status: 400 })
    const supplier = await createSupplier({
      name:           body.name,
      contact_person: body.contact_person || null,
      phone:          body.phone || null,
      email:          body.email || null,
      address:        body.address || null,
      notes:          body.notes || null,
      is_active:      body.is_active !== false,
    })
    return NextResponse.json(supplier, { status: 201 })
  } catch {
    console.error("[POST /api/inventory/suppliers]")
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await authCheck()
  if (auth) return auth
  try {
    const body = await req.json()
    if (!body.id) return NextResponse.json({ error: "Supplier ID required" }, { status: 400 })
    const supplier = await updateSupplier(body.id, body)
    return NextResponse.json(supplier)
  } catch {
    console.error("[PATCH /api/inventory/suppliers]")
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
    await deleteSupplier(id)
    return NextResponse.json({ success: true })
  } catch {
    console.error("[DELETE /api/inventory/suppliers]")
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
