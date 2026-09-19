/**
 * Motor de comparación de alarmas. Se busca el kit de nuestro catálogo con
 * igual o mejor equipamiento (cámaras y sensores) al menor coste mensual.
 * Si el cliente tiene un equipamiento superior a cualquier kit disponible,
 * se ofrece el kit de gama más alta como mejor alternativa posible.
 */
export function encontrarMejorKit(datosCliente, tarifasCatalogo) {
  const numCamaras = Number(datosCliente.numCamarasActual) || 0
  const numSensores = Number(datosCliente.numSensoresActual) || 0

  const candidatos = tarifasCatalogo.filter(
    (kit) => Number(kit.num_camaras) >= numCamaras && Number(kit.num_sensores) >= numSensores
  )

  const ordenados = (candidatos.length > 0 ? candidatos : tarifasCatalogo)
    .slice()
    .sort((a, b) => {
      if (candidatos.length === 0) {
        // fallback: sin candidato que iguale equipamiento, prioriza el de mayor gama
        return Number(b.num_camaras) + Number(b.num_sensores) - (Number(a.num_camaras) + Number(a.num_sensores))
      }
      return Number(a.cuota_mensual) - Number(b.cuota_mensual)
    })

  return {
    kit: ordenados[0] || null,
    cubreEquipamiento: candidatos.length > 0,
  }
}

export function compararAlarmas(datosCliente, tarifasCatalogo) {
  const costeActualMensual = Number(datosCliente.cuotaMensualActual) || 0
  const { kit, cubreEquipamiento } = encontrarMejorKit(datosCliente, tarifasCatalogo)

  const costePropuestaMensual = kit ? Number(kit.cuota_mensual) : 0
  const ahorroMensual = costeActualMensual - costePropuestaMensual
  const ahorroAnual = ahorroMensual * 12
  const ahorroPorcentaje = costeActualMensual > 0 ? (ahorroMensual / costeActualMensual) * 100 : 0

  return {
    costeActualMensual,
    costeActualAnual: costeActualMensual * 12,
    kitPropuesto: kit,
    cubreEquipamiento,
    costePropuestaMensual,
    costePropuestaAnual: costePropuestaMensual * 12,
    ahorroMensual,
    ahorroAnual,
    ahorroPorcentaje,
    permanenciaRestanteMeses: Number(datosCliente.permanenciaRestanteMeses) || 0,
  }
}
