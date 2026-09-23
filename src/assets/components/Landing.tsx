import type { Session } from '@supabase/supabase-js'
import { SignIn } from './SignIn'

interface LandingProps {
  appName: string
  onSessionChange?: (session: Session | null) => void
}

export function Landing({ appName, onSessionChange }: LandingProps) {
  return (
    <section className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="max-w-xl space-y-6">
        <h1 className="text-gray-950 text-4xl font-bold tracking-tight sm:text-5xl">
          Welcome to {appName}!
        </h1>
        
        <div className="pt-4">
          <SignIn onSessionChange={onSessionChange} />
        </div>
      </div>
    </section>
  )
}