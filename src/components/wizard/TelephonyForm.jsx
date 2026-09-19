import { TextField, ToggleField } from '../common/Field'
import Card from '../common/Card'
import { Wifi, Smartphone, Plus, Trash2, UserCheck } from 'lucide-react'

let contadorId = 0
const crearId = () => `linea-${++contadorId}-${Date.now()}`

export const DEFAULT_TELEFONIA = {
  operadorActual: '',
  fibras: [{ id: crearId(), etiqueta: 'Fibra principal', velocidadDeseada: 300, lineaFijaAsociada: false }],
  lineasMoviles: [{ id: crearId(), numero: '', gbDeseados: 30, ilimitado: false }],
  cambioTitular: {
    activo: false,
    donante: { nombre: '', nif: '', contacto: '' },
    receptor: { nombre: '', nif: '', contacto: '' },
  },
  cuotaMensualActual: 55,
  consumosActual: 0,
  otrosConceptosActual: 0,
}

function NumberField(props) {
  return <TextField type="number" inputMode="decimal" {...props} />
}

function FibraRow({ fibra, onChange, onRemove, permitirEliminar }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.2fr_1fr_auto_auto]">
        <TextField
          label="Referencia (sede/dirección)"
          placeholder="Ej. Oficina central"
          value={fibra.etiqueta}
          onChange={(e) => onChange({ etiqueta: e.target.value })}
        />
        <NumberField
          label="Velocidad deseada"
          suffix="Mb"
          value={fibra.velocidadDeseada}
          onChange={(e) => onChange({ velocidadDeseada: e.target.value })}
        />
        <div className="flex items-end pb-2.5">
          <ToggleField
            label="Línea fija asociada"
            checked={fibra.lineaFijaAsociada}
            onChange={(checked) => onChange({ lineaFijaAsociada: checked })}
          />
        </div>
        {permitirEliminar && (
          <button type="button" onClick={onRemove} className="btn-ghost h-fit self-end !px-3 !py-2 text-red-600">
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  )
}

function LineaMovilRow({ linea, indice, onChange, onRemove, permitirEliminar }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto_auto]">
        <TextField
          label={`Línea ${indice + 1} — nº de teléfono`}
          placeholder="600 000 000 (opcional)"
          value={linea.numero}
          onChange={(e) => onChange({ numero: e.target.value })}
        />
        {!linea.ilimitado && (
          <NumberField
            label="GB deseados"
            suffix="GB"
            value={linea.gbDeseados}
            onChange={(e) => onChange({ gbDeseados: e.target.value })}
          />
        )}
        <div className="flex items-end pb-2.5">
          <ToggleField label="Datos ilimitados" checked={linea.ilimitado} onChange={(checked) => onChange({ ilimitado: checked })} />
        </div>
        {permitirEliminar && (
          <button type="button" onClick={onRemove} className="btn-ghost h-fit self-end !px-3 !py-2 text-red-600">
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  )
}

function TitularFields({ titulo, titular, onChange }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{titulo}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <TextField label="Nombre completo / Razón social" value={titular.nombre} onChange={(e) => onChange({ nombre: e.target.value })} />
        <TextField label="NIF / CIF" value={titular.nif} onChange={(e) => onChange({ nif: e.target.value })} />
        <TextField label="Teléfono de contacto" value={titular.contacto} onChange={(e) => onChange({ contacto: e.target.value })} />
      </div>
    </div>
  )
}

export default function TelephonyForm({ telefonia, onChange }) {
  const data = telefonia || DEFAULT_TELEFONIA
  const set = (patch) => onChange({ ...data, ...patch })

  const fibras = data.fibras || []
  const lineasMoviles = data.lineasMoviles || []
  const cambioTitular = data.cambioTitular || DEFAULT_TELEFONIA.cambioTitular

  const anadirFibra = () =>
    set({ fibras: [...fibras, { id: crearId(), etiqueta: `Fibra ${fibras.length + 1}`, velocidadDeseada: 300, lineaFijaAsociada: false }] })
  const actualizarFibra = (id, patch) => set({ fibras: fibras.map((f) => (f.id === id ? { ...f, ...patch } : f)) })
  const eliminarFibra = (id) => set({ fibras: fibras.filter((f) => f.id !== id) })

  const anadirLinea = () => set({ lineasMoviles: [...lineasMoviles, { id: crearId(), numero: '', gbDeseados: 30, ilimitado: false }] })
  const actualizarLinea = (id, patch) => set({ lineasMoviles: lineasMoviles.map((l) => (l.id === id ? { ...l, ...patch } : l)) })
  const eliminarLinea = (id) => set({ lineasMoviles: lineasMoviles.filter((l) => l.id !== id) })

  const actualizarTitular = (rol, patch) => set({ cambioTitular: { ...cambioTitular, [rol]: { ...cambioTitular[rol], ...patch } } })

  return (
    <div className="space-y-5">
      <Card icon={Wifi} title="Fibra / Internet" subtitle="Añade una fibra por cada sede o suministro a comparar">
        <div className="space-y-3">
          {fibras.map((fibra) => (
            <FibraRow
              key={fibra.id}
              fibra={fibra}
              onChange={(patch) => actualizarFibra(fibra.id, patch)}
              onRemove={() => eliminarFibra(fibra.id)}
              permitirEliminar={fibras.length > 1}
            />
          ))}
        </div>
        <button type="button" onClick={anadirFibra} className="btn-outline mt-3 !px-3 !py-1.5 text-sm">
          <Plus size={15} /> Añadir fibra
        </button>
      </Card>

      <Card icon={Smartphone} title="Líneas móviles" subtitle="Añade cada línea que quieras comparar, con su número y GB">
        <div className="space-y-3">
          {lineasMoviles.map((linea, idx) => (
            <LineaMovilRow
              key={linea.id}
              linea={linea}
              indice={idx}
              onChange={(patch) => actualizarLinea(linea.id, patch)}
              onRemove={() => eliminarLinea(linea.id)}
              permitirEliminar={lineasMoviles.length > 1}
            />
          ))}
        </div>
        <button type="button" onClick={anadirLinea} className="btn-outline mt-3 !px-3 !py-1.5 text-sm">
          <Plus size={15} /> Añadir línea
        </button>
      </Card>

      <Card icon={UserCheck} title="Cambio de titularidad" subtitle="Actívalo si la portabilidad implica cambiar el titular del contrato">
        <ToggleField
          label="Esta operación incluye cambio de titular"
          description="Se solicitará el cambio de titular tanto en la compañía donante como en la nueva contratación"
          checked={cambioTitular.activo}
          onChange={(checked) => set({ cambioTitular: { ...cambioTitular, activo: checked } })}
        />
        {cambioTitular.activo && (
          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
            <TitularFields
              titulo="Titular donante — compañía actual"
              titular={cambioTitular.donante}
              onChange={(patch) => actualizarTitular('donante', patch)}
            />
            <TitularFields
              titulo="Titular receptor — nueva contratación"
              titular={cambioTitular.receptor}
              onChange={(patch) => actualizarTitular('receptor', patch)}
            />
          </div>
        )}
      </Card>

      <Card title="Factura actual" subtitle="Desglose tal y como aparece en la factura (ej. resumen Movistar Fusión), IVA incluido">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label="Operador actual"
            placeholder="Ej. Movistar, Vodafone, Orange..."
            value={data.operadorActual}
            onChange={(e) => set({ operadorActual: e.target.value })}
          />
          <NumberField
            label="Cuotas mensuales"
            suffix="€/mes"
            value={data.cuotaMensualActual}
            onChange={(e) => set({ cuotaMensualActual: e.target.value })}
          />
          <NumberField
            label="Consumos (fuera de bono)"
            suffix="€"
            value={data.consumosActual}
            onChange={(e) => set({ consumosActual: e.target.value })}
          />
          <NumberField
            label="Otros conceptos (roaming, servicios...)"
            suffix="€"
            value={data.otrosConceptosActual}
            onChange={(e) => set({ otrosConceptosActual: e.target.value })}
          />
        </div>
      </Card>
    </div>
  )
}
