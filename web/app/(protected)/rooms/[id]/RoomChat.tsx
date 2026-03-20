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
    <div className="flex flex-col rounded-xl border border-zinc-200 bg-white">
      <div className="max-h-64 overflow-y-auto p-3 space-y-2">
        {chatError ? (
          <p className="text-sm text-amber-700">{chatError}</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-zinc-500">Belum ada pesan.</p>
        ) : (
          messages.map((m) => {
            const isMe = m.sender_id === currentUserId;
            return (
              <div key={m.id} className={`flex flex-col mb-2 ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-zinc-500 mb-1 px-1 font-medium tracking-wide">
                  {isMe ? "Kamu" : profileMap[m.sender_id] ?? "Peserta"} • {new Date(m.created_at).toLocaleTimeString("id-ID", {timeStyle: "short"})}
                </span>
                <div className={`px-4 py-2.5 text-sm rounded-2xl max-w-[85%] break-words shadow-sm ${
                  isMe 
                    ? 'bg-indigo-600 text-white rounded-tr-sm' 
                    : 'bg-zinc-100 text-zinc-900 border border-zinc-200 rounded-tl-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      {!isReadOnly && (
        <form onSubmit={handleSubmit} className="flex gap-2 p-3 border-t border-zinc-200">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tulis pesan..."
            className="input flex-1 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="btn btn-primary py-2 px-4 text-sm"
          >
            Kirim
          </button>
        </form>
      )}
    </div>
  );
}
