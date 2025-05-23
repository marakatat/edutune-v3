"use client"

import type React from "react"

import { useState, useTransition, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { SparklesCore } from "@/src/components/sparkles"
import { useAuth } from "@/src/contexts/auth-context"
import { ProfileAvatar } from "@/src/components/profile-avatar"
import { toast } from "@/src/components/ui/use-toast"
import { updateProfile, uploadAvatar } from "@/app/actions/profile"
import Navbar from "@/src/components/navbar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Loader2, Upload } from "lucide-react"

export default function SettingsPage() {
  const { user, isLoading, refreshUser } = useAuth()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [profileData, setProfileData] = useState({
    name: "",
    bio: "",
    profileImageUrl: "",
  })
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        bio: user.bio || "",
        profileImageUrl: user.profile_image_url || "",
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    startTransition(async () => {
      const result = await updateProfile(formData)

      if (result.success) {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully!",
        })
        await refreshUser()
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    })
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    // Create a preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewAvatar(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Create a FormData object and append the file
    const formData = new FormData()
    formData.append("avatar", file)

    setIsUploadingAvatar(true)
    try {
      const result = await uploadAvatar(formData)
      if (result.success) {
        toast({
          title: "Avatar updated",
          description: "Your avatar has been updated successfully!",
        })
        await refreshUser()
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
        // Reset preview on error
        setPreviewAvatar(null)
      }
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      // Reset preview on error
      setPreviewAvatar(null)
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
      </div>
    )
  }

  if (!user) {
    router.push("/sign-in")
    return null
  }

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

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="bg-black/60 border border-white/10 mb-6">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card className="border border-white/10 bg-black/60 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-2xl text-white">Profile Settings</CardTitle>
                    <CardDescription className="text-gray-400">
                      Update your profile information and how others see you
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="flex flex-col items-center space-y-2">
                          <div className="relative">
                            <ProfileAvatar
                              name={user.name}
                              size="lg"
                              className={`${isUploadingAvatar ? "opacity-50" : ""}`}
                              imageUrl={previewAvatar || user.profile_image_url}
                            />
                            {isUploadingAvatar && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="h-8 w-8 text-white animate-spin" />
                              </div>
                            )}
                          </div>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                            disabled={isUploadingAvatar}
                          />
                          <button
                            type="button"
                            onClick={handleAvatarClick}
                            className="px-3 py-1 text-sm text-white border border-white/40 rounded-md hover:bg-white/10 flex items-center"
                            disabled={isUploadingAvatar}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Change Avatar
                          </button>
                          <p className="text-xs text-gray-500">Square images up to 1024x1024px</p>
                        </div>

                        <div className="flex-1 space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-gray-300">
                              Display Name
                            </Label>
                            <Input
                              id="name"
                              name="name"
                              value={profileData.name}
                              onChange={handleChange}
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="username" className="text-gray-300">
                              Username
                            </Label>
                            <div className="flex items-center space-x-2">
                              <div className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white">
                                @{user.username}
                              </div>
                              <button
                                type="button"
                                className="px-3 py-1 text-sm text-white border border-white/40 rounded-md hover:bg-white/10 opacity-50 cursor-not-allowed"
                                disabled
                              >
                                Change
                              </button>
                            </div>
                            <p className="text-xs text-gray-500">Username changes are coming soon</p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="bio" className="text-gray-300">
                              Bio
                            </Label>
                            <Textarea
                              id="bio"
                              name="bio"
                              placeholder="Tell us about yourself"
                              value={profileData.bio}
                              onChange={handleChange}
                              className="bg-white/5 border-white/10 text-white min-h-[120px]"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors disabled:opacity-50"
                          disabled={isPending}
                        >
                          {isPending ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="account">
                <Card className="border border-white/10 bg-black/60 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-2xl text-white">Account Settings</CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage your account details and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400">Account settings coming soon</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications">
                <Card className="border border-white/10 bg-black/60 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-2xl text-white">Notification Settings</CardTitle>
                    <CardDescription className="text-gray-400">
                      Control how and when you receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400">Notification settings coming soon</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </main>
  )
}
