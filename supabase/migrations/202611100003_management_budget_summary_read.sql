-- Allow the main admin dashboard to read finance totals without granting write access.
drop policy if exists "BPDLH users read budget allocations" on public.bpdlh_budget_allocations;
create policy "Management users read budget allocations"
  on public.bpdlh_budget_allocations for select to authenticated
  using ((select public.is_main_admin()) or (select public.is_bpdlh_user()));
