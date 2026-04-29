import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MentorEarningsClient } from "./MentorEarningsClient";

export default async function MentorEarningsPage() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("mentor_status, is_mentor")
    .eq("id", user.id)
    .single();

  if (!profile?.is_mentor || profile?.mentor_status !== "approved") {
    redirect("/dashboard");
  }

  return <MentorEarningsClient />;
}
