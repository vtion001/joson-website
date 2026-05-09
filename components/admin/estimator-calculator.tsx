"use client"

import * as React from "react"
import { useState, useCallback } from "react"
import {
  ChefHat, Bath, BedDouble, Briefcase, Layers,
  Ruler, Wrench, Palette, Cog,
  ChevronDown, Calculator, Info,
  Bed, Archive, Star, ShieldCheck
} from "lucide-react"
import { estimateCabinetCost, materialPricing, finishPricing, hardwarePricing, bunkBedPricing } from "@/lib/estimator"

interface CalcState {
  projectType: string
  cabinetType: string
  linearMeter: string
  kitchenScope: string
  material: string
  finish: string
  hardware: string
  installation: boolean
  bunkBedType: string
  bunkBedSize: string
}

interface CalcResult {
  total: number
  projectType: string
  breakdown: Record<string, unknown>
  warnings: string[]
}

const PROJECT_TYPES = [
  { value: "kitchen",  label: "Kitchen",  icon: ChefHat,   desc: "Base, hanging & tall cabinets" },
  { value: "bathroom", label: "Bathroom", icon: Bath,       desc: "Vanity & storage cabinets" },
  { value: "bedroom",  label: "Bedroom",  icon: BedDouble,   desc: "Closet & wardrobe systems" },
  { value: "office",   label: "Office",   icon: Briefcase,  desc: "Built-in desks & storage" },
  { value: "bunkbed", label: "Bunk Bed", icon: Bed,         desc: "Custom bunk beds & lofts" },
]

const CABINET_TYPES = [
  { value: "basic",    label: "Standard",  desc: "Value-driven, reliable quality",      icon: Archive,      badge: "" },
  { value: "premium", label: "Premium",   desc: "Enhanced features & materials",       icon: Star,         badge: "Popular" },
  { value: "luxury",  label: "Luxury",   desc: "Top-tier quality and finishes",        icon: ShieldCheck,  badge: "" },
]

const KITCHEN_SCOPES = [
  { value: "",            label: "Full Kitchen (Base + Hanging)" },
  { value: "base_only",   label: "Base Cabinets Only" },
  { value: "hanging_only",label: "Hanging Cabinets Only" },
]

function fmt(n: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(n)
}

function StyledSelect({ label, value, onChange, options, placeholder = "Select…" }: {
  label: React.ReactNode; value: string
  onChange: (v: string) => void
  options: { value: string; label: string; description?: string }[]
  placeholder?: string
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-foreground">{label}</label>
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-background border-2 border-border/60 rounded-lg px-4 py-3 pr-10 text-sm text-foreground
            focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition-all duration-200 cursor-pointer
            hover:border-border [&_option]:bg-card">
          <option value="">{placeholder}</option>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  )
}

function CardRadio({ selected, onSelect, label, description, icon: Icon, badge }: {
  selected: boolean; onSelect: () => void; label: string; description?: string
  icon?: React.ComponentType<{ className?: string }>; badge?: string
}) {
  return (
    <button type="button" onClick={onSelect}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
        ${selected ? "border-primary/60 bg-primary/8 ring-2 ring-primary/20" : "border-border/40 bg-card/40 hover:border-border/80 hover:bg-card/60"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className={`mt-0.5 rounded-md p-2 ${selected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
              <Icon className="w-4 h-4" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${selected ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
              {badge && selected && <span className="bg-primary/15 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">{badge}</span>}
            </div>
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
        </div>
        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${selected ? "border-primary bg-primary" : "border-border"}`}>
          {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
        </div>
      </div>
    </button>
  )
}

function EmptyEstimate() {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center space-y-4">
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-muted/60 flex items-center justify-center">
          <Calculator className="w-10 h-10 text-muted-foreground/60" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
          <Ruler className="w-3.5 h-3.5 text-primary" />
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">No estimate yet</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">Fill in your project details and hit Calculate to get a quote</p>
      </div>
    </div>
  )
}

function BreakdownRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

export function EstimatorCalculator(): JSX.Element {
  const [form, setForm] = useState<CalcState>({
    projectType: "", cabinetType: "", linearMeter: "", kitchenScope: "",
    material: "", finish: "", hardware: "", installation: false,
    bunkBedType: "", bunkBedSize: "",
  })
  const [estimate, setEstimate] = useState<CalcResult | null>(null)
  const [errors, setErrors]     = useState<string[]>([])
  const [touched, setTouched]   = useState<Record<string, boolean>>({})

  const isCabinet = form.projectType !== "" && form.projectType !== "bunkbed"
  const isBunkBed = form.projectType === "bunkbed"

  const canCalculate = isCabinet
    ? form.cabinetType !== "" && form.linearMeter !== "" && Number(form.linearMeter) > 0
    : isBunkBed
    ? form.bunkBedType !== "" && form.bunkBedSize !== ""
    : false

  const set = useCallback(
    (field: keyof CalcState, value: string | boolean) =>
      setForm((f) => ({ ...f, [field]: value })), []
  )

  const handleCalculate = () => {
    setErrors([])
    setTouched({ projectType: true, cabinetType: true, linearMeter: true, bunkBedType: true, bunkBedSize: true })
    if (!form.projectType) { setErrors(["Please select a project type"]); return }
    try {
      const result = estimateCabinetCost({
        projectType:  form.projectType,
        cabinetType:  form.cabinetType,
        linearMeter:  parseFloat(form.linearMeter) || 0,
        kitchenScope: form.kitchenScope,
        material:     form.material,
        finish:       form.finish,
        hardware:     form.hardware,
        installation: form.installation,
        bunkBedType:  form.bunkBedType,
        bunkBedSize:  form.bunkBedSize,
      }) as CalcResult
      setEstimate(result)
      if (result.warnings?.length) setErrors(result.warnings)
    } catch (e: unknown) {
      setErrors([(e as Error).message || "Calculation error"])
    }
  }

  const bd = estimate?.breakdown ?? {}
  const bpTypeData = (bunkBedPricing as Record<string, Record<string, unknown>>)[form.bunkBedType]
  const bpSizeData = bpTypeData?.[form.bunkBedSize] as number | undefined
  const matData = (materialPricing as Record<string, Record<string, unknown>>)[form.material]
  const finData = (finishPricing as Record<string, Record<string, unknown>>)[form.finish]
  const hwData  = (hardwarePricing as Record<string, Record<string, unknown>>)[form.hardware]

  return (
    <section className="rounded-2xl border bg-card/50 p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <div className="w-10 h-10 rounded-xl bg-primary/12 flex items-center justify-center flex-shrink-0">
          <Calculator className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground leading-tight">Cost Estimator</h2>
          <p className="text-xs text-muted-foreground">Get an instant quote for your project</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── LEFT: Inputs ── */}
        <div className="space-y-6">

          {/* 1. Project Type */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground">Project Type</label>
            <div className="grid grid-cols-1 gap-2">
              {PROJECT_TYPES.map(({ value, label, icon: Icon, desc }) => (
                <CardRadio
                  key={value}
                  selected={form.projectType === value}
                  onSelect={() => { set("projectType", value); setErrors([]); }}
                  label={label}
                  description={desc}
                  icon={Icon}
                />
              ))}
            </div>
          </div>

          {/* Kitchen scope */}
          {form.projectType === "kitchen" && (
            <StyledSelect
              label="Kitchen Cabinet Scope"
              value={form.kitchenScope}
              onChange={(v) => set("kitchenScope", v)}
              options={KITCHEN_SCOPES}
              placeholder="Full Kitchen (base + hanging)"
            />
          )}

          {/* Bunk bed config */}
          {isBunkBed && (
            <div className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wide">
                <Bed className="w-3.5 h-3.5" />
                Bunk Bed Configuration
              </div>
              <StyledSelect
                label="Bed Type"
                value={form.bunkBedType}
                onChange={(v) => { set("bunkBedType", v); setErrors([]); }}
                options={Object.entries(bunkBedPricing).map(([value, p]) => ({
                  value,
                  label: `${p.label} — from ₱${(p.single as number).toLocaleString()}`,
                  description: p.description as string,
                }))}
                placeholder="Select bed type…"
              />
              <StyledSelect
                label="Bed Size"
                value={form.bunkBedSize}
                onChange={(v) => { set("bunkBedSize", v); setErrors([]); }}
                options={[
                  { value: "single", label: "Single — Compact for kids rooms" },
                  { value: "double", label: "Double — Standard adult size" },
                  { value: "queen",  label: "Queen — Extra spacious" },
                ]}
                placeholder="Select size…"
              />
            </div>
          )}

          {/* Linear Meters */}
          {isCabinet && (
            <div className="space-y-2">
              <label htmlFor="linearMeter" className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Ruler className="w-3.5 h-3.5 text-muted-foreground" />
                Linear Meters
              </label>
              <div className="relative">
                <input
                  id="linearMeter" type="number" min="0.1" step="0.1" placeholder="e.g. 8.5"
                  value={form.linearMeter}
                  onChange={(e) => set("linearMeter", e.target.value)}
                  className="w-full bg-background border-2 border-border/60 rounded-lg px-4 py-3 pr-14 text-sm text-foreground
                    focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15
                    transition-all duration-200 placeholder:text-muted-foreground/50"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">m</span>
              </div>
              <p className="text-xs text-muted-foreground">Total length of all cabinets combined in meters</p>
            </div>
          )}

          {/* Cabinet Quality */}
          {isCabinet && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Cabinet Quality</label>
              <div className="space-y-2">
                {CABINET_TYPES.map(({ value, label, desc, icon: Icon, badge }) => (
                  <CardRadio
                    key={value}
                    selected={form.cabinetType === value}
                    onSelect={() => set("cabinetType", value)}
                    label={label}
                    description={desc}
                    icon={Icon}
                    badge={badge}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Material */}
          {isCabinet && (
            <StyledSelect
              label={<><Layers className="w-3.5 h-3.5 inline mr-1 text-muted-foreground" />Cabinet Material</>}
              value={form.material}
              onChange={(v) => set("material", v)}
              options={Object.entries(materialPricing).map(([value, p]) => ({
                value, label: p.label as string, description: p.description as string,
              }))}
              placeholder="Select material…"
            />
          )}

          {/* Finish */}
          {isCabinet && (
            <StyledSelect
              label={<><Palette className="w-3.5 h-3.5 inline mr-1 text-muted-foreground" />Surface Finish</>}
              value={form.finish}
              onChange={(v) => set("finish", v)}
              options={Object.entries(finishPricing).map(([value, f]) => ({
                value, label: f.label as string, description: f.description as string,
              }))}
              placeholder="Select finish…"
            />
          )}

          {/* Hardware */}
          {isCabinet && (
            <StyledSelect
              label={<><Cog className="w-3.5 h-3.5 inline mr-1 text-muted-foreground" />Door &amp; Hardware</>}
              value={form.hardware}
              onChange={(v) => set("hardware", v)}
              options={Object.entries(hardwarePricing).map(([value, h]) => ({
                value, label: h.label as string, description: h.description as string,
              }))}
              placeholder="Select hardware level…"
            />
          )}

          {/* Installation toggle */}
          <div className="flex items-center gap-3 p-4 rounded-xl border border-border/40 bg-card/60">
            <input type="checkbox" id="installation" checked={form.installation}
              onChange={(e) => set("installation", e.target.checked)}
              className="w-5 h-5 rounded accent-primary cursor-pointer"
            />
            <label htmlFor="installation" className="flex-1 cursor-pointer">
              <span className="text-sm font-semibold text-foreground">Professional Installation</span>
              <span className="text-xs text-muted-foreground block mt-0.5">Includes assembly, leveling & hardware setup</span>
            </label>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Wrench className="w-4 h-4 text-primary" />
            </div>
          </div>

          {/* Validation errors */}
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

          {/* CTA */}
          <button
            onClick={handleCalculate}
            disabled={!canCalculate}
            className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2
              ${canCalculate
                ? "bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md hover:-translate-y-px"
                : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
          >
            <Calculator className="w-4 h-4" />
            Calculate Estimate
          </button>
        </div>

        {/* ── RIGHT: Result ── */}
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-foreground mb-4">Your Estimate</h2>

          {!estimate ? (
            <EmptyEstimate />
          ) : (
            <div className="space-y-5 flex-1">
              {/* Total banner */}
              <div className="rounded-2xl bg-gradient-to-br from-primary/12 to-primary/5 border-2 border-primary/25 p-6 text-center">
                <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">
                  {isBunkBed ? "Bunk Bed Estimate" : "Cabinet Estimate"}
                </p>
                <div className="text-4xl font-black text-primary tracking-tight">{fmt(estimate.total)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isBunkBed
                    ? `${String(bpTypeData?.label ?? "")} · ${form.bunkBedSize} size`
                    : `${form.linearMeter} linear meters · ${form.cabinetType} grade`}
                </p>
              </div>

              {/* Breakdown */}
              <div className="rounded-xl border border-border/40 bg-card/60 divide-y divide-border/30">
                {isBunkBed ? (
                  <>
                    <BreakdownRow label="Bed Type" value={String(bpTypeData?.label ?? "—")} />
                    <BreakdownRow label="Size" value={form.bunkBedSize.charAt(0).toUpperCase() + form.bunkBedSize.slice(1)} />
                    <BreakdownRow label="Base Price" value={bpSizeData != null ? fmt(bpSizeData) : "—"} />
                    {form.material  && <BreakdownRow label="Material"  value={`×${Number(bd.materialFactor ?? 1).toFixed(1)}`} />}
                    {form.finish    && <BreakdownRow label="Finish"    value={`×${Number(bd.finishFactor   ?? 1).toFixed(2)}`} />}
                    {form.hardware && <BreakdownRow label="Hardware"  value={`×${Number(bd.hardwareFactor ?? 1).toFixed(1)}`} />}
                    {bd.installationAdd != null && <BreakdownRow label="Installation" value={`+${fmt(Number(bd.installationAdd))}`} />}
                  </>
                ) : (
                  <>
                    <BreakdownRow label="Project Type" value={form.projectType.charAt(0).toUpperCase() + form.projectType.slice(1)} />
                    <BreakdownRow label="Linear Meters" value={`${form.linearMeter} m`} />
                    {form.cabinetType && <BreakdownRow label="Quality"  value={form.cabinetType.charAt(0).toUpperCase() + form.cabinetType.slice(1)} />}
                    {form.material    && <BreakdownRow label="Material" value={String(matData?.label ?? form.material)} />}
                    {form.finish      && <BreakdownRow label="Finish"   value={String(finData?.label  ?? form.finish)} />}
                    {form.hardware   && <BreakdownRow label="Hardware" value={String(hwData?.label   ?? form.hardware)} />}
                    <BreakdownRow label="Installation" value={form.installation ? "Included (+15%)" : "Not included"} />
                  </>
                )}
                {(bd.discount as number) > 0 && (
                  <BreakdownRow
                    label={`Discount (${((bd.discountRate as number) * 100).toFixed(0)}%)`}
                    value={`-${fmt(bd.discount as number)}`}
                  />
                )}
                {(bd.tax as number) > 0 && (
                  <BreakdownRow
                    label={`VAT (${((bd.taxRate as number) * 100).toFixed(0)}%)`}
                    value={fmt(bd.tax as number)}
                  />
                )}
              </div>

              <p className="text-xs text-muted-foreground/70 text-center leading-relaxed">
                Indicative estimate only. Final pricing may vary based on site conditions,
                measurements, and material availability. Valid for 30 days.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
