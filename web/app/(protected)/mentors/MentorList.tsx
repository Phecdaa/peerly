"use client";

import { useState } from "react";
import Link from "next/link";

type Course = { id: number; name: string; slug: string };
type Mentor = {
  id: string;
  full_name: string | null;
  avatar_url?: string | null;
  university: string | null;
  bio?: string | null;
  hourly_rate: number | null;
  courses: Course[];
  average_rating?: number | null;
  review_count?: number;
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
              className="block bg-white p-4 rounded-2xl border border-zinc-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-blue-200 transition"
            >
              <div className="flex gap-4 items-center">
                <div
                  className="w-14 h-14 bg-zinc-200 rounded-xl flex-shrink-0 bg-cover bg-center border-2 border-white shadow-sm"
                  style={{ backgroundImage: `url(${m.avatar_url || "https://api.dicebear.com/7.x/initials/svg?seed="+encodeURIComponent(m.full_name || "M")})` }}
                ></div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-zinc-900 truncate">{m.full_name}</h2>
                  <p className="text-xs text-zinc-500 truncate mb-1">{m.university || "Universitas"}</p>
                  <div className="flex gap-2 text-xs text-zinc-500 mb-2">
                    <span className="flex items-center gap-1 font-medium bg-amber-50 text-amber-700 px-2 py-0.5 rounded">
                      ★ {m.average_rating != null ? m.average_rating.toFixed(1) : "Baru"}
                    </span>
                    {m.hourly_rate != null && (
                      <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium">
                        Rp {Number(m.hourly_rate).toLocaleString()}/jam
                      </span>
                    )}
                  </div>
                  {m.courses && m.courses.length > 0 && (
                    <p className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-1 rounded inline-block truncate max-w-full">
                      {m.courses.map((c: any) => c.name).join(", ")}
                    </p>
                  )}
                </div>
              </div>
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
