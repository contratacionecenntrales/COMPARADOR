-- ============================================================================
-- Integral Connection Consulting — Comparador y Auditor Inteligente
-- Esquema MySQL / MariaDB para hosting Hostalia (importar desde phpMyAdmin)
--
-- Cómo importar:
--   1. Entra en phpMyAdmin de tu hosting Hostalia y selecciona tu base de datos
--      (o créala primero desde el panel de Hostalia si no existe).
--   2. Pestaña "Importar" → selecciona este archivo → Continuar.
--   3. Repite el proceso con seed.sql para cargar las tarifas iniciales.
-- ============================================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- ----------------------------------------------------------------------------
-- admin_usuarios — equipo interno con acceso al Panel de Configuración
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(150) DEFAULT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'admin',
  activo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- tarifa_energia — luz (2.0TD / 3.0TD / 6.1TD) y gas (RL.1 / RL.2 / RL.3)
-- Estructura unificada con periodos P1-P6 para soportar cualquier peaje.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tarifa_energia (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  proveedor VARCHAR(150) NOT NULL DEFAULT 'Integral Connection Consulting',
  nombre_tarifa VARCHAR(150) NOT NULL,
  tipo ENUM('luz', 'gas') NOT NULL,
  segmento VARCHAR(20) NOT NULL, -- '2.0TD','3.0TD','6.1TD','RL.1','RL.2','RL.3'
  descripcion TEXT,

  -- Potencia (€/kW/día) — solo aplica a luz
  precio_potencia_p1 DECIMAL(10,6) NOT NULL DEFAULT 0,
  precio_potencia_p2 DECIMAL(10,6) NOT NULL DEFAULT 0,
  precio_potencia_p3 DECIMAL(10,6) NOT NULL DEFAULT 0,
  precio_potencia_p4 DECIMAL(10,6) NOT NULL DEFAULT 0,
  precio_potencia_p5 DECIMAL(10,6) NOT NULL DEFAULT 0,
  precio_potencia_p6 DECIMAL(10,6) NOT NULL DEFAULT 0,

  -- Energía (€/kWh) — luz por periodos P1-P6; gas normalmente solo usa p1
  precio_energia_p1 DECIMAL(10,6) NOT NULL DEFAULT 0,
  precio_energia_p2 DECIMAL(10,6) NOT NULL DEFAULT 0,
  precio_energia_p3 DECIMAL(10,6) NOT NULL DEFAULT 0,
  precio_energia_p4 DECIMAL(10,6) NOT NULL DEFAULT 0,
  precio_energia_p5 DECIMAL(10,6) NOT NULL DEFAULT 0,
  precio_energia_p6 DECIMAL(10,6) NOT NULL DEFAULT 0,

  termino_fijo_mensual DECIMAL(10,4) NOT NULL DEFAULT 0,
  alquiler_equipo_dia DECIMAL(10,6) NOT NULL DEFAULT 0,

  comision_captacion DECIMAL(10,2) NOT NULL DEFAULT 0,
  permanencia_meses INT NOT NULL DEFAULT 0,

  activo TINYINT(1) NOT NULL DEFAULT 1,
  destacada TINYINT(1) NOT NULL DEFAULT 0,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_tarifa_energia_tipo_segmento (tipo, segmento, activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- tarifa_telefonia — móvil, fibra, fijo, convergentes y centralita
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tarifa_telefonia (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  proveedor VARCHAR(150) NOT NULL DEFAULT 'Integral Connection Consulting',
  nombre_tarifa VARCHAR(150) NOT NULL,
  tipo ENUM('movil', 'fibra', 'fijo', 'convergente', 'centralita') NOT NULL,
  descripcion TEXT,

  gb_datos DECIMAL(10,2) DEFAULT NULL,       -- NULL si no aplica; ver datos_ilimitados
  datos_ilimitados TINYINT(1) NOT NULL DEFAULT 0,
  llamadas_ilimitadas TINYINT(1) NOT NULL DEFAULT 1,
  minutos_incluidos DECIMAL(10,2) DEFAULT NULL,
  velocidad_fibra_mb DECIMAL(10,2) DEFAULT NULL,
  lineas_moviles_incluidas INT NOT NULL DEFAULT 0,
  lineas_fijas_incluidas INT NOT NULL DEFAULT 0,
  extras VARCHAR(500) DEFAULT NULL,           -- lista separada por comas, ej: "5G,WiFi 6"

  precio_mensual DECIMAL(10,2) NOT NULL DEFAULT 0,
  permanencia_meses INT NOT NULL DEFAULT 0,
  comision_captacion DECIMAL(10,2) NOT NULL DEFAULT 0,

  activo TINYINT(1) NOT NULL DEFAULT 1,
  destacada TINYINT(1) NOT NULL DEFAULT 0,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_tarifa_telefonia_tipo (tipo, activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- tarifa_alarmas — kits de seguridad residencial y comercial
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tarifa_alarmas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  proveedor VARCHAR(150) NOT NULL DEFAULT 'Integral Connection Consulting',
  nombre_kit VARCHAR(150) NOT NULL,
  tipo_kit ENUM('basica', 'camaras', 'gama_alta', 'comercial') NOT NULL,
  descripcion TEXT,
  equipamiento VARCHAR(1000) DEFAULT NULL, -- lista separada por comas, ej: "Panel de control,Sirena exterior"

  num_camaras INT NOT NULL DEFAULT 0,
  num_sensores INT NOT NULL DEFAULT 0,
  num_mandos INT NOT NULL DEFAULT 0,
  conexion_movil TINYINT(1) NOT NULL DEFAULT 1,
  central_receptora TINYINT(1) NOT NULL DEFAULT 1,

  cuota_mensual DECIMAL(10,2) NOT NULL DEFAULT 0,
  coste_instalacion DECIMAL(10,2) NOT NULL DEFAULT 0,
  permanencia_meses INT NOT NULL DEFAULT 0,
  comision_captacion DECIMAL(10,2) NOT NULL DEFAULT 0,

  activo TINYINT(1) NOT NULL DEFAULT 1,
  destacada TINYINT(1) NOT NULL DEFAULT 0,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_tarifa_alarmas_tipo (tipo_kit, activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- auditorias_clientes — histórico de comparativas generadas
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS auditorias_clientes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sector ENUM('energia', 'telefonia', 'alarmas', 'pack_integral') NOT NULL,

  cliente_nombre VARCHAR(150) DEFAULT NULL,
  cliente_email VARCHAR(150) DEFAULT NULL,
  cliente_telefono VARCHAR(50) DEFAULT NULL,

  datos_entrada LONGTEXT NOT NULL,   -- JSON con el payload íntegro del formulario
  resultado LONGTEXT NOT NULL,       -- JSON con el desglose de coste actual vs propuesta

  coste_actual_anual DECIMAL(12,2) DEFAULT NULL,
  coste_propuesto_anual DECIMAL(12,2) DEFAULT NULL,
  ahorro_anual DECIMAL(12,2) DEFAULT NULL,
  ahorro_porcentaje DECIMAL(6,2) DEFAULT NULL,

  tarifa_actual_proveedor VARCHAR(150) DEFAULT NULL,
  tarifa_propuesta_id INT UNSIGNED DEFAULT NULL,

  gestor_email VARCHAR(150) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_auditorias_sector (sector, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
