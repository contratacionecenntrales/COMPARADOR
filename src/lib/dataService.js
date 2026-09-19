import { supabase, isSupabaseConfigured } from './supabaseClient'
import { FALLBACK_ENERGIA, FALLBACK_TELEFONIA, FALLBACK_ALARMAS } from './fallbackData'

const TABLES = {
  energia: 'tarifa_energia',
  telefonia: 'tarifa_telefonia',
  alarmas: 'tarifa_alarmas',
}

const FALLBACKS = {
  energia: FALLBACK_ENERGIA,
  telefonia: FALLBACK_TELEFONIA,
  alarmas: FALLBACK_ALARMAS,
}

const ORDER_COL = {
  energia: 'nombre_tarifa',
  telefonia: 'nombre_tarifa',
  alarmas: 'nombre_kit',
}

/**
 * Lista tarifas de un catálogo. Si Supabase no está configurado, usa el
 * dataset local (fallbackData.js) para que el comparador funcione desde
 * el primer arranque sin necesidad de backend.
 */
export async function listarTarifas(catalogo, { soloActivas = true } = {}) {
  if (!isSupabaseConfigured) {
    const data = FALLBACKS[catalogo]
    return soloActivas ? data.filter((t) => t.activo) : data
  }

  let query = supabase.from(TABLES[catalogo]).select('*').order(ORDER_COL[catalogo])
  if (soloActivas) query = query.eq('activo', true)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function crearTarifa(catalogo, payload) {
  if (!isSupabaseConfigured) throw new Error('Supabase no está configurado en este entorno.')
  const { data, error } = await supabase.from(TABLES[catalogo]).insert(payload).select().single()
  if (error) throw error
  return data
}

export async function actualizarTarifa(catalogo, id, payload) {
  if (!isSupabaseConfigured) throw new Error('Supabase no está configurado en este entorno.')
  const { data, error } = await supabase.from(TABLES[catalogo]).update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function eliminarTarifa(catalogo, id) {
  if (!isSupabaseConfigured) throw new Error('Supabase no está configurado en este entorno.')
  const { error } = await supabase.from(TABLES[catalogo]).delete().eq('id', id)
  if (error) throw error
}

export async function guardarAuditoria(auditoria) {
  if (!isSupabaseConfigured) {
    console.info('[demo] Auditoría no persistida (Supabase no configurado):', auditoria)
    return { id: `local-${Date.now()}`, ...auditoria }
  }
  const { data, error } = await supabase.from('auditorias_clientes').insert(auditoria).select().single()
  if (error) throw error
  return data
}

export async function listarAuditorias({ sector, limit = 50 } = {}) {
  if (!isSupabaseConfigured) return []
  let query = supabase.from('auditorias_clientes').select('*').order('created_at', { ascending: false }).limit(limit)
  if (sector) query = query.eq('sector', sector)
  const { data, error } = await query
  if (error) throw error
  return data
}
