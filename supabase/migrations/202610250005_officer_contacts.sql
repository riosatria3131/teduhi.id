create table if not exists public.officer_contacts (
  id uuid primary key default gen_random_uuid(),
  department text not null,
  whatsapp text not null,
  email text,
  service_area text not null,
  status text not null default 'Aktif' check (status in ('Aktif', 'Nonaktif')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.officer_contacts enable row level security;

drop policy if exists "Management can read officer contacts" on public.officer_contacts;
create policy "Management can read officer contacts"
  on public.officer_contacts for select to authenticated
  using ((select public.is_management_user()));

drop policy if exists "Management can insert officer contacts" on public.officer_contacts;
create policy "Management can insert officer contacts"
  on public.officer_contacts for insert to authenticated
  with check ((select public.is_management_user()));

drop policy if exists "Management can update officer contacts" on public.officer_contacts;
create policy "Management can update officer contacts"
  on public.officer_contacts for update to authenticated
  using ((select public.is_management_user()))
  with check ((select public.is_management_user()));

drop policy if exists "Management can delete officer contacts" on public.officer_contacts;
create policy "Management can delete officer contacts"
  on public.officer_contacts for delete to authenticated
  using ((select public.is_management_user()));

grant select, insert, update, delete on public.officer_contacts to authenticated;
