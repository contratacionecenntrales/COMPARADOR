import { Smartphone, UserCheck } from 'lucide-react'
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

function TitularCard({ titulo, titular }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3 text-sm">
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">{titulo}</p>
      <p className="font-semibold text-brand-navy">{titular.nombre || '—'}</p>
      <p className="text-xs text-slate-500">NIF/CIF: {titular.nif || '—'}</p>
      <p className="text-xs text-slate-500">Contacto: {titular.contacto || '—'}</p>
    </div>
  )
}

export default function TelephonyBreakdown({ telefonia }) {
  if (!telefonia) return null
  const { propuesta, desgloseActual, desglosePropuesta, cambioTitular } = telefonia

  return (
    <Card icon={Smartphone} title="Telefonía e Internet" subtitle="Resumen de factura: actual vs. propuesta">
      <div className="space-y-3">
        {propuesta.componentes.length === 0 && (
          <p className="text-sm text-slate-500">No se ha encontrado una tarifa de catálogo que cubra la necesidad indicada.</p>
        )}
        {propuesta.componentes.map((c, idx) => (
          <div key={`${c.tarifa.id}-${idx}`} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
            <div>
              <p className="font-semibold text-brand-navy">{c.tarifa.nombre_tarifa}</p>
              <p className="text-xs text-slate-500">{c.etiqueta || c.tarifa.descripcion}</p>
            </div>
            <p className="font-semibold text-brand-goldDark">{formatEUR(c.tarifa.precio_mensual * c.cantidad)}/mes</p>
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

      {cambioTitular && (
        <div className="mt-5">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <UserCheck size={14} /> Cambio de titularidad solicitado
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TitularCard titulo="Titular donante — compañía actual" titular={cambioTitular.donante} />
            <TitularCard titulo="Titular receptor — nueva contratación" titular={cambioTitular.receptor} />
          </div>
        </div>
      )}
    </Card>
  )
}
