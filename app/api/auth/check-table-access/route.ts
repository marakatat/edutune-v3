import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth/session"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ allowed: false }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    // Check if the user has table_allowed = 1
    const { data } = await supabase.from("users").select("table_allowed").eq("id", user.id).single()

    if (!data || data.table_allowed !== 1) {
      return NextResponse.json({ allowed: false }, { status: 403 })
    }

    return NextResponse.json({ allowed: true })
  } catch (error) {
    console.error("Error checking table access:", error)
    return NextResponse.json({ allowed: false }, { status: 500 })
  }
}
