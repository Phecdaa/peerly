"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addCourseAction(formData: FormData) {
  const supabase = await getSupabaseServerClient();
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;

  if (!name || !slug) return { error: "Name and Slug are required" };

  const { error } = await supabase.from("courses").insert([{ name, slug }]);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/courses");
  return { success: true };
}
