-- RESET SCRIPT: Delete all rooms and reset all mentor statuses
-- Run this in Supabase SQL Editor

-- Step 1: Delete all dependent data in correct order (respecting FKs)
DELETE FROM public.session_notes;
DELETE FROM public.reviews;
DELETE FROM public.room_messages;
DELETE FROM public.room_participants;
DELETE FROM public.payments;
DELETE FROM public.wallet_entries;
DELETE FROM public.reports;
DELETE FROM public.notifications;

-- Step 2: Delete all bookings (references rooms)
DELETE FROM public.bookings;

-- Step 3: Delete all rooms
DELETE FROM public.rooms;

-- Step 4: Delete all availabilities
DELETE FROM public.availabilities;

-- Step 5: Delete mentor courses
DELETE FROM public.mentor_courses;

-- Step 6: Reset all mentor profiles back to non-mentor
UPDATE public.profiles
SET is_mentor = false,
    mentor_status = 'none',
    hourly_rate = null
WHERE is_mentor = true OR mentor_status != 'none';

-- Verification (run separately to check)
-- SELECT COUNT(*) AS rooms_left FROM public.rooms;
-- SELECT COUNT(*) AS mentors_left FROM public.profiles WHERE is_mentor = true;
