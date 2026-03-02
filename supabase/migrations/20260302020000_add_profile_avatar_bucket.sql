-- Storage bucket for community user profile images
insert into storage.buckets (id, name, public)
values ('community-profile-avatars', 'Community profile avatars', true)
on conflict (id) do nothing;

-- Allow public read access to profile images
drop policy if exists "Public read for community profile avatars" on storage.objects;
create policy "Public read for community profile avatars"
on storage.objects
for select
using (bucket_id = 'community-profile-avatars');

-- Allow authenticated users to upload their own profile image
drop policy if exists "Users can upload their own profile avatar" on storage.objects;
create policy "Users can upload their own profile avatar"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'community-profile-avatars'
  and split_part(name, '/', 1) = auth.uid()::text
);

-- Allow authenticated users to update their own profile image
drop policy if exists "Users can update their own profile avatar" on storage.objects;
create policy "Users can update their own profile avatar"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'community-profile-avatars'
  and split_part(name, '/', 1) = auth.uid()::text
)
with check (
  bucket_id = 'community-profile-avatars'
  and split_part(name, '/', 1) = auth.uid()::text
);

-- Allow authenticated users to delete their own profile image
drop policy if exists "Users can delete their own profile avatar" on storage.objects;
create policy "Users can delete their own profile avatar"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'community-profile-avatars'
  and split_part(name, '/', 1) = auth.uid()::text
);

