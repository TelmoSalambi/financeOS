import { createClient } from '@supabase/supabase-js'

// FIX #5: Remover fallbacks placeholder silenciosos.
// Antes: || 'placeholder' fazia o app iniciar sem erro mas todas as queries falhavam
// silenciosamente. Agora, se as variáveis de ambiente estiverem em falta, o erro
// aparece imediatamente no arranque — muito mais fácil de diagnosticar.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[Supabase] Variáveis de ambiente em falta.\n' +
    'Verifica se VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão definidas:\n' +
    '  - Localmente: ficheiro .env na raiz do projeto\n' +
    '  - Vercel: Settings → Environment Variables'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'finance-os-session-v4',
    flowType: 'pkce'
  },
  global: {
    headers: { 'x-application-name': 'finance-os' }
  }
})
