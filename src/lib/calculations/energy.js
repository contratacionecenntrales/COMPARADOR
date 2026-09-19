import { IVA, IMPUESTO_ELECTRICIDAD } from '../constants'

const DIAS_ANIO = 365

/**
 * Calcula el coste de un suministro de LUZ (2.0TD o 3.0TD) para un set de
 * precios dado (los del cliente o los de una tarifa del catálogo), a partir
 * del consumo y potencias contratadas.
 *
 * @param {object} input
 * @param {number} input.diasFactura - días que cubre la factura/periodo introducido
 * @param {object} input.potencias - { p1, p2, p3? } kW contratados por periodo
 * @param {object} input.consumos - { p1, p2, p3?, p4?, p5?, p6? } kWh consumidos en el periodo
 * @param {object} precios - { potencia:{p1,p2,p3?}, energia:{p1,p2,p3,...}, terminoFijoMensual, alquilerEquipoDia }
 */
export function calcularCosteLuz(input, precios) {
  const { diasFactura, potencias, consumos } = input
  const periodos = Object.keys(consumos).filter((k) => consumos[k] != null)

  const desglosePeriodos = periodos.map((p) => {
    const consumoKwh = Number(consumos[p]) || 0
    const potenciaKw = Number(potencias[p] ?? potencias.p1) || 0
    const precioEnergia = Number(precios.energia[p] ?? 0)
    const precioPotencia = Number(precios.potencia?.[p] ?? 0)

    const costeEnergia = consumoKwh * precioEnergia
    const costePotencia = potenciaKw * precioPotencia * diasFactura

    return {
      periodo: p.toUpperCase(),
      consumoKwh,
      potenciaKw,
      precioEnergia,
      precioPotencia,
      costeEnergia,
      costePotencia,
    }
  })

  const terminoEnergia = desglosePeriodos.reduce((sum, d) => sum + d.costeEnergia, 0)
  const terminoPotencia = desglosePeriodos.reduce((sum, d) => sum + d.costePotencia, 0)
  const terminoFijo = ((Number(precios.terminoFijoMensual) || 0) / 30) * diasFactura
  const alquilerEquipo = (Number(precios.alquilerEquipoDia) || 0) * diasFactura

  const baseImponible = terminoEnergia + terminoPotencia + terminoFijo + alquilerEquipo
  const impuestoElectricidad = baseImponible * IMPUESTO_ELECTRICIDAD
  const baseConImpuesto = baseImponible + impuestoElectricidad
  const iva = baseConImpuesto * IVA
  const total = baseConImpuesto + iva

  const factorAnual = DIAS_ANIO / diasFactura

  return {
    diasFactura,
    desglosePeriodos,
    terminoEnergia,
    terminoPotencia,
    terminoFijo,
    alquilerEquipo,
    baseImponible,
    impuestoElectricidad,
    iva,
    total,
    totalAnual: total * factorAnual,
    totalMensualMedio: (total * factorAnual) / 12,
  }
}

/**
 * Calcula el coste de un suministro de GAS a partir de un consumo único
 * (RL.1 / RL.2 / RL.3 no distinguen periodos horarios).
 */
export function calcularCosteGas(input, precios) {
  const diasFactura = input.diasFactura
  const consumoKwh = Number(input.consumoKwh) || 0
  const precioEnergia = Number(precios.energia?.p1 ?? 0)

  const terminoEnergia = consumoKwh * precioEnergia
  const terminoFijo = ((Number(precios.terminoFijoMensual) || 0) / 30) * diasFactura

  const baseImponible = terminoEnergia + terminoFijo
  const iva = baseImponible * IVA
  const total = baseImponible + iva

  const factorAnual = DIAS_ANIO / diasFactura

  return {
    diasFactura,
    consumoKwh,
    precioEnergia,
    terminoEnergia,
    terminoFijo,
    baseImponible,
    iva,
    total,
    totalAnual: total * factorAnual,
    totalMensualMedio: (total * factorAnual) / 12,
  }
}

function precioTarifaComo(tarifa) {
  return {
    potencia: {
      p1: tarifa.precio_potencia_p1,
      p2: tarifa.precio_potencia_p2,
      p3: tarifa.precio_potencia_p3,
      p4: tarifa.precio_potencia_p4,
      p5: tarifa.precio_potencia_p5,
      p6: tarifa.precio_potencia_p6,
    },
    energia: {
      p1: tarifa.precio_energia_p1,
      p2: tarifa.precio_energia_p2,
      p3: tarifa.precio_energia_p3,
      p4: tarifa.precio_energia_p4,
      p5: tarifa.precio_energia_p5,
      p6: tarifa.precio_energia_p6,
    },
    terminoFijoMensual: tarifa.termino_fijo_mensual,
    alquilerEquipoDia: tarifa.alquiler_equipo_dia,
  }
}

/**
 * Compara la factura actual del cliente (luz) frente a todas las tarifas
 * activas del catálogo para el mismo segmento, y devuelve la mejor propuesta.
 */
export function compararLuz(datosCliente, tarifasCatalogo) {
  const precioActual = {
    potencia: datosCliente.precioPotenciaActual,
    energia: datosCliente.precioEnergiaActual,
    terminoFijoMensual: datosCliente.terminoFijoActualMensual || 0,
    alquilerEquipoDia: datosCliente.alquilerContadorDiaActual || 0,
  }

  const input = {
    diasFactura: datosCliente.diasFactura,
    potencias: datosCliente.potencias,
    consumos: datosCliente.consumos,
  }

  const costeActual = calcularCosteLuz(input, precioActual)

  const candidatas = tarifasCatalogo
    .filter((t) => t.tipo === 'luz' && t.segmento === datosCliente.segmento)
    .map((tarifa) => ({
      tarifa,
      coste: calcularCosteLuz(input, precioTarifaComo(tarifa)),
    }))
    .sort((a, b) => a.coste.totalAnual - b.coste.totalAnual)

  const mejor = candidatas[0] || null

  return {
    tipo: 'luz',
    segmento: datosCliente.segmento,
    costeActual,
    mejorPropuesta: mejor,
    todasLasPropuestas: candidatas,
    ahorroAnual: mejor ? costeActual.totalAnual - mejor.coste.totalAnual : 0,
    ahorroPorcentaje: mejor ? ((costeActual.totalAnual - mejor.coste.totalAnual) / costeActual.totalAnual) * 100 : 0,
  }
}

export function compararGas(datosCliente, tarifasCatalogo) {
  const precioActual = {
    energia: { p1: datosCliente.precioEnergiaActual },
    terminoFijoMensual: datosCliente.terminoFijoActualMensual || 0,
  }

  const input = {
    diasFactura: datosCliente.diasFactura,
    consumoKwh: datosCliente.consumoKwh,
  }

  const costeActual = calcularCosteGas(input, precioActual)

  const candidatas = tarifasCatalogo
    .filter((t) => t.tipo === 'gas' && t.segmento === datosCliente.segmento)
    .map((tarifa) => ({
      tarifa,
      coste: calcularCosteGas(input, { energia: { p1: tarifa.precio_energia_p1 }, terminoFijoMensual: tarifa.termino_fijo_mensual }),
    }))
    .sort((a, b) => a.coste.totalAnual - b.coste.totalAnual)

  const mejor = candidatas[0] || null

  return {
    tipo: 'gas',
    segmento: datosCliente.segmento,
    costeActual,
    mejorPropuesta: mejor,
    todasLasPropuestas: candidatas,
    ahorroAnual: mejor ? costeActual.totalAnual - mejor.coste.totalAnual : 0,
    ahorroPorcentaje: mejor ? ((costeActual.totalAnual - mejor.coste.totalAnual) / costeActual.totalAnual) * 100 : 0,
  }
}
