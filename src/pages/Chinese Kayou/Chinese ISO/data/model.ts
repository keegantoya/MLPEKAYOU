import { chineseCards, type ChineseISOCard, type ChineseFamily } from "../catalog/catalog";
export type ChineseStatus = "purchase_in_progress" | "trade_in_progress";
export type ChineseProgressRow = { set_id: string; progress: Record<string, unknown> | null };
export type ChineseStatusRow = { set_id: string; card_key: string; status: ChineseStatus };
export type ChineseWishlistRow = { set_id: string; card_key: string };
export type ChineseSettings = { chinese_cards_enabled: boolean; chinese_iso_hidden_sets: string[]; chinese_hide_iso: boolean; chinese_hide_wishlist: boolean };
export const defaultChineseSettings: ChineseSettings = { chinese_cards_enabled: false, chinese_iso_hidden_sets: [], chinese_hide_iso: false, chinese_hide_wishlist: false };
export type ChineseISOData = { settings: ChineseSettings; progress: ChineseProgressRow[]; statuses: ChineseStatusRow[]; wishlist: ChineseWishlistRow[] };
export const emptyChineseISOData = (): ChineseISOData => ({ settings: { ...defaultChineseSettings, chinese_iso_hidden_sets: [] }, progress: [], statuses: [], wishlist: [] });
export const cardIdentity = (setId: string, cardKey: string) => `${setId}:${cardKey}`;
export const isChineseOwned = (value: unknown): boolean => value === true || !!(value && typeof value === "object" && !Array.isArray(value) && "owned" in value && value.owned === true);
export function buildChineseISOState(data: ChineseISOData) {
  const owned = new Set<string>();
  for (const row of data.progress) for (const [key, value] of Object.entries(row.progress ?? {})) if (isChineseOwned(value)) owned.add(cardIdentity(row.set_id, key));
  const statuses = new Map(data.statuses.filter(row => row.status === "purchase_in_progress" || row.status === "trade_in_progress").map(row => [cardIdentity(row.set_id, row.card_key), row.status]));
  const wishlist = new Set(data.wishlist.map(row => cardIdentity(row.set_id, row.card_key)));
  const hidden = new Set(data.settings.chinese_iso_hidden_sets);
  const missing = chineseCards.filter(card => !hidden.has(card.setId) && !owned.has(card.identity) && !statuses.has(card.identity));
  const inProgress = chineseCards.filter(card => !owned.has(card.identity) && statuses.has(card.identity));
  const wishlisted = chineseCards.filter(card => wishlist.has(card.identity));
  return { owned, statuses, wishlist, hidden, missing, inProgress, wishlisted };
}
export type ChineseISOSection = ChineseFamily | "full" | "wishlist" | "progress";
export function normalizeChineseCode(value: string): string {
  return value.toUpperCase().replace(/<>/g, "\u25C7").replace(/<(ZR|AR|CR|N)/g, "\u25C7$1").replace(/\s+/g, "").replace(/[\u2010-\u2015]/g, "-");
}
export function searchChineseCards(cards: ChineseISOCard[], query: string) {
  const normalized = normalizeChineseCode(query);
  return normalized ? cards.filter(card => normalizeChineseCode(card.code).includes(normalized) || normalizeChineseCode(`${card.setName} ${card.code}`).includes(normalized) || (card.key === "PR-D19" && "YH-PR-D19".includes(normalized))) : cards;
}
