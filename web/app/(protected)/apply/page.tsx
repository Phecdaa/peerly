import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ApplyMentorForm } from "./ApplyMentorForm";
import { redirect } from "next/navigation";

export default async function ApplyPage() {
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

  const { data: courses = [] } = await supabase
    .from("courses")
    .select("id, name, slug")
    .order("name");

  return <ApplyMentorForm courses={courses ?? []} user={user} profile={profile || {}} />;
}
