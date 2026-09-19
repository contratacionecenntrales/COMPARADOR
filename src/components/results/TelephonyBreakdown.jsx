import { Smartphone } from 'lucide-react'
import Card from '../common/Card'
import { formatEUR } from '../../lib/format'

export default function TelephonyBreakdown({ telefonia }) {
  if (!telefonia) return null
  const { propuesta } = telefonia

  return (
    <Card icon={Smartphone} title="Telefonía e Internet — propuesta" subtitle="Componentes de la propuesta seleccionada">
      <div className="space-y-3">
        {propuesta.componentes.length === 0 && (
          <p className="text-sm text-slate-500">No se ha encontrado una tarifa de catálogo que cubra la necesidad indicada.</p>
        )}
        {propuesta.componentes.map(({ tarifa, cantidad }) => (
          <div key={tarifa.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
            <div>
              <p className="font-semibold text-brand-navy">
                {tarifa.nombre_tarifa} {cantidad > 1 && <span className="text-slate-400">× {cantidad}</span>}
              </p>
              <p className="text-xs text-slate-500">{tarifa.descripcion}</p>
            </div>
            <p className="font-semibold text-brand-goldDark">{formatEUR(tarifa.precio_mensual * cantidad)}/mes</p>
          </div>
        ))}
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg bg-slate-50 p-3">
          <dt className="text-xs text-slate-500">Actual /mes</dt>
          <dd className="font-semibold text-brand-navy">{formatEUR(telefonia.costeActualMensual)}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <dt className="text-xs text-slate-500">Propuesta /mes</dt>
          <dd className="font-semibold text-brand-goldDark">{formatEUR(telefonia.costePropuestaMensual)}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <dt className="text-xs text-slate-500">Actual /año</dt>
          <dd className="font-semibold text-brand-navy">{formatEUR(telefonia.costeActualAnual)}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <dt className="text-xs text-slate-500">Propuesta /año</dt>
          <dd className="font-semibold text-brand-goldDark">{formatEUR(telefonia.costePropuestaAnual)}</dd>
        </div>
      </dl>
    </Card>
  )
}
