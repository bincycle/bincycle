-- create or replace function handle_new_user()
-- returns trigger as $$
-- begin
  -- insert into profiles (id, full_name, role)
  -- values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'role');
  -- return new;
-- end;
-- $$ language plpgsql security definer;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    phone
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'phone'
  );

  return new;
end;
$$;

-- create or replace function public.update_updated_at()
-- returns trigger
-- language plpgsql
-- as $$
-- begin
  -- new.updated_at = now();
  -- return new;
-- end;
-- $$;
