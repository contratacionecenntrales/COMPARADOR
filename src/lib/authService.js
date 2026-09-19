import { api } from './apiClient'

/**
 * Autenticación del Panel de Administración vía sesión PHP (cookie
 * httpOnly gestionada por api/auth.php). No hay "listener" en tiempo real
 * como en Supabase Auth: el estado de sesión se comprueba explícitamente
 * (al cargar la página) y se actualiza tras login/logout.
 */

export async function iniciarSesion(email, password) {
  const data = await api.post('auth.php', { email, password }, { action: 'login' })
  return data.user
}

export async function cerrarSesion() {
  try {
    await api.post('auth.php', {}, { action: 'logout' })
  } catch {
    // si la sesión ya no era válida, no pasa nada: seguimos limpiando el estado en el cliente
  }
}

export async function obtenerUsuarioActual() {
  try {
    const data = await api.get('auth.php', { action: 'me' })
    return data.user || null
  } catch {
    return null
  }
}
