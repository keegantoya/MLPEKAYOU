import { supabase } from "@/lib/supabase";
import { chineseSets } from "../catalog/catalog";
import { defaultChineseSettings, type ChineseISOData, type ChineseSettings, type ChineseStatus, type ChineseProgressRow, type ChineseStatusRow, type ChineseWishlistRow } from "./model";
const profileColumns = "chinese_cards_enabled, chinese_iso_hidden_sets, chinese_hide_iso, chinese_hide_wishlist";
const setIds = chineseSets.map(set => set.id);
function databaseError(error: { message?: string; code?: string }): Error {
  const setup = error.code === "42703" || error.code === "42P01" || error.code === "PGRST204" || error.code === "PGRST205";
  return new Error(setup ? "Chinese card setup is required. Run the included database setup SQL, then retry." : error.message || "The update could not be saved. Please retry.");
}
export async function loadChineseSettings(userId: string, publicView = false): Promise<ChineseSettings> {
  const { data, error } = await supabase.from("profiles").select(`${profileColumns}, hide_iso, hide_wishlist`).eq("id", userId).maybeSingle();
  if (error) throw databaseError(error);
  if (!data) throw new Error("This profile could not be found.");
  return { ...defaultChineseSettings, ...data, chinese_hide_iso: !!data.chinese_hide_iso || (publicView && !!data.hide_iso), chinese_hide_wishlist: !!data.chinese_hide_wishlist || (publicView && !!data.hide_wishlist), chinese_iso_hidden_sets: Array.isArray(data.chinese_iso_hidden_sets) ? data.chinese_iso_hidden_sets : [] };
}
export async function loadChineseISOData(userId: string, publicView = false, knownSettings?: ChineseSettings): Promise<ChineseISOData> {
  const settings = knownSettings ?? await loadChineseSettings(userId, publicView);
  const result: ChineseISOData = { settings, progress: [], statuses: [], wishlist: [] };
  if (!settings.chinese_cards_enabled) return result;
  const tasks = [
    (async () => {
      if (publicView && settings.chinese_hide_iso) return [];
      const { data, error } = await supabase.from("collection_progress_raw").select("set_id, progress").eq("user_id", userId).in("set_id", setIds);
      if (error) throw databaseError(error);
      return (data ?? []) as ChineseProgressRow[];
    })(),
    (async () => {
      if (publicView && settings.chinese_hide_iso) return [];
      const rows: ChineseStatusRow[] = [];
      for (let from = 0; ; from += 500) {
        const { data, error } = await supabase.from("chinese_iso_status").select("set_id, card_key, status").eq("user_id", userId).order("set_id").order("card_key").range(from, from + 499);
        if (error) throw databaseError(error);
        rows.push(...((data ?? []) as ChineseStatusRow[]));
        if (!data || data.length < 500) break;
      }
      return rows;
    })(),
    (async () => {
      if (publicView && settings.chinese_hide_wishlist) return [];
      const rows: ChineseWishlistRow[] = [];
      for (let from = 0; ; from += 500) {
        const { data, error } = await supabase.from("chinese_wishlists").select("set_id, card_key").eq("user_id", userId).order("set_id").order("card_key").range(from, from + 499);
        if (error) throw databaseError(error);
        rows.push(...((data ?? []) as ChineseWishlistRow[]));
        if (!data || data.length < 500) break;
      }
      return rows;
    })(),
  ] as const;
  const [progress, statuses, wishlist] = await Promise.all(tasks);
  return { settings, progress, statuses, wishlist };
}
export async function saveChineseSettings(userId: string, patch: Partial<ChineseSettings>): Promise<ChineseSettings> {
  const { data, error } = await supabase.from("profiles").update(patch).eq("id", userId).select(profileColumns).single();
  if (error) throw databaseError(error);
  return { ...defaultChineseSettings, ...data };
}
export async function saveChineseStatus(userId: string, setId: string, cardKey: string, status: ChineseStatus | null) {
  const query = status ? supabase.from("chinese_iso_status").upsert({ user_id: userId, set_id: setId, card_key: cardKey, status }, { onConflict: "user_id,set_id,card_key" }) : supabase.from("chinese_iso_status").delete().eq("user_id", userId).eq("set_id", setId).eq("card_key", cardKey);
  const { error } = await query;
  if (error) throw databaseError(error);
}
export async function saveChineseWishlist(userId: string, setId: string, cardKey: string, add: boolean) {
  const query = add ? supabase.from("chinese_wishlists").upsert({ user_id: userId, set_id: setId, card_key: cardKey }, { onConflict: "user_id,set_id,card_key", ignoreDuplicates: true }) : supabase.from("chinese_wishlists").delete().eq("user_id", userId).eq("set_id", setId).eq("card_key", cardKey);
  const { error } = await query;
  if (error) throw databaseError(error);
}
export async function completeChineseCard(setId: string, cardKey: string) {
  const { error } = await supabase.rpc("mark_chinese_iso_collected", { p_set_id: setId, p_card_key: cardKey });
  if (error) throw databaseError(error);
}
