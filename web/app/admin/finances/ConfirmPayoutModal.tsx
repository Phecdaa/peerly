"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  payoutId: number;
  mentorName: string;
  amount: number;
  onClose: () => void;
};

export function ConfirmPayoutModal({ payoutId, mentorName, amount, onClose }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/payouts/${payoutId}/confirm`, {
        method: "POST",
      });
      if (res.ok) {
        alert("Payout berhasil diproses!");
        onClose();
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Gagal memproses payout.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.1)] border border-outline-variant/30 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex flex-col items-center pt-10 px-6 pb-4 text-center">
          <div className="h-16 w-16 bg-primary-container/10 rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[32px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
          </div>
          <h2 className="font-h3 text-h3 text-on-surface mb-1">Confirm Payout</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Review details before processing withdrawal.</p>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <div className="bg-surface-container-low rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center py-1 border-b border-surface-variant">
              <span className="font-label-md text-label-md text-on-surface-variant">Mentor Name</span>
              <span className="font-body-md text-body-md font-medium text-on-surface">{mentorName}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-surface-variant">
              <span className="font-label-md text-label-md text-on-surface-variant">Method</span>
              <span className="font-body-md text-body-md font-medium text-on-surface">Bank Transfer</span>
            </div>
            <div className="flex justify-between items-center py-1 pt-2">
              <span className="font-label-md text-label-md text-on-surface-variant">Total Amount</span>
              <span className="font-h3 text-h3 text-primary font-bold">Rp {amount.toLocaleString("id-ID")}</span>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 mt-4 p-2 bg-error-container/30 rounded border border-error/20">
            <span className="material-symbols-outlined text-error text-[20px] mt-0.5">info</span>
            <p className="font-label-sm text-label-sm text-on-surface-variant">Aksi ini tidak dapat dibatalkan setelah diproses. Dana akan ditransfer segera.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 rounded-lg border border-outline text-on-surface font-label-md text-label-md hover:bg-surface-variant transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-2 px-4 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-surface-tint shadow-[0_4px_12px_rgba(33,112,228,0.3)] transition-all flex items-center justify-center gap-1 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            {loading ? "Processing..." : "Confirm & Process"}
          </button>
        </div>
      </div>
    </div>
  );
}
