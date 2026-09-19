/**
 * Cliente HTTP para la API PHP (api/*.php). En producción el frontend y la
 * API viven en el mismo dominio de Hostalia, así que basta con rutas
 * relativas ("/api/..."). En desarrollo, Vite hace de proxy hacia un
 * servidor PHP local (ver vite.config.js y README).
 */

const API_BASE = '/api'

async function request(path, { method = 'GET', body, params } = {}) {
  let url = `${API_BASE}/${path}`
  if (params) {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
    ).toString()
    if (query) url += `?${query}`
  }

  const res = await fetch(url, {
    method,
    credentials: 'include', // envía/recibe la cookie de sesión del admin
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })

  let data = null
  try {
    data = await res.json()
  } catch {
    // respuesta sin cuerpo JSON (raro, pero no debería romper el flujo)
  }

  if (!res.ok) {
    const message = data?.error || `Error ${res.status} al comunicar con el servidor.`
    const error = new Error(message)
    error.status = res.status
    throw error
  }

  return data
}

export const api = {
  get: (path, params) => request(path, { params }),
  post: (path, body, params) => request(path, { method: 'POST', body, params }),
  put: (path, body, params) => request(path, { method: 'PUT', body, params }),
  delete: (path, params) => request(path, { method: 'DELETE', params }),
}
