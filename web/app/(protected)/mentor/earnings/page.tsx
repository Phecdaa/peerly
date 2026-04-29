"use client";

import Link from "next/link";

export default function MentorEarningsPage() {
  return (
    <div className="flex-1 w-full flex flex-col pt-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-xl gap-4">
        <div>
          <h1 className="font-h1 text-h1 text-on-surface mb-xs">Mentor Earnings</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Here's an overview of your mentoring activities and earnings.</p>
        </div>
        
        {/* Availability Toggle (Dummy) */}
        <div className="flex items-center bg-surface-container-lowest p-1 rounded-full border border-outline-variant shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <button className="px-4 py-2 rounded-full font-label-md text-label-md bg-secondary-container text-on-secondary-container flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim"></span>
            Online
          </button>
          <button className="px-4 py-2 rounded-full font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low transition-colors">
            Offline
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
        {/* Earnings Chart (Span 8) */}
        <div className="col-span-1 md:col-span-8 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-lg flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-md">
            <div>
              <h3 className="font-h3 text-h3 text-on-surface">Earnings Summary</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Last 30 Days</p>
            </div>
            <div className="text-right">
              <span className="font-h2 text-h2 text-primary font-bold">Rp 0</span>
              <p className="font-label-sm text-label-sm text-secondary flex items-center justify-end gap-1">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                +0%
              </p>
            </div>
          </div>
          
          {/* Decorative Chart Area */}
          <div className="flex-1 relative w-full mt-4 flex items-end border-b border-l border-outline-variant/30 pb-4 pl-4">
            {/* Y Axis */}
            <div className="absolute left-0 top-0 bottom-4 w-4 flex flex-col justify-between items-end pr-2 text-xs text-outline font-label-sm">
              <span>Rp 2M</span>
              <span>Rp 1M</span>
              <span>Rp 0</span>
            </div>
            {/* Chart Line (CSS generated for structural purpose) */}
            <div className="w-full h-full relative overflow-hidden flex items-end space-x-2 ml-4">
              <div className="flex-1 bg-primary-fixed rounded-t-sm h-[30%] hover:bg-primary transition-colors relative group"></div>
              <div className="flex-1 bg-primary-fixed rounded-t-sm h-[45%] hover:bg-primary transition-colors relative group"></div>
              <div className="flex-1 bg-primary-fixed rounded-t-sm h-[25%] hover:bg-primary transition-colors relative group"></div>
              <div className="flex-1 bg-primary-fixed rounded-t-sm h-[60%] hover:bg-primary transition-colors relative group"></div>
              <div className="flex-1 bg-primary-fixed rounded-t-sm h-[80%] hover:bg-primary transition-colors relative group"></div>
              <div className="flex-1 bg-primary rounded-t-sm h-[75%] relative shadow-[0_0_15px_rgba(0,88,190,0.4)]">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface font-label-sm text-[10px] px-2 py-1 rounded">Today</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions (Span 4) */}
        <div className="col-span-1 md:col-span-4 flex flex-col gap-lg">
          {/* Session Notes Card */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-lg flex-1 relative overflow-hidden group hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all flex flex-col justify-center">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary-fixed rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10">
              <span className="material-symbols-outlined text-[32px] text-tertiary mb-4">edit_document</span>
              <h3 className="font-h3 text-h3 text-on-surface mb-2">Session Notes</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">Review and submit notes for past mentoring sessions.</p>
              <button className="font-label-md text-label-md text-tertiary hover:text-on-tertiary-fixed-variant flex items-center gap-1 group/btn">
                Manage Notes
                <span className="material-symbols-outlined text-[18px] group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
          </div>
          
          {/* Stats Card */}
          <div className="bg-surface-container-low rounded-xl border border-outline-variant p-lg flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">star_rate</span>
              </div>
              <div>
                <h4 className="font-label-md text-label-md text-on-surface-variant">Average Rating</h4>
                <span className="font-h2 text-h2 text-on-surface font-bold">New</span>
              </div>
            </div>
            <div className="w-full bg-surface-variant h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full w-[0%] rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Upcoming Sessions (Span 12) */}
        <div className="col-span-1 md:col-span-12">
          <div className="flex justify-between items-center mb-md mt-4">
            <h3 className="font-h3 text-h3 text-on-surface">Upcoming Sessions</h3>
            <Link href="/rooms" className="font-label-md text-label-md text-primary hover:text-on-primary-fixed-variant">View All</Link>
          </div>
          
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-outline opacity-50 mb-2">event_busy</span>
            <h4 className="font-h3 text-h3 text-on-surface mb-1">No upcoming sessions</h4>
            <p className="text-on-surface-variant font-body-md">You don't have any mentoring sessions scheduled yet.</p>
          </div>
          
          {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-md hover:border-primary/20 hover:shadow-[0_8px_30px_rgba(0,88,190,0.1)] transition-all flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-secondary text-on-secondary font-label-sm text-label-sm px-2 py-1 rounded-md flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-on-secondary animate-pulse"></span>
                  Live Now
                </span>
                <span className="material-symbols-outlined text-outline">more_horiz</span>
              </div>
              <h4 className="font-h3 text-[18px] text-on-surface font-semibold mb-1">Advanced Calculus Review</h4>
              <p className="font-body-md text-sm text-on-surface-variant mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                10:00 AM - 11:30 AM
              </p>
              <div className="mt-auto pt-4 border-t border-surface-variant flex justify-between items-center">
                <button className="bg-primary text-on-primary font-label-md px-4 py-1.5 rounded-lg hover:bg-on-primary-fixed-variant transition-colors">Join</button>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
