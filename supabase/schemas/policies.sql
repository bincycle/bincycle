-- Enable RLS
alter table profiles enable row level security;
alter table addresses enable row level security;
alter table service_areas enable row level security;
alter table executive_profiles enable row level security;
alter table pickups enable row level security;
alter table payments enable row level security;


-- ------------------------------------------------------------
-- profiles
-- ------------------------------------------------------------

create policy "profiles: read own or admin"
  on profiles for select
  using (
    id = auth.uid()
    or get_my_role() = 'admin'
    or (
      get_my_role() = 'executive'
      and exists (
        select 1 from pickups
        where pickups.customer_id = profiles.id
          and pickups.executive_id = auth.uid()
      )
    )
  );

create policy "profiles: update own or admin"
  on profiles for update
  using (id = auth.uid() or get_my_role() = 'admin')
  with check (id = auth.uid() or get_my_role() = 'admin');

create policy "profiles: insert admin only"
  on profiles for insert
  with check (get_my_role() = 'admin');

create policy "profiles: delete admin only"
  on profiles for delete
  using (get_my_role() = 'admin');


-- ------------------------------------------------------------
-- addresses
-- ------------------------------------------------------------

create policy "addresses: read"
  on addresses for select
  using (
    customer_id = auth.uid()
    or get_my_role() = 'admin'
    or (
      get_my_role() = 'executive'
      and exists (
        select 1 from pickups
        where pickups.address_id = addresses.id
          and pickups.executive_id = auth.uid()
      )
    )
  );

create policy "addresses: insert own or admin"
  on addresses for insert
  with check (customer_id = auth.uid() or get_my_role() = 'admin');

create policy "addresses: update own or admin"
  on addresses for update
  using (customer_id = auth.uid() or get_my_role() = 'admin')
  with check (customer_id = auth.uid() or get_my_role() = 'admin');

create policy "addresses: delete own or admin"
  on addresses for delete
  using (customer_id = auth.uid() or get_my_role() = 'admin');


-- ------------------------------------------------------------
-- service_areas
-- ------------------------------------------------------------

create policy "service_areas: read authenticated"
  on service_areas for select
  using (auth.uid() is not null);

create policy "service_areas: write admin only"
  on service_areas for insert
  with check (get_my_role() = 'admin');

create policy "service_areas: update admin only"
  on service_areas for update
  using (get_my_role() = 'admin');

create policy "service_areas: delete admin only"
  on service_areas for delete
  using (get_my_role() = 'admin');


-- ------------------------------------------------------------
-- executive_profiles
-- ------------------------------------------------------------

create policy "executive_profiles: read"
  on executive_profiles for select
  using (id = auth.uid() or get_my_role() = 'admin');

create policy "executive_profiles: insert admin only"
  on executive_profiles for insert
  with check (get_my_role() = 'admin');

create policy "executive_profiles: update"
  on executive_profiles for update
  using (id = auth.uid() or get_my_role() = 'admin')
  with check (id = auth.uid() or get_my_role() = 'admin');

create policy "executive_profiles: delete admin only"
  on executive_profiles for delete
  using (get_my_role() = 'admin');


-- ------------------------------------------------------------
-- pickups
-- ------------------------------------------------------------

create policy "pickups: read"
  on pickups for select
  using (
    customer_id = auth.uid()
    or executive_id = auth.uid()
    or get_my_role() = 'admin'
  );

create policy "pickups: insert"
  on pickups for insert
  with check (
    (
      get_my_role() = 'customer'
      and customer_id = auth.uid()
      and exists (
        select 1 from addresses
        where addresses.id = address_id
          and (
            pincode like '560%'
            or pincode like '561%'
            or pincode like '562%'
          )
      )
    )
    or get_my_role() = 'admin'
  );

create policy "pickups: update"
  on pickups for update
  using (
    (get_my_role() = 'customer' and customer_id = auth.uid()
      and status in ('pending', 'confirmed'))
    or (get_my_role() = 'executive' and executive_id = auth.uid())
    or get_my_role() = 'admin'
  );

create policy "pickups: delete admin only"
  on pickups for delete
  using (get_my_role() = 'admin');


-- ------------------------------------------------------------
-- payments
-- ------------------------------------------------------------

create policy "payments: read own or admin"
  on payments for select
  using (customer_id = auth.uid() or get_my_role() = 'admin');

create policy "payments: insert own"
  on payments for insert
  with check (customer_id = auth.uid() or get_my_role() = 'admin');

create policy "payments: update admin only"
  on payments for update
  using (get_my_role() = 'admin');

create policy "payments: delete admin only"
  on payments for delete
  using (get_my_role() = 'admin');
