"use client";
import { useEffect, useState } from "react";

export function RoomTime({ startTs, endTs }: { startTs: string; endTs: string }) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <span>Memuat waktu...</span>;
  }

  return (
    <span>
      {new Date(startTs).toLocaleString("id-ID", {
        dateStyle: "full",
        timeStyle: "short",
      })}{" "}
      –{" "}
      {new Date(endTs).toLocaleTimeString("id-ID", {
        timeStyle: "short",
      })}
    </span>
  );
}
