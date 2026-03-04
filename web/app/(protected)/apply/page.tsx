import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ApplyMentorForm } from "./ApplyMentorForm";

export default async function ApplyPage() {
  const supabase = await getSupabaseServerClient();
  const { data: courses = [] } = await supabase
    .from("courses")
    .select("id, name, slug")
    .order("name");

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-4 py-10">
      <header className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-700"
        >
          Kembali ke dashboard
        </Link>
      </header>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h1 className="mb-2 text-xl font-semibold text-zinc-900">
          Apply jadi mentor
        </h1>
        <p className="mb-6 text-sm text-zinc-600">
          Isi bio dan mata kuliah yang bisa kamu ajarkan. Setelah diapprove admin,
          kamu bisa mengatur jadwal dan menerima booking.
        </p>
        <ApplyMentorForm courses={courses ?? []} />
      </div>
    </div>
  );
}
