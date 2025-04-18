import Hero from "@/components/hero"
import Navbar from "@/components/navbar"
import { SparklesCore } from "@/components/sparkles"
import { NotificationHandler } from "@/components/notification-handler"
import { Suspense } from "react"

export default function Home() {
  return (
    <main className="min-h-screen bg-black/[1] antialiased bg-grid-white/[0.02] relative overflow-hidden">
      {/* Ambient background with moving particles */}
      <div className="h-full w-full absolute inset-0 z-0">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
      </div>

      <div className="relative z-10">
        <Navbar />
        <Hero />

        {/* Wrap the NotificationHandler in a Suspense boundary */}
        <Suspense fallback={null}>
          <NotificationHandler />
        </Suspense>
      </div>
    </main>
  )
}
