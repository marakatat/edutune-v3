import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Only run this middleware for the /table route
  if (request.nextUrl.pathname === "/table") {
    // Get the session token from cookies
    const sessionToken = request.cookies.get("session_token")?.value

    if (!sessionToken) {
      // If no session token, redirect to sign-in
      return NextResponse.redirect(new URL("/sign-in", request.url))
    }

    try {
      // Make a request to our API to check if the user is allowed
      // Use the absolute URL to ensure it works in all environments
      const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : request.nextUrl.origin

      const response = await fetch(`${baseUrl}/api/auth/check-table-access`, {
        headers: {
          Cookie: `session_token=${sessionToken}`,
        },
      })

      if (!response.ok) {
        // If not allowed, redirect to home with a query parameter
        return NextResponse.redirect(new URL("/?notAllowed=table", request.url))
      }
    } catch (error) {
      console.error("Error checking table access:", error)
      // If there's an error, redirect to home with a query parameter
      return NextResponse.redirect(new URL("/?notAllowed=table", request.url))
    }
  }

  return NextResponse.next()
}

// Update the matcher to ONLY match the /table route and nothing else
export const config = {
  matcher: ["/table"],
}
