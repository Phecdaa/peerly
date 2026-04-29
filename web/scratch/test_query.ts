
import { getSupabaseServiceClient } from "../lib/supabase/service";

async function testQuery() {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      courses ( id, name, slug )
    `)
    .eq("is_mentor", true)
    .limit(5);

  if (error) {
    console.error("Query Error:", error);
  } else {
    console.log("Query Result:", JSON.stringify(data, null, 2));
  }
}

testQuery();
