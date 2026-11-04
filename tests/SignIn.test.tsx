// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { Session } from '@supabase/supabase-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SignIn } from '../src/features/auth/components/SignIn'

const session = { user: { email: 'calendar@example.com' } } as Session

describe('SignIn', () => {
  afterEach(cleanup)

  it('renders the sign-in action without owning auth state', () => {
    const onSignIn = vi.fn()
    render(
      <SignIn
        session={null}
        loading={false}
        onSignIn={onSignIn}
        onSignOut={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Sign In with Google' }))
    expect(onSignIn).toHaveBeenCalledOnce()
  })

  it('renders sign out for an authenticated session', () => {
    const onSignOut = vi.fn()
    render(
      <SignIn
        session={session}
        loading={false}
        onSignIn={vi.fn()}
        onSignOut={onSignOut}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Sign out of Google Calendar' }))
    expect(onSignOut).toHaveBeenCalledOnce()
  })
})
