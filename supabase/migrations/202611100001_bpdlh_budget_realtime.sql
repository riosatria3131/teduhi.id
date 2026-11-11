create table if not exists public.bpdlh_budget_allocations (
  id text primary key,
  name text not null check (char_length(trim(name)) between 1 and 100),
  description text not null default '' check (char_length(description) <= 160),
  budget bigint not null check (budget > 0),
  spent bigint not null default 0 check (spent >= 0 and spent <= budget),
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bpdlh_budget_payouts (
  id text primary key,
  allocation_id text not null references public.bpdlh_budget_allocations(id) on delete restrict,
  allocation_name text not null,
  application_id uuid not null references public.bpdlh_report_submissions(report_id) on delete restrict,
  application text not null,
  amount bigint not null check (amount > 0),
  purpose text not null,
  status text not null default 'Processing' check (status in ('Processing', 'Success', 'Failed')),
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.bpdlh_budget_payout_items (
  id uuid primary key default gen_random_uuid(),
  payout_id text not null references public.bpdlh_budget_payouts(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120),
  unit_price bigint not null check (unit_price > 0),
  quantity integer not null check (quantity > 0),
  unit text not null check (char_length(trim(unit)) between 1 and 20),
  subtotal bigint not null check (subtotal > 0)
);

create index if not exists bpdlh_budget_payouts_created_idx
  on public.bpdlh_budget_payouts (created_at desc);
create index if not exists bpdlh_budget_payouts_allocation_idx
  on public.bpdlh_budget_payouts (allocation_id, created_at desc);
create index if not exists bpdlh_budget_payout_items_payout_idx
  on public.bpdlh_budget_payout_items (payout_id);

alter table public.bpdlh_budget_allocations enable row level security;
alter table public.bpdlh_budget_payouts enable row level security;
alter table public.bpdlh_budget_payout_items enable row level security;

drop policy if exists "BPDLH users manage budget allocations" on public.bpdlh_budget_allocations;
drop policy if exists "BPDLH users read budget allocations" on public.bpdlh_budget_allocations;
drop policy if exists "BPDLH users insert budget allocations" on public.bpdlh_budget_allocations;
drop policy if exists "BPDLH users update budget allocations" on public.bpdlh_budget_allocations;
drop policy if exists "BPDLH users delete budget allocations" on public.bpdlh_budget_allocations;
create policy "BPDLH users read budget allocations"
  on public.bpdlh_budget_allocations for select to authenticated
  using ((select public.is_bpdlh_user()));
create policy "BPDLH users insert budget allocations"
  on public.bpdlh_budget_allocations for insert to authenticated
  with check ((select public.is_bpdlh_user()) and created_by = (select auth.uid()));
create policy "BPDLH users update budget allocations"
  on public.bpdlh_budget_allocations for update to authenticated
  using ((select public.is_bpdlh_user()))
  with check ((select public.is_bpdlh_user()));
create policy "BPDLH users delete budget allocations"
  on public.bpdlh_budget_allocations for delete to authenticated
  using ((select public.is_bpdlh_user()));

drop policy if exists "BPDLH users read budget payouts" on public.bpdlh_budget_payouts;
create policy "BPDLH users read budget payouts"
  on public.bpdlh_budget_payouts for select to authenticated
  using ((select public.is_bpdlh_user()));

drop policy if exists "BPDLH users read budget payout items" on public.bpdlh_budget_payout_items;
create policy "BPDLH users read budget payout items"
  on public.bpdlh_budget_payout_items for select to authenticated
  using ((select public.is_bpdlh_user()));

drop policy if exists "BPDLH users insert own budget payouts" on public.bpdlh_budget_payouts;
create policy "BPDLH users insert own budget payouts"
  on public.bpdlh_budget_payouts for insert to authenticated
  with check ((select public.is_bpdlh_user()) and created_by = (select auth.uid()));

drop policy if exists "BPDLH users insert budget payout items" on public.bpdlh_budget_payout_items;
create policy "BPDLH users insert budget payout items"
  on public.bpdlh_budget_payout_items for insert to authenticated
  with check (
    (select public.is_bpdlh_user())
    and exists (
      select 1 from public.bpdlh_budget_payouts payout
      where payout.id = payout_id and payout.created_by = (select auth.uid())
    )
  );

grant select, insert, update, delete on public.bpdlh_budget_allocations to authenticated;
grant select, insert on public.bpdlh_budget_payouts to authenticated;
grant select, insert on public.bpdlh_budget_payout_items to authenticated;

create or replace function public.record_bpdlh_budget_payout(
  p_allocation_id text,
  p_application_id uuid,
  p_amount bigint,
  p_items jsonb
)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_allocation public.bpdlh_budget_allocations%rowtype;
  v_application text;
  v_payout_id text;
  v_item jsonb;
  v_name text;
  v_unit text;
  v_unit_price bigint;
  v_quantity integer;
  v_subtotal bigint;
  v_items_total numeric := 0;
  v_purpose text[] := array[]::text[];
begin
  if not (select public.is_bpdlh_user()) then
    raise exception 'Akun tidak memiliki akses ke anggaran BPDLH.';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'Nominal pencairan harus lebih besar dari nol.';
  end if;
  if jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Rincian barang wajib diisi.';
  end if;

  select coalesce(report.title, 'Laporan tanpa judul') into v_application
  from public.bpdlh_report_submissions submission
  join public.reports report on report.id = submission.report_id
  where submission.report_id = p_application_id
    and submission.status = 'Disetujui';
  if not found then
    raise exception 'Pengajuan belum disetujui atau tidak ditemukan.';
  end if;

  select * into v_allocation
  from public.bpdlh_budget_allocations
  where id = p_allocation_id
  for update;
  if not found then
    raise exception 'Pos anggaran tidak ditemukan.';
  end if;
  if p_amount > v_allocation.budget - v_allocation.spent then
    raise exception 'Nominal pencairan melebihi sisa saldo pos anggaran.';
  end if;

  for v_item in select value from jsonb_array_elements(p_items) as item(value) loop
    v_name := trim(coalesce(v_item ->> 'name', ''));
    v_unit := trim(coalesce(v_item ->> 'unit', ''));
    v_unit_price := (v_item ->> 'unitPrice')::bigint;
    v_quantity := (v_item ->> 'quantity')::integer;
    v_subtotal := (v_item ->> 'subtotal')::bigint;
    if v_name = '' or char_length(v_name) > 120 or v_unit = '' or char_length(v_unit) > 20
      or v_unit_price <= 0 or v_quantity <= 0
      or v_subtotal::numeric <> v_unit_price::numeric * v_quantity::numeric then
      raise exception 'Rincian barang tidak valid.';
    end if;
    v_items_total := v_items_total + v_subtotal;
    v_purpose := array_append(v_purpose, v_quantity || ' ' || v_unit || ' ' || v_name);
  end loop;
  if v_items_total <> p_amount then
    raise exception 'Jumlah subtotal barang harus sama dengan nominal pencairan.';
  end if;

  v_payout_id := 'TRX-' || to_char(clock_timestamp(), 'YYYYMMDDHH24MISSMS') || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);
  insert into public.bpdlh_budget_payouts (
    id, allocation_id, allocation_name, application_id, application, amount, purpose, created_by
  ) values (
    v_payout_id, v_allocation.id, v_allocation.name, p_application_id, v_application,
    p_amount, array_to_string(v_purpose, '; '), (select auth.uid())
  );

  for v_item in select value from jsonb_array_elements(p_items) as item(value) loop
    insert into public.bpdlh_budget_payout_items (payout_id, name, unit_price, quantity, unit, subtotal)
    values (
      v_payout_id, trim(v_item ->> 'name'), (v_item ->> 'unitPrice')::bigint,
      (v_item ->> 'quantity')::integer, trim(v_item ->> 'unit'), (v_item ->> 'subtotal')::bigint
    );
  end loop;

  update public.bpdlh_budget_allocations
  set spent = spent + p_amount, updated_at = now()
  where id = v_allocation.id;

  return v_payout_id;
end;
$$;

revoke all on function public.record_bpdlh_budget_payout(text, uuid, bigint, jsonb) from public;
grant execute on function public.record_bpdlh_budget_payout(text, uuid, bigint, jsonb) to authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'bpdlh_budget_allocations'
    ) then
      alter publication supabase_realtime add table public.bpdlh_budget_allocations;
    end if;
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'bpdlh_budget_payouts'
    ) then
      alter publication supabase_realtime add table public.bpdlh_budget_payouts;
    end if;
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'bpdlh_budget_payout_items'
    ) then
      alter publication supabase_realtime add table public.bpdlh_budget_payout_items;
    end if;
  end if;
end;
$$;
