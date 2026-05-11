"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { toast } from "sonner"
import {
  FileText, Plus, Download, Loader2, RefreshCw,
  Search, Trash2, Copy, ChevronLeft, ChevronRight,
  InboxIcon,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from "@/components/ui/dialog"
import type { Estimate } from "@/lib/services/pricing"

// ── Types ─────────────────────────────────────────────────────────────────────

type EstimateStatus = "draft" | "sent" | "approved" | "rejected" | "project"

const STATUSES: EstimateStatus[] = ["draft", "sent", "approved", "rejected", "project"]

const STATUS_COLORS: Record<EstimateStatus, string> = {
  draft:    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  sent:     "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  approved: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  project:  "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
}

const STATUS_LABELS: Record<EstimateStatus, string> = {
  draft:    "Draft",
  sent:     "Sent",
  approved: "Approved",
  rejected: "Rejected",
  project:  "In Project",
}

const ITEMS_PER_PAGE = 10

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(v: number | null) {
  if (v == null) return "—"
  return new Intl.NumberFormat("en-PH", {
    style: "currency", currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-PH", {
    month: "short", day: "numeric", year: "numeric",
  })
}

// ── PDF Generator ─────────────────────────────────────────────────────────────

async function generateProposalPDF(estimate: Estimate): Promise<void> {
  const { jsPDF } = await import("jspdf")

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  const W = 210, margin = 20, contentW = W - 2 * margin

  // Header
  doc.setFillColor(20, 20, 20)
  doc.rect(0, 0, W, 45, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont("helvetica", "bold")
  doc.text("JOSON FURNITURE", margin, 22)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text("Custom Cabinetry & Furniture", margin, 29)
  doc.text("Bulacan, Philippines | josonfurniture.com", margin, 35)
  doc.setFontSize(9)
  doc.text(`Quotation No: ${estimate.reference_no}`, W - margin, 22, { align: "right" })
  doc.text(`Date: ${formatDate(estimate.created_at)}`, W - margin, 29, { align: "right" })
  if (estimate.valid_until) {
    doc.text(`Valid Until: ${formatDate(estimate.valid_until)}`, W - margin, 35, { align: "right" })
  }

  let y = 55

  // Client info
  doc.setTextColor(80, 80, 80)
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.text("PREPARED FOR:", margin, y)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text(estimate.client_name || "Valued Customer", margin, y + 6)
  if (estimate.client_email) doc.text(estimate.client_email, margin, y + 12)
  if (estimate.client_phone) doc.text(estimate.client_phone, margin, y + 18)
  doc.setTextColor(0, 0, 0)
  y += 28

  // Project type
  doc.setFontSize(9)
  doc.setTextColor(120, 120, 120)
  doc.text("PROJECT TYPE", margin, y)
  doc.setTextColor(0, 0, 0)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.text(estimate.project_type ? estimate.project_type.charAt(0).toUpperCase() + estimate.project_type.slice(1) : "Custom Cabinetry", margin, y + 6)
  y += 16

  // Divider
  doc.setDrawColor(220, 220, 220)
  doc.line(margin, y, W - margin, y)
  y += 8

  const data = estimate.estimate_data as Record<string, unknown> | null
  const units = data?.units as Array<{
    category: string; meters: number; baseRate: number; lineTotal: number;
  }> | null

  // Table header
  doc.setFillColor(245, 245, 245)
  doc.rect(margin, y, contentW, 8, "F")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text("ITEM", margin + 2, y + 5.5)
  doc.text("QTY (LM)", margin + 70, y + 5.5)
  doc.text("RATE", margin + 95, y + 5.5)
  doc.text("AMOUNT", W - margin - 2, y + 5.5, { align: "right" })
  y += 10

  doc.setFont("helvetica", "normal")
  doc.setTextColor(40, 40, 40)
  const items = units?.length
    ? units.map((u) => ({
        label: `${u.category.charAt(0).toUpperCase() + u.category.slice(1)} Cabinets`,
        meters: u.meters,
        rate: u.baseRate,
        total: u.lineTotal,
      }))
    : [{
        label: `Custom Cabinetry (${estimate.project_type || "General"})`,
        meters: 1,
        rate: estimate.subtotal ?? estimate.total_amount ?? 0,
        total: estimate.total_amount ?? 0,
      }]

  items.forEach((item, i) => {
    if (i % 2 === 1) {
      doc.setFillColor(250, 250, 250)
      doc.rect(margin, y - 3, contentW, 7, "F")
    }
    doc.setFontSize(9)
    doc.text(item.label, margin + 2, y + 1)
    doc.text(`${item.meters.toFixed(2)} lm`, margin + 70, y + 1)
    doc.text(formatCurrency(item.rate), margin + 95, y + 1)
    doc.text(formatCurrency(item.total), W - margin - 2, y + 1, { align: "right" })
    y += 7
  })

  y += 4
  doc.line(margin, y, W - margin, y)
  y += 6

  const totalsX = W - margin - 70
  const totalsV = W - margin - 2

  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(80, 80, 80)
  doc.text("Subtotal", totalsX, y)
  doc.setTextColor(40, 40, 40)
  doc.text(formatCurrency(estimate.subtotal ?? estimate.total_amount ?? 0), totalsV, y, { align: "right" })
  y += 6

  if ((estimate.discount_amount ?? 0) > 0) {
    doc.setTextColor(80, 80, 80)
    doc.text("Discount", totalsX, y)
    doc.setTextColor(40, 40, 40)
    doc.text(`-${formatCurrency(estimate.discount_amount)}`, totalsV, y, { align: "right" })
    y += 6
  }

  if ((estimate.tax_amount ?? 0) > 0) {
    doc.setTextColor(80, 80, 80)
    doc.text("VAT (12%)", totalsX, y)
    doc.setTextColor(40, 40, 40)
    doc.text(formatCurrency(estimate.tax_amount ?? 0), totalsV, y, { align: "right" })
    y += 6
  }

  doc.setDrawColor(180, 180, 180)
  doc.line(totalsX, y, W - margin, y)
  y += 5
  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.setTextColor(20, 20, 20)
  doc.text("TOTAL", totalsX, y + 1)
  doc.setFontSize(13)
  doc.text(formatCurrency(estimate.total_amount ?? 0), totalsV, y + 1, { align: "right" })
  y += 14

  if (estimate.notes) {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text("NOTES", margin, y)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(60, 60, 60)
    const noteLines = doc.splitTextToSize(estimate.notes, contentW)
    doc.text(noteLines, margin, y + 6)
    y += 6 + noteLines.length * 5
  }

  y = Math.max(y, 240)
  doc.setDrawColor(220, 220, 220)
  doc.line(margin, y, W - margin, y)
  y += 6
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text("TERMS & CONDITIONS", margin, y)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(80, 80, 80)
  const terms = [
    "This quotation is valid for 30 days from the date issued.",
    "A 50% deposit is required to begin fabrication.",
    "Final balance is payable upon delivery and installation.",
    "Installation timeframe: 2–4 weeks after deposit confirmation.",
    "Prices are in Philippine Pesos (PHP) and include applicable taxes.",
  ]
  terms.forEach((t, i) => {
    doc.text(`• ${t}`, margin, y + 5 + i * 5)
  })

  doc.setFontSize(8)
  doc.setTextColor(180, 180, 180)
  doc.text("Generated by Joson Furniture Builder Intelligence System", W / 2, 287, { align: "center" })

  doc.save(`${estimate.reference_no}.pdf`)
}

// ── Skeleton Card ──────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2.5 flex-1">
            <div className="flex items-center gap-2">
              <div className="h-4 w-28 bg-muted rounded" />
              <div className="h-5 w-16 bg-muted rounded-full" />
            </div>
            <div className="h-3.5 w-48 bg-muted rounded" />
            <div className="h-3 w-36 bg-muted rounded" />
          </div>
          <div className="space-y-1.5 text-right">
            <div className="h-6 w-24 bg-muted rounded ml-auto" />
            <div className="h-3 w-20 bg-muted rounded ml-auto" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <Card className="py-16 text-center border-dashed">
      <CardContent className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <InboxIcon className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <p className="font-semibold text-lg">No estimates found</p>
          <p className="text-muted-foreground text-sm mt-1">
            Create your first estimate from the calculator.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => window.open("/calculator", "_blank")}>
            <FileText className="w-4 h-4 mr-2" />
            Open Calculator
          </Button>
          <Button onClick={onNew}>
            <Plus className="w-4 h-4 mr-2" />
            New Estimate
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ── New Estimate Dialog ──────────────────────────────────────────────────────

function NewEstimateDialog({
  open,
  onClose,
  onSave,
}: {
  open: boolean
  onClose: () => void
  onSave: (data: { client_name: string; client_email: string; client_phone: string; project_type: string; notes: string }) => Promise<void>
}) {
  const [form, setForm] = useState({
    client_name: "", client_email: "", client_phone: "",
    project_type: "Custom Cabinetry", notes: "",
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(form)
      setForm({ client_name: "", client_email: "", client_phone: "", project_type: "Custom Cabinetry", notes: "" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Estimate</DialogTitle>
          <DialogDescription>
            Save a draft estimate. You can edit details and generate a PDF later.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Client Name</label>
            <Input
              value={form.client_name}
              onChange={(e) => setForm({ ...form, client_name: e.target.value })}
              placeholder="Juan dela Cruz"
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={form.client_email}
                onChange={(e) => setForm({ ...form, client_email: e.target.value })}
                placeholder="juan@email.com"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input
                value={form.client_phone}
                onChange={(e) => setForm({ ...form, client_phone: e.target.value })}
                placeholder="0917-123-4567"
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Project Type</label>
            <Input
              value={form.project_type}
              onChange={(e) => setForm({ ...form, project_type: e.target.value })}
              placeholder="Kitchen, Bedroom, etc."
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Notes</label>
            <Input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Special requirements..."
              className="mt-1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            Create Estimate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Delete Confirmation Dialog ────────────────────────────────────────────────

function DeleteDialog({
  estimate,
  open,
  onClose,
  onConfirm,
}: {
  estimate: Estimate | null
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
}) {
  const [deleting, setDeleting] = useState(false)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Estimate</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground">
          Are you sure you want to delete <strong>{estimate?.reference_no}</strong>
          {estimate?.client_name ? ` (${estimate.client_name})` : ""}? This action cannot be undone.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant="destructive"
            onClick={async () => {
              setDeleting(true)
              try {
                await onConfirm()
                onClose()
              } finally {
                setDeleting(false)
              }
            }}
            disabled={deleting}
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Estimate Card ─────────────────────────────────────────────────────────────

function EstimateCard({
  estimate,
  onStatusChange,
  onDelete,
  onDuplicate,
  onDownloadPdf,
}: {
  estimate: Estimate
  onStatusChange: (id: string, status: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onDuplicate: (estimate: Estimate) => Promise<void>
  onDownloadPdf: (estimate: Estimate) => Promise<void>
}) {
  const [statusOpen, setStatusOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  return (
    <Card className="hover:shadow-md transition-all duration-200 group">
      <CardContent className="p-5">
        {/* Top row: ref + status + amount */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono font-semibold text-sm">{estimate.reference_no}</span>
            <Badge className={`${STATUS_COLORS[estimate.status as EstimateStatus] || STATUS_COLORS.draft} text-xs`}>
              {STATUS_LABELS[estimate.status as EstimateStatus] || estimate.status}
            </Badge>
            {estimate.project_type && (
              <span className="text-xs text-muted-foreground capitalize">{estimate.project_type}</span>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="font-bold text-xl text-foreground">
              {formatCurrency(estimate.total_amount)}
            </p>
            {(estimate.tax_amount ?? 0) > 0 && (
              <p className="text-xs text-muted-foreground">incl. {formatCurrency(estimate.tax_amount)} VAT</p>
            )}
          </div>
        </div>

        {/* Client info */}
        <div className="mb-4">
          <p className="font-medium text-sm truncate">
            {estimate.client_name || <span className="text-muted-foreground italic">No client name</span>}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {estimate.client_email && <span>{estimate.client_email}</span>}
            {estimate.client_email && estimate.client_phone && <span> · </span>}
            {estimate.client_phone && <span>{estimate.client_phone}</span>}
            {!estimate.client_email && !estimate.client_phone && <span>No contact info</span>}
          </p>
        </div>

        {/* Footer: dates + actions */}
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            <span>Created {formatDate(estimate.created_at)}</span>
            {estimate.valid_until && (
              <span className="ml-2">· Valid until {formatDate(estimate.valid_until)}</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
            {/* Download PDF */}
            <button
              onClick={() => onDownloadPdf(estimate)}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              title="Download PDF"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Duplicate */}
            <button
              onClick={() => onDuplicate(estimate)}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              title="Duplicate Estimate"
            >
              <Copy className="w-4 h-4" />
            </button>

            {/* Change Status */}
            <div className="relative">
              <select
                className="appearance-none pl-2 pr-7 py-1.5 text-xs border rounded-lg bg-background hover:bg-accent cursor-pointer transition-colors"
                value={estimate.status}
                onChange={async (e) => {
                  if (e.target.value !== estimate.status) {
                    await onStatusChange(estimate.id, e.target.value)
                  }
                }}
                title="Change Status"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
              <ChevronLeft
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none"
                style={{ transform: "translateY(-50%) rotate(270deg)" }}
              />
            </div>

            {/* Delete */}
            <button
              onClick={async () => {
                setDeleting(true)
                await onDelete(estimate.id)
                setDeleting(false)
              }}
              disabled={deleting}
              className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors disabled:opacity-50"
              title="Delete"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Stats Row ─────────────────────────────────────────────────────────────────

function StatsRow({ estimates }: { estimates: Estimate[] }) {
  const total     = estimates.length
  const approved  = estimates.filter((e) => e.status === "approved").length
  const inProject = estimates.filter((e) => e.status === "project").length
  const draft     = estimates.filter((e) => e.status === "draft").length
  const sent      = estimates.filter((e) => e.status === "sent").length

  const revenue = estimates
    .filter((e) => e.status === "approved" || e.status === "project")
    .reduce((sum, e) => sum + (e.total_amount ?? 0), 0)

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Total Estimates</p>
          <p className="text-2xl font-bold mt-1">{total}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            Approved + Project
          </p>
          <p className="text-2xl font-bold mt-1">{approved + inProject}</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-0.5 font-medium">
            {formatCurrency(revenue)} revenue
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Draft</p>
          <p className="text-2xl font-bold mt-1">{draft}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Sent</p>
          <p className="text-2xl font-bold mt-1">{sent}</p>
        </CardContent>
      </Card>
    </div>
  )
}

// ── Filter Tabs ───────────────────────────────────────────────────────────────

type FilterTab = "all" | EstimateStatus

function FilterTabs({
  active,
  counts,
  onChange,
}: {
  active: FilterTab
  counts: Record<FilterTab, number>
  onChange: (tab: FilterTab) => void
}) {
  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "draft", label: "Draft" },
    { key: "sent", label: "Sent" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
    { key: "project", label: "In Project" },
  ]

  return (
    <div className="flex items-center gap-1 flex-wrap border-b">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors relative ${
            active === tab.key
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
          }`}
        >
          {tab.label}
          {counts[tab.key] > 0 && (
            <span
              className={`ml-1.5 text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center inline-block ${
                active === tab.key
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {counts[tab.key]}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

// ── Pagination ────────────────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (p: number) => void
}) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <span className="text-sm text-muted-foreground px-2">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ProposalsPage() {
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState("")
  const [filter, setFilter]       = useState<FilterTab>("all")
  const [page, setPage]           = useState(1)
  const [newOpen, setNewOpen]     = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Estimate | null>(null)

  const fetchEstimates = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/estimates?limit=500")
      if (res.ok) setEstimates(await res.json())
      else toast.error("Failed to load estimates.")
    } catch {
      toast.error("Network error loading estimates.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchEstimates() }, [fetchEstimates])

  // Reset page on filter/search change
  const handleSearch = (val: string) => {
    setSearch(val)
    setPage(1)
  }

  const handleFilterChange = (tab: FilterTab) => {
    setFilter(tab)
    setPage(1)
  }

  // Filtered + searched list
  const filtered = useMemo(() => {
    let list = estimates
    if (filter !== "all") {
      list = list.filter((e) => e.status === filter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (e) =>
          e.reference_no.toLowerCase().includes(q) ||
          (e.client_name?.toLowerCase().includes(q) ?? false) ||
          (e.client_email?.toLowerCase().includes(q) ?? false),
      )
    }
    return list
  }, [estimates, filter, search])

  // Counts per tab
  const counts = useMemo<Record<FilterTab, number>>(() => ({
    all:      estimates.length,
    draft:    estimates.filter((e) => e.status === "draft").length,
    sent:     estimates.filter((e) => e.status === "sent").length,
    approved: estimates.filter((e) => e.status === "approved").length,
    rejected: estimates.filter((e) => e.status === "rejected").length,
    project:  estimates.filter((e) => e.status === "project").length,
  }), [estimates])

  // Paginated
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleNewSave = async (form: {
    client_name: string; client_email: string; client_phone: string;
    project_type: string; notes: string
  }) => {
    const lastCalc = localStorage.getItem("joson_last_estimate")
    const calcData = lastCalc ? JSON.parse(lastCalc) : null

    const res = await fetch("/api/estimates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        status: "draft",
        total_amount:    calcData?.total ?? null,
        subtotal:        calcData?.breakdown?.subtotal ?? null,
        tax_amount:      calcData?.breakdown?.tax ?? null,
        discount_amount: calcData?.breakdown?.discount ?? 0,
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString().slice(0, 19).replace("T", " "),
        estimate_data: calcData ?? null,
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error || "Failed to save estimate.")
      return
    }
    const estimate = await res.json()
    toast.success(`Estimate ${estimate.reference_no} created!`)
    setNewOpen(false)
    await fetchEstimates()
  }

  const handleStatusChange = async (id: string, status: string) => {
    const res = await fetch(`/api/estimates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      toast.success(`Status updated to ${STATUS_LABELS[status as EstimateStatus] || status}`)
      setEstimates((prev) =>
        prev.map((e) => e.id === id ? { ...e, status } : e),
      )
    } else {
      toast.error("Failed to update status.")
    }
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/estimates/${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Estimate deleted.")
      setEstimates((prev) => prev.filter((e) => e.id !== id))
    } else {
      toast.error("Failed to delete estimate.")
    }
  }

  const handleDuplicate = async (original: Estimate) => {
    const res = await fetch("/api/estimates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_name:      original.client_name,
        client_email:     original.client_email,
        client_phone:     original.client_phone,
        project_type:    original.project_type,
        notes:            original.notes,
        status:           "draft",
        total_amount:     original.total_amount,
        subtotal:         original.subtotal,
        tax_amount:       original.tax_amount,
        discount_amount: original.discount_amount,
        valid_until:      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString().slice(0, 19).replace("T", " "),
        estimate_data: original.estimate_data,
      }),
    })
    if (!res.ok) {
      toast.error("Failed to duplicate estimate.")
      return
    }
    const dup = await res.json()
    toast.success(`Cloned as ${dup.reference_no}`)
    await fetchEstimates()
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Proposals</h1>
          <p className="text-muted-foreground">
            {filtered.length} estimate{filtered.length !== 1 ? "s" : ""}
            {search && ` matching "${search}"`}
            {filter !== "all" && ` (${STATUS_LABELS[filter]})`}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search ref, client, email..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
          </div>
          <Button variant="outline" onClick={fetchEstimates} disabled={loading} title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={() => setNewOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Estimate
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <StatsRow estimates={estimates} />

      {/* Filter Tabs */}
      <FilterTabs active={filter} counts={counts} onChange={handleFilterChange} />

      {/* Content */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState onNew={() => setNewOpen(true)} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {paginated.map((est) => (
              <EstimateCard
                key={est.id}
                estimate={est}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                onDownloadPdf={generateProposalPDF}
              />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      {/* Dialogs */}
      <NewEstimateDialog
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onSave={handleNewSave}
      />
      <DeleteDialog
        estimate={deleteTarget}
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) await handleDelete(deleteTarget.id)
        }}
      />
    </div>
  )
}

