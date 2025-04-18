// GeoGebra command parser
// This utility parses GeoGebra-style commands and converts them to our internal format

type MathObject = {
  id: string
  type: "function" | "parametric" | "point" | "segment" | "circle"
  equation: string
  label?: string
  color?: string
}

export function parseGeogebraCommand(command: string): MathObject | null {
  // Trim whitespace and remove any trailing semicolons
  command = command.trim().replace(/;$/, "")

  if (!command) return null

  // Extract label if present (format: label: command)
  let label = ""
  const labelMatch = command.match(/^([A-Za-z0-9]+)\s*:\s*(.+)$/)
  if (labelMatch) {
    label = labelMatch[1]
    command = labelMatch[2]
  }

  // Parse different command types
  if (command.startsWith("f(x) =") || command.startsWith("y =")) {
    // Function
    return {
      id: `func-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type: "function",
      equation: command,
      label,
    }
  } else if (command.startsWith("Curve[")) {
    // Parametric curve
    return parseParametricCurve(command, label)
  } else if (command.match(/^$$.*$$$/)) {
    // Point
    return parsePoint(command, label)
  } else if (command.startsWith("Segment[")) {
    // Line segment
    return parseSegment(command, label)
  } else if (command.startsWith("Circle[")) {
    // Circle
    return parseCircle(command, label)
  }

  return null
}

function parseParametricCurve(command: string, label: string): MathObject | null {
  // Extract the curve definition: Curve[x(t), y(t), t, start, end]
  const curveMatch = command.match(/Curve\[(.*?),\s*(.*?),\s*t,\s*(.*?),\s*(.*?)\]/)
  if (!curveMatch) return null

  const xExpr = curveMatch[1]
  const yExpr = curveMatch[2]

  // Convert to our parametric format
  return {
    id: `param-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    type: "parametric",
    equation: `x(t) = ${xExpr}\ny(t) = ${yExpr}\nfor t ∈ [${curveMatch[3]}, ${curveMatch[4]}]`,
    label,
  }
}

function parsePoint(command: string, label: string): MathObject | null {
  // Extract coordinates: (x, y)
  const pointMatch = command.match(/$$\s*([-+]?\d*\.?\d+)\s*,\s*([-+]?\d*\.?\d+)\s*$$/)
  if (!pointMatch) return null

  return {
    id: `point-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    type: "point",
    equation: `(${pointMatch[1]}, ${pointMatch[2]})`,
    label,
  }
}

function parseSegment(command: string, label: string): MathObject | null {
  // Extract points: Segment[(x1, y1), (x2, y2)]
  const segmentMatch = command.match(
    /Segment\[\s*$$\s*([-+]?\d*\.?\d+)\s*,\s*([-+]?\d*\.?\d+)\s*$$\s*,\s*$$\s*([-+]?\d*\.?\d+)\s*,\s*([-+]?\d*\.?\d+)\s*$$\s*\]/,
  )
  if (!segmentMatch) return null

  // Convert to parametric equation for a line segment
  const x1 = Number.parseFloat(segmentMatch[1])
  const y1 = Number.parseFloat(segmentMatch[2])
  const x2 = Number.parseFloat(segmentMatch[3])
  const y2 = Number.parseFloat(segmentMatch[4])

  return {
    id: `segment-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    type: "parametric",
    equation: `x(t) = ${x1} * (1-t) + ${x2} * t\ny(t) = ${y1} * (1-t) + ${y2} * t\nfor t ∈ [0, 1]`,
    label,
  }
}

function parseCircle(command: string, label: string): MathObject | null {
  // Extract center and radius: Circle[(x, y), r]
  const circleMatch = command.match(
    /Circle\[\s*$$\s*([-+]?\d*\.?\d+)\s*,\s*([-+]?\d*\.?\d+)\s*$$\s*,\s*([-+]?\d*\.?\d+)\s*\]/,
  )
  if (!circleMatch) return null

  // Convert to parametric equation for a circle
  const centerX = Number.parseFloat(circleMatch[1])
  const centerY = Number.parseFloat(circleMatch[2])
  const radius = Number.parseFloat(circleMatch[3])

  return {
    id: `circle-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    type: "parametric",
    equation: `x(t) = ${centerX} + ${radius} * cos(t)\ny(t) = ${centerY} + ${radius} * sin(t)\nfor t ∈ [0, 2*pi]`,
    label,
  }
}

// Convert a math object to a graph object for the visualizer
export function mathObjectToGraphObject(mathObj: MathObject, colorIndex = 0): any {
  const colors = [
    "#8b5cf6", // Purple
    "#ec4899", // Pink
    "#3b82f6", // Blue
    "#10b981", // Green
    "#f59e0b", // Amber
    "#ef4444", // Red
  ]

  return {
    id: mathObj.id,
    type: mathObj.type === "segment" || mathObj.type === "circle" ? "parametric" : mathObj.type,
    equation: mathObj.equation,
    color: mathObj.color || colors[colorIndex % colors.length],
    visible: true,
    thickness: 2,
    label: mathObj.label || "",
  }
}

// Parse multiple GeoGebra commands
export function parseGeogebraCommands(commandsText: string): MathObject[] {
  const commands = commandsText.split(/[\n;]/).filter((cmd) => cmd.trim() !== "")
  const results: MathObject[] = []

  for (const cmd of commands) {
    const result = parseGeogebraCommand(cmd)
    if (result) {
      results.push(result)
    }
  }

  return results
}
