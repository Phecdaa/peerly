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
};

export function BookingForm({
  mentorId,
  mentorHourlyRate,
  courses,
  slots,
}: {
  mentorId: string;
  mentorHourlyRate: number;
  courses: Course[];
  slots: Slot[];
}) {
  const router = useRouter();
  const [courseId, setCourseId] = useState<number>(courses[0]?.id ?? 0);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableSlots = slots.filter((s) => !s.is_booked);

  function formatSlot(s: Slot) {
    const start = new Date(s.start_ts);
    const end = new Date(s.end_ts);
    return start.toLocaleString("id-ID", {
      dateStyle: "short",
      timeStyle: "short",
    }) + " - " + end.toLocaleTimeString("id-ID", { timeStyle: "short" });
  }

  const durationMinutes = slot
    ? Math.round(
        (new Date(slot.end_ts).getTime() - new Date(slot.start_ts).getTime()) /
          60000
      )
    : 0;
  const totalPrice = (durationMinutes / 60) * mentorHourlyRate;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!slot) {
      setError("Pilih slot dulu.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/booking/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentor_id: mentorId,
          course_id: courseId,
          start_ts: slot.start_ts,
          end_ts: slot.end_ts,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Gagal request booking.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
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
          <p className="text-sm text-zinc-500">Tidak ada slot tersedia.</p>
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
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="badge">
              Durasi: {durationMinutes} menit
            </span>
            <span className="badge border-indigo-200 bg-indigo-50 text-indigo-800">
              Total: Rp {totalPrice.toLocaleString()}
            </span>
          </div>
        </div>
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
        {loading ? "Mengirim..." : "Request booking"}
      </button>
    </form>
  );
}
