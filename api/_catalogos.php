<?php
/**
 * Definición de los catálogos de tarifas editables desde el Panel de
 * Administración. Centraliza aquí la tabla, columnas permitidas y campos
 * booleanos/numéricos de cada catálogo para que tarifas.php pueda validar
 * y castear sin aceptar nombres de columna arbitrarios (evita SQL injection
 * vía nombres de campo) ni devolver "0"/"1" como si fueran texto.
 */

const ICC_CATALOGOS = [
    'energia' => [
        'tabla' => 'tarifa_energia',
        'orden' => 'nombre_tarifa',
        'columnas' => [
            'proveedor', 'nombre_tarifa', 'tipo', 'segmento', 'descripcion',
            'precio_potencia_p1', 'precio_potencia_p2', 'precio_potencia_p3',
            'precio_potencia_p4', 'precio_potencia_p5', 'precio_potencia_p6',
            'precio_energia_p1', 'precio_energia_p2', 'precio_energia_p3',
            'precio_energia_p4', 'precio_energia_p5', 'precio_energia_p6',
            'termino_fijo_mensual', 'alquiler_equipo_dia',
            'comision_captacion', 'permanencia_meses', 'activo', 'destacada',
        ],
        'booleanos' => ['activo', 'destacada'],
        'numericos' => [
            'precio_potencia_p1', 'precio_potencia_p2', 'precio_potencia_p3',
            'precio_potencia_p4', 'precio_potencia_p5', 'precio_potencia_p6',
            'precio_energia_p1', 'precio_energia_p2', 'precio_energia_p3',
            'precio_energia_p4', 'precio_energia_p5', 'precio_energia_p6',
            'termino_fijo_mensual', 'alquiler_equipo_dia', 'comision_captacion',
        ],
        'enteros' => ['permanencia_meses'],
        'listas' => [],
    ],
    'telefonia' => [
        'tabla' => 'tarifa_telefonia',
        'orden' => 'nombre_tarifa',
        'columnas' => [
            'proveedor', 'nombre_tarifa', 'tipo', 'descripcion',
            'gb_datos', 'datos_ilimitados', 'llamadas_ilimitadas', 'minutos_incluidos',
            'velocidad_fibra_mb', 'lineas_moviles_incluidas', 'lineas_fijas_incluidas', 'extras',
            'precio_mensual', 'permanencia_meses', 'comision_captacion', 'activo', 'destacada',
        ],
        'booleanos' => ['activo', 'destacada', 'datos_ilimitados', 'llamadas_ilimitadas'],
        'numericos' => ['gb_datos', 'minutos_incluidos', 'velocidad_fibra_mb', 'precio_mensual', 'comision_captacion'],
        'enteros' => ['lineas_moviles_incluidas', 'lineas_fijas_incluidas', 'permanencia_meses'],
        'listas' => ['extras'],
    ],
    'alarmas' => [
        'tabla' => 'tarifa_alarmas',
        'orden' => 'nombre_kit',
        'columnas' => [
            'proveedor', 'nombre_kit', 'tipo_kit', 'descripcion', 'equipamiento',
            'num_camaras', 'num_sensores', 'num_mandos', 'conexion_movil', 'central_receptora',
            'cuota_mensual', 'coste_instalacion', 'permanencia_meses', 'comision_captacion',
            'activo', 'destacada',
        ],
        'booleanos' => ['activo', 'destacada', 'conexion_movil', 'central_receptora'],
        'numericos' => ['cuota_mensual', 'coste_instalacion', 'comision_captacion'],
        'enteros' => ['num_camaras', 'num_sensores', 'num_mandos', 'permanencia_meses'],
        'listas' => ['equipamiento'],
    ],
];

/**
 * Normaliza una fila leída de MySQL: castea booleanos (tinyint 0/1) a
 * bool real y campos numéricos/decimales a float/int, para que el JSON
 * devuelto al frontend tenga los mismos tipos que esperaba con Supabase.
 */
function icc_normalizar_fila(array $fila, array $definicion): array
{
    foreach ($definicion['booleanos'] as $campo) {
        if (array_key_exists($campo, $fila)) {
            $fila[$campo] = (bool) (int) $fila[$campo];
        }
    }
    foreach ($definicion['numericos'] as $campo) {
        if (array_key_exists($campo, $fila) && $fila[$campo] !== null) {
            $fila[$campo] = (float) $fila[$campo];
        }
    }
    foreach ($definicion['enteros'] as $campo) {
        if (array_key_exists($campo, $fila) && $fila[$campo] !== null) {
            $fila[$campo] = (int) $fila[$campo];
        }
    }
    if (array_key_exists('id', $fila)) {
        $fila['id'] = (int) $fila['id'];
    }
    foreach ($definicion['listas'] ?? [] as $campo) {
        if (array_key_exists($campo, $fila) && $fila[$campo] !== null && $fila[$campo] !== '') {
            $fila[$campo] = array_map('trim', explode(',', $fila[$campo]));
        } elseif (array_key_exists($campo, $fila)) {
            $fila[$campo] = [];
        }
    }
    return $fila;
}

/**
 * Prepara el valor de un campo "lista" (array JS, ej. `extras` o
 * `equipamiento`) para guardarlo como texto separado por comas en MySQL.
 */
function icc_serializar_lista($valor): ?string
{
    if (is_array($valor)) {
        return implode(',', array_map('trim', $valor));
    }
    return $valor === null ? null : (string) $valor;
}
