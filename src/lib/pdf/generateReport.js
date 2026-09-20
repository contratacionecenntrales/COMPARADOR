import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import logoIcono from '../../assets/brand/icc-icon.png'
import { COMPANY } from '../constants'
import { formatEUR, formatPercent } from '../format'
import { COMPANIAS_POR_SECTOR, LOGOS_COMPANIAS } from './companias'

const NAVY = [19, 26, 36]
const NAVY_SOFT = [58, 89, 133]
const GOLD = [201, 162, 39]
const GOLD_LIGHT = [250, 244, 224]
const SLATE = [100, 116, 139]
const BORDER = [222, 227, 235]
const ROW_TINT = [246, 248, 251]

const ACENTOS_SECTOR = {
  energia: GOLD,
  telefonia: NAVY_SOFT,
  alarmas: [22, 128, 106],
}

const MARGEN = 14

// Redimensiona la imagen antes de incrustarla en el PDF: los logos fuente son
// de alta resolución (para web/impresión) y embeberlos a tamaño completo
// dispara el peso del PDF sin aportar calidad visible a pocos mm de ancho.
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

async function cargarLogosCompanias() {
  const entradas = await Promise.all(
    Object.entries(LOGOS_COMPANIAS).map(async ([clave, url]) => {
      try {
        return [clave, await cargarImagenComoDataURL(url, 300)]
      } catch {
        return [clave, null]
      }
    })
  )
  return Object.fromEntries(entradas.filter(([, valor]) => valor))
}

function gradienteHorizontal(doc, x, y, w, h, colorA, colorB) {
  const pasos = 90
  const pasoAncho = w / pasos
  for (let i = 0; i < pasos; i++) {
    const t = i / (pasos - 1)
    const r = Math.round(colorA[0] + (colorB[0] - colorA[0]) * t)
    const g = Math.round(colorA[1] + (colorB[1] - colorA[1]) * t)
    const b = Math.round(colorA[2] + (colorB[2] - colorA[2]) * t)
    doc.setFillColor(r, g, b)
    doc.rect(x + i * pasoAncho, y, pasoAncho + 0.6, h, 'F')
  }
}

function badgeNumero(doc, numero, x, y, tam = 6.4) {
  doc.setFillColor(...NAVY)
  doc.roundedRect(x, y, tam, tam, 1.3, 1.3, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont(undefined, 'bold')
  doc.setFontSize(9)
  doc.text(String(numero), x + tam / 2, y + tam / 2 + 1.15, { align: 'center' })
  doc.setFont(undefined, 'normal')
}

function tituloSeccion(doc, pageWidth, numero, texto, y) {
  badgeNumero(doc, numero, MARGEN, y - 4.6)
  doc.setFontSize(11.5)
  doc.setTextColor(...NAVY)
  doc.setFont(undefined, 'bold')
  doc.text(texto.toUpperCase(), MARGEN + 9.5, y)
  doc.setFont(undefined, 'normal')
  doc.setDrawColor(...BORDER)
  doc.setLineWidth(0.3)
  doc.line(MARGEN, y + 2.6, pageWidth - MARGEN, y + 2.6)
  return y + 9
}

function dibujarCabeceraPagina(doc, pageWidth, logoData) {
  if (logoData) {
    const logoAlto = 9
    const logoAncho = (logoData.width / logoData.height) * logoAlto
    doc.addImage(logoData.dataUrl, 'PNG', MARGEN, 10, logoAncho, logoAlto)
  }
  doc.setFontSize(9.5)
  doc.setTextColor(...NAVY)
  doc.setFont(undefined, 'bold')
  doc.text('AUDITORÍA DE AHORRO', pageWidth - MARGEN, 13.5, { align: 'right' })
  doc.setFont(undefined, 'italic')
  doc.setFontSize(7.5)
  doc.setTextColor(...SLATE)
  doc.text('Energía · Telefonía · Alarmas — Consultoría integral de contratación', pageWidth - MARGEN, 18, {
    align: 'right',
  })
  doc.setFont(undefined, 'normal')
  doc.setDrawColor(...BORDER)
  doc.setLineWidth(0.4)
  doc.line(MARGEN, 23, pageWidth - MARGEN, 23)
}

function nuevaPagina(doc, pageWidth, logoData) {
  doc.addPage()
  dibujarCabeceraPagina(doc, pageWidth, logoData)
  return 34
}

function asegurarEspacio(doc, pageWidth, logoData, y, necesario, limite = 262) {
  if (y + necesario > limite) {
    return nuevaPagina(doc, pageWidth, logoData)
  }
  return y
}

function cajaInfo(doc, pageWidth, cliente, codigo, y) {
  const w = pageWidth - MARGEN * 2
  const h = 17
  doc.setDrawColor(...BORDER)
  doc.setFillColor(255, 255, 255)
  doc.setLineWidth(0.3)
  doc.rect(MARGEN, y, w, h, 'FD')
  const col2 = MARGEN + w / 2
  const fecha = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })

  const campo = (label, valor, x, fila) => {
    const fy = y + 6.5 + fila * 6.5
    doc.setFont(undefined, 'bold')
    doc.setFontSize(7.6)
    doc.setTextColor(...NAVY)
    doc.text(label, x + 4, fy)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(...SLATE)
    doc.setFontSize(8.3)
    doc.text(String(valor || '—'), x + 4, fy + 4)
  }

  campo('PREPARADO PARA', cliente?.nombre || 'Cliente', MARGEN, 0)
  campo('FECHA DE EMISIÓN', fecha, col2, 0)
  campo('CONTACTO', [cliente?.telefono, cliente?.email].filter(Boolean).join(' · '), MARGEN, 1)
  campo('CÓDIGO DE INFORME', codigo, col2, 1)

  return y + h
}

function parrafoIntro(doc, pageWidth, texto, y) {
  const w = pageWidth - MARGEN * 2
  doc.setFontSize(8.6)
  const lineas = doc.splitTextToSize(texto, w - 10)
  const h = lineas.length * 4.1 + 6
  doc.setFillColor(...GOLD_LIGHT)
  doc.rect(MARGEN, y, w, h, 'F')
  doc.setFillColor(...GOLD)
  doc.rect(MARGEN, y, 1.2, h, 'F')
  doc.setTextColor(...NAVY)
  doc.text(lineas, MARGEN + 6, y + 5.8)
  return y + h
}

function barraProgreso(doc, x, y, w, porcentaje, etiqueta) {
  const h = 4.6
  doc.setFillColor(...BORDER)
  doc.roundedRect(x, y, w, h, 2, 2, 'F')
  const relleno = Math.max(6, Math.min(w, (w * porcentaje) / 100))
  doc.setFillColor(...GOLD)
  doc.roundedRect(x, y, relleno, h, 2, 2, 'F')
  doc.setFontSize(7.6)
  doc.setTextColor(...SLATE)
  doc.text(etiqueta, x, y + h + 4)
}

function pastillaCompania(doc, x, y, w, h, empresa, logoData) {
  doc.setDrawColor(...BORDER)
  doc.setFillColor(255, 255, 255)
  doc.setLineWidth(0.3)
  doc.roundedRect(x, y, w, h, 1.8, 1.8, 'FD')
  if (logoData) {
    const maxW = w - 8
    const maxH = h - 6
    let dibW = maxW
    let dibH = (logoData.height / logoData.width) * dibW
    if (dibH > maxH) {
      dibH = maxH
      dibW = (logoData.width / logoData.height) * dibH
    }
    doc.addImage(logoData.dataUrl, 'PNG', x + (w - dibW) / 2, y + (h - dibH) / 2, dibW, dibH)
  } else {
    doc.setFont(undefined, 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...NAVY)
    doc.text(empresa.nombre, x + w / 2, y + h / 2 + 1.3, { align: 'center' })
    doc.setFont(undefined, 'normal')
  }
}

function estiloTabla() {
  return {
    theme: 'striped',
    headStyles: { fillColor: NAVY, textColor: 255, fontSize: 8, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: ROW_TINT },
    styles: { fontSize: 8, textColor: NAVY, lineColor: BORDER, lineWidth: 0.15 },
    margin: { left: MARGEN, right: MARGEN },
  }
}

function addFooter(doc) {
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    const pageHeight = doc.internal.pageSize.getHeight()
    const pageWidth = doc.internal.pageSize.getWidth()
    doc.setDrawColor(...GOLD)
    doc.setLineWidth(0.5)
    doc.line(MARGEN, pageHeight - 21, pageWidth - MARGEN, pageHeight - 21)
    doc.setFont(undefined, 'italic')
    doc.setFontSize(7.6)
    doc.setTextColor(...SLATE)
    doc.text(`${COMPANY.name} · Auditoría de Ahorro Confidencial`, pageWidth / 2, pageHeight - 16, {
      align: 'center',
    })
    doc.setFont(undefined, 'normal')
    doc.setFontSize(8)
    doc.text(`${COMPANY.phone} · ${COMPANY.email}`, MARGEN, pageHeight - 10)
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - MARGEN, pageHeight - 10, { align: 'right' })
  }
}

export async function generarInformePDF(resultado, cliente) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()

  let logoIconoData = null
  try {
    logoIconoData = await cargarImagenComoDataURL(logoIcono, 300)
  } catch {
    logoIconoData = null
  }
  const logosCompanias = await cargarLogosCompanias()

  // ---- Cabecera de página 1 ----
  dibujarCabeceraPagina(doc, pageWidth, logoIconoData)
  let y = 34

  // ---- Banner degradado con título ----
  const heroH = 26
  gradienteHorizontal(doc, MARGEN, y, pageWidth - MARGEN * 2, heroH, NAVY, NAVY_SOFT)
  doc.setFillColor(...GOLD)
  doc.rect(MARGEN, y + heroH - 1.2, pageWidth - MARGEN * 2, 1.2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont(undefined, 'bold')
  doc.setFontSize(17)
  doc.text('AUDITORÍA DE AHORRO PERSONALIZADA', MARGEN + 7, y + 12)
  doc.setFont(undefined, 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...GOLD)
  doc.text('Comparativa de tu gasto actual frente a nuestras mejores tarifas disponibles', MARGEN + 7, y + 19)
  y += heroH + 8

  // ---- Ficha de datos ----
  const codigo = `AUD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`
  y = cajaInfo(doc, pageWidth, cliente, codigo, y)
  y += 6

  // ---- Párrafo introductorio ----
  y = parrafoIntro(
    doc,
    pageWidth,
    `A continuación se presenta el desglose de la auditoría de ahorro realizada para ${
      cliente?.nombre || 'el cliente'
    }. Comparamos su gasto actual con nuestra mejor propuesta disponible a fecha de hoy en cada uno de los servicios contratados, junto con las principales compañías del mercado con las que trabajamos.`,
    y
  )
  y += 8

  let numeroSeccion = 1

  // ---- 1. Resumen económico ----
  const totales = resultado.totales
  y = tituloSeccion(doc, pageWidth, numeroSeccion++, 'Resumen económico', y)

  const filasResumen = []
  if (resultado.energia?.luz || resultado.energia?.gas) {
    let actual = 0
    let propuesta = 0
    if (resultado.energia.luz) {
      actual += resultado.energia.luz.costeActual.totalAnual
      propuesta += resultado.energia.luz.mejorPropuesta?.coste.totalAnual ?? resultado.energia.luz.costeActual.totalAnual
    }
    if (resultado.energia.gas) {
      actual += resultado.energia.gas.costeActual.totalAnual
      propuesta += resultado.energia.gas.mejorPropuesta?.coste.totalAnual ?? resultado.energia.gas.costeActual.totalAnual
    }
    filasResumen.push(['Energía (Luz y Gas)', formatEUR(actual), formatEUR(propuesta), formatEUR(actual - propuesta)])
  }
  if (resultado.telefonia) {
    const { costeActualAnual: a, costePropuestaAnual: p } = resultado.telefonia
    filasResumen.push(['Telefonía e Internet', formatEUR(a), formatEUR(p), formatEUR(a - p)])
  }
  if (resultado.alarmas) {
    const { costeActualAnual: a, costePropuestaAnual: p } = resultado.alarmas
    filasResumen.push(['Alarmas y Seguridad', formatEUR(a), formatEUR(p), formatEUR(a - p)])
  }

  autoTable(doc, {
    startY: y,
    head: [['Concepto', 'Gasto actual / año', 'Gasto propuesto / año', 'Ahorro / año']],
    body: filasResumen,
    foot: [[
      'TOTAL',
      formatEUR(totales.costeActualAnual),
      formatEUR(totales.costePropuestaAnual),
      formatEUR(totales.ahorroAnual),
    ]],
    ...estiloTabla(),
    footStyles: { fillColor: [235, 238, 243], textColor: NAVY, fontStyle: 'bold', fontSize: 8.5 },
    columnStyles: { 3: { fontStyle: 'bold', textColor: [163, 130, 25] } },
  })
  y = doc.lastAutoTable.finalY + 8

  y = asegurarEspacio(doc, pageWidth, logoIconoData, y, 34)
  doc.setFont(undefined, 'bold')
  doc.setFontSize(10.5)
  doc.setTextColor(...NAVY)
  doc.text('AHORRO TOTAL ANUAL', MARGEN, y)
  doc.setFontSize(19)
  doc.setTextColor(...GOLD)
  doc.text(
    `${formatEUR(Math.abs(totales.ahorroAnual))} (${formatPercent(totales.ahorroPorcentaje)})`,
    pageWidth - MARGEN,
    y,
    { align: 'right' }
  )
  doc.setFont(undefined, 'normal')
  y += 6
  barraProgreso(
    doc,
    MARGEN,
    y,
    pageWidth - MARGEN * 2,
    Math.max(0, 100 - totales.ahorroPorcentaje),
    `Reduces tu gasto anual en un ${formatPercent(totales.ahorroPorcentaje)}: de ${formatEUR(
      totales.costeActualAnual
    )} a ${formatEUR(totales.costePropuestaAnual)}`
  )
  y += 14

  // ---- Energía: LUZ ----
  if (resultado.energia?.luz) {
    y = asegurarEspacio(doc, pageWidth, logoIconoData, y, 50)
    const { costeActual, mejorPropuesta } = resultado.energia.luz
    y = tituloSeccion(doc, pageWidth, numeroSeccion++, 'Energía — Luz', y)
    autoTable(doc, {
      startY: y,
      head: [['Periodo', 'Consumo (kWh)', 'Precio actual (€/kWh)', 'Coste actual', 'Precio propuesto', 'Coste propuesto']],
      body: costeActual.desglosePeriodos.map((p, idx) => {
        const propuesto = mejorPropuesta?.coste.desglosePeriodos[idx]
        return [
          p.periodo,
          p.consumoKwh.toFixed(0),
          p.precioEnergia.toFixed(4),
          formatEUR(p.costeEnergia),
          propuesto ? propuesto.precioEnergia.toFixed(4) : '—',
          propuesto ? formatEUR(propuesto.costeEnergia) : '—',
        ]
      }),
      foot: [['Total factura', '', '', formatEUR(costeActual.total), '', formatEUR(mejorPropuesta?.coste.total ?? costeActual.total)]],
      ...estiloTabla(),
      footStyles: { fillColor: [235, 238, 243], textColor: NAVY, fontStyle: 'bold' },
    })
    y = doc.lastAutoTable.finalY + 5
    if (mejorPropuesta) {
      doc.setFontSize(8)
      doc.setTextColor(...SLATE)
      doc.text(`Propuesta: ${mejorPropuesta.tarifa.nombre_tarifa}`, MARGEN, y)
      y += 8
    }
  }

  // ---- Energía: GAS ----
  if (resultado.energia?.gas) {
    y = asegurarEspacio(doc, pageWidth, logoIconoData, y, 45)
    const { costeActual, mejorPropuesta } = resultado.energia.gas
    y = tituloSeccion(doc, pageWidth, numeroSeccion++, 'Energía — Gas', y)
    autoTable(doc, {
      startY: y,
      head: [['Concepto', 'Actual', 'Propuesta']],
      body: [
        ['Consumo', `${costeActual.consumoKwh.toFixed(0)} kWh`, `${costeActual.consumoKwh.toFixed(0)} kWh`],
        ['Término energía', formatEUR(costeActual.terminoEnergia), formatEUR(mejorPropuesta?.coste.terminoEnergia ?? 0)],
        ['Término fijo', formatEUR(costeActual.terminoFijo), formatEUR(mejorPropuesta?.coste.terminoFijo ?? 0)],
        ['Total factura', formatEUR(costeActual.total), formatEUR(mejorPropuesta?.coste.total ?? costeActual.total)],
      ],
      ...estiloTabla(),
    })
    y = doc.lastAutoTable.finalY + 5
    if (mejorPropuesta) {
      doc.setFontSize(8)
      doc.setTextColor(...SLATE)
      doc.text(`Propuesta: ${mejorPropuesta.tarifa.nombre_tarifa}`, MARGEN, y)
      y += 8
    }
  }

  // ---- Telefonía ----
  if (resultado.telefonia) {
    y = asegurarEspacio(doc, pageWidth, logoIconoData, y, 50)
    y = tituloSeccion(doc, pageWidth, numeroSeccion++, 'Telefonía e Internet', y)
    doc.setFontSize(8)
    doc.setTextColor(...SLATE)
    doc.text(
      resultado.telefonia.propuesta.componentes
        .map((c) => `${c.etiqueta || c.tarifa.nombre_tarifa}: ${c.tarifa.nombre_tarifa}`)
        .join(' · ') || 'Sin propuesta que cubra la necesidad',
      MARGEN,
      y
    )
    y += 4
    const { desgloseActual: da, desglosePropuesta: dp, cambioTitular } = resultado.telefonia
    autoTable(doc, {
      startY: y,
      head: [['Resumen de factura', 'Cuotas mensuales', 'Consumos', 'Otros conceptos', 'IVA (21%)', 'Total']],
      body: [
        ['Actual', formatEUR(da.cuotas), formatEUR(da.consumos), formatEUR(da.otros), formatEUR(da.iva), formatEUR(da.total)],
        ['Propuesta', formatEUR(dp.cuotas), formatEUR(dp.consumos), formatEUR(dp.otros), formatEUR(dp.iva), formatEUR(dp.total)],
      ],
      ...estiloTabla(),
    })
    y = doc.lastAutoTable.finalY + 6

    if (cambioTitular) {
      y = asegurarEspacio(doc, pageWidth, logoIconoData, y, 30)
      doc.setFontSize(9)
      doc.setTextColor(...NAVY)
      doc.setFont(undefined, 'bold')
      doc.text('Cambio de titularidad solicitado', MARGEN, y)
      doc.setFont(undefined, 'normal')
      y += 5
      autoTable(doc, {
        startY: y,
        head: [['', 'Nombre / Razón social', 'NIF/CIF', 'Contacto']],
        body: [
          ['Donante (compañía actual)', cambioTitular.donante.nombre || '—', cambioTitular.donante.nif || '—', cambioTitular.donante.contacto || '—'],
          ['Receptor (nueva contratación)', cambioTitular.receptor.nombre || '—', cambioTitular.receptor.nif || '—', cambioTitular.receptor.contacto || '—'],
        ],
        ...estiloTabla(),
      })
      y = doc.lastAutoTable.finalY + 8
    } else {
      y += 2
    }
  }

  // ---- Alarmas ----
  if (resultado.alarmas) {
    y = asegurarEspacio(doc, pageWidth, logoIconoData, y, 50)
    y = tituloSeccion(doc, pageWidth, numeroSeccion++, 'Alarmas y Seguridad', y)
    const equipoTexto = (resultado.alarmas.kitPropuesto?.equipamiento || []).join(', ')
    autoTable(doc, {
      startY: y,
      head: [['Tipo de servicio', 'Cuota mensual', 'Pago al contado', 'Total euros']],
      body: [[
        `${resultado.alarmas.kitPropuesto?.nombre_kit || 'Sin propuesta'}${equipoTexto ? `\n${equipoTexto}` : ''}`,
        formatEUR(resultado.alarmas.desglosePropuesta.cuota),
        formatEUR(resultado.alarmas.desglosePropuesta.pagoContado),
        formatEUR(resultado.alarmas.desglosePropuesta.totalPorServicios),
      ]],
      ...estiloTabla(),
    })
    y = doc.lastAutoTable.finalY + 4

    autoTable(doc, {
      startY: y,
      head: [['', 'Base imponible', 'IVA (21%)', 'Total a pagar']],
      body: [
        ['Tu factura actual', formatEUR(resultado.alarmas.desgloseActual.base), formatEUR(resultado.alarmas.desgloseActual.iva), formatEUR(resultado.alarmas.desgloseActual.totalAPagar)],
        ['Nuestra propuesta', formatEUR(resultado.alarmas.desglosePropuesta.base), formatEUR(resultado.alarmas.desglosePropuesta.iva), formatEUR(resultado.alarmas.desglosePropuesta.totalAPagar)],
      ],
      ...estiloTabla(),
    })
    y = doc.lastAutoTable.finalY + 8
  }

  // ---- Compañías con las que trabajamos ----
  y = asegurarEspacio(doc, pageWidth, logoIconoData, y, 60)
  y = tituloSeccion(doc, pageWidth, numeroSeccion++, 'Compañías con las que trabajamos', y)
  doc.setFontSize(8)
  doc.setTextColor(...SLATE)
  doc.text('Comparamos y negociamos con las principales compañías del sector para conseguirte la mejor tarifa.', MARGEN, y)
  y += 5

  const anchoDisponible = pageWidth - MARGEN * 2
  const gap = 4
  for (const grupo of COMPANIAS_POR_SECTOR) {
    y = asegurarEspacio(doc, pageWidth, logoIconoData, y, 24)
    doc.setFillColor(...ACENTOS_SECTOR[grupo.sector])
    doc.circle(MARGEN + 1.3, y - 1.3, 1.3, 'F')
    doc.setFont(undefined, 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...NAVY)
    doc.text(grupo.etiqueta.toUpperCase(), MARGEN + 5, y)
    doc.setFont(undefined, 'normal')
    y += 3
    const pillH = 16
    const pillW = (anchoDisponible - gap * (grupo.empresas.length - 1)) / grupo.empresas.length
    grupo.empresas.forEach((empresa, idx) => {
      const x = MARGEN + idx * (pillW + gap)
      pastillaCompania(doc, x, y, pillW, pillH, empresa, logosCompanias[empresa.clave] || null)
    })
    y += pillH + 7
  }
  y += 2

  // ---- Próximo paso / contacto ----
  y = asegurarEspacio(doc, pageWidth, logoIconoData, y, 34)
  const cajaW = pageWidth - MARGEN * 2
  const cajaH = 26
  doc.setDrawColor(...BORDER)
  doc.setFillColor(255, 255, 255)
  doc.setLineWidth(0.3)
  doc.rect(MARGEN, y, cajaW, cajaH, 'FD')
  doc.setFillColor(...GOLD)
  doc.rect(MARGEN, y, 1.2, cajaH, 'F')
  doc.setFont(undefined, 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(...NAVY)
  doc.text('¿CÓMO ACTIVAMOS TU AHORRO?', MARGEN + 6, y + 6.5)
  doc.setFont(undefined, 'normal')
  doc.setFontSize(8.2)
  doc.setTextColor(...SLATE)
  const pasos = [
    '1. Confirmas la propuesta con tu gestor comercial de Integral Connection Consulting.',
    '2. Nosotros gestionamos el cambio de compañía sin coste ni gestiones para ti.',
    '3. Sigues pagando lo mismo hasta que el cambio sea efectivo: sin doble facturación.',
  ]
  doc.text(pasos, MARGEN + 6, y + 12)
  y += cajaH + 6

  // ---- CTA de contacto ----
  y = asegurarEspacio(doc, pageWidth, logoIconoData, y, 24)
  doc.setFillColor(...GOLD)
  doc.roundedRect(MARGEN, y, pageWidth - MARGEN * 2, 20, 3, 3, 'F')
  doc.setTextColor(...NAVY)
  doc.setFont(undefined, 'bold')
  doc.setFontSize(11)
  doc.text(`${COMPANY.name} — ${COMPANY.phone}`, pageWidth / 2, y + 8, { align: 'center' })
  doc.setFont(undefined, 'normal')
  doc.setFontSize(9)
  doc.text(`${COMPANY.email} · WhatsApp ${COMPANY.whatsapp}`, pageWidth / 2, y + 15, { align: 'center' })
  y += 28

  // ---- Firma / conformidad ----
  y = asegurarEspacio(doc, pageWidth, logoIconoData, y, 26)
  const mitad = (pageWidth - MARGEN * 2) / 2
  doc.setDrawColor(...SLATE)
  doc.setLineWidth(0.2)
  doc.line(MARGEN, y + 14, MARGEN + mitad - 10, y + 14)
  doc.line(MARGEN + mitad + 10, y + 14, pageWidth - MARGEN, y + 14)
  doc.setFontSize(8)
  doc.setTextColor(...SLATE)
  doc.setFont(undefined, 'bold')
  doc.text('ACEPTADO Y CONFORME', MARGEN, y)
  doc.text('PREPARADO POR', MARGEN + mitad + 10, y)
  doc.setFont(undefined, 'normal')
  doc.text(cliente?.nombre || 'Cliente', MARGEN, y + 5)
  doc.text(`Fecha: ____ / ____ / ${new Date().getFullYear()}`, MARGEN, y + 10)
  doc.text(COMPANY.name, MARGEN + mitad + 10, y + 5)
  doc.text(
    `Fecha: ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
    MARGEN + mitad + 10,
    y + 10
  )

  addFooter(doc)

  return doc
}

export async function descargarInformePDF(resultado, cliente) {
  const doc = await generarInformePDF(resultado, cliente)
  const nombreArchivo = `Auditoria-Ahorro-${(cliente?.nombre || 'cliente').replace(/\s+/g, '-')}-${Date.now()}.pdf`
  doc.save(nombreArchivo)
}
