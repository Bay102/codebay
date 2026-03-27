-- Persist small sparkline point sets for momentum/impact visualizations.
-- These are optional caches for UI and can be populated by scheduled jobs.

alter table public.blog_posts
  add column if not exists momentum_graph_points jsonb not null default '[]'::jsonb,
  add column if not exists impact_graph_points jsonb not null default '[]'::jsonb;

alter table public.discussions
  add column if not exists momentum_graph_points jsonb not null default '[]'::jsonb,
  add column if not exists impact_graph_points jsonb not null default '[]'::jsonb;
