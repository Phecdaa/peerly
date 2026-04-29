"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import { revalidatePath } from "next/cache";

export async function addCourseAction(formData: FormData) {
  // Verify the caller is admin
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { error: "Admin only" };

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;

  if (!name || !slug) return { error: "Name and Slug are required" };

  // Use service client to bypass RLS
  const service = getSupabaseServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (service as any).from("courses").insert([{ name, slug }]);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/courses");
  return { success: true };
}

export async function deleteCourseAction(courseId: number) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { error: "Admin only" };

  const service = getSupabaseServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (service as any).from("courses").delete().eq("id", courseId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/courses");
  return { success: true };
}
