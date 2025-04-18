"use client"

import { cn } from "@/lib/utils"
import styles from "./time-picker.module.css"

interface TimePickerProps {
  selected: string | undefined
  onSelect: (time: string) => void
}

export function TimePicker({ selected, onSelect }: TimePickerProps) {
  // Generate time slots from 9 AM to 7 PM with 30-minute intervals
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour <= 19; hour++) {
      const hourFormatted = hour % 12 === 0 ? 12 : hour % 12
      const period = hour < 12 ? "AM" : "PM"

      slots.push(`${hourFormatted}:00 ${period}`)
      if (hour < 19) {
        slots.push(`${hourFormatted}:30 ${period}`)
      }
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  return (
    <div className={cn("bg-black/40 border border-white/10 rounded-lg p-4 h-[350px]", styles.customScrollbar)}>
      <div className="grid grid-cols-2 gap-2">
        {timeSlots.map((time) => (
          <div
            key={time}
            className={cn(
              "py-3 px-4 rounded-md text-center cursor-pointer transition-colors",
              selected === time ? "bg-purple-600 text-white" : "bg-white/5 text-white hover:bg-white/10",
            )}
            onClick={() => onSelect(time)}
          >
            {time}
          </div>
        ))}
      </div>
    </div>
  )
}
