import { describe, expect, it, vi } from 'vitest'
import { createGoogleCalendarEvent } from '../src/lib/googleCalendar'
import type { ParsedEvent } from '../src/lib/parseEvent'

const event: ParsedEvent = {
  id: 'event-id',
  title: 'Team sync',
  description: 'Discuss project status',
  start: '2026-09-29T14:00:00.000Z',
  end: '2026-09-29T15:00:00.000Z',
  syncToCalendar: true,
  status: 'ready',
  durationDefaulted: false,
}

const session = (providerToken?: string) =>
  ({ provider_token: providerToken } as Parameters<typeof createGoogleCalendarEvent>[0])

describe('createGoogleCalendarEvent', () => {
  it('posts the event to the primary calendar and returns the response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 'google-id', htmlLink: 'https://calendar.google.com/event' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(createGoogleCalendarEvent(session('google-token'), event)).resolves.toEqual({
      id: 'google-id',
      htmlLink: 'https://calendar.google.com/event',
    })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      expect.objectContaining({
        method: 'POST',
        headers: {
          Authorization: 'Bearer google-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: 'Team sync',
          description: 'Discuss project status',
          start: { dateTime: event.start },
          end: { dateTime: event.end },
        }),
      }),
    )
  })

  it('rejects when the session has no provider token', async () => {
    await expect(createGoogleCalendarEvent(session(), event)).rejects.toThrow(
      'Your Google Calendar permission has expired. Please sign in again.',
    )
  })

  it('rejects when Google Calendar returns an error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('permission denied', { status: 403 })),
    )

    await expect(createGoogleCalendarEvent(session('google-token'), event)).rejects.toThrow(
      'Google Calendar could not save this event (403): permission denied',
    )
  })
})