// Copia en JS de la semilla de sql/seed.sql.
// Se usa como respaldo local cuando la API PHP no responde (demo / desarrollo
// sin servidor PHP en marcha), para que el comparador sea funcional desde el
// primer arranque. En producción, estos datos viven en MySQL (Hostalia) y se
// editan desde el Panel de Administración.

let uid = 0
const id = () => `local-${++uid}`

export const FALLBACK_ENERGIA = [
  {
    id: id(), nombre_tarifa: 'IC Fija Ahorro 2.0TD', tipo: 'luz', segmento: '2.0TD',
    descripcion: 'Tarifa de precio fijo a 12 meses. Sin sorpresas: mismo precio del kWh en punta, llana y valle.',
    precio_potencia_p1: 0.078, precio_potencia_p2: 0.012, precio_potencia_p3: 0,
    precio_energia_p1: 0.148, precio_energia_p2: 0.148, precio_energia_p3: 0.148,
    termino_fijo_mensual: 0, alquiler_equipo_dia: 0.026, permanencia_meses: 12, destacada: false, activo: true,
  },
  {
    id: id(), nombre_tarifa: 'IC Ahorro Max 2.0TD', tipo: 'luz', segmento: '2.0TD',
    descripcion: 'Tarifa por periodos optimizada para clientes con consumo concentrado en horario valle/llano. Nuestra propuesta más competitiva.',
    precio_potencia_p1: 0.072, precio_potencia_p2: 0.010, precio_potencia_p3: 0,
    precio_energia_p1: 0.142, precio_energia_p2: 0.108, precio_energia_p3: 0.078,
    termino_fijo_mensual: 0, alquiler_equipo_dia: 0.026, permanencia_meses: 12, destacada: true, activo: true,
  },
  {
    id: id(), nombre_tarifa: 'IC Flex Sin Permanencia 2.0TD', tipo: 'luz', segmento: '2.0TD',
    descripcion: 'Sin permanencia ni penalización por baja. Ideal para clientes que priorizan flexibilidad sobre precio mínimo.',
    precio_potencia_p1: 0.082, precio_potencia_p2: 0.014, precio_potencia_p3: 0,
    precio_energia_p1: 0.155, precio_energia_p2: 0.121, precio_energia_p3: 0.091,
    termino_fijo_mensual: 0, alquiler_equipo_dia: 0.026, permanencia_meses: 0, destacada: false, activo: true,
  },
  {
    id: id(), nombre_tarifa: 'IC Negocio Estable 3.0TD', tipo: 'luz', segmento: '3.0TD',
    descripcion: 'Tarifa para pymes y comercios con potencia contratada entre 15 y 50 kW, 3 periodos de potencia y 6 de energía.',
    precio_potencia_p1: 0.055, precio_potencia_p2: 0.038, precio_potencia_p3: 0.021,
    precio_energia_p1: 0.152, precio_energia_p2: 0.138, precio_energia_p3: 0.126,
    termino_fijo_mensual: 0, alquiler_equipo_dia: 0.030, permanencia_meses: 12, destacada: false, activo: true,
  },
  {
    id: id(), nombre_tarifa: 'IC Gas Hogar RL.1', tipo: 'gas', segmento: 'RL.1',
    descripcion: 'Para viviendas con consumo de gas destinado a cocina y agua caliente (sin calefacción centralizada de gas).',
    precio_energia_p1: 0.058, termino_fijo_mensual: 6.90, permanencia_meses: 12, destacada: false, activo: true,
  },
  {
    id: id(), nombre_tarifa: 'IC Gas Confort RL.2', tipo: 'gas', segmento: 'RL.2',
    descripcion: 'Para viviendas con calefacción de gas natural. Mejor precio por kWh gracias al mayor volumen de consumo.',
    precio_energia_p1: 0.047, termino_fijo_mensual: 10.50, permanencia_meses: 12, destacada: true, activo: true,
  },
  {
    id: id(), nombre_tarifa: 'IC Gas Sin Permanencia RL.1', tipo: 'gas', segmento: 'RL.1',
    descripcion: 'Tarifa de gas flexible sin permanencia, precio ligeramente superior a cambio de libertad total.',
    precio_energia_p1: 0.063, termino_fijo_mensual: 7.50, permanencia_meses: 0, destacada: false, activo: true,
  },
]

export const FALLBACK_TELEFONIA = [
  {
    id: id(), nombre_tarifa: 'IC Móvil 50GB', tipo: 'movil',
    descripcion: 'Línea móvil individual con llamadas ilimitadas.',
    gb_datos: 50, datos_ilimitados: false, velocidad_fibra_mb: null,
    lineas_moviles_incluidas: 1, lineas_fijas_incluidas: 0,
    extras: ['Roaming UE incluido'], precio_mensual: 9.90, permanencia_meses: 0, destacada: false, activo: true,
  },
  {
    id: id(), nombre_tarifa: 'IC Móvil Ilimitado 5G', tipo: 'movil',
    descripcion: 'Datos ilimitados con velocidad 5G y llamadas ilimitadas.',
    gb_datos: null, datos_ilimitados: true, velocidad_fibra_mb: null,
    lineas_moviles_incluidas: 1, lineas_fijas_incluidas: 0,
    extras: ['5G', 'Roaming UE incluido'], precio_mensual: 14.90, permanencia_meses: 0, destacada: true, activo: true,
  },
  {
    id: id(), nombre_tarifa: 'IC Fibra 300 Mb', tipo: 'fibra',
    descripcion: 'Fibra simétrica 300 Mb sin línea fija asociada.',
    gb_datos: null, datos_ilimitados: null, velocidad_fibra_mb: 300,
    lineas_moviles_incluidas: 0, lineas_fijas_incluidas: 0,
    extras: ['WiFi 6'], precio_mensual: 24.90, permanencia_meses: 12, destacada: false, activo: true,
  },
  {
    id: id(), nombre_tarifa: 'IC Fibra 600 Mb', tipo: 'fibra',
    descripcion: 'Fibra simétrica 600 Mb, ideal para teletrabajo y streaming múltiple.',
    gb_datos: null, datos_ilimitados: null, velocidad_fibra_mb: 600,
    lineas_moviles_incluidas: 0, lineas_fijas_incluidas: 0,
    extras: ['WiFi 6', 'IP fija opcional'], precio_mensual: 28.90, permanencia_meses: 12, destacada: false, activo: true,
  },
  {
    id: id(), nombre_tarifa: 'IC Convergente Esencial', tipo: 'convergente',
    descripcion: 'Fibra 600 Mb + 1 línea móvil con 60 GB, sin permanencia.',
    gb_datos: 60, datos_ilimitados: false, velocidad_fibra_mb: 600,
    lineas_moviles_incluidas: 1, lineas_fijas_incluidas: 1,
    extras: ['WiFi 6'], precio_mensual: 26.90, permanencia_meses: 0, destacada: true, activo: true,
  },
  {
    id: id(), nombre_tarifa: 'IC Convergente Total', tipo: 'convergente',
    descripcion: 'Fibra simétrica 1 Gb + 2 líneas móviles con datos ilimitados 5G.',
    gb_datos: null, datos_ilimitados: true, velocidad_fibra_mb: 1000,
    lineas_moviles_incluidas: 2, lineas_fijas_incluidas: 1,
    extras: ['5G', 'WiFi 6', 'Roaming UE incluido'], precio_mensual: 42.90, permanencia_meses: 12, destacada: true, activo: true,
  },
  {
    id: id(), nombre_tarifa: 'IC Convergente Familiar', tipo: 'convergente',
    descripcion: 'Fibra 600 Mb + 4 líneas móviles ilimitadas, pensado para hogares grandes.',
    gb_datos: null, datos_ilimitados: true, velocidad_fibra_mb: 600,
    lineas_moviles_incluidas: 4, lineas_fijas_incluidas: 1,
    extras: ['5G', 'WiFi 6'], precio_mensual: 64.90, permanencia_meses: 12, destacada: false, activo: true,
  },
  {
    id: id(), nombre_tarifa: 'IC Centralita Virtual Pro', tipo: 'centralita',
    descripcion: 'Centralita virtual en la nube por extensión, ideal para oficinas y comercios.',
    gb_datos: null, datos_ilimitados: null, velocidad_fibra_mb: null,
    lineas_moviles_incluidas: 0, lineas_fijas_incluidas: 1,
    extras: ['IVR', 'Grabación de llamadas', 'App móvil'], precio_mensual: 19.90, permanencia_meses: 12, destacada: false, activo: true,
  },
]

export const FALLBACK_ALARMAS = [
  {
    id: id(), nombre_kit: 'IC Básica Hogar', tipo_kit: 'basica',
    descripcion: 'Central de alarma + 2 detectores de movimiento + mando, conexión app móvil y CRA 24h.',
    equipamiento: [
      '1 panel de control con transmisión GPRS/IP', '1 mando a distancia',
      '2 detectores de movimiento', '1 sirena interior', 'Conexión a Central Receptora de Alarmas 24h',
    ],
    num_camaras: 0, num_sensores: 2, num_mandos: 1, conexion_movil: true, central_receptora: true,
    cuota_mensual: 19.90, coste_instalacion: 0, permanencia_meses: 24, destacada: false, activo: true,
  },
  {
    id: id(), nombre_kit: 'IC Cámaras Smart', tipo_kit: 'camaras',
    descripcion: 'Kit con 2 cámaras HD interior/exterior, verificación por vídeo y detección inteligente.',
    equipamiento: [
      '1 panel de control con transmisión GPRS/IP', '1 mando a distancia',
      '2 cámaras HD con verificación por vídeo', '3 detectores de movimiento', '1 sirena interior',
      'Conexión a Central Receptora de Alarmas 24h',
    ],
    num_camaras: 2, num_sensores: 3, num_mandos: 1, conexion_movil: true, central_receptora: true,
    cuota_mensual: 29.90, coste_instalacion: 0, permanencia_meses: 24, destacada: true, activo: true,
  },
  {
    id: id(), nombre_kit: 'IC Gama Alta 360', tipo_kit: 'gama_alta',
    descripcion: 'Protección integral: 4 cámaras HD, 6 sensores, sirena exterior y videoverificación 24h.',
    equipamiento: [
      '1 panel de control con transmisión GPRS/IP', '2 mandos a distancia',
      '4 cámaras HD con verificación por vídeo', '6 detectores de movimiento',
      '1 sirena exterior de alta potencia', '1 detector magnético de apertura',
      'Conexión a Central Receptora de Alarmas 24h',
    ],
    num_camaras: 4, num_sensores: 6, num_mandos: 2, conexion_movil: true, central_receptora: true,
    cuota_mensual: 39.90, coste_instalacion: 0, permanencia_meses: 24, destacada: false, activo: true,
  },
  {
    id: id(), nombre_kit: 'IC Flex Sin Permanencia', tipo_kit: 'basica',
    descripcion: 'Kit básico sin permanencia, instalación con coste reducido a cambio de libertad total.',
    equipamiento: [
      '1 panel de control con transmisión GPRS/IP', '1 mando a distancia',
      '3 detectores de movimiento', '1 sirena interior', 'Conexión a Central Receptora de Alarmas 24h',
    ],
    num_camaras: 0, num_sensores: 3, num_mandos: 1, conexion_movil: true, central_receptora: true,
    cuota_mensual: 24.90, coste_instalacion: 149.0, permanencia_meses: 0, destacada: false, activo: true,
  },
  {
    id: id(), nombre_kit: 'IC Comercial Negocio', tipo_kit: 'comercial',
    descripcion: 'Solución para locales y oficinas: 6 cámaras, sensores perimetrales y apertura remota.',
    equipamiento: [
      '1 panel de control con transmisión GPRS/IP', '2 mandos/lectores de llave electrónicos',
      '6 cámaras HD con verificación por vídeo', '8 detectores de movimiento perimetrales',
      '1 sirena exterior de alta potencia', 'Apertura remota y control de accesos',
      'Conexión a Central Receptora de Alarmas 24h',
    ],
    num_camaras: 6, num_sensores: 8, num_mandos: 2, conexion_movil: true, central_receptora: true,
    cuota_mensual: 59.90, coste_instalacion: 0, permanencia_meses: 24, destacada: false, activo: true,
  },
]
