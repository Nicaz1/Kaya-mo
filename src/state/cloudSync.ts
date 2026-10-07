import { supabase } from '../lib/supabaseClient'
import type { AppState } from '../types'

const TABLE = 'kaya_state'

export async function pushState(userId: string, state: AppState): Promise<void> {
  if (!supabase) return
  await supabase.from(TABLE).upsert({ user_id: userId, state, updated_at: new Date().toISOString() })
}

/** Returns null if nothing has ever been synced for this user (or sync isn't configured). */
export async function pullState(userId: string): Promise<AppState | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from(TABLE).select('state').eq('user_id', userId).maybeSingle()
  if (error || !data) return null
  return data.state as AppState
}
