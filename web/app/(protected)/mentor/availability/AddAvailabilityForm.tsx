"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function AddAvailabilityForm() {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [maxStudents, setMaxStudents] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    if (end <= start) {
      setError("Waktu selesai harus setelah waktu mulai.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/mentor/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slots: [{
            start_ts: start.toISOString(),
            end_ts: end.toISOString(),
            max_students: Math.max(1, Math.min(50, maxStudents)),
          }],
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Gagal menambah slot.");
        return;
      }

      router.refresh();
      setDate("");
      setStartTime("09:00");
      setEndTime("10:00");
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h2 className="card-title">Tambah slot</h2>
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">
            Tanggal
          </label>
          <input
            type="date"
            required
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">
            Mulai
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">
            Selesai
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">
            Maks. peserta (1 room)
          </label>
          <input
            type="number"
            min={1}
            max={50}
            value={maxStudents}
            onChange={(e) => setMaxStudents(parseInt(e.target.value, 10) || 1)}
            className="input"
          />
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary w-fit px-5"
      >
        {loading ? "Menambah..." : "Tambah slot"}
      </button>
    </form>
  );
}
