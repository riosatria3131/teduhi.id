-- Warga yang sudah masuk dapat melihat kontak petugas aktif di beranda.
-- Pengelola tetap dapat melihat semua kontak, termasuk yang nonaktif.
drop policy if exists "Management can read officer contacts" on public.officer_contacts;

create policy "Authenticated users can read active officer contacts"
  on public.officer_contacts for select to authenticated
  using ((select public.is_management_user()) or status = 'Aktif');