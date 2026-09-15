import { supabase } from "@/lib/supabase";

export async function saveCollectionProgress(
  setId: string,
  progress: Record<string, boolean>,
) {
  const { error } = await supabase.rpc("save_collection_progress", {
    p_set_id: setId,
    p_progress: progress,
  });

  return error;
}
