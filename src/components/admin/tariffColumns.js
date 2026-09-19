export const COLUMNAS_ENERGIA = [
  { key: 'nombre_tarifa', label: 'Nombre', type: 'text' },
  { key: 'tipo', label: 'Tipo', type: 'select', options: ['luz', 'gas'] },
  { key: 'segmento', label: 'Segmento', type: 'select', options: ['2.0TD', '3.0TD', '6.1TD', 'RL.1', 'RL.2', 'RL.3'] },
  { key: 'precio_potencia_p1', label: 'Pot. P1 €/kW/día', type: 'number', step: '0.0001' },
  { key: 'precio_potencia_p2', label: 'Pot. P2 €/kW/día', type: 'number', step: '0.0001' },
  { key: 'precio_energia_p1', label: 'Energía P1 €/kWh', type: 'number', step: '0.0001' },
  { key: 'precio_energia_p2', label: 'Energía P2 €/kWh', type: 'number', step: '0.0001' },
  { key: 'precio_energia_p3', label: 'Energía P3 €/kWh', type: 'number', step: '0.0001' },
  { key: 'termino_fijo_mensual', label: 'Fijo €/mes', type: 'number', step: '0.01' },
  { key: 'alquiler_equipo_dia', label: 'Alquiler €/día', type: 'number', step: '0.0001' },
  { key: 'permanencia_meses', label: 'Permanencia', type: 'number', step: '1' },
  { key: 'destacada', label: 'Destacada', type: 'boolean' },
  { key: 'activo', label: 'Activo', type: 'boolean' },
]

export const FILA_VACIA_ENERGIA = {
  nombre_tarifa: 'Nueva tarifa de energía',
  tipo: 'luz',
  segmento: '2.0TD',
  precio_potencia_p1: 0,
  precio_potencia_p2: 0,
  precio_energia_p1: 0,
  precio_energia_p2: 0,
  precio_energia_p3: 0,
  termino_fijo_mensual: 0,
  alquiler_equipo_dia: 0.026,
  permanencia_meses: 12,
  destacada: false,
  activo: true,
}

export const COLUMNAS_TELEFONIA = [
  { key: 'nombre_tarifa', label: 'Nombre', type: 'text' },
  { key: 'tipo', label: 'Tipo', type: 'select', options: ['movil', 'fibra', 'fijo', 'convergente', 'centralita'] },
  { key: 'gb_datos', label: 'GB', type: 'number', step: '1' },
  { key: 'datos_ilimitados', label: 'Ilimitados', type: 'boolean' },
  { key: 'velocidad_fibra_mb', label: 'Fibra Mb', type: 'number', step: '1' },
  { key: 'lineas_moviles_incluidas', label: 'Líneas móvil', type: 'number', step: '1' },
  { key: 'lineas_fijas_incluidas', label: 'Líneas fijas', type: 'number', step: '1' },
  { key: 'precio_mensual', label: 'Precio €/mes', type: 'number', step: '0.01' },
  { key: 'permanencia_meses', label: 'Permanencia', type: 'number', step: '1' },
  { key: 'destacada', label: 'Destacada', type: 'boolean' },
  { key: 'activo', label: 'Activo', type: 'boolean' },
]

export const FILA_VACIA_TELEFONIA = {
  nombre_tarifa: 'Nueva tarifa de telefonía',
  tipo: 'movil',
  gb_datos: 30,
  datos_ilimitados: false,
  velocidad_fibra_mb: null,
  lineas_moviles_incluidas: 1,
  lineas_fijas_incluidas: 0,
  precio_mensual: 0,
  permanencia_meses: 0,
  destacada: false,
  activo: true,
}

export const COLUMNAS_ALARMAS = [
  { key: 'nombre_kit', label: 'Nombre', type: 'text' },
  { key: 'tipo_kit', label: 'Tipo', type: 'select', options: ['basica', 'camaras', 'gama_alta', 'comercial'] },
  { key: 'num_camaras', label: 'Cámaras', type: 'number', step: '1' },
  { key: 'num_sensores', label: 'Sensores', type: 'number', step: '1' },
  { key: 'cuota_mensual', label: 'Cuota €/mes', type: 'number', step: '0.01' },
  { key: 'coste_instalacion', label: 'Instalación €', type: 'number', step: '0.01' },
  { key: 'permanencia_meses', label: 'Permanencia', type: 'number', step: '1' },
  { key: 'destacada', label: 'Destacada', type: 'boolean' },
  { key: 'activo', label: 'Activo', type: 'boolean' },
]

export const FILA_VACIA_ALARMAS = {
  nombre_kit: 'Nuevo kit de alarma',
  tipo_kit: 'basica',
  num_camaras: 0,
  num_sensores: 2,
  cuota_mensual: 0,
  coste_instalacion: 0,
  permanencia_meses: 24,
  destacada: false,
  activo: true,
}
