"use client";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function NotificationList({ initialNotifications }: { initialNotifications: any[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const router = useRouter();

  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  async function markAsRead(id: string, link: string | null) {
    const updated = notifications.map(n => n.id === id ? { ...n, is_read: true } : n);
    setNotifications(updated);
    
    // Update db silently in background
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    
    if (link) {
      router.push(link);
    }
  }

  if (notifications.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-sm text-center">
         <div className="w-20 h-20 bg-blue-50 text-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
           <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
         </div>
         <h3 className="text-zinc-900 font-bold text-sm mb-1">Belum ada notifikasi</h3>
         <p className="text-zinc-500 text-xs">Semua pemberitahuan update pesanan dan promo akan masuk ke sini.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {notifications.map((n) => (
        <li key={n.id}>
           <div 
             onClick={() => markAsRead(n.id, n.link_url)}
             className={`flex gap-4 p-4 rounded-2xl border cursor-pointer transition ${n.is_read ? 'bg-white border-zinc-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] opacity-70' : 'bg-blue-50 border-blue-100 shadow-[0_2px_8px_rgba(59,130,246,0.08)]'} relative overflow-hidden`}
           >
             {!n.is_read && <div className="absolute top-0 bottom-0 left-0 w-1 bg-blue-500"></div>}
             <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center ${n.type === 'promo' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                {n.type === 'promo' ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                )}
             </div>
             <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`font-bold text-sm truncate pr-2 ${n.is_read ? 'text-zinc-700' : 'text-zinc-900'}`}>{n.title}</h3>
                  <span className="text-[10px] text-zinc-400 whitespace-nowrap">{new Date(n.created_at).toLocaleDateString("id-ID", { month: "short", day: "numeric" })}</span>
                </div>
                <p className="text-xs text-zinc-600 leading-snug line-clamp-2">{n.message}</p>
             </div>
           </div>
        </li>
      ))}
    </ul>
  );
}
