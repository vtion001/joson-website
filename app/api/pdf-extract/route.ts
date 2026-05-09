import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const maxDuration = 60

interface ExtractedRoom {
  name:          string
  dimensions:     string
  area_sqm:      number | null
  wall_length:   number | null
  cabinet_zones: string[]
  notes:         string
}

interface VisionResult {
  rooms:     ExtractedRoom[]
  summary:   string
  confidence: number
}

const FLOOR_PLAN_PROMPT = `You are an expert at analyzing architectural floor plans. Analyze this floor plan image and extract all room information.

Return ONLY a JSON object with this exact structure (no markdown, no code blocks):
{
  "rooms": [
    {
      "name": "Kitchen",
      "dimensions": "3.5m x 4.0m",
      "area_sqm": 14.0,
      "wall_length": 15.0,
      "cabinet_zones": ["upper cabinets along north wall (3.5m)", "lower cabinets along south wall (3.5m)"],
      "notes": "L-shaped layout possible"
    }
  ],
  "summary": "3-bedroom house, approximately 120 sqm. Kitchen on the east wing.",
  "confidence": 0.85
}

Rules:
- For each room, identify its name and estimate dimensions if not labeled
- Calculate approximate area in square meters
- Identify total wall lengths in meters
- For KITCHEN, BATHROOM, and BEDROOM rooms: list cabinet locations with lengths in meters
- confidence: rate 0.0-1.0 how confident you are
- If a room has no cabinets, cabinet_zones = []
- If the image is NOT a floor plan, confidence = 0 and explain why
- Use metric units (meters, sqm) throughout
- Return ONLY the JSON object, nothing else`

// ── Google Gemini (FREE) ──────────────────────────────────────────────────────
async function extractWithGemini(base64Data: string, mimeType: string): Promise<VisionResult> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai")

  // Use GEMINI_API_KEY from env, or fall back to Google Application Default Credentials
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || ""

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY not found. Add it to .env.local (get free key at https://aistudio.google.com/apikey)"
    )
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  }

  const result = await model.generateContent([imagePart, FLOOR_PLAN_PROMPT])
  const response = result.response
  const text = response.text().trim()

  // Parse JSON
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim()
  return JSON.parse(cleaned) as VisionResult
}

// ── Anthropic Claude (paid fallback) ─────────────────────────────────────────
async function extractWithClaude(base64Data: string, mimeType: string): Promise<VisionResult> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" })

  const mediaType = mimeType as "image/png" | "image/jpeg"
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: base64Data },
          },
          { type: "text", text: FLOOR_PLAN_PROMPT },
        ],
      },
    ],
  })

  const text = message.content.map((b) => ("text" in b ? b.text : "")).join("").trim()
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim()
  return JSON.parse(cleaned) as VisionResult
}

// ── Route Handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const imageData = formData.get("image") as string | null
    const fileName  = (formData.get("fileName") as string) || "floor_plan.pdf"
    const provider  = (formData.get("provider") as string) || "gemini" // "gemini" | "claude"

    if (!imageData) {
      return NextResponse.json({ error: "No image data provided" }, { status: 400 })
    }

    // Strip data URI prefix
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "")
    const mimeType = imageData.startsWith("data:image/png")
      ? "image/png"
      : "image/jpeg"

    let parsed: VisionResult

    if (provider === "claude" && process.env.ANTHROPIC_API_KEY) {
      parsed = await extractWithClaude(base64Data, mimeType)
    } else {
      // Default: Gemini (free)
      parsed = await extractWithGemini(base64Data, mimeType)
    }

    if (!Array.isArray(parsed.rooms)) {
      return NextResponse.json(
        { error: "AI response missing rooms array", raw: JSON.stringify(parsed).slice(0, 200) },
        { status: 422 }
      )
    }

    return NextResponse.json({
      fileName,
      provider: provider === "claude" ? "claude" : "gemini",
      rooms:      parsed.rooms,
      summary:    parsed.summary || "",
      confidence: parsed.confidence || 0,
    })
  } catch (err) {
    console.error("[POST /api/pdf-extract]", err)
    const message = err instanceof Error ? err.message : "Extraction failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
