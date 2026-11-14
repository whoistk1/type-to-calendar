import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
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
  const [isParsing, setIsParsing] = useState(false)
  const [lastRemoved, setLastRemoved] = useState<{ draft: EventDraft; index: number } | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const {
    state,
    dispatch,
    parseText,
    createDraft,
    createSelectedDrafts,
    selectAll,
    deselectAll,
    restoreDraft,
  } = useDrafts(onCreateEvent)
  const { drafts, selectedIds, draftStates, message } = state
  const readyCount = drafts.filter((draft) => draft.status === 'ready').length
  const blockedCount = drafts.filter((draft) => draft.status === 'blocked').length
  const allReadySelected =
    readyCount > 0 &&
    drafts.filter((draft) => draft.status === 'ready').every((draft) => selectedIds.has(draft.id))

  const hasPendingDraft = Object.values(draftStates).some(
    (state) => state.creationState === 'pending',
  )
  const canCreate = drafts.some((draft) => draft.status === 'ready' && selectedIds.has(draft.id))
  const hasCreatedEvent = Object.values(draftStates).some(
    (state) => state.creationState === 'success',
  )

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.max(160, el.scrollHeight)}px`
  }, [text])

  useEffect(() => {
    if (!lastRemoved) return
    const timer = setTimeout(() => setLastRemoved(null), 6000)
    return () => clearTimeout(timer)
  }, [lastRemoved])

  function handleParse() {
    if (!text.trim() || isParsing) return
    setIsParsing(true)
    try {
      parseText(text)
    } finally {
      setIsParsing(false)
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault()
      handleParse()
    }
  }

  function handleRemoveDraft(draft: EventDraft, index: number) {
    setLastRemoved({ draft, index })
    dispatch({ type: 'removed', id: draft.id })
  }

  function handleUndoRemove() {
    if (!lastRemoved) return
    restoreDraft(lastRemoved.draft, lastRemoved.index)
    setLastRemoved(null)
  }

  return (
    <section className="w-full max-w-xl space-y-4">
      <div className="space-y-1 text-center">
        <label
          htmlFor="event-entry"
          className="block text-base sm:text-lg font-normal text-gray-600"
        >
          Enter one event per line
        </label>
      </div>

      <textarea
        ref={textareaRef}
        id="event-entry"
        value={text}
        placeholder={'Team sync tomorrow at 2pm\nBiology Final December 11 2pm-5pm'}
        onChange={(event) => {
          const nextText = event.target.value
          setText(nextText)
          dispatch({ type: 'textChanged', text: nextText })
        }}
        onKeyDown={handleKeyDown}
        className="min-h-40 sm:min-h-48 w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-gray-900 shadow-xs transition hover:border-gray-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 focus:shadow-md outline-none placeholder:text-gray-400"
      />

      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={handleParse}
          disabled={!text.trim() || isParsing}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none cursor-pointer"
        >
          {isParsing ? (
            <>
              <svg
                className="h-4 w-4 animate-spin text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              <span>Parsing events...</span>
            </>
          ) : (
            <span>Review events</span>
          )}
        </button>

        <p className="text-center text-xs text-gray-700">
          Press <kbd className="rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-sans font-medium text-gray-600">Ctrl</kbd> + <kbd className="rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-sans font-medium text-gray-600">Enter</kbd> to review
        </p>
      </div>

      {message && <p className="text-sm text-gray-600" role="status">{message}</p>}

      {lastRemoved && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center justify-between rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg transition"
        >
          <span>
            Removed <strong className="font-semibold">&ldquo;{lastRemoved.draft.title || 'event draft'}&rdquo;</strong>
          </span>
          <button
            type="button"
            onClick={handleUndoRemove}
            className="ml-4 font-semibold text-indigo-300 hover:text-white transition underline cursor-pointer"
          >
            Undo
          </button>
        </div>
      )}

      {drafts.length > 0 && (
        <>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>
              {readyCount} events ready, {blockedCount} blocked
            </p>
            {drafts.length > 1 && readyCount > 0 && (
              <button
                type="button"
                onClick={() => (allReadySelected ? deselectAll() : selectAll())}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
              >
                {allReadySelected ? 'Deselect all' : 'Select all'}
              </button>
            )}
          </div>

          <div className="space-y-3">
            {drafts.map((draft, index) => {
              const state = draftStates[draft.id] ?? { creationState: 'idle' as const }
              return (
                <Review
                  key={draft.id}
                  draft={draft}
                  singleCard={drafts.length === 1}
                  selected={selectedIds.has(draft.id)}
                  creationState={state.creationState}
                  error={state.error}
                  onChange={(updatedDraft) => dispatch({ type: 'draftChanged', draft: updatedDraft })}
                  onToggleSelected={() => dispatch({ type: 'selected', id: draft.id })}
                  onRemove={() => handleRemoveDraft(draft, index)}
                  onRetry={() => void createDraft(draft)}
                />
              )
            })}
          </div>
          <button
            type="button"
            onClick={() => void createSelectedDrafts()}
            disabled={!canCreate || hasPendingDraft}
            aria-label="Create selected events"
            className="w-full rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer shadow-sm"
          >
            {hasPendingDraft
              ? 'Creating events...'
              : drafts.length === 1
                ? 'Create event'
                : 'Create selected events'}
          </button>
          {hasCreatedEvent && (
            <a
              href="https://calendar.google.com/calendar/u/0/r"
              target="_blank"
              rel="noreferrer"
              className="block text-center font-medium text-indigo-600 hover:text-indigo-800 underline"
            >
              Open Google Calendar
            </a>
          )}
        </>
      )}
    </section>
  )
}
