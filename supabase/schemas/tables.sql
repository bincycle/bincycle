create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'executive', 'admin')),
  avatar_url text,
  is_active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references profiles(id) on delete cascade,
  label text,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  pincode text not null,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  is_default boolean default false,
  created_at timestamptz default now()
);

create table service_areas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  pincodes text[],
  is_active boolean default true,
  created_at timestamptz default now()
);

create table executive_profiles (
  id uuid primary key references profiles(id) on delete cascade,
  service_area_id uuid references service_areas(id),
  vehicle_number text,
  vehicle_type text,
  is_available boolean default true,
  current_latitude numeric(10, 7),
  current_longitude numeric(10, 7),
  rating numeric(3, 2) default 5.0,
  total_pickups int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table pickups (
  id uuid primary key default gen_random_uuid(),
  pickup_id text unique not null,
  customer_id uuid not null references profiles(id),
  executive_id uuid references profiles(id),
  address_id uuid not null references addresses(id),

  status text not null default 'pending' check (status in (
    'pending', 'confirmed', 'assigned', 'en_route',
    'arrived', 'collected', 'completed', 'cancelled'
  )),

  image_urls text[] DEFAULT '{}',

  scheduled_date date not null,
  scheduled_slot text,
  picked_up_at timestamptz,

  notes text,
  cancellation_reason text,
  cancelled_by uuid references profiles(id),

  total_amount numeric(10, 2) default 0,
  payment_status text default 'unpaid' check (payment_status in ('unpaid', 'paid', 'refunded')),
  payment_method text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  pickup_id uuid not null references pickups(id) on delete restrict,
  customer_id uuid not null references profiles(id),

  amount numeric(10, 2) not null,
  currency text not null default 'INR',

  status text not null default 'pending' check (status in (
    'pending', 'paid', 'failed', 'refunded', 'partial_refund'
  )),

  method text check (method in (
    'upi', 'card', 'netbanking', 'wallet', 'cash', 'free'
  )),

  gateway text,
  gateway_order_id text,
  gateway_payment_id text,
  gateway_signature text,

  paid_at timestamptz,
  refunded_at timestamptz,
  refund_amount numeric(10, 2),
  refund_reason text,

  metadata jsonb,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
