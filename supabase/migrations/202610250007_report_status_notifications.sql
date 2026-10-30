create table if not exists public.report_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  report_id uuid not null references public.reports(id) on delete cascade,
  title text not null,
  message text not null,
  status text not null check (status in ('Sedang Diproses', 'Selesai')),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.report_notifications enable row level security;

drop policy if exists "Users can read own report notifications" on public.report_notifications;
create policy "Users can read own report notifications"
  on public.report_notifications for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Management can create report notifications" on public.report_notifications;
create policy "Management can create report notifications"
  on public.report_notifications for insert to authenticated
  with check ((select public.is_management_user()));

drop policy if exists "Users can mark own report notifications read" on public.report_notifications;
create policy "Users can mark own report notifications read"
  on public.report_notifications for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

grant select, update on public.report_notifications to authenticated;
grant insert on public.report_notifications to authenticated;

create index if not exists report_notifications_user_created_idx
  on public.report_notifications (user_id, created_at desc);