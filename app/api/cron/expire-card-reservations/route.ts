import { NextRequest, NextResponse } from "next/server"
import { expireCardOrderReservations } from "@/lib/repositories/orders-repo"

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const authorization = request.headers.get("authorization")

  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const expiredCount = await expireCardOrderReservations()
    return NextResponse.json({ expiredCount }, { status: 200 })
  } catch (error) {
    console.error("Card reservation expiration error:", error)
    return NextResponse.json(
      { error: "No se pudieron expirar las reservas" },
      { status: 500 }
    )
  }
}