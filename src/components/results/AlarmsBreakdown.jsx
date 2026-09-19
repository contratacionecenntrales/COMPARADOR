import { ShieldCheck, Camera, Radar, Check } from 'lucide-react'
import Card from '../common/Card'
import { formatEUR } from '../../lib/format'

function TablaServicio({ nombre, equipamiento, cuota, pagoContado, totalPorServicios }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
            <th className="py-2 pr-4">Tipo de servicio</th>
            <th className="py-2 pr-4">Cuota mensual</th>
            <th className="py-2 pr-4">Pago al contado</th>
            <th className="py-2">Total euros</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-2 pr-4 align-top">
              <p className="font-semibold text-brand-navy">{nombre}</p>
              {equipamiento?.length > 0 && (
                <ul className="mt-1.5 space-y-1">
                  {equipamiento.map((item) => (
                    <li key={item} className="flex items-start gap-1.5 text-xs text-slate-500">
                      <Check size={12} className="mt-0.5 shrink-0 text-brand-gold" /> {item}
                    </li>
                  ))}
                </ul>
              )}
            </td>
            <td className="py-2 pr-4 align-top">{formatEUR(cuota)}</td>
            <td className="py-2 pr-4 align-top">{pagoContado > 0 ? formatEUR(pagoContado) : 'Bonificado'}</td>
            <td className="py-2 align-top font-semibold">{formatEUR(totalPorServicios)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function ResumenImpuestos({ desglose }) {
  return (
    <dl className="mt-4 grid grid-cols-3 gap-3 rounded-lg bg-slate-50 p-3 text-sm">
      <div>
        <dt className="text-xs text-slate-500">Base imponible</dt>
        <dd className="font-semibold text-brand-navy">{formatEUR(desglose.base)}</dd>
      </div>
      <div>
        <dt className="text-xs text-slate-500">IVA (21%)</dt>
        <dd className="font-semibold text-brand-navy">{formatEUR(desglose.iva)}</dd>
      </div>
      <div>
        <dt className="text-xs text-slate-500">Total a pagar</dt>
        <dd className="font-bold text-brand-goldDark">{formatEUR(desglose.totalAPagar)}</dd>
      </div>
    </dl>
  )
}

export default function AlarmsBreakdown({ alarmas }) {
  if (!alarmas) return null
  const { kitPropuesto, cubreEquipamiento, permanenciaRestanteMeses, desgloseActual, desglosePropuesta } = alarmas

  return (
    <Card icon={ShieldCheck} title="Alarmas — propuesta" subtitle={kitPropuesto ? kitPropuesto.nombre_kit : 'Sin kit disponible'}>
      {kitPropuesto && (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-sm">
              <Camera size={16} className="text-brand-gold" /> {kitPropuesto.num_camaras} cámaras
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-sm">
              <Radar size={16} className="text-brand-gold" /> {kitPropuesto.num_sensores} sensores
            </div>
            <div className="rounded-lg bg-slate-50 p-3 text-sm">Instalación: {kitPropuesto.coste_instalacion > 0 ? formatEUR(kitPropuesto.coste_instalacion) : 'Bonificada'}</div>
            <div className="rounded-lg bg-slate-50 p-3 text-sm">Permanencia: {kitPropuesto.permanencia_meses} meses</div>
          </div>

          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Primera factura — nuestra propuesta
          </p>
          <TablaServicio
            nombre={kitPropuesto.nombre_kit}
            equipamiento={kitPropuesto.equipamiento}
            cuota={desglosePropuesta.cuota}
            pagoContado={desglosePropuesta.pagoContado}
            totalPorServicios={desglosePropuesta.totalPorServicios}
          />
          <ResumenImpuestos desglose={desglosePropuesta} />
        </>
      )}

      <p className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-slate-400">Tu factura actual</p>
      <ResumenImpuestos desglose={desgloseActual} />

      <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg bg-slate-50 p-3">
          <dt className="text-xs text-slate-500">Actual /mes</dt>
          <dd className="font-semibold text-brand-navy">{formatEUR(alarmas.costeActualMensual)}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <dt className="text-xs text-slate-500">Propuesta /mes</dt>
          <dd className="font-semibold text-brand-goldDark">{formatEUR(alarmas.costePropuestaMensual)}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <dt className="text-xs text-slate-500">Actual /año</dt>
          <dd className="font-semibold text-brand-navy">{formatEUR(alarmas.costeActualAnual)}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <dt className="text-xs text-slate-500">Propuesta /año</dt>
          <dd className="font-semibold text-brand-goldDark">{formatEUR(alarmas.costePropuestaAnual)}</dd>
        </div>
      </dl>

      {!cubreEquipamiento && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-700">
          El equipamiento actual supera nuestros kits estándar; te proponemos nuestra gama más alta. Un asesor
          puede diseñar una solución a medida.
        </p>
      )}
      {permanenciaRestanteMeses > 0 && (
        <p className="mt-3 rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-500">
          Permanencia restante declarada con tu compañía actual: {permanenciaRestanteMeses} meses. Nuestro equipo
          puede asesorarte sobre las condiciones de cambio.
        </p>
      )}
    </Card>
  )
}
