"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  roomId: number;
  role: "host" | "participant" | "mentor";
  status: string;
  hasPaid: boolean;
  amountPerPerson?: number;
  isSessionEnded: boolean;
  paymentMode?: string;
  mentorMarkedCompleted?: boolean;
  hostMarkedCompleted?: boolean;
  hasReviewed?: boolean;
};

export function RoomActions({
  roomId,
  role,
  status,
  hasPaid,
  amountPerPerson = 0,
  isSessionEnded,
  paymentMode = "split_equal",
  mentorMarkedCompleted = false,
  hostMarkedCompleted = false,
  hasReviewed = false,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  async function pay() {
    setLoading("pay");
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id: roomId }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function accept() {
    setLoading("accept");
    try {
      const res = await fetch(`/api/rooms/${roomId}/accept`, {
        method: "POST",
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function reject() {
    setLoading("reject");
    try {
      const res = await fetch(`/api/rooms/${roomId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason || undefined }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function complete() {
    setLoading("complete");
    try {
      const res = await fetch(`/api/rooms/${roomId}/complete`, {
        method: "POST",
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    setLoading("review");
    try {
      const res = await fetch(`/api/rooms/${roomId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: reviewComment }),
      });
      if (res.ok) {
        setShowReviewForm(false);
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Gagal mengirim ulasan");
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      {role !== "mentor" &&
        status === "waiting_payment" &&
        !hasPaid &&
        !isSessionEnded && (
          <div>
            {amountPerPerson > 0 ? (
              <button
                type="button"
                onClick={pay}
                disabled={!!loading}
                className="btn btn-primary w-full"
              >
                {loading === "pay" ? "Memproses..." : `Bayar Rp ${amountPerPerson.toLocaleString()}`}
              </button>
            ) : (
              <div className="rounded-lg bg-orange-50 border border-orange-100 p-3 text-sm text-orange-800 text-center">
                Menunggu Host menyelesaikan pembayaran
              </div>
            )}
          </div>
        )}

      {role === "mentor" &&
        status === "pending_mentor_accept" &&
        !isSessionEnded && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={accept}
              disabled={!!loading}
              className="btn btn-success w-full"
            >
              {loading === "accept" ? "Memproses..." : "Terima room (mulai pembayaran)"}
            </button>
            <div className="flex gap-2">
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Alasan tolak (opsional)"
                className="input flex-1 py-2 text-sm"
              />
              <button
                type="button"
                onClick={reject}
                disabled={!!loading}
                className="btn btn-danger"
              >
                {loading === "reject" ? "..." : "Tolak"}
              </button>
            </div>
          </div>
        )}

      {/* 2-Way Completion Button */}
      {(role === "mentor" || role === "host") &&
        (status === "scheduled" || status === "ongoing") &&
        isSessionEnded && (
          <div className="space-y-2">
            {!((role === "mentor" && mentorMarkedCompleted) || (role === "host" && hostMarkedCompleted)) ? (
              <button
                type="button"
                onClick={complete}
                disabled={!!loading}
                className="btn btn-primary w-full"
              >
                {loading === "complete" ? "Memproses..." : "Tandai Selesai"}
              </button>
            ) : (
              <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-sm text-emerald-800 text-center">
                Menunggu persetujuan {role === "mentor" ? "Host" : "Mentor"} untuk mengakhiri sesi.
              </div>
            )}
            {((role === "mentor" && hostMarkedCompleted && !mentorMarkedCompleted) || 
              (role === "host" && mentorMarkedCompleted && !hostMarkedCompleted)) && (
              <p className="text-xs text-indigo-600 text-center mt-1">
                {role === "mentor" ? "Host" : "Mentor"} sudah menunggu persetujuanmu.
              </p>
            )}
          </div>
        )}

      {/* REVIEWS */}
      {role !== "mentor" && status === "finished" && !hasReviewed && (
        <div className="space-y-3">
          {!showReviewForm ? (
            <button
              onClick={() => setShowReviewForm(true)}
              className="btn border border-zinc-200 bg-white text-zinc-800 w-full hover:bg-zinc-50"
            >
              ⭐ Berikan Ulasan Mentor
            </button>
          ) : (
            <form onSubmit={submitReview} className="space-y-3 rounded-lg border border-zinc-200 p-4 bg-zinc-50">
              <h3 className="text-sm font-semibold">Tulis Ulasan</h3>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Rating (1-5)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRating(r)}
                      className={`h-8 w-8 rounded-full text-sm font-medium ${
                        rating >= r ? "bg-amber-400 text-amber-900" : "bg-zinc-200 text-zinc-500"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Komentar (Opsional)</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="textarea w-full text-sm"
                  rows={2}
                  placeholder="Sangat membantu, penjelasan mata kuliahnya jelas..."
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="btn bg-zinc-200 text-zinc-700 py-1.5 px-3 text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!!loading}
                  className="btn btn-primary py-1.5 px-3 text-xs"
                >
                  {loading === "review" ? "Mengirim..." : "Kirim Ulasan"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
