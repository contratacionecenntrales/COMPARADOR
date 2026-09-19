import { TextField, SelectField, ToggleField } from '../common/Field'
import Card from '../common/Card'
import { Zap, Flame } from 'lucide-react'

export const DEFAULT_LUZ = {
  segmento: '2.0TD',
  proveedorActual: '',
  diasFactura: 30,
  potencias: { p1: 4.6, p2: 4.6, p3: '' },
  consumos: { p1: 120, p2: 90, p3: 60 },
  precioPotenciaActual: { p1: 0.09, p2: 0.09, p3: '' },
  precioEnergiaActual: { p1: 0.16, p2: 0.16, p3: 0.16 },
  terminoFijoActualMensual: 0,
  alquilerContadorDiaActual: 0.026,
}

export const DEFAULT_GAS = {
  segmento: 'RL.1',
  proveedorActual: '',
  diasFactura: 30,
  consumoKwh: 350,
  precioEnergiaActual: 0.07,
  terminoFijoActualMensual: 8,
}

function NumberField(props) {
  return <TextField type="number" inputMode="decimal" step="0.001" {...props} />
}

function LuzForm({ luz, segmento, onChange }) {
  const es3TD = segmento === '3.0TD'

  const setPot = (p, v) => onChange({ potencias: { ...luz.potencias, [p]: v } })
  const setCons = (p, v) => onChange({ consumos: { ...luz.consumos, [p]: v } })
  const setPrecioPot = (p, v) => onChange({ precioPotenciaActual: { ...luz.precioPotenciaActual, [p]: v } })
  const setPrecioEner = (p, v) => onChange({ precioEnergiaActual: { ...luz.precioEnergiaActual, [p]: v } })

  return (
    <Card icon={Zap} title="Luz" subtitle="Datos de tu factura eléctrica actual">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SelectField label="Peaje contratado" value={segmento} onChange={(e) => onChange({ segmento: e.target.value })}>
          <option value="2.0TD">2.0TD (hogar/pequeño negocio)</option>
          <option value="3.0TD">3.0TD (negocio, &gt;15kW)</option>
        </SelectField>
        <TextField label="Compañía actual" placeholder="Ej. Iberdrola, Endesa..." value={luz.proveedorActual} onChange={(e) => onChange({ proveedorActual: e.target.value })} />
        <NumberField label="Días que cubre la factura" value={luz.diasFactura} onChange={(e) => onChange({ diasFactura: e.target.value })} suffix="días" />
      </div>

      <div className="mt-5">
        <h4 className="mb-2 text-sm font-semibold text-brand-navy">Potencia contratada y precio actual</h4>
        <div className={`grid grid-cols-1 gap-4 ${es3TD ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
          <NumberField label="Potencia P1 (punta)" suffix="kW" value={luz.potencias.p1} onChange={(e) => setPot('p1', e.target.value)} />
          <NumberField label="Potencia P2 (valle)" suffix="kW" value={luz.potencias.p2} onChange={(e) => setPot('p2', e.target.value)} />
          {es3TD && <NumberField label="Potencia P3" suffix="kW" value={luz.potencias.p3} onChange={(e) => setPot('p3', e.target.value)} />}
          <NumberField label="Precio potencia P1 actual" suffix="€/kW/día" value={luz.precioPotenciaActual.p1} onChange={(e) => setPrecioPot('p1', e.target.value)} />
          <NumberField label="Precio potencia P2 actual" suffix="€/kW/día" value={luz.precioPotenciaActual.p2} onChange={(e) => setPrecioPot('p2', e.target.value)} />
          {es3TD && <NumberField label="Precio potencia P3 actual" suffix="€/kW/día" value={luz.precioPotenciaActual.p3} onChange={(e) => setPrecioPot('p3', e.target.value)} />}
        </div>
      </div>

      <div className="mt-5">
        <h4 className="mb-2 text-sm font-semibold text-brand-navy">Consumo y precio de energía por periodo</h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <NumberField label="Consumo P1 (punta)" suffix="kWh" value={luz.consumos.p1} onChange={(e) => setCons('p1', e.target.value)} />
          <NumberField label="Consumo P2 (llana)" suffix="kWh" value={luz.consumos.p2} onChange={(e) => setCons('p2', e.target.value)} />
          <NumberField label="Consumo P3 (valle)" suffix="kWh" value={luz.consumos.p3} onChange={(e) => setCons('p3', e.target.value)} />
          <NumberField label="Precio energía P1 actual" suffix="€/kWh" value={luz.precioEnergiaActual.p1} onChange={(e) => setPrecioEner('p1', e.target.value)} />
          <NumberField label="Precio energía P2 actual" suffix="€/kWh" value={luz.precioEnergiaActual.p2} onChange={(e) => setPrecioEner('p2', e.target.value)} />
          <NumberField label="Precio energía P3 actual" suffix="€/kWh" value={luz.precioEnergiaActual.p3} onChange={(e) => setPrecioEner('p3', e.target.value)} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField label="Término fijo mensual actual (si aplica)" suffix="€/mes" value={luz.terminoFijoActualMensual} onChange={(e) => onChange({ terminoFijoActualMensual: e.target.value })} />
        <NumberField label="Alquiler contador" suffix="€/día" value={luz.alquilerContadorDiaActual} onChange={(e) => onChange({ alquilerContadorDiaActual: e.target.value })} />
      </div>
    </Card>
  )
}

function GasForm({ gas, onChange }) {
  return (
    <Card icon={Flame} title="Gas" subtitle="Datos de tu factura de gas actual">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SelectField label="Segmento de consumo" value={gas.segmento} onChange={(e) => onChange({ segmento: e.target.value })}>
          <option value="RL.1">RL.1 · &lt;5.000 kWh/año (cocina/ACS)</option>
          <option value="RL.2">RL.2 · 5.000-50.000 kWh/año (calefacción)</option>
        </SelectField>
        <TextField label="Compañía actual" placeholder="Ej. Naturgy, Repsol..." value={gas.proveedorActual} onChange={(e) => onChange({ proveedorActual: e.target.value })} />
        <NumberField label="Días que cubre la factura" value={gas.diasFactura} onChange={(e) => onChange({ diasFactura: e.target.value })} suffix="días" />
      </div>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <NumberField label="Consumo del periodo" suffix="kWh" value={gas.consumoKwh} onChange={(e) => onChange({ consumoKwh: e.target.value })} />
        <NumberField label="Precio energía actual" suffix="€/kWh" value={gas.precioEnergiaActual} onChange={(e) => onChange({ precioEnergiaActual: e.target.value })} />
        <NumberField label="Término fijo mensual actual" suffix="€/mes" value={gas.terminoFijoActualMensual} onChange={(e) => onChange({ terminoFijoActualMensual: e.target.value })} />
      </div>
    </Card>
  )
}

export default function EnergyForm({ energia, onChange }) {
  const toggleLuz = (checked) =>
    onChange({ incluyeLuz: checked, luz: checked ? energia.luz || DEFAULT_LUZ : energia.luz })
  const toggleGas = (checked) =>
    onChange({ incluyeGas: checked, gas: checked ? energia.gas || DEFAULT_GAS : energia.gas })

  const luz = energia.luz || DEFAULT_LUZ
  const gas = energia.gas || DEFAULT_GAS

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ToggleField label="Incluir suministro de Luz" checked={energia.incluyeLuz} onChange={toggleLuz} />
        <ToggleField label="Incluir suministro de Gas" checked={energia.incluyeGas} onChange={toggleGas} />
      </div>

      {energia.incluyeLuz && (
        <LuzForm luz={luz} segmento={luz.segmento} onChange={(patch) => onChange({ luz: { ...luz, ...patch } })} />
      )}

      {energia.incluyeGas && <GasForm gas={gas} onChange={(patch) => onChange({ gas: { ...gas, ...patch } })} />}
    </div>
  )
}
