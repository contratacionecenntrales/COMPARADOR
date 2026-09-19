import { ShieldCheck, Camera, Radar } from 'lucide-react'
import Card from '../common/Card'
import { formatEUR } from '../../lib/format'

export default function AlarmsBreakdown({ alarmas }) {
  if (!alarmas) return null
  const { kitPropuesto, cubreEquipamiento, permanenciaRestanteMeses } = alarmas

  return (
    <Card icon={ShieldCheck} title="Alarmas — propuesta" subtitle={kitPropuesto ? kitPropuesto.nombre_kit : 'Sin kit disponible'}>
      {kitPropuesto && (
        <>
          <p className="text-sm text-slate-500">{kitPropuesto.descripcion}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-sm">
              <Camera size={16} className="text-brand-gold" /> {kitPropuesto.num_camaras} cámaras
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-sm">
              <Radar size={16} className="text-brand-gold" /> {kitPropuesto.num_sensores} sensores
            </div>
            <div className="rounded-lg bg-slate-50 p-3 text-sm">Instalación: {kitPropuesto.coste_instalacion > 0 ? formatEUR(kitPropuesto.coste_instalacion) : 'Bonificada'}</div>
            <div className="rounded-lg bg-slate-50 p-3 text-sm">Permanencia: {kitPropuesto.permanencia_meses} meses</div>
          </div>
        </>
      )}

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
