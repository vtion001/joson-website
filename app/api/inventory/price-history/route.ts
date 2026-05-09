import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("material_price_history")
      .select(`
        *,
        materials:material_id (id, name)
      `)
      .order("changed_at", { ascending: false })
      .limit(100)

    if (error) throw error

    const result = (data || []).map((h: Record<string, unknown>) => ({
      ...h,
      material_name: (h.materials as Record<string, string> | null)?.name || "—",
      materials: undefined,
    }))

    return NextResponse.json(result)
  } catch (err) {
    console.error("[GET /api/inventory/price-history]", err)
    return NextResponse.json({ error: "Failed to fetch price history" }, { status: 500 })
  }
}
