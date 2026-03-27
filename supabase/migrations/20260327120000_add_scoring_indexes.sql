-- Support score-window queries by content id/slug + created_at.

create index if not exists blog_post_views_slug_created_at_idx
  on public.blog_post_views (slug, created_at desc);

create index if not exists blog_post_reactions_slug_created_at_idx
  on public.blog_post_reactions (slug, created_at desc);

create index if not exists blog_post_comments_slug_created_at_idx
  on public.blog_post_comments (slug, created_at desc);

create index if not exists discussion_comments_discussion_id_created_at_idx
  on public.discussion_comments (discussion_id, created_at desc);

create index if not exists discussion_reactions_discussion_id_created_at_idx
  on public.discussion_reactions (discussion_id, created_at desc);
