-- Reactions on discussions (e.g. like, insightful).
create table if not exists public.discussion_reactions (
  id uuid primary key default gen_random_uuid(),
  discussion_id uuid not null references public.discussions (id) on delete cascade,
  user_id uuid references public.community_users (id) on delete cascade,
  reaction_type text not null,
  created_at timestamptz not null default now(),
  unique (discussion_id, user_id, reaction_type)
);

create index if not exists discussion_reactions_discussion_id_idx on public.discussion_reactions (discussion_id);
create index if not exists discussion_reactions_user_id_idx on public.discussion_reactions (user_id);

comment on table public.discussion_reactions is 'User reactions on discussion posts.';

alter table public.discussion_reactions enable row level security;

-- Anyone can read reactions.
drop policy if exists "Public can read discussion_reactions" on public.discussion_reactions;
create policy "Public can read discussion_reactions"
  on public.discussion_reactions for select using (true);

-- Authenticated can insert/delete own reactions.
drop policy if exists "Authenticated can insert discussion_reactions" on public.discussion_reactions;
create policy "Authenticated can insert discussion_reactions"
  on public.discussion_reactions for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "User can delete own discussion_reactions" on public.discussion_reactions;
create policy "User can delete own discussion_reactions"
  on public.discussion_reactions for delete to authenticated
  using (user_id = auth.uid());
