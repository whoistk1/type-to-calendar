import { createContext } from 'react'
import type { Session } from '@supabase/supabase-js'

export interface AuthContextValue {
  session: Session | null
  loading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  reauthorizeGoogle: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
