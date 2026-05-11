"use client"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Estimate } from "@/lib/services/pricing"
import { FileText, ArrowRight, Clock } from "lucide-react"

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  draft:    { label: "Draft",    className: "bg-muted text-muted-foreground" },
  sent:     { label: "Sent",     className: "bg-blue-500/15 text-blue-400 border border-blue-500/30" },
  approved: { label: "Approved", className: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" },
  declined: { label: "Declined", className: "bg-red-500/15 text-red-400 border border-red-500/30" },
  project:  { label: "Project",  className: "bg-violet-500/15 text-violet-400 border border-violet-500/30" },
}

function formatCurrency(v: number | null) {
  if (v == null) return "—"
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(v)
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES["draft"]
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.className}`}>
      {status === "draft" && <Clock className="w-2.5 h-2.5 mr-1" />}
      {style.label}
    </span>
  )
}

interface EstimatesPipelineProps {
  estimates: Estimate[]
}

export function EstimatesPipeline({ estimates }: EstimatesPipelineProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Recent Estimates</CardTitle>
          <Link
            href="/admin/proposals"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            View all
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {estimates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <FileText className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">No estimates yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {estimates.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-muted-foreground">
                      {e.reference_no}
                    </span>
                    <StatusBadge status={e.status} />
                  </div>
                  <div className="text-sm font-medium text-foreground truncate">
                    {e.client_name || <span className="text-muted-foreground italic">No client name</span>}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {e.project_type || "General"} · {formatDate(e.created_at)}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold text-foreground">
                    {formatCurrency(e.total_amount)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {e.total_amount ? "PHP" : "No total"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
