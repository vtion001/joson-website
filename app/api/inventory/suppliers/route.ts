import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("suppliers")
      .select("*")
      .order("name")

    if (error) throw error
    return NextResponse.json(data || [])
  } catch (err) {
    console.error("[GET /api/inventory/suppliers]", err)
    return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, contact_person, phone, email, address, notes, is_active } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: "Supplier name is required" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("suppliers")
      .insert({
        name,
        contact_person: contact_person || null,
        phone: phone || null,
        email: email || null,
        address: address || null,
        notes: notes || null,
        is_active: is_active !== false,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error("[POST /api/inventory/suppliers]", err)
    return NextResponse.json({ error: "Failed to create supplier" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "Supplier ID required" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("suppliers")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (err) {
    console.error("[PATCH /api/inventory/suppliers]", err)
    return NextResponse.json({ error: "Failed to update supplier" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 })
    }

    // Soft delete
    const { error } = await supabaseAdmin
      .from("suppliers")
      .update({ is_active: false })
      .eq("id", id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[DELETE /api/inventory/suppliers]", err)
    return NextResponse.json({ error: "Failed to deactivate supplier" }, { status: 500 })
  }
}
