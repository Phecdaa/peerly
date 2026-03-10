-- SCHEMA: tables & basic helpers

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  university text,
  role text not null default 'learner', -- 'learner' | 'admin'
  is_mentor boolean not null default false,
  mentor_status text not null default 'none', -- 'none' | 'pending' | 'approved' | 'rejected'
  hourly_rate numeric,
  bio text,
  created_at timestamptz not null default now(),
  constraint mentor_status_check
    check (mentor_status in ('none','pending','approved','rejected'))
);

create table if not exists public.courses (
  id serial primary key,
  name text not null,
  slug text not null unique
);

create table if not exists public.mentor_courses (
  mentor_id uuid not null references public.profiles (id) on delete cascade,
  course_id int not null references public.courses (id) on delete cascade,
  primary key (mentor_id, course_id)
);

create table if not exists public.availabilities (
  id serial primary key,
  mentor_id uuid not null references public.profiles (id) on delete cascade,
  start_ts timestamptz not null,
  end_ts timestamptz not null,
  max_students int not null default 1,
  constraint availability_time_check
    check (end_ts > start_ts)
);

create table if not exists public.bookings (
  id serial primary key,
  learner_id uuid not null references public.profiles (id) on delete cascade,
  mentor_id uuid not null references public.profiles (id) on delete cascade,
  course_id int not null references public.courses (id) on delete restrict,
  start_ts timestamptz not null,
  end_ts timestamptz not null,
  duration_minutes int not null,
  status text not null,
  meeting_link text,
  created_at timestamptz not null default now(),
  constraint booking_status_check
    check (status in ('pending','accepted','paid','completed','cancelled','no_show')),
  constraint booking_time_check
    check (end_ts > start_ts)
);

create table if not exists public.payments (
  id serial primary key,
  booking_id int references public.bookings (id) on delete cascade,
  amount numeric not null,
  platform_fee numeric not null,
  mentor_amount numeric not null,
  status text not null,
  metadata jsonb,
  created_at timestamptz not null default now(),
  constraint payment_status_check
    check (status in ('escrow','released','refunded'))
);

create table if not exists public.reviews (
  id serial primary key,
  booking_id int not null unique references public.bookings (id) on delete cascade,
  rating int not null,
  comment text,
  created_at timestamptz not null default now(),
  constraint rating_range_check
    check (rating between 1 and 5)
);

-- ROOMS: group sessions anchored to mentor availability
create table if not exists public.rooms (
  id serial primary key,
  mentor_id uuid not null references public.profiles (id) on delete restrict,
  host_id uuid not null references public.profiles (id) on delete restrict,
  availability_id int not null references public.availabilities (id) on delete restrict,
  title text,
  description text,
  is_public boolean not null default false,
  mode text not null default 'online',
  payment_mode text not null default 'split_equal',
  scheduled_start timestamptz not null,
  scheduled_end timestamptz not null,
  status text not null default 'pending_payment',
  cancel_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint room_status_check
    check (status in (
      'pending_payment',
      'waiting_mentor_approval',
      'scheduled',
      'ongoing',
      'finished',
      'cancelled'
    )),
  constraint room_mode_check
    check (mode in ('online','offline','hybrid')),
  constraint room_payment_mode_check
    check (payment_mode in ('split_equal','split_custom')),
  constraint room_time_check
    check (scheduled_end > scheduled_start)
);

-- Link bookings to rooms to support multi-participant sessions
alter table public.bookings
  add column if not exists room_id int references public.rooms (id) on delete set null;

-- ROOM PARTICIPANTS: host + invited learners with payment info
create table if not exists public.room_participants (
  id serial primary key,
  room_id int not null references public.rooms (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'participant',
  has_paid boolean not null default false,
  amount_to_pay numeric not null default 0,
  amount_paid numeric not null default 0,
  joined_at timestamptz not null default now(),
  constraint room_participant_role_check
    check (role in ('host','participant')),
  constraint room_participant_amount_check
    check (amount_to_pay >= 0 and amount_paid >= 0),
  unique (room_id, user_id)
);

-- TEMPORAL CHAT MESSAGES PER ROOM
create table if not exists public.room_messages (
  id serial primary key,
  room_id int not null references public.rooms (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- SESSION NOTES written by mentor, one per room
create table if not exists public.session_notes (
  id serial primary key,
  room_id int not null unique references public.rooms (id) on delete cascade,
  mentor_id uuid not null references public.profiles (id) on delete restrict,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- REPORTS: abuse / quality reports on mentors, students, or rooms
create table if not exists public.reports (
  id serial primary key,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  target_type text not null,
  target_id text not null,
  reason text not null,
  status text not null default 'open',
  admin_reviewer_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint report_target_type_check
    check (target_type in ('mentor','student','room')),
  constraint report_status_check
    check (status in ('open','in_review','resolved','dismissed'))
);

-- ADMIN LOGS: audit trail of admin actions
create table if not exists public.admin_logs (
  id serial primary key,
  admin_id uuid not null references public.profiles (id) on delete restrict,
  action text not null,
  target_type text,
  target_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- WALLET / LEDGER ENTRIES for mentor payouts & refunds
create table if not exists public.wallet_entries (
  id serial primary key,
  mentor_id uuid references public.profiles (id) on delete set null,
  booking_id int references public.bookings (id) on delete set null,
  room_id int references public.rooms (id) on delete set null,
  entry_type text not null,
  amount numeric not null,
  reason text,
  created_at timestamptz not null default now(),
  constraint wallet_entry_type_check
    check (entry_type in ('credit','debit')),
  constraint wallet_amount_check
    check (amount >= 0)
);

-- Extend PAYMENTS with provider & idempotency metadata for Stripe/mock integration
alter table public.payments
  add column if not exists metadata jsonb,
  add column if not exists provider text,
  add column if not exists provider_payment_id text,
  add column if not exists direction text,
  add column if not exists idempotency_key text;

alter table public.payments
  add constraint payment_direction_check
    check (direction in ('student_to_platform','platform_to_mentor'));

create unique index if not exists payments_idempotency_key_idx
  on public.payments (idempotency_key)
  where idempotency_key is not null;

-- Helper function to detect admin based on profiles.role
create or replace function public.is_admin(p_user_id uuid)
returns boolean
language sql
stable
as $$
  select exists(
    select 1
    from public.profiles p
    where p.id = p_user_id
      and p.role = 'admin'
  );
$$;

