import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import logoHorizontal from '../../assets/brand/icc-logo-horizontal.png'
import { COMPANY } from '../constants'
import { formatEUR, formatPercent } from '../format'

const NAVY = [19, 26, 36]
const GOLD = [201, 162, 39]
const GOLD_LIGHT = [250, 244, 224]
const SLATE = [100, 116, 139]
const BORDER = [222, 227, 235]
const ROW_TINT = [246, 248, 251]
const RED = [185, 28, 28]
const RED_LIGHT = [253, 235, 235]
const GREEN = [21, 128, 61]
const AMBER = [146, 64, 14]
const AMBER_LIGHT = [254, 243, 199]
const GRAY_PILL = [241, 245, 249]
const GRAY_PILL_TEXT = [71, 85, 105]
const BAR_TRACK = [222, 227, 235]

const MARGEN = 14

const POR_QUE_ICC = [
  ['100 % independientes.', 'Trabajamos con todas las compañías y le mostramos el mercado completo.'],
  ['Gestión integral.', 'Portabilidad, bajas, instalación y revisión de la primera factura. Usted no hace ninguna llamada.'],
  ['Cero tarifas ocultas.', 'Vigilamos cargos de terceros, caducidad de descuentos y subidas de precio.'],
]

function cargarImagenComoDataURL(src, maxWidth = 500) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const escala = Math.min(1, maxWidth / img.width)
      const width = Math.round(img.width * escala)
      const height = Math.round(img.height * escala)
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      resolve({ dataUrl: canvas.toDataURL('image/png'), width, height })
    }
    img.onerror = reject
    img.src = src
  })
}

function nivelDiagnostico(valor) {
  if (['SOBREDIMENSIONADA', 'PRESCINDIBLE', 'FUGA DE COSTE', 'CARGO OCULTO', 'REVISABLE'].includes(valor)) return 'negativo'
  if (valor === 'CADUCARÁ') return 'aviso'
  return 'neutro'
}

function coloresPill(nivel) {
  if (nivel === 'negativo') return { bg: RED_LIGHT, fg: RED }
  if (nivel === 'aviso') return { bg: AMBER_LIGHT, fg: AMBER }
  return { bg: GRAY_PILL, fg: GRAY_PILL_TEXT }
}

function dibujarCabecera(doc, pageWidth, logoData, codigo, fechaTexto) {
  if (logoData) {
    const logoAlto = 8
    const logoAncho = (logoData.width / logoData.height) * logoAlto
    doc.addImage(logoData.dataUrl, 'PNG', MARGEN, 10, logoAncho, logoAlto)
  }
  doc.setFont(undefined, 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...SLATE)
  doc.text(`Presupuesto ${codigo}`, pageWidth - MARGEN, 13, { align: 'right' })
  doc.setFont(undefined, 'normal')
  doc.setFontSize(8)
  doc.text(`Emitido el ${fechaTexto} · Válido 30 días`, pageWidth - MARGEN, 17.5, { align: 'right' })
  doc.setDrawColor(...BORDER)
  doc.setLineWidth(0.3)
  doc.line(MARGEN, 24, pageWidth - MARGEN, 24)
}

function nuevaPagina(doc, pageWidth, logoData, codigo, fechaTexto) {
  doc.addPage()
  dibujarCabecera(doc, pageWidth, logoData, codigo, fechaTexto)
  return 36
}

function asegurarEspacio(doc, pageWidth, logoData, codigo, fechaTexto, y, necesario, limite = 265) {
  if (y + necesario > limite) {
    return nuevaPagina(doc, pageWidth, logoData, codigo, fechaTexto)
  }
  return y
}

function badgeNumero(doc, numero, x, y, tam = 7) {
  doc.setFillColor(...GOLD)
  doc.circle(x + tam / 2, y + tam / 2, tam / 2, 'F')
  doc.setTextColor(...NAVY)
  doc.setFont(undefined, 'bold')
  doc.setFontSize(9.5)
  doc.text(String(numero), x + tam / 2, y + tam / 2 + 1.2, { align: 'center' })
  doc.setFont(undefined, 'normal')
}

function tituloSeccion(doc, pageWidth, numero, texto, y) {
  badgeNumero(doc, numero, MARGEN, y - 5)
  doc.setFontSize(13)
  doc.setTextColor(...NAVY)
  doc.setFont(undefined, 'bold')
  doc.text(texto, MARGEN + 10, y)
  doc.setFont(undefined, 'normal')
  return y + 8
}

function tarjetaStat(doc, x, y, w, h, { bg, labelColor, label, valorColor, valor, caption, captionColor }) {
  doc.setFillColor(...bg)
  doc.roundedRect(x, y, w, h, 2.5, 2.5, 'F')
  doc.setFont(undefined, 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...labelColor)
  doc.text(label, x + 5, y + 7)
  doc.setFontSize(18)
  doc.setTextColor(...valorColor)
  doc.text(valor, x + 5, y + 18)
  doc.setFont(undefined, 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...captionColor)
  doc.text(caption, x + 5, y + 25)
}

function dibujarPastillaDiagnostico(doc, valor, x, y) {
  const { bg, fg } = coloresPill(nivelDiagnostico(valor))
  doc.setFontSize(6.6)
  doc.setFont(undefined, 'bold')
  const w = doc.getTextWidth(valor) + 4
  doc.setFillColor(...bg)
  doc.roundedRect(x, y, w, 4.4, 1.2, 1.2, 'F')
  doc.setTextColor(...fg)
  doc.text(valor, x + w / 2, y + 3, { align: 'center' })
  doc.setFont(undefined, 'normal')
}

function graficoBarras(doc, x, y, width, operadores, costeActualAnual, recomendadoId) {
  const maxValue = Math.max(costeActualAnual, ...operadores.map((o) => o.costeAnual), 1)
  const etiquetaW = 40
  const valorW = 24
  const barMaxW = width - etiquetaW - valorW
  const filaH = 7.5

  operadores.forEach((op, i) => {
    const rowY = y + i * filaH
    const esRecomendado = op.id === recomendadoId
    doc.setFontSize(8)
    doc.setFont(undefined, esRecomendado ? 'bold' : 'normal')
    doc.setTextColor(...NAVY)
    doc.text(op.operador, x, rowY + 4.2, { maxWidth: etiquetaW - 2 })

    const barW = Math.max(1.5, (op.costeAnual / maxValue) * barMaxW)
    doc.setFillColor(...BAR_TRACK)
    doc.roundedRect(x + etiquetaW, rowY, barMaxW, 5, 1, 1, 'F')
    doc.setFillColor(...(esRecomendado ? GOLD : [160, 170, 184]))
    doc.roundedRect(x + etiquetaW, rowY, barW, 5, 1, 1, 'F')

    doc.setFont(undefined, esRecomendado ? 'bold' : 'normal')
    doc.setTextColor(...NAVY)
    doc.text(formatEUR(op.costeAnual), x + etiquetaW + barMaxW + 2, rowY + 4.2)
  })

  const altoTotal = operadores.length * filaH
  const lineaX = x + etiquetaW + (costeActualAnual / maxValue) * barMaxW
  doc.setDrawColor(...RED)
  doc.setLineWidth(0.5)
  doc.setLineDashPattern([1.2, 1], 0)
  doc.line(lineaX, y - 3, lineaX, y + altoTotal + 2)
  doc.setLineDashPattern([], 0)
  doc.setFont(undefined, 'bold')
  doc.setFontSize(7.6)
  doc.setTextColor(...RED)
  const alineacion = lineaX > x + width - 45 ? 'right' : 'left'
  doc.text(`Hoy: ${formatEUR(costeActualAnual)} / año`, alineacion === 'right' ? lineaX : lineaX, y + altoTotal + 6.5, {
    align: alineacion,
  })
  doc.setFont(undefined, 'normal')

  return y + altoTotal + 12
}

function marcaCheck(doc, cx, cy) {
  doc.setFillColor(...GOLD)
  doc.circle(cx, cy, 1.6, 'F')
  doc.setDrawColor(255, 255, 255)
  doc.setLineWidth(0.45)
  doc.line(cx - 0.9, cy, cx - 0.3, cy + 0.7)
  doc.line(cx - 0.3, cy + 0.7, cx + 0.9, cy - 0.8)
}

function bulletsSimples(doc, textos, x, y, w) {
  const colW = w / 2
  let yMax = y
  textos.forEach((texto, idx) => {
    const col = idx % 2
    const fila = Math.floor(idx / 2)
    const colX = x + col * colW
    const rowY = y + fila * 14
    marcaCheck(doc, colX + 1.6, rowY + 1)
    doc.setFont(undefined, 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...NAVY)
    const lineas = doc.splitTextToSize(texto, colW - 8)
    doc.text(lineas, colX + 5.5, rowY + 1.8)
    yMax = Math.max(yMax, rowY + 1.8 + lineas.length * 3.8)
  })
  return yMax + 5
}

function bulletsDosColumnas(doc, pares, x, y, w) {
  const colW = w / 2
  let yMax = y
  pares.forEach(([titulo, descripcion], idx) => {
    const col = idx % 2
    const fila = Math.floor(idx / 2)
    const colX = x + col * colW
    const rowY = y + fila * 18
    marcaCheck(doc, colX + 1.6, rowY + 1)
    doc.setFont(undefined, 'bold')
    doc.setFontSize(8.3)
    doc.setTextColor(...NAVY)
    doc.text(titulo, colX + 5.5, rowY + 1.8)
    doc.setFont(undefined, 'normal')
    doc.setFontSize(7.8)
    doc.setTextColor(...SLATE)
    const lineas = doc.splitTextToSize(descripcion, colW - 8)
    doc.text(lineas, colX + 5.5, rowY + 6)
    yMax = Math.max(yMax, rowY + 6 + lineas.length * 3.6)
  })
  return yMax + 4
}

export async function generarInformeTelecomPDF(resultado) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()

  let logoData = null
  try {
    logoData = await cargarImagenComoDataURL(logoHorizontal, 400)
  } catch {
    logoData = null
  }

  const fechaTexto = new Date(resultado.fechaEmision).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const cabecera = () => dibujarCabecera(doc, pageWidth, logoData, resultado.codigo, fechaTexto)
  const espacio = (y, necesario, limite) => asegurarEspacio(doc, pageWidth, logoData, resultado.codigo, fechaTexto, y, necesario, limite)

  cabecera()

  // ---- Banda navy: título + metadatos ----
  const bandaY = 30
  const bandaH = 62
  doc.setFillColor(...NAVY)
  doc.rect(MARGEN, bandaY, pageWidth - MARGEN * 2, bandaH, 'F')

  doc.setFont(undefined, 'bold')
  doc.setFontSize(7.6)
  doc.setTextColor(...GOLD)
  doc.text('INFORME DE AUDITORÍA Y OPTIMIZACIÓN · 9 AÑOS OPTIMIZANDO COSTES DE EMPRESAS', MARGEN + 6, bandaY + 10)

  doc.setFontSize(19)
  doc.setTextColor(255, 255, 255)
  doc.text('Informe de Auditoría y Optimización', MARGEN + 6, bandaY + 20)
  doc.text('de Telecomunicaciones', MARGEN + 6, bandaY + 28.5)

  doc.setFontSize(9)
  doc.setFont(undefined, 'bold')
  const lineasSubtitulo = doc.splitTextToSize(
    'Trabajamos con el 100 % de los servicios y el 100 % de las compañías para garantizar la solución perfecta para su negocio.',
    pageWidth - MARGEN * 2 - 12
  )
  doc.text(lineasSubtitulo, MARGEN + 6, bandaY + 36)

  const metaY = bandaY + 48
  const metaCols = [
    ['Cliente', resultado.cliente?.nombre || '—'],
    ['Ubicación', resultado.cliente?.ubicacion || '—'],
    ['Operador actual', resultado.cliente?.operadorActual || '—'],
    ['Factura analizada', resultado.cliente?.periodoFactura || '—'],
  ]
  const metaColW = (pageWidth - MARGEN * 2 - 12) / 4
  metaCols.forEach(([label, valor], idx) => {
    const colX = MARGEN + 6 + idx * metaColW
    doc.setFont(undefined, 'normal')
    doc.setFontSize(7.2)
    doc.setTextColor(...GOLD)
    doc.text(label, colX, metaY)
    doc.setFont(undefined, 'bold')
    doc.setFontSize(8.3)
    doc.setTextColor(255, 255, 255)
    doc.text(String(valor), colX, metaY + 5, { maxWidth: metaColW - 4 })
  })

  let y = bandaY + bandaH + 2
  doc.setFillColor(...GOLD)
  doc.rect(MARGEN, y, pageWidth - MARGEN * 2, 1.3, 'F')
  y += 7

  // ---- 3 tarjetas stat ----
  const statW = (pageWidth - MARGEN * 2 - 8) / 3
  const statH = 30
  const recomendado = resultado.recomendado
  tarjetaStat(doc, MARGEN, y, statW, statH, {
    bg: RED_LIGHT,
    labelColor: RED,
    label: 'LO QUE PAGA HOY',
    valorColor: RED,
    valor: `${formatEUR(resultado.costeActualMensual)}`,
    caption: `al mes · ${formatEUR(resultado.costeActualAnual)} al año`,
    captionColor: [150, 60, 60],
  })
  tarjetaStat(doc, MARGEN + statW + 4, y, statW, statH, {
    bg: ROW_TINT,
    labelColor: SLATE,
    label: 'CON NUESTRA PROPUESTA',
    valorColor: NAVY,
    valor: recomendado ? formatEUR(recomendado.cuota_mensual) : '—',
    caption: `al mes · ${recomendado?.operador || 'Sin propuesta'}`,
    captionColor: SLATE,
  })
  tarjetaStat(doc, MARGEN + (statW + 4) * 2, y, statW, statH, {
    bg: NAVY,
    labelColor: GOLD,
    label: 'AHORRO ANUAL · IVA INCLUIDO',
    valorColor: GOLD,
    valor: formatEUR(Math.abs(resultado.ahorroAnual)),
    caption: `${formatEUR(Math.abs(resultado.diferenciaMensual))} al mes × 12 meses`,
    captionColor: [210, 215, 225],
  })
  y += statH + 10

  // ---- 1. Diagnóstico ----
  y = tituloSeccion(doc, pageWidth, 1, 'Diagnóstico: lo que está pagando', y)

  const DIAGNOSTICOS_SIN_VALOR = ['PRESCINDIBLE', 'FUGA DE COSTE', 'CARGO OCULTO']
  const alertaTotal = resultado.conceptos
    .filter((c) => DIAGNOSTICOS_SIN_VALOR.includes(c.diagnostico))
    .reduce((s, c) => s + (Number(c.importeMes) || 0), 0)
  const fraseIntro =
    alertaTotal > 0
      ? `Paga ${formatEUR(resultado.costeActualMensual)} al mes. ${formatEUR(alertaTotal)} son cargos que no aportan valor a su negocio.`
      : `Paga ${formatEUR(resultado.costeActualMensual)} al mes, con una factura correctamente dimensionada a su consumo actual.`
  doc.setFontSize(9.3)
  doc.setFont(undefined, 'bold')
  doc.setTextColor(...NAVY)
  doc.text(doc.splitTextToSize(fraseIntro, pageWidth - MARGEN * 2), MARGEN, y)
  doc.setFont(undefined, 'normal')
  y += 8

  autoTable(doc, {
    startY: y,
    columns: [
      { header: 'Concepto', dataKey: 'concepto' },
      { header: 'Importe / mes (IVA incl.)', dataKey: 'importe' },
      { header: 'Diagnóstico', dataKey: 'diagnostico' },
    ],
    body: resultado.conceptos.map((c) => ({
      concepto: c.concepto,
      importe: formatEUR(c.importeMes),
      diagnostico: c.diagnostico,
    })),
    foot: [[{ content: 'Total factura', styles: { fontStyle: 'bold' } }, { content: formatEUR(resultado.costeActualMensual), styles: { fontStyle: 'bold' } }, '']],
    theme: 'striped',
    headStyles: { fillColor: NAVY, textColor: 255, fontSize: 8, fontStyle: 'bold' },
    footStyles: { fillColor: ROW_TINT, textColor: NAVY },
    alternateRowStyles: { fillColor: ROW_TINT },
    styles: { fontSize: 8.3, textColor: NAVY, lineColor: BORDER, lineWidth: 0.15, valign: 'middle' },
    columnStyles: { importe: { cellWidth: 40 }, diagnostico: { cellWidth: 44 } },
    margin: { left: MARGEN, right: MARGEN },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.dataKey === 'diagnostico') {
        data.cell.text = []
      }
    },
    didDrawCell: (data) => {
      if (data.section === 'body' && data.column.dataKey === 'diagnostico') {
        dibujarPastillaDiagnostico(doc, data.cell.raw, data.cell.x + 2, data.cell.y + data.cell.height / 2 - 2.2)
      }
    },
  })
  y = doc.lastAutoTable.finalY + 8

  if (resultado.hallazgos.length) {
    y = espacio(y, 32)
    const cardW = (pageWidth - MARGEN * 2 - (resultado.hallazgos.length - 1) * 4) / resultado.hallazgos.length
    const cardH = 26
    resultado.hallazgos.forEach((h, idx) => {
      const cx = MARGEN + idx * (cardW + 4)
      doc.setFillColor(255, 255, 255)
      doc.setDrawColor(...BORDER)
      doc.rect(cx, y, cardW, cardH, 'FD')
      doc.setFillColor(...RED)
      doc.rect(cx, y, 1.1, cardH, 'F')
      doc.setFont(undefined, 'bold')
      doc.setFontSize(8.4)
      doc.setTextColor(...NAVY)
      doc.text(doc.splitTextToSize(h.titulo, cardW - 8), cx + 5, y + 7)
      doc.setFont(undefined, 'normal')
      doc.setFontSize(7.4)
      doc.setTextColor(...SLATE)
      doc.text(doc.splitTextToSize(h.descripcion, cardW - 8), cx + 5, y + 14)
    })
    y += cardH + 8
  }

  // ---- 2. Comparativa de mercado ----
  y = nuevaPagina(doc, pageWidth, logoData, resultado.codigo, fechaTexto)
  y = tituloSeccion(doc, pageWidth, 2, `Comparativa de mercado: ${resultado.totalOperadoras} operadoras`, y)

  const fraseComparativa =
    resultado.operadorasQueMejoran === resultado.totalOperadoras
      ? `Todas las alternativas le ahorran frente a su tarifa actual. ${recomendado?.operador || ''} es la que mejor combina prestaciones de empresa y ahorro.`
      : `Solo ${resultado.operadorasQueMejoran} de las ${resultado.totalOperadoras} operadoras mejoran su tarifa actual; cambiar sin asesoramiento podría encarecerla hasta ${formatEUR(
          resultado.peorEncarecimiento
        )} al año. ${recomendado?.operador || ''} le da más prestaciones y reduce su coste.`
  doc.setFontSize(9.3)
  doc.setFont(undefined, 'bold')
  doc.setTextColor(...NAVY)
  doc.text(doc.splitTextToSize(fraseComparativa, pageWidth - MARGEN * 2), MARGEN, y)
  doc.setFont(undefined, 'normal')
  y += 10

  y = graficoBarras(doc, MARGEN, y, pageWidth - MARGEN * 2, resultado.operadores, resultado.costeActualAnual, recomendado?.id)
  y += 2
  doc.setFontSize(7)
  doc.setTextColor(...SLATE)
  doc.text('Coste anual estimado con IVA incluido para una configuración equivalente a la actual. Línea roja: lo que paga hoy.', MARGEN, y)
  y += 6

  const filasComparativa = resultado.operadores.map((op) => {
    const esRecomendado = op.id === recomendado?.id
    return [
      op.operador,
      formatEUR(op.cuota_mensual),
      op.promocion || '—',
      formatEUR(op.costeAnual),
      { texto: formatEUR(op.ahorroAnual), positivo: op.ahorroAnual >= 0 },
      op.valoracion || '—',
      esRecomendado,
    ]
  })
  filasComparativa.push([
    `Situación actual (${resultado.cliente?.operadorActual || 'actual'})`,
    formatEUR(resultado.costeActualMensual),
    '—',
    formatEUR(resultado.costeActualAnual),
    { texto: '—', positivo: null },
    'Su factura actual',
    false,
  ])

  autoTable(doc, {
    startY: y,
    head: [['Operador', 'Cuota / mes', 'Promoción', 'Coste anual', 'Ahorro anual', 'Valoración']],
    body: filasComparativa.map((f) => [f[0], f[1], f[2], f[3], f[4].texto, f[5]]),
    theme: 'striped',
    headStyles: { fillColor: NAVY, textColor: 255, fontSize: 7.8, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: ROW_TINT },
    styles: { fontSize: 7.6, textColor: NAVY, lineColor: BORDER, lineWidth: 0.15, valign: 'middle' },
    margin: { left: MARGEN, right: MARGEN },
    didParseCell: (data) => {
      if (data.section !== 'body') return
      const meta = filasComparativa[data.row.index]
      const esActual = data.row.index === filasComparativa.length - 1
      if (meta[6]) {
        data.cell.styles.fillColor = GOLD_LIGHT
        data.cell.styles.fontStyle = 'bold'
      }
      if (esActual) {
        data.cell.styles.textColor = RED
        data.cell.styles.fontStyle = 'italic'
      }
      if (data.column.index === 4 && meta[4].positivo !== null) {
        data.cell.styles.textColor = meta[4].positivo ? GREEN : RED
        data.cell.styles.fontStyle = 'bold'
      }
    },
  })
  y = doc.lastAutoTable.finalY + 6
  doc.setFontSize(6.8)
  doc.setTextColor(...SLATE)
  doc.text(
    doc.splitTextToSize(
      'Importes con IVA (21 %) incluido. Precios de referencia del catálogo de operadoras de Integral Connection Consulting: confirme la cuota exacta con cada operadora antes de contratar.',
      pageWidth - MARGEN * 2
    ),
    MARGEN,
    y
  )

  // ---- 3. Nuestra propuesta ----
  y = nuevaPagina(doc, pageWidth, logoData, resultado.codigo, fechaTexto)
  y = tituloSeccion(doc, pageWidth, 3, `Nuestra propuesta: ${recomendado?.operador || ''}`, y)

  const fraseExplica = `Con ${recomendado?.operador || 'nuestra propuesta'}, su factura pasa de ${formatEUR(
    resultado.costeActualMensual
  )} a ${formatEUR(recomendado?.cuota_mensual || 0)} al mes.`
  doc.setFontSize(9.3)
  doc.setFont(undefined, 'bold')
  doc.setTextColor(...NAVY)
  doc.text(doc.splitTextToSize(fraseExplica, pageWidth - MARGEN * 2), MARGEN, y)
  doc.setFont(undefined, 'normal')
  y += 10

  const colW = (pageWidth - MARGEN * 2 - 6) / 2
  autoTable(doc, {
    startY: y,
    body: [
      ['Paga hoy', `${formatEUR(resultado.costeActualMensual)} / mes`],
      [`Pagará con ${recomendado?.operador || ''}`, `${formatEUR(recomendado?.cuota_mensual || 0)} / mes`],
      ['Diferencia mensual', `${formatEUR(resultado.diferenciaMensual)} / mes`],
      ['× 12 meses', ''],
      [{ content: 'Ahorro anual, IVA incluido', styles: { fontStyle: 'bold' } }, { content: formatEUR(resultado.ahorroAnual), styles: { fontStyle: 'bold' } }],
    ],
    theme: 'plain',
    styles: { fontSize: 8.6, textColor: NAVY, cellPadding: 2 },
    columnStyles: { 1: { halign: 'right' } },
    tableWidth: colW,
    margin: { left: MARGEN },
  })
  const finalYTabla = doc.lastAutoTable.finalY

  const cardX = MARGEN + colW + 6
  const cardH = Math.max(finalYTabla - y, 34)
  doc.setFillColor(...NAVY)
  doc.roundedRect(cardX, y, colW, cardH, 2.5, 2.5, 'F')
  doc.setFont(undefined, 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...GOLD)
  doc.text('AHORRO ANUAL GARANTIZADO', cardX + 6, y + 9)
  doc.setFontSize(19)
  doc.text(formatEUR(resultado.ahorroAnual), cardX + 6, y + 20)
  doc.setFont(undefined, 'normal')
  doc.setFontSize(7.3)
  doc.setTextColor(220, 223, 230)
  doc.text(`IVA incluido · ${formatEUR(resultado.ahorroAnual * 3)} en 3 años`, cardX + 6, y + 27)

  y = Math.max(finalYTabla, y + cardH) + 10

  if (recomendado?.caracteristicasLista?.length) {
    y = espacio(y, 30)
    doc.setFont(undefined, 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...NAVY)
    doc.text(`Por qué ${recomendado.operador}`, MARGEN, y)
    doc.setFont(undefined, 'normal')
    y += 6
    y = bulletsSimples(doc, recomendado.caracteristicasLista, MARGEN, y, pageWidth - MARGEN * 2)
  }

  y = espacio(y, 30)
  doc.setFont(undefined, 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...NAVY)
  doc.text('Por qué con Integral Connection Consulting', MARGEN, y)
  doc.setFont(undefined, 'normal')
  y += 6
  const bulletsICC = [
    ...POR_QUE_ICC,
    ['Una consultora, no un call center.', `${resultado.consultor?.nombre || 'Su consultor/a'} lleva su caso de principio a fin, con contacto directo.`],
  ]
  y = bulletsDosColumnas(doc, bulletsICC, MARGEN, y, pageWidth - MARGEN * 2)

  // ---- CTA + aceptación ----
  y = espacio(y, 70, 230)
  const ctaW = (pageWidth - MARGEN * 2) * 0.58
  const aceptW = pageWidth - MARGEN * 2 - ctaW - 6
  const ctaH = 62

  doc.setFillColor(...NAVY)
  doc.rect(MARGEN, y, ctaW, ctaH, 'F')
  doc.setFont(undefined, 'bold')
  doc.setFontSize(12)
  doc.setTextColor(255, 255, 255)
  doc.text('Cada mes sin cambiar le cuesta', MARGEN + 6, y + 10)
  doc.setFontSize(16)
  doc.setTextColor(...GOLD)
  doc.text(`${formatEUR(Math.abs(resultado.diferenciaMensual))}.`, MARGEN + 6, y + 18)
  doc.setFont(undefined, 'normal')
  doc.setFontSize(7.8)
  doc.setTextColor(220, 223, 230)
  doc.text(
    doc.splitTextToSize('Firme hoy y nos encargamos de todo. Migración en 5–14 días, sin cortes de servicio y conservando sus números.', ctaW - 12),
    MARGEN + 6,
    y + 25
  )

  const pasos = [
    ['1 · Firme', 'Este presupuesto'],
    ['2 · Gestionamos', 'Portabilidad y alta'],
    ['3 · Ahorra', 'Desde la primera factura'],
  ]
  const pasoW = (ctaW - 12 - 8) / 3
  pasos.forEach(([titulo, sub], idx) => {
    const px = MARGEN + 6 + idx * (pasoW + 4)
    doc.setFillColor(35, 44, 58)
    doc.rect(px, y + 35, pasoW, 14, 'F')
    doc.setFont(undefined, 'bold')
    doc.setFontSize(7.6)
    doc.setTextColor(...GOLD)
    doc.text(titulo, px + 2.5, y + 40.5)
    doc.setFont(undefined, 'normal')
    doc.setFontSize(6.6)
    doc.setTextColor(220, 223, 230)
    doc.text(sub, px + 2.5, y + 45)
  })

  doc.setFillColor(...GOLD)
  doc.rect(MARGEN, y + ctaH - 10, ctaW, 10, 'F')
  doc.setFont(undefined, 'bold')
  doc.setFontSize(7.8)
  doc.setTextColor(...NAVY)
  doc.text(`Escriba a ${resultado.consultor?.nombre || 'su consultor/a'}: ${resultado.consultor?.email || COMPANY.email}`, MARGEN + ctaW / 2, y + ctaH - 4, {
    align: 'center',
  })

  const aceptX = MARGEN + ctaW + 6
  doc.setDrawColor(...BORDER)
  doc.setFillColor(255, 255, 255)
  doc.rect(aceptX, y, aceptW, ctaH, 'FD')
  doc.setFont(undefined, 'bold')
  doc.setFontSize(7.6)
  doc.setTextColor(...NAVY)
  doc.text('ACEPTACIÓN DEL PRESUPUESTO', aceptX + 5, y + 8)
  doc.setFont(undefined, 'normal')
  doc.setFontSize(7.4)
  doc.setDrawColor(...SLATE)
  doc.rect(aceptX + 5, y + 13, 3, 3)
  doc.text(`${recomendado?.operador || ''} (recomendada) · ahorro ${formatEUR(resultado.ahorroAnual)}/año`, aceptX + 10, y + 15.5, {
    maxWidth: aceptW - 15,
  })
  doc.rect(aceptX + 5, y + 23, 3, 3)
  doc.text('Otra opción: ____________________', aceptX + 10, y + 25.5)

  doc.setFontSize(7)
  doc.setTextColor(...SLATE)
  doc.text('Nombre y apellidos', aceptX + 5, y + 36)
  doc.line(aceptX + 5, y + 44, aceptX + aceptW - 5, y + 44)
  doc.text('DNI / CIF', aceptX + 5, y + 50)
  doc.line(aceptX + 5, y + 56, aceptX + aceptW - 5, y + 56)

  y += ctaH + 10

  // ---- Firma del consultor ----
  y = espacio(y, 26)
  doc.setDrawColor(...SLATE)
  doc.setLineWidth(0.2)
  doc.line(pageWidth - MARGEN - 60, y + 14, pageWidth - MARGEN, y + 14)
  doc.setFont(undefined, 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...NAVY)
  doc.text(resultado.consultor?.nombre || COMPANY.name, MARGEN, y)
  doc.setFont(undefined, 'normal')
  doc.setFontSize(7.6)
  doc.setTextColor(...SLATE)
  doc.text('Consultor/a senior de optimización de telecomunicaciones', MARGEN, y + 5)
  doc.text(COMPANY.name, MARGEN, y + 10)
  doc.text(resultado.consultor?.email || COMPANY.email, MARGEN, y + 15)
  doc.setFontSize(7)
  doc.text('Fecha y firma del cliente', pageWidth - MARGEN - 60, y + 18)

  // ---- Pie de página ----
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    const pageHeight = doc.internal.pageSize.getHeight()
    doc.setDrawColor(...BORDER)
    doc.setLineWidth(0.3)
    doc.line(MARGEN, pageHeight - 14, pageWidth - MARGEN, pageHeight - 14)
    doc.setFontSize(7.4)
    doc.setTextColor(...SLATE)
    doc.text(`${COMPANY.name} · Informe de auditoría de telecomunicaciones · ${resultado.cliente?.nombre || ''}`, MARGEN, pageHeight - 9)
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - MARGEN, pageHeight - 9, { align: 'right' })
  }

  return doc
}

export async function descargarInformeTelecomPDF(resultado) {
  const doc = await generarInformeTelecomPDF(resultado)
  const nombreArchivo = `Informe_Auditoria_${(resultado.cliente?.nombre || 'cliente').replace(/\s+/g, '_')}.pdf`
  doc.save(nombreArchivo)
}
