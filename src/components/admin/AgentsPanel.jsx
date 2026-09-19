import { useEffect, useState } from 'react'
import { Plus, Trash2, Loader2, RefreshCw, Users } from 'lucide-react'
import { TextField, SelectField } from '../common/Field'
import { listarAgentes, crearAgente, actualizarAgente, eliminarAgente } from '../../lib/dataService'

const ROL_LABEL = {
  admin: 'Administrador',
  jefe_equipo: 'Jefe de equipo',
  gestor_comercial: 'Gestor comercial',
}

const FORM_VACIO = { nombre: '', email: '', password: '', rol: 'gestor_comercial', supervisor_id: '' }

export default function AgentsPanel({ usuarioActual }) {
  const [agentes, setAgentes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(FORM_VACIO)
  const [creando, setCreando] = useState(false)

  const esAdmin = usuarioActual.rol === 'admin'
  const posiblesSupervisores = agentes.filter((a) => a.rol === 'admin' || a.rol === 'jefe_equipo')

  async function cargar() {
    setLoading(true)
    setError(null)
    try {
      setAgentes(await listarAgentes())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleCrear(e) {
    e.preventDefault()
    setCreando(true)
    setError(null)
    try {
      const payload = esAdmin
        ? { ...form, supervisor_id: form.supervisor_id || null }
        : { nombre: form.nombre, email: form.email, password: form.password }
      await crearAgente(payload)
      setForm(FORM_VACIO)
      await cargar()
    } catch (err) {
      setError(err.message)
    } finally {
      setCreando(false)
    }
  }

  async function handleCambio(agente, patch) {
    try {
      const actualizado = await actualizarAgente(agente.id, patch)
      setAgentes((as) => as.map((a) => (a.id === agente.id ? actualizado : a)))
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleEliminar(agente) {
    if (!window.confirm(`¿Eliminar a ${agente.nombre}? Esta acción no se puede deshacer.`)) return
    try {
      await eliminarAgente(agente.id)
      setAgentes((as) => as.filter((a) => a.id !== agente.id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-base font-semibold text-brand-navy">
          <Users size={18} /> Agentes {usuarioActual.rol === 'jefe_equipo' && <span className="text-sm font-normal text-slate-400">— tu equipo</span>}
        </h3>
        <button onClick={cargar} className="btn-ghost !px-3 !py-1.5 text-xs">
          <RefreshCw size={14} /> Refrescar
        </button>
      </div>

      {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

      <form onSubmit={handleCrear} className="card mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <TextField label="Nombre" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
        <TextField label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <TextField
          label="Contraseña"
          type="password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {esAdmin && (
          <>
            <SelectField label="Rol" value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
              <option value="gestor_comercial">Gestor comercial</option>
              <option value="jefe_equipo">Jefe de equipo</option>
              <option value="admin">Administrador</option>
            </SelectField>
            <SelectField
              label="Supervisor (opcional)"
              value={form.supervisor_id}
              onChange={(e) => setForm({ ...form, supervisor_id: e.target.value })}
            >
              <option value="">— Sin supervisor —</option>
              {posiblesSupervisores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} ({ROL_LABEL[s.rol]})
                </option>
              ))}
            </SelectField>
          </>
        )}
        <div className="flex items-end sm:col-span-2 lg:col-span-1">
          <button type="submit" disabled={creando} className="btn-primary w-full">
            {creando ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
            Añadir agente
          </button>
        </div>
      </form>

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
          <Loader2 className="animate-spin" size={16} /> Cargando agentes…
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">Nombre</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">Email</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">Rol</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">Supervisor</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">Activo</th>
                {esAdmin && <th className="px-3 py-2" />}
              </tr>
            </thead>
            <tbody>
              {agentes.map((a) => (
                <tr key={a.id} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-medium text-brand-navy">
                    {a.nombre} {a.id === usuarioActual.id && <span className="text-xs text-slate-400">(tú)</span>}
                  </td>
                  <td className="px-3 py-2 text-slate-500">{a.email}</td>
                  <td className="px-3 py-2">
                    {esAdmin ? (
                      <select
                        value={a.rol}
                        onChange={(e) => handleCambio(a, { rol: e.target.value })}
                        className="rounded border border-slate-200 px-2 py-1 text-xs"
                      >
                        <option value="gestor_comercial">Gestor comercial</option>
                        <option value="jefe_equipo">Jefe de equipo</option>
                        <option value="admin">Administrador</option>
                      </select>
                    ) : (
                      ROL_LABEL[a.rol]
                    )}
                  </td>
                  <td className="px-3 py-2 text-slate-500">{a.supervisor_nombre || '—'}</td>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={a.activo}
                      onChange={(e) => handleCambio(a, { activo: e.target.checked })}
                      className="h-4 w-4 accent-brand-gold"
                    />
                  </td>
                  {esAdmin && (
                    <td className="px-3 py-2">
                      {a.id !== usuarioActual.id && (
                        <button onClick={() => handleEliminar(a)} className="rounded bg-red-50 p-1.5 text-red-600" title="Eliminar">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {agentes.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-slate-400">
                    No hay agentes que mostrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
