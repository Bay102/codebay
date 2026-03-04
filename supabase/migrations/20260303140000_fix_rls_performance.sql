-- Fix auth.initplan issues by wrapping auth.uid() in a SELECT
-- and remove multiple permissive SELECT policies on user_follows.

-- 1) user_follows: split manage policy and avoid SELECT overlap

drop policy if exists "Users can manage own follows" on public.user_follows;

create policy "Users can insert own follows"
  on public.user_follows
  for insert
  to authenticated
  with check (follower_id = (select auth.uid()));

create policy "Users can delete own follows"
  on public.user_follows
  for delete
  to authenticated
  using (follower_id = (select auth.uid()));

-- 2) discussions

alter policy "Authenticated can insert discussions"
  on public.discussions
  with check (author_id = (select auth.uid()));

alter policy "Author can update own discussions"
  on public.discussions
  using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));

alter policy "Author can delete own discussions"
  on public.discussions
  using (author_id = (select auth.uid()));

-- 3) discussion_comments

alter policy "Authenticated can insert discussion_comments"
  on public.discussion_comments
  with check (author_id = (select auth.uid()));

alter policy "Author can update own discussion_comments"
  on public.discussion_comments
  using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));

alter policy "Author can delete own discussion_comments"
  on public.discussion_comments
  using (author_id = (select auth.uid()));

-- 4) discussion_reactions

alter policy "Authenticated can insert discussion_reactions"
  on public.discussion_reactions
  with check (user_id = (select auth.uid()));

alter policy "User can delete own discussion_reactions"
  on public.discussion_reactions
  using (user_id = (select auth.uid()));