"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Plus, Minus, RefreshCw, Play, Pause, Grid, Move, MousePointer } from "lucide-react"

interface MathVisualizerProps {
  initialEquations?: string[]
}

type Point = {
  x: number
  y: number
}

type GraphObject = {
  id: string
  type: "function" | "parametric" | "point"
  equation: string
  color: string
  visible: boolean
  thickness: number
}

export function MathVisualizer({ initialEquations = [] }: MathVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [equations, setEquations] = useState<GraphObject[]>([])
  const [newEquation, setNewEquation] = useState("")
  const [selectedEquation, setSelectedEquation] = useState<string | null>(null)
  const [zoom, setZoom] = useState(50)
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 })
  const [tool, setTool] = useState<"pan" | "select">("select")
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationParam, setAnimationParam] = useState(0)
  const animationRef = useRef<number | null>(null)
  const [showGrid, setShowGrid] = useState(true)

  // Colors for graphs
  const colors = [
    "#8b5cf6", // Purple
    "#ec4899", // Pink
    "#3b82f6", // Blue
    "#10b981", // Green
    "#f59e0b", // Amber
    "#ef4444", // Red
  ]

  // Initialize with any provided equations
  useEffect(() => {
    if (initialEquations.length > 0 && equations.length === 0) {
      const initialGraphObjects = initialEquations.map((eq, index) => ({
        id: `eq-${Date.now()}-${index}`,
        type: eq.includes("t") ? "parametric" : "function",
        equation: eq,
        color: colors[index % colors.length],
        visible: true,
        thickness: 2,
      }))
      setEquations(initialGraphObjects)
    }
  }, [initialEquations, equations.length])

  // Canvas setup and drawing
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight

    // Draw the visualization
    drawVisualization(ctx)

    // Handle window resize
    const handleResize = () => {
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight
      drawVisualization(ctx)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [equations, zoom, pan, showGrid, animationParam])

  // Animation effect
  useEffect(() => {
    if (isAnimating) {
      const animate = () => {
        setAnimationParam((prev) => (prev >= 1 ? 0 : prev + 0.005))
        animationRef.current = requestAnimationFrame(animate)
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
  }, [isAnimating])

  const drawVisualization = (ctx: CanvasRenderingContext2D) => {
    const width = ctx.canvas.width
    const height = ctx.canvas.height
    const centerX = width / 2 + pan.x
    const centerY = height / 2 + pan.y
    const scale = zoom / 10

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw grid if enabled
    if (showGrid) {
      drawGrid(ctx, centerX, centerY, width, height, scale)
    }

    // Draw axes
    drawAxes(ctx, centerX, centerY, width, height)

    // Draw each equation
    equations
      .filter((eq) => eq.visible)
      .forEach((eq) => {
        if (eq.type === "function") {
          drawFunction(ctx, eq, centerX, centerY, width, height, scale)
        } else if (eq.type === "parametric") {
          drawParametric(ctx, eq, centerX, centerY, scale, animationParam)
        } else if (eq.type === "point") {
          drawPoint(ctx, eq, centerX, centerY, scale)
        }
      })
  }

  const drawGrid = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    width: number,
    height: number,
    scale: number,
  ) => {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
    ctx.lineWidth = 0.5

    // Calculate grid spacing based on zoom level
    const gridSpacing = 50 * scale
    const startX = Math.floor((0 - centerX) / gridSpacing) * gridSpacing + centerX
    const startY = Math.floor((0 - centerY) / gridSpacing) * gridSpacing + centerY

    // Draw vertical grid lines
    for (let x = startX; x < width; x += gridSpacing) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    // Draw horizontal grid lines
    for (let y = startY; y < height; y += gridSpacing) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
  }

  const drawAxes = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, width: number, height: number) => {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
    ctx.lineWidth = 1.5

    // X-axis
    ctx.beginPath()
    ctx.moveTo(0, centerY)
    ctx.lineTo(width, centerY)
    ctx.stroke()

    // Y-axis
    ctx.beginPath()
    ctx.moveTo(centerX, 0)
    ctx.lineTo(centerX, height)
    ctx.stroke()
  }

  const drawFunction = (
    ctx: CanvasRenderingContext2D,
    graphObj: GraphObject,
    centerX: number,
    centerY: number,
    width: number,
    height: number,
    scale: number,
  ) => {
    try {
      // Parse the equation
      const equation = graphObj.equation.replace("y = ", "").replace("f(x) = ", "")

      // Create a safe evaluation function
      // eslint-disable-next-line no-new-func
      const evalFunc = new Function("x", `return ${equation.replace(/\^/g, "**")}`)

      ctx.strokeStyle = graphObj.color
      ctx.lineWidth = graphObj.thickness
      ctx.beginPath()

      let isFirstPoint = true
      const step = 1 / scale

      for (let pixelX = 0; pixelX < width; pixelX += step) {
        // Convert pixel coordinates to math coordinates
        const x = (pixelX - centerX) / (50 * scale)
        let y

        try {
          y = evalFunc(x)
          // Convert math coordinates back to pixel coordinates
          const pixelY = centerY - y * 50 * scale

          if (isFirstPoint) {
            ctx.moveTo(pixelX, pixelY)
            isFirstPoint = false
          } else {
            ctx.lineTo(pixelX, pixelY)
          }
        } catch (error) {
          // Skip points where the function is undefined
          isFirstPoint = true
        }
      }

      ctx.stroke()
    } catch (error) {
      console.error("Error drawing function:", error)
    }
  }

  const drawParametric = (
    ctx: CanvasRenderingContext2D,
    graphObj: GraphObject,
    centerX: number,
    centerY: number,
    scale: number,
    t: number,
  ) => {
    try {
      // Parse the parametric equations
      const lines = graphObj.equation.split("\n")
      if (lines.length < 2) return

      const xEquation = lines[0].replace("x(t) = ", "").replace(/\^/g, "**")
      const yEquation = lines[1].replace("y(t) = ", "").replace(/\^/g, "**")

      // Create safe evaluation functions
      // eslint-disable-next-line no-new-func
      const evalX = new Function("t", `return ${xEquation}`)
      // eslint-disable-next-line no-new-func
      const evalY = new Function("t", `return ${yEquation}`)

      ctx.strokeStyle = graphObj.color
      ctx.lineWidth = graphObj.thickness
      ctx.beginPath()

      const steps = 100
      let firstPoint = true

      for (let i = 0; i <= steps; i++) {
        const paramT = i / steps
        try {
          const x = evalX(paramT) * 50 * scale + centerX
          const y = centerY - evalY(paramT) * 50 * scale

          if (firstPoint) {
            ctx.moveTo(x, y)
            firstPoint = false
          } else {
            ctx.lineTo(x, y)
          }
        } catch (error) {
          console.error("Error evaluating parametric equation:", error)
        }
      }

      ctx.stroke()

      // Draw the current point for animation
      try {
        const x = evalX(t) * 50 * scale + centerX
        const y = centerY - evalY(t) * 50 * scale

        ctx.fillStyle = graphObj.color
        ctx.beginPath()
        ctx.arc(x, y, 5, 0, Math.PI * 2)
        ctx.fill()
      } catch (error) {
        console.error("Error drawing animated point:", error)
      }
    } catch (error) {
      console.error("Error drawing parametric curve:", error)
    }
  }

  const drawPoint = (
    ctx: CanvasRenderingContext2D,
    graphObj: GraphObject,
    centerX: number,
    centerY: number,
    scale: number,
  ) => {
    try {
      // Parse the point coordinates
      const coords = graphObj.equation.replace(/[()]/g, "").split(",")
      if (coords.length !== 2) return

      const x = Number.parseFloat(coords[0]) * 50 * scale + centerX
      const y = centerY - Number.parseFloat(coords[1]) * 50 * scale

      ctx.fillStyle = graphObj.color
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.fill()

      // Add label
      ctx.fillStyle = "white"
      ctx.font = "12px sans-serif"
      ctx.fillText(`(${coords[0]}, ${coords[1]})`, x + 8, y - 8)
    } catch (error) {
      console.error("Error drawing point:", error)
    }
  }

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (tool === "pan") {
      setIsDragging(true)
      setDragStart({ x, y })
    } else if (tool === "select") {
      // Handle selection logic here
    }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || tool !== "pan") return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const dx = x - dragStart.x
    const dy = y - dragStart.y

    setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }))
    setDragStart({ x, y })
  }

  const handleCanvasMouseUp = () => {
    setIsDragging(false)
  }

  const handleCanvasWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -5 : 5
    setZoom((prev) => Math.max(10, Math.min(200, prev + delta)))
  }

  const handleAddEquation = () => {
    if (!newEquation.trim()) {
      toast({
        title: "Empty equation",
        description: "Please enter an equation to add",
        variant: "destructive",
      })
      return
    }

    // Determine equation type
    let type: "function" | "parametric" | "point" = "function"
    if (newEquation.includes("t")) {
      type = "parametric"
    } else if (newEquation.match(/^\s*$$\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*$$\s*$/)) {
      type = "point"
    }

    // Format the equation if needed
    let formattedEquation = newEquation
    if (type === "function" && !newEquation.startsWith("y = ") && !newEquation.startsWith("f(x) = ")) {
      formattedEquation = `y = ${newEquation}`
    }

    const newGraphObject: GraphObject = {
      id: `eq-${Date.now()}`,
      type,
      equation: formattedEquation,
      color: colors[equations.length % colors.length],
      visible: true,
      thickness: 2,
    }

    setEquations((prev) => [...prev, newGraphObject])
    setNewEquation("")
    setSelectedEquation(newGraphObject.id)

    toast({
      title: "Equation added",
      description: `Added ${type} equation to the graph`,
    })
  }

  const handleRemoveEquation = (id: string) => {
    setEquations((prev) => prev.filter((eq) => eq.id !== id))
    if (selectedEquation === id) {
      setSelectedEquation(null)
    }
  }

  const handleToggleVisibility = (id: string) => {
    setEquations((prev) => prev.map((eq) => (eq.id === id ? { ...eq, visible: !eq.visible } : eq)))
  }

  const handleChangeColor = (id: string, color: string) => {
    setEquations((prev) => prev.map((eq) => (eq.id === id ? { ...eq, color } : eq)))
  }

  const handleChangeThickness = (id: string, thickness: number) => {
    setEquations((prev) => prev.map((eq) => (eq.id === id ? { ...eq, thickness } : eq)))
  }

  const handleResetView = () => {
    setPan({ x: 0, y: 0 })
    setZoom(50)
  }

  const handleToggleAnimation = () => {
    setIsAnimating((prev) => !prev)
  }

  const handleToggleGrid = () => {
    setShowGrid((prev) => !prev)
  }

  return (
    <div className="space-y-6">
      <Card className="border border-white/10 bg-black/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Interactive Math Visualizer</CardTitle>
          <CardDescription className="text-gray-400">
            Plot and explore mathematical functions and parametric equations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="w-full h-[400px] bg-black/40 border border-white/10 rounded-lg cursor-crosshair"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              onWheel={handleCanvasWheel}
            />
            <div className="absolute top-4 right-4 flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                className={`text-white border-white/20 hover:bg-white/10 h-8 w-8 p-0 ${
                  tool === "select" ? "bg-white/20" : ""
                }`}
                onClick={() => setTool("select")}
                title="Select Tool"
              >
                <MousePointer className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className={`text-white border-white/20 hover:bg-white/10 h-8 w-8 p-0 ${
                  tool === "pan" ? "bg-white/20" : ""
                }`}
                onClick={() => setTool("pan")}
                title="Pan Tool"
              >
                <Move className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className={`text-white border-white/20 hover:bg-white/10 h-8 w-8 p-0 ${showGrid ? "bg-white/20" : ""}`}
                onClick={handleToggleGrid}
                title="Toggle Grid"
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
            <div className="absolute bottom-4 right-4 flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                className="text-white border-white/20 hover:bg-white/10 h-8 w-8 p-0"
                onClick={() => setZoom((prev) => Math.min(200, prev + 10))}
                title="Zoom In"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-white border-white/20 hover:bg-white/10 h-8 w-8 p-0"
                onClick={() => setZoom((prev) => Math.max(10, prev - 10))}
                title="Zoom Out"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-white border-white/20 hover:bg-white/10 h-8 w-8 p-0"
                onClick={handleResetView}
                title="Reset View"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className={`text-white border-white/20 hover:bg-white/10 h-8 w-8 p-0 ${
                  isAnimating ? "bg-white/20" : ""
                }`}
                onClick={handleToggleAnimation}
                title="Toggle Animation"
              >
                {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-equation" className="text-gray-300">
                  Add New Equation
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id="new-equation"
                    value={newEquation}
                    onChange={(e) => setNewEquation(e.target.value)}
                    placeholder="e.g., x^2 or sin(x)"
                    className="bg-white/5 border-white/10 text-white"
                  />
                  <Button onClick={handleAddEquation} className="bg-purple-600 hover:bg-purple-700 text-white">
                    Add
                  </Button>
                </div>
                <p className="text-xs text-gray-500">Examples: x^2, sin(x), (1,2), x(t) = cos(t), y(t) = sin(t)</p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Equations</Label>
                <div className="bg-black/40 border border-white/10 rounded-lg p-2 max-h-[200px] overflow-y-auto">
                  {equations.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No equations added yet</p>
                  ) : (
                    <div className="space-y-2">
                      {equations.map((eq) => (
                        <div
                          key={eq.id}
                          className={`p-2 rounded-md cursor-pointer ${
                            selectedEquation === eq.id ? "bg-white/10" : "hover:bg-white/5"
                          }`}
                          onClick={() => setSelectedEquation(eq.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: eq.color }}></div>
                              <span className={`text-sm ${eq.visible ? "text-white" : "text-gray-500 line-through"}`}>
                                {eq.equation.length > 20 ? eq.equation.substring(0, 20) + "..." : eq.equation}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-white/10"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveEquation(eq.id)
                              }}
                            >
                              &times;
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              {selectedEquation && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Equation Properties</h3>
                  {equations
                    .filter((eq) => eq.id === selectedEquation)
                    .map((eq) => (
                      <div key={eq.id} className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-gray-300">Equation</Label>
                          <Textarea
                            value={eq.equation}
                            readOnly
                            className="bg-white/5 border-white/10 text-white font-mono"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-gray-300">Visibility</Label>
                            <Button
                              variant="outline"
                              className={`w-full text-white border-white/20 hover:bg-white/10 ${
                                eq.visible ? "bg-white/10" : ""
                              }`}
                              onClick={() => handleToggleVisibility(eq.id)}
                            >
                              {eq.visible ? "Visible" : "Hidden"}
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-gray-300">Color</Label>
                            <div className="flex space-x-2">
                              {colors.map((color) => (
                                <button
                                  key={color}
                                  className={`w-6 h-6 rounded-full ${eq.color === color ? "ring-2 ring-white" : ""}`}
                                  style={{ backgroundColor: color }}
                                  onClick={() => handleChangeColor(eq.id, color)}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-gray-300">Line Thickness: {eq.thickness}</Label>
                          <Slider
                            value={[eq.thickness]}
                            min={1}
                            max={5}
                            step={0.5}
                            onValueChange={(value) => handleChangeThickness(eq.id, value[0])}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {!selectedEquation && (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">Select an equation to view and edit its properties</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
