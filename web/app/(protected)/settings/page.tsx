import { getSupabaseServerClient } from "@/lib/supabase/server";
import { SettingsForm } from "./SettingsForm";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex-1 max-w-[1280px] mx-auto w-full">
      <SettingsForm user={user} profile={profile || {}} />
    </div>
  );
}
