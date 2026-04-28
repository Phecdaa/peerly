import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AvailabilityManager } from "./AvailabilityManager";

export default async function MentorAvailabilityPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("mentor_status, timezone")
    .eq("id", user.id)
    .single();

  if (profile?.mentor_status !== "approved") {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <p className="text-red-600">
          Hanya mentor yang sudah disetujui yang bisa mengatur availability.
        </p>
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
    <div className="flex-1 w-full flex flex-col pt-4">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-h1 text-h1 text-on-surface mb-2">Availability Management</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">Set your regular working hours and manage your calendar to ensure students can book study sessions when you're ready to help.</p>
      </div>
      
      <AvailabilityManager 
        initialAvailabilities={availabilities || []} 
        timezone={profile?.timezone || "Asia/Jakarta"} 
      />
    </div>
  );
}
