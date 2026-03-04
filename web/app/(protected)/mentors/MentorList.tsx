"use client";

import { useState } from "react";
import Link from "next/link";

type Course = { id: number; name: string; slug: string };
type Mentor = {
  id: string;
  full_name: string | null;
  university: string | null;
  bio: string | null;
  hourly_rate: number | null;
  courses: Course[];
  average_rating: number | null;
  review_count: number;
};

export function MentorList({
  mentors,
  courses,
}: {
  mentors: Mentor[];
  courses: Course[];
}) {
  const [courseFilter, setCourseFilter] = useState<string>("");
  const [search, setSearch] = useState("");

  const filtered = mentors.filter((m) => {
    const matchCourse =
      !courseFilter ||
      m.courses.some((c) => c.id === parseInt(courseFilter, 10));
    const matchSearch =
      !search.trim() ||
      (m.full_name?.toLowerCase().includes(search.trim().toLowerCase()) ||
        m.bio?.toLowerCase().includes(search.trim().toLowerCase()) ||
        m.university?.toLowerCase().includes(search.trim().toLowerCase()));
    return matchCourse && matchSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Cari nama, bio, kampus..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input max-w-sm"
        />
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="select w-auto"
        >
          <option value="">Semua mata kuliah</option>
          {courses.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {filtered.map((m) => (
          <li key={m.id}>
            <Link
              href={`/mentor/${m.id}`}
              className="card block transition hover:border-zinc-300 hover:shadow-md hover:shadow-zinc-900/10"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-zinc-900">
                    {m.full_name ?? "Mentor"}
                  </p>
                  {m.university && (
                    <p className="text-sm text-zinc-500">{m.university}</p>
                  )}
                </div>
                {m.hourly_rate != null && (
                  <span className="badge">
                    Rp {Number(m.hourly_rate).toLocaleString()}/jam
                  </span>
                )}
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-zinc-600">
                {m.bio ?? "—"}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                {m.average_rating != null && (
                  <span className="badge border-indigo-200 bg-indigo-50 text-indigo-800">
                    ★ {m.average_rating.toFixed(1)}
                  </span>
                )}
                {m.review_count > 0 && (
                  <span className="text-xs text-zinc-500">
                    {m.review_count} review
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                {m.courses.map((c) => c.name).join(", ")}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      {filtered.length === 0 && (
        <p className="card p-6 text-center text-sm text-zinc-500">
          Tidak ada mentor yang cocok.
        </p>
      )}
    </div>
  );
}
