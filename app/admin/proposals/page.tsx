"use client"

import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import { FileText, Plus, Eye, Send, Download, Loader2, RefreshCw, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Estimate } from "@/lib/services/pricing"

const STATUS_COLORS: Record<string, string> = {
  draft:     "bg-gray-100 text-gray-800",
  sent:      "bg-blue-100 text-blue-800",
  approved:  "bg-green-100 text-green-800",
  rejected:  "bg-red-100 text-red-800",
  project:   "bg-purple-100 text-purple-800",
}

const STATUS_LABELS: Record<string, string> = {
  draft:    "Draft",
  sent:     "Sent",
  approved: "Approved",
  rejected: "Rejected",
  project:  "In Project",
}

function formatCurrency(v: number | null) {
  if (v == null) return "—"
  return new Intl.NumberFormat("en-PH", {
    style: "currency", currency: "PHP",
    minimumFractionDigits: 0,
  }).format(v)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-PH", {
    month: "short", day: "numeric", year: "numeric",
  })
}

// ── PDF Proposal Generator ──────────────────────────────────────────────────
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

  // Estimate summary from data
  const data = estimate.estimate_data as Record<string, unknown> | null
  const units = data?.units as Array<{
    category: string
    meters: number
    baseRate: number
    lineTotal: number
    materialFactor: number
    tierFactor: number
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

  // Line items
  doc.setFont("helvetica", "normal")
  doc.setTextColor(40, 40, 40)
  const itemDefaults = units?.length
    ? units.map((u, i) => ({
        label: `${u.category.charAt(0).toUpperCase() + u.category.slice(1)} Cabinets`,
        meters: u.meters,
        rate: u.baseRate,
        total: u.lineTotal,
      }))
    : [{
        label: `Custom Cabinetry (${estimate.project_type || "General"})`,
        meters: 1,
        rate: estimate.subtotal || estimate.total_amount || 0,
        total: estimate.total_amount || 0,
      }]

  itemDefaults.forEach((item, i) => {
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

  // Totals block
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

  // Notes
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

  // Terms
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

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(180, 180, 180)
  doc.text("Generated by Joson Furniture Builder Intelligence System", W / 2, 287, { align: "center" })

  doc.save(`${estimate.reference_no}.pdf`)
}

// ── Save Estimate Dialog ─────────────────────────────────────────────────────
function SaveEstimateDialog({
  open,
  onClose,
  onSave,
  form,
  setForm,
}: {
  open: boolean
  onClose: () => void
  onSave: () => Promise<void>
  form: {
    client_name: string
    client_email: string
    client_phone: string
    project_type: string
    notes: string
  }
  setForm: (f: typeof form) => void
}) {
  const [saving, setSaving] = useState(false)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Estimate</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Client Name</Label>
            <Input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} placeholder="Juan dela Cruz" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.client_email} onChange={(e) => setForm({ ...form, client_email: e.target.value })} placeholder="juan@email.com" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.client_phone} onChange={(e) => setForm({ ...form, client_phone: e.target.value })} placeholder="0917-123-4567" />
            </div>
          </div>
          <div>
            <Label>Project Type</Label>
            <Input value={form.project_type} onChange={(e) => setForm({ ...form, project_type: e.target.value })} placeholder="Kitchen, Bedroom, etc." />
          </div>
          <div>
            <Label>Notes</Label>
            <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Special requirements..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={async () => {
              setSaving(true)
              await onSave()
              setSaving(false)
            }}
            disabled={saving}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            Save Estimate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function ProposalsPage() {
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [loading, setLoading]     = useState(true)
  const [saveOpen, setSaveOpen]  = useState(false)
  const [form, setForm]         = useState({
    client_name: "", client_email: "", client_phone: "",
    project_type: "Custom Cabinetry", notes: "",
  })

  const fetchEstimates = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/estimates?limit=100")
      if (res.ok) setEstimates(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchEstimates() }, [fetchEstimates])

  const handleSaveEstimate = async () => {
    // Pull current calculator state from localStorage
    const lastCalc = localStorage.getItem("joson_last_estimate")
    const calcData = lastCalc ? JSON.parse(lastCalc) : null

    const res = await fetch("/api/estimates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        status: "draft",
        total_amount: calcData?.total || null,
        subtotal:    calcData?.breakdown?.subtotal || null,
        tax_amount:  calcData?.breakdown?.tax || null,
        discount_amount: calcData?.breakdown?.discount || 0,
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        estimate_data: calcData || null,
      }),
    })

    if (!res.ok) throw new Error(await res.text())
    const estimate = await res.json()
    toast.success(`Estimate ${estimate.reference_no} saved!`)
    setSaveOpen(false)
    setForm({ client_name: "", client_email: "", client_phone: "", project_type: "Custom Cabinetry", notes: "" })
    await fetchEstimates()
    return estimate
  }

  const handleStatusChange = async (id: string, status: string) => {
    await fetch(`/api/estimates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    toast.success(`Status updated to ${STATUS_LABELS[status] || status}`)
    await fetchEstimates()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Proposals & Estimates</h1>
          <p className="text-muted-foreground">{estimates.length} estimate{estimates.length !== 1 ? "s" : ""} saved</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchEstimates}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setSaveOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Estimate
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : estimates.length === 0 ? (
        <Card className="py-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No estimates yet. Use the calculator, then save it here.</p>
          <Button variant="outline" className="mt-4" onClick={() => window.open("/calculator", "_blank")}>
            Open Calculator
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {estimates.map((est) => (
            <Card key={est.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold">{est.reference_no}</span>
                    <Badge className={STATUS_COLORS[est.status] || "bg-gray-100"}>
                      {STATUS_LABELS[est.status] || est.status}
                    </Badge>
                    {est.project_type && (
                      <span className="text-sm text-muted-foreground capitalize">{est.project_type}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {est.client_name || "No client name"}
                    {est.client_email && ` • ${est.client_email}`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Created {formatDate(est.created_at)}
                    {est.valid_until && ` • Valid until ${formatDate(est.valid_until)}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{formatCurrency(est.total_amount)}</p>
                  {est.discount_amount! > 0 && (
                    <p className="text-xs text-muted-foreground">
                      incl. {formatCurrency(est.tax_amount ?? 0)} VAT
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => generateProposalPDF(est)}
                    className="p-2 hover:bg-muted rounded-lg"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <select
                    className="text-xs border rounded px-1 py-1 bg-background"
                    value={est.status}
                    onChange={(e) => handleStatusChange(est.id, e.target.value)}
                  >
                    {Object.entries(STATUS_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SaveEstimateDialog
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        onSave={handleSaveEstimate}
        form={form}
        setForm={setForm}
      />
    </div>
  )
}
