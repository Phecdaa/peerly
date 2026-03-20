"use client";

import { useEffect, useState } from "react";

type Slot = {
  id: number;
  start_ts: string;
  end_ts: string;
  max_students: number | null;
};

export function SlotList({ slots: initialSlots }: { slots: Slot[] }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!initialSlots?.length) {
    return <p className="text-sm text-zinc-500">Belum ada slot.</p>;
  }

  return (
    <ul className="space-y-2 text-sm text-zinc-700">
      {initialSlots.map((a) => (
        <li key={a.id} className="flex items-center justify-between gap-2">
          <span>
            {isClient ? (
              <>
                {new Date(a.start_ts).toLocaleString("id-ID", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}{" "}
                –{" "}
                {new Date(a.end_ts).toLocaleTimeString("id-ID", {
                  timeStyle: "short",
                })}
              </>
            ) : (
              // Fallback during server render (prevent layout shift but may briefly display UTC)
              "Memuat waktu..."
            )}
          </span>
          <span className="text-xs text-zinc-500">
            Maks. {a.max_students ?? 1} peserta
          </span>
        </li>
      ))}
    </ul>
  );
}
