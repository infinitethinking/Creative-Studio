-- Infinite Thinking Practice Booking Platform core schema.
-- This migration defines the first production data model for practices,
-- staff, services, clients, bookings, reminders, vouchers, and loyalty.

create extension if not exists pgcrypto;

create table public.practices (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  address text not null,
  city text not null,
  phone text not null,
  email text not null,
  default_buffer_minutes integer not null default 15 check (default_buffer_minutes >= 0),
  owner_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.staff (
  id uuid primary key default gen_random_uuid(),
  practice_id uuid not null references public.practices(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  slug text not null,
  first_name text not null,
  last_name text not null,
  role text not null check (role in ('owner', 'practitioner', 'assistant')),
  buffer_override_minutes integer check (buffer_override_minutes is null or buffer_override_minutes >= 0),
  working_hours jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (practice_id, slug),
  unique (practice_id, user_id)
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  practice_id uuid not null references public.practices(id) on delete cascade,
  slug text not null,
  name text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  base_price numeric(10, 2) not null check (base_price >= 0),
  price_min numeric(10, 2) check (price_min is null or price_min >= 0),
  price_max numeric(10, 2) check (price_max is null or price_max >= 0),
  payment_timing text not null check (payment_timing in ('upfront', 'post_session')),
  active boolean not null default true,
  unique (practice_id, slug),
  check (price_min is null or price_max is null or price_min <= price_max)
);

create table public.staff_services (
  staff_id uuid not null references public.staff(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  price_override numeric(10, 2) check (price_override is null or price_override >= 0),
  primary key (staff_id, service_id)
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  practice_id uuid not null references public.practices(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  phone text not null,
  email text,
  preferred_channel text not null default 'sms' check (preferred_channel in ('sms', 'email')),
  preferred_staff_id uuid references public.staff(id) on delete set null,
  notes text not null default '',
  last_visit_date date,
  no_show_count integer not null default 0 check (no_show_count >= 0),
  imported_from text not null default 'booking' check (imported_from in ('csv', 'manual', 'booking')),
  created_at timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  practice_id uuid not null references public.practices(id) on delete cascade,
  staff_id uuid not null references public.staff(id) on delete restrict,
  service_id uuid not null references public.services(id) on delete restrict,
  client_id uuid not null references public.clients(id) on delete restrict,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid', 'refunded')),
  payment_timing text not null check (payment_timing in ('upfront', 'post_session')),
  stripe_payment_id text,
  amount numeric(10, 2) not null check (amount >= 0),
  notes text not null default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);

create table public.recurring_bookings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  staff_id uuid not null references public.staff(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  frequency text not null check (frequency in ('weekly', 'biweekly', 'monthly')),
  preferred_day text not null,
  preferred_time time not null,
  start_date date not null,
  end_date date,
  status text not null default 'active' check (status in ('active', 'paused', 'cancelled')),
  conflict_rule text not null default 'offer_alternative' check (conflict_rule in ('skip', 'offer_alternative')),
  check (end_date is null or end_date >= start_date)
);

create table public.smart_reminders (
  id uuid primary key default gen_random_uuid(),
  practice_id uuid not null references public.practices(id) on delete cascade,
  service_id uuid references public.services(id) on delete cascade,
  trigger_after_days integer not null check (trigger_after_days > 0),
  message_template text not null,
  channel text not null check (channel in ('sms', 'email')),
  active boolean not null default true
);

create table public.gift_vouchers (
  id uuid primary key default gen_random_uuid(),
  practice_id uuid not null references public.practices(id) on delete cascade,
  code text not null unique,
  amount numeric(10, 2) not null check (amount >= 0),
  original_amount numeric(10, 2) not null check (original_amount >= 0),
  issued_to_email text not null,
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz,
  stripe_payment_id text,
  check (amount <= original_amount),
  check (expires_at > issued_at)
);

create table public.loyalty_stamps (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  practice_id uuid not null references public.practices(id) on delete cascade,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  awarded_at timestamptz not null default now(),
  redeemed_at timestamptz
);

create index practices_owner_id_idx on public.practices(owner_id);
create index staff_practice_id_idx on public.staff(practice_id);
create index staff_user_id_idx on public.staff(user_id);
create index services_practice_id_idx on public.services(practice_id);
create index clients_practice_id_idx on public.clients(practice_id);
create index clients_practice_phone_idx on public.clients(practice_id, phone);
create index bookings_practice_start_idx on public.bookings(practice_id, start_time);
create index bookings_staff_start_idx on public.bookings(staff_id, start_time);
create index bookings_client_start_idx on public.bookings(client_id, start_time);
create index smart_reminders_practice_id_idx on public.smart_reminders(practice_id);
create index gift_vouchers_practice_id_idx on public.gift_vouchers(practice_id);
create index loyalty_stamps_client_id_idx on public.loyalty_stamps(client_id);

create or replace function public.is_practice_member(target_practice_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.staff
    where staff.practice_id = target_practice_id
      and staff.user_id = auth.uid()
      and staff.active = true
  )
  or exists (
    select 1
    from public.practices
    where practices.id = target_practice_id
      and practices.owner_id = auth.uid()
  );
$$;

create or replace function public.is_practice_admin(target_practice_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.practices
    where practices.id = target_practice_id
      and practices.owner_id = auth.uid()
  )
  or exists (
    select 1
    from public.staff
    where staff.practice_id = target_practice_id
      and staff.user_id = auth.uid()
      and staff.active = true
      and staff.role in ('owner', 'assistant')
  );
$$;

alter table public.practices enable row level security;
alter table public.staff enable row level security;
alter table public.services enable row level security;
alter table public.staff_services enable row level security;
alter table public.clients enable row level security;
alter table public.bookings enable row level security;
alter table public.recurring_bookings enable row level security;
alter table public.smart_reminders enable row level security;
alter table public.gift_vouchers enable row level security;
alter table public.loyalty_stamps enable row level security;

create policy "members can view practices"
  on public.practices for select
  using (public.is_practice_member(id));

create policy "owners can update practices"
  on public.practices for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "admins can manage staff"
  on public.staff for all
  using (public.is_practice_admin(practice_id))
  with check (public.is_practice_admin(practice_id));

create policy "members can view staff"
  on public.staff for select
  using (public.is_practice_member(practice_id));

create policy "members can view services"
  on public.services for select
  using (public.is_practice_member(practice_id));

create policy "admins can manage services"
  on public.services for all
  using (public.is_practice_admin(practice_id))
  with check (public.is_practice_admin(practice_id));

create policy "members can view staff services"
  on public.staff_services for select
  using (
    exists (
      select 1
      from public.staff
      where staff.id = staff_services.staff_id
        and public.is_practice_member(staff.practice_id)
    )
  );

create policy "admins can manage staff services"
  on public.staff_services for all
  using (
    exists (
      select 1
      from public.staff
      where staff.id = staff_services.staff_id
        and public.is_practice_admin(staff.practice_id)
    )
  )
  with check (
    exists (
      select 1
      from public.staff
      where staff.id = staff_services.staff_id
        and public.is_practice_admin(staff.practice_id)
    )
  );

create policy "members can manage clients"
  on public.clients for all
  using (public.is_practice_member(practice_id))
  with check (public.is_practice_member(practice_id));

create policy "members can manage bookings"
  on public.bookings for all
  using (public.is_practice_member(practice_id))
  with check (public.is_practice_member(practice_id));

create policy "members can manage recurring bookings"
  on public.recurring_bookings for all
  using (
    exists (
      select 1
      from public.clients
      where clients.id = recurring_bookings.client_id
        and public.is_practice_member(clients.practice_id)
    )
  )
  with check (
    exists (
      select 1
      from public.clients
      where clients.id = recurring_bookings.client_id
        and public.is_practice_member(clients.practice_id)
    )
  );

create policy "admins can manage smart reminders"
  on public.smart_reminders for all
  using (public.is_practice_admin(practice_id))
  with check (public.is_practice_admin(practice_id));

create policy "members can manage gift vouchers"
  on public.gift_vouchers for all
  using (public.is_practice_member(practice_id))
  with check (public.is_practice_member(practice_id));

create policy "members can manage loyalty stamps"
  on public.loyalty_stamps for all
  using (public.is_practice_member(practice_id))
  with check (public.is_practice_member(practice_id));
