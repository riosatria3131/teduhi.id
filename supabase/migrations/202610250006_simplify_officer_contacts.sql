alter table public.officer_contacts
  add column if not exists whatsapp text;

alter table public.officer_contacts
  add column if not exists department text not null default 'Unit Petugas';

alter table public.officer_contacts
  add column if not exists email text;

alter table public.officer_contacts
  add column if not exists service_area text not null default 'Belum ditentukan';

alter table public.officer_contacts
  add column if not exists status text not null default 'Aktif';

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'officer_contacts' and column_name = 'phone'
  ) then
    execute $sql$
      update public.officer_contacts
      set whatsapp = coalesce(nullif(trim(whatsapp), ''), nullif(trim(phone), ''), '0000000000')
      where whatsapp is null or trim(whatsapp) = ''
    $sql$;
    alter table public.officer_contacts drop column phone;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'officer_contacts' and column_name = 'name'
  ) then
    alter table public.officer_contacts drop column name;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'officer_contacts' and column_name = 'position'
  ) then
    alter table public.officer_contacts drop column position;
  end if;
end;
$$;

update public.officer_contacts
set whatsapp = '0000000000'
where whatsapp is null or trim(whatsapp) = '';

alter table public.officer_contacts alter column whatsapp set not null;
