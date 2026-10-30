create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nama, email, no_telepon, alamat, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nama', ''),
    new.email,
    nullif(new.raw_user_meta_data ->> 'no_telepon', ''),
    nullif(new.raw_user_meta_data ->> 'alamat', ''),
    'warga'
  )
  on conflict (id) do update
    set nama = excluded.nama,
        email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();