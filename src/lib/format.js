const eurFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const percentFormatter = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

export function formatEUR(value) {
  return eurFormatter.format(Number(value) || 0)
}

export function formatPercent(value) {
  return `${percentFormatter.format(Number(value) || 0)}%`
}

export function formatNumber(value, decimals = 2) {
  return new Intl.NumberFormat('es-ES', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(
    Number(value) || 0
  )
}
