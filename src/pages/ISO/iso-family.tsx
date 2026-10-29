import { ISOCardCaption, ISOSetSidebar, isoGridClass } from "@/components/iso/ISOShared";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { merchandiseSets } from "@/lib/english-merchandise-catalog";
import { getEnglishRarityLabel } from "@/lib/english-card-catalog";
import { getISOCards, isISOSetHidden, type ISOFamily as ISOFamilyId, buildOwnedISOIdentities, buildISOStatusMap, fetchISOStatuses, getISOSets, getISOSetLabel, getWishlistIdentity, isoActionKey, isoCardIdentity, matchesISOCard, type ISOStatus } from "./catalog-adapter";
import ISOCardImage from "./catalog-image";
import ISOChecking from "./iso-checking";
import { useWishlist } from "./wishlist-in-iso";
const englishSetThumbnails: Record<string, string> = {"1": "/thumbnails/moononesetimage.webp", "5": "/thumbnails/rainbowonesetimage.webp", "7": "/thumbnails/funonesetimage.webp", "2": "/thumbnails/moontwosetimage.webp", "8": "/thumbnails/funtwosetimage.webp", "FW": "/thumbnails/fantasysetimage.webp", "SD": "/thumbnails/friendshipsbeginsetimage.webp", "3": "/thumbnails/moonthreesetimage.webp", "11": "/thumbnails/funthreesetimage.webp", "4": "/thumbnails/staronesetimage.webp", "6": "/thumbnails/rainbowtwosetimage.webp", "12": "/thumbnails/discordsetimage.webp", "14": "/thumbnails/nightmarenightsetimage.webp", "13": "/thumbnails/moonfoursetimage.webp", "hearthswarming-eve": "/thumbnails/hearthswarmingsetimage.png", "9": "/thumbnails/promossetimage.webp", "tcgpromos": "/thumbnails/promossetimage.webp"};
const setNumbers = ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen"];
export type ISOFamilyProps = {
    userId?: string;
    cardCodeSearch: string;
    characterSearch: string;
    searchAllCards: boolean;
    hiddenSets: string[];
    wishlistMode: boolean;
};
export default function ISOFamily({ family, userId: publicUserId, cardCodeSearch, characterSearch, searchAllCards, hiddenSets, wishlistMode }: ISOFamilyProps & {
    family: ISOFamilyId;
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
    const selectableSets = sets.filter(set => !isISOSetHidden(set.id, hiddenSets) && (searchAllCards || wishlistMode || getISOCards(set.id).some(card => isMissing(isoCardIdentity(card)))));
    const visibleSetId = selectedSet && selectableSets.some(set => set.id === selectedSet) ? selectedSet : selectableSets[0]?.id ?? null;
    if (loading)
        return <div className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">Loading...</div>;
    if (error)
        return <p role="alert" className="py-8 text-center text-sm text-red-600 dark:text-red-400">{error}</p>;
    const sidebar = !searching && selectableSets.length > 0;
    return <div className={sidebar ? "iso-set-layout" : "min-w-0 space-y-3"}>
    {sidebar && <ISOSetSidebar label={`${family === "fun" ? "Fun Moments" : family} sets`} activeId={visibleSetId ?? undefined} onSelect={setSelectedSet} items={selectableSets.map(set => ({ id: set.id, name: getISOSetLabel(set.id), label: ["moon", "fun", "rainbow", "star"].includes(family) ? setNumbers[sets.findIndex(item => item.id === set.id)] ?? getISOSetLabel(set.id) : getISOSetLabel(set.id), imageUrl: englishSetThumbnails[set.id] ?? merchandiseSets.find(item => item.id === set.id)?.thumbnail }))} />}
    <div className="iso-set-content space-y-4">
        {sets.filter(set => !isISOSetHidden(set.id, hiddenSets)).filter(set => searching || ((searchAllCards || wishlistMode || selectableSets.some(item => item.id === set.id)) && (!visibleSetId || visibleSetId === set.id))).map(set => {
            const missing = getISOCards(set.id).filter(card => matchesISOCard(card, cardCodeSearch, characterSearch) && (searchAllCards || wishlistMode || isMissing(isoCardIdentity(card))));
            if (!missing.length)
                return null;
            const availableRarities = Object.keys(set.rarities).filter(rarity => missing.some(card => card.rarity === rarity));
            const rarity = availableRarities.includes(selectedRarities[set.id]) ? selectedRarities[set.id] : "all";
            const visibleCards = rarity === "all" ? missing : missing.filter(card => card.rarity === rarity);
            return <section id={`set-${set.id}`} key={set.id} className={`min-w-0 ${searching ? "mt-6" : ""}`}>
            <div className="mb-3 flex items-center justify-between gap-2"><div className="flex min-w-0 flex-wrap items-baseline gap-x-3"><h2 className="text-base font-semibold">{set.name}</h2><p className="text-xs text-zinc-500 dark:text-zinc-400">{visibleCards.length} {family === "merch" ? (visibleCards.length === 1 ? "item" : "items") : (visibleCards.length === 1 ? "card" : "cards")}</p></div>{family !== "promos" && <select value={rarity} onChange={event => setSelectedRarities(current => ({ ...current, [set.id]: event.target.value }))} aria-label={`Filter ${set.name} by ${family === "merch" ? "edition" : "rarity"}`} className="max-w-[150px] min-h-10 rounded-lg border border-black/10 bg-zinc-50 px-2 py-1 text-xs font-semibold text-zinc-700 outline-none dark:border-white/10 dark:bg-white/[0.05] dark:text-zinc-200"><option value="all">{family === "merch" ? "All editions" : "All rarities"}</option>{availableRarities.map(value => <option key={value} value={value}>{family === "merch" ? value : getEnglishRarityLabel(set.id, value)}</option>)}</select>}</div>
            <div className={isoGridClass}>{visibleCards.map(card => {
                    const identity = isoCardIdentity(card), actionKey = isoActionKey(card);
                    const wishlisted = wishlist.has(getWishlistIdentity(card.setId, actionKey));
                    const content = <div className={searchAllCards ? "" : "cursor-pointer"}><div className={`relative w-full overflow-hidden rounded-[2px] sm:rounded-[6px] ${card.square ? "aspect-square" : card.wide ? "aspect-[10/7]" : "aspect-[5/7]"} ${wishlisted ? "ring-4 ring-pink-400 ring-offset-2 ring-offset-white dark:ring-offset-[#17191a]" : ""}`}><ISOCardImage card={card}/></div>{family === "merch" && <p className="mt-1 text-center text-xs text-muted-foreground">{card.level}</p>}</div>;
                    return <article key={card.key} className={`min-w-0 ${card.wide ? "col-span-2" : ""}`}><ISOChecking userId={userId} setId={card.setId} cardKey={actionKey} initialStatus={inProgress.get(identity) ?? null} wishlistMode={wishlistMode} owned={owned.has(identity)} isWishlisted={wishlisted} toggleWishlist={toggleWishlist} onStatusChange={status => setInProgress(previous => {
                            const next = new Map(previous);
                            if (status)
                                next.set(identity, status);
                            else
                                next.delete(identity);
                            return next;
                        })} onComplete={() => setOwned(previous => new Set(previous).add(identity))}>{content}</ISOChecking><ISOCardCaption code={card.code} setName={card.setName}/></article>;
                })}</div></section>;
        })}</div></div>;
}
