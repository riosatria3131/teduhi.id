create table if not exists public.bpdlh_report_submissions (
  report_id uuid primary key references public.reports(id) on delete cascade,
  status text not null default 'Menunggu Review'
    check (status in ('Menunggu Review', 'Disetujui', 'Perlu Revisi', 'Ditolak')),
  admin_note text not null default '',
  bpdlh_note text not null default '',
  submitted_by uuid not null references public.profiles(id),
  submitted_at timestamptz not null default now(),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz
);

alter table public.bpdlh_report_submissions enable row level security;

create or replace function public.is_management_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and role in ('admin', 'administrator', 'admin_bpdlh', 'admin_keuangan', 'bpdlh')
  );
$$;

create or replace function public.is_main_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role in ('admin', 'administrator')
  );
$$;

create or replace function public.is_bpdlh_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role in ('admin_bpdlh', 'admin_keuangan', 'bpdlh')
  );
$$;

revoke all on function public.is_main_admin() from public;
revoke all on function public.is_bpdlh_user() from public;
grant execute on function public.is_main_admin() to authenticated;
grant execute on function public.is_bpdlh_user() to authenticated;

drop policy if exists "Management can read BPDLH report submissions" on public.bpdlh_report_submissions;
create policy "Management can read BPDLH report submissions"
  on public.bpdlh_report_submissions for select to authenticated
  using ((select public.is_main_admin()) or (select public.is_bpdlh_user()));

drop policy if exists "Main admins can submit reports to BPDLH" on public.bpdlh_report_submissions;
create policy "Main admins can submit reports to BPDLH"
  on public.bpdlh_report_submissions for insert to authenticated
  with check ((select public.is_main_admin()) and submitted_by = (select auth.uid()));

drop policy if exists "BPDLH admins can review submitted reports" on public.bpdlh_report_submissions;
create policy "BPDLH admins can review submitted reports"
  on public.bpdlh_report_submissions for update to authenticated
  using ((select public.is_bpdlh_user()) and status = 'Menunggu Review')
  with check ((select public.is_bpdlh_user()) and reviewed_by = (select auth.uid()));

drop policy if exists "Main admins can resubmit revised reports" on public.bpdlh_report_submissions;
create policy "Main admins can resubmit revised reports"
  on public.bpdlh_report_submissions for update to authenticated
  using ((select public.is_main_admin()) and status = 'Perlu Revisi')
  with check ((select public.is_main_admin()) and status = 'Menunggu Review');

grant select, insert, update on public.bpdlh_report_submissions to authenticated;

create index if not exists bpdlh_report_submissions_status_submitted_idx
  on public.bpdlh_report_submissions (status, submitted_at desc);