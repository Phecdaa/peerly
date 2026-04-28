"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { RoomTime } from "./[id]/RoomTime";

type RoomSummary = {
  id: string;
  title: string;
  status: string;
  scheduled_start: string;
  scheduled_end: string;
  mode: string;
  mentor_id: string;
  host_id: string;
  room_participants: { user_id: string }[];
};

export function RoomsTabs({
  allRooms,
  profileMap,
  currentUserId,
}: {
  allRooms: RoomSummary[];
  profileMap: Record<string, any>;
  currentUserId: string;
}) {
  const [filter, setFilter] = useState<"all" | "active" | "scheduled" | "finished" | "cancelled">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRooms = useMemo(() => {
    return allRooms.filter((r) => {
      // Apply Search
      if (searchQuery && !r.title?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Apply Status Filter
      if (filter === "active" && r.status !== "ongoing") return false;
      if (filter === "scheduled" && !["scheduled", "waiting_payment", "pending_mentor_accept"].includes(r.status)) return false;
      if (filter === "finished" && r.status !== "finished") return false;
      if (filter === "cancelled" && r.status !== "cancelled") return false;
      
      return true;
    });
  }, [allRooms, filter, searchQuery]);

  function getTimeUntil(dateString: string) {
    const diff = new Date(dateString).getTime() - new Date().getTime();
    if (diff <= 0) return "Started";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 24) return `Starts in ${Math.floor(hours / 24)} days`;
    if (hours > 0) return `Starts in ${hours} hours`;
    const mins = Math.floor(diff / (1000 * 60));
    return `Starts in ${mins} mins`;
  }

  function getDuration(start: string, end: string) {
    const mins = Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 60000);
    const hrs = Math.floor(mins / 60);
    return hrs > 0 ? `${hrs}h ${mins % 60}m` : `${mins}m`;
  }

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-lg gap-4 -mt-12 md:-mt-16 relative z-10 w-full">
        {/* Invisible spacer to maintain layout balance with the header above */}
        <div className="hidden md:block"></div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-container-highest border-none rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:bg-surface transition-all" 
              placeholder="Search rooms..." 
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex overflow-x-auto pb-4 mb-lg gap-2 scrollbar-hide">
        {(["all", "active", "scheduled", "finished", "cancelled"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full font-label-md text-label-md transition-colors ${
              filter === f 
                ? "bg-primary text-on-primary shadow-sm border-transparent" 
                : "bg-surface-container-high text-on-surface-variant hover:bg-surface-variant border border-outline-variant"
            } capitalize`}
          >
            {f === "all" ? "All Rooms" : f}
          </button>
        ))}
      </div>

      {/* Room List Bento Grid */}
      {filteredRooms.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center bg-surface-container-lowest rounded-xl border border-outline-variant/30">
          <span className="material-symbols-outlined text-[48px] text-outline/50 mb-4">search_off</span>
          <h3 className="font-h3 text-h3 text-on-surface mb-2">No rooms found</h3>
          <p className="font-body-md text-on-surface-variant max-w-md">Try adjusting your search or filters to find what you're looking for.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-lg">
          {filteredRooms.map((r) => {
            const isMentor = currentUserId === r.mentor_id;
            const targetProfile = isMentor ? profileMap[r.host_id] : profileMap[r.mentor_id];
            
            // Collect participant avatars
            const participantIds = [r.host_id, r.mentor_id, ...(r.room_participants || []).map(p => p.user_id)];
            const uniqueParticipants = Array.from(new Set(participantIds));
            const displayParticipants = uniqueParticipants.slice(0, 3);
            const extraCount = uniqueParticipants.length - 3;

            return (
              <div key={r.id} className={`bg-surface-container-lowest rounded-[16px] border border-outline-variant/30 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0px_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 p-md flex flex-col group relative overflow-hidden ${
                r.status === 'cancelled' ? 'opacity-60 grayscale-[0.5]' : ''
              } ${r.status === 'ongoing' ? 'hover:border-primary/50 border-primary/20' : 'hover:border-tertiary-container/30'}`}>
                
                {r.status === 'ongoing' && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-secondary"></div>
                )}

                <div className="flex justify-between items-start mb-4">
                  {r.status === 'ongoing' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary text-on-secondary font-label-sm text-[10px] uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                      Live Now
                    </span>
                  ) : r.status === 'finished' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-variant text-on-surface-variant font-label-sm text-[10px] uppercase tracking-wider">
                      <span className="material-symbols-outlined text-[12px]">check_circle</span>
                      Finished
                    </span>
                  ) : r.status === 'cancelled' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-error/10 text-error font-label-sm text-[10px] uppercase tracking-wider">
                      <span className="material-symbols-outlined text-[12px]">cancel</span>
                      Cancelled
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary text-on-tertiary font-label-sm text-[10px] uppercase tracking-wider">
                      <span className="material-symbols-outlined text-[12px]">schedule</span>
                      Upcoming
                    </span>
                  )}
                  
                  <Link href={`/rooms/${r.id}`} className="text-outline hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                  </Link>
                </div>

                <h3 className="font-h3 text-[18px] text-on-surface mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {r.title || "Study Session"}
                </h3>
                <p className="font-body-md text-sm text-on-surface-variant mb-4 line-clamp-1 capitalize">
                  {r.mode} Mode
                </p>

                <div className="flex items-center gap-3 mb-4 p-3 bg-surface-container rounded-lg">
                  {targetProfile?.avatar_url ? (
                    <img src={targetProfile.avatar_url} alt="Profile" className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold">
                      {(targetProfile?.full_name || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-label-md text-sm text-on-surface">{targetProfile?.full_name || "Unknown User"}</p>
                    <p className="font-body-md text-xs text-on-surface-variant truncate w-40">
                      {isMentor ? "Host" : "Mentor"} • {targetProfile?.major || "University Student"}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-end mt-auto pt-4 border-t border-surface-variant">
                  {['finished', 'cancelled'].includes(r.status) ? (
                    <div className="flex flex-col gap-1">
                      <span className="font-label-sm text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">history</span> 
                        {new Date(r.scheduled_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="font-body-md text-xs text-on-surface-variant">
                        Duration: {getDuration(r.scheduled_start, r.scheduled_end)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <span className="font-label-sm text-on-surface flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-outline">calendar_today</span> 
                        <RoomTime startTs={r.scheduled_start} shortDate />
                      </span>
                      <span className="font-body-md text-xs text-on-surface-variant">
                        {getTimeUntil(r.scheduled_start)}
                      </span>
                    </div>
                  )}

                  {r.status === 'ongoing' ? (
                    <Link href={`/rooms/${r.id}`} className="bg-primary text-on-primary px-4 py-1.5 rounded-lg font-label-md text-sm hover:bg-primary-container transition-colors">
                      Join Call
                    </Link>
                  ) : r.status === 'finished' && !isMentor ? (
                    <Link href={`/rooms/${r.id}`} className="text-primary font-label-md text-sm hover:underline flex items-center gap-1">
                      Review <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  ) : (
                    <Link href={`/rooms/${r.id}`} className="border border-outline-variant text-on-surface px-4 py-1.5 rounded-lg font-label-md text-sm hover:bg-surface-variant transition-colors">
                      Details
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
