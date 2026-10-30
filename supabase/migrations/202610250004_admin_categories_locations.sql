create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text not null default '📍',
  status text not null default 'Aktif',
  created_at timestamptz not null default now()
);

alter table public.categories add column if not exists name text not null default '';
alter table public.categories add column if not exists icon text not null default '📍';
alter table public.categories add column if not exists status text not null default 'Aktif';
alter table public.categories add column if not exists created_at timestamptz not null default now();

alter table public.categories enable row level security;

drop policy if exists "Authenticated users can read categories" on public.categories;
create policy "Authenticated users can read categories"
  on public.categories for select to authenticated
  using (true);

drop policy if exists "Management can manage categories" on public.categories;
create policy "Management can manage categories"
  on public.categories for all to authenticated
  using ((select public.is_management_user()))
  with check ((select public.is_management_user()));

grant select on public.categories to authenticated;
grant insert, update, delete on public.categories to authenticated;

create or replace view public.report_location_summary
with (security_invoker = true)
as
select
  address,
  district,
  latitude,
  longitude,
  count(*)::bigint as report_count
from public.reports
where nullif(trim(coalesce(address, '')), '') is not null
   or nullif(trim(coalesce(district, '')), '') is not null
group by address, district, latitude, longitude;

grant select on public.report_location_summary to authenticated;
