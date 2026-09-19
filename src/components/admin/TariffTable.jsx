import { useEffect, useState } from 'react'
import { Plus, Trash2, Save, Loader2, RefreshCw } from 'lucide-react'
import { listarTarifas, crearTarifa, actualizarTarifa, eliminarTarifa } from '../../lib/dataService'

function CellInput({ column, value, onChange }) {
  if (column.type === 'boolean') {
    return <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-brand-gold" />
  }
  if (column.type === 'select') {
    return (
      <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} className="w-full rounded border border-slate-200 px-2 py-1 text-xs">
        {column.options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    )
  }
  return (
    <input
      type={column.type === 'number' ? 'number' : 'text'}
      step={column.step || 'any'}
      value={value ?? ''}
      onChange={(e) => onChange(column.type === 'number' ? e.target.value : e.target.value)}
      className="w-full min-w-[90px] rounded border border-slate-200 px-2 py-1 text-xs focus:border-brand-gold focus:outline-none"
    />
  )
}

export default function TariffTable({ catalogo, columns, emptyRow, title }) {
  const [filas, setFilas] = useState([])
  const [cambios, setCambios] = useState({}) // id -> patch pendiente
  const [loading, setLoading] = useState(true)
  const [guardandoId, setGuardandoId] = useState(null)
  const [error, setError] = useState(null)

  async function cargar() {
    setLoading(true)
    setError(null)
    try {
      const data = await listarTarifas(catalogo, { soloActivas: false })
      setFilas(data)
      setCambios({})
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogo])

  function actualizarCelda(id, key, value) {
    setCambios((c) => ({ ...c, [id]: { ...c[id], [key]: value } }))
  }

  function valorActual(fila, key) {
    return cambios[fila.id]?.[key] ?? fila[key]
  }

  async function guardarFila(fila) {
    const patch = cambios[fila.id]
    if (!patch) return
    setGuardandoId(fila.id)
    try {
      const actualizado = await actualizarTarifa(catalogo, fila.id, patch)
      setFilas((fs) => fs.map((f) => (f.id === fila.id ? actualizado : f)))
      setCambios((c) => {
        const { [fila.id]: _omit, ...resto } = c
        return resto
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardandoId(null)
    }
  }

  async function anadirFila() {
    try {
      const nueva = await crearTarifa(catalogo, emptyRow)
      setFilas((fs) => [nueva, ...fs])
    } catch (err) {
      setError(err.message)
    }
  }

  async function borrarFila(id) {
    if (!window.confirm('¿Eliminar esta tarifa? Esta acción no se puede deshacer.')) return
    try {
      await eliminarTarifa(catalogo, id)
      setFilas((fs) => fs.filter((f) => f.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-brand-navy">{title}</h3>
        <div className="flex gap-2">
          <button onClick={cargar} className="btn-ghost !px-3 !py-1.5 text-xs">
            <RefreshCw size={14} /> Refrescar
          </button>
          <button onClick={anadirFila} className="btn-primary !px-3 !py-1.5 text-xs">
            <Plus size={14} /> Nueva tarifa
          </button>
        </div>
      </div>

      {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
          <Loader2 className="animate-spin" size={16} /> Cargando tarifas…
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-xs">
            <thead className="bg-slate-50">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className="whitespace-nowrap px-3 py-2 text-left font-semibold text-slate-500">
                    {col.label}
                  </th>
                ))}
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {filas.map((fila) => {
                const tieneCambios = Boolean(cambios[fila.id])
                return (
                  <tr key={fila.id} className={`border-t border-slate-100 ${tieneCambios ? 'bg-amber-50/50' : ''}`}>
                    {columns.map((col) => (
                      <td key={col.key} className="px-3 py-2">
                        <CellInput column={col} value={valorActual(fila, col.key)} onChange={(v) => actualizarCelda(fila.id, col.key, v)} />
                      </td>
                    ))}
                    <td className="whitespace-nowrap px-3 py-2">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => guardarFila(fila)}
                          disabled={!tieneCambios || guardandoId === fila.id}
                          className="rounded bg-brand-navy p-1.5 text-white disabled:opacity-30"
                          title="Guardar cambios"
                        >
                          {guardandoId === fila.id ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                        </button>
                        <button onClick={() => borrarFila(fila.id)} className="rounded bg-red-50 p-1.5 text-red-600" title="Eliminar">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filas.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} className="px-3 py-6 text-center text-slate-400">
                    No hay tarifas en este catálogo todavía.
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
