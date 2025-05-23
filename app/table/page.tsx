"use client"
import { motion } from "framer-motion"
import { FloatingPaper } from "@/src/components/floating-paper"
import { RoboAnimation } from "@/src/components/robo-animation"
import Navbar from "@/src/components/navbar"
import { SparklesCore } from "@/src/components/sparkles"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/src/components/ui/use-toast"
import { useAuth } from "@/src/contexts/auth-context"
import { Loader2 } from "lucide-react"

export default function TablePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isCheckingAccess, setIsCheckingAccess] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    async function checkAccess() {
      if (!user && !isLoading) {
        router.push("/sign-in")
        return
      }

      if (user) {
        try {
          const response = await fetch("/api/auth/check-table-access")
          if (response.ok) {
            setHasAccess(true)
          } else {
            toast({
              title: "Access Denied",
              description: "Sorry! Not Allowed",
              variant: "destructive",
            })
            router.push("/")
          }
        } catch (error) {
          console.error("Error checking table access:", error)
          toast({
            title: "Error",
            description: "An error occurred while checking access",
            variant: "destructive",
          })
          router.push("/")
        } finally {
          setIsCheckingAccess(false)
        }
      }
    }

    if (!isLoading) {
      checkAccess()
    }
  }, [user, isLoading, router])

  if (isLoading || isCheckingAccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
      </div>
    )
  }

  if (!hasAccess) {
    return null // This will never render as we redirect in the useEffect
  }

  return (
    <main className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
      {/* Ambient background with moving particles */}
      <div className="h-full w-full absolute inset-0 z-0 pointer-events-none">
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

        <div className="relative min-h-[calc(100vh-76px)] flex items-center">
          {/* Floating papers background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <FloatingPaper count={6} />
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                    Table
                  </span>
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-gray-400 text-xl mb-8 max-w-2xl mx-auto"
              >
                Joc table
              </motion.p>
            </div>
          </div>

          {/* Animated robot */}
          <div className="absolute bottom-0 right-0 w-96 h-96">
            <RoboAnimation />
          </div>
        </div>
      </div>
    </main>
  )
}
