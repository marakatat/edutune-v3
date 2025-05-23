"use server"

import { createServerSupabaseClient } from "@/src/lib/supabase/server"
import { generateSalt, hashPassword, verifyPassword } from "@/src/lib/auth/password"
import { generateSessionToken, setSessionCookie, clearSessionCookie } from "@/src/lib/auth/session"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

// Generate a username based on name and a random suffix
function generateUsername(name: string): string {
  const baseName = name.toLowerCase().replace(/[^a-z0-9]/g, "")
  const randomSuffix = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `${baseName}${randomSuffix}`
}

export async function checkUsernameAvailability(username: string) {
  try {
    const supabase = createServerSupabaseClient()
    const { data } = await supabase.from("users").select("username").eq("username", username).maybeSingle()

    return { available: !data }
  } catch (error) {
    console.error("Error checking username availability:", error)
    return { available: false }
  }
}

export async function signUp(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  if (!name || !email || !password) {
    return { success: false, message: "Missing required fields" }
  }

  try {
    const supabase = createServerSupabaseClient()

    // Check if user already exists
    const { data: existingUser } = await supabase.from("users").select("id").eq("email", email).maybeSingle()

    if (existingUser) {
      return { success: false, message: "User with this email already exists" }
    }

    // Check if username is available (if provided)
    if (username) {
      const { data: existingUsername } = await supabase
        .from("users")
        .select("id")
        .eq("username", username)
        .maybeSingle()

      if (existingUsername) {
        return { success: false, message: "Username is already taken" }
      }
    }

    // Generate username if not provided
    const finalUsername = username || generateUsername(name)

    // Hash password
    const salt = generateSalt()
    const passwordHash = hashPassword(password, salt)

    // Create user
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert([
        {
          name,
          email,
          password_hash: passwordHash,
          username: finalUsername,
          table_allowed: 0, // Default to not allowed
        },
      ])
      .select("id, username")
      .single()

    if (userError) {
      console.error("Error creating user:", userError)
      return { success: false, message: "Error creating user" }
    }

    // Create session
    const sessionToken = generateSessionToken()
    const oneWeek = 7 * 24 * 60 * 60 * 1000
    const expiresAt = new Date(Date.now() + oneWeek)

    const { error: sessionError } = await supabase.from("sessions").insert([
      {
        user_id: user.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
      },
    ])

    if (sessionError) {
      console.error("Error creating session:", sessionError)
      return { success: false, message: "Error creating session" }
    }

    // Set session cookie
    setSessionCookie(sessionToken)

    // Revalidate paths
    revalidatePath(`/${user.username}`)

    return { success: true, message: "User created successfully", username: user.username }
  } catch (error) {
    console.error("Sign up error:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { success: false, message: "Missing email or password" }
  }

  try {
    const supabase = createServerSupabaseClient()

    // Get user
    const { data: user } = await supabase
      .from("users")
      .select("id, password_hash, username")
      .eq("email", email)
      .maybeSingle()

    if (!user) {
      return { success: false, message: "Invalid email or password" }
    }

    // Verify password
    const isPasswordValid = verifyPassword(password, user.password_hash)

    if (!isPasswordValid) {
      return { success: false, message: "Invalid email or password" }
    }

    // Create session
    const sessionToken = generateSessionToken()
    const oneWeek = 7 * 24 * 60 * 60 * 1000
    const expiresAt = new Date(Date.now() + oneWeek)

    const { error: sessionError } = await supabase.from("sessions").insert([
      {
        user_id: user.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
      },
    ])

    if (sessionError) {
      console.error("Error creating session:", sessionError)
      return { success: false, message: "Error creating session" }
    }

    // Set session cookie
    setSessionCookie(sessionToken)

    // Revalidate paths
    revalidatePath(`/${user.username}`)

    return { success: true, message: "Signed in successfully", username: user.username }
  } catch (error) {
    console.error("Sign in error:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

export async function signOut() {
  try {
    const supabase = createServerSupabaseClient()
    const sessionToken = cookies().get("session_token")?.value

    if (sessionToken) {
      // Delete session from database
      await supabase.from("sessions").delete().eq("session_token", sessionToken)
    }

    // Clear session cookie
    clearSessionCookie()

    redirect("/")
  } catch (error) {
    console.error("Sign out error:", error)
  }
}
