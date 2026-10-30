-- Citizens receive an inbox notification for each management status update.
alter table public.report_notifications
  drop constraint if exists report_notifications_status_check;

alter table public.report_notifications
  add constraint report_notifications_status_check
  check (status in ('Menunggu Verifikasi', 'Terverifikasi', 'Sedang Diproses', 'Selesai', 'Ditolak'));

create or replace function public.notify_report_owner_on_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status
     and new.status in ('Menunggu Verifikasi', 'Terverifikasi', 'Sedang Diproses', 'Selesai', 'Ditolak') then
    insert into public.report_notifications (
      user_id,
      report_id,
      title,
      message,
      status
    ) values (
      new.user_id,
      new.id,
      case new.status
        when 'Menunggu Verifikasi' then 'Laporan menunggu verifikasi'
        when 'Terverifikasi' then 'Laporan telah diverifikasi'
        when 'Sedang Diproses' then 'Laporan mulai diproses'
        when 'Selesai' then 'Laporan selesai ditangani'
        when 'Ditolak' then 'Laporan ditolak'
      end,
      case new.status
        when 'Menunggu Verifikasi' then 'Laporan “' || new.title || '” sedang menunggu verifikasi.'
        when 'Terverifikasi' then 'Laporan “' || new.title || '” telah diverifikasi.'
        when 'Sedang Diproses' then 'Laporan “' || new.title || '” sedang ditindaklanjuti petugas.'
        when 'Selesai' then 'Laporan “' || new.title || '” telah selesai ditangani.'
        when 'Ditolak' then 'Laporan “' || new.title || '” ditolak.'
      end,
      new.status
    );
  end if;

  return new;
end;
$$;

revoke all on function public.notify_report_owner_on_status_change() from public;

drop trigger if exists reports_notify_owner_on_status_change on public.reports;
create trigger reports_notify_owner_on_status_change
after update of status on public.reports
for each row
execute function public.notify_report_owner_on_status_change();

-- Keep the full status audit for management while allowing a rejected outcome.
alter table public.report_status_history
  drop constraint if exists report_status_history_status_check;

alter table public.report_status_history
  add constraint report_status_history_status_check
  check (status in ('Menunggu Verifikasi', 'Terverifikasi', 'Sedang Diproses', 'Selesai', 'Ditolak'));

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

  if normalized_status in ('Menunggu Verifikasi', 'Terverifikasi', 'Sedang Diproses', 'Selesai', 'Ditolak') then
    insert into public.report_status_history (report_id, status, changed_by)
    values (new.id, normalized_status, (select auth.uid()));
  end if;

  return new;
end;
$$;

revoke all on function public.record_report_status_history() from public;