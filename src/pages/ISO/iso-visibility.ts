import { isEnglishCardOwned } from "@/lib/english-card-catalog";
import { getISOCards, buildOwnedISOIdentities, isoSets, isoCardIdentity, normalizeEnglishSetId, type ISOProgressRow } from "./catalog-adapter";
export const isISOOwned = isEnglishCardOwned;
export const normalizeISOKey = (setId: string, key: string): string => {
    const id = normalizeEnglishSetId(setId);
    if (id === "SD")
        return key.replace(/^BONUS-/, "");
    if (id === "14")
        return key.replace(/^(BP03-ER0[12])-([ABC])\2$/, "$1-$2");
    const set = isoSets.find(set => set.id === id);
    if (!set || set.family === "tcg" || set.prefix === "RR")
        return key;
    const stripped = (key.startsWith(id + "-") || key.startsWith(id + ":")) ? key.slice(id.length + 1) : key;
    return stripped.replace(/^SHINING ZR-/, "SZR-").replace(/-0*(\d+)$/, (_, n) => `-${Number(n)}`);
};
export const ISO_EXPECTED_KEYS: Record<string, string[]> = Object.fromEntries(isoSets.map(set => [set.id, getISOCards(set.id).map(card => card.key)]));
export const getCompletedISOSetIds = (rows: ISOProgressRow[]): string[] => { const owned = buildOwnedISOIdentities(rows); return isoSets.filter(set => { const cards = getISOCards(set.id); return cards.length > 0 && cards.every(card => owned.has(isoCardIdentity(card))); }).map(set => set.id); };
