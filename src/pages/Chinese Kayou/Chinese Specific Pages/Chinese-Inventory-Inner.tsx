import { InventoryListingFilters, InventoryListingBadges, inventoryListingMatches, type InventoryListingView } from "@/components/InventoryOverview";
import InventoryBulkEdit from "@/components/InventoryBulkEdit";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { chineseCards, chineseSets, getChineseCard, getChineseCardLabel, hasChineseCardCode, chineseRarityLabel, isWideChineseCard, type ChineseISOCard } from "../Chinese ISO/catalog/catalog";
import { isChineseOwned } from "../Chinese ISO/data/model";
import ChineseISOImage from "../Chinese ISO/components/card-image";
type PageQuery = {
    range: (from: number, to: number) => PromiseLike<{
        data: unknown[] | null;
        error: {
            message: string;
        } | null;
    }>;
};
async function readRows<T>(query: () => PageQuery): Promise<T[]> {
    const rows: T[] = [];
    for (let from = 0;; from += 500) {
        const { data, error } = await query().range(from, from + 499);
        if (error)
            throw new Error(error.message);
        const page = (data ?? []) as T[];
        rows.push(...page);
        if (page.length < 500)
            return rows;
    }
}
export default function ChineseInventoryInner() {
    const { setId } = useParams();
    const navigate = useNavigate();
const [searchParams] = useSearchParams();
const [listingView, setListingView] = useState<InventoryListingView>(() => { const value = searchParams.get("listings"); return value === "listed" || value === "sale" || value === "trade" ? value : "all"; });
const openedListing = useRef("");
    const [collapsedRarities, setCollapsedRarities] = useState<Record<string, boolean>>({});
    const [progressMap, setProgressMap] = useState<Record<string, any>>({});
    type MarketListing = {
        is_for_trade: boolean;
        is_for_sale: boolean;
        asking_price: number | null;
        trade_quantity: number;
        sale_quantity: number;
    };
    type ListingDraft = {
        isForTrade: boolean;
        isForSale: boolean;
        askingPrice: string;
        personalQuantity: string;
        tradeQuantity: string;
        saleQuantity: string;
    };
    const emptyListing: MarketListing = {
        is_for_trade: false,
        is_for_sale: false,
        asking_price: null,
        trade_quantity: 0,
        sale_quantity: 0,
    };
    const [marketListings, setMarketListings] = useState<Record<string, MarketListing>>({});
    const [selectedCard, setSelectedCard] = useState<ChineseISOCard | null>(null);
    const [listingDraft, setListingDraft] = useState<ListingDraft | null>(null);
    const [savedListingDraft, setSavedListingDraft] = useState<ListingDraft | null>(null);
    const [isSavingCard, setIsSavingCard] = useState(false);
    const [cardSaveError, setCardSaveError] = useState("");
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [savedQuantities, setSavedQuantities] = useState<Record<string, number>>({});
    const [editMode, setEditMode] = useState(false);
    const [showBulkEdit, setShowBulkEdit] = useState(false);
    const [inventoryDirty, setInventoryDirty] = useState(false);
    const [showIntroPopup, setShowIntroPopup] = useState(false);
    const [showLeavePopup, setShowLeavePopup] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
    const inventoryDirtyRef = useRef(false);
    const navigationGuardRef = useRef(false);
    const [saveError, setSaveError] = useState("");
    const [savingQuantities, setSavingQuantities] = useState(false);
    const savingRef = useRef(false);
    const ownerRef = useRef("");
    const [loadError, setLoadError] = useState("");
    const [loading, setLoading] = useState(true);
    const set = chineseSets.find(item => item.id === setId || item.href.slice(1) === setId);
    const resolvedSetId = set?.id;
    const [isLightMode, setIsLightMode] = useState(() => {
        if (typeof document === "undefined")
            return false;
        const root = document.documentElement;
        return root.dataset.theme === "light" || root.classList.contains("light");
    });
    useEffect(() => {
        const syncTheme = () => {
            const root = document.documentElement;
            setIsLightMode(root.dataset.theme === "light" ||
                root.classList.contains("light") ||
                !root.classList.contains("dark"));
        };
        syncTheme();
        const observer = new MutationObserver(syncTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class", "data-theme"],
        });
        return () => observer.disconnect();
    }, []);
    useEffect(() => {
        let disposed = false;
        let request = 0;
        const load = async () => {
            const ticket = ++request;
            setLoading(true);
            setShowBulkEdit(false);
            setLoadError("");
            setProgressMap({});
            setMarketListings({});
            setQuantities({});
            setSavedQuantities({});
            try {
                const { data, error } = await supabase.auth.getSession();
                if (error)
                    throw error;
                const user = data.session?.user;
                if (!user)
                    throw new Error("Sign in to view your inventory.");
                if (disposed || ticket !== request)
                    return;
                ownerRef.current = user.id;
                if (!resolvedSetId)
                    return;
                const [progressResult, listingRows, quantityRows] = await Promise.all([
                    supabase.from("collection_progress_raw").select("progress").eq("user_id", user.id).eq("set_id", resolvedSetId).maybeSingle(),
                    readRows<MarketListing & {
                        card_key: string;
                    }>(() => supabase.from("card_market_listings").select("card_key,is_for_trade,is_for_sale,asking_price,trade_quantity,sale_quantity").eq("user_id", user.id).eq("set_id", resolvedSetId).order("card_key")),
                    readRows<{
                        card_key: string;
                        quantity: number;
                    }>(() => supabase.from("card_quantity").select("card_key,quantity").eq("user_id", user.id).eq("set_id", resolvedSetId).order("card_key"))
                ]);
                if (progressResult.error)
                    throw progressResult.error;
                if (disposed || ticket !== request)
                    return;
                setProgressMap({ [resolvedSetId]: progressResult.data?.progress ?? {} });
                setMarketListings(Object.fromEntries(listingRows.map(row => [row.card_key, { ...row, asking_price: row.asking_price === null ? null : Number(row.asking_price) }])));
                const quantities = Object.fromEntries(quantityRows.map(row => [row.card_key, Number(row.quantity)]));
                setQuantities(quantities);
                setSavedQuantities(quantities);
                setInventoryDirty(false);
                inventoryDirtyRef.current = false;
            }
            catch (cause) {
                if (!disposed && ticket === request)
                    setLoadError(cause instanceof Error ? cause.message : "Inventory could not be loaded. Please reload.");
            }
            finally {
                if (!disposed && ticket === request)
                    setLoading(false);
            }
        };
        void load();
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === "SIGNED_OUT" || event === "SIGNED_IN") {
                ++request;
                ownerRef.current = "";
                setProgressMap({});
                setMarketListings({});
                setShowBulkEdit(false);
                setSelectedCard(null);
                setListingDraft(null);
                setSavedListingDraft(null);
                setQuantities({});
                setSavedQuantities({});
                setInventoryDirty(false);
                inventoryDirtyRef.current = false;
                window.setTimeout(() => {
                    if (!disposed)
                        void load();
                }, 0);
            }
        });
        return () => { disposed = true; subscription.unsubscribe(); };
    }, [resolvedSetId]);
    useEffect(() => {
        const INTRO_KEY = "mlpekayou_chinese_inventory_intro_seen";
        try {
            const hasSeenIntro = localStorage.getItem(INTRO_KEY) === "true";
            setShowIntroPopup(!hasSeenIntro);
        }
        catch {
            setShowIntroPopup(false);
        }
    }, []);
    useEffect(() => {
        inventoryDirtyRef.current = inventoryDirty;
    }, [inventoryDirty]);
    useEffect(() => {
        const handleKayouHeaderNavigation = (event: Event) => {
            const customEvent = event as CustomEvent<{
                destination?: string;
            }>;
            const destination = customEvent.detail?.destination;
            if (!inventoryDirtyRef.current || !destination) {
                return;
            }
            event.preventDefault();
            setPendingNavigation(destination);
            setShowLeavePopup(true);
        };
        window.addEventListener("mlpekayou:before-navigation", handleKayouHeaderNavigation);
        return () => {
            window.removeEventListener("mlpekayou:before-navigation", handleKayouHeaderNavigation);
        };
    }, []);
    useEffect(() => {
        const beforeLink = (event: MouseEvent) => {
            if (!inventoryDirtyRef.current || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
                return;
            const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
            if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank" || anchor.hasAttribute("download"))
                return;
            const destination = new URL(anchor.href, window.location.href);
            if (destination.origin !== window.location.origin || destination.href === window.location.href)
                return;
            event.preventDefault();
            event.stopPropagation();
            setPendingNavigation(destination.pathname + destination.search + destination.hash);
            setShowLeavePopup(true);
        };
        document.addEventListener("click", beforeLink, true);
        return () => document.removeEventListener("click", beforeLink, true);
    }, []);
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (!inventoryDirty)
                return;
            event.preventDefault();
            event.returnValue = "";
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [inventoryDirty]);
    useEffect(() => {
        const dirty = Object.keys(quantities).some(key => (quantities[key] ?? 1) !== (savedQuantities[key] ?? 1)) ||
            (!!listingDraft && !!savedListingDraft && JSON.stringify(listingDraft) !== JSON.stringify(savedListingDraft));
        setInventoryDirty(dirty);
        inventoryDirtyRef.current = dirty;
    }, [listingDraft, savedListingDraft, quantities, savedQuantities]);
    const changeQuantity = (cardKey: string, value: number) => {
        const next = Number.isSafeInteger(value) ? Math.max(1, value) : 1;
        setQuantities((prev) => {
            const updated = { ...prev, [cardKey]: next };
            const dirty = Object.keys(updated).some((key) => (updated[key] ?? 1) !== (savedQuantities[key] ?? 1));
            setInventoryDirty(dirty);
            inventoryDirtyRef.current = dirty;
            return updated;
        });
    };
    const saveInventoryChanges = async (excludeCardKey?: string): Promise<boolean> => {
        if (savingRef.current)
            return false;
        savingRef.current = true;
        setSavingQuantities(true);
        setSaveError("");
        try {
            const { data, error } = await supabase.auth.getUser();
            const user = data.user;
            if (error || !user || user.id !== ownerRef.current)
                throw new Error("Your login changed. Reload before saving.");
            const keys = new Set([...Object.keys(savedQuantities), ...Object.keys(quantities)]);
            const changedKeys = Array.from(keys).filter(key => key !== excludeCardKey && (quantities[key] ?? 1) !== (savedQuantities[key] ?? 1));
            if (changedKeys.some(key => !Number.isSafeInteger(quantities[key]) || quantities[key] < 1))
                throw new Error("Enter whole quantities of at least 1.");
            if (changedKeys.length) {
                const { error } = await supabase.from("card_quantity").upsert(changedKeys.map(cardKey => ({ user_id: user.id, set_id: resolvedSetId, card_key: cardKey, quantity: quantities[cardKey] })), { onConflict: "user_id,set_id,card_key" });
                if (error)
                    throw new Error(error.message);
            }
            setSavedQuantities(current => ({ ...current, ...Object.fromEntries(Object.entries(quantities).filter(([key]) => key !== excludeCardKey)) }));
            const dirty = !!listingDraft && !!savedListingDraft && JSON.stringify(listingDraft) !== JSON.stringify(savedListingDraft);
            setInventoryDirty(dirty);
            inventoryDirtyRef.current = dirty;
            window.dispatchEvent(new CustomEvent("chinese-inventory-changed"));
            return true;
        }
        catch (cause) {
            setSaveError(cause instanceof Error ? cause.message : "Changes could not be saved.");
            return false;
        }
        finally {
            savingRef.current = false;
            setSavingQuantities(false);
        }
    };
    const requestNavigation = (destination: string) => {
        if (inventoryDirtyRef.current) {
            setPendingNavigation(destination);
            setShowLeavePopup(true);
            return;
        }
        navigationGuardRef.current = true;
        navigate(destination);
        navigationGuardRef.current = false;
    };
    const handleEditToggle = async () => {
        if (!editMode) {
            setEditMode(true);
            return;
        }
        if (inventoryDirty) {
            const saved = await saveInventoryChanges();
            if (!saved)
                return;
        }
        setEditMode(false);
    };
    const openBulkEdit = async () => {
        if (savingRef.current || isSavingCard)
            return;
        if (inventoryDirtyRef.current && !(await saveInventoryChanges()))
            return;
        setEditMode(false);
        setShowBulkEdit(true);
    };
    const toDraft = (cardKey: string): ListingDraft => {
        const listing = marketListings[cardKey] || emptyListing;
        return {
            isForTrade: listing.is_for_trade,
            isForSale: listing.is_for_sale,
            askingPrice: listing.asking_price === null ? "" : listing.asking_price.toFixed(2),
            personalQuantity: String(quantities[cardKey] || 1),
            tradeQuantity: String(listing.trade_quantity || 0),
            saleQuantity: String(listing.sale_quantity || 0),
        };
    };
    const openCardDetails = (card: ChineseISOCard) => {
        const draft = toDraft(card.key);
        setSelectedCard(card);
        setListingDraft(draft);
        setSavedListingDraft(draft);
        setCardSaveError("");
    };
useEffect(() => {
  const key = searchParams.get("card");
  const request = `${resolvedSetId}:${key}`;
  if (loading || !resolvedSetId || !key || openedListing.current === request) return;
  const card = getChineseCard(resolvedSetId, key);
  if (!card || !inventoryListingMatches(marketListings[key])) return;
  openedListing.current = request;
  openCardDetails(card);
}, [loading, resolvedSetId, searchParams, marketListings]);
    const updateListingDraft = (changes: Partial<ListingDraft>) => {
        setListingDraft((current) => (current ? { ...current, ...changes } : current));
    };
    const saveCardDetails = async (): Promise<boolean> => {
        if (!selectedCard || !listingDraft || isSavingCard || savingRef.current)
            return false;
        if ([listingDraft.personalQuantity, ...(listingDraft.isForTrade ? [listingDraft.tradeQuantity] : []), ...(listingDraft.isForSale ? [listingDraft.saleQuantity] : [])].some(value => !/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) < 1)) {
            setCardSaveError("Enter whole quantities of at least 1.");
            return false;
        }
        const personalQuantity = Math.max(1, Number(listingDraft.personalQuantity) || 1);
        const tradeQuantity = listingDraft.isForTrade
            ? Math.max(1, Number(listingDraft.tradeQuantity) || 1)
            : 0;
        const saleQuantity = listingDraft.isForSale
            ? Math.max(1, Number(listingDraft.saleQuantity) || 1)
            : 0;
        const askingPrice = listingDraft.isForSale && listingDraft.askingPrice !== ""
            ? Number(listingDraft.askingPrice)
            : null;
        if (listingDraft.isForSale &&
            (askingPrice === null || !Number.isFinite(askingPrice) || askingPrice < 0)) {
            setCardSaveError("Enter a valid sale price.");
            return false;
        }
        savingRef.current = true;
        setIsSavingCard(true);
        try {
            setCardSaveError("");
            const { data, error: authError } = await supabase.auth.getUser();
            const user = data.user;
            if (authError || !user || user.id !== ownerRef.current) {
                setCardSaveError("Please sign in again before saving.");
                setIsSavingCard(false);
                return false;
            }
            const cardKey = selectedCard.key;
            const savedPersonalQuantity = savedQuantities[cardKey] ?? 1;
            const quantityRequest = personalQuantity !== savedPersonalQuantity
                ? supabase.from("card_quantity").upsert({
                    user_id: user.id,
                    set_id: resolvedSetId,
                    card_key: cardKey,
                    quantity: personalQuantity,
                }, { onConflict: "user_id,set_id,card_key" })
                : Promise.resolve({ error: null });
            const listingRequest = !listingDraft.isForTrade && !listingDraft.isForSale
                ? supabase
                    .from("card_market_listings")
                    .delete()
                    .eq("user_id", user.id)
                    .eq("set_id", resolvedSetId)
                    .eq("card_key", cardKey)
                : supabase.from("card_market_listings").upsert({
                    user_id: user.id,
                    set_id: resolvedSetId,
                    card_key: cardKey,
                    is_for_trade: listingDraft.isForTrade,
                    is_for_sale: listingDraft.isForSale,
                    asking_price: askingPrice,
                    trade_quantity: tradeQuantity,
                    sale_quantity: saleQuantity,
                }, { onConflict: "user_id,set_id,card_key" });
            const [quantityResult, listingResult] = await Promise.all([quantityRequest, listingRequest]);
            if (quantityResult.error || listingResult.error) {
                console.error("Failed to save card details:", quantityResult.error || listingResult.error);
                setCardSaveError("Your changes could not be saved. Please try again.");
                setIsSavingCard(false);
                return false;
            }
            setQuantities((current) => ({ ...current, [cardKey]: personalQuantity }));
            setSavedQuantities((current) => ({
                ...current,
                [cardKey]: personalQuantity,
            }));
            setMarketListings((current) => {
                const updated = { ...current };
                if (!listingDraft.isForTrade && !listingDraft.isForSale) {
                    delete updated[cardKey];
                }
                else {
                    updated[cardKey] = {
                        is_for_trade: listingDraft.isForTrade,
                        is_for_sale: listingDraft.isForSale,
                        asking_price: askingPrice,
                        trade_quantity: tradeQuantity,
                        sale_quantity: saleQuantity,
                    };
                }
                return updated;
            });
            const dirty = Object.keys(quantities).some(key => key !== cardKey && (quantities[key] ?? 1) !== (savedQuantities[key] ?? 1));
            setInventoryDirty(dirty);
            inventoryDirtyRef.current = dirty;
            setIsSavingCard(false);
            setSelectedCard(null);
            setListingDraft(null);
            setSavedListingDraft(null);
            window.dispatchEvent(new CustomEvent("chinese-inventory-changed"));
            return true;
        }
        catch (cause) {
            setCardSaveError(cause instanceof Error ? cause.message : "Changes could not be saved.");
            return false;
        }
        finally {
            savingRef.current = false;
            setIsSavingCard(false);
        }
    };
    const ownedBonusCards = chineseCards.filter(card => card.setId === resolvedSetId && isChineseOwned(progressMap[card.setId]?.[card.key]));
const visibleInventoryCards = listingView === "all" ? ownedBonusCards : chineseCards.filter(card => card.setId === resolvedSetId && inventoryListingMatches(marketListings[card.key], listingView));
    const rarityOrders: Record<string, string[]> = set ? { [set.id]: Array.from(new Set(set.cards.map(card => card.rarity))) } : {};
    if (loading)
        return <div role="status" className="p-10 text-center text-sm text-muted-foreground">Loading Chinese inventory...</div>;
    if (loadError || !set)
        return <div role="alert" className="p-10 text-center"><p>{loadError || "Chinese set not found."}</p><button type="button" onClick={() => navigate("/inventory-chinese")} className="mt-4 underline">Back to Chinese inventory</button></div>;
    const activeListingsCount = Object.values(marketListings).filter((listing) => inventoryListingMatches(listing)).length;
    return (<div className={`min-h-screen pb-24 transition-colors ${isLightMode ? "bg-[#f5f5f3] text-zinc-900" : "bg-[#0d0f10] text-white"}`}>
      <div className="mx-auto w-full max-w-[1500px] px-3 py-4 sm:px-5 sm:py-6 lg:px-7">
    {saveError && <p role="alert" className="mb-3 rounded-xl border border-red-500/30 p-3 text-sm text-red-500">{saveError}</p>}
        {selectedCard && listingDraft && (<Dialog open onOpenChange={() => { }}><DialogContent onEscapeKeyDown={event => event.preventDefault()} onPointerDownOutside={event => event.preventDefault()} aria-busy={isSavingCard} className={`!block !max-h-[92dvh] !w-[calc(100%-1rem)] !max-w-md overflow-y-auto !rounded-[20px] !p-0 !gap-0 shadow-2xl md:!max-w-4xl md:!rounded-[26px] [&>button]:hidden ${isLightMode ? "bg-white text-zinc-900" : "bg-[#17191a] text-white"}`}><DialogDescription className="sr-only">Edit personal quantity, trade and sale details for this card.</DialogDescription>
              <div className="grid md:grid-cols-[minmax(250px,0.85fr)_minmax(320px,1.15fr)]">
                <div className={`flex items-center justify-center p-2.5 sm:p-6 ${isLightMode ? "bg-zinc-100" : "bg-black/25"}`}>
                  <div className={`w-full ${isWideChineseCard(selectedCard)
                ? "aspect-[10/7] max-w-[170px] md:max-w-[520px]"
                : "aspect-[5/7] max-w-[105px] md:max-w-[310px]"} overflow-hidden rounded-xl md:rounded-2xl`}>
                    <ChineseISOImage card={selectedCard}/>
                  </div>
                </div>
                <div className="flex flex-col p-3 sm:p-6">
                  <div>
                    <div className={`text-[10px] font-medium uppercase tracking-[0.14em] sm:text-xs sm:tracking-[0.18em] ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                      {hasChineseCardCode(selectedCard) ? "Card identification code" : "Prize details"}
                    </div>
                    <DialogTitle id="card-details-title" className="mt-0.5 text-lg font-bold sm:mt-1 sm:text-2xl">
                      {getChineseCardLabel(selectedCard)}
                    </DialogTitle>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-5">
                    <button type="button" onClick={() => updateListingDraft({
                isForTrade: !listingDraft.isForTrade,
                tradeQuantity: !listingDraft.isForTrade && Number(listingDraft.tradeQuantity) < 1
                    ? "1"
                    : listingDraft.tradeQuantity,
            })} className={`min-h-10 rounded-xl px-2 py-2 text-xs font-bold transition sm:min-h-12 sm:px-3 sm:py-3 sm:text-sm ${listingDraft.isForTrade
                ? "bg-emerald-500 text-white"
                : isLightMode
                    ? "bg-zinc-200 text-zinc-700"
                    : "bg-white/[0.08] text-zinc-200"}`}>
                      {listingDraft.isForTrade ? "Actively up for trade" : "Mark for trade"}
                    </button>
                    <button type="button" onClick={() => updateListingDraft({
                isForSale: !listingDraft.isForSale,
                saleQuantity: !listingDraft.isForSale && Number(listingDraft.saleQuantity) < 1
                    ? "1"
                    : listingDraft.saleQuantity,
            })} className={`min-h-10 rounded-xl px-2 py-2 text-xs font-bold transition sm:min-h-12 sm:px-3 sm:py-3 sm:text-sm ${listingDraft.isForSale
                ? "bg-sky-500 text-white"
                : isLightMode
                    ? "bg-zinc-200 text-zinc-700"
                    : "bg-white/[0.08] text-zinc-200"}`}>
                      {listingDraft.isForSale ? "Actively up for sale" : "Mark for sale"}
                    </button>
                  </div>
                  <div className="mt-3 space-y-2 sm:mt-5 sm:space-y-3">
                    <label className={`block rounded-xl px-2.5 py-2 sm:p-3 ${listingDraft.isForSale
                ? isLightMode
                    ? "bg-zinc-100"
                    : "bg-white/[0.06]"
                : isLightMode
                    ? "bg-zinc-100/60 text-zinc-400"
                    : "bg-white/[0.025] text-zinc-600"}`}>
                      <span className="text-xs font-semibold sm:text-sm">Looking for</span>
                      <div className="mt-1 flex items-center gap-2 sm:mt-2">
                        <span className="font-semibold">$</span>
                        <input type="text" inputMode="decimal" disabled={!listingDraft.isForSale} value={listingDraft.askingPrice} onChange={(event) => {
                const value = event.target.value;
                if (/^\d*(.\d{0,2})?$/.test(value))
                    updateListingDraft({ askingPrice: value });
            }} placeholder="0.00" className="w-full bg-transparent text-base outline-none disabled:cursor-not-allowed"/>
                      </div>
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
                      {[
                {
                    label: "Personal quantity",
                    key: "personalQuantity" as const,
                    enabled: true,
                },
                {
                    label: "Quantity for sale",
                    key: "saleQuantity" as const,
                    enabled: listingDraft.isForSale,
                },
                {
                    label: "Quantity for trade",
                    key: "tradeQuantity" as const,
                    enabled: listingDraft.isForTrade,
                },
            ].map((field) => (<label key={field.key} className={`min-w-0 rounded-xl p-2 sm:p-3 ${field.enabled
                    ? isLightMode
                        ? "bg-zinc-100"
                        : "bg-white/[0.06]"
                    : isLightMode
                        ? "bg-zinc-100/60 text-zinc-400"
                        : "bg-white/[0.025] text-zinc-600"}`}>
                          <span className="block min-h-7 text-[10px] font-semibold leading-tight sm:min-h-0 sm:text-sm">
                            {field.label}
                          </span>
                          <input type="text" inputMode="numeric" disabled={!field.enabled} value={listingDraft[field.key]} onFocus={(event) => event.target.select()} onChange={(event) => {
                    if (/^\d*$/.test(event.target.value)) {
                        updateListingDraft({
                            [field.key]: event.target.value,
                        });
                    }
                }} className="mt-1 w-full bg-transparent text-base font-bold outline-none disabled:cursor-not-allowed sm:mt-2"/>
                        </label>))}
                    </div>
                  </div>
                  {cardSaveError && (<div className="mt-2 rounded-xl bg-red-500/10 px-3 py-2 text-xs font-medium text-red-500 sm:mt-4 sm:text-sm">
                      {cardSaveError}
                    </div>)}
                  <button type="button" onClick={saveCardDetails} disabled={isSavingCard} className="mt-3 min-h-10 w-full rounded-xl bg-[#FFD54A] px-4 py-2 text-sm font-bold text-black transition hover:bg-[#ffe277] disabled:cursor-wait disabled:opacity-60 sm:mt-5 sm:min-h-12 sm:px-5 sm:py-3 sm:text-base">
                    {isSavingCard ? "Saving..." : "Save"}
                  </button>
                  <button type="button" disabled={isSavingCard} onClick={() => { setSelectedCard(null); setListingDraft(null); setSavedListingDraft(null); }} className="mt-2 min-h-10 rounded-xl text-sm text-zinc-500">Cancel</button>
                  <p className={`mt-1.5 text-center text-[10px] sm:mt-2 sm:text-xs ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                    Save your changes or cancel to return to your inventory.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>)}
        {showIntroPopup && (<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
            <div className={`w-full max-w-lg overflow-hidden rounded-[26px] border shadow-2xl ${isLightMode ? "border-black/10 bg-white" : "border-white/10 bg-[#17191a]"}`}>
              <div className={`border-b px-5 py-4 ${isLightMode ? "border-black/10" : "border-white/10"}`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFD54A] font-bold text-black">
                    !
                  </div>
                  <div>
                    <div className={`text-xs ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                      Inventory
                    </div>
                    <h2 className="text-lg font-semibold">Quick Start</h2>
                  </div>
                </div>
              </div>
              <div className={`space-y-3 px-5 py-5 text-sm leading-relaxed ${isLightMode ? "text-zinc-600" : "text-zinc-300"}`}>
                <p>Tap any card to open its inventory, trade, and sale details.</p>
                <p>
                  A card can be marked for trade, sale, or both. Sale prices and public quantities
                  are saved with that card.
                </p>
                <p>Save to apply your changes, or cancel to discard them.</p>
              </div>
              <div className={`flex justify-end border-t px-5 py-4 ${isLightMode ? "border-black/10" : "border-white/10"}`}>
                <button type="button" onClick={() => {
                try {
                    localStorage.setItem("mlpekayou_chinese_inventory_intro_seen", "true");
                }
                catch { }
                setShowIntroPopup(false);
            }} className="rounded-xl bg-[#FFD54A] px-5 py-2.5 text-sm font-semibold text-black">
                  Got it
                </button>
              </div>
            </div>
          </div>)}
        {showLeavePopup && (<div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className={`w-full max-w-lg overflow-hidden rounded-[26px] border shadow-2xl ${isLightMode ? "border-black/10 bg-white" : "border-white/10 bg-[#17191a]"}`}>
              <div className={`border-b px-5 py-4 ${isLightMode ? "border-black/10" : "border-white/10"}`}>
                <div className={`text-xs ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                  Unsaved changes
                </div>
                <h2 className="mt-1 text-lg font-semibold">Save inventory changes?</h2>
              </div>
              <div className="px-5 py-5">
                <p className={`text-sm ${isLightMode ? "text-zinc-600" : "text-zinc-300"}`}>
                  You changed quantities or card listing details. Save them before leaving?
                </p>
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  <button type="button" onClick={async () => {
                const hasDraftChanges = !!selectedCard && !!listingDraft && !!savedListingDraft && JSON.stringify(listingDraft) !== JSON.stringify(savedListingDraft);
                const saved = await saveInventoryChanges(hasDraftChanges ? selectedCard.key : undefined);
                if (!saved)
                    return;
                if (hasDraftChanges && !(await saveCardDetails())) {
                    setShowLeavePopup(false);
                    return;
                }
                setInventoryDirty(false);
                inventoryDirtyRef.current = false;
                setShowLeavePopup(false);
                setEditMode(false);
                const destination = pendingNavigation;
                setPendingNavigation(null);
                if (destination) {
                    navigationGuardRef.current = true;
                    navigate(destination);
                    navigationGuardRef.current = false;
                }
            }} className="rounded-xl bg-[#FFD54A] px-4 py-3 text-sm font-semibold text-black">
                    Save and leave
                  </button>
                  <button type="button" onClick={() => {
                setShowLeavePopup(false);
                setInventoryDirty(false);
                inventoryDirtyRef.current = false;
                setEditMode(false);
                const destination = pendingNavigation;
                setPendingNavigation(null);
                if (destination) {
                    navigationGuardRef.current = true;
                    navigate(destination);
                    navigationGuardRef.current = false;
                }
            }} className={`rounded-xl border px-4 py-3 text-sm font-semibold ${isLightMode
                ? "border-black/10 bg-zinc-50 text-zinc-700"
                : "border-white/10 bg-white/[0.04] text-zinc-200"}`}>
                    Leave without saving
                  </button>
                </div>
                <button type="button" onClick={() => {
                setShowLeavePopup(false);
                setPendingNavigation(null);
            }} className={`mt-2 w-full rounded-xl px-4 py-2.5 text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                  Stay on page
                </button>
              </div>
            </div>
          </div>)}
        <section className="mb-5 grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)] items-center gap-2 border-b border-black/10 pb-4 dark:border-white/10 sm:gap-4">
          <button type="button" onClick={() => requestNavigation("/inventory-chinese")} aria-label="Back to Inventory" className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 justify-self-start rounded-lg border border-black/10 bg-black/[0.025] px-2 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-black/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E7C84B]/60 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.06] md:px-3">
            <span aria-hidden="true">&#8592;</span><span className="hidden md:inline">Back to Inventory</span>
          </button>
          <div className="min-w-0 text-center">
            <h1 className="break-words text-lg font-semibold leading-tight sm:text-2xl lg:text-3xl">{set.name}</h1>
            <div className={`mt-1 flex flex-wrap justify-center gap-x-2 text-[11px] sm:text-xs ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
              <span>{ownedBonusCards.length} cards owned</span><span aria-hidden="true">&#8226;</span><span>{activeListingsCount} listed</span>
            </div>
          </div>
          <div className="flex min-w-0 flex-col items-end justify-self-end gap-2 sm:flex-row sm:items-center">
          <button type="button" onClick={handleEditToggle} disabled={savingQuantities} className={`min-h-11 min-w-0 max-w-full rounded-lg border px-2 py-2 text-center text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E7C84B]/60 disabled:opacity-50 sm:px-4 sm:text-sm ${editMode ? "border-[#E7C84B] bg-[#E7C84B] text-black" : "border-black/10 bg-black/[0.025] hover:bg-black/[0.05] dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"}`}>
            {savingQuantities ? "Saving..." : editMode ? "Save quantities" : "Quick edit"}
          </button>
            <button type="button" onClick={() => void openBulkEdit()} disabled={loading || !!loadError || savingQuantities || isSavingCard || !visibleInventoryCards.length} className="min-h-11 max-w-full rounded-lg border border-[#E7C84B]/40 bg-[#E7C84B]/10 px-2 py-2 text-xs font-semibold text-[#806100] transition-colors hover:bg-[#E7C84B]/20 disabled:opacity-40 sm:px-4 sm:text-sm dark:text-[#E7C84B]">Bulk edit</button>
          </div>
        </section>
        <InventoryListingFilters value={listingView} onChange={value => { setListingView(value); setCollapsedRarities({}); }}/>
        {!loading && !loadError && listingView !== "all" && !visibleInventoryCards.length && <p role="status" className="py-8 text-center text-sm text-muted-foreground">No active listings match this filter.</p>}
        {showBulkEdit && <InventoryBulkEdit setId={set.id} setName={set.name} merchandise={set.id === "cn-kuji-raffles"} cards={visibleInventoryCards.map(card => ({ ...card, code: getChineseCardLabel(card) }))} quantities={quantities} listings={marketListings} quantityTargets={{}} listingTargets={{}} onClose={() => setShowBulkEdit(false)} onSaved={({ key, quantity, listing }) => {
                setQuantities(current => ({ ...current, [key]: quantity }));
                setSavedQuantities(current => ({ ...current, [key]: quantity }));
                setMarketListings(current => {
                    const next = { ...current };
                    if (listing.is_for_trade || listing.is_for_sale)
                        next[key] = listing;
                    else
                        delete next[key];
                    return next;
                });
            }}/>}
        {listingView === "all" && ownedBonusCards.length === 0 ? (<section className="py-12 text-center">
            <h2 className="text-xl font-semibold">Inventory Empty</h2>
            <p className={`mx-auto mt-2 max-w-xl text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
              You don't currently own any cards in this set. Add cards to your collection first,
              then they'll appear here.
            </p>
          </section>) : (<>
            <section className="mt-6 min-w-0">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-3 dark:border-white/10">
                <div>
                  <h2 className="text-base font-semibold">Cards</h2>
                  <p className={`mt-0.5 text-xs ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                    Tap a card to edit its quantity, trade, and sale details.
                  </p>
                </div>
                <span className={`text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                  {activeListingsCount} listed
                </span>
              </div>
              <div className="divide-y divide-black/[0.08] dark:divide-white/[0.08]">
                {Object.entries(visibleInventoryCards.reduce((acc: Record<string, any[]>, card) => {
                const rarity = card.rarity;
                if (!acc[rarity])
                    acc[rarity] = [];
                acc[rarity].push(card);
                return acc;
            }, {}))
                .sort(([a], [b]) => {
                const currentOrder = rarityOrders[set.id] || [];
                const indexA = currentOrder.indexOf(a);
                const indexB = currentOrder.indexOf(b);
                return indexB - indexA;
            })
                .map(([rarity, rarityCards]: [
                string,
                any[]
            ]) => {
                const collapseKey = `${set.id}-${rarity}`;
                const isCollapsed = collapsedRarities[collapseKey];
                const rarityLabel = chineseRarityLabel(rarity);
                return (<div key={rarity} className="min-w-0 py-4 first:pt-0 last:pb-0">
                        <button type="button" onClick={() => setCollapsedRarities((prev) => ({
                        ...prev,
                        [collapseKey]: !prev[collapseKey],
                    }))} className="flex w-full items-center justify-between gap-3 py-2 text-left transition-opacity hover:opacity-70">
                          <span className="text-sm font-semibold">{rarityLabel}</span>
                          <span className={`text-xs ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                            {rarityCards.length} cards {isCollapsed ? "+" : "-"}
                          </span>
                        </button>
                        {!isCollapsed && (<div className="grid grid-cols-3 gap-1.5 pt-1 sm:grid-cols-4 sm:gap-2 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-9">
                            {rarityCards.map((card) => {
                            const key = card.key;
                            const listing = marketListings[key];
                            const isDoubleCard = isWideChineseCard(card);
                            return (<div key={key} role="button" tabIndex={0} aria-label={`Edit ${getChineseCardLabel(card)}`} onKeyDown={event => {
                                    if (event.target !== event.currentTarget)
                                        return;
                                    if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault();
                                        openCardDetails(card);
                                    }
                                }} onClick={() => openCardDetails(card)} className={`group relative cursor-pointer overflow-hidden rounded-xl border-2 p-0.5 transition ${inventoryListingMatches(listing, "trade") && inventoryListingMatches(listing, "sale")
                                    ? "border-violet-400"
                                    : inventoryListingMatches(listing, "trade")
                                        ? "border-emerald-400"
                                        : inventoryListingMatches(listing, "sale")
                                            ? "border-blue-400"
                                            : ""} ${isDoubleCard ? "col-span-2 aspect-[10/7]" : "aspect-[5/7]"}`}>
                                  <div className="relative h-full w-full overflow-hidden rounded-[10px]">
                                    <ChineseISOImage card={card}/>
                                  </div>
                                  <div onClick={(e) => e.stopPropagation()} className="absolute bottom-1 right-1">
                                    {editMode && window.innerWidth >= 768 ? (<div className={`flex items-center rounded-lg border px-1 text-xs font-semibold ${isLightMode
                                        ? "border-black/10 bg-white/90 text-zinc-700"
                                        : "border-white/10 bg-black/80 text-zinc-200"}`}>
                                        <input type="text" inputMode="numeric" value={String(quantities[key] || "")} placeholder="1" onClick={(e) => e.stopPropagation()} onFocus={(e) => e.target.select()} onChange={(e) => {
                                        const raw = e.target.value;
                                        if (raw === "") {
                                            setQuantities((prev) => {
                                                const updated: Record<string, number> = {
                                                    ...prev,
                                                    [key]: 0,
                                                };
                                                setInventoryDirty(true);
                                                inventoryDirtyRef.current = true;
                                                return updated;
                                            });
                                            return;
                                        }
                                        const value = Number(raw);
                                        if (/^\d+$/.test(raw) && Number.isSafeInteger(value)) {
                                            setQuantities((prev) => {
                                                const updated: Record<string, number> = {
                                                    ...prev,
                                                    [key]: value,
                                                };
                                                const dirty = Object.keys(updated).some((cardKey) => (updated[cardKey] ?? 1) !==
                                                    (savedQuantities[cardKey] ?? 1));
                                                setInventoryDirty(dirty);
                                                inventoryDirtyRef.current = dirty;
                                                return updated;
                                            });
                                        }
                                    }} onBlur={() => {
                                        const finalValue = Math.max(1, quantities[key] || 1);
                                        changeQuantity(key, finalValue);
                                    }} className="w-8 bg-transparent py-1 text-center text-base outline-none"/>
                                      </div>) : (<div className={`flex items-center rounded-lg border px-1 py-0.5 text-xs font-semibold ${isLightMode
                                        ? "border-black/10 bg-white/90 text-zinc-700"
                                        : "border-white/10 bg-black/80 text-zinc-200"}`}>
                                        {editMode && (<button type="button" onClick={() => changeQuantity(key, (quantities[key] || 1) - 1)} className="px-1">
                                            &#8722;
                                          </button>)}
                                        <span className="px-1">{quantities[key] || 1}</span>
                                        {editMode && (<button type="button" onClick={() => changeQuantity(key, (quantities[key] || 1) + 1)} className="px-1">
                                            +
                                          </button>)}
                                      </div>)}
                                  </div>
                                  <InventoryListingBadges listing={listing}/>
                                </div>);
                        })}
                          </div>)}
                      </div>);
            })}
              </div>
            </section>
          </>)}
      </div>
    </div>);
}
