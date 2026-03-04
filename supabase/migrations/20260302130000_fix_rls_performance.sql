-- Fix Supabase RLS performance: use (select auth.uid()) for initplan and consolidate multiple permissive UPDATE policies.

-- 1. dashboard_activity_reads: avoid re-evaluating auth.uid() per row
drop policy if exists "Users can manage their activity reads" on public.dashboard_activity_reads;
create policy "Users can manage their activity reads"
on public.dashboard_activity_reads
for all
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

-- 2. community_users: single UPDATE policy (own profile OR admin) with initplan-friendly auth
drop policy if exists "Admins can manage landing featured flags on profiles" on public.community_users;
drop policy if exists "Users can update their own profile" on public.community_users;
drop policy if exists "Users can update own profile or admins can update any" on public.community_users;
create policy "Users can update own profile or admins can update any"
on public.community_users
for update
to authenticated
using (
  id = (select auth.uid())
  or exists (
    select 1
    from public.community_users cu
    where cu.id = (select auth.uid())
      and cu.user_type = 'admin'
  )
)
with check (
  id = (select auth.uid())
  or exists (
    select 1
    from public.community_users cu
    where cu.id = (select auth.uid())
      and cu.user_type = 'admin'
  )
);

drop policy if exists "Admins can manage landing featured flags on posts" on public.blog_posts;
drop policy if exists "Authors can update their own blog posts" on public.blog_posts;
drop policy if exists "Authors can update own blog posts" on public.blog_posts;
drop policy if exists "Authors can update own posts or admins can update any" on public.blog_posts;
create policy "Authors can update own posts or admins can update any"
on public.blog_posts
for update
to authenticated
using (
  author_id = (select auth.uid())
  or exists (
    select 1
    from public.community_users cu
    where cu.id = (select auth.uid())
      and cu.user_type = 'admin'
  )
)
with check (
  author_id = (select auth.uid())
  or exists (
    select 1
    from public.community_users cu
    where cu.id = (select auth.uid())
      and cu.user_type = 'admin'
  )
);
