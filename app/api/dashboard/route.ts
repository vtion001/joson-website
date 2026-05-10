import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifySession } from "@/lib/auth"
import { query } from "@/lib/db"

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
    // Monthly revenue (last 6 months)
    const revenueRows = await query<{ month: string; revenue: number }>(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, SUM(total_amount) as revenue
       FROM estimates
       WHERE status IN ('approved', 'project') AND total_amount IS NOT NULL
       GROUP BY month
       ORDER BY month DESC
       LIMIT 6`
    )
    const revenueByMonth = revenueRows.reverse()

    // Estimates by status for this month
    const now = new Date()
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    const statusRows = await query<{ status: string; count: number; total: number }>(
      `SELECT status, COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total
       FROM estimates
       WHERE DATE(created_at) >= ?
       GROUP BY status`,
      [monthStart]
    )

    // Approved projects this month
    const approvedRow = await query<{ count: number; total: number }>(
      `SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total
       FROM estimates
       WHERE status IN ('approved', 'project') AND DATE(created_at) >= ?`,
      [monthStart]
    )

    // Active projects (status = project)
    const activeProjects = await query<{ count: number }>(
      `SELECT COUNT(*) as count FROM estimates WHERE status = 'project'`
    )

    return NextResponse.json({
      revenueByMonth,
      statusBreakdown: statusRows,
      approvedThisMonth: approvedRow[0] ?? { count: 0, total: 0 },
      activeProjects: activeProjects[0]?.count ?? 0,
    })
  } catch {
    console.error("[GET /api/dashboard]")
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
