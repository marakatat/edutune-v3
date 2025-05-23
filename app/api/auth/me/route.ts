import { NextResponse } from "next/server"
import { getCurrentUser } from "@/src/lib/auth/session"

export async function GET() {
  try {
    const user = await getCurrentUser()

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error getting current user:", error)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
