-- Publish only aggregate payout totals grouped by island.
create table if not exists public.bpdlh_public_budget_island_usage (
  island text primary key check (island in ('Sumatra', 'Kalimantan', 'Sulawesi', 'Jawa', 'Papua', 'Tidak terpetakan')),
  spent_total numeric not null default 0 check (spent_total >= 0),
  updated_at timestamptz not null default now()
);

alter table public.bpdlh_public_budget_island_usage enable row level security;

drop policy if exists "Anyone can read public budget island totals"
  on public.bpdlh_public_budget_island_usage;
create policy "Anyone can read public budget island totals"
  on public.bpdlh_public_budget_island_usage
  for select to anon, authenticated
  using (true);

grant select on public.bpdlh_public_budget_island_usage to anon, authenticated;
revoke insert, update, delete, truncate, references, trigger
  on public.bpdlh_public_budget_island_usage from anon, authenticated;

create or replace function public.refresh_bpdlh_public_budget_island_usage()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  with island_names(island) as (
    values ('Sumatra'), ('Kalimantan'), ('Sulawesi'), ('Jawa'), ('Papua'), ('Tidak terpetakan')
  ), categorized_payouts as (
    select
      case
        when coalesce(report.address, '') || ' ' || coalesce(report.district, '') ~* '(sumatra|sumatera|aceh|lampung|bengkulu|jambi|riau|kepri|kepulauan riau|bangka belitung)' then 'Sumatra'
        when coalesce(report.address, '') || ' ' || coalesce(report.district, '') ~* '(kalimantan|pontianak|banjarmasin|samarinda|palangka raya|palangkaraya|tarakan|ketapang|kapuas|kota baru|kotabaru)' then 'Kalimantan'
        when coalesce(report.address, '') || ' ' || coalesce(report.district, '') ~* '(sulawesi|makassar|manado|gorontalo|palu|kendari|mamuju|bugis|minahasa)' then 'Sulawesi'
        when coalesce(report.address, '') || ' ' || coalesce(report.district, '') ~* '(jawa|jakarta|banten|serang|tangerang|bogor|depok|bekasi|bandung|garut|semarang|surakarta|yogyakarta|surabaya|malang|kediri|madiun|cirebon|tegal|cilacap|purwokerto|pekalongan|jepara|ponorogo)' then 'Jawa'
        when coalesce(report.address, '') || ' ' || coalesce(report.district, '') ~* '(papua|jayapura|merauke|sorong|manokwari|nabire|timika|biak|fakfak|mimika|keerom)' then 'Papua'
        else 'Tidak terpetakan'
      end as island,
      payout.amount
    from public.bpdlh_budget_payouts payout
    left join public.reports report on report.id = payout.application_id
  ), usage_by_island as (
    select island, sum(amount)::numeric as spent_total
    from categorized_payouts
    group by island
  )
  insert into public.bpdlh_public_budget_island_usage (island, spent_total, updated_at)
  select island_names.island, coalesce(usage_by_island.spent_total, 0), pg_catalog.now()
  from island_names
  left join usage_by_island using (island)
  on conflict (island) do update
    set spent_total = excluded.spent_total,
        updated_at = excluded.updated_at;

end;
$$;

revoke all on function public.refresh_bpdlh_public_budget_island_usage() from public;

create or replace function public.handle_bpdlh_public_budget_island_usage_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.refresh_bpdlh_public_budget_island_usage();
  return null;
end;
$$;

revoke all on function public.handle_bpdlh_public_budget_island_usage_change() from public;

drop trigger if exists refresh_bpdlh_public_budget_island_usage_from_payouts
  on public.bpdlh_budget_payouts;
create trigger refresh_bpdlh_public_budget_island_usage_from_payouts
  after insert or update or delete on public.bpdlh_budget_payouts
  for each statement execute function public.handle_bpdlh_public_budget_island_usage_change();

drop trigger if exists refresh_bpdlh_public_budget_island_usage_from_reports
  on public.reports;
create trigger refresh_bpdlh_public_budget_island_usage_from_reports
  after update of address, district on public.reports
  for each statement execute function public.handle_bpdlh_public_budget_island_usage_change();

-- Seed aggregate values for transactions already recorded.
insert into public.bpdlh_public_budget_island_usage (island, spent_total, updated_at)
values
  ('Sumatra', 0, pg_catalog.now()),
  ('Kalimantan', 0, pg_catalog.now()),
  ('Sulawesi', 0, pg_catalog.now()),
  ('Jawa', 0, pg_catalog.now()),
  ('Papua', 0, pg_catalog.now()),
  ('Tidak terpetakan', 0, pg_catalog.now())
on conflict (island) do nothing;

select public.refresh_bpdlh_public_budget_island_usage();

do $$
begin
  if exists (select 1 from pg_catalog.pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_catalog.pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'bpdlh_public_budget_island_usage'
     ) then
    alter publication supabase_realtime add table public.bpdlh_public_budget_island_usage;
  end if;
end;
$$;
