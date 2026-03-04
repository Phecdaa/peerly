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
  booking_id int not null references public.bookings (id) on delete cascade,
  amount numeric not null,
  platform_fee numeric not null,
  mentor_amount numeric not null,
  status text not null,
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

