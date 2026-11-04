import type { Session } from '@supabase/supabase-js'

interface SignInProps {
  session: Session | null
  loading: boolean
  onSignIn: () => void
  onSignOut: () => void
}

export function SignIn({ session, loading, onSignIn, onSignOut }: SignInProps) {
  if (loading) {
    return <div className="text-gray-500 text-sm">Loading authentication state...</div>
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {session ? (
        <button
          type="button"
          onClick={onSignOut}
          aria-label="Sign out of Google Calendar"
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
        >
          Sign Out
        </button>
      ) : (
        <button
          type="button"
          onClick={onSignIn}
          className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-sm"
        >
          Sign In with Google
        </button>
      )}
    </div>
  )
}
