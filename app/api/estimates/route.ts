import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifySession } from "@/lib/auth"
import { createEstimate, getEstimates } from "@/lib/services/pricing"

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

export async function GET(req: NextRequest) {
  const auth = await authCheck()
  if (auth) return auth
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") || undefined
    const limit  = parseInt(searchParams.get("limit") || "50")
    const estimates = await getEstimates({ status, limit })
    return NextResponse.json(estimates)
  } catch {
    console.error("[GET /api/estimates]")
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await authCheck()
  if (auth) return auth
  try {
    const body = await req.json()

    // ─── Validation ─────────────────────────────────────────────────────────
    const errors: string[] = []

    if (body.total_amount != null && (typeof body.total_amount !== "number" || body.total_amount < 0)) {
      errors.push("total_amount must be a positive number or null")
    }
    if (body.subtotal != null && (typeof body.subtotal !== "number" || body.subtotal < 0)) {
      errors.push("subtotal must be a positive number or null")
    }
    if (body.tax_amount != null && (typeof body.tax_amount !== "number" || body.tax_amount < 0)) {
      errors.push("tax_amount must be a positive number or null")
    }
    if (body.discount_amount != null && (typeof body.discount_amount !== "number" || body.discount_amount < 0)) {
      errors.push("discount_amount must be 0 or greater")
    }
    if (body.client_email != null && body.client_email !== "") {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRe.test(body.client_email)) {
        errors.push("client_email must be a valid email address")
      }
    }
    const validStatuses = ["draft", "sent", "approved", "declined"]
    if (body.status != null && !validStatuses.includes(body.status)) {
      errors.push(`status must be one of: ${validStatuses.join(", ")}`)
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 })
    }

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
  } catch {
    console.error("[POST /api/estimates]")
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
