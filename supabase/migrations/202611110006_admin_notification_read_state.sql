create table if not exists public.admin_notification_reads (
  user_id uuid not null references auth.users(id) on delete cascade,
  notification_id text not null,
  read_at timestamptz not null default now(),
  primary key (user_id, notification_id)
);

alter table public.admin_notification_reads enable row level security;

drop policy if exists "Management can read own notification read state" on public.admin_notification_reads;
create policy "Management can read own notification read state"
  on public.admin_notification_reads for select to authenticated
  using (
    user_id = (select auth.uid())
    and (select public.is_management_user())
    and (select public.is_active_user())
  );

drop policy if exists "Management can insert own notification read state" on public.admin_notification_reads;
create policy "Management can insert own notification read state"
  on public.admin_notification_reads for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (select public.is_management_user())
    and (select public.is_active_user())
  );

drop policy if exists "Management can update own notification read state" on public.admin_notification_reads;
create policy "Management can update own notification read state"
  on public.admin_notification_reads for update to authenticated
  using (
    user_id = (select auth.uid())
    and (select public.is_management_user())
    and (select public.is_active_user())
  )
  with check (
    user_id = (select auth.uid())
    and (select public.is_management_user())
    and (select public.is_active_user())
  );

grant select, insert, update on public.admin_notification_reads to authenticated;
