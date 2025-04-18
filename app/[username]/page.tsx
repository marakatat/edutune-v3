import { createServerSupabaseClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ProfileAvatar } from "@/components/profile-avatar"
import Navbar from "@/components/navbar"
import { SparklesCore } from "@/components/sparkles"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth/session"
import { Edit } from "lucide-react"
import Link from "next/link"

async function getUser(username: string) {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from("users")
    .select("id, name, username, bio, profile_image_url")
    .eq("username", username)
    .single()

  return data
}

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const user = await getUser(params.username)
  const currentUser = await getCurrentUser()
  const isOwnProfile = currentUser?.id === user?.id

  if (!user) {
    notFound()
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
            {/* Added a semi-opaque background with a subtle glow effect */}
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-8 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <ProfileAvatar name={user.name} size="lg" />

                <div className="text-center md:text-left flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                      <p className="text-purple-400">@{user.username}</p>
                    </div>

                    {isOwnProfile && (
                      <Link href="/settings">
                        <Button variant="outline" size="sm" className="text-white border-white/20 hover:bg-white/10">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      </Link>
                    )}
                  </div>

                  <div className="mt-4 text-gray-300">
                    {user.bio ? (
                      <p>{user.bio}</p>
                    ) : (
                      <p className="text-gray-500 italic">
                        {isOwnProfile
                          ? "Add a bio to tell others about yourself."
                          : "This user hasn't added a bio yet."}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-white/10 pt-8">
                <h2 className="text-xl font-semibold text-white mb-4">Activity</h2>
                <div className="bg-white/5 rounded-lg p-6 text-center">
                  <p className="text-gray-400">No activity yet.</p>
                  {isOwnProfile && (
                    <button className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors">
                      Explore Romdev
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
