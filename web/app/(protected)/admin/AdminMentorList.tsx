"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Course = { id: number; name: string; slug: string };
type Application = {
  id: string;
  full_name: string | null;
  bio: string | null;
  university: string | null;
  hourly_rate: number | null;
  mentor_status: string;
  created_at: string;
  courses: Course[];
};

export function AdminMentorList({
  applications,
}: {
  applications: Application[];
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleApprove(id: string) {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/mentor-applications/${id}/approve`, {
        method: "POST",
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoadingId(null);
    }
  }

  async function handleReject(id: string) {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/mentor-applications/${id}/reject`, {
        method: "POST",
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoadingId(null);
    }
  }

  if (applications.length === 0) {
    return (
      <p className="card p-6 text-sm text-zinc-500">
        Tidak ada pengajuan mentor yang menunggu.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {applications.map((app) => (
        <li
          key={app.id}
          className="card"
        >
          <div className="mb-2 flex items-start justify-between gap-2">
            <div>
              <p className="font-medium text-zinc-900">
                {app.full_name ?? "—"}
              </p>
              {app.university && (
                <p className="text-sm text-zinc-500">{app.university}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={loadingId === app.id}
                onClick={() => handleApprove(app.id)}
                className="btn btn-success h-9 px-4 text-xs"
              >
                Approve
              </button>
              <button
                type="button"
                disabled={loadingId === app.id}
                onClick={() => handleReject(app.id)}
                className="btn btn-danger h-9 px-4 text-xs"
              >
                Reject
              </button>
            </div>
          </div>
          {app.bio && (
            <p className="mb-2 text-sm text-zinc-600">{app.bio}</p>
          )}
          {app.hourly_rate != null && (
            <p className="text-xs text-zinc-500">
              <span className="badge">
                Tarif: Rp {Number(app.hourly_rate).toLocaleString()}/jam
              </span>
            </p>
          )}
          {app.courses.length > 0 && (
            <p className="mt-2 text-xs text-zinc-500">
              Mata kuliah: {app.courses.map((c) => c.name).join(", ")}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
