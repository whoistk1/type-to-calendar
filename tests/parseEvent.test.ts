import { describe, expect, it } from 'vitest'
import { parseEventEntry, parseLine } from '../src/lib/parseEvent'

const currentDate = new Date('2026-09-28T09:00:00.000Z')

function localDate(
  year: number,
  month: number,
  day: number,
  hours: number,
  minutes = 0,
) {
  return new Date(year, month - 1, day, hours, minutes)
}

describe('parseEventEntry', () => {
  it('returns null for empty or undated input', () => {
    expect(parseEventEntry('   ', currentDate)).toBeNull()
    expect(parseEventEntry('Plan the project roadmap', currentDate)).toBeNull()
  })

  it('marks an undated line as blocked for the review queue', () => {
    const draft = parseLine('Meeting next week', currentDate)

    expect(draft.status).toBe('blocked')
    expect(draft.blockedReason).toBeTruthy()
    expect(draft.syncToCalendar).toBe(false)
  })

  it('extracts the title and defaults a one-hour duration', () => {
    const event = parseEventEntry('Team sync tomorrow at 2pm', currentDate)

    expect(event).not.toBeNull()
    expect(event?.title).toBe('Team sync')
    expect(event?.start).toBe(localDate(2026, 9, 29, 14).toISOString())
    expect(event?.end).toBe(localDate(2026, 9, 29, 15).toISOString())
    expect(event?.description).toBe('')
    expect(event?.syncToCalendar).toBe(true)
    expect(event?.status).toBe('ready')
    expect(event?.durationDefaulted).toBe(true)
    expect(event?.id).toEqual(expect.any(String))
  })

  it('preserves an explicitly stated time range', () => {
    const event = parseEventEntry(
      'Planning workshop October 2, 2026 from 10am to 11:30am',
      currentDate,
    )

    expect(event).not.toBeNull()
    expect(event?.title).toBe('Planning workshop')
    expect(event?.start).toBe(localDate(2026, 10, 2, 10).toISOString())
    expect(event?.end).toBe(localDate(2026, 10, 2, 11, 30).toISOString())
    expect(event?.durationDefaulted).toBe(false)
  })

  it.each([
    ['Test Friday 8pm-9pm', 'Test', 20, 0, 21, 0],
    ['Run Friday 6pm- 9pm', 'Run', 18, 0, 21, 0],
    ['Please Friday 5pm-10pm', 'Please', 17, 0, 22, 0],
    ['asdasds Saturday 11am-6pm', 'asdasds', 11, 0, 18, 0],
  ])('parses hyphenated time ranges: %s', (text, title, startHour, startMinute, endHour, endMinute) => {
    const event = parseEventEntry(text, currentDate)
    const day = text.includes('Saturday') ? 3 : 2

    expect(event?.status).toBe('ready')
    expect(event?.title).toBe(title)
    expect(event?.start).toBe(localDate(2026, 10, day, startHour, startMinute).toISOString())
    expect(event?.end).toBe(localDate(2026, 10, day, endHour, endMinute).toISOString())
    expect(event?.durationDefaulted).toBe(false)
  })
})