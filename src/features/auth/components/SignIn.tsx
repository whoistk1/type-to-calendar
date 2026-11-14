import type { Session } from '@supabase/supabase-js'

interface SignInProps {
  session: Session | null
  loading: boolean
  onSignIn: () => void
  onSignOut: () => void
}

function GoogleIcon() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  )
}

export function SignIn({ session, loading, onSignIn, onSignOut }: SignInProps) {
  if (loading) {
    return <div className="text-gray-500 text-sm">Loading authentication state...</div>
  }

  const email = session?.user?.email
  const avatarUrl = (session?.user?.user_metadata?.avatar_url ||
    session?.user?.user_metadata?.picture) as string | undefined
  const fullName = (session?.user?.user_metadata?.full_name ||
    session?.user?.user_metadata?.name) as string | undefined
  const initial = (fullName?.[0] || email?.[0] || 'U').toUpperCase()

  return (
    <div className="flex items-center gap-3">
      {session ? (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName || email || 'User avatar'}
                className="h-7 w-7 rounded-full border border-gray-200 object-cover"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                {initial}
              </div>
            )}
            {email && (
              <span
                className="hidden text-sm text-gray-700 sm:inline max-w-50 truncate"
                title={email}
              >
                {email}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onSignOut}
            aria-label="Sign out of Google Calendar"
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onSignIn}
          aria-label="Sign In with Google"
          className="flex items-center justify-center gap-3 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 cursor-pointer"
        >
          <GoogleIcon />
          <span>Sign In with Google</span>
        </button>
      )}
    </div>
  )
}
