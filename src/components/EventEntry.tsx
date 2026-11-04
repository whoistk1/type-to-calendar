import { useState } from 'react'
import type { EventDraft } from '../features/parser/parseEvent'
import type { GoogleCalendarEventResponse } from '../features/calendar/api'
import { useDrafts } from '../features/drafts/useDrafts'
import { Review } from './Review'

export type { ParsedEvent } from '../features/parser/parseEvent'

interface EventEntryProps {
  onCreateEvent?: (draft: EventDraft) => Promise<GoogleCalendarEventResponse>
}

export function EventEntry({ onCreateEvent }: EventEntryProps) {
  const [text, setText] = useState('')
  const { state, dispatch, parseText, createDraft, createSelectedDrafts } = useDrafts(onCreateEvent)
  const { drafts, selectedIds, draftStates, message } = state
  const readyCount = drafts.filter((draft) => draft.status === 'ready').length
  const blockedCount = drafts.filter((draft) => draft.status === 'blocked').length
  const hasPendingDraft = Object.values(draftStates).some(
    (state) => state.creationState === 'pending',
  )
  const canCreate = drafts.some((draft) => draft.status === 'ready' && selectedIds.has(draft.id))
  const hasCreatedEvent = Object.values(draftStates).some(
    (state) => state.creationState === 'success',
  )

  function handleParse() {
    parseText(text)
  }

  return (
    <section className="w-full max-w-xl space-y-4">
      <label htmlFor="event-entry" className="block text-sm font-medium text-gray-700 text-center">
        Enter one event per line
      </label>
      <textarea
        id="event-entry"
        value={text}
        placeholder={'Team sync tomorrow at 2pm\nPlanning workshop October 2 at 10am'}
        onChange={(event) => {
          const nextText = event.target.value
          setText(nextText)
          dispatch({ type: 'textChanged', text: nextText })
        }}
        className="min-h-32 w-full resize-y rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />

      <button
        type="button"
        onClick={handleParse}
        className="w-full rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
      >
        Review events
      </button>

      {message && <p className="text-sm text-gray-600" role="status">{message}</p>}

      {drafts.length > 0 && (
        <>
          <p className="text-sm text-gray-600">{readyCount} events ready, {blockedCount} blocked</p>
          <div className="space-y-3">
            {drafts.map((draft) => {
              const state = draftStates[draft.id] ?? { creationState: 'idle' as const }
              return (
                <Review
                  key={draft.id}
                  draft={draft}
                  selected={selectedIds.has(draft.id)}
                  creationState={state.creationState}
                  error={state.error}
                  onChange={(updatedDraft) => dispatch({ type: 'draftChanged', draft: updatedDraft })}
                  onToggleSelected={() => dispatch({ type: 'selected', id: draft.id })}
                  onRemove={() => dispatch({ type: 'removed', id: draft.id })}
                  onRetry={() => void createDraft(draft)}
                />
              )
            })}
          </div>
          <button
            type="button"
            onClick={() => void createSelectedDrafts()}
            disabled={!canCreate || hasPendingDraft}
            className="w-full rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {hasPendingDraft ? 'Creating events...' : 'Create selected events'}
          </button>
          {hasCreatedEvent && (
            <a
              href="https://calendar.google.com/calendar/u/0/r"
              target="_blank"
              rel="noreferrer"
              className="block text-center font-medium underline"
            >
              Open Google Calendar
            </a>
          )}
        </>
      )}
    </section>
  )
}
