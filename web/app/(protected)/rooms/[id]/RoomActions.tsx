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
};

export function RoomActions({
  roomId,
  role,
  status,
  hasPaid,
  amountPerPerson = 0,
  isSessionEnded,
  paymentMode = "split_equal",
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

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

      {role === "mentor" &&
        status === "scheduled" &&
        isSessionEnded && (
          <button
            type="button"
            onClick={complete}
            disabled={!!loading}
            className="btn btn-primary w-full"
          >
            {loading === "complete" ? "Memproses..." : "Tandai selesai"}
          </button>
        )}
    </div>
  );
}
