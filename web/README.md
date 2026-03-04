Peerly adalah marketplace belajar mahasiswa untuk booking sesi belajar 1-on-1 atau kelompok kecil, bayar per jam, dengan mentor terverifikasi dan sesi terjadwal.

## Getting Started

### 1. Setup environment

Buat file `.env.local` di folder `web/` dengan isi:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key # server only, never exposed to client
```

### 2. Setup database (Supabase)

Di Supabase SQL Editor, jalankan file SQL berikut (lihat folder `supabase/sql/`):

1. `tables.sql`
2. `triggers.sql`
3. `policies.sql`
4. `seed_courses.sql`

Pastikan RLS aktif untuk tabel-tabel yang didefinisikan.

### 3. Jalankan dev server

```bash
npm install
npm run dev
```

Lalu buka `http://localhost:3000`.

Flow MVP yang ditargetkan:

- Register/login via Supabase Auth
- Apply sebagai mentor, approval admin
- Mentor set availability
- Learner booking sesi, konfirmasi pembayaran dummy
- Meeting link tersimpan di booking
- Rating & review setelah sesi selesai
