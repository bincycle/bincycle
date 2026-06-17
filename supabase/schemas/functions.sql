create or replace function public.get_my_role()
returns text
language sql
security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

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

create or replace function sync_pickup_payment_status()
returns trigger as $$
begin
  update pickups
  set
    payment_status = case new.status
      when 'paid'           then 'paid'
      when 'refunded'       then 'refunded'
      when 'partial_refund' then 'refunded'
      else 'unpaid'
    end,
    updated_at = now()
  where id = new.pickup_id;
  return new;
end;
$$ language plpgsql security definer;
