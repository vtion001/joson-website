import { NextResponse } from "next/server"
import path from "path"
import { readFile } from "fs/promises"
import { cookies } from "next/headers"
import { verifySession } from "@/lib/auth"
import { atomicWrite, safeJsonParse } from "@/lib/file-utils"
import { z } from "zod"

const filePath = path.join(process.cwd(), "data", "social.json")

const postSchema = z.object({
  content: z.string().min(1).max(5000),
  platforms: z.array(z.string()).min(1),
  schedule: z.string().max(100).optional().default(""),
})

export async function GET() {
  const cookieStore = cookies()
  const token = cookieStore.get("admin_session")?.value
  const session = token ? verifySession(token) : null
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const raw = await readFile(filePath, "utf-8").catch(() => "[]")
  const list = safeJsonParse<unknown[]>(raw, [])
  return NextResponse.json({ posts: Array.isArray(list) ? list : [] })
}

export async function POST(req: Request) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("admin_session")?.value
    const session = token ? verifySession(token) : null
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = postSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input: " + parsed.error.message }, { status: 400 })
    }
    const { content, platforms, schedule } = parsed.data

    const raw = await readFile(filePath, "utf-8").catch(() => "[]")
    const list = safeJsonParse<unknown[]>(raw, [])
    if (!Array.isArray(list)) return NextResponse.json({ error: "Data corrupted" }, { status: 500 })
    const post = { id: `sp_${Date.now()}`, content, platforms, schedule, status: schedule ? "scheduled" : "draft", created_at: Date.now() }
    list.unshift(post)
    await atomicWrite(filePath, list)
    return NextResponse.json({ ok: true, post })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 400 })
  }
}
