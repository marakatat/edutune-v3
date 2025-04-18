import type React from "react"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"
import { Suspense } from "react"

export const metadata = {
  title: "Romdev",
  description: "Explore our platform and discover amazing features",
  icons: {
    icon: "/favicon.svg",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className="overflow-x-hidden">
        <AuthProvider>
          <Suspense>{children}</Suspense>
          <Toaster />
          <Analytics />
          <SpeedInsights />
        </AuthProvider>
      </body>
    </html>
  )
}
