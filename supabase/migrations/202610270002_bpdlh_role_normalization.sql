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
      and lower(regexp_replace(coalesce(role, ''), '[-[:space:]]+', '_', 'g'))
        in ('admin', 'administrator', 'admin_utama', 'admin_bpbd', 'bpbd', 'admin_bpdlh', 'admin_keuangan', 'bpdlh')
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
    select 1
    from public.profiles
    where id = (select auth.uid())
      and lower(regexp_replace(coalesce(role, ''), '[-[:space:]]+', '_', 'g'))
        in ('admin', 'administrator', 'admin_utama', 'admin_bpbd', 'bpbd')
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
    select 1
    from public.profiles
    where id = (select auth.uid())
      and lower(regexp_replace(coalesce(role, ''), '[-[:space:]]+', '_', 'g'))
        in ('admin_bpdlh', 'admin_keuangan', 'bpdlh')
  );
$$;

revoke all on function public.is_management_user() from public;
revoke all on function public.is_main_admin() from public;
revoke all on function public.is_bpdlh_user() from public;
grant execute on function public.is_management_user() to authenticated;
grant execute on function public.is_main_admin() to authenticated;
grant execute on function public.is_bpdlh_user() to authenticated;
