import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
})

export const runtime = "nodejs"
export const maxDuration = 60

interface ExtractedRoom {
  name:        string
  dimensions:  string
  area_sqm:    number | null
  wall_length: number | null
  cabinet_zones: string[]
  notes:       string
}

interface ClaudeVisionResult {
  rooms:     ExtractedRoom[]
  summary:   string
  confidence: number
}

const FLOOR_PLAN_PROMPT = `You are an expert at analyzing architectural floor plans. Analyze this floor plan image and extract all room information.

Return a JSON object with EXACTLY this structure (no markdown, no code blocks, pure JSON):
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
- Calculate approximate area in square meters (estimate from grid/scale if available)
- Identify wall lengths in meters
- For KITCHEN, BATHROOM, and BEDROOM rooms: list potential cabinet locations (upper/lower wall cabinets)
- confidence: rate 0.0-1.0 how confident you are in this analysis
- If a room has no cabinets, cabinet_zones can be empty []
- Be specific about cabinet lengths in meters
- If the image is NOT a floor plan, set confidence to 0 and explain why
- Use metric units (meters, sqm) throughout`

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const imageData = formData.get("image") as string | null
    const fileName  = formData.get("fileName") as string || "floor_plan.pdf"

    if (!imageData) {
      return NextResponse.json({ error: "No image data provided" }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured. Add it to .env.local" },
        { status: 500 }
      )
    }

    // Convert base64 to binary for Anthropic
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "")
    const imageMediaType = imageData.startsWith("data:image/png") ? "image/png" : "image/jpeg"

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: imageMediaType as "image/png" | "image/jpeg",
                data: base64Data,
              },
            },
            {
              type: "text",
              text: FLOOR_PLAN_PROMPT,
            },
          ],
        },
      ],
    })

    const responseText = message.content
      .map((block) => ("text" in block ? block.text : ""))
      .join("")
      .trim()

    // Parse JSON response
    let parsed: ClaudeVisionResult
    try {
      // Strip any markdown code blocks
      const cleaned = responseText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim()
      parsed = JSON.parse(cleaned) as ClaudeVisionResult
    } catch {
      return NextResponse.json(
        {
          error: "AI returned invalid response format",
          raw: responseText.slice(0, 500),
        },
        { status: 422 }
      )
    }

    // Validate structure
    if (!Array.isArray(parsed.rooms)) {
      return NextResponse.json(
        { error: "AI response missing rooms array", raw: responseText.slice(0, 200) },
        { status: 422 }
      )
    }

    return NextResponse.json({
      fileName,
      rooms: parsed.rooms,
      summary: parsed.summary || "",
      confidence: parsed.confidence || 0,
      raw: responseText,
    })
  } catch (err) {
    console.error("[POST /api/pdf-extract]", err)
    const message = err instanceof Error ? err.message : "Extraction failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
