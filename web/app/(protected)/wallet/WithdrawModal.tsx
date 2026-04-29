"use client";

import { useState } from "react";

type Props = {
  availableBalance: number;
  onClose: () => void;
};

export function WithdrawModal({ availableBalance, onClose }: Props) {
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState("bca");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 50000) {
      alert("Minimum penarikan Rp 50.000");
      return;
    }
    if (numAmount > availableBalance) {
      alert("Saldo tidak cukup");
      return;
    }
    if (!accountNumber.trim() || !accountName.trim()) {
      alert("Lengkapi data rekening");
      return;
    }

    setLoading(true);
    try {
      // Mock withdrawal — in production this would call a real API
      const res = await fetch("/api/payments/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numAmount,
          bank,
          account_number: accountNumber,
          account_name: accountName,
        }),
      });
      if (res.ok) {
        alert("Permintaan penarikan berhasil dikirim! Proses 2-3 hari kerja.");
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Gagal memproses penarikan.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  }

  function setMax() {
    setAmount(String(availableBalance));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[8px]" onClick={onClose} />

      <div className="relative w-full max-w-[480px] bg-surface-container-lowest rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-outline-variant/50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
              <span className="material-symbols-outlined">account_balance</span>
            </div>
            <h3 className="font-h3 text-h3 text-on-surface">Withdraw Funds</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-6 bg-surface">
          {/* Balance Banner */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-lowest border border-outline-variant shadow-sm">
            <span className="font-body-md text-body-md text-on-surface-variant">Available Balance</span>
            <span className="font-h3 text-h3 text-primary">Rp {availableBalance.toLocaleString("id-ID")}</span>
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="withdraw-amount">Amount to Withdraw</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant">
                <span className="font-body-md">Rp</span>
              </div>
              <input
                id="withdraw-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-12 pr-4 py-3.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-lg text-body-lg text-on-surface focus:border-primary focus:ring-2 focus:ring-primary-container outline-none transition-all placeholder:text-outline"
              />
            </div>
            <div className="flex justify-between items-center px-1 mt-1">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Min. Rp 50.000</span>
              <button type="button" onClick={setMax} className="font-label-sm text-label-sm text-primary hover:underline">Withdraw Max</button>
            </div>
          </div>

          <div className="h-px w-full bg-outline-variant" />

          <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Destination Account</h4>

          {/* Bank Select */}
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="bank-name">Bank Name</label>
            <div className="relative">
              <select
                id="bank-name"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className="w-full px-4 py-3.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary-container outline-none appearance-none cursor-pointer"
              >
                <option value="bca">BCA</option>
                <option value="mandiri">Mandiri</option>
                <option value="bni">BNI</option>
                <option value="bri">BRI</option>
                <option value="other">Bank Lainnya</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-on-surface-variant">
                <span className="material-symbols-outlined">expand_more</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="account-number">Account Number</label>
              <input
                id="account-number"
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="e.g. 123456789"
                className="w-full px-4 py-3.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary-container outline-none transition-all placeholder:text-outline"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="account-name">Account Holder</label>
              <input
                id="account-name"
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-4 py-3.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary-container outline-none transition-all placeholder:text-outline"
              />
            </div>
          </div>

          {/* Security Note */}
          <div className="flex items-start gap-2 p-2 rounded-lg bg-surface-container-low text-on-surface-variant border border-surface-variant">
            <span className="material-symbols-outlined text-[16px] mt-0.5">lock</span>
            <p className="font-label-sm text-label-sm leading-relaxed">Transfer membutuhkan 2-3 hari kerja. Data keuangan Anda dienkripsi dan diproses secara aman.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-outline-variant bg-surface-container-lowest flex justify-end items-center gap-4">
          <button onClick={onClose} className="px-6 py-3 rounded-lg font-label-md text-label-md text-on-surface-variant border border-outline-variant hover:bg-surface-container-low transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 rounded-lg font-label-md text-label-md bg-primary text-on-primary hover:bg-on-primary-fixed-variant transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Request Withdrawal"}
            {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
