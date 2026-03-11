"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  roomId: number;
  currentCount: number;
  maxCapacity: number;
  canInvite: boolean;
};

export function InviteByEmailForm({
  roomId,
  currentCount,
  maxCapacity,
  canInvite,
}: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFull = currentCount >= maxCapacity;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !canInvite || isFull) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/rooms/invite-by-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id: roomId, email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setEmail("");
        router.refresh();
      } else {
        setError(data.error ?? "Gagal mengundang");
      }
    } finally {
      setLoading(false);
    }
  }

  if (!canInvite) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <p className="text-xs text-zinc-500">
        Kapasitas: {currentCount} / {maxCapacity} orang
      </p>
      {isFull ? (
        <p className="text-sm text-amber-600">Room sudah penuh.</p>
      ) : (
        <>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email teman yang diundang"
            className="input py-2 text-sm"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="btn btn-secondary text-sm"
          >
            {loading ? "Mengundang..." : "Undang peserta"}
          </button>
        </>
      )}
    </form>
  );
}
