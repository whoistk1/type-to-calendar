import * as chrono from 'chrono-node'

export interface ParsedEvent {
  id: string
  title: string
  description: string
  start: string
  end: string
  syncToCalendar: boolean
}

/**
 * Parses freeform text into a structured event entirely on the client.
 * Returns null when no date or time can be found.
 */
export function parseEventEntry(
  text: string,
  currentDate: Date = new Date(),
): ParsedEvent | null {
  const trimmed = text.trim()
  if (!trimmed) return null

  const results = chrono.parse(trimmed, currentDate, { forwardDate: true })
  if (results.length === 0) return null

  const result = results[0]
  const start = result.start.date()
  const end = result.end
    ? result.end.date()
    : new Date(start.getTime() + 60 * 60 * 1000)
  const title = trimmed.replace(result.text, '').trim() || trimmed

  return {
    id: crypto.randomUUID(),
    title,
    description: '',
    start: start.toISOString(),
    end: end.toISOString(),
    syncToCalendar: true,
  }
}
