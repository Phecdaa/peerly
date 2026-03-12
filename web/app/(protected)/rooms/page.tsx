import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function RoomsPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: asHost } = await supabase
    .from("rooms")
    .select("id, title, status, scheduled_start, scheduled_end")
    .eq("host_id", user.id)
    .order("scheduled_start", { ascending: false })
    .limit(20);

  const { data: asParticipant } = await supabase
    .from("room_participants")
    .select("room_id")
    .eq("user_id", user.id);
  const partRoomIds = [...new Set((asParticipant ?? []).map((p) => p.room_id))];
  const { data: asParticipantRooms } =
    partRoomIds.length > 0
      ? await supabase
          .from("rooms")
          .select("id, title, status, scheduled_start, scheduled_end")
          .in("id", partRoomIds)
          .neq("host_id", user.id)
          .order("scheduled_start", { ascending: false })
          .limit(20)
      : { data: [] };

  const { data: asMentor } = await supabase
    .from("rooms")
    .select("id, title, status, scheduled_start, scheduled_end")
    .eq("mentor_id", user.id)
    .order("scheduled_start", { ascending: false })
    .limit(20);

  const formatDate = (ts: string) =>
    new Date(ts).toLocaleString("id-ID", {
      dateStyle: "short",
      timeStyle: "short",
    });

  const statusLabel: Record<string, string> = {
    pending_mentor_accept: "Menunggu mentor menerima",
    waiting_payment: "Menunggu pembayaran",
    scheduled: "Terjadwal",
    ongoing: "Berlangsung",
    finished: "Selesai",
    cancelled: "Dibatalkan",
  };

  return (
    <div className="page">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-zinc-900">Room saya</h1>
        <Link
          href="/dashboard"
          className="text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-700"
        >
          Dashboard
        </Link>
      </header>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-700">
          Room yang saya buat (host)
        </h2>
        {!asHost?.length ? (
          <p className="muted">Belum ada.</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {(asHost ?? []).map((r) => (
              <li key={r.id}>
                <Link
                  href={`/rooms/${r.id}`}
                  className="card block transition hover:border-zinc-300"
                >
                  <p className="font-medium text-zinc-900">
                    {r.title || "Sesi belajar"}
                  </p>
                  <p className="text-xs text-zinc-500">{formatDate(r.scheduled_start)}</p>
                  <span className="mt-1 inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                    {statusLabel[r.status] ?? r.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-700">
          Room yang saya ikuti
        </h2>
        {!asParticipantRooms?.length ? (
          <p className="muted">Belum ada.</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {(asParticipantRooms ?? []).map((r) => (
              <li key={r.id}>
                <Link
                  href={`/rooms/${r.id}`}
                  className="card block transition hover:border-zinc-300"
                >
                  <p className="font-medium text-zinc-900">
                    {r.title || "Sesi belajar"}
                  </p>
                  <p className="text-xs text-zinc-500">{formatDate(r.scheduled_start)}</p>
                  <span className="mt-1 inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                    {statusLabel[r.status] ?? r.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-700">
          Room yang saya mentoring
        </h2>
        {!asMentor?.length ? (
          <p className="muted">Belum ada.</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {(asMentor ?? []).map((r) => (
              <li key={r.id}>
                <Link
                  href={`/rooms/${r.id}`}
                  className="card block transition hover:border-zinc-300"
                >
                  <p className="font-medium text-zinc-900">
                    {r.title || "Sesi belajar"}
                  </p>
                  <p className="text-xs text-zinc-500">{formatDate(r.scheduled_start)}</p>
                  <span className="mt-1 inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                    {statusLabel[r.status] ?? r.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
