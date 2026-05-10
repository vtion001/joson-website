"use client"

import { useEffect, useState, useCallback } from "react"
import { RefreshCw, Loader2, AlertTriangle, CheckCircle2, TrendingUp, FileText, Users, BarChart2 } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Estimate } from "@/lib/services/pricing"

// ─── Types ───────────────────────────────────────────────────────────────────

interface DashboardStats {
  revenueByMonth: { month: string; revenue: number }[]
  statusBreakdown: { status: string; count: number; total: number }[]
  approvedThisMonth: { count: number; total: number }
  activeProjects: number
}

interface Material {
  id: string
  name: string
  stock_qty: number
  min_stock_level: number
  supplier_name: string | null
  supplier_id: string | null
  sell_price: number
  is_active: boolean
}

interface Supplier {
  id: string
  name: string
  material_count: number
  total_stock_value: number
  low_stock_items: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(v: number | null | undefined) {
  if (v == null) return "—"
  return new Intl.NumberFormat("en-PH", {
    style: "currency", currency: "PHP",
    minimumFractionDigits: 0,
  }).format(v)
}

function formatMonth(ym: string) {
  const [year, month] = ym.split("-")
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-PH", {
    month: "short", year: "numeric",
  })
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-PH", {
    month: "short", day: "numeric", year: "numeric",
  })
}

const STATUS_COLORS: Record<string, string> = {
  draft:    "bg-gray-100 text-gray-800",
  sent:     "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  project:  "bg-purple-100 text-purple-800",
}

const STATUS_LABELS: Record<string, string> = {
  draft:    "Draft",
  sent:     "Sent",
  approved: "Approved",
  rejected: "Rejected",
  project:  "In Project",
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KpiCard({
  title, value, sub, icon, accent = "text-primary",
}: {
  title: string
  value: string
  sub?: string
  icon: React.ReactNode
  accent?: string
}) {
  return (
    <Card className="flex-1 min-w-0">
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`flex-shrink-0 ${accent}`}>{icon}</div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold truncate">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Pipeline Funnel ─────────────────────────────────────────────────────────

function PipelineFunnel({ breakdown }: { breakdown: { status: string; count: number; total: number }[] }) {
  const total = breakdown.reduce((s, b) => s + b.count, 0) || 1
  const stages = [
    { key: "draft",    label: "Draft",    color: "bg-gray-400" },
    { key: "sent",     label: "Sent",     color: "bg-blue-500" },
    { key: "approved", label: "Approved",  color: "bg-green-500" },
    { key: "rejected", label: "Rejected",  color: "bg-red-400" },
    { key: "project",  label: "Project",  color: "bg-purple-500" },
  ]
  const counts = Object.fromEntries(breakdown.map(b => [b.status, b.count]))
  const maxCount = Math.max(...stages.map(s => counts[s.key] || 0), 1)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Lead Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {stages.map(stage => {
            const count = counts[stage.key] || 0
            const pct = (count / maxCount) * 100
            return (
              <div key={stage.key} className="flex items-center gap-3">
                <span className="w-20 text-xs text-muted-foreground text-right">{stage.label}</span>
                <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                  <div
                    className={`${stage.color} h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500`}
                    style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                  >
                    {count > 0 && <span className="text-xs text-white font-semibold">{count}</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        {total === 0 && <p className="text-sm text-muted-foreground text-center py-4">No estimates yet</p>}
      </CardContent>
    </Card>
  )
}

// ─── Revenue Chart ───────────────────────────────────────────────────────────

function RevenueChart({ data }: { data: { month: string; revenue: number }[] }) {
  const maxRev = Math.max(...data.map(d => d.revenue), 1)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Monthly Revenue (Approved + Project)</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No revenue data yet</p>
        ) : (
          <div className="flex items-end gap-2 h-40">
            {data.map(d => {
              const pct = (d.revenue / maxRev) * 100
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="w-full bg-primary/20 rounded-t relative group-hover:bg-primary/30 transition-colors">
                    <div
                      className="bg-primary rounded-t w-full transition-all duration-500"
                      style={{ height: `${pct}%`, minHeight: d.revenue > 0 ? "4px" : "0" }}
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                      {formatCurrency(d.revenue)}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatMonth(d.month)}</span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Inventory Health ────────────────────────────────────────────────────────

function InventoryHealth({ materials }: { materials: Material[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Inventory Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        {materials.length === 0 ? (
          <div className="flex items-center gap-2 py-4 text-green-700">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">All stock levels healthy</span>
          </div>
        ) : (
          <div className="space-y-2">
            {materials.map(m => (
              <div key={m.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Stock: {m.stock_qty} / Min: {m.min_stock_level}
                    {m.supplier_name && ` • ${m.supplier_name}`}
                  </p>
                </div>
                <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs flex-shrink-0">
                  Low
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Recent Estimates ─────────────────────────────────────────────────────────

function RecentEstimates({ estimates }: { estimates: Estimate[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Recent Estimates</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {estimates.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No estimates yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left px-4 py-2 text-xs text-muted-foreground font-medium">Ref</th>
                  <th className="text-left px-4 py-2 text-xs text-muted-foreground font-medium hidden md:table-cell">Client</th>
                  <th className="text-left px-4 py-2 text-xs text-muted-foreground font-medium hidden lg:table-cell">Type</th>
                  <th className="text-right px-4 py-2 text-xs text-muted-foreground font-medium">Amount</th>
                  <th className="text-center px-4 py-2 text-xs text-muted-foreground font-medium">Status</th>
                  <th className="text-left px-4 py-2 text-xs text-muted-foreground font-medium hidden sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {estimates.slice(0, 10).map((e, i) => (
                  <tr key={e.id} className={`border-b last:border-0 ${i % 2 === 1 ? "bg-muted/30" : ""}`}>
                    <td className="px-4 py-2">
                      <a
                        href="/admin/proposals"
                        className="text-primary font-semibold hover:underline"
                        title="Go to Proposals"
                      >
                        {e.reference_no}
                      </a>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground truncate max-w-[120px] hidden md:table-cell">
                      {e.client_name || "—"}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground capitalize hidden lg:table-cell">
                      {e.project_type || "—"}
                    </td>
                    <td className="px-4 py-2 text-right font-semibold">
                      {formatCurrency(e.total_amount)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Badge className={STATUS_COLORS[e.status] || "bg-gray-100"}>
                        {STATUS_LABELS[e.status] || e.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground hidden sm:table-cell">
                      {formatDate(e.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Supplier Performance ────────────────────────────────────────────────────

function SupplierPerformance({ suppliers }: { suppliers: Supplier[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Supplier Performance</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {suppliers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No suppliers found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left px-4 py-2 text-xs text-muted-foreground font-medium">Supplier</th>
                  <th className="text-right px-4 py-2 text-xs text-muted-foreground font-medium">Materials</th>
                  <th className="text-right px-4 py-2 text-xs text-muted-foreground font-medium hidden md:table-cell">Stock Value</th>
                  <th className="text-center px-4 py-2 text-xs text-muted-foreground font-medium">Low Stock</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((s, i) => (
                  <tr key={s.id} className={`border-b last:border-0 ${i % 2 === 1 ? "bg-muted/30" : ""}`}>
                    <td className="px-4 py-2 font-medium truncate max-w-[140px]">{s.name}</td>
                    <td className="px-4 py-2 text-right">{s.material_count}</td>
                    <td className="px-4 py-2 text-right text-muted-foreground hidden md:table-cell">
                      {formatCurrency(s.total_stock_value)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {s.low_stock_items > 0 ? (
                        <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs">
                          {s.low_stock_items}
                        </Badge>
                      ) : (
                        <span className="text-green-600 text-xs">✓ OK</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export default function BuilderDashboardPage() {
  const [stats, setStats]                   = useState<DashboardStats | null>(null)
  const [estimates, setEstimates]            = useState<Estimate[]>([])
  const [lowStockMaterials, setLowStock]     = useState<Material[]>([])
  const [suppliers, setSuppliers]            = useState<Supplier[]>([])
  const [loading, setLoading]                = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [dashRes, estRes, matRes, supRes] = await Promise.all([
        fetch("/api/dashboard"),
        fetch("/api/estimates?limit=10"),
        fetch("/api/inventory/materials"),
        fetch("/api/inventory/suppliers"),
      ])

      let newStats: DashboardStats | null = null
      if (dashRes.ok) newStats = await dashRes.json()
      if (estRes.ok) setEstimates(await estRes.json())

      let lowStock: Material[] = []
      if (matRes.ok) {
        const allMaterials: Material[] = await matRes.json()
        lowStock = allMaterials
          .filter(m => m.stock_qty <= m.min_stock_level && m.is_active)
          .sort((a, b) => a.stock_qty - b.stock_qty)
          .slice(0, 10)
      }

      let supplierData: Supplier[] = []
      if (supRes.ok && matRes.ok) {
        const allMaterials: Material[] = await matRes.json()
        const allSuppliers: { id: string; name: string }[] = await supRes.json()
        supplierData = allSuppliers.map(s => {
          const sMaterials = allMaterials.filter(m => m.supplier_id === s.id && m.is_active)
          const lowStockItems = sMaterials.filter(m => m.stock_qty <= m.min_stock_level)
          const totalStockValue = sMaterials.reduce(
            (sum, m) => sum + m.stock_qty * m.sell_price, 0
          )
          return {
            id: s.id,
            name: s.name,
            material_count: sMaterials.length,
            total_stock_value: totalStockValue,
            low_stock_items: lowStockItems.length,
          }
        }).filter(s => s.material_count > 0)
      }

      setStats(newStats)
      setLowStock(lowStock)
      setSuppliers(supplierData)
    } catch (err) {
      console.error("Dashboard fetch error:", err)
      toast.error("Failed to load dashboard data. Please refresh.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Derive KPIs
  const now = new Date()
  const monthLabel = now.toLocaleDateString("en-PH", { month: "long", year: "numeric" })

  const sentThisMonth = stats?.statusBreakdown.find(b => b.status === "sent")?.count ?? 0
  const totalSentThisMonth = stats?.statusBreakdown.reduce(
    (s, b) => ["draft", "sent", "approved", "rejected", "project"].includes(b.status) ? s + b.count : s, 0
  ) ?? 0
  const conversionRate = totalSentThisMonth > 0
    ? Math.round(((stats?.approvedThisMonth.count ?? 0) / totalSentThisMonth) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Builder Intelligence Dashboard</h1>
          <p className="text-muted-foreground">Business overview at a glance</p>
        </div>
        <Button variant="outline" onClick={fetchAll} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title={`Estimates — ${monthLabel}`}
              value={String(totalSentThisMonth)}
              sub={formatCurrency(
                stats?.statusBreakdown.reduce((s, b) => s + (b.total || 0), 0) ?? 0
              )}
              icon={<FileText className="w-6 h-6" />}
              accent="text-blue-500"
            />
            <KpiCard
              title={`Approved — ${monthLabel}`}
              value={String(stats?.approvedThisMonth.count ?? 0)}
              sub={formatCurrency(stats?.approvedThisMonth.total ?? 0)}
              icon={<TrendingUp className="w-6 h-6" />}
              accent="text-green-500"
            />
            <KpiCard
              title="Active Projects"
              value={String(stats?.activeProjects ?? 0)}
              sub="In progress"
              icon={<Users className="w-6 h-6" />}
              accent="text-purple-500"
            />
            <KpiCard
              title="Conversion Rate"
              value={`${conversionRate}%`}
              sub={`${stats?.approvedThisMonth.count ?? 0} of ${totalSentThisMonth} sent`}
              icon={<BarChart2 className="w-6 h-6" />}
              accent="text-amber-500"
            />
          </div>

          {/* Pipeline + Revenue Row */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <PipelineFunnel breakdown={stats?.statusBreakdown ?? []} />
            </div>
            <div className="lg:col-span-3">
              <RevenueChart data={stats?.revenueByMonth ?? []} />
            </div>
          </div>

          {/* Inventory + Supplier Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <InventoryHealth materials={lowStockMaterials} />
            <SupplierPerformance suppliers={suppliers} />
          </div>

          {/* Recent Estimates */}
          <RecentEstimates estimates={estimates} />
        </>
      )}
    </div>
  )
}
