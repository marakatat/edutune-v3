import { GetServerSideProps } from 'next'
import { Suspense } from "react"
import Head from 'next/head'
import Hero from "@/components/hero"
import Navbar from "@/components/navbar"
import { SparklesCore } from "@/components/sparkles"
import { NotificationHandler } from "@/components/notification-handler"
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

interface HomeProps {
  items: any[] | null
  error: string | null
}

export default function Home({ items, error }: HomeProps) {
  if (error) {
    console.error("Error fetching data:", error)
    return <p>Error loading data. Check server console.</p>
  }

  if (!items || items.length === 0) {
    return <p>No items found.</p>
  }

  return (
    <>
      <Head>
        <title>Romdev</title>
        <meta name="description" content="Explore our platform and discover amazing features" />
      </Head>
      
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
              {items?.map((item: any, index: number) => (
                <li key={item.id || index}>{item.username || JSON.stringify(item)}</li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    // For Pages Router, we'll use a different approach for Supabase
    // We'll create a server-side client using cookies from context
    const { createServerClient } = await import('@supabase/ssr')
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return Object.entries(context.req.cookies).map(([name, value]) => ({
              name,
              value: value || '',
            }))
          },
          setAll(cookiesToSet: any[]) {
            // For server-side rendering, we can't set cookies during the request
            // This is typically handled by middleware or client-side
          },
        },
      }
    )

    // Example: Fetching from a 'profiles' table
    const { data: items, error } = await supabase.from('profiles').select('username')

    if (error) {
      console.error("Error fetching data:", error)
      return {
        props: {
          items: null,
          error: error.message
        }
      }
    }

    return {
      props: {
        items: items || [],
        error: null
      }
    }
  } catch (error) {
    console.error("Server error:", error)
    return {
      props: {
        items: null,
        error: 'Server error occurred'
      }
    }
  }
}
