-- Align discussion reaction semantics with blog reactions:
-- - Store up/down response per reaction type
-- - Allow one response per (discussion, user, reaction_type)

alter table public.discussion_reactions
  add column if not exists response text not null default 'up';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'discussion_reactions_response_check'
      and conrelid = 'public.discussion_reactions'::regclass
  ) then
    alter table public.discussion_reactions
      add constraint discussion_reactions_response_check
      check (response in ('up', 'down'));
  end if;
end $$;

drop index if exists public.discussion_reactions_one_per_user_per_discussion;
