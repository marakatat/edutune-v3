"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronDown, Calendar, Clock, Scissors, User, Phone } from "lucide-react"
import Navbar from "@/components/navbar"
import { SparklesCore } from "@/components/sparkles"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { DayPicker } from "@/components/day-picker"
import { TimePicker } from "@/components/time-picker"
import { useAuth } from "@/contexts/auth-context"

export default function BarberPage() {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined)
  const [guestInfo, setGuestInfo] = useState({
    name: "",
    phone: "",
  })
  const scheduleRef = useRef<HTMLDivElement>(null)
  const [isScrolled, setIsScrolled] = useState(false)

  const handleArrowClick = () => {
    scheduleRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleGuestInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setGuestInfo((prev) => ({ ...prev, [name]: value }))
  }

  const validatePhoneNumber = (phone: string) => {
    // Basic validation for phone number (at least 10 digits)
    const digitsOnly = phone.replace(/\D/g, "")
    return digitsOnly.length >= 10
  }

  const handleSchedule = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Lorem Ipsum",
        description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco.",
        variant: "destructive",
      })
      return
    }

    // If user is not logged in, validate guest info
    if (!user) {
      if (!guestInfo.name.trim()) {
        toast({
          title: "Lorem Ipsum",
          description: "Duis aute irure dolor in reprehenderit in voluptate velit.",
          variant: "destructive",
        })
        return
      }

      if (!validatePhoneNumber(guestInfo.phone)) {
        toast({
          title: "Lorem Ipsum",
          description: "Excepteur sint occaecat cupidatat non proident.",
          variant: "destructive",
        })
        return
      }
    }

    // Format the date and time for display
    const formattedDate = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const customerName = user ? user.name : guestInfo.name

    toast({
      title: "Lorem Ipsum",
      description: `${customerName}, consectetur adipiscing elit ${formattedDate} at ${selectedTime}.${
        !user ? ` Sed do eiusmod tempor incididunt ${guestInfo.phone}.` : ""
      }`,
    })
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <main className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative">
      {/* Ambient background with moving particles */}
      <div className="h-full w-full absolute inset-0 z-0 pointer-events-none">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
      </div>

      <div className="relative z-10">
        <Navbar />

        {/* Hero Section */}
        <div className="min-h-[calc(100vh-76px)] flex flex-col items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                Lorem Ipsum
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
              ea commodo consequat.
            </p>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="cursor-pointer"
              onClick={handleArrowClick}
            >
              <ChevronDown className="h-12 w-12 text-purple-500 mx-auto" />
            </motion.div>
          </motion.div>
        </div>

        {/* Schedule Section */}
        <div ref={scheduleRef} className="min-h-screen py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isScrolled ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border border-white/10 bg-black/60 backdrop-blur-md overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 pb-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-purple-500 flex items-center justify-center">
                      <Scissors className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-3xl text-center text-white">Lorem Ipsum</CardTitle>
                  <CardDescription className="text-center text-gray-300">
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                  {/* Guest Information Form (only shown if user is not logged in) */}
                  {!user && (
                    <div className="mb-8 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                      <h3 className="text-xl font-medium text-white mb-4">Lorem Ipsum</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-gray-300">
                            <User className="h-4 w-4 inline mr-2" />
                            Lorem Ipsum
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            value={guestInfo.name}
                            onChange={handleGuestInfoChange}
                            placeholder="John Doe"
                            className="bg-white/5 border-white/10 text-white"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-gray-300">
                            <Phone className="h-4 w-4 inline mr-2" />
                            Dolor Sit
                          </Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={guestInfo.phone}
                            onChange={handleGuestInfoChange}
                            placeholder="(123) 456-7890"
                            className="bg-white/5 border-white/10 text-white"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 text-white mb-4">
                        <Calendar className="h-5 w-5 text-purple-400" />
                        <h3 className="text-xl font-medium">Lorem Ipsum</h3>
                      </div>
                      <DayPicker selected={selectedDate} onSelect={setSelectedDate} />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 text-white mb-4">
                        <Clock className="h-5 w-5 text-purple-400" />
                        <h3 className="text-xl font-medium">Dolor Sit</h3>
                      </div>
                      <TimePicker selected={selectedTime} onSelect={setSelectedTime} />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center pb-8">
                  <Button
                    onClick={handleSchedule}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg"
                  >
                    Lorem Ipsum
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  )
}
