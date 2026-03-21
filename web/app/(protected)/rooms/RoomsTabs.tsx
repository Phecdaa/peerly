"use client";

import { useState } from "react";
import Link from "next/link";
import { RoomTime } from "./[id]/RoomTime";

type RoomSummary = {
  id: string;
  title: string;
  status: string;
  scheduled_start: string;
  scheduled_end: string;
};

const statusLabel: Record<string, string> = {
  pending_mentor_accept: "Menunggu mentor menerima",
  waiting_payment: "Menunggu pembayaran",
  scheduled: "Terjadwal",
  ongoing: "Berlangsung",
  finished: "Selesai",
  cancelled: "Dibatalkan",
};

export function RoomsTabs({
  asParticipant,
  asHost,
  asMentor,
  isMentorRole
}: {
  asParticipant: RoomSummary[];
  asHost: RoomSummary[];
  asMentor: RoomSummary[];
  isMentorRole: boolean;
}) {
  const [activeTab, setActiveTab] = useState<"learner" | "host" | "mentor">("learner");

  const renderList = (rooms: RoomSummary[], emptyMessage: string, iconBg: string, iconColor: string) => {
    if (!rooms || rooms.length === 0) {
      return (
        <div className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-sm text-center">
           <svg className="w-12 h-12 text-zinc-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
           <p className="text-zinc-500 text-sm">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <ul className="grid gap-3 sm:grid-cols-2">
        {rooms.map((r) => (
          <li key={r.id}>
            <Link href={`/rooms/${r.id}`} className="flex gap-3 bg-white p-3 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-zinc-100 hover:border-blue-200 transition">
              <div className="w-24 h-28 bg-zinc-100 rounded-xl flex-shrink-0 overflow-hidden relative">
                <div className={`absolute inset-0 flex items-center justify-center ${iconBg}`}>
                   <svg className={`w-8 h-8 ${iconColor}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                </div>
              </div>
              <div className="flex flex-col flex-1 min-w-0 justify-center">
                <p className="text-[10px] text-zinc-500 mb-1 font-medium"><RoomTime startTs={r.scheduled_start} shortDate /></p>
                <p className="text-[10px] text-zinc-400 mb-1.5 truncate">ID Room: {String(r.id).split('-')[0].toUpperCase()}</p>
                <h3 className="font-semibold text-zinc-900 text-sm leading-snug line-clamp-2 mb-2">{r.title || "Sesi belajar"}</h3>
                <div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${['finished', 'ongoing'].includes(r.status) ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                    Status: {statusLabel[r.status] ?? r.status}
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="px-4 py-4 pb-10">
      <div className="flex mb-6 bg-white p-1 rounded-xl shadow-sm border border-zinc-100">
        <button
          onClick={() => setActiveTab("learner")}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === "learner" ? "bg-blue-600 text-white shadow-sm" : "text-zinc-500"
          }`}
        >
          Learner
        </button>
        <button
          onClick={() => setActiveTab("host")}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === "host" ? "bg-blue-600 text-white shadow-sm" : "text-zinc-500"
          }`}
        >
          Host
        </button>
        {isMentorRole && (
          <button
            onClick={() => setActiveTab("mentor")}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === "mentor" ? "bg-blue-600 text-white shadow-sm" : "text-zinc-500"
            }`}
          >
            Mentor
          </button>
        )}
      </div>

      <div className="space-y-4">
         {activeTab === "learner" && renderList(asParticipant, "Belum ada pesanan sebagai murid.", "bg-gradient-to-br from-blue-50 to-indigo-50", "text-blue-200")}
         {activeTab === "host" && renderList(asHost, "Kamu belum membuat room apapun.", "bg-gradient-to-br from-slate-50 to-zinc-100", "text-zinc-300")}
         {activeTab === "mentor" && renderList(asMentor, "Belum ada pesanan masuk untukmu.", "bg-gradient-to-br from-indigo-50 to-purple-50", "text-indigo-200")}
      </div>
    </div>
  );
}
