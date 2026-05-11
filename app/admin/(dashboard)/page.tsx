import Link from "next/link"
import { getEstimates, getRevenueByMonth } from "@/lib/services/pricing"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DollarSign, TrendingUp, TrendingDown, FileText,
  Send, BarChart3, PieChart as PieChartIcon, Plus,
  Package, ArrowRight, Eye
} from "lucide-react"
import { RevenueChart } from "@/components/admin/revenue-chart"
import { EstimatesPipeline } from "@/components/admin/estimates-pipeline"
import { ProjectTypeChart } from "@/components/admin/project-type-chart"

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({
  title,
  value,
  subtext,
  icon,
  trend,
  trendLabel,
  accent = "gold",
}: {
  title: string
  value: string
  subtext?: string
  icon: React.ReactNode
  trend?: "up" | "down" | "neutral"
  trendLabel?: string
  accent?: "gold" | "blue" | "green" | "purple"
}) {
  const accentMap = {
    gold: "from-amber-500/10 to-orange-500/5 border-amber-500/20",
    blue: "from-blue-500/10 to-cyan-500/5 border-blue-500/20",
    green: "from-emerald-500/10 to-green-500/5 border-emerald-500/20",
    purple: "from-violet-500/10 to-purple-500/5 border-violet-500/20",
  }
  const iconColorMap = {
    gold: "text-amber-400",
    blue: "text-blue-400",
    green: "text-emerald-400",
    purple: "text-violet-400",
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${accentMap[accent]} p-5`}>
      <div className="absolute -right-6 -top-6 opacity-[0.06] text-amber-400 scale-[3]">{icon}</div>
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground font-medium">{title}</span>
          <span className={iconColorMap[accent]}>{icon}</span>
        </div>
        <div className="text-3xl font-bold text-foreground mb-1">{value}</div>
        {subtext && (
          <div className="text-xs text-muted-foreground mb-2">{subtext}</div>
        )}
        {trend && trendLabel && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-muted-foreground"
          }`}>
            {trend === "up" ? <TrendingUp className="w-3 h-3" /> : trend === "down" ? <TrendingDown className="w-3 h-3" /> : null}
            {trendLabel}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function AdminDashboardPage() {
  const [estimates, monthlyRevenue] = await Promise.all([
    getEstimates({ limit: 100 }),
    getRevenueByMonth(6),
  ])

  const fmt = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 })
  const fmtNum = new Intl.NumberFormat("en-PH")

  // ─── KPIs ──────────────────────────────────────────────────────────────────
  const approved = estimates.filter((e) => e.status === "approved" || e.status === "project")
  const totalRevenue = approved.reduce((sum, e) => sum + (e.total_amount || 0), 0)
  const avgDealSize = approved.length > 0 ? totalRevenue / approved.length : 0

  const sentDraft = estimates.filter((e) => e.status === "sent" || e.status === "draft")
  const monthlyGoal = 200_000
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  const monthlyRev = monthlyRevenue.find((r) => r.month === currentMonth)
  const monthlyTotal = monthlyRev?.revenue || 0

  // Previous month for trend comparison
  const prevMonth = monthlyRevenue.length >= 2 ? monthlyRevenue[monthlyRevenue.length - 2] : null

  // ─── Estimates Pipeline (latest 5) ─────────────────────────────────────────
  const latestEstimates = estimates.slice(0, 5)

  // ─── Project type distribution ─────────────────────────────────────────────
  const projectTypeCounts: Record<string, number> = {}
  for (const e of estimates) {
    const type = e.project_type || "Other"
    projectTypeCounts[type] = (projectTypeCounts[type] || 0) + 1
  }
  const projectTypeData = Object.entries(projectTypeCounts).map(([name, value]) => ({ name, value }))

  return (
    <div className="space-y-8">
      {/* ── KPI Row ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Total Revenue"
          value={fmt.format(totalRevenue)}
          subtext={`${approved.length} approved + project`}
          icon={<DollarSign className="w-full h-full" />}
          trend={prevMonth && monthlyTotal > (prevMonth.revenue || 0) ? "up" : "neutral"}
          trendLabel="vs last month"
          accent="gold"
        />
        <KpiCard
          title="Monthly Revenue"
          value={fmt.format(monthlyTotal)}
          subtext={`Goal: ${fmt.format(monthlyGoal)}`}
          icon={<BarChart3 className="w-full h-full" />}
          trend={monthlyTotal >= monthlyGoal ? "up" : monthlyTotal > 0 ? "neutral" : "down"}
          trendLabel={monthlyTotal >= monthlyGoal ? "Goal met!" : `${Math.round((monthlyTotal / monthlyGoal) * 100)}% of goal`}
          accent="blue"
        />
        <KpiCard
          title="Avg Deal Size"
          value={fmt.format(avgDealSize)}
          subtext={`${approved.length} closed deals`}
          icon={<TrendingUp className="w-full h-full" />}
          accent="green"
        />
        <KpiCard
          title="Estimates Sent"
          value={String(sentDraft.length)}
          subtext="Draft + Sent"
          icon={<Send className="w-full h-full" />}
          accent="purple"
        />
      </div>

      {/* ── Revenue Chart + Project Type ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={monthlyRevenue} goal={monthlyGoal} />
        </div>
        <div>
          <ProjectTypeChart data={projectTypeData} />
        </div>
      </div>

      {/* ── Estimates Pipeline ──────────────────────────────────────────────── */}
      <EstimatesPipeline estimates={latestEstimates} />

      {/* ── Quick Actions ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/calculator"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 hover:-translate-y-[1px] transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          New Estimate
        </Link>
        <Link
          href="/admin/inventory"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-foreground text-sm font-medium hover:border-primary/50 hover:text-primary hover:-translate-y-[1px] transition-all duration-200"
        >
          <Package className="w-4 h-4" />
          Manage Inventory
        </Link>
        <Link
          href="/admin/clients"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-foreground text-sm font-medium hover:border-primary/50 hover:text-primary hover:-translate-y-[1px] transition-all duration-200"
        >
          <FileText className="w-4 h-4" />
          View Clients
        </Link>
      </div>
    </div>
  )
}
