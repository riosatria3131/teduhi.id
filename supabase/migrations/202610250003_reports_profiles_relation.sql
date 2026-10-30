do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'reports_user_id_profiles_fkey'
      and conrelid = 'public.reports'::regclass
  ) then
    alter table public.reports
      add constraint reports_user_id_profiles_fkey
      foreign key (user_id)
      references public.profiles (id)
      on delete cascade
      not valid;
  end if;
end;
$$;