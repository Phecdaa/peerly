"use client";

import { useState } from "react";
import { ReportButton } from "@/components/ReportButton";

type TabsProps = {
  jadwalComponent: React.ReactNode;
  ulasanComponent: React.ReactNode;
  mentorId: string;
};

export function MentorTabs({ jadwalComponent, ulasanComponent, mentorId }: TabsProps) {
  const [activeTab, setActiveTab] = useState<"jadwal" | "ulasan">("jadwal");

  return (
    <>
      {/* Tab Navigation */}
      <div className="flex border-b border-zinc-200 sticky top-16 z-20 bg-zinc-50/90 backdrop-blur-md">
        <button
          onClick={() => setActiveTab("jadwal")}
          className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === "jadwal" ? "border-blue-600 text-blue-600" : "border-transparent text-zinc-500"
          }`}
        >
          Info & Jadwal
        </button>
        <button
          onClick={() => setActiveTab("ulasan")}
          className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === "ulasan" ? "border-blue-600 text-blue-600" : "border-transparent text-zinc-500"
          }`}
        >
          Peringkat & Ulasan
        </button>
      </div>

      {/* Tab Content */}
      <div className="py-6 px-4">
        {activeTab === "jadwal" ? jadwalComponent : ulasanComponent}
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 p-4 md:hidden z-50 flex items-center justify-between pb-safe">
         <ReportButton targetType="mentor" targetId={mentorId} />
         <button 
            onClick={() => {
              setActiveTab("jadwal");
              // Wait for render then scroll
              setTimeout(() => document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
            }} 
            className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:bg-blue-700 transition"
         >
            Pilih Jadwal
         </button>
      </div>
    </>
  );
}
