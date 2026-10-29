import { ISOCardCaption, isoGridClass } from "@/components/iso/ISOShared";
import { getISOCards, resolveISOCard, isISOSetHidden, buildOwnedISOIdentities, buildISOStatusMap, normalizeEnglishSetId, isoSets, isoCardIdentity, isoActionKey, getWishlistIdentity, type ISOProgressRow, type ISOStatusRow } from "./catalog-adapter";
import ISOCardImage from "./catalog-image";
import ISOChecking from "./iso-checking";
export type FullISOCard = {
    set_id: string;
    card_key: string;
};
export type FullISOProgressRow = ISOProgressRow;
export type FullISOStatusRow = ISOStatusRow;
export const buildFullISOCards = (rows: FullISOProgressRow[], hiddenSets: string[], statuses: FullISOStatusRow[]): FullISOCard[] => {
    const hidden = new Set(hiddenSets.map(normalizeEnglishSetId)), owned = buildOwnedISOIdentities(rows), active = buildISOStatusMap(statuses);
    return isoSets.filter(set => !isISOSetHidden(set.id, [...hidden])).flatMap(set => getISOCards(set.id).filter(card => !owned.has(isoCardIdentity(card)) && !active.has(isoCardIdentity(card))).map(card => ({ set_id: card.setId, card_key: card.key })));
};
type FullISOProps = {
    cards: FullISOCard[];
    userId: string;
    wishlist: Set<string>;
    toggleWishlist: (setId: string, cardKey: string) => Promise<void>;
};
export default function FullISO({ cards, userId, wishlist, toggleWishlist }: FullISOProps) {
    return <section className="min-w-0"><div className="mb-4 flex items-center justify-between gap-3"><h1 className="text-xl font-semibold">Full ISO</h1><span className="text-sm text-zinc-500 dark:text-zinc-400">{cards.length} {cards.some(card => resolveISOCard(card.set_id, card.card_key)?.family === "merch") ? (cards.length === 1 ? "item" : "items") : (cards.length === 1 ? "card" : "cards")}</span></div>{cards.length === 0 ? <p className="py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">No cards remaining in your ISO.</p> : <div className={isoGridClass}>{cards.map(card => {
                const entry = resolveISOCard(card.set_id, card.card_key);
                if (!entry?.isoEligible)
                    return null;
                const key = isoActionKey(entry);
                return <article key={`${card.set_id}:${card.card_key}`} className={`min-w-0 flex flex-col ${entry.wide ? "col-span-2" : ""}`}><ISOChecking className="!block leading-none" contentClassName="!rounded-none" userId={userId} setId={card.set_id} cardKey={key} initialStatus={null} isWishlisted={wishlist.has(getWishlistIdentity(card.set_id, key))} toggleWishlist={toggleWishlist}><div className={`relative overflow-hidden ${entry.square ? "aspect-square" : entry.wide ? "aspect-[10/7]" : "aspect-[5/7]"}`} style={{ borderRadius: "4% / 2.857%" }}><ISOCardImage card={entry}/></div></ISOChecking><ISOCardCaption code={entry.code} setName={entry.setName}/></article>;
            })}</div>}</section>;
}
