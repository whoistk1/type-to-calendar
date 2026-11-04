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
  dateAssumed?: boolean
  parseWarning?: string
}

export type EventDraft = ParsedEvent

function normalizeTitle(title: string) {
  return title
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;!?])/g, '$1')
    .replace(/\b(?:at|on|from|to|for|by|in)\s*$/i, '')
    .trim()
}

function createBlockedDraft(title: string, blockedReason: string): EventDraft {
  return {
    id: crypto.randomUUID(),
    title: normalizeTitle(title),
    description: '',
    start: '',
    end: '',
    syncToCalendar: false,
    status: 'blocked',
    blockedReason,
    durationDefaulted: false,
  }
}

export function validateDraft(draft: EventDraft): EventDraft {
  if (draft.status === 'blocked') return draft
  if (!draft.title.trim()) {
    return { ...draft, status: 'blocked', syncToCalendar: false, blockedReason: 'Add a title.' }
  }
  const start = Date.parse(draft.start)
  const end = Date.parse(draft.end)
  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return {
      ...draft,
      status: 'blocked',
      syncToCalendar: false,
      blockedReason: 'Add a valid start and end time.',
    }
  }
  if (end <= start) {
    return {
      ...draft,
      status: 'blocked',
      syncToCalendar: false,
      blockedReason: 'The end time must be after the start time.',
    }
  }
  return { ...draft, status: 'ready', syncToCalendar: true, blockedReason: undefined }
}

export function parseLine(text: string, currentDate: Date = new Date()): EventDraft {
  const trimmed = text.trim()
  if (!trimmed) return createBlockedDraft('', 'Add an event description with a specific date and time.')

  const results = chrono.parse(trimmed, currentDate, { forwardDate: true })
  if (results.length === 0) {
    return createBlockedDraft(trimmed, 'A date or time could not be determined.')
  }

  const result = results[0]
  const dateMentions = trimmed.match(
    /\b(?:today|tomorrow|yesterday|monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|may|june|july|august|september|october|november|december)\b/gi,
  )?.length ?? 0
  const hasCertainDate = result.start.isCertain('day') || result.start.isCertain('weekday')
  const hasCertainTime = result.start.isCertain('hour')
  const dateAssumed = !hasCertainDate && hasCertainTime
  const title = normalizeTitle(trimmed.replace(result.text, ''))

  if (!hasCertainTime) {
    return createBlockedDraft(
      title || trimmed,
      'Add a specific time before creating this event.',
    )
  }

  let start = result.start.date()
  if (dateAssumed) {
    const candidate = new Date(currentDate)
    candidate.setHours(start.getHours(), start.getMinutes(), 0, 0)
    if (candidate <= currentDate) candidate.setDate(candidate.getDate() + 1)
    start = candidate
  }

  const durationDefaulted = !result.end
  const end = result.end
    ? result.end.date()
    : new Date(start.getTime() + 60 * 60 * 1000)
  const draft = validateDraft({
    id: crypto.randomUUID(),
    title: title || trimmed,
    description: '',
    start: start.toISOString(),
    end: end.toISOString(),
    syncToCalendar: true,
    status: 'ready',
    durationDefaulted,
    dateAssumed,
    parseWarning:
      results.length > 1 || dateMentions > 1
        ? 'Multiple date/time matches were found. Verify the dates before creating this event.'
        : undefined,
  })

  if (dateAssumed) {
    draft.parseWarning = 'No date was provided, so the next occurrence was assumed.'
  }
  return draft
}

export function parseEventEntry(text: string, currentDate: Date = new Date()): ParsedEvent | null {
  const draft = parseLine(text, currentDate)
  return draft.status === 'ready' ? draft : null
}
