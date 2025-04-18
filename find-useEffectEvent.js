const fs = require("fs")
const path = require("path")

// Function to search for useEffectEvent in a file
function searchInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8")
    const lines = content.split("\n")

    let hasUseEffectEvent = false
    const matches = []

    lines.forEach((line, index) => {
      if (line.includes("useEffectEvent")) {
        hasUseEffectEvent = true
        matches.push({
          line: index + 1,
          content: line.trim(),
        })
      }
    })

    if (hasUseEffectEvent) {
      return {
        file: filePath,
        matches,
      }
    }

    return null
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message)
    return null
  }
}

// Function to recursively search directories
function searchDirectory(dir, results = []) {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory() && !file.startsWith("node_modules") && !file.startsWith(".")) {
      searchDirectory(filePath, results)
    } else if (
      stat.isFile() &&
      (file.endsWith(".js") || file.endsWith(".jsx") || file.endsWith(".ts") || file.endsWith(".tsx"))
    ) {
      const result = searchInFile(filePath)
      if (result) {
        results.push(result)
      }
    }
  }

  return results
}

// Start the search from the current directory
const results = searchDirectory(".")

if (results.length === 0) {
  console.log("No instances of useEffectEvent found.")
} else {
  console.log(`Found ${results.length} files containing useEffectEvent:`)
  results.forEach((result) => {
    console.log(`\nFile: ${result.file}`)
    result.matches.forEach((match) => {
      console.log(`  Line ${match.line}: ${match.content}`)
    })
  })
}
