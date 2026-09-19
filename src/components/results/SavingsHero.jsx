import { TrendingDown, Sparkles } from 'lucide-react'
import { formatEUR, formatPercent } from '../../lib/format'
import { COMPANY } from '../../lib/constants'

export default function SavingsHero({ totales, clienteNombre }) {
  const ahorroPositivo = totales.ahorroAnual > 0

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
      <div className="px-6 py-10 sm:px-10 sm:py-12">
        <div className="mb-6 flex items-center gap-2 text-brand-goldDark">
          <Sparkles size={18} />
          <span className="text-sm font-semibold uppercase tracking-wide">Auditoría de ahorro · {COMPANY.name}</span>
        </div>

        <h1 className="max-w-2xl text-2xl font-bold leading-snug text-brand-navy sm:text-3xl">
          {clienteNombre ? `${clienteNombre}, esto` : 'Esto'} es lo que puedes ahorrar cambiándote con nosotros
        </h1>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Pagas ahora al año</p>
            <p className="mt-2 text-2xl font-bold text-brand-navy">{formatEUR(totales.costeActualAnual)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Pagarías con {COMPANY.name}
            </p>
            <p className="mt-2 text-2xl font-bold text-brand-goldDark">{formatEUR(totales.costePropuestaAnual)}</p>
          </div>
          <div className="rounded-2xl bg-gold-gradient p-5 text-brand-navy">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide">
              <TrendingDown size={14} /> Tu ahorro anual
            </p>
            <p className="mt-2 text-2xl font-extrabold">{formatEUR(Math.abs(totales.ahorroAnual))}</p>
            <p className="text-sm font-semibold">
              {ahorroPositivo ? formatPercent(totales.ahorroPorcentaje) : '0%'} de ahorro
            </p>
          </div>
        </div>

        {!ahorroPositivo && (
          <p className="mt-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Con los datos introducidos, tu tarifa actual ya es competitiva frente a nuestro catálogo estándar.
            Contáctanos igualmente: podemos revisar condiciones comerciales especiales para tu caso.
          </p>
        )}
      </div>
    </div>
  )
}
