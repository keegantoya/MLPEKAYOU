import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getEnglishCards, getEnglishRarityLabel, type EnglishFamily } from "@/lib/english-card-catalog";
import { buildOwnedISOIdentities, buildISOStatusMap, fetchISOStatuses, getISOSets, getISOSetLabel, getWishlistIdentity, isoActionKey, isoCardIdentity, matchesISOCard, type ISOStatus } from "./catalog-adapter";
import ISOCardImage from "./catalog-image";
import ISOChecking from "./iso-checking";
import { useWishlist } from "./wishlist-in-iso";
export type ISOFamilyProps = {
    userId?: string;
    cardCodeSearch: string;
    characterSearch: string;
    searchAllCards: boolean;
    hiddenSets: string[];
    wishlistMode: boolean;
};
export default function ISOFamily({ family, userId: publicUserId, cardCodeSearch, characterSearch, searchAllCards, hiddenSets, wishlistMode }: ISOFamilyProps & {
    family: EnglishFamily;
}) {
    const sets = getISOSets(family);
    const [owned, setOwned] = useState<Set<string>>(new Set());
    const [inProgress, setInProgress] = useState<Map<string, ISOStatus>>(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [userId, setUserId] = useState("");
    const [selectedSet, setSelectedSet] = useState<string | null>(null);
    const [selectedRarities, setSelectedRarities] = useState<Record<string, string>>({});
    const { wishlist, toggleWishlist } = useWishlist();
    useEffect(() => {
        let disposed = false, requestId = 0, activeUserId = "";
        const load = async () => {
            const request = ++requestId;
            try {
                const session = publicUserId ? null : (await supabase.auth.getSession()).data.session;
                const id = publicUserId ?? session?.user.id;
                if (disposed || request !== requestId)
                    return;
                if (!id) {
                    setOwned(new Set());
                    setInProgress(new Map());
                    setUserId("");
                    setLoading(false);
                    return;
                }
                activeUserId = id;
                setUserId(id);
                const [{ data: rows, error: progressError }, { data: statuses, error: statusError }] = await Promise.all([supabase.from("collection_progress_raw").select("set_id,progress").eq("user_id", id), fetchISOStatuses(id)]);
                if (disposed || request !== requestId)
                    return;
                if (progressError || statusError)
                    throw progressError ?? statusError;
                setOwned(buildOwnedISOIdentities(rows ?? []));
                setInProgress(buildISOStatusMap(statuses ?? []));
                setError("");
            }
            catch (cause) {
                if (!disposed && request === requestId)
                    setError(cause instanceof Error ? cause.message : "Your ISO could not be loaded.");
            }
            finally {
                if (!disposed && request === requestId)
                    setLoading(false);
            }
        };
        const refresh = () => { void load(); };
        const onChange = (event: Event) => {
            const detail = (event as CustomEvent<{
                userId: string;
            }>).detail;
            if (detail?.userId === activeUserId)
                refresh();
        };
        window.addEventListener("focus", refresh);
        window.addEventListener("iso-status-changed", onChange);
        window.addEventListener("iso-collection-changed", onChange);
        void load();
        return () => { disposed = true; requestId++; window.removeEventListener("focus", refresh); window.removeEventListener("iso-status-changed", onChange); window.removeEventListener("iso-collection-changed", onChange); };
    }, [family, publicUserId]);
    const searching = !!(cardCodeSearch.trim() || characterSearch.trim());
    const isMissing = (identity: string) => !owned.has(identity) && !inProgress.has(identity);
    const selectableSets = sets.filter(set => !hiddenSets.includes(set.id) && (searchAllCards || wishlistMode || getEnglishCards(set.id).some(card => isMissing(isoCardIdentity(card)))));
    const visibleSetId = selectedSet && selectableSets.some(set => set.id === selectedSet) ? selectedSet : null;
    if (loading)
        return <div className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">Loading...</div>;
    if (error)
        return <p role="alert" className="py-8 text-center text-sm text-red-600 dark:text-red-400">{error}</p>;
    return <div className="space-y-8">
    {!searching && selectableSets.length > 0 && <div className="sticky top-0 z-20"><div className="flex gap-2 overflow-x-auto rounded-2xl border border-black/10 bg-white/95 p-2 shadow-sm backdrop-blur dark:border-white/10 dark:bg-[#17191a]/95 md:flex-wrap md:overflow-visible">{selectableSets.map(set => <button key={set.id} type="button" onClick={() => setSelectedSet(set.id)} className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition ${visibleSetId === set.id ? "bg-[#FFD54A] text-zinc-900" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-white/[0.06] dark:text-zinc-300 dark:hover:bg-white/[0.1]"}`}>{getISOSetLabel(set.id)}</button>)}</div></div>}
        {sets.filter(set => !hiddenSets.includes(set.id)).filter(set => searching || ((searchAllCards || wishlistMode || selectableSets.some(item => item.id === set.id)) && (!visibleSetId || visibleSetId === set.id))).map(set => {
            const missing = getEnglishCards(set.id).filter(card => matchesISOCard(card, cardCodeSearch, characterSearch) && (searchAllCards || wishlistMode || isMissing(isoCardIdentity(card))));
            if (!missing.length)
                return null;
            const availableRarities = Object.keys(set.rarities).filter(rarity => missing.some(card => card.rarity === rarity));
            const rarity = availableRarities.includes(selectedRarities[set.id]) ? selectedRarities[set.id] : "all";
            const visibleCards = rarity === "all" ? missing : missing.filter(card => card.rarity === rarity);
            return <section id={`set-${set.id}`} key={set.id} className={`min-w-0 ${searching ? "mt-6" : ""}`}>
            <div className="mb-4 flex items-center justify-between gap-3"><div className="min-w-0"><h2 className="truncate text-base font-semibold">{set.name}</h2><p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{visibleCards.length} {visibleCards.length === 1 ? "card" : "cards"}</p></div>{family !== "promos" && <select value={rarity} onChange={event => setSelectedRarities(current => ({ ...current, [set.id]: event.target.value }))} aria-label={`Filter ${set.name} by rarity`} className="max-w-[150px] rounded-xl border border-black/10 bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-700 outline-none dark:border-white/10 dark:bg-white/[0.05] dark:text-zinc-200"><option value="all">All rarities</option>{availableRarities.map(value => <option key={value} value={value}>{getEnglishRarityLabel(set.id, value)}</option>)}</select>}</div>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-4 md:grid-cols-5 md:gap-3 lg:grid-cols-6 xl:grid-cols-7">{visibleCards.map(card => {
                    const identity = isoCardIdentity(card), actionKey = isoActionKey(card);
                    const wishlisted = wishlist.has(getWishlistIdentity(set.id, actionKey));
                    const content = <div className={searchAllCards ? "" : "cursor-pointer"}><div className={`relative w-full overflow-hidden rounded-[2px] sm:rounded-[6px] ${card.wide ? "aspect-[10/7]" : "aspect-[5/7]"} ${wishlisted ? "ring-4 ring-pink-400 ring-offset-2 ring-offset-white dark:ring-offset-[#17191a]" : ""}`}><ISOCardImage card={card}/></div></div>;
                    return searchAllCards && !wishlistMode ? <div key={card.key} className={card.wide ? "col-span-2" : ""}>{content}</div> : <ISOChecking key={card.key} className={card.wide ? "col-span-2" : ""} userId={userId} setId={set.id} cardKey={actionKey} initialStatus={inProgress.get(identity) ?? null} wishlistMode={wishlistMode} isWishlisted={wishlisted} toggleWishlist={toggleWishlist} onStatusChange={status => setInProgress(previous => {
                            const next = new Map(previous);
                            if (status)
                                next.set(identity, status);
                            else
                                next.delete(identity);
                            return next;
                        })} onComplete={() => setOwned(previous => new Set(previous).add(identity))}>{content}</ISOChecking>;
                })}</div></section>;
        })}</div>;
}
