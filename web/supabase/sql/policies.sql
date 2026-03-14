-- Enable RLS & define policies

-- PROFILES
alter table public.profiles enable row level security;

drop policy if exists "Profiles: users can select own" on public.profiles;
create policy "Profiles: users can select own" on public.profiles for select using (auth.uid() = id);

drop policy if exists "Profiles: admins can select all" on public.profiles;
create policy "Profiles: admins can select all" on public.profiles for select using (public.is_admin(auth.uid()));

drop policy if exists "Profiles: users can view approved mentors" on public.profiles;
create policy "Profiles: users can view approved mentors" on public.profiles for select using (is_mentor = true and mentor_status = 'approved' and auth.uid() is not null);

drop policy if exists "Profiles: users can update own" on public.profiles;
create policy "Profiles: users can update own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Profiles: admins can update all" on public.profiles;
create policy "Profiles: admins can update all" on public.profiles for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- COURSES
alter table public.courses enable row level security;
drop policy if exists "Courses: public read" on public.courses;
create policy "Courses: public read" on public.courses for select using (true);

drop policy if exists "Courses: admin write" on public.courses;
create policy "Courses: admin write" on public.courses for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- AVAILABILITIES
alter table public.availabilities enable row level security;
drop policy if exists "Availabilities: public read" on public.availabilities;
create policy "Availabilities: public read" on public.availabilities for select using (true);

drop policy if exists "Availabilities: mentors manage own approved" on public.availabilities;
create policy "Availabilities: mentors manage own approved" on public.availabilities for all using (auth.uid() = mentor_id) with check (auth.uid() = mentor_id);

drop policy if exists "Availabilities: admin manage all" on public.availabilities;
create policy "Availabilities: admin manage all" on public.availabilities for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- HELPERS TO AVOID INFINITE RECURSION
create or replace function public.is_room_participant(p_room_id int, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.room_participants where room_id = p_room_id and user_id = p_user_id
  );
$$;

create or replace function public.is_room_host_or_mentor(p_room_id int, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.rooms where id = p_room_id and (host_id = p_user_id or mentor_id = p_user_id)
  );
$$;

-- ROOMS
alter table public.rooms enable row level security;

drop policy if exists "Rooms: participants and mentor read" on public.rooms;
create policy "Rooms: participants and mentor read" on public.rooms for select using (
  public.is_admin(auth.uid()) or
  host_id = auth.uid() or
  mentor_id = auth.uid() or
  is_public = true or
  public.is_room_participant(id, auth.uid())
);

drop policy if exists "Rooms: host can insert" on public.rooms;
create policy "Rooms: host can insert" on public.rooms for insert with check (host_id = auth.uid());

drop policy if exists "Rooms: host and mentor update" on public.rooms;
create policy "Rooms: host and mentor update" on public.rooms for update using (
  host_id = auth.uid() or mentor_id = auth.uid() or public.is_admin(auth.uid())
) with check (
  host_id = auth.uid() or mentor_id = auth.uid() or public.is_admin(auth.uid())
);

-- ROOM_PARTICIPANTS
alter table public.room_participants enable row level security;

drop policy if exists "RoomParticipants: read access" on public.room_participants;
create policy "RoomParticipants: read access" on public.room_participants for select using (
  public.is_admin(auth.uid()) or
  user_id = auth.uid() or
  public.is_room_host_or_mentor(room_id, auth.uid())
);

drop policy if exists "RoomParticipants: host can insert" on public.room_participants;
create policy "RoomParticipants: host can insert" on public.room_participants for insert with check (
  public.is_room_host_or_mentor(room_id, auth.uid()) or user_id = auth.uid()
);

drop policy if exists "RoomParticipants: participants can update own payment" on public.room_participants;
create policy "RoomParticipants: participants can update own payment" on public.room_participants for update using (
  user_id = auth.uid() or public.is_admin(auth.uid()) or
  public.is_room_host_or_mentor(room_id, auth.uid())
) with check (
  user_id = auth.uid() or public.is_admin(auth.uid()) or
  public.is_room_host_or_mentor(room_id, auth.uid())
);

-- ROOM_MESSAGES
alter table public.room_messages enable row level security;

drop policy if exists "RoomMessages: read access" on public.room_messages;
create policy "RoomMessages: read access" on public.room_messages for select using (
  public.is_admin(auth.uid()) or
  public.is_room_participant(room_id, auth.uid()) or
  public.is_room_host_or_mentor(room_id, auth.uid())
);

drop policy if exists "RoomMessages: participants insert" on public.room_messages;
create policy "RoomMessages: participants insert" on public.room_messages for insert with check (
  public.is_room_participant(room_id, auth.uid()) or
  public.is_room_host_or_mentor(room_id, auth.uid())
);

-- PAYMENTS
alter table public.payments enable row level security;

drop policy if exists "Payments: users read own" on public.payments;
create policy "Payments: users read own" on public.payments for select using (
  public.is_admin(auth.uid()) or exists (
    select 1 from public.bookings b where b.id = booking_id and (b.learner_id = auth.uid() or b.mentor_id = auth.uid())
  ) or exists (
    select 1 from public.room_participants rp where rp.room_id = room_id and rp.user_id = auth.uid()
  ) or exists (
    select 1 from public.rooms r where r.id = room_id and r.mentor_id = auth.uid()
  )
);

drop policy if exists "Payments: users can insert own" on public.payments;
create policy "Payments: users can insert own" on public.payments for insert with check (
  auth.uid() is not null
);

-- REPORTS, ADMIN_LOGS, WALLET_ENTRIES (Admin / Role specific)
alter table public.reports enable row level security;
drop policy if exists "Reports: reporter read own" on public.reports;
create policy "Reports: reporter read own" on public.reports for select using (reporter_id = auth.uid() or public.is_admin(auth.uid()));
drop policy if exists "Reports: users insert" on public.reports;
create policy "Reports: users insert" on public.reports for insert with check (reporter_id = auth.uid());
drop policy if exists "Reports: admin manage" on public.reports;
create policy "Reports: admin manage" on public.reports for update using (public.is_admin(auth.uid()));

alter table public.wallet_entries enable row level security;
drop policy if exists "WalletEntries: mentor read own" on public.wallet_entries;
create policy "WalletEntries: mentor read own" on public.wallet_entries for select using (mentor_id = auth.uid() or public.is_admin(auth.uid()));
