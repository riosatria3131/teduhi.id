create table if not exists public.landing_page_news (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 120),
  source_url text not null check (source_url ~* '^https?://'),
  photo text not null check (char_length(photo) > 0),
  description text not null check (char_length(btrim(description)) between 1 and 600),
  created_at timestamptz not null default now()
);

alter table public.landing_page_news enable row level security;

drop policy if exists "Public can read landing page news" on public.landing_page_news;
create policy "Public can read landing page news"
  on public.landing_page_news for select to anon, authenticated
  using (true);

grant select on public.landing_page_news to anon, authenticated;
revoke insert, update, delete on public.landing_page_news from anon, authenticated;

create or replace function public.replace_landing_page_news(p_news jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (select public.is_main_admin()) or not (select public.is_active_user()) then
    raise exception 'Hanya admin aktif yang dapat mengelola berita landing page.' using errcode = '42501';
  end if;

  if pg_catalog.jsonb_typeof(p_news) is distinct from 'array'
     or pg_catalog.jsonb_array_length(p_news) > 5 then
    raise exception 'Berita harus berupa daftar dengan maksimal 5 item.' using errcode = '22023';
  end if;

  delete from public.landing_page_news where true;

  insert into public.landing_page_news (id, title, source_url, photo, description, created_at)
  select
    coalesce(nullif(item ->> 'id', '')::uuid, pg_catalog.gen_random_uuid()),
    item ->> 'title',
    item ->> 'sourceUrl',
    item ->> 'photo',
    item ->> 'description',
    coalesce(nullif(item ->> 'createdAt', '')::timestamptz, pg_catalog.now())
  from pg_catalog.jsonb_array_elements(p_news) as entries(item);
end;
$$;

revoke all on function public.replace_landing_page_news(jsonb) from public;
grant execute on function public.replace_landing_page_news(jsonb) to authenticated;

create index if not exists landing_page_news_created_at_idx
  on public.landing_page_news (created_at desc);