import mysql from "mysql2/promise"

// ─── Connection Pool ───────────────────────────────────────────────────────
const pool = mysql.createPool({
  host:     process.env.MYSQL_HOST     || "localhost",
  port:     parseInt(process.env.MYSQL_PORT || "3306"),
  user:     process.env.MYSQL_USER     || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "joson_inventory",
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:        0,
  timezone:          "+08:00",
  dateStrings:       true,
})

// ─── Query helpers ──────────────────────────────────────────────────────────
export type QueryParam = string | number | boolean | null | Date

export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: QueryParam[]
): Promise<T[]> {
  const [rows] = await pool.execute(sql, params || [])
  return rows as T[]
}

export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params?: QueryParam[]
): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows[0] ?? null
}

export async function execute(
  sql: string,
  params?: QueryParam[]
): Promise<mysql.ResultSetHeader> {
  const [result] = await pool.execute(sql, params || [])
  return result as mysql.ResultSetHeader
}

export { pool }
