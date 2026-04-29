import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminOverviewPage() {
  const supabase = await getSupabaseServerClient();

  // Fetch Users Count
  const { count: studentCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "learner");

  const { count: mentorCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("is_mentor", true);

  const totalUsers = (studentCount || 0) + (mentorCount || 0);

  // Fetch Sessions Count
  const { count: scheduledSessions } = await supabase
    .from("rooms")
    .select("*", { count: "exact", head: true })
    .eq("status", "scheduled");

  const { count: ongoingSessions } = await supabase
    .from("rooms")
    .select("*", { count: "exact", head: true })
    .eq("status", "ongoing");

  const totalSessions = (scheduledSessions || 0) + (ongoingSessions || 0);

  // Fetch Escrow Funds
  // Escrow funds = amount paid by students in rooms that haven't finished yet
  const { data: activeRooms } = await supabase
    .from("rooms")
    .select("id")
    .neq("status", "finished")
    .neq("status", "cancelled");

  let totalEscrow = 0;
  if (activeRooms && activeRooms.length > 0) {
    const roomIds = activeRooms.map(r => r.id);
    const { data: participants } = await supabase
      .from("room_participants")
      .select("amount_paid")
      .in("room_id", roomIds)
      .eq("role", "participant")
      .eq("has_paid", true);
      
    if (participants) {
      totalEscrow = participants.reduce((acc, p) => acc + Number(p.amount_paid || 0), 0);
    }
  }

  // Fetch Recent Activity (Admin Logs)
  const { data: recentLogs } = await supabase
    .from("admin_logs")
    .select("action, target_type, target_id, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  // Fetch Urgent Action Required (Pending Mentors, Open Reports)
  const { count: pendingVerifications } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("is_mentor", true)
    .eq("mentor_status", "pending");

  const { count: openReports } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("status", "open");

  const totalUrgent = (pendingVerifications || 0) + (openReports || 0);

  return (
    <main className="flex-1 p-8 lg:p-10 max-w-[1280px] mx-auto w-full">
      <header className="mb-10">
        <h1 className="font-h1 text-h1 text-on-surface mb-xs">System Overview</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">Real-time metrics and operational status.</p>
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* KPI Card 1: Users */}
        <div className="md:col-span-4 bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 p-6 flex flex-col justify-between hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow duration-300">
          <div className="flex justify-between items-start mb-6">
            <div className="p-2 bg-primary-container/20 rounded-lg text-primary">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
            </div>
            <span className="font-label-sm text-label-sm text-secondary bg-secondary-container/30 px-2 py-1 rounded-full">+Active</span>
          </div>
          <div>
            <h3 className="font-h3 text-h3 text-on-surface">{totalUsers.toLocaleString()}</h3>
            <p className="font-label-md text-label-md text-on-surface-variant mb-4">Total Registered Users</p>
            <div className="flex items-center gap-4 pt-4 border-t border-surface-variant">
              <div className="flex-1">
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Students</p>
                <p className="font-body-md text-body-md text-on-surface font-semibold">{studentCount?.toLocaleString()}</p>
              </div>
              <div className="w-px h-8 bg-surface-variant"></div>
              <div className="flex-1">
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Mentors</p>
                <p className="font-body-md text-body-md text-on-surface font-semibold">{mentorCount?.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Card 2: Sessions */}
        <div className="md:col-span-4 bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 p-6 flex flex-col justify-between hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow duration-300">
          <div className="flex justify-between items-start mb-6">
            <div className="p-2 bg-secondary-container/30 rounded-lg text-secondary">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>video_camera_front</span>
            </div>
            <span className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant bg-surface-variant/50 px-2 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              Live Now
            </span>
          </div>
          <div>
            <h3 className="font-h3 text-h3 text-on-surface">{totalSessions.toLocaleString()}</h3>
            <p className="font-label-md text-label-md text-on-surface-variant mb-4">Total Active Sessions</p>
            <div className="flex items-center gap-4 pt-4 border-t border-surface-variant">
              <div className="flex-1">
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Scheduled</p>
                <p className="font-body-md text-body-md text-on-surface font-semibold">{scheduledSessions?.toLocaleString()}</p>
              </div>
              <div className="w-px h-8 bg-surface-variant"></div>
              <div className="flex-1">
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Ongoing</p>
                <p className="font-body-md text-body-md text-secondary font-semibold">{ongoingSessions?.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Card 3: Escrow Funds */}
        <div className="md:col-span-4 bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 p-6 flex flex-col justify-between hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow duration-300">
          <div className="flex justify-between items-start mb-6">
            <div className="p-2 bg-tertiary-container/20 rounded-lg text-tertiary">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
            </div>
          </div>
          <div>
            <h3 className="font-h3 text-h3 text-on-surface">Rp {totalEscrow.toLocaleString()}</h3>
            <p className="font-label-md text-label-md text-on-surface-variant mb-4">Total Escrow Funds</p>
            <div className="pt-4 border-t border-surface-variant flex items-center justify-between">
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Ready for Payout</p>
                <p className="font-body-md text-body-md text-on-surface font-semibold">TBD</p>
              </div>
              <Link href="/admin/finances" className="font-label-md text-label-md text-primary hover:bg-primary-container/20 px-3 py-1.5 rounded-lg transition-colors">
                Process
              </Link>
            </div>
          </div>
        </div>

        {/* Urgent Notifications Section */}
        <div className="md:col-span-8 bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 flex flex-col">
          <div className="p-6 border-b border-surface-variant flex justify-between items-center">
            <h2 className="font-h3 text-h3 text-on-surface">Action Required</h2>
            <span className="bg-error-container text-on-error-container font-label-sm text-label-sm px-2.5 py-0.5 rounded-full">
              {totalUrgent} Urgent
            </span>
          </div>
          <div className="flex flex-col flex-1">
            
            {openReports ? (
              <div className="flex items-start gap-4 p-4 border-b border-surface-variant hover:bg-surface transition-colors group">
                <div className="mt-1 p-2 bg-error-container/50 rounded-full text-error">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>report</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-label-md text-label-md text-on-surface font-semibold mb-1">{openReports} Open Reports</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant text-sm">There are active user reports requiring moderation.</p>
                </div>
                <Link href="/admin/reports" className="font-label-md text-label-md text-on-primary bg-primary hover:bg-primary/90 px-4 py-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                  Review Case
                </Link>
              </div>
            ) : null}

            {pendingVerifications ? (
              <div className="flex items-start gap-4 p-4 hover:bg-surface transition-colors group rounded-b-xl">
                <div className="mt-1 p-2 bg-surface-variant rounded-full text-primary">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>badge</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-label-md text-label-md text-on-surface font-semibold mb-1">{pendingVerifications} Pending Mentors</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant text-sm">New mentor applications require your credential review.</p>
                </div>
                <Link href="/admin/verifications" className="font-label-md text-label-md text-primary border border-outline-variant hover:bg-surface-variant/30 px-4 py-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                  Verify
                </Link>
              </div>
            ) : null}

            {totalUrgent === 0 && (
              <div className="p-6 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2">check_circle</span>
                <p>All caught up! No urgent actions required.</p>
              </div>
            )}
            
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="md:col-span-4 bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 flex flex-col">
          <div className="p-6 border-b border-surface-variant">
            <h2 className="font-h3 text-h3 text-on-surface">Recent Activity</h2>
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
            {recentLogs && recentLogs.length > 0 ? (
              <div className="relative border-l-2 border-surface-variant ml-3 space-y-6 pb-4 pt-2">
                {recentLogs.map((log, i) => (
                  <div key={i} className="relative pl-6">
                    <div className="absolute w-3 h-3 bg-secondary rounded-full -left-[7px] top-1.5 ring-4 ring-surface-container-lowest"></div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant mb-0.5">{new Date(log.created_at).toLocaleString()}</p>
                    <p className="font-body-md text-body-md text-on-surface text-sm">{log.action}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-on-surface-variant py-4">No recent admin activity.</div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
