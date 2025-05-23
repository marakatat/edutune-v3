import Hero from "@/src/components/hero"
import Navbar from "@/src/components/navbar"
import { SparklesCore } from "@/src/components/sparkles"
import { NotificationHandler } from "@/src/components/notification-handler"
import { Suspense } from "react"
import { createClient } from '@/src/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Home() {
  const cookieStore = cookies() // Correctly get the cookie store
  const supabase = createClient(cookieStore)

  // Example: Fetching from a 'profiles' table if 'todos' doesn't exist
  // Replace 'profiles' with an actual table name from your Supabase project
  // and 'username' with an actual column name.
  const { data: items, error } = await supabase.from('profiles').select('username')

  if (error) {
    console.error("Error fetching data:", error)
    return <p>Error loading data. Check server console.</p>
  }

  if (!items || items.length === 0) {
    return <p>No items found.</p>
  }

  return (
    <main className="min-h-screen bg-black/[1] antialiased bg-grid-white/[0.02] relative overflow-hidden">
      {/* Ambient background with moving particles */}
      <div className="h-full w-full absolute inset-0 z-0">
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
        <Hero />

        {/* Wrap the NotificationHandler in a Suspense boundary */}
        <Suspense fallback={null}>
          <NotificationHandler />
        </Suspense>

        <div className="p-4">
          <h1 className="text-xl font-semibold mb-4">Items from Supabase:</h1>
          <ul>
            {items?.map((item: any, index: number) => ( // Added type any for item and key for li
              <li key={item.id || index}>{item.username || JSON.stringify(item)}</li> // Display username or stringify item
            ))}
          </ul>
        </div>
      </div>
    </main>
  )
}
