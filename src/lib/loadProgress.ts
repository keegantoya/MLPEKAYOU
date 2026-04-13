import { supabase } from "@/lib/supabase";

export const loadUserProgress = async () => {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;

  // If not logged in, return empty progress
  if (!user) {
    return {};
  }

  const { data: progress, error } = await supabase
    .from("collection_progress")
    .select("*")
    .eq("user_id", user.id);

  if (error || !progress) {
    return {};
  }

  const result: Record<string, number> = {};

  progress.forEach((row) => {
    const owned = row.progress
      ? Object.values(row.progress).filter(Boolean).length
      : 0;

    result[row.set_id] = owned;
  });

  return result;
};