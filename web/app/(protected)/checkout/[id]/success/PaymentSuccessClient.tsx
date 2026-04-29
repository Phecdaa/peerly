"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Props = {
  roomId: number;
  title: string;
  mentorName: string;
  amountPaid: number;
  scheduledStart: string;
};

export function PaymentSuccessClient({ roomId, title, mentorName, amountPaid, scheduledStart }: Props) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const txId = `PRLY-${roomId.toString().padStart(4, "0")}`;
  const dateStr = new Date(scheduledStart).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 sm:p-6">
      <main className="w-full max-w-[500px] flex flex-col items-center">
        {/* Success Header */}
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-secondary-container flex items-center justify-center mb-6 shadow-[0px_4px_20px_rgba(108,248,187,0.3)] animate-[bounce_1s_ease-in-out]">
            <span className="material-symbols-outlined text-[48px] text-on-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h1 className="font-h1 text-h1 text-on-surface mb-2">Pembayaran Berhasil!</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Transaksi Anda telah diproses dan dikonfirmasi.</p>
        </div>

        {/* Payment Summary Card */}
        <div className="w-full bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant p-6 sm:p-10 mb-10">
          {/* Amount */}
          <div className="flex flex-col items-center justify-center pb-6 mb-6 border-b border-surface-variant">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Amount Paid</span>
            <span className="font-h1 text-h1 text-primary">Rp {amountPaid.toLocaleString("id-ID")}</span>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="font-body-md text-body-md text-on-surface-variant">Transaction ID</span>
              <span className="font-label-md text-label-md text-on-surface">#{txId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-body-md text-body-md text-on-surface-variant">Session</span>
              <span className="font-label-md text-label-md text-on-surface text-right max-w-[200px] truncate">{title}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-body-md text-body-md text-on-surface-variant">Mentor</span>
              <span className="font-label-md text-label-md text-on-surface">{mentorName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-body-md text-body-md text-on-surface-variant">Jadwal</span>
              <span className="font-label-md text-label-md text-on-surface text-right text-sm">{dateStr}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col gap-2">
            <Link
              href={`/rooms/${roomId}`}
              className="w-full bg-primary text-on-primary font-label-md text-label-md py-4 rounded-lg shadow-sm hover:bg-surface-tint transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">groups</span>
              Lihat Room {countdown > 0 ? `(${countdown}s)` : ""}
            </Link>
            <Link
              href="/dashboard"
              className="w-full bg-surface-container-lowest border border-outline-variant text-primary font-label-md text-label-md py-4 rounded-lg hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
