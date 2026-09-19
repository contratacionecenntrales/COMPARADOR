import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('TU-PROYECTO')
)

// En desarrollo sin credenciales configuradas, exportamos un cliente "vacío"
// para que la app no rompa: las pantallas que dependen de Supabase muestran
// un aviso en vez de lanzar una excepción.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
