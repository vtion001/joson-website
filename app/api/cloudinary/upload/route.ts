import { NextResponse } from "next/server"
import { uploadImage } from "@/lib/cloudinary"

export async function POST(req: Request) {
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
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Upload failed" }, { status: 500 })
  }
}
