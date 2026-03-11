"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Course = { id: number; name: string; slug: string };
type Slot = {
  id: number;
  start_ts: string;
  end_ts: string;
  max_students: number;
  is_booked: boolean;
  has_room: boolean;
};

export function CreateRoomForm({
  mentorId,
  mentorName,
  mentorHourlyRate,
  courses,
  slots,
}: {
  mentorId: string;
  mentorName: string;
  mentorHourlyRate: number;
  courses: Course[];
  slots: Slot[];
}) {
  const router = useRouter();
  const [courseId, setCourseId] = useState<number>(courses[0]?.id ?? 0);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState<"online" | "offline" | "hybrid">("online");
  const [intendedCount, setIntendedCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableSlots = slots.filter((s) => !s.is_booked && !s.has_room);

  // When slot changes, clamp intended count to slot capacity
  const maxForSlot = slot ? slot.max_students : 1;
  const effectiveIntended = slot
    ? Math.min(Math.max(1, intendedCount), maxForSlot)
    : 1;

  function formatSlot(s: Slot) {
    const start = new Date(s.start_ts);
    const end = new Date(s.end_ts);
    return (
      start.toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" }) +
      " - " +
      end.toLocaleTimeString("id-ID", { timeStyle: "short" })
    );
  }

  const durationMinutes = slot
    ? Math.round(
        (new Date(slot.end_ts).getTime() - new Date(slot.start_ts).getTime()) /
          60000
      )
    : 0;
  const totalPrice = (durationMinutes / 60) * mentorHourlyRate;
  const perPerson =
    effectiveIntended > 0 ? totalPrice / effectiveIntended : totalPrice;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!slot) {
      setError("Pilih slot dulu.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          availability_id: slot.id,
          course_id: courseId,
          title: title.trim() || null,
          description: description.trim() || null,
          mode,
          is_public: false,
          intended_participant_count: effectiveIntended,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Gagal buat room.");
        return;
      }

      const roomId = data.id;
      if (roomId == null || roomId === undefined) {
        setError("Room dibuat tapi ID tidak diterima.");
        return;
      }
      router.refresh();
      window.location.href = `/rooms/${roomId}`;
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  if (courses.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        Mentor ini belum mengatur mata kuliah.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-sm font-semibold text-zinc-900">
        Atau buat room grup untuk belajar bareng
      </h3>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Mata kuliah
        </label>
        <select
          value={courseId}
          onChange={(e) => setCourseId(parseInt(e.target.value, 10))}
          className="select"
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Slot tersedia
        </label>
        {availableSlots.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Tidak ada slot untuk room (semua sudah dipakai).
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {availableSlots.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setSlot(s)}
                  className={`btn h-9 rounded-full border px-4 text-xs ${
                    slot?.id === s.id
                      ? "border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800"
                      : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50"
                  }`}
                >
                  {formatSlot(s)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {slot && (
        <>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Jumlah peserta yang diinginkan
            </label>
            <select
              value={effectiveIntended}
              onChange={(e) =>
                setIntendedCount(parseInt(e.target.value, 10))
              }
              className="select"
            >
              {Array.from({ length: maxForSlot }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "orang (private)" : "orang"}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-zinc-500">
              Maks. untuk slot ini: {maxForSlot} orang
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Judul (opsional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder={`Sesi ${courses.find((c) => c.id === courseId)?.name ?? ""} dengan ${mentorName}`}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Deskripsi (opsional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea"
              rows={2}
              placeholder="Fokus materi yang ingin dipelajari..."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Mode sesi
            </label>
            <select
              value={mode}
              onChange={(e) =>
                setMode(e.target.value as "online" | "offline" | "hybrid")
              }
              className="select"
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="badge">Durasi: {durationMinutes} menit</span>
              <span className="badge">
                Peserta: {effectiveIntended} orang (max {maxForSlot})
              </span>
              <span className="badge border-indigo-200 bg-indigo-50 text-indigo-800">
                Total: Rp {totalPrice.toLocaleString()}
              </span>
              <span className="badge">
                Per orang: Rp {Math.round(perPerson).toLocaleString()}
              </span>
            </div>
          </div>
        </>
      )}

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !slot}
        className="btn btn-primary w-full"
      >
        {loading ? "Membuat..." : "Buat room"}
      </button>
    </form>
  );
}
