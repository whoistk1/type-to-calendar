import { useState } from 'react'
import { parseEventEntry, type ParsedEvent } from './parseEvent'
import { Review } from './Review'

export type { ParsedEvent } from './parseEvent'

interface EventEntryProps {
  onSubmit?: (event: ParsedEvent) => Promise<void> | void
  isSubmitting?: boolean
}

export function EventEntry({ onSubmit, isSubmitting = false }: EventEntryProps) {
  const [text, setText] = useState('')
  const [parsedEvent, setParsedEvent] = useState<ParsedEvent | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  function handleParse() {
    const event = parseEventEntry(text)
    setParsedEvent(event)
    setMessage(
      event
        ? 'Event parsed. Review the details before saving.'
        : 'Add a date or time so the event can be created.',
    )
  }

  async function handleSubmit() {
    if (!parsedEvent) {
      setMessage('Parse an event with a date or time before saving.')
      return
    }

    try {
      await onSubmit?.(parsedEvent)
      setMessage('Event saved to Google Calendar.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save event.')
      throw error
    }
  }

  return (
    <section className="w-full max-w-xl space-y-4">
      <textarea
        id="event-entry"
        value={text}
        onChange={(event) => {
          setText(event.target.value)
          setParsedEvent(null)
          setMessage(null)
        }}

        onKeyDown={(e) => {
            if (e.key === 'Enter'){
                e.preventDefault()
                if (!parsedEvent) {
                    handleParse()
                }
                else if (!isSubmitting){
                    void handleSubmit()
                    setText('')
                }
            }
        }}
        className="min-h-13 w-full resize-y rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={handleParse}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
        >
          Parse event
        </button>
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={!parsedEvent || isSubmitting}
          className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Saving...' : 'Save event'}
        </button>
      </div>

      {message && <p className="text-left text-sm text-gray-600" role="status">{message}</p>}
      {parsedEvent && <Review event={parsedEvent} />}
    </section>
  )
}
