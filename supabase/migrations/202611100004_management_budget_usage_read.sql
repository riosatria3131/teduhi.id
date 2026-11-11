-- The main admin dashboard can read payout totals for its finance summary.
drop policy if exists "BPDLH users read budget payouts" on public.bpdlh_budget_payouts;
create policy "Management users read budget payouts"
  on public.bpdlh_budget_payouts for select to authenticated
  using ((select public.is_main_admin()) or (select public.is_bpdlh_user()));
