import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { listarAuditorias } from '../../lib/dataService'
import { formatEUR, formatPercent } from '../../lib/format'
import { SECTOR_LABELS } from '../../lib/constants'

export default function AuditsHistory() {
  const [auditorias, setAuditorias] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listarAuditorias({ limit: 100 })
      .then(setAuditorias)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
        <Loader2 className="animate-spin" size={16} /> Cargando histórico…
      </div>
    )
  }

  if (auditorias.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">Todavía no se ha generado ninguna auditoría.</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-xs">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-3 py-2 text-left font-semibold text-slate-500">Fecha</th>
            <th className="px-3 py-2 text-left font-semibold text-slate-500">Cliente</th>
            <th className="px-3 py-2 text-left font-semibold text-slate-500">Sector</th>
            <th className="px-3 py-2 text-left font-semibold text-slate-500">Coste actual</th>
            <th className="px-3 py-2 text-left font-semibold text-slate-500">Coste propuesto</th>
            <th className="px-3 py-2 text-left font-semibold text-slate-500">Ahorro</th>
          </tr>
        </thead>
        <tbody>
          {auditorias.map((a) => (
            <tr key={a.id} className="border-t border-slate-100">
              <td className="px-3 py-2">{new Date(a.created_at).toLocaleDateString('es-ES')}</td>
              <td className="px-3 py-2">{a.cliente_nombre || '—'}</td>
              <td className="px-3 py-2">{SECTOR_LABELS[a.sector] || a.sector}</td>
              <td className="px-3 py-2">{formatEUR(a.coste_actual_anual)}</td>
              <td className="px-3 py-2">{formatEUR(a.coste_propuesto_anual)}</td>
              <td className="px-3 py-2 font-semibold text-brand-goldDark">
                {formatEUR(a.ahorro_anual)} ({formatPercent(a.ahorro_porcentaje)})
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
