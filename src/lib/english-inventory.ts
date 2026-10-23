import { merchandiseSets, ENGLISH_MERCHANDISE_SET_ID } from "@/lib/english-merchandise-catalog";
import { profileViewCard, profileViewImage, profileViewStyle, type ProfileViewCard } from "@/lib/english-card-views";
import { englishSets, englishStarterDecks, getEnglishCards, getEnglishCard, getEnglishSet, getEnglishStarterDeckCards, getEnglishCardImageStyle, getEnglishRarityLabel, getISOSetId, isEnglishCardOwned, type EnglishCard } from "@/lib/english-card-catalog";
import { supabase } from "@/lib/supabase";
export type InventoryProgressRow = {
    set_id: string;
    progress: Record<string, unknown> | null;
};
export type InventoryTarget = {
    set_id: string;
    card_key: string;
};
export type InventoryQuantityRow = InventoryTarget & {
    quantity: number;
};
export type InventoryListingRow = InventoryTarget & {
    is_for_trade: boolean;
    is_for_sale: boolean;
    asking_price: number | null;
    trade_quantity: number;
    sale_quantity: number;
};
const presentation: Record<string, {
    title: string;
    setName: string;
    slug: string;
    imageUrl: string;
}> = {
    "1": { title: "Eternal Moon", setName: "One", slug: "moon-one", imageUrl: "/thumbnails/moononesetimage.webp" },
    "2": { title: "Eternal Moon", setName: "Two", slug: "moon-two", imageUrl: "/thumbnails/moontwosetimage.webp" },
    "3": { title: "Eternal Moon", setName: "Three", slug: "moon-three", imageUrl: "/thumbnails/moonthreesetimage.webp" },
    "13": { title: "Eternal Moon", setName: "Four", slug: "moon-four", imageUrl: "/thumbnails/moonfoursetimage.webp" },
    "4": { title: "Star", setName: "One", slug: "star-one", imageUrl: "/thumbnails/staronesetimage.webp" },
    "5": { title: "Rainbow", setName: "One", slug: "rainbow-one", imageUrl: "/thumbnails/rainbowonesetimage.webp" },
    "6": { title: "Rainbow", setName: "Two", slug: "rainbow-two", imageUrl: "/thumbnails/rainbowtwosetimage.webp" },
    "7": { title: "Fun Moments", setName: "One", slug: "fun-moments-one", imageUrl: "/thumbnails/funonesetimage.webp" },
    "8": { title: "Fun Moments", setName: "Two", slug: "fun-moments-two", imageUrl: "/thumbnails/funtwosetimage.webp" },
    "11": { title: "Fun Moments", setName: "Three", slug: "fun-moments-three", imageUrl: "/thumbnails/funthreesetimage.webp" },
    FW: { title: "Fantasy", setName: "Wonderland", slug: "fantasy-wonderland", imageUrl: "/thumbnails/fantasysetimage.webp" },
    SD: { title: "Friendships", setName: "Begin", slug: "friendships-begin", imageUrl: "/thumbnails/friendshipsbeginsetimage.webp" },
    "12": { title: "Discord", setName: "TCG", slug: "discord", imageUrl: "/thumbnails/discordsetimage.webp" },
    "14": { title: "Nightmare Night", setName: "TCG", slug: "nightmare-night", imageUrl: "/thumbnails/nightmarenightsetimage.webp" },
    "hearthswarming-eve": { title: "HearthsWarming Eve", setName: "TCG", slug: "hearthswarming-eve", imageUrl: "/thumbnails/hearthswarmingsetimage.png" },
    "9": { title: "Promotional", setName: "Cards", slug: "promotional-cards", imageUrl: "/thumbnails/promossetimage.webp" },
    tcgpromos: { title: "TCG", setName: "Promos", slug: "tcg-promos", imageUrl: "/thumbnails/tcgpromossetimage.webp" },
};
const setAliases: Record<string, string> = { FB: "SD", TCG_PROMOS: "tcgpromos", fantasywonderland: "FW", BP01: "FW" };
export type InventoryCard = ProfileViewCard;
export const isInventoryMerchandise = (id: string) => id === ENGLISH_MERCHANDISE_SET_ID || merchandiseSets.some(set => set.id === id);
export const getInventoryCard = (id: string, key: string): InventoryCard | undefined => isInventoryMerchandise(id) ? profileViewCard({ set_id: id, card_key: key }) : getEnglishCard(normalizeInventorySetId(id), key);
export const getInventoryCardSetId = (id: string, key: string) => getInventoryCard(id, key)?.merchandiseSetId ?? normalizeInventorySetId(id);
export const getInventoryCardImage = (card: InventoryCard) => card.family === "merch" ? profileViewImage({ set_id: card.setId, card_key: card.key }) : card.front;
export const getInventoryCardImageStyle = (card: InventoryCard) => card.family === "merch" ? profileViewStyle({ set_id: card.setId, card_key: card.key }) : getEnglishCardImageStyle(card as EnglishCard);
export const getInventoryRarityLabel = (id: string, rarity: string) => isInventoryMerchandise(id) ? rarity : getEnglishRarityLabel(id, rarity);
const merchandiseInventorySets = merchandiseSets.map(set => ({ id: set.id, setId: set.id, name: set.title, folder: set.id, prefix: "", family: "merch" as const, promotional: false, rarities: set.items.reduce((counts: Record<string, number>, item) => ({ ...counts, [item.series]: (counts[item.series] ?? 0) + 1 }), {}), title: set.title, setName: "", slug: set.id, imageUrl: set.thumbnail, totalCards: set.items.length }));
export const normalizeInventorySetId = (id: string) => getISOSetId(setAliases[String(id).trim()] ?? String(id).trim());
export const inventoryCollections = [...englishSets.map(set => ({ ...set, ...presentation[set.id], title: presentation[set.id]?.title ?? set.name, setName: presentation[set.id]?.setName ?? "", slug: presentation[set.id]?.slug ?? set.folder, imageUrl: presentation[set.id]?.imageUrl ?? getEnglishCards(set.id)[0]?.front ?? "", totalCards: getEnglishCards(set.id).length })), ...merchandiseInventorySets];
export const resolveInventorySet = (value = "") => merchandiseInventorySets.find(set => set.id === value || set.slug === value) ?? getEnglishSet(inventoryCollections.find(set => set.slug === value)?.id ?? normalizeInventorySetId(value));
export const inventoryStorageSetId = (id: string) => isInventoryMerchandise(id) ? ENGLISH_MERCHANDISE_SET_ID : normalizeInventorySetId(id) === "SD" ? "friendshipsbegin" : normalizeInventorySetId(id);
export const inventorySetAliases = (id: string) => {
    const canonical = normalizeInventorySetId(id);
    if (isInventoryMerchandise(canonical)) return [ENGLISH_MERCHANDISE_SET_ID];
    return [...new Set([canonical, inventoryStorageSetId(canonical), ...Object.keys(setAliases).filter(alias => setAliases[alias] === canonical), ...inventoryCollections.filter(set => set.id === canonical).map(set => set.slug)])];
};
export const buildInventoryProgress = (rows: InventoryProgressRow[]) => {
    const progress: Record<string, Record<string, boolean>> = {};
    for (const row of rows) {
        const setId = normalizeInventorySetId(row.set_id);
        if (!getEnglishSet(setId) && !isInventoryMerchandise(setId))
            continue;
        for (const [key, value] of Object.entries(row.progress ?? {})) {
            if (!isEnglishCardOwned(value))
                continue;
            const card = getInventoryCard(setId, key);
            if (card)
                (progress[card.merchandiseSetId ?? setId] ??= {})[card.stateKey] = true;
        }
    }
    return progress;
};
export const isInventoryDeckComplete = (progress: Record<string, boolean>, code: string) => {
    const cards = getEnglishStarterDeckCards(code);
    return cards.length > 0 && cards.every(card => progress[card.stateKey] === true);
};
export const getInventoryOwnedCards = (id: string, progress: Record<string, boolean>): InventoryCard[] => (isInventoryMerchandise(id) ? merchandiseSets.filter(set => id === ENGLISH_MERCHANDISE_SET_ID || set.id === id).flatMap(set => set.items.map(item => getInventoryCard(set.id, item.key)!)) : getEnglishCards(id)).filter(card => progress[card.stateKey] === true);
export const buildInventoryRecordMap = <T extends InventoryTarget>(rows: T[], id: string): Record<string, T> => {
    const canonical = normalizeInventorySetId(id);
    const records: Record<string, T> = {};
    for (const row of rows) {
        if (isInventoryMerchandise(canonical) ? inventoryStorageSetId(row.set_id) !== ENGLISH_MERCHANDISE_SET_ID : normalizeInventorySetId(row.set_id) !== canonical)
            continue;
        const card = getInventoryCard(canonical, row.card_key);
        const key = card?.isoEligible ? card.key : canonical === "SD" && englishStarterDecks.some(deck => deck.code === row.card_key) ? row.card_key : undefined;
        if (!key)
            continue;
        const old = records[key];
        const score = (item: InventoryTarget) => Number(item.set_id === inventoryStorageSetId(canonical)) * 2 + Number(item.card_key === key);
        if (!old || score(row) > score(old))
            records[key] = row;
    }
    return records;
};
export const getInventoryWriteTarget = (id: string, key: string, saved?: InventoryTarget): InventoryTarget => saved ? { set_id: saved.set_id, card_key: saved.card_key } : { set_id: inventoryStorageSetId(id), card_key: getInventoryCard(normalizeInventorySetId(id), key)?.key ?? key };
export const getInventoryTradeSetIds = (rows: InventoryListingRow[]) => [...new Set(rows.filter(row => (row.is_for_trade || row.is_for_sale) && getInventoryCard(normalizeInventorySetId(row.set_id), row.card_key)?.isoEligible).map(row => getInventoryCardSetId(row.set_id, row.card_key)))];
export async function fetchInventoryProgress(userId: string): Promise<InventoryProgressRow[]> {
    const rows: InventoryProgressRow[] = [];
    for (let offset = 0;; offset += 500) {
        const { data, error } = await supabase.from("collection_progress").select("set_id, progress").eq("user_id", userId).order("set_id").range(offset, offset + 499);
        if (error) throw error;
        rows.push(...((data ?? []) as InventoryProgressRow[]).filter(row => row.set_id !== ENGLISH_MERCHANDISE_SET_ID));
        if (!data || data.length < 500) break;
    }
    const { data, error } = await supabase.from("collection_progress_raw").select("set_id, progress").eq("user_id", userId).eq("set_id", ENGLISH_MERCHANDISE_SET_ID);
    if (error) throw error;
    return [...rows, ...((data ?? []) as InventoryProgressRow[])];
}
export async function fetchInventoryListings(userId: string, setId?: string): Promise<InventoryListingRow[]> {
    const rows: InventoryListingRow[] = [];
    for (let offset = 0;; offset += 500) {
        let query = supabase.from("card_market_listings").select("set_id, card_key, is_for_trade, is_for_sale, asking_price, trade_quantity, sale_quantity").eq("user_id", userId);
        if (setId)
            query = query.in("set_id", inventorySetAliases(setId));
        const { data, error } = await query.order("set_id").order("card_key").range(offset, offset + 499);
        if (error)
            throw error;
        rows.push(...(data ?? []) as InventoryListingRow[]);
        if (!data || data.length < 500)
            return rows;
    }
}
export async function fetchInventoryQuantities(userId: string, setId: string): Promise<InventoryQuantityRow[]> {
    const rows: InventoryQuantityRow[] = [];
    for (let offset = 0;; offset += 500) {
        const { data, error } = await supabase.from("card_quantity").select("set_id, card_key, quantity").eq("user_id", userId).in("set_id", inventorySetAliases(setId)).order("set_id").order("card_key").range(offset, offset + 499);
        if (error)
            throw error;
        rows.push(...(data ?? []) as InventoryQuantityRow[]);
        if (!data || data.length < 500)
            return rows;
    }
}
