"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Upload, Copy, Download, Check, Info } from "lucide-react"
import Navbar from "@/src/components/navbar"
import { SparklesCore } from "@/src/components/sparkles"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { toast } from "@/src/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { MathVisualizer } from "@/components/math-visualizer"
import { GeogebraInterface } from "@/components/geogebra-interface"
import { Textarea } from "@/src/components/ui/textarea"
import { Label } from "@/src/components/ui/label"
import { ToggleSwitch } from "@/src/components/ui/toggle-switch"
import { svgToGeogebraCommands } from "@/lib/svg-to-geogebra"
import { parseGeogebraCommands, mathObjectToGraphObject } from "@/lib/geogebra-parser"

export default function MathPage() {
  const [svgContent, setSvgContent] = useState<string>("")
  const [equations, setEquations] = useState<string[]>([])
  const [geogebraCommands, setGeogebraCommands] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<string>("upload")
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [isCopied, setIsCopied] = useState<boolean>(false)
  const [isCommandsCopied, setIsCommandsCopied] = useState<boolean>(false)
  const [parseMode, setParseMode] = useState<"legit" | "commands">("legit")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [visualizerObjects, setVisualizerObjects] = useState<any[]>([])
  const [activeSection, setActiveSection] = useState<"svg" | "geogebra" | "visualizer">("svg")
  const [geogebraCommandsInput, setGeogebraCommandsInput] = useState<string>("")

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== "image/svg+xml") {
      toast({
        title: "Invalid file type",
        description: "Please upload an SVG file",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setSvgContent(content)
      processSvg(content)
    }
    reader.readAsText(file)
  }

  const handleSvgInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSvgContent(e.target.value)
  }

  const processSvg = async (content: string) => {
    setIsProcessing(true)
    try {
      if (parseMode === "legit") {
        // Extract paths from SVG content
        const pathRegex = /<path[^>]*d="([^"]*)"[^>]*>/g
        const paths: string[] = []
        let match

        while ((match = pathRegex.exec(content)) !== null) {
          paths.push(match[1])
        }

        if (paths.length === 0) {
          toast({
            title: "No paths found",
            description: "The SVG file doesn't contain any path elements",
            variant: "destructive",
          })
          setIsProcessing(false)
          return
        }

        // Convert paths to equations
        const convertedEquations = await Promise.all(
          paths.map(async (path) => {
            return await convertPathToEquation(path)
          }),
        )

        setEquations(convertedEquations)
        setActiveTab("equations")
      } else {
        // Parse SVG to GeoGebra commands
        const commands = svgToGeogebraCommands(content)

        if (commands.length === 0) {
          toast({
            title: "No paths found",
            description: "The SVG file doesn't contain any path elements",
            variant: "destructive",
          })
          setIsProcessing(false)
          return
        }

        setGeogebraCommands(commands)
        setGeogebraCommandsInput(commands.join("\n"))
        setActiveTab("commands")

        // Automatically switch to GeoGebra interface with the commands
        setActiveSection("geogebra")

        toast({
          title: "Commands Generated",
          description: `${commands.length} GeoGebra commands generated and transferred to the GeoGebra interface`,
        })
      }
    } catch (error) {
      console.error("Error processing SVG:", error)
      toast({
        title: "Processing error",
        description: "Failed to process the SVG file",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const convertPathToEquation = async (path: string): Promise<string> => {
    // This is a simplified implementation
    // In a real application, you would use a library like svg-equations
    // or implement the full conversion logic

    // Parse the path commands
    const commands = parseSvgPath(path)

    // Convert to parametric equations
    // This is a placeholder - actual implementation would be more complex
    let xEquation = "x(t) = "
    let yEquation = "y(t) = "

    if (commands.length > 0) {
      // Simple example for demonstration
      xEquation += commands.map((cmd, i) => `${cmd.x} * (1-t)^${commands.length - i - 1} * t^${i}`).join(" + ")

      yEquation += commands.map((cmd, i) => `${cmd.y} * (1-t)^${commands.length - i - 1} * t^${i}`).join(" + ")
    } else {
      xEquation += "0"
      yEquation += "0"
    }

    return `${xEquation}\n${yEquation}\nfor t ∈ [0, 1]`
  }

  const parseSvgPath = (path: string): { x: number; y: number }[] => {
    // This is a simplified parser for demonstration
    // A real implementation would handle all SVG path commands
    const points: { x: number; y: number }[] = []

    // Extract coordinates from the path
    // This regex looks for M, L, C, etc. commands followed by coordinates
    const regex = /([MLHVCSQTAZmlhvcsqtaz])([^MLHVCSQTAZmlhvcsqtaz]*)/g
    let match
    let currentX = 0
    let currentY = 0

    while ((match = regex.exec(path)) !== null) {
      const command = match[1]
      const params = match[2]
        .trim()
        .split(/[\s,]+/)
        .map(Number.parseFloat)

      switch (command) {
        case "M": // Move to (absolute)
          currentX = params[0]
          currentY = params[1]
          points.push({ x: currentX, y: currentY })
          break
        case "L": // Line to (absolute)
          currentX = params[0]
          currentY = params[1]
          points.push({ x: currentX, y: currentY })
          break
        // Add more cases for other commands as needed
      }
    }

    return points
  }

  const handleProcessClick = () => {
    if (!svgContent.trim()) {
      toast({
        title: "Empty input",
        description: "Please enter SVG content",
        variant: "destructive",
      })
      return
    }
    processSvg(svgContent)
  }

  const handleCopyEquations = () => {
    navigator.clipboard.writeText(equations.join("\n\n"))
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
    toast({
      title: "Copied!",
      description: "Equations copied to clipboard",
    })
  }

  const handleCopyCommands = () => {
    navigator.clipboard.writeText(geogebraCommands.join("\n"))
    setIsCommandsCopied(true)
    setTimeout(() => setIsCommandsCopied(false), 2000)
    toast({
      title: "Copied!",
      description: "GeoGebra commands copied to clipboard",
    })
  }

  const handleDownloadEquations = () => {
    const blob = new Blob([equations.join("\n\n")], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "equations.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({
      title: "Downloaded!",
      description: "Equations saved to file",
    })
  }

  const handleDownloadCommands = () => {
    const blob = new Blob([geogebraCommands.join("\n")], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "geogebra_commands.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({
      title: "Downloaded!",
      description: "GeoGebra commands saved to file",
    })
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleParseModeChange = (checked: boolean) => {
    setParseMode(checked ? "commands" : "legit")
  }

  const handleImportToVisualizer = (graphObjects: any[]) => {
    setVisualizerObjects(graphObjects)
    setActiveSection("visualizer")
    toast({
      title: "Imported to Visualizer",
      description: `${graphObjects.length} objects imported to the math visualizer`,
    })
  }

  const handleImportCommandsToVisualizer = () => {
    try {
      // Parse the GeoGebra commands
      const mathObjects = parseGeogebraCommands(geogebraCommands.join("\n"))

      if (mathObjects.length === 0) {
        toast({
          title: "No valid commands",
          description: "Could not parse any valid GeoGebra commands",
          variant: "destructive",
        })
        return
      }

      // Convert to graph objects for the visualizer
      const graphObjects = mathObjects.map((obj, index) => mathObjectToGraphObject(obj, index))

      // Import to visualizer
      setVisualizerObjects(graphObjects)
      setActiveSection("visualizer")

      toast({
        title: "Imported to Visualizer",
        description: `${mathObjects.length} objects imported to the math visualizer`,
      })
    } catch (error) {
      console.error("Error importing commands to visualizer:", error)
      toast({
        title: "Import Error",
        description: "An error occurred while importing the commands to the visualizer",
        variant: "destructive",
      })
    }
  }

  return (
    <main className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative">
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

        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto"
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                  Mathematical Visualization Studio
                </span>
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Convert SVG to equations, use GeoGebra-style commands, and visualize mathematical objects
              </p>
            </div>

            {/* Section Navigation */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex bg-black/60 border border-white/10 rounded-lg p-1">
                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeSection === "svg" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
                  }`}
                  onClick={() => setActiveSection("svg")}
                >
                  SVG Converter
                </button>
                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeSection === "geogebra" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
                  }`}
                  onClick={() => setActiveSection("geogebra")}
                >
                  GeoGebra Interface
                </button>
                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeSection === "visualizer" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
                  }`}
                  onClick={() => setActiveSection("visualizer")}
                >
                  Math Visualizer
                </button>
              </div>
            </div>

            {/* SVG Converter Section */}
            {activeSection === "svg" && (
              <Card className="border border-white/10 bg-black/60 backdrop-blur-md mb-12">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl text-white">Convert SVG to Equations</CardTitle>
                      <CardDescription className="text-gray-400">
                        Upload an SVG file or paste SVG code to convert paths to mathematical equations
                      </CardDescription>
                    </div>
                    <ToggleSwitch
                      checked={parseMode === "commands"}
                      onCheckedChange={handleParseModeChange}
                      leftLabel="Legit"
                      rightLabel="Commands"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="bg-black/60 border border-white/10 mb-6">
                      <TabsTrigger value="upload">Upload SVG</TabsTrigger>
                      <TabsTrigger value="paste">Paste SVG</TabsTrigger>
                      <TabsTrigger value="equations" disabled={equations.length === 0}>
                        Equations
                      </TabsTrigger>
                      <TabsTrigger value="commands" disabled={geogebraCommands.length === 0}>
                        GeoGebra Commands
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upload">
                      <div className="flex flex-col items-center justify-center p-8 border border-dashed border-white/20 rounded-lg bg-white/5">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          accept=".svg"
                          className="hidden"
                        />
                        <Upload className="h-12 w-12 text-purple-400 mb-4" />
                        <h3 className="text-xl font-medium text-white mb-2">Upload SVG File</h3>
                        <p className="text-gray-400 text-center mb-6">
                          Drag and drop your SVG file here, or click to browse
                        </p>
                        <div className="flex flex-col items-center gap-4">
                          <Button onClick={handleUploadClick} className="bg-purple-600 hover:bg-purple-700 text-white">
                            Select File
                          </Button>
                          <ToggleSwitch
                            checked={parseMode === "commands"}
                            onCheckedChange={handleParseModeChange}
                            leftLabel="Legit"
                            rightLabel="Commands"
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="paste">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label htmlFor="svg-input" className="text-gray-300">
                              SVG Content
                            </Label>
                            <ToggleSwitch
                              checked={parseMode === "commands"}
                              onCheckedChange={handleParseModeChange}
                              leftLabel="Legit"
                              rightLabel="Commands"
                            />
                          </div>
                          <Textarea
                            id="svg-input"
                            value={svgContent}
                            onChange={handleSvgInputChange}
                            placeholder='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M10,10 L90,10 L90,90 L10,90 Z" /></svg>'
                            className="bg-white/5 border-white/10 text-white min-h-[200px] font-mono"
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button
                            onClick={handleProcessClick}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                            disabled={isProcessing}
                          >
                            {isProcessing
                              ? "Processing..."
                              : parseMode === "legit"
                                ? "Convert to Equations"
                                : "Generate GeoGebra Commands"}
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="equations">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-medium text-white">Generated Equations</h3>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-white border-white/20 hover:bg-white/10"
                              onClick={handleCopyEquations}
                            >
                              {isCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                              {isCopied ? "Copied" : "Copy All"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-white border-white/20 hover:bg-white/10"
                              onClick={handleDownloadEquations}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>

                        <div className="bg-black/40 border border-white/10 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                          {equations.map((equation, index) => (
                            <div key={index} className="mb-6 last:mb-0">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-purple-400 font-medium">Path {index + 1}</h4>
                              </div>
                              <pre className="text-white font-mono text-sm whitespace-pre-wrap bg-white/5 p-3 rounded">
                                {equation}
                              </pre>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="commands">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-medium text-white">GeoGebra Commands</h3>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-white border-white/20 hover:bg-white/10"
                              onClick={handleCopyCommands}
                            >
                              {isCommandsCopied ? (
                                <Check className="h-4 w-4 mr-2" />
                              ) : (
                                <Copy className="h-4 w-4 mr-2" />
                              )}
                              {isCommandsCopied ? "Copied" : "Copy All"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-white border-white/20 hover:bg-white/10"
                              onClick={handleDownloadCommands}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-white border-white/20 hover:bg-white/10"
                              onClick={handleImportCommandsToVisualizer}
                            >
                              Import to Visualizer
                            </Button>
                          </div>
                        </div>

                        <div className="bg-black/40 border border-white/10 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                          {geogebraCommands.map((command, index) => (
                            <div key={index} className="mb-2 last:mb-0">
                              <pre className="text-white font-mono text-sm whitespace-pre-wrap bg-white/5 p-3 rounded">
                                {command}
                              </pre>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="flex justify-between border-t border-white/10 pt-6">
                  <div className="flex items-center text-gray-400 text-sm">
                    <Info className="h-4 w-4 mr-2" />
                    Only SVG paths are supported. Other SVG elements will be ignored.
                  </div>
                </CardFooter>
              </Card>
            )}

            {/* GeoGebra Interface Section */}
            {activeSection === "geogebra" && (
              <GeogebraInterface
                onImportToVisualizer={handleImportToVisualizer}
                initialCommands={geogebraCommandsInput}
              />
            )}

            {/* Math Visualizer Section */}
            {activeSection === "visualizer" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                      Interactive Math Playground
                    </span>
                  </h2>
                  <p className="text-lg text-gray-400 max-w-3xl mx-auto">
                    Explore and visualize mathematical functions and equations in an interactive environment
                  </p>
                </div>

                <MathVisualizer initialEquations={equations} initialGraphObjects={visualizerObjects} />
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </main>
  )
}
