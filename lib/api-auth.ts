import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifySession } from "@/lib/auth"

/**
 * Auth guard for Next.js App Router API routes.
 * Call at the top of every admin API route handler.
 * Returns 401 JSON if not authenticated, null if auth passed.
 */
export function authGuard() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("admin_session")?.value
    const session = token ? verifySession(token) : null
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return null // auth passed
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
