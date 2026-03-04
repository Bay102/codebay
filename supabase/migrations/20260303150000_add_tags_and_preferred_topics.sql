-- Preset tags table (admins create); user preferred topics; discussions.tags.
-- RLS: wrap auth.uid() in (select auth.uid()) to avoid initplan.

-- 1) tags table
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_by uuid references public.community_users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists tags_slug_idx on public.tags (slug);
comment on table public.tags is 'Preset tags for blog posts and discussions; admins create, later gatable by paid plan.';

alter table public.tags enable row level security;

-- Public read for tags
drop policy if exists "Public can read tags" on public.tags;
create policy "Public can read tags"
  on public.tags
  for select
  using (true);

-- Admins only: insert/update/delete (extensible later for paid plan)
drop policy if exists "Admins can insert tags" on public.tags;
create policy "Admins can insert tags"
  on public.tags
  for insert
  to authenticated
  with check ((select user_type from public.community_users where id = (select auth.uid())) = 'admin');

drop policy if exists "Admins can update tags" on public.tags;
create policy "Admins can update tags"
  on public.tags
  for update
  to authenticated
  using ((select user_type from public.community_users where id = (select auth.uid())) = 'admin')
  with check ((select user_type from public.community_users where id = (select auth.uid())) = 'admin');

drop policy if exists "Admins can delete tags" on public.tags;
create policy "Admins can delete tags"
  on public.tags
  for delete
  to authenticated
  using ((select user_type from public.community_users where id = (select auth.uid())) = 'admin');

-- 2) user_preferred_tags
create table if not exists public.user_preferred_tags (
  user_id uuid not null references public.community_users (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (user_id, tag_id)
);

create index if not exists user_preferred_tags_user_id_idx on public.user_preferred_tags (user_id);
comment on table public.user_preferred_tags is 'User-chosen preferred topics (tags) for For you sections.';

alter table public.user_preferred_tags enable row level security;

-- Users can read only their own rows
drop policy if exists "Users can read own preferred tags" on public.user_preferred_tags;
create policy "Users can read own preferred tags"
  on public.user_preferred_tags
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users can insert own preferred tags" on public.user_preferred_tags;
create policy "Users can insert own preferred tags"
  on public.user_preferred_tags
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Users can delete own preferred tags" on public.user_preferred_tags;
create policy "Users can delete own preferred tags"
  on public.user_preferred_tags
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- 3) discussions.tags
alter table public.discussions
  add column if not exists tags text[] not null default '{}';

comment on column public.discussions.tags is 'Tag names from public.tags; same semantics as blog_posts.tags.';

-- 4) Seed tags from existing blog_posts.tags
insert into public.tags (name, slug, created_by)
with distinct_names as (
  select distinct trim(t) as name
  from public.blog_posts, unnest(tags) as t
  where trim(t) <> ''
),
with_slug as (
  select
    name,
    lower(regexp_replace(regexp_replace(trim(name), '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')) as slug
  from distinct_names
),
deduped as (
  select distinct on (slug) name, slug
  from with_slug
  where slug <> ''
  order by slug, name
)
select name, slug, null
from deduped
on conflict (slug) do nothing;
