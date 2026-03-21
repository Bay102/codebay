-- Weekly newsletter digest preferences + send tracking.
-- RLS uses (select auth.uid()) patterns to avoid auth_rls_initplan warnings.

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'newsletter_digest_frequency'
      and n.nspname = 'public'
  ) then
    create type public.newsletter_digest_frequency as enum ('none', 'weekly', 'biweekly', 'monthly');
  end if;
end
$$;

create table if not exists public.newsletter_settings (
  user_id uuid primary key references public.community_users (id) on delete cascade,
  frequency public.newsletter_digest_frequency not null default 'weekly',
  include_blog boolean not null default true,
  include_discussions boolean not null default true,
  last_digest_sent_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.newsletter_settings is 'Per-user digest preferences for followed creators newsletter.';

drop trigger if exists set_newsletter_settings_updated_at on public.newsletter_settings;
create trigger set_newsletter_settings_updated_at
before update on public.newsletter_settings
for each row
execute function public.set_current_timestamp_updated_at();

create table if not exists public.newsletter_muted_follows (
  subscriber_id uuid not null,
  following_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (subscriber_id, following_id),
  constraint newsletter_muted_follows_no_self check (subscriber_id <> following_id),
  constraint newsletter_muted_follows_user_follows_fkey
    foreign key (subscriber_id, following_id)
    references public.user_follows (follower_id, following_id)
    on delete cascade
);

comment on table public.newsletter_muted_follows is 'Follow relationships excluded from digest content for a subscriber.';

create table if not exists public.newsletter_send_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.community_users (id) on delete cascade,
  frequency public.newsletter_digest_frequency not null,
  period_key text not null,
  content_count integer not null default 0,
  provider_message_id text null,
  sent_at timestamptz not null default now()
);

comment on table public.newsletter_send_log is 'Digest sends for idempotency and provider traceability.';

create unique index if not exists newsletter_send_log_user_frequency_period_key_uniq
  on public.newsletter_send_log (user_id, frequency, period_key);

create index if not exists newsletter_muted_follows_subscriber_created_at_idx
  on public.newsletter_muted_follows (subscriber_id, created_at desc);

create index if not exists newsletter_send_log_user_sent_at_idx
  on public.newsletter_send_log (user_id, sent_at desc);

alter table public.newsletter_settings enable row level security;
alter table public.newsletter_muted_follows enable row level security;
alter table public.newsletter_send_log enable row level security;

drop policy if exists "Users can read own newsletter settings" on public.newsletter_settings;
create policy "Users can read own newsletter settings"
  on public.newsletter_settings
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users can insert own newsletter settings" on public.newsletter_settings;
create policy "Users can insert own newsletter settings"
  on public.newsletter_settings
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Users can update own newsletter settings" on public.newsletter_settings;
create policy "Users can update own newsletter settings"
  on public.newsletter_settings
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Users can read own newsletter muted follows" on public.newsletter_muted_follows;
create policy "Users can read own newsletter muted follows"
  on public.newsletter_muted_follows
  for select
  to authenticated
  using (subscriber_id = (select auth.uid()));

drop policy if exists "Users can insert own newsletter muted follows" on public.newsletter_muted_follows;
create policy "Users can insert own newsletter muted follows"
  on public.newsletter_muted_follows
  for insert
  to authenticated
  with check (subscriber_id = (select auth.uid()));

drop policy if exists "Users can delete own newsletter muted follows" on public.newsletter_muted_follows;
create policy "Users can delete own newsletter muted follows"
  on public.newsletter_muted_follows
  for delete
  to authenticated
  using (subscriber_id = (select auth.uid()));

drop policy if exists "Users can read own newsletter send log" on public.newsletter_send_log;
create policy "Users can read own newsletter send log"
  on public.newsletter_send_log
  for select
  to authenticated
  using (user_id = (select auth.uid()));
