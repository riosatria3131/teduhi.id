-- Publish only aggregate budget totals; never expose individual allocations or payouts.
create table if not exists public.bpdlh_public_budget_summary (
  singleton boolean primary key default true check (singleton = true),
  allocated_total numeric not null default 0 check (allocated_total >= 0),
  spent_total numeric not null default 0 check (spent_total >= 0),
  updated_at timestamptz not null default now()
);

alter table public.bpdlh_public_budget_summary enable row level security;

drop policy if exists "Anyone can read public budget summary"
  on public.bpdlh_public_budget_summary;
create policy "Anyone can read public budget summary"
  on public.bpdlh_public_budget_summary
  for select to anon, authenticated
  using (singleton = true);

grant select on public.bpdlh_public_budget_summary to anon, authenticated;
revoke insert, update, delete, truncate, references, trigger
  on public.bpdlh_public_budget_summary from anon, authenticated;

create or replace function public.refresh_bpdlh_public_budget_summary()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.bpdlh_public_budget_summary (
    singleton, allocated_total, spent_total, updated_at
  )
  select
    true,
    coalesce(sum(budget), 0),
    coalesce(sum(spent), 0),
    pg_catalog.now()
  from public.bpdlh_budget_allocations
  on conflict (singleton) do update
    set allocated_total = excluded.allocated_total,
        spent_total = excluded.spent_total,
        updated_at = excluded.updated_at;

  return null;
end;
$$;

revoke all on function public.refresh_bpdlh_public_budget_summary() from public;

drop trigger if exists refresh_bpdlh_public_budget_summary
  on public.bpdlh_budget_allocations;
create trigger refresh_bpdlh_public_budget_summary
  after insert or update or delete on public.bpdlh_budget_allocations
  for each statement execute function public.refresh_bpdlh_public_budget_summary();

insert into public.bpdlh_public_budget_summary (
  singleton, allocated_total, spent_total, updated_at
)
select true, coalesce(sum(budget), 0), coalesce(sum(spent), 0), pg_catalog.now()
from public.bpdlh_budget_allocations
on conflict (singleton) do update
  set allocated_total = excluded.allocated_total,
      spent_total = excluded.spent_total,
      updated_at = excluded.updated_at;

do $$
begin
  if exists (select 1 from pg_catalog.pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_catalog.pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'bpdlh_public_budget_summary'
     ) then
    alter publication supabase_realtime add table public.bpdlh_public_budget_summary;
  end if;
end;
$$;
