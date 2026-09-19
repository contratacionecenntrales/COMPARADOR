<?php
/**
 * Copia este archivo como config.php (mismo directorio) y rellena con los
 * datos de tu base de datos MySQL de Hostalia (Panel de Hostalia → Bases de
 * datos MySQL, o directamente en phpMyAdmin → pestaña "Privilegios" del
 * usuario). config.php NUNCA debe subirse a un repositorio público: está
 * excluido en .gitignore.
 */

return [
    'db_host' => 'localhost',          // normalmente 'localhost' en Hostalia
    'db_name' => 'tu_base_de_datos',
    'db_user' => 'tu_usuario_mysql',
    'db_pass' => 'tu_contraseña_mysql',
    'db_charset' => 'utf8mb4',

    // Nombre de la cookie de sesión del Panel de Administración.
    'session_name' => 'icc_admin_session',
];
