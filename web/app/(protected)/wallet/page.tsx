"use client";

import Link from "next/link";

export default function WalletPage() {
  return (
    <div className="flex-1 w-full flex flex-col pt-4">
      <header className="mb-xl flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-h1 text-h1 text-on-surface mb-2">Wallet &amp; Payments</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Manage your balance, recent transactions, and escrowed funds.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Balance Card (Bento Style) */}
        <div className="bg-primary text-on-primary rounded-xl p-lg shadow-[0_8px_30px_rgba(0,88,190,0.15)] flex flex-col justify-between relative overflow-hidden lg:col-span-1 min-h-[240px]">
          {/* Decorative background elements */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-tertiary/20 rounded-full blur-xl pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <span className="font-label-md text-label-md text-on-primary/80">Available Balance</span>
              <span className="material-symbols-outlined opacity-80" style={{ fontVariationSettings: "'FILL' 1" }}>
                account_balance_wallet
              </span>
            </div>
            <div className="font-h1 text-h1 mb-2">Rp 0</div>
            <div className="font-label-sm text-label-sm text-on-primary/70 bg-white/10 inline-block px-3 py-1 rounded-full backdrop-blur-sm">
              No recent income
            </div>
          </div>
          
          <div className="flex gap-3 mt-8 relative z-10">
            <button className="flex-1 bg-white text-primary font-label-md text-label-md py-2.5 rounded-lg hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">add</span> Top Up
            </button>
            <button className="flex-1 bg-primary-container text-on-primary-container border border-white/20 font-label-md text-label-md py-2.5 rounded-lg hover:bg-primary-container/80 transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">arrow_downward</span> Withdraw
            </button>
          </div>
        </div>

        {/* Pending Escrow */}
        <div className="bg-white rounded-xl p-lg shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-100 lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-h3 text-h3 text-on-surface">Pending Escrow</h2>
            <span className="bg-surface-container-low text-primary px-3 py-1 rounded-full font-label-sm text-label-sm border border-primary-fixed">
              0 Rooms Waiting
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">
            Funds currently held securely for upcoming mentoring sessions. They will be released upon room completion.
          </p>
          
          <div className="flex flex-col gap-4 flex-1 justify-center items-center text-center">
            <div className="text-outline text-opacity-50">
              <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
              <p className="font-body-md">No pending escrow funds</p>
            </div>
            {/* Dummy content commented out, can be dynamically mapped later */}
            {/* <div className="flex items-center justify-between p-4 rounded-lg bg-surface hover:bg-surface-container-low transition-colors border border-surface-variant w-full">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">school</span>
                </div>
                <div className="text-left">
                  <div className="font-label-md text-label-md text-on-surface">Advanced Calculus Review</div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant">with Dr. Alan Turing • Tomorrow, 2:00 PM</div>
                </div>
              </div>
              <div className="font-h3 text-h3 text-on-surface">Rp 45.000</div>
            </div> */}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mt-lg bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
        <div className="p-lg border-b border-slate-100 flex justify-between items-center bg-surface-bright">
          <h2 className="font-h3 text-h3 text-on-surface">Recent Transactions</h2>
          <button className="text-primary font-label-md text-label-md hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-surface text-on-surface-variant font-label-sm text-label-sm">
                <th className="p-4 font-semibold w-1/3">Description</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-on-surface">
              <tr>
                <td colSpan={4} className="p-8 text-center text-on-surface-variant font-body-md italic">
                  No recent transactions found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
