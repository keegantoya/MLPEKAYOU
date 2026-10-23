import InventoryBulkEdit from "@/components/InventoryBulkEdit";
import CardImage from "@/components/CardImage";
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { englishStarterDecks } from "@/lib/english-card-catalog";
import { inventoryStorageSetId, resolveInventorySet, buildInventoryProgress, buildInventoryRecordMap, getInventoryOwnedCards, isInventoryDeckComplete, getInventoryWriteTarget, fetchInventoryProgress, fetchInventoryListings, fetchInventoryQuantities, type InventoryTarget, type InventoryCard, isInventoryMerchandise, getInventoryCardImage, getInventoryCardImageStyle, getInventoryRarityLabel } from "@/lib/english-inventory";
const getDisplayCode = (card: InventoryCard) => card.code;
export default function MyTradesSets() {
const { setId } = useParams();
const navigate = useNavigate();
const set = resolveInventorySet(setId);
const resolvedSetId = set?.id ?? "";
const merchandise = isInventoryMerchandise(resolvedSetId);
const itemWord = merchandise ? "items" : "cards";
const [loading, setLoading] = useState(true);
const [loadError, setLoadError] = useState("");
const [quantityTargets, setQuantityTargets] = useState<Record<string, InventoryTarget>>({});
const [listingTargets, setListingTargets] = useState<Record<string, InventoryTarget>>({});
const [collapsedRarities, setCollapsedRarities] = useState<Record<string, boolean>>({});
const [progressMap, setProgressMap] = useState<Record<string, Record<string, boolean>>>({});
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
const [selectedCard, setSelectedCard] = useState<InventoryCard | null>(null);
const [listingDraft, setListingDraft] = useState<ListingDraft | null>(null);
const [savedListingDraft, setSavedListingDraft] = useState<ListingDraft | null>(null);
const [isSavingCard, setIsSavingCard] = useState(false);
const savingCardRef = useRef(false);
const [isSavingInventory, setIsSavingInventory] = useState(false);
const savingInventoryRef = useRef(false);
const [inventorySaveError, setInventorySaveError] = useState("");
const [cardSaveError, setCardSaveError] = useState("");
const [quantities, setQuantities] = useState<Record<string, number>>({});
const [savedQuantities, setSavedQuantities] = useState<Record<string, number>>({});
const [editMode, setEditMode] = useState(false);
const [showBulkEdit, setShowBulkEdit] = useState(false);
const [inventoryDirty, setInventoryDirty] = useState(false);
const [showIntroPopup, setShowIntroPopup] = useState(false);
const [showLeavePopup, setShowLeavePopup] = useState(false);
const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
const [activeDeck, setActiveDeck] = useState<number | null>(null);
const inventoryDirtyRef = useRef(false);
const navigationGuardRef = useRef(false);
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
let requestId = 0;
let activeUserId = "";
const load = async () => {
const request = ++requestId;
            setLoadError("");
            try {
const { data, error: authError } = await supabase.auth.getSession();
                if (authError)
                    throw authError;
                if (disposed || request !== requestId)
                    return;
const user = data.session?.user;
                if (!user || !resolvedSetId)
                    return;
                activeUserId = user.id;
const [progressRows, listings, qtyData] = await Promise.all([
                    fetchInventoryProgress(user.id), fetchInventoryListings(user.id, resolvedSetId), fetchInventoryQuantities(user.id, resolvedSetId),
                ]);
                if (disposed || request !== requestId || inventoryDirtyRef.current)
                    return;
const listingRows = buildInventoryRecordMap(listings, resolvedSetId);
const qtyRows = buildInventoryRecordMap(qtyData, resolvedSetId);
const listingMap: Record<string, MarketListing> = {};
                for (const [key, listing] of Object.entries(listingRows))
                    listingMap[key] = {
                        is_for_trade: Boolean(listing.is_for_trade), is_for_sale: Boolean(listing.is_for_sale),
                        asking_price: listing.asking_price === null ? null : Number(listing.asking_price),
                        trade_quantity: Number(listing.trade_quantity || 0), sale_quantity: Number(listing.sale_quantity || 0),
                    };
const qtyMap = Object.fromEntries(Object.entries(qtyRows).map(([key, row]) => [key, Number(row.quantity)]));
                setProgressMap(buildInventoryProgress(progressRows));
                setMarketListings(listingMap);
                setQuantities(qtyMap);
                setSavedQuantities(qtyMap);
                setQuantityTargets(qtyRows);
                setListingTargets(listingRows);
                setInventoryDirty(false);
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
const clear = () => {
            setProgressMap({});
            setMarketListings({});
            setQuantities({});
            setSavedQuantities({});
            setQuantityTargets({});
            setListingTargets({});
            setShowBulkEdit(false);
            setSelectedCard(null);
            setListingDraft(null);
            setSavedListingDraft(null);
            setInventoryDirty(false);
            inventoryDirtyRef.current = false;
            setActiveDeck(null);
            setEditMode(false);
        };
        clear();
        setLoading(true);
        void load();
const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_OUT") {
                activeUserId = "";
                requestId++;
                clear();
                setLoading(false);
            }
            else if (event === "SIGNED_IN" && session?.user.id !== activeUserId) {
                activeUserId = session?.user.id ?? "";
                clear();
                setLoading(true);
                queueMicrotask(() => void load());
            }
        });
        return () => { disposed = true; requestId++; subscription.unsubscribe(); };
    }, [resolvedSetId]);
    useEffect(() => {
const INTRO_KEY = "mlpekayou_inventory_intro_seen";
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
const originalPushState = window.history.pushState.bind(window.history);
const originalReplaceState = window.history.replaceState.bind(window.history);
const guardNavigation = (originalMethod: typeof window.history.pushState, state: any, title: string, url?: string | URL | null) => {
            if (inventoryDirtyRef.current &&
                !navigationGuardRef.current &&
                url &&
                String(url) !== window.location.href) {
                navigationGuardRef.current = true;
                setPendingNavigation(new URL(String(url), window.location.origin).pathname);
                setShowLeavePopup(true);
                navigationGuardRef.current = false;
                return;
            }
            originalMethod(state, title, url);
        };
const guardedPushState: History["pushState"] = function (state, title, url) {
            guardNavigation(originalPushState, state, title, url);
        };
const guardedReplaceState: History["replaceState"] = function (state, title, url) {
            guardNavigation(originalReplaceState, state, title, url);
        };
        window.history.pushState = guardedPushState;
        window.history.replaceState = guardedReplaceState;
        return () => {
            window.history.pushState = originalPushState;
            window.history.replaceState = originalReplaceState;
        };
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
        if (!selectedCard)
            return;
const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
const preventEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape")
                event.preventDefault();
        };
        window.addEventListener("keydown", preventEscape);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", preventEscape);
        };
    }, [selectedCard]);
    useEffect(() => {
const dirty = Object.keys(quantities).some(key => (quantities[key] ?? 1) !== (savedQuantities[key] ?? 1)) ||
            (!!listingDraft && !!savedListingDraft && JSON.stringify(listingDraft) !== JSON.stringify(savedListingDraft));
        setInventoryDirty(dirty);
        inventoryDirtyRef.current = dirty;
    }, [listingDraft, savedListingDraft, quantities, savedQuantities]);
const changeQuantity = (cardKey: string, value: number) => {
const next = Math.max(1, Math.trunc(Number.isFinite(value) ? value : 1));
        setQuantities((prev) => {
const updated = { ...prev, [cardKey]: next };
const dirty = Object.keys(updated).some((key) => (updated[key] ?? 1) !== (savedQuantities[key] ?? 1));
            setInventoryDirty(dirty);
            inventoryDirtyRef.current = dirty;
            return updated;
        });
    };
const saveInventoryChanges = async (excludeCardKey?: string): Promise<boolean> => {
        if (savingInventoryRef.current)
            return false;
        savingInventoryRef.current = true;
        setIsSavingInventory(true);
        setInventorySaveError("");
        try {
const { data } = await supabase.auth.getSession();
const user = data.session?.user;
            if (!user)
                throw new Error("Please sign in again before saving.");
const keys = new Set([...Object.keys(savedQuantities), ...Object.keys(quantities)]);
const changedKeys = Array.from(keys).filter((key) => key !== excludeCardKey && (quantities[key] || 1) !== (savedQuantities[key] || 1));
            if (changedKeys.length > 0) {
const results = await Promise.all(changedKeys.map((cardKey) => supabase.from("card_quantity").upsert({
                    user_id: user.id,
                    ...getInventoryWriteTarget(resolvedSetId, cardKey, quantityTargets[cardKey]),
                    quantity: Math.max(1, quantities[cardKey] || 1),
                })));
const failed = results.find((result) => result.error);
                if (failed?.error) {
                    throw failed.error;
                }
            }
            setSavedQuantities(current => ({ ...current, ...Object.fromEntries(Object.entries(quantities).filter(([key]) => key !== excludeCardKey)) }));
const dirty = !!listingDraft && !!savedListingDraft && JSON.stringify(listingDraft) !== JSON.stringify(savedListingDraft);
            setInventoryDirty(dirty);
            inventoryDirtyRef.current = dirty;
            return true;
        }
        catch {
            setInventorySaveError("Your quantities could not be saved. Please try again.");
            return false;
        }
        finally {
            savingInventoryRef.current = false;
            setIsSavingInventory(false);
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
        if (savingInventoryRef.current || savingCardRef.current)
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
const openCardDetails = (card: InventoryCard) => {
const draft = toDraft(card.key);
        setSelectedCard(card);
        setListingDraft(draft);
        setSavedListingDraft(draft);
        setCardSaveError("");
    };
const updateListingDraft = (changes: Partial<ListingDraft>) => {
        setListingDraft((current) => (current ? { ...current, ...changes } : current));
    };
const saveCardDetails = async (): Promise<boolean> => {
        if (savingCardRef.current || !selectedCard || !listingDraft)
            return false;
const personalQuantity = Math.max(1, Math.trunc(Number(listingDraft.personalQuantity) || 1));
const tradeQuantity = listingDraft.isForTrade
            ? Math.max(1, Math.trunc(Number(listingDraft.tradeQuantity) || 1))
            : 0;
const saleQuantity = listingDraft.isForSale
            ? Math.max(1, Math.trunc(Number(listingDraft.saleQuantity) || 1))
            : 0;
const askingPrice = listingDraft.isForSale && listingDraft.askingPrice !== ""
            ? Number(listingDraft.askingPrice)
            : null;
        if (listingDraft.isForSale &&
            (askingPrice === null || !Number.isFinite(askingPrice) || askingPrice < 0)) {
            setCardSaveError("Enter a valid sale price.");
            return false;
        }
        savingCardRef.current = true;
        setIsSavingCard(true);
        try {
            setCardSaveError("");
const { data } = await supabase.auth.getSession();
const user = data.session?.user;
            if (!user) {
                setCardSaveError("Please sign in again before saving.");
                setIsSavingCard(false);
                return false;
            }
const cardKey = selectedCard.key;
const savedPersonalQuantity = savedQuantities[cardKey] ?? 1;
const quantityRequest = personalQuantity !== savedPersonalQuantity
                ? supabase.from("card_quantity").upsert({
                    user_id: user.id,
                    ...getInventoryWriteTarget(resolvedSetId, cardKey, quantityTargets[cardKey]),
                    quantity: personalQuantity,
                })
                : Promise.resolve({ error: null });
const listingRequest = !listingDraft.isForTrade && !listingDraft.isForSale
                ? supabase
                    .from("card_market_listings")
                    .delete()
                    .eq("user_id", user.id)
                    .eq("set_id", getInventoryWriteTarget(resolvedSetId, cardKey, listingTargets[cardKey]).set_id)
                    .eq("card_key", getInventoryWriteTarget(resolvedSetId, cardKey, listingTargets[cardKey]).card_key)
                : supabase.from("card_market_listings").upsert({
                    user_id: user.id,
                    ...getInventoryWriteTarget(resolvedSetId, cardKey, listingTargets[cardKey]),
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
            return true;
        }
        catch {
            setCardSaveError("Your changes could not be saved. Please try again.");
            return false;
        }
        finally {
            savingCardRef.current = false;
            setIsSavingCard(false);
        }
    };
    if (!set) {
        return (<div className={isLightMode
                ? "min-h-screen bg-[#f5f5f3] text-zinc-600"
                : "min-h-screen bg-[#0d0f10] text-zinc-400"}>
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">Invalid set</div>
      </div>);
    }
const progress = progressMap[set.id] ?? {};
const ownedBonusCards = getInventoryOwnedCards(set.id, progress);
const completeDecks = set.id === "SD" ? englishStarterDecks.filter(deck => isInventoryDeckComplete(progress, deck.code)) : [];
const hasStarterDeck = completeDecks.length > 0;
const rarityOrder = Object.keys(set.rarities);
const rarityGroups = Object.entries(ownedBonusCards.reduce((groups: Record<string, InventoryCard[]>, card) => {
        (groups[card.rarity] ??= []).push(card);
        return groups;
    }, {})).sort(([a], [b]) => rarityOrder.indexOf(b) - rarityOrder.indexOf(a));
const activeListingsCount = Object.values(marketListings).filter((listing) => listing.is_for_trade || listing.is_for_sale).length;
    return (<div className={`min-h-screen pb-24 transition-colors ${isLightMode ? "bg-[#f5f5f3] text-zinc-900" : "bg-[#0d0f10] text-white"}`}>
      <div className="mx-auto w-full max-w-[1500px] px-3 py-4 sm:px-5 sm:py-6 lg:px-7">
        {selectedCard && listingDraft && (<div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/65 p-2 backdrop-blur-md sm:p-5" role="dialog" aria-modal="true" aria-labelledby="card-details-title" onMouseDown={(event) => event.preventDefault()}>
            <div className={`max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-[20px] shadow-2xl md:max-w-4xl md:rounded-[26px] ${isLightMode ? "bg-white text-zinc-900" : "bg-[#17191a] text-white"}`} onMouseDown={(event) => event.stopPropagation()}>
              <div className="grid md:grid-cols-[minmax(250px,0.85fr)_minmax(320px,1.15fr)]">
                <div className={`flex items-center justify-center p-2.5 sm:p-6 ${isLightMode ? "bg-zinc-100" : "bg-black/25"}`}>
                  <div className={`relative w-full ${selectedCard.square ? "aspect-square max-w-[170px] md:max-w-[420px]" : selectedCard.wide
                ? "aspect-[10/7] max-w-[170px] md:max-w-[520px]"
                : "aspect-[5/7] max-w-[105px] md:max-w-[310px]"} overflow-hidden rounded-xl md:rounded-2xl`}>
                    <CardImage src={getInventoryCardImage(selectedCard)} imageSize={selectedCard.original ? "original" : undefined} alt={selectedCard.code} style={getInventoryCardImageStyle(selectedCard)} draggable={false}/>
                  </div>
                </div>
                <div className="flex flex-col p-3 sm:p-6">
                  <div>
                    <div className={`text-[10px] font-medium uppercase tracking-[0.14em] sm:text-xs sm:tracking-[0.18em] ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                      {merchandise ? "Item details" : "Card identification code"}
                    </div>
                    <h2 id="card-details-title" className="mt-0.5 text-lg font-bold sm:mt-1 sm:text-2xl">
                      {getDisplayCode(selectedCard)}
                    </h2>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-5">
                    <button type="button" disabled={isSavingCard} onClick={() => updateListingDraft({
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
                    <button type="button" disabled={isSavingCard} onClick={() => updateListingDraft({
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
                        <input type="text" inputMode="decimal" disabled={isSavingCard || !listingDraft.isForSale} value={listingDraft.askingPrice} onChange={(event) => {
const value = event.target.value;
                if (/^\d*(\.\d{0,2})?$/.test(value))
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
                          <input type="text" inputMode="numeric" disabled={isSavingCard || !field.enabled} value={listingDraft[field.key]} onFocus={(event) => event.target.select()} onChange={(event) => {
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
                  <p className={`mt-1.5 text-center text-[10px] sm:mt-2 sm:text-xs ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                    Save your changes before returning to your inventory.
                  </p>
                </div>
              </div>
            </div>
          </div>)}
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
                <p>Tap any {merchandise ? "item" : "card"} to open its inventory, trade, and sale details.</p>
                <p>
                  An item can be marked for trade, sale, or both. Sale prices and public quantities
                  are saved with that item.
                </p>
                <p>The details popup stays open until your changes are saved.</p>
              </div>
              <div className={`flex justify-end border-t px-5 py-4 ${isLightMode ? "border-black/10" : "border-white/10"}`}>
                <button type="button" onClick={() => {
                try {
                    localStorage.setItem("mlpekayou_inventory_intro_seen", "true");
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
                  You changed quantities or listing details. Save them before leaving?
                </p>
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  <button type="button" disabled={isSavingInventory || isSavingCard} onClick={async () => {
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
                    {isSavingInventory || isSavingCard ? "Saving..." : "Save and leave"}
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
          <button type="button" onClick={() => requestNavigation("/inventory")} aria-label="Back to Inventory" className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 justify-self-start rounded-lg border border-black/10 bg-black/[0.025] px-2 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-black/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E7C84B]/60 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.06] md:px-3">
            <span aria-hidden="true">&#8592;</span><span className="hidden md:inline">Back to Inventory</span>
          </button>
          <div className="min-w-0 text-center">
            <h1 className="break-words text-lg font-semibold leading-tight sm:text-2xl lg:text-3xl">{set.name}</h1>
            <div className={`mt-1 flex flex-wrap justify-center gap-x-2 text-[11px] sm:text-xs ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
              <span>{ownedBonusCards.length} {itemWord} owned</span><span aria-hidden="true">&#8226;</span><span>{activeListingsCount} listed</span>
            </div>
          </div>
          <div className="flex min-w-0 flex-col items-end justify-self-end gap-2 sm:flex-row sm:items-center">
          <button type="button" onClick={handleEditToggle} disabled={isSavingInventory} className={`min-h-11 min-w-0 max-w-full rounded-lg border px-2 py-2 text-center text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E7C84B]/60 disabled:opacity-50 sm:px-4 sm:text-sm ${editMode ? "border-[#E7C84B] bg-[#E7C84B] text-black" : "border-black/10 bg-black/[0.025] hover:bg-black/[0.05] dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"}`}>
            {isSavingInventory ? "Saving..." : editMode ? "Save quantities" : "Quick edit"}
          </button>
            <button type="button" onClick={() => void openBulkEdit()} disabled={loading || !!loadError || isSavingInventory || isSavingCard || !ownedBonusCards.length} className="min-h-11 max-w-full rounded-lg border border-[#E7C84B]/40 bg-[#E7C84B]/10 px-2 py-2 text-xs font-semibold text-[#806100] transition-colors hover:bg-[#E7C84B]/20 disabled:opacity-40 sm:px-4 sm:text-sm dark:text-[#E7C84B]">Bulk edit</button>
          </div>
        </section>
        {showBulkEdit && <InventoryBulkEdit setId={set.id} storageSetId={inventoryStorageSetId(set.id)} setName={set.name} merchandise={merchandise} cards={ownedBonusCards} quantities={quantities} listings={marketListings} quantityTargets={quantityTargets} listingTargets={listingTargets} onClose={() => setShowBulkEdit(false)} onSaved={({ key, quantity, listing }) => {
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
        {inventorySaveError && <p role="alert" className="mt-3 text-sm text-red-500">{inventorySaveError}</p>}
        {loading ? <p role="status" className="py-10 text-center text-sm text-zinc-500">Loading inventory...</p> : loadError ? <p role="alert" className="py-10 text-center text-sm text-red-500">{loadError}</p> : (set.id === "SD"
            ? ownedBonusCards.length === 0 && !hasStarterDeck
            : ownedBonusCards.length === 0) ? (<section className="py-12 text-center">
            <h2 className="text-xl font-semibold">Inventory Empty</h2>
            <p className={`mx-auto mt-2 max-w-xl text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
              You don't currently own any {itemWord} in this collection. Add {itemWord} to your collection first,
              then they'll appear here.
            </p>
          </section>) : (<>
            {set.id === "SD" && (<section className="mt-6 border-b border-black/10 pb-5 dark:border-white/10">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-base font-semibold">Starter Decks</h2>
                  <span className={`text-xs ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                    {activeDeck !== null ? `Deck ${activeDeck + 1}` : "Select a deck"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                  {completeDecks.map((deck, i) => {
const isActive = activeDeck === i;
                    return (<div key={deck.code} onClick={(e) => {
                            e.stopPropagation();
                            setActiveDeck(isActive ? null : i);
                        }} className={`cursor-pointer border-b-2 py-2 transition-colors ${isActive ? "border-[#E7C84B]" : "border-transparent hover:border-zinc-300 dark:hover:border-zinc-600"}`}>
                          <div className="relative mx-auto max-w-[150px]">
                            <CardImage src={deck.image} alt={deck.name} className="h-28 w-full object-contain sm:h-32"/>
                            <div onClick={(e) => e.stopPropagation()} className={`absolute bottom-1 right-1 flex items-center rounded-lg border px-1.5 py-1 text-xs font-semibold ${isLightMode
                            ? "border-black/10 bg-white text-zinc-700"
                            : "border-white/10 bg-[#151718] text-zinc-200"}`}>
                              {editMode && (<button type="button" onClick={() => changeQuantity(deck.code, (quantities[deck.code] || 1) - 1)} className="px-1">
                                  &#8722;
                                </button>)}
                              <span className="px-1">{quantities[deck.code] || 1}</span>
                              {editMode && (<button type="button" onClick={() => changeQuantity(deck.code, (quantities[deck.code] || 1) + 1)} className="px-1">
                                  \+
                                </button>)}
                            </div>
                          </div>
                          <div className="mt-2 text-center">
                            <div className={`text-xs ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                              {deck.code}
                            </div>
                            <div className="mt-0.5 text-sm font-semibold">{deck.name}</div>
                          </div>
                        </div>);
                })}
                </div>
              </section>)}
            <section className="mt-6 min-w-0">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-3 dark:border-white/10">
                <div>
                  <h2 className="text-base font-semibold">{merchandise ? "Items" : "Cards"}</h2>
                  <p className={`mt-0.5 text-xs ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                    Tap {merchandise ? "an item" : "a card"} to edit its quantity, trade, and sale details.
                  </p>
                </div>
                <span className={`text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                  {activeListingsCount} listed
                </span>
              </div>
              <div className="divide-y divide-black/[0.08] dark:divide-white/[0.08]">
                {rarityGroups.map(([rarity, rarityCards]) => {
const collapseKey = `${set.id}-${rarity}`;
const isCollapsed = collapsedRarities[collapseKey];
const rarityLabel = getInventoryRarityLabel(set.id, rarity);
                return (<div key={rarity} className="min-w-0 py-4 first:pt-0 last:pb-0">
                        <button type="button" onClick={() => setCollapsedRarities((prev) => ({
                        ...prev,
                        [collapseKey]: !prev[collapseKey],
                    }))} className="flex w-full items-center justify-between gap-3 py-2 text-left transition-opacity hover:opacity-70">
                          <span className="text-sm font-semibold">{rarityLabel}</span>
                          <span className={`text-xs ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                            {rarityCards.length} {itemWord} {isCollapsed ? "+" : "-"}
                          </span>
                        </button>
                        {!isCollapsed && (<div className="grid grid-cols-3 gap-1.5 pt-1 sm:grid-cols-4 sm:gap-2 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-9">
                            {rarityCards.map((card) => {
const key = card.key;
const listing = marketListings[key];
const isDoubleCard = card.wide;
                            return (<div key={key} onClick={() => openCardDetails(card)} className={`group relative cursor-pointer overflow-hidden rounded-xl p-0.5 transition ${listing?.is_for_trade && listing?.is_for_sale
                                    ? "border-violet-500"
                                    : listing?.is_for_trade
                                        ? "border-emerald-500"
                                        : listing?.is_for_sale
                                            ? "border-sky-500"
                                            : ""} ${card.square ? "aspect-square" : isDoubleCard ? "col-span-2 aspect-[10/7]" : "aspect-[5/7]"}`}>
                                  <div className="relative h-full w-full overflow-hidden rounded-[10px]">
                                    <CardImage src={getInventoryCardImage(card)} imageSize={card.original ? "original" : undefined} alt={card.code} style={getInventoryCardImageStyle(card)} draggable={false}/>
                                  </div>
                                  <div onClick={(e) => e.stopPropagation()} className="absolute bottom-1 right-1">
                                    {editMode && window.innerWidth >= 768 ? (<div className={`flex items-center rounded-lg border px-1 text-xs font-semibold ${isLightMode
                                        ? "border-black/10 bg-white/90 text-zinc-700"
                                        : "border-white/10 bg-black/80 text-zinc-200"}`}>
                                        <input type="text" inputMode="numeric" value={String(quantities[key] || "")} placeholder="1" onClick={(e) => e.stopPropagation()} onFocus={(e) => e.target.select()} onChange={(e) => {
const raw = e.target.value;
                                        if (raw === "") {
                                            setQuantities((prev) => {
const updated = {
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
                                        if (!isNaN(value)) {
                                            setQuantities((prev) => {
const updated = {
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
                                    }} className="w-8 bg-transparent py-1 text-center outline-none"/>
                                      </div>) : (<div className={`flex items-center rounded-lg border px-1 py-0.5 text-xs font-semibold ${isLightMode
                                        ? "border-black/10 bg-white/90 text-zinc-700"
                                        : "border-white/10 bg-black/80 text-zinc-200"}`}>
                                        {editMode && (<button type="button" onClick={() => changeQuantity(key, (quantities[key] || 1) - 1)} className="px-1">
                                            &#8722;
                                          </button>)}
                                        <span className="px-1">{quantities[key] || 1}</span>
                                        {editMode && (<button type="button" onClick={() => changeQuantity(key, (quantities[key] || 1) + 1)} className="px-1">
                                            \+
                                          </button>)}
                                      </div>)}
                                  </div>
                                  {(listing?.is_for_trade || listing?.is_for_sale) && (<div className={`absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ${listing.is_for_trade && listing.is_for_sale
                                        ? "bg-violet-500"
                                        : listing.is_for_trade
                                            ? "bg-emerald-500"
                                            : "bg-sky-500"}`}>
                                      &#10003;
                                    </div>)}
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
