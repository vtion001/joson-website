"use client"

import * as React from "react"
import { useState, useCallback, useEffect, useMemo } from "react"
import {
  ChefHat, Bath, BedDouble, Briefcase, Layers,
  Ruler, Wrench, Palette, Cog,
  Calculator, Info,
  Bed, Archive, Star, ShieldCheck,
  ChevronDown, ChevronUp, Plus, Trash2,
  Mail, Tv, Shirt, UtensilsCrossed, Sparkles,
  CheckCircle2, AlertCircle, ToggleLeft, ToggleRight,
  RefreshCw, GripVertical, Package,
} from "lucide-react"
import { toast } from "sonner"
import { estimateCabinetCost, materialPricing, finishPricing, hardwarePricing } from "@/lib/estimator"

// ─── Types ────────────────────────────────────────────────────────────────────

interface CabinetUnit {
  id: string
  category: "base" | "hanging" | "tall"
  enabled: boolean
  meters: string
  material: string
  finish: string
  hardware: string
  installation: boolean
}

interface CalcResult {
  total: number
  projectType: string
  breakdown: Record<string, unknown>
  warnings: string[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PROJECT_TYPES = [
  { value: "kitchen",          label: "Kitchen",              icon: ChefHat,         desc: "Base, hanging & tall cabinets" },
  { value: "bathroom",         label: "Bathroom",             icon: Bath,            desc: "Vanity & storage cabinets" },
  { value: "bedroom",          label: "Bedroom",              icon: BedDouble,       desc: "Closet & wardrobe systems" },
  { value: "office",           label: "Office",               icon: Briefcase,       desc: "Built-in desks & storage" },
  { value: "bunkbed",          label: "Bunk Bed",             icon: Bed,             desc: "Custom bunk beds & lofts" },
  { value: "entertainment",    label: "Entertainment Center", icon: Tv,              desc: "TV units & media consoles" },
  { value: "walkin_closet",    label: "Walk-in Closet",       icon: Shirt,           desc: "Custom walk-in wardrobes" },
  { value: "mudroom",          label: "Mudroom / Laundry",    icon: UtensilsCrossed, desc: "Utility & storage rooms" },
]

const CABINET_TYPES = [
  { value: "basic",    label: "Standard", desc: "Value-driven, reliable quality",    icon: Archive,     badge: "" },
  { value: "premium", label: "Premium",  desc: "Enhanced features & materials",    icon: Star,        badge: "Popular" },
  { value: "luxury",  label: "Luxury",   desc: "Top-tier quality and finishes",    icon: ShieldCheck, badge: "" },
]

const KITCHEN_SCOPES = [
  { value: "",             label: "Full Kitchen (Base + Hanging)" },
  { value: "base_only",    label: "Base Cabinets Only" },
  { value: "hanging_only", label: "Hanging Cabinets Only" },
]

const CABINET_CATEGORIES = [
  { value: "base",    label: "Base",    desc: "Floor-level cabinets" },
  { value: "hanging", label: "Hanging", desc: "Wall-mounted cabinets" },
  { value: "tall",    label: "Tall",   desc: "Full-height cabinets" },
]

const BUNK_SIZES = [
  { value: "single", label: "Single" },
  { value: "double", label: "Double" },
  { value: "queen",  label: "Queen" },
]

const BUNK_TYPES = [
  { value: "standard", label: "Standard Bunk" },
  { value: "l_shaped", label: "L-Shaped Bunk" },
  { value: "loft",     label: "Loft Bed" },
  { value: "triple",   label: "Triple Decker" },
]

const ACCESSORIES = [
  { id: "led_interior",    label: "LED Interior Lighting",  price: 2500, unit: "per cabinet" },
  { id: "soft_close_buf",  label: "Soft-Close Buffer",      price: 75,   unit: "each" },
  { id: "glass_shelves",   label: "Glass Shelves",          price: 850,  unit: "per shelf" },
  { id: "adjustable_legs", label: "Adjustable Legs",        price: 60,   unit: "each" },
  { id: "push_open",       label: "Push-to-Open Latch",    price: 195,  unit: "each" },
]

const COUNTERTOP_OPTIONS = [
  { value: "none",          label: "None",            rate: 0 },
  { value: "laminate",      label: "Laminate",        rate: 1800 },
  { value: "solid_surface", label: "Solid Surface",  rate: 4500 },
  { value: "granite",       label: "Granite",         rate: 6500 },
  { value: "quartz",        label: "Quartz",          rate: 8500 },
]

const STORAGE_KEY = "joson_estimate_config"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2, 9) }

function fmt(n: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(n)
}

function newUnit(): CabinetUnit {
  return { id: uid(), category: "base", enabled: true, meters: "", material: "", finish: "", hardware: "", installation: false }
}

// ─── Accordion Section ────────────────────────────────────────────────────────

function AccordionSection({ title, icon, children, defaultOpen = true, badge }: {
  title: string; icon?: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean; badge?: string
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-xl border border-border/50 bg-card/40 overflow-hidden">
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/40 transition-colors cursor-pointer">
        <div className="flex items-center gap-2.5">
          <span className="text-primary/80">{icon}</span>
          <span className="text-sm font-semibold text-foreground">{title}</span>
          {badge && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{badge}</span>}
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
          : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  )
}

// ─── Styled Select ────────────────────────────────────────────────────────────

function StyledSelect({ label, value, onChange, options, placeholder = "Select..." }: {
  label: React.ReactNode; value: string; onChange: (v: string) => void
  options: { value: string; label: string }[]; placeholder?: string
}) {
  return (
    <div className="space-y-1.5">
      {label && <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>}
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-background border border-border/60 rounded-lg px-3 py-2.5 pr-9 text-sm text-foreground
            focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all cursor-pointer hover:border-border [&_option]:bg-card">
          <option value="">{placeholder}</option>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  )
}

// ─── Card Radio ───────────────────────────────────────────────────────────────

function CardRadio({ selected, onSelect, label, description, icon: Icon, badge }: {
  selected: boolean; onSelect: () => void; label: string; description?: string
  icon?: React.ComponentType<{ className?: string }>; badge?: string
}) {
  return (
    <button type="button" onClick={onSelect}
      className={`w-full text-left p-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer
        ${selected ? "border-primary/60 bg-primary/8 ring-1 ring-primary/20" : "border-border/40 bg-card/40 hover:border-border/80 hover:bg-card/60"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          {Icon && (
            <div className={`mt-0.5 rounded-md p-1.5 ${selected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${selected ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
              {badge && selected && <span className="bg-primary/15 text-primary text-xs font-semibold px-1.5 py-0.5 rounded-full">{badge}</span>}
            </div>
            {description && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>}
          </div>
        </div>
        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${selected ? "border-primary bg-primary" : "border-border"}`}>
          {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
        </div>
      </div>
    </button>
  )
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, label, description }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; description?: string
}) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200 cursor-pointer
        ${checked ? "border-primary/30 bg-primary/5" : "border-border/40 bg-card/40 hover:bg-card/60"}`}>
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${checked ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
          {checked ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
        </div>
        <div className="text-left">
          <p className={`text-sm font-semibold ${checked ? "text-foreground" : "text-muted-foreground"}`}>{label}</p>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      </div>
      <div className={`text-xs font-medium px-2 py-1 rounded-full ${checked ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
        {checked ? "ON" : "OFF"}
      </div>
    </button>
  )
}

// ─── Cabinet SVG Preview ─────────────────────────────────────────────────────

function CabinetPreview({ category }: { category: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 200 140" className="w-full max-w-[160px] h-20" fill="none">
        <rect x="10" y="90" width="55" height="40" rx="2"
          fill={category === "base" ? "#f59e0b" : "#374151"}
          stroke={category === "base" ? "#f59e0b" : "#4b5563"} strokeWidth="1.5" />
        {category === "base" && (
          <><rect x="18" y="98" width="17" height="24" rx="1" fill="#1f2937" opacity="0.6" />
          <rect x="40" y="98" width="17" height="24" rx="1" fill="#1f2937" opacity="0.6" />
          <circle cx="26" cy="110" r="1.5" fill="#9ca3af" /><circle cx="49" cy="110" r="1.5" fill="#9ca3af" /></>
        )}
        <rect x="72" y="40" width="55" height="38" rx="2"
          fill={category === "hanging" ? "#60a5fa" : "#374151"}
          stroke={category === "hanging" ? "#60a5fa" : "#4b5563"} strokeWidth="1.5" />
        {category === "hanging" && (
          <><rect x="80" y="48" width="17" height="22" rx="1" fill="#1f2937" opacity="0.6" />
          <rect x="102" y="48" width="17" height="22" rx="1" fill="#1f2937" opacity="0.6" />
          <circle cx="88" cy="59" r="1.5" fill="#9ca3af" /><circle cx="110" cy="59" r="1.5" fill="#9ca3af" /></>
        )}
        <rect x="138" y="15" width="40" height="115" rx="2"
          fill={category === "tall" ? "#34d399" : "#374151"}
          stroke={category === "tall" ? "#34d399" : "#4b5563"} strokeWidth="1.5" />
        {category === "tall" && (
          <><rect x="146" y="23" width="24" height="20" rx="1" fill="#1f2937" opacity="0.6" />
          <rect x="146" y="47" width="24" height="20" rx="1" fill="#1f2937" opacity="0.6" />
          <rect x="146" y="71" width="24" height="20" rx="1" fill="#1f2937" opacity="0.6" />
          <circle cx="158" cy="33" r="1.5" fill="#9ca3af" /><circle cx="158" cy="57" r="1.5" fill="#9ca3af" /><circle cx="158" cy="81" r="1.5" fill="#9ca3af" /></>
        )}
        <line x1="5" y1="130" x2="195" y2="130" stroke="#4b5563" strokeWidth="1" strokeDasharray="3,3" />
        <line x1="5" y1="8" x2="195" y2="8" stroke="#374151" strokeWidth="1" strokeDasharray="3,3" />
      </svg>
      <div className="flex gap-3">
        {(["base", "hanging", "tall"] as const).map((cat) => (
          <div key={cat} className="flex items-center gap-1">
            <div className={`w-2.5 h-2.5 rounded-sm ${category === cat ? "bg-primary" : "bg-muted"}`} />
            <span className="text-xs text-muted-foreground capitalize">{cat}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Unit Builder Row ─────────────────────────────────────────────────────────

function UnitBuilderRow({ unit, onUpdate, onRemove, allMaterials, allFinishes, allHardware }: {
  unit: CabinetUnit
  onUpdate: (u: CabinetUnit) => void
  onRemove: () => void
  allMaterials: { value: string; label: string }[]
  allFinishes: { value: string; label: string }[]
  allHardware: { value: string; label: string }[]
}) {
  const catColors: Record<string, string> = {
    base: "border-amber-500/30 bg-amber-500/5",
    hanging: "border-blue-500/30 bg-blue-500/5",
    tall: "border-emerald-500/30 bg-emerald-500/5",
  }
  return (
    <div className={`rounded-xl border p-3.5 space-y-2.5 transition-all ${unit.enabled ? catColors[unit.category] : "border-border/30 bg-muted/20 opacity-60"}`}>
      <div className="flex items-center gap-2">
        <GripVertical className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        <button type="button" onClick={() => onUpdate({ ...unit, enabled: !unit.enabled })}
          className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${unit.enabled ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
          {unit.enabled ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
        </button>
        <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-semibold ${unit.enabled ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
          {unit.category}
        </span>
        <div className="flex-1" />
        <button type="button" onClick={onRemove}
          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      {unit.enabled && (
        <div className="grid grid-cols-2 gap-2 pl-10">
          <div className="col-span-2 sm:col-span-1">
            <label className="text-xs text-muted-foreground font-medium">Linear Meters</label>
            <div className="relative mt-0.5">
              <input type="number" min="0.1" step="0.1" placeholder="e.g. 2.5"
                value={unit.meters} onChange={(e) => onUpdate({ ...unit, meters: e.target.value })}
                className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 pr-9 text-sm text-foreground
                  focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">m</span>
            </div>
          </div>
          <StyledSelect label="Material" value={unit.material} onChange={(v) => onUpdate({ ...unit, material: v })} options={allMaterials} placeholder="Select..." />
          <StyledSelect label="Finish" value={unit.finish} onChange={(v) => onUpdate({ ...unit, finish: v })} options={allFinishes} placeholder="Select..." />
          <StyledSelect label="Hardware" value={unit.hardware} onChange={(v) => onUpdate({ ...unit, hardware: v })} options={allHardware} placeholder="Select..." />
          <div className="flex items-center gap-2">
            <input type="checkbox" id={`inst-${unit.id}`} checked={unit.installation}
              onChange={(e) => onUpdate({ ...unit, installation: e.target.checked })}
              className="w-4 h-4 rounded accent-primary cursor-pointer" />
            <label htmlFor={`inst-${unit.id}`} className="text-xs text-muted-foreground cursor-pointer">Installation</label>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function EstimatorCalculator(): JSX.Element {
  const [projectType,    setProjectType]    = useState("kitchen")
  const [cabinetType,    setCabinetType]    = useState("")
  const [linearMeter,    setLinearMeter]    = useState("")
  const [kitchenScope,   setKitchenScope]   = useState("")
  const [material,        setMaterial]        = useState("")
  const [finish,          setFinish]          = useState("")
  const [hardware,        setHardware]         = useState("")
  const [installation,     setInstallation]    = useState(false)
  const [units,            setUnits]            = useState<CabinetUnit[]>([])
  const [discount,         setDiscount]         = useState("")
  const [applyTax,          setApplyTax]         = useState(true)
  const [countertop,         setCountertop]       = useState({ type: "none", meters: "" })
  const [selectedAcc,        setSelectedAcc]      = useState<Set<string>>(new Set())
  const [estimate,           setEstimate]         = useState<CalcResult | null>(null)
  const [errors,             setErrors]           = useState<string[]>([])
  const [loading,            setLoading]          = useState(false)
  const [useUnitBuilder,     setUseUnitBuilder]   = useState(false)
  const [previewCategory,     setPreviewCategory]  = useState("base")

  const isCabinet = projectType !== "" && projectType !== "bunkbed"
  const isBunkBed = projectType === "bunkbed"

  const allMaterials = Object.entries(materialPricing).map(([value, p]) => ({ value, label: p.label }))
  const allFinishes  = Object.entries(finishPricing).map(([value, f])  => ({ value, label: f.label }))
  const allHardware  = Object.entries(hardwarePricing).map(([value, h]) => ({ value, label: h.label }))

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const p = JSON.parse(saved)
        if (p.projectType)  setProjectType(p.projectType)
        if (p.cabinetType) setCabinetType(p.cabinetType)
        if (p.linearMeter) setLinearMeter(p.linearMeter)
        if (p.kitchenScope) setKitchenScope(p.kitchenScope)
        if (p.material)    setMaterial(p.material)
        if (p.finish)      setFinish(p.finish)
        if (p.hardware)    setHardware(p.hardware)
        if (p.installation !== undefined) setInstallation(p.installation)
        if (p.discount)    setDiscount(p.discount)
        if (p.applyTax !== undefined) setApplyTax(p.applyTax)
        if (p.countertop)  setCountertop(p.countertop)
        if (Array.isArray(p.units)) setUnits(p.units)
      }
    } catch { /* ignore */ }
  }, [])

  const persist = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        projectType, cabinetType, linearMeter, kitchenScope, material, finish, hardware,
        installation, discount, applyTax, countertop, units,
      }))
    } catch { /* ignore */ }
  }, [projectType, cabinetType, linearMeter, kitchenScope, material, finish, hardware, installation, discount, applyTax, countertop, units])

  useEffect(() => { persist() }, [persist])

  const addUnit    = useCallback(() => setUnits((u) => [...u, newUnit()]), [])
  const updateUnit = useCallback((id: string, u: CabinetUnit) => setUnits((x) => x.map((a) => a.id === id ? u : a)), [])
  const removeUnit = useCallback((id: string) => setUnits((u) => u.filter((x) => x.id !== id)), [])
  const toggleAcc  = useCallback((id: string) => setSelectedAcc((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n }), [])

  const countertopCost = useMemo(() => {
    const opt = COUNTERTOP_OPTIONS.find((c) => c.value === countertop.type)
    if (!opt || !countertop.meters || Number(countertop.meters) <= 0) return 0
    return (opt.rate || 0) * Number(countertop.meters)
  }, [countertop])

  const accessoriesCost = useMemo(() => {
    let total = 0
    for (const id of selectedAcc) {
      const acc = ACCESSORIES.find((a) => a.id === id)
      if (acc) total += acc.price
    }
    return total
  }, [selectedAcc])

  const handleCalculate = useCallback(async () => {
    setErrors([])
    if (!projectType) { setErrors(["Please select a project type"]); return }
    if (isBunkBed) {
      if (!cabinetType || !linearMeter) { setErrors(["Select bunk bed type and size"]); return }
    } else if (isCabinet) {
      if (!useUnitBuilder && (!linearMeter || Number(linearMeter) <= 0)) { setErrors(["Enter linear meters"]); return }
      if (useUnitBuilder) {
        const hasValid = units.some((u) => u.enabled && u.meters && Number(u.meters) > 0)
        if (!hasValid) { setErrors(["Add at least one unit with meters"]); return }
      }
    }

    setLoading(true)
    try {
      const enabledUnits = useUnitBuilder
        ? units.filter((u) => u.enabled && u.meters && Number(u.meters) > 0).map((u) => ({
            category: u.category, meters: parseFloat(u.meters) || 0,
            tier: cabinetType || "basic", material: u.material || material,
            finish: u.finish || finish, hardware: u.hardware || hardware,
            installation: u.installation,
          }))
        : []

      const body: Record<string, unknown> = {
        projectType, cabinetType, kitchenScope, material, finish, hardware, installation,
        applyTax, taxRate: 0.12,
        discountRate: parseFloat(discount) ? parseFloat(discount) / 100 : 0,
      }

      if (isBunkBed) {
        body.bunkBedType = cabinetType
        body.bunkBedSize = linearMeter
      } else if (useUnitBuilder) {
        body.units = enabledUnits
      } else {
        body.linearMeter = parseFloat(linearMeter) || 0
        body.cabinetCategory = "base"
      }

      const res = await fetch("/api/estimate/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error("API error")
      const result: CalcResult = await res.json()
      setEstimate({ ...result, total: result.total + countertopCost + accessoriesCost })
      if (result.warnings?.length) setErrors(result.warnings)
      toast.success("Estimate calculated!")
    } catch {
      try {
        const result = estimateCabinetCost({
          projectType, cabinetType, linearMeter: parseFloat(linearMeter) || 0,
          kitchenScope, material, finish, hardware, installation,
          units: useUnitBuilder ? units.filter((u) => u.enabled).map((u) => ({
            category: u.category, meters: parseFloat(u.meters) || 0,
            tier: cabinetType, material: u.material, finish: u.finish, hardware: u.hardware, installation: u.installation,
          })) : [],
          applyTax, taxRate: 0.12,
          discountRate: parseFloat(discount) ? parseFloat(discount) / 100 : 0,
        }) as CalcResult
        setEstimate({ ...result, total: result.total + countertopCost + accessoriesCost })
        toast.success("Estimate calculated!")
      } catch {
        setErrors(["Calculation error. Check your inputs."])
      }
    } finally {
      setLoading(false)
    }
  }, [projectType, cabinetType, linearMeter, kitchenScope, material, finish, hardware, installation, units, isCabinet, isBunkBed, useUnitBuilder, discount, applyTax, countertopCost, accessoriesCost])

  const handleSaveToProposals = useCallback(() => {
    if (!estimate) return
    try {
      localStorage.setItem("joson_last_estimate", JSON.stringify({
        ...estimate, projectType, cabinetType, linearMeter, kitchenScope, material, finish, hardware,
        installation, discount, applyTax, countertop, selectedAcc: Array.from(selectedAcc), units,
        countertopCost, accessoriesCost, savedAt: new Date().toISOString(),
      }))
      toast.success("Saved to proposals!")
    } catch {
      toast.error("Failed to save")
    }
  }, [estimate, projectType, cabinetType, linearMeter, kitchenScope, material, finish, hardware, installation, discount, applyTax, countertop, selectedAcc, units, countertopCost, accessoriesCost])

  const handlePrint = useCallback(() => { window.print() }, [])

  const handleEmail = useCallback(() => {
    if (!estimate) return
    const bd = estimate.breakdown as Record<string, unknown>
    const lines = [
      "Joson Furniture - Estimate",
      "",
      `Project: ${projectType}`,
      `Type: ${cabinetType}`,
      `Linear Meters: ${linearMeter}`,
      "",
      `Subtotal: ${fmt(bd.subtotal as number)}`,
      bd.discount ? `Discount: -${fmt(bd.discount as number)}` : null,
      bd.tax ? `VAT (12%): ${fmt(bd.tax as number)}` : null,
      countertopCost > 0 ? `Countertop: ${fmt(countertopCost)}` : null,
      accessoriesCost > 0 ? `Accessories: ${fmt(accessoriesCost)}` : null,
      "",
      `TOTAL: ${fmt(estimate.total)}`,
      "",
      "This is an indicative estimate. Valid for 30 days.",
    ].filter(Boolean)
    const mailto = `mailto:?subject=Joson Furniture Estimate - ${fmt(estimate.total)}&body=${encodeURIComponent(lines.join("\n"))}`
    window.open(mailto, "_blank")
    toast.success("Opening email client...")
  }, [estimate, projectType, cabinetType, linearMeter, countertopCost, accessoriesCost])

  const handleReset = useCallback(() => {
    setEstimate(null); setErrors([]); setLinearMeter(""); setCabinetType("")
    setKitchenScope(""); setMaterial(""); setFinish(""); setHardware("")
    setInstallation(false); setUnits([]); setDiscount(""); setApplyTax(true)
    setCountertop({ type: "none", meters: "" }); setSelectedAcc(new Set())
    localStorage.removeItem(STORAGE_KEY)
    toast.info("Calculator reset")
  }, [])

  const bd = estimate?.breakdown as Record<string, unknown>
  const unitBreakdown = (bd?.units as Array<{ category: string; meters: number; baseRate: number; lineTotal: number; installationAdd?: number }> | undefined)

  return (
    <section className="rounded-2xl border bg-card/50 p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/12 flex items-center justify-center flex-shrink-0">
            <Calculator className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground leading-tight">Cost Estimator</h2>
            <p className="text-xs text-muted-foreground">Comprehensive project quotation tool</p>
          </div>
        </div>
        <button onClick={handleReset}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted">
          <RefreshCw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT: Inputs */}
        <div className="space-y-4">

          {/* Project Type */}
          <AccordionSection title="Project Type" icon={<Layers className="w-3.5 h-3.5" />} defaultOpen={true}>
            <div className="grid grid-cols-1 gap-2">
              {PROJECT_TYPES.map(({ value, label, icon: Icon, desc }) => (
                <CardRadio key={value} selected={projectType === value}
                  onSelect={() => { setProjectType(value); setEstimate(null); setErrors([]) }}
                  label={label} description={desc} icon={Icon} />
              ))}
            </div>
          </AccordionSection>

          {/* Bunk Bed Config */}
          {isBunkBed && (
            <AccordionSection title="Bunk Bed Configuration" icon={<Bed className="w-3.5 h-3.5" />} badge="Bunk Bed">
              <div className="space-y-3">
                <StyledSelect label="Bed Type" value={cabinetType}
                  onChange={(v) => { setCabinetType(v); setEstimate(null) }}
                  options={BUNK_TYPES.map((b) => ({ value: b.value, label: b.label }))}
                  placeholder="Select bed type..." />
                <StyledSelect label="Bed Size" value={linearMeter}
                  onChange={(v) => { setLinearMeter(v); setEstimate(null) }}
                  options={BUNK_SIZES} placeholder="Select size..." />
                <Toggle label="Professional Installation" description="Assembly, leveling & hardware setup (+15%)"
                  checked={installation} onChange={(v) => { setInstallation(v); setEstimate(null) }} />
              </div>
            </AccordionSection>
          )}

          {/* Kitchen scope */}
          {projectType === "kitchen" && (
            <AccordionSection title="Kitchen Scope" icon={<ChefHat className="w-3.5 h-3.5" />} defaultOpen={false}>
              <StyledSelect label="Cabinet Scope" value={kitchenScope}
                onChange={(v) => { setKitchenScope(v); setEstimate(null) }}
                options={KITCHEN_SCOPES} placeholder="Full Kitchen" />
            </AccordionSection>
          )}

          {/* Cabinet Quality */}
          {isCabinet && (
            <AccordionSection title="Cabinet Quality" icon={<Star className="w-3.5 h-3.5" />} badge="Required">
              <div className="grid grid-cols-1 gap-2">
                {CABINET_TYPES.map(({ value, label, desc, icon: Icon, badge: bdg }) => (
                  <CardRadio key={value} selected={cabinetType === value}
                    onSelect={() => { setCabinetType(value); setEstimate(null) }}
                    label={label} description={desc} icon={Icon} badge={bdg} />
                ))}
              </div>
            </AccordionSection>
          )}

          {/* Cabinet Configuration: Unit Builder or Quick Entry */}
          {isCabinet && (
            <AccordionSection title="Cabinet Configuration" icon={<Package className="w-3.5 h-3.5" />} defaultOpen={true} badge="Core">
              <div className="flex items-center gap-3 mb-3">
                <button onClick={() => setUseUnitBuilder(false)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${!useUnitBuilder ? "border-primary/40 bg-primary/10 text-primary" : "border-border/40 text-muted-foreground hover:bg-muted"}`}>
                  Quick Entry
                </button>
                <button onClick={() => setUseUnitBuilder(true)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${useUnitBuilder ? "border-primary/40 bg-primary/10 text-primary" : "border-border/40 text-muted-foreground hover:bg-muted"}`}>
                  Unit Builder
                </button>
              </div>

              {!useUnitBuilder && (
                <div className="space-y-3">
                  <StyledSelect label="Cabinet Type" value={previewCategory}
                    onChange={(v) => setPreviewCategory(v)}
                    options={CABINET_CATEGORIES} placeholder="Select type..." />
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      <Ruler className="w-3 h-3" /> Linear Meters
                    </label>
                    <div className="relative mt-1.5">
                      <input type="number" min="0.1" step="0.1" placeholder="e.g. 8.5"
                        value={linearMeter} onChange={(e) => { setLinearMeter(e.target.value); setEstimate(null) }}
                        className="w-full bg-background border border-border/60 rounded-lg px-4 py-2.5 pr-12 text-sm text-foreground
                          focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">m</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Total length of all cabinets combined in meters</p>
                  </div>
                </div>
              )}

              {useUnitBuilder && (
                <div className="space-y-2">
                  {units.length === 0 && (
                    <div className="text-center py-6 text-xs text-muted-foreground">
                      No units added yet. Click the button below to add a cabinet unit.
                    </div>
                  )}
                  {units.map((unit) => (
                    <UnitBuilderRow key={unit.id}
                      unit={unit}
                      onUpdate={(u) => updateUnit(unit.id, u)}
                      onRemove={() => removeUnit(unit.id)}
                      allMaterials={allMaterials}
                      allFinishes={allFinishes}
                      allHardware={allHardware} />
                  ))}
                  <button type="button" onClick={addUnit}
                    className="w-full py-2.5 rounded-xl border-2 border-dashed border-border/50 text-xs font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
                    <Plus className="w-3.5 h-3.5" /> Add Cabinet Unit
                  </button>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-border/30">
                <CabinetPreview category={useUnitBuilder ? (units[0]?.category || "base") : previewCategory} />
              </div>
            </AccordionSection>
          )}

          {/* Material / Finish / Hardware */}
          {isCabinet && (
            <AccordionSection title="Materials & Hardware" icon={<Layers className="w-3.5 h-3.5" />} defaultOpen={false}>
              <div className="space-y-3">
                <StyledSelect label="Cabinet Material" value={material}
                  onChange={(v) => { setMaterial(v); setEstimate(null) }}
                  options={allMaterials} placeholder="Default material..." />
                <StyledSelect label="Surface Finish" value={finish}
                  onChange={(v) => { setFinish(v); setEstimate(null) }}
                  options={allFinishes} placeholder="Default finish..." />
                <StyledSelect label="Hardware Level" value={hardware}
                  onChange={(v) => { setHardware(v); setEstimate(null) }}
                  options={allHardware} placeholder="Default hardware..." />
              </div>
            </AccordionSection>
          )}

          {/* Countertop Options */}
          {isCabinet && (
            <AccordionSection title="Countertop Options" icon={<Sparkles className="w-3.5 h-3.5" />} defaultOpen={false}>
              <div className="space-y-3">
                <StyledSelect label="Countertop Type" value={countertop.type}
                  onChange={(v) => { setCountertop((c) => ({ ...c, type: v })); setEstimate(null) }}
                  options={COUNTERTOP_OPTIONS.map((c) => ({ value: c.value, label: c.label === "None" ? "None" : c.label + " (~P" + c.rate.toLocaleString() + "/sqm)" }))}
                  placeholder="Select countertop..." />
                {countertop.type !== "none" && (
                  <div>
                    <label className="text-xs text-muted-foreground font-medium">Linear Meters</label>
                    <div className="relative mt-1.5">
                      <input type="number" min="0.1" step="0.1" placeholder="e.g. 3.0"
                        value={countertop.meters} onChange={(e) => { setCountertop((c) => ({ ...c, meters: e.target.value })); setEstimate(null) }}
                        className="w-full bg-background border border-border/60 rounded-lg px-3 py-2.5 pr-9 text-sm text-foreground
                          focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">m</span>
                    </div>
                    {countertop.meters && Number(countertop.meters) > 0 && (
                      <p className="text-xs text-primary mt-1 font-medium">
                        ~{fmt((Number(countertop.meters) * (COUNTERTOP_OPTIONS.find((c) => c.value === countertop.type)?.rate || 0)))} estimated
                      </p>
                    )}
                  </div>
                )}
              </div>
            </AccordionSection>
          )}

          {/* Accessories */}
          {isCabinet && (
            <AccordionSection title="Accessories" icon={<Cog className="w-3.5 h-3.5" />} defaultOpen={false} badge={selectedAcc.size > 0 ? String(selectedAcc.size) : undefined}>
              <div className="space-y-2">
                {ACCESSORIES.map((acc) => (
                  <button key={acc.id} type="button" onClick={() => { toggleAcc(acc.id); setEstimate(null) }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer text-left
                      ${selectedAcc.has(acc.id) ? "border-primary/30 bg-primary/5" : "border-border/40 bg-card/40 hover:bg-card/60"}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${selectedAcc.has(acc.id) ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {selectedAcc.has(acc.id) ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${selectedAcc.has(acc.id) ? "text-foreground" : "text-muted-foreground"}`}>{acc.label}</p>
                      <p className="text-xs text-muted-foreground">{acc.unit}</p>
                    </div>
                    <span className={`text-sm font-semibold ${selectedAcc.has(acc.id) ? "text-primary" : "text-muted-foreground"}`}>
                      {fmt(acc.price)}
                    </span>
                  </button>
                ))}
                {selectedAcc.size > 0 && (
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground font-medium">Accessories subtotal</span>
                    <span className="text-sm font-bold text-primary">{fmt(accessoriesCost)}</span>
                  </div>
                )}
              </div>
            </AccordionSection>
          )}

          {/* Discount & Tax */}
          <AccordionSection title="Discount & Tax" icon={<Palette className="w-3.5 h-3.5" />} defaultOpen={false}>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground font-medium">Discount %</label>
                <div className="relative mt-1.5">
                  <input type="number" min="0" max="30" step="1" placeholder="0"
                    value={discount} onChange={(e) => { setDiscount(e.target.value); setEstimate(null) }}
                    className="w-full bg-background border border-border/60 rounded-lg px-3 py-2.5 pr-9 text-sm text-foreground
                      focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Max 30% discount</p>
              </div>
              <Toggle label="Apply VAT (12%)" description="Philippine value-added tax"
                checked={applyTax} onChange={(v) => { setApplyTax(v); setEstimate(null) }} />
            </div>
          </AccordionSection>

          {/* Installation */}
          {!isBunkBed && (
            <AccordionSection title="Installation" icon={<Wrench className="w-3.5 h-3.5" />} defaultOpen={false}>
              <Toggle label="Professional Installation" description="Assembly, mounting, leveling & hardware setup (+30%)"
                checked={installation} onChange={(v) => { setInstallation(v); setEstimate(null) }} />
            </AccordionSection>
          )}

          {errors.length > 0 && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 space-y-1">
              {errors.map((e, i) => (
                <p key={i} className="text-xs text-destructive flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  {e}
                </p>
              ))}
            </div>
          )}

          <button onClick={handleCalculate} disabled={loading}
            className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2
              bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md hover:-translate-y-px
              ${loading ? "opacity-70 cursor-wait" : ""}`}>
            {loading ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Calculating...</>
            ) : (
              <><Calculator className="w-4 h-4" /> Calculate Estimate</>
            )}
          </button>
        </div>

        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-foreground mb-4">Your Estimate</h2>

          {!estimate ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center">
                  <Calculator className="w-8 h-8 text-muted-foreground/60" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center">
                  <Ruler className="w-3 h-3 text-primary" />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">No estimate yet</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">Fill in your project details and hit Calculate to get a quote</p>
              </div>
            </div>
          ) : (
            <div className="space-y-5 flex-1">
              <div className="rounded-2xl bg-gradient-to-br from-primary/12 to-primary/5 border-2 border-primary/25 p-6 text-center">
                <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">
                  {isBunkBed ? "Bunk Bed Estimate" : "Cabinet Estimate"}
                </p>
                <div className="text-4xl font-black text-primary tracking-tight">{fmt(estimate.total)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isBunkBed
                    ? cabinetType + " - " + linearMeter + " size"
                    : (linearMeter || units.reduce((s, u) => s + (Number(u.meters) || 0), 0).toFixed(1)) + " linear meters" + (cabinetType ? " - " + cabinetType + " grade" : "")}
                </p>
              </div>

              {(countertopCost > 0 || accessoriesCost > 0) && (
                <div className="flex gap-2 flex-wrap">
                  {countertopCost > 0 && (
                    <span className="text-xs bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full font-medium">
                      Countertop: {fmt(countertopCost)}
                    </span>
                  )}
                  {accessoriesCost > 0 && (
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full font-medium">
                      Accessories: {fmt(accessoriesCost)}
                    </span>
                  )}
                </div>
              )}

              {unitBreakdown && unitBreakdown.length > 0 && (
                <div className="rounded-xl border border-border/40 overflow-hidden">
                  <div className="px-4 py-2.5 bg-muted/40 border-b border-border/40">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Unit Breakdown</h3>
                  </div>
                  <div className="divide-y divide-border/30">
                    {unitBreakdown.map((u, i) => (
                      <div key={i} className="px-4 py-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-semibold capitalize px-2 py-0.5 rounded-full ${
                            u.category === "base" ? "bg-amber-500/10 text-amber-400" :
                            u.category === "hanging" ? "bg-blue-500/10 text-blue-400" :
                            "bg-emerald-500/10 text-emerald-400"
                          }`}>{String(u.category)}</span>
                          <span className="text-sm font-bold text-primary">{fmt(Number(u.lineTotal))}</span>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          <div className="flex justify-between"><span>Meters:</span><span>{String(u.meters)} m</span></div>
                          <div className="flex justify-between"><span>Base Rate:</span><span>{fmt(u.baseRate as unknown as number)}/m</span></div>
                          {u.installationAdd && Number(u.installationAdd) > 0 && (
                            <div className="flex justify-between"><span>Installation:</span><span>+{fmt(u.installationAdd as unknown as number)}</span></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-border/40 bg-card/60 divide-y divide-border/30">
                {isBunkBed ? (
                  <>
                    <div className="flex items-center justify-between px-4 py-2.5"><span className="text-sm text-muted-foreground">Bed Type</span><span className="text-sm font-medium capitalize">{cabinetType}</span></div>
                    <div className="flex items-center justify-between px-4 py-2.5"><span className="text-sm text-muted-foreground">Size</span><span className="text-sm font-medium capitalize">{linearMeter}</span></div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between px-4 py-2.5"><span className="text-sm text-muted-foreground">Project</span><span className="text-sm font-medium capitalize">{projectType}</span></div>
                    <div className="flex items-center justify-between px-4 py-2.5"><span className="text-sm text-muted-foreground">Quality</span><span className="text-sm font-medium capitalize">{cabinetType}</span></div>
                    {material && <div className="flex items-center justify-between px-4 py-2.5"><span className="text-sm text-muted-foreground">Material</span><span className="text-sm font-medium capitalize">{material}</span></div>}
                    {finish && <div className="flex items-center justify-between px-4 py-2.5"><span className="text-sm text-muted-foreground">Finish</span><span className="text-sm font-medium capitalize">{finish}</span></div>}
                    {hardware && <div className="flex items-center justify-between px-4 py-2.5"><span className="text-sm text-muted-foreground">Hardware</span><span className="text-sm font-medium capitalize">{hardware}</span></div>}
                    <div className="flex items-center justify-between px-4 py-2.5"><span className="text-sm text-muted-foreground">Installation</span><span className="text-sm font-medium">{installation ? "Included" : "Not included"}</span></div>
                  </>
                )}
                {(bd.subtotal as number) > 0 && (
                  <div className="flex items-center justify-between px-4 py-2.5"><span className="text-sm text-muted-foreground">Subtotal</span><span className="text-sm font-medium">{fmt(bd.subtotal as number)}</span></div>
                )}
                {(bd.discount as number) > 0 && (
                  <div className="flex items-center justify-between px-4 py-2.5"><span className="text-sm text-muted-foreground">Discount ({((bd.discountRate as number) * 100).toFixed(0)}%)</span><span className="text-sm font-medium text-destructive">-{fmt(bd.discount as number)}</span></div>
                )}
                {(bd.tax as number) > 0 && (
                  <div className="flex items-center justify-between px-4 py-2.5"><span className="text-sm text-muted-foreground">VAT (12%)</span><span className="text-sm font-medium">{fmt(bd.tax as number)}</span></div>
                )}
                {countertopCost > 0 && (
                  <div className="flex items-center justify-between px-4 py-2.5"><span className="text-sm text-muted-foreground">Countertop</span><span className="text-sm font-medium">{fmt(countertopCost)}</span></div>
                )}
                {accessoriesCost > 0 && (
                  <div className="flex items-center justify-between px-4 py-2.5"><span className="text-sm text-muted-foreground">Accessories</span><span className="text-sm font-medium">{fmt(accessoriesCost)}</span></div>
                )}
              </div>

              <p className="text-xs text-muted-foreground/70 text-center leading-relaxed">
                Indicative estimate only. Final pricing may vary based on site conditions,
                measurements, and material availability. Valid for 30 days.
              </p>

              <div className="flex flex-col gap-2">
                <button onClick={handleSaveToProposals}
                  className="w-full py-3 rounded-xl font-semibold text-sm bg-primary text-white hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" /> Save to Proposals
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={handlePrint}
                    className="py-2.5 rounded-xl font-semibold text-sm border border-border/60 hover:bg-muted transition-all flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground">
                    <Package className="w-4 h-4" /> Print
                  </button>
                  <button onClick={handleEmail}
                    className="py-2.5 rounded-xl font-semibold text-sm border border-border/60 hover:bg-muted transition-all flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground">
                    <Mail className="w-4 h-4" /> Email
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
