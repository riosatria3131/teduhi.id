create table if not exists public.report_status_history (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  status text not null check (status in ('Menunggu Verifikasi', 'Terverifikasi', 'Sedang Diproses', 'Selesai')),
  changed_by uuid references auth.users(id) on delete set null,
  changed_at timestamptz not null default now()
);

create index if not exists report_status_history_report_changed_idx
  on public.report_status_history (report_id, changed_at asc);

alter table public.report_status_history enable row level security;

drop policy if exists "Owners and management can read report status history" on public.report_status_history;
create policy "Owners and management can read report status history"
  on public.report_status_history for select to authenticated
  using (
    exists (
      select 1
      from public.reports
      where reports.id = report_status_history.report_id
        and (
          reports.user_id = (select auth.uid())
          or (select public.is_management_user())
        )
    )
  );

grant select on public.report_status_history to authenticated;

create or replace function public.record_report_status_history()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_status text;
begin
  if tg_op = 'UPDATE' and new.status is not distinct from old.status then
    return new;
  end if;

  normalized_status := case
    when new.status = 'review' then 'Menunggu Verifikasi'
    else new.status
  end;

  if normalized_status in ('Menunggu Verifikasi', 'Terverifikasi', 'Sedang Diproses', 'Selesai') then
    insert into public.report_status_history (report_id, status, changed_by)
    values (new.id, normalized_status, (select auth.uid()));
  end if;

  return new;
end;
$$;

revoke all on function public.record_report_status_history() from public;

drop trigger if exists reports_record_status_history on public.reports;
create trigger reports_record_status_history
  after insert or update of status on public.reports
  for each row
  execute function public.record_report_status_history();

-- Seed the initial pending state for reports that already exist. Prior transitions
-- for reports already past verification cannot be reconstructed from current data.
insert into public.report_status_history (report_id, status, changed_at)
select reports.id, 'Menunggu Verifikasi', reports.created_at
from public.reports
where reports.status = 'review'
  and not exists (
    select 1 from public.report_status_history history
    where history.report_id = reports.id
  );
