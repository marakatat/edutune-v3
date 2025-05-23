import { type CookieOptions, createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export function createServerSupabaseClient() {
  const cookieStore = cookies()

  // Ensure that SUPABASE_URL and SUPABASE_ANON_KEY are defined.
  // The error will be thrown by createServerClient if they are not,
  // but this check can provide an earlier, more specific error message if needed.
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error(
      "CRITICAL ERROR: SUPABASE_URL or SUPABASE_ANON_KEY is not defined in the server environment. Check .env.local and restart the server."
    )
    // Optionally, throw an error here to prevent Supabase client from trying to initialize
    // throw new Error("Supabase URL or Anon Key is not defined.");
  }

  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Function to create a Supabase client for route handlers and server actions
// that uses the SERVICE_ROLE_KEY for elevated privileges.
export function createServiceRoleSupabaseClient() {
  const cookieStore = cookies()

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error(
      "CRITICAL ERROR: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not defined for the service role client. Check .env.local and restart the server."
    )
    // Optionally, throw an error here
    // throw new Error("Supabase URL or Service Role Key is not defined.");
  }

  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key here
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
