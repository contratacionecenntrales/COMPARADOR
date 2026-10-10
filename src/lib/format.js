// Formateo manual (sin depender de Intl.NumberFormat) para el separador de
// miles: algunos entornos de renderizado (p. ej. el Chromium headless usado
// para generar PDFs) traen datos ICU reducidos y Intl('es-ES') no aplica el
// punto de millar, mostrando "2800,56 €" en vez de "2.800,56 €". Haciéndolo
// a mano funciona igual en cualquier navegador o entorno.
export function formatNumber(value, decimals = 2) {
  const numero = Number(value) || 0
  const negativo = numero < 0
  const fijo = Math.abs(numero).toFixed(decimals)
  const [entero, decimal] = fijo.split('.')
  const conMiles = entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  const resultado = decimal ? `${conMiles},${decimal}` : conMiles
  return negativo ? `-${resultado}` : resultado
}

export function formatEUR(value) {
  return `${formatNumber(value, 2)} €`
}

export function formatPercent(value) {
  return `${formatNumber(value, 1)}%`
}
