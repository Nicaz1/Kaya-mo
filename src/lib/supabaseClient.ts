import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Null when no Supabase project is configured — sync is entirely optional,
 * so the app must keep working standalone (localStorage-only) without it.
 */
export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null
