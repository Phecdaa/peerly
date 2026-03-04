import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/LogoutButton";

type Profile = {
  full_name: string | null;
  role: string;
  is_mentor: boolean;
  mentor_status: string;
};

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, is_mentor, mentor_status")
    .eq("id", user.id)
    .single<Profile>();

  const isAdmin = profile?.role === "admin";
  const isMentor = profile?.is_mentor;
  const isApprovedMentor = profile?.mentor_status === "approved";

  return (
    <div className="page">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">
            Hi, {profile?.full_name ?? user.email}
          </h1>
          <p className="text-sm text-zinc-500">
            {isAdmin
              ? "Admin dashboard"
              : isApprovedMentor
              ? "Mentor dashboard"
              : "Learner dashboard"}
          </p>
        </div>
        <LogoutButton />
      </header>

      <main className="grid gap-4 md:grid-cols-3">
        <section className="card col-span-2 space-y-3">
          <h2 className="card-title">Untuk mahasiswa (learner)</h2>
          <div className="space-y-2 text-sm text-zinc-600">
            <p>
              Cari mentor dan booking sesi belajar 1-on-1 atau kelompok kecil.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/mentors"
                className="btn btn-secondary h-9 rounded-full px-4 text-xs"
              >
                Cari mentor
              </Link>
              <Link
                href="/bookings"
                className="btn btn-secondary h-9 rounded-full px-4 text-xs"
              >
                Lihat booking saya
              </Link>
            </div>
          </div>
        </section>

        <section className="card space-y-3">
          <h2 className="card-title">Ingin jadi mentor?</h2>
          <p className="muted">
            Ajukan diri sebagai mentor, tunggu approval admin, lalu atur
            ketersediaan jam mengajar.
          </p>
          <Link
            href="/apply"
            className="btn btn-primary h-9 w-fit px-4 text-xs"
          >
            {isApprovedMentor
              ? "Kelola profil mentor"
              : isMentor
              ? "Lihat status pengajuan"
              : "Apply jadi mentor"}
          </Link>
        </section>

        {isApprovedMentor && (
          <section className="card col-span-2 space-y-3">
            <h2 className="card-title">Untuk mentor</h2>
            <p className="muted">
              Atur slot ketersediaan, terima booking, dan kelola sesi mengajar.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/mentor/availability"
                className="btn btn-secondary h-9 rounded-full px-4 text-xs"
              >
                Kelola availability
              </Link>
              <Link
                href="/bookings"
                className="btn btn-secondary h-9 rounded-full px-4 text-xs"
              >
                Lihat booking masuk
              </Link>
            </div>
          </section>
        )}

        {isAdmin && (
          <section className="card space-y-3 border-amber-200/80 bg-amber-50">
            <h2 className="text-sm font-semibold text-amber-950">Admin area</h2>
            <p className="text-sm text-amber-950/80">
              Kelola aplikasi mentor, booking, dan laporan.
            </p>
            <Link
              href="/admin"
              className="btn h-9 w-fit bg-amber-950 px-4 text-xs text-amber-50 hover:bg-amber-900"
            >
              Buka admin dashboard
            </Link>
          </section>
        )}
      </main>
    </div>
  );
}

