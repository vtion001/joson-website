import { NextRequest, NextResponse } from "next/server"
import { getEstimateById, updateEstimate } from "@/lib/services/pricing"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const estimate = await getEstimateById(params.id)
    if (!estimate) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(estimate)
  } catch (err) {
    console.error("[GET /api/estimates/[id]]", err)
    return NextResponse.json({ error: "Failed to fetch estimate" }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const estimate = await updateEstimate(params.id, body)
    return NextResponse.json(estimate)
  } catch (err) {
    console.error("[PATCH /api/estimates/[id]]", err)
    return NextResponse.json({ error: "Failed to update estimate" }, { status: 500 })
  }
}
