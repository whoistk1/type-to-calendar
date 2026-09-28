import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'

interface SignInProps {
  onSessionChange?: (session: Session | null) => void
}

export function SignIn({ onSessionChange }: SignInProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Sync state on auth change
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession)
      setLoading(false)
      onSessionChange?.(currentSession)
    })

    // Restore existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
      onSessionChange?.(session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [onSessionChange])

  async function googleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        scopes: 'https://www.googleapis.com/auth/calendar.events',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      alert('Error logging in to Google provider with Supabase')
      console.error(error)
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
      return
    }

    window.location.assign(window.location.origin)
  }

  if (loading) {
    return <div className="text-gray-500 text-sm">Loading authentication state...</div>
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {session ? (
        <div className="flex flex-col items-center gap-3">
          
          <button
            type="button"
            onClick={signOut}
            aria-label="Sign out of Google Calendar"
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <button
          onClick={googleSignIn}
          className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-sm"
        >
          Sign In with Google
        </button>
      )}
    </div>
  )
}