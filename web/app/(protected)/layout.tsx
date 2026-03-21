import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Navigation } from "@/components/Navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_mentor, mentor_status")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-zinc-50/50">
      <Navigation role={profile?.role} isMentor={profile?.is_mentor} mentorStatus={profile?.mentor_status} />
      <div className="md:pt-16 pb-20 md:pb-8 mx-auto w-full max-w-md md:max-w-4xl lg:max-w-5xl md:px-6">
        {children}
      </div>
    </div>
  );
}
