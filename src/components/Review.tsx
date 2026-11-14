import { useState } from 'react'
import { validateDraft, type EventDraft } from '../features/parser/parseEvent'

interface ReviewProps {
  draft: EventDraft
  selected: boolean
  singleCard?: boolean
  creationState: 'idle' | 'pending' | 'success' | 'failure'
  error?: string
  onChange: (draft: EventDraft) => void
  onToggleSelected: () => void
  onRemove: () => void
  onRetry: () => void
}

function formatEventSummary(draft: EventDraft): string {
  if (!draft.start) return "Blocked Event"
  const start = new Date(draft.start)
  if (isNaN(start.getTime())) return 'Invalid date'

  const dateStr = start.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  if (draft.isAllDay) {
    return `${dateStr} · All day`
  }

  const startTimeStr = start.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })

  if (!draft.end) {
    return `${dateStr} · ${startTimeStr}`
  }

  const end = new Date(draft.end)
  if (isNaN(end.getTime())) {
    return `${dateStr} · ${startTimeStr}`
  }

  const isSameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate()

  const endTimeStr = end.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })

  if (isSameDay) {
    return `${dateStr} · ${startTimeStr}–${endTimeStr}`
  }

  const endDateStr = end.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  return `${dateStr}, ${startTimeStr} – ${endDateStr}, ${endTimeStr}`
}

export function Review({
  draft,
  selected,
  singleCard = false,
  creationState,
  error,
  onChange,
  onToggleSelected,
  onRemove,
  onRetry,
}: ReviewProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [inlineError, setInlineError] = useState<string | null>(null)

  const timeZone =
    typeof Intl !== 'undefined' && Intl.DateTimeFormat
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : 'Local time'

  const effectiveEndError =
    inlineError ||
    (draft.status === 'blocked' &&
    draft.blockedReason === 'The end time must be after the start time.'
      ? draft.blockedReason
      : null)

  function handleStartChange(value: string) {
    if (!value) return
    const newStartIso = toIso(value)
    if (!newStartIso) return

    const newStartTime = new Date(newStartIso).getTime()
    const currentStartTime = new Date(draft.start).getTime()
    const currentEndTime = new Date(draft.end).getTime()

    const duration =
      Number.isFinite(currentStartTime) &&
      Number.isFinite(currentEndTime) &&
      currentEndTime > currentStartTime
        ? currentEndTime - currentStartTime
        : 60 * 60 * 1000

    const newEndTime = newStartTime + duration
    const newEndIso = new Date(newEndTime).toISOString()

    setInlineError(null)
    onChange(
      validateDraft({
        ...draft,
        start: newStartIso,
        end: newEndIso,
      }),
    )
  }

  function handleEndChange(value: string) {
    if (!value) return
    const newEndIso = toIso(value)
    if (!newEndIso) return

    const startTime = new Date(draft.start).getTime()
    const newEndTime = new Date(newEndIso).getTime()

    if (Number.isFinite(startTime) && Number.isFinite(newEndTime) && newEndTime <= startTime) {
      setInlineError('The end time must be after the start time.')
    } else {
      setInlineError(null)
    }

    onChange(
      validateDraft({
        ...draft,
        end: newEndIso,
      }),
    )
  }

  function handleToggleAllDay(isAllDay: boolean) {
    if (isAllDay) {
      const s = new Date(draft.start || Date.now())
      s.setHours(0, 0, 0, 0)
      const e = new Date(draft.start || Date.now())
      e.setHours(23, 59, 59, 999)
      onChange(
        validateDraft({
          ...draft,
          isAllDay: true,
          start: s.toISOString(),
          end: e.toISOString(),
        }),
      )
    } else {
      const s = new Date(draft.start || Date.now())
      s.setHours(9, 0, 0, 0)
      const e = new Date(draft.start || Date.now())
      e.setHours(10, 0, 0, 0)
      onChange(
        validateDraft({
          ...draft,
          isAllDay: false,
          start: s.toISOString(),
          end: e.toISOString(),
        }),
      )
    }
  }

  return (
    <section
      aria-labelledby={`event-review-heading-${draft.id}`}
      className="rounded-xl border border-gray-200 bg-white p-4 text-left text-sm text-gray-700 shadow-xs transition hover:border-gray-300"
    >
      {/* Top Header: Selection + Preview Summary + Remove */}
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
        <div className="flex items-start gap-2.5">
          {!singleCard && (
            <input
              type="checkbox"
              aria-label={`Select ${draft.title || 'event draft'} for creation`}
              checked={selected}
              disabled={draft.status === 'blocked' || creationState === 'success'}
              onChange={onToggleSelected}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-indigo-700 text-sm sm:text-base">
                {formatEventSummary(draft)}
              </span>
            </div>
            {draft.rawText && (
              <p className="mt-0.5 text-xs text-gray-400">
                From: <span className="text-gray-600">&ldquo;{draft.rawText}&rdquo;</span>
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${draft.title || 'event draft'}`}
          className="inline-flex items-center gap-1 rounded-md p-1.5 text-xs text-gray-400 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
          title="Remove event draft"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          <span className="hidden sm:inline">Remove</span>
        </button>
      </div>

      <div className="pt-3 space-y-3">
        <label className="block font-medium text-gray-900">
          Title
          <input
            value={draft.title}
            onChange={(event) => onChange(validateDraft({ ...draft, title: event.target.value }))}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal text-gray-900 shadow-2xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
          />
        </label>

        {draft.status === 'ready' || draft.start || draft.end ? (
          <div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="font-medium text-gray-900">
                <div className="flex items-center justify-between">
                  <span>Starts</span>
                  <span className="text-xs font-normal text-gray-400" title={timeZone}>
                    {timeZone}
                  </span>
                </div>
                <input
                  type={draft.isAllDay ? 'date' : 'datetime-local'}
                  value={
                    draft.isAllDay ? toLocalDateInput(draft.start) : toLocalInput(draft.start)
                  }
                  onChange={(event) => handleStartChange(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal text-gray-900 shadow-2xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                />
              </label>

              <label className="font-medium text-gray-900">
                <div className="flex items-center justify-between">
                  <span>Ends</span>
                  <span className="text-xs font-normal text-gray-400" title={timeZone}>
                    {timeZone}
                  </span>
                </div>
                <input
                  type={draft.isAllDay ? 'date' : 'datetime-local'}
                  value={draft.isAllDay ? toLocalDateInput(draft.end) : toLocalInput(draft.end)}
                  onChange={(event) => handleEndChange(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal text-gray-900 shadow-2xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                />
              </label>
            </div>
            {effectiveEndError && (
              <p className="mt-1.5 text-xs font-medium text-red-600" role="alert">
                {effectiveEndError}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm font-medium text-red-700">Blocked: {draft.blockedReason}</p>
        )}

        {draft.status === 'blocked' &&
          (draft.start || draft.end) &&
          draft.blockedReason !== 'The end time must be after the start time.' && (
            <p className="text-sm font-medium text-red-700">Blocked: {draft.blockedReason}</p>
          )}

        {draft.parseWarning && (
          <p className="text-xs text-amber-700 bg-amber-50 rounded-md p-2 border border-amber-200">
            ⚠️ {draft.parseWarning}
          </p>
        )}

        {draft.durationDefaulted && (
          <p className="text-xs text-gray-500">
            End time defaulted to one hour after the start.
          </p>
        )}

        {/* Collapsible Optional Fields */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
          >
            <span>
              {isExpanded ? 'Hide additional fields' : '+ Add location, description & options'}
            </span>
            <svg
              className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isExpanded && (
            <div className="mt-3 space-y-3 rounded-lg bg-gray-50 p-3 border border-gray-200">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-medium text-gray-700">
                  Location
                  <input
                    type="text"
                    placeholder="Conference Room B, Zoom, etc."
                    value={draft.location || ''}
                    onChange={(e) =>
                      onChange(validateDraft({ ...draft, location: e.target.value }))
                    }
                    className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm font-normal text-gray-900 shadow-2xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </label>

                <label className="block text-xs font-medium text-gray-700">
                  Calendar
                  <select
                    value={draft.calendarId || 'primary'}
                    onChange={(e) =>
                      onChange(validateDraft({ ...draft, calendarId: e.target.value }))
                    }
                    className="mt-1 w-full rounded border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-normal text-gray-900 shadow-2xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer"
                  >
                    <option value="primary">Primary Calendar</option>
                    <option value="work">Work (Google)</option>
                    <option value="personal">Personal (Google)</option>
                  </select>
                </label>
              </div>

              <label className="block text-xs font-medium text-gray-700">
                Description
                <textarea
                  rows={2}
                  placeholder="Notes, agenda, or video call link..."
                  value={draft.description || ''}
                  onChange={(e) =>
                    onChange(validateDraft({ ...draft, description: e.target.value }))
                  }
                  className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm font-normal text-gray-900 shadow-2xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(draft.isAllDay)}
                  onChange={(e) => handleToggleAllDay(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span>All-day event</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Creation Status & Retry */}
      {(creationState !== 'idle' || !singleCard) && (
        <div className="mt-3 flex items-center gap-3 text-xs">
          {creationState === 'pending' && <span className="font-medium text-gray-600">Creating...</span>}
          {creationState === 'success' && <span className="font-medium text-green-700">Created</span>}
          {creationState === 'failure' && (
            <div className="flex items-center gap-2">
              <span className="font-medium text-red-700">{error}</span>
              <button
                type="button"
                onClick={onRetry}
                aria-label={`Retry ${draft.title || 'event draft'}`}
                className="font-medium text-indigo-600 underline hover:text-indigo-800 cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

function toLocalInput(value: string) {
  if (!value) return ''
  const date = new Date(value)
  if (isNaN(date.getTime())) return ''
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function toLocalDateInput(value: string) {
  if (!value) return ''
  const date = new Date(value)
  if (isNaN(date.getTime())) return ''
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

function toIso(value: string) {
  if (!value) return ''
  const date = new Date(value)
  return isNaN(date.getTime()) ? '' : date.toISOString()
}
