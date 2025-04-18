"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DayPickerProps {
  selected: Date | undefined
  onSelect: (date: Date) => void
}

export function DayPicker({ selected, onSelect }: DayPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Get the first day of the month
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)

  // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = firstDayOfMonth.getDay()

  // Get the number of days in the month
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()

  // Get the name of the month
  const monthName = currentMonth.toLocaleString("default", { month: "long" })

  // Generate an array of days for the current month
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // Generate empty cells for days before the first day of the month
  const emptyCells = Array.from({ length: firstDayOfWeek }, (_, i) => null)

  // Combine empty cells and days
  const calendarDays = [...emptyCells, ...days]

  // Go to previous month
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  // Go to next month
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  // Check if a date is selected
  const isSelected = (day: number) => {
    if (!selected) return false
    return (
      selected.getDate() === day &&
      selected.getMonth() === currentMonth.getMonth() &&
      selected.getFullYear() === currentMonth.getFullYear()
    )
  }

  // Check if a date is in the past
  const isPast = (day: number) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return date < today
  }

  // Handle day selection
  const handleSelect = (day: number) => {
    if (isPast(day)) return
    onSelect(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))
  }

  return (
    <div className="bg-black/40 border border-white/10 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={prevMonth} className="text-white hover:bg-white/10">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h3 className="text-white font-medium">
          {monthName} {currentMonth.getFullYear()}
        </h3>
        <Button variant="ghost" size="icon" onClick={nextMonth} className="text-white hover:bg-white/10">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="text-center text-gray-400 text-sm py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={cn(
              "h-10 flex items-center justify-center rounded-md text-sm",
              day === null ? "invisible" : "visible",
              isPast(day as number)
                ? "text-gray-600 cursor-not-allowed"
                : "text-white cursor-pointer hover:bg-white/10",
              isSelected(day as number) && "bg-purple-600 hover:bg-purple-700",
            )}
            onClick={() => day !== null && !isPast(day) && handleSelect(day)}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  )
}
