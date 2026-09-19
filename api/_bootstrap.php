<?php
/**
 * Bootstrap común para todos los endpoints: sesión, cabeceras JSON y
 * manejo de errores (convierte cualquier fallo inesperado en JSON en vez
 * de en una página de error HTML, para que el frontend siempre reciba
 * una respuesta parseable).
 */

require_once __DIR__ . '/db.php';

$config = icc_config();

ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.use_strict_mode', '1');
if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
    ini_set('session.cookie_secure', '1');
}
session_name($config['session_name'] ?? 'icc_admin_session');
session_start();

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

set_exception_handler(function (Throwable $e) {
    error_log('[icc-api] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error interno del servidor.']);
    exit;
});

function icc_input(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === '' || $raw === false) {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function icc_json($data, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($data);
    exit;
}

function icc_error(string $message, int $status = 400): never
{
    icc_json(['error' => $message], $status);
}

function icc_is_logged_in(): bool
{
    return !empty($_SESSION['admin_id']);
}

function icc_require_auth(): void
{
    if (!icc_is_logged_in()) {
        icc_error('No autenticado.', 401);
    }
}

function icc_method(): string
{
    return $_SERVER['REQUEST_METHOD'] ?? 'GET';
}
