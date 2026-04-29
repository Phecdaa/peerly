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

  function pay() {
    router.push(`/checkout/${roomId}`);
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
    <div className="flex flex-col gap-3">
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
                className="bg-primary text-on-primary py-3 px-4 rounded-lg font-label-md text-label-md hover:bg-primary-fixed-variant transition-colors w-full shadow-sm"
              >
                {loading === "pay" ? "Memproses..." : `Bayar Rp ${Math.round(amountPerPerson).toLocaleString()}`}
              </button>
            ) : (
              <div className="rounded-lg bg-surface-container-high border border-outline-variant/20 p-3 text-sm text-on-surface-variant text-center">
                Menunggu Host menyelesaikan pembayaran
              </div>
            )}
          </div>
        )}

      {role === "mentor" &&
        status === "pending_mentor_accept" &&
        !isSessionEnded && (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={accept}
              disabled={!!loading}
              className="bg-secondary text-on-secondary py-3 px-4 rounded-lg font-label-md text-label-md hover:bg-on-secondary-fixed-variant transition-colors w-full shadow-sm"
            >
              {loading === "accept" ? "Memproses..." : "Terima Sesi"}
            </button>
            <div className="flex gap-2">
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Alasan tolak (opsional)"
                className="flex-1 bg-surface border border-outline-variant rounded-lg px-3 py-2 text-on-surface font-body-sm focus:border-error focus:ring-1 focus:ring-error outline-none"
              />
              <button
                type="button"
                onClick={reject}
                disabled={!!loading}
                className="bg-error text-on-error px-4 py-2 rounded-lg font-label-md hover:bg-error-container hover:text-on-error-container transition-colors"
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
                className="bg-primary text-on-primary py-3 px-4 rounded-lg font-label-md text-label-md hover:bg-primary-fixed-variant transition-colors w-full shadow-sm"
              >
                {loading === "complete" ? "Memproses..." : "Tandai Selesai"}
              </button>
            ) : (
              <div className="rounded-lg bg-surface-container-high border border-outline-variant/20 p-3 text-sm text-on-surface-variant text-center">
                Menunggu persetujuan {role === "mentor" ? "Host" : "Mentor"} untuk mengakhiri sesi.
              </div>
            )}
            {((role === "mentor" && hostMarkedCompleted && !mentorMarkedCompleted) || 
              (role === "host" && mentorMarkedCompleted && !hostMarkedCompleted)) && (
              <p className="text-xs text-primary text-center mt-1">
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
              className="w-full bg-surface-container text-on-surface py-3 px-4 rounded-lg font-label-md text-label-md border border-outline-variant/50 hover:bg-surface-variant transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">star</span>
              Berikan Ulasan Mentor
            </button>
          ) : (
            <form onSubmit={submitReview} className="space-y-3 rounded-lg border border-outline-variant/30 p-4 bg-surface-container-lowest shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <h3 className="text-sm font-semibold text-on-surface">Tulis Ulasan</h3>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Rating (1-5)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRating(r)}
                      className={`h-8 w-8 rounded-full text-sm font-medium transition-colors ${
                        rating >= r ? "bg-amber-400 text-amber-900" : "bg-surface-container text-outline"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Komentar (Opsional)</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-on-surface font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                  rows={2}
                  placeholder="Sangat membantu, penjelasan mata kuliahnya jelas..."
                />
              </div>
              <div className="flex gap-2 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 rounded-lg text-on-surface-variant font-label-md hover:bg-surface-container transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!!loading}
                  className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md hover:bg-primary-fixed-variant transition-colors"
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
