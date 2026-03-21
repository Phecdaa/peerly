"use client";
import { useEffect, useState } from "react";

export function RoomTime({ startTs, endTs, shortDate = false }: { startTs: string; endTs?: string; shortDate?: boolean }) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <span>...</span>;
  }

  const startStr = new Date(startTs).toLocaleString("id-ID", {
    dateStyle: shortDate ? "medium" : "full",
    timeStyle: "short",
  });

  if (!endTs) {
    return <span>{startStr}</span>;
  }

  return (
    <span>
      {startStr} – {new Date(endTs).toLocaleTimeString("id-ID", { timeStyle: "short" })}
    </span>
  );
}
