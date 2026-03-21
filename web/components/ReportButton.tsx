"use client";

import { useState } from "react";

export function ReportButton({ targetType, targetId }: { targetType: string; targetId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_type: targetType, target_id: targetId, reason }),
      });
      if (res.ok) {
        alert("Laporan berhasil dikirim. Tim admin akan meninjaunya.");
        setOpen(false);
        setReason("");
      } else {
        alert("Gagal mengirim laporan.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-zinc-400 underline hover:text-red-500 transition-colors inline-block"
      >
        Laporkan
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <h3 className="text-sm font-semibold p-4 border-b border-zinc-100 text-zinc-900">
              Laporkan {targetType === "mentor" ? "Mentor" : targetType === "room" ? "Sesi (Room)" : "Pengguna"}
            </h3>
            <form onSubmit={submit} className="p-4 space-y-3">
              <label className="block text-xs font-medium text-zinc-600 mb-1">
                Jelaskan alasan laporanmu
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                required
                className="textarea w-full text-sm"
                placeholder="Misalnya: Mentor tidak hadir, perilaku tidak pantas, spam..."
              />
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn bg-zinc-100 text-zinc-700 py-1.5 px-3 text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading || !reason.trim()}
                  className="btn bg-red-600 hover:bg-red-700 text-white py-1.5 px-3 text-xs"
                >
                  {loading ? "..." : "Kirim Laporan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
