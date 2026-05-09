import { NextRequest, NextResponse } from "next/server"
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from "@/lib/services/inventory"

export async function GET() {
  try {
    const suppliers = await getSuppliers()
    return NextResponse.json(suppliers)
  } catch (err) {
    console.error("[GET /api/inventory/suppliers]", err)
    return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
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
  } catch (err) {
    console.error("[POST /api/inventory/suppliers]", err)
    return NextResponse.json({ error: "Failed to create supplier" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id) return NextResponse.json({ error: "Supplier ID required" }, { status: 400 })
    const supplier = await updateSupplier(body.id, body)
    return NextResponse.json(supplier)
  } catch (err) {
    console.error("[PATCH /api/inventory/suppliers]", err)
    return NextResponse.json({ error: "Failed to update supplier" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })
    await deleteSupplier(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[DELETE /api/inventory/suppliers]", err)
    return NextResponse.json({ error: "Failed to deactivate supplier" }, { status: 500 })
  }
}
