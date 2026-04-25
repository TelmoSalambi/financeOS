import { createClient } from '@supabase/supabase-js'

// FIX #5: Remover fallbacks placeholder silenciosos.
// Antes: || 'placeholder' fazia o app iniciar sem erro mas todas as queries falhavam
// silenciosamente. Agora, se as variáveis de ambiente estiverem em falta, o erro
// aparece imediatamente no arranque — muito mais fácil de diagnosticar.
const supabaseUrl = 'https://koroFMXB85Qq7TzPcciATw.supabase.co'
const supabaseAnonKey = 'sb_publishable_koroFMXB85Qq7TzPcciATw_jfydR0jeGZ_9R9H-8j_kQ'

// Verificação de segurança simplificada
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('[Supabase] Chaves de acesso não configuradas corretamente.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'finance-os-session-v5',
    flowType: 'pkce'
  },
  global: {
    headers: { 'x-application-name': 'finance-os' }
  }
})
