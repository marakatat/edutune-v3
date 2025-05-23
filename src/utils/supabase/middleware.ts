import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          // Re-create response to apply cookies, as request.cookies.set doesn't modify the outgoing response directly
          supabaseResponse = NextResponse.next({
            request, // Pass the original request
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing plain `await supabase.auth.getSession()` here.
  // This will cause issues with the session not being refreshed correctly.
  // Read more: https://supabase.com/docs/guides/auth/server-side/nextjs
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Optionally, refresh the session if it's about to expire
  // This is just an example; adjust logic as needed
  if (session && session.expires_at) {
    const currentTime = Math.floor(Date.now() / 1000)
    const fiveMinutes = 5 * 60
    if (session.expires_at < currentTime + fiveMinutes) {
      await supabase.auth.refreshSession()
    }
  }

  // Add user to response locals if you need to access it in API routes or server components
  // (This part is more for older Next.js patterns or specific needs,
  // with App Router, you'd typically get session directly in components/routes)
  // supabaseResponse.locals.supabase = supabase;
  // supabaseResponse.locals.session = session;

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|auth).*)",
  ],
}
