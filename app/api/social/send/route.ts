import { NextResponse } from "next/server"
import path from "path"
import { readFile } from "fs/promises"
import { cookies } from "next/headers"
import { verifySession } from "@/lib/auth"
import { atomicWrite, safeJsonParse } from "@/lib/file-utils"
import { z } from "zod"

const postsPath = path.join(process.cwd(), "data", "social.json")
const providersPath = path.join(process.cwd(), "data", "social-providers.json")

const sendSchema = z.object({
  id: z.string().min(1),
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
    const parsed = sendSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input: " + parsed.error.message }, { status: 400 })
    }
    const { id } = parsed.data

    const postsRaw = await readFile(postsPath, "utf-8").catch(() => "[]")
    const list = safeJsonParse<unknown[]>(postsRaw, [])
    if (!Array.isArray(list)) return NextResponse.json({ error: "Data corrupted" }, { status: 500 })
    const idx = list.findIndex((p: unknown) => (p as { id?: string })?.id === id)
    if (idx === -1) return NextResponse.json({ error: "Post not found" }, { status: 404 })
    const post = list[idx] as { platforms?: string[]; status?: string; sent_at?: number; results?: { platform: string; ok: boolean }[] }
    const cfgRaw = await readFile(providersPath, "utf-8").catch(() => "{}")
    const providers = safeJsonParse<Record<string, { token?: string; access_token?: string }>>(cfgRaw, {})
    const results: { platform: string; ok: boolean }[] = []
    for (const platform of post.platforms || []) {
      const token2 = (providers as Record<string, { token?: string; access_token?: string }>)?.[platform]?.token || (providers as Record<string, { token?: string; access_token?: string }>)?.[platform]?.access_token
      const ok = !!token2
      results.push({ platform, ok })
    }
    post.status = results.every((r) => r.ok) ? "sent" : "partial"
    ;(post as { sent_at?: number }).sent_at = Date.now()
    ;(post as { results?: { platform: string; ok: boolean }[] }).results = results
    list[idx] = post
    await atomicWrite(postsPath, list)
    return NextResponse.json({ ok: true, post })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 400 })
  }
}
