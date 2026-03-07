-- Prefer OAuth provider metadata (full_name, picture, etc.) when creating community_users.
-- Supabase maps provider profiles into raw_user_meta_data; keys vary by provider.
create or replace function public.handle_new_community_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  display_name text;
  avatar text;
begin
  display_name := coalesce(
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'full_name',
    trim((new.raw_user_meta_data->>'given_name') || ' ' || coalesce(new.raw_user_meta_data->>'family_name', '')),
    split_part(new.email, '@', 1)
  );
  if display_name is null or display_name = '' then
    display_name := split_part(new.email, '@', 1);
  end if;

  avatar := coalesce(
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'picture',
    new.raw_user_meta_data->>'image'
  );

  insert into public.community_users (id, name, username, email, bio, avatar_url)
  values (
    new.id,
    left(display_name, 120),
    'user_' || substring(replace(new.id::text, '-', ''), 1, 12),
    new.email,
    new.raw_user_meta_data->>'bio',
    avatar
  )
  on conflict (id) do nothing;

  return new;
end;
$$;
