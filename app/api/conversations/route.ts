import { NextResponse } from "next/server"
import path from "path"
import { readFile } from "fs/promises"
import { cookies } from "next/headers"
import { verifySession } from "@/lib/auth"
import { atomicWrite, safeJsonParse } from "@/lib/file-utils"
import { z } from "zod"

const filePath = path.join(process.cwd(), "data", "conversations.json")

const conversationSchema = z.object({
  platform: z.string().min(1).max(50),
  client: z.string().min(1).max(200),
  text: z.string().min(1).max(5000),
})

export async function GET() {
  const raw = await readFile(filePath, "utf-8").catch(() => "[]")
  const list = safeJsonParse<unknown[]>(raw, [])
  return NextResponse.json({ conversations: Array.isArray(list) ? list : [] })
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
    const parsed = conversationSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input: " + parsed.error.message }, { status: 400 })
    }
    const { platform, client, text } = parsed.data

    const raw = await readFile(filePath, "utf-8").catch(() => "[]")
    const list = safeJsonParse<unknown[]>(raw, [])
    if (!Array.isArray(list)) return NextResponse.json({ error: "Data corrupted" }, { status: 500 })
    const id = `cv_${Date.now()}`
    const convo = { id, platform, client, status: "open", tags: [], messages: [{ from: "client", text, date: Date.now() }] }
    list.unshift(convo)
    await atomicWrite(filePath, list)
    return NextResponse.json({ ok: true, conversation: convo })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 400 })
  }
}
