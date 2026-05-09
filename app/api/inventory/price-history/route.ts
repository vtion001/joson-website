import { NextResponse } from "next/server"
import { getPriceHistory } from "@/lib/services/inventory"

export async function GET() {
  try {
    const history = await getPriceHistory(100)
    return NextResponse.json(history)
  } catch (err) {
    console.error("[GET /api/inventory/price-history]", err)
    return NextResponse.json({ error: "Failed to fetch price history" }, { status: 500 })
  }
}
