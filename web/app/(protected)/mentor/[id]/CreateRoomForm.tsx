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

  const [step, setStep] = useState(1);

  const maxForSlot = slot ? slot.max_students : 1;
  const effectiveIntended = slot ? Math.min(Math.max(1, intendedCount), maxForSlot) : 1;

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
    ? Math.round((new Date(slot.end_ts).getTime() - new Date(slot.start_ts).getTime()) / 60000)
    : 0;
  const totalPrice = (durationMinutes / 60) * mentorHourlyRate;
  const perPerson = effectiveIntended > 0 ? totalPrice / effectiveIntended : totalPrice;

  async function handleSubmit() {
    if (!slot) return;
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
      if (roomId == null) {
        setError("Room dibuat tapi ID tidak diterima.");
        return;
      }
      router.refresh(); // Invalidate NextJS Cache
      setTimeout(() => {
        router.push(`/rooms/${roomId}`);
      }, 500);
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  if (courses.length === 0) {
    return <p className="text-sm text-zinc-500">Mentor ini belum mengatur mata kuliah.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                step >= s ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500"
              }`}
            >
              {s}
            </div>
            {s !== 4 && (
              <div
                className={`h-[2px] w-full ${step > s ? "bg-zinc-900" : "bg-zinc-100"}`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="min-h-[250px]">
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-lg font-semibold text-zinc-900">Pilih Topik & Waktu</h3>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Mata kuliah</label>
              <select value={courseId} onChange={(e) => setCourseId(parseInt(e.target.value, 10))} className="select w-full">
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Slot tersedia</label>
              <div className="grid gap-2 sm:grid-cols-2">
                {availableSlots.length === 0 ? (
                  <p className="text-sm text-zinc-500">Tidak ada slot untuk room.</p>
                ) : (
                  availableSlots.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSlot(s)}
                      className={`text-left rounded-lg border p-3 text-sm transition ${
                        slot?.id === s.id ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300"
                      }`}
                    >
                      <div className="font-medium">{formatSlot(s)}</div>
                      <div className={`text-xs mt-1 ${slot?.id === s.id ? "text-zinc-300" : "text-zinc-500"}`}>Max {s.max_students} peserta</div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-lg font-semibold text-zinc-900">Peserta & Mode</h3>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Jumlah peserta</label>
              <select value={effectiveIntended} onChange={(e) => setIntendedCount(parseInt(e.target.value, 10))} className="select w-full">
                {Array.from({ length: maxForSlot }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n} {n === 1 ? "orang (private)" : "orang"}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-zinc-500">Kapasitas mentor: {maxForSlot} orang</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Mode sesi</label>
              <select value={mode} onChange={(e) => setMode(e.target.value as any)} className="select w-full">
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-lg font-semibold text-zinc-900">Detail Sesi (Opsional)</h3>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Judul sesi</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input w-full"
                placeholder={`Belajar bareng ${courses.find(c => c.id === courseId)?.name ?? ""}`}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Deskripsi (Topik Khusus)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="textarea w-full"
                rows={3}
                placeholder="Fokus ke bab mana? Ada tugas spesifik?"
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-lg font-semibold text-zinc-900">Konfirmasi Biaya</h3>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Durasi</span>
                <span className="font-medium">{durationMinutes} menit</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Jumlah Peserta</span>
                <span className="font-medium">{effectiveIntended} orang</span>
              </div>
              <div className="flex justify-between text-sm border-t border-zinc-200 pt-3">
                <span className="text-zinc-500">Total Biaya Sesi</span>
                <span className="font-medium text-zinc-900">Rp {totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-indigo-700 border-t border-indigo-100 pt-3 bg-indigo-50/50 -mx-5 px-5 pb-1">
                <span>Porsi Patunganmu</span>
                <span>Rp {Math.round(perPerson).toLocaleString()}</span>
              </div>
            </div>
            {error && <p className="text-sm text-red-600 font-medium bg-red-50 p-3 rounded-lg">{error}</p>}
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4 border-t border-zinc-200">
        <button
          type="button"
          onClick={() => setStep(step - 1)}
          disabled={step === 1 || loading}
          className="btn border border-zinc-200 bg-white text-zinc-800 disabled:opacity-50"
        >
          Kembali
        </button>
        {step < 4 ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            disabled={!slot && step === 1}
            className="btn btn-primary"
          >
            Lanjut
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="btn bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 min-w-[120px]"
          >
            {loading ? "Membuat..." : "Konfirmasi & Buat"}
          </button>
        )}
      </div>
    </div>
  );
}
