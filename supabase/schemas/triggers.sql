create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure handle_new_user();

-- create trigger profiles_updated_at
-- before update on public.profiles
-- for each row
-- execute function public.update_updated_at();