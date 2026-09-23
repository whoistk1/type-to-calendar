import type { ParsedEvent } from './parseEvent'

interface ReviewProps {
  event: ParsedEvent
}

export function Review({ event }: ReviewProps) {
  return (
    <section
      aria-labelledby="event-review-heading"
      className="rounded-lg border border-gray-200 bg-white p-4 text-left text-sm text-gray-700"
    >
      <h2 id="event-review-heading" className="mb-3 font-medium text-gray-900">
        Review event
      </h2>
      <dl className="space-y-1">
        <div>
          <dt className="inline font-medium">Title: </dt>
          <dd className="inline">{event.title}</dd>
        </div>
        <div>
          <dt className="inline font-medium">Starts: </dt>
          <dd className="inline">{new Date(event.start).toLocaleString()}</dd>
        </div>
        <div>
          <dt className="inline font-medium">Ends: </dt>
          <dd className="inline">{new Date(event.end).toLocaleString()}</dd>
        </div>
      </dl>
    </section>
  )
}