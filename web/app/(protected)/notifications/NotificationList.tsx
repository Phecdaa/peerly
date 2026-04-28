"use client";
import { useState, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export function NotificationList({ initialNotifications }: { initialNotifications: any[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState("All");
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

  async function markAllAsRead() {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;
    
    const updated = notifications.map(n => ({ ...n, is_read: true }));
    setNotifications(updated);
    
    await supabase.from("notifications").update({ is_read: true }).in("id", unreadIds);
  }

  const filteredNotifications = useMemo(() => {
    if (filter === "All") return notifications;
    if (filter === "Rooms") return notifications.filter(n => n.type === "room_update");
    if (filter === "Payments") return notifications.filter(n => n.type === "payment");
    if (filter === "System") return notifications.filter(n => n.type === "system" || n.type === "promo");
    return notifications;
  }, [notifications, filter]);

  if (notifications.length === 0) {
    return (
      <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/30 shadow-sm text-center max-w-xl mx-auto">
        <div className="w-20 h-20 bg-surface-container text-on-surface-variant rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-[40px]">notifications_off</span>
        </div>
        <h3 className="font-h3 text-h3 text-on-surface mb-2">No notifications yet</h3>
        <p className="font-body-md text-on-surface-variant">We'll let you know when there's an update on your study sessions or account.</p>
      </div>
    );
  }

  const filters = ["All", "Rooms", "Payments", "System"];

  return (
    <>
      <div className="flex justify-end mb-4 -mt-16 relative z-10">
        <button 
          onClick={markAllAsRead}
          className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary-container/10 rounded-lg transition-colors font-label-md text-label-md border border-primary/20 w-fit bg-surface-container-lowest"
        >
          <span className="material-symbols-outlined text-[20px]">done_all</span>
          Mark all as read
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-lg overflow-x-auto pb-2 scrollbar-hide">
        {filters.map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-full font-label-md text-label-md whitespace-nowrap transition-colors ${
              filter === f 
                ? "bg-primary text-on-primary shadow-sm" 
                : "bg-surface-container-lowest text-on-surface-variant border border-outline-variant hover:bg-surface-container-low"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Notification Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        {filteredNotifications.map((n) => {
          const isRoom = n.type === "room_update";
          const isPayment = n.type === "payment";
          
          let colorConfig = {
            borderHover: "hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] border-outline-variant/30",
            barColor: "",
            dotColor: "",
            iconBg: "bg-surface-container",
            iconText: "text-on-surface-variant",
            iconName: "notifications",
            labelColor: "text-on-surface-variant",
            labelTitle: "System Alert"
          };

          if (isRoom) {
            colorConfig = {
              borderHover: "border-primary/20 hover:shadow-[0_8px_30px_rgba(0,88,190,0.1)]",
              barColor: "bg-primary",
              dotColor: "bg-primary shadow-[0_0_8px_rgba(0,88,190,0.5)]",
              iconBg: "bg-primary-container/20",
              iconText: "text-primary",
              iconName: "group_add",
              labelColor: "text-primary",
              labelTitle: "Room Update"
            };
          } else if (isPayment) {
            colorConfig = {
              borderHover: "border-secondary/20 hover:shadow-[0_8px_30px_rgba(0,108,73,0.1)]",
              barColor: "bg-secondary",
              dotColor: "bg-secondary shadow-[0_0_8px_rgba(0,108,73,0.5)]",
              iconBg: "bg-secondary-container/30",
              iconText: "text-secondary",
              iconName: "account_balance_wallet",
              labelColor: "text-secondary",
              labelTitle: "Payment"
            };
          }

          return (
            <div 
              key={n.id}
              onClick={() => markAsRead(n.id, n.link_url)}
              className={`bg-surface-container-lowest p-5 rounded-xl border shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all relative overflow-hidden group cursor-pointer ${colorConfig.borderHover} ${n.is_read ? 'opacity-80 hover:opacity-100' : ''}`}
            >
              {!n.is_read && <div className={`absolute left-0 top-0 bottom-0 w-1 ${colorConfig.barColor}`}></div>}
              {!n.is_read && <div className={`absolute top-5 right-5 w-2.5 h-2.5 rounded-full ${colorConfig.dotColor}`}></div>}
              
              <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${colorConfig.iconBg} ${colorConfig.iconText}`}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{colorConfig.iconName}</span>
                </div>
                
                <div className="flex-1 pr-6">
                  <p className={`font-label-sm text-label-sm mb-1 uppercase tracking-wider ${colorConfig.labelColor}`}>{colorConfig.labelTitle}</p>
                  <h3 className="font-h3 text-body-lg font-semibold text-on-background mb-1">{n.title}</h3>
                  <p className="font-body-md text-label-md text-on-surface-variant mb-4 line-clamp-2">{n.message}</p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <span className="font-label-sm text-label-sm text-outline flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span> 
                      {new Date(n.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    
                    {n.link_url && (
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="px-4 py-1.5 bg-surface-container-high text-on-surface rounded-lg font-label-sm text-label-sm hover:bg-surface-variant transition-colors border border-outline-variant/50">
                          View Details
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredNotifications.length === 0 && filter !== "All" && (
        <div className="py-12 text-center text-on-surface-variant">
          <p>No notifications found for this category.</p>
        </div>
      )}
    </>
  );
}
