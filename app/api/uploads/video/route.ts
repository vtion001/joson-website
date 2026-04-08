import { NextResponse } from "next/server"
import { uploadVideo } from "@/lib/cloudinary"
import { cookies } from "next/headers"
import { verifySession } from "@/lib/auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const cookieStore = cookies()
  const token = cookieStore.get("admin_session")?.value
  const session = token ? verifySession(token) : null
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const form = await req.formData()
    const file = form.get("video") as File | null

    if (!file || typeof file !== "object" || file.size === 0) {
      return NextResponse.json({ ok: false, error: "No file uploaded" }, { status: 400 })
    }

    const allowed = new Set(["video/mp4", "video/webm", "video/quicktime"])
    if (!allowed.has(file.type)) {
      return NextResponse.json({ ok: false, error: "Unsupported file type" }, { status: 415 })
    }

    const maxBytes = (process.env.MAX_VIDEO_SIZE_BYTES ? parseInt(process.env.MAX_VIDEO_SIZE_BYTES) : 200) * 1024 * 1024
    if (file.size > maxBytes) {
      return NextResponse.json({ ok: false, error: "File too large (max 200MB)" }, { status: 413 })
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      return NextResponse.json({ ok: false, error: "Cloudinary not configured" }, { status: 500 })
    }

    // Convert File to base64
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString("base64")
    const mimeType = file.type

    const url = await uploadVideo(
      `data:${mimeType};base64,${base64}`,
      "joson-furniture/videos"
    )

    return NextResponse.json({ ok: true, url })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || "Upload failed" }, { status: 500 })
  }
}
