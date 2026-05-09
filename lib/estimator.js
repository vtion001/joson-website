/**
 * Cabinet + Bunk Bed Estimator Logic (Pure JS)
 *
 * API:
 *   estimateCabinetCost(input: EstimatorInput): EstimatorResult
 *
 * EstimatorInput:
 *   - projectType: "kitchen" | "bathroom" | "bedroom" | "office" | "bunkbed"
 *   - cabinetType: "basic" | "premium" | "luxury"
 *   - linearMeter: number (> 0)
 *   - installation?: boolean
 *   - kitchenScope?: "base_only" | "hanging_only" | ""
 *   - material?: "melamine" | "laminate" | "plywood" | "solidwood" | ""
 *   - finish?: "standard" | "painted" | "stained" | "lacquer" | ""
 *   - hardware?: "basic" | "soft_close" | "premium" | ""
 *   - bunkBedType?: "standard" | "l_shaped" | "loft" | "triple"
 *   - bunkBedSize?: "single" | "double" | "queen"
 *   - units?: Array<{ category, meters, tier?, material?, finish?, hardware?, installation? }>
 */

export const allowed = {
  projectType: ["kitchen", "bathroom", "bedroom", "office", "bunkbed"],
  cabinetType: ["basic", "premium", "luxury"],
  kitchenScope: ["", "base_only", "hanging_only"],
  material: ["", "melamine", "laminate", "plywood", "solidwood"],
  finish: ["", "standard", "painted", "stained", "lacquer"],
  hardware: ["", "basic", "soft_close", "premium"],
  bunkBedType: ["standard", "l_shaped", "loft", "triple"],
  bunkBedSize: ["single", "double", "queen"],
}

// Material price multipliers (relative to melamine baseline)
export const materialPricing = {
  melamine:    { label: "Melamine",      factor: 1.0,  description: "Durable laminated surface, affordable" },
  laminate:    { label: "Laminate",      factor: 1.2,  description: "High-pressure laminate, scratch-resistant" },
  plywood:    { label: "Plywood",        factor: 1.6,  description: "Strong plywood core, good durability" },
  solidwood:  { label: "Solid Wood",    factor: 2.2,  description: "Premium hardwood, longest lifespan" },
}

// Cabinet finish multipliers
export const finishPricing = {
  standard: { label: "Standard Finish",  factor: 1.0,  description: "Sanded and sealed" },
  painted:  { label: "Painted",          factor: 1.25, description: "Spray-painted, smooth coat" },
  stained:  { label: "Stained",          factor: 1.35, description: "Natural wood grain visible" },
  lacquer:  { label: "Lacquer",          factor: 1.55, description: "High-gloss lacquer coating" },
}

// Hardware tier multipliers
export const hardwarePricing = {
  basic:      { label: "Basic Hinges",        factor: 1.0,  description: "Standard hinges and pulls" },
  soft_close: { label: "Soft-Close",          factor: 1.2,  description: "Soft-close hinges + drawer slides" },
  premium:    { label: "Premium Hardware",     factor: 1.5,  description: "Blum-style soft-close + exotic pulls" },
}

// Bunk bed base prices (PHP, per unit)
export const bunkBedPricing = {
  standard: {
    single: 35000, double: 45000, queen: 55000,
    label: "Standard Bunk",
    description: "Classic stacked twin/single beds",
  },
  l_shaped: {
    single: 55000, double: 65000, queen: 75000,
    label: "L-Shaped Bunk",
    description: "L-shape layout, desk or storage integrated",
  },
  loft: {
    single: 45000, double: 55000, queen: 65000,
    label: "Loft Bed",
    description: "Elevated bed with clearance below",
  },
  triple: {
    single: 75000, double: 85000, queen: 95000,
    label: "Triple Decker",
    description: "3-level bunk for maximum space efficiency",
  },
}

// Cabinet sheet rates per linear meter (PHP)
const DEFAULT_SHEET_RATES = {
  base:   { withoutFees: 40476.4, withFees: 51097.4 },
  hanging: { withoutFees: 38452.58, withFees: 48542.53 },
  tall:   { withoutFees: 65182.2,  withFees: 82286.1  },
}

// Cabinet tier multipliers
const TIER_MULTIPLIERS = {
  luxury:  1.0,
  premium: 0.9,
  standard: 0.8,
}

// Cabinet quality base multipliers
const CABINET_TYPE_MULTIPLIERS = {
  luxury:  1.0,
  premium: 0.9,
  basic:   0.8,
}

export const pricing = {
  projectType: { kitchen: 1.0, bathroom: 0.8, bedroom: 0.9, office: 0.7, bunkbed: 1.0 },
  cabinetType: { basic: 1.0, premium: 1.5, luxury: 2.0 },
  installation: 0.3,
}

export function estimateCabinetCost(input) {
  const warnings = []

  const projectType  = String(input.projectType   || "").trim()
  const kitchenScope = String(input.kitchenScope  || "").trim()
  const material    = String(input.material       || "").trim()
  const finish      = String(input.finish         || "").trim()
  const hardware    = String(input.hardware       || "").trim()
  const installation = Boolean(input.installation)
  const includeFees  = Boolean(input.includeFees)
  const applyDiscount = Number(input.discountRate || 0) // 0..1
  const applyTax    = Boolean(input.applyTax)
  const taxRate     = Number(input.taxRate || 0.12)

  // ── Bunk Bed path ─────────────────────────────────────────────────────────────
  if (projectType === "bunkbed") {
    const bunkType = String(input.bunkBedType || "").trim()
    const bunkSize = String(input.bunkBedSize || "").trim()

    if (!allowed.bunkBedType.includes(bunkType)) {
      warnings.push("Select a bunk bed type")
    }
    if (!allowed.bunkBedSize.includes(bunkSize)) {
      warnings.push("Select a bunk bed size")
    }

    const basePrices = bunkBedPricing[bunkType] || bunkBedPricing.standard
    const basePrice  = basePrices[bunkSize] || basePrices.single

    // Material finish upgrade on bunk bed
    const matFactor  = material && materialPricing[material] ? materialPricing[material].factor : 1.0
    const finFactor  = finish   && finishPricing[finish]   ? finishPricing[finish].factor   : 1.0
    const hardFactor = hardware && hardwarePricing[hardware] ? hardwarePricing[hardware].factor : 1.0
    const installAdd = installation ? basePrice * 0.15 : 0

    let subtotal = basePrice * matFactor * finFactor * hardFactor + installAdd
    const discount = applyDiscount > 0 ? subtotal * applyDiscount : 0
    const taxable  = subtotal - discount
    const tax      = applyTax ? taxable * taxRate : 0
    const total   = Math.round(taxable + tax)

    return {
      total,
      projectType: "bunkbed",
      breakdown: {
        basePrice,
        bunkBedType: bunkType,
        bunkBedSize: bunkSize,
        materialFactor: matFactor,
        finishFactor: finFactor,
        hardwareFactor: hardFactor,
        installationAdd: Math.round(installAdd),
        subtotal: Math.round(subtotal),
        discount: Math.round(discount),
        discountRate: applyDiscount,
        taxRate: applyTax ? taxRate : 0,
        tax: Math.round(tax),
      },
      warnings,
    }
  }

  // ── Cabinet path ─────────────────────────────────────────────────────────────
  const cabinetType  = String(input.cabinetType || "").trim()
  const linearMeter  = Number(input.linearMeter)
  const cabinetCategory = String(input.cabinetCategory || "base")
  const tier         = String(input.tier         || "")
  const sheetRates   = input.sheetRates || DEFAULT_SHEET_RATES
  const tierMultipliers = input.tierMultipliers || TIER_MULTIPLIERS
  const cabinetTypeMult  = input.cabinetTypeMultipliers || CABINET_TYPE_MULTIPLIERS

  if (!allowed.projectType.includes(projectType)) {
    throw new Error("Invalid projectType")
  }

  const hasLinearMeter = Number.isFinite(linearMeter) && linearMeter > 0
  const hasUnits = Array.isArray(input.units) && input.units.length > 0

  if (!hasLinearMeter && !hasUnits) {
    throw new Error("Enter linear meters or add units")
  }

  const matFactor  = material && materialPricing[material] ? materialPricing[material].factor : 1.0
  const finFactor  = finish   && finishPricing[finish]   ? finishPricing[finish].factor   : 1.0
  const hardFactor = hardware && hardwarePricing[hardware] ? hardwarePricing[hardware].factor : 1.0

  // Tier factor: explicit tierMultipliers takes priority, then cabinetType lookup
  const tierFactor = (t) => {
    if (tierMultipliers && t && tierMultipliers[t] != null) return Number(tierMultipliers[t]) || 1
    if (cabinetTypeMult && t && cabinetTypeMult[t] != null) return Number(cabinetTypeMult[t]) || 1
    return 1
  }

  const resolveRate = (category) => {
    const pair = sheetRates?.[category]
    if (pair) {
      const r = includeFees ? Number(pair.withFees) : Number(pair.withoutFees)
      if (Number.isFinite(r) && r > 0) return r
    }
    const fallback = DEFAULT_SHEET_RATES[category]
    return includeFees ? Number(fallback.withFees) : Number(fallback.withoutFees)
  }

  let subtotal = 0
  const unitBreakdown = []

  if (hasLinearMeter) {
    const baseRate = resolveRate(cabinetCategory)
    const tf = tierFactor(tier || cabinetType)
    let line = baseRate * linearMeter * tf * matFactor * finFactor * hardFactor
    const installAdd = installation ? baseRate * linearMeter * pricing.installation : 0
    line += installAdd
    subtotal += line
    unitBreakdown.push({
      category: cabinetCategory, meters: linearMeter,
      baseRate: Math.round(baseRate), tierFactor: tf,
      materialFactor: matFactor, finishFactor: finFactor, hardwareFactor: hardFactor,
      installationAdd: Math.round(installAdd), lineTotal: Math.round(line),
    })
  }

  if (hasUnits) {
    for (const u of input.units) {
      const meters = Number(u.meters || 0)
      if (!Number.isFinite(meters) || meters <= 0) {
        warnings.push(`Unit ${u.category || "?"} has invalid meters; skipped`)
        continue
      }
      const cat = String(u.category || "base")
      const baseRate = resolveRate(cat)
      const tf = tierFactor(u.tier || tier || cabinetType)
      const mf = material && materialPricing[material] ? materialPricing[material].factor : 1.0
      const ff = finish   && finishPricing[finish]   ? finishPricing[finish].factor   : 1.0
      const hf = hardware && hardwarePricing[hardware] ? hardwarePricing[hardware].factor : 1.0
      let line = baseRate * meters * tf * mf * ff * hf
      const instAdd = (installation || u.installation) ? baseRate * meters * pricing.installation : 0
      line += instAdd
      subtotal += line
      unitBreakdown.push({
        category: cat, meters,
        baseRate: Math.round(baseRate), tierFactor: tf,
        materialFactor: mf, finishFactor: ff, hardwareFactor: hf,
        installationAdd: Math.round(instAdd), lineTotal: Math.round(line),
      })
    }
  }

  const discount = applyDiscount > 0 ? subtotal * applyDiscount : 0
  const taxable  = subtotal - discount
  const tax     = applyTax && taxRate > 0 ? taxable * taxRate : 0
  const total  = Math.round(taxable + tax)

  return {
    total,
    projectType,
    breakdown: {
      units: unitBreakdown,
      subtotal: Math.round(subtotal),
      materialFactor: matFactor,
      finishFactor: finFactor,
      hardwareFactor: hardFactor,
      installationAdd: Math.round(installation ? subtotal * pricing.installation / (1 + pricing.installation) : 0),
      discount: Math.round(discount),
      discountRate: applyDiscount,
      taxRate: applyTax ? taxRate : 0,
      tax: Math.round(tax),
    },
    warnings,
  }
}
