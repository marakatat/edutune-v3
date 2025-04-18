"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { FileText } from "lucide-react"

export function FloatingPaper({ count = 5 }) {
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 })
  const [papers, setPapers] = useState<{ id: number; initialX: number; initialY: number }[]>([])

  useEffect(() => {
    // Update dimensions only on client side
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    updateDimensions()

    // Generate initial positions for papers
    const initialPapers = Array.from({ length: count }).map((_, i) => ({
      id: i,
      initialX: Math.random() * window.innerWidth,
      initialY: Math.random() * window.innerHeight,
    }))
    setPapers(initialPapers)

    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [count])

  return (
    <div className="relative w-full h-full">
      {papers.map((paper) => (
        <motion.div
          key={paper.id}
          className="absolute"
          initial={{ x: paper.initialX, y: paper.initialY }}
          animate={{
            x: [
              paper.initialX,
              paper.initialX + Math.random() * 200 - 100,
              paper.initialX + Math.random() * 200 - 100,
              paper.initialX,
            ],
            y: [
              paper.initialY,
              paper.initialY + Math.random() * 200 - 100,
              paper.initialY + Math.random() * 200 - 100,
              paper.initialY,
            ],
            rotate: [0, Math.random() * 20 - 10, Math.random() * 20 - 10, 0],
          }}
          transition={{
            duration: 20 + Math.random() * 10,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            ease: "linear",
          }}
        >
          <div className="relative w-16 h-20 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 flex items-center justify-center transform hover:scale-110 transition-transform">
            <FileText className="w-8 h-8 text-purple-400/50" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
