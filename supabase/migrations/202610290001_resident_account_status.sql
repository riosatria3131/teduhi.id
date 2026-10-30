alter table public.profiles
  add column if not exists is_active boolean not null default true;

create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and is_active = true
  );
$$;

revoke all on function public.is_active_user() from public;
grant execute on function public.is_active_user() to authenticated;

create or replace function public.admin_set_resident_active(p_user_id uuid, p_is_active boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (select public.is_management_user()) then
    raise exception 'Hanya admin yang dapat mengubah status akun warga.' using errcode = '42501';
  end if;

  update public.profiles
  set is_active = p_is_active
  where id = p_user_id
    and role = 'warga';

  if not found then
    raise exception 'Akun warga tidak ditemukan.' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.admin_set_resident_active(uuid, boolean) from public;
grant execute on function public.admin_set_resident_active(uuid, boolean) to authenticated;

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Active users can update their own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()) and (select public.is_active_user()))
  with check (id = (select auth.uid()) and (select public.is_active_user()));

drop policy if exists "Report owners and management can read reports" on public.reports;
create policy "Active report owners and management can read reports"
  on public.reports for select to authenticated
  using (
    (user_id = (select auth.uid()) and (select public.is_active_user()))
    or (select public.is_management_user())
  );

drop policy if exists "Authenticated users can create their own reports" on public.reports;
create policy "Active users can create their own reports"
  on public.reports for insert to authenticated
  with check (user_id = (select auth.uid()) and (select public.is_active_user()));

drop policy if exists "Report owners can delete their own reports" on public.reports;
create policy "Active report owners can delete their own reports"
  on public.reports for delete to authenticated
  using (user_id = (select auth.uid()) and (select public.is_active_user()));

drop policy if exists "Users can upload their own report attachments" on storage.objects;
create policy "Active users can upload their own report attachments"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'report-attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select public.is_active_user())
  );

drop policy if exists "Users can delete their own report attachments" on storage.objects;
create policy "Active users can delete their own report attachments"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'report-attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select public.is_active_user())
  );
