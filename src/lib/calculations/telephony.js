/**
 * Motor de comparación de telefonía / internet.
 *
 * Estrategia de matching:
 * 1. Si el cliente necesita fibra + líneas móviles, se busca primero un
 *    paquete CONVERGENTE que cubra o mejore la velocidad de fibra y el
 *    número de líneas móviles (y sus GB) — es la opción más económica
 *    habitualmente.
 * 2. Si ningún convergente cubre todas las líneas necesarias, se compone
 *    la propuesta combinando la mejor tarifa de fibra + la mejor tarifa
 *    móvil repetida por cada línea adicional necesaria.
 * 3. Si el cliente solo necesita líneas móviles (sin fibra), se elige la
 *    mejor tarifa móvil que cumpla sus GB y se multiplica por el nº de líneas.
 */

function cumpleDatos(tarifa, datosCliente) {
  if (datosCliente.datosIlimitadosDeseado) return Boolean(tarifa.datos_ilimitados)
  if (tarifa.datos_ilimitados) return true
  return (Number(tarifa.gb_datos) || 0) >= Number(datosCliente.gbPorLineaMovil || 0)
}

function ordenarPorPrecio(lista) {
  return [...lista].sort((a, b) => Number(a.precio_mensual) - Number(b.precio_mensual))
}

export function encontrarMejorPaquete(datosCliente, tarifasCatalogo) {
  const numLineas = Number(datosCliente.numLineasMoviles) || 0

  if (datosCliente.necesitaFibra) {
    const convergentesValidos = ordenarPorPrecio(
      tarifasCatalogo.filter(
        (t) =>
          t.tipo === 'convergente' &&
          (Number(t.velocidad_fibra_mb) || 0) >= Number(datosCliente.velocidadFibraDeseada || 0) &&
          Number(t.lineas_moviles_incluidas) >= numLineas &&
          (numLineas === 0 || cumpleDatos(t, datosCliente))
      )
    )

    if (convergentesValidos.length > 0) {
      const elegido = convergentesValidos[0]
      return {
        estrategia: 'convergente',
        componentes: [{ tarifa: elegido, cantidad: 1 }],
        precioMensual: Number(elegido.precio_mensual),
      }
    }

    // No hay convergente que cubra todo: componer fibra + N móviles
    const fibras = ordenarPorPrecio(
      tarifasCatalogo.filter((t) => t.tipo === 'fibra' && (Number(t.velocidad_fibra_mb) || 0) >= Number(datosCliente.velocidadFibraDeseada || 0))
    )
    const moviles = ordenarPorPrecio(tarifasCatalogo.filter((t) => t.tipo === 'movil' && cumpleDatos(t, datosCliente)))

    const mejorFibra = fibras[0] || null
    const mejorMovil = moviles[0] || null

    const componentes = []
    if (mejorFibra) componentes.push({ tarifa: mejorFibra, cantidad: 1 })
    if (mejorMovil && numLineas > 0) componentes.push({ tarifa: mejorMovil, cantidad: numLineas })

    const precioMensual = componentes.reduce((sum, c) => sum + Number(c.tarifa.precio_mensual) * c.cantidad, 0)

    return { estrategia: 'compuesto', componentes, precioMensual }
  }

  // Solo líneas móviles, sin fibra
  const moviles = ordenarPorPrecio(tarifasCatalogo.filter((t) => t.tipo === 'movil' && cumpleDatos(t, datosCliente)))
  const mejorMovil = moviles[0] || null
  const componentes = mejorMovil && numLineas > 0 ? [{ tarifa: mejorMovil, cantidad: numLineas }] : []
  const precioMensual = componentes.reduce((sum, c) => sum + Number(c.tarifa.precio_mensual) * c.cantidad, 0)

  return { estrategia: 'solo_movil', componentes, precioMensual }
}

export function compararTelefonia(datosCliente, tarifasCatalogo) {
  const costeActualMensual = Number(datosCliente.precioActualMensual) || 0
  const propuesta = encontrarMejorPaquete(datosCliente, tarifasCatalogo)

  const costePropuestaMensual = propuesta.precioMensual
  const ahorroMensual = costeActualMensual - costePropuestaMensual
  const ahorroAnual = ahorroMensual * 12
  const ahorroPorcentaje = costeActualMensual > 0 ? (ahorroMensual / costeActualMensual) * 100 : 0

  return {
    costeActualMensual,
    costeActualAnual: costeActualMensual * 12,
    propuesta,
    costePropuestaMensual,
    costePropuestaAnual: costePropuestaMensual * 12,
    ahorroMensual,
    ahorroAnual,
    ahorroPorcentaje,
  }
}
