"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Course = { id: number; name: string; slug: string };

export function ApplyMentorForm({ courses }: { courses: Course[] }) {
  const router = useRouter();
  const [bio, setBio] = useState("");
  const [university, setUniversity] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [courseIds, setCourseIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleCourse(id: number) {
    setCourseIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/mentor/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio: bio.trim(),
          university: university.trim() || undefined,
          hourly_rate:
            hourlyRate === "" ? undefined : parseFloat(hourlyRate) || 0,
          course_ids: courseIds,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Gagal mengirim pengajuan.");
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

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Bio *
        </label>
        <textarea
          required
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          className="textarea"
          placeholder="Ceritakan pengalaman mengajar dan keahlianmu..."
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Universitas
        </label>
        <input
          type="text"
          value={university}
          onChange={(e) => setUniversity(e.target.value)}
          className="input"
          placeholder="Nama kampus"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Tarif per jam (opsional)
        </label>
        <input
          type="number"
          min={0}
          step={1000}
          value={hourlyRate}
          onChange={(e) => setHourlyRate(e.target.value)}
          className="input"
          placeholder="0"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-700">
          Mata kuliah yang diajarkan
        </label>
        <div className="flex flex-wrap gap-2">
          {courses.map((c) => (
            <label
              key={c.id}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-800 hover:bg-zinc-50"
            >
              <input
                type="checkbox"
                checked={courseIds.includes(c.id)}
                onChange={() => toggleCourse(c.id)}
                className="rounded border-zinc-300"
              />
              {c.name}
            </label>
          ))}
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
        className="btn btn-primary w-full"
      >
        {loading ? "Mengirim..." : "Kirim pengajuan"}
      </button>
    </form>
  );
}
