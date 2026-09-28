import type { EventDraft } from '../lib/parseEvent'

interface ReviewProps {
  draft: EventDraft
  selected: boolean
  creationState: 'idle' | 'pending' | 'success' | 'failure'
  error?: string
  onChange: (draft: EventDraft) => void
  onToggleSelected: () => void
  onRemove: () => void
  onRetry: () => void
}

export function Review({
  draft,
  selected,
  creationState,
  error,
  onChange,
  onToggleSelected,
  onRemove,
  onRetry,
}: ReviewProps) {
  const updateDraft = (field: 'title' | 'start' | 'end', value: string) => {
    onChange({ ...draft, [field]: field === 'start' || field === 'end' ? toIso(value) : value })
  }

  return (
    <section
      aria-labelledby={`event-review-heading-${draft.id}`}
      className="rounded-lg border border-gray-200 bg-white p-4 text-left text-sm text-gray-700"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 id={`event-review-heading-${draft.id}`} className="font-medium text-gray-900">
          Event draft
        </h2>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${draft.title || 'event draft'}`}
          className="text-sm text-gray-500 underline"
        >
          Remove
        </button>
      </div>

      <label className="mt-3 block font-medium text-gray-900">
        Title
        <input
          value={draft.title}
          onChange={(event) => updateDraft('title', event.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 font-normal"
        />
      </label>

      {draft.status === 'ready' ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="font-medium text-gray-900">
            Starts
            <input
              type="datetime-local"
              value={toLocalInput(draft.start)}
              onChange={(event) => updateDraft('start', event.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 font-normal"
            />
          </label>
          <label className="font-medium text-gray-900">
            Ends
            <input
              type="datetime-local"
              value={toLocalInput(draft.end)}
              onChange={(event) => updateDraft('end', event.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 font-normal"
            />
          </label>
        </div>
      ) : (
        <p className="mt-3 text-red-700">Blocked: {draft.blockedReason}</p>
      )}

      {draft.durationDefaulted && (
        <p className="mt-2 text-gray-600">End time defaulted to one hour after the start.</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            aria-label={`Select ${draft.title || 'event draft'} for creation`}
            checked={selected}
            disabled={draft.status === 'blocked' || creationState === 'success'}
            onChange={onToggleSelected}
          />
          Select for creation
        </label>
        {creationState === 'pending' && <span>Creating...</span>}
        {creationState === 'success' && <span className="text-green-700">Created</span>}
        {creationState === 'failure' && (
          <>
            <span className="text-red-700">{error}</span>
            <button
              type="button"
              onClick={onRetry}
              aria-label={`Retry ${draft.title || 'event draft'}`}
              className="underline"
            >
              Retry
            </button>
          </>
        )}
      </div>
    </section>
  )
}

function toLocalInput(value: string) {
  if (!value) return ''
  const date = new Date(value)
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function toIso(value: string) {
  return value ? new Date(value).toISOString() : ''
}