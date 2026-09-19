<?php
/**
 * Comprobación de salud: confirma que PHP está sirviendo /api y que la
 * conexión a MySQL funciona. El frontend lo usa para saber si debe mostrar
 * el aviso de "modo demo" (API no disponible → usa datos locales de ejemplo).
 */
require_once __DIR__ . '/_bootstrap.php';

// icc_db() ya habrá terminado la petición con un JSON de error 500 si la
// conexión falla, así que llegar aquí implica que todo está OK.
icc_db();

icc_json(['ok' => true]);
