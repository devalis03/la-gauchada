import { NextResponse } from "next/server"
import { readOrderStats } from "@/lib/repositories/orders-repo"

export async function GET() {
  try {
    const stats = await readOrderStats()
    return NextResponse.json({ data: stats }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
