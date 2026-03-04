-- Enable RLS & define policies

-- PROFILES
alter table public.profiles enable row level security;

-- Users can view their own profile
create policy "Profiles: users can select own"
on public.profiles
for select
using (auth.uid() = id);

-- Admins can view all profiles
create policy "Profiles: admins can select all"
on public.profiles
for select
using (public.is_admin(auth.uid()));

-- Users can update their own profile
create policy "Profiles: users can update own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Admins can update all profiles
create policy "Profiles: admins can update all"
on public.profiles
for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- No insert policy: profiles created only via trigger handle_new_user


-- COURSES
alter table public.courses enable row level security;

-- Public can read courses
create policy "Courses: public read"
on public.courses
for select
using (true);

-- Admin can manage courses
create policy "Courses: admin write"
on public.courses
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));


-- MENTOR_COURSES
alter table public.mentor_courses enable row level security;

-- Public can read mentor_courses
create policy "MentorCourses: public read"
on public.mentor_courses
for select
using (true);

-- Mentors can manage their own courses
create policy "MentorCourses: mentors manage own"
on public.mentor_courses
for all
using (auth.uid() = mentor_id)
with check (auth.uid() = mentor_id);

-- Admin can manage all
create policy "MentorCourses: admin manage all"
on public.mentor_courses
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));


-- AVAILABILITIES
alter table public.availabilities enable row level security;

-- Public can read availability slots
create policy "Availabilities: public read"
on public.availabilities
for select
using (true);

-- Mentors can manage their own availabilities (only when approved)
create policy "Availabilities: mentors manage own approved"
on public.availabilities
for all
using (
  auth.uid() = mentor_id and
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.mentor_status = 'approved'
  )
)
with check (
  auth.uid() = mentor_id and
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.mentor_status = 'approved'
  )
);

-- Admin can manage all availabilities
create policy "Availabilities: admin manage all"
on public.availabilities
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));


-- BOOKINGS
alter table public.bookings enable row level security;

-- Learners can create bookings for themselves
create policy "Bookings: learner insert own"
on public.bookings
for insert
with check (auth.uid() = learner_id);

-- Learners & mentors & admins can read relevant bookings
create policy "Bookings: learners read own"
on public.bookings
for select
using (auth.uid() = learner_id);

create policy "Bookings: mentors read own"
on public.bookings
for select
using (auth.uid() = mentor_id);

create policy "Bookings: admin read all"
on public.bookings
for select
using (public.is_admin(auth.uid()));

-- Learner can update (e.g. cancel) own bookings
create policy "Bookings: learner update own"
on public.bookings
for update
using (auth.uid() = learner_id)
with check (auth.uid() = learner_id);

-- Mentor can update bookings assigned to them (e.g. accept)
create policy "Bookings: mentor update own"
on public.bookings
for update
using (auth.uid() = mentor_id)
with check (auth.uid() = mentor_id);

-- Admin can update all bookings
create policy "Bookings: admin update all"
on public.bookings
for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));


-- PAYMENTS
alter table public.payments enable row level security;

-- No policies: only accessible via service_role on server.
-- Do not expose direct Supabase client access from frontend.


-- REVIEWS
alter table public.reviews enable row level security;

-- Public can read reviews
create policy "Reviews: public read"
on public.reviews
for select
using (true);

-- Learners can insert review for their completed bookings only
create policy "Reviews: learner insert for completed booking"
on public.reviews
for insert
with check (
  exists (
    select 1
    from public.bookings b
    where b.id = booking_id
      and b.learner_id = auth.uid()
      and b.status = 'completed'
  )
);

-- Admin can manage all reviews
create policy "Reviews: admin manage all"
on public.reviews
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

