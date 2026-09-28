import { useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { EventEntry } from './components/EventEntry'
import {
  createGoogleCalendarEvent,
} from './lib/googleCalendar'
import { Landing } from './components/Landing'
import './App.css'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)

  function handleCreateEvent(event: Parameters<typeof createGoogleCalendarEvent>[1]) {
    if (!session) return Promise.reject(new Error('You must be signed in to create events.'))
    return createGoogleCalendarEvent(session, event)
  }

  return (
    <main className="min-h-screen bg-gray-50">

      {session ? (

        <section className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4 py-8">

          <h1 className="mb-6 text-3xl font-bold text-gray-950 text-center">Create an event</h1>

          <EventEntry onCreateEvent={handleCreateEvent} />
        </section>
      ) : (
        <Landing appName="Type To Calendar" onSessionChange={setSession} />
      )}
    </main>
  )
}