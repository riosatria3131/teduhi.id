create or replace function public.save_bpdlh_transfer_evidence(
  p_report_id uuid,
  p_description text,
  p_proof_path text,
  p_proof_name text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  previous_path text;
begin 222
  if not (select public.is_bpdlh_user()) then
    raise exception 'Akun tidak memiliki akses ke bukti transfer BPDLH.';
  end if;
  if nullif(trim(coalesce(p_description, '')), '') is null
    or nullif(trim(coalesce(p_proof_name, '')), '') is null
    or p_proof_path is null
    or p_proof_path not like ((select auth.uid())::text || '/bpdlh-transfer/' || p_report_id::text || '/%') then
    raise exception 'Deskripsi dan berkas bukti transfer tidak valid.';
  end if;

  select transfer_proof_path into previous_path
  from public.bpdlh_report_submissions
  where report_id = p_report_id and status = 'Disetujui'
  for update;
  if not found then
    raise exception 'Pengajuan belum disetujui atau tidak ditemukan.';
  end if;

  update public.bpdlh_report_submissions
  set transfer_description = trim(p_description),
      transfer_proof_path = p_proof_path,
      transfer_proof_name = trim(p_proof_name)
  where report_id = p_report_id and status = 'Disetujui';

  return previous_path;
end;
$$;

revoke all on function public.save_bpdlh_transfer_evidence(uuid, text, text, text) from public;
grant execute on function public.save_bpdlh_transfer_evidence(uuid, text, text, text) to authenticated;
