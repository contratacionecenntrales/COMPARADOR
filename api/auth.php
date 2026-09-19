<?php
require_once __DIR__ . '/_bootstrap.php';

$action = $_GET['action'] ?? '';

if ($action === 'login' && icc_method() === 'POST') {
    $body = icc_input();
    $email = trim($body['email'] ?? '');
    $password = (string) ($body['password'] ?? '');

    if ($email === '' || $password === '') {
        icc_error('Email y contraseña son obligatorios.', 422);
    }

    $stmt = icc_db()->prepare(
        'SELECT id, email, nombre, rol, password_hash FROM admin_usuarios WHERE email = ? AND activo = 1 LIMIT 1'
    );
    $stmt->execute([$email]);
    $usuario = $stmt->fetch();

    if (!$usuario || !password_verify($password, $usuario['password_hash'])) {
        icc_error('Credenciales incorrectas.', 401);
    }

    session_regenerate_id(true);
    $_SESSION['admin_id'] = (int) $usuario['id'];

    icc_json([
        'user' => [
            'id' => (int) $usuario['id'],
            'email' => $usuario['email'],
            'nombre' => $usuario['nombre'],
            'rol' => $usuario['rol'],
        ],
    ]);
}

if ($action === 'logout' && icc_method() === 'POST') {
    $_SESSION = [];
    session_destroy();
    icc_json(['ok' => true]);
}

if ($action === 'me' && icc_method() === 'GET') {
    if (!icc_is_logged_in()) {
        icc_json(['user' => null]);
    }

    $stmt = icc_db()->prepare('SELECT id, email, nombre, rol FROM admin_usuarios WHERE id = ? AND activo = 1 LIMIT 1');
    $stmt->execute([$_SESSION['admin_id']]);
    $usuario = $stmt->fetch();

    if (!$usuario) {
        $_SESSION = [];
        session_destroy();
        icc_json(['user' => null]);
    }

    icc_json([
        'user' => [
            'id' => (int) $usuario['id'],
            'email' => $usuario['email'],
            'nombre' => $usuario['nombre'],
            'rol' => $usuario['rol'],
        ],
    ]);
}

icc_error('Acción no soportada.', 404);
