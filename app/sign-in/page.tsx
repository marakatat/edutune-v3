"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { SparklesCore } from "@/src/components/sparkles"
import { signIn } from "@/app/actions/auth"
import Link from "next/link"
import { Bot } from "lucide-react"
import { toast } from "@/src/components/ui/use-toast"

export default function SignInPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    startTransition(async () => {
      const result = await signIn(formData)

      if (result.success) {
        toast({
          title: "Welcome back",
          description: "You have successfully signed in!",
        })
        // Redirect to the user's profile page
        if (result.username) {
          router.push(`/${result.username}`)
        } else {
          router.push("/")
        }
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    })
  }

  return (
    <div className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative flex items-center justify-center">
      {/* Ambient background with moving particles - pointer-events-none to block interaction on mobile */}
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

      <div className="container relative z-10 px-4 mx-auto">
        <div className="fixed top-8 left-8 z-20">
          <Link href="/" className="flex items-center space-x-2">
            <Bot className="w-8 h-8 text-purple-500" />
            <span className="text-white font-medium text-xl">Romdev</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          <Card className="border border-white/10 bg-black/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Welcome back</CardTitle>
              <CardDescription className="text-gray-400">Sign in to your Romdev account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-300">
                      Password
                    </Label>
                    <Link href="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-10 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors disabled:opacity-50"
                  disabled={isPending}
                >
                  {isPending ? "Signing in..." : "Sign In"}
                </button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center border-t border-white/10 pt-4">
              <p className="text-gray-400 text-sm">
                Don't have an account?{" "}
                <Link href="/sign-up" className="text-purple-400 hover:text-purple-300">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
