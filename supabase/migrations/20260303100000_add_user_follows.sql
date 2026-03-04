-- User follow graph: who follows whom.
create table if not exists public.user_follows (
  follower_id uuid not null references public.community_users (id) on delete cascade,
  following_id uuid not null references public.community_users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint user_follows_no_self_follow check (follower_id <> following_id)
);

create index if not exists user_follows_following_id_created_at_idx
  on public.user_follows (following_id, created_at desc);

create index if not exists user_follows_follower_id_created_at_idx
  on public.user_follows (follower_id, created_at desc);

comment on table public.user_follows is 'Follow graph: follower_id follows following_id.';

alter table public.user_follows enable row level security;

-- Authenticated users can read any follow relationship (for counts and lists).
drop policy if exists "Authenticated can read user_follows" on public.user_follows;
create policy "Authenticated can read user_follows"
  on public.user_follows
  for select
  to authenticated
  using (true);

-- Users can only insert/delete their own follow rows (follower_id = self).
drop policy if exists "Users can manage own follows" on public.user_follows;
create policy "Users can manage own follows"
  on public.user_follows
  for all
  to authenticated
  using (follower_id = auth.uid())
  with check (follower_id = auth.uid());

-- One-call follow stats for a profile (follower_count, following_count, is_following for viewer).
create or replace function public.get_follow_stats(p_profile_user_id uuid, p_viewer_user_id uuid default null)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'follower_count', (select count(*)::int from user_follows uf where uf.following_id = p_profile_user_id),
    'following_count', (select count(*)::int from user_follows uf where uf.follower_id = p_profile_user_id),
    'is_following', case
      when p_viewer_user_id is null then null
      when p_viewer_user_id = p_profile_user_id then null
      else exists (select 1 from user_follows uf where uf.follower_id = p_viewer_user_id and uf.following_id = p_profile_user_id)
    end
  );
$$;
comment on function public.get_follow_stats(uuid, uuid) is 'Returns follower_count, following_count, and is_following (for viewer) in one call.';
grant execute on function public.get_follow_stats(uuid, uuid) to authenticated;
