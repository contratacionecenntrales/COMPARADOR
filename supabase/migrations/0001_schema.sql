-- ============================================================================
-- Integral Connection Consulting — Comparador y Auditor Inteligente
-- Migración 0001: esquema inicial
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Perfiles de usuario (para distinguir administradores del panel interno)
-- ----------------------------------------------------------------------------
create table if not exists public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text,
  rol text not null default 'admin' check (rol in ('admin', 'gestor')),
  created_at timestamptz not null default now()
);

alter table public.perfiles enable row level security;

create policy "perfiles_select_propio"
  on public.perfiles for select
  using (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- TARIFA_ENERGIA — luz (2.0TD / 3.0TD / 6.1TD) y gas (RL.1 / RL.2 / RL.3)
-- Estructura unificada con periodos P1-P6 para soportar cualquier peaje.
-- ----------------------------------------------------------------------------
create table if not exists public.tarifa_energia (
  id uuid primary key default gen_random_uuid(),
  proveedor text not null default 'Integral Connection Consulting',
  nombre_tarifa text not null,
  tipo text not null check (tipo in ('luz', 'gas')),
  segmento text not null, -- '2.0TD','3.0TD','6.1TD','RL.1','RL.2','RL.3'
  descripcion text,

  -- Potencia (€/kW/día) — solo aplica a luz
  precio_potencia_p1 numeric(10,6) default 0,
  precio_potencia_p2 numeric(10,6) default 0,
  precio_potencia_p3 numeric(10,6) default 0,
  precio_potencia_p4 numeric(10,6) default 0,
  precio_potencia_p5 numeric(10,6) default 0,
  precio_potencia_p6 numeric(10,6) default 0,

  -- Energía (€/kWh) — luz por periodos P1-P6; gas normalmente solo usa p1
  precio_energia_p1 numeric(10,6) not null default 0,
  precio_energia_p2 numeric(10,6) default 0,
  precio_energia_p3 numeric(10,6) default 0,
  precio_energia_p4 numeric(10,6) default 0,
  precio_energia_p5 numeric(10,6) default 0,
  precio_energia_p6 numeric(10,6) default 0,

  -- Cargos fijos adicionales
  termino_fijo_mensual numeric(10,4) default 0, -- cuota de servicio fija (gas / algunas de luz)
  alquiler_equipo_dia numeric(10,6) default 0,   -- alquiler contador €/día (luz)

  -- Comercial / comisiones (uso interno)
  comision_captacion numeric(10,2) default 0,
  permanencia_meses int default 0,

  activo boolean not null default true,
  destacada boolean not null default false, -- tarifa recomendada por defecto en comparativas
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tarifa_energia_tipo_segmento
  on public.tarifa_energia (tipo, segmento, activo);

-- ----------------------------------------------------------------------------
-- TARIFA_TELEFONIA — móvil, fibra, fijo y paquetes convergentes
-- ----------------------------------------------------------------------------
create table if not exists public.tarifa_telefonia (
  id uuid primary key default gen_random_uuid(),
  proveedor text not null default 'Integral Connection Consulting',
  nombre_tarifa text not null,
  tipo text not null check (tipo in ('movil', 'fibra', 'fijo', 'convergente', 'centralita')),
  descripcion text,

  gb_datos numeric(10,2),              -- null = ilimitado
  datos_ilimitados boolean default false,
  llamadas_ilimitadas boolean default true,
  minutos_incluidos numeric(10,2),     -- null si ilimitadas
  velocidad_fibra_mb numeric(10,2),
  lineas_moviles_incluidas int default 0,
  lineas_fijas_incluidas int default 0,
  extras text[],                        -- ej. {'Roaming UE','5G','Llamadas internacionales'}

  precio_mensual numeric(10,2) not null default 0,
  permanencia_meses int default 0,
  comision_captacion numeric(10,2) default 0,

  activo boolean not null default true,
  destacada boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tarifa_telefonia_tipo on public.tarifa_telefonia (tipo, activo);

-- ----------------------------------------------------------------------------
-- TARIFA_ALARMAS — kits de seguridad
-- ----------------------------------------------------------------------------
create table if not exists public.tarifa_alarmas (
  id uuid primary key default gen_random_uuid(),
  proveedor text not null default 'Integral Connection Consulting',
  nombre_kit text not null,
  tipo_kit text not null check (tipo_kit in ('basica', 'camaras', 'gama_alta', 'comercial')),
  descripcion text,

  num_camaras int default 0,
  num_sensores int default 0,
  num_mandos int default 0,
  conexion_movil boolean default true,   -- app móvil / conexión GPRS-IP
  central_receptora boolean default true, -- CRA 24h

  cuota_mensual numeric(10,2) not null default 0,
  coste_instalacion numeric(10,2) default 0,
  permanencia_meses int default 0,
  comision_captacion numeric(10,2) default 0,

  activo boolean not null default true,
  destacada boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tarifa_alarmas_tipo on public.tarifa_alarmas (tipo_kit, activo);

-- ----------------------------------------------------------------------------
-- AUDITORIAS_CLIENTES — histórico de comparativas generadas
-- ----------------------------------------------------------------------------
create table if not exists public.auditorias_clientes (
  id uuid primary key default gen_random_uuid(),
  sector text not null check (sector in ('energia', 'telefonia', 'alarmas', 'pack_integral')),

  cliente_nombre text,
  cliente_email text,
  cliente_telefono text,

  datos_entrada jsonb not null default '{}'::jsonb,  -- payload íntegro del formulario
  resultado jsonb not null default '{}'::jsonb,       -- desglose de coste actual vs propuesta

  coste_actual_anual numeric(12,2),
  coste_propuesto_anual numeric(12,2),
  ahorro_anual numeric(12,2),
  ahorro_porcentaje numeric(6,2),

  tarifa_actual_proveedor text,
  tarifa_propuesta_id uuid,

  gestor_email text,
  created_at timestamptz not null default now()
);

create index if not exists idx_auditorias_sector on public.auditorias_clientes (sector, created_at desc);

-- ----------------------------------------------------------------------------
-- Trigger genérico para mantener updated_at
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_tarifa_energia_updated_at on public.tarifa_energia;
create trigger trg_tarifa_energia_updated_at
  before update on public.tarifa_energia
  for each row execute function public.set_updated_at();

drop trigger if exists trg_tarifa_telefonia_updated_at on public.tarifa_telefonia;
create trigger trg_tarifa_telefonia_updated_at
  before update on public.tarifa_telefonia
  for each row execute function public.set_updated_at();

drop trigger if exists trg_tarifa_alarmas_updated_at on public.tarifa_alarmas;
create trigger trg_tarifa_alarmas_updated_at
  before update on public.tarifa_alarmas
  for each row execute function public.set_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- Lectura pública de tarifas activas (necesaria para el comparador sin login).
-- Escritura (insert/update/delete) restringida a usuarios autenticados con
-- perfil en `perfiles` (equipo interno de Integral Connection Consulting).
-- Las auditorías se pueden insertar públicamente (genera el propio cliente
-- final o el asesor comercial desde el asistente) pero solo el equipo interno
-- puede listarlas/leerlas.
-- ============================================================================

alter table public.tarifa_energia enable row level security;
alter table public.tarifa_telefonia enable row level security;
alter table public.tarifa_alarmas enable row level security;
alter table public.auditorias_clientes enable row level security;

create or replace function public.es_admin()
returns boolean as $$
  select exists (select 1 from public.perfiles where id = auth.uid());
$$ language sql stable security definer set search_path = public;

-- Lectura pública de catálogos activos
create policy "tarifa_energia_lectura_publica"
  on public.tarifa_energia for select
  using (activo = true or public.es_admin());

create policy "tarifa_telefonia_lectura_publica"
  on public.tarifa_telefonia for select
  using (activo = true or public.es_admin());

create policy "tarifa_alarmas_lectura_publica"
  on public.tarifa_alarmas for select
  using (activo = true or public.es_admin());

-- Escritura solo para administradores autenticados
create policy "tarifa_energia_escritura_admin"
  on public.tarifa_energia for all
  using (public.es_admin())
  with check (public.es_admin());

create policy "tarifa_telefonia_escritura_admin"
  on public.tarifa_telefonia for all
  using (public.es_admin())
  with check (public.es_admin());

create policy "tarifa_alarmas_escritura_admin"
  on public.tarifa_alarmas for all
  using (public.es_admin())
  with check (public.es_admin());

-- Auditorías: cualquiera puede crear (guardar el resultado de su comparativa)
create policy "auditorias_insert_publico"
  on public.auditorias_clientes for insert
  with check (true);

-- Pero solo el equipo interno puede leer el histórico completo
create policy "auditorias_lectura_admin"
  on public.auditorias_clientes for select
  using (public.es_admin());

create policy "auditorias_escritura_admin"
  on public.auditorias_clientes for update
  using (public.es_admin());

create policy "auditorias_borrado_admin"
  on public.auditorias_clientes for delete
  using (public.es_admin());
