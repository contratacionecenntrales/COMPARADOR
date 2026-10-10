// Motor de cálculo del Informe de Auditoría y Optimización de
// Telecomunicaciones: compara el desglose manual de la factura actual del
// cliente (introducido por el consultor) contra el catálogo de operadoras
// de mercado (tarifa_mercado), y calcula el ahorro frente a cada una.

export const DIAGNOSTICOS_FACTURA = [
  { valor: 'SOBREDIMENSIONADA', nivel: 'negativo' },
  { valor: 'PRESCINDIBLE', nivel: 'negativo' },
  { valor: 'FUGA DE COSTE', nivel: 'negativo' },
  { valor: 'CARGO OCULTO', nivel: 'negativo' },
  { valor: 'REVISABLE', nivel: 'negativo' },
  { valor: 'CADUCARÁ', nivel: 'aviso' },
  { valor: 'PRECIO MEDIO', nivel: 'neutro' },
  { valor: 'CORRECTO', nivel: 'neutro' },
  { valor: 'SE MANTIENE', nivel: 'neutro' },
]

export function crearConceptoVacio() {
  return { concepto: '', importeMes: 0, diagnostico: 'PRECIO MEDIO' }
}

export function crearHallazgoVacio() {
  return { titulo: '', descripcion: '' }
}

function generarCodigoPresupuesto() {
  const mes = String(new Date().getMonth() + 1).padStart(2, '0')
  const numero = Math.floor(1000000 + Math.random() * 9000000)
  return `ICC-${mes}-${numero}`
}

/**
 * @param {object} input
 * @param {object} input.cliente - { nombre, ubicacion, operadorActual, periodoFactura }
 * @param {Array}  input.conceptos - [{ concepto, importeMes, diagnostico }]
 * @param {Array}  input.hallazgos - [{ titulo, descripcion }] (3 tarjetas)
 * @param {number|null} input.operadorRecomendadoId - fuerza la operadora recomendada; null = usa la marcada en el catálogo
 * @param {object} input.consultor - { nombre, email }
 * @param {Array} catalogoMercado - filas de tarifa_mercado (ver api/_catalogos.php)
 */
export function ejecutarAuditoriaTelecom(input, catalogoMercado) {
  const conceptos = (input.conceptos || []).filter((c) => c.concepto?.trim())
  const costeActualMensual = conceptos.reduce((sum, c) => sum + (Number(c.importeMes) || 0), 0)
  const costeActualAnual = costeActualMensual * 12

  const operadores = (catalogoMercado || [])
    .filter((o) => o.activo)
    .slice()
    .sort((a, b) => a.cuota_mensual - b.cuota_mensual)
    .map((op) => {
      const costeAnual = op.cuota_mensual * 12
      return {
        ...op,
        costeAnual,
        ahorroAnual: costeActualAnual - costeAnual,
        caracteristicasLista: (op.caracteristicas || '')
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean),
      }
    })

  let recomendado = null
  if (input.operadorRecomendadoId != null) {
    recomendado = operadores.find((o) => o.id === input.operadorRecomendadoId) || null
  }
  if (!recomendado) {
    recomendado = operadores.find((o) => o.recomendada) || operadores[0] || null
  }

  const diferenciaMensual = recomendado ? costeActualMensual - recomendado.cuota_mensual : 0
  const ahorroAnual = diferenciaMensual * 12
  const ahorroPorcentaje = costeActualAnual > 0 ? (ahorroAnual / costeActualAnual) * 100 : 0
  const operadorasQueMejoran = operadores.filter((o) => o.ahorroAnual > 0).length
  const peorAhorro = operadores.reduce((min, o) => Math.min(min, o.ahorroAnual), 0)

  return {
    codigo: generarCodigoPresupuesto(),
    fechaEmision: new Date().toISOString(),
    cliente: input.cliente,
    conceptos,
    costeActualMensual,
    costeActualAnual,
    hallazgos: (input.hallazgos || []).filter((h) => h.titulo?.trim() || h.descripcion?.trim()),
    operadores,
    recomendado,
    diferenciaMensual,
    ahorroAnual,
    ahorroPorcentaje,
    operadorasQueMejoran,
    totalOperadoras: operadores.length,
    peorEncarecimiento: peorAhorro < 0 ? Math.abs(peorAhorro) : 0,
    consultor: input.consultor,
  }
}
