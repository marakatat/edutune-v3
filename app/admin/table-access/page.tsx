"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import Navbar from "@/components/navbar"
import { SparklesCore } from "@/components/sparkles"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

type User = {
  id: string
  name: string
  email: string
  username: string
  table_allowed: number
}

export default function TableAccessPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [updatingUser, setUpdatingUser] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/sign-in")
      return
    }

    async function fetchUsers() {
      try {
        const response = await fetch("/api/admin/users")
        if (response.ok) {
          const data = await response.json()
          setUsers(data.users)
        } else {
          toast({
            title: "Error",
            description: "Failed to load users",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching users:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      } finally {
        setIsLoadingUsers(false)
      }
    }

    if (user) {
      fetchUsers()
    }
  }, [user, isLoading, router])

  const toggleTableAccess = async (userId: string, currentStatus: number) => {
    setUpdatingUser(userId)
    try {
      const response = await fetch("/api/admin/update-table-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          allowed: currentStatus === 1 ? 0 : 1,
        }),
      })

      if (response.ok) {
        setUsers((prevUsers) =>
          prevUsers.map((u) => (u.id === userId ? { ...u, table_allowed: u.table_allowed === 1 ? 0 : 1 } : u)),
        )
        toast({
          title: "Success",
          description: "User access updated successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update user access",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating user access:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setUpdatingUser(null)
    }
  }

  if (isLoading || (isLoadingUsers && user)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
      </div>
    )
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
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-8 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
              <h1 className="text-2xl font-bold text-white mb-6">Manage Table Access</h1>

              {users.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-white">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Username</th>
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-center">Table Access</th>
                        <th className="px-4 py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-white/5">
                          <td className="px-4 py-3">{user.name}</td>
                          <td className="px-4 py-3">@{user.username}</td>
                          <td className="px-4 py-3">{user.email}</td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-block px-2 py-1 rounded-full text-xs ${
                                user.table_allowed === 1
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {user.table_allowed === 1 ? "Allowed" : "Not Allowed"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => toggleTableAccess(user.id, user.table_allowed)}
                              disabled={updatingUser === user.id}
                              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-md text-sm disabled:opacity-50"
                            >
                              {updatingUser === user.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : user.table_allowed === 1 ? (
                                "Revoke Access"
                              ) : (
                                "Grant Access"
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-400 text-center">No users found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
