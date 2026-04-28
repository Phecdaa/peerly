"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function Navigation({ role, isMentor, mentorStatus }: { role?: string, isMentor?: boolean, mentorStatus?: string }) {
  const pathname = usePathname();

  // Dynamic Navigation Tabs based on Role
  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { label: "Mentors", href: "/mentors", icon: "school" },
    { label: "My Rooms", href: "/rooms", icon: "groups" },
  ];

  if (role === "admin") {
    navItems.push({ label: "Admin", href: "/admin", icon: "admin_panel_settings" });
  } 
  
  if (isMentor && mentorStatus === "approved") {
    navItems.push({ label: "Jadwal", href: "/mentor/availability", icon: "calendar_month" });
  }

  navItems.push({ label: "Settings", href: "/settings", icon: "settings" });

  useEffect(() => {
    // Phase 12: Silent Cron trigger to enforce room timeouts (auto-cancel, auto-finish)
    fetch("/api/cron/rooms").catch(() => {});
  }, []);

  return (
    <>
      {/* TopNavBar (Web) */}
      <nav className="hidden md:flex fixed top-0 left-0 w-full justify-between items-center px-6 py-3 h-16 bg-white/90 backdrop-blur-md font-['Plus_Jakarta_Sans'] text-sm font-medium tracking-tight border-b border-slate-200 shadow-sm z-50">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-2xl font-black text-primary">Peerly</Link>
          <div className="flex gap-4">
            {navItems.slice(0, 4).map(item => {
               const isActive = pathname?.startsWith(item.href);
               return (
                  <Link key={item.label} href={item.href} className={isActive ? "text-primary border-b-2 border-primary pb-1" : "text-on-surface-variant hover:text-primary transition-colors duration-200"}>
                    {item.label}
                  </Link>
               );
            })}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/mentors" className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create Room
          </Link>
          <div className="flex gap-3">
            <Link href="/notifications" className="text-on-surface-variant hover:text-primary transition-colors duration-200">
              <span className="material-symbols-outlined">notifications</span>
            </Link>
          </div>
          <Link href="/settings">
            <img alt="Student avatar" className="w-8 h-8 rounded-full border border-outline-variant object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjQuInrVJPDywbKdxtjWf7_g2AN4Ral_ulz7ixjtxf6h-xYi85qTkfqriMSUKZle0nipeLeKDRduzD8mWki595Nw65pU_yPzDUGuUMwyAgPeybDH24MchH0BqOgAtx3PZeYAfXXOlhMdudnIRmdkXy4eqYPGGTJS92W6bxLrxj6wI29fT91S1Z_68tqVxFx66oG5XL744vrhDAt9c_Q-BRonViy0UR7T0XixV1ppVNUkltu5BLRF7FKVHxHkRDTdiWR9wqg6udgW3k"/>
          </Link>
        </div>
      </nav>

      {/* SideNavBar (Desktop) */}
      <aside className="fixed left-0 top-16 bottom-0 w-64 py-8 px-4 flex-col gap-2 bg-white border-r border-slate-200 hidden lg:flex font-['Plus_Jakarta_Sans'] text-base z-40">
        <nav className="flex-1 flex flex-col gap-2">
          <div className="px-4 mb-6">
            <span className="text-xl font-bold text-blue-600">Peerly</span>
            <p className="text-xs text-slate-500">University Hub</p>
          </div>
          
          {navItems.map(item => {
            const isActive = pathname?.startsWith(item.href);
            return (
              <Link key={item.label} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-transform duration-200 hover:translate-x-1 ${isActive ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600 rounded-r-none font-bold' : 'text-slate-500 hover:bg-slate-100'}`}>
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="mt-auto pt-4 border-t border-slate-200">
          <Link href="/mentors" className="w-full flex items-center justify-center gap-2 bg-primary-container text-on-primary-container px-4 py-3 rounded-xl font-label-md hover:bg-primary hover:text-on-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            Start a Session
          </Link>
        </div>
      </aside>

      {/* BottomNavBar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-3 pb-safe bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-2xl z-50 font-['Plus_Jakarta_Sans'] text-[10px] font-semibold">
        {navItems.slice(0, 4).map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link key={item.label} href={item.href} className={`flex flex-col items-center justify-center rounded-xl px-4 py-1.5 transition-transform duration-150 ${isActive ? 'bg-blue-50 text-blue-600 scale-90' : 'text-slate-400 hover:text-slate-600'}`}>
              <span className="material-symbols-outlined" style={isActive ? {fontVariationSettings: "'FILL' 1"} : {}}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
