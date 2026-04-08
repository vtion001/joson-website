import { NextResponse } from "next/server"
import path from "path"
import { readFile, writeFile } from "fs/promises"
import { z } from "zod"
import { safeJsonParse } from "@/lib/file-utils"

const dataDir = path.join(process.cwd(), "data")
const storePath = path.join(dataDir, "gmail.json")
const emailCfgPath = path.join(dataDir, "email.json")

const emailSchema = z.object({
  to: z.string().email("Invalid recipient email"),
  from: z.string().email("Invalid sender email").optional(),
  subject: z.string().min(1).max(200),
  text: z.string().max(10000),
  includeSignature: z.boolean().optional().default(true),
})

function sanitizeHeader(value: string): string {
  return value.replace(/[\r\n]/g, "")
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

interface GmailToken {
  obtained_at: number
  expires_in: number
  access_token: string
  refresh_token?: string
}

interface GmailConfig {
  token?: GmailToken
}

interface EmailConfig {
  from_name?: string
  from_email?: string
  reply_to?: string
  bcc?: string
  signature_text?: string
}

async function getToken() {
  const raw = await readFile(storePath, "utf-8").catch(() => "{}")
  const cfg = safeJsonParse<GmailConfig>(raw, {})
  const t = cfg?.token
  if (!t) return null
  const expiresAt = t.obtained_at + (t.expires_in || 0) * 1000 - 60_000
  if (Date.now() < expiresAt) return t.access_token
  const clientId = process.env.GOOGLE_CLIENT_ID || ""
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || ""
  const refreshToken = t.refresh_token
  if (!refreshToken || !clientId || !clientSecret) return null
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: "refresh_token" }),
  })
  const data = await res.json()
  if (!res.ok) return null
  if (!cfg.token) return null
  cfg.token.access_token = data.access_token
  cfg.token.expires_in = data.expires_in
  cfg.token.obtained_at = Date.now()
  await writeFile(storePath, JSON.stringify(cfg, null, 2))
  return cfg.token.access_token
}

function rfc822(from: string, to: string, subject: string, text: string, replyTo?: string, bcc?: string) {
  const headers = [
    `From: ${sanitizeHeader(from)}`,
    `To: ${sanitizeHeader(to)}`,
    `Subject: ${sanitizeHeader(subject)}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset="UTF-8"`,
  ]
  if (replyTo) headers.push(`Reply-To: ${sanitizeHeader(replyTo)}`)
  if (bcc) headers.push(`Bcc: ${sanitizeHeader(bcc)}`)
  return headers.join("\r\n") + "\r\n\r\n" + text
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = emailSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input: " + parsed.error.message }, { status: 400 })
    }
    const { to, subject, text, from, includeSignature } = parsed.data

    const adminEmail = process.env.ADMIN_EMAIL
    if (!adminEmail) {
      return NextResponse.json({ error: "ADMIN_EMAIL environment variable must be configured" }, { status: 500 })
    }

    const token = await getToken()
    if (!token) return NextResponse.json({ error: "Gmail not connected" }, { status: 500 })
    const cfgRaw = await readFile(emailCfgPath, "utf-8").catch(() => "{}")
    const cfg = safeJsonParse<EmailConfig>(cfgRaw, {})
    const fromName = String(cfg.from_name || "Joson Furniture")
    const fromEmail = String(from || cfg.from_email || adminEmail)
    if (!isValidEmail(fromEmail) || !isValidEmail(to)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }
    const replyTo = String(cfg.reply_to || fromEmail)
    const bcc = String(cfg.bcc || "")
    const sig = includeSignature === false ? "" : String(cfg.signature_text || "")
    const messageBody = String(text || "") + sig
    const raw = rfc822(`${fromName} <${fromEmail}>`, String(to), String(subject), messageBody, replyTo, bcc)
    const base64 = Buffer.from(raw, "utf-8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_")
    const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ raw: base64 }),
    })
    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: data?.error || "Send failed" }, { status: 500 })
    return NextResponse.json({ ok: true, id: data?.id })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 400 })
  }
}