alter table public.community_users
add column if not exists profile_links jsonb not null default '[]'::jsonb;

alter table public.community_users
add column if not exists featured_blog_post_slugs text[] not null default '{}'::text[];

