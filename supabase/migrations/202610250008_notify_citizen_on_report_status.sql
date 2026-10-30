create or replace function public.notify_report_owner_on_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status
     and new.status in ('Sedang Diproses', 'Selesai') then
    insert into public.report_notifications (
      user_id,
      report_id,
      title,
      message,
      status
    ) values (
      new.user_id,
      new.id,
      case
        when new.status = 'Selesai' then 'Laporan selesai ditangani'
        else 'Laporan mulai diproses'
      end,
      case
        when new.status = 'Selesai' then 'Laporan “' || new.title || '” telah selesai ditangani.'
        else 'Laporan “' || new.title || '” sedang ditindaklanjuti petugas.'
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
