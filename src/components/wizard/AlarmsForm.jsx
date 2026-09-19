import { TextField, SelectField } from '../common/Field'
import Card from '../common/Card'
import { ShieldCheck } from 'lucide-react'

export const DEFAULT_ALARMAS = {
  proveedorActual: '',
  tipoKitActual: 'basica',
  numCamarasActual: 0,
  numSensoresActual: 2,
  cuotaMensualActual: 39.9,
  permanenciaRestanteMeses: 0,
}

function NumberField(props) {
  return <TextField type="number" inputMode="decimal" {...props} />
}

export default function AlarmsForm({ alarmas, onChange }) {
  const data = alarmas || DEFAULT_ALARMAS
  const set = (patch) => onChange({ ...data, ...patch })

  return (
    <Card icon={ShieldCheck} title="Sistema de alarma actual" subtitle="Cuéntanos qué tienes contratado hoy">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Compañía actual"
          placeholder="Ej. Securitas Direct, Prosegur..."
          value={data.proveedorActual}
          onChange={(e) => set({ proveedorActual: e.target.value })}
        />
        <SelectField label="Tipo de kit actual" value={data.tipoKitActual} onChange={(e) => set({ tipoKitActual: e.target.value })}>
          <option value="basica">Básica (sin cámaras)</option>
          <option value="camaras">Con cámaras</option>
          <option value="gama_alta">Gama alta</option>
          <option value="comercial">Comercial / negocio</option>
        </SelectField>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          label="Número de cámaras"
          value={data.numCamarasActual}
          onChange={(e) => set({ numCamarasActual: e.target.value })}
        />
        <NumberField
          label="Número de sensores/detectores"
          value={data.numSensoresActual}
          onChange={(e) => set({ numSensoresActual: e.target.value })}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          label="Cuota mensual actual"
          suffix="€/mes"
          value={data.cuotaMensualActual}
          onChange={(e) => set({ cuotaMensualActual: e.target.value })}
        />
        <NumberField
          label="Permanencia restante"
          suffix="meses"
          value={data.permanenciaRestanteMeses}
          onChange={(e) => set({ permanenciaRestanteMeses: e.target.value })}
        />
      </div>
    </Card>
  )
}
