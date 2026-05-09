import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("materials")
      .select(
        `
        *,
        suppliers:supplier_id (id, name)
      `
      )
      .order("category")
      .order("name")

    if (error) throw error

    // Flatten supplier name for convenience
    const result = (data || []).map((m: Record<string, unknown>) => ({
      ...m,
      supplier_name: (m.suppliers as Record<string, string> | null)?.name || null,
      suppliers: undefined,
    }))

    return NextResponse.json(result)
  } catch (err) {
    console.error("[GET /api/inventory/materials]", err)
    return NextResponse.json({ error: "Failed to fetch materials" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name,
      category,
      subcategory,
      unit,
      unit_size_sqft,
      unit_size_sqm,
      cost_price,
      sell_price,
      supplier_id,
      supplier_sku,
      in_stock,
      stock_qty,
      min_stock_level,
      lead_time_days,
      notes,
      is_active,
    } = body

    const { data, error } = await supabaseAdmin.from("materials").insert({
      name,
      category,
      subcategory: subcategory || null,
      unit,
      unit_size_sqft: unit_size_sqft || null,
      unit_size_sqm: unit_size_sqm || null,
      cost_price: cost_price || 0,
      sell_price: sell_price || 0,
      supplier_id: supplier_id || null,
      supplier_sku: supplier_sku || null,
      in_stock: in_stock !== false,
      stock_qty: stock_qty || 0,
      min_stock_level: min_stock_level || 0,
      lead_time_days: lead_time_days || 0,
      notes: notes || null,
      is_active: is_active !== false,
    }).select().single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error("[POST /api/inventory/materials]", err)
    return NextResponse.json({ error: "Failed to create material" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "Material ID required" }, { status: 400 })
    }

    // Prevent changing created_at
    delete updates.created_at

    const { data, error } = await supabaseAdmin
      .from("materials")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (err) {
    console.error("[PATCH /api/inventory/materials]", err)
    return NextResponse.json({ error: "Failed to update material" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 })
    }

    // Soft delete: archive rather than hard delete
    const { error } = await supabaseAdmin
      .from("materials")
      .update({ is_active: false })
      .eq("id", id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[DELETE /api/inventory/materials]", err)
    return NextResponse.json({ error: "Failed to archive material" }, { status: 500 })
  }
}
