<?php
require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/_jerarquia.php';

$pdo = icc_db();
$metodo = icc_method();

function icc_normalizar_usuario(array $fila): array
{
    return [
        'id' => (int) $fila['id'],
        'email' => $fila['email'],
        'nombre' => $fila['nombre'],
        'rol' => $fila['rol'],
        'supervisor_id' => $fila['supervisor_id'] !== null ? (int) $fila['supervisor_id'] : null,
        'supervisor_nombre' => $fila['supervisor_nombre'] ?? null,
        'activo' => (bool) (int) $fila['activo'],
        'created_at' => $fila['created_at'],
    ];
}

// Todas las operaciones de este endpoint requieren sesión.
$actor = icc_require_rol(['admin', 'jefe_equipo', 'gestor_comercial']);

// ----------------------------------------------------------------------------
// GET — lista de agentes visibles según jerarquía. También sirve para
// rellenar el selector de "supervisor" (solo admin/jefe_equipo lo usan).
// ----------------------------------------------------------------------------
if ($metodo === 'GET') {
    $ids = icc_ids_visibles($actor);
    if (empty($ids)) {
        icc_json([]);
    }
    $marcadores = implode(',', array_fill(0, count($ids), '?'));
    $stmt = $pdo->prepare(
        "SELECT u.*, s.nombre AS supervisor_nombre
         FROM admin_usuarios u
         LEFT JOIN admin_usuarios s ON s.id = u.supervisor_id
         WHERE u.id IN ($marcadores)
         ORDER BY u.rol, u.nombre"
    );
    $stmt->execute($ids);
    icc_json(array_map('icc_normalizar_usuario', $stmt->fetchAll()));
}

// A partir de aquí: crear/editar/borrar agentes → solo admin y jefe_equipo.
if (!in_array($actor['rol'], ['admin', 'jefe_equipo'], true)) {
    icc_error('No tienes permisos para gestionar agentes.', 403);
}

// ----------------------------------------------------------------------------
// POST — crear agente
// ----------------------------------------------------------------------------
if ($metodo === 'POST') {
    $body = icc_input();
    $email = trim($body['email'] ?? '');
    $password = (string) ($body['password'] ?? '');
    $nombre = trim($body['nombre'] ?? '');

    if ($email === '' || $password === '' || $nombre === '') {
        icc_error('Nombre, email y contraseña son obligatorios.', 422);
    }

    if ($actor['rol'] === 'admin') {
        $rol = in_array($body['rol'] ?? '', ['admin', 'jefe_equipo', 'gestor_comercial'], true) ? $body['rol'] : 'gestor_comercial';
        $supervisorId = $body['supervisor_id'] ?? null;
        $supervisorId = $supervisorId !== null && $supervisorId !== '' ? (int) $supervisorId : null;
    } else {
        // jefe_equipo: solo puede crear gestores comerciales de su propio equipo
        $rol = 'gestor_comercial';
        $supervisorId = $actor['id'];
    }

    $stmt = $pdo->prepare('SELECT id FROM admin_usuarios WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        icc_error('Ya existe un agente con ese email.', 422);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO admin_usuarios (email, password_hash, nombre, rol, supervisor_id, activo) VALUES (?, ?, ?, ?, ?, 1)'
    );
    $stmt->execute([$email, password_hash($password, PASSWORD_BCRYPT), $nombre, $rol, $supervisorId]);
    $id = (int) $pdo->lastInsertId();

    $stmt = $pdo->prepare(
        'SELECT u.*, s.nombre AS supervisor_nombre FROM admin_usuarios u LEFT JOIN admin_usuarios s ON s.id = u.supervisor_id WHERE u.id = ?'
    );
    $stmt->execute([$id]);
    icc_json(icc_normalizar_usuario($stmt->fetch()), 201);
}

// ----------------------------------------------------------------------------
// PUT — editar agente (nombre, activo, password opcional; rol/supervisor
// solo los puede tocar un admin)
// ----------------------------------------------------------------------------
if ($metodo === 'PUT') {
    $id = (int) ($_GET['id'] ?? 0);
    if ($id <= 0 || !icc_puede_ver_usuario($actor, $id)) {
        icc_error('Agente no encontrado o sin permiso.', 404);
    }

    $body = icc_input();
    $sets = [];
    $valores = [];

    if (array_key_exists('nombre', $body) && trim($body['nombre']) !== '') {
        $sets[] = 'nombre = ?';
        $valores[] = trim($body['nombre']);
    }
    if (array_key_exists('activo', $body)) {
        $sets[] = 'activo = ?';
        $valores[] = $body['activo'] ? 1 : 0;
    }
    if (!empty($body['password'])) {
        $sets[] = 'password_hash = ?';
        $valores[] = password_hash($body['password'], PASSWORD_BCRYPT);
    }

    if ($actor['rol'] === 'admin') {
        if (array_key_exists('rol', $body) && in_array($body['rol'], ['admin', 'jefe_equipo', 'gestor_comercial'], true)) {
            $sets[] = 'rol = ?';
            $valores[] = $body['rol'];
        }
        if (array_key_exists('supervisor_id', $body)) {
            $sets[] = 'supervisor_id = ?';
            $valores[] = $body['supervisor_id'] !== null && $body['supervisor_id'] !== '' ? (int) $body['supervisor_id'] : null;
        }
    }

    if (empty($sets)) {
        icc_error('No se han recibido campos válidos para actualizar.', 422);
    }

    $valores[] = $id;
    $stmt = $pdo->prepare('UPDATE admin_usuarios SET ' . implode(', ', $sets) . ' WHERE id = ?');
    $stmt->execute($valores);

    $stmt = $pdo->prepare(
        'SELECT u.*, s.nombre AS supervisor_nombre FROM admin_usuarios u LEFT JOIN admin_usuarios s ON s.id = u.supervisor_id WHERE u.id = ?'
    );
    $stmt->execute([$id]);
    icc_json(icc_normalizar_usuario($stmt->fetch()));
}

// ----------------------------------------------------------------------------
// DELETE — eliminar agente (solo admin, y nunca a uno mismo)
// ----------------------------------------------------------------------------
if ($metodo === 'DELETE') {
    if ($actor['rol'] !== 'admin') {
        icc_error('Solo un administrador puede eliminar agentes.', 403);
    }
    $id = (int) ($_GET['id'] ?? 0);
    if ($id <= 0) {
        icc_error('Falta el id del agente a eliminar.', 422);
    }
    if ($id === $actor['id']) {
        icc_error('No puedes eliminar tu propio usuario.', 422);
    }
    $stmt = $pdo->prepare('DELETE FROM admin_usuarios WHERE id = ?');
    $stmt->execute([$id]);
    icc_json(['ok' => true]);
}

icc_error('Método no soportado.', 405);
