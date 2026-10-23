import { englishSets, getEnglishCards, getEnglishCard, getISOSetId, type EnglishCard, type EnglishFamily } from "@/lib/english-card-catalog";
import { supabase } from "@/lib/supabase";
import { moonCharacterMap } from "./Card Characters/card-characters-moon";
import { funCharacterMap } from "./Card Characters/card-characters-fun";
import { rainbowCharacterMap } from "./Card Characters/card-characters-rainbow";
import { starCharacterMap } from "./Card Characters/card-characters-star";
import { promoCharacterMap } from "./Card Characters/card-characters-promos";
import { TCGCharacterMap } from "./Card Characters/card-characters-tcg";
export type ISOStatus = "purchase_in_progress" | "trade_in_progress";
export type ISOProgressRow = {
    set_id: string | number;
    progress: Record<string, unknown> | null;
};
export type ISOStatusRow = {
    card_key: string;
    status: string;
};
export const isActiveISOStatus = (value: string): value is ISOStatus => value === "purchase_in_progress" || value === "trade_in_progress";
export const normalizeEnglishSetId = (value: string | number) => getISOSetId(({ FB: "SD", TCG_PROMOS: "tcgpromos" } as Record<string, string>)[String(value)] ?? String(value));
export const resolveISOCard = (setId: string | number, key: string) => { const card = getEnglishCard(normalizeEnglishSetId(setId), key); return card?.isoEligible ? card : undefined; };
export const isoCardIdentity = (card: EnglishCard) => `${card.setId}:${card.key}`;
export const isoActionKey = (card: EnglishCard) => card.setId === "SD" ? card.stateKey : card.key;
const setAliases = (id: string) => id === "SD" ? [id, "friendshipsbegin", "friendships-begin", "FB"] : id === "FW" ? [id, "fantasy-wonderland"] : id === "12" ? [id, "discord"] : id === "14" ? [id, "nightmare-night"] : id === "tcgpromos" ? [id, "TCG_PROMOS"] : [id];
export const isoCards = englishSets.flatMap(set => getEnglishCards(set.id));
export const isoSets = englishSets.filter(set => set.family !== "tcg" && !set.promotional).concat(englishSets.filter(set => set.promotional && set.prefix === "PR"), englishSets.filter(set => set.family === "tcg"), englishSets.filter(set => set.promotional && set.prefix !== "PR"));
export const getISOSets = (family: EnglishFamily) => isoSets.filter(set => set.family === family);
export const getISOSetLabel = (id: string) => {
    const set = englishSets.find(set => set.id === id);
    if (!set)
        return id;
    if (["moon", "fun", "rainbow", "star"].includes(set.family)) {
        const label = { moon: "Moon", fun: "Fun", rainbow: "Rainbow", star: "Star" }[set.family as "moon" | "fun" | "rainbow" | "star"];
        return `${label} ${getISOSets(set.family).findIndex(item => item.id === id) + 1}`;
    }
    return set.name === set.name.toUpperCase() ? set.name.toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase()) : set.name;
};
export const getISOStatusKey = (setId: string, key: string) => { const card = resolveISOCard(setId, key); const id = card?.setId ?? normalizeEnglishSetId(setId); const value = card ? isoActionKey(card) : key; return id === "SD" || id === "FW" ? value : `${id}-${value}`; };
export const getISOCardKeyVariants = (card: EnglishCard) => {
    const keys = new Set([card.key, card.stateKey]);
    if (card.family !== "tcg") {
        for (const key of [...keys])
            for (const width of [1, 2, 3]) {
                const padded = key.replace(/-(\d+)$/, (_, n) => `-${String(Number(n)).padStart(width, "0")}`);
                keys.add(padded);
                if (padded.startsWith("SHINING ZR-"))
                    keys.add(padded.replace(/^SHINING ZR-/, "SZR-"));
                if (padded.startsWith("SZR-"))
                    keys.add(padded.replace(/^SZR-/, "SHINING ZR-"));
            }
    }
    if (card.setId === "14" && /^BP03-ER0[12]-[ABC]$/.test(card.key))
        keys.add(card.key + card.key.slice(-1));
    return [...keys];
};
export const getISOStatusKeyVariants = (setId: string, key: string) => {
    const card = resolveISOCard(setId, key);
    if (!card)
        return [getISOStatusKey(setId, key)];
    const variants = new Set([getISOStatusKey(card.setId, card.key)]);
    for (const alias of setAliases(card.setId))
        for (const value of getISOCardKeyVariants(card)) {
            variants.add(`${alias}-${value}`);
            variants.add(`${alias}:${value}`);
        }
    if (card.setId === "SD" || card.setId === "FW")
        for (const value of getISOCardKeyVariants(card))
            variants.add(value);
    return [...variants];
};
const statusIndex = new Map<string, EnglishCard>();
for (const card of isoCards)
    for (const key of getISOStatusKeyVariants(card.setId, card.key))
        statusIndex.set(key, card);
export const parseISOStatusKey = (key: string) => {
    const direct = statusIndex.get(key);
    if (direct)
        return direct;
    for (const set of [...isoSets].sort((a, b) => b.id.length - a.id.length))
        for (const alias of setAliases(set.id))
            for (const prefix of [`${alias}:`, `${alias}-`])
                if (key.startsWith(prefix)) {
                    const card = resolveISOCard(set.id, key.slice(prefix.length));
                    if (card)
                        return card;
                }
    return undefined;
};
export const buildOwnedISOIdentities = (rows: ISOProgressRow[]) => {
    const owned = new Set<string>();
    for (const row of rows)
        for (const [key, value] of Object.entries(row.progress ?? {}))
            if (value === true || (typeof value === "object" && value !== null && "owned" in value && value.owned === true)) {
                const card = resolveISOCard(row.set_id, key);
                if (card)
                    owned.add(isoCardIdentity(card));
            }
    return owned;
};
export const buildISOStatusMap = (rows: ISOStatusRow[]) => {
    const active = new Map<string, ISOStatus>();
    for (const row of rows) {
        if (!isActiveISOStatus(row.status))
            continue;
        const card = parseISOStatusKey(row.card_key);
        if (card)
            active.set(isoCardIdentity(card), row.status);
    }
    return active;
};
const maps: Partial<Record<EnglishFamily, Record<string, string[]>>> = { moon: moonCharacterMap, fun: funCharacterMap, rainbow: rainbowCharacterMap, star: starCharacterMap, promos: promoCharacterMap, tcg: TCGCharacterMap };
export const getISOCharacters = (card: EnglishCard): string[] => {
    const candidates = new Set([card.key, `${card.setId}-${card.key}`, `${card.setId}-${card.rarity}-${card.number}`]);
    for (const key of getISOCardKeyVariants(card))
        candidates.add(`${card.setId}-${key.replace(/-(\d+)$/, (_, n) => `-${Number(n)}`)}`);
    if (card.family === "tcg") {
        const saved = card.key.match(/^(?:P?)(BP\d{2}|SD\d{2})/)?.[1];
        const printed = card.code.replace(/^\u203b/, "").match(/^(BP\d{2}|SD\d{2})/)?.[1];
        if (saved && printed && saved !== printed)
            candidates.delete(card.key);
    }
    if (card.setId === "SD" && card.rarity === "PER") {
        candidates.delete(`SD-PER-${card.number}`);
        candidates.add(`SD-PER-${Number(card.key.slice(-2))}`);
    }
    if (card.setId === "FW" && card.rarity === "ER")
        candidates.add(`FW-ER-${Number(card.key.slice(-2))}`);
    return [...new Set([...candidates].flatMap(key => maps[card.family]?.[key] ?? []))];
};
const normalizeCode = (value: string) => value.toUpperCase().replace(/[\s-]/g, "").replace(/^\u203b/, "");
export const matchesISOCard = (card: EnglishCard, codeQuery: string, characterQuery: string) => {
    const code = normalizeCode(codeQuery);
    const character = characterQuery.trim().toLowerCase();
    return (!code || [card.code, card.checklistCode, card.key].some(value => normalizeCode(value).startsWith(code))) && (!character || getISOCharacters(card).some(name => name.toLowerCase().includes(character)));
};
export const getWishlistIdentity = (setId: string, key: string) => { const card = resolveISOCard(setId, key); return card ? `${card.setId}:${isoActionKey(card)}` : `${setId}:${key}`.replace(/-(\d+)$/, (_, n) => `-${Number(n)}`); };
export const getWishlistVariants = (setId: string, key: string) => { const card = resolveISOCard(setId, key); return card ? [...new Set(setAliases(card.setId).flatMap(alias => getISOCardKeyVariants(card).map(value => `${alias}:${value}`)))] : [`${setId}:${key}`]; };
export const parseEnglishWishlist = (value: string) => { const index = value.indexOf(":"); return index < 0 ? undefined : resolveISOCard(value.slice(0, index), value.slice(index + 1)); };
export const fetchISOStatuses = async (userId: string) => {
    const rows: ISOStatusRow[] = [];
    for (let start = 0;; start += 500) {
        const { data, error } = await supabase.from("iso_status").select("card_key,status").eq("user_id", userId).order("card_key").range(start, start + 499);
        if (error)
            return { data: null, error };
        rows.push(...(data ?? []));
        if ((data?.length ?? 0) < 500)
            return { data: rows, error: null };
    }
};
export const fetchEnglishWishlist = async (userId: string) => {
    const rows: {
        card_key: string;
    }[] = [];
    for (let start = 0;; start += 500) {
        const { data, error } = await supabase.from("wishlists").select("card_key").eq("user_id", userId).order("card_key").range(start, start + 499);
        if (error)
            return { data: null, error };
        rows.push(...(data ?? []));
        if ((data?.length ?? 0) < 500)
            return { data: rows, error: null };
    }
};
export type StoredWishlistCard = {
    set_id: string;
    card_key: string;
    storedKeys: string[];
};
export const buildEnglishWishlistCards = (rows: {
    card_key: string;
}[]): StoredWishlistCard[] => {
    const found = new Map<string, StoredWishlistCard>();
    for (const row of rows) {
        const card = parseEnglishWishlist(row.card_key);
        if (!card)
            continue;
        const id = isoCardIdentity(card);
        const saved = found.get(id);
        if (saved)
            saved.storedKeys.push(row.card_key);
        else
            found.set(id, { set_id: card.setId, card_key: isoActionKey(card), storedKeys: [row.card_key] });
    }
    return [...found.values()];
};
export const buildInProgressCards = (rows: ISOStatusRow[]) => {
    const found = new Map<string, {
        set_id: string;
        card_key: string;
        status: ISOStatus;
    }>();
    for (const row of rows) {
        if (!isActiveISOStatus(row.status))
            continue;
        const card = parseISOStatusKey(row.card_key);
        if (card)
            found.set(isoCardIdentity(card), { set_id: card.setId, card_key: card.key, status: row.status });
    }
    return [...found.values()];
};
