import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AddAvailabilityForm } from "./AddAvailabilityForm";
import { SlotList } from "./SlotList";

export default async function MentorAvailabilityPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("mentor_status")
    .eq("id", user.id)
    .single();

  if (profile?.mentor_status !== "approved") {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <p className="text-red-600">
          Hanya mentor yang sudah disetujui yang bisa mengatur availability.
        </p>
        <Link href="/dashboard" className="mt-2 inline-block text-sm text-zinc-600 underline">
          Kembali
        </Link>
      </div>
    );
  }

  const { data: availabilities } = await supabase
    .from("availabilities")
    .select("id, start_ts, end_ts, max_students")
    .eq("mentor_id", user.id)
    .gte("end_ts", new Date().toISOString())
    .order("start_ts", { ascending: true });

  return (
    <div className="bg-zinc-50 min-h-screen pb-24 md:px-6">
      <header className="bg-blue-600 px-6 pt-12 pb-10 text-white relative z-10 flex items-center justify-between w-full md:rounded-3xl md:mt-6 md:pb-16 md:px-10">
        <div className="flex items-center gap-3 md:hidden">
          <img src="/logo-putih.png" alt="Peerly Icon" className="w-10 h-10 object-contain" />
          <img src="/nama-putih.png" alt="Peerly" className="h-5 object-contain mb-[2px]" />
        </div>
        <div className="hidden md:block">
          <h1 className="text-2xl font-bold tracking-tight">Ketersediaan Waktu</h1>
          <p className="text-sm text-blue-100 opacity-90 mt-1">Atur jadwal luang untuk sesi mentoring.</p>
        </div>
        <div className="flex items-center gap-3 ml-auto md:hidden">
           <Link href="/notifications" className="relative p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
           </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-xl flex-col gap-6 px-4 -mt-6 relative z-20 md:-mt-8 md:max-w-3xl md:w-full">

      <AddAvailabilityForm />

      <section className="rounded-2xl border border-zinc-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900">
          Slot mendatang
        </h2>
        {!availabilities?.length ? (
          <p className="text-sm text-zinc-500">Belum ada slot.</p>
        ) : (
          <SlotList slots={availabilities} />
        )}
      </section>
    </div>
    </div>
  );
}
