import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { RoomChat } from "./RoomChat";
import { RoomActions } from "./RoomActions";

type RoomPageProps = {
  params: Promise<{ id: string }>;
};

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Menunggu pembayaran",
  waiting_mentor_approval: "Menunggu approval mentor",
  scheduled: "Terjadwal",
  ongoing: "Berlangsung",
  finished: "Selesai",
  cancelled: "Dibatalkan",
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
      mode,
      scheduled_start,
      scheduled_end,
      status,
      room_participants (
        id,
        user_id,
        role,
        has_paid,
        amount_to_pay
      )
    `
    )
    .eq("id", roomId)
    .single();

  if (!room) {
    notFound();
  }

  const { data: mentorProfile } = await supabase
    .from("profiles")
    .select("hourly_rate")
    .eq("id", room.mentor_id)
    .single();

  const isHost = room.host_id === user.id;
  const isMentor = room.mentor_id === user.id;
  const isParticipant = (room.room_participants ?? []).some(
    (p: { user_id: string }) => p.user_id === user.id
  );

  if (!isHost && !isParticipant && !isMentor) {
    notFound();
  }

  const participantIds = [
    room.host_id,
    room.mentor_id,
    ...(room.room_participants ?? []).map((p: { user_id: string }) => p.user_id),
  ];
  const uniqueIds = [...new Set(participantIds)];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", uniqueIds.length ? uniqueIds : ["00000000-0000-0000-0000-000000000000"]);

  const profileMap: Record<string, string> = {};
  (profiles ?? []).forEach((p) => {
    profileMap[p.id] = p.full_name ?? "User";
  });

  const participantCount = room.room_participants?.length ?? 0;
  const paidCount = (room.room_participants ?? []).filter(
    (p: { has_paid: boolean }) => p.has_paid
  ).length;
  const myParticipant = (room.room_participants ?? []).find(
    (p: { user_id: string }) => p.user_id === user.id
  ) as { has_paid: boolean; amount_to_pay: number } | undefined;
  const hasPaid = myParticipant?.has_paid ?? false;

  const durationMin =
    (new Date(room.scheduled_end).getTime() -
      new Date(room.scheduled_start).getTime()) /
    60000;
  const hourlyRate = Number(mentorProfile?.hourly_rate ?? 0);
  const totalAmount = (hourlyRate * durationMin) / 60;
  const amountPerPerson =
    participantCount > 0 ? totalAmount / participantCount : totalAmount;

  const now = new Date();
  const sessionEnd = new Date(room.scheduled_end);
  const isSessionEnded = now > sessionEnd;
  const isReadOnly =
    ["finished", "cancelled"].includes(room.status) || isSessionEnded;

  const role = isMentor ? "mentor" : isHost ? "host" : "participant";

  return (
    <div className="page space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/rooms"
            className="text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-700"
          >
            ← Room saya
          </Link>
          <h1 className="mt-1 text-xl font-semibold text-zinc-900">
            {room.title || "Sesi belajar"}
          </h1>
          <p className="text-sm text-zinc-500">
            {new Date(room.scheduled_start).toLocaleString("id-ID")} –{" "}
            {new Date(room.scheduled_end).toLocaleTimeString("id-ID", {
              timeStyle: "short",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 font-medium text-zinc-700">
            {STATUS_LABELS[room.status] ?? room.status}
          </span>
          <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-zinc-500">
            {participantCount} peserta · {paidCount} lunas
          </span>
        </div>
      </header>

      <main className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <section className="card space-y-3">
            <h2 className="card-title">Chat (koordinasi sesi)</h2>
            <RoomChat
              roomId={roomId}
              currentUserId={user.id}
              profileMap={profileMap}
              isReadOnly={isReadOnly}
            />
          </section>

          <section className="card space-y-3">
            <h2 className="card-title">Detail sesi</h2>
            {room.description ? (
              <p className="text-sm text-zinc-600 whitespace-pre-wrap">
                {room.description}
              </p>
            ) : (
              <p className="text-sm text-zinc-500">
                Belum ada deskripsi. Gunakan chat untuk menyepakati fokus belajar.
              </p>
            )}
            <p className="text-xs text-zinc-500">
              Mode: {room.mode} · Pembayaran: {room.payment_mode}
            </p>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="card space-y-3">
            <h2 className="card-title">Aksi</h2>
            <RoomActions
              roomId={roomId}
              role={role}
              status={room.status}
              hasPaid={hasPaid}
              amountPerPerson={amountPerPerson}
              isSessionEnded={isSessionEnded}
            />
          </section>

          <section className="card space-y-3">
            <h2 className="card-title">Peserta</h2>
            <ul className="space-y-1 text-sm text-zinc-700">
              {(room.room_participants ?? []).map(
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
                      {p.user_id === user.id
                        ? "Kamu"
                        : profileMap[p.user_id] ?? "Peserta"}
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
            <h2 className="card-title">Mentor</h2>
            <p className="text-sm text-zinc-700">
              {profileMap[room.mentor_id] ?? "Mentor"}
            </p>
          </section>
        </aside>
      </main>
    </div>
  );
}
