create or replace function public.is_management_user()
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
      and role in ('admin', 'admin_bpdlh')
  );
$$;

revoke all on function public.is_management_user() from public;
grant execute on function public.is_management_user() to authenticated;

alter table public.profiles enable row level security;
alter table public.reports enable row level security;

revoke update on public.profiles from authenticated;
grant update (nama, no_telepon, alamat) on public.profiles to authenticated;

drop policy if exists "Profiles are readable by their owner" on public.profiles;
create policy "Profiles are readable by their owner"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_management_user()));

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert to authenticated
  with check (id = (select auth.uid()) and role = 'warga');

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists "Report owners and management can read reports" on public.reports;
create policy "Report owners and management can read reports"
  on public.reports for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_management_user()));

drop policy if exists "Authenticated users can create their own reports" on public.reports;
create policy "Authenticated users can create their own reports"
  on public.reports for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Management can update reports" on public.reports;
create policy "Management can update reports"
  on public.reports for update to authenticated
  using ((select public.is_management_user()))
  with check ((select public.is_management_user()));

drop policy if exists "Report owners can delete their own reports" on public.reports;
create policy "Report owners can delete their own reports"
  on public.reports for delete to authenticated
  using (user_id = (select auth.uid()));

insert into storage.buckets (id, name, public)
values ('report-attachments', 'report-attachments', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public can view report attachments" on storage.objects;
create policy "Public can view report attachments"
  on storage.objects for select to public
  using (bucket_id = 'report-attachments');

drop policy if exists "Users can upload their own report attachments" on storage.objects;
create policy "Users can upload their own report attachments"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'report-attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can delete their own report attachments" on storage.objects;
create policy "Users can delete their own report attachments"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'report-attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );