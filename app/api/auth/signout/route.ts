import { NextResponse } from "next/server"
import { clearSessionCookie } from "@/src/lib/auth/session"
import { createServerSupabaseClient } from "@/src/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const supabase = createServerSupabaseClient()
    const sessionToken = cookies().get("session_token")?.value

    if (sessionToken) {
      // Delete session from database
      await supabase.from("sessions").delete().eq("session_token", sessionToken)
    }

    // Clear session cookie
    clearSessionCookie()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error signing out:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
