import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'
import './App.css'

const supabase = createClient('https://aqdsowcbqitcggsdzwgn.supabase.co','sb_publishable_fB5EUXxEmj2Vl9RWRMac0g_OuP-enfY')


function App() {
  // Keep the current Supabase session and authentication loading state in sync.
  const[session, setSession] = useState<Session | null>(null);
  const[loading, setLoading] = useState(true)

  useEffect(() => {
    // Update the UI whenever the user's authentication state changes.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession)
        setLoading(false)
      },
    )

    // Restore an existing session when the application first loads.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }

  }, [])
  
  // Request Google Calendar access as part of the OAuth sign-in flow.
  async function googleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        scopes: 'https://www.googleapis.com/auth/calendar',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if(error) {
      alert("Error logging in to Google provider with Supabase")
      console.log(error);
    }
  }

  // End the current Supabase session and return to the signed-out view.
  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
    }
  }

  if(loading) {
    return <div>Loading authentication state...</div>
  }

  console.log(session);


  return (
    <div>
      {session ? 
        <>
          <div>
            <h2>Hey there {session.user.email}</h2>
            <button onClick={signOut}>Sign Out</button>
          </div>
        </>
      :
      <>
      <div>
        <button onClick={googleSignIn}>Sign In with Google</button>
      </div>
      </>
      }
    </div>
  )
}

export default App
