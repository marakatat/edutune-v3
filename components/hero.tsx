"use client"

import type React from "react"
import { motion } from "framer-motion"
import { FileText, Sparkles, Table } from "lucide-react"
import { FloatingPaper } from "@/components/floating-paper"
import { RoboAnimation } from "@/components/robo-animation"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export default function Hero() {
  const { user } = useAuth()
  const router = useRouter()

  const handleSecretPdfClick = (e: React.MouseEvent) => {
    e.preventDefault()
    toast({
      title: "Secret PDF",
      description: 'It says "secret". What did you expect?',
    })
  }

  const handleTableClick = (e: React.MouseEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access this feature.",
        variant: "destructive",
      })
      return
    }

    if (user.table_allowed === 1) {
      router.push("/table")
    } else {
      toast({
        title: "No budget",
        description: "This feature isn't ready.",
        variant: "destructive",
      })
    }
  }

  return (
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
                Welcome to Romdev
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-400 text-xl mb-8 max-w-2xl mx-auto"
          >
            Explore our platform and discover amazing features.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto"
          >
            <a
              onClick={handleTableClick}
              className="inline-flex items-center justify-center h-11 px-8 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors w-full sm:w-auto cursor-pointer"
            >
              <Table className="mr-2 h-5 w-5" />
              Table
            </a>
            <Link
              href="/template"
              className="inline-flex items-center justify-center h-11 px-8 py-2 border border-white/40 text-white hover:bg-white/10 rounded-md font-medium transition-colors w-full sm:w-auto"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Template
            </Link>
            <a
              onClick={handleSecretPdfClick}
              className="inline-flex items-center justify-center h-11 px-8 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors w-full sm:w-auto cursor-pointer"
            >
              <FileText className="mr-2 h-5 w-5" />
              secret.pdf
            </a>
          </motion.div>
        </div>
      </div>

      {/* Animated robot */}
      <div className="absolute bottom-0 right-0 w-96 h-96">
        <RoboAnimation />
      </div>
    </div>
  )
}
