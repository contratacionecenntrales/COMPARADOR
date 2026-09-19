<?php
/**
 * Genera un hash bcrypt válido para admin_usuarios.password_hash.
 *
 * Uso recomendado (por SSH, si tu plan de Hostalia lo incluye):
 *   php generar_hash.php "TuContraseñaSegura"
 *
 * Si no tienes acceso SSH, puedes ejecutarlo una única vez desde el
 * navegador (ver más abajo) y luego BORRAR este archivo o protegerlo con
 * el .htaccess de api/tools/ (deniega el acceso por defecto).
 */

if (php_sapi_name() === 'cli') {
    $password = $argv[1] ?? null;
    if (!$password) {
        fwrite(STDERR, "Uso: php generar_hash.php \"TuContraseñaSegura\"\n");
        exit(1);
    }
    echo password_hash($password, PASSWORD_BCRYPT) . PHP_EOL;
    exit(0);
}

// Modo navegador (deshabilitado por defecto por seguridad; el .htaccess de
// esta carpeta bloquea el acceso HTTP salvo que lo modifiques a propósito).
header('Content-Type: text/html; charset=utf-8');
$hash = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['password'])) {
    $hash = password_hash($_POST['password'], PASSWORD_BCRYPT);
}
?>
<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><title>Generar hash de contraseña</title></head>
<body style="font-family: sans-serif; max-width: 480px; margin: 40px auto;">
  <h1>Generar hash de contraseña</h1>
  <p>Genera el <code>password_hash</code> para insertar manualmente en
     <code>admin_usuarios</code> desde phpMyAdmin. Borra este archivo cuando termines.</p>
  <form method="post">
    <input type="text" name="password" placeholder="Nueva contraseña" style="width:100%;padding:8px" required>
    <button type="submit" style="margin-top:10px;padding:8px 16px">Generar hash</button>
  </form>
  <?php if ($hash): ?>
    <p><strong>Hash generado:</strong></p>
    <textarea readonly style="width:100%;height:80px"><?php echo htmlspecialchars($hash); ?></textarea>
  <?php endif; ?>
</body>
</html>
