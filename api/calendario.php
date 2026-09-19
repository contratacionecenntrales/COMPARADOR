<?php
require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/_jerarquia.php';

const TIPOS_EVENTO = ['llamada', 'visita', 'seguimiento', 'reunion', 'otro'];

$pdo = icc_db();
$metodo = icc_method();
$actor = icc_require_rol(['admin', 'jefe_equipo', 'gestor_comercial']);
$idsVisibles = icc_ids_visibles($actor);

function icc_normalizar_evento(array $fila): array
{
    return [
        'id' => (int) $fila['id'],
        'usuario_id' => (int) $fila['usuario_id'],
        'usuario_nombre' => $fila['usuario_nombre'] ?? null,
        'creado_por' => (int) $fila['creado_por'],
        'titulo' => $fila['titulo'],
        'descripcion' => $fila['descripcion'],
        'tipo' => $fila['tipo'],
        'cliente_nombre' => $fila['cliente_nombre'],
        'fecha' => $fila['fecha'],
        'hora_inicio' => $fila['hora_inicio'],
        'hora_fin' => $fila['hora_fin'],
        'completado' => (bool) (int) $fila['completado'],
    ];
}

// ----------------------------------------------------------------------------
// GET — eventos visibles, opcionalmente filtrados por rango de fechas y/o
// por un comercial concreto (debe estar dentro de lo que el actor puede ver).
// ----------------------------------------------------------------------------
if ($metodo === 'GET') {
    $usuarioId = isset($_GET['usuario_id']) ? (int) $_GET['usuario_id'] : null;
    $idsConsulta = $idsVisibles;

    if ($usuarioId !== null) {
        if (!in_array($usuarioId, $idsVisibles, true)) {
            icc_error('No tienes permiso para ver la agenda de ese usuario.', 403);
        }
        $idsConsulta = [$usuarioId];
    }

    if (empty($idsConsulta)) {
        icc_json([]);
    }

    $marcadores = implode(',', array_fill(0, count($idsConsulta), '?'));
    $sql = "SELECT e.*, u.nombre AS usuario_nombre
            FROM eventos_calendario e
            JOIN admin_usuarios u ON u.id = e.usuario_id
            WHERE e.usuario_id IN ($marcadores)";
    $valores = $idsConsulta;

    if (!empty($_GET['desde'])) {
        $sql .= ' AND e.fecha >= ?';
        $valores[] = $_GET['desde'];
    }
    if (!empty($_GET['hasta'])) {
        $sql .= ' AND e.fecha <= ?';
        $valores[] = $_GET['hasta'];
    }
    $sql .= ' ORDER BY e.fecha, e.hora_inicio';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($valores);
    icc_json(array_map('icc_normalizar_evento', $stmt->fetchAll()));
}

// ----------------------------------------------------------------------------
// POST — crear evento (para uno mismo o para alguien de tu equipo)
// ----------------------------------------------------------------------------
if ($metodo === 'POST') {
    $body = icc_input();
    $usuarioId = (int) ($body['usuario_id'] ?? 0);
    $titulo = trim($body['titulo'] ?? '');
    $fecha = $body['fecha'] ?? '';
    $tipo = in_array($body['tipo'] ?? '', TIPOS_EVENTO, true) ? $body['tipo'] : 'otro';

    if (!in_array($usuarioId, $idsVisibles, true)) {
        icc_error('No puedes crear eventos para ese usuario.', 403);
    }
    if ($titulo === '' || $fecha === '') {
        icc_error('Título y fecha son obligatorios.', 422);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO eventos_calendario
            (usuario_id, creado_por, titulo, descripcion, tipo, cliente_nombre, fecha, hora_inicio, hora_fin, completado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)'
    );
    $stmt->execute([
        $usuarioId,
        $actor['id'],
        $titulo,
        $body['descripcion'] ?? null,
        $tipo,
        $body['cliente_nombre'] ?? null,
        $fecha,
        $body['hora_inicio'] ?: null,
        $body['hora_fin'] ?: null,
    ]);
    $id = (int) $pdo->lastInsertId();

    $stmt = $pdo->prepare('SELECT e.*, u.nombre AS usuario_nombre FROM eventos_calendario e JOIN admin_usuarios u ON u.id = e.usuario_id WHERE e.id = ?');
    $stmt->execute([$id]);
    icc_json(icc_normalizar_evento($stmt->fetch()), 201);
}

// Para editar/borrar, comprobamos que el evento pertenezca a alguien visible.
function icc_evento_visible(PDO $pdo, int $id, array $idsVisibles): ?array
{
    $stmt = $pdo->prepare('SELECT * FROM eventos_calendario WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $evento = $stmt->fetch();
    if (!$evento || !in_array((int) $evento['usuario_id'], $idsVisibles, true)) {
        return null;
    }
    return $evento;
}

// ----------------------------------------------------------------------------
// PUT — editar evento
// ----------------------------------------------------------------------------
if ($metodo === 'PUT') {
    $id = (int) ($_GET['id'] ?? 0);
    if (!icc_evento_visible($pdo, $id, $idsVisibles)) {
        icc_error('Evento no encontrado o sin permiso.', 404);
    }

    $body = icc_input();
    $campos = ['titulo', 'descripcion', 'cliente_nombre', 'fecha', 'hora_inicio', 'hora_fin'];
    $sets = [];
    $valores = [];

    foreach ($campos as $campo) {
        if (array_key_exists($campo, $body)) {
            $sets[] = "`$campo` = ?";
            $valores[] = $body[$campo] === '' ? null : $body[$campo];
        }
    }
    if (array_key_exists('tipo', $body) && in_array($body['tipo'], TIPOS_EVENTO, true)) {
        $sets[] = 'tipo = ?';
        $valores[] = $body['tipo'];
    }
    if (array_key_exists('completado', $body)) {
        $sets[] = 'completado = ?';
        $valores[] = $body['completado'] ? 1 : 0;
    }
    if (array_key_exists('usuario_id', $body) && in_array((int) $body['usuario_id'], $idsVisibles, true)) {
        $sets[] = 'usuario_id = ?';
        $valores[] = (int) $body['usuario_id'];
    }

    if (empty($sets)) {
        icc_error('No se han recibido campos válidos para actualizar.', 422);
    }

    $valores[] = $id;
    $stmt = $pdo->prepare('UPDATE eventos_calendario SET ' . implode(', ', $sets) . ' WHERE id = ?');
    $stmt->execute($valores);

    $stmt = $pdo->prepare('SELECT e.*, u.nombre AS usuario_nombre FROM eventos_calendario e JOIN admin_usuarios u ON u.id = e.usuario_id WHERE e.id = ?');
    $stmt->execute([$id]);
    icc_json(icc_normalizar_evento($stmt->fetch()));
}

// ----------------------------------------------------------------------------
// DELETE — eliminar evento
// ----------------------------------------------------------------------------
if ($metodo === 'DELETE') {
    $id = (int) ($_GET['id'] ?? 0);
    if (!icc_evento_visible($pdo, $id, $idsVisibles)) {
        icc_error('Evento no encontrado o sin permiso.', 404);
    }
    $stmt = $pdo->prepare('DELETE FROM eventos_calendario WHERE id = ?');
    $stmt->execute([$id]);
    icc_json(['ok' => true]);
}

icc_error('Método no soportado.', 405);
