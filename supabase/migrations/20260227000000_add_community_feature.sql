-- Community profiles
create table if not exists public.community_users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  username text not null unique check (username ~ '^[a-z0-9_]{3,32}$'),
  bio text null check (char_length(coalesce(bio, '')) <= 400),
  email text not null unique,
  avatar_url text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists community_users_created_at_idx on public.community_users (created_at desc);
create index if not exists community_users_email_idx on public.community_users (email);

-- Keep updated_at fresh on profile edits.
create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_community_users_updated_at on public.community_users;
create trigger set_community_users_updated_at
before update on public.community_users
for each row
execute function public.set_current_timestamp_updated_at();

-- Ensure every auth user gets a community profile row.
create or replace function public.handle_new_community_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.community_users (id, name, username, email, bio, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'user_' || substring(replace(new.id::text, '-', ''), 1, 12),
    new.email,
    new.raw_user_meta_data->>'bio',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_community on auth.users;
create trigger on_auth_user_created_community
after insert on auth.users
for each row
execute function public.handle_new_community_user();

-- Add community ownership metadata to existing blog tables.
alter table public.blog_posts
  add column if not exists author_id uuid references public.community_users (id) on delete set null;
alter table public.blog_posts
  alter column author_id set default auth.uid();
create index if not exists blog_posts_author_id_idx on public.blog_posts (author_id);

alter table public.blog_post_comments
  add column if not exists author_id uuid references public.community_users (id) on delete set null;
alter table public.blog_post_comments
  alter column author_id set default auth.uid();
create index if not exists blog_post_comments_author_id_idx on public.blog_post_comments (author_id);

alter table public.blog_post_reactions
  add column if not exists user_id uuid references public.community_users (id) on delete set null;
alter table public.blog_post_reactions
  alter column user_id set default auth.uid();
create index if not exists blog_post_reactions_user_id_idx on public.blog_post_reactions (user_id);

-- RLS
alter table public.community_users enable row level security;
alter table public.blog_posts enable row level security;
alter table public.blog_post_comments enable row level security;
alter table public.blog_post_reactions enable row level security;
alter table public.blog_post_views enable row level security;

-- community_users policies
drop policy if exists "Community profiles are viewable by everyone" on public.community_users;
create policy "Community profiles are viewable by everyone"
on public.community_users
for select
using (true);

drop policy if exists "Users can create their own profile" on public.community_users;
create policy "Users can create their own profile"
on public.community_users
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "Users can update their own profile" on public.community_users;
create policy "Users can update their own profile"
on public.community_users
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- blog_posts policies
drop policy if exists "Anyone can view published blog posts" on public.blog_posts;
create policy "Anyone can view published blog posts"
on public.blog_posts
for select
using (
  status = 'published'
  or (auth.role() = 'authenticated' and author_id = auth.uid())
);

drop policy if exists "Community users can create blog posts" on public.blog_posts;
create policy "Community users can create blog posts"
on public.blog_posts
for insert
to authenticated
with check (
  author_id = auth.uid()
  and exists (select 1 from public.community_users cu where cu.id = auth.uid())
);

drop policy if exists "Authors can update their own blog posts" on public.blog_posts;
create policy "Authors can update their own blog posts"
on public.blog_posts
for update
to authenticated
using (author_id = auth.uid())
with check (author_id = auth.uid());

drop policy if exists "Authors can delete their own blog posts" on public.blog_posts;
create policy "Authors can delete their own blog posts"
on public.blog_posts
for delete
to authenticated
using (author_id = auth.uid());

-- blog_post_comments policies
drop policy if exists "Anyone can view approved comments" on public.blog_post_comments;
create policy "Anyone can view approved comments"
on public.blog_post_comments
for select
using (
  is_approved = true
  or (auth.role() = 'authenticated' and author_id = auth.uid())
);

drop policy if exists "Community users can comment" on public.blog_post_comments;
create policy "Community users can comment"
on public.blog_post_comments
for insert
to authenticated
with check (
  author_id = auth.uid()
  and exists (select 1 from public.community_users cu where cu.id = auth.uid())
);

drop policy if exists "Users can edit their own comments" on public.blog_post_comments;
create policy "Users can edit their own comments"
on public.blog_post_comments
for update
to authenticated
using (author_id = auth.uid())
with check (author_id = auth.uid());

drop policy if exists "Users can delete their own comments" on public.blog_post_comments;
create policy "Users can delete their own comments"
on public.blog_post_comments
for delete
to authenticated
using (author_id = auth.uid());

-- blog_post_reactions policies
-- Best practice applied: require authentication to reduce reaction spam.
drop policy if exists "Anyone can view reactions" on public.blog_post_reactions;
create policy "Anyone can view reactions"
on public.blog_post_reactions
for select
using (true);

drop policy if exists "Community users can react" on public.blog_post_reactions;
create policy "Community users can react"
on public.blog_post_reactions
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (select 1 from public.community_users cu where cu.id = auth.uid())
);

drop policy if exists "Users can update their own reactions" on public.blog_post_reactions;
create policy "Users can update their own reactions"
on public.blog_post_reactions
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can delete their own reactions" on public.blog_post_reactions;
create policy "Users can delete their own reactions"
on public.blog_post_reactions
for delete
to authenticated
using (user_id = auth.uid());

-- blog_post_views policies (keep public for analytics collection).
drop policy if exists "Anyone can read blog post views" on public.blog_post_views;
create policy "Anyone can read blog post views"
on public.blog_post_views
for select
using (true);

drop policy if exists "Anyone can create blog post views" on public.blog_post_views;
create policy "Anyone can create blog post views"
on public.blog_post_views
for insert
with check (true);
