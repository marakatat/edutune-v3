"use client"

import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { toast } from "@/components/ui/use-toast"

export function NotificationHandler() {
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if there's a notAllowed parameter
    const notAllowed = searchParams.get("notAllowed")
    if (notAllowed === "table") {
      toast({
        title: "Access Denied",
        description: "Sorry! Not Allowed",
        variant: "destructive",
      })
    }
  }, [searchParams])

  // This component doesn't render anything
  return null
}
