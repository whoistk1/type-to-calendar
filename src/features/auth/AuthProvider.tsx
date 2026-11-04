import { useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { AuthContext } from './authContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession)
      setLoading(false)
    })

    supabase.auth.getSession().then(({ data: { session: currentSession }, error }) => {
      if (error) {
        console.error('Unable to restore authentication session:', error)
      }
      setSession(currentSession)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        scopes: 'https://www.googleapis.com/auth/calendar.events',
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })

    if (error) {
      console.error('Error logging in to Google provider with Supabase:', error)
      throw new Error('Unable to sign in with Google.')
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
      throw new Error('Unable to sign out.')
    }
  }

  async function reauthorizeGoogle() {
    await signIn()
  }

  return (
    <AuthContext.Provider value={{ session, loading, signIn, signOut, reauthorizeGoogle }}>
      {children}
    </AuthContext.Provider>
  )
}
