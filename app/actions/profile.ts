"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth/session"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, message: "You must be logged in to update your profile" }
    }

    const name = formData.get("name") as string
    const bio = formData.get("bio") as string

    if (!name) {
      return { success: false, message: "Name is required" }
    }

    const supabase = createServerSupabaseClient()

    const { error } = await supabase
      .from("users")
      .update({
        name,
        bio,
      })
      .eq("id", user.id)

    if (error) {
      console.error("Error updating profile:", error)
      return { success: false, message: "Error updating profile" }
    }

    // Revalidate the user's profile page
    revalidatePath(`/${user.username}`)
    revalidatePath("/settings")

    return { success: true, message: "Profile updated successfully" }
  } catch (error) {
    console.error("Profile update error:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

export async function uploadAvatar(formData: FormData) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, message: "You must be logged in to update your avatar" }
    }

    const avatarFile = formData.get("avatar") as File

    if (!avatarFile) {
      return { success: false, message: "No avatar file provided" }
    }

    // Check file type
    if (!avatarFile.type.startsWith("image/")) {
      return { success: false, message: "File must be an image" }
    }

    // Resize and process image
    const supabase = createServerSupabaseClient()

    // Generate a unique filename
    const fileExt = avatarFile.name.split(".").pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage.from("profiles").upload(filePath, avatarFile, {
      cacheControl: "3600",
      upsert: true,
    })

    if (uploadError) {
      console.error("Error uploading avatar:", uploadError)
      return { success: false, message: "Error uploading avatar" }
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("profiles").getPublicUrl(filePath)

    // Update user profile with new avatar URL
    const { error: updateError } = await supabase
      .from("users")
      .update({
        profile_image_url: publicUrl,
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Error updating profile with avatar:", updateError)
      return { success: false, message: "Error updating profile with avatar" }
    }

    // Revalidate the user's profile page
    revalidatePath(`/${user.username}`)
    revalidatePath("/settings")

    return { success: true, message: "Avatar updated successfully", avatarUrl: publicUrl }
  } catch (error) {
    console.error("Avatar upload error:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}
