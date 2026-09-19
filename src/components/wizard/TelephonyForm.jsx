import { TextField, ToggleField } from '../common/Field'
import Card from '../common/Card'
import { Wifi, Smartphone } from 'lucide-react'

export const DEFAULT_TELEFONIA = {
  operadorActual: '',
  necesitaFibra: true,
  velocidadFibraDeseada: 300,
  necesitaLineaFija: false,
  numLineasMoviles: 1,
  gbPorLineaMovil: 30,
  datosIlimitadosDeseado: false,
  precioActualMensual: 55,
}

function NumberField(props) {
  return <TextField type="number" inputMode="decimal" {...props} />
}

export default function TelephonyForm({ telefonia, onChange }) {
  const data = telefonia || DEFAULT_TELEFONIA

  const set = (patch) => onChange({ ...data, ...patch })

  return (
    <div className="space-y-5">
      <Card icon={Wifi} title="Fibra e internet" subtitle="¿Necesitas fibra en tu propuesta?">
        <ToggleField
          label="Incluir fibra / internet fijo"
          checked={data.necesitaFibra}
          onChange={(checked) => set({ necesitaFibra: checked })}
        />
        {data.necesitaFibra && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <NumberField
              label="Velocidad de fibra deseada"
              suffix="Mb"
              value={data.velocidadFibraDeseada}
              onChange={(e) => set({ velocidadFibraDeseada: e.target.value })}
            />
            <ToggleField
              label="Necesito línea fija asociada"
              checked={data.necesitaLineaFija}
              onChange={(checked) => set({ necesitaLineaFija: checked })}
            />
          </div>
        )}
      </Card>

      <Card icon={Smartphone} title="Líneas móviles" subtitle="Datos de las líneas que quieres comparar">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField
            label="Número de líneas móviles"
            value={data.numLineasMoviles}
            onChange={(e) => set({ numLineasMoviles: e.target.value })}
          />
          {!data.datosIlimitadosDeseado && (
            <NumberField
              label="GB necesarios por línea"
              suffix="GB"
              value={data.gbPorLineaMovil}
              onChange={(e) => set({ gbPorLineaMovil: e.target.value })}
            />
          )}
        </div>
        <div className="mt-3">
          <ToggleField
            label="Quiero datos ilimitados"
            checked={data.datosIlimitadosDeseado}
            onChange={(checked) => set({ datosIlimitadosDeseado: checked })}
          />
        </div>
      </Card>

      <Card title="Factura actual" subtitle="Lo que pagas hoy por este conjunto de servicios">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label="Operador actual"
            placeholder="Ej. Movistar, Vodafone, Orange..."
            value={data.operadorActual}
            onChange={(e) => set({ operadorActual: e.target.value })}
          />
          <NumberField
            label="Precio mensual actual (total)"
            suffix="€/mes"
            value={data.precioActualMensual}
            onChange={(e) => set({ precioActualMensual: e.target.value })}
          />
        </div>
      </Card>
    </div>
  )
}
