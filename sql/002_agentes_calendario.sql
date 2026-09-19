-- ============================================================================
-- Integral Connection Consulting — Comparador y Auditor Inteligente
-- Migración incremental: Agentes (roles/equipos) + Calendario
--
-- Solo necesitas ejecutar este archivo si YA habías importado schema.sql
-- antes de que existieran estas tablas/columnas. Si vas a montar la base de
-- datos desde cero, no hace falta: schema.sql ya lo incluye todo.
-- ============================================================================

SET NAMES utf8mb4;

-- 1) admin_usuarios: pasa `rol` a ENUM con los tres roles y añade la
--    jerarquía (supervisor_id). Los usuarios existentes con rol distinto de
--    'admin' quedan como 'gestor_comercial' por defecto (ajústalo a mano si
--    alguno debe ser 'jefe_equipo').
ALTER TABLE admin_usuarios
  MODIFY COLUMN rol ENUM('admin', 'jefe_equipo', 'gestor_comercial') NOT NULL DEFAULT 'gestor_comercial';

ALTER TABLE admin_usuarios
  ADD COLUMN IF NOT EXISTS supervisor_id INT UNSIGNED DEFAULT NULL AFTER rol;

ALTER TABLE admin_usuarios
  ADD CONSTRAINT fk_admin_usuarios_supervisor FOREIGN KEY (supervisor_id)
    REFERENCES admin_usuarios (id) ON DELETE SET NULL;

ALTER TABLE admin_usuarios
  ADD INDEX idx_admin_usuarios_supervisor (supervisor_id);

-- 2) eventos_calendario: nueva tabla de agenda
CREATE TABLE IF NOT EXISTS eventos_calendario (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  creado_por INT UNSIGNED NOT NULL,

  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT,
  tipo ENUM('llamada', 'visita', 'seguimiento', 'reunion', 'otro') NOT NULL DEFAULT 'otro',
  cliente_nombre VARCHAR(150) DEFAULT NULL,

  fecha DATE NOT NULL,
  hora_inicio TIME DEFAULT NULL,
  hora_fin TIME DEFAULT NULL,
  completado TINYINT(1) NOT NULL DEFAULT 0,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_eventos_usuario FOREIGN KEY (usuario_id) REFERENCES admin_usuarios (id) ON DELETE CASCADE,
  CONSTRAINT fk_eventos_creador FOREIGN KEY (creado_por) REFERENCES admin_usuarios (id) ON DELETE CASCADE,
  INDEX idx_eventos_usuario_fecha (usuario_id, fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
