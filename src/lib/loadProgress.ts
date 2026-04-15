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

// ✅ NEW FUNCTION (separate, outside the first one)
export const loadOwnedCardsBySet = async () => {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;

  if (!user) return {};

  const { data: progress, error } = await supabase
    .from("collection_progress")
    .select("*")
    .eq("user_id", user.id);

  if (error || !progress) return {};

  const result: Record<string, string[]> = {};

  progress.forEach((row) => {
    if (!row.progress) {
      result[row.set_id] = [];
      return;
    }

    const ownedCards = Object.entries(row.progress)
      .filter(([_, value]) => value === true)
      .map(([cardId]) => cardId);

    result[row.set_id] = ownedCards;
  });

  return result;
};