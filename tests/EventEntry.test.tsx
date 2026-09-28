// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { EventEntry } from '../src/components/EventEntry'

const input = 'Team sync Friday 8pm-9pm\nPlanning Friday 6pm-7pm'

function reviewEvents(onCreateEvent: ReturnType<typeof vi.fn>) {
  render(<EventEntry onCreateEvent={onCreateEvent} />)
  fireEvent.change(screen.getByLabelText('Enter one event per line'), {
    target: { value: input },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Review events' }))
}

describe('EventEntry', () => {
  afterEach(() => {
    cleanup()
  })

  it('sends edited draft fields to the creation callback', async () => {
    const onCreateEvent = vi.fn().mockResolvedValue({ id: 'google-id' })
    reviewEvents(onCreateEvent)

    const titleFields = screen.getAllByLabelText('Title')
    fireEvent.change(titleFields[0], { target: { value: 'Updated sync' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create selected events' }))

    await waitFor(() => expect(onCreateEvent).toHaveBeenCalledTimes(2))
    expect(onCreateEvent.mock.calls[0][0]).toEqual(
      expect.objectContaining({ title: 'Updated sync' }),
    )
  })

  it('keeps successful drafts and retries only a failed draft', async () => {
    const onCreateEvent = vi
      .fn()
      .mockResolvedValueOnce({ id: 'first-google-id', htmlLink: 'https://calendar.google.com/first' })
      .mockRejectedValueOnce(new Error('Temporary Calendar failure'))
      .mockResolvedValueOnce({ id: 'second-google-id', htmlLink: 'https://calendar.google.com/second' })
    reviewEvents(onCreateEvent)

    fireEvent.click(screen.getByRole('button', { name: 'Create selected events' }))

    await waitFor(() => expect(screen.getByText('Temporary Calendar failure')).toBeInTheDocument())
    expect(screen.getByText('Created')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Retry Planning' }))

    await waitFor(() => expect(onCreateEvent).toHaveBeenCalledTimes(3))
    expect(screen.getAllByText('Created')).toHaveLength(2)
  })
})
