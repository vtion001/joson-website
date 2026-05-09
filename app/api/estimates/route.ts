import { NextRequest, NextResponse } from "next/server"
import { createEstimate, getEstimates, getEstimateById, updateEstimate } from "@/lib/services/pricing"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") || undefined
    const limit  = parseInt(searchParams.get("limit") || "50")
    const estimates = await getEstimates({ status, limit })
    return NextResponse.json(estimates)
  } catch (err) {
    console.error("[GET /api/estimates]", err)
    return NextResponse.json({ error: "Failed to fetch estimates" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const estimate = await createEstimate({
      client_name:    body.client_name    || null,
      client_email:   body.client_email   || null,
      client_phone:   body.client_phone   || null,
      project_type:   body.project_type   || null,
      status:         body.status         || "draft",
      total_amount:    body.total_amount   || null,
      subtotal:       body.subtotal       || null,
      tax_amount:     body.tax_amount    || null,
      discount_amount: body.discount_amount || 0,
      notes:          body.notes          || null,
      valid_until:     body.valid_until    || null,
      estimate_data:  body.estimate_data  || null,
    })
    return NextResponse.json(estimate, { status: 201 })
  } catch (err) {
    console.error("[POST /api/estimates]", err)
    return NextResponse.json({ error: "Failed to create estimate" }, { status: 500 })
  }
}
