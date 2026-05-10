import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifySession } from "@/lib/auth"
import { getPriceHistory } from "@/lib/services/inventory"

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
    const history = await getPriceHistory(100)
    return NextResponse.json(history)
  } catch {
    console.error("[GET /api/inventory/price-history]")
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
