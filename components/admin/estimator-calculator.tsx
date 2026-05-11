"use client"

import * as React from "react"
import { useState, useCallback, useEffect } from "react"
import {
  ChefHat, Bath, BedDouble, Briefcase, Layers,
  Ruler, Wrench, Palette, Cog,
  Calculator, Info,
  Bed, Archive, Star, ShieldCheck,
  ChevronDown, ChevronUp, Plus, Trash2, Save, Printer,
  Mail, Tv, Shirt, UtensilsCrossed, Sparkles,
  CheckCircle2, AlertCircle, Package, ToggleLeft, ToggleRight,
  RefreshCw, X, Lightbulb, GripVertical, Eye,
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

interface Accessory {
  id: string
  label: string
  price: number
  unit: string
  icon: React.ReactNode
}

interface CalcResult {
  total: number
  projectType: string
  breakdown: Record<string, unknown>
  warnings: string[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PROJECT_TYPES = [
  { value: "kitchen",            label: "Kitchen",            icon: ChefHat,      desc: "Base, hanging & tall cabinets" },
  { value: "bathroom",          label: "Bathroom",           icon: Bath,         desc: "Vanity & storage cabinets" },
  { value: "bedroom",           label: "Bedroom",            icon: BedDouble,    desc: "Closet & wardrobe systems" },
  { value: "office",            label: "Office",              icon: Briefcase,    desc: "Built-in desks & storage" },
  { value: "bunkbed",           label: "Bunk Bed",          icon: Bed,          desc: "Custom bunk beds & lofts" },
  { value: "entertainment",     label: "Entertainment Center",icon: Tv,           desc: "TV units & media consoles" },
  { value: "walkin_closet",     label: "Walk-in Closet",    icon: Shirt,        desc: "Custom walk-in wardrobes" },
  { value: "mudroom",           label: "Mudroom / Laundry", icon: UtensilsCrossed, desc: "Utility & storage rooms" },
]

const CABINET_TYPES = [
  { value: "basic",    label: "Standard",  desc: "Value-driven, reliable quality",      icon: Archive,     badge: "" },
  { value: "premium", label: "Premium",   desc: "Enhanced features & materials",      icon: Star,         badge: "Popular" },
  { value: "luxury",  label: "Luxury",   desc: "Top-tier quality and finishes",      icon: ShieldCheck,  badge: "" },
]

const KITCHEN_SCOPES = [
  { value: "",             label: "Full Kitchen (Base + Hanging)" },
  { value: "base_only",    label: "Base Cabinets Only" },
  { value: "hanging_only", label: "Hanging Cabinets Only" },
]

const CABINET_CATEGORIES = [
  { value: "base",   label: "Base",   desc: "Floor-level cabinets" },
  { value: "hanging", label: "Hanging", desc: "Wall-mounted cabinets" },
  { value: "tall",   label: "Tall",   desc: "Full-height cabinets" },
]

const ACCESSORIES: Accessory[] = [
  { id: "led_interior",  label: "LED Interior Lighting",  price: 2500, unit: "per cabinet",  icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: "soft_close",    label: "Soft-Close Buffer",      price: 75,   unit: "each",          icon: <ToggleRight className="w-3.5 h-3.5" /> },
  { id: "glass_shelves", label: "Glass Shelves",           price: 850,  unit: "per shelf",     icon: <Layers className="w-3.5 h-3.5" /> },
  { id: "adjustable_legs",label: "Adjustable Legs",       price: 60,   unit: "each",          icon: <Wrench className="w-3.5 h-3.5" /> },
  { id: "push_open",     label: "Push-to-Open Latch",     price: 195,  unit: "each",          icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
]

const COUNTERTOP_OPTIONS = [
  { value: "none",          label: "None",                   rate: 0 },
  { value: "laminate",      label: "Laminate",               rate: 1800 },
  { value: "solid_surface",  label: "Solid Surface",         rate: 4500 },
  { value: "granite",       label: "Granite",                rate: 6500 },
  { value: "quartz",        label: "Quartz",                 rate: 8500 },
]

const UNIT_STORAGE_KEY = "joson_estimate_config"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(n)
}

function fmtNum(n: number) {
  return new Intl.NumberFormat("en-PH").format(Math.round(n))
}

function newUnit(): CabinetUnit {
  return { id: uid(), category: "base", enabled: true, meters: "", material: "", finish: "", hardware: "", installation: false }
}

// ─── Accordion Section ────────────────────────────────────────────────────────

function AccordionSection({
  title, icon, children, defaultOpen = true, badge,
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  badge?: string
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-xl border border-border/50 bg-card/40 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/40 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-primary/80">{icon}</span>
          <span className="text-sm font-semibold text-foreground">{title}</span>
          {badge && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{badge}</span>
          )}
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  )
}

// ─── Styled Select ────────────────────────────────────────────────────────────

function StyledSelect({ label, value, onChange, options, placeholder = "Select…" }: {
  label: React.ReactNode; value: string
  onChange: (v: string) => void
  options: { value: string; label: string; description?: string }[]
  placeholder?: string
}) {
  return (
    <div className="space-y-1.5">
      {label && <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>}
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-background border border-border/60 rounded-lg px-3 py-2.5 pr-9 text-sm text-foreground
            focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all cursor-pointer
            hover:border-border [&_option]:bg-card">
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
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
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

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyEstimate() {
  return (
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
  )
}

// ─── Cabinet SVG Preview ──────────────────────────────────────────────────────

function CabinetPreview({ category }: { category: string }) {
  const active = category
  const colors = {
    base:    { fill: "currentColor", label: "Base",    color: "#f59e0b" },
    hanging: { fill: "currentColor", label: "Hanging", color: "#60a5fa" },
    tall:    { fill: "currentColor", label: "Tall",    color: "#34d399" },
  }
  const c = colors[active as keyof typeof colors] || colors.base

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 200 140" className="w-full max-w-[180px] h-24" fill="none">
        {/* Base cabinet */}
        <rect x="10" y="90" width="60" height="40" rx="2"
          fill={active === "base" ? "#f59e0b" : "#374151"} stroke={active === "base" ? "#f59e0b" : "#4b5563"} strokeWidth="1.5"
          className="transition-all duration-300" />
        {active === "base" && <>
          <rect x="20" y="98" width="18" height="24" rx="1" fill="#1f2937" opacity="0.6" />
          <rect x="42" y="98" width="18" height="24" rx="1" fill="#1f2937" opacity="0.6" />
          <circle cx="35" cy="110" r="1.5" fill="#9ca3af" />
          <circle cx="57" cy="110" r="1.5" fill="#9ca3af" />
        </>}

        {/* Hanging cabinet */}
        <rect x="80" y="40" width="60" height="40" rx="2"
          fill={active === "hanging" ? "#60a5fa" : "#374151"} stroke={active === "hanging" ? "#60a5fa" : "#4b5563"} strokeWidth="1.5"
          className="transition-all duration-300" />
        {active === "hanging" && <>
          <rect x="90" y="48" width="18" height="24" rx="1" fill="#1f2937" opacity="0.6" />
          <rect x="112" y="48" width="18" height="24" rx="1" fill="#1f2937" opacity="0.6" />
          <circle cx="99" cy="60" r="1.5" fill="#9ca3af" />
          <circle cx="121" cy="60" r="1.5" fill="#9ca3af" />
        </>}

        {/* Tall cabinet */}
        <rect x="150" y="20" width="40" height="110" rx="2"
          fill={active === "tall" ? "#34d399" : "#374151"} stroke={active === "tall" ? "#34d399" : "#4b5563"} strokeWidth="1.5"
          className="transition-all duration-300" />
        {active === "tall" && <>
          <rect x="158" y="28" width="24" height="22" rx="1" fill="#1f2937" opacity="0.6" />
          <rect x="158" y="54" width="24" height="22" rx="1" fill="#1f2937" opacity="0.6" />
          <rect x="158" y="80" width="24" height="22" rx="1" fill="#1f2937" opacity="0.6" />
          <circle cx="170" cy="39" r="1.5" fill="#9ca3af" />
          <circle cx="170" cy="65" r="1.5" fill="#9ca3af" />
          <circle cx="170" cy="91" r="1.5" fill="#9ca3af" />
        </>}

        {/* Floor line */}
        <line x1="5" y1="130" x2="195" y2="130" stroke="#4b5563" strokeWidth="1" strokeDasharray="3,3" />
        {/* Wall */}
        <line x1="5" y1="10" x2="195" y2="10" stroke="#374151" strokeWidth="1" strokeDasharray="3,3" />
      </svg>
      <div className="flex gap-3">
        {(["base", "hanging", "tall"] as const).map((cat) => (
          <div key={cat} className="flex items-center gap-1">
            <div className={`w-2.5 h-2.5 rounded-sm ${active === cat ? "bg-primary" : "bg-muted"}`} />
            <span className="text-xs text-muted-foreground capitalize">{cat}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Unit Builder Row ─────────────────────────────────────────────────────────

function UnitBuilderRow({
  unit, onUpdate, onRemove, allMaterials, allFinishes, allHardware,
}: {
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
  const catLabels: Record<string, string> = {
    base: "Base", hanging: "Hanging", tall: "Tall",
  }

  return (
    <div className={`rounded-xl border p-3.5 space-y-2.5 transition-all ${unit.enabled ? catColors[unit.category] : "border-border/30 bg-muted/20 opacity-60"}`}>
      {/* Row header */}
      <div className="flex items-center gap-2">
        <GripVertical className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button type="button" onClick={() => onUpdate({ ...unit, enabled: !unit.enabled })}
            className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${unit.enabled ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
            {unit.enabled ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
          </button>
          <select value={unit.category} onChange={(e) => onUpdate({ ...unit, category: e.target.value as CabinetUnit["category"] })}
            className="bg-transparent border-0 text-xs font-semibold capitalize cursor-pointer focus:outline-none pr-1"
            disabled={!unit.enabled}>
            {CABINET_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted/60 text-muted-foreground capitalize">{unit.category}</span>
        </div>
        <button type="button" onClick={onRemove}
          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {unit.enabled && (
        <div className="grid grid-cols-2 gap-2 pl-6">
          {/* Meters */}
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

          {/* Material */}
          <StyledSelect
            label="Material"
            value={unit.material}
            onChange={(v) => onUpdate({ ...unit, material: v })}
            options={allMaterials}
            placeholder="Select…"
          />

          {/* Finish */}
          <StyledSelect
            label="Finish"
            value={unit.finish}
            onChange={(v) => onUpdate({ ...unit, finish: v })}
            options={allFinishes}
            placeholder="Select…"
          />

          {/* Hardware */}
          <StyledSelect
            label="Hardware"
            value={unit.hardware}
            onChange={(v) => onUpdate({ ...unit, hardware: v })}
            options={allHardware}
            placeholder="Select…"
          />

          {/* Per-unit install toggle */}
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
  // ── Form state ──
  const [projectType,  setProjectType]  = useState("kitchen")
  const [cabinetType,  setCabinetType]  = useState("")
  const [linearMeter,  setLinearMeter]  = useState("")
  const [kitchenScope, setKitchenScope] = useState("")
  const [material,    setMaterial]      = useState("")
  const [finish,      setFinish]        = useState("")
  const [hardware,    setHardware]      = useState("")
  const [installation,setInstallation]  = useState(false)
  const [units,        setUnits]        = useState<CabinetUnit[]>([])
  const [discount,     setDiscount]     = useState("")
  const [applyTax,      setApplyTax]     = useState(true)
  const [countertop,    setCountertop]   = useState({ type: "none", meters: "" })
  const [selectedAccessories, setSelectedAccessories] = useState<Set<string>>(new Set())

  // ── UI state ──
  const [estimate,  setEstimate]  = useState<CalcResult | null>(null)
  const [errors,    setErrors]    = useState<string[]>([])
  const [loading,   setLoading]   = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>("base")
  const [useUnitBuilder, setUseUnitBuilder] = useState(false)
  const [showPreview,   setShowPreview]     = useState(false)

  const isCabinet = projectType !== "" && projectType !== "bunkbed"
  const isBunkBed = projectType === "bunkbed"

  // ── Derived selectors ──
  const allMaterials = Object.entries(materialPricing).map(([value, p]) => ({
    value, label: `${p.label} — from ₱${(110 * p.factor).toFixed(0)}/sqft`,
  }))
  const allFinishes = Object.entries(finishPricing).map(([value, f]) => ({
    value, label: `${f.label} (×${f.factor})`,
  }))
  const allHardware = Object.entries(hardwarePricing).map(([value, h]) => ({
    value, label: `${h.label} — ${h.description}`,
  }))

  // ── Persist to localStorage ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem(UNIT_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed?.projectType) setProjectType(parsed.projectType)
        if (parsed?.cabinetType) setCabinetType(parsed.cabinetType)
        if (parsed?.linearMeter) setLinearMeter(parsed.linearMeter)
        if (parsed?.kitchenScope) setKitchenScope(parsed.kitchenScope)
        if (parsed?.material) setMaterial(parsed.material)
        if (parsed?.finish) setFinish(parsed.finish)
        if (parsed?.hardware) setHardware(parsed.hardware)
        if (parsed?.installation !== undefined) setInstallation(parsed.installation)
        if (parsed?.discount) setDiscount(parsed.discount)
        if (parsed?.applyTax !== undefined) setApplyTax(parsed.applyTax)
        if (parsed?.countertop) setCountertop(parsed.countertop)
        if (Array.isArray(parsed?.units)) setUnits(parsed.units)
      }
    } catch { /* ignore */ }
  }, [])

  const persistState = useCallback(() => {
    try {
      localStorage.setItem(UNIT_STORAGE_KEY, JSON.stringify({
        projectType, cabinetType, linearMeter, kitchenScope, material, finish,
        hardware, installation, discount, applyTax, countertop, units,
      }))
    } catch { /* ignore */ }
  }, [projectType, cabinetType, linearMeter, kitchenScope, material, finish, hardware, installation, discount, applyTax, countertop, units])

  useEffect(() => { persistState() }, [persistState])

  // ── Unit builder helpers ──
  const addUnit = useCallback(() => {
    setUnits((u) => [...u, newUnit()])
  }, [])

  const updateUnit = useCallback((id: string, updated: CabinetUnit) => {
    setUnits((u) => u.map((x) => (x.id === id ? updated : x)))
  }, [])

  const removeUnit = useCallback((id: string) => {
    setUnits((u) => u.filter((x) => x.id !== id))
  }, [])

  // ── Accessory helpers ──
  const toggleAccessory = useCallback((id: string) => {
    setSelectedAccessories((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  // ── Calculate ──
  const handleCalculate = useCallback(async () => {
    setErrors([])
    if (!projectType) { setErrors(["Please select a project type"]); return }

    if (isBunkBed) {
      if (!cabinetType || !linearMeter) {
        setErrors(["Select bunk bed type and size"])
        return
      }
    } else if (isCabinet) {
      if (!useUnitBuilder && (!linearMeter || Number(linearMeter) <= 0)) {
        setErrors(["Enter linear meters"])
        return
      }
      if (useUnitBuilder) {
        const hasValid = units.some((u) => u.enabled && u.meters && Number(u.meters) > 0)
        if (!hasValid) { setErrors(["Add at least one unit with meters"]); return }
      }
    }

    setLoading(true)
    try {
      const enabledUnits = useUnitBuilder
        ? units.filter((u) => u.enabled && u.meters && Number(u.meters) > 0).map((u) => ({
            category: u.category,
            meters:   parseFloat(u.meters) || 0,
            tier:     cabinetType || "basic",
            material: u.material || material,
            finish:   u.finish || finish,
            hardware: u.hardware || hardware,
            installation: u.installation,
          }))
        : []

      const body: Record<string, unknown> = {
        projectType,
        cabinetType,
        kitchenScope,
        material,
        finish,
        hardware,
        installation,
        applyTax,
        taxRate: 0.12,
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

      if (!res.ok) throw new Error("Calculation failed")
      const result: CalcResult = await res.json()
      setEstimate(result)
      if (result.warnings?.length) setErrors(result.warnings)
      toast.success("Estimate calculated!")
    } catch (e: unknown) {
      // Fallback to client-side calc
      try {
        const result = estimateCabinetCost({
          projectType, cabinetType, linearMeter: parseFloat(linearMeter) || 0,
          kitchenScope, material, finish, hardware, installation,
          units: useUnitBuilder ? units.filter((u) => u.enabled).map((u) => ({
            category: u.category, meters: parseFloat(u.meters) || 0,
            tier: cabinetType, material: u.material, finish: u.finish, hardware: u.hardware,
            installation: u.installation,
          })) : [],
          applyTax,
          taxRate: 0.12,
          discountRate: parseFloat(discount) ? parseFloat(discount) / 100 : 0,
        }) as CalcResult
        setEstimate(result)
        toast.success("Estimate calculated!")
      } catch {
        setErrors(["Calculation error. Check your inputs."])
      }
    } finally {
      setLoading(false)
    }
  }, [projectType, cabinetType, linearMeter, kitchenScope, material, finish, hardware, installation, units, isCabinet, isBunkBed, useUnitBuilder, discount, applyTax])

  // ── Save to localStorage for proposals page ──
  const handleSaveToProposals = useCallback(() => {
    if (!estimate) return
    try {
      localStorage.setItem("joson_last_estimate", JSON.stringify({
        ...estimate,
        projectType,
        cabinetType,
        linearMeter,
        kitchenScope,
        material,
        finish,
        hardware,
        installation,
        discount,
        applyTax,
        countertop,
        selectedAccessories: Array.from(selectedAccessories),
        units,
        savedAt: new Date().toISOString(),
      }))
      toast.success("Saved to proposals! Go to Proposals page to finalize.")
    } catch {
      toast.error("Failed to save estimate")
    }
  }, [estimate, projectType, cabinetType, linearMeter, kitchenScope, material, finish, hardware, installation, discount, applyTax, countertop, selectedAccessories, units])

  // ── Print ──
  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  // ── Email ──
  const handleEmail = useCallback(() => {
    if (!estimate) return
    const bd = estimate.breakdown as Record<string, unknown>
    const text = [
      `Joson Furniture — Estimate`,
      ``,
      `Project: ${projectType}`,
      `Type: ${cabinetType}`,
      `Linear Meters: ${linearMeter}`,
      ``,
      `---`,
      `Subtotal: ${fmt(bd.subtotal as number)}`,
      bd.discount ? `Discount: -${fmt(bd.discount as number)}` : null,
      bd.tax ? `VAT (12%): ${fmt(bd.tax as number)}` : null,
      ``,
      `TOTAL: ${fmt(estimate.total)}`,
      ``,
      `This is an indicative estimate. Valid for 30 days.`,
    ].filter(Boolean).join("\n")

    const mailto = `mailto:?subject=Joson Furniture Estimate — ${fmt(estimate.total)}&body=${encodeURIComponent(text)}`
    window.open(mailto, "_blank")
    toast.success("Opening email client…")
  }, [estimate, projectType, cabinetType, linearMeter])

  // ── Reset ──
  const handleReset = useCallback(() => {
    setEstimate(null)
    setErrors([])
    setLinearMeter("")
    setCabinetType("")
    setKitchenScope("")
    setMaterial("")
    setFinish("")
    setHardware("")
    setInstallation(false)
    setUnits([])
    setDiscount("")
    setApplyTax(true)
    setCountertop({ type: "none", meters: "" })
    setSelectedAccessories(new Set())
    localStorage.removeItem(UNIT_STORAGE_KEY)
    toast.info("Calculator reset")
  }, [])

  // ── Accessories cost ──
  const accessoriesCost = React.useMemo(() => {
    return Array.from(selectedAccessories).