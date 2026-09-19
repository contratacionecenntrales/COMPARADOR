<?php
require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/_catalogos.php';

$catalogo = $_GET['catalogo'] ?? '';
if (!isset(ICC_CATALOGOS[$catalogo])) {
    icc_error('Catálogo no válido. Usa energia, telefonia o alarmas.', 400);
}

$def = ICC_CATALOGOS[$catalogo];
$tabla = $def['tabla'];
$pdo = icc_db();
$metodo = icc_method();

// ----------------------------------------------------------------------------
// GET — listar tarifas del catálogo. Público solo para activas; el listado
// completo (incluye inactivas) requiere sesión de administrador.
// ----------------------------------------------------------------------------
if ($metodo === 'GET') {
    $soloActivas = ($_GET['soloActivas'] ?? '1') !== '0';
    if (!$soloActivas) {
        icc_require_auth();
    }

    $sql = "SELECT * FROM `$tabla`";
    if ($soloActivas) {
        $sql .= ' WHERE activo = 1';
    }
    $sql .= ' ORDER BY `' . $def['orden'] . '` ASC';

    $filas = $pdo->query($sql)->fetchAll();
    $filas = array_map(fn($f) => icc_normalizar_fila($f, $def), $filas);

    icc_json($filas);
}

// A partir de aquí, todas las operaciones requieren sesión de administrador.
icc_require_auth();

// ----------------------------------------------------------------------------
// POST — crear tarifa
// ----------------------------------------------------------------------------
if ($metodo === 'POST') {
    $body = icc_input();
    $campos = [];
    $valores = [];
    $marcadores = [];

    foreach ($def['columnas'] as $col) {
        if (!array_key_exists($col, $body)) {
            continue;
        }
        $valor = $body[$col];
        if (in_array($col, $def['listas'] ?? [], true)) {
            $valor = icc_serializar_lista($valor);
        } elseif (in_array($col, $def['booleanos'], true)) {
            $valor = $valor ? 1 : 0;
        }
        $campos[] = "`$col`";
        $marcadores[] = '?';
        $valores[] = $valor;
    }

    if (empty($campos)) {
        icc_error('No se han recibido campos válidos para crear la tarifa.', 422);
    }

    $sql = "INSERT INTO `$tabla` (" . implode(', ', $campos) . ') VALUES (' . implode(', ', $marcadores) . ')';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($valores);
    $id = (int) $pdo->lastInsertId();

    $stmt = $pdo->prepare("SELECT * FROM `$tabla` WHERE id = ? LIMIT 1");
    $stmt->execute([$id]);
    icc_json(icc_normalizar_fila($stmt->fetch(), $def), 201);
}

// ----------------------------------------------------------------------------
// PUT — actualizar tarifa por id
// ----------------------------------------------------------------------------
if ($metodo === 'PUT') {
    $id = (int) ($_GET['id'] ?? 0);
    if ($id <= 0) {
        icc_error('Falta el id de la tarifa a actualizar.', 422);
    }

    $body = icc_input();
    $sets = [];
    $valores = [];

    foreach ($def['columnas'] as $col) {
        if (!array_key_exists($col, $body)) {
            continue;
        }
        $valor = $body[$col];
        if (in_array($col, $def['listas'] ?? [], true)) {
            $valor = icc_serializar_lista($valor);
        } elseif (in_array($col, $def['booleanos'], true)) {
            $valor = $valor ? 1 : 0;
        }
        $sets[] = "`$col` = ?";
        $valores[] = $valor;
    }

    if (empty($sets)) {
        icc_error('No se han recibido campos válidos para actualizar.', 422);
    }

    $valores[] = $id;
    $sql = "UPDATE `$tabla` SET " . implode(', ', $sets) . ' WHERE id = ?';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($valores);

    $stmt = $pdo->prepare("SELECT * FROM `$tabla` WHERE id = ? LIMIT 1");
    $stmt->execute([$id]);
    $fila = $stmt->fetch();
    if (!$fila) {
        icc_error('Tarifa no encontrada.', 404);
    }
    icc_json(icc_normalizar_fila($fila, $def));
}

// ----------------------------------------------------------------------------
// DELETE — eliminar tarifa por id
// ----------------------------------------------------------------------------
if ($metodo === 'DELETE') {
    $id = (int) ($_GET['id'] ?? 0);
    if ($id <= 0) {
        icc_error('Falta el id de la tarifa a eliminar.', 422);
    }
    $stmt = $pdo->prepare("DELETE FROM `$tabla` WHERE id = ?");
    $stmt->execute([$id]);
    icc_json(['ok' => true]);
}

icc_error('Método no soportado.', 405);
