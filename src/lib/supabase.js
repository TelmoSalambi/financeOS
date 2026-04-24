import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'finance-os-session-v4', // New key to clear old corrupted state
    flowType: 'pkce'
  },
  // Disable default locking mechanism which causes NavigatorLockAcquireTimeoutError
  global: {
    headers: { 'x-application-name': 'finance-os' }
  }
})
