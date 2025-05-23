import { cookies } from "next/headers"
import crypto from "crypto"
import { createServerSupabaseClient } from "../supabase/server"

// Generate a random session token
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

// Set session cookie
export function setSessionCookie(sessionToken: string) {
  const oneWeek = 7 * 24 * 60 * 60 * 1000
  const expires = new Date(Date.now() + oneWeek)

  cookies().set({
    name: "session_token",
    value: sessionToken,
    expires,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })
}

// Clear session cookie
export function clearSessionCookie() {
  cookies().set({
    name: "session_token",
    value: "",
    expires: new Date(0),
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })
}

// Get current user from session
export async function getCurrentUser() {
  const sessionToken = cookies().get("session_token")?.value

  if (!sessionToken) {
    return null
  }

  const supabase = createServerSupabaseClient()

  // Get session
  const { data: sessionData } = await supabase
    .from("sessions")
    .select("user_id, expires_at")
    .eq("session_token", sessionToken)
    .single()

  if (!sessionData || new Date(sessionData.expires_at) < new Date()) {
    clearSessionCookie()
    return null
  }

  // Get user
  const { data: userData } = await supabase
    .from("users")
    .select("id, name, email, username, bio, profile_image_url, table_allowed")
    .eq("id", sessionData.user_id)
    .single()

  return userData
}
