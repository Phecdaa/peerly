# 1 — Single Source of Truth: konsep & aturan produk (FINAL)

* **Nama produk**: Peerly
* **Visi / tujuan MVP**: web fungsional dengan semua fitur peer learning; fokus pada pemahaman materi akademik dengan alur room-centric.
* **Tone UX**: santai, kolaboratif, interaktif.
* **Aturan bisnis inti (tidak berubah)**:

  1. Semua sesi = **Room** (1 orang = room kapasitas 1).
  2. Room dibuat oleh **student (host)**.
  3. Mentor menentukan *availability*, *max capacity*, *tarif*, dan **harus approve** room agar valid.
  4. Peserta ditentukan saat pembuatan room; host bisa invite peserta lain; jumlah peserta aktual tidak boleh melebihi kapasitas mentor.
  5. Pembayaran = **per orang**, mode split (equal atau custom). Dana masuk **escrow ke Peerly**, baru dilepas ke mentor **setelah sesi selesai**.
  6. Chat bersifat **temporal / live** (direkam), aktif **setelah mentor accept**, ditutup setelah sesi selesai.
  7. Review dapat diberikan setelah sesi selesai; report dapat diajukan kapan saja; konsekuensi report valid: suspend → ban.
  8. Tidak ada booking 1-on-1 terpisah: semua lewat room.
  9. Refund rules: if mentor cancels after accept → mostly restricted; student cancel before X hours → full/partial refund (kamu sudah menetapkan: full refund if canceled >=5 hours before; 50% if later; mentor cannot cancel after accept).

---

# 2 — Keputusan produk & jawaban atas questionnaire (ringkasan dari inputmu)

* Tujuan utama: web fungsional lengkap fitur peer learning.
* Batasan: career/interview chat tidak dilarang, tetapi bukan fokus.
* UI tone: santai, kolaboratif, interaktif.
* Entitas inti: **Room** (paling penting).
* Room dibuat oleh student; valid saat mentor accept; student dapat cancel sebelum mentor accepts (refund rules); mentor cannot cancel after acceptance.
* Kapasitas ditentukan oleh mentor (max_students); student menentukan intended participant count saat membuat room; system must validate that mentor supports that capacity.
* Room visibility: private/public; public can be joined without invite.
* Chat: created when mentor has accepted, live with recording, closed after session.
* Payment: per person; both equal & custom split; room valid only when all participants paid; funds go to Peerly escrow; payout after session ends.
* Review/report rules as above.
* Mentor application: form; public profile fields vs admin-only private fields (CV, phone).
* Mentor statuses: none, pending, approved, rejected, (trainee decided no). Mentor can set tariff & schedule.

---

# 6 — API routes & backend responsibilities (what Antigravity must verify)

Minimum API endpoints and responsibilities:

* `POST /api/rooms/create` — validate mentor capacity, create room row, create host participant row, return room id. (Ensure transactional insert.)
* `POST /api/rooms/:id/invite` — add room_participants rows with amount_to_pay etc.
* `GET /api/rooms/:id` — return room + participants + payment statuses (respect RLS).
* `POST /api/rooms/:id/accept` — mentor accepts; change status to `waiting_payment`; create booking rows if required.
* `POST /api/payments/checkout` — create payment intent record. Must be idempotent using `idempotency_key`.
* `POST /api/payments/confirm` — webhook-style: mark participant has_paid; if all participants paid -> update room.status = scheduled.
* `POST /api/rooms/:id/start` and `POST /api/rooms/:id/finish` — session lifecycle; releasing payments to mentor occurs on finish.
* `GET /api/rooms?user=` — list rooms for dashboard.
* `POST /api/reports` — create report rows.
* `POST /api/session-notes` (mentor-only) — create session_notes.

---

# 7 — State machine (recommended canonical states)

Room.status:

* `pending_payment` / `waiting_mentor_approval` (room pending mentor action)
* `waiting_payment` (mentor accepted; participants must pay)
* `scheduled` (all paid & scheduled)
* `ongoing` (session started)
* `finished` (session ended; payout release)
* `cancelled`

Booking.status (if used):

* `pending`, `accepted`, `paid`, `completed`, `cancelled`, `no_show`

---

# 11 — Acceptance tests / QA checklist (what Antigravity must verify and sign off)

**Functional**
* [ ] User signup → profile row created in `profiles`.
* [ ] Mentor apply flow → `mentor_status = pending`.
* [ ] Mentor approval → mentor can create `availabilities`.
* [ ] Create room: student picks participant count; system only lists mentors that can accommodate.
* [ ] Room creation inserts `rooms` + host `room_participants`.
* [ ] Mentor accepts → room.status transitions to `waiting_payment`.
* [ ] Payment flow: each participant can pay once; `room_participants.has_paid` toggles correctly.
* [ ] When all participants paid → room.status = `scheduled`.
* [ ] Session start → `ongoing`, chat active; finish → `finished`, payments released to mentor.
* [ ] Chat access control: only host/participants/mentor can read/write.
* [ ] Public room join works (if public) and respects capacity.
* [ ] Cancelling & refund flows behave per rules.
* [ ] Reports creation and admin review works.

**Security**
* [ ] RLS policies applied.
* [ ] Admin helper `is_admin()` verified.
* [ ] Payment idempotency key prevents double payments.

**Stability**
* [ ] No 404 after creating room.
* [ ] Room created must be visible immediately.
* [ ] No race condition on slot capacity.
