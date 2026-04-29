import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AdminSidebar, AdminHeader } from "@/components/admin/NavigationAdmin";

export default async function AdminLayout({
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
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background text-on-background font-body-md flex">
      <AdminSidebar adminName={profile?.full_name} />
      
      {/* Main Wrapper for Content */}
      <div className="flex-1 flex flex-col ml-64 overflow-hidden relative w-[calc(100%-16rem)]">
        <AdminHeader />
        {children}
      </div>
    </div>
  );
}
