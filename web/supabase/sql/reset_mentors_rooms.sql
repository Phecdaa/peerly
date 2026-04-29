-- FULL RESET SCRIPT: Delete all data + non-admin users
-- Run this in Supabase SQL Editor
-- ⚠️ WARNING: This will delete ALL users except admin!

-- Step 1: Delete all dependent data (respecting FK order)
DELETE FROM public.session_notes;
DELETE FROM public.reviews;
DELETE FROM public.room_messages;
DELETE FROM public.room_participants;
DELETE FROM public.wallet_entries;
DELETE FROM public.payments;
DELETE FROM public.reports;
DELETE FROM public.notifications;
DELETE FROM public.admin_logs;

-- Step 2: Delete all rooms
DELETE FROM public.rooms;

-- Step 3: Delete all availabilities
DELETE FROM public.availabilities;

-- Step 4: Delete mentor courses
DELETE FROM public.mentor_courses;

-- Step 5: Reset admin profile mentor flags (keep admin user clean)
UPDATE public.profiles
SET is_mentor = false,
    mentor_status = 'none',
    hourly_rate = null
WHERE role = 'admin' AND (is_mentor = true OR mentor_status != 'none');

-- Step 6: Delete non-admin profiles (this will cascade to auth.users won't work, so we delete from auth.users first)
-- Get IDs of non-admin users, then delete from auth.users (cascades to profiles)
DELETE FROM auth.users
WHERE id IN (
  SELECT id FROM public.profiles WHERE role != 'admin'
);

-- Step 7: In case any profiles remain without auth.users link
DELETE FROM public.profiles WHERE role != 'admin';

-- Verification
-- SELECT * FROM public.profiles;
-- SELECT COUNT(*) FROM auth.users;
