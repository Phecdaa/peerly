"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function AdminSidebar({ adminName }: { adminName?: string }) {
  const pathname = usePathname();

  const navItems = [
    { label: "Overview", href: "/admin", icon: "dashboard", exact: true },
    { label: "Verifications", href: "/admin/verifications", icon: "verified_user", exact: false },
    { label: "Reports", href: "/admin/reports", icon: "assessment", exact: false },
    { label: "Finances", href: "/admin/finances", icon: "payments", exact: false },
    { label: "Courses", href: "/admin/courses", icon: "auto_stories", exact: false },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full flex flex-col z-40 w-64 border-r bg-white dark:bg-slate-900 font-plus-jakarta-sans antialiased border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none justify-between">
      <div>
        <div className="px-6 py-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          <div>
            <div className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">Peerly Admin</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Academic Management</div>
          </div>
        </div>
        
        <nav className="mt-6 flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const isActive = item.exact 
              ? pathname === item.href 
              : pathname?.startsWith(item.href);
              
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 active:scale-[0.98] cursor-pointer ${
                  isActive 
                    ? "text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/20 border-r-4 border-blue-600 rounded-l-lg" 
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                }`}
              >
                <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  {item.icon}
                </span>
                <span className="font-label-md">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="px-3 pb-6 flex flex-col gap-1 border-t border-slate-200 dark:border-slate-800 pt-4">
        <Link href="/settings" className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 rounded-lg active:scale-[0.98] cursor-pointer">
          <span className="material-symbols-outlined">settings</span>
          <span className="font-label-md">Settings</span>
        </Link>
        <button onClick={async () => {
          const supabase = getSupabaseBrowserClient();
          await supabase.auth.signOut();
          window.location.href = '/';
        }} className="flex w-full items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 rounded-lg active:scale-[0.98] cursor-pointer text-left">
          <span className="material-symbols-outlined">logout</span>
          <span className="font-label-md">Logout</span>
        </button>
        
        <div className="mt-4 flex items-center gap-3 px-4 py-2">
          <img 
            alt="Admin User Avatar" 
            className="w-10 h-10 rounded-full border border-slate-200" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCI75m8IlBp9kwWfl9bsYabpHNSwzgY_Tf4CgTr7n3sInLsivwXbmCxux0ehVBdS74OapSIb6PNMvdmJG52JJ1av5AYP5g1ZYf6QuSpNTY07_WDpE9V2rsJ8m3QXd6VPWXTme_tOzP1WIEwRB6g4msBf5RNdChGOB6jmT0QN5ouJMYHlT_P6wEbjcrzWFvyyDpR-ujwtF25xK3kSmC-eb7WLiFilb-p1tLAxsb6tKyC8iq_hEtzV3OC0wMibaunlsvZQvWIACGnZy7C"
          />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900">{adminName || "Admin User"}</span>
            <span className="text-xs text-slate-500">System Manager</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function AdminHeader() {
  return (
    <header className="sticky top-0 right-0 z-30 flex items-center justify-between px-6 h-16 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-200 dark:border-slate-800 font-plus-jakarta-sans text-sm font-medium w-full">
      <div className="flex items-center gap-6 flex-1">
        <div className="hidden md:block text-xl font-extrabold text-slate-900 dark:text-white">Peerly Admin</div>
        <div className="relative hidden sm:flex items-center max-w-md w-full">
          <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[20px]">search</span>
          <input 
            className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-transparent rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-slate-900 dark:text-white placeholder-slate-500 w-full outline-none transition-all" 
            placeholder="Search users, sessions..." 
            type="text"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Link href="/dashboard" className="text-blue-600 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg px-3 py-2 transition-colors duration-200 font-semibold mr-2 hidden md:block">
          Exit Admin
        </Link>
        <button className="text-blue-600 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg p-2 transition-colors duration-200 relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </button>
        <button className="text-blue-600 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg p-2 transition-colors duration-200">
          <span className="material-symbols-outlined">help_outline</span>
        </button>
      </div>
    </header>
  );
}
