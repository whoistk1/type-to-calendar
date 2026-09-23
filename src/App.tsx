import { useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Landing } from './assets/components/Landing'
import './App.css'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)

  return (
    <main className="min-h-screen bg-gray-50">
      <Landing appName="Type To Calendar" onSessionChange={setSession} />
    </main>
  )
}