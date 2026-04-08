import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary from env vars (only if all required vars are present)
const cloudName = process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  })
}

export async function uploadImage(
  base64Data: string,
  folder = "joson-furniture"
): Promise<string> {
  // Remove data URI prefix if present (e.g. "data:image/jpeg;base64,...")
  const base64 = base64Data.replace(/^data:image\/\w+;base64,/, "")

  const result = await cloudinary.uploader.upload(
    `data:image/png;base64,${base64}`,
    {
      folder,
      resource_type: "image",
      transformation: [
        { quality: "auto:good", fetch_format: "auto" },
      ],
    }
  )

  return result.secure_url
}

export async function uploadVideo(
  base64Data: string,
  folder = "joson-furniture/videos"
): Promise<string> {
  const base64 = base64Data.replace(/^data:video\/\w+;base64,/, "")

  const result = await cloudinary.uploader.upload(
    `data:video/mp4;base64,${base64}`,
    {
      folder,
      resource_type: "video",
      transformation: [
        { quality: "auto:best", fetch_format: "mp4" },
      ],
    }
  )

  return result.secure_url
}

export { cloudinary }
