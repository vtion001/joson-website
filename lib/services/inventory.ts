import { query, queryOne, execute } from "@/lib/db"
import type { QueryParam } from "@/lib/db"
import type { RowDataPacket } from "mysql2"

// ─── Types ──────────────────────────────────────────────────────────────────

export type MaterialCategory = "sheet_goods" | "hardware" | "finish" | "labor" | "accessory"
export type Unit = "sheet" | "piece" | "set" | "pair" | "box" | "meter" | "sqft" | "sqm"

export interface Material {
  id:              string
  name:            string
  category:        MaterialCategory
  subcategory:     string | null
  unit:            Unit
  unit_size_sqft:  number | null
  unit_size_sqm:   number | null
  cost_price:      number
  sell_price:      number
  supplier_id:     string | null
  supplier_name:   string | null
  supplier_sku:    string | null
  in_stock:        boolean
  stock_qty:       number
  min_stock_level: number
  lead_time_days:  number
  notes:           string | null
  is_active:       boolean
  created_at:      string
  updated_at:      string
}

export interface Supplier {
  id:              string
  name:            string
  contact_person:  string | null
  phone:           string | null
  email:           string | null
  address:         string | null
  notes:           string | null
  is_active:       boolean
  created_at:      string
  updated_at:      string
}

export interface PriceHistoryEntry {
  id:           string
  material_id:  string
  material_name: string
  old_price:    number | null
  new_price:    number
  price_type:   "sell_price" | "cost_price"
  changed_by:   string | null
  changed_at:   string
}

// ─── Suppliers ───────────────────────────────────────────────────────────────

export async function getSuppliers(): Promise<Supplier[]> {
  return query<Supplier>(
    "SELECT * FROM suppliers ORDER BY is_active DESC, name ASC"
  )
}

export async function getSupplierById(id: string): Promise<Supplier | null> {
  return queryOne<Supplier>("SELECT * FROM suppliers WHERE id = ?", [id])
}

export async function createSupplier(data: Omit<Supplier, "id" | "created_at" | "updated_at">): Promise<Supplier> {
  const id = crypto.randomUUID()
  await execute(
    `INSERT INTO suppliers (id, name, contact_person, phone, email, address, notes, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, data.name, data.contact_person, data.phone, data.email, data.address, data.notes, data.is_active ? 1 : 0]
  )
  return getSupplierById(id) as Promise<Supplier>
}

export async function updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier> {
  const fields: string[] = []
  const vals: QueryParam[]  = []

  const boolFields = ["contact_person","phone","email","address","notes"]
  for (const [k, v] of Object.entries(data)) {
    if (k === "id" || k === "created_at" || k === "updated_at") continue
    if (k === "is_active") { fields.push("is_active = ?"); vals.push(v ? 1 : 0); continue }
    if (v !== undefined) { fields.push(`${k} = ?`); vals.push(v) }
  }
  if (!fields.length) return getSupplierById(id) as Promise<Supplier>
  vals.push(id)
  await execute(`UPDATE suppliers SET ${fields.join(", ")} WHERE id = ?`, vals)
  return getSupplierById(id) as Promise<Supplier>
}

export async function deleteSupplier(id: string): Promise<void> {
  await execute("UPDATE suppliers SET is_active = 0 WHERE id = ?", [id])
}

// ─── Materials ────────────────────────────────────────────────────────────────

export async function getMaterials(opts?: {
  category?: MaterialCategory
  activeOnly?: boolean
}): Promise<Material[]> {
  const conditions = ["1=1"]
  const params: QueryParam[] = []

  if (opts?.category) {
    conditions.push("m.category = ?")
    params.push(opts.category)
  }
  if (opts?.activeOnly) {
    conditions.push("m.is_active = 1")
  }

  const rows = await query<Material & RowDataPacket & { supplier_name: string | null }>(
    `SELECT m.*, s.name AS supplier_name
     FROM materials m
     LEFT JOIN suppliers s ON m.supplier_id = s.id
     WHERE ${conditions.join(" AND ")}
     ORDER BY m.category ASC, m.name ASC`,
    params
  )
  return rows.map((r) => ({
    ...r,
    in_stock:  !!r.in_stock,
    is_active: !!r.is_active,
  }))
}

export async function getMaterialById(id: string): Promise<Material | null> {
  const row = await queryOne<Material & RowDataPacket & { supplier_name: string | null }>(
    `SELECT m.*, s.name AS supplier_name
     FROM materials m LEFT JOIN suppliers s ON m.supplier_id = s.id
     WHERE m.id = ?`,
    [id]
  )
  if (!row) return null
  return { ...row, in_stock: !!row.in_stock, is_active: !!row.is_active }
}

export async function createMaterial(
  data: Omit<Material, "id" | "created_at" | "updated_at" | "supplier_name">
): Promise<Material> {
  const id = crypto.randomUUID()
  await execute(
    `INSERT INTO materials
       (id, name, category, subcategory, unit, unit_size_sqft, unit_size_sqm,
        cost_price, sell_price, supplier_id, supplier_sku, in_stock,
        stock_qty, min_stock_level, lead_time_days, notes, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.name,
      data.category,
      data.subcategory,
      data.unit,
      data.unit_size_sqft,
      data.unit_size_sqm,
      data.cost_price,
      data.sell_price,
      data.supplier_id,
      data.supplier_sku,
      data.in_stock  ? 1 : 0,
      data.stock_qty,
      data.min_stock_level,
      data.lead_time_days,
      data.notes,
      data.is_active ? 1 : 0,
    ]
  )
  return getMaterialById(id) as Promise<Material>
}

export async function updateMaterial(id: string, data: Partial<Material>): Promise<Material> {
  const current = await getMaterialById(id)
  if (!current) throw new Error(`Material ${id} not found`)

  const fields: string[] = []
  const vals: QueryParam[]  = []

  for (const [k, v] of Object.entries(data)) {
    if (k === "id" || k === "created_at" || k === "updated_at" || k === "supplier_name") continue
    if (k === "in_stock" || k === "is_active") { fields.push(`${k} = ?`); vals.push(v ? 1 : 0); continue }
    if (v !== undefined) { fields.push(`${k} = ?`); vals.push(v) }
  }

  if (!fields.length) return current
  vals.push(id)
  await execute(`UPDATE materials SET ${fields.join(", ")} WHERE id = ?`, vals)

  // Track price changes
  if (data.sell_price !== undefined && data.sell_price !== current.sell_price) {
    await trackPriceChange(id, current.sell_price, data.sell_price, "sell_price")
  }
  if (data.cost_price !== undefined && data.cost_price !== current.cost_price) {
    await trackPriceChange(id, current.cost_price, data.cost_price, "cost_price")
  }

  return getMaterialById(id) as Promise<Material>
}

export async function archiveMaterial(id: string): Promise<void> {
  await execute("UPDATE materials SET is_active = 0 WHERE id = ?", [id])
}

export async function getLowStockMaterials(): Promise<Material[]> {
  const rows = await query<Material>(
    `SELECT * FROM materials
     WHERE is_active = 1 AND in_stock = 1 AND stock_qty > 0 AND stock_qty <= min_stock_level
     ORDER BY (min_stock_level - stock_qty) DESC`
  )
  return rows.map((r) => ({ ...r, in_stock: !!r.in_stock, is_active: !!r.is_active }))
}

export async function getOutOfStockMaterials(): Promise<Material[]> {
  const rows = await query<Material>(
    "SELECT * FROM materials WHERE is_active = 1 AND in_stock = 1 AND stock_qty <= 0"
  )
  return rows.map((r) => ({ ...r, in_stock: !!r.in_stock, is_active: !!r.is_active }))
}

// ─── Price History ───────────────────────────────────────────────────────────

async function trackPriceChange(
  materialId: string,
  oldPrice: number | null,
  newPrice: number,
  priceType: "sell_price" | "cost_price"
): Promise<void> {
  await execute(
    `INSERT INTO material_price_history (id, material_id, old_price, new_price, price_type, changed_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [crypto.randomUUID(), materialId, oldPrice, newPrice, priceType, "admin"]
  )
}

export async function getPriceHistory(limit = 100): Promise<PriceHistoryEntry[]> {
  return query<PriceHistoryEntry>(
    `SELECT ph.*, m.name AS material_name
     FROM material_price_history ph
     JOIN materials m ON ph.material_id = m.id
     ORDER BY ph.changed_at DESC
     LIMIT ?`,
    [limit]
  )
}
