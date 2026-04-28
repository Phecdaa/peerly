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
    <div className="min-h-screen bg-background text-on-background font-body-md">
      <Navigation role={profile?.role} isMentor={profile?.is_mentor} mentorStatus={profile?.mentor_status} />
      <main className="pt-[88px] lg:pl-64 pb-24 md:pb-8 px-4 md:px-8 max-w-[1280px] mx-auto">
        {children}
      </main>
    </div>
  );
}
