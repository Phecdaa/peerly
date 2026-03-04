import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AddAvailabilityForm } from "./AddAvailabilityForm";

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
    <div className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-4 py-10">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">
          Kelola availability
        </h1>
        <Link
          href="/dashboard"
          className="text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-700"
        >
          Dashboard
        </Link>
      </header>

      <AddAvailabilityForm />

      <section className="rounded-2xl border border-zinc-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900">
          Slot mendatang
        </h2>
        {!availabilities?.length ? (
          <p className="text-sm text-zinc-500">Belum ada slot.</p>
        ) : (
          <ul className="space-y-2 text-sm text-zinc-700">
            {availabilities.map((a) => (
              <li key={a.id}>
                {new Date(a.start_ts).toLocaleString("id-ID", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}{" "}
                –{" "}
                {new Date(a.end_ts).toLocaleTimeString("id-ID", {
                  timeStyle: "short",
                })}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
