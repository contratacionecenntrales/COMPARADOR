export const COMPANY = {
  name: import.meta.env.VITE_COMPANY_NAME || 'Integral Connection Consulting',
  phone: import.meta.env.VITE_COMPANY_PHONE || '+34 900 000 000',
  email: import.meta.env.VITE_COMPANY_EMAIL || 'info@integralconnectionconsulting.com',
  whatsapp: import.meta.env.VITE_COMPANY_WHATSAPP || '+34 600 000 000',
}

export const SECTORES = {
  ENERGIA: 'energia',
  TELEFONIA: 'telefonia',
  ALARMAS: 'alarmas',
  PACK_INTEGRAL: 'pack_integral',
}

export const SECTOR_LABELS = {
  [SECTORES.ENERGIA]: 'Energía (Luz y Gas)',
  [SECTORES.TELEFONIA]: 'Telefonía e Internet',
  [SECTORES.ALARMAS]: 'Alarmas y Seguridad',
  [SECTORES.PACK_INTEGRAL]: 'Pack Integral',
}

// IVA general (energía tiene además el Impuesto Especial sobre la Electricidad)
export const IVA = 0.21
export const IMPUESTO_ELECTRICIDAD = 0.0511269632 // sobre el importe de potencia + energía
export const IMPUESTO_HIDROCARBUROS_GAS = 0.00234 // €/kWh (impuesto especial sobre el gas, referencia)
