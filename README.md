# Comparador y Auditor Inteligente — Integral Connection Consulting

Aplicación web para auditar la factura actual de un cliente (Energía, Telefonía o
Alarmas) y generar, en minutos, una comparativa de ahorro frente a las tarifas de
**Integral Connection Consulting**, con informe descargable en PDF.

Preparada para desplegarse en **hosting compartido Hostalia** (Apache + PHP +
MySQL, administrable desde phpMyAdmin) — sin dependencias de servicios en la
nube de terceros.

## Stack

- **Frontend:** React 18 + Vite + Tailwind CSS + React Router (se compila a
  HTML/CSS/JS estático).
- **Backend:** API REST en **PHP puro** (sin frameworks ni Composer, máxima
  compatibilidad con hosting compartido), en la carpeta `api/`.
- **Base de datos:** **MySQL/MariaDB**, gestionable desde **phpMyAdmin** (panel
  de Hostalia). Esquema en `sql/schema.sql` + datos iniciales en `sql/seed.sql`.
- **PDF:** jsPDF + jspdf-autotable (se genera en el navegador del cliente).

## Estructura del proyecto

```
sql/
  schema.sql                Tablas (importar primero desde phpMyAdmin)
  seed.sql                  Tarifas iniciales + usuario admin (importar después)
api/                         Backend PHP (sube esta carpeta tal cual a Hostalia)
  config.example.php         Plantilla de credenciales MySQL → copiar a config.php
  db.php                     Conexión PDO
  _bootstrap.php             Sesión, cabeceras JSON, manejo de errores
  _catalogos.php             Definición de columnas editables por catálogo
  auth.php                   Login / logout / sesión del Panel de Administración
  tarifas.php                CRUD de tarifas (energia / telefonia / alarmas)
  auditorias.php             Guardar y listar auditorías generadas
  ping.php                   Comprobación de salud (usada por el frontend)
  tools/generar_hash.php     Utilidad para generar contraseñas de admin
  .htaccess                  Bloquea el acceso directo a config.php y helpers
public/.htaccess              Enrutado SPA para Apache (se copia a dist/ en el build)
src/lib/
  apiClient.js                Cliente fetch hacia /api/*.php
  dataService.js              Listar/crear/editar/borrar tarifas y auditorías
  authService.js              Login/logout/sesión del panel
  calculations/               energy.js · telephony.js · alarms.js (lógica pura)
  auditEngine.js              Orquesta la comparación según el sector elegido
  fallbackData.js             Catálogo local de respaldo (si la API no responde)
src/context/AuditContext.jsx  Estado del asistente (wizard) compartido entre pasos
src/components/
  layout/                     Header, Footer (marca, teléfono, contacto)
  wizard/                     Selector de sector y formularios de factura actual
  results/                    Informe de auditoría (hero de ahorro + desgloses)
  admin/                      Panel interno: CRUD de tarifas + histórico
src/pages/                    HomePage · WizardPage · ResultsPage · AdminPage
```

## Desarrollo local

Necesitas Node.js, PHP (con `pdo_mysql`) y un servidor MySQL/MariaDB local.

```bash
npm install
cp .env.example .env                 # datos de contacto (opcionales)
cp api/config.example.php api/config.php   # y rellena tus credenciales MySQL locales
```

Importa el esquema y la semilla en tu MySQL local (o vía phpMyAdmin/Adminer si
lo prefieres):

```bash
mysql -u root -p tu_bd_local < sql/schema.sql
mysql -u root -p tu_bd_local < sql/seed.sql
```

Levanta el backend PHP y el frontend en dos terminales:

```bash
# Terminal 1 — API PHP (Vite la proxya automáticamente en /api)
php -S localhost:8080 -t api

# Terminal 2 — frontend
npm run dev
```

Abre `http://localhost:5173`. Si no hay ningún backend PHP corriendo, la app
sigue funcionando en **modo demo** con un catálogo de tarifas local
(`src/lib/fallbackData.js`) y lo indica con un aviso ámbar en la interfaz.

## Desplegar en Hostalia

### 1. Crear la base de datos MySQL

En el panel de Hostalia, crea una base de datos MySQL y un usuario con acceso
total a ella (o usa la que ya tengas). Apunta el host, nombre, usuario y
contraseña — los pedirás en el paso 4.

### 2. Importar el esquema desde phpMyAdmin

Entra en phpMyAdmin (enlace disponible desde el panel de Hostalia), selecciona
tu base de datos y en la pestaña **Importar**:

1. Sube y ejecuta `sql/schema.sql` (crea las tablas).
2. Sube y ejecuta `sql/seed.sql` (carga las tarifas iniciales y un usuario
   administrador de ejemplo).

El usuario admin de ejemplo es `admin@integralconnectionconsulting.com` con
contraseña `CambiaEstaClave123`. **Cámbiala antes de usar en producción**
(ver paso 5).

### 3. Compilar el frontend

```bash
npm install
npm run build
```

Esto genera la carpeta `dist/` con la web estática (incluye `.htaccess` para
el enrutado de React Router).

### 4. Subir los archivos (FTP o Administrador de Archivos de Hostalia)

Sube a la carpeta pública de tu hosting (normalmente `public_html/` o la que
tenga asignado tu dominio/subdominio):

- **Todo el contenido de `dist/`** → directamente en la raíz (`public_html/`).
- **La carpeta `api/`** → como `public_html/api/`.

Dentro de `public_html/api/`, crea `config.php` a partir de
`config.example.php` con las credenciales del paso 1:

```php
<?php
return [
    'db_host' => 'localhost',
    'db_name' => 'tu_base_de_datos',
    'db_user' => 'tu_usuario_mysql',
    'db_pass' => 'tu_contraseña_mysql',
    'db_charset' => 'utf8mb4',
    'session_name' => 'icc_admin_session',
];
```

`config.php` **no se sube desde tu repositorio** (está en `.gitignore`):
créalo directamente en el servidor (por FTP/SSH o editándolo desde el
Administrador de Archivos de Hostalia).

### 5. Cambiar la contraseña del administrador

Con acceso SSH (si tu plan lo incluye):

```bash
php api/tools/generar_hash.php "TuContraseñaSegura"
```

Copia el hash generado y actualízalo desde phpMyAdmin:

```sql
UPDATE admin_usuarios
SET password_hash = 'EL_HASH_GENERADO', email = 'tu_email@dominio.com'
WHERE id = 1;
```

Si no tienes SSH, quita temporalmente `api/tools/.htaccess`, abre
`https://tudominio.com/api/tools/generar_hash.php` en el navegador, genera el
hash, actualiza la fila en phpMyAdmin y **vuelve a restaurar el `.htaccess`
(o borra la carpeta `tools/`)** por seguridad.

### 6. Comprobar

- `https://tudominio.com/` → la web.
- `https://tudominio.com/api/ping.php` → debe responder `{"ok":true}`.
- `https://tudominio.com/admin` → login con tu usuario administrador.

Si ves el aviso ámbar de "modo demo", revisa `api/config.php` (credenciales)
y que el hosting tenga habilitada la extensión `pdo_mysql` (viene activada
por defecto en Hostalia).

## Datos de contacto de la empresa

Se muestran en el header, footer y en el PDF generado. Se configuran en build
time vía `.env` (o directamente en el panel de Hostalia si usas un pipeline
de CI; si no, edita `.env` antes de `npm run build`):

```
VITE_COMPANY_NAME="Integral Connection Consulting"
VITE_COMPANY_PHONE="+34 900 000 000"
VITE_COMPANY_EMAIL="info@integralconnectionconsulting.com"
VITE_COMPANY_WHATSAPP="+34 600 000 000"
```

## Panel de Configuración (Admin)

Ruta `/admin`. Tras iniciar sesión, el equipo de Integral Connection
Consulting puede:

- Editar cualquier precio, peaje, término fijo/variable o comisión de los
  catálogos de **energía** (luz 2.0TD/3.0TD, gas RL.1/RL.2), **telefonía**
  (móvil, fibra, convergentes, centralita) y **alarmas** (kits de seguridad),
  sin tocar código — directamente desde la tabla editable o desde phpMyAdmin.
- Añadir o eliminar tarifas, marcar cuáles están activas o destacadas.
- Consultar el histórico de auditorías generadas (`auditorias_clientes`).

## Motor de cálculo

- **Energía:** calcula el coste real de la factura (potencia + energía por
  periodos P1/P2/P3 + término fijo + alquiler de equipo + Impuesto Especial
  sobre la Electricidad + IVA) y lo compara con cada tarifa activa del
  segmento correspondiente, eligiendo la de menor coste anual.
- **Telefonía:** intenta primero un paquete convergente que cubra la fibra y
  las líneas móviles solicitadas; si ninguno cubre la necesidad completa,
  compone fibra + líneas móviles por separado.
- **Alarmas:** busca el kit con igual o mejor equipamiento (cámaras/sensores)
  al menor coste mensual.

Los precios de la semilla (`sql/seed.sql`) están basados en peajes regulados
2026 y ofertas de mercado observadas en septiembre de 2026; revísalos
periódicamente desde el Panel de Administración.

## Seguridad

- Las contraseñas de administrador se guardan con `password_hash` (bcrypt),
  nunca en texto plano.
- La sesión de administrador usa una cookie `httpOnly` (no accesible desde
  JavaScript) con `SameSite=Lax`, y `Secure` automáticamente si el sitio se
  sirve por HTTPS (recomendado en producción).
- Todos los endpoints de escritura (`POST`/`PUT`/`DELETE` en `tarifas.php`,
  listado en `auditorias.php`) requieren sesión de administrador válida.
- Las consultas SQL usan siempre sentencias preparadas (PDO) — no hay
  concatenación de datos de usuario en SQL.
- `api/.htaccess` bloquea el acceso HTTP directo a `config.php` y a los
  archivos internos (`_bootstrap.php`, `_catalogos.php`).

## Scripts

```bash
npm run dev       # servidor de desarrollo (frontend)
npm run build     # build de producción (dist/) para subir a Hostalia
npm run preview   # sirve el build de producción localmente
php -S localhost:8080 -t api   # servidor PHP local para desarrollo
```
