import path from "path"
import { readFile, mkdir } from "fs/promises"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifySession } from "@/lib/auth"
import { atomicWrite, safeJsonParse } from "@/lib/file-utils"
import { z } from "zod"

const filePath = path.join(process.cwd(), "data", "calculator-pricing.json")
const versionsPath = path.join(process.cwd(), "data", "calculator-pricing.versions.json")

const pricingSchema = z.object({
  baseRates: z.object({
    base: z.number(),
    hanging: z.number(),
    tall: z.number(),
  }),
  tierMultipliers: z.object({
    luxury: z.number(),
    premium: z.number(),
    standard: z.number(),
  }),
  sheetRates: z.object({
    base: z.object({ withoutFees: z.number(), withFees: z.number() }),
    hanging: z.object({ withoutFees: z.number(), withFees: z.number() }),
    tall: z.object({ withoutFees: z.number(), withFees: z.number() }),
  }),
  cabinetTypeMultipliers: z.object({
    luxury: z.number(),
    premium: z.number(),
    basic: z.number(),
  }),
})

export async function POST(req: Request) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("admin_session")?.value
    const session = token ? verifySession(token) : null
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = pricingSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input: " + parsed.error.message }, { status: 400 })
    }
    const next = parsed.data

    await mkdir(path.join(process.cwd(), "data"), { recursive: true })
    await atomicWrite(filePath, next)
    const existing = await readFile(versionsPath, "utf-8").catch(() => "[]")
    const arr = safeJsonParse<{ ts: number; data: unknown }[]>(existing, [])
    if (!Array.isArray(arr)) return NextResponse.json({ error: "Version history corrupted" }, { status: 500 })
    arr.push({ ts: Date.now(), data: next })
    await atomicWrite(versionsPath, arr)
    return NextResponse.json({ ok: true, data: next })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || "Invalid payload" }, { status: 400 })
  }
}
