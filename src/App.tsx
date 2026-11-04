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
    <main className="min-h-screen bg-gray-50">
      {session ? (
        <section className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4 py-8">
          <h1 className="mb-6 text-3xl font-bold text-gray-950 text-center">Create an event</h1>
          <EventEntry onCreateEvent={handleCreateEvent} />
          <div className="pt-4">
            <SignIn
              session={session}
              loading={loading}
              onSignIn={() => void signIn()}
              onSignOut={() => void signOut()}
            />
          </div>
        </section>
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