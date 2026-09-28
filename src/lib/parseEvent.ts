import * as chrono from 'chrono-node'

export interface ParsedEvent {
  id: string
  title: string
  description: string
  start: string
  end: string
  syncToCalendar: boolean
  status: 'ready' | 'blocked'
  blockedReason?: string
  durationDefaulted: boolean
}

export type EventDraft = ParsedEvent

/**
 * Parses freeform text into a structured event entirely on the client.
 * Parses one input line into a reviewable event draft.
 */
export function parseLine(
  text: string,
  currentDate: Date = new Date(),
): EventDraft {
  const trimmed = text.trim()
  if (!trimmed) {
    return createBlockedDraft('', 'Add an event description with a specific date and time.')
  }

  const results = chrono.parse(trimmed, currentDate, { forwardDate: true })
  if (results.length === 0) {
    return createBlockedDraft(trimmed, 'A specific date and time could not be determined.')
  }

  const result = results[0]
  const hasCertainDate = result.start.isCertain('day') || result.start.isCertain('weekday')
  const hasCertainTime = result.start.isCertain('hour')
  const title = trimmed.replace(result.text, '').trim() || trimmed

  if (!hasCertainDate || !hasCertainTime) {
    return createBlockedDraft(
      title,
      'Add a specific date and time before creating this event.',
    )
  }

  const start = result.start.date()
  const durationDefaulted = !result.end
  const end = result.end ? result.end.date() : new Date(start.getTime() + 60 * 60 * 1000)

  return {
    id: crypto.randomUUID(),
    title,
    description: '',
    start: start.toISOString(),
    end: end.toISOString(),
    syncToCalendar: true,
    status: 'ready',
    durationDefaulted,
  }
}

export function parseEventEntry(
  text: string,
  currentDate: Date = new Date(),
): ParsedEvent | null {
  const draft = parseLine(text, currentDate)
  return draft.status === 'ready' ? draft : null
}

function createBlockedDraft(title: string, blockedReason: string): EventDraft {
  return {
    id: crypto.randomUUID(),
    title,
    description: '',
    start: '',
    end: '',
    syncToCalendar: false,
    status: 'blocked',
    blockedReason,
    durationDefaulted: false,
  }
}
