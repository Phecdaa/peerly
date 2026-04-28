import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  const firstName = profile?.full_name?.split(" ")[0] ?? user.email?.split("@")[0];

  // Fetch all user's room participations
  const { data: participations } = await supabase
    .from("room_participants")
    .select(`
      room_id, has_paid, amount_to_pay, role,
      rooms (
        *,
        course:courses(name),
        mentor:profiles!rooms_mentor_id_fkey(full_name, avatar_url),
        host:profiles!rooms_host_id_fkey(full_name, avatar_url)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Filter for Upcoming Sessions (Scheduled or Ongoing)
  const upcomingSessions = (participations || [])
    .filter(p => {
      const r = p.rooms as any;
      return r && (r.status === "scheduled" || r.status === "ongoing");
    })
    .map(p => p.rooms as any)
    .sort((a, b) => new Date(a.scheduled_start).getTime() - new Date(b.scheduled_start).getTime())
    .slice(0, 4); // Max 4 on dashboard

  // Filter for Pending Invites / Payments
  const pendingInvites = (participations || [])
    .filter(p => {
      const r = p.rooms as any;
      // If room is waiting payment and this user hasn't paid, it's a pending action
      return r && r.status === "waiting_payment" && !p.has_paid;
    });

  // Calculate Wallet (Total pending payments needed)
  const pendingPaymentSum = pendingInvites.reduce((sum, p) => sum + (p.amount_to_pay || 0), 0);

  // Fetch recent notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3);

  const safeNotifications = notifications || [];

  return (
    <>
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-xl gap-4">
        <div>
          <h1 className="font-h1 text-h1 text-on-surface mb-xs">Welcome back, {firstName}</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Here's what's happening in your study network today.</p>
        </div>
        <Link href="/mentors" className="md:hidden flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md w-full shadow-[0_4px_14px_rgba(33,112,228,0.3)]">
          <span className="material-symbols-outlined">add</span>
          Create Room
        </Link>
      </header>

      {/* Dashboard Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Main Column (Upcoming Sessions & Invites) */}
        <div className="lg:col-span-8 flex flex-col gap-lg">
          {/* Upcoming Sessions Bento Box */}
          <section className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-md">
              <h2 className="font-h3 text-h3 text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">calendar_today</span>
                Upcoming Sessions
              </h2>
              <Link href="/rooms" className="text-primary font-label-md text-label-md hover:underline">View All</Link>
            </div>
            
            {upcomingSessions.length === 0 ? (
              <div className="py-8 text-center bg-surface rounded-lg border border-outline-variant/30">
                <span className="material-symbols-outlined text-outline text-[40px] mb-2">event_busy</span>
                <p className="text-on-surface-variant font-body-md">You don't have any upcoming sessions.</p>
                <Link href="/mentors" className="text-primary font-label-md mt-2 inline-block hover:underline">Find a mentor</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingSessions.map((room) => {
                  const isLive = room.status === "ongoing";
                  const startDate = new Date(room.scheduled_start);
                  
                  return (
                    <div key={room.id} className="bg-surface rounded-lg p-md border border-outline-variant hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-primary/20 transition-all duration-300 relative overflow-hidden flex flex-col h-full">
                      {isLive && <div className="absolute top-0 left-0 w-1 h-full bg-secondary"></div>}
                      
                      <div className="flex justify-between items-start mb-sm">
                        {isLive ? (
                          <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-label-sm text-label-sm flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span> Live Now
                          </span>
                        ) : (
                          <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-3 py-1 rounded-full font-label-sm text-label-sm">Upcoming</span>
                        )}
                        <span className="text-on-surface-variant font-label-md text-label-md flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">schedule</span> 
                          {startDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        </span>
                      </div>
                      
                      <h3 className="font-h3 text-body-lg font-semibold text-on-surface mb-xs">{room.title || "Study Session"}</h3>
                      <p className="font-body-md text-body-md text-on-surface-variant mb-md line-clamp-2">{room.course?.name || "General Topic"}</p>
                      
                      <div className="flex justify-between items-center pt-sm border-t border-outline-variant/30 mt-auto">
                        <div className="flex items-center gap-3">
                          <img alt="Mentor" className="w-8 h-8 rounded-full border border-outline-variant object-cover" src={room.mentor?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(room.mentor?.full_name || "M")}`} />
                          <div>
                            <p className="font-label-md text-label-md text-on-surface leading-tight">{room.mentor?.full_name?.split(" ")[0] || "Mentor"}</p>
                            <p className="font-label-sm text-label-sm text-on-surface-variant leading-tight">Mentor</p>
                          </div>
                        </div>
                        <Link href={`/rooms/${room.id}`} className={`${isLive ? 'bg-primary text-on-primary shadow-sm hover:opacity-90' : 'bg-primary/10 text-primary hover:bg-primary/20'} px-4 py-1.5 rounded-lg font-label-sm text-label-sm transition-all`}>
                          {isLive ? 'Enter Room' : 'Details'}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Room Invites / Action Required */}
          <section className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <h2 className="font-h3 text-h3 text-on-surface flex items-center gap-2 mb-md">
              <span className="material-symbols-outlined text-primary">mail</span>
              Pending Actions
            </h2>
            
            {pendingInvites.length === 0 ? (
              <p className="text-on-surface-variant font-body-md text-center py-4 bg-surface rounded-lg border border-outline-variant/30">No pending invites or payments.</p>
            ) : (
              <div className="flex flex-col gap-0 divide-y divide-outline-variant/30">
                {pendingInvites.map((participation) => {
                  const room = participation.rooms as any;
                  return (
                    <div key={room.id} className="py-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-surface-container-low/50 px-2 -mx-2 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <img alt="Inviter" className="w-10 h-10 rounded-full border border-outline-variant object-cover" src={room.host?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(room.host?.full_name || "H")}`} />
                        <div>
                          <p className="font-body-md text-body-md text-on-surface">
                            <span className="font-semibold">{room.host?.full_name?.split(" ")[0] || "Someone"}</span> invited you to <span className="font-semibold">{room.title || "a study session"}</span>
                          </p>
                          <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">payments</span> 
                            Requires Payment: Rp {participation.amount_to_pay?.toLocaleString() || 0}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Link href={`/rooms/${room.id}`} className="flex-1 sm:flex-none text-center px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity">
                          View & Pay
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Side Column (Payments & Notifications) */}
        <div className="lg:col-span-4 flex flex-col gap-lg">
          {/* Payment Status */}
          <section className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-md">
              <h2 className="font-h3 text-[20px] font-semibold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                Wallet
              </h2>
            </div>
            
            <div className={`rounded-lg p-md mb-4 flex flex-col gap-1 ${pendingPaymentSum > 0 ? 'bg-error-container text-on-error-container' : 'bg-primary-container text-on-primary-container'}`}>
              <span className="font-label-md text-label-md opacity-80">
                {pendingPaymentSum > 0 ? "Outstanding Balance" : "All Settled"}
              </span>
              <span className="font-h2 text-h2 font-bold">Rp {pendingPaymentSum.toLocaleString()}</span>
            </div>
            
            {pendingPaymentSum > 0 ? (
              <div className="flex flex-col gap-3">
                {pendingInvites.map(p => {
                  const room = p.rooms as any;
                  return (
                    <div key={`wallet-${room.id}`} className="flex justify-between items-center border-b border-outline-variant/20 pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                          <span className="material-symbols-outlined text-[16px]">history_edu</span>
                        </div>
                        <div>
                          <p className="font-label-md text-label-md text-on-surface leading-tight line-clamp-1">{room.title || "Study Session"}</p>
                          <p className="font-label-sm text-label-sm text-on-surface-variant leading-tight">Action required</p>
                        </div>
                      </div>
                      <span className="font-label-md text-label-md font-semibold text-on-surface whitespace-nowrap">Rp {p.amount_to_pay?.toLocaleString() || 0}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant text-center py-2">You don't have any pending payments. Great job!</p>
            )}
          </section>

          {/* Notifications */}
          <section className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex-1">
            <div className="flex justify-between items-center mb-md">
              <h2 className="font-h3 text-[20px] font-semibold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">notifications</span>
                Recent Activity
              </h2>
              <Link href="/notifications" className="text-primary font-label-sm text-label-sm hover:underline">All</Link>
            </div>
            
            {safeNotifications.length === 0 ? (
              <p className="text-on-surface-variant text-sm py-4 text-center border border-outline-variant/20 rounded-lg bg-surface">No recent activity to show.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {safeNotifications.map((notif: any) => (
                  <Link key={notif.id} href={notif.link_url || "#"} className="flex gap-3 group hover:bg-surface-container-low/50 p-2 -mx-2 rounded-lg transition-colors">
                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${notif.is_read ? 'bg-outline-variant' : 'bg-secondary'}`}></div>
                    <div>
                      <p className="font-body-md text-[14px] text-on-surface leading-snug group-hover:text-primary transition-colors">
                        <span className="font-semibold">{notif.title}</span> - {notif.message}
                      </p>
                      <p className="font-label-sm text-[11px] text-on-surface-variant mt-1">
                        {new Date(notif.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
