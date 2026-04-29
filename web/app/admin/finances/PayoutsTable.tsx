"use client";

import { useState } from "react";
import { ConfirmPayoutModal } from "./ConfirmPayoutModal";

type Payout = {
  id: number;
  amount: number;
  status: string;
  created_at: string;
  mentorName: string;
  mentorAvatar: string | null;
  mentorMajor: string | null;
};

export function PayoutsTable({ payouts }: { payouts: Payout[] }) {
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);

  function getInitials(name: string | null) {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  }

  return (
    <>
      <div className="overflow-x-auto">
        {payouts.length === 0 ? (
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
              {payouts.map((payout) => {
                const uiStatus = payout.status === "escrow" ? "Pending" : payout.status === "released" ? "Processed" : "Refunded";
                return (
                  <tr key={payout.id} className="hover:bg-surface-container-low/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {payout.mentorAvatar ? (
                          <img alt="Mentor" className="w-10 h-10 rounded-full border border-surface-variant object-cover" src={payout.mentorAvatar} />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center font-bold text-lg">
                            {getInitials(payout.mentorName)}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-on-surface">{payout.mentorName || "Unknown Mentor"}</div>
                          <div className="font-label-sm text-label-sm text-on-surface-variant">{payout.mentorMajor || "Mentor"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium flex items-center gap-2">Bank Transfer</div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant font-mono tracking-widest mt-0.5">
                        **** {payout.id.toString().padStart(4, "0")}
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
                        uiStatus === "Pending" ? "bg-surface-variant text-on-surface-variant" :
                        uiStatus === "Refunded" ? "bg-error-container text-on-error-container" :
                        "bg-secondary-container/40 text-on-secondary-container"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          uiStatus === "Pending" ? "bg-tertiary" :
                          uiStatus === "Refunded" ? "bg-error" :
                          "bg-secondary"
                        }`}></span>
                        {uiStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {uiStatus === "Pending" && (
                          <button
                            onClick={() => setSelectedPayout(payout)}
                            className="px-2 py-1.5 bg-primary text-on-primary font-label-sm text-label-sm rounded hover:bg-surface-tint transition-colors shadow-sm"
                          >
                            Mark as Paid
                          </button>
                        )}
                        {uiStatus !== "Pending" && (
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

      {/* Confirm Payout Modal */}
      {selectedPayout && (
        <ConfirmPayoutModal
          payoutId={selectedPayout.id}
          mentorName={selectedPayout.mentorName}
          amount={selectedPayout.amount}
          onClose={() => setSelectedPayout(null)}
        />
      )}
    </>
  );
}
