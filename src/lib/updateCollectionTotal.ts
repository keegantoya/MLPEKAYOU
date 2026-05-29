import { supabase } from "@/lib/supabase";
import { calculateCollectionTotal } from "@/lib/CalculateCollectionTotal";

export async function updateCollectionTotal(userId: string) {
  const { data: allProgress } = await supabase
    .from("collection_progress_raw")
    .select("user_id, progress")
    .eq("user_id", userId);

  if (!allProgress) return;

  const total = calculateCollectionTotal(
    userId,
    allProgress
  );

  await supabase
    .from("profiles")
    .update({
      collection_total: total,
    })
    .eq("id", userId);
}
export default updateCollectionTotal;