-- Enable RLS & define policies

-- PROFILES
alter table public.profiles enable row level security;

-- Users can view their own profile
drop policy if exists "Profiles: users can select own" on public.profiles;
create policy "Profiles: users can select own"
on public.profiles
for select
using (auth.uid() = id);

-- Admins can view all profiles
drop policy if exists "Profiles: admins can select all" on public.profiles;
create policy "Profiles: admins can select all"
on public.profiles
for select
using (public.is_admin(auth.uid()));

-- Authenticated users can view approved mentor profiles (for browsing/booking)
drop policy if exists "Profiles: users can view approved mentors" on public.profiles;
create policy "Profiles: users can view approved mentors"
on public.profiles
for select
using (
  is_mentor = true
  and mentor_status = 'approved'
  and auth.uid() is not null
);

-- Users can update their own profile
drop policy if exists "Profiles: users can update own" on public.profiles;
create policy "Profiles: users can update own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Admins can update all profiles
drop policy if exists "Profiles: admins can update all" on public.profiles;
create policy "Profiles: admins can update all"
on public.profiles
for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- No insert policy: profiles created only via trigger handle_new_user


-- COURSES
alter table public.courses enable row level security;

-- Public can read courses
drop policy if exists "Courses: public read" on public.courses;
create policy "Courses: public read"
on public.courses
for select
using (true);

-- Admin can manage courses
drop policy if exists "Courses: admin write" on public.courses;
create policy "Courses: admin write"
on public.courses
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));


-- MENTOR_COURSES
alter table public.mentor_courses enable row level security;

-- Public can read mentor_courses
drop policy if exists "MentorCourses: public read" on public.mentor_courses;
create policy "MentorCourses: public read"
on public.mentor_courses
for select
using (true);

-- Mentors can manage their own courses
drop policy if exists "MentorCourses: mentors manage own" on public.mentor_courses;
create policy "MentorCourses: mentors manage own"
on public.mentor_courses
for all
using (auth.uid() = mentor_id)
with check (auth.uid() = mentor_id);

-- Admin can manage all
drop policy if exists "MentorCourses: admin manage all" on public.mentor_courses;
create policy "MentorCourses: admin manage all"
on public.mentor_courses
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));


-- AVAILABILITIES
alter table public.availabilities enable row level security;

-- Public can read availability slots
drop policy if exists "Availabilities: public read" on public.availabilities;
create policy "Availabilities: public read"
on public.availabilities
for select
using (true);

-- Mentors can manage their own availabilities (only when approved)
drop policy if exists "Availabilities: mentors manage own approved" on public.availabilities;
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
drop policy if exists "Availabilities: admin manage all" on public.availabilities;
create policy "Availabilities: admin manage all"
on public.availabilities
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));


-- BOOKINGS
alter table public.bookings enable row level security;

-- Learners can create bookings for themselves
drop policy if exists "Bookings: learner insert own" on public.bookings;
create policy "Bookings: learner insert own"
on public.bookings
for insert
with check (auth.uid() = learner_id);

-- Learners & mentors & admins can read relevant bookings
drop policy if exists "Bookings: learners read own" on public.bookings;
create policy "Bookings: learners read own"
on public.bookings
for select
using (auth.uid() = learner_id);

drop policy if exists "Bookings: mentors read own" on public.bookings;
create policy "Bookings: mentors read own"
on public.bookings
for select
using (auth.uid() = mentor_id);

drop policy if exists "Bookings: admin read all" on public.bookings;
create policy "Bookings: admin read all"
on public.bookings
for select
using (public.is_admin(auth.uid()));

-- Learner can update (e.g. cancel) own bookings
drop policy if exists "Bookings: learner update own" on public.bookings;
create policy "Bookings: learner update own"
on public.bookings
for update
using (auth.uid() = learner_id)
with check (auth.uid() = learner_id);

-- Mentor can update bookings assigned to them (e.g. accept)
drop policy if exists "Bookings: mentor update own" on public.bookings;
create policy "Bookings: mentor update own"
on public.bookings
for update
using (auth.uid() = mentor_id)
with check (auth.uid() = mentor_id);

-- Admin can update all bookings
drop policy if exists "Bookings: admin update all" on public.bookings;
create policy "Bookings: admin update all"
on public.bookings
for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));


-- PAYMENTS
alter table public.payments enable row level security;

-- No policies: only accessible via service_role on server.
-- Do not expose direct Supabase client access from frontend.


alter table public.reviews enable row level security;

-- Public can read reviews
drop policy if exists "Reviews: public read" on public.reviews;
create policy "Reviews: public read"
on public.reviews
for select
using (true);

-- Learners can insert review for their completed bookings only
drop policy if exists "Reviews: learner insert for completed booking" on public.reviews;
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
drop policy if exists "Reviews: admin manage all" on public.reviews;
create policy "Reviews: admin manage all"
on public.reviews
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));


-- ROOMS
alter table public.rooms enable row level security;

-- Participants, mentor, and admins can read room details
create policy "Rooms: participants and mentor read"
on public.rooms
for select
using (
  public.is_admin(auth.uid())
  or mentor_id = auth.uid()
  or exists (
    select 1
    from public.room_participants rp
    where rp.room_id = id
      and rp.user_id = auth.uid()
  )
);

-- ROOM_PARTICIPANTS
alter table public.room_participants enable row level security;

-- Participants themselves, mentor, and admins can read participants list
create policy "RoomParticipants: participants and mentor read"
on public.room_participants
for select
using (
  public.is_admin(auth.uid())
  or user_id = auth.uid()
  or exists (
    select 1
    from public.rooms r
    where r.id = room_id
      and r.mentor_id = auth.uid()
  )
);


-- ROOM_MESSAGES (temporal chat)
alter table public.room_messages enable row level security;

-- Participants & mentor & admins can read messages
create policy "RoomMessages: participants and mentor read"
on public.room_messages
for select
using (
  public.is_admin(auth.uid())
  or exists (
    select 1
    from public.room_participants rp
    where rp.room_id = room_id
      and rp.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.rooms r
    where r.id = room_id
      and r.mentor_id = auth.uid()
  )
);

-- Participants & mentor can insert messages while they are part of the room
create policy "RoomMessages: participants insert"
on public.room_messages
for insert
with check (
  exists (
    select 1
    from public.room_participants rp
    where rp.room_id = room_id
      and rp.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.rooms r
    where r.id = room_id
      and r.mentor_id = auth.uid()
  )
);


-- SESSION_NOTES
alter table public.session_notes enable row level security;

-- Participants and mentor can read notes
create policy "SessionNotes: participants and mentor read"
on public.session_notes
for select
using (
  public.is_admin(auth.uid())
  or exists (
    select 1
    from public.room_participants rp
    where rp.room_id = room_id
      and rp.user_id = auth.uid()
  )
  or mentor_id = auth.uid()
);

-- Mentor can insert/update their own notes
create policy "SessionNotes: mentor manage own"
on public.session_notes
for all
using (mentor_id = auth.uid() or public.is_admin(auth.uid()))
with check (mentor_id = auth.uid() or public.is_admin(auth.uid()));


-- REPORTS
alter table public.reports enable row level security;

-- Reporter can see their own reports, admins can see all
create policy "Reports: reporter read own"
on public.reports
for select
using (reporter_id = auth.uid());

create policy "Reports: admin read all"
on public.reports
for select
using (public.is_admin(auth.uid()));

-- Any authenticated user can create reports for themselves
create policy "Reports: users insert"
on public.reports
for insert
with check (reporter_id = auth.uid());

-- Admins can manage all reports
create policy "Reports: admin manage all"
on public.reports
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));


-- ADMIN_LOGS
alter table public.admin_logs enable row level security;

-- Only admins can read/write admin logs (or service_role bypasses RLS)
create policy "AdminLogs: admins manage all"
on public.admin_logs
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));


-- WALLET_ENTRIES
alter table public.wallet_entries enable row level security;

-- Mentors can read their own wallet entries; admins can read all
create policy "WalletEntries: mentor read own"
on public.wallet_entries
for select
using (mentor_id = auth.uid());

create policy "WalletEntries: admin read all"
on public.wallet_entries
for select
using (public.is_admin(auth.uid()));


