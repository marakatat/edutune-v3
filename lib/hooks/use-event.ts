"use client"

import { useCallback, useRef } from "react"

// This is a stable alternative to the experimental useEffectEvent
export function useEvent<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef(callback)

  // Update ref.current value if callback changes
  callbackRef.current = callback

  // Return a memoized version of the callback that always calls the latest version
  return useCallback(((...args) => callbackRef.current(...args)) as T, [])
}
