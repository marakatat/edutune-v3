
import type React from "react"
import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/router" // Changed from next/navigation
import { motion } from "framer-motion"
import Head from 'next/head'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { SparklesCore } from "@/components/sparkles"
import Link from "next/link"
import { Bot, Check, X } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

export default function SignUpPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
    username: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    if (name === "password" || name === "confirmPassword" || name === "username") {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
    if (name === "username") {
      setUsernameAvailable(null)
    }
  }

  useEffect(() => {
    if (!formData.username || formData.username.length < 3) {
      setUsernameAvailable(null)
      setErrors((prev) => ({ ...prev, username: "" }))
      return
    }

    const timer = setTimeout(async () => {
      setIsCheckingUsername(true)
      try {
        const response = await fetch(`/api/auth/check-username?username=${encodeURIComponent(formData.username)}`)
        const data = await response.json()
        setUsernameAvailable(data.available)
        if (!data.available) {
          setErrors((prev) => ({ ...prev, username: "Username is already taken" }))
        } else {
          setErrors((prev) => ({ ...prev, username: "" }))
        }
      } catch (error) {
        console.error("Error checking username:", error)
        setUsernameAvailable(null)
        toast({
          title: "Error",
          description: "Could not check username availability.",
          variant: "destructive",
        })
      } finally {
        setIsCheckingUsername(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [formData.username])

  const validateForm = () => {
    let valid = true
    const newErrors = { password: "", confirmPassword: "", username: errors.username || "" }

    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
      valid = false
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
      valid = false
    }
    if (formData.username.length < 3) {
      newErrors.username = newErrors.username || "Username must be at least 3 characters"
      valid = false
    }
    if (formData.username.length > 20) {
      newErrors.username = newErrors.username || "Username must be less than 20 characters"
      valid = false
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = newErrors.username || "Username can only contain letters, numbers, and underscores"
      valid = false
    }
    if (usernameAvailable === false && !newErrors.username) {
        newErrors.username = "Username is already taken";
        valid = false;
    }

    setErrors(newErrors)
    return valid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    const payload = {
      name: formData.name,
      email: formData.email,
      username: formData.username,
      password: formData.password,
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
        const result = await response.json()

        if (result.success) {
          toast({
            title: "Account created",
            description: "You have successfully signed up!",
          })
          if (result.username) {
            router.push(`/${result.username}`)
          } else {
            router.push("/")
          }
        } else {
          toast({
            title: "Error",
            description: result.message || "Sign up failed. Please try again.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Sign up error:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred during sign up.",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <>
      <Head>
        <title>Sign Up - Romdev</title>
        <meta name="description" content="Join Romdev to explore our platform" />
      </Head>
      <div className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative flex items-center justify-center py-12">
        {/* ... existing JSX ... */}
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
                <CardTitle className="text-2xl text-white">Sign up</CardTitle>
                <CardDescription className="text-gray-400">Join Romdev to explore our platform</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
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
                    <Label htmlFor="username" className="text-gray-300">
                      Username
                    </Label>
                    <div className="relative">
                      <Input
                        id="username"
                        name="username"
                        placeholder="johndoe123"
                        required
                        value={formData.username}
                        onChange={handleChange}
                        className={cn(
                          "bg-white/5 border-white/10 text-white pr-10",
                          usernameAvailable === true && "border-green-500",
                          usernameAvailable === false && "border-red-500",
                        )}
                      />
                      {isCheckingUsername && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                        </div>
                      )}
                      {!isCheckingUsername && usernameAvailable === true && (
                        <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                      )}
                      {!isCheckingUsername && usernameAvailable === false && (
                        <X className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                      )}
                    </div>
                    {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                    <p className="text-gray-500 text-xs">This will be your unique @username for your profile</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-300">
                      Password
                    </Label>
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
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-300">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="bg-white/5 border-white/10 text-white"
                    />
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="agreeToTerms"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, agreeToTerms: checked as boolean }))
                      }
                      className="border-white/30 data-[state=checked]:bg-purple-600"
                    />
                    <label
                      htmlFor="agreeToTerms"
                      className="text-sm text-gray-300 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to the{" "}
                      <Link href="/terms" className="text-purple-400 hover:text-purple-300">
                        terms of service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-purple-400 hover:text-purple-300">
                        privacy policy
                      </Link>
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="w-full h-10 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors disabled:opacity-50"
                    disabled={isPending || !formData.agreeToTerms || usernameAvailable === false || isCheckingUsername}
                  >
                    {isPending ? "Signing up..." : "Sign Up"}
                  </button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center border-t border-white/10 pt-4">
                <p className="text-gray-400 text-sm">
                  Already have an account?{" "}
                  <Link href="/sign-in" className="text-purple-400 hover:text-purple-300">
                    Sign in
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  )
}
