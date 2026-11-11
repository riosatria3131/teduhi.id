-- Allow main admins to read receipt line items for the report linked to a payout.
drop policy if exists "Management users read budget payout items"
  on public.bpdlh_budget_payout_items;
create policy "Management users read budget payout items"
  on public.bpdlh_budget_payout_items
  for select to authenticated
  using (
    (select public.is_main_admin())
    or (select public.is_bpdlh_user())
  );
