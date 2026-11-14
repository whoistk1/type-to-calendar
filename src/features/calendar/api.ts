import type { Session } from '@supabase/supabase-js'
import type { EventDraft } from '../parser/parseEvent'

export interface GoogleCalendarEventResponse {
  id: string
  htmlLink?: string
}

export class GoogleCalendarAuthorizationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GoogleCalendarAuthorizationError'
  }
}

function calendarEventId(draftId: string) {
  const id = /^[0-9a-f-]{36}$/i.test(draftId)
    ? draftId.replace(/-/g, '').toLowerCase()
    : Array.from(draftId)
        .map((character) => character.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
  return id.length >= 5 ? id : `a${id.padEnd(4, '0')}`
}

export async function createGoogleCalendarEvent(
  session: Session,
  event: EventDraft,
): Promise<GoogleCalendarEventResponse> {
  if (!session.provider_token) {
    throw new GoogleCalendarAuthorizationError(
      'Your Google Calendar permission has expired. Please reconnect Google Calendar.',
    )
  }

  const calendarId = encodeURIComponent(event.calendarId || 'primary')
  const isAllDay = Boolean(event.isAllDay)

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.provider_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: calendarEventId(event.id),
        summary: event.title,
        description: event.description || undefined,
        location: event.location || undefined,
        start: isAllDay ? { date: event.start.slice(0, 10) } : { dateTime: event.start },
        end: isAllDay ? { date: event.end.slice(0, 10) } : { dateTime: event.end },
      }),
    },
  )

  if (response.status === 409) {
    return { id: calendarEventId(event.id) }
  }

  if (response.status === 401) {
    throw new GoogleCalendarAuthorizationError(
      'Your Google Calendar permission has expired. Please reconnect Google Calendar.',
    )
  }

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
