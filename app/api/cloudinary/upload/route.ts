import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifySession } from "@/lib/auth"
import { uploadImage } from "@/lib/cloudinary"

async function authCheck() {
  if (process.env.SKIP_AUTH === "1") return null
  const cookieStore = cookies()
  const token = cookieStore.get("admin_session")?.value
  const session = token ? verifySession(token) : null
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return null
}

export async function POST(req: Request) {
  const auth = await authCheck()
  if (auth) return auth
  try {
    const { image, folder } = await req.json()

    if (!image || typeof image !== "string") {
      return NextResponse.json({ error: "No image data provided" }, { status: 400 })
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      return NextResponse.json(
        { error: "Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY env vars." },
        { status: 500 }
      )
    }

    const url = await uploadImage(image, folder || "joson-furniture/products")
    return NextResponse.json({ url })
  } catch {
    console.error("[POST /api/cloudinary/upload]")
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
