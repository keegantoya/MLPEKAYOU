import CardImage from "@/components/CardImage";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { getProfileAssets } from "../Everypony/profile-assets";
import NotFound from "../NotFound";
import { usePublicProfileCards } from "@/lib/public-profile-cards";
import { getTradeCardImage as getDefaultTradeCardImage, getMoonFourFront } from "@/lib/card-images";
const getTradeCardImage = (card: { set_id: string | number; card_key: string }) =>
  String(card.set_id) === "13"
    ? getMoonFourFront(card.card_key)
    : getDefaultTradeCardImage({ set_id: String(card.set_id), card_key: card.card_key });
export default function PublicProfile() {
const { username } = useParams();
const [profile, setProfile] = useState<any>(null);
const [profileLoading, setProfileLoading] = useState(true);
const [profileNotFound, setProfileNotFound] = useState(false);
const [discord, setDiscord] = useState("");
const [copied, setCopied] = useState(false);
const [showCollectionModal, setShowCollectionModal] = useState(false);
const [collectionMode, setCollectionMode] = useState<
    "iso" | "wishlist" | "trade" | "sale"
  >("iso");
const [marketListings, setMarketListings] = useState<any[]>([]);
const [selectedSet, setSelectedSet] = useState("1");
const [raritySelection, setRaritySelection] = useState({ context: "", rarity: "" });
const [stats, setStats] = useState({
    owned: 0,
    trades: 0,
    sales: 0,
    wishlist: 0,
  });
const [hiddenIsoSets, setHiddenIsoSets] = useState<string[]>([]);
const [lastActivityAt, setLastActivityAt] = useState<string | null>(null);
const [isLightMode, setIsLightMode] = useState(
    () => document.documentElement.dataset.theme === "light",
  );
const [currentUserId, setCurrentUserId] = useState("");
const [isFriend, setIsFriend] = useState(false);
const [requestPending, setRequestPending] = useState(false);
const [sendingRequest, setSendingRequest] = useState(false);
const isEmbedded =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("embed") === "1";
  useEffect(() => {
    if (!showCollectionModal) return;
const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showCollectionModal]);
  useEffect(() => {
let cancelled = false;
const loadProfile = async () => {
      setProfileLoading(true);
      setProfileNotFound(false);
      setProfile(null);
const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!username) {
        if (!cancelled) {
          setProfileLoading(false);
          setProfileNotFound(true);
        }
        return;
      }
const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .ilike("username", username)
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      if (error || !profileData) {
        setProfileLoading(false);
        setProfileNotFound(true);
        return;
      }
      setProfile(profileData);
const legacyHidden = profileData.iso_hidden_sets || [];
const hidden = [
        ...(profileData.iso_hidden_sets?.length
          ? profileData.iso_hidden_sets
          : legacyHidden),
        ...(profileData.iso_hidden_sets?.length
          ? profileData.iso_hidden_sets
          : legacyHidden),
      ];
      setHiddenIsoSets(hidden);
const { data: tradingProfile } = await supabase
        .from("trading_profiles")
        .select("discord_username")
        .eq("user_id", profileData.id)
        .maybeSingle();
      if (cancelled) return;
      setDiscord(tradingProfile?.discord_username || "");
      if (!cancelled) {
        setCurrentUserId(session?.user?.id || "");
      }
      if (session?.user && session.user.id !== profileData.id) {
const [{ data: friendship }, { data: pendingRequest }] =
          await Promise.all([
            supabase
              .from("friends")
              .select("id")
              .eq("user_id", session.user.id)
              .eq("friend_id", profileData.id)
              .maybeSingle(),
            supabase
              .from("friend_requests")
              .select("id")
              .eq("sender_id", session.user.id)
              .eq("receiver_id", profileData.id)
              .eq("status", "pending")
              .maybeSingle(),
          ]);
        if (!cancelled) {
          setIsFriend(Boolean(friendship));
          setRequestPending(Boolean(pendingRequest));
        }
      } else if (!cancelled) {
        setIsFriend(false);
        setRequestPending(false);
      }
const { data: activityData } = await supabase
        .from("user_activity")
        .select("last_activity_at")
        .eq("user_id", profileData.id)
        .maybeSingle();
      if (!cancelled) {
        setLastActivityAt(activityData?.last_activity_at || null);
      }
      setProfileLoading(false);
    };
    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [username]);
  useEffect(() => {
const loadStats = async () => {
      if (!profile?.id) return;
let owned = profile.collection_total ?? 0;
      if (currentUserId) {
const { data: collection } = await supabase
          .from("collection_progress_raw")
          .select("set_id, progress")
          .eq("user_id", profile.id);
        if (collection) {
          owned = collection
            .filter((row: any) => row.set_id !== "OTHERMERCH")
            .reduce((total: number, row: any) => total + Object.values(row.progress || {})
              .filter((value: any) => value === true || value?.owned === true).length, 0);
        }
      }
const { data: listings } = await supabase
        .from("card_market_listings")
        .select(
          "user_id, set_id, card_key, is_for_trade, is_for_sale, asking_price, trade_quantity, sale_quantity, updated_at",
        )
        .eq("user_id", profile.id);
const activeListings = (profile.vacation_mode ? [] : listings || []).filter(
        (card: any) =>
          (card.is_for_trade && Number(card.trade_quantity) > 0) ||
          (card.is_for_sale && Number(card.sale_quantity) > 0),
      );
      setMarketListings(activeListings);
const { count: wishlist } = await supabase
        .from("wishlists")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile.id);
      setStats({
        owned,
        trades: activeListings.filter((card: any) => card.is_for_trade).length,
        sales: activeListings.filter((card: any) => card.is_for_sale).length,
        wishlist: wishlist ?? 0,
      });
    };
    loadStats();
  }, [profile, currentUserId]);
const { avatar } = getProfileAssets(profile);
const { isoCards, wishlistCards, loading } = usePublicProfileCards(
    profile?.id,
  );
const tradeCards = useMemo(() => {
    return marketListings
      .filter(
        (card: any) => card.is_for_trade && Number(card.trade_quantity) > 0,
      )
      .map((card: any) => ({
        ...card,
        type: "trade",
      }));
  }, [marketListings]);
const saleCards = useMemo(
    () =>
      marketListings
        .filter(
          (card: any) => card.is_for_sale && Number(card.sale_quantity) > 0,
        )
        .map((card: any) => ({ ...card, type: "sale" })),
    [marketListings],
  );
const getSetName = (setId: string) => {
const names: Record<string, string> = {
      "1": "Moon One",
      "2": "Moon Two",
      "3": "Moon Three",
      "13": "Moon Four",
      "4": "Star One",
      "5": "Rainbow One",
      "6": "Rainbow Two",
      "7": "Fun Moments One",
      "8": "Fun Moments Two",
      "11": "Fun Moments Three",
      "9": "Promotional Cards",
      FW: "Fantasy Wonderland",
      SD: "Friendships Begin",
      friendshipsbegin: "Friendships Begin",
      "12": "Discord",
      "14": "Nightmare Night",
      tcgpromos: "TCG Promos",
    };
    return names[String(setId)] ?? String(setId);
  };
const visibleIsoCards = useMemo(
    () =>
      isoCards.filter((card: any) => {
const setId = String(card.set_id);
        if (hiddenIsoSets.includes(setId)) {
          return false;
        }
        if (
          setId === "SD" &&
          (hiddenIsoSets.includes("SD") ||
            hiddenIsoSets.includes("SD_STARTERS") ||
            hiddenIsoSets.includes("SD_BONUS"))
        ) {
          return false;
        }
        if (setId === "tcgpromos" && hiddenIsoSets.includes("TCG_PROMOS")) {
          return false;
        }
        return true;
      }),
    [isoCards, hiddenIsoSets],
  );
const modalCards = useMemo(() => {
    switch (collectionMode) {
      case "wishlist":
        return wishlistCards;
      case "trade":
        return tradeCards;
      case "sale":
        return saleCards;
      default:
        return visibleIsoCards;
    }
  }, [collectionMode, visibleIsoCards, wishlistCards, tradeCards, saleCards]);
const modalTabs = useMemo(() => {
const order = ["1", "2", "3", "13", "4", "5", "6", "7", "8", "11", "9", "SD", "friendshipsbegin", "FW", "12", "14", "tcgpromos"];
    return Array.from(new Set(modalCards.map((c: any) => String(c.set_id)))).sort((a, b) => {
const aIndex = order.indexOf(a);
const bIndex = order.indexOf(b);
      return (aIndex < 0 ? order.length : aIndex) - (bIndex < 0 ? order.length : bIndex) || a.localeCompare(b);
    });
  }, [modalCards]);
const setCards = modalCards.filter(
    (c: any) => String(c.set_id) === selectedSet,
  );
const collectionSections = [
    { mode: "iso" as const, title: "ISO", cards: visibleIsoCards },
    { mode: "wishlist" as const, title: "Wishlist", cards: wishlistCards },
    { mode: "trade" as const, title: "For Trade", cards: tradeCards },
    { mode: "sale" as const, title: "For Sale", cards: saleCards },
  ];
const rarityOrder: Record<string, string[]> = {
                        "1": ["R", "SR", "SSR", "HR", "UR", "LSR", "SGR", "SC"],
                        "2": [
                          "R",
                          "SR",
                          "SSR",
                          "HR",
                          "UR",
                          "LSR",
                          "SGR",
                          "ZR",
                          "SC",
                          "SHINING ZR",
                        ],
                        "3": [
                          "R",
                          "SR",
                          "SSR",
                          "HR",
                          "UR",
                          "LSR",
                          "SGR",
                          "ZR",
                          "SC",
                          "SZR",
                        ],
                        "13": ["R", "SR", "SSR", "HR", "UR", "LSR", "SGR", "ZR", "SC", "SZR"],
                        "4": [
                          "SSR",
                          "SCR",
                          "UR",
                          "USR",
                          "AR",
                          "OR",
                          "BP",
                          "SAR",
                        ],
                        "5": [
                          "R",
                          "FR",
                          "SR",
                          "SSR",
                          "TR",
                          "TGR",
                          "MTR",
                          "UR",
                          "USR",
                          "XR",
                        ],
                        "6": [
                          "BASE",
                          "R",
                          "SR",
                          "ST",
                          "SSR",
                          "FR",
                          "TR",
                          "TGR",
                          "UR",
                          "USR",
                          "XR",
                        ],
                        "7": ["N", "SN", "R", "SR", "SSR", "UR", "CR"],
                        "8": ["N", "SN", "R", "SR", "SSR", "UR", "UGR", "CR"],
                        "11": [
                          "N",
                          "SN",
                          "R",
                          "SR",
                          "SSR",
                          "UR",
                          "UGR",
                          "CR",
                          "SCR",
                        ],
                        "9": ["PR"],
                        tcgpromos: ["PR"],
                        friendshipsbegin: [
                          "C",
                          "U",
                          "SR",
                          "SPR",
                          "ER",
                          "GR",
                          "CR",
                          "PER",
                          "PRR",
                        ],
                        FW: [
                          "C",
                          "U",
                          "ER",
                          "SR",
                          "SPR",
                          "GR",
                          "CR",
                          "RR",
                          "PER",
                          "PSPR",
                          "PGR",
                          "PCR",
                          "PRR",
                        ],
                        "12": [
                          "C",
                          "U",
                          "ER",
                          "SR",
                          "SPR",
                          "GR",
                          "CR",
                          "RR",
                          "PER",
                          "PSPR",
                          "PGR",
                          "PCR",
                          "PRR",
                        ],
                        "14": [
                          "C",
                          "U",
                          "ER",
                          "SR",
                          "SPR",
                          "GR",
                          "CR",
                          "RR",
                          "PER",
                          "PSPR",
                          "PGR",
                          "PCR",
                          "PRR",
                        ],
                      };
const getRarity = (card: any): string => {
const setId = String(card.set_id);
const key = ["SD", "friendshipsbegin"].includes(setId)
    ? String(card.card_key).replace(/^(?:BONUS-|STARTER-)+/, "")
    : String(card.card_key);
  if (["FW", "12", "14", "SD", "friendshipsbegin"].includes(setId)) {
const parallel = key.match(/^PBP\d+-?(ER|SPR|GR|CR|RR)\d+/);
    if (parallel) return `P${parallel[1]}`;
    return key.match(/^(?:BP\d+|SD\d+)-?([A-Z]+)\d+/)?.[1] ?? key.split("-")[0];
  }
  if (setId === "tcgpromos") return "PR";
  return key.split("-")[0];
};
function getRarityLabel(setId: string, rarity: string) {
    if (rarity === "ALL") {
      return ["7", "8", "11"].includes(setId) ? "All" : "All rarities";
    }
    if (rarity === "SHINING ZR") return "\u25C7 ZR";
    if (rarity === "SZR") return "\u25C7ZR";
    if (rarity === "SAR") return "\u25C7AR";
    if (["7", "8", "11"].includes(setId) && rarity === "SN") return "\u25C7N";
    if (["7", "8", "11"].includes(setId) && rarity === "SCR") return "\u25C7CR";
const parallelLabels: Record<string, string> = {
      PER: "\u203BER",
      PSPR: "\u203BSPR",
      PGR: "\u203BGR",
      PCR: "\u203BCR",
      PRR: "\u203BRR",
    };
    return parallelLabels[rarity] || rarity;
  }
const rarityContext = `${profile?.id ?? ""}:${collectionMode}:${selectedSet}`;
const rarityTabs = Array.from(new Set(setCards.map(getRarity))).sort((a, b) => {
const order = rarityOrder[selectedSet === "SD" ? "friendshipsbegin" : selectedSet] ?? [];
const aIndex = order.indexOf(a);
const bIndex = order.indexOf(b);
  return (aIndex < 0 ? order.length : aIndex) - (bIndex < 0 ? order.length : bIndex) || a.localeCompare(b);
});
const activeRarity = raritySelection.context === rarityContext && rarityTabs.includes(raritySelection.rarity)
  ? raritySelection.rarity
  : rarityTabs[0] ?? "";
const filteredCards = setCards.filter((card: any) => getRarity(card) === activeRarity);
const renderRarityButtons = () => rarityTabs.length > 0 ? (
  <div role="group" aria-label="Card rarities" className="mb-5 flex flex-wrap gap-2">
    {rarityTabs.map((rarity) => (
      <button key={rarity} type="button" aria-pressed={activeRarity === rarity}
        onClick={() => setRaritySelection({ context: rarityContext, rarity })}
        className={`inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${activeRarity === rarity
          ? isLightMode ? "border-[#D9B94A] bg-[#D9B94A] text-[#151718] shadow-sm" : "border-[#D9B94A] bg-[#D9B94A] text-[#151718] shadow-sm"
          : isLightMode ? "border-black/10 text-zinc-500 hover:bg-zinc-50" : "border-white/10 text-zinc-400 hover:bg-white/[0.04]"}`}>
        {getRarityLabel(selectedSet, rarity)}<span className="text-[10px] tabular-nums opacity-60">{setCards.filter((card: any) => getRarity(card) === rarity).length}</span>
      </button>
    ))}
  </div>
) : null;
const compareCards = (a: any, b: any) => {
  if (String(a.set_id) === "9" && String(b.set_id) === "9") {
    const order = ["PR-1", "PR-2", "PR-3", "PR-4", "PR-5", "PR-7", "PR-14", "PR-8", "PR-9", "PR-10", "PR-11", "PR-12", "PR-13"];
    const difference = order.indexOf(a.card_key) - order.indexOf(b.card_key);
    if (difference !== 0) return difference;
  }
const getNumber = (card: any) => {
const match = card.card_key.match(/(\d+)$/);
                        return match ? parseInt(match[1], 10) : 0;
                      };
const order = rarityOrder[String(a.set_id) === "SD" ? "friendshipsbegin" : String(a.set_id)] ?? [];
const rarityDiff =
                        order.indexOf(getRarity(a)) -
                        order.indexOf(getRarity(b));
                      if (rarityDiff !== 0) return rarityDiff;
                      return getNumber(a) - getNumber(b) || String(a.card_key).localeCompare(String(b.card_key), undefined, { numeric: true });
};
const renderCard = (card: any) => (
                      <div
                        key={`${card.set_id}-${card.card_key}`}
                        className={`relative overflow-hidden rounded-xl bg-transparent shadow-sm transition duration-200 motion-safe:hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(0,0,0,0.2)] ${
                          String(card.set_id) === "3" &&
                          String(card.card_key) === "SZR-1"
                            ? "col-span-2 aspect-[10/7]"
                            : "aspect-[5/7]"
                        }`}
                      >
                        <CardImage
                          imageSize={(String(card.set_id) === "9" && card.card_key === "PR-14") || (String(card.set_id) === "tcgpromos" && card.card_key === "RR28") ? "original" : "grid"}
                          src={getTradeCardImage(card)}
                          publicProfile
                          style={
                            String(card.set_id) === "14" &&
                            /^BP03-C(2[5-9]|3[0-9]|4[0-8])$/.test(card.card_key)
                              ? {
                                  left: "50%",
                                  top: "50%",
                                  right: "auto",
                                  bottom: "auto",
                                  width: "140%",
                                  height: "71.4285714286%",
                                  maxWidth: "none",
                                  transform:
                                    "translate(-50%, -50%) rotate(-90deg)",
                                }
                              : undefined
                          }
                          alt={card.card_key}
                          className={`absolute inset-0 h-full w-full bg-transparent ${
                            [
                              "FW",
                              "SD",
                              "friendshipsbegin",
                              "12",
                              "14",
                              "tcgpromos",
                            ].includes(String(card.set_id))
                              ? "object-contain"
                              : "scale-[1.05] object-cover"
                          }`}
                        />
                        {(card.is_for_trade || card.is_for_sale) && (
                          <div className="absolute left-1.5 top-1.5 flex gap-1">
                            {card.is_for_trade && (
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/75 text-xs font-bold text-[#FFD54A]">
                                ⇄
                              </span>
                            )}
                            {card.is_for_sale && (
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FFD54A] text-xs font-bold text-black">
                                $
                              </span>
                            )}
                          </div>
                        )}
                        {card.is_for_sale && card.asking_price != null && (
                          <span className="absolute bottom-1.5 right-1.5 rounded-full bg-black/80 px-2 py-1 text-[10px] font-bold text-white">
                            ${Number(card.asking_price).toFixed(2)}
                          </span>
                        )}
                      </div>
);
const selectedSection = collectionSections.find((section) => section.mode === collectionMode)!;
  useEffect(() => {
    if (!modalTabs.includes(selectedSet)) setSelectedSet(modalTabs[0] ?? "");
  }, [modalTabs, selectedSet]);
const activityStatus = (() => {
    if (!lastActivityAt) {
      return {
        label: "Inactive",
        lightClass: "border-zinc-300 bg-zinc-100 text-zinc-600",
        darkClass: "border-white/10 bg-white/[0.05] text-zinc-400",
        dotClass: "bg-zinc-400",
      };
    }
const age = Date.now() - new Date(lastActivityAt).getTime();
    if (age <= 24 * 60 * 60 * 1000) {
      return {
        label: "Active in the last 24 Hours",
        lightClass:
          "border-emerald-700/15 bg-emerald-700/[0.06] text-emerald-800",
        darkClass:
          "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300",
        dotClass: "bg-emerald-500",
      };
    }
    if (age <= 7 * 24 * 60 * 60 * 1000) {
      return {
        label: "Active in the last 7 Days",
        lightClass: "border-[#8a6a00]/20 bg-[#c89d13]/10 text-[#725700]",
        darkClass: "border-[#FFD54A]/20 bg-[#FFD54A]/[0.08] text-[#FFE27A]",
        dotClass: "bg-[#FFD54A]",
      };
    }
    return {
      label: "Inactive",
      lightClass: "border-zinc-300 bg-zinc-100 text-zinc-600",
      darkClass: "border-white/10 bg-white/[0.05] text-zinc-400",
      dotClass: "bg-zinc-400",
    };
  })();
  useEffect(() => {
const syncTheme = () => {
      setIsLightMode(document.documentElement.dataset.theme === "light");
    };
    syncTheme();
const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    return () => observer.disconnect();
  }, []);
async function sendFriendRequest() {
    if (!currentUserId || !profile?.id || currentUserId === profile.id) return;
    if (isFriend || requestPending || sendingRequest) return;
    setSendingRequest(true);
const { data: targetProfile } = await supabase
      .from("profiles")
      .select("allow_friend_requests")
      .eq("id", profile.id)
      .maybeSingle();
    if (targetProfile && targetProfile.allow_friend_requests === false) {
      alert("This Superfan isn't accepting friend requests.");
      setSendingRequest(false);
      return;
    }
const { error } = await supabase.from("friend_requests").insert({
      sender_id: currentUserId,
      receiver_id: profile.id,
      status: "pending",
    });
    if (!error) {
      setRequestPending(true);
    }
    setSendingRequest(false);
  }
const CollectionModal = () => {
    if (!showCollectionModal) return null;
const modeLabel =
      collectionMode === "iso"
        ? "ISO"
        : collectionMode === "wishlist"
          ? "Wishlist"
          : collectionMode === "sale"
            ? "For Sale"
            : "For Trade";
    return (
      <div
        className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden p-3 backdrop-blur-md sm:p-8 ${
          isLightMode ? "bg-white/35" : "bg-black/80"
        }`}
        onClick={() => setShowCollectionModal(false)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`relative flex h-[min(82dvh,620px)] min-h-0 w-full max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-[22px] border sm:rounded-[28px] ${
            isEmbedded
              ? "sm:h-[88vh] sm:min-h-0 sm:w-[94vw] sm:max-w-[980px] sm:flex-row"
              : "sm:h-[72vh] sm:min-h-0 sm:w-[78vw] sm:max-w-[1080px] sm:flex-row"
          } ${
            isLightMode
              ? "border-black/10 bg-white shadow-[0_24px_70px_rgba(0,0,0,.18)]"
              : "border-white/10 bg-[#151718] shadow-[0_24px_70px_rgba(0,0,0,.45)]"
          }`}
        >
          <div
            className={`flex w-full shrink-0 flex-col border-b sm:w-52 sm:border-b-0 sm:border-r ${
              isLightMode
                ? "border-black/[0.08] bg-zinc-50"
                : "border-white/[0.07] bg-[#111314]"
            }`}
          >
            <div
              className={`flex items-center justify-between border-b px-4 py-4 sm:block sm:p-5 ${
                isLightMode ? "border-black/[0.08]" : "border-white/[0.07]"
              }`}
            >
              <div>
                <h2 className="text-lg font-semibold">{modeLabel}</h2>
                <div
                  className={`mt-1 text-xs ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}
                >
                  {modalTabs.length} {modalTabs.length === 1 ? "set" : "sets"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCollectionModal(false)}
                aria-label="Close collection"
                className={`rounded-lg px-3 py-1.5 text-xl sm:hidden ${
                  isLightMode
                    ? "text-zinc-500 hover:bg-black/[0.05]"
                    : "text-zinc-400 hover:bg-white/[0.06]"
                }`}
              >
                ×
              </button>
            </div>
            <div className="flex min-w-0 flex-nowrap gap-2 overflow-x-auto p-3 sm:block sm:flex-1 sm:space-y-1 sm:overflow-x-hidden sm:overflow-y-auto">
              {modalTabs.map((setId) => (
                <button
                  key={setId}
                  type="button"
                  onClick={() => setSelectedSet(setId)}
                  className={`shrink-0 rounded-full px-3 py-2 text-sm font-medium transition-colors sm:w-full sm:rounded-xl sm:text-left ${
                    selectedSet === setId
                      ? isLightMode
                        ? "bg-[#c89d13]/15 text-[#725700]"
                        : "bg-[#FFD54A]/10 text-[#FFE27A]"
                      : isLightMode
                        ? "text-zinc-600 hover:bg-black/[0.04]"
                        : "text-zinc-400 hover:bg-white/[0.05]"
                  }`}
                >
                  {getSetName(setId)}
                </button>
              ))}
            </div>
          </div>
          <div className="min-w-0 flex-1 overflow-y-auto">
            <div
              className={`sticky top-0 z-20 flex items-center justify-between border-b px-4 py-4 backdrop-blur-xl sm:px-6 ${
                isLightMode
                  ? "border-black/[0.08] bg-white/95"
                  : "border-white/[0.07] bg-[#151718]/95"
              }`}
            >
              <div className="min-w-0">
                <div
                  className={`text-xs ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}
                >
                  {modeLabel}
                </div>
                <h3 className="truncate text-lg font-semibold sm:text-xl">
                  {getSetName(selectedSet)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCollectionModal(false)}
                aria-label="Close collection"
                className={`hidden rounded-lg px-3 py-1.5 text-2xl sm:block ${
                  isLightMode
                    ? "text-zinc-500 hover:bg-black/[0.05]"
                    : "text-zinc-400 hover:bg-white/[0.06]"
                }`}
              >
                ×
              </button>
            </div>
            <div className="p-3 sm:p-6">
              {renderRarityButtons()}
              {filteredCards.length === 0 ? (
                <div
                  className={`flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed px-6 text-center text-sm ${
                    isLightMode
                      ? "border-black/10 bg-zinc-50 text-zinc-500"
                      : "border-white/10 bg-white/[0.03] text-zinc-400"
                  }`}
                >
                  {collectionMode === "iso" && !currentUserId
                    ? "Sign in to view this collection."
                    : "There's nothing to see here."}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
                  {filteredCards.slice().sort(compareCards).map(renderCard)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  if (profileLoading) {
    return (
      <div role="status" aria-live="polite" className={`flex min-h-[60vh] flex-col items-center justify-center gap-4 ${isLightMode ? "text-zinc-600" : "text-zinc-300"}`}>
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-500/20 border-t-[#D9B94A]" />
        <span className="text-sm">Loading profile...</span>
      </div>
    );
  }
  if (profileNotFound) return <NotFound />;
  return (
    <div className={`min-h-screen pb-24 sm:pb-8 ${isLightMode ? "bg-[#f5f5f3] text-zinc-900" : "bg-[#0d0f10] text-white"}`}>
      <main className={`w-full max-w-none ${isEmbedded ? "p-3 sm:p-4" : "px-3 py-4 sm:px-5 sm:py-5 lg:px-7 2xl:px-9"}`}>
        <header className={`relative isolate overflow-hidden rounded-2xl border ${isLightMode ? "border-[#D9B94A]/25 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]" : "border-[#D9B94A]/15 bg-[#151718] shadow-[0_8px_30px_rgba(0,0,0,0.18)]"}`}>
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-right opacity-[0.06]" style={{backgroundImage: "url('/website-assets/exploreequestria.webp')"}} />
          <div aria-hidden="true" className={`pointer-events-none absolute inset-0 -z-10 ${isLightMode ? "bg-gradient-to-r from-white via-white/95 to-[#D9B94A]/10" : "bg-gradient-to-r from-[#151718] via-[#151718]/95 to-[#D9B94A]/[0.08]"}`} />
          <div className="h-0.5 bg-gradient-to-r from-[#D9B94A] via-[#F2DC87] to-transparent" />
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 lg:px-6">
            <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
              <CardImage src={avatar} alt={profile?.username} className={`h-16 w-16 shrink-0 rounded-2xl border object-cover shadow-md ring-4 ring-[#D9B94A]/10 sm:h-20 sm:w-20 ${isLightMode ? "border-black/10" : "border-white/10"}`} />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="break-words text-xl font-semibold tracking-tight sm:text-2xl">{profile?.username}</h1>
                  {getProfileAssets(profile).verification && (
                    <CardImage src={getProfileAssets(profile).verification!.badge} alt={getProfileAssets(profile).verification!.label} title={getProfileAssets(profile).verification!.label} className="h-6 w-6 object-contain" />
                  )}
                </div>
                {discord && <div className={`mt-1 break-all text-sm ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>Discord: <span className={isLightMode ? "text-[#725700]" : "text-[#FFE27A]"}>{discord}</span></div>}
                <div className={`mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                  <span className="inline-flex items-center gap-1.5"><span className={`h-1.5 w-1.5 rounded-full ${activityStatus.dotClass}`} />{activityStatus.label}</span>
                  <span><strong className={isLightMode ? "text-zinc-900" : "text-white"}>{stats.owned.toLocaleString()}</strong> cards owned</span>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {currentUserId && currentUserId !== profile?.id && (
                    <button
                      type="button"
                      onClick={sendFriendRequest}
                      disabled={isFriend || requestPending || sendingRequest}
                      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                        isFriend
                          ? isLightMode
                            ? "bg-[#c89d13]/15 text-[#725700]"
                            : "bg-[#FFD54A]/10 text-[#FFE27A]"
                          : requestPending
                            ? isLightMode
                              ? "cursor-not-allowed bg-zinc-100 text-zinc-500"
                              : "cursor-not-allowed bg-white/[0.05] text-zinc-500"
                            : "bg-[#FFD54A] text-black hover:bg-[#FFE27A]"
                      }`}
                    >
                      {isFriend
                        ? "Friends"
                        : requestPending
                          ? "Request Pending"
                          : sendingRequest
                            ? "Sending..."
                            : "Add Friend"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
const url = `https://www.mlpekayou.community/${encodeURIComponent(profile?.username ?? "")}`;
                      if (navigator.clipboard && window.isSecureContext) {
                        navigator.clipboard.writeText(url);
                      } else {
const textArea = document.createElement("textarea");
                        textArea.value = url;
                        textArea.style.position = "fixed";
                        textArea.style.left = "-999999px";
                        document.body.appendChild(textArea);
                        textArea.focus();
                        textArea.select();
                        try {
                          document.execCommand("copy");
                        } finally {
                          document.body.removeChild(textArea);
                        }
                      }
                      setCopied(true);
                      setTimeout(() => setCopied(false), 3000);
                    }}
                    className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                      isLightMode
                        ? "border-black/10 bg-white/80 text-zinc-700 hover:bg-zinc-100"
                        : "border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]"
                    }`}
                  >
                    {copied ? "Link Copied" : "Share Profile"}
                  </button>
            </div>
          </div>
        </header>
        <section className={`mt-4 overflow-hidden rounded-2xl border ${isLightMode ? "border-black/[0.07] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.03)]" : "border-white/[0.07] bg-[#151718] shadow-[0_8px_30px_rgba(0,0,0,0.12)]"}`}>
          <div role="tablist" aria-label="Profile collections" className={`grid grid-cols-4 gap-1 border-b p-2 sm:flex sm:gap-2 sm:p-3 ${isLightMode ? "border-black/[0.08]" : "border-white/[0.08]"}`}>
            {collectionSections.map((section) => (
              <button key={section.mode} id={`profile-tab-${section.mode}`} role="tab" aria-selected={collectionMode === section.mode} aria-controls="profile-collection-panel" type="button" onClick={() => setCollectionMode(section.mode)} className={`flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold transition sm:min-h-10 sm:flex-row sm:gap-3 sm:px-4 sm:text-sm ${collectionMode === section.mode ? isLightMode ? "bg-[#D9B94A]/15 text-[#725700]" : "bg-[#D9B94A]/10 text-[#FFE27A]" : isLightMode ? "text-zinc-500 hover:bg-zinc-100" : "text-zinc-400 hover:bg-white/[0.04]"}`}>
                {section.title}<span className={`text-[10px] tabular-nums sm:text-xs ${collectionMode === section.mode ? "opacity-90" : "opacity-60"}`}>{loading ? "..." : section.cards.length.toLocaleString()}</span>
              </button>
            ))}
          </div>
          <div id="profile-collection-panel" role="tabpanel" aria-labelledby={`profile-tab-${collectionMode}`} className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)]">
            {modalTabs.length > 0 && (
              <nav aria-label="Collection sets" className={`border-b p-3 lg:border-b-0 lg:border-r lg:p-4 ${isLightMode ? "border-black/[0.08] bg-zinc-50/70" : "border-white/[0.08] bg-[#111314]/50"}`}>
                <label htmlFor="profile-set" className={`mb-2 block text-xs font-medium lg:hidden ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>Choose a set</label>
                <select id="profile-set" value={selectedSet} onChange={(event) => setSelectedSet(event.target.value)} className={`min-h-11 w-full rounded-lg border px-3 text-base lg:hidden ${isLightMode ? "border-black/10 bg-white" : "border-white/10 bg-[#151718]"}`}>
                  {modalTabs.map((setId) => <option key={setId} value={setId}>{getSetName(setId)} ({modalCards.filter((card: any) => String(card.set_id) === setId).length})</option>)}
                </select>
                <div className="hidden space-y-1 lg:block">
                  <div className={`px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider ${isLightMode ? "text-zinc-400" : "text-zinc-500"}`}>Sets</div>
                  {modalTabs.map((setId) => (
                    <button key={setId} type="button" aria-pressed={selectedSet === setId} onClick={() => setSelectedSet(setId)} className={`flex min-h-10 w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${selectedSet === setId ? isLightMode ? "bg-[#D9B94A]/15 font-semibold text-[#725700] shadow-[inset_3px_0_0_#D9B94A]" : "bg-[#D9B94A]/10 font-semibold text-[#FFE27A] shadow-[inset_3px_0_0_#D9B94A]" : isLightMode ? "text-zinc-600 hover:bg-black/[0.04]" : "text-zinc-400 hover:bg-white/[0.04]"}`}>
                      <span>{getSetName(setId)}</span><span className="text-xs tabular-nums opacity-60">{modalCards.filter((card: any) => String(card.set_id) === setId).length}</span>
                    </button>
                  ))}
                </div>
              </nav>
            )}
            <div className={`min-w-0 ${modalTabs.length === 0 ? "lg:col-span-2" : ""}`}>
              <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-5 lg:px-6 lg:py-5">
                <div><h2 className="text-base font-semibold sm:text-lg">{selectedSet ? getSetName(selectedSet) : selectedSection.title}</h2><p className={`mt-0.5 text-xs ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>{loading ? "Loading collection..." : `${setCards.length.toLocaleString()} ${setCards.length === 1 ? "card" : "cards"} in ${selectedSection.title}`}</p></div>
                {filteredCards.length > 0 && <button type="button" onClick={() => setShowCollectionModal(true)} className={`min-h-10 rounded-lg border px-3 text-xs font-semibold transition ${isLightMode ? "border-black/10 text-zinc-600 hover:bg-zinc-50" : "border-white/10 text-zinc-300 hover:bg-white/[0.05]"}`}>Expand view</button>}
              </div>
              {!loading && <div className="px-4 sm:px-5 lg:px-6">{renderRarityButtons()}</div>}
              {loading ? (
                <div role="status" aria-live="polite" className="px-4 pb-5 sm:px-5 lg:px-6 lg:pb-6">
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3 sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] sm:gap-4 xl:grid-cols-[repeat(auto-fill,minmax(175px,1fr))] 2xl:gap-5">{Array.from({length: 10}, (_, index) => <div key={index} className={`aspect-[5/7] animate-pulse rounded-lg ${isLightMode ? "bg-zinc-100" : "bg-white/[0.05]"}`} />)}</div>
                </div>
              ) : filteredCards.length > 0 ? (
                <div className="px-4 pb-5 sm:px-5 lg:px-6 lg:pb-6"><div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3 sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] sm:gap-4 xl:grid-cols-[repeat(auto-fill,minmax(175px,1fr))] 2xl:gap-5">{filteredCards.slice().sort(compareCards).map(renderCard)}</div></div>
              ) : (
                <div className={`flex min-h-40 items-center justify-center px-5 pb-5 text-center text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>{collectionMode === "iso" && !currentUserId ? "Sign in to view this collection." : `No cards in ${selectedSection.title}.`}</div>
              )}
            </div>
          </div>
        </section>
        <CollectionModal />
      </main>
    </div>
  );
}