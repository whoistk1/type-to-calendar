import { useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { EventEntry, type ParsedEvent } from './assets/components/EventEntry'
import {
  createGoogleCalendarEvent,
  type GoogleCalendarEventResponse,
} from './assets/components/googleCalendar'
import { Landing } from './assets/components/Landing'
import './App.css'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [savedEvent, setSavedEvent] = useState<ParsedEvent | null>(null)
  const [calendarEvent, setCalendarEvent] = useState<GoogleCalendarEventResponse | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  async function handleEventSubmit(event: ParsedEvent) {
    if (!session) return

    setIsSaving(true)
    try {
      const createdEvent = await createGoogleCalendarEvent(session, event)
      setSavedEvent(event)
      setCalendarEvent(createdEvent)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {session ? (
        <section className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4 py-8">
          <h1 className="mb-6 text-3xl font-bold text-gray-950">Create an event</h1>
          <EventEntry onSubmit={handleEventSubmit} isSubmitting={isSaving} />
          {savedEvent && (
            <div className="mt-4 text-sm text-green-700" role="status">
              <p>Event saved: {savedEvent.title}</p>
              {calendarEvent?.htmlLink && (
                <a
                  href={calendarEvent.htmlLink}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium underline"
                >
                  Open in Google Calendar
                </a>
              )}
            </div>
          )}
        </section>
      ) : (
        <Landing appName="Type To Calendar" onSessionChange={setSession} />
      )}
    </main>
  )
}