// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Landing } from '../src/features/auth/components/Landing'

describe('Landing', () => {
  afterEach(cleanup)

  it('renders the title, tagline, and sign-in button', () => {
    const onSignIn = vi.fn()
    render(
      <Landing
        appName="Type To Calendar"
        session={null}
        loading={false}
        onSignIn={onSignIn}
        onSignOut={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Type To Calendar' })).toBeInTheDocument()
    expect(
      screen.getByText('Turn plain text into Google Calendar events in seconds.'),
    ).toBeInTheDocument()
    const signInButton = screen.getByRole('button', { name: 'Sign In with Google' })
    expect(signInButton).toBeInTheDocument()
    fireEvent.click(signInButton)
    expect(onSignIn).toHaveBeenCalledOnce()
  })
})
