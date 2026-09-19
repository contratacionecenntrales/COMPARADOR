# Comparador y Auditor Inteligente — Integral Connection Consulting

Aplicación web para auditar la factura actual de un cliente (Energía, Telefonía o
Alarmas) y generar, en minutos, una comparativa de ahorro frente a las tarifas de
**Integral Connection Consulting**, con informe descargable en PDF.

## Stack

- **Frontend:** React 18 + Vite + Tailwind CSS + React Router
- **Backend/BD:** Supabase (PostgreSQL + Auth + Row Level Security)
- **PDF:** jsPDF + jspdf-autotable

## Estructura del proyecto

```
supabase/migrations/       Esquema SQL + datos semilla de tarifas
src/lib/                   Cliente Supabase, capa de datos, motor de cálculo, PDF
  calculations/             energy.js · telephony.js · alarms.js (lógica pura)
  auditEngine.js            Orquesta la comparación según el sector elegido
  fallbackData.js           Catálogo local de respaldo (modo demo sin Supabase)
src/context/AuditContext.jsx Estado del asistente (wizard) compartido entre pasos
src/components/
  layout/                   Header, Footer (marca, teléfono, contacto)
  wizard/                   Selector de sector y formularios de factura actual
  results/                  Informe de auditoría (hero de ahorro + desgloses)
  admin/                    Panel interno: CRUD de tarifas + histórico
src/pages/                  HomePage · WizardPage · ResultsPage · AdminPage
```

## Puesta en marcha

```bash
npm install
cp .env.example .env   # y rellena tus credenciales de Supabase
npm run dev
```

Si no configuras `.env`, la app funciona igualmente en **modo demo**: usa un
catálogo de tarifas local (`src/lib/fallbackData.js`) idéntico a la semilla SQL,
para que el comparador sea 100% funcional desde el primer arranque. Verás un
aviso ámbar en la interfaz indicándolo.

## Configurar Supabase (producción)

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En **SQL Editor**, ejecuta en orden:
   - `supabase/migrations/0001_schema.sql` (tablas, RLS, funciones)
   - `supabase/migrations/0002_seed.sql` (tarifas iniciales de mercado)
3. Copia la URL del proyecto y la `anon public key` (Project Settings → API) a tu
   `.env`:
   ```
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   ```
4. **Crea un usuario administrador** para el Panel interno:
   - En **Authentication → Users**, crea un usuario con email/contraseña.
   - En **Table Editor → perfiles**, inserta una fila con `id` = el UUID de ese
     usuario y `rol` = `admin`. Esto le da acceso a editar tarifas (protegido
     por RLS: solo usuarios con fila en `perfiles` pueden escribir en los
     catálogos).
5. Reinicia `npm run dev`. El aviso de modo demo desaparecerá.

## Datos de contacto de la empresa

Se muestran en el header, footer y en el PDF generado. Edítalos en `.env`:

```
VITE_COMPANY_NAME="Integral Connection Consulting"
VITE_COMPANY_PHONE="+34 900 000 000"
VITE_COMPANY_EMAIL="info@integralconnectionconsulting.com"
VITE_COMPANY_WHATSAPP="+34 600 000 000"
```

## Panel de Configuración (Admin)

Ruta `/admin`. Tras iniciar sesión con un usuario con perfil `admin`, el equipo
de Integral Connection Consulting puede:

- Editar cualquier precio, peaje, término fijo/variable o comisión de los
  catálogos de **energía** (luz 2.0TD/3.0TD, gas RL.1/RL.2), **telefonía**
  (móvil, fibra, convergentes, centralita) y **alarmas** (kits de seguridad),
  sin tocar código.
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

Los precios de la semilla (`0002_seed.sql`) están basados en peajes regulados
2026 y ofertas de mercado observadas en septiembre de 2026; revísalos
periódicamente desde el Panel de Administración.

## Scripts

```bash
npm run dev       # servidor de desarrollo
npm run build     # build de producción (dist/)
npm run preview   # sirve el build de producción localmente
```
