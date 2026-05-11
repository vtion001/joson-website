import Link from "next/link"
import { getEstimates, getRevenueByMonth } from "@/lib/services/pricing"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DollarSign, TrendingUp, TrendingDown, FileText,
  Send, BarChart3, Plus,
  Package, ArrowRight, Activity, TrendingUp as PipelineIcon, CheckCircle2, XCircle, Clock
} from "lucide-react"
import { RevenueChart } from "@/components/admin/revenue-chart"
import { EstimatesPipeline } from "@/components/admin/estimates-pipeline"
import { ProjectTypeChart } from "@/components/admin/project-type-chart"
import { formatCurrency } from "@/lib/services/pricing"

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

  // ─── Conversion Funnel ───────────────────────────────────────────────────────
  const funnel = [
    { label: "Draft",     key: "draft",    icon: <Clock className="w-3.5 h-3.5" />, color: "text-gray-400" },
    { label: "Sent",      key: "sent",     icon: <Send className="w-3.5 h-3.5" />, color: "text-blue-400" },
    { label: "Approved",  key: "approved", icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "text-emerald-400" },
    { label: "Project",  key: "project",  icon: <PipelineIcon className="w-3.5 h-3.5" />, color: "text-violet-400" },
    { label: "Rejected",  key: "rejected", icon: <XCircle className="w-3.5 h-3.5" />, color: "text-red-400" },
  ]
  const funnelMax = Math.max(...funnel.map(f => estimates.filter(e => e.status === f.key).length), 1)

  // ─── Recent Activity ────────────────────────────────────────────────────────
  const recentActivity = [...estimates]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  function statusLabel(s: string) {
    const map: Record<string, string> = { draft: "Draft", sent: "Sent", approved: "Approved", rejected: "Rejected", project: "In Project" }
    return map[s] || s
  }

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
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <EstimatesPipeline estimates={latestEstimates} />
        </div>

        {/* ── Conversion Funnel ─────────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <PipelineIcon className="w-4 h-4 text-primary" />
                Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {funnel.map((f) => {
                  const count = estimates.filter((e) => e.status === f.key).length
                  const pct = (count / funnelMax) * 100
                  return (
                    <div key={f.key} className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-muted/50 shrink-0 ${f.color}`}>
                        {f.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">{f.label}</span>
                          <span className={`text-xs font-semibold ${f.color}`}>{count}</span>
                        </div>
                        <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              f.key === "draft" ? "bg-gray-500" :
                              f.key === "sent" ? "bg-blue-500" :
                              f.key === "approved" ? "bg-emerald-500" :
                              f.key === "project" ? "bg-violet-500" : "bg-red-500"
                            }`}
                            style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Recent Activity ─────────────────────────────────────────────────── */}
      <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Recent Activity</span>
        </div>
        <div className="divide-y divide-border/30">
          {recentActivity.length === 0 ? (
            <div className="px-5 py-8 text-center text-muted-foreground text-sm">
              No estimates yet — create one from the calculator.
            </div>
          ) : (
            recentActivity.map((e) => {
              const statusColor: Record<string, string> = {
                draft:    "bg-gray-500",
                sent:     "bg-blue-500",
                approved: "bg-emerald-500",
                rejected: "bg-red-500",
                project:  "bg-violet-500",
              }
              return (
                <div key={e.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-0.5 shrink-0 ${statusColor[e.status] || "bg-gray-500"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">{e.reference_no}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground capitalize">{e.project_type || "General"}</span>
                    </div>
                    <p className="text-sm truncate">
                      {e.client_name || <span className="italic text-muted-foreground">No client name</span>}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-foreground">
                      {formatCurrency(e.total_amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">{timeAgo(e.created_at)}</p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

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
