import { query, queryOne, execute } from "@/lib/db"
import type { QueryParam } from "@/lib/db"

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PricingConfig {
  key_name:    string
  config_json: Record<string, number | string>
  description: string | null
  updated_at:  string
}

// Cached in-memory so we don't hit the DB on every calculation
let _cache: Map<string, Record<string, number>> | null = null
let _cacheTs = 0
const CACHE_TTL_MS = 60_000 // 1 minute

export interface CabinetPricingConfig {
  baseRates:              Record<string, number>
  feeInclusiveRates:      Record<string, number>
  tierMultipliers:        Record<string, number>
  cabinetTypeMultipliers: Record<string, number>
  materialMultipliers:    Record<string, number>
  finishMultipliers:      Record<string, number>
  hardwareMultipliers:    Record<string, number>
  installationRate:       number
  taxRate:                number
  projectTypeMultipliers: Record<string, number>
}

export async function getCabinetPricingConfig(): Promise<CabinetPricingConfig> {
  const now = Date.now()
  if (_cache && now - _cacheTs < CACHE_TTL_MS) {
    return {
      baseRates:              _cache.get("base_rates")               || {},
      feeInclusiveRates:      _cache.get("fee_inclusive_rates")     || {},
      tierMultipliers:        _cache.get("tier_multipliers")         || {},
      cabinetTypeMultipliers: _cache.get("cabinet_type_multipliers") || {},
      materialMultipliers:    _cache.get("material_multipliers")     || {},
      finishMultipliers:      _cache.get("finish_multipliers")       || {},
      hardwareMultipliers:    _cache.get("hardware_multipliers")     || {},
      installationRate:       (_cache.get("installation_rate")?.[0] as unknown as number) || 0.3,
      taxRate:                (_cache.get("tax_rate")?.[0] as unknown as number) || 0.12,
      projectTypeMultipliers: _cache.get("project_type_multipliers") || {},
    }
  }

  const rows = await query<PricingConfig>(
    "SELECT key_name, config_json, description FROM cabinet_pricing_config"
  )

  _cache = new Map()
  const flat: Record<string, Record<string, number>> = {}

  for (const row of rows) {
    const parsed = typeof row.config_json === "string"
      ? JSON.parse(row.config_json) as Record<string, number | string>
      : row.config_json as Record<string, number | string>
    const numVal: Record<string, number> = {}
    for (const [k, v] of Object.entries(parsed)) {
      numVal[k] = typeof v === "string" ? parseFloat(v) : v
    }
    _cache.set(row.key_name, numVal as Record<string, number>)
    flat[row.key_name] = numVal as Record<string, number>
  }
  _cacheTs = now

  return {
    baseRates:              flat["base_rates"]               || {},
    feeInclusiveRates:      flat["fee_inclusive_rates"]       || {},
    tierMultipliers:        flat["tier_multipliers"]          || {},
    cabinetTypeMultipliers: flat["cabinet_type_multipliers"]  || {},
    materialMultipliers:    flat["material_multipliers"]      || {},
    finishMultipliers:      flat["finish_multipliers"]        || {},
    hardwareMultipliers:    flat["hardware_multipliers"]      || {},
    installationRate:       flat["installation_rate"]?.[0] as unknown as number  || 0.3,
    taxRate:                flat["tax_rate"]?.[0] as unknown as number          || 0.12,
    projectTypeMultipliers: flat["project_type_multipliers"] || {},
  }
}

export async function getPricingConfigRows(): Promise<PricingConfig[]> {
  return query<PricingConfig>(
    "SELECT key_name, config_json, description, updated_at FROM cabinet_pricing_config ORDER BY key_name"
  )
}

export async function updatePricingConfig(
  keyName: string,
  value: Record<string, number | string>
): Promise<void> {
  // Invalidate cache
  _cache = null
  _cacheTs = 0

  await execute(
    "UPDATE cabinet_pricing_config SET config_json = ?, updated_at = NOW() WHERE key_name = ?",
    [JSON.stringify(value), keyName]
  )
}

// ─── Estimate Persistence ────────────────────────────────────────────────────

export interface Estimate {
  id:            string
  reference_no: string
  client_name:   string | null
  client_email:  string | null
  client_phone:  string | null
  project_type:  string | null
  status:        string
  total_amount:  number | null
  subtotal:      number | null
  tax_amount:    number | null
  discount_amount: number
  notes:         string | null
  valid_until:   string | null
  estimate_data: Record<string, unknown> | null
  created_at:    string
  updated_at:    string
}

export async function createEstimate(
  data: Omit<Estimate, "id" | "reference_no" | "created_at" | "updated_at">
): Promise<Estimate> {
  const id = crypto.randomUUID()
  const refNo = `JOSON-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`
  await execute(
    `INSERT INTO estimates
       (id, reference_no, client_name, client_email, client_phone, project_type,
        status, total_amount, subtotal, tax_amount, discount_amount, notes, valid_until, estimate_data)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, refNo,
      data.client_name, data.client_email, data.client_phone, data.project_type,
      data.status || "draft",
      data.total_amount, data.subtotal, data.tax_amount, data.discount_amount || 0,
      data.notes, data.valid_until,
      data.estimate_data ? JSON.stringify(data.estimate_data) : null,
    ]
  )
  return getEstimateById(id) as Promise<Estimate>
}

export async function getEstimateById(id: string): Promise<Estimate | null> {
  const row = await queryOne<Estimate & { estimate_data: string | null }>(
    "SELECT * FROM estimates WHERE id = ?", [id]
  )
  if (!row) return null
  return {
    ...row,
    estimate_data: row.estimate_data
      ? (typeof row.estimate_data === "string" ? JSON.parse(row.estimate_data) : row.estimate_data)
      : null,
  }
}

export async function getEstimates(opts?: { status?: string; limit?: number }): Promise<Estimate[]> {
  const conditions = ["1=1"]
  const params: QueryParam[] = []
  if (opts?.status) { conditions.push("status = ?"); params.push(opts.status) }
  const limit = opts?.limit ?? 100
  const rows = await query<Estimate & { estimate_data: string | null }>(
    `SELECT * FROM estimates WHERE ${conditions.join(" AND ")}
     ORDER BY created_at DESC LIMIT ${Number(limit)}`,
    params
  )
  return rows.map((r) => ({
    ...r,
    estimate_data: r.estimate_data
      ? (typeof r.estimate_data === "string" ? JSON.parse(r.estimate_data) : r.estimate_data)
      : null,
  }))
}

export async function updateEstimate(id: string, data: Partial<Estimate>): Promise<Estimate> {
  const fields: string[] = []
  const vals: QueryParam[]  = []
  for (const [k, v] of Object.entries(data)) {
    if (k === "id" || k === "reference_no" || k === "created_at" || k === "updated_at") continue
    if (k === "estimate_data") { fields.push("estimate_data = ?"); vals.push(v ? JSON.stringify(v) : null); continue }
    if (v !== undefined) { fields.push(`${k} = ?`); vals.push(v as QueryParam) }
  }
  if (!fields.length) return getEstimateById(id) as Promise<Estimate>
  vals.push(id)
  await execute(`UPDATE estimates SET ${fields.join(", ")} WHERE id = ?`, vals)
  return getEstimateById(id) as Promise<Estimate>
}

// ─── Floor Plan Analysis ─────────────────────────────────────────────────────

export interface FloorPlanAnalysis {
  id:             string
  estimate_id:    string | null
  file_name:      string | null
  file_path:      string | null
  ai_raw_response: Record<string, unknown> | null
  parsed_rooms:   Record<string, unknown>[] | null
  confidence:     number | null
  status:         string
  error_message:  string | null
  created_at:     string
}

export async function createFloorPlanAnalysis(
  data: Omit<FloorPlanAnalysis, "id" | "created_at">
): Promise<FloorPlanAnalysis> {
  const id = crypto.randomUUID()
  await execute(
    `INSERT INTO floor_plan_analyses
       (id, estimate_id, file_name, file_path, ai_raw_response, parsed_rooms, confidence, status, error_message)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, data.estimate_id, data.file_name, data.file_path,
      data.ai_raw_response ? JSON.stringify(data.ai_raw_response) : null,
      data.parsed_rooms ? JSON.stringify(data.parsed_rooms) : null,
      data.confidence, data.status, data.error_message,
    ]
  )
  return getFloorPlanAnalysisById(id) as Promise<FloorPlanAnalysis>
}

export async function getFloorPlanAnalysisById(id: string): Promise<FloorPlanAnalysis | null> {
  const row = await queryOne<FloorPlanAnalysis & {
    ai_raw_response: string | null
    parsed_rooms:   string | null
  }>("SELECT * FROM floor_plan_analyses WHERE id = ?", [id])
  if (!row) return null
  return {
    ...row,
    ai_raw_response: row.ai_raw_response ? JSON.parse(row.ai_raw_response) : null,
    parsed_rooms:    row.parsed_rooms    ? JSON.parse(row.parsed_rooms)    : null,
  }
}

export async function updateFloorPlanAnalysis(
  id: string,
  data: Partial<FloorPlanAnalysis>
): Promise<FloorPlanAnalysis> {
  const fields: string[] = []
  const vals: QueryParam[]  = []
  for (const [k, v] of Object.entries(data)) {
    if (k === "id" || k === "created_at") continue
    if (k === "ai_raw_response" || k === "parsed_rooms") {
      fields.push(`${k} = ?`); vals.push(v ? JSON.stringify(v) : null); continue
    }
    if (v !== undefined) { fields.push(`${k} = ?`); vals.push(v as QueryParam) }
  }
  if (!fields.length) return getFloorPlanAnalysisById(id) as Promise<FloorPlanAnalysis>
  vals.push(id)
  await execute(`UPDATE floor_plan_analyses SET ${fields.join(", ")} WHERE id = ?`, vals)
  return getFloorPlanAnalysisById(id) as Promise<FloorPlanAnalysis>
}

// ─── Dashboard Analytics ──────────────────────────────────────────────────────

export interface MonthlyRevenue {
  month:   string
  revenue: number
}

export async function getRevenueByMonth(limit = 6): Promise<MonthlyRevenue[]> {
  const rows = await query<{ month: string; revenue: number }>(
    `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, SUM(total_amount) as revenue
     FROM estimates
     WHERE status IN ('approved', 'project') AND total_amount IS NOT NULL
     GROUP BY month
     ORDER BY month DESC
     LIMIT ${Number(limit)}`
  )
  // Reverse so oldest month comes first for chart display
  return rows.reverse()
}
