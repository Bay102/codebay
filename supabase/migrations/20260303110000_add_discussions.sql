-- Reddit-style discussions: one author, title, body, slug.
create table if not exists public.discussions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.community_users (id) on delete cascade,
  title text not null,
  body text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists discussions_author_id_idx on public.discussions (author_id);
create index if not exists discussions_slug_idx on public.discussions (slug);
create index if not exists discussions_created_at_idx on public.discussions (created_at desc);

comment on table public.discussions is 'Community discussion posts (Reddit-style threads).';

alter table public.discussions enable row level security;

-- Anyone can read discussions.
drop policy if exists "Public can read discussions" on public.discussions;
create policy "Public can read discussions"
  on public.discussions for select using (true);

-- Authenticated users can insert their own; author can update/delete own.
drop policy if exists "Authenticated can insert discussions" on public.discussions;
create policy "Authenticated can insert discussions"
  on public.discussions for insert to authenticated
  with check (author_id = auth.uid());

drop policy if exists "Author can update own discussions" on public.discussions;
create policy "Author can update own discussions"
  on public.discussions for update to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

drop policy if exists "Author can delete own discussions" on public.discussions;
create policy "Author can delete own discussions"
  on public.discussions for delete to authenticated
  using (author_id = auth.uid());
