alter table public.community_users
add column if not exists tech_stack text[] not null default '{}'::text[];

alter table public.community_users
add column if not exists featured_projects jsonb not null default '[]'::jsonb;
