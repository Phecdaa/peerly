"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Participant = { id: string; full_name: string | null; avatar_url: string | null };

type Props = {
  roomId: number;
  title: string;
  status: string;
  scheduledStart: string;
  scheduledEnd: string;
  participants: Participant[];
  existingContent: string;
  mentorId: string;
};

export function SessionNotesClient({
  roomId,
  title,
  status,
  scheduledStart,
  scheduledEnd,
  participants,
  existingContent,
  mentorId,
}: Props) {
  const router = useRouter();
  const [content, setContent] = useState(existingContent);
  const [privateNotes, setPrivateNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(!!existingContent);

  const startDate = new Date(scheduledStart);
  const endDate = new Date(scheduledEnd);
  const durationMins = Math.round((endDate.getTime() - startDate.getTime()) / 60000);

  const dateStr = startDate.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = `${startDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} - ${endDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} (${durationMins} min)`;

  async function handleSave() {
    if (!content.trim()) {
      alert("Catatan sesi tidak boleh kosong.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/mentor/sessions/${roomId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, private_notes: privateNotes }),
      });
      if (res.ok) {
        setSaved(true);
        alert("Catatan sesi berhasil disimpan!");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Gagal menyimpan catatan.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="sticky top-16 z-30 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/50 px-4 md:px-8 h-14 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <Link href="/mentor/earnings" className="flex items-center gap-1 text-primary hover:text-on-primary-fixed-variant transition-colors group">
          <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
          <span className="font-label-md text-label-md">Back</span>
        </Link>
        <div className="font-h3 text-[18px] text-on-surface hidden md:block">Session Notes</div>
        <div className="flex items-center gap-4">
          <Link href="/mentor/earnings" className="text-on-surface-variant font-label-md text-label-md hover:text-on-surface transition-colors">Discard</Link>
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            {loading ? "Saving..." : "Save Notes"}
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 w-full max-w-[900px] mx-auto py-10 px-4 md:px-8 flex flex-col gap-8">
        {/* Session Overview Card */}
        <section className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px]">calendar_today</span>
              <span>{dateStr} • {timeStr}</span>
            </div>
            <h1 className="font-h2 text-h2 text-on-surface">{title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 rounded text-[12px] font-medium flex items-center gap-1 ${
                status === "finished" 
                  ? "bg-secondary-container/50 text-on-secondary-container" 
                  : "bg-surface-container-low text-on-surface-variant border border-outline-variant/50"
              }`}>
                <span className="material-symbols-outlined text-[14px]">
                  {status === "finished" ? "done_all" : "schedule"}
                </span>
                {status === "finished" ? "Completed" : status}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Participants</span>
            <div className="flex -space-x-2">
              {participants.slice(0, 4).map((p) => (
                <img
                  key={p.id}
                  alt={p.full_name || "User"}
                  className="w-10 h-10 rounded-full border-2 border-surface-container-lowest shadow-sm object-cover"
                  src={p.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(p.full_name || "U")}`}
                />
              ))}
              {participants.length > 4 && (
                <div className="w-10 h-10 rounded-full border-2 border-surface-container-lowest bg-surface-container-high flex items-center justify-center text-on-surface-variant font-label-sm text-label-sm shadow-sm">
                  +{participants.length - 4}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notes Editor */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col min-h-[500px]">
              <div className="p-4 border-b border-outline-variant/30 flex items-center justify-between">
                <h2 className="font-h3 text-[18px] text-on-surface">Detailed Session Notes</h2>
                {saved && (
                  <span className="text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">cloud_done</span>
                    Saved
                  </span>
                )}
              </div>
              <textarea
                value={content}
                onChange={(e) => { setContent(e.target.value); setSaved(false); }}
                placeholder="Tulis catatan sesi di sini... Apa yang dibahas? Bagaimana progress student? Apa yang perlu diperbaiki?"
                className="flex-1 p-6 bg-surface-container-lowest text-on-surface font-body-md text-body-md outline-none resize-none min-h-[400px] placeholder:text-outline"
              />
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Private Notes */}
            <section className="bg-surface-container-low rounded-2xl border border-outline-variant/30 p-4 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary">lock</span>
                <div>
                  <h2 className="font-h3 text-[18px] text-on-surface">Private Observations</h2>
                  <p className="font-body-md text-[12px] text-on-surface-variant">Only visible to you and system admins.</p>
                </div>
              </div>
              <textarea
                value={privateNotes}
                onChange={(e) => setPrivateNotes(e.target.value)}
                placeholder="Note any behavioral issues, exceptional progress, or specific concerns..."
                className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg p-4 font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y min-h-[150px] outline-none placeholder:text-outline"
              />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
