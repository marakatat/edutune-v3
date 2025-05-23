"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/src/components/ui/input"

interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function PhoneInput({ value, onChange, ...props }: PhoneInputProps) {
  const [formattedValue, setFormattedValue] = useState("")

  // Format phone number as (XXX) XXX-XXXX
  useEffect(() => {
    const formatPhoneNumber = (phoneNumber: string) => {
      // Remove all non-digit characters
      const digitsOnly = phoneNumber.replace(/\D/g, "")

      // Format the phone number
      let formatted = ""
      if (digitsOnly.length > 0) {
        formatted += digitsOnly.substring(0, 3)
        if (digitsOnly.length > 3) {
          formatted = `(${formatted}) ${digitsOnly.substring(3, 6)}`
          if (digitsOnly.length > 6) {
            formatted += `-${digitsOnly.substring(6, 10)}`
          }
        }
      }

      return formatted
    }

    setFormattedValue(formatPhoneNumber(value))
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow the parent component to get the raw input
    onChange(e)
  }

  return <Input type="tel" value={formattedValue} onChange={handleInputChange} {...props} />
}
