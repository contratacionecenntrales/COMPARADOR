<?php
require_once __DIR__ . '/_bootstrap.php';

const SECTORES_VALIDOS = ['energia', 'telefonia', 'alarmas', 'pack_integral'];

$pdo = icc_db();
$metodo = icc_method();

function icc_normalizar_auditoria(array $fila): array
{
    $fila['id'] = (int) $fila['id'];
    foreach (['coste_actual_anual', 'coste_propuesto_anual', 'ahorro_anual', 'ahorro_porcentaje'] as $campo) {
        $fila[$campo] = $fila[$campo] !== null ? (float) $fila[$campo] : null;
    }
    $fila['tarifa_propuesta_id'] = $fila['tarifa_propuesta_id'] !== null ? (int) $fila['tarifa_propuesta_id'] : null;
    $fila['datos_entrada'] = json_decode($fila['datos_entrada'], true);
    $fila['resultado'] = json_decode($fila['resultado'], true);
    return $fila;
}

// ----------------------------------------------------------------------------
// POST — cualquier persona puede guardar el resultado de su propia auditoría
// (lo genera el asistente del comparador, no requiere sesión).
// ----------------------------------------------------------------------------
if ($metodo === 'POST') {
    $body = icc_input();

    $sector = $body['sector'] ?? '';
    if (!in_array($sector, SECTORES_VALIDOS, true)) {
        icc_error('Sector no válido.', 422);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO auditorias_clientes
            (sector, cliente_nombre, cliente_email, cliente_telefono, datos_entrada, resultado,
             coste_actual_anual, coste_propuesto_anual, ahorro_anual, ahorro_porcentaje,
             tarifa_actual_proveedor, tarifa_propuesta_id, gestor_email)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $sector,
        $body['cliente_nombre'] ?? null,
        $body['cliente_email'] ?? null,
        $body['cliente_telefono'] ?? null,
        json_encode($body['datos_entrada'] ?? new stdClass(), JSON_UNESCAPED_UNICODE),
        json_encode($body['resultado'] ?? new stdClass(), JSON_UNESCAPED_UNICODE),
        $body['coste_actual_anual'] ?? null,
        $body['coste_propuesto_anual'] ?? null,
        $body['ahorro_anual'] ?? null,
        $body['ahorro_porcentaje'] ?? null,
        $body['tarifa_actual_proveedor'] ?? null,
        $body['tarifa_propuesta_id'] ?? null,
        $body['gestor_email'] ?? null,
    ]);

    $id = (int) $pdo->lastInsertId();
    $stmt = $pdo->prepare('SELECT * FROM auditorias_clientes WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    icc_json(icc_normalizar_auditoria($stmt->fetch()), 201);
}

// ----------------------------------------------------------------------------
// GET — histórico de auditorías, solo para administradores autenticados.
// ----------------------------------------------------------------------------
if ($metodo === 'GET') {
    icc_require_auth();

    $limit = max(1, min(200, (int) ($_GET['limit'] ?? 50)));
    $sector = $_GET['sector'] ?? null;

    if ($sector && in_array($sector, SECTORES_VALIDOS, true)) {
        $stmt = $pdo->prepare('SELECT * FROM auditorias_clientes WHERE sector = ? ORDER BY created_at DESC LIMIT ?');
        $stmt->bindValue(1, $sector);
        $stmt->bindValue(2, $limit, PDO::PARAM_INT);
    } else {
        $stmt = $pdo->prepare('SELECT * FROM auditorias_clientes ORDER BY created_at DESC LIMIT ?');
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
    }
    $stmt->execute();

    $filas = array_map('icc_normalizar_auditoria', $stmt->fetchAll());
    icc_json($filas);
}

icc_error('Método no soportado.', 405);
