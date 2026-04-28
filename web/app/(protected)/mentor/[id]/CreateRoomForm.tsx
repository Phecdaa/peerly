"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Course = { id: number; name: string; slug: string };
type Slot = {
  id: number;
  start_ts: string;
  end_ts: string;
  max_students: number;
  is_booked: boolean;
  has_room: boolean;
};

export function CreateRoomForm({
  mentorId,
  mentorName,
  mentorHourlyRate,
  courses,
  slots,
}: {
  mentorId: string;
  mentorName: string;
  mentorHourlyRate: number;
  courses: Course[];
  slots: Slot[];
}) {
  const router = useRouter();
  const [courseId, setCourseId] = useState<number>(courses[0]?.id ?? 0);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState<"online" | "offline" | "hybrid">("online");
  const [paymentMode, setPaymentMode] = useState<"split_equal" | "host_pays_all">("split_equal");
  const [intendedCount, setIntendedCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableSlots = slots.filter((s) => !s.is_booked && !s.has_room);

  const maxForSlot = slot ? slot.max_students : (availableSlots.length > 0 ? Math.max(...availableSlots.map(s => s.max_students)) : 1);
  const effectiveIntended = Math.min(Math.max(1, intendedCount), maxForSlot);

  function formatSlot(s: Slot) {
    const start = new Date(s.start_ts);
    const end = new Date(s.end_ts);
    return (
      start.toLocaleString("en-US", { weekday: 'short', month: 'short', day: 'numeric' }) + " • " +
      start.toLocaleTimeString("en-US", { timeStyle: "short" }) + " - " + end.toLocaleTimeString("en-US", { timeStyle: "short" })
    );
  }

  const durationMinutes = slot
    ? Math.round((new Date(slot.end_ts).getTime() - new Date(slot.start_ts).getTime()) / 60000)
    : 0;
  const totalPrice = (durationMinutes / 60) * mentorHourlyRate;
  const platformFee = totalPrice * 0.05;
  const finalTotal = totalPrice + platformFee;
  const perPerson = paymentMode === "host_pays_all" ? finalTotal : (effectiveIntended > 0 ? finalTotal / effectiveIntended : finalTotal);

  async function handleSubmit() {
    if (!slot) {
      setError("Please select a time slot first.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          availability_id: slot.id,
          course_id: courseId,
          title: title.trim() || null,
          description: description.trim() || null,
          mode,
          payment_mode: paymentMode,
          is_public: false,
          intended_participant_count: effectiveIntended,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Failed to create room.");
        return;
      }

      const roomId = data.id;
      if (roomId == null) {
        setError("Room created but ID not returned.");
        return;
      }
      router.refresh();
      setTimeout(() => {
        router.push(`/rooms/${roomId}`);
      }, 500);
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (courses.length === 0) {
    return <p className="text-sm text-on-surface-variant p-4">This mentor has not set up any courses yet.</p>;
  }

  return (
    <div className="flex flex-col xl:flex-row gap-lg items-start">
      {/* Left Column: The Form Sections */}
      <div className="flex-1 w-full flex flex-col gap-lg">
        {/* Step 1: Course & Time */}
        <section className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-lg border border-outline-variant/30 flex flex-col gap-md relative overflow-hidden">
          <div className="flex items-center gap-sm pb-sm border-b border-surface-container-high">
            <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md border-4 border-surface-container-lowest">1</div>
            <h2 className="font-h3 text-h3 text-on-surface">Select Topic & Time</h2>
          </div>
          
          {/* Topic Dropdown */}
          <div className="flex flex-col gap-xs pt-sm">
            <label className="font-label-md text-label-md text-on-surface-variant">Course / Topic</label>
            <div className="relative">
              <select 
                value={courseId} 
                onChange={(e) => setCourseId(parseInt(e.target.value, 10))}
                className="w-full appearance-none bg-surface border border-outline-variant rounded-lg px-md py-sm text-on-surface font-body-md text-body-md focus:border-primary focus:ring-2 focus:ring-primary-container/50 outline-none transition-all cursor-pointer"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
            </div>
          </div>

          {/* Time Selection */}
          <div className="flex flex-col gap-xs pt-sm">
            <label className="font-label-md text-label-md text-on-surface-variant flex justify-between items-center">
              Available Time Slots
            </label>
            {availableSlots.length === 0 ? (
              <p className="text-on-surface-variant text-sm py-4 bg-surface rounded-lg text-center border border-outline-variant/20">No available slots for this mentor.</p>
            ) : (
              <div className="flex flex-col gap-sm">
                {availableSlots.map(s => (
                  <button 
                    key={s.id}
                    onClick={() => setSlot(s)}
                    className={`w-full text-left px-md py-3 rounded-lg border flex justify-between items-center transition-all ${
                      slot?.id === s.id 
                        ? 'border-2 border-primary bg-primary-container/10 text-on-surface shadow-sm' 
                        : 'border-outline-variant hover:border-primary/50 text-on-surface-variant hover:bg-surface'
                    }`}
                  >
                    <span className="font-label-md text-label-md">{formatSlot(s)}</span>
                    <span className="font-label-sm text-label-sm bg-surface-container px-2 py-1 rounded-md text-outline">Max {s.max_students} students</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Step 2: Participants & Mode */}
        <section className={`bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-lg border border-outline-variant/30 flex flex-col gap-md transition-opacity duration-300 ${!slot ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center gap-sm pb-sm border-b border-surface-container-high">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-label-md text-label-md border-4 border-surface-container-lowest ${slot ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>2</div>
            <h2 className="font-h3 text-h3 text-on-surface">Participants & Mode</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg pt-sm">
            {/* Participants Input */}
            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-label-md text-on-surface-variant">Number of Participants</label>
              <div className="flex items-center gap-sm">
                <input 
                  type="number" 
                  min="1" 
                  max={maxForSlot} 
                  value={intendedCount}
                  onChange={(e) => setIntendedCount(parseInt(e.target.value, 10))}
                  className="w-24 bg-surface border border-outline-variant rounded-lg px-md py-sm text-center text-on-surface font-body-md text-body-md focus:border-primary outline-none" 
                />
                <span className="font-label-sm text-label-sm text-outline">Max {maxForSlot} for this slot</span>
              </div>
            </div>

            {/* Mode Selection */}
            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-label-md text-on-surface-variant">Session Mode</label>
              <div className="flex gap-sm">
                {(["online", "offline", "hybrid"] as const).map(m => (
                  <label key={m} className={`flex-1 flex flex-col items-center justify-center p-sm rounded-lg border-2 cursor-pointer transition-all ${
                    mode === m ? 'border-primary bg-primary-container/5' : 'border-outline-variant/50 hover:bg-surface text-on-surface-variant'
                  }`}>
                    <input type="radio" name="mode" className="sr-only" checked={mode === m} onChange={() => setMode(m)} />
                    <span className={`material-symbols-outlined mb-xs ${mode === m ? 'text-primary' : ''}`}>{
                      m === 'online' ? 'videocam' : m === 'offline' ? 'apartment' : 'devices'
                    }</span>
                    <span className="font-label-sm text-label-sm capitalize">{m}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Mode */}
          {effectiveIntended > 1 && (
            <div className="flex flex-col gap-xs pt-sm border-t border-surface-container-high mt-sm">
              <label className="font-label-md text-label-md text-on-surface-variant">Payment Split</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                <label className={`flex items-start gap-sm p-md rounded-lg border-2 cursor-pointer transition-all ${
                  paymentMode === 'host_pays_all' ? 'border-primary bg-primary-container/5' : 'border-outline-variant/50 hover:bg-surface'
                }`}>
                  <input type="radio" name="payment" className="mt-1 text-primary focus:ring-primary accent-primary" checked={paymentMode === 'host_pays_all'} onChange={() => setPaymentMode('host_pays_all')} />
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface">Host Pays All</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">You cover the total cost of the room.</span>
                  </div>
                </label>
                
                <label className={`flex items-start gap-sm p-md rounded-lg border-2 cursor-pointer transition-all ${
                  paymentMode === 'split_equal' ? 'border-primary bg-primary-container/5' : 'border-outline-variant/50 hover:bg-surface'
                }`}>
                  <input type="radio" name="payment" className="mt-1 text-primary focus:ring-primary accent-primary" checked={paymentMode === 'split_equal'} onChange={() => setPaymentMode('split_equal')} />
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface">Split Equal</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Cost is divided equally among participants.</span>
                  </div>
                </label>
              </div>
            </div>
          )}
        </section>

        {/* Step 3: Room Details */}
        <section className={`bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-lg border border-outline-variant/30 flex flex-col gap-md transition-opacity duration-300 ${!slot ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center gap-sm pb-sm border-b border-surface-container-high">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-label-md text-label-md border-4 border-surface-container-lowest ${slot ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>3</div>
            <h2 className="font-h3 text-h3 text-on-surface">Room Details</h2>
          </div>
          
          <div className="flex flex-col gap-xs pt-sm">
            <label className="font-label-md text-label-md text-on-surface-variant">Room Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-surface border border-outline-variant rounded-lg px-md py-sm text-on-surface font-body-md text-body-md focus:border-primary focus:ring-2 focus:ring-primary-container/50 outline-none transition-all" 
              placeholder={`e.g., Study Session for ${courses.find(c => c.id === courseId)?.name ?? "Subject"}`}
            />
          </div>
          <div className="flex flex-col gap-xs pt-sm">
            <label className="font-label-md text-label-md text-on-surface-variant">Description (What will be studied?)</label>
            <textarea 
              rows={3} 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface border border-outline-variant rounded-lg px-md py-sm text-on-surface font-body-md text-body-md focus:border-primary focus:ring-2 focus:ring-primary-container/50 outline-none transition-all resize-none" 
              placeholder="List specific topics, questions, or areas of focus so the mentor can prepare..."
            ></textarea>
          </div>
        </section>
      </div>

      {/* Right Column: Sticky Cost Summary */}
      <div className="w-full xl:w-[380px] flex-shrink-0 xl:sticky xl:top-24">
        <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-surface-container px-lg py-md border-b border-surface-container-high">
            <h3 className="font-h3 text-h3 text-on-surface flex items-center gap-sm">
              <span className="material-symbols-outlined">receipt_long</span>
              Cost Summary
            </h3>
          </div>
          
          {/* Details List */}
          <div className="p-lg flex flex-col gap-md font-body-md text-body-md border-b border-surface-container-high">
            {slot ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Duration</span>
                  <span className="text-on-surface font-medium">{durationMinutes} Minutes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Mentor Rate</span>
                  <span className="text-on-surface font-medium">Rp {mentorHourlyRate.toLocaleString()} / hr</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Platform Fee (5%)</span>
                  <span className="text-on-surface font-medium">Rp {platformFee.toLocaleString()}</span>
                </div>
                
                {/* Divider */}
                <div className="h-px w-full bg-surface-container-high my-sm border-t border-dashed border-outline-variant/50"></div>
                
                <div className="flex justify-between items-center">
                  <span className="text-on-surface font-semibold">Total Cost</span>
                  <span className="text-on-surface font-semibold text-primary">Rp {finalTotal.toLocaleString()}</span>
                </div>
                
                {/* Split Info Highlight */}
                <div className="mt-sm bg-primary-container/10 border border-primary-container/20 rounded-lg p-md flex items-start gap-sm">
                  <span className="material-symbols-outlined text-primary mt-1 text-[20px]">{paymentMode === 'split_equal' && effectiveIntended > 1 ? 'pie_chart' : 'person'}</span>
                  <div className="flex flex-col">
                    {paymentMode === 'split_equal' && effectiveIntended > 1 ? (
                      <>
                        <span className="font-label-md text-label-md text-primary">Split Equal Mode Active</span>
                        <span className="font-body-sm text-[13px] text-on-surface mt-1">You will pay <strong className="font-semibold text-primary">Rp {Math.round(perPerson).toLocaleString()}</strong> now. Participants pay their share to enter.</span>
                      </>
                    ) : (
                      <>
                        <span className="font-label-md text-label-md text-primary">Host Pays All Active</span>
                        <span className="font-body-sm text-[13px] text-on-surface mt-1">You cover the entire room cost of <strong className="font-semibold text-primary">Rp {Math.round(perPerson).toLocaleString()}</strong>.</span>
                      </>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="py-6 text-center text-on-surface-variant font-body-md text-sm">
                Select a time slot to see cost calculation.
              </div>
            )}
          </div>
          
          {/* Action Area */}
          <div className="p-lg bg-surface-container-lowest flex flex-col gap-sm">
            {error && <p className="text-error text-sm font-medium bg-error-container/30 px-3 py-2 rounded-md border border-error/20 mb-2">{error}</p>}
            
            <button 
              onClick={handleSubmit}
              disabled={loading || !slot}
              className={`w-full py-md px-lg rounded-lg font-label-md text-label-md flex justify-center items-center gap-sm shadow-sm transition-all ${
                loading || !slot ? 'bg-surface-container-high text-outline cursor-not-allowed' : 'bg-primary text-on-primary hover:opacity-90'
              }`}
            >
              {loading ? "Creating..." : "Buat Room"}
              {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
            </button>
            <p className="text-center font-label-sm text-label-sm text-outline mt-sm">By continuing, you agree to Peerly's Terms & Conditions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
