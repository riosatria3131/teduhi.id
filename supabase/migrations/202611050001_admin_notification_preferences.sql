create table if not exists public.admin_notification_preferences (
  singleton boolean primary key default true check (singleton = true),
  enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.admin_notification_preferences enable row level security;

drop policy if exists "Main admins can read notification preference" on public.admin_notification_preferences;
create policy "Main admins can read notification preference"
  on public.admin_notification_preferences for select to authenticated
  using ((select public.is_main_admin()) and (select public.is_active_user()));

drop policy if exists "Main admins can update notification preference" on public.admin_notification_preferences;
create policy "Main admins can update notification preference"
  on public.admin_notification_preferences for update to authenticated
  using ((select public.is_main_admin()) and (select public.is_active_user()))
  with check ((select public.is_main_admin()) and (select public.is_active_user()));

grant select, update on public.admin_notification_preferences to authenticated;

create or replace function public.set_admin_notification_preference_metadata()
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

revoke all on function public.set_admin_notification_preference_metadata() from public;

drop trigger if exists set_admin_notification_preference_metadata on public.admin_notification_preferences;
create trigger set_admin_notification_preference_metadata
  before update on public.admin_notification_preferences
  for each row execute function public.set_admin_notification_preference_metadata();

insert into public.admin_notification_preferences (singleton, enabled)
values (true, true)
on conflict (singleton) do nothing;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'admin_notification_preferences'
  ) then
    alter publication supabase_realtime add table public.admin_notification_preferences;
  end if;
end;
$$;