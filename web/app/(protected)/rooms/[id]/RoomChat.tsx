"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Message = {
  id: number;
  sender_id: string;
  content: string;
  created_at: string;
};

export function RoomChat({
  roomId,
  currentUserId,
  profileMap,
  isReadOnly,
}: {
  roomId: number;
  currentUserId: string;
  profileMap: Record<string, string>;
  isReadOnly: boolean;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatError, setChatError] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function fetchMessages() {
    const res = await fetch(`/api/rooms/${roomId}/messages`, {
      cache: "no-store",
      credentials: "same-origin",
    });
    if (res.ok) {
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
      setChatError(null);
    } else if (res.status === 403) {
      setChatError("Anda tidak punya akses ke chat room ini.");
    } else if (res.status === 404) {
      setChatError("Room tidak ditemukan.");
    }
  }

  useEffect(() => {
    fetchMessages();
    const t = setInterval(fetchMessages, 5000);
    return () => clearInterval(t);
  }, [roomId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || isReadOnly) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/rooms/${roomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ content: content.trim() }),
      });
      if (res.ok) {
        setContent("");
        fetchMessages();
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 flex flex-col h-full overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-surface-variant flex justify-between items-center bg-surface-container-low shrink-0">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">forum</span>
          <h3 className="font-label-md text-[16px] text-on-surface font-semibold">Room Chat</h3>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-background/50">
        {chatError ? (
          <p className="text-sm text-error text-center bg-error-container/20 p-2 rounded-md">{chatError}</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-on-surface-variant text-center italic mt-10">Belum ada pesan. Mulai sapa teman belajarmu!</p>
        ) : (
          messages.map((m) => {
            const isMe = m.sender_id === currentUserId;
            return (
              <div key={m.id} className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mt-1 shrink-0 ${isMe ? 'bg-primary-container text-primary' : 'bg-surface-variant text-on-surface-variant'}`}>
                  {isMe ? "K" : (profileMap[m.sender_id] ?? "P").charAt(0).toUpperCase()}
                </div>
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-baseline gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <span className="font-label-sm text-[13px] text-on-surface font-semibold">
                      {isMe ? "Kamu" : profileMap[m.sender_id] ?? "Peserta"}
                    </span>
                    <span className="text-[11px] text-outline">
                      {new Date(m.created_at).toLocaleTimeString("id-ID", {timeStyle: "short"})}
                    </span>
                  </div>
                  <div className={`p-3 font-body-md text-[14px] shadow-sm max-w-[240px] break-words ${
                    isMe 
                      ? 'bg-primary text-on-primary rounded-2xl rounded-tr-none' 
                      : 'bg-surface-container-low text-on-surface rounded-2xl rounded-tl-none border border-surface-variant'
                  }`}>
                    {m.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Chat Input */}
      {!isReadOnly && (
        <form onSubmit={handleSubmit} className="p-4 border-t border-surface-variant bg-surface-container-lowest shrink-0">
          <div className="relative flex items-center">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tulis pesan..."
              className="w-full bg-surface-container rounded-full py-2.5 pl-4 pr-12 text-[14px] font-body-md text-on-surface border-none focus:ring-2 focus:ring-primary/50 outline-none"
            />
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="absolute right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-on-primary hover:bg-primary-fixed-variant transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
            </button>
          </div>
        </form>
      )}
      {isReadOnly && (
        <div className="p-4 border-t border-surface-variant bg-surface-container-lowest shrink-0 text-center text-sm text-on-surface-variant italic">
          Chat telah ditutup karena sesi sudah berakhir.
        </div>
      )}
    </div>
  );
}
