"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type BookingRow = {
  id: number;
  start_ts: string;
  end_ts: string;
  duration_minutes: number;
  status: string;
  meeting_link: string | null;
  created_at: string;
  mentor?: { full_name: string | null };
  learner?: { full_name: string | null };
  course?: { name: string } | null;
};

export function BookingsList({
  bookings,
  role,
  reviewedIds,
}: {
  bookings: BookingRow[];
  role: "learner" | "mentor";
  reviewedIds: Set<number>;
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [reviewBookingId, setReviewBookingId] = useState<number | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  async function accept(id: number) {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/booking/${id}/accept`, { method: "POST" });
      if (res.ok) router.refresh();
    } finally {
      setLoadingId(null);
    }
  }

  async function confirmPayment(id: number) {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/booking/${id}/confirm-payment`, {
        method: "POST",
      });
      if (res.ok) router.refresh();
    } finally {
      setLoadingId(null);
    }
  }

  async function complete(id: number) {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/booking/${id}/complete`, {
        method: "POST",
      });
      if (res.ok) router.refresh();
    } finally {
      setLoadingId(null);
    }
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewBookingId) return;
    setReviewSubmitting(true);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: reviewBookingId,
          rating: reviewRating,
          comment: reviewComment || undefined,
        }),
      });
      if (res.ok) {
        setReviewBookingId(null);
        setReviewComment("");
        router.refresh();
      }
    } finally {
      setReviewSubmitting(false);
    }
  }

  if (bookings.length === 0) {
    return (
      <p className="card text-sm text-zinc-500">
        Tidak ada booking.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {bookings.map((b) => (
        <li
          key={b.id}
          className="card"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-medium text-zinc-900">
                {role === "learner"
                  ? (b.mentor?.full_name ?? "Mentor")
                  : (b.learner?.full_name ?? "Learner")}
              </p>
              <p className="text-sm text-zinc-500">
                {(b.course as { name: string } | null)?.name ?? "—"}
              </p>
              <p className="text-xs text-zinc-400">
                {new Date(b.start_ts).toLocaleString("id-ID", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}{" "}
                · {b.duration_minutes} menit
              </p>
              <div className="mt-2">
                <span className="badge">Status: {b.status}</span>
              </div>
              {b.status === "paid" && b.meeting_link && (
                <a
                  href={b.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link mt-2 inline-block text-xs"
                >
                  Link meeting
                </a>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {role === "mentor" && b.status === "pending" && (
                <button
                  type="button"
                  disabled={loadingId === b.id}
                  onClick={() => accept(b.id)}
                  className="btn btn-success h-9 px-4 text-xs"
                >
                  Accept
                </button>
              )}
              {role === "learner" && b.status === "accepted" && (
                <button
                  type="button"
                  disabled={loadingId === b.id}
                  onClick={() => confirmPayment(b.id)}
                  className="btn btn-primary h-9 px-4 text-xs"
                >
                  Confirm payment
                </button>
              )}
              {role === "mentor" && b.status === "paid" && (
                <button
                  type="button"
                  disabled={loadingId === b.id}
                  onClick={() => complete(b.id)}
                  className="btn btn-info h-9 px-4 text-xs"
                >
                  Mark completed
                </button>
              )}
              {role === "learner" &&
                b.status === "completed" &&
                !reviewedIds.has(b.id) && (
                  <button
                    type="button"
                    onClick={() => setReviewBookingId(b.id)}
                    className="btn btn-secondary h-9 px-4 text-xs"
                  >
                    Leave review
                  </button>
                )}
            </div>
          </div>

          {reviewBookingId === b.id && (
            <form
              onSubmit={submitReview}
              className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4"
            >
              <label className="mb-1 block text-xs font-medium text-zinc-700">
                Rating (1-5)
              </label>
              <select
                value={reviewRating}
                onChange={(e) => setReviewRating(parseInt(e.target.value, 10))}
                className="select mb-2"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <textarea
                placeholder="Comment (optional)"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="textarea mb-2"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="btn btn-primary h-9 px-4 text-xs"
                >
                  Submit review
                </button>
                <button
                  type="button"
                  onClick={() => setReviewBookingId(null)}
                  className="btn btn-secondary h-9 px-4 text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </li>
      ))}
    </ul>
  );
}
