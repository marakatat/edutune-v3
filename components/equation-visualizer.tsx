"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Play, Pause, RefreshCw } from "lucide-react"
import { useEvent } from "@/lib/hooks/use-event"

interface EquationVisualizerProps {
  equations: string[]
}

export function EquationVisualizer({ equations }: EquationVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const animationRef = useRef<number | null>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight

    // Parse equations and draw
    drawEquations(ctx, equations, progress)

    // Handle window resize
    const handleResize = () => {
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight
      drawEquations(ctx, equations, progress)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [equations, progress, scale])

  useEffect(() => {
    if (isPlaying) {
      let startTime: number | null = null
      const duration = 5000 // 5 seconds for full animation

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp
        const elapsed = timestamp - startTime
        const newProgress = Math.min(elapsed / duration, 1)
        setProgress(newProgress)

        if (newProgress < 1) {
          animationRef.current = requestAnimationFrame(animate)
        } else {
          setIsPlaying(false)
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying])

  const drawEquations = (ctx: CanvasRenderingContext2D, equations: string[], t: number) => {
    const width = ctx.canvas.width
    const height = ctx.canvas.height
    const centerX = width / 2
    const centerY = height / 2

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw coordinate system
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, centerY)
    ctx.lineTo(width, centerY)
    ctx.moveTo(centerX, 0)
    ctx.lineTo(centerX, height)
    ctx.stroke()

    // Parse and draw each equation
    equations.forEach((equationSet, index) => {
      const lines = equationSet.split("\n")
      if (lines.length < 2) return

      // Extract x and y equations
      const xEquation = lines[0].replace("x(t) = ", "")
      const yEquation = lines[1].replace("y(t) = ", "")

      try {
        // Create a safe evaluation function
        const evalEquation = (equation: string, t: number): number => {
          // Replace mathematical expressions with JavaScript equivalents
          const jsEquation = equation
            .replace(/\^/g, "**") // Replace ^ with **
            .replace(/(\d+)\s*\*\s*\(/g, "$1 * (") // Ensure proper multiplication syntax

          // Create a function to evaluate the equation
          // eslint-disable-next-line no-new-func
          const func = new Function("t", `return ${jsEquation}`)
          return func(t)
        }

        // Draw the path up to the current progress
        ctx.strokeStyle = getColorForIndex(index)
        ctx.lineWidth = 2
        ctx.beginPath()

        const steps = 100
        let firstPoint = true

        for (let i = 0; i <= Math.floor(steps * t); i++) {
          const stepT = i / steps
          try {
            const x = evalEquation(xEquation, stepT) * scale + centerX
            const y = evalEquation(yEquation, stepT) * scale + centerY

            if (firstPoint) {
              ctx.moveTo(x, y)
              firstPoint = false
            } else {
              ctx.lineTo(x, y)
            }
          } catch (error) {
            console.error("Error evaluating equation:", error)
          }
        }

        ctx.stroke()

        // Draw the current point
        if (t > 0) {
          try {
            const x = evalEquation(xEquation, t) * scale + centerX
            const y = evalEquation(yEquation, t) * scale + centerY

            ctx.fillStyle = getColorForIndex(index)
            ctx.beginPath()
            ctx.arc(x, y, 5, 0, Math.PI * 2)
            ctx.fill()
          } catch (error) {
            console.error("Error evaluating current point:", error)
          }
        }
      } catch (error) {
        console.error("Error parsing equation:", error)
      }
    })
  }

  const getColorForIndex = (index: number): string => {
    const colors = [
      "#8b5cf6", // Purple
      "#ec4899", // Pink
      "#3b82f6", // Blue
      "#10b981", // Green
      "#f59e0b", // Amber
      "#ef4444", // Red
    ]
    return colors[index % colors.length]
  }

  const handlePlayPause = useEvent(() => {
    if (progress >= 1) {
      setProgress(0)
      setIsPlaying(true)
    } else {
      setIsPlaying(!isPlaying)
    }
  })

  const handleReset = useEvent(() => {
    setProgress(0)
    setIsPlaying(false)
  })

  const handleProgressChange = useEvent((value: number[]) => {
    setProgress(value[0])
    setIsPlaying(false)
  })

  const handleScaleChange = useEvent((value: number[]) => {
    setScale(value[0])
  })

  return (
    <div className="space-y-6">
      <div className="bg-black/40 border border-white/10 rounded-lg p-4">
        <canvas ref={canvasRef} className="w-full h-[400px] bg-black/60 rounded-md" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-white/10 bg-black/40">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Animation Progress</Label>
              <div className="flex items-center space-x-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-white border-white/20 hover:bg-white/10 h-8 w-8 p-0"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Slider
                  value={[progress]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={handleProgressChange}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="text-white border-white/20 hover:bg-white/10 h-8 w-8 p-0"
                  onClick={handleReset}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-black/40">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Scale Factor: {scale.toFixed(2)}</Label>
              <Slider value={[scale]} min={0.1} max={5} step={0.1} onValueChange={handleScaleChange} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
