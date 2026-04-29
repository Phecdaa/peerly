import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ReportsClient } from "@/app/admin/reports/ReportsClient";

export default async function AdminReportsPage() {
  const supabase = await getSupabaseServerClient();

  // Fetch reports with reporter details
  const { data: reportsRaw } = await supabase
    .from("reports")
    .select(`
      id,
      reason,
      status,
      created_at,
      target_type,
      target_id,
      reporter:profiles!reporter_id(id, full_name, avatar_url)
    `)
    .order("created_at", { ascending: false });

  // Handle Supabase TS type inference where one-to-one joins might be typed/returned as arrays
  const formattedReports = (reportsRaw || []).map((r: any) => ({
    id: r.id,
    reason: r.reason,
    status: r.status,
    created_at: r.created_at,
    target_type: r.target_type,
    target_id: r.target_id,
    reporter: Array.isArray(r.reporter) ? r.reporter[0] : r.reporter,
  }));

  return <ReportsClient initialReports={formattedReports} />;
}
