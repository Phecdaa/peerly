import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NotificationList } from "./NotificationList";

export const revalidate = 0; // Ensure fresh data on every visit

export default async function NotificationsPage() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Attempt to fetch notifications
  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const safeNotifications = error ? [] : (notifications ?? []);

  return (
    <div className="flex-1 flex flex-col w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-xl gap-4">
        <div>
          <h1 className="font-h2 text-h2 text-on-background">Notifications</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Stay updated with your study groups and platform alerts.</p>
        </div>
      </div>
      
      {error && (
        <div className="bg-error-container border border-error/20 text-on-error-container p-4 rounded-xl text-sm mb-6 shadow-sm">
          <strong className="block mb-1 font-bold">⚠️ Error loading notifications</strong>
          There was a problem fetching your notifications from the database.
        </div>
      )}
      
      <NotificationList initialNotifications={safeNotifications as any[]} />
    </div>
  );
}
