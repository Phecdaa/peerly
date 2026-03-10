import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type RoomPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RoomPage({ params }: RoomPageProps) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const roomId = parseInt(id, 10);
  if (Number.isNaN(roomId)) {
    notFound();
  }

  const { data: room } = await supabase
    .from("rooms")
    .select(
      `
      id,
      mentor_id,
      host_id,
      title,
      description,
      payment_mode,
      scheduled_start,
      scheduled_end,
      status,
      room_participants (
        id,
        user_id,
        role,
        has_paid
      )
    `
    )
    .eq("id", roomId)
    .single();

  if (!room) {
    notFound();
  }

  const isHost = room.host_id === user.id;
  const isParticipant = room.room_participants?.some(
    (p: { user_id: string }) => p.user_id === user.id
  );

  if (!isHost && !isParticipant) {
    notFound();
  }

  const participantCount = room.room_participants?.length ?? 0;

  return (
    <div className="page space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">
            {room.title || "Sesi belajar"}
          </h1>
          <p className="text-sm text-zinc-500">
            {new Date(room.scheduled_start).toLocaleString()} &mdash;{" "}
            {new Date(room.scheduled_end).toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 font-medium text-zinc-700">
            {room.status}
          </span>
          <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-zinc-500">
            {participantCount} peserta
          </span>
        </div>
      </header>

      <main className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className="card space-y-3">
          <h2 className="card-title">Detail sesi</h2>
          {room.description ? (
            <p className="text-sm text-zinc-600 whitespace-pre-wrap">
              {room.description}
            </p>
          ) : (
            <p className="text-sm text-zinc-500">
              Belum ada deskripsi sesi. Gunakan chat untuk menyepakati fokus
              belajar.
            </p>
          )}
          <div className="mt-4 rounded-lg border border-dashed border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600">
            <p className="font-medium text-zinc-800">Status pembayaran</p>
            <p className="mt-1">
              Mode pembayaran:{" "}
              <span className="font-medium">{room.payment_mode}</span>. UI
              detail pembayaran dan konfirmasi akan menyusul.
            </p>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="card space-y-3">
            <h2 className="card-title">Peserta</h2>
            <ul className="space-y-1 text-sm text-zinc-700">
              {room.room_participants?.map(
                (p: {
                  id: number;
                  user_id: string;
                  role: string;
                  has_paid: boolean;
                }) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="truncate">
                      {p.user_id === user.id ? "Kamu" : p.user_id}
                    </span>
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 uppercase tracking-wide text-zinc-500">
                        {p.role}
                      </span>
                      {p.has_paid && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                          Lunas
                        </span>
                      )}
                    </div>
                  </li>
                )
              )}
            </ul>
          </section>

          <section className="card space-y-3">
            <h2 className="card-title">Keamanan & kenyamanan</h2>
            <p className="text-xs text-zinc-600">
              Jika ada perilaku yang mengganggu atau melanggar aturan, kamu bisa
              membuat laporan ke admin setelah sesi selesai.
            </p>
          </section>
        </aside>
      </main>
    </div>
  );
}

