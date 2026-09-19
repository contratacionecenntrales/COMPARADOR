import { Zap, Smartphone, ShieldCheck, Layers } from 'lucide-react'
import { SECTORES, SECTOR_LABELS } from '../../lib/constants'

const OPCIONES = [
  {
    sector: SECTORES.ENERGIA,
    icon: Zap,
    descripcion: 'Compara tu factura de luz y/o gas frente a nuestras mejores tarifas activas.',
  },
  {
    sector: SECTORES.TELEFONIA,
    icon: Smartphone,
    descripcion: 'Móvil, fibra, líneas fijas y paquetes convergentes al mejor precio.',
  },
  {
    sector: SECTORES.ALARMAS,
    icon: ShieldCheck,
    descripcion: 'Compara tu cuota de seguridad actual con nuestros kits de alarma.',
  },
  {
    sector: SECTORES.PACK_INTEGRAL,
    icon: Layers,
    descripcion: 'Audita energía, telefonía y alarmas a la vez y maximiza tu ahorro total.',
  },
]

export default function SectorSelector({ value, onSelect }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {OPCIONES.map(({ sector, icon: Icon, descripcion }) => {
        const active = value === sector
        return (
          <button
            key={sector}
            type="button"
            onClick={() => onSelect(sector)}
            className={`group flex flex-col items-start gap-3 rounded-2xl border-2 p-5 text-left transition-all ${
              active
                ? 'border-brand-gold bg-brand-gold/5 shadow-gold'
                : 'border-slate-200 bg-white hover:border-brand-gold/40 hover:shadow-card'
            }`}
          >
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                active ? 'bg-gold-gradient text-brand-navy' : 'bg-slate-100 text-brand-navy'
              }`}
            >
              <Icon size={22} />
            </div>
            <div>
              <h3 className="font-semibold text-brand-navy">{SECTOR_LABELS[sector]}</h3>
              <p className="mt-1 text-sm text-slate-500">{descripcion}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
