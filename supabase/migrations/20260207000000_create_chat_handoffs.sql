create extension if not exists "pgcrypto";

create table if not exists public.chat_handoffs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text not null,
  chat_history jsonb not null
);

alter table public.chat_handoffs enable row level security;
