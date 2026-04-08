import { NextResponse } from "next/server"
import path from "path"
import { readFile, mkdir } from "fs/promises"
import { cookies } from "next/headers"
import { verifySession } from "@/lib/auth"
import { atomicWrite, safeJsonParse } from "@/lib/file-utils"
import { z } from "zod"

const crmPath = path.join(process.cwd(), "data", "crm.json")

const leadSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().min(1).max(50),
  company: z.string().max(200).optional().default(""),
  source: z.string().max(100).optional().default("Inquiry"),
  notes: z.string().max(5000).optional().default(""),
})

export async function POST(req: Request) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("admin_session")?.value
    const session = token ? verifySession(token) : null
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await req.json()
    const parsed = leadSchema.safeParse(payload)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input: " + parsed.error.message }, { status: 400 })
    }
    const { name, email, phone, company, source, notes } = parsed.data

    await mkdir(path.join(process.cwd(), "data"), { recursive: true })
    const raw = await readFile(crmPath, "utf-8").catch(() => "{}")
    const db = safeJsonParse(raw, { leads: [] }) as { leads?: unknown[] }
    const leads = Array.isArray(db.leads) ? db.leads : []
    const id = `lead_${Date.now()}`
    leads.unshift({ id, name, email, phone, company, source, status: "New", notes, created_at: Date.now() })
    const next = { ...db, leads }
    await atomicWrite(crmPath, next)
    return NextResponse.json({ ok: true, id })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 400 })
  }
}
