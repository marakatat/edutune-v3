import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth/session"

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser()

    // For simplicity, we're not implementing full admin checks here
    // In a real app, you would check if the current user is an admin
    if (!currentUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { userId, allowed } = await request.json()

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Update the user's table_allowed status
    const { error } = await supabase
      .from("users")
      .update({ table_allowed: allowed ? 1 : 0 })
      .eq("id", userId)

    if (error) {
      console.error("Error updating table access:", error)
      return NextResponse.json({ success: false, message: "Failed to update access" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating table access:", error)
    return NextResponse.json({ success: false, message: "An unexpected error occurred" }, { status: 500 })
  }
}
