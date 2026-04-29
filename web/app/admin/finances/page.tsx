import { getSupabaseServerClient } from "@/lib/supabase/server";
import { PayoutsTable } from "./PayoutsTable";

export default async function AdminFinancesPage() {
  const supabase = await getSupabaseServerClient();

  // Escrow balance: Sum of all payments with direction 'student_to_platform' and status 'escrow'
  // Or simply sum of amount_paid from room_participants where room is not finished/cancelled.
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

  // Fetch pending payouts from payments table where direction is platform_to_mentor
  // Since we use rooms and payments might not be fully linked to mentor_id directly,
  // we'll fetch from payments and try to join bookings -> mentor_id -> profiles
  const { data: payoutsRaw } = await supabase
    .from("payments")
    .select(`
      id,
      amount,
      status,
      created_at,
      metadata,
      booking:bookings(
        mentor:profiles!mentor_id(id, full_name, avatar_url, major)
      )
    `)
    .eq("direction", "platform_to_mentor")
    .order("created_at", { ascending: false });

  const pendingCount = payoutsRaw?.filter(p => p.status === 'escrow').length || 0;
  
  // Calculate total processed this week (mock implementation using all released)
  const processedAmount = payoutsRaw
    ?.filter(p => p.status === 'released')
    .reduce((sum, p) => sum + Number(p.amount), 0) || 0;



  return (
    <main className="flex-1 p-8 lg:p-10 flex flex-col gap-6 max-w-[1280px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col gap-1 mb-4">
        <h1 className="font-h2 text-h2 text-on-surface">Payout Management</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">Review and process mentor withdrawal requests from the central escrow.</p>
      </div>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Primary Metric: Escrow Balance (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-primary-container rounded-xl p-8 shadow-[0_8px_30px_rgba(33,112,228,0.15)] relative overflow-hidden flex flex-col justify-between min-h-[240px]">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-surface-tint/20 rounded-full blur-xl"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm text-on-primary-container">
                <span className="material-symbols-outlined">account_balance</span>
              </div>
              <span className="font-label-md text-label-md text-on-primary-container/80 uppercase tracking-wider">Total Escrow Balance</span>
            </div>
            <span className="bg-white/20 text-on-primary-container font-label-sm text-label-sm px-2 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-secondary-fixed"></span> Active
            </span>
          </div>
          
          <div className="relative z-10 mt-auto">
            <div className="font-h1 text-[64px] leading-none tracking-tight text-on-primary-container font-extrabold mb-2">
              Rp {totalEscrow.toLocaleString()}
            </div>
            <div className="flex items-center gap-4">
              <p className="font-body-md text-body-md text-on-primary-container/90">Available for immediate disbursement</p>
            </div>
          </div>
        </div>

        {/* Secondary Metrics Stack */}
        <div className="flex flex-col gap-6">
          {/* Pending Requests Card */}
          <div className="flex-1 bg-surface rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-surface-variant flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-tertiary-container/20 text-tertiary flex items-center justify-center">
                <span className="material-symbols-outlined text-sm">pending_actions</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Pending Requests</span>
            </div>
            <div className="font-h2 text-h2 text-on-surface mb-1">{pendingCount}</div>
            <p className="font-label-sm text-label-sm text-tertiary font-medium">Requires attention</p>
          </div>

          {/* Processed Total Card */}
          <div className="flex-1 bg-surface rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-surface-variant flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-secondary-container/30 text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-sm">check_circle</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total Processed</span>
            </div>
            <div className="font-h2 text-h2 text-on-surface mb-1">Rp {processedAmount.toLocaleString()}</div>
            <p className="font-label-sm text-label-sm text-secondary font-medium">Historical payouts</p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-surface rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-surface-variant overflow-hidden flex flex-col flex-1">
        {/* Table Header Actions */}
        <div className="p-6 border-b border-surface-variant flex items-center justify-between bg-surface-container-lowest">
          <h3 className="font-h3 text-h3 text-on-surface">Withdrawal Requests</h3>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg text-on-surface font-label-md text-label-md hover:bg-surface-variant transition-colors">
              <span className="material-symbols-outlined text-[20px]">filter_list</span>
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-surface-tint transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[20px]">download</span>
              Export CSV
            </button>
          </div>
        </div>

        {/* Data Table */}
        <PayoutsTable payouts={(payoutsRaw || []).map((payout: any) => {
          const mentor = payout.booking?.mentor;
          return {
            id: payout.id,
            amount: Number(payout.amount),
            status: payout.status,
            created_at: payout.created_at,
            mentorName: mentor?.full_name || "Unknown Mentor",
            mentorAvatar: mentor?.avatar_url || null,
            mentorMajor: mentor?.major || null,
          };
        })} />
      </div>
    </main>
  );
}
