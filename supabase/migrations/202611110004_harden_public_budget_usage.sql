-- Harden public budget aggregation without exposing individual payout rows.
-- Processing instructions count as committed usage because the payout RPC deducts
-- them from the allocation balance when the instruction is recorded. Failed
-- instructions are excluded from public usage totals.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_constraint
    WHERE conname = 'bpdlh_public_budget_period_start_check'
      AND conrelid = 'public.bpdlh_public_budget_period_usage'::regclass
  ) THEN
    ALTER TABLE public.bpdlh_public_budget_period_usage
      ADD CONSTRAINT bpdlh_public_budget_period_start_check
      CHECK (
        (period_type = 'monthly' AND period_start = pg_catalog.date_trunc('month', period_start)::date)
        OR (period_type = 'yearly' AND period_start = pg_catalog.date_trunc('year', period_start)::date)
      );
  END IF;
END;
$$;

-- Keep period boundaries consistent with the Indonesia business timezone.
CREATE OR REPLACE VIEW public.bpdlh_budget_usage_source AS
SELECT
  payout.created_at AT TIME ZONE 'Asia/Jakarta' AS local_created_at,
  payout.amount,
  CASE
    WHEN coalesce(report.address, '') || ' ' || coalesce(report.district, '') ~* '(sumatra|sumatera|aceh|lampung|bengkulu|jambi|riau|kepri|kepulauan riau|bangka belitung)' THEN 'Sumatra'
    WHEN coalesce(report.address, '') || ' ' || coalesce(report.district, '') ~* '(kalimantan|pontianak|banjarmasin|samarinda|palangka raya|palangkaraya|tarakan|ketapang|kapuas|kota baru|kotabaru)' THEN 'Kalimantan'
    WHEN coalesce(report.address, '') || ' ' || coalesce(report.district, '') ~* '(sulawesi|makassar|manado|gorontalo|palu|kendari|mamuju|bugis|minahasa)' THEN 'Sulawesi'
    WHEN coalesce(report.address, '') || ' ' || coalesce(report.district, '') ~* '(jawa|jakarta|banten|serang|tangerang|bogor|depok|bekasi|bandung|garut|semarang|surakarta|yogyakarta|surabaya|malang|kediri|madiun|cirebon|tegal|cilacap|purwokerto|pekalongan|jepara|ponorogo)' THEN 'Jawa'
    WHEN coalesce(report.address, '') || ' ' || coalesce(report.district, '') ~* '(papua|jayapura|merauke|sorong|manokwari|nabire|timika|biak|fakfak|mimika|keerom)' THEN 'Papua'
    ELSE 'Tidak terpetakan'
  END AS island
FROM public.bpdlh_budget_payouts AS payout
LEFT JOIN public.reports AS report ON report.id = payout.application_id
WHERE payout.status IN ('Processing', 'Success');

REVOKE ALL ON public.bpdlh_budget_usage_source FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.refresh_bpdlh_public_budget_period_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- A transaction-scoped lock prevents concurrent full refreshes from racing.
  PERFORM pg_catalog.pg_advisory_xact_lock(74123, 1);

  WITH period_totals AS (
    SELECT
      'monthly'::text AS period_type,
      pg_catalog.date_trunc('month', local_created_at)::date AS period_start,
      island,
      sum(amount)::numeric AS spent_total
    FROM public.bpdlh_budget_usage_source
    GROUP BY pg_catalog.date_trunc('month', local_created_at)::date, island
    UNION ALL
    SELECT
      'yearly'::text AS period_type,
      pg_catalog.date_trunc('year', local_created_at)::date AS period_start,
      island,
      sum(amount)::numeric AS spent_total
    FROM public.bpdlh_budget_usage_source
    GROUP BY pg_catalog.date_trunc('year', local_created_at)::date, island
  )
  INSERT INTO public.bpdlh_public_budget_period_usage AS stored
    (period_type, period_start, island, spent_total, updated_at)
  SELECT period_type, period_start, island, spent_total, pg_catalog.now()
  FROM period_totals
  ON CONFLICT (period_type, period_start, island) DO UPDATE
    SET spent_total = EXCLUDED.spent_total,
        updated_at = EXCLUDED.updated_at
    WHERE stored.spent_total IS DISTINCT FROM EXCLUDED.spent_total;

  -- Remove only keys that no longer have source transactions.
  DELETE FROM public.bpdlh_public_budget_period_usage AS stored
  WHERE NOT EXISTS (
    SELECT 1
    FROM (
      SELECT 'monthly'::text AS period_type,
        pg_catalog.date_trunc('month', local_created_at)::date AS period_start,
        island
      FROM public.bpdlh_budget_usage_source
      GROUP BY pg_catalog.date_trunc('month', local_created_at)::date, island
      UNION ALL
      SELECT 'yearly'::text AS period_type,
        pg_catalog.date_trunc('year', local_created_at)::date AS period_start,
        island
      FROM public.bpdlh_budget_usage_source
      GROUP BY pg_catalog.date_trunc('year', local_created_at)::date, island
    ) AS current_totals
    WHERE current_totals.period_type = stored.period_type
      AND current_totals.period_start = stored.period_start
      AND current_totals.island = stored.island
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.refresh_bpdlh_public_budget_island_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM pg_catalog.pg_advisory_xact_lock(74123, 2);

  WITH island_names(island) AS (
    VALUES ('Sumatra'), ('Kalimantan'), ('Sulawesi'), ('Jawa'), ('Papua'), ('Tidak terpetakan')
  ), usage_by_island AS (
    SELECT island, sum(amount)::numeric AS spent_total
    FROM public.bpdlh_budget_usage_source
    GROUP BY island
  )
  INSERT INTO public.bpdlh_public_budget_island_usage AS stored
    (island, spent_total, updated_at)
  SELECT island_names.island, coalesce(usage_by_island.spent_total, 0), pg_catalog.now()
  FROM island_names
  LEFT JOIN usage_by_island USING (island)
  ON CONFLICT (island) DO UPDATE
    SET spent_total = EXCLUDED.spent_total,
        updated_at = EXCLUDED.updated_at
    WHERE stored.spent_total IS DISTINCT FROM EXCLUDED.spent_total;
END;
$$;

REVOKE ALL ON FUNCTION public.refresh_bpdlh_public_budget_period_usage() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.refresh_bpdlh_public_budget_island_usage() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_bpdlh_public_budget_period_usage_change() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_bpdlh_public_budget_island_usage_change() FROM PUBLIC, anon, authenticated;

-- Keep allocation balances aligned if a reserved instruction later fails or is removed.
CREATE OR REPLACE FUNCTION public.reconcile_bpdlh_allocation_spent_after_payout_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  old_committed bigint := 0;
  new_committed bigint := 0;
  balance_delta bigint := 0;
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.status IN ('Processing', 'Success') THEN
      UPDATE public.bpdlh_budget_allocations
      SET spent = spent - OLD.amount,
          updated_at = pg_catalog.now()
      WHERE id = OLD.allocation_id;
    END IF;
    RETURN OLD;
  END IF;

  old_committed := CASE WHEN OLD.status IN ('Processing', 'Success') THEN OLD.amount ELSE 0 END;
  new_committed := CASE WHEN NEW.status IN ('Processing', 'Success') THEN NEW.amount ELSE 0 END;
  balance_delta := new_committed - old_committed;

  IF balance_delta <> 0 THEN
    UPDATE public.bpdlh_budget_allocations
    SET spent = spent + balance_delta,
        updated_at = pg_catalog.now()
    WHERE id = OLD.allocation_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Pos anggaran pencairan tidak ditemukan.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.reconcile_bpdlh_allocation_spent_after_payout_change() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS reconcile_bpdlh_allocation_spent_after_payout_change ON public.bpdlh_budget_payouts;
CREATE TRIGGER reconcile_bpdlh_allocation_spent_after_payout_change
  AFTER UPDATE OF status OR DELETE ON public.bpdlh_budget_payouts
  FOR EACH ROW EXECUTE FUNCTION public.reconcile_bpdlh_allocation_spent_after_payout_change();

-- Backfill and remove stale aggregate keys after upgrading the refresh logic.
SELECT public.refresh_bpdlh_public_budget_period_usage();
SELECT public.refresh_bpdlh_public_budget_island_usage();
