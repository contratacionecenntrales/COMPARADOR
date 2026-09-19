-- ============================================================================
-- Integral Connection Consulting — Comparador y Auditor Inteligente
-- Datos iniciales (semilla) — importar en phpMyAdmin DESPUÉS de schema.sql
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

SET NAMES utf8mb4;

-- ----------------------------------------------------------------------------
-- ENERGÍA — LUZ (2.0TD doméstico: P1 punta, P2 llana, P3 valle)
-- ----------------------------------------------------------------------------
INSERT INTO tarifa_energia
  (nombre_tarifa, tipo, segmento, descripcion,
   precio_potencia_p1, precio_potencia_p2, precio_potencia_p3, precio_potencia_p4, precio_potencia_p5, precio_potencia_p6,
   precio_energia_p1, precio_energia_p2, precio_energia_p3, precio_energia_p4, precio_energia_p5, precio_energia_p6,
   termino_fijo_mensual, alquiler_equipo_dia, permanencia_meses, destacada)
VALUES
  ('IC Fija Ahorro 2.0TD', 'luz', '2.0TD',
   'Tarifa de precio fijo a 12 meses. Sin sorpresas: mismo precio del kWh en punta, llana y valle.',
   0.078000, 0.012000, 0, 0, 0, 0,
   0.148000, 0.148000, 0.148000, 0, 0, 0,
   0, 0.026000, 12, 0),

  ('IC Ahorro Max 2.0TD', 'luz', '2.0TD',
   'Tarifa por periodos optimizada para clientes con consumo concentrado en horario valle/llano. Nuestra propuesta más competitiva.',
   0.072000, 0.010000, 0, 0, 0, 0,
   0.142000, 0.108000, 0.078000, 0, 0, 0,
   0, 0.026000, 12, 1),

  ('IC Flex Sin Permanencia 2.0TD', 'luz', '2.0TD',
   'Sin permanencia ni penalización por baja. Ideal para clientes que priorizan flexibilidad sobre precio mínimo.',
   0.082000, 0.014000, 0, 0, 0, 0,
   0.155000, 0.121000, 0.091000, 0, 0, 0,
   0, 0.026000, 0, 0),

  ('IC Negocio Estable 3.0TD', 'luz', '3.0TD',
   'Tarifa para pymes y comercios con potencia contratada entre 15 y 50 kW, 3 periodos de potencia y 6 de energía.',
   0.055000, 0.038000, 0.021000, 0.021000, 0.038000, 0.021000,
   0.152000, 0.138000, 0.126000, 0.126000, 0.108000, 0.098000,
   0, 0.030000, 12, 0);

-- ----------------------------------------------------------------------------
-- ENERGÍA — GAS NATURAL (RL.1 doméstico <5.000 kWh/año, RL.2 5.000-50.000 kWh/año)
-- ----------------------------------------------------------------------------
INSERT INTO tarifa_energia
  (nombre_tarifa, tipo, segmento, descripcion, precio_energia_p1, termino_fijo_mensual, permanencia_meses, destacada)
VALUES
  ('IC Gas Hogar RL.1', 'gas', 'RL.1',
   'Para viviendas con consumo de gas destinado a cocina y agua caliente (sin calefacción centralizada de gas).',
   0.058000, 6.90, 12, 0),

  ('IC Gas Confort RL.2', 'gas', 'RL.2',
   'Para viviendas con calefacción de gas natural. Mejor precio por kWh gracias al mayor volumen de consumo.',
   0.047000, 10.50, 12, 1),

  ('IC Gas Sin Permanencia RL.1', 'gas', 'RL.1',
   'Tarifa de gas flexible sin permanencia, precio ligeramente superior a cambio de libertad total.',
   0.063000, 7.50, 0, 0);

-- ----------------------------------------------------------------------------
-- TELEFONÍA — móvil, fibra, fijo, convergentes y centralita virtual
-- ----------------------------------------------------------------------------
INSERT INTO tarifa_telefonia
  (nombre_tarifa, tipo, descripcion, gb_datos, datos_ilimitados, llamadas_ilimitadas,
   velocidad_fibra_mb, lineas_moviles_incluidas, lineas_fijas_incluidas, extras,
   precio_mensual, permanencia_meses, destacada)
VALUES
  ('IC Móvil 50GB', 'movil', 'Línea móvil individual con llamadas ilimitadas.',
   50, 0, 1, NULL, 1, 0, 'Roaming UE incluido',
   9.90, 0, 0),

  ('IC Móvil Ilimitado 5G', 'movil', 'Datos ilimitados con velocidad 5G y llamadas ilimitadas.',
   NULL, 1, 1, NULL, 1, 0, '5G,Roaming UE incluido',
   14.90, 0, 1),

  ('IC Fibra 300 Mb', 'fibra', 'Fibra simétrica 300 Mb sin línea fija asociada.',
   NULL, 0, 1, 300, 0, 0, 'WiFi 6',
   24.90, 12, 0),

  ('IC Fibra 600 Mb', 'fibra', 'Fibra simétrica 600 Mb, ideal para teletrabajo y streaming múltiple.',
   NULL, 0, 1, 600, 0, 0, 'WiFi 6,IP fija opcional',
   28.90, 12, 0),

  ('IC Convergente Esencial', 'convergente', 'Fibra 600 Mb + 1 línea móvil con 60 GB, sin permanencia.',
   60, 0, 1, 600, 1, 1, 'WiFi 6',
   26.90, 0, 1),

  ('IC Convergente Total', 'convergente', 'Fibra simétrica 1 Gb + 2 líneas móviles con datos ilimitados 5G.',
   NULL, 1, 1, 1000, 2, 1, '5G,WiFi 6,Roaming UE incluido',
   42.90, 12, 1),

  ('IC Convergente Familiar', 'convergente', 'Fibra 600 Mb + 4 líneas móviles ilimitadas, pensado para hogares grandes.',
   NULL, 1, 1, 600, 4, 1, '5G,WiFi 6',
   64.90, 12, 0),

  ('IC Centralita Virtual Pro', 'centralita', 'Centralita virtual en la nube por extensión, ideal para oficinas y comercios.',
   NULL, 0, 1, NULL, 0, 1, 'IVR,Grabación de llamadas,App móvil',
   19.90, 12, 0);

-- ----------------------------------------------------------------------------
-- ALARMAS — kits de seguridad residencial y comercial
-- ----------------------------------------------------------------------------
INSERT INTO tarifa_alarmas
  (nombre_kit, tipo_kit, descripcion, equipamiento, num_camaras, num_sensores, num_mandos,
   conexion_movil, central_receptora, cuota_mensual, coste_instalacion,
   permanencia_meses, destacada)
VALUES
  ('IC Básica Hogar', 'basica', 'Central de alarma + 2 detectores de movimiento + mando, conexión app móvil y CRA 24h.',
   '1 panel de control con transmisión GPRS/IP,1 mando a distancia,2 detectores de movimiento,1 sirena interior,Conexión a Central Receptora de Alarmas 24h',
   0, 2, 1, 1, 1, 19.90, 0, 24, 0),

  ('IC Cámaras Smart', 'camaras', 'Kit con 2 cámaras HD interior/exterior, verificación por vídeo y detección inteligente.',
   '1 panel de control con transmisión GPRS/IP,1 mando a distancia,2 cámaras HD con verificación por vídeo,3 detectores de movimiento,1 sirena interior,Conexión a Central Receptora de Alarmas 24h',
   2, 3, 1, 1, 1, 29.90, 0, 24, 1),

  ('IC Gama Alta 360', 'gama_alta', 'Protección integral: 4 cámaras HD, 6 sensores, sirena exterior y videoverificación 24h.',
   '1 panel de control con transmisión GPRS/IP,2 mandos a distancia,4 cámaras HD con verificación por vídeo,6 detectores de movimiento,1 sirena exterior de alta potencia,1 detector magnético de apertura,Conexión a Central Receptora de Alarmas 24h',
   4, 6, 2, 1, 1, 39.90, 0, 24, 0),

  ('IC Flex Sin Permanencia', 'basica', 'Kit básico sin permanencia, instalación con coste reducido a cambio de libertad total.',
   '1 panel de control con transmisión GPRS/IP,1 mando a distancia,3 detectores de movimiento,1 sirena interior,Conexión a Central Receptora de Alarmas 24h',
   0, 3, 1, 1, 1, 24.90, 149.00, 0, 0),

  ('IC Comercial Negocio', 'comercial', 'Solución para locales y oficinas: 6 cámaras, sensores perimetrales y apertura remota.',
   '1 panel de control con transmisión GPRS/IP,2 mandos/lectores de llave electrónicos,6 cámaras HD con verificación por vídeo,8 detectores de movimiento perimetrales,1 sirena exterior de alta potencia,Apertura remota y control de accesos,Conexión a Central Receptora de Alarmas 24h',
   6, 8, 2, 1, 1, 59.90, 0, 24, 0);

-- ----------------------------------------------------------------------------
-- ADMIN_USUARIOS — usuario administrador de ejemplo
--
-- ¡IMPORTANTE! Cambia el email y genera tu propio hash de contraseña antes de
-- usar en producción. Puedes generarlo con el script incluido:
--   php api/tools/generar_hash.php "TuContraseñaSegura"
-- y sustituir el valor de abajo, o directamente UPDATE esta fila desde
-- phpMyAdmin una vez importado.
--
-- El hash de ejemplo corresponde a la contraseña: CambiaEstaClave123
-- ----------------------------------------------------------------------------
INSERT INTO admin_usuarios (email, password_hash, nombre, rol)
VALUES (
  'admin@integralconnectionconsulting.com',
  '$2y$12$bkONFzYiQjSYS6yWSY1K7e/lRAxG5Tu5zPhPAmyUoO3ywmNmDZ6Yq',
  'Administrador',
  'admin'
);
