import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { RoomChat } from "./RoomChat";
import { RoomActions } from "./RoomActions";
import { InviteByEmailForm } from "./InviteByEmailForm";

export const dynamic = "force-dynamic";

type RoomPageProps = {
  params: Promise<{ id: string }>;
};

const STATUS_LABELS: Record<string, string> = {
  pending_mentor_accept: "Menunggu mentor menerima",
  waiting_payment: "Menunggu pembayaran",
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
      availability_id,
      title,
      description,
      payment_mode,
      mode,
      scheduled_start,
      scheduled_end,
      status,
      intended_participant_count,
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

  const { data: availability } = await supabase
    .from("availabilities")
    .select("max_students")
    .eq("id", room.availability_id)
    .single();

  const maxCapacity = availability?.max_students ?? 1;

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
  const intendedCount = Math.max(1, Number(room.intended_participant_count) ?? participantCount);
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
    intendedCount > 0 ? totalAmount / intendedCount : totalAmount;

  const now = new Date();
  const sessionEnd = new Date(room.scheduled_end);
  const isSessionEnded = now > sessionEnd;
  const isReadOnly =
    !["scheduled", "ongoing"].includes(room.status) || isSessionEnded;

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
            <h2 className="card-title">Undang peserta</h2>
            <InviteByEmailForm
              roomId={roomId}
              currentCount={participantCount}
              maxCapacity={Math.min(maxCapacity, intendedCount)}
              canInvite={isHost || isMentor}
            />
          </section>

          <section className="card space-y-4">
            <div>
              <h2 className="card-title flex items-center justify-between">
                <span>Peserta</span>
                <span className="text-xs font-normal text-zinc-500">{paidCount}/{intendedCount} Lunas</span>
              </h2>
              
              {/* Progress Bar */}
              <div className="mt-3 overflow-hidden rounded-full bg-zinc-100">
                <div 
                  className="h-2 rounded-full bg-emerald-500 transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.max(0, (paidCount / intendedCount) * 100))}%` }}
                />
              </div>
            </div>

            <ul className="space-y-2 text-sm text-zinc-700 divide-y divide-zinc-100">
              {(room.room_participants ?? []).map(
                (p: {
                  id: number;
                  user_id: string;
                  role: string;
                  has_paid: boolean;
                }) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-3 pt-2 first:pt-0"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-medium text-indigo-700">
                        {(p.user_id === user.id ? "K" : profileMap[p.user_id]?.charAt(0) ?? "P")}
                      </div>
                      <span className="truncate font-medium">
                        {p.user_id === user.id
                          ? "Kamu"
                          : profileMap[p.user_id] ?? "Peserta"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] shrink-0">
                      <span className="rounded bg-zinc-100 px-1.5 py-0.5 uppercase tracking-wide text-zinc-500">
                        {p.role}
                      </span>
                      {p.has_paid ? (
                        <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-700 font-medium">
                          Lunas
                        </span>
                      ) : (
                        <span className="rounded bg-amber-50 px-1.5 py-0.5 text-amber-700 font-medium">
                          Belum
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
            <div className="flex items-center gap-3 rounded-lg border border-zinc-100 p-3 bg-zinc-50/50 hover:bg-zinc-50 transition">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 font-medium text-white shadow-sm ring-2 ring-white">
                {(profileMap[room.mentor_id] ?? "M").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-zinc-900 truncate">
                  {profileMap[room.mentor_id] ?? "Mentor"}
                </p>
                <p className="text-xs text-zinc-500">Mentor Room</p>
              </div>
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
}
