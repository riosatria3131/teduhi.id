-- Allow active residents to read the transfer proof for their own approved report,
-- but only after a payout has been recorded for that report.
create or replace function public.can_resident_read_bpdlh_transfer_proof(p_object_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
	select (select public.is_active_user())
		and exists (
			select 1
			from public.reports report
			join public.bpdlh_report_submissions submission
				on submission.report_id = report.id
			where report.user_id = (select auth.uid())
				and submission.status = 'Disetujui'
				and submission.transfer_proof_path = p_object_name
				and exists (
					select 1
					from public.bpdlh_budget_payouts payout
					where payout.application_id = report.id
				)
		);
$$;

revoke all on function public.can_resident_read_bpdlh_transfer_proof(text) from public;
grant execute on function public.can_resident_read_bpdlh_transfer_proof(text) to authenticated;

drop policy if exists "Residents read own approved BPDLH transfer proofs" on storage.objects;
create policy "Residents read own approved BPDLH transfer proofs"
	on storage.objects for select to authenticated
	using (
		bucket_id = 'dokumen'
		and (select public.can_resident_read_bpdlh_transfer_proof(name))
	);

create or replace function public.get_resident_bpdlh_transfer_evidence(p_report_id uuid)
returns table (transfer_description text, transfer_proof_path text, transfer_proof_name text)
language sql
stable
security definer
set search_path = ''
as $$
	select submission.transfer_description, submission.transfer_proof_path, submission.transfer_proof_name
	from public.bpdlh_report_submissions submission
	join public.reports report on report.id = submission.report_id
	where submission.report_id = p_report_id
		and report.user_id = (select auth.uid())
		and (select public.is_active_user())
		and submission.status = 'Disetujui'
		and submission.transfer_proof_path is not null
		and exists (
			select 1
			from public.bpdlh_budget_payouts payout
			where payout.application_id = p_report_id
		);
$$;

revoke all on function public.get_resident_bpdlh_transfer_evidence(uuid) from public;
grant execute on function public.get_resident_bpdlh_transfer_evidence(uuid) to authenticated;








   