"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Props = {
  roomId: number;
  title: string;
  mentorName: string;
  mentorAvatar: string;
  participantCount: number;
  baseRate: number;
  amountPerPerson: number;
  platformFee: number;
  totalAmount: number;
};

export function CheckoutClient({
  roomId,
  title,
  mentorName,
  mentorAvatar,
  participantCount,
  baseRate,
  amountPerPerson,
  platformFee,
  totalAmount,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("gopay");

  async function handlePay() {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id: roomId, payment_method: selectedMethod }),
      });
      
      if (res.ok) {
        // Redirect back to room after successful payment
        router.push(`/rooms/${roomId}`);
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Payment failed");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert("Payment failed");
      setLoading(false);
    }
  }

  const eWallets = [
    { id: "gopay", label: "GoPay" },
    { id: "ovo", label: "OVO" },
    { id: "shopeepay", label: "ShopeePay" },
  ];

  const virtualAccounts = [
    { id: "bca", label: "BCA" },
    { id: "mandiri", label: "Mandiri" },
    { id: "bni", label: "BNI" },
    { id: "bri", label: "BRI" },
  ];

  return (
    <div className="flex-grow w-full max-w-[1280px] mx-auto px-6 py-10">
      <h1 className="font-h1 text-h1 mb-6 text-on-surface">Secure Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Order Summary */}
        <div className="md:col-span-5 flex flex-col gap-6">
          <section className="bg-surface-container-low rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 flex flex-col gap-4">
            <h2 className="font-h3 text-h3 text-on-surface">Order Summary</h2>
            <div className="flex items-start gap-4 pb-4 border-b border-outline-variant/30">
              <div className="w-16 h-16 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xl shrink-0">
                {title.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-body-lg text-body-lg font-semibold text-on-surface line-clamp-2">
                  {title}
                </span>
                <div className="flex items-center gap-2">
                  <img
                    alt={mentorName}
                    className="w-6 h-6 rounded-full object-cover"
                    src={mentorAvatar}
                  />
                  <span className="font-label-md text-label-md text-on-surface-variant">
                    Mentor: {mentorName}
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-tertiary bg-tertiary-fixed px-2 py-1 rounded w-max mt-1">
                  Split Session ({participantCount} Participants)
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center font-body-md text-body-md text-on-surface-variant">
                <span>Base Rate (Total)</span>
                <span>Rp {baseRate.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center font-body-md text-body-md text-on-surface-variant">
                <span>Your Split (1/{participantCount})</span>
                <span>Rp {amountPerPerson.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center font-body-md text-body-md text-on-surface-variant">
                <span>Platform Fee</span>
                <span>Rp {platformFee.toLocaleString('id-ID')}</span>
              </div>
            </div>
            <div className="pt-4 border-t border-outline-variant/30 flex justify-between items-center font-h3 text-h3 text-on-surface">
              <span>Total</span>
              <span className="text-primary">Rp {totalAmount.toLocaleString('id-ID')}</span>
            </div>
          </section>
        </div>

        {/* Right Column: Payment Methods & Actions */}
        <div className="md:col-span-7 flex flex-col gap-6">
          <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 flex flex-col gap-4">
            <h2 className="font-h3 text-h3 text-on-surface">Payment Method</h2>
            
            <div className="flex flex-col gap-4">
              <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">E-Wallets</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {eWallets.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all ${
                      selectedMethod === method.id
                        ? "border-2 border-primary bg-primary-fixed/20 shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
                        : "border border-outline-variant bg-surface hover:border-primary/50 hover:bg-surface-container"
                    }`}
                  >
                    <span className={`material-symbols-outlined mb-1 ${selectedMethod === method.id ? "text-primary" : "text-outline"}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                      account_balance_wallet
                    </span>
                    <span className={`font-label-md text-label-md ${selectedMethod === method.id ? "text-on-surface font-semibold" : "text-on-surface-variant"}`}>
                      {method.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-2">
              <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Virtual Accounts</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {virtualAccounts.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all ${
                      selectedMethod === method.id
                        ? "border-2 border-primary bg-primary-fixed/20 shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
                        : "border border-outline-variant bg-surface hover:border-primary/50 hover:bg-surface-container"
                    }`}
                  >
                    <span className={`font-label-md text-label-md ${selectedMethod === method.id ? "text-on-surface font-semibold" : "text-on-surface-variant"}`}>
                      {method.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <div className="flex flex-col items-end gap-4 mt-auto">
            <div className="flex items-center gap-1 text-on-surface-variant bg-surface-container px-4 py-2 rounded-full">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
              <span className="font-label-sm text-label-sm">Secure Payment with Escrow</span>
            </div>
            <button 
              onClick={handlePay}
              disabled={loading}
              className="w-full md:w-auto bg-primary text-on-primary font-body-lg text-body-lg font-semibold py-4 px-8 rounded-xl shadow-[0_4px_20px_rgba(0,88,190,0.3)] hover:bg-primary-container hover:shadow-[0_8px_30px_rgba(0,88,190,0.4)] active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:active:scale-100 disabled:hover:shadow-none"
            >
              <span>{loading ? "Processing..." : "Pay Now"}</span>
              {!loading && (
                <span className="font-bold border-l border-on-primary/30 pl-2 ml-2">
                  Rp {totalAmount.toLocaleString('id-ID')}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
