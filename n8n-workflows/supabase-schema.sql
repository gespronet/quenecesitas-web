-- ====================================================================
-- Tabla `leads` para queNECESITAS
-- Diseñada para recibir submissions desde n8n y consultarse desde el CRM
-- ====================================================================

create table if not exists public.leads (
    id              uuid primary key default gen_random_uuid(),
    created_at      timestamptz       not null default now(),
    updated_at      timestamptz       not null default now(),

    -- Datos del lead
    nombre          text              not null,
    email           text              not null,
    telefono        text              not null,
    mensaje         text,

    -- Clasificación
    origen          text              not null,           -- home / alarmas / energia / telefonia / inmuebles / contacto
    sector          text              not null default 'general',  -- alarmas / energia / telefonia / inmuebles / general
    fuente          text              not null default 'web',      -- web / telefono / referido / etc.

    -- Estado del lead
    estado          text              not null default 'nuevo',    -- nuevo / contactado / cualificado / cerrado / descartado
    asignado_a      uuid,                                          -- id del comercial asignado (FK a tu tabla users si la tienes)
    notas           text,

    -- Metadatos
    url_origen      text,
    user_agent      text,
    ip              inet
);

create index if not exists idx_leads_created_at on public.leads (created_at desc);
create index if not exists idx_leads_estado     on public.leads (estado);
create index if not exists idx_leads_sector     on public.leads (sector);
create index if not exists idx_leads_origen     on public.leads (origen);
create index if not exists idx_leads_email      on public.leads (email);

-- updated_at automático
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists trg_leads_updated_at on public.leads;
create trigger trg_leads_updated_at
    before update on public.leads
    for each row
    execute function public.set_updated_at();

-- ====================================================================
-- Row Level Security
-- ====================================================================
alter table public.leads enable row level security;

-- Lectura: solo usuarios autenticados (los comerciales del CRM)
drop policy if exists "leads_select_authenticated" on public.leads;
create policy "leads_select_authenticated"
on public.leads
for select
to authenticated
using (true);

-- Update: solo usuarios autenticados
drop policy if exists "leads_update_authenticated" on public.leads;
create policy "leads_update_authenticated"
on public.leads
for update
to authenticated
using (true)
with check (true);

-- Inserts: ninguno desde el cliente (anon).
-- n8n usa la SERVICE ROLE key, que bypassa RLS, así que no hace falta política.

-- ====================================================================
-- (Opcional) Vista agregada para dashboard del CRM
-- ====================================================================
create or replace view public.leads_resumen as
select
    sector,
    estado,
    count(*)            as total,
    count(*) filter (where created_at > now() - interval '7 days')  as ultimos_7d,
    count(*) filter (where created_at > now() - interval '30 days') as ultimos_30d
from public.leads
group by sector, estado;

grant select on public.leads_resumen to authenticated;
