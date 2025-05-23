"use client"

import type * as React from "react"
import { cn } from "@/src/lib/utils"

interface ToggleSwitchProps extends React.HTMLAttributes<HTMLDivElement> {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  leftLabel?: string
  rightLabel?: string
}

export function ToggleSwitch({
  checked,
  onCheckedChange,
  leftLabel,
  rightLabel,
  className,
  ...props
}: ToggleSwitchProps) {
  return (
    <div className={cn("flex items-center space-x-2", className)} {...props}>
      {leftLabel && (
        <span className={cn("text-sm font-medium transition-colors", !checked ? "text-white" : "text-gray-500")}>
          {leftLabel}
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          checked ? "bg-purple-600" : "bg-gray-600",
        )}
        onClick={() => onCheckedChange(!checked)}
      >
        <span
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
            checked ? "translate-x-5" : "translate-x-1",
          )}
        />
      </button>
      {rightLabel && (
        <span className={cn("text-sm font-medium transition-colors", checked ? "text-white" : "text-gray-500")}>
          {rightLabel}
        </span>
      )}
    </div>
  )
}
