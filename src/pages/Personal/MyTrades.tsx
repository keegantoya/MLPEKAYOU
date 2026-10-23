import InventoryOverview from "@/components/InventoryOverview";
import { getEnglishCard } from "@/lib/english-card-catalog";
import { inventoryCollections as collections, normalizeInventorySetId as normalizeSetId, buildInventoryProgress, getInventoryOwnedCards, fetchInventoryProgress, fetchInventoryListings } from "@/lib/english-inventory";
import CardImage from "@/components/CardImage";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
export default function MyTrades() {
    const [activeFilter, setActiveFilter] = useState("moon");
    const [hiddenSets, setHiddenSets] = useState<string[]>([]);
    const [progress, setProgress] = useState<Record<string, Record<string, boolean>>>({});
    const [listingCounts, setListingCounts] = useState<Record<string, number>>({});
    const [retry, setRetry] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    useEffect(() => {
        let disposed = false;
        let requestId = 0;
        let activeUserId = "";
        const loadData = async () => {
            const request = ++requestId;
            setLoadError("");
            setLoading(true);
            try {
                const { data, error: authError } = await supabase.auth.getSession();
                if (authError)
                    throw authError;
                if (disposed || request !== requestId)
                    return;
                const user = data.session?.user;
                if (!user) {
                    setHiddenSets([]);
                    setProgress({});
                    setListingCounts({});
                    return;
                }
                activeUserId = user.id;
                const [profileResult, progressRows, trades] = await Promise.all([
                    supabase.from("profiles").select("iso_hidden_sets").eq("id", user.id).single(),
                    fetchInventoryProgress(user.id),
                    fetchInventoryListings(user.id),
                ]);
                if (disposed || request !== requestId)
                    return;
                if (profileResult.error)
                    throw profileResult.error;
                setHiddenSets(profileResult.data?.iso_hidden_sets || []);
                setProgress(buildInventoryProgress(progressRows));
                const identities = new Map<string, Set<string>>();
                for (const row of trades) {
                    const setId = normalizeSetId(row.set_id);
                    const card = getEnglishCard(setId, row.card_key);
                    if (!card?.isoEligible || !((row.is_for_trade && Number(row.trade_quantity) > 0) || (row.is_for_sale && Number(row.sale_quantity) > 0)))
                        continue;
                    const cards = identities.get(setId) ?? new Set<string>();
                    cards.add(card.key);
                    identities.set(setId, cards);
                }
                setListingCounts(Object.fromEntries([...identities].map(([id, cards]) => [id, cards.size])));
            }
            catch (cause) {
                if (!disposed && request === requestId)
                    setLoadError(cause instanceof Error ? cause.message : "Your inventory could not be loaded.");
            }
            finally {
                if (!disposed && request === requestId)
                    setLoading(false);
            }
        };
        const refresh = () => { void loadData(); };
        refresh();
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_OUT") {
                activeUserId = "";
                requestId++;
                setHiddenSets([]);
                setProgress({});
                setListingCounts({});
                setLoading(false);
                setLoadError("");
            }
            else if (event === "SIGNED_IN") {
                if (session?.user.id !== activeUserId) {
                    activeUserId = session?.user.id ?? "";
                    setProgress({});
                    setListingCounts({});
                    setHiddenSets([]);
                    setLoading(true);
                }
                queueMicrotask(refresh);
            }
        });
        window.addEventListener("focus", refresh);
        return () => { disposed = true; requestId++; subscription.unsubscribe(); window.removeEventListener("focus", refresh); };
    }, [retry]);
    const hidden = new Set(hiddenSets.map(normalizeSetId));
    const labels: Record<string, string> = { moon: "Moon", star: "Star", rainbow: "Rainbow", fun: "Fun Moments", tcg: "TCG", promos: "Promotional" };
    const categories = [...new Set(collections.map(set => set.family))].map(id => ({ id, name: labels[id] ?? id }));
    const sets = collections.map(set => ({
        id: set.id,
        family: set.family,
        name: [set.title, set.setName === "TCG" ? "" : set.setName].filter(Boolean).join(" "),
        href: `/inventory/${set.slug}`,
        total: set.totalCards,
        owned: getInventoryOwnedCards(set.id, progress[set.id] ?? {}).length,
        listed: listingCounts[set.id] ?? 0,
        hidden: hidden.has(set.id),
        available: Object.keys(progress[set.id] ?? {}).length > 0,
        preview: <CardImage src={set.imageUrl} alt="" className="block aspect-[5/7] w-full object-cover"/>,
    }));
    return <InventoryOverview title="My Inventory" categories={categories} category={activeFilter} onCategoryChange={setActiveFilter} sets={sets} loading={loading} error={loadError} checklistHref="/collections" onRetry={() => setRetry(value => value + 1)}/>;
}
