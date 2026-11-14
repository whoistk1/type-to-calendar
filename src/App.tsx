import { AuthProvider } from './features/auth/AuthProvider'
import { useSession } from './features/auth/useSession'
import { Landing } from './features/auth/components/Landing'
import { SignIn } from './features/auth/components/SignIn'
import { EventEntry } from './components/EventEntry'
import {
  createGoogleCalendarEvent,
  GoogleCalendarAuthorizationError,
} from './features/calendar/api'
import './App.css'

function CalendarApp() {
  const { session, loading, signIn, signOut, reauthorizeGoogle } = useSession()

  async function handleCreateEvent(event: Parameters<typeof createGoogleCalendarEvent>[1]) {
    if (!session) throw new Error('You must be signed in to create events.')
    try {
      return await createGoogleCalendarEvent(session, event)
    } catch (error) {
      if (error instanceof GoogleCalendarAuthorizationError) {
        await reauthorizeGoogle()
      }
      throw error
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {session ? (
        <>
          <header className="w-full border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="mx-auto flex max-w-4xl items-center justify-between">
              <span className="font-semibold text-gray-900 tracking-tight text-lg">
                Type To Calendar
              </span>
              <SignIn
                session={session}
                loading={loading}
                onSignIn={() => void signIn()}
                onSignOut={() => void signOut()}
              />
            </div>
          </header>
          <div className="flex-1 flex flex-col justify-center px-4 py-8">
            <section className="mx-auto w-full max-w-xl">
              <h1 className="mb-2 text-3xl font-bold text-gray-950 text-center tracking-tight">
                Create an event
              </h1>
              <EventEntry onCreateEvent={handleCreateEvent} />
            </section>
          </div>
        </>
      ) : (
        <Landing
          appName="Type To Calendar"
          session={session}
          loading={loading}
          onSignIn={() => void signIn()}
          onSignOut={() => void signOut()}
        />
      )}
    </main>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CalendarApp />
    </AuthProvider>
  )
}