-- Phase 3: site images.
-- Every image frame on the site has a key (legacy `data-art` keys, e.g. `char-doom`, `film-iron-man`).
-- Files live in the public Storage bucket `art`, named by content hash so identical images are stored once;
-- several keys may point at the same file. `focus` is an optional CSS object-position for the crop.

create table if not exists public.art (
  key        text primary key,
  path       text not null,            -- object path inside the `art` bucket, e.g. "3f2a…e1.jpg"
  url        text not null,            -- public URL of that object
  focus      text,                     -- optional object-position, e.g. "center 18%"
  source     text not null default 'uploaded' check (source in ('uploaded', 'built-in')),
  sha256     text not null,
  updated_at timestamptz not null default now()
);

alter table public.art enable row level security;

-- Anyone may read the image map; only the service role (import script, Phase 4 admin) writes.
drop policy if exists "art is publicly readable" on public.art;
create policy "art is publicly readable" on public.art for select to anon, authenticated using (true);

-- Public bucket for the files themselves (reads are public; writes need the service role).
insert into storage.buckets (id, name, public)
values ('art', 'art', true)
on conflict (id) do update set public = true;
