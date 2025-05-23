"use client"
import { Bot, Menu, LogOut, X } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useAuth } from "@/src/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ProfileAvatar } from "@/src/components/profile-avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import { toast } from "@/src/components/ui/use-toast"

export default function Navbar() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      const response = await fetch("/api/auth/signout", {
        method: "POST",
      })

      if (response.ok) {
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setIsSigningOut(false)
    }
  }

  const handleAltCevaClick = () => {
    toast({
      title: "Something",
      description: "Nothing. I just didn't want the button to feel lonely.",
    })
  }

  const handleAboutClick = () => {
    toast({
      title: "About",
      description: "This webpage is made by a internet user and owns this domain. Kiss Love",
    })
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="flex items-center justify-between px-6 py-4 backdrop-blur-sm border-b border-white/10"
      >
        <Link href="/" className="flex items-center space-x-2">
          <Bot className="w-8 h-8 text-purple-500" />
          <span className="text-white font-medium text-xl">Romdev</span>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          <button
            onClick={handleAltCevaClick}
            className="text-gray-300 hover:text-white transition-colors relative group"
          >
            Something
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all group-hover:w-full" />
          </button>
          <button
            onClick={handleAboutClick}
            className="text-gray-300 hover:text-white transition-colors relative group"
          >
            About
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all group-hover:w-full" />
          </button>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          {isLoading ? (
            <div className="w-10 h-10 bg-black rounded-full animate-pulse"></div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none">
                  <ProfileAvatar name={user.name} className="cursor-pointer hover:opacity-80 transition-opacity" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-black/80 backdrop-blur-md border border-white/10 text-white"
              >
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-sm text-gray-400">@{user.username}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-white/5"
                  onClick={() => router.push(`/${user.username}`)}
                >
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-white/5" onClick={() => router.push("/settings")}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  className="cursor-pointer text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                >
                  {isSigningOut ? (
                    "Signing out..."
                  ) : (
                    <div className="flex items-center">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </div>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-white hover:text-purple-400 px-4 py-2 border border-white rounded-md"
              >
                Sign In
              </Link>
              <Link href="/sign-up" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md">
                Get Started
              </Link>
            </>
          )}
        </div>

        <button onClick={toggleMobileMenu} className="md:hidden text-white focus:outline-none">
          <Menu className="w-6 h-6" />
        </button>
      </motion.nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col md:hidden">
          <div className="flex justify-between items-center p-6 border-b border-white/10">
            <Link href="/" className="flex items-center space-x-2" onClick={() => setMobileMenuOpen(false)}>
              <Bot className="w-8 h-8 text-purple-500" />
              <span className="text-white font-medium text-xl">Romdev</span>
            </Link>
            <button onClick={toggleMobileMenu} className="text-white focus:outline-none">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex flex-col p-6 space-y-6">
            <button
              onClick={() => {
                handleAltCevaClick()
                setMobileMenuOpen(false)
              }}
              className="text-gray-300 hover:text-white transition-colors py-2 text-lg"
            >
              Something
            </button>
            <button
              onClick={() => {
                handleAboutClick()
                setMobileMenuOpen(false)
              }}
              className="text-gray-300 hover:text-white transition-colors py-2 text-lg"
            >
              About
            </button>
            <div className="border-t border-white/10 pt-6">
              {isLoading ? (
                <div className="w-10 h-10 bg-black rounded-full animate-pulse"></div>
              ) : user ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <ProfileAvatar name={user.name} />
                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-gray-400 text-sm">@{user.username}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        router.push(`/${user.username}`)
                        setMobileMenuOpen(false)
                      }}
                      className="block w-full text-left text-gray-300 hover:text-white py-2"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        router.push("/settings")
                        setMobileMenuOpen(false)
                      }}
                      className="block w-full text-left text-gray-300 hover:text-white py-2"
                    >
                      Settings
                    </button>
                    <button
                      onClick={() => {
                        handleSignOut()
                        setMobileMenuOpen(false)
                      }}
                      className="block w-full text-left text-red-400 hover:text-red-300 py-2"
                      disabled={isSigningOut}
                    >
                      {isSigningOut ? "Signing out..." : "Sign Out"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Link
                    href="/sign-in"
                    className="block w-full text-center text-white hover:text-purple-400 px-4 py-2 border border-white rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
