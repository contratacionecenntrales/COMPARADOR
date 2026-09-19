<?php
/**
 * Reglas de visibilidad por rol para Agentes y Calendario:
 *   - admin: ve y gestiona a todos.
 *   - jefe_equipo: ve y gestiona a sí mismo + a los gestor_comercial cuyo
 *     supervisor_id le apunta a él (su equipo, configurable al editar cada
 *     agente).
 *   - gestor_comercial: solo se ve a sí mismo. Nunca ve a su superior ni a
 *     otros compañeros.
 */

function icc_usuario_actual(): ?array
{
    if (!icc_is_logged_in()) {
        return null;
    }
    static $usuario = null;
    if ($usuario !== null) {
        return $usuario;
    }
    $stmt = icc_db()->prepare('SELECT id, email, nombre, rol, supervisor_id FROM admin_usuarios WHERE id = ? AND activo = 1 LIMIT 1');
    $stmt->execute([$_SESSION['admin_id']]);
    $fila = $stmt->fetch();
    if (!$fila) {
        return null;
    }
    $usuario = [
        'id' => (int) $fila['id'],
        'email' => $fila['email'],
        'nombre' => $fila['nombre'],
        'rol' => $fila['rol'],
        'supervisor_id' => $fila['supervisor_id'] !== null ? (int) $fila['supervisor_id'] : null,
    ];
    return $usuario;
}

function icc_require_rol(array $rolesPermitidos): array
{
    icc_require_auth();
    $usuario = icc_usuario_actual();
    if (!$usuario) {
        icc_error('Sesión no válida.', 401);
    }
    if (!in_array($usuario['rol'], $rolesPermitidos, true)) {
        icc_error('No tienes permisos para esta acción.', 403);
    }
    return $usuario;
}

/**
 * Devuelve los ids de admin_usuarios visibles para el usuario dado, según su
 * rol: él mismo siempre, más su equipo si es admin o jefe_equipo.
 */
function icc_ids_visibles(array $usuario): array
{
    $pdo = icc_db();

    if ($usuario['rol'] === 'admin') {
        return array_map('intval', $pdo->query('SELECT id FROM admin_usuarios')->fetchAll(PDO::FETCH_COLUMN));
    }

    if ($usuario['rol'] === 'jefe_equipo') {
        $stmt = $pdo->prepare('SELECT id FROM admin_usuarios WHERE supervisor_id = ?');
        $stmt->execute([$usuario['id']]);
        $equipo = array_map('intval', $stmt->fetchAll(PDO::FETCH_COLUMN));
        return array_merge([$usuario['id']], $equipo);
    }

    // gestor_comercial: solo él mismo
    return [$usuario['id']];
}

function icc_puede_ver_usuario(array $usuarioActual, int $idObjetivo): bool
{
    return in_array($idObjetivo, icc_ids_visibles($usuarioActual), true);
}
