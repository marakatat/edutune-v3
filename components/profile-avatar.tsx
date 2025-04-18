import { User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type ProfileAvatarProps = {
  name: string
  className?: string
  size?: "sm" | "md" | "lg"
  imageUrl?: string
}

export function ProfileAvatar({ name, className = "", size = "md", imageUrl }: ProfileAvatarProps) {
  // Get initials from name
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  // Determine size class
  const sizeClass = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  }[size]

  return (
    <Avatar className={`${sizeClass} ${className} border-2 border-purple-500`}>
      <AvatarImage
        src={imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`}
        alt={name}
      />
      <AvatarFallback className="bg-purple-900 text-white">{initials || <User className="h-4 w-4" />}</AvatarFallback>
    </Avatar>
  )
}
