import { compararLuz, compararGas } from './calculations/energy'
import { compararTelefonia } from './calculations/telephony'
import { compararAlarmas } from './calculations/alarms'
import { listarTarifas } from './dataService'
import { SECTORES } from './constants'

/**
 * Ejecuta la auditoría completa según el sector elegido (o los tres sectores
 * si es Pack Integral), consultando el catálogo de tarifas vigente y
 * devolviendo un objeto `resultado` unificado listo para pintar en pantalla,
 * exportar a PDF y guardar en `auditorias_clientes`.
 */
export async function ejecutarAuditoria(state) {
  const { sector, energia, telefonia, alarmas } = state
  const incluyeEnergia = sector === SECTORES.ENERGIA || sector === SECTORES.PACK_INTEGRAL
  const incluyeTelefonia = sector === SECTORES.TELEFONIA || sector === SECTORES.PACK_INTEGRAL
  const incluyeAlarmas = sector === SECTORES.ALARMAS || sector === SECTORES.PACK_INTEGRAL

  const resultado = { sector, energia: null, telefonia: null, alarmas: null }

  if (incluyeEnergia && (energia?.incluyeLuz || energia?.incluyeGas)) {
    const catalogoEnergia = await listarTarifas('energia')
    resultado.energia = {
      luz: energia.incluyeLuz && energia.luz ? compararLuz(energia.luz, catalogoEnergia) : null,
      gas: energia.incluyeGas && energia.gas ? compararGas(energia.gas, catalogoEnergia) : null,
    }
  }

  if (incluyeTelefonia && telefonia) {
    const catalogoTelefonia = await listarTarifas('telefonia')
    resultado.telefonia = compararTelefonia(telefonia, catalogoTelefonia)
  }

  if (incluyeAlarmas && alarmas) {
    const catalogoAlarmas = await listarTarifas('alarmas')
    resultado.alarmas = compararAlarmas(alarmas, catalogoAlarmas)
  }

  resultado.totales = calcularTotales(resultado)
  return resultado
}

function calcularTotales(resultado) {
  let costeActualAnual = 0
  let costePropuestaAnual = 0

  if (resultado.energia?.luz) {
    costeActualAnual += resultado.energia.luz.costeActual.totalAnual
    costePropuestaAnual += resultado.energia.luz.mejorPropuesta?.coste.totalAnual ?? resultado.energia.luz.costeActual.totalAnual
  }
  if (resultado.energia?.gas) {
    costeActualAnual += resultado.energia.gas.costeActual.totalAnual
    costePropuestaAnual += resultado.energia.gas.mejorPropuesta?.coste.totalAnual ?? resultado.energia.gas.costeActual.totalAnual
  }
  if (resultado.telefonia) {
    costeActualAnual += resultado.telefonia.costeActualAnual
    costePropuestaAnual += resultado.telefonia.costePropuestaAnual
  }
  if (resultado.alarmas) {
    costeActualAnual += resultado.alarmas.costeActualAnual
    costePropuestaAnual += resultado.alarmas.costePropuestaAnual
  }

  const ahorroAnual = costeActualAnual - costePropuestaAnual
  const ahorroPorcentaje = costeActualAnual > 0 ? (ahorroAnual / costeActualAnual) * 100 : 0

  return { costeActualAnual, costePropuestaAnual, ahorroAnual, ahorroPorcentaje }
}
