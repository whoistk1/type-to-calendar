import { useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { parseLine, type EventDraft } from '../lib/parseEvent'
import type { GoogleCalendarEventResponse } from '../lib/googleCalendar'
import { Review } from './Review'
import { SignIn } from './SignIn'

export type { ParsedEvent } from '../lib/parseEvent'

interface EventEntryProps {
  onCreateEvent?: (draft: EventDraft) => Promise<GoogleCalendarEventResponse>
  onSessionChange?: (session: Session | null) => void
}

type CreationState = 'idle' | 'pending' | 'success' | 'failure'
type DraftState = {
  creationState: CreationState
  error?: string
}

export function EventEntry({ onCreateEvent, onSessionChange }: EventEntryProps) {
  const [text, setText] = useState('')
  const [drafts, setDrafts] = useState<EventDraft[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [draftStates, setDraftStates] = useState<Record<string, DraftState>>({})
  const [message, setMessage] = useState<string | null>(null)

  function handleParse() {
    const nextDrafts = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => parseLine(line))

    setDrafts(nextDrafts)
    setSelectedIds(new Set(nextDrafts.filter((draft) => draft.status === 'ready').map((draft) => draft.id)))
    setDraftStates({})
    setMessage(nextDrafts.length ? 'Review and edit your event drafts.' : 'Add at least one event line.')
  }

  function updateDraft(updatedDraft: EventDraft) {
    setDrafts((currentDrafts) =>
      currentDrafts.map((draft) => (draft.id === updatedDraft.id ? updatedDraft : draft)),
    )
  }

  function toggleSelected(id: string) {
    setSelectedIds((currentIds) => {
      const nextIds = new Set(currentIds)
      if (nextIds.has(id)) nextIds.delete(id)
      else nextIds.add(id)
      return nextIds
    })
  }

  function removeDraft(id: string) {
    setDrafts((currentDrafts) => currentDrafts.filter((draft) => draft.id !== id))
    setSelectedIds((currentIds) => {
      const nextIds = new Set(currentIds)
      nextIds.delete(id)
      return nextIds
    })
  }

  async function createDraft(draft: EventDraft) {
    if (!onCreateEvent || draft.status === 'blocked') return

    setDraftStates((currentStates) => ({
      ...currentStates,
      [draft.id]: { creationState: 'pending' },
    }))

    try {
      await onCreateEvent(draft)
      setDraftStates((currentStates) => ({
        ...currentStates,
        [draft.id]: {
          creationState: 'success',
        },
      }))
    } catch (error) {
      setDraftStates((currentStates) => ({
        ...currentStates,
        [draft.id]: {
          creationState: 'failure',
          error: error instanceof Error ? error.message : 'Unable to save this event.',
        },
      }))
    }
  }

  async function createSelectedDrafts() {
    const selectedDrafts = drafts.filter(
      (draft) => selectedIds.has(draft.id) && draft.status === 'ready',
    )
    if (!selectedDrafts.length) {
      setMessage('Select at least one ready event to create.')
      return
    }

    setMessage(null)
    for (const draft of selectedDrafts) {
      await createDraft(draft)
    }
  }

  const readyCount = drafts.filter((draft) => draft.status === 'ready').length
  const blockedCount = drafts.filter((draft) => draft.status === 'blocked').length
  const hasPendingDraft = Object.values(draftStates).some(
    (state) => state.creationState === 'pending',
  )
  const canCreate = drafts.some(
    (draft) => draft.status === 'ready' && selectedIds.has(draft.id),
  )
  const hasCreatedEvent = Object.values(draftStates).some(
    (state) => state.creationState === 'success',
  )

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
          setText(event.target.value)
          setDrafts([])
          setDraftStates({})
          setMessage(null)
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
                  onChange={updateDraft}
                  onToggleSelected={() => toggleSelected(draft.id)}
                  onRemove={() => removeDraft(draft.id)}
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

      <div className="pt-4">
        <SignIn onSessionChange={onSessionChange} />
      </div>

    </section>
  )
}
