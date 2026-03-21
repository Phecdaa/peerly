"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function HomeIcon({ className }: { className: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>;
}

function TicketIcon({ className }: { className: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>;
}

function UsersIcon({ className }: { className: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>;
}

function UserIcon({ className }: { className: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>;
}

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { label: "Beranda", href: "/dashboard", Icon: HomeIcon },
    { label: "Pesanan", href: "/rooms", Icon: TicketIcon },
    { label: "Room", href: "/mentors", Icon: UsersIcon }, 
    { label: "Akun", href: "/settings", Icon: UserIcon },
  ];

  return (
    <>
      {/* Desktop Top Navbar */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-white border-b border-zinc-200 z-50 items-center justify-between px-6 lg:px-20">
        <div className="flex items-center gap-8 h-full">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/logo.png" alt="Peerly" className="h-8" onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextElementSibling?.classList.remove("hidden") }} />
            <span className="hidden font-bold text-2xl tracking-tighter text-blue-800">Peerly</span>
          </Link>
          <div className="flex h-full">
            {navItems.map((item) => {
              const isActive = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center px-4 text-sm font-medium transition-colors border-b-[3px] ${
                    isActive ? "text-blue-600 border-blue-600" : "text-zinc-500 border-transparent hover:text-blue-600"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navbar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 z-50 pb-safe">
        <ul className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            return (
              <li key={item.label} className="w-full h-full">
                <Link
                  href={item.href}
                  className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                    isActive ? "text-blue-600" : "text-zinc-400 hover:text-blue-500"
                  }`}
                >
                  <item.Icon className="h-[22px] w-[22px]" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
