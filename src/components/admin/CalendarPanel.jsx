import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Trash2, Loader2, CalendarDays, Check } from 'lucide-react'
import { TextField, SelectField } from '../common/Field'
import { listarAgentes, listarEventos, crearEvento, actualizarEvento, eliminarEvento } from '../../lib/dataService'

const TIPO_LABEL = {
  llamada: 'Llamada',
  visita: 'Visita',
  seguimiento: 'Seguimiento',
  reunion: 'Reunión',
  otro: 'Otro',
}

const TIPO_COLOR = {
  llamada: 'bg-blue-50 text-blue-700',
  visita: 'bg-emerald-50 text-emerald-700',
  seguimiento: 'bg-amber-50 text-amber-700',
  reunion: 'bg-purple-50 text-purple-700',
  otro: 'bg-slate-100 text-slate-600',
}

function hoyISO() {
  return new Date().toISOString().slice(0, 10)
}

function formatFechaLarga(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const FORM_VACIO = { titulo: '', tipo: 'llamada', cliente_nombre: '', hora_inicio: '', hora_fin: '', descripcion: '' }

export default function CalendarPanel({ usuarioActual }) {
  const [agentes, setAgentes] = useState([])
  const [fecha, setFecha] = useState(hoyISO())
  const [comercialId, setComercialId] = useState(String(usuarioActual.id))
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(FORM_VACIO)
  const [creando, setCreando] = useState(false)

  const puedeElegirComercial = usuarioActual.rol !== 'gestor_comercial'

  useEffect(() => {
    listarAgentes().then(setAgentes).catch(() => {})
  }, [])

  async function cargarEventos() {
    setLoading(true)
    setError(null)
    try {
      const usuario_id = comercialId === 'todos' ? undefined : comercialId
      setEventos(await listarEventos({ desde: fecha, hasta: fecha, usuario_id }))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarEventos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fecha, comercialId])

  function cambiarDia(delta) {
    const d = new Date(fecha + 'T00:00:00')
    d.setDate(d.getDate() + delta)
    setFecha(d.toISOString().slice(0, 10))
  }

  async function handleCrear(e) {
    e.preventDefault()
    setCreando(true)
    setError(null)
    try {
      const usuario_id = comercialId === 'todos' ? usuarioActual.id : Number(comercialId)
      await crearEvento({ ...form, usuario_id, fecha })
      setForm(FORM_VACIO)
      await cargarEventos()
    } catch (err) {
      setError(err.message)
    } finally {
      setCreando(false)
    }
  }

  async function handleToggleCompletado(evento) {
    try {
      const actualizado = await actualizarEvento(evento.id, { completado: !evento.completado })
      setEventos((es) => es.map((e) => (e.id === evento.id ? actualizado : e)))
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleEliminar(evento) {
    if (!window.confirm(`¿Eliminar "${evento.titulo}"?`)) return
    try {
      await eliminarEvento(evento.id)
      setEventos((es) => es.filter((e) => e.id !== evento.id))
    } catch (err) {
      setError(err.message)
    }
  }

  const eventosOrdenados = useMemo(() => [...eventos].sort((a, b) => (a.hora_inicio || '99').localeCompare(b.hora_inicio || '99')), [eventos])

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-base font-semibold text-brand-navy">
          <CalendarDays size={18} /> Calendario
        </h3>

        <div className="flex flex-wrap items-center gap-2">
          {puedeElegirComercial && (
            <select
              value={comercialId}
              onChange={(e) => setComercialId(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
            >
              <option value="todos">Todo el equipo</option>
              {agentes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.id === usuarioActual.id ? `${a.nombre} (tú)` : a.nombre}
                </option>
              ))}
            </select>
          )}
          <div className="flex items-center gap-1 rounded-lg border border-slate-300 px-1.5 py-1">
            <button onClick={() => cambiarDia(-1)} className="rounded p-1 hover:bg-slate-100">
              <ChevronLeft size={16} />
            </button>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="text-sm outline-none" />
            <button onClick={() => cambiarDia(1)} className="rounded p-1 hover:bg-slate-100">
              <ChevronRight size={16} />
            </button>
          </div>
          <button onClick={() => setFecha(hoyISO())} className="btn-ghost !px-3 !py-1.5 text-xs">
            Hoy
          </button>
        </div>
      </div>

      <p className="mb-4 text-sm capitalize text-slate-500">{formatFechaLarga(fecha)}</p>

      {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

      <form onSubmit={handleCrear} className="card mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <TextField label="Título" required value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
        <SelectField label="Tipo" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
          {Object.entries(TIPO_LABEL).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </SelectField>
        <TextField label="Cliente (opcional)" value={form.cliente_nombre} onChange={(e) => setForm({ ...form, cliente_nombre: e.target.value })} />
        {comercialId === 'todos' && puedeElegirComercial && (
          <p className="flex items-end pb-2.5 text-xs text-slate-400">Se creará para ti; edítalo luego si es para otro agente.</p>
        )}
        <TextField label="Hora inicio" type="time" value={form.hora_inicio} onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })} />
        <TextField label="Hora fin" type="time" value={form.hora_fin} onChange={(e) => setForm({ ...form, hora_fin: e.target.value })} />
        <TextField
          label="Notas"
          className="sm:col-span-2"
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
        />
        <div className="flex items-end">
          <button type="submit" disabled={creando} className="btn-primary w-full">
            {creando ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
            Añadir evento
          </button>
        </div>
      </form>

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
          <Loader2 className="animate-spin" size={16} /> Cargando agenda…
        </div>
      ) : eventosOrdenados.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">No hay eventos para este día.</p>
      ) : (
        <div className="space-y-2">
          {eventosOrdenados.map((ev) => (
            <div key={ev.id} className={`flex items-start gap-3 rounded-lg border border-slate-200 p-3 ${ev.completado ? 'opacity-60' : ''}`}>
              <button
                onClick={() => handleToggleCompletado(ev)}
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  ev.completado ? 'border-brand-gold bg-brand-gold text-brand-navy' : 'border-slate-300'
                }`}
                title="Marcar como completado"
              >
                {ev.completado && <Check size={12} />}
              </button>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {(ev.hora_inicio || ev.hora_fin) && (
                    <span className="text-xs font-semibold text-slate-500">
                      {ev.hora_inicio?.slice(0, 5)}
                      {ev.hora_fin ? ` – ${ev.hora_fin.slice(0, 5)}` : ''}
                    </span>
                  )}
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TIPO_COLOR[ev.tipo]}`}>{TIPO_LABEL[ev.tipo]}</span>
                  {comercialId === 'todos' && <span className="text-xs font-medium text-brand-goldDark">{ev.usuario_nombre}</span>}
                </div>
                <p className={`mt-1 font-semibold text-brand-navy ${ev.completado ? 'line-through' : ''}`}>{ev.titulo}</p>
                {ev.cliente_nombre && <p className="text-xs text-slate-500">Cliente: {ev.cliente_nombre}</p>}
                {ev.descripcion && <p className="mt-1 text-sm text-slate-500">{ev.descripcion}</p>}
              </div>
              <button onClick={() => handleEliminar(ev)} className="rounded bg-red-50 p-1.5 text-red-600" title="Eliminar">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
