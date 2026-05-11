"use client"
import { useState } from "react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, Hash } from "lucide-react"

type Metric = "revenue" | "count" | "avg"

const METRIC_CONFIG: Record<Metric, { label: string; icon: React.ReactNode; color: string }> = {
  revenue: { label: "Revenue (PHP)", icon: <BarChart3 className="w-3.5 h-3.5" />, color: "#f59e0b" },
  count:   { label: "Estimates Count", icon: <Hash className="w-3.5 h-3.5" />, color: "#3b82f6" },
  avg:     { label: "Avg Deal Size", icon: <TrendingUp className="w-3.5 h-3.5" />, color: "#10b981" },
}

function formatMonth(ym: string) {
  const [year, month] = ym.split("-")
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
}

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(v)

interface RevenueChartProps {
  data: { month: string; revenue: number }[]
  goal: number
}

export function RevenueChart({ data, goal }: RevenueChartProps) {
  const [metric, setMetric] = useState<Metric>("revenue")

  const chartData = data.map((d) => {
    const count = 1
    const avg = d.revenue / count
    return {
      month: formatMonth(d.month),
      rawMonth: d.month,
      revenue: d.revenue,
      count,
      avg,
    }
  })

  const color = METRIC_CONFIG[metric].color

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    const raw = chartData.find((d) => d.month === label)
    return (
      <div className="bg-card border border-border rounded-xl shadow-xl p-3 text-sm">
        <div className="font-semibold text-foreground mb-1">{label}</div>
        {metric === "revenue" && (
          <div className="text-amber-400 font-bold">
            {fmtCurrency(payload[0]?.value || 0)}
          </div>
        )}
        {metric === "count" && (
          <div className="text-blue-400 font-bold">
            {payload[0]?.value} estimate{payload[0]?.value !== 1 ? "s" : ""}
          </div>
        )}
        {metric === "avg" && (
          <div className="text-emerald-400 font-bold">
            {fmtCurrency(payload[0]?.value || 0)}
          </div>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Revenue Overview</CardTitle>
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            {(Object.keys(METRIC_CONFIG) as Metric[]).map((m) => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                  metric === m
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {METRIC_CONFIG[m].icon}
                <span className="hidden sm:inline">{METRIC_CONFIG[m].label}</span>
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  metric === "revenue" || metric === "avg"
                    ? `₱${(v / 1000).toFixed(0)}k`
                    : String(v)
                }
              />
              <Tooltip content={<CustomTooltip />} />
              {metric === "revenue" && (
                <ReferenceLine
                  y={goal}
                  stroke="#f59e0b"
                  strokeDasharray="5 5"
                  strokeOpacity={0.5}
                  label={{ value: "Goal", position: "right", fontSize: 10, fill: "#f59e0b" }}
                />
              )}
              <Area
                type="monotone"
                dataKey={metric}
                stroke={color}
                strokeWidth={2.5}
                fill={`url(#grad-${metric})`}
                dot={{ r: 3, fill: color, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: color, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
