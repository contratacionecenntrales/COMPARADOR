import { supabase, isSupabaseConfigured } from './supabaseClient'

export async function iniciarSesion(email, password) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase no está configurado. Añade VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu .env')
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.session
}

export async function cerrarSesion() {
  if (!isSupabaseConfigured) return
  await supabase.auth.signOut()
}

export async function obtenerSesionActual() {
  if (!isSupabaseConfigured) return null
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function esPerfilAdmin(userId) {
  if (!isSupabaseConfigured || !userId) return false
  const { data, error } = await supabase.from('perfiles').select('id, rol').eq('id', userId).maybeSingle()
  if (error) return false
  return Boolean(data)
}

export function onAuthStateChange(callback) {
  if (!isSupabaseConfigured) return { data: { subscription: { unsubscribe() {} } } }
  return supabase.auth.onAuthStateChange((_event, session) => callback(session))
}
