do $$
begin
  if exists (
    select 1
    from pg_catalog.pg_publication
    where pubname = 'supabase_realtime'
  ) and not exists (
    select 1
    from pg_catalog.pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'report_notifications'
  ) and exists (
    select 1
    from pg_catalog.pg_class relation
    join pg_catalog.pg_namespace nsp on nsp.oid = relation.relnamespace
    where nsp.nspname = 'public'
      and relation.relname = 'report_notifications'
      and relation.relkind in ('r', 'p')
  ) then
    alter publication supabase_realtime add table public.report_notifications;
  end if;
end;
$$;
