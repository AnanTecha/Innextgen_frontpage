do $$
begin
  if not exists (select 1 from pg_type where typname = 'invoice_status') then
    create type public.invoice_status as enum ('draft', 'pending', 'approved', 'paid', 'void');
  end if;
end
$$;

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_no text not null unique,
  project_id uuid references public.projects(id) on delete set null,
  client text not null,
  amount numeric(14, 2) not null default 0 check (amount >= 0),
  status public.invoice_status not null default 'draft',
  due_date date,
  requested_by text,
  approved_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  asset_type text not null,
  category text,
  url text,
  owner text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.automation_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  description text not null,
  source_table text,
  source_id uuid,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists invoices_set_updated_at on public.invoices;
create trigger invoices_set_updated_at before update on public.invoices
  for each row execute function public.set_updated_at();

drop trigger if exists assets_set_updated_at on public.assets;
create trigger assets_set_updated_at before update on public.assets
  for each row execute function public.set_updated_at();

create index if not exists invoices_status_idx on public.invoices (status);
create index if not exists invoices_due_date_idx on public.invoices (due_date);
create index if not exists assets_asset_type_idx on public.assets (asset_type);
create index if not exists automation_events_created_at_idx on public.automation_events (created_at desc);

alter table public.invoices enable row level security;
alter table public.assets enable row level security;
alter table public.automation_events enable row level security;

drop policy if exists "authenticated users can read invoices" on public.invoices;
create policy "authenticated users can read invoices" on public.invoices
  for select to authenticated using (true);

drop policy if exists "authenticated users can write invoices" on public.invoices;
create policy "authenticated users can write invoices" on public.invoices
  for all to authenticated using (true) with check (true);

drop policy if exists "authenticated users can read assets" on public.assets;
create policy "authenticated users can read assets" on public.assets
  for select to authenticated using (true);

drop policy if exists "authenticated users can write assets" on public.assets;
create policy "authenticated users can write assets" on public.assets
  for all to authenticated using (true) with check (true);

drop policy if exists "authenticated users can read automation events" on public.automation_events;
create policy "authenticated users can read automation events" on public.automation_events
  for select to authenticated using (true);

drop policy if exists "authenticated users can write automation events" on public.automation_events;
create policy "authenticated users can write automation events" on public.automation_events
  for all to authenticated using (true) with check (true);

notify pgrst, 'reload schema';
