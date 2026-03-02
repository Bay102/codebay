-- Add landing-page-specific featured flags and admin controls.

-- Blog posts featured on the community landing page.
alter table public.blog_posts
  add column if not exists featured_on_community_landing boolean not null default false;

-- Community profiles featured on the community landing page.
alter table public.community_users
  add column if not exists featured_on_community_landing boolean not null default false;

-- User type for role-based admin checks.
alter table public.community_users
  add column if not exists user_type text not null default 'community_member';

-- Admin policy helpers: allow admins to update any row for landing flags.

drop policy if exists "Admins can manage landing featured flags on profiles" on public.community_users;
create policy "Admins can manage landing featured flags on profiles"
on public.community_users
for update
to authenticated
using (
  exists (
    select 1
    from public.community_users cu
    where cu.id = auth.uid()
      and cu.user_type = 'admin'
  )
)
with check (true);

drop policy if exists "Admins can manage landing featured flags on posts" on public.blog_posts;
create policy "Admins can manage landing featured flags on posts"
on public.blog_posts
for update
to authenticated
using (
  exists (
    select 1
    from public.community_users cu
    where cu.id = auth.uid()
      and cu.user_type = 'admin'
  )
)
with check (true);

