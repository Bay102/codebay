-- Threaded comments on discussions.
create table if not exists public.discussion_comments (
  id uuid primary key default gen_random_uuid(),
  discussion_id uuid not null references public.discussions (id) on delete cascade,
  author_id uuid references public.community_users (id) on delete set null,
  author_name text not null,
  body text not null,
  parent_id uuid references public.discussion_comments (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists discussion_comments_discussion_id_idx on public.discussion_comments (discussion_id);
create index if not exists discussion_comments_parent_id_idx on public.discussion_comments (parent_id);
create index if not exists discussion_comments_created_at_idx on public.discussion_comments (created_at);

comment on table public.discussion_comments is 'Threaded comments on discussion posts.';

alter table public.discussion_comments enable row level security;

-- Anyone can read comments.
drop policy if exists "Public can read discussion_comments" on public.discussion_comments;
create policy "Public can read discussion_comments"
  on public.discussion_comments for select using (true);

-- Authenticated can insert; author can update/delete own.
drop policy if exists "Authenticated can insert discussion_comments" on public.discussion_comments;
create policy "Authenticated can insert discussion_comments"
  on public.discussion_comments for insert to authenticated
  with check (author_id = auth.uid());

drop policy if exists "Author can update own discussion_comments" on public.discussion_comments;
create policy "Author can update own discussion_comments"
  on public.discussion_comments for update to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

drop policy if exists "Author can delete own discussion_comments" on public.discussion_comments;
create policy "Author can delete own discussion_comments"
  on public.discussion_comments for delete to authenticated
  using (author_id = auth.uid());
