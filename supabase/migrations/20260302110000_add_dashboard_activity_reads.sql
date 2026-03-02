-- Track which dashboard activity items a user has marked as read.
create table if not exists public.dashboard_activity_reads (
  user_id uuid not null default auth.uid() references public.community_users (id) on delete cascade,
  activity_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, activity_id)
);

create index if not exists dashboard_activity_reads_user_created_at_idx
  on public.dashboard_activity_reads (user_id, created_at desc);

alter table public.dashboard_activity_reads enable row level security;

drop policy if exists "Users can manage their activity reads" on public.dashboard_activity_reads;
create policy "Users can manage their activity reads"
on public.dashboard_activity_reads
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

