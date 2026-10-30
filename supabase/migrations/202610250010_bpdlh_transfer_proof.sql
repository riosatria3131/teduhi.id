alter table public.bpdlh_report_submissions
  add column if not exists transfer_description text not null default '',
  add column if not exists transfer_proof_path text,
  add column if not exists transfer_proof_name text;

drop policy if exists "BPDLH admins can upload transfer proofs" on storage.objects;
create policy "BPDLH admins can upload transfer proofs"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'report-attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select public.is_bpdlh_user())
  );