"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Slot = {
  id: number;
  start_ts: string;
  end_ts: string;
  max_students: number | null;
};

export function AvailabilityManager({ initialAvailabilities, timezone }: { initialAvailabilities: Slot[], timezone: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Weekly Schedule State
  const [schedule, setSchedule] = useState({
    Mon: { active: true, start: "09:00", end: "12:00" },
    Tue: { active: true, start: "10:00", end: "15:00" },
    Wed: { active: false, start: "09:00", end: "17:00" },
    Thu: { active: false, start: "09:00", end: "17:00" },
    Fri: { active: false, start: "09:00", end: "17:00" },
  });

  const toggleDay = (day: keyof typeof schedule) => {
    setSchedule({ ...schedule, [day]: { ...schedule[day], active: !schedule[day].active } });
  };

  const updateTime = (day: keyof typeof schedule, field: "start" | "end", value: string) => {
    setSchedule({ ...schedule, [day]: { ...schedule[day], [field]: value } });
  };

  // Generate explicit slots for the next 14 days based on weekly schedule
  async function handleSaveWeeklySchedule() {
    setLoading(true);
    const slotsToCreate = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayMap: Record<number, keyof typeof schedule> = {
      1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri"
    };

    for (let i = 1; i <= 14; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);
      const dayOfWeek = targetDate.getDay();
      
      const dayKey = dayMap[dayOfWeek];
      if (dayKey && schedule[dayKey].active) {
        const { start, end } = schedule[dayKey];
        
        const startDateTime = new Date(targetDate);
        const [startHr, startMin] = start.split(":");
        startDateTime.setHours(parseInt(startHr), parseInt(startMin), 0);
        
        const endDateTime = new Date(targetDate);
        const [endHr, endMin] = end.split(":");
        endDateTime.setHours(parseInt(endHr), parseInt(endMin), 0);

        // Only add if end > start
        if (endDateTime > startDateTime) {
          slotsToCreate.push({
            start_ts: startDateTime.toISOString(),
            end_ts: endDateTime.toISOString(),
            max_students: 5,
          });
        }
      }
    }

    if (slotsToCreate.length === 0) {
      alert("Please select at least one day with valid hours.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/mentor/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots: slotsToCreate }),
      });

      if (!res.ok) throw new Error("Failed to save schedule");
      
      alert("Weekly schedule generated and saved for the next 14 days!");
      router.refresh();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteSlot(id: number) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/mentor/availability?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete slot");
      router.refresh();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setDeletingId(null);
    }
  }

  // Format date for UI
  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };
  const formatTime = (isoStr: string) => {
    return new Date(isoStr).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Weekly Schedule */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/30 p-6">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-surface-container">
            <h2 className="font-h3 text-h3 text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">schedule</span>
              Weekly Schedule
            </h2>
            <div className="flex items-center gap-2 text-sm text-on-surface-variant bg-surface-container-low px-3 py-1.5 rounded-lg">
              <span className="material-symbols-outlined text-[18px]">public</span>
              <span>{timezone}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {(Object.entries(schedule) as [keyof typeof schedule, any][]).map(([day, data]) => (
              <div key={day} className={`flex flex-col sm:flex-row sm:items-start gap-4 p-4 rounded-lg border border-transparent transition-colors ${data.active ? 'bg-surface-container-low/50 hover:border-outline-variant/30' : 'hover:bg-surface-container-low/30'}`}>
                <div className="flex items-center gap-4 w-32 shrink-0 pt-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={data.active} onChange={() => toggleDay(day)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                  <span className={`font-label-md text-label-md w-12 ${data.active ? 'text-on-surface font-semibold' : 'text-on-surface-variant'}`}>{day}</span>
                </div>
                
                <div className="flex-1 space-y-3">
                  {data.active ? (
                    <div className="flex items-center gap-3 pt-1">
                      <input type="time" value={data.start} onChange={(e) => updateTime(day, "start", e.target.value)} className="border border-outline-variant rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface w-32" />
                      <span className="text-on-surface-variant">-</span>
                      <input type="time" value={data.end} onChange={(e) => updateTime(day, "end", e.target.value)} className="border border-outline-variant rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface w-32" />
                    </div>
                  ) : (
                    <div className="pt-2">
                      <span className="text-sm text-outline italic">Unavailable</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div className="pt-6 mt-4 border-t border-surface-container flex justify-end">
              <button onClick={handleSaveWeeklySchedule} disabled={loading} className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20 flex items-center gap-2 disabled:opacity-50">
                <span className="material-symbols-outlined text-[18px]">save</span>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
            <p className="text-xs text-outline text-right mt-2">Saving will generate slots for the next 14 days.</p>
          </div>
        </div>
      </div>

      {/* Right Column: Date Overrides & Sync */}
      <div className="space-y-6">
        
        {/* Calendar Sync Card */}
        <div className="bg-surface-container-highest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-primary/10 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
          <h3 className="font-h3 text-lg text-on-surface mb-2 relative z-10 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">sync</span>
            Calendar Sync
          </h3>
          <p className="font-body-md text-sm text-on-surface-variant mb-6 relative z-10">Connect your external calendar to automatically block busy times.</p>
          <div className="space-y-3 relative z-10">
            <button className="w-full flex items-center justify-between px-4 py-3 bg-surface-container-lowest rounded-lg border border-outline-variant/30 hover:border-primary/40 hover:shadow-sm transition-all group">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#EA4335]">event</span>
                <span className="font-label-md text-sm text-on-surface">Google Calendar</span>
              </div>
              <span className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">Connect</span>
            </button>
          </div>
        </div>

        {/* Available Slots / Overrides Card */}
        <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/30 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-h3 text-lg text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary">event_available</span>
              Active Slots
            </h3>
          </div>
          <p className="font-body-md text-sm text-on-surface-variant mb-4">Manage or delete your upcoming generated availability slots.</p>
          
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {initialAvailabilities.length === 0 ? (
              <p className="text-sm text-outline italic text-center py-4">No upcoming slots found.</p>
            ) : (
              initialAvailabilities.map((slot) => (
                <div key={slot.id} className="border border-outline-variant/30 rounded-lg p-3 flex justify-between items-center bg-surface-container-low/30">
                  <div>
                    <p className="font-label-md text-sm text-on-surface font-semibold">{formatDate(slot.start_ts)}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{formatTime(slot.start_ts)} - {formatTime(slot.end_ts)}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteSlot(slot.id)}
                    disabled={deletingId === slot.id}
                    className="text-outline hover:text-error transition-colors p-1.5 rounded-md hover:bg-error/5 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
