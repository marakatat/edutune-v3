import type { AppProps } from 'next/app'
import type React from "react"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "@/styles/globals.css"
import { Suspense } from "react"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <Component {...pageProps} />
      </Suspense>
      <Toaster />
      <Analytics />
      <SpeedInsights />
    </AuthProvider>
  )
}
