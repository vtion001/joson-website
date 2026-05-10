import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifySession } from "@/lib/auth"
import { getEstimateById, updateEstimate } from "@/lib/services/pricing"

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

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authCheck()
  if (auth) return auth
  try {
    const estimate = await getEstimateById(params.id)
    if (!estimate) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(estimate)
  } catch {
    console.error("[GET /api/estimates/[id]]")
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authCheck()
  if (auth) return auth
  try {
    const body = await req.json()
    const estimate = await updateEstimate(params.id, body)
    return NextResponse.json(estimate)
  } catch {
    console.error("[PATCH /api/estimates/[id]]")
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
