Peerly adalah marketplace belajar mahasiswa untuk booking sesi belajar 1-on-1 atau kelompok kecil, bayar per jam, dengan mentor terverifikasi dan sesi terjadwal.

## Getting Started

### 1. Setup environment

Salin `.env.example` menjadi `.env.local` di folder `web/`, lalu isi nilai yang sesuai:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` → dari project Supabase kamu
- `NEXT_PUBLIC_SITE_URL` → URL app di Vercel (mis. `https://peerly-your-env.vercel.app`)
- Jika memakai Stripe beneran: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

### 2. Setup database (Supabase)

Di Supabase SQL Editor, jalankan file SQL berikut (lihat folder `supabase/sql/`):

1. `tables.sql`
2. `triggers.sql`
3. `policies.sql`
4. `seed_courses.sql`

Pastikan RLS aktif untuk tabel-tabel yang didefinisikan.

> Penting: jika kamu sudah pernah menjalankan SQL lama, cukup jalankan ulang `tables.sql` dan `policies.sql` untuk menambahkan tabel/kolom baru (Postgres akan mengabaikan yang sudah ada berkat `if not exists`).

### 3. Jalankan dev server

```bash
npm install
npm run dev
```

Lalu buka `http://localhost:3000`.

Flow MVP yang ditargetkan (peer learning version):

- Register/login via Supabase Auth
- Apply sebagai mentor, approval admin
- Mentor set availability (calendar slots dengan kapasitas)
- Learner buat room & booking slot (1-on-1 atau kelompok kecil)
- Pembayaran masuk ke wallet platform (escrow)
- Mentor mark sesi selesai → payout ke mentor
- Rating, feedback, dan report setelah sesi selesai
