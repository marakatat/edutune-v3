import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/src/lib/supabase/server"
import { getCurrentUser } from "@/src/lib/auth/session"

export async function GET() {
  try {
    const currentUser = await getCurrentUser()

    // For simplicity, we're not implementing full admin checks here
    // In a real app, you would check if the current user is an admin
    if (!currentUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    // Get all users
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, username, table_allowed")
      .order("name")

    if (error) {
      console.error("Error fetching users:", error)
      return NextResponse.json({ success: false, message: "Failed to fetch users" }, { status: 500 })
    }

    return NextResponse.json({ success: true, users: data })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ success: false, message: "An unexpected error occurred" }, { status: 500 })
  }
}
