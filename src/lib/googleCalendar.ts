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
    let detailMessage = details
    try {
      const payload = JSON.parse(details) as { error?: { message?: string } }
      detailMessage = payload.error?.message || details
    } catch {
      // Keep plain-text API responses as-is.
    }

    const safeDetails = detailMessage.trim().slice(0, 240)
    throw new Error(
      safeDetails
        ? `Google Calendar could not save this event (${response.status}): ${safeDetails}`
        : `Google Calendar could not save this event (${response.status}).`,
    )
  }

  return response.json() as Promise<GoogleCalendarEventResponse>
}
