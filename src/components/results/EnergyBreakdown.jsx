import { Zap, Flame } from 'lucide-react'
import Card from '../common/Card'
import { formatEUR, formatNumber } from '../../lib/format'

function TablaPeriodos({ actualPeriodos, propuestaPeriodos }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
            <th className="py-2 pr-4">Periodo</th>
            <th className="py-2 pr-4">Consumo</th>
            <th className="py-2 pr-4">Precio actual</th>
            <th className="py-2 pr-4">Coste actual</th>
            <th className="py-2 pr-4">Precio propuesto</th>
            <th className="py-2">Coste propuesto</th>
          </tr>
        </thead>
        <tbody>
          {actualPeriodos.map((periodoActual, idx) => {
            const propuesto = propuestaPeriodos?.[idx]
            return (
              <tr key={periodoActual.periodo} className="border-b border-slate-100">
                <td className="py-2 pr-4 font-semibold text-brand-navy">{periodoActual.periodo}</td>
                <td className="py-2 pr-4">{formatNumber(periodoActual.consumoKwh, 0)} kWh</td>
                <td className="py-2 pr-4">{formatNumber(periodoActual.precioEnergia, 4)} €/kWh</td>
                <td className="py-2 pr-4">{formatEUR(periodoActual.costeEnergia)}</td>
                <td className="py-2 pr-4 text-brand-goldDark">
                  {propuesto ? `${formatNumber(propuesto.precioEnergia, 4)} €/kWh` : '—'}
                </td>
                <td className="py-2 font-semibold text-brand-goldDark">
                  {propuesto ? formatEUR(propuesto.costeEnergia) : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function ResumenLineas({ items }) {
  return (
    <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
      {items.map(({ label, actual, propuesta }) => (
        <div key={label} className="rounded-lg bg-slate-50 p-3">
          <dt className="text-xs text-slate-500">{label}</dt>
          <dd className="mt-1 font-semibold text-brand-navy">{formatEUR(actual)}</dd>
          <dd className="text-xs font-medium text-brand-goldDark">→ {formatEUR(propuesta)}</dd>
        </div>
      ))}
    </dl>
  )
}

function LuzBreakdown({ resultado }) {
  const { costeActual, mejorPropuesta } = resultado
  const propuestaCoste = mejorPropuesta?.coste

  return (
    <Card icon={Zap} title="Luz — desglose por periodo" subtitle={mejorPropuesta ? `Propuesta: ${mejorPropuesta.tarifa.nombre_tarifa}` : 'Sin propuesta disponible'}>
      <TablaPeriodos actualPeriodos={costeActual.desglosePeriodos} propuestaPeriodos={propuestaCoste?.desglosePeriodos} />
      <ResumenLineas
        items={[
          { label: 'Término potencia', actual: costeActual.terminoPotencia, propuesta: propuestaCoste?.terminoPotencia ?? 0 },
          { label: 'Término energía', actual: costeActual.terminoEnergia, propuesta: propuestaCoste?.terminoEnergia ?? 0 },
          { label: 'Impuestos (IE + IVA)', actual: costeActual.impuestoElectricidad + costeActual.iva, propuesta: (propuestaCoste?.impuestoElectricidad ?? 0) + (propuestaCoste?.iva ?? 0) },
          { label: 'Total factura', actual: costeActual.total, propuesta: propuestaCoste?.total ?? costeActual.total },
        ]}
      />
      <p className="mt-4 text-xs text-slate-400">
        Importes calculados sobre {costeActual.diasFactura} días de factura · equivalente anual:{' '}
        {formatEUR(costeActual.totalAnual)} → {formatEUR(propuestaCoste?.totalAnual ?? costeActual.totalAnual)}
      </p>
    </Card>
  )
}

function GasBreakdown({ resultado }) {
  const { costeActual, mejorPropuesta } = resultado
  const propuestaCoste = mejorPropuesta?.coste

  return (
    <Card icon={Flame} title="Gas — desglose" subtitle={mejorPropuesta ? `Propuesta: ${mejorPropuesta.tarifa.nombre_tarifa}` : 'Sin propuesta disponible'}>
      <ResumenLineas
        items={[
          { label: 'Término energía', actual: costeActual.terminoEnergia, propuesta: propuestaCoste?.terminoEnergia ?? 0 },
          { label: 'Término fijo', actual: costeActual.terminoFijo, propuesta: propuestaCoste?.terminoFijo ?? 0 },
          { label: 'IVA', actual: costeActual.iva, propuesta: propuestaCoste?.iva ?? 0 },
          { label: 'Total factura', actual: costeActual.total, propuesta: propuestaCoste?.total ?? costeActual.total },
        ]}
      />
      <p className="mt-4 text-xs text-slate-400">
        Consumo de {formatNumber(costeActual.consumoKwh, 0)} kWh en {costeActual.diasFactura} días · equivalente anual:{' '}
        {formatEUR(costeActual.totalAnual)} → {formatEUR(propuestaCoste?.totalAnual ?? costeActual.totalAnual)}
      </p>
    </Card>
  )
}

export default function EnergyBreakdown({ energia }) {
  if (!energia) return null
  return (
    <div className="space-y-6">
      {energia.luz && <LuzBreakdown resultado={energia.luz} />}
      {energia.gas && <GasBreakdown resultado={energia.gas} />}
    </div>
  )
}
