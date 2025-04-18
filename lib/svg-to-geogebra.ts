// Parse SVG path and convert to GeoGebra commands
// Based on the provided Python code logic

type Point = [number, number]
type LineSegment = ["L", Point, Point]
type QuadraticSegment = ["Q", Point, Point, Point]
type CubicSegment = ["C", Point, Point, Point, Point]
type PathSegment = LineSegment | QuadraticSegment | CubicSegment

export function parseSvgPath(d: string): PathSegment[] {
  // Regular expression to match commands and numbers
  const tokenRegex = /([MmLlQqCcHhVvZz])|(-?\d*\.?\d+)/g
  const tokens: [string, string][] = []
  let match: RegExpExecArray | null

  // Extract all tokens
  while ((match = tokenRegex.exec(d)) !== null) {
    const command = match[1] || ""
    const number = match[2] || ""
    tokens.push([command, number])
  }

  const segments: PathSegment[] = []
  let current: [number, number] = [0, 0]
  let startPoint: [number, number] | null = null
  let cmd: string | null = null
  let i = 0

  while (i < tokens.length) {
    if (tokens[i][0]) {
      cmd = tokens[i][0]
      i++
      if ((cmd === "Z" || cmd === "z") && startPoint) {
        segments.push(["L", [...current] as Point, [...startPoint] as Point])
        current = [...startPoint]
      }
      continue
    }

    if (!cmd) {
      i++
      continue
    }

    switch (cmd) {
      case "M": {
        const x = Number.parseFloat(tokens[i][1])
        const y = Number.parseFloat(tokens[i + 1][1])
        current = [x, y]
        startPoint = [...current]
        i += 2
        break
      }
      case "m": {
        const x = current[0] + Number.parseFloat(tokens[i][1])
        const y = current[1] + Number.parseFloat(tokens[i + 1][1])
        current = [x, y]
        startPoint = [...current]
        i += 2
        break
      }
      case "L": {
        const x = Number.parseFloat(tokens[i][1])
        const y = Number.parseFloat(tokens[i + 1][1])
        const prev = [...current] as Point
        current = [x, y]
        segments.push(["L", prev, [...current] as Point])
        i += 2
        break
      }
      case "l": {
        const x = current[0] + Number.parseFloat(tokens[i][1])
        const y = current[1] + Number.parseFloat(tokens[i + 1][1])
        const prev = [...current] as Point
        current = [x, y]
        segments.push(["L", prev, [...current] as Point])
        i += 2
        break
      }
      case "H": {
        const x = Number.parseFloat(tokens[i][1])
        const prev = [...current] as Point
        current[0] = x
        segments.push(["L", prev, [...current] as Point])
        i += 1
        break
      }
      case "h": {
        const x = current[0] + Number.parseFloat(tokens[i][1])
        const prev = [...current] as Point
        current[0] = x
        segments.push(["L", prev, [...current] as Point])
        i += 1
        break
      }
      case "V": {
        const y = Number.parseFloat(tokens[i][1])
        const prev = [...current] as Point
        current[1] = y
        segments.push(["L", prev, [...current] as Point])
        i += 1
        break
      }
      case "v": {
        const y = current[1] + Number.parseFloat(tokens[i][1])
        const prev = [...current] as Point
        current[1] = y
        segments.push(["L", prev, [...current] as Point])
        i += 1
        break
      }
      case "Q": {
        const x1 = Number.parseFloat(tokens[i][1])
        const y1 = Number.parseFloat(tokens[i + 1][1])
        const x = Number.parseFloat(tokens[i + 2][1])
        const y = Number.parseFloat(tokens[i + 3][1])
        const p0 = [...current] as Point
        const p1: Point = [x1, y1]
        const p2: Point = [x, y]
        segments.push(["Q", p0, p1, p2])
        current = [x, y]
        i += 4
        break
      }
      case "q": {
        const x1 = current[0] + Number.parseFloat(tokens[i][1])
        const y1 = current[1] + Number.parseFloat(tokens[i + 1][1])
        const x = current[0] + Number.parseFloat(tokens[i + 2][1])
        const y = current[1] + Number.parseFloat(tokens[i + 3][1])
        const p0 = [...current] as Point
        const p1: Point = [x1, y1]
        const p2: Point = [x, y]
        segments.push(["Q", p0, p1, p2])
        current = [x, y]
        i += 4
        break
      }
      case "C": {
        const x1 = Number.parseFloat(tokens[i][1])
        const y1 = Number.parseFloat(tokens[i + 1][1])
        const x2 = Number.parseFloat(tokens[i + 2][1])
        const y2 = Number.parseFloat(tokens[i + 3][1])
        const x = Number.parseFloat(tokens[i + 4][1])
        const y = Number.parseFloat(tokens[i + 5][1])
        const p0 = [...current] as Point
        const p1: Point = [x1, y1]
        const p2: Point = [x2, y2]
        const p3: Point = [x, y]
        segments.push(["C", p0, p1, p2, p3])
        current = [x, y]
        i += 6
        break
      }
      case "c": {
        const x1 = current[0] + Number.parseFloat(tokens[i][1])
        const y1 = current[1] + Number.parseFloat(tokens[i + 1][1])
        const x2 = current[0] + Number.parseFloat(tokens[i + 2][1])
        const y2 = current[1] + Number.parseFloat(tokens[i + 3][1])
        const x = current[0] + Number.parseFloat(tokens[i + 4][1])
        const y = current[1] + Number.parseFloat(tokens[i + 5][1])
        const p0 = [...current] as Point
        const p1: Point = [x1, y1]
        const p2: Point = [x2, y2]
        const p3: Point = [x, y]
        segments.push(["C", p0, p1, p2, p3])
        current = [x, y]
        i += 6
        break
      }
      default:
        i++
        break
    }
  }

  return segments
}

export function segmentToGeogebraCommand(segment: PathSegment, idx: number): string {
  if (segment[0] === "L") {
    const [[x0, y0], [x1, y1]] = [segment[1], segment[2]]
    return `Segment((${x0}, ${y0}), (${x1}, ${y1}))`
  } else if (segment[0] === "Q") {
    const [[x0, y0], [x1, y1], [x2, y2]] = [segment[1], segment[2], segment[3]]
    return `Curve[(1-t)^2*${x0} + 2*(1-t)*t*${x1} + t^2*${x2}, (1-t)^2*${y0} + 2*(1-t)*t*${y1} + t^2*${y2}, t, 0, 1]`
  } else if (segment[0] === "C") {
    const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = [segment[1], segment[2], segment[3], segment[4]]
    return `Curve[(1-t)^3*${x0} + 3*(1-t)^2*t*${x1} + 3*(1-t)*t^2*${x2} + t^3*${x3}, (1-t)^3*${y0} + 3*(1-t)^2*t*${y1} + 3*(1-t)*t^2*${y2} + t^3*${y3}, t, 0, 1]`
  }
  return "# Unsupported segment"
}

export function svgToGeogebraCommands(svgContent: string): string[] {
  const parser = new DOMParser()
  const svgDoc = parser.parseFromString(svgContent, "image/svg+xml")
  const paths = svgDoc.querySelectorAll("path")

  const commands: string[] = []

  paths.forEach((path, pathIndex) => {
    const d = path.getAttribute("d")
    if (d) {
      const segments = parseSvgPath(d)
      segments.forEach((segment, segmentIndex) => {
        const cmd = segmentToGeogebraCommand(segment, segmentIndex + 1)
        commands.push(cmd)
      })
    }
  })

  return commands
}
