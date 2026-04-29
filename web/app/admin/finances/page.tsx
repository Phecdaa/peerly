import { getSupabaseServerClient } from "@/lib/supabase/server";

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

  function getInitials(name: string | null) {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  }

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
        <div className="overflow-x-auto">
          {(!payoutsRaw || payoutsRaw.length === 0) ? (
            <div className="p-8 text-center text-on-surface-variant">No withdrawal requests found.</div>
          ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-variant">
                <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant font-semibold">Mentor</th>
                <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant font-semibold">Details</th>
                <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant font-semibold">Requested Amount</th>
                <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant font-semibold">Status</th>
                <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-on-surface divide-y divide-surface-variant bg-surface-container-lowest">
              {payoutsRaw.map((payout: any) => {
                // If it's linked to booking -> mentor
                const mentor = payout.booking?.mentor;
                // mapping status
                const uiStatus = payout.status === 'escrow' ? 'Pending' : payout.status === 'released' ? 'Processed' : 'Refunded';

                return (
                  <tr key={payout.id} className="hover:bg-surface-container-low/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {mentor?.avatar_url ? (
                          <img alt="Mentor" className="w-10 h-10 rounded-full border border-surface-variant object-cover" src={mentor.avatar_url} />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center font-bold text-lg">
                            {getInitials(mentor?.full_name)}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-on-surface">{mentor?.full_name || 'Unknown Mentor'}</div>
                          <div className="font-label-sm text-label-sm text-on-surface-variant">{mentor?.major || 'Mentor'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium flex items-center gap-2">
                        Bank Transfer
                      </div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant font-mono tracking-widest mt-0.5">
                        {/* ID of payment as placeholder for account num */}
                        **** {payout.id.toString().padStart(4, '0')}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-on-surface">Rp {Number(payout.amount).toLocaleString()}</div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant">
                        {new Date(payout.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-label-sm text-label-sm ${
                        uiStatus === 'Pending' ? 'bg-surface-variant text-on-surface-variant' :
                        uiStatus === 'Refunded' ? 'bg-error-container text-on-error-container' :
                        'bg-secondary-container/40 text-on-secondary-container'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          uiStatus === 'Pending' ? 'bg-tertiary' :
                          uiStatus === 'Refunded' ? 'bg-error' :
                          'bg-secondary'
                        }`}></span> {uiStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {uiStatus === 'Pending' && (
                          <>
                            <button className="px-2 py-1.5 bg-primary text-on-primary font-label-sm text-label-sm rounded hover:bg-surface-tint transition-colors shadow-sm">Mark as Paid</button>
                          </>
                        )}
                        {uiStatus !== 'Pending' && (
                          <span className="font-label-sm text-label-sm text-on-surface-variant">Processed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          )}
        </div>
      </div>
    </main>
  );
}
