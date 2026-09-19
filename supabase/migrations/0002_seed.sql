-- ============================================================================
-- Integral Connection Consulting — Comparador y Auditor Inteligente
-- Migración 0002: datos iniciales (semilla)
--
-- Los precios de energía se basan en los peajes y cargos regulados vigentes
-- desde enero de 2026 (idénticos para todas las comercializadoras) más un
-- término de energía competitivo de referencia observado en el mercado libre
-- español a fecha de septiembre de 2026. Los precios de telefonía y alarmas
-- se basan en ofertas de mercado equivalentes observadas en la misma fecha.
--
-- IMPORTANTE: estos valores son orientativos y deben revisarse/ajustarse
-- periódicamente desde el Panel de Administración (tablas editables sin
-- tocar código), ya que los precios de mercado cambian con frecuencia.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ENERGÍA — LUZ (2.0TD doméstico: P1 punta, P2 llana, P3 valle)
-- Peajes+cargos regulados 2026 ya incorporados en el precio final ofertado.
-- Potencia en €/kW/día · Energía en €/kWh
-- ----------------------------------------------------------------------------
insert into public.tarifa_energia
  (nombre_tarifa, tipo, segmento, descripcion,
   precio_potencia_p1, precio_potencia_p2,
   precio_energia_p1, precio_energia_p2, precio_energia_p3,
   termino_fijo_mensual, alquiler_equipo_dia, permanencia_meses, destacada)
values
  ('IC Fija Ahorro 2.0TD', 'luz', '2.0TD',
   'Tarifa de precio fijo a 12 meses. Sin sorpresas: mismo precio del kWh en punta, llana y valle.',
   0.078000, 0.012000,
   0.148000, 0.148000, 0.148000,
   0, 0.026000, 12, false),

  ('IC Ahorro Max 2.0TD', 'luz', '2.0TD',
   'Tarifa por periodos optimizada para clientes con consumo concentrado en horario valle/llano. Nuestra propuesta más competitiva.',
   0.072000, 0.010000,
   0.142000, 0.108000, 0.078000,
   0, 0.026000, 12, true),

  ('IC Flex Sin Permanencia 2.0TD', 'luz', '2.0TD',
   'Sin permanencia ni penalización por baja. Ideal para clientes que priorizan flexibilidad sobre precio mínimo.',
   0.082000, 0.014000,
   0.155000, 0.121000, 0.091000,
   0, 0.026000, 0, false),

  ('IC Negocio Estable 3.0TD', 'luz', '3.0TD',
   'Tarifa para pymes y comercios con potencia contratada entre 15 y 50 kW, 3 periodos de potencia y 6 de energía.',
   0.055000, 0.038000, 0.021000,
   0.152000, 0.138000, 0.126000,
   0, 0.030000, 12, false);

-- Completar periodos p4-p6 para la tarifa 3.0TD (misma estructura simplificada 3 periodos energía se replica)
update public.tarifa_energia
set precio_potencia_p4 = 0.021000, precio_potencia_p5 = 0.038000, precio_potencia_p6 = 0.021000,
    precio_energia_p4 = 0.126000, precio_energia_p5 = 0.108000, precio_energia_p6 = 0.098000
where nombre_tarifa = 'IC Negocio Estable 3.0TD';

-- ----------------------------------------------------------------------------
-- ENERGÍA — GAS NATURAL (RL.1 doméstico <5.000 kWh/año, RL.2 5.000-50.000 kWh/año)
-- Término fijo en €/mes · Término variable (energía) en €/kWh, almacenado en p1
-- ----------------------------------------------------------------------------
insert into public.tarifa_energia
  (nombre_tarifa, tipo, segmento, descripcion,
   precio_energia_p1, termino_fijo_mensual, permanencia_meses, destacada)
values
  ('IC Gas Hogar RL.1', 'gas', 'RL.1',
   'Para viviendas con consumo de gas destinado a cocina y agua caliente (sin calefacción centralizada de gas).',
   0.058000, 6.90, 12, false),

  ('IC Gas Confort RL.2', 'gas', 'RL.2',
   'Para viviendas con calefacción de gas natural. Mejor precio por kWh gracias al mayor volumen de consumo.',
   0.047000, 10.50, 12, true),

  ('IC Gas Sin Permanencia RL.1', 'gas', 'RL.1',
   'Tarifa de gas flexible sin permanencia, precio ligeramente superior a cambio de libertad total.',
   0.063000, 7.50, 0, false);

-- ----------------------------------------------------------------------------
-- TELEFONÍA — móvil, fibra, fijo, convergentes y centralita virtual
-- ----------------------------------------------------------------------------
insert into public.tarifa_telefonia
  (nombre_tarifa, tipo, descripcion, gb_datos, datos_ilimitados, llamadas_ilimitadas,
   velocidad_fibra_mb, lineas_moviles_incluidas, lineas_fijas_incluidas, extras,
   precio_mensual, permanencia_meses, destacada)
values
  ('IC Móvil 50GB', 'movil', 'Línea móvil individual con llamadas ilimitadas.',
   50, false, true, null, 1, 0, array['Roaming UE incluido'],
   9.90, 0, false),

  ('IC Móvil Ilimitado 5G', 'movil', 'Datos ilimitados con velocidad 5G y llamadas ilimitadas.',
   null, true, true, null, 1, 0, array['5G','Roaming UE incluido'],
   14.90, 0, true),

  ('IC Fibra 300 Mb', 'fibra', 'Fibra simétrica 300 Mb sin línea fija asociada.',
   null, null, null, 300, 0, 0, array['WiFi 6'],
   24.90, 12, false),

  ('IC Fibra 600 Mb', 'fibra', 'Fibra simétrica 600 Mb, ideal para teletrabajo y streaming múltiple.',
   null, null, null, 600, 0, 0, array['WiFi 6','IP fija opcional'],
   28.90, 12, false),

  ('IC Convergente Esencial', 'convergente', 'Fibra 600 Mb + 1 línea móvil con 60 GB, sin permanencia.',
   60, false, true, 600, 1, 1, array['WiFi 6'],
   26.90, 0, true),

  ('IC Convergente Total', 'convergente', 'Fibra simétrica 1 Gb + 2 líneas móviles con datos ilimitados 5G.',
   null, true, true, 1000, 2, 1, array['5G','WiFi 6','Roaming UE incluido'],
   42.90, 12, true),

  ('IC Convergente Familiar', 'convergente', 'Fibra 600 Mb + 4 líneas móviles ilimitadas, pensado para hogares grandes.',
   null, true, true, 600, 4, 1, array['5G','WiFi 6'],
   64.90, 12, false),

  ('IC Centralita Virtual Pro', 'centralita', 'Centralita virtual en la nube por extensión, ideal para oficinas y comercios.',
   null, null, true, null, 0, 1, array['IVR','Grabación de llamadas','App móvil'],
   19.90, 12, false);

-- ----------------------------------------------------------------------------
-- ALARMAS — kits de seguridad residencial y comercial
-- ----------------------------------------------------------------------------
insert into public.tarifa_alarmas
  (nombre_kit, tipo_kit, descripcion, num_camaras, num_sensores, num_mandos,
   conexion_movil, central_receptora, cuota_mensual, coste_instalacion,
   permanencia_meses, destacada)
values
  ('IC Básica Hogar', 'basica', 'Central de alarma + 2 detectores de movimiento + mando, conexión app móvil y CRA 24h.',
   0, 2, 1, true, true, 19.90, 0, 24, false),

  ('IC Cámaras Smart', 'camaras', 'Kit con 2 cámaras HD interior/exterior, verificación por vídeo y detección inteligente.',
   2, 3, 1, true, true, 29.90, 0, 24, true),

  ('IC Gama Alta 360', 'gama_alta', 'Protección integral: 4 cámaras HD, 6 sensores, sirena exterior y videoverificación 24h.',
   4, 6, 2, true, true, 39.90, 0, 24, false),

  ('IC Flex Sin Permanencia', 'basica', 'Kit básico sin permanencia, instalación con coste reducido a cambio de libertad total.',
   0, 3, 1, true, true, 24.90, 149.00, 0, false),

  ('IC Comercial Negocio', 'comercial', 'Solución para locales y oficinas: 6 cámaras, sensores perimetrales y apertura remota.',
   6, 8, 2, true, true, 59.90, 0, 24, false);
