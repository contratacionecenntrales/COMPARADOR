import { Smartphone } from 'lucide-react'
import Card from '../common/Card'
import { formatEUR } from '../../lib/format'

function ResumenFactura({ titulo, resumen }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{titulo}</p>
      <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-xs text-slate-500">Cuotas mensuales</dt>
          <dd className="font-semibold text-brand-navy">{formatEUR(resumen.cuotas)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Consumos</dt>
          <dd className="font-semibold text-brand-navy">{formatEUR(resumen.consumos)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Otros conceptos</dt>
          <dd className="font-semibold text-brand-navy">{formatEUR(resumen.otros)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Impuestos (IVA 21%)</dt>
          <dd className="font-semibold text-brand-navy">{formatEUR(resumen.iva)}</dd>
        </div>
      </dl>
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-xs text-slate-500">Base imponible: {formatEUR(resumen.base)}</span>
        <span className="text-base font-bold text-brand-navy">Total: {formatEUR(resumen.total)}</span>
      </div>
    </div>
  )
}

export default function TelephonyBreakdown({ telefonia }) {
  if (!telefonia) return null
  const { propuesta, desgloseActual, desglosePropuesta } = telefonia

  return (
    <Card icon={Smartphone} title="Telefonía e Internet" subtitle="Resumen de factura: actual vs. propuesta">
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

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ResumenFactura titulo="Tu factura actual" resumen={desgloseActual} />
        <ResumenFactura titulo={`Propuesta ${propuesta.componentes.length ? '' : '(sin match)'}`} resumen={desglosePropuesta} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
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
