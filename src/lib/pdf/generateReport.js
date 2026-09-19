import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import logoHorizontal from '../../assets/brand/icc-logo-horizontal.png'
import { COMPANY } from '../constants'
import { formatEUR, formatPercent } from '../format'

const NAVY = [19, 26, 36]
const GOLD = [201, 162, 39]
const SLATE = [100, 116, 139]

// Redimensiona la imagen antes de incrustarla en el PDF: los logos fuente son
// de alta resolución (para web/impresión) y embeberlos a tamaño completo
// dispara el peso del PDF sin aportar calidad visible a 55mm de ancho.
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

function addFooter(doc) {
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    const pageHeight = doc.internal.pageSize.getHeight()
    const pageWidth = doc.internal.pageSize.getWidth()
    doc.setDrawColor(...GOLD)
    doc.setLineWidth(0.5)
    doc.line(14, pageHeight - 18, pageWidth - 14, pageHeight - 18)
    doc.setFontSize(8)
    doc.setTextColor(...SLATE)
    doc.text(
      `${COMPANY.name} · Tel: ${COMPANY.phone} · ${COMPANY.email}`,
      14,
      pageHeight - 12
    )
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - 14, pageHeight - 12, { align: 'right' })
  }
}

function seccionTitulo(doc, texto, y) {
  doc.setFontSize(13)
  doc.setTextColor(...NAVY)
  doc.setFont(undefined, 'bold')
  doc.text(texto, 14, y)
  doc.setFont(undefined, 'normal')
  return y + 4
}

export async function generarInformePDF(resultado, cliente) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()

  // ---- Cabecera ----
  try {
    const { dataUrl, width, height } = await cargarImagenComoDataURL(logoHorizontal)
    const logoW = 55
    const logoH = (height / width) * logoW
    doc.addImage(dataUrl, 'PNG', 14, 12, logoW, logoH)
  } catch {
    doc.setFontSize(16)
    doc.setFont(undefined, 'bold')
    doc.text(COMPANY.name, 14, 20)
  }

  doc.setFontSize(10)
  doc.setTextColor(...SLATE)
  doc.text('Auditoría de Ahorro', pageWidth - 14, 18, { align: 'right' })
  doc.text(new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }), pageWidth - 14, 23, {
    align: 'right',
  })

  let y = 38
  doc.setDrawColor(220, 220, 220)
  doc.line(14, y, pageWidth - 14, y)
  y += 8

  // ---- Datos cliente ----
  doc.setFontSize(11)
  doc.setTextColor(...NAVY)
  doc.setFont(undefined, 'bold')
  doc.text(`Cliente: ${cliente?.nombre || 'No especificado'}`, 14, y)
  doc.setFont(undefined, 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...SLATE)
  y += 5
  if (cliente?.telefono) {
    doc.text(`Tel: ${cliente.telefono}`, 14, y)
    y += 4.5
  }
  if (cliente?.email) {
    doc.text(`Email: ${cliente.email}`, 14, y)
    y += 4.5
  }
  y += 4

  // ---- Resumen de ahorro (hero) ----
  const totales = resultado.totales
  doc.setFillColor(...NAVY)
  doc.roundedRect(14, y, pageWidth - 28, 30, 3, 3, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.text('PAGAS AHORA / AÑO', 20, y + 9)
  doc.text('PAGARÍAS CON NOSOTROS / AÑO', 20 + (pageWidth - 28) / 3, y + 9)
  doc.setTextColor(...GOLD)
  doc.text('TU AHORRO ANUAL', 20 + ((pageWidth - 28) / 3) * 2, y + 9)

  doc.setFontSize(14)
  doc.setFont(undefined, 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text(formatEUR(totales.costeActualAnual), 20, y + 20)
  doc.text(formatEUR(totales.costePropuestaAnual), 20 + (pageWidth - 28) / 3, y + 20)
  doc.setTextColor(...GOLD)
  doc.text(
    `${formatEUR(Math.abs(totales.ahorroAnual))} (${formatPercent(totales.ahorroPorcentaje)})`,
    20 + ((pageWidth - 28) / 3) * 2,
    y + 20
  )
  doc.setFont(undefined, 'normal')
  y += 40

  // ---- Energía: LUZ ----
  if (resultado.energia?.luz) {
    const { costeActual, mejorPropuesta } = resultado.energia.luz
    y = seccionTitulo(doc, 'Energía — Luz', y)
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
      foot: [
        [
          'Total factura',
          '',
          '',
          formatEUR(costeActual.total),
          '',
          formatEUR(mejorPropuesta?.coste.total ?? costeActual.total),
        ],
      ],
      theme: 'striped',
      headStyles: { fillColor: NAVY },
      footStyles: { fillColor: [240, 240, 240], textColor: NAVY, fontStyle: 'bold' },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    })
    y = doc.lastAutoTable.finalY + 6
    if (mejorPropuesta) {
      doc.setFontSize(8)
      doc.setTextColor(...SLATE)
      doc.text(`Propuesta: ${mejorPropuesta.tarifa.nombre_tarifa}`, 14, y)
      y += 8
    }
  }

  // ---- Energía: GAS ----
  if (resultado.energia?.gas) {
    if (y > 240) {
      doc.addPage()
      y = 20
    }
    const { costeActual, mejorPropuesta } = resultado.energia.gas
    y = seccionTitulo(doc, 'Energía — Gas', y)
    autoTable(doc, {
      startY: y,
      head: [['Concepto', 'Actual', 'Propuesta']],
      body: [
        ['Consumo', `${costeActual.consumoKwh.toFixed(0)} kWh`, `${costeActual.consumoKwh.toFixed(0)} kWh`],
        ['Término energía', formatEUR(costeActual.terminoEnergia), formatEUR(mejorPropuesta?.coste.terminoEnergia ?? 0)],
        ['Término fijo', formatEUR(costeActual.terminoFijo), formatEUR(mejorPropuesta?.coste.terminoFijo ?? 0)],
        ['Total factura', formatEUR(costeActual.total), formatEUR(mejorPropuesta?.coste.total ?? costeActual.total)],
      ],
      theme: 'striped',
      headStyles: { fillColor: NAVY },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    })
    y = doc.lastAutoTable.finalY + 8
    if (mejorPropuesta) {
      doc.setFontSize(8)
      doc.setTextColor(...SLATE)
      doc.text(`Propuesta: ${mejorPropuesta.tarifa.nombre_tarifa}`, 14, y)
      y += 8
    }
  }

  // ---- Telefonía ----
  if (resultado.telefonia) {
    if (y > 230) {
      doc.addPage()
      y = 20
    }
    y = seccionTitulo(doc, 'Telefonía e Internet', y)
    autoTable(doc, {
      startY: y,
      head: [['Concepto', 'Actual /mes', 'Propuesta /mes']],
      body: [
        [
          resultado.telefonia.propuesta.componentes.map((c) => `${c.tarifa.nombre_tarifa}${c.cantidad > 1 ? ` ×${c.cantidad}` : ''}`).join(' + ') || 'Sin propuesta',
          formatEUR(resultado.telefonia.costeActualMensual),
          formatEUR(resultado.telefonia.costePropuestaMensual),
        ],
      ],
      theme: 'striped',
      headStyles: { fillColor: NAVY },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    })
    y = doc.lastAutoTable.finalY + 8
  }

  // ---- Alarmas ----
  if (resultado.alarmas) {
    if (y > 230) {
      doc.addPage()
      y = 20
    }
    y = seccionTitulo(doc, 'Alarmas y Seguridad', y)
    autoTable(doc, {
      startY: y,
      head: [['Concepto', 'Actual /mes', 'Propuesta /mes']],
      body: [
        [
          resultado.alarmas.kitPropuesto?.nombre_kit || 'Sin propuesta',
          formatEUR(resultado.alarmas.costeActualMensual),
          formatEUR(resultado.alarmas.costePropuestaMensual),
        ],
      ],
      theme: 'striped',
      headStyles: { fillColor: NAVY },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    })
    y = doc.lastAutoTable.finalY + 8
  }

  // ---- Contacto (obligatorio) ----
  if (y > 250) {
    doc.addPage()
    y = 20
  }
  doc.setFillColor(...GOLD)
  doc.roundedRect(14, y, pageWidth - 28, 22, 3, 3, 'F')
  doc.setTextColor(...NAVY)
  doc.setFont(undefined, 'bold')
  doc.setFontSize(11)
  doc.text(`${COMPANY.name} — ${COMPANY.phone}`, pageWidth / 2, y + 9, { align: 'center' })
  doc.setFont(undefined, 'normal')
  doc.setFontSize(9)
  doc.text(`${COMPANY.email} · WhatsApp ${COMPANY.whatsapp}`, pageWidth / 2, y + 16, { align: 'center' })

  addFooter(doc)

  return doc
}

export async function descargarInformePDF(resultado, cliente) {
  const doc = await generarInformePDF(resultado, cliente)
  const nombreArchivo = `Auditoria-Ahorro-${(cliente?.nombre || 'cliente').replace(/\s+/g, '-')}-${Date.now()}.pdf`
  doc.save(nombreArchivo)
}
