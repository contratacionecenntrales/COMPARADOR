import { api } from './apiClient'
import { FALLBACK_ENERGIA, FALLBACK_TELEFONIA, FALLBACK_ALARMAS } from './fallbackData'

const FALLBACKS = {
  energia: FALLBACK_ENERGIA,
  telefonia: FALLBACK_TELEFONIA,
  alarmas: FALLBACK_ALARMAS,
}

/**
 * Comprueba si la API PHP (api/ping.php) responde. Se usa solo para decidir
 * si mostrar el aviso de "modo demo" en la interfaz; los propios métodos de
 * abajo ya hacen su propio fallback a datos locales si la API no responde.
 */
export async function comprobarConexionAPI() {
  try {
    const res = await api.get('ping.php')
    return Boolean(res?.ok)
  } catch {
    return false
  }
}

/**
 * Lista tarifas de un catálogo ('energia' | 'telefonia' | 'alarmas').
 * Si la API PHP no está disponible (backend caído o no configurado en este
 * entorno), recurre al dataset local de ejemplo para que el comparador
 * siga siendo funcional en modo demo.
 */
export async function listarTarifas(catalogo, { soloActivas = true } = {}) {
  try {
    return await api.get('tarifas.php', { catalogo, soloActivas: soloActivas ? '1' : '0' })
  } catch (err) {
    if (err.status) throw err // la API respondió con un error real (p.ej. 401 en admin): no lo ocultes
    const data = FALLBACKS[catalogo] || []
    return soloActivas ? data.filter((t) => t.activo) : data
  }
}

export async function crearTarifa(catalogo, payload) {
  return api.post('tarifas.php', payload, { catalogo })
}

export async function actualizarTarifa(catalogo, id, payload) {
  return api.put('tarifas.php', payload, { catalogo, id })
}

export async function eliminarTarifa(catalogo, id) {
  return api.delete('tarifas.php', { catalogo, id })
}

export async function guardarAuditoria(auditoria) {
  try {
    return await api.post('auditorias.php', auditoria)
  } catch (err) {
    if (err.status) throw err
    console.info('[demo] Auditoría no persistida (API no disponible):', auditoria)
    return { id: `local-${Date.now()}`, ...auditoria }
  }
}

export async function listarAuditorias({ sector, limit = 50 } = {}) {
  try {
    return await api.get('auditorias.php', { sector, limit })
  } catch {
    return []
  }
}
