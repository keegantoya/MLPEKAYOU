import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
const sets = [
  {
    id: "1",
    name: "Eternal Moon: First Edition",
    folder: "first-edition-moon",
    prefix: "M1",
    rarities: {
      R: 30,
      SR: 20,
      SSR: 54,
      HR: 36,
      UR: 16,
      LSR: 15,
      SGR: 8,
      SC: 7,
    },
  },
  {
    id: "2",
    name: "Eternal Moon: Second Edition",
    folder: "second-edition-moon",
    prefix: "M2",
    rarities: {
      R: 30,
      SR: 20,
      SSR: 54,
      HR: 30,
      UR: 16,
      LSR: 16,
      SGR: 8,
      ZR: 7,
      SC: 7,
      "SHINING ZR": 1,
    },
  },
  {
    id: "5",
    name: "Rainbow: First Edition",
    folder: "rainbow-one",
    prefix: "R1",
    rarities: {
      R: 30,
      SR: 15,
      FR: 18,
      TR: 12,
      TGR: 8,
      MTR: 18,
      SSR: 15,
      UR: 15,
      USR: 8,
      XR: 7,
    },
  },
  {
    id: "6",
    name: "Rainbow: Second Edition",
    folder: "rainbow-two",
    prefix: "R2",
    rarities: {
      BASE: 18,
      R: 30,
      SR: 14,
      ST: 20,
      TR: 12,
      TGR: 8,
      SSR: 15,
      FR: 18,
      UR: 19,
      USR: 8,
      XR: 8,
    },
  },
  {
    id: "7",
    name: "Fun Moments: First Edition",
    folder: "fun-moments-one",
    prefix: "FM1",
    rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, CR: 12 },
  },
  {
    id: "8",
    name: "Fun Moments: Second Edition",
    folder: "fun-moments-two",
    prefix: "FM2",
    rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, UGR: 9, CR: 12 },
  },
  {
    id: "11",
    name: "Fun Moments: Third Edition",
    folder: "fun-moments-three",
    prefix: "FM3",
    rarities: {
      N: 20,
      SN: 20,
      R: 35,
      SR: 15,
      SSR: 15,
      UR: 10,
      UGR: 9,
      CR: 12,
      SCR: 12,
    },
  },
  {
    id: "3",
    name: "Eternal Moon: Third Edition",
    folder: "third-edition-moon",
    prefix: "M3",
    rarities: {
      R: 60,
      SR: 40,
      SSR: 40,
      HR: 60,
      UR: 18,
      LSR: 32,
      SGR: 16,
      ZR: 14,
      SC: 7,
      SZR: 3,
    },
  },
  {
    id: "4",
    name: "Star: First Edition",
    folder: "star-one",
    prefix: "S1",
    rarities: {
      SSR: 20,
      SCR: 18,
      UR: 18,
      USR: 15,
      AR: 9,
      OR: 7,
      BP: 9,
      SAR: 9,
    },
  },
  {
    id: "9",
    name: "Promotional Cards",
    folder: "promos",
    prefix: "PR",
    rarities: { PR: 12 },
  },
  {
    id: "FW",
    name: "Fantasy Wonderland",
    folder: "fantasy-wonderland",
    prefix: "FW",
    rarities: {},
  },
  {
    id: "friendshipsbegin",
    name: "Friendships Begin",
    folder: "friendshipsbegin",
    prefix: "SD01",
    rarities: {},
  },
  {
    id: "12",
    name: "Discord",
    folder: "discord",
    prefix: "BP02",
    rarities: {},
  },
  {
    id: "tcgpromos",
    name: "TCG Promos",
    folder: "tcgpromos",
    prefix: "RR",
    rarities: { PR: 18 },
  },
];
const getDisplayCode = (card: any, currentSetId: string) => {
  const key = String(card.key || "");
  //  Promotional Cards: the six SDCC cards are PR-8 through PR-13.
  if (currentSetId === "9") {
    const num = Number(card.number);
    if (num >= 8 && num <= 13) {
      return `SDCC-${String(num - 7).padStart(2, "0")}`;
    }
    return key;
  }
  //  TCG Promos:// RR01–RR06// ※BP01-CR07–※BP01-CR12// ※BP02-CR01–※BP02-CR06
  if (currentSetId === "tcgpromos") {
    const match = key.match(/^RR(\d+)$/);
    if (match) {
      const num = Number(match[1]);
      if (num >= 1 && num <= 6) {
        return `RR${String(num).padStart(2, "0")}`;
      }
      if (num >= 7 && num <= 12) {
        return `※BP01-CR${String(num).padStart(2, "0")}`;
      }
      if (num >= 13 && num <= 18) {
        return `※BP02-CR${String(num - 12).padStart(2, "0")}`;
      }
    }
    return key;
  }
  //  Friendships Begin / SD01.// P-prefixed rarities lose the P in display, and the reference mark// goes BEFORE the SD01 prefix:// SD01PER01 -> ※SD01-ER01// SD01PRR01 -> ※SD01-RR01// SD01PSPR01 -> ※SD01-SPR01
  if (currentSetId === "friendshipsbegin") {
    const match = key.match(
      /^SD01(PSPR|PCR|PGR|PER|PRR|SPR|GR|CR|SR|ER|U|C)(\d+)$/,
    );
    if (match) {
      const [, rarity, number] = match;
      const isReferenceRarity = rarity.startsWith("P");
      const displayRarity = isReferenceRarity ? rarity.slice(1) : rarity;
      return `${isReferenceRarity ? "※" : ""}SD01-${displayRarity}${number}`;
    }
  }
  //  Fantasy Wonderland / BP01.
  if (currentSetId === "FW") {
    const match = key.match(
      /^BP01(PSPR|PCR|PGR|PER|PRR|SPR|GR|CR|RR|SR|ER|U|C)(\d+)$/,
    );
    if (match) {
      const [, rarity, number] = match;
      const displayRarity =
        rarity === "PSPR"
          ? "SPR"
          : rarity === "PCR"
            ? "CR"
            : rarity === "PGR"
              ? "GR"
              : rarity === "PER"
                ? "ER"
                : rarity === "PRR"
                  ? "RR"
                  : rarity;
      const reference = ["PSPR", "PCR", "PGR", "PER", "PRR"].includes(rarity)
        ? "※"
        : "";
      return `${reference}BP01-${displayRarity}${number}`;
    }
  }
  //  Discord / BP02. A2/B2 are image variants of the same displayed card code.
  if (currentSetId === "12") {
    const match = key.match(
      /^BP02-(PSPR|PCR|PGR|PER|PRR|SPR|GR|CR|RR|SR|ER|U|C)(\d+)(?:-(?:A2|B2))?$/,
    );
    if (match) {
      const [, rarity, number] = match;
      const displayRarity =
        rarity === "PSPR"
          ? "SPR"
          : rarity === "PCR"
            ? "CR"
            : rarity === "PGR"
              ? "GR"
              : rarity === "PER"
                ? "ER"
                : rarity === "PRR"
                  ? "RR"
                  : rarity;
      const reference = ["PSPR", "PCR", "PGR", "PER", "PRR"].includes(rarity)
        ? "※"
        : "";
      return `${reference}BP02-${displayRarity}${number}`;
    }
  }
  //  All SN cards display the S rarity as a diamond.// The normal set keys are "SN-1", "SN-2", etc.
  if (key.startsWith("SN-")) {
    return `◇N-${key.slice(3)}`;
  }
  //  Also handle compact SN keys if one is supplied by a special set.
  const compactSnMatch = key.match(/^(.\*?)(?:SN)(\d+)$/);
  if (compactSnMatch) {
    return `${compactSnMatch[1]}◇N${compactSnMatch[2]}`;
  }
  //  SCR uses the diamond form ONLY in Fun Moments.// The normal keys are "SCR-1", "SCR-2", etc.
  if (["7", "8", "11"].includes(currentSetId)) {
    if (key.startsWith("SCR-")) {
      return `◇CR-${key.slice(4)}`;
    }
    const compactScrMatch = key.match(/^(.\*?)(?:SCR)(\d+)$/);
    if (compactScrMatch) {
      return `${compactScrMatch[1]}◇CR${compactScrMatch[2]}`;
    }
  }
  //  Both SHINING ZR and SZR display as ◇ZR.
  const zrMatch = key.match(/^(?:SHINING ZR|SZR)-?(\d+)$/);
  if (zrMatch) {
    return `◇ZR-${zrMatch[1]}`;
  }
  return key;
};
export default function MyTradesSets() {
  const { setId } = useParams();
  const navigate = useNavigate();
  const getRarityCode = (rarity: string) => {
    if (rarity === "SHINING ZR") return "SZR";
    return rarity;
  };
  const [collapsedRarities, setCollapsedRarities] = useState<
    Record<string, boolean>
  >({});
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
  const [marketListings, setMarketListings] = useState<
    Record<string, MarketListing>
  >({});
  const [selectedCard, setSelectedCard] = useState<any | null>(null);
  const [listingDraft, setListingDraft] = useState<ListingDraft | null>(null);
  const [savedListingDraft, setSavedListingDraft] =
    useState<ListingDraft | null>(null);
  const [isSavingCard, setIsSavingCard] = useState(false);
  const [cardSaveError, setCardSaveError] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [savedQuantities, setSavedQuantities] = useState<
    Record<string, number>
  >({});
  const [editMode, setEditMode] = useState(false);
  const [inventoryDirty, setInventoryDirty] = useState(false);
  const [showIntroPopup, setShowIntroPopup] = useState(false);
  const [showLeavePopup, setShowLeavePopup] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null,
  );
  const [activeDeck, setActiveDeck] = useState<number | null>(null);
  const inventoryDirtyRef = useRef(false);
  const navigationGuardRef = useRef(false);
  const [isLightMode, setIsLightMode] = useState(() => {
    if (typeof document === "undefined") return false;
    const root = document.documentElement;
    return root.dataset.theme === "light" || root.classList.contains("light");
  });
  useEffect(() => {
    const syncTheme = () => {
      const root = document.documentElement;
      setIsLightMode(
        root.dataset.theme === "light" ||
          root.classList.contains("light") ||
          !root.classList.contains("dark"),
      );
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
    const load = async (userOverride?: any) => {
      //  Never overwrite unsaved inventory edits with a fresh database load.// Supabase can refresh the auth session when a browser tab becomes active.
      if (inventoryDirtyRef.current) {
        return;
      }
      let user = userOverride;
      if (!user) {
        const { data } = await supabase.auth.getSession();
        user = data.session?.user;
      }
      //  handle logged-out case
      if (!user) {
        setProgressMap({});
        setMarketListings({});
        setQuantities({});
        return;
      }
      //  🔹 LOAD PROGRESS
      const { data: progress } = await supabase
        .from("collection_progress")
        .select("set_id, progress")
        .eq("user_id", user.id);
      const map: Record<string, any> = {};
      progress?.forEach((row: any) => {
        map[row.set_id] = row.progress || {};
      });
      // Load the richer trade and sale details without changing the existing tables.
      const { data: listings } = await supabase
        .from("card_market_listings")
        .select(
          "card_key, is_for_trade, is_for_sale, asking_price, trade_quantity, sale_quantity",
        )
        .eq("set_id", resolvedSetId)
        .eq("user_id", user.id);
      const listingMap: Record<string, MarketListing> = {};
      listings?.forEach((listing: any) => {
        listingMap[listing.card_key] = {
          is_for_trade: Boolean(listing.is_for_trade),
          is_for_sale: Boolean(listing.is_for_sale),
          asking_price:
            listing.asking_price === null ? null : Number(listing.asking_price),
          trade_quantity: Number(listing.trade_quantity || 0),
          sale_quantity: Number(listing.sale_quantity || 0),
        };
      });
      setMarketListings(listingMap);
      //  🔹 LOAD QUANTITIES
      const { data: qtyData } = await supabase
        .from("card_quantity")
        .select("card_key, quantity")
        .eq("set_id", resolvedSetId)
        .eq("user_id", user.id);
      const qtyMap: Record<string, number> = {};
      qtyData?.forEach((row: any) => {
        qtyMap[row.card_key] = row.quantity;
      });
      setQuantities(qtyMap);
      setSavedQuantities(qtyMap);
      setProgressMap(map);
      setInventoryDirty(false);
    };
    //  initial load
    load();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      //  Do not reload inventory for auth/session refresh events.// Those can happen when the browser tab becomes active and would// overwrite unsaved quantity edits with old database values.
      if (event === "SIGNED_OUT") {
        setProgressMap({});
        setMarketListings({});
        setQuantities({});
        setSavedQuantities({});
        setInventoryDirty(false);
        inventoryDirtyRef.current = false;
      }
    });
    return () => subscription.unsubscribe();
  }, [setId]);
  useEffect(() => {
    const INTRO_KEY = "mlpekayou_inventory_intro_seen";
    try {
      const hasSeenIntro = localStorage.getItem(INTRO_KEY) === "true";
      setShowIntroPopup(!hasSeenIntro);
    } catch {
      setShowIntroPopup(false);
    }
  }, []);
  useEffect(() => {
    inventoryDirtyRef.current = inventoryDirty;
  }, [inventoryDirty]);
  useEffect(() => {
    const handleKayouHeaderNavigation = (event: Event) => {
      const customEvent = event as CustomEvent<{ destination?: string }>;
      const destination = customEvent.detail?.destination;
      if (!inventoryDirtyRef.current || !destination) {
        return;
      }
      event.preventDefault();
      setPendingNavigation(destination);
      setShowLeavePopup(true);
    };
    window.addEventListener(
      "mlpekayou:before-navigation",
      handleKayouHeaderNavigation,
    );
    return () => {
      window.removeEventListener(
        "mlpekayou:before-navigation",
        handleKayouHeaderNavigation,
      );
    };
  }, []);
  useEffect(() => {
    const originalPushState = window.history.pushState.bind(window.history);
    const originalReplaceState = window.history.replaceState.bind(
      window.history,
    );
    const guardNavigation = (
      originalMethod: typeof window.history.pushState,
      state: any,
      title: string,
      url?: string | URL | null,
    ) => {
      if (
        inventoryDirtyRef.current &&
        !navigationGuardRef.current &&
        url &&
        String(url) !== window.location.href
      ) {
        navigationGuardRef.current = true;
        setPendingNavigation(
          new URL(String(url), window.location.origin).pathname,
        );
        setShowLeavePopup(true);
        navigationGuardRef.current = false;
        return;
      }
      originalMethod(state, title, url);
    };
    const guardedPushState: History["pushState"] = function (
      state,
      title,
      url,
    ) {
      guardNavigation(originalPushState, state, title, url);
    };
    const guardedReplaceState: History["replaceState"] = function (
      state,
      title,
      url,
    ) {
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
      if (!inventoryDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [inventoryDirty]);
  useEffect(() => {
    if (!selectedCard) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const preventEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") event.preventDefault();
    };
    window.addEventListener("keydown", preventEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", preventEscape);
    };
  }, [selectedCard]);
  useEffect(() => {
    if (!listingDraft || !savedListingDraft) return;
    const dirty =
      JSON.stringify(listingDraft) !== JSON.stringify(savedListingDraft);
    setInventoryDirty(dirty);
    inventoryDirtyRef.current = dirty;
  }, [listingDraft, savedListingDraft]);
  const changeQuantity = (cardKey: string, value: number) => {
    const next = Math.max(1, value);
    setQuantities((prev) => {
      const updated = { ...prev, [cardKey]: next };
      const dirty = Object.keys(updated).some(
        (key) => (updated[key] ?? 1) !== (savedQuantities[key] ?? 1),
      );
      setInventoryDirty(dirty);
      inventoryDirtyRef.current = dirty;
      return updated;
    });
  };
  const saveInventoryChanges = async (): Promise<boolean> => {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (!user) return false;
    const keys = new Set([
      ...Object.keys(savedQuantities),
      ...Object.keys(quantities),
    ]);
    const changedKeys = Array.from(keys).filter(
      (key) => (quantities[key] || 1) !== (savedQuantities[key] || 1),
    );
    if (changedKeys.length > 0) {
      const results = await Promise.all(
        changedKeys.map((cardKey) =>
          supabase.from("card_quantity").upsert({
            user_id: user.id,
            set_id: resolvedSetId,
            card_key: cardKey,
            quantity: Math.max(1, quantities[cardKey] || 1),
          }),
        ),
      );
      const failed = results.find((result) => result.error);
      if (failed?.error) {
        console.error("Failed to save inventory changes:", failed.error);
        return false;
      }
    }
    setSavedQuantities({ ...quantities });
    setInventoryDirty(false);
    return true;
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
      if (!saved) return;
    }
    setEditMode(false);
  };
  const toDraft = (cardKey: string): ListingDraft => {
    const listing = marketListings[cardKey] || emptyListing;
    return {
      isForTrade: listing.is_for_trade,
      isForSale: listing.is_for_sale,
      askingPrice:
        listing.asking_price === null ? "" : listing.asking_price.toFixed(2),
      personalQuantity: String(quantities[cardKey] || 1),
      tradeQuantity: String(listing.trade_quantity || 0),
      saleQuantity: String(listing.sale_quantity || 0),
    };
  };
  const openCardDetails = (card: any) => {
    const draft = toDraft(card.key);
    setSelectedCard(card);
    setListingDraft(draft);
    setSavedListingDraft(draft);
    setCardSaveError("");
  };
  const updateListingDraft = (changes: Partial<ListingDraft>) => {
    setListingDraft((current) =>
      current ? { ...current, ...changes } : current,
    );
  };
  const saveCardDetails = async () => {
    if (!selectedCard || !listingDraft) return;
    const personalQuantity = Math.max(
      1,
      Number(listingDraft.personalQuantity) || 1,
    );
    const tradeQuantity = listingDraft.isForTrade
      ? Math.max(1, Number(listingDraft.tradeQuantity) || 1)
      : 0;
    const saleQuantity = listingDraft.isForSale
      ? Math.max(1, Number(listingDraft.saleQuantity) || 1)
      : 0;
    const askingPrice =
      listingDraft.isForSale && listingDraft.askingPrice !== ""
        ? Number(listingDraft.askingPrice)
        : null;
    if (
      listingDraft.isForSale &&
      (askingPrice === null || !Number.isFinite(askingPrice) || askingPrice < 0)
    ) {
      setCardSaveError("Enter a valid sale price.");
      return;
    }
    if (tradeQuantity > personalQuantity || saleQuantity > personalQuantity) {
      setCardSaveError(
        "Trade and sale quantities cannot be higher than your personal quantity.",
      );
      return;
    }
    setIsSavingCard(true);
    setCardSaveError("");
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (!user) {
      setCardSaveError("Please sign in again before saving.");
      setIsSavingCard(false);
      return;
    }
    const cardKey = selectedCard.key;
    const savedPersonalQuantity = savedQuantities[cardKey] ?? 1;
    const quantityRequest =
      personalQuantity !== savedPersonalQuantity
        ? supabase.from("card_quantity").upsert({
            user_id: user.id,
            set_id: resolvedSetId,
            card_key: cardKey,
            quantity: personalQuantity,
          })
        : Promise.resolve({ error: null });
    const listingRequest =
      !listingDraft.isForTrade && !listingDraft.isForSale
        ? supabase
            .from("card_market_listings")
            .delete()
            .eq("user_id", user.id)
            .eq("set_id", resolvedSetId)
            .eq("card_key", cardKey)
        : supabase.from("card_market_listings").upsert(
            {
              user_id: user.id,
              set_id: resolvedSetId,
              card_key: cardKey,
              is_for_trade: listingDraft.isForTrade,
              is_for_sale: listingDraft.isForSale,
              asking_price: askingPrice,
              trade_quantity: tradeQuantity,
              sale_quantity: saleQuantity,
            },
            { onConflict: "user_id,set_id,card_key" },
          );
    const [quantityResult, listingResult] = await Promise.all([
      quantityRequest,
      listingRequest,
    ]);
    if (quantityResult.error || listingResult.error) {
      console.error(
        "Failed to save card details:",
        quantityResult.error || listingResult.error,
      );
      setCardSaveError("Your changes could not be saved. Please try again.");
      setIsSavingCard(false);
      return;
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
      } else {
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
    setInventoryDirty(false);
    inventoryDirtyRef.current = false;
    setIsSavingCard(false);
    setSelectedCard(null);
    setListingDraft(null);
    setSavedListingDraft(null);
  };
  const slugMap: Record<string, string> = {
    "moon-one": "1",
    "moon-two": "2",
    "moon-three": "3",
    "star-one": "4",
    "rainbow-one": "5",
    "rainbow-two": "6",
    "fun-moments-one": "7",
    "fun-moments-two": "8",
    "fun-moments-three": "11",
    "promotional-cards": "9",
    "fantasy-wonderland": "FW",
    "friendships-begin": "friendshipsbegin",
    discord: "12",
    "tcg-promos": "tcgpromos",
  };
  const resolvedSetId = slugMap[setId || ""] || setId;
  const set = sets.find((s) => s.id === resolvedSetId);
  if (!set) {
    return (
      <div
        className={
          isLightMode
            ? "min-h-screen bg-[#f5f5f3] text-zinc-600"
            : "min-h-screen bg-[#0d0f10] text-zinc-400"
        }
      >
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          Invalid set
        </div>
      </div>
    );
  }
  let cards: any[] = [];
  if (set.id === "friendshipsbegin") {
    const BONUS_STRUCTURE = [
      { prefix: "SD01C", count: 9 },
      { prefix: "SD01U", count: 7 },
      { prefix: "SD01SR", count: 6 },
      { prefix: "SD01SPR", count: 10 },
      { prefix: "SD01GR", count: 6 },
      { prefix: "SD01CR", count: 6 },
      { prefix: "SD01ER", count: 6 },
      { prefix: "SD01PER", count: 12 },
      { prefix: "SD01PRR", count: 6 },
    ];
    BONUS_STRUCTURE.forEach(({ prefix, count }) => {
      for (let i = 1; i <= count; i++) {
        let actualIndex = i;
        if (prefix === "SD01PER") {
          actualIndex = i + 6; //  shift to 07–18
        }
        const num = String(actualIndex).padStart(2, "0");
        cards.push({
          key: `${prefix}${num}`,
          image: `/friendships-begin/${prefix}${num}.webp`,
        });
      }
    });
  } else if (set.id === "FW") {
    const FW_STRUCTURE = [
      { prefix: "BP01C", count: 48 },
      { prefix: "BP01U", count: 18 },
      { prefix: "BP01ER", count: 6 },
      { prefix: "BP01SR", count: 14 },
      { prefix: "BP01SPR", count: 28 },
      { prefix: "BP01GR", count: 12 },
      { prefix: "BP01CR", count: 12 },
      { prefix: "BP01RR", count: 6 },
      { prefix: "BP01PER", count: 12 },
      { prefix: "BP01PSPR", count: 11 },
      { prefix: "BP01PGR", count: 6 },
      { prefix: "BP01PCR", count: 12 },
      { prefix: "BP01PRR", count: 6 },
    ];
    FW_STRUCTURE.forEach(({ prefix, count }) => {
      if (prefix === "BP01ER") {
        for (let i = 0; i < 6; i++) {
          const num = String(i + 7).padStart(2, "0");
          cards.push({
            key: `BP01ER${num}`,
            image: `/fantasy-wonderland/SD01ER${num}.webp`,
          });
        }
        return;
      }
      if (prefix === "BP01PSPR") {
        const PSPR_NUMBERS = [1, 2, 3, 5, 7, 8, 9, 12, 13, 18, 21];
        PSPR_NUMBERS.forEach((n) => {
          const num = String(n).padStart(2, "0");
          cards.push({
            key: `BP01PSPR${num}`,
            image: `/fantasy-wonderland/BP01PSPR${num}.webp`,
          });
        });
        return;
      }
      for (let i = 1; i <= count; i++) {
        const num = String(i).padStart(2, "0");
        cards.push({
          key: `${prefix}${num}`,
          image:
            prefix === "BP01PER"
              ? `/fantasy-wonderland/SD01PER${num}.webp`
              : `/fantasy-wonderland/${prefix}${num}.webp`,
        });
      }
    });
  } else if (set.id === "12") {
    const DISCORD_STRUCTURE = [
      { prefix: "BP02-C", count: 48 },
      { prefix: "BP02-U", count: 18 },
      { prefix: "BP02-ER", count: 6 },
      { prefix: "BP02-SR", count: 14 },
      { prefix: "BP02-SPR", count: 28 },
      { prefix: "BP02-GR", count: 12 },
      { prefix: "BP02-CR", count: 12 },
      { prefix: "BP02-RR", count: 6 },
      { prefix: "BP02-PER", count: 12 },
      { prefix: "BP02-PSPR", count: 11 },
      { prefix: "BP02-PGR", count: 6 },
      { prefix: "BP02-PCR", count: 12 },
      { prefix: "BP02-PRR", count: 6 },
    ];
    DISCORD_STRUCTURE.forEach(({ prefix, count }) => {
      if (prefix === "BP02-PER") {
        for (let i = 0; i < 6; i++) {
          const num = String(i + 1).padStart(2, "0");
          cards.push({
            key: `BP02-PER${num}-A2`,
            image: `/cards/discord/BP02-PER${num}-A2.webp`,
          });
          cards.push({
            key: `BP02-PER${num}-B2`,
            image: `/cards/discord/BP02-PER${num}-B2.webp`,
          });
        }
        return;
      }
      for (let i = 1; i <= count; i++) {
        const num = String(i).padStart(2, "0");
        cards.push({
          key: `${prefix}${num}`,
          image: `/cards/discord/${prefix}${num}.webp`,
        });
      }
    });
  } else if (set.id === "tcgpromos") {
    for (let i = 1; i <= 18; i++) {
      const num = String(i).padStart(2, "0");
      cards.push({
        key: `RR${num}`,
        image: `/tcgpromos/RR${num}.webp`,
      });
    }
  } else if (set.id === "9") {
    cards = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13].map((num) => ({
      rarity: "PR",
      number: num,
      key: `PR-${num}`,
    }));
  } else {
    cards = Object.entries(set.rarities).flatMap(([rarity, count]) =>
      Array.from({ length: count as number }, (_, i) => ({
        rarity,
        number: i + 1,
        key: `${rarity}-${i + 1}`,
      })),
    );
  }
  const progress =
    set.id === "friendshipsbegin"
      ? progressMap["friendshipsbegin"] || progressMap["SD"] || {}
      : set.id === "FW"
        ? progressMap["FW"] ||
          progressMap["fantasywonderland"] ||
          progressMap["fantasy-wonderland"] ||
          progressMap["BP01"] ||
          {}
        : progressMap[set.id] || {};
  const ownedBonusCards = cards.filter(
    (card) => progress[card.key] || progress[`BONUS-${card.key}`],
  );
  const hasStarterDeck =
    set.id === "friendshipsbegin" &&
    ["SD01A", "SD01B", "SD01C", "SD01D", "SD01E", "SD01F"].some((deck) =>
      Array.from({ length: 21 }).some((_, i) => progress[`${deck}-${i + 1}`]),
    );
  const rarityOrders: Record<string, string[]> = {
    //  Star
    "4": ["SSR", "SCR", "UR", "USR", "AR", "OR", "BP", "SAR"],
    //  Eternal Moon
    "1": ["R", "SR", "SSR", "HR", "UR", "LSR", "SGR", "ZR", "SC", "SZR"],
    "2": ["R", "SR", "SSR", "HR", "UR", "LSR", "SGR", "ZR", "SC", "SHINING ZR"],
    "3": ["R", "SR", "SSR", "HR", "UR", "LSR", "SGR", "ZR", "SC", "SZR"],
    //  Rainbow
    "5": ["R", "SR", "FR", "TR", "TGR", "MTR", "SSR", "UR", "USR", "XR"],
    "6": ["BASE", "R", "SR", "ST", "TR", "TGR", "SSR", "FR", "UR", "USR", "XR"],
    //  Fun Moments
    "7": ["N", "SN", "R", "SR", "SSR", "UR", "CR"],
    "8": ["N", "SN", "R", "SR", "SSR", "UR", "UGR", "CR"],
    //  Fantasy Wonderland
    FW: [
      "C",
      "U",
      "ER",
      "SR",
      "SPR",
      "GR",
      "CR",
      "RR",
      "※ER",
      "※SPR",
      "※GR",
      "※CR",
      "※RR",
    ],
    //  Friendships Begin
    friendshipsbegin: ["C", "U", "SR", "SPR", "GR", "CR", "ER", "※ER", "※RR"],
    //  Promos
    "9": ["PR"],
    tcgpromos: ["PR"],
  };
  const activeListingsCount = Object.values(marketListings).filter(
    (listing) => listing.is_for_trade || listing.is_for_sale,
  ).length;
  return (
    <div
      className={`min-h-screen pb-24 transition-colors ${
        isLightMode ? "bg-[#f5f5f3] text-zinc-900" : "bg-[#0d0f10] text-white"
      }`}
    >
      <div className="mx-auto w-full max-w-[1500px] px-3 py-4 sm:px-5 sm:py-6 lg:px-7">
        {selectedCard && listingDraft && (
          <div
            className="fixed inset-0 z-[150] flex items-center justify-center overflow-y-auto bg-black/65 p-3 backdrop-blur-md sm:p-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="card-details-title"
            onMouseDown={(event) => event.preventDefault()}
          >
            <div
              className={`my-auto w-full max-w-4xl overflow-hidden rounded-[26px] shadow-2xl ${
                isLightMode
                  ? "bg-white text-zinc-900"
                  : "bg-[#17191a] text-white"
              }`}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="grid md:grid-cols-[minmax(250px,0.85fr)_minmax(320px,1.15fr)]">
                <div
                  className={`flex items-center justify-center p-4 sm:p-6 ${
                    isLightMode ? "bg-zinc-100" : "bg-black/25"
                  }`}
                >
                  <div
                    className={`w-full ${
                      set.id === "3" &&
                      selectedCard.rarity === "SZR" &&
                      selectedCard.number === 1
                        ? "max-w-[520px] aspect-[10/7]"
                        : "max-w-[310px] aspect-[5/7]"
                    } overflow-hidden rounded-2xl`}
                  >
                    <img
                      src={
                        set.id === "9"
                          ? `/promo-cards/mlpepr${String(selectedCard.number).padStart(3, "0")}.webp`
                          : set.id === "tcgpromos"
                            ? `/tcgpromos/${selectedCard.key}.webp`
                            : selectedCard.image ||
                              `/cards/${set.folder}/${set.prefix}${getRarityCode(selectedCard.rarity)}${String(selectedCard.number).padStart(3, "0")}.webp`
                      }
                      alt={getDisplayCode(selectedCard, set.id)}
                      className={`h-full w-full ${
                        ["12", "FW", "friendshipsbegin", "FB"].includes(set.id)
                          ? "object-cover"
                          : "object-cover scale-[1.04]"
                      }`}
                    />
                  </div>
                </div>
                <div className="flex flex-col p-4 sm:p-6">
                  <div>
                    <div
                      className={`text-xs font-medium uppercase tracking-[0.18em] ${
                        isLightMode ? "text-zinc-500" : "text-zinc-400"
                      }`}
                    >
                      Card identification code
                    </div>
                    <h2
                      id="card-details-title"
                      className="mt-1 text-2xl font-bold"
                    >
                      {getDisplayCode(selectedCard, set.id)}
                    </h2>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateListingDraft({
                          isForTrade: !listingDraft.isForTrade,
                          tradeQuantity:
                            !listingDraft.isForTrade &&
                            Number(listingDraft.tradeQuantity) < 1
                              ? "1"
                              : listingDraft.tradeQuantity,
                        })
                      }
                      className={`min-h-12 rounded-xl px-3 py-3 text-sm font-bold transition ${
                        listingDraft.isForTrade
                          ? "bg-emerald-500 text-white"
                          : isLightMode
                            ? "bg-zinc-200 text-zinc-700"
                            : "bg-white/[0.08] text-zinc-200"
                      }`}
                    >
                      {listingDraft.isForTrade
                        ? "Actively up for trade"
                        : "Mark for trade"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateListingDraft({
                          isForSale: !listingDraft.isForSale,
                          saleQuantity:
                            !listingDraft.isForSale &&
                            Number(listingDraft.saleQuantity) < 1
                              ? "1"
                              : listingDraft.saleQuantity,
                        })
                      }
                      className={`min-h-12 rounded-xl px-3 py-3 text-sm font-bold transition ${
                        listingDraft.isForSale
                          ? "bg-sky-500 text-white"
                          : isLightMode
                            ? "bg-zinc-200 text-zinc-700"
                            : "bg-white/[0.08] text-zinc-200"
                      }`}
                    >
                      {listingDraft.isForSale
                        ? "Actively up for sale"
                        : "Mark for sale"}
                    </button>
                  </div>
                  <div className="mt-5 space-y-3">
                    <label
                      className={`block rounded-xl p-3 ${
                        listingDraft.isForSale
                          ? isLightMode
                            ? "bg-zinc-100"
                            : "bg-white/[0.06]"
                          : isLightMode
                            ? "bg-zinc-100/60 text-zinc-400"
                            : "bg-white/[0.025] text-zinc-600"
                      }`}
                    >
                      <span className="text-sm font-semibold">Looking for</span>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="font-semibold">$</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          disabled={!listingDraft.isForSale}
                          value={listingDraft.askingPrice}
                          onChange={(event) => {
                            const value = event.target.value;
                            if (/^\d*(\.\d{0,2})?$/.test(value))
                              updateListingDraft({ askingPrice: value });
                          }}
                          placeholder="0.00"
                          className="w-full bg-transparent text-base outline-none disabled:cursor-not-allowed"
                        />
                      </div>
                    </label>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
                      ].map((field) => (
                        <label
                          key={field.key}
                          className={`rounded-xl p-3 ${
                            field.enabled
                              ? isLightMode
                                ? "bg-zinc-100"
                                : "bg-white/[0.06]"
                              : isLightMode
                                ? "bg-zinc-100/60 text-zinc-400"
                                : "bg-white/[0.025] text-zinc-600"
                          }`}
                        >
                          <span className="text-sm font-semibold">
                            {field.label}
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            disabled={!field.enabled}
                            value={listingDraft[field.key]}
                            onFocus={(event) => event.target.select()}
                            onChange={(event) => {
                              if (/^\d*$/.test(event.target.value)) {
                                updateListingDraft({
                                  [field.key]: event.target.value,
                                });
                              }
                            }}
                            className="mt-2 w-full bg-transparent text-base font-bold outline-none disabled:cursor-not-allowed"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                  {cardSaveError && (
                    <div className="mt-4 rounded-xl bg-red-500/10 px-3 py-2 text-sm font-medium text-red-500">
                      {cardSaveError}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={saveCardDetails}
                    disabled={isSavingCard}
                    className="mt-5 min-h-12 w-full rounded-xl bg-[#FFD54A] px-5 py-3 text-base font-bold text-black transition hover:bg-[#ffe277] disabled:cursor-wait disabled:opacity-60"
                  >
                    {isSavingCard ? "Saving..." : "Save"}
                  </button>
                  <p
                    className={`mt-2 text-center text-xs ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}
                  >
                    Save your changes before returning to your inventory.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {showIntroPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
            <div
              className={`w-full max-w-lg overflow-hidden rounded-[26px] border shadow-2xl ${
                isLightMode
                  ? "border-black/10 bg-white"
                  : "border-white/10 bg-[#17191a]"
              }`}
            >
              <div
                className={`border-b px-5 py-4 ${
                  isLightMode ? "border-black/10" : "border-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFD54A] font-bold text-black">
                    !
                  </div>
                  <div>
                    <div
                      className={`text-xs ${
                        isLightMode ? "text-zinc-500" : "text-zinc-400"
                      }`}
                    >
                      Inventory
                    </div>
                    <h2 className="text-lg font-semibold">Quick Start</h2>
                  </div>
                </div>
              </div>
              <div
                className={`space-y-3 px-5 py-5 text-sm leading-relaxed ${
                  isLightMode ? "text-zinc-600" : "text-zinc-300"
                }`}
              >
                <p>
                  Tap any card to open its inventory, trade, and sale details.
                </p>
                <p>
                  A card can be marked for trade, sale, or both. Sale prices and
                  public quantities are saved with that card.
                </p>
                <p>The card popup stays open until your changes are saved.</p>
              </div>
              <div
                className={`flex justify-end border-t px-5 py-4 ${
                  isLightMode ? "border-black/10" : "border-white/10"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    try {
                      localStorage.setItem(
                        "mlpekayou_inventory_intro_seen",
                        "true",
                      );
                    } catch {}
                    setShowIntroPopup(false);
                  }}
                  className="rounded-xl bg-[#FFD54A] px-5 py-2.5 text-sm font-semibold text-black"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}
        {showLeavePopup && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div
              className={`w-full max-w-lg overflow-hidden rounded-[26px] border shadow-2xl ${
                isLightMode
                  ? "border-black/10 bg-white"
                  : "border-white/10 bg-[#17191a]"
              }`}
            >
              <div
                className={`border-b px-5 py-4 ${
                  isLightMode ? "border-black/10" : "border-white/10"
                }`}
              >
                <div
                  className={`text-xs ${
                    isLightMode ? "text-zinc-500" : "text-zinc-400"
                  }`}
                >
                  Unsaved changes
                </div>
                <h2 className="mt-1 text-lg font-semibold">
                  Save inventory changes?
                </h2>
              </div>
              <div className="px-5 py-5">
                <p
                  className={`text-sm ${
                    isLightMode ? "text-zinc-600" : "text-zinc-300"
                  }`}
                >
                  You changed one or more quantities. Save them before leaving?
                </p>
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={async () => {
                      const saved = await saveInventoryChanges();
                      if (!saved) return;
                      setShowLeavePopup(false);
                      setEditMode(false);
                      const destination = pendingNavigation;
                      setPendingNavigation(null);
                      if (destination) {
                        navigationGuardRef.current = true;
                        navigate(destination);
                        navigationGuardRef.current = false;
                      }
                    }}
                    className="rounded-xl bg-[#FFD54A] px-4 py-3 text-sm font-semibold text-black"
                  >
                    Save and leave
                  </button>
                  <button
                    type="button"
                    onClick={() => {
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
                    }}
                    className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                      isLightMode
                        ? "border-black/10 bg-zinc-50 text-zinc-700"
                        : "border-white/10 bg-white/[0.04] text-zinc-200"
                    }`}
                  >
                    Leave without saving
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowLeavePopup(false);
                    setPendingNavigation(null);
                  }}
                  className={`mt-2 w-full rounded-xl px-4 py-2.5 text-sm ${
                    isLightMode ? "text-zinc-500" : "text-zinc-400"
                  }`}
                >
                  Stay on page
                </button>
              </div>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => requestNavigation("/inventory")}
          className={`mb-3 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${
            isLightMode
              ? "border-black/10 bg-white text-zinc-700 hover:bg-zinc-50"
              : "border-white/10 bg-[#151718] text-zinc-200 hover:bg-white/[0.06]"
          }`}
        >
          ← Back to Inventory
        </button>
        <section
          className={`rounded-[26px] border p-4 sm:p-5 ${
            isLightMode
              ? "border-black/10 bg-white"
              : "border-white/[0.08] bg-[#151718]"
          }`}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div
                className={`text-xs font-medium ${
                  isLightMode ? "text-zinc-500" : "text-zinc-400"
                }`}
              >
                {set.prefix}
              </div>
              <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
                {set.name}
              </h1>
              <div
                className={`mt-2 flex flex-wrap gap-2 text-xs ${
                  isLightMode ? "text-zinc-500" : "text-zinc-400"
                }`}
              >
                <span>{ownedBonusCards.length} cards owned</span>
                <span>•</span>
                <span>{activeListingsCount} listed</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:min-w-[360px]">
              <div
                className={`rounded-2xl border px-3 py-3 text-center ${
                  isLightMode
                    ? "border-black/10 bg-zinc-50"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <div className="text-sm font-semibold">Tap any card</div>
                <div
                  className={`mt-1 text-xs ${
                    isLightMode ? "text-zinc-500" : "text-zinc-400"
                  }`}
                >
                  Edit its details
                </div>
              </div>
              <button
                type="button"
                onClick={handleEditToggle}
                className={`rounded-2xl border px-3 py-3 text-center ${
                  editMode
                    ? "border-[#FFD54A] bg-[#FFD54A] text-black"
                    : isLightMode
                      ? "border-black/10 bg-zinc-50"
                      : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <div className="text-sm font-semibold">
                  {editMode ? "Save quantities" : "Quick edit"}
                </div>
                <div
                  className={`mt-1 text-xs ${
                    editMode
                      ? "text-black/70"
                      : isLightMode
                        ? "text-zinc-500"
                        : "text-zinc-400"
                  }`}
                >
                  Personal inventory
                </div>
              </button>
              <div
                className={`rounded-2xl border px-3 py-3 text-center ${
                  isLightMode
                    ? "border-black/10 bg-zinc-50"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <div className="text-sm font-semibold">
                  {activeListingsCount}
                </div>
                <div
                  className={`mt-1 text-xs ${
                    isLightMode ? "text-zinc-500" : "text-zinc-400"
                  }`}
                >
                  Listed
                </div>
              </div>
            </div>
          </div>
        </section>
        {(
          set.id === "friendshipsbegin"
            ? ownedBonusCards.length === 0 && !hasStarterDeck
            : ownedBonusCards.length === 0
        ) ? (
          <section
            className={`mt-4 rounded-[24px] border p-10 text-center ${
              isLightMode
                ? "border-black/10 bg-white"
                : "border-white/[0.08] bg-[#151718]"
            }`}
          >
            <h2 className="text-xl font-semibold">Inventory Empty</h2>
            <p
              className={`mx-auto mt-2 max-w-xl text-sm ${
                isLightMode ? "text-zinc-500" : "text-zinc-400"
              }`}
            >
              You don't currently own any cards in this set. Add cards to your
              collection first, then they'll appear here.
            </p>
          </section>
        ) : (
          <>
            {set.id === "friendshipsbegin" && (
              <section
                className={`mt-4 rounded-[24px] border p-3 sm:p-4 ${
                  isLightMode
                    ? "border-black/10 bg-white"
                    : "border-white/[0.08] bg-[#151718]"
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-base font-semibold">Starter Decks</h2>
                  <span
                    className={`text-xs ${
                      isLightMode ? "text-zinc-500" : "text-zinc-400"
                    }`}
                  >
                    {activeDeck !== null
                      ? `Deck ${activeDeck + 1}`
                      : "Select a deck"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                  {[
                    {
                      code: "SD01A",
                      name: "Twilight Sparkle",
                      img: "/starter-decks-boxes/SDTWILIGHT.webp",
                    },
                    {
                      code: "SD01B",
                      name: "Fluttershy",
                      img: "/starter-decks-boxes/SDFLUTTERSHY.webp",
                    },
                    {
                      code: "SD01C",
                      name: "Pinkie Pie",
                      img: "/starter-decks-boxes/SDPINKIEPIE.webp",
                    },
                    {
                      code: "SD01D",
                      name: "Applejack",
                      img: "/starter-decks-boxes/SDAPPLEJACK.webp",
                    },
                    {
                      code: "SD01E",
                      name: "Rainbow Dash",
                      img: "/starter-decks-boxes/SDRAINBOWDASH.webp",
                    },
                    {
                      code: "SD01F",
                      name: "Rarity",
                      img: "/starter-decks-boxes/SDRARITY.webp",
                    },
                  ]
                    .filter((deck) => {
                      const deckLetter = deck.code.slice(-1);
                      const deckIndex = deckLetter.charCodeAt(0) - 64;
                      const requiredCards: string[] = [];
                      const add = (rarity: string, count: number) => {
                        for (let i = 1; i <= count; i++) {
                          requiredCards.push(
                            `${deck.code}${rarity}${String(i).padStart(2, "0")}`,
                          );
                        }
                      };
                      add("C", 9);
                      add("U", 4);
                      add("SR", 2);
                      requiredCards.push(
                        `SD01ER${String(deckIndex).padStart(2, "0")}`,
                      );
                      add("SPR", 4);
                      requiredCards.push(
                        `SD01RR${String(deckIndex).padStart(2, "0")}`,
                      );
                      return requiredCards.every(
                        (key) => progress[`STARTER-${key}`],
                      );
                    })
                    .map((deck, i) => {
                      const isActive = activeDeck === i;
                      return (
                        <div
                          key={deck.code}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDeck(isActive ? null : i);
                          }}
                          className={`cursor-pointer rounded-2xl border p-2 transition ${
                            isActive
                              ? "border-[#FFD54A] bg-[#FFD54A]/10"
                              : isLightMode
                                ? "border-black/10 bg-zinc-50"
                                : "border-white/10 bg-white/[0.03]"
                          }`}
                        >
                          <div className="relative mx-auto max-w-[150px]">
                            <img
                              src={deck.img}
                              alt={deck.name}
                              className="h-28 w-full object-contain sm:h-32"
                            />
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className={`absolute bottom-1 right-1 flex items-center rounded-lg border px-1.5 py-1 text-xs font-semibold ${
                                isLightMode
                                  ? "border-black/10 bg-white text-zinc-700"
                                  : "border-white/10 bg-[#151718] text-zinc-200"
                              }`}
                            >
                              {editMode && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    changeQuantity(
                                      deck.code,
                                      (quantities[deck.code] || 1) - 1,
                                    )
                                  }
                                  className="px-1"
                                >
                                  −
                                </button>
                              )}
                              <span className="px-1">
                                {quantities[deck.code] || 1}
                              </span>
                              {editMode && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    changeQuantity(
                                      deck.code,
                                      (quantities[deck.code] || 1) + 1,
                                    )
                                  }
                                  className="px-1"
                                >
                                  +
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="mt-2 text-center">
                            <div
                              className={`text-xs ${
                                isLightMode ? "text-zinc-500" : "text-zinc-400"
                              }`}
                            >
                              {deck.code}
                            </div>
                            <div className="mt-0.5 text-sm font-semibold">
                              {deck.name}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </section>
            )}
            <section
              className={`mt-4 rounded-[24px] border ${
                isLightMode
                  ? "border-black/10 bg-white"
                  : "border-white/[0.08] bg-[#151718]"
              }`}
            >
              <div
                className={`flex items-center justify-between border-b px-4 py-3 ${
                  isLightMode ? "border-black/10" : "border-white/10"
                }`}
              >
                <div>
                  <h2 className="text-base font-semibold">Cards</h2>
                  <p
                    className={`mt-0.5 text-xs ${
                      isLightMode ? "text-zinc-500" : "text-zinc-400"
                    }`}
                  >
                    Tap a card to edit its quantity, trade, and sale details.
                  </p>
                </div>
                <span
                  className={`text-sm ${
                    isLightMode ? "text-zinc-500" : "text-zinc-400"
                  }`}
                >
                  {activeListingsCount} listed
                </span>
              </div>
              <div className="space-y-3 p-3 sm:p-4">
                {Object.entries(
                  ownedBonusCards.reduce((acc: Record<string, any[]>, card) => {
                    let rarity = card.rarity || "OTHER";
                    if (
                      set.id === "FW" ||
                      set.id === "friendshipsbegin" ||
                      set.id === "tcgpromos"
                    ) {
                      const match = card.key.match(
                        /(PSPR|PCR|PGR|PER|PRR|SPR|GR|CR|RR|SR|ER|SSR|ZR|HR|LSR|SGR|SZR|UR|R|U|C)/,
                      );
                      rarity = match?.[0] || "OTHER";
                      if (set.id === "tcgpromos") rarity = "PR";
                      if (rarity === "PER") rarity = "※ER";
                      if (rarity === "PSPR") rarity = "※SPR";
                      if (rarity === "PCR") rarity = "※CR";
                      if (rarity === "PRR") rarity = "※RR";
                      if (rarity === "PGR") rarity = "※GR";
                    }
                    if (!acc[rarity]) acc[rarity] = [];
                    acc[rarity].push(card);
                    return acc;
                  }, {}),
                )
                  .sort(([a], [b]) => {
                    const currentOrder = rarityOrders[set.id] || [];
                    const indexA = currentOrder.indexOf(a);
                    const indexB = currentOrder.indexOf(b);
                    return indexB - indexA;
                  })
                  .map(([rarity, rarityCards]: [string, any[]]) => {
                    const collapseKey = `${set.id}-${rarity}`;
                    const isCollapsed = collapsedRarities[collapseKey];
                    const rarityLabel =
                      rarity === "SHINING ZR" || rarity === "SZR"
                        ? "◇ZR"
                        : rarity === "SN"
                          ? "◇N"
                          : rarity === "SCR" &&
                              ["7", "8", "11"].includes(set.id)
                            ? "◇CR"
                            : rarity;
                    return (
                      <div
                        key={rarity}
                        className={`overflow-hidden rounded-2xl border ${
                          isLightMode
                            ? "border-black/10 bg-zinc-50"
                            : "border-white/[0.08] bg-white/[0.025]"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setCollapsedRarities((prev) => ({
                              ...prev,
                              [collapseKey]: !prev[collapseKey],
                            }))
                          }
                          className={`flex w-full items-center justify-between px-3 py-3 text-left ${
                            isLightMode
                              ? "hover:bg-zinc-100"
                              : "hover:bg-white/[0.04]"
                          }`}
                        >
                          <span className="text-sm font-semibold">
                            {rarityLabel}
                          </span>
                          <span
                            className={`text-xs ${
                              isLightMode ? "text-zinc-500" : "text-zinc-400"
                            }`}
                          >
                            {rarityCards.length} cards {isCollapsed ? "+" : "−"}
                          </span>
                        </button>
                        {!isCollapsed && (
                          <div
                            className={`grid grid-cols-3 gap-1.5 border-t p-2 sm:grid-cols-4 sm:gap-2 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-9 ${
                              isLightMode
                                ? "border-black/10"
                                : "border-white/[0.08]"
                            }`}
                          >
                            {rarityCards.map((card) => {
                              const key = card.key;
                              const listing = marketListings[key];
                              const isStarterDeck =
                                set.id === "friendshipsbegin" &&
                                key.includes("-");
                              const isDoubleCard =
                                set.id === "3" &&
                                card.rarity === "SZR" &&
                                card.number === 1;
                              return (
                                <div
                                  key={key}
                                  onClick={() => openCardDetails(card)}
                                  className={`group relative cursor-pointer overflow-hidden rounded-xl border p-0.5 transition ${
                                    isStarterDeck
                                      ? isLightMode
                                        ? "cursor-default border-black/10"
                                        : "cursor-default border-white/10"
                                      : isLightMode
                                        ? "border-black/10 hover:border-[#9A7200]"
                                        : "border-white/10 hover:border-[#FFD54A]/60"
                                  } ${
                                    listing?.is_for_trade &&
                                    listing?.is_for_sale
                                      ? "border-violet-500"
                                      : listing?.is_for_trade
                                        ? "border-emerald-500"
                                        : listing?.is_for_sale
                                          ? "border-sky-500"
                                          : ""
                                  } ${
                                    isDoubleCard
                                      ? "col-span-2 aspect-[10/7]"
                                      : "aspect-[5/7]"
                                  }`}
                                >
                                  <div className="h-full w-full overflow-hidden rounded-[10px]">
                                    <img
                                      src={
                                        set.id === "9"
                                          ? `/promo-cards/mlpepr${String(card.number).padStart(3, "0")}.webp`
                                          : set.id === "tcgpromos"
                                            ? `/tcgpromos/${card.key}.webp`
                                            : card.image ||
                                              `/cards/${set.folder}/${set.prefix}${getRarityCode(card.rarity)}${String(card.number).padStart(3, "0")}.webp`
                                      }
                                      alt={key}
                                      className={`h-full w-full ${
                                        [
                                          "12",
                                          "FW",
                                          "friendshipsbegin",
                                          "FB",
                                        ].includes(set.id)
                                          ? "object-cover"
                                          : "object-cover scale-[1.04]"
                                      }`}
                                    />
                                  </div>
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute bottom-1 right-1"
                                  >
                                    {editMode && window.innerWidth >= 768 ? (
                                      <div
                                        className={`flex items-center rounded-lg border px-1 text-xs font-semibold ${
                                          isLightMode
                                            ? "border-black/10 bg-white/90 text-zinc-700"
                                            : "border-white/10 bg-black/80 text-zinc-200"
                                        }`}
                                      >
                                        <input
                                          type="text"
                                          inputMode="numeric"
                                          value={String(quantities[key] || "")}
                                          placeholder="1"
                                          onClick={(e) => e.stopPropagation()}
                                          onFocus={(e) => e.target.select()}
                                          onChange={(e) => {
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
                                                const dirty = Object.keys(
                                                  updated,
                                                ).some(
                                                  (cardKey) =>
                                                    (updated[cardKey] ?? 1) !==
                                                    (savedQuantities[cardKey] ??
                                                      1),
                                                );
                                                setInventoryDirty(dirty);
                                                inventoryDirtyRef.current =
                                                  dirty;
                                                return updated;
                                              });
                                            }
                                          }}
                                          onBlur={() => {
                                            const finalValue = Math.max(
                                              1,
                                              quantities[key] || 1,
                                            );
                                            changeQuantity(key, finalValue);
                                          }}
                                          className="w-8 bg-transparent py-1 text-center outline-none"
                                        />
                                      </div>
                                    ) : (
                                      <div
                                        className={`flex items-center rounded-lg border px-1 py-0.5 text-xs font-semibold ${
                                          isLightMode
                                            ? "border-black/10 bg-white/90 text-zinc-700"
                                            : "border-white/10 bg-black/80 text-zinc-200"
                                        }`}
                                      >
                                        {editMode && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              changeQuantity(
                                                key,
                                                (quantities[key] || 1) - 1,
                                              )
                                            }
                                            className="px-1"
                                          >
                                            −
                                          </button>
                                        )}
                                        <span className="px-1">
                                          {quantities[key] || 1}
                                        </span>
                                        {editMode && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              changeQuantity(
                                                key,
                                                (quantities[key] || 1) + 1,
                                              )
                                            }
                                            className="px-1"
                                          >
                                            +
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  {(listing?.is_for_trade ||
                                    listing?.is_for_sale) && (
                                    <div
                                      className={`absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                                        listing.is_for_trade &&
                                        listing.is_for_sale
                                          ? "bg-violet-500"
                                          : listing.is_for_trade
                                            ? "bg-emerald-500"
                                            : "bg-sky-500"
                                      }`}
                                    >
                                      ✓
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
