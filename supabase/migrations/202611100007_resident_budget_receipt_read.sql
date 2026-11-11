-- Let active residents read payout notes and line items only for their own
-- report, and only after BPDLH has approved that report.
create or replace function public.can_resident_read_report_payout(p_report_id uuid)
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
      where report.id = p_report_id
        and report.user_id = (select auth.uid())
        and submission.status = 'Disetujui'
    );
$$;

revoke all on function public.can_resident_read_report_payout(uuid) from public;
grant execute on function public.can_resident_read_report_payout(uuid) to authenticated;

drop policy if exists "Residents read own approved report budget payouts"
  on public.bpdlh_budget_payouts;
create policy "Residents read own approved report budget payouts"
  on public.bpdlh_budget_payouts
  for select to authenticated
  using ((select public.can_resident_read_report_payout(application_id)));

drop policy if exists "Residents read own approved report budget payout items"
  on public.bpdlh_budget_payout_items;
create policy "Residents read own approved report budget payout items"
  on public.bpdlh_budget_payout_items
  for select to authenticated
  using (
    exists (
      select 1
      from public.bpdlh_budget_payouts payout
      where payout.id = bpdlh_budget_payout_items.payout_id
        and (select public.can_resident_read_report_payout(payout.application_id))
    )
  );
