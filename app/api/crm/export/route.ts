import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { cookies } from "next/headers"
import { verifySession } from "@/lib/auth"

export async function GET() {
  const cookieStore = cookies()
  const token = cookieStore.get("admin_session")?.value
  const session = token ? verifySession(token) : null
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const raw = await readFile(process.cwd() + "/data/crm.json", "utf-8")
    return new NextResponse(raw, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": "attachment; filename=\"crm.json\"",
      },
    })
  } catch {
    return NextResponse.json({ error: "CRM data not found" }, { status: 404 })
  }
}
