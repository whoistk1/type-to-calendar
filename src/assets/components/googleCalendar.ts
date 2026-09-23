import type { Session } from '@supabase/supabase-js'
import type { ParsedEvent } from './parseEvent'

export interface GoogleCalendarEventResponse {
  id: string
  htmlLink?: string
}

export async function createGoogleCalendarEvent(
  session: Session,
  event: ParsedEvent,
): Promise<GoogleCalendarEventResponse> {
  const providerToken = session.provider_token

  if (!providerToken) {
    throw new Error('Your Google Calendar permission has expired. Please sign in again.')
  }

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${providerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: event.title,
        description: event.description || undefined,
        start: { dateTime: event.start },
        end: { dateTime: event.end },
      }),
    },
  )

  if (!response.ok) {
    const details = await response.text()
    console.error('Google Calendar request failed:', details)
    throw new Error('Google Calendar could not save this event.')
  }

  return response.json() as Promise<GoogleCalendarEventResponse>
}
