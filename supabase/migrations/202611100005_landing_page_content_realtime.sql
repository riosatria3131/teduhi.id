-- Shared landing-page content settings with realtime updates.
-- Public users can read the content; only active main admins can update it.
create table if not exists public.landing_page_content (
  singleton boolean primary key default true check (singleton = true),
  content jsonb not null default '{}'::jsonb
    check (jsonb_typeof(content) = 'object'),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.landing_page_content enable row level security;

drop policy if exists "Public can read landing page content"
  on public.landing_page_content;
create policy "Public can read landing page content"
  on public.landing_page_content
  for select to anon, authenticated
  using (true);

drop policy if exists "Active main admins can update landing page content"
  on public.landing_page_content;
create policy "Active main admins can update landing page content"
  on public.landing_page_content
  for update to authenticated
  using (
    (select public.is_main_admin())
    and (select public.is_active_user())
  )
  with check (
    (select public.is_main_admin())
    and (select public.is_active_user())
  );

grant select on public.landing_page_content to anon, authenticated;
grant update on public.landing_page_content to authenticated;

create or replace function public.set_landing_page_content_metadata()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := (select auth.uid());
  return new;
end;
$$;

revoke all on function public.set_landing_page_content_metadata() from public;

drop trigger if exists set_landing_page_content_metadata
  on public.landing_page_content;
create trigger set_landing_page_content_metadata
  before update on public.landing_page_content
  for each row execute function public.set_landing_page_content_metadata();

insert into public.landing_page_content (singleton, content)
values (true, '{}'::jsonb)
on conflict (singleton) do nothing;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'landing_page_content'
  ) then
    alter publication supabase_realtime
      add table public.landing_page_content;
  end if;
end;
$$;
