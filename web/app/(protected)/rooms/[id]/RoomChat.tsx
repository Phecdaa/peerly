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
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function fetchMessages() {
    const res = await fetch(`/api/rooms/${roomId}/messages`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data);
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
        body: JSON.stringify({ content: content.trim() }),
      });
      if (res.ok) {
        setContent("");
        router.refresh();
        fetchMessages();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col rounded-xl border border-zinc-200 bg-white">
      <div className="max-h-64 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 ? (
          <p className="text-sm text-zinc-500">Belum ada pesan.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="text-sm">
              <span className="font-medium text-zinc-800">
                {m.sender_id === currentUserId
                  ? "Kamu"
                  : profileMap[m.sender_id] ?? "Peserta"}
              </span>
              <span className="text-zinc-500 text-xs ml-2">
                {new Date(m.created_at).toLocaleTimeString("id-ID", {
                  timeStyle: "short",
                })}
              </span>
              <p className="mt-0.5 text-zinc-700 break-words">{m.content}</p>
            </div>
          ))
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
