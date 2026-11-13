create table if not exists public.bpdlh_notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  new_submissions_enabled boolean not null default true,
  status_changes_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.bpdlh_notification_preferences enable row level security;

drop policy if exists "BPDLH users can read own notification preferences"
  on public.bpdlh_notification_preferences;
create policy "BPDLH users can read own notification preferences"
  on public.bpdlh_notification_preferences
  for select to authenticated
  using (
    user_id = (select auth.uid())
    and (select public.is_bpdlh_user())
    and (select public.is_active_user())
  );

drop policy if exists "BPDLH users can insert own notification preferences"
  on public.bpdlh_notification_preferences;
create policy "BPDLH users can insert own notification preferences"
  on public.bpdlh_notification_preferences
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (select public.is_bpdlh_user())
    and (select public.is_active_user())
  );

drop policy if exists "BPDLH users can update own notification preferences"
  on public.bpdlh_notification_preferences;
create policy "BPDLH users can update own notification preferences"
  on public.bpdlh_notification_preferences
  for update to authenticated
  using (
    user_id = (select auth.uid())
    and (select public.is_bpdlh_user())
    and (select public.is_active_user())
  )
  with check (
    user_id = (select auth.uid())
    and (select public.is_bpdlh_user())
    and (select public.is_active_user())
  );

grant select, insert, update on public.bpdlh_notification_preferences to authenticated;

create or replace function public.set_bpdlh_notification_preferences_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.set_bpdlh_notification_preferences_updated_at() from public;

drop trigger if exists set_bpdlh_notification_preferences_updated_at
  on public.bpdlh_notification_preferences;
create trigger set_bpdlh_notification_preferences_updated_at
  before update on public.bpdlh_notification_preferences
  for each row execute function public.set_bpdlh_notification_preferences_updated_at();

do $$
begin
  if exists (
    select 1
    from pg_catalog.pg_publication
    where pubname = 'supabase_realtime'
  ) and not exists (
    select 1
    from pg_catalog.pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'bpdlh_notification_preferences'
  ) then
    alter publication supabase_realtime
      add table public.bpdlh_notification_preferences;
  end if;
end;
$$;
