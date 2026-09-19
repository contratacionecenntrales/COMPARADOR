import { IVA } from '../constants'

/**
 * Motor de comparación de telefonía / internet.
 *
 * El cliente puede añadir varias fibras (p.ej. varias sedes) y varias
 * líneas móviles (cada una con su propio número y GB deseados, para poder
 * calcar una factura real línea a línea).
 *
 * Estrategia de matching:
 * 1. Si hay exactamente UNA fibra y alguna línea móvil, se busca primero un
 *    paquete CONVERGENTE que cubra la velocidad de esa fibra y el número de
 *    líneas móviles (con el perfil de datos más exigente de todas ellas) —
 *    suele ser la opción más económica.
 * 2. Si no hay convergente que cubra todo (o hay más de una fibra, lo que ya
 *    no encaja en un único paquete convergente), se compone la propuesta:
 *    la mejor tarifa de fibra para cada fibra solicitada + la mejor tarifa
 *    móvil para cada línea, individualmente (cada línea puede necesitar
 *    GB distintos).
 */

function cumpleLinea(tarifa, linea) {
  if (linea.ilimitado) return Boolean(tarifa.datos_ilimitados)
  if (tarifa.datos_ilimitados) return true
  return (Number(tarifa.gb_datos) || 0) >= Number(linea.gbDeseados || 0)
}

function ordenarPorPrecio(lista) {
  return [...lista].sort((a, b) => Number(a.precio_mensual) - Number(b.precio_mensual))
}

export function encontrarMejorPaquete(datosCliente, tarifasCatalogo) {
  const fibras = datosCliente.fibras || []
  const lineasMoviles = datosCliente.lineasMoviles || []
  const numLineas = lineasMoviles.length

  // 1. Intento de paquete convergente (solo tiene sentido con una única fibra)
  if (fibras.length === 1 && numLineas > 0) {
    const fibra = fibras[0]
    const exigeIlimitado = lineasMoviles.some((l) => l.ilimitado)
    const gbMax = Math.max(0, ...lineasMoviles.filter((l) => !l.ilimitado).map((l) => Number(l.gbDeseados) || 0))

    const convergentesValidos = ordenarPorPrecio(
      tarifasCatalogo.filter(
        (t) =>
          t.tipo === 'convergente' &&
          (Number(t.velocidad_fibra_mb) || 0) >= Number(fibra.velocidadDeseada || 0) &&
          Number(t.lineas_moviles_incluidas) >= numLineas &&
          (exigeIlimitado ? t.datos_ilimitados : t.datos_ilimitados || (Number(t.gb_datos) || 0) >= gbMax)
      )
    )

    if (convergentesValidos.length > 0) {
      const elegido = convergentesValidos[0]
      return {
        estrategia: 'convergente',
        componentes: [
          {
            tarifa: elegido,
            cantidad: 1,
            etiqueta: `${fibra.etiqueta || 'Fibra'} + ${numLineas} línea${numLineas > 1 ? 's' : ''} móvil${numLineas > 1 ? 'es' : ''}`,
          },
        ],
        precioMensual: Number(elegido.precio_mensual),
      }
    }
  }

  // 2. Composición: cada fibra y cada línea móvil se cubren por separado
  const fibrasCatalogo = ordenarPorPrecio(tarifasCatalogo.filter((t) => t.tipo === 'fibra'))
  const movilesCatalogo = tarifasCatalogo.filter((t) => t.tipo === 'movil')

  const componentes = []

  fibras.forEach((fibra) => {
    const validas = ordenarPorPrecio(fibrasCatalogo.filter((t) => (Number(t.velocidad_fibra_mb) || 0) >= Number(fibra.velocidadDeseada || 0)))
    if (validas[0]) {
      componentes.push({ tarifa: validas[0], cantidad: 1, etiqueta: fibra.etiqueta || 'Fibra' })
    }
  })

  lineasMoviles.forEach((linea, idx) => {
    const validas = ordenarPorPrecio(movilesCatalogo.filter((t) => cumpleLinea(t, linea)))
    if (validas[0]) {
      componentes.push({
        tarifa: validas[0],
        cantidad: 1,
        etiqueta: linea.numero ? `Línea ${linea.numero}` : `Línea móvil ${idx + 1}`,
      })
    }
  })

  const precioMensual = componentes.reduce((sum, c) => sum + Number(c.tarifa.precio_mensual) * c.cantidad, 0)

  return { estrategia: fibras.length > 0 ? 'compuesto' : 'solo_movil', componentes, precioMensual }
}

/**
 * Construye el "Resumen de factura" al estilo Movistar Fusión a partir de
 * los importes (IVA incluido, como se ven en cualquier factura o tarifa
 * comercial) de cuotas mensuales, consumos fuera de bono y otros conceptos
 * (roaming, servicios adicionales...). Descompone en base imponible + IVA,
 * igual que el bloque "Impuestos" de la factura real.
 */
function resumenFactura({ cuotas = 0, consumos = 0, otros = 0 }) {
  const total = Number(cuotas) + Number(consumos) + Number(otros)
  const base = total / (1 + IVA)
  const iva = total - base
  return { cuotas: Number(cuotas), consumos: Number(consumos), otros: Number(otros), base, iva, total }
}

export function compararTelefonia(datosCliente, tarifasCatalogo) {
  const desgloseActual = resumenFactura({
    cuotas: datosCliente.cuotaMensualActual,
    consumos: datosCliente.consumosActual,
    otros: datosCliente.otrosConceptosActual,
  })

  const propuesta = encontrarMejorPaquete(datosCliente, tarifasCatalogo)
  const desglosePropuesta = resumenFactura({ cuotas: propuesta.precioMensual })

  const costeActualMensual = desgloseActual.total
  const costePropuestaMensual = desglosePropuesta.total
  const ahorroMensual = costeActualMensual - costePropuestaMensual
  const ahorroAnual = ahorroMensual * 12
  const ahorroPorcentaje = costeActualMensual > 0 ? (ahorroMensual / costeActualMensual) * 100 : 0

  return {
    desgloseActual,
    desglosePropuesta,
    costeActualMensual,
    costeActualAnual: costeActualMensual * 12,
    propuesta,
    costePropuestaMensual,
    costePropuestaAnual: costePropuestaMensual * 12,
    ahorroMensual,
    ahorroAnual,
    ahorroPorcentaje,
    cambioTitular: datosCliente.cambioTitular?.activo ? datosCliente.cambioTitular : null,
  }
}
