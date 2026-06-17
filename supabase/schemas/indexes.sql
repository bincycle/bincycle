-- ============================================================
-- INDEXES
-- ============================================================
-- Run after tables are created.
-- Covers: FK lookups, status filtering, date range queries,
--         geo queries, and the human-readable pickup_id.
-- ============================================================


-- ------------------------------------------------------------
-- profiles
-- ------------------------------------------------------------
create index idx_profiles_role on profiles(role);
-- Useful for admin dashboards listing all customers / executives


-- ------------------------------------------------------------
-- addresses
-- ------------------------------------------------------------
create index idx_addresses_customer_id on addresses(customer_id);
-- Every address lookup is by customer


-- ------------------------------------------------------------
-- executive_profiles
-- ------------------------------------------------------------
create index idx_executive_profiles_service_area on executive_profiles(service_area_id);
-- Dispatcher queries: "which executives cover this zone?"

create index idx_executive_profiles_available on executive_profiles(is_available)
  where is_available = true;
-- Partial index — only indexes rows where executive is on shift


-- ------------------------------------------------------------
-- pickups
-- ------------------------------------------------------------

-- The two most common lookup patterns
create index idx_pickups_customer_id on pickups(customer_id);
create index idx_pickups_executive_id on pickups(executive_id);

-- Status is filtered constantly (pending queue, active jobs, etc.)
create index idx_pickups_status on pickups(status);

-- Admin/ops queries by date range
create index idx_pickups_scheduled_date on pickups(scheduled_date);

-- Compound: executive's pickups for a given day (most frequent dispatcher query)
create index idx_pickups_executive_date
  on pickups(executive_id, scheduled_date)
  where status not in ('cancelled', 'completed');
-- Partial index excludes terminal states to keep it lean

-- Human-readable ID is unique but also queried by support teams
-- The UNIQUE constraint already creates an index, so no extra needed for pickup_id

-- Compound: pending/confirmed pickups by date (for assignment queue)
create index idx_pickups_pending_by_date
  on pickups(scheduled_date, status)
  where status in ('pending', 'confirmed');
