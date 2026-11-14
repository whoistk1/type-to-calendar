// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Review } from '../src/components/Review'
import { EventEntry } from '../src/components/EventEntry'
import type { EventDraft } from '../src/features/parser/parseEvent'

describe('Review component', () => {
  afterEach(cleanup)

  const sampleDraft: EventDraft = {
    id: 'test-draft-1',
    title: 'Lunch with Sam',
    description: '',
    rawText: 'Lunch with Sam Friday 12pm',
    start: '2026-11-20T12:00:00.000Z',
    end: '2026-11-20T13:00:00.000Z',
    syncToCalendar: true,
    status: 'ready',
    durationDefaulted: false,
  }

  it('renders a readable summary and the original raw text at the top of the card', () => {
    render(
      <Review
        draft={sampleDraft}
        selected={true}
        singleCard={true}
        creationState="idle"
        onChange={vi.fn()}
        onToggleSelected={vi.fn()}
        onRemove={vi.fn()}
        onRetry={vi.fn()}
      />,
    )

    // Summary preview includes the formatted date and time
    expect(screen.getByText(/Nov 20/)).toBeInTheDocument()
    expect(screen.getByText(/From:/)).toBeInTheDocument()
    expect(screen.getByText(/Lunch with Sam Friday 12pm/)).toBeInTheDocument()

    // Single card hides the selection checkbox
    expect(screen.queryByRole('checkbox', { name: /Select/ })).not.toBeInTheDocument()
  })

  it('renders a selection checkbox when singleCard is false', () => {
    const onToggleSelected = vi.fn()
    render(
      <Review
        draft={sampleDraft}
        selected={true}
        singleCard={false}
        creationState="idle"
        onChange={vi.fn()}
        onToggleSelected={onToggleSelected}
        onRemove={vi.fn()}
        onRetry={vi.fn()}
      />,
    )

    const checkbox = screen.getByRole('checkbox', { name: /Select Lunch with Sam/ })
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).toBeChecked()
    fireEvent.click(checkbox)
    expect(onToggleSelected).toHaveBeenCalledOnce()
  })

  it('collapses optional fields by default and reveals them on click', () => {
    render(
      <Review
        draft={sampleDraft}
        selected={true}
        creationState="idle"
        onChange={vi.fn()}
        onToggleSelected={vi.fn()}
        onRemove={vi.fn()}
        onRetry={vi.fn()}
      />,
    )

    expect(screen.queryByPlaceholderText(/Conference Room B/)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /\+ Add location/ }))

    expect(screen.getByPlaceholderText(/Conference Room B/)).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /All-day event/ })).toBeInTheDocument()
  })

  it('displays the local time zone next to start and end times', () => {
    render(
      <Review
        draft={sampleDraft}
        selected={true}
        creationState="idle"
        onChange={vi.fn()}
        onToggleSelected={vi.fn()}
        onRemove={vi.fn()}
        onRetry={vi.fn()}
      />,
    )

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const timeZoneBadges = screen.getAllByTitle(timeZone)
    expect(timeZoneBadges.length).toBeGreaterThanOrEqual(2)
  })

  it('auto-adjusts the end time when start time changes to preserve duration', () => {
    const onChange = vi.fn()
    render(
      <Review
        draft={sampleDraft}
        selected={true}
        creationState="idle"
        onChange={onChange}
        onToggleSelected={vi.fn()}
        onRemove={vi.fn()}
        onRetry={vi.fn()}
      />,
    )

    const startInput = screen.getByLabelText(/Starts/)
    fireEvent.change(startInput, { target: { value: '2026-11-20T14:00' } })

    expect(onChange).toHaveBeenCalledOnce()
    const updatedDraft = onChange.mock.calls[0][0] as EventDraft
    const updatedStart = new Date(updatedDraft.start).getTime()
    const updatedEnd = new Date(updatedDraft.end).getTime()
    expect(updatedEnd - updatedStart).toBe(60 * 60 * 1000)
  })

  it('shows an inline error if the end time is set before the start time', () => {
    const onChange = vi.fn()
    render(
      <Review
        draft={sampleDraft}
        selected={true}
        creationState="idle"
        onChange={onChange}
        onToggleSelected={vi.fn()}
        onRemove={vi.fn()}
        onRetry={vi.fn()}
      />,
    )

    const endInput = screen.getByLabelText(/Ends/)
    fireEvent.change(endInput, { target: { value: '2026-11-19T10:00' } })

    expect(screen.getByRole('alert')).toHaveTextContent(/The end time must be after the start time/i)
  })
})

describe('EventEntry multiple drafts and Undo toast', () => {
  afterEach(cleanup)

  it('shows Select All / Deselect All control and supports Undo on removal', () => {
    render(<EventEntry />)
    const textarea = screen.getByLabelText('Enter one event per line')
    fireEvent.change(textarea, {
      target: { value: 'Team sync Friday 8pm-9pm\nPlanning Friday 6pm-7pm' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Review events' }))

    // Deselect all button exists
    const toggleSelect = screen.getByRole('button', { name: 'Deselect all' })
    expect(toggleSelect).toBeInTheDocument()

    fireEvent.click(toggleSelect)
    expect(screen.getByRole('button', { name: 'Select all' })).toBeInTheDocument()

    // Remove first card
    const removeButtons = screen.getAllByRole('button', { name: /Remove/ })
    fireEvent.click(removeButtons[0])

    // Undo toast appears
    const undoButton = screen.getByRole('button', { name: 'Undo' })
    expect(undoButton).toBeInTheDocument()

    // Clicking Undo restores the card
    fireEvent.click(undoButton)
    expect(screen.getAllByLabelText('Title')).toHaveLength(2)
  })
})
