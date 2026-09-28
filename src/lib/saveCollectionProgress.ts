import { supabase } from "@/lib/supabase";

export async function saveCollectionProgress(
  setId: string,
  progress: Record<string, boolean>,
) {
  const normalizedProgress = setId === "14"
    ? Object.entries(progress).reduce<Record<string, boolean>>((result, [key, owned]) => {
        const canonicalKey = key.replace(/^(BP03-ER0[12])-([ABC])\2$/, "$1-$2");
        result[canonicalKey] = Boolean(result[canonicalKey] || owned);
        return result;
      }, {})
    : progress;
  const { error } = await supabase.rpc("save_collection_progress", {
    p_set_id: setId,
    p_progress: normalizedProgress,
  });

  if (!error) {
    window.dispatchEvent(new CustomEvent("collection-progress-saved", {
      detail: { setId, progress: normalizedProgress },
    }));
  }

  return error;
}
