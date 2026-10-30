-- Existing BPDLH transfer proofs are stored in the `dokumen` bucket.
-- Keep this bucket private; management users access proofs through signed URLs.
insert into storage.buckets (id, name, public)
values ('dokumen', 'dokumen', false)
on conflict (id) do nothing;

drop policy if exists "BPDLH management can read transfer proofs in dokumen" on storage.objects;
create policy "BPDLH management can read transfer proofs in dokumen"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'dokumen'
    and (select public.is_management_user())
  );

drop policy if exists "BPDLH admins can upload transfer proofs to dokumen" on storage.objects;
create policy "BPDLH admins can upload transfer proofs to dokumen"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'dokumen'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select public.is_bpdlh_user())
  );

drop policy if exists "BPDLH admins can delete own transfer proofs from dokumen" on storage.objects;
create policy "BPDLH admins can delete own transfer proofs from dokumen"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'dokumen'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select public.is_bpdlh_user())
  );