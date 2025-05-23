"use client"

import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { toast } from "@/src/components/ui/use-toast"

export function NotificationHandler() {
  const searchParams = useSearchParams()

  // If there's a useEffectEvent here, replace it with useEvent
  // For example:
  // const showToast = useEvent((message: string) => {
  //   toast({
  //     title: "Notification",
  //     description: message,
  //   })
  // })

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
