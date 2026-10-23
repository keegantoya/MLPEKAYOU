import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { chineseCards, chineseSets, getChineseCard, type ChineseISOCard } from "../catalog/catalog";
import { buildChineseISOState, emptyChineseISOData, type ChineseISOData } from "./model";
import { loadChineseISOData, loadChineseSettings } from "./repository";
export type ChineseMarketRow = { user_id: string; set_id: string; card_key: string; is_for_trade: boolean; is_for_sale: boolean; asking_price: number | string | null; trade_quantity: number; sale_quantity: number };
export type ChineseProfileListing = ChineseISOCard & ChineseMarketRow & { type: "trade" | "sale"; listingId: string };
export function buildChineseProfileListings(rows: ChineseMarketRow[], ownerId: string, enabled: boolean) {
  const trades: ChineseProfileListing[] = [];
  const sales: ChineseProfileListing[] = [];
  if (!enabled) return { trades, sales };
  for (const row of rows) {
    if (row.user_id !== ownerId) continue;
    const card = getChineseCard(row.set_id, row.card_key);
    if (!card) continue;
    if (row.is_for_trade && Number.isFinite(Number(row.trade_quantity)) && Number(row.trade_quantity) > 0) trades.push({ ...row, ...card, type: "trade", listingId: `${card.identity}:trade` });
    if (row.is_for_sale && Number.isFinite(Number(row.sale_quantity)) && Number(row.sale_quantity) > 0) sales.push({ ...row, ...card, type: "sale", listingId: `${card.identity}:sale` });
  }
  return { trades, sales };
}
async function loadChineseMarketRows(profileId: string) {
  const rows: ChineseMarketRow[] = [];
  for (let from = 0; ; from += 500) {
    const { data, error } = await supabase.from("card_market_listings").select("user_id, set_id, card_key, is_for_trade, is_for_sale, asking_price, trade_quantity, sale_quantity").eq("user_id", profileId).like("set_id", "cn-%").order("set_id").order("card_key").range(from, from + 499);
    if (error) throw new Error("Chinese trade and sale listings could not be loaded.");
    rows.push(...((data ?? []) as ChineseMarketRow[]));
    if (!data || data.length < 500) break;
  }
  return rows;
}
type Snapshot = { profileId: string; ready: boolean; data: ChineseISOData; market: ChineseMarketRow[]; cardsError: string; marketError: string };
const emptySnapshot = (profileId = ""): Snapshot => ({ profileId, ready: false, data: emptyChineseISOData(), market: [], cardsError: "", marketError: "" });
export function usePublicChineseProfile(profileId?: string) {
  const [snapshot, setSnapshot] = useState(emptySnapshot);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    let generation = 0;
    const load = async () => {
      const ticket = ++generation;
      if (!profileId) { setSnapshot(emptySnapshot()); return; }
      setSnapshot(previous => previous.profileId === profileId && previous.ready ? previous : emptySnapshot(profileId));
      try {
        const settings = await loadChineseSettings(profileId, true);
        if (!active || ticket !== generation) return;
        if (!settings.chinese_cards_enabled) { setSnapshot({ ...emptySnapshot(profileId), ready: true, data: { ...emptyChineseISOData(), settings } }); return; }
        const [cards, market] = await Promise.allSettled([loadChineseISOData(profileId, true, settings), loadChineseMarketRows(profileId)]);
        if (!active || ticket !== generation) return;
        setSnapshot({ profileId, ready: true, data: cards.status === "fulfilled" ? cards.value : { ...emptyChineseISOData(), settings }, market: market.status === "fulfilled" ? market.value : [], cardsError: cards.status === "rejected" ? "Chinese ISO and wishlist could not be loaded." : "", marketError: market.status === "rejected" ? "Chinese trade and sale listings could not be loaded." : "" });
      } catch {
        if (active && ticket === generation) setSnapshot({ ...emptySnapshot(profileId), ready: true });
      }
    };
    const refresh = (event?: Event) => {
      const detail = (event as CustomEvent<{ userId?: string }> | undefined)?.detail;
      if (detail?.userId && detail.userId !== profileId) return;
      void load();
    };
    window.addEventListener("focus", refresh);
    window.addEventListener("chinese-iso-changed", refresh);
    refresh();
    return () => { active = false; generation += 1; window.removeEventListener("focus", refresh); window.removeEventListener("chinese-iso-changed", refresh); };
  }, [profileId, retry]);
  const current = snapshot.profileId === profileId ? snapshot : emptySnapshot(profileId);
  const enabled = current.ready && current.data.settings.chinese_cards_enabled;
  const state = useMemo(() => buildChineseISOState(current.data), [current.data]);
  const listings = useMemo(() => buildChineseProfileListings(current.market, profileId ?? "", enabled), [current.market, profileId, enabled]);
  const ownedCount = chineseCards.filter(card => state.owned.has(card.identity)).length;
  const completedCount = chineseSets.filter(set => set.cards.length > 0 && set.cards.every(card => state.owned.has(`${set.id}:${card.key}`))).length;
  return { ...current, ownedCount, completedCount, enabled, loading: !current.ready, state, ...listings, refresh: () => setRetry(value => value + 1) };
}
export type PublicChineseProfile = ReturnType<typeof usePublicChineseProfile>;
