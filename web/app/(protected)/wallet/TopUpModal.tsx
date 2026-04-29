"use client";

import { useState } from "react";

type Props = {
  currentBalance: number;
  onClose: () => void;
};

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000, 1000000];

export function TopUpModal({ currentBalance, onClose }: Props) {
  const [amount, setAmount] = useState("50000");
  const [paymentMethod, setPaymentMethod] = useState("gopay");
  const [loading, setLoading] = useState(false);

  const methods = [
    { id: "gopay", label: "GoPay", fee: "Free" },
    { id: "bca_va", label: "BCA Virtual Account", fee: "Rp 1.000" },
    { id: "mandiri_va", label: "Mandiri Virtual Account", fee: "Rp 1.000" },
  ];

  async function handleTopUp() {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 10000) {
      alert("Minimum top up Rp 10.000");
      return;
    }
    setLoading(true);
    try {
      // Mock top-up
      alert(`Top up Rp ${numAmount.toLocaleString("id-ID")} berhasil diproses! (Mock)`);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-surface-container-lowest rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-variant flex items-center justify-between sticky top-0 bg-surface-container-lowest z-10">
          <h3 className="font-h3 text-h3 text-on-surface">Top Up Wallet</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-full hover:bg-surface-container-low">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Current Balance */}
          <div className="bg-surface-container-low rounded-lg p-4 mb-6 flex items-center justify-between border border-surface-variant">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
              <span className="font-label-md text-label-md text-on-surface-variant">Current Balance</span>
            </div>
            <span className="font-body-lg text-body-lg font-semibold text-on-surface">Rp {currentBalance.toLocaleString("id-ID")}</span>
          </div>

          {/* Amount */}
          <div className="mb-6">
            <label className="block font-label-md text-label-md text-on-surface mb-2">Select Amount</label>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {QUICK_AMOUNTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(String(q))}
                  className={`py-2 px-1 rounded-lg border font-label-md text-label-md transition-colors text-center ${
                    parseInt(amount) === q
                      ? "border-primary bg-primary-fixed text-on-primary-fixed-variant"
                      : "border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low"
                  }`}
                >
                  Rp {q >= 1000000 ? `${q / 1000000}M` : `${q / 1000}k`}
                </button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-body-md text-body-md text-on-surface-variant">Rp</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter custom amount"
                className="w-full pl-10 pr-4 py-4 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface font-body-lg text-body-lg focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-2">Payment Method</label>
            <div className="flex flex-col gap-2">
              {methods.map((m) => (
                <label
                  key={m.id}
                  className={`relative flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-surface-container-low ${
                    paymentMethod === m.id
                      ? "border-primary bg-primary-fixed/20"
                      : "border-outline-variant bg-surface-container-lowest"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      paymentMethod === m.id ? "bg-surface-container-highest" : "bg-surface-container-low"
                    }`}>
                      <span className={`material-symbols-outlined ${paymentMethod === m.id ? "text-primary" : "text-on-surface-variant"}`}>account_balance</span>
                    </div>
                    <div>
                      <span className="block font-label-md text-label-md text-on-surface">{m.label}</span>
                      <span className="block font-label-sm text-label-sm text-on-surface-variant">Fee: {m.fee}</span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="topup-payment"
                    checked={paymentMethod === m.id}
                    onChange={() => setPaymentMethod(m.id)}
                    className="w-5 h-5 text-primary border-outline-variant focus:ring-primary"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-surface-variant bg-surface-container-lowest flex justify-end gap-2">
          <button onClick={onClose} className="px-6 py-2 rounded-lg font-label-md text-label-md text-primary bg-primary/10 hover:bg-primary/20 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleTopUp}
            disabled={loading}
            className="px-6 py-2 rounded-lg font-label-md text-label-md text-on-primary bg-primary hover:bg-surface-tint shadow-sm transition-all disabled:opacity-50"
          >
            {loading ? "Processing..." : "Top Up Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
