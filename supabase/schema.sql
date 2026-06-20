create extension if not exists pgcrypto;

create type public.lead_stage as enum (
  'lead',
  'qualified',
  'proposal',
  'negotiation',
  'closed_won',
  'lost'
);

create type public.milestone_status as enum (
  'planned',
  'in_progress',
  'at_risk',
  'ready_to_invoice',
  'done'
);

create type public.invoice_status as enum (
  'draft',
  'pending',
  'approved',
  'paid',
  'void'
);

create type public.partner_status as enum (
  'available',
  'busy',
  'reserved',
  'inactive'
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  contact_name text,
  owner text,
  stage public.lead_stage not null default 'lead',
  deal_value numeric(14, 2) not null default 0 check (deal_value >= 0),
  next_step text,
  close_date date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client text,
  owner text,
  budget numeric(14, 2) not null default 0 check (budget >= 0),
  status text not null default 'active',
  start_date date,
  due_date date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  status public.milestone_status not null default 'planned',
  progress integer not null default 0 check (progress between 0 and 100),
  due_date date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  skills text[] not null default '{}',
  daily_rate numeric(12, 2) not null default 0 check (daily_rate >= 0),
  availability public.partner_status not null default 'available',
  email text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.allocations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  partner_id uuid not null references public.partners(id) on delete cascade,
  role text,
  allocation_percent integer not null default 50 check (allocation_percent between 0 and 100),
  starts_on date,
  ends_on date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (project_id, partner_id)
);

create table public.invoices (
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

create table public.assets (
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

create table public.automation_events (
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

create trigger leads_set_updated_at before update on public.leads
  for each row execute function public.set_updated_at();
create trigger projects_set_updated_at before update on public.projects
  for each row execute function public.set_updated_at();
create trigger milestones_set_updated_at before update on public.milestones
  for each row execute function public.set_updated_at();
create trigger partners_set_updated_at before update on public.partners
  for each row execute function public.set_updated_at();
create trigger invoices_set_updated_at before update on public.invoices
  for each row execute function public.set_updated_at();
create trigger assets_set_updated_at before update on public.assets
  for each row execute function public.set_updated_at();

create index leads_stage_idx on public.leads (stage);
create index leads_close_date_idx on public.leads (close_date);
create index projects_status_idx on public.projects (status);
create index milestones_project_id_idx on public.milestones (project_id);
create index milestones_status_idx on public.milestones (status);
create index partners_availability_idx on public.partners (availability);
create index allocations_project_partner_idx on public.allocations (project_id, partner_id);
create index invoices_status_idx on public.invoices (status);
create index invoices_due_date_idx on public.invoices (due_date);
create index assets_asset_type_idx on public.assets (asset_type);
create index automation_events_created_at_idx on public.automation_events (created_at desc);

alter table public.leads enable row level security;
alter table public.projects enable row level security;
alter table public.milestones enable row level security;
alter table public.partners enable row level security;
alter table public.allocations enable row level security;
alter table public.invoices enable row level security;
alter table public.assets enable row level security;
alter table public.automation_events enable row level security;

create policy "authenticated users can read leads" on public.leads
  for select to authenticated using (true);
create policy "authenticated users can write leads" on public.leads
  for all to authenticated using (true) with check (true);

create policy "authenticated users can read projects" on public.projects
  for select to authenticated using (true);
create policy "authenticated users can write projects" on public.projects
  for all to authenticated using (true) with check (true);

create policy "authenticated users can read milestones" on public.milestones
  for select to authenticated using (true);
create policy "authenticated users can write milestones" on public.milestones
  for all to authenticated using (true) with check (true);

create policy "authenticated users can read partners" on public.partners
  for select to authenticated using (true);
create policy "authenticated users can write partners" on public.partners
  for all to authenticated using (true) with check (true);

create policy "authenticated users can read allocations" on public.allocations
  for select to authenticated using (true);
create policy "authenticated users can write allocations" on public.allocations
  for all to authenticated using (true) with check (true);

create policy "authenticated users can read invoices" on public.invoices
  for select to authenticated using (true);
create policy "authenticated users can write invoices" on public.invoices
  for all to authenticated using (true) with check (true);

create policy "authenticated users can read assets" on public.assets
  for select to authenticated using (true);
create policy "authenticated users can write assets" on public.assets
  for all to authenticated using (true) with check (true);

create policy "authenticated users can read automation events" on public.automation_events
  for select to authenticated using (true);
create policy "authenticated users can write automation events" on public.automation_events
  for all to authenticated using (true) with check (true);
