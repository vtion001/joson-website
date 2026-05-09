import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("cabinet_pricing_config")
      .select("key, value, description")
      .order("key")

    if (error) throw error
    return NextResponse.json(data || [])
  } catch (err) {
    console.error("[GET /api/inventory/pricing-config]", err)
    return NextResponse.json({ error: "Failed to fetch pricing config" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { key, value } = body

    if (!key || !value) {
      return NextResponse.json({ error: "key and value are required" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("cabinet_pricing_config")
      .update({ value, updated_at: new Date().toISOString() })
      .eq("key", key)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (err) {
    console.error("[PATCH /api/inventory/pricing-config]", err)
    return NextResponse.json({ error: "Failed to update pricing config" }, { status: 500 })
  }
}
