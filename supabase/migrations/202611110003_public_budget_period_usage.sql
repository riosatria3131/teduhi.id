-- Publish only aggregated payout totals by month/year and island.
create table if not exists public.bpdlh_public_budget_period_usage (
  period_type text not null check (period_type in ('monthly', 'yearly')),
  period_start date not null,
  island text not null check (island in ('Sumatra', 'Kalimantan', 'Sulawesi', 'Jawa', 'Papua', 'Tidak terpetakan')),
  spent_total numeric not null default 0 check (spent_total >= 0),
  updated_at timestamptz not null default now(),
  primary key (period_type, period_start, island)
);

alter table public.bpdlh_public_budget_period_usage enable row level security;
drop policy if exists "Anyone can read public budget period totals" on public.bpdlh_public_budget_period_usage;
create policy "Anyone can read public budget period totals"
  on public.bpdlh_public_budget_period_usage for select to anon, authenticated
  using (true);

grant select on public.bpdlh_public_budget_period_usage to anon, authenticated;
revoke insert, update, delete, truncate, references, trigger
  on public.bpdlh_public_budget_period_usage from anon, authenticated;

create or replace function public.refresh_bpdlh_public_budget_period_usage()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.bpdlh_public_budget_period_usage;

  with categorized_payouts as (
    select
      payout.created_at,
      payout.amount,
      case
        when coalesce(report.address, '') || ' ' || coalesce(report.district, '') ~* '(sumatra|sumatera|aceh|lampung|bengkulu|jambi|riau|kepri|kepulauan riau|bangka belitung)' then 'Sumatra'
        when coalesce(report.address, '') || ' ' || coalesce(report.district, '') ~* '(kalimantan|pontianak|banjarmasin|samarinda|palangka raya|palangkaraya|tarakan|ketapang|kapuas|kota baru|kotabaru)' then 'Kalimantan'
        when coalesce(report.address, '') || ' ' || coalesce(report.district, '') ~* '(sulawesi|makassar|manado|gorontalo|palu|kendari|mamuju|bugis|minahasa)' then 'Sulawesi'
        when coalesce(report.address, '') || ' ' || coalesce(report.district, '') ~* '(jawa|jakarta|banten|serang|tangerang|bogor|depok|bekasi|bandung|garut|semarang|surakarta|yogyakarta|surabaya|malang|kediri|madiun|cirebon|tegal|cilacap|purwokerto|pekalongan|jepara|ponorogo)' then 'Jawa'
        when coalesce(report.address, '') || ' ' || coalesce(report.district, '') ~* '(papua|jayapura|merauke|sorong|manokwari|nabire|timika|biak|fakfak|mimika|keerom)' then 'Papua'
        else 'Tidak terpetakan'
      end as island
    from public.bpdlh_budget_payouts payout
    left join public.reports report on report.id = payout.application_id
  ), period_totals as (
    select 'monthly'::text as period_type, date_trunc('month', created_at)::date as period_start, island, sum(amount)::numeric as spent_total
    from categorized_payouts
    group by date_trunc('month', created_at)::date, island
    union all
    select 'yearly'::text as period_type, date_trunc('year', created_at)::date as period_start, island, sum(amount)::numeric as spent_total
    from categorized_payouts
    group by date_trunc('year', created_at)::date, island
  )
  insert into public.bpdlh_public_budget_period_usage (period_type, period_start, island, spent_total, updated_at)
  select period_type, period_start, island, spent_total, pg_catalog.now()
  from period_totals;
end;
$$;

revoke all on function public.refresh_bpdlh_public_budget_period_usage() from public;

create or replace function public.handle_bpdlh_public_budget_period_usage_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.refresh_bpdlh_public_budget_period_usage();
  return null;
end;
$$;

revoke all on function public.handle_bpdlh_public_budget_period_usage_change() from public;

drop trigger if exists refresh_bpdlh_public_budget_period_usage_from_payouts on public.bpdlh_budget_payouts;
create trigger refresh_bpdlh_public_budget_period_usage_from_payouts
  after insert or update or delete on public.bpdlh_budget_payouts
  for each statement execute function public.handle_bpdlh_public_budget_period_usage_change();

drop trigger if exists refresh_bpdlh_public_budget_period_usage_from_reports on public.reports;
create trigger refresh_bpdlh_public_budget_period_usage_from_reports
  after update of address, district on public.reports
  for each statement execute function public.handle_bpdlh_public_budget_period_usage_change();

select public.refresh_bpdlh_public_budget_period_usage();

do $$
begin
  if exists (select 1 from pg_catalog.pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_catalog.pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'bpdlh_public_budget_period_usage'
     ) then
    alter publication supabase_realtime add table public.bpdlh_public_budget_period_usage;
  end if;
end;
$$;
