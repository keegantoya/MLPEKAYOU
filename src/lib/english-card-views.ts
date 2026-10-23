import { merchandiseSets, ENGLISH_MERCHANDISE_SET_ID, isMerchandiseOwned } from "./english-merchandise-catalog";
import { CARD_IMAGE_WORKER_URL } from "@/lib/card-images";
import { englishCards, englishSets, getEnglishCard, getEnglishCards, getEnglishSet, getEnglishCardImageStyle, getEnglishCardStamp, getEnglishRarityLabel, getISOSetId, isEnglishCardOwned, type EnglishCard } from "@/lib/english-card-catalog";
import type { CSSProperties } from "react";
export type EnglishCardReference = {
    set_id: string | number;
    card_key: string;
};
export type EnglishProgressRow = {
    set_id: string | number;
    progress?: Record<string, unknown> | null;
};
const aliases: Record<string, string> = { FB: "SD", TCG_PROMOS: "tcgpromos", fantasywonderland: "FW", BP01: "FW" };
export const englishViewSetId = (id: string | number) => getISOSetId(aliases[String(id)] ?? String(id));
export const englishViewCard = (card: EnglishCardReference | null | undefined) => {
    if (!card)
        return undefined;
    const id = englishViewSetId(card.set_id);
    let key = String(card.card_key);
    for (const prefix of [`${card.set_id}:`, `${card.set_id}-`, `${id}:`, `${id}-`]) {
        if (key.startsWith(prefix)) {
            key = key.slice(prefix.length);
            break;
        }
    }
    return getEnglishCard(id, key);
};
export const englishViewEligible = (card: EnglishCardReference) => englishViewCard(card)?.isoEligible === true;
export const englishViewName = (id: string | number) => getEnglishSet(englishViewSetId(id))?.name ?? String(id);
export const englishViewCode = (card: EnglishCardReference) => englishViewCard(card)?.code ?? card.card_key;
export const englishViewImage = (card: EnglishCardReference | null | undefined) => englishViewCard(card)?.front ?? "";
export const englishViewStyle = (card: EnglishCardReference, options: {
    side?: "front" | "back";
    inspect?: boolean;
} = {}): CSSProperties => {
    const resolved = englishViewCard(card);
    return resolved ? { ...getEnglishCardImageStyle(resolved, options), backgroundColor: "transparent", backgroundImage: "none" } : {};
};
export const englishViewWide = (card: EnglishCardReference | null | undefined) => englishViewCard(card)?.wide === true;
export const englishViewRarity = (card: EnglishCardReference) => englishViewCard(card)?.rarity ?? "";
export const englishViewRarityOrder = (id: string | number) => [...new Set(getEnglishCards(englishViewSetId(id)).map(card => card.rarity))];
export const englishViewRarityLabel = (id: string | number, rarity: string) => getEnglishRarityLabel(englishViewSetId(id), rarity);
export const englishViewSetOrder = () => englishSets.map(set => set.id);
const englishViewRanks = new Map(englishCards.map((card, index) => [card, index]));
export const compareEnglishViewCards = (a: EnglishCardReference, b: EnglishCardReference) => {
    const left = englishViewCard(a), right = englishViewCard(b);
    if (!left || !right)
        return Number(!left) - Number(!right) || String(a.card_key).localeCompare(String(b.card_key), "en", { numeric: true });
    return (englishViewRanks.get(left) ?? englishCards.length) - (englishViewRanks.get(right) ?? englishCards.length);
};
export const ownedEnglishViewCards = (rows: EnglishProgressRow[]): EnglishCard[] => {
    const owned = new Set<EnglishCard>();
    for (const row of rows)
        for (const [key, value] of Object.entries(row.progress ?? {})) {
            if (!isEnglishCardOwned(value))
                continue;
            const card = englishViewCard({ set_id: row.set_id, card_key: key });
            if (card?.isoEligible)
                owned.add(card);
        }
    return englishCards.filter(card => owned.has(card));
};
export const masteredEnglishViewSets = (rows: EnglishProgressRow[]) => {
    const owned = new Set(ownedEnglishViewCards(rows));
    return englishSets.filter(set => !set.promotional).filter(set => {
        const cards = getEnglishCards(set.id);
        return cards.length > 0 && cards.every(card => owned.has(card));
    }).length;
};
export const missingEnglishViewCards = (rows: EnglishProgressRow[], statuses: {
    card_key: string;
    status: string;
}[], hidden: string[] = []) => {
    const owned = new Set(ownedEnglishViewCards(rows));
    const active = new Set<EnglishCard>();
    for (const row of statuses) {
        if (!["purchase_in_progress", "trade_in_progress"].includes(row.status))
            continue;
        let resolved: EnglishCard | undefined;
        for (const set of englishSets) {
            const prefixes = [...new Set([set.id, ...Object.keys(aliases).filter(alias => aliases[alias] === set.id), ...(set.id === "SD" ? ["friendshipsbegin", "friendships-begin"] : [])])];
            for (const id of prefixes)
                for (const separator of ["-", ":"]) {
                    if (row.card_key.startsWith(`${id}${separator}`))
                        resolved ??= englishViewCard({ set_id: set.id, card_key: row.card_key.slice(id.length + 1) });
                }
        }
        if (!resolved && row.card_key.startsWith("BONUS-"))
            resolved = englishViewCard({ set_id: "SD", card_key: row.card_key });
        if (!resolved && /^(?:BP01|SD01)/.test(row.card_key))
            resolved = englishViewCard({ set_id: row.card_key.startsWith("BP01") ? "FW" : "SD", card_key: row.card_key });
        if (resolved?.isoEligible)
            active.add(resolved);
    }
    const hiddenIds = new Set(hidden.map(englishViewSetId));
    return englishCards.filter(card => !owned.has(card) && !active.has(card) && !hiddenIds.has(card.setId) && !(card.setId === "SD" && (hidden.includes("SD_STARTERS") || hidden.includes("SD_BONUS"))));
};
export const isEnglishViewHit = (card: EnglishCard) => card.family === "moon" ? ["SC", "SZR", "SHINING ZR"].includes(card.rarity) || card.setId === "13" && card.rarity === "ZR" : card.family === "star" ? ["BP", "SAR"].includes(card.rarity) : card.family === "fun" ? ["CR", "SCR"].includes(card.rarity) : card.family === "rainbow" ? card.rarity === "XR" : card.family === "tcg" && card.rarity === "PRR";
export const englishViewDetails = (reference: EnglishCardReference) => {
    const card = englishViewCard(reference);
    const stamp = card ? getEnglishCardStamp(card) : undefined;
    return { rarity: card?.rarity ?? "", number: card?.number ?? 0, back: card?.back ?? "", stamp: stamp?.silver ?? false, sideways: stamp?.sideways ?? false, wide: card?.wide ?? false, stampCenter: stamp?.centered ?? false, code: englishViewCode(reference), name: englishViewName(reference.set_id) };
};
export async function readEnglishViewRows<T>(page: (from: number, to: number) => PromiseLike<{
    data: T[] | null;
    error: unknown;
}>): Promise<T[]> {
    const rows: T[] = [];
    for (let from = 0;; from += 500) {
        const { data, error } = await page(from, from + 499);
        if (error)
            throw error;
        rows.push(...(data ?? []));
        if (!data || data.length < 500)
            return rows;
    }
}
export type ProfileViewCard = Omit<EnglishCard, "family"> & { family: EnglishCard["family"] | "merch"; merchandiseSetId?: string; square?: boolean; level?: string };
const profileMerchandiseCards: ProfileViewCard[] = merchandiseSets.flatMap(set => set.items.map(item => ({ setId: ENGLISH_MERCHANDISE_SET_ID, setName: set.title, key: item.key, stateKey: item.key, identity: `${ENGLISH_MERCHANDISE_SET_ID}:${item.key}`, family: "merch" as const, rarity: item.series, number: item.number, code: `${item.series} - Item ${item.number}`, checklistCode: `${item.series} - Item ${item.number}`, image: item.image, front: item.image, back: item.image, isoEligible: true, original: true, wide: false, square: set.aspect === "square", merchandiseSetId: set.id, level: item.level })));
const profileMerchandiseIndex = new Map(profileMerchandiseCards.map(card => [card.key, card]));
export const profileViewCard = (reference: EnglishCardReference | null | undefined): ProfileViewCard | undefined => {
    if (!reference) return undefined;
    const id = String(reference.set_id);
    if (id !== ENGLISH_MERCHANDISE_SET_ID && !merchandiseSets.some(set => set.id === id)) return englishViewCard(reference);
    const key = String(reference.card_key).replace(new RegExp(`^${id}[:-]`), "").replace(/-0*(\d+)$/, "-$1");
    const card = profileMerchandiseIndex.get(key);
    return card && (id === ENGLISH_MERCHANDISE_SET_ID || card.merchandiseSetId === id) ? card : undefined;
};
export const profileViewEligible = (reference: EnglishCardReference) => profileViewCard(reference)?.isoEligible === true;
export const profileViewName = (id: string | number) => String(id) === ENGLISH_MERCHANDISE_SET_ID ? "Other" : merchandiseSets.find(set => set.id === String(id))?.title ?? englishViewName(id);
export const profileViewCode = (reference: EnglishCardReference) => profileViewCard(reference)?.code ?? reference.card_key;
export const profileViewImage = (reference: EnglishCardReference | null | undefined) => {
    const card = profileViewCard(reference);
    if (!card) return "";
    if (card.family !== "merch") return card.front;
    const url = new URL(card.front.split("/").map(encodeURIComponent).join("/"), `${CARD_IMAGE_WORKER_URL.replace(/\/$/, "")}/`);
    url.searchParams.set("publicProfile", "1");
    return url.href;
};
export const profileViewStyle = (reference: EnglishCardReference, options: { side?: "front" | "back"; inspect?: boolean } = {}): CSSProperties => profileViewCard(reference)?.family === "merch" ? { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", transform: "none", backgroundColor: "transparent", backgroundImage: "none" } : englishViewStyle(reference, options);
export const profileViewWide = (reference: EnglishCardReference | null | undefined) => profileViewCard(reference)?.wide === true;
export const profileViewSquare = (reference: EnglishCardReference | null | undefined) => profileViewCard(reference)?.square === true;
export const profileViewGroup = (reference: EnglishCardReference) => profileViewCard(reference)?.merchandiseSetId ?? englishViewSetId(reference.set_id);
export const profileViewRarity = (reference: EnglishCardReference) => profileViewCard(reference)?.rarity ?? "";
export const profileViewRarityOrder = (id: string | number) => String(id) === ENGLISH_MERCHANDISE_SET_ID || merchandiseSets.some(set => set.id === String(id)) ? [...new Set(profileMerchandiseCards.filter(card => String(id) === ENGLISH_MERCHANDISE_SET_ID || card.merchandiseSetId === String(id)).map(card => card.rarity))] : englishViewRarityOrder(id);
export const profileViewRarityLabel = (id: string | number, rarity: string) => String(id) === ENGLISH_MERCHANDISE_SET_ID || merchandiseSets.some(set => set.id === String(id)) ? rarity : englishViewRarityLabel(id, rarity);
export const profileViewSetOrder = () => [...englishViewSetOrder(), ENGLISH_MERCHANDISE_SET_ID, ...merchandiseSets.map(set => set.id)];
export const compareProfileViewCards = (a: EnglishCardReference, b: EnglishCardReference) => {
    const left = profileViewCard(a), right = profileViewCard(b);
    if (left?.family !== "merch" && right?.family !== "merch") return compareEnglishViewCards(a, b);
    if (left?.family !== "merch") return -1;
    if (right?.family !== "merch") return 1;
    return profileMerchandiseCards.indexOf(left) - profileMerchandiseCards.indexOf(right);
};
export const isProfileMerchandiseHidden = (reference: EnglishCardReference, hidden: readonly string[]) => {
    const card = profileViewCard(reference);
    return card?.family === "merch" && (hidden.includes(ENGLISH_MERCHANDISE_SET_ID) || hidden.includes(card.merchandiseSetId!));
};
export const missingProfileViewCards = (rows: EnglishProgressRow[], statuses: { card_key: string; status: string }[], hidden: string[] = []): ProfileViewCard[] => {
    const owned = new Set<string>();
    for (const row of rows) for (const [key, value] of Object.entries(row.progress ?? {})) {
        if (!isMerchandiseOwned(value)) continue;
        const card = profileViewCard({ set_id: row.set_id, card_key: key });
        if (card?.family === "merch") owned.add(card.identity);
    }
    const active = new Set<string>();
    for (const row of statuses) {
        if (row.status !== "purchase_in_progress" && row.status !== "trade_in_progress") continue;
        for (const id of [ENGLISH_MERCHANDISE_SET_ID, ...merchandiseSets.map(set => set.id)]) for (const separator of ["-", ":"]) {
            const prefix = `${id}${separator}`;
            if (!row.card_key.startsWith(prefix)) continue;
            const card = profileViewCard({ set_id: id, card_key: row.card_key.slice(prefix.length) });
            if (card) active.add(card.identity);
        }
    }
    return [...missingEnglishViewCards(rows, statuses, hidden), ...profileMerchandiseCards.filter(card => !owned.has(card.identity) && !active.has(card.identity) && !isProfileMerchandiseHidden({ set_id: card.setId, card_key: card.key }, hidden))];
};
