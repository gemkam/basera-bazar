-- Run this once in your Supabase project (SQL Editor) before deploying.
-- Stores short-lived, hashed checkout email verification codes.
-- Only the server (service role) reads/writes this table, so RLS is enabled
-- with no public policies to keep the anon/public client locked out.

create extension if not exists pgcrypto;

create table if not exists public.email_verifications (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  code_hash   text not null,
  expires_at  timestamptz not null,
  attempts    integer not null default 0,
  verified    boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists email_verifications_email_idx
  on public.email_verifications (email);

create index if not exists email_verifications_expires_idx
  on public.email_verifications (expires_at);

alter table public.email_verifications enable row level security;
-- No policies on purpose: the service role bypasses RLS; nobody else can read codes.

-- Optional housekeeping: delete expired codes. You can run this manually now
-- and then, or schedule it with pg_cron if you have it enabled.
-- delete from public.email_verifications where expires_at < now();
