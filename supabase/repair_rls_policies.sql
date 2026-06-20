grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

alter default privileges in schema public
grant select, insert, update, delete on tables to authenticated;

alter default privileges in schema public
grant usage, select on sequences to authenticated;

alter table if exists public.leads enable row level security;
alter table if exists public.projects enable row level security;
alter table if exists public.milestones enable row level security;
alter table if exists public.partners enable row level security;
alter table if exists public.allocations enable row level security;
alter table if exists public.invoices enable row level security;
alter table if exists public.assets enable row level security;
alter table if exists public.automation_events enable row level security;

drop policy if exists "authenticated users can read leads" on public.leads;
create policy "authenticated users can read leads" on public.leads
  for select to authenticated using (true);
drop policy if exists "authenticated users can write leads" on public.leads;
create policy "authenticated users can write leads" on public.leads
  for all to authenticated using (true) with check (true);

drop policy if exists "authenticated users can read projects" on public.projects;
create policy "authenticated users can read projects" on public.projects
  for select to authenticated using (true);
drop policy if exists "authenticated users can write projects" on public.projects;
create policy "authenticated users can write projects" on public.projects
  for all to authenticated using (true) with check (true);

drop policy if exists "authenticated users can read milestones" on public.milestones;
create policy "authenticated users can read milestones" on public.milestones
  for select to authenticated using (true);
drop policy if exists "authenticated users can write milestones" on public.milestones;
create policy "authenticated users can write milestones" on public.milestones
  for all to authenticated using (true) with check (true);

drop policy if exists "authenticated users can read partners" on public.partners;
create policy "authenticated users can read partners" on public.partners
  for select to authenticated using (true);
drop policy if exists "authenticated users can write partners" on public.partners;
create policy "authenticated users can write partners" on public.partners
  for all to authenticated using (true) with check (true);

drop policy if exists "authenticated users can read allocations" on public.allocations;
create policy "authenticated users can read allocations" on public.allocations
  for select to authenticated using (true);
drop policy if exists "authenticated users can write allocations" on public.allocations;
create policy "authenticated users can write allocations" on public.allocations
  for all to authenticated using (true) with check (true);

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
