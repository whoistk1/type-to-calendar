// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import type { Session } from '@supabase/supabase-js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  onAuthStateChange: vi.fn(),
  getSession: vi.fn(),
}))

vi.mock('../src/lib/supabaseClient', () => ({
  supabase: { auth: authMock },
}))

import { SignIn } from '../src/components/SignIn'

const restoredSession = {
  user: { email: 'calendar@example.com' },
} as Session

describe('SignIn session state', () => {
  beforeEach(() => {
    authMock.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('restores a signed-in session on mount', async () => {
    authMock.getSession.mockResolvedValue({ data: { session: restoredSession } })
    const onSessionChange = vi.fn()

    render(<SignIn onSessionChange={onSessionChange} />)

    expect(
      await screen.findByRole('button', { name: 'Sign out of Google Calendar' }),
    ).toBeInTheDocument()
    await waitFor(() => expect(onSessionChange).toHaveBeenCalledWith(restoredSession))
  })

  it('shows only the sign-in action when no session is restored', async () => {
    authMock.getSession.mockResolvedValue({ data: { session: null } })

    render(<SignIn />)

    expect(await screen.findByRole('button', { name: 'Sign In with Google' })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Sign out of Google Calendar' }),
    ).not.toBeInTheDocument()
  })
})
