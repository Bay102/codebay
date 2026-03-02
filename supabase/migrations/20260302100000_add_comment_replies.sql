-- Add parent_id to blog_post_comments for threaded replies.
-- A reply references the comment it replies to; top-level comments have parent_id = null.
alter table public.blog_post_comments
  add column if not exists parent_id uuid references public.blog_post_comments (id) on delete cascade;

create index if not exists blog_post_comments_parent_id_idx on public.blog_post_comments (parent_id);

comment on column public.blog_post_comments.parent_id is 'When set, this comment is a reply to the referenced comment. Null for top-level comments.';
