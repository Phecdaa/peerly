import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { RoomChat } from "./RoomChat";
import { RoomActions } from "./RoomActions";
import { InviteByEmailForm } from "./InviteByEmailForm";
import { RoomTime } from "./RoomTime";
import { ReportButton } from "@/components/ReportButton";

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
    return (
      <div className="p-8 text-red-500">
        <h1>Debug Error: Unauthorized</h1>
        <p>Bypass notFound(): User object is null from supabase.auth.getUser().</p>
      </div>
    );
  }

  const roomId = parseInt(id, 10);
  if (Number.isNaN(roomId)) {
    return <div className="p-8 text-red-500">Debug Error: Room ID is NaN</div>;
  }

  const { data: room, error: queryError } = await supabase
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
      mentor_marked_completed,
      host_marked_completed,
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

  if (!room || queryError) {
    return (
      <div className="p-8 text-red-500">
        <h1 className="text-xl font-bold">Debug Error: Room not found</h1>
        <p>Room ID: {roomId}</p>
        <p>User ID: {user.id}</p>
        <p>Apakah room berhasil terbuat di database? Cek di Supabase Table Editor if ID {roomId} exists.</p>
        <p>Kemungkinan: RLS Policy memblokir read, transaksi create gagal, atau Skema Database belum ter-update.</p>
        <p className="mt-4 font-mono text-xs bg-red-100 p-4 rounded text-black overflow-auto">
          Supabase Error Details: {JSON.stringify(queryError || "No error object returned, data was null")}
        </p>
      </div>
    );
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
    return (
      <div className="p-8 text-red-500">
        <h1 className="text-xl font-bold">Debug Error: User is not authorized to view this room</h1>
        <p>Room ID: {roomId}. Host ID: {room.host_id}. Your ID: {user.id}.</p>
        <p>isHost: {String(isHost)}, isMentor: {String(isMentor)}, isParticipant: {String(isParticipant)}</p>
      </div>
    );
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

  let hasReviewed = false;
  if (!isMentor && room.status === "finished") {
    const { data: myReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("room_id", roomId)
      .eq("reviewer_id", user.id)
      .maybeSingle();
    hasReviewed = !!myReview;
  }

  const durationMin =
    (new Date(room.scheduled_end).getTime() -
      new Date(room.scheduled_start).getTime()) /
    60000;
  const hourlyRate = Number(mentorProfile?.hourly_rate ?? 0);
  const totalAmount = (hourlyRate * durationMin) / 60;
  let amountPerPerson =
    intendedCount > 0 ? totalAmount / intendedCount : totalAmount;
  
  if (room.payment_mode === "host_pays_all") {
    amountPerPerson = user.id === room.host_id ? totalAmount : 0;
  }

  const hostParticipant = (room.room_participants ?? []).find(
    (p: { user_id: string, has_paid: boolean }) => p.user_id === room.host_id
  );
  const isHostPaid = hostParticipant?.has_paid ?? false;

  let actualHasPaid = hasPaid;
  let actualPaidCount = paidCount;

  if (room.payment_mode === "host_pays_all") {
    if (isHostPaid) {
      actualHasPaid = true;
      actualPaidCount = intendedCount;
    } else if (!isHost) {
      actualHasPaid = false;
    }
  }

  const now = new Date();
  const sessionEnd = new Date(room.scheduled_end);
  const isSessionEnded = now > sessionEnd;
  const isReadOnly =
    !["scheduled", "ongoing"].includes(room.status) || isSessionEnded;

  const role = isMentor ? "mentor" : isHost ? "host" : "participant";

  const hasActions = 
    (role !== "mentor" && room.status === "waiting_payment" && !actualHasPaid && !isSessionEnded) ||
    (role === "mentor" && room.status === "pending_mentor_accept" && !isSessionEnded) ||
    ((role === "mentor" || role === "host") && ["scheduled", "ongoing"].includes(room.status) && isSessionEnded && 
      !((role === "mentor" && room.mentor_marked_completed) || (role === "host" && room.host_marked_completed))) ||
    (role !== "mentor" && room.status === "finished" && !hasReviewed);

  return (
    <div className="flex flex-col xl:flex-row gap-lg items-start h-full">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-lg w-full">
        {/* Room Header / Status */}
        <div className="bg-surface-container-lowest rounded-xl p-lg shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 flex flex-col gap-md">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-tertiary-container text-on-tertiary-container font-label-sm text-label-sm px-3 py-1 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">event</span>
                  {STATUS_LABELS[room.status] ?? room.status}
                </span>
              </div>
              <h1 className="font-h2 text-h2 text-on-surface">{room.title || "Sesi Belajar"}</h1>
            </div>
            <div className="flex gap-2">
              <Link href="/rooms" className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface-variant font-label-md text-label-md hover:bg-surface-container transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Kembali
              </Link>
            </div>
          </div>
          
          {room.description ? (
            <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl whitespace-pre-wrap">
              {room.description}
            </p>
          ) : (
            <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl italic">
              Belum ada deskripsi spesifik. Gunakan chat untuk menyepakati fokus belajar.
            </p>
          )}
          
          <div className="flex flex-wrap gap-6 pt-4 border-t border-surface-variant">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">schedule</span>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant">WAKTU</p>
                <p className="font-label-md text-label-md text-on-surface">
                  <RoomTime startTs={room.scheduled_start} endTs={room.scheduled_end} />
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">videocam</span>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant">MODE</p>
                <p className="font-label-md text-label-md text-on-surface capitalize">{room.mode}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">group</span>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant">KAPASITAS</p>
                <p className="font-label-md text-label-md text-on-surface">{actualPaidCount} dari {intendedCount} Terisi</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          {/* Payment Progress */}
          <div className="bg-surface-container-lowest rounded-xl p-lg shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-h3 text-h3 text-on-surface text-[20px]">Status Pembayaran</h3>
              <span className="font-label-md text-label-md text-primary font-medium">Rp {Math.round(amountPerPerson).toLocaleString()}/org</span>
            </div>
            <div className="mt-2">
              <div className="flex justify-between font-label-md text-label-md mb-2">
                <span className="text-on-surface-variant">{actualPaidCount} dari {intendedCount} lunas</span>
                <span className="text-on-surface font-semibold">{Math.round((actualPaidCount / intendedCount) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                <div className="h-full bg-secondary rounded-full transition-all duration-500" style={{ width: `${Math.max(0, Math.min(100, (actualPaidCount / intendedCount) * 100))}%` }}></div>
              </div>
            </div>
            <div className="bg-surface-container p-4 rounded-lg mt-2 flex items-start gap-3">
              <span className="material-symbols-outlined text-primary mt-0.5">info</span>
              <p className="font-body-md text-body-md text-[14px] text-on-surface-variant">
                {room.payment_mode === "host_pays_all" 
                  ? "Sesi menggunakan mode Host Pays All. Host menanggung seluruh biaya."
                  : `Sesi akan terjadwal otomatis jika seluruh peserta telah membayar. ${intendedCount - actualPaidCount} pembayaran tertunda.`
                }
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-surface-container-lowest rounded-xl p-lg shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 flex flex-col gap-4 justify-center relative">
            <h3 className="font-h3 text-h3 text-on-surface text-[20px] mb-2">Aksi Sesi</h3>
            
            {hasActions ? (
              <RoomActions
                roomId={roomId}
                role={role}
                status={room.status}
                hasPaid={actualHasPaid}
                amountPerPerson={amountPerPerson}
                isSessionEnded={isSessionEnded}
                paymentMode={room.payment_mode}
                mentorMarkedCompleted={room.mentor_marked_completed}
                hostMarkedCompleted={room.host_marked_completed}
                hasReviewed={hasReviewed}
              />
            ) : (
              <p className="text-sm text-on-surface-variant bg-surface p-3 rounded-lg text-center border border-outline-variant/20">Tidak ada aksi yang diperlukan saat ini.</p>
            )}

            {["online", "hybrid"].includes(room.mode) && ["scheduled", "ongoing"].includes(room.status) && (
              <a 
                href="https://meet.google.com/peerly-demo-room" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-secondary text-on-secondary py-3 px-4 rounded-lg font-label-md text-label-md hover:bg-on-secondary-fixed-variant transition-colors flex items-center justify-center gap-2 w-full mt-2 shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                Join Call (Live)
              </a>
            )}
          </div>
        </div>

        {/* Participants & Invites */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-lg">
          {/* Participants */}
          <div className="bg-surface-container-lowest rounded-xl p-lg shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 flex flex-col min-h-[300px]">
            <h3 className="font-h3 text-h3 text-on-surface text-[20px] mb-6">Partisipan</h3>
            <div className="flex flex-col gap-0">
              
              {/* Mentor */}
              <div className="flex items-center justify-between py-4 border-b border-surface-variant">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border-2 border-primary bg-primary-container text-primary flex items-center justify-center font-bold text-lg">
                    {(profileMap[room.mentor_id] ?? "M").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface flex items-center gap-2">
                      {profileMap[room.mentor_id] ?? "Mentor"}
                      <span className="bg-primary-container/20 text-primary px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">Mentor</span>
                    </p>
                  </div>
                </div>
                {room.mentor_marked_completed && <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full font-label-sm text-[11px] flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">check_circle</span> Selesai</span>}
              </div>
              
              {/* Students */}
              {(room.room_participants ?? []).map((p: any) => {
                const isMe = p.user_id === user.id;
                return (
                  <div key={p.id} className="flex items-center justify-between py-4 border-b border-surface-variant last:border-0">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant font-label-md text-[18px]">
                        {(profileMap[p.user_id] ?? "P").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-label-md text-label-md text-on-surface flex items-center gap-2">
                          {isMe ? "Kamu" : profileMap[p.user_id] ?? "Peserta"}
                          {isMe && <span className="text-on-surface-variant text-[12px] font-normal">(You)</span>}
                        </p>
                        <p className="font-body-md text-[13px] text-on-surface-variant capitalize">{p.role}</p>
                      </div>
                    </div>
                    {p.has_paid ? (
                      <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full font-label-sm text-[11px] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span> Lunas
                      </span>
                    ) : (
                      <span className="bg-surface-variant text-on-surface-variant px-3 py-1 rounded-full font-label-sm text-[11px] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">schedule</span> Belum
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Invite Section */}
          <div className="bg-surface-container-lowest rounded-xl p-lg shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 flex flex-col">
            <h3 className="font-h3 text-h3 text-on-surface text-[20px] mb-4">Undang Teman</h3>
            <InviteByEmailForm
              roomId={roomId}
              currentCount={participantCount}
              maxCapacity={Math.min(maxCapacity, intendedCount)}
              canInvite={isHost || isMentor}
            />
            
            <div className="mt-auto pt-6 text-center">
              <ReportButton targetType="room" targetId={String(roomId)} />
            </div>
          </div>
        </div>
      </div>

      {/* Integrated Chat Panel */}
      <div className="w-full xl:w-[380px] xl:sticky xl:top-24 h-[600px] xl:h-[calc(100vh-120px)] flex-shrink-0">
        <RoomChat
          roomId={roomId}
          currentUserId={user.id}
          profileMap={profileMap}
          isReadOnly={isReadOnly}
        />
      </div>
    </div>
  );
}
