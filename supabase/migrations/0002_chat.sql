-- Phase 5: chatbot storage. All three tables are server-only: RLS is on with no policies, so only the
-- service role (the /api/chat route) can read or write them. Nothing here is exposed to visitors.

-- 1. Web source cache (context.dev results), so repeat questions don't spend credits.
create table if not exists public.source_cache (
  key         text primary key,               -- sha256 of kind + normalised query
  query       text not null,
  kind        text not null check (kind in ('news', 'reference')),
  results     jsonb not null,
  fetched_at  timestamptz not null default now(),
  expires_at  timestamptz not null
);
create index if not exists source_cache_expires_at on public.source_cache (expires_at);
alter table public.source_cache enable row level security;

-- 2. One row per answered question (no accounts, no IP addresses, no user identifiers).
create table if not exists public.chat_log (
  id             bigint generated always as identity primary key,
  created_at     timestamptz not null default now(),
  question       text not null,                -- truncated to 500 chars by the route
  page           text,                         -- page path the question was asked from
  model          text,                         -- model that produced the answer
  fell_back      boolean not null default false,
  latency_ms     integer,
  input_tokens   integer,
  output_tokens  integer,
  cost_usd       numeric(10, 6),
  sources        jsonb,                        -- urls used (site pages and web results)
  error          text
);
create index if not exists chat_log_created_at on public.chat_log (created_at desc);
alter table public.chat_log enable row level security;

-- 3. Daily spend counter for the spend cap (UTC days).
create table if not exists public.chat_spend (
  day       date primary key,
  usd       numeric(12, 6) not null default 0,
  requests  integer not null default 0
);
alter table public.chat_spend enable row level security;

-- Atomically add one request's cost to today's total and return the new total.
create or replace function public.add_chat_spend(p_usd numeric)
returns numeric
language sql
security invoker
set search_path = public
as $$
  insert into public.chat_spend as s (day, usd, requests)
  values ((now() at time zone 'utc')::date, p_usd, 1)
  on conflict (day) do update set usd = s.usd + excluded.usd, requests = s.requests + 1
  returning usd;
$$;
revoke all on function public.add_chat_spend(numeric) from public, anon, authenticated;
grant execute on function public.add_chat_spend(numeric) to service_role;
