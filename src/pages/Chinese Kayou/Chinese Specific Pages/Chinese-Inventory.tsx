import InventoryOverview from "@/components/InventoryOverview";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { chineseCards, chineseSets, chineseFamilies, getChineseCard, type ChineseISOCard } from "../Chinese ISO/catalog/catalog";
import ChineseISOImage from "../Chinese ISO/components/card-image";
import { isChineseOwned } from "../Chinese ISO/data/model";
type Listing = {
    set_id: string;
    card_key: string;
    is_for_trade: boolean;
    is_for_sale: boolean;
    trade_quantity: number;
    sale_quantity: number;
};
export default function ChineseInventory() {
    const [previewSeed] = useState(() => Math.floor(Math.random() * 0x100000000));
    const [userId, setUserId] = useState("");
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState<Record<string, Record<string, unknown>>>({});
    const [hiddenSets, setHiddenSets] = useState<string[]>([]);
    const [family, setFamily] = useState("moon");
    const [listings, setListings] = useState<Listing[]>([]);
    const [error, setError] = useState("");
    const [listingLoading, setListingLoading] = useState(false);
    const [retry, setRetry] = useState(0);
    useEffect(() => {
        let disposed = false;
        let ticket = 0;
        const load = async () => {
            const request = ++ticket;
            setError("");
            setLoading(true);
            setListingLoading(true);
            try {
                const { data: auth, error: authError } = await supabase.auth.getSession();
                if (authError)
                    throw authError;
                if (disposed || request !== ticket)
                    return;
                const id = auth.session?.user.id;
                if (!id)
                    throw new Error("Sign in to view your inventory.");
                const [profileResult, progressResult] = await Promise.all([
                    supabase.from("profiles").select("chinese_iso_hidden_sets").eq("id", id).maybeSingle(),
                    supabase.from("collection_progress_raw").select("set_id,progress").eq("user_id", id).in("set_id", chineseSets.map(set => set.id))
                ]);
                if (profileResult.error)
                    throw profileResult.error;
                if (progressResult.error)
                    throw progressResult.error;
                if (!disposed && request === ticket) {
                    setUserId(id);
                    setHiddenSets(profileResult.data?.chinese_iso_hidden_sets ?? []);
                    setProgress(Object.fromEntries((progressResult.data ?? []).map(row => [row.set_id, row.progress ?? {}])));
                }
                const rows: Listing[] = [];
                for (let from = 0;; from += 500) {
                    const { data, error } = await supabase.from("card_market_listings").select("set_id,card_key,is_for_trade,is_for_sale,trade_quantity,sale_quantity").eq("user_id", id).like("set_id", "cn-%").or("is_for_trade.eq.true,is_for_sale.eq.true").order("set_id").order("card_key").range(from, from + 499);
                    if (error)
                        throw error;
                    rows.push(...(data ?? []));
                    if ((data ?? []).length < 500)
                        break;
                }
                if (!disposed && request === ticket)
                    setListings(rows.filter(row => getChineseCard(row.set_id, row.card_key) && ((row.is_for_trade && row.trade_quantity > 0) || (row.is_for_sale && row.sale_quantity > 0))));
            }
            catch (cause) {
                if (!disposed && request === ticket)
                    setError(cause instanceof Error ? cause.message : "Listings could not be loaded.");
            }
            finally {
                if (!disposed && request === ticket) {
                    setListingLoading(false);
                    setLoading(false);
                }
            }
        };
        const refresh = () => { void load(); };
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === "SIGNED_OUT" || event === "SIGNED_IN") {
                ++ticket;
                setUserId("");
                setProgress({});
                setHiddenSets([]);
                setListings([]);
                setLoading(true);
                window.setTimeout(() => {
                    if (!disposed)
                        refresh();
                }, 0);
            }
        });
        window.addEventListener("focus", refresh);
        window.addEventListener("chinese-inventory-changed", refresh);
        void load();
        return () => { disposed = true; ticket++; subscription.unsubscribe(); window.removeEventListener("focus", refresh); window.removeEventListener("chinese-inventory-changed", refresh); };
    }, [retry]);
    const counts = new Map<string, number>();
    for (const card of chineseCards)
        if (isChineseOwned(progress[card.setId]?.[card.key]))
            counts.set(card.setId, (counts.get(card.setId) ?? 0) + 1);
    const previewCards = useMemo(() => {
        const ownedBySet = new Map<string, ChineseISOCard[]>();
        for (const card of chineseCards) {
            if (!isChineseOwned(progress[card.setId]?.[card.key]))
                continue;
            const cards = ownedBySet.get(card.setId) ?? [];
            cards.push(card);
            ownedBySet.set(card.setId, cards);
        }
        const previews = new Map<string, ChineseISOCard>();
        for (const [setId, cards] of ownedBySet) {
            let hash = previewSeed;
            for (const character of `${userId}:${setId}`)
                hash = Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0;
            previews.set(setId, cards[hash % cards.length]);
        }
        return previews;
    }, [progress, previewSeed, userId]);
    const listingCounts = new Map<string, number>();
    for (const listing of listings)
        listingCounts.set(listing.set_id, (listingCounts.get(listing.set_id) ?? 0) + 1);
    const sets = chineseSets.map(set => ({
        id: set.id,
        family: set.family,
        name: set.name,
        href: `/inventory-chinese/${set.id}`,
        total: set.cards.length,
        owned: counts.get(set.id) ?? 0,
        listed: listingCounts.get(set.id) ?? 0,
        hidden: hiddenSets.includes(set.id),
        available: counts.has(set.id),
        preview: previewCards.has(set.id) ? <span className="block w-full"><ChineseISOImage card={previewCards.get(set.id)!}/></span> : undefined,
    }));
    return <InventoryOverview title="Chinese Inventory" categories={chineseFamilies} category={family} onCategoryChange={setFamily} sets={sets} loading={loading} listingsLoading={listingLoading} error={error} checklistHref="/collections-chinese" onRetry={() => setRetry(value => value + 1)}/>;
}
