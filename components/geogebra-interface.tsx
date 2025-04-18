"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Play, Trash, Copy, Download, HelpCircle } from "lucide-react"
import { parseGeogebraCommands, mathObjectToGraphObject } from "@/lib/geogebra-parser"

interface GeogebraInterfaceProps {
  onImportToVisualizer: (graphObjects: any[]) => void
  initialCommands?: string
}

export function GeogebraInterface({ onImportToVisualizer, initialCommands = "" }: GeogebraInterfaceProps) {
  const [commands, setCommands] = useState<string>("")
  const [history, setHistory] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Process initial commands when they change
  useEffect(() => {
    if (initialCommands && initialCommands !== commands) {
      setCommands(initialCommands)

      // Auto-execute the commands if they're new
      if (initialCommands.trim()) {
        executeCommands(initialCommands)
      }
    }
  }, [initialCommands])

  const handleCommandChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommands(e.target.value)
  }

  const executeCommands = (commandsToExecute: string) => {
    if (!commandsToExecute.trim()) {
      toast({
        title: "Empty command",
        description: "Please enter a GeoGebra command",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    try {
      // Parse the commands
      const mathObjects = parseGeogebraCommands(commandsToExecute)

      if (mathObjects.length === 0) {
        toast({
          title: "Invalid command",
          description: "Could not parse any valid GeoGebra commands",
          variant: "destructive",
        })
        setIsProcessing(false)
        return
      }

      // Convert to graph objects for the visualizer
      const graphObjects = mathObjects.map((obj, index) => mathObjectToGraphObject(obj, index))

      // Import to visualizer
      onImportToVisualizer(graphObjects)

      // Add to history
      setHistory((prev) => [...prev, commandsToExecute])

      // Clear command input
      setCommands("")

      toast({
        title: "Commands executed",
        description: `Successfully processed ${mathObjects.length} command(s)`,
      })
    } catch (error) {
      console.error("Error executing commands:", error)
      toast({
        title: "Execution error",
        description: "An error occurred while executing the commands",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExecute = () => {
    executeCommands(commands)
  }

  const handleClearHistory = () => {
    setHistory([])
    toast({
      title: "History cleared",
      description: "Command history has been cleared",
    })
  }

  const handleCopyHistory = () => {
    navigator.clipboard.writeText(history.join("\n"))
    toast({
      title: "Copied",
      description: "Command history copied to clipboard",
    })
  }

  const handleDownloadHistory = () => {
    const blob = new Blob([history.join("\n")], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "geogebra_commands.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({
      title: "Downloaded",
      description: "Command history saved to file",
    })
  }

  const handleShowHelp = () => {
    toast({
      title: "GeoGebra Commands Help",
      description:
        "Supported commands: f(x) = ..., y = ..., (x,y), Segment[(x1,y1), (x2,y2)], Circle[(x,y), r], Curve[x(t), y(t), t, start, end]",
    })
  }

  return (
    <Card className="border border-white/10 bg-black/60 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-2xl text-white">GeoGebra Command Interface</CardTitle>
        <CardDescription className="text-gray-400">
          Enter GeoGebra-style commands to create mathematical objects
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="command-input" className="text-gray-300">
              Command Input
            </Label>
            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white" onClick={handleShowHelp}>
              <HelpCircle className="h-4 w-4 mr-1" />
              Help
            </Button>
          </div>
          <Textarea
            id="command-input"
            ref={textareaRef}
            value={commands}
            onChange={handleCommandChange}
            placeholder="Enter GeoGebra commands (e.g., f(x) = x^2, Circle[(0,0), 5])"
            className="bg-white/5 border-white/10 text-white font-mono min-h-[100px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) {
                e.preventDefault()
                handleExecute()
              }
            }}
          />
          <p className="text-xs text-gray-500">Press Ctrl+Enter to execute or click the Execute button</p>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleExecute}
            className="bg-purple-600 hover:bg-purple-700 text-white"
            disabled={isProcessing}
          >
            <Play className="h-4 w-4 mr-2" />
            {isProcessing ? "Executing..." : "Execute"}
          </Button>
        </div>

        {history.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-gray-300">Command History</Label>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-white border-white/20 hover:bg-white/10"
                  onClick={handleCopyHistory}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-white border-white/20 hover:bg-white/10"
                  onClick={handleDownloadHistory}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-white border-white/20 hover:bg-white/10"
                  onClick={handleClearHistory}
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
            <div className="bg-black/40 border border-white/10 rounded-lg p-4 max-h-[200px] overflow-y-auto">
              {history.map((cmd, index) => (
                <div key={index} className="mb-2 last:mb-0">
                  <pre className="text-white font-mono text-sm whitespace-pre-wrap bg-white/5 p-2 rounded">{cmd}</pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t border-white/10 pt-4">
        <div className="text-xs text-gray-500">
          Examples: f(x) = x^2 + 3x - 2, (3,4), Segment[(0,0), (5,5)], Circle[(2,3), 4], Curve[cos(t), sin(t), t, 0,
          2*pi]
        </div>
      </CardFooter>
    </Card>
  )
}
