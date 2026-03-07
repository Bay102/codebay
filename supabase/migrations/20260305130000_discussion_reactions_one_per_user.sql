-- Ensure at most one reaction per (discussion_id, user_id) and clean up any duplicates.

-- 1) Deduplicate existing reactions so there is at most one row per (discussion_id, user_id).
delete from public.discussion_reactions a
using public.discussion_reactions b
where a.id < b.id
  and a.discussion_id = b.discussion_id
  and a.user_id = b.user_id;

-- 2) Enforce the invariant at the database level.
create unique index if not exists discussion_reactions_one_per_user_per_discussion
  on public.discussion_reactions (discussion_id, user_id);

