import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, ShieldAlert, ShieldCheck } from "lucide-react";
import { getProfileAssets } from "@/pages/Everypony/profile-assets";
type TradeCard = {
  id: string;
  user_id: string;
  set_id: string;
  card_key: string;
  actively_trading?: boolean;
  is_for_trade: boolean;
  is_for_sale: boolean;
  asking_price: number | null;
  trade_quantity: number;
  sale_quantity: number;
};
const rarityMap: Record<string, string[]> = {
  "1": ["R", "SR", "SSR", "HR", "UR", "LSR", "SGR", "SC"],
  "2": ["R", "SR", "SSR", "HR", "UR", "LSR", "SGR", "ZR", "SC", "SHINING ZR"],
  "3": ["R", "SR", "SSR", "HR", "UR", "LSR", "SGR", "ZR", "SC", "SZR"],
  "4": ["SSR", "SCR", "UR", "USR", "AR", "OR", "BP", "SAR"],
  "5": ["R", "FR", "SR", "SSR", "TR", "TGR", "MTR", "UR", "USR", "XR"],
  "6": ["BASE", "R", "SR", "ST", "SSR", "FR", "TR", "TGR", "UR", "USR", "XR"],
  "7": ["N", "SN", "R", "SR", "SSR", "UR", "CR"],
  "8": ["N", "SN", "R", "SR", "SSR", "UR", "UGR", "CR"],
  "11": ["N", "SN", "R", "SR", "SSR", "UR", "UGR", "CR", "SCR"],
  "9": ["PR"],
  tcgpromos: ["PR"],
  friendshipsbegin: ["C", "U", "SR", "SPR", "ER", "GR", "CR", "PER", "PRR"],
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
};
const getCardImage = (card: TradeCard) => {
  const [rarity, number] = card.card_key.split("-");
  if (card.set_id === "SD" || card.set_id === "friendshipsbegin") {
    return `/friendships-begin/${card.card_key}.webp`;
  }
  if (card.set_id === "FW") {
    const num = card.card_key.slice(-2);
    if (card.card_key.startsWith("BP01ER")) {
      return `/fantasy-wonderland/SD01ER${num}.webp`;
    }
    if (card.card_key.startsWith("BP01PER")) {
      return `/fantasy-wonderland/SD01PER${num}.webp`;
    }
    return `/fantasy-wonderland/${card.card_key}.webp`;
  }
  if (card.set_id === "12") {
    return `/cards/discord/${card.card_key}.webp`;
  }
  if (card.set_id === "9") {
    return `/promo-cards/mlpepr${String(number).padStart(3, "0")}.webp`;
  }
  if (card.set_id === "tcgpromos") {
    return `/tcgpromos/${card.card_key}.webp`;
  }
  const config: any = {
    "1": { folder: "first-edition-moon", prefix: "M1" },
    "2": { folder: "second-edition-moon", prefix: "M2" },
    "3": { folder: "third-edition-moon", prefix: "M3" },
    "4": { folder: "star-one", prefix: "S1" },
    "5": { folder: "rainbow-one", prefix: "R1" },
    "6": { folder: "rainbow-two", prefix: "R2" },
    "7": { folder: "fun-moments-one", prefix: "FM1" },
    "8": { folder: "fun-moments-two", prefix: "FM2" },
    "11": { folder: "fun-moments-three", prefix: "FM3" },
  };
  const getRarityCode = (rarity: string) => {
    if (rarity === "SHINING ZR") return "SZR";
    return rarity;
  };
  const c = config[card.set_id];
  if (!c) return "";
  return `/cards/${c.folder}/${c.prefix}${getRarityCode(rarity)}${String(number).padStart(3, "0")}${
    card.set_id === "6" && ["ST", "TR", "TGR"].includes(rarity)
      ? ".webp"
      : ".webp"
  }`;
};
export default function TradingPostInner() {
  const { setId } = useParams();
  const navigate = useNavigate();
  const [groupedTrades, setGroupedTrades] = useState<
    Record<string, TradeCard[]>
  >({});
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [tradingProfiles, setTradingProfiles] = useState<
    Record<string, { discord_username: string; trade_access_revoked: boolean }>
  >({});
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedRarity, setSelectedRarity] = useState<string | null>(
    setId === "9" || setId === "tcgpromos" ? "PR" : null,
  );
  const [page, setPage] = useState(0);
  const [openProfile, setOpenProfile] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<TradeCard | null>(null);
  const [reportTarget, setReportTarget] = useState<string | null>(null);
  const [reportedUsers, setReportedUsers] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isReporting, setIsReporting] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportComment, setReportComment] = useState("");
  const [wantsStaffContact, setWantsStaffContact] = useState(false);
  const [reporterDiscord, setReporterDiscord] = useState("");
  const [reportedCardKeys, setReportedCardKeys] = useState<Set<string>>(
    new Set(),
  );
  const [isReportingCard, setIsReportingCard] = useState(false);
  const [cardReportError, setCardReportError] = useState("");
  const [isLightMode, setIsLightMode] = useState(() => {
    if (typeof document === "undefined") return false;
    const root = document.documentElement;
    return (
      root.dataset.theme === "light" ||
      root.classList.contains("light") ||
      !root.classList.contains("dark")
    );
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
    window.addEventListener("themechange", syncTheme);
    return () => {
      observer.disconnect();
      window.removeEventListener("themechange", syncTheme);
    };
  }, []);
  useEffect(() => {
    if (!selectedCard && !reportTarget) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedCard, reportTarget]);
  const USERS_PER_PAGE = 10;
  const setNames: Record<string, string> = {
    "1": "Eternal Moon: First Edition",
    "5": "Rainbow: First Edition",
    "7": "Fun Moments: First Edition",
    "2": "Eternal Moon: Second Edition",
    "8": "Fun Moments: Second Edition",
    "3": "Eternal Moon: Third Edition",
    "11": "Fun Moments: Third Edition",
    "4": "Star: First Edition",
    "6": "Rainbow: Second Edition",
    "9": "Promo Cards",
    friendshipsbegin: "Friendships Begin",
    FW: "Fantasy Wonderland",
    "12": "Discord",
    tcgpromos: "TCG Promos",
  };
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setShowLoginModal(true);
      } else {
        setCurrentUserId(data.session.user.id);
      }
    };
    checkAuth();
  }, []);
  useEffect(() => {
    if (!setId) return;
    const load = async () => {
      setLoading(true);
      let allTrades: any[] = [];
      let from = 0;
      const pageSize = 1000;
      const databaseSetId = setId === "SD" ? "friendshipsbegin" : setId;
      while (true) {
        let query = supabase
          .from("card_market_listings")
          .select(
            "user_id, set_id, card_key, is_for_trade, is_for_sale, asking_price, trade_quantity, sale_quantity, updated_at",
          )
          .order("updated_at", { ascending: false })
          .range(from, from + pageSize - 1);
        query = query.eq("set_id", databaseSetId);
        const { data } = await query;
        if (!data || data.length === 0) break;
        allTrades = [...allTrades, ...data];
        if (data.length < pageSize) break;
        from += pageSize;
      }
      const { data: activeCards } = await supabase
        .from("actively_trading_cards")
        .select("user_id, set_id, card_key")
        .eq("set_id", databaseSetId);
      const activeSet = new Set(
        (activeCards || []).map(
          (card) => `${card.user_id}-${card.set_id}-${card.card_key}`,
        ),
      );
      const trades = allTrades.map((card) => ({
        ...card,
        id: `${card.user_id}-${card.set_id}-${card.card_key}`,
        actively_trading: activeSet.has(
          `${card.user_id}-${card.set_id}-${card.card_key}`,
        ),
      }));
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, username, avatar_url");
      const { data: tradingData } = await supabase
        .from("trading_profiles")
        .select("user_id, discord_username, trade_access_revoked");
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUserId = sessionData.session?.user.id;
      let reportData: { reported_user_id: string }[] = [];
      let cardReportData: {
        reported_user_id: string;
        set_id: string;
        card_key: string;
      }[] = [];
      if (sessionUserId) {
        setCurrentUserId(sessionUserId);
        const { data } = await supabase
          .from("trading_post_user_reports")
          .select("reported_user_id")
          .eq("reporter_user_id", sessionUserId);
        reportData = data || [];
        const { data: cardReports } = await supabase
          .from("trading_post_card_reports")
          .select("reported_user_id, set_id, card_key")
          .eq("reporter_user_id", sessionUserId);
        cardReportData = cardReports || [];
      }
      const profileMap: Record<string, any> = {};
      (profileData || []).forEach((p) => (profileMap[p.id] = p));
      const tradingMap: Record<
        string,
        { discord_username: string; trade_access_revoked: boolean }
      > = {};
      (tradingData || []).forEach(
        (p) =>
          (tradingMap[p.user_id] = {
            discord_username: p.discord_username || "",
            trade_access_revoked: Boolean(p.trade_access_revoked),
          }),
      );
      const tradeMap: Record<string, TradeCard[]> = {};
      (trades || []).forEach((card: TradeCard) => {
        const tradingProfile = tradingMap[card.user_id];
        const hasDiscordUsername = Boolean(
          tradingProfile?.discord_username?.trim(),
        );
        if (
          !tradingProfile ||
          tradingProfile.trade_access_revoked ||
          !hasDiscordUsername
        ) {
          return;
        }
        if (!tradeMap[card.user_id]) {
          tradeMap[card.user_id] = [];
        }
        tradeMap[card.user_id].push(card);
      });
      setGroupedTrades({});
      setTimeout(() => {
        setProfiles(profileMap);
        setTradingProfiles(tradingMap);
        setGroupedTrades(tradeMap);
        setReportedUsers(
          new Set(reportData.map((report) => report.reported_user_id)),
        );
        setReportedCardKeys(
          new Set(
            cardReportData.map(
              (report) =>
                `${report.reported_user_id}-${report.set_id}-${report.card_key}`,
            ),
          ),
        );
        setLoading(false);
      }, 0);
    };
    load();
    const channel = supabase
      .channel("trades")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "card_market_listings" },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [setId]);
  const submitReport = async () => {
    if (!reportTarget || !currentUserId || reportedUsers.has(reportTarget))
      return;
    setIsReporting(true);
    setReportError("");
    if (wantsStaffContact && !reporterDiscord.trim()) {
      setReportError(
        "Enter your Discord username so a staff member can contact you.",
      );
      setIsReporting(false);
      return;
    }
    const { error } = await supabase.from("trading_post_user_reports").insert({
      reporter_user_id: currentUserId,
      reported_user_id: reportTarget,
      reason: "inactive_or_unresponsive",
      reporter_comment: reportComment.trim() || null,
      wants_staff_contact: wantsStaffContact,
      contact_discord_username: wantsStaffContact
        ? reporterDiscord.trim()
        : null,
    });
    if (error) {
      if (error.code === "23505") {
        setReportedUsers((current) => new Set(current).add(reportTarget));
        setReportTarget(null);
        setReportComment("");
        setWantsStaffContact(false);
        setReporterDiscord("");
      } else {
        console.error("Failed to report trading-post user:", error);
        setReportError("Your report could not be submitted. Please try again.");
      }
      setIsReporting(false);
      return;
    }
    setReportedUsers((current) => new Set(current).add(reportTarget));
    setReportTarget(null);
    setReportComment("");
    setWantsStaffContact(false);
    setReporterDiscord("");
    setIsReporting(false);
  };
  const submitCardReport = async () => {
    if (!selectedCard || !currentUserId || !selectedCard.is_for_sale) return;
    const reportKey = `${selectedCard.user_id}-${selectedCard.set_id}-${selectedCard.card_key}`;
    if (reportedCardKeys.has(reportKey)) return;
    setIsReportingCard(true);
    setCardReportError("");
    const { error } = await supabase.from("trading_post_card_reports").insert({
      reporter_user_id: currentUserId,
      reported_user_id: selectedCard.user_id,
      set_id: selectedCard.set_id,
      card_key: selectedCard.card_key,
      reported_price: selectedCard.asking_price,
      reason: "overpriced_listing",
    });
    if (error && error.code !== "23505") {
      console.error("Failed to report card listing:", error);
      setCardReportError(
        "This card report could not be submitted. Please try again.",
      );
      setIsReportingCard(false);
      return;
    }
    setReportedCardKeys((current) => new Set(current).add(reportKey));
    setIsReportingCard(false);
  };
  if (showLoginModal) {
    return (
      <div
        className={`fixed inset-0 z-[9999] flex items-center justify-center px-4 ${
          isLightMode ? "bg-zinc-100/95" : "bg-black/80"
        }`}
      >
        <div
          className={`w-full max-w-md rounded-[24px] border p-6 text-center shadow-xl ${
            isLightMode
              ? "border-black/10 bg-white text-zinc-900"
              : "border-white/10 bg-[#17191a] text-white"
          }`}
        >
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#FFD54A] text-lg font-bold text-zinc-900">
            !
          </div>
          <h2 className="mt-4 text-xl font-semibold">Login required</h2>
          <p
            className={`mt-2 text-sm ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}
          >
            Sign in to access collector listings in the Trading Post.
          </p>
          <button
            type="button"
            onClick={() => navigate("/trading-post")}
            className="mt-5 w-full rounded-2xl bg-[#FFD54A] px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-[#ffe06a]"
          >
            Return to Trading Post
          </button>
        </div>
      </div>
    );
  }
  const getRarity = (key: string) => {
    if (key.startsWith("RR")) return "PR";
    if (setId === "friendshipsbegin") {
      const match = key.match(/SD01([A-Z]+)\d+/);
      return match ? match[1] : "";
    }
    if (setId === "FW") {
      const match = key.match(/BP01([A-Z]+)\d+/);
      return match ? match[1] : "";
    }
    if (setId === "12") {
      if (key.startsWith("BP02-PER")) return "PER";
      const match = key.match(/BP02-([A-Z]+)\d+/);
      return match ? match[1] : "";
    }
    if (key.includes("-")) {
      return key.split("-")[0].trim();
    }
    return "";
  };
  const visibleUsers = Object.entries(groupedTrades).filter(
    ([userId, cards]) => {
      if (!tradingProfiles[userId]) return false;
      if (!selectedRarity && setId !== "9" && setId !== "tcgpromos") {
        return false;
      }
      return cards.some((c) => getRarity(c.card_key) === selectedRarity);
    },
  );
  const totalPages = Math.ceil(visibleUsers.length / USERS_PER_PAGE);
  const filterCardsForRarity = (cards: TradeCard[]) => {
    if (setId === "9" || setId === "tcgpromos") {
      return cards.filter((card) => getRarity(card.card_key) === "PR");
    }
    if (!selectedRarity) return [];
    return cards.filter((card) => getRarity(card.card_key) === selectedRarity);
  };
  const sortedVisibleUsers = [...visibleUsers].sort(
    ([, cardsA], [, cardsB]) =>
      filterCardsForRarity(cardsB).length - filterCardsForRarity(cardsA).length,
  );
  const pagedUsers = sortedVisibleUsers.slice(
    page * USERS_PER_PAGE,
    page * USERS_PER_PAGE + USERS_PER_PAGE,
  );
  return (
    <div
      className={`min-h-screen pb-16 font-['Oxanium'] transition-colors ${
        isLightMode ? "bg-[#f6f4ef] text-zinc-900" : "bg-[#0f1112] text-white"
      }`}
    >
      <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate("/trading-post")}
          className={`mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
            isLightMode
              ? "border-black/10 bg-white text-zinc-700 hover:bg-zinc-50"
              : "border-white/10 bg-[#17191a] text-zinc-300 hover:bg-white/[0.05]"
          }`}
        >
          <ArrowLeft size={16} />
          Trading Post
        </button>
        <section
          className={`mb-4 overflow-hidden rounded-[26px] border ${
            isLightMode
              ? "border-black/10 bg-white"
              : "border-white/[0.08] bg-[#17191a]"
          }`}
        >
          <div className="h-1 bg-gradient-to-r from-[#FFD54A] via-[#e8c446] to-transparent" />
          <div className="p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div
                  className={`text-sm font-medium ${isLightMode ? "text-[#7c6000]" : "text-[#E8CA55]"}`}
                >
                  Collector listings
                </div>
                <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
                  {setNames[setId || ""] || `Set ${setId}`}
                </h1>
                <p
                  className={`mt-2 max-w-2xl text-sm leading-relaxed ${
                    isLightMode ? "text-zinc-600" : "text-zinc-400"
                  }`}
                >
                  Choose a rarity, then click a collector's name or the View
                  profile button to open their profile, ISO, wishlist, and
                  trades.
                </p>
              </div>
              <div
                className={`w-fit rounded-full px-3 py-1.5 text-sm ${
                  isLightMode
                    ? "bg-zinc-100 text-zinc-600"
                    : "bg-white/[0.05] text-zinc-300"
                }`}
              >
                {visibleUsers.length} collectors
              </div>
            </div>
          </div>
        </section>
        {setId &&
          rarityMap[setId] &&
          setId !== "9" &&
          setId !== "tcgpromos" && (
            <section
              className={`mb-4 rounded-[22px] border p-2 ${
                isLightMode
                  ? "border-black/10 bg-white"
                  : "border-white/[0.08] bg-[#17191a]"
              }`}
            >
              <div className="flex gap-2 overflow-x-auto">
                {rarityMap[setId].map((rarity) => {
                  const active = selectedRarity === rarity;
                  const label =
                    rarity === "SHINING ZR" || rarity === "SZR"
                      ? "⬦ZR"
                      : rarity === "SN"
                        ? "⬦N"
                        : rarity === "LC"
                          ? "PR"
                          : rarity === "SCR" && setId !== "4"
                            ? "⬦CR"
                            : rarity === "SAR"
                              ? "◇AR"
                              : (setId === "FW" ||
                                    setId === "friendshipsbegin") &&
                                  rarity.startsWith("P")
                                ? `※${rarity.slice(1)}`
                                : rarity;
                  return (
                    <button
                      key={rarity}
                      type="button"
                      onClick={() => {
                        setSelectedRarity(active ? null : rarity);
                        setPage(0);
                      }}
                      className={`shrink-0 rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition ${
                        active
                          ? "bg-[#FFD54A] text-zinc-900"
                          : isLightMode
                            ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                            : "bg-white/[0.05] text-zinc-300 hover:bg-white/[0.09]"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        {loading && (
          <section
            className={`rounded-[24px] border py-12 text-center ${
              isLightMode
                ? "border-black/10 bg-white"
                : "border-white/[0.08] bg-[#17191a]"
            }`}
          >
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-zinc-400/30 border-t-[#D5AD1F]" />
            <div
              className={`mt-3 text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}
            >
              Loading listings…
            </div>
          </section>
        )}
        {!loading &&
          !selectedRarity &&
          setId !== "9" &&
          setId !== "tcgpromos" && (
            <section
              className={`rounded-[24px] border px-6 py-10 text-center ${
                isLightMode
                  ? "border-black/10 bg-white"
                  : "border-white/[0.08] bg-[#17191a]"
              }`}
            >
              <div className="text-base font-semibold">Choose a rarity</div>
              <p
                className={`mt-1 text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}
              >
                Collector listings will appear here.
              </p>
            </section>
          )}
        {!loading &&
          (selectedRarity || setId === "9" || setId === "tcgpromos") &&
          pagedUsers.length === 0 && (
            <section
              className={`rounded-[24px] border px-6 py-10 text-center ${
                isLightMode
                  ? "border-black/10 bg-white"
                  : "border-white/[0.08] bg-[#17191a]"
              }`}
            >
              <div className="text-base font-semibold">No listings found</div>
              <p
                className={`mt-1 text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}
              >
                No collectors match this rarity right now.
              </p>
            </section>
          )}
        {!loading && pagedUsers.length > 0 && (
          <div className="space-y-3">
            {pagedUsers.map(([userId, cards]) => {
              const filteredCards = filterCardsForRarity(cards);
              const assets = getProfileAssets(profiles[userId]);
              const tradeCount = filteredCards.filter(
                (card) => card.is_for_trade,
              ).length;
              const saleCount = filteredCards.filter(
                (card) => card.is_for_sale,
              ).length;
              if (openProfile === userId) {
                return (
                  <section
                    key={userId}
                    className={`overflow-hidden rounded-[24px] border ${
                      isLightMode
                        ? "border-[#c9a62d]/40 bg-white"
                        : "border-[#FFD54A]/25 bg-[#17191a]"
                    }`}
                  >
                    <div
                      className={`flex items-center justify-between gap-3 border-b px-4 py-3 ${
                        isLightMode ? "border-black/10" : "border-white/[0.08]"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <img
                          src={assets.avatar}
                          alt={profiles[userId]?.username || userId}
                          className={`h-11 w-11 shrink-0 rounded-full border object-cover ${
                            isLightMode ? "border-black/10" : "border-white/15"
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="truncate text-base font-semibold">
                            {profiles[userId]?.username || userId}
                          </div>
                          <div
                            className={`mt-0.5 text-sm ${
                              isLightMode ? "text-zinc-500" : "text-zinc-400"
                            }`}
                          >
                            Collector profile · ISO · Wishlist · Trades
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {currentUserId !== userId && (
                          <button
                            type="button"
                            onClick={() => {
                              if (!reportedUsers.has(userId)) {
                                setReportError("");
                                setReportTarget(userId);
                              }
                            }}
                            disabled={reportedUsers.has(userId)}
                            className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold ${reportedUsers.has(userId) ? (isLightMode ? "bg-emerald-100 text-emerald-700" : "bg-emerald-500/15 text-emerald-400") : isLightMode ? "bg-red-50 text-red-600" : "bg-red-500/10 text-red-400"}`}
                          >
                            {reportedUsers.has(userId) ? (
                              <ShieldCheck size={16} />
                            ) : (
                              <ShieldAlert size={16} />
                            )}
                            {reportedUsers.has(userId)
                              ? "Reported"
                              : "Report user"}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setOpenProfile(null)}
                          className={`rounded-full px-3 py-2 text-sm font-medium ${isLightMode ? "bg-zinc-100 text-zinc-700" : "bg-white/[0.06] text-zinc-300"}`}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                    <iframe
                      src={`/${encodeURIComponent(
                        profiles[userId]?.username ?? "",
                      )}?embed=1`}
                      className="h-[70vh] w-full border-0 sm:h-[540px]"
                      loading="lazy"
                    />
                  </section>
                );
              }
              return (
                <section
                  key={userId}
                  className={`overflow-hidden rounded-[24px] border ${
                    isLightMode
                      ? "border-black/10 bg-white"
                      : "border-white/[0.08] bg-[#17191a]"
                  }`}
                >
                  <div
                    className={`flex items-center gap-3 border-b px-4 py-3 sm:px-5 ${
                      isLightMode ? "border-black/10" : "border-white/[0.08]"
                    }`}
                  >
                    <img
                      src={assets.avatar}
                      alt={profiles[userId]?.username || userId}
                      className={`h-12 w-12 shrink-0 rounded-full border object-cover ${
                        isLightMode ? "border-black/10" : "border-white/15"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setOpenProfile(userId)}
                          className={`truncate text-base font-semibold underline decoration-2 underline-offset-4 ${
                            isLightMode
                              ? "text-[#715700] decoration-[#b99826]/40 hover:text-black"
                              : "text-[#FFD54A] decoration-[#FFD54A]/40 hover:text-[#ffe98a]"
                          }`}
                        >
                          {profiles[userId]?.username || userId}
                        </button>
                        {assets.verification && (
                          <img
                            src={assets.verification.badge}
                            alt={assets.verification.label}
                            title={assets.verification.label}
                            className="h-4 w-4 shrink-0 object-contain"
                          />
                        )}
                      </div>
                      <div
                        className={`mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm ${
                          isLightMode ? "text-zinc-500" : "text-zinc-400"
                        }`}
                      >
                        {tradingProfiles[userId]?.discord_username && (
                          <span>
                            Discord: {tradingProfiles[userId].discord_username}
                          </span>
                        )}
                        <span>
                          {tradeCount} trade{tradeCount === 1 ? "" : "s"}
                        </span>
                        <span>
                          {saleCount} sale{saleCount === 1 ? "" : "s"}
                        </span>
                      </div>
                    </div>
                    {currentUserId !== userId && (
                      <button
                        type="button"
                        onClick={() => {
                          if (!reportedUsers.has(userId)) {
                            setReportError("");
                            setReportTarget(userId);
                          }
                        }}
                        disabled={reportedUsers.has(userId)}
                        title={
                          reportedUsers.has(userId)
                            ? "You already reported this user"
                            : "Report inactive or unresponsive user"
                        }
                        aria-label={
                          reportedUsers.has(userId)
                            ? "User already reported"
                            : "Report user"
                        }
                        className={`flex h-10 shrink-0 items-center justify-center gap-2 rounded-full px-3 text-sm font-semibold transition ${
                          reportedUsers.has(userId)
                            ? isLightMode
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-emerald-500/15 text-emerald-400"
                            : isLightMode
                              ? "bg-zinc-100 text-zinc-500 hover:bg-red-50 hover:text-red-600"
                              : "bg-white/[0.07] text-zinc-400 hover:bg-red-500/10 hover:text-red-400"
                        }`}
                      >
                        {reportedUsers.has(userId) ? (
                          <ShieldCheck size={19} />
                        ) : (
                          <ShieldAlert size={19} />
                        )}
                        <span className="hidden sm:inline">
                          {reportedUsers.has(userId)
                            ? "Reported"
                            : "Report user"}
                        </span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setOpenProfile(userId)}
                      className={`shrink-0 rounded-full px-3 py-2 text-sm font-semibold transition ${
                        isLightMode
                          ? "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                          : "bg-white/[0.07] text-zinc-200 hover:bg-white/[0.12]"
                      }`}
                    >
                      View profile →
                    </button>
                  </div>
                  <div className="p-3 sm:p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm font-semibold">
                        Available cards
                      </div>
                      <div
                        className={`text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}
                      >
                        {filteredCards.length}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 [grid-auto-flow:dense]">
                      {filteredCards
                        .sort((a, b) => {
                          if (setId === "friendshipsbegin") {
                            return a.card_key.localeCompare(b.card_key);
                          }
                          const getNum = (key: string) => {
                            if (!key.includes("-")) {
                              const match = key.match(/(\d+)$/);
                              return match ? parseInt(match[1]) : 0;
                            }
                            return parseInt(key.split("-")[1]);
                          };
                          return getNum(a.card_key) - getNum(b.card_key);
                        })
                        .map((card) => {
                          const [rarity, number] = card.card_key.split("-");
                          const isDoubleCard =
                            card.set_id === "3" &&
                            rarity === "SZR" &&
                            Number(number) === 1;
                          return (
                            <div
                              key={card.id}
                              className={`relative overflow-hidden rounded-[14px] border ${
                                isLightMode
                                  ? "border-black/10 bg-zinc-100"
                                  : "border-white/[0.08] bg-[#0d0f10]"
                              } ${
                                isDoubleCard
                                  ? "col-span-2 aspect-[10/7]"
                                  : "aspect-[5/7]"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => setSelectedCard(card)}
                                aria-label={`View ${card.card_key} listing details`}
                                className="absolute inset-0 h-full w-full"
                              >
                                <img
                                  src={getCardImage(card)}
                                  alt={card.card_key}
                                  className="absolute inset-[-2.5%] h-[105%] w-[105%] max-w-none object-cover"
                                />
                                {card.actively_trading && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                                    <span className="rounded-full bg-[#FFD54A] px-2.5 py-1 text-xs font-semibold text-zinc-900">
                                      Active
                                    </span>
                                  </div>
                                )}
                                <div className="absolute left-1.5 top-1.5 flex gap-1">
                                  {card.is_for_trade && (
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/75 text-xs font-bold text-[#FFD54A]">
                                      ⇄
                                    </span>
                                  )}
                                  {card.is_for_sale && (
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FFD54A] text-xs font-bold text-zinc-900">
                                      $
                                    </span>
                                  )}
                                </div>
                              </button>
                              {card.is_for_sale &&
                                currentUserId !== userId &&
                                (() => {
                                  const reportKey = `${card.user_id}-${card.set_id}-${card.card_key}`;
                                  const alreadyReported =
                                    reportedCardKeys.has(reportKey);
                                  return (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCardReportError("");
                                        setSelectedCard(card);
                                      }}
                                      disabled={alreadyReported}
                                      title={
                                        alreadyReported
                                          ? "You already reported this price"
                                          : "Report this card's price"
                                      }
                                      aria-label={
                                        alreadyReported
                                          ? "Card price already reported"
                                          : `Report ${card.card_key} price`
                                      }
                                      className={`absolute bottom-1.5 right-1.5 z-10 flex h-8 w-8 items-center justify-center rounded-full border shadow-lg backdrop-blur-sm ${alreadyReported ? "border-emerald-400/30 bg-emerald-500/90 text-white" : "border-white/20 bg-red-500/90 text-white hover:bg-red-600"}`}
                                    >
                                      {alreadyReported ? (
                                        <ShieldCheck size={16} />
                                      ) : (
                                        <ShieldAlert size={16} />
                                      )}
                                    </button>
                                  );
                                })()}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}
        {totalPages > 1 && (
          <div
            className={`mt-5 flex items-center justify-between rounded-[20px] border p-2 ${
              isLightMode
                ? "border-black/10 bg-white"
                : "border-white/[0.08] bg-[#17191a]"
            }`}
          >
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className={`rounded-full px-4 py-2 text-sm font-medium disabled:opacity-30 ${
                isLightMode
                  ? "bg-zinc-100 text-zinc-700"
                  : "bg-white/[0.06] text-zinc-300"
              }`}
            >
              ← Previous
            </button>
            <span
              className={`text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}
            >
              Page {page + 1} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className={`rounded-full px-4 py-2 text-sm font-medium disabled:opacity-30 ${
                isLightMode
                  ? "bg-zinc-100 text-zinc-700"
                  : "bg-white/[0.06] text-zinc-300"
              }`}
            >
              Next →
            </button>
          </div>
        )}
      </main>
      {selectedCard && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm"
          onMouseDown={() => setSelectedCard(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="listing-details-title"
            onMouseDown={(event) => event.stopPropagation()}
            className={`max-h-[82dvh] w-full max-w-xl overflow-y-auto rounded-[20px] shadow-2xl ${
              isLightMode ? "bg-white text-zinc-900" : "bg-[#17191a] text-white"
            }`}
          >
            <div className="grid sm:grid-cols-[minmax(160px,0.8fr)_minmax(250px,1.2fr)]">
              <div
                className={`flex items-center justify-center p-3 ${
                  isLightMode ? "bg-zinc-100" : "bg-black/25"
                }`}
              >
                <img
                  src={getCardImage(selectedCard)}
                  alt="Selected listing"
                  className="max-h-[32dvh] w-full max-w-[220px] rounded-xl object-contain sm:max-h-[48dvh]"
                />
              </div>
              <div className="p-3.5 sm:p-4">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      getProfileAssets(profiles[selectedCard.user_id]).avatar
                    }
                    alt=""
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <h2
                      id="listing-details-title"
                      className="truncate text-lg font-bold"
                    >
                      {profiles[selectedCard.user_id]?.username || "Collector"}
                    </h2>
                    <div className="mt-1 inline-flex max-w-full items-center rounded-lg bg-[#5865F2]/15 px-2.5 py-1 text-sm font-bold text-[#5865F2]">
                      Discord:{" "}
                      {tradingProfiles[selectedCard.user_id]
                        ?.discord_username || "Not provided"}
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {selectedCard.is_for_trade && (
                    <div
                      className={`flex items-center justify-between rounded-xl px-3 py-2.5 ${
                        isLightMode ? "bg-emerald-50" : "bg-emerald-500/10"
                      }`}
                    >
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        For trade
                      </span>
                      <span className="font-bold">
                        {selectedCard.trade_quantity}
                      </span>
                    </div>
                  )}
                  {selectedCard.is_for_sale && (
                    <div
                      className={`rounded-xl px-3 py-2.5 ${
                        isLightMode ? "bg-sky-50" : "bg-sky-500/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sky-600 dark:text-sky-400">
                          For sale
                        </span>
                        <span className="font-bold">
                          {selectedCard.sale_quantity}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span
                          className={
                            isLightMode ? "text-zinc-500" : "text-zinc-400"
                          }
                        >
                          Asking price
                        </span>
                        <span className="text-lg font-bold">
                          ${Number(selectedCard.asking_price || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                {selectedCard.is_for_sale &&
                  currentUserId !== selectedCard.user_id &&
                  (() => {
                    const reportKey = `${selectedCard.user_id}-${selectedCard.set_id}-${selectedCard.card_key}`;
                    const alreadyReported = reportedCardKeys.has(reportKey);
                    return (
                      <>
                        <button
                          type="button"
                          onClick={submitCardReport}
                          disabled={alreadyReported || isReportingCard}
                          className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${
                            alreadyReported
                              ? isLightMode
                                ? "bg-zinc-100 text-zinc-400"
                                : "bg-white/[0.04] text-zinc-500"
                              : "bg-red-500/10 text-red-500 hover:bg-red-500/15"
                          }`}
                        >
                          {alreadyReported ? (
                            <ShieldCheck size={17} />
                          ) : (
                            <ShieldAlert size={17} />
                          )}
                          {alreadyReported
                            ? "Price already reported"
                            : "Report overpriced card"}
                        </button>
                        {cardReportError && (
                          <p className="mt-2 text-sm text-red-500">
                            {cardReportError}
                          </p>
                        )}
                      </>
                    );
                  })()}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCard(null);
                    setCardReportError("");
                  }}
                  className={`mt-3 w-full rounded-xl px-4 py-3 text-sm font-semibold ${
                    isLightMode
                      ? "bg-zinc-100 text-zinc-700"
                      : "bg-white/[0.07] text-zinc-200"
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {reportTarget && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-user-title"
            className={`max-h-[82dvh] w-full max-w-sm overflow-y-auto rounded-[20px] p-4 shadow-2xl ${
              isLightMode ? "bg-white text-zinc-900" : "bg-[#17191a] text-white"
            }`}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <ShieldAlert size={19} />
            </div>
            <h2 id="report-user-title" className="mt-3 text-lg font-bold">
              Would you like to report this person?
            </h2>
            <p
              className={`mt-2 text-xs leading-relaxed ${
                isLightMode ? "text-zinc-600" : "text-zinc-300"
              }`}
            >
              Please only report people who are inactive on the website and/or
              Discord server and do not answer trade or purchase requests. We
              are preserving this feature to get rid of dead accounts on sales
              and trades so only active users appear here and nobody&apos;s time
              is wasted.
            </p>
            <p
              className={`mt-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold ${isLightMode ? "bg-amber-50 text-amber-800" : "bg-amber-500/10 text-amber-300"}`}
            >
              You can only report this user once.
            </p>
            <label className="mt-3 block">
              <span className="mb-1.5 block text-sm font-semibold">
                Comment for moderators{" "}
                <span className="font-normal text-zinc-500">(optional)</span>
              </span>
              <textarea
                value={reportComment}
                onChange={(event) => {
                  const words = event.target.value
                    .trim()
                    .split(/\s+/)
                    .filter(Boolean);
                  setReportComment(
                    words.length <= 1500
                      ? event.target.value
                      : words.slice(0, 1500).join(" "),
                  );
                }}
                rows={3}
                className={`w-full resize-none rounded-xl border px-3 py-2.5 text-base outline-none ${isLightMode ? "border-black/10 bg-zinc-50 text-zinc-900" : "border-white/10 bg-white/[0.05] text-white"}`}
                placeholder="Add anything moderators should know..."
              />
              <span className="mt-1 block text-right text-xs text-zinc-500">
                {reportComment.trim()
                  ? reportComment.trim().split(/\s+/).length
                  : 0}{" "}
                / 1,500 words
              </span>
            </label>
            <label
              className={`mt-2.5 flex cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2.5 ${isLightMode ? "border-black/10 bg-zinc-50" : "border-white/10 bg-white/[0.04]"}`}
            >
              <input
                type="checkbox"
                checked={wantsStaffContact}
                onChange={(event) => setWantsStaffContact(event.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#FFD54A]"
              />
              <span className="text-sm font-medium">
                I would like to be contacted by a staff member in the Discord
                server.
              </span>
            </label>
            {wantsStaffContact && (
              <label className="mt-3 block">
                <span className="mb-1.5 block text-sm font-semibold">
                  Your Discord username
                </span>
                <input
                  value={reporterDiscord}
                  onChange={(event) => setReporterDiscord(event.target.value)}
                  className={`w-full rounded-xl border px-3 py-2.5 text-base outline-none ${isLightMode ? "border-black/10 bg-zinc-50 text-zinc-900" : "border-white/10 bg-white/[0.05] text-white"}`}
                  placeholder="Discord username"
                />
              </label>
            )}
            {reportError && (
              <div className="mt-3 rounded-xl bg-red-500/10 px-3 py-2 text-sm font-medium text-red-500">
                {reportError}
              </div>
            )}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setReportTarget(null);
                  setReportError("");
                  setReportComment("");
                  setWantsStaffContact(false);
                  setReporterDiscord("");
                }}
                disabled={isReporting}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${
                  isLightMode
                    ? "bg-zinc-100 text-zinc-700"
                    : "bg-white/[0.07] text-zinc-200"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitReport}
                disabled={isReporting}
                className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isReporting ? "Reporting..." : "Report user"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
