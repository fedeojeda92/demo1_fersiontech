-- Ejecutar una sola vez en el SQL Editor de Supabase (o via `supabase db push`).
-- Fase 1: un solo tenant (FS Inmobiliaria), pero el modelo ya queda listo para multi-tenant.

create extension if not exists "pgcrypto";

create table tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz not null default now()
);

create table agents (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid not null references tenants(id),
  full_name text,
  role text not null default 'agent' check (role in ('admin', 'agent')),
  whatsapp_number text,
  created_at timestamptz not null default now()
);

create table properties (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  slug text not null,
  operation text not null check (operation in ('venta', 'alquiler')),
  type text not null check (type in ('departamento', 'casa', 'ph', 'terreno', 'oficina', 'local')),
  zone text not null,
  address text not null,
  price numeric not null,
  currency text not null check (currency in ('USD', 'ARS')),
  bedrooms int not null default 0,
  bathrooms int not null default 0,
  area numeric not null default 0,
  garage int not null default 0,
  year int,
  featured boolean not null default false,
  has_virtual_tour boolean not null default false,
  has_drone_video boolean not null default false,
  title jsonb not null,        -- { es, en, ru }
  description jsonb not null,  -- { es, en, ru }
  features text[] not null default '{}',
  images text[] not null default '{}',
  video_url text,
  tour_url text,
  tour_360 jsonb,               -- { firstScene, sceneLabels, scenes } tal cual la interfaz Tour360
  lat numeric,
  lng numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  property_id uuid references properties(id) on delete set null,
  source text not null check (source in ('turno', 'contacto')),
  name text not null,
  email text not null,
  phone text,
  message text,
  appointment_date date,
  appointment_time text,
  status text not null default 'nuevo' check (status in ('nuevo', 'contactado', 'cerrado')),
  created_at timestamptz not null default now()
);

create table property_views (
  id bigint generated always as identity primary key,
  tenant_id uuid not null references tenants(id),
  property_id uuid not null references properties(id) on delete cascade,
  locale text,
  referrer text,
  session_id text,
  created_at timestamptz not null default now()
);

create index properties_tenant_idx on properties(tenant_id);
create index properties_featured_idx on properties(tenant_id, featured);
create index leads_tenant_idx on leads(tenant_id, created_at desc);
create index property_views_property_idx on property_views(property_id);

-- Auto-crea la fila de agents cuando se registra un usuario en Supabase Auth,
-- asignandolo al primer (unico, en fase 1) tenant existente con rol 'agent'.
-- Ajustar el rol a 'admin' a mano para el primer usuario real desde el SQL editor.
create or replace function public.handle_new_agent()
returns trigger as $function$
begin
  insert into public.agents (id, tenant_id, full_name, role)
  values (
    new.id,
    (select id from public.tenants order by created_at asc limit 1),
    new.raw_user_meta_data ->> 'full_name',
    'agent'
  );
  return new;
end;
$function$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_agent();

-- Helper para evitar recursion infinita en las policies de abajo: una policy sobre
-- `agents` que vuelve a consultar `agents` para saber el tenant del usuario logueado
-- dispara la misma policy de nuevo (error 42P17 "infinite recursion"). security definer
-- hace que esta funcion corra sin pasar por RLS.
create or replace function public.current_agent_tenant_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $function$
  select tenant_id from public.agents where id = auth.uid()
$function$;

-- Row Level Security

alter table tenants enable row level security;
alter table agents enable row level security;
alter table properties enable row level security;
alter table leads enable row level security;
alter table property_views enable row level security;

-- tenants: lectura publica (el sitio publico necesita resolver el tenant por slug sin login)
create policy "public can read tenants" on tenants
  for select using (true);

-- agents: cada agente puede leer las de su propio tenant
create policy "agents can read own tenant agents" on agents
  for select using (tenant_id = public.current_agent_tenant_id());

-- properties: lectura publica (sitio publico), escritura solo agentes del mismo tenant
create policy "public can read properties" on properties
  for select using (true);

create policy "agents can insert own tenant properties" on properties
  for insert with check (tenant_id = public.current_agent_tenant_id());

create policy "agents can update own tenant properties" on properties
  for update using (tenant_id = public.current_agent_tenant_id());

create policy "agents can delete own tenant properties" on properties
  for delete using (tenant_id = public.current_agent_tenant_id());

-- leads: insert publico (formularios anonimos), lectura/escritura solo agentes del tenant
create policy "public can create leads" on leads
  for insert with check (true);

create policy "agents can read own tenant leads" on leads
  for select using (tenant_id = public.current_agent_tenant_id());

create policy "agents can update own tenant leads" on leads
  for update using (tenant_id = public.current_agent_tenant_id());

-- property_views: insert publico (tracking anonimo), lectura solo agentes del tenant
create policy "public can create property views" on property_views
  for insert with check (true);

create policy "agents can read own tenant property views" on property_views
  for select using (tenant_id = public.current_agent_tenant_id());

-- Seed del tenant unico de Fase 1 (ajustar el slug/nombre si hace falta).
insert into tenants (name, slug) values ('FS Inmobiliaria', 'fs-inmobiliaria')
  on conflict (slug) do nothing;

-- Integracion Google Calendar (OAuth): cada agente puede conectar su cuenta de Google para
-- que los turnos agendados creen el evento automaticamente en su calendario, con notificacion
-- push nativa de Google Calendar (reemplaza/complementa el feed .ics de solo lectura).
alter table agents add column if not exists google_refresh_token text;
alter table agents add column if not exists google_email text;
alter table agents add column if not exists google_connected_at timestamptz;

-- No existia ninguna policy de UPDATE sobre `agents` (solo de SELECT) — hace falta para que
-- el propio agente pueda guardar/borrar su refresh_token de Google (conectar/desconectar).
drop policy if exists "agents can update own row" on agents;
create policy "agents can update own row" on agents
  for update using (id = auth.uid());

-- Storage: bucket publico de lectura para imagenes de propiedades.
-- Ejecutar aparte (Storage no soporta `create table`): desde el dashboard,
-- Storage -> New bucket -> nombre "property-images" -> Public bucket = true.
-- Luego correr esta policy para permitir upload solo a agentes autenticados:
--
-- create policy "agents can upload property images" on storage.objects
--   for insert with check (bucket_id = 'property-images' and auth.role() = 'authenticated');
-- create policy "public can read property images" on storage.objects
--   for select using (bucket_id = 'property-images');
