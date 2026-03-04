# Peerly

Marketplace belajar mahasiswa – booking sesi 1-on-1 atau kelompok kecil dengan mentor terverifikasi, bayar per jam, sesi terjadwal.

## Struktur

- **`web/`** – Aplikasi Next.js (App Router + Tailwind + Supabase)
- **`web/supabase/sql/`** – Skrip SQL: tables, triggers, policies, seed courses

## Cepat mulai

1. Masuk ke folder `web/` dan ikuti [README di web](web/README.md).
2. Buat project Supabase, jalankan SQL di `web/supabase/sql/` (urutan: tables → triggers → policies → seed_courses).
3. Set env di `web/.env.local` (lihat `web/.env.example`).
4. Set satu user sebagai admin: `update public.profiles set role = 'admin' where id = 'uuid';`
5. `cd web && npm install && npm run dev` → buka http://localhost:3000

## Flow MVP

Register/Login → Apply mentor → Admin approve → Mentor set availability → Learner booking → Mentor accept → Learner confirm payment (dummy) → Meeting link → Mentor mark completed → Learner review.

Semua kriteria teknis mengacu pada **checklist/spec** yang kamu berikan (single-source-of-truth).
