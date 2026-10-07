import type { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export type SignInResult = { ok: true } | { ok: false; error: string }

/**
 * Thin wrapper around Supabase's passwordless (magic-link) email auth.
 * Sync is entirely opt-in — if no Supabase project is configured, this
 * hook just reports `isConfigured: false` and every action is a no-op.
 */
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(supabase !== null)

  useEffect(() => {
    if (!supabase) return

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  async function signInWithEmail(email: string): Promise<SignInResult> {
    if (!supabase) return { ok: false, error: 'Sync is not configured.' }
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.href } })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  }

  async function signOut(): Promise<void> {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  return {
    isConfigured: supabase !== null,
    session,
    user: session?.user ?? null,
    loading,
    signInWithEmail,
    signOut,
  }
}
