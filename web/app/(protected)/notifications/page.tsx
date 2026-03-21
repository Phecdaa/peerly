import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { NotificationList } from "./NotificationList";

export const revalidate = 0; // Ensure fresh data on every visit

export default async function NotificationsPage() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Attempt to fetch notifications
  // If the query fails (because the tables.sql haven't been run yet by the user), we return an empty array gracefully
  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Fallback safe mechanism for when the migration SQL hasn't been executed
  const safeNotifications = error ? [] : (notifications ?? []);

  return (
    <div className="bg-zinc-50 min-h-screen md:pb-8 pb-20">
      <header className="bg-blue-600 px-6 pt-10 pb-6 rounded-b-3xl text-white shadow-sm relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-1 -ml-1 hover:bg-white/20 rounded-full transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="text-xl font-bold tracking-wide">Notifikasi</h1>
        </div>
      </header>
      
      <div className="px-4 py-8">
        {error && (
           <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-xl text-xs mb-6 shadow-sm">
             <strong className="block mb-1 font-bold">⚠️ Sistem Notifikasi Sedang Disiapkan</strong>
             Fitur ini membutuhkan pembaruan database terbaru. Data notifikasi belum dapat ditampilkan. (Jalankan SQL Migration Phase 12).
           </div>
        )}
        <NotificationList initialNotifications={safeNotifications as any[]} />
      </div>
    </div>
  );
}
