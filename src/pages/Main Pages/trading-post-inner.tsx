import { ENGLISH_MERCHANDISE_SET_ID, merchandiseSets } from "@/lib/english-merchandise-catalog";
import { profileViewCard, profileViewGroup } from "@/lib/english-card-views";
import { HEARTHSWARMING_EVE_CARDS } from "@/lib/hearthswarming-eve";
import { getHeartswarmingEveRarity } from "@/lib/hearthswarming-eve";
import ProfileAvatar from "@/components/ProfileAvatar";
import CardImage from "@/components/CardImage";
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Search, SlidersHorizontal, Users, Layers, ChevronRight, ChevronDown, ShoppingBag, Check, Handshake, ShieldAlert, ShieldCheck, X } from "lucide-react";
import { getProfileAssets } from "@/pages/Everypony/profile-assets";
import ExploreProfile from "@/pages/Everypony/explore-profile";
import TradeOfferComposer from "@/components/trading/TradeOfferComposer";
import { chineseSets, getChineseCard } from "@/pages/Chinese Kayou/Chinese ISO/catalog/catalog";
import { TradeCard, OfferState, getListingDisplayCode, COLLECTION_SET_TOTALS, normalizeCollectionKey, isOwnedProgress, randomHeroCards, offerKeyFor, rarityMap, comparePromoCards, ListingCardImage, isWideTradeCard, isSquareTradeCard, getOfferRarityLabel, getOfferSetName } from "@/components/trading/trade-card-display";
export default function TradingPostInner({ language = "english" }: { language?: "english" | "chinese" } = {}) {
  const { setId } = useParams();
  const merchandise = setId === ENGLISH_MERCHANDISE_SET_ID;
  const itemWord = merchandise ? "items" : "cards";
  const navigate = useNavigate();
  const chineseSet = chineseSets.find(set => set.id === setId);
  const basePath = language === "chinese" ? "/trading-post-chinese" : "/trading-post";
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
  const [search, setSearch] = useState("");
  const [listingType, setListingType] = useState<"iso" | "all" | "trade" | "sale">("iso");
  const [sortBy, setSortBy] = useState("cards");
  const [loadStage, setLoadStage] = useState(0);
  const [loadingSeconds, setLoadingSeconds] = useState(0);
  const [ownedCardKeys, setOwnedCardKeys] = useState<Set<string>>(new Set());
  const [isoError, setIsoError] = useState("");
  const [reload, setReload] = useState(0);
  const [heroCards, setHeroCards] = useState<TradeCard[]>([]);
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    setSelectedRarity(null);
    setSearch("");
    setListingType("iso");
    setHeroCards([]);
    setOwnedCardKeys(new Set());
    setIsoError("");
    setPage(0);
    setOpenProfile(null);
    setOfferTarget(null);
    setSelectedCard(null);
  }, [setId]);
  const [openProfile, setOpenProfile] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<TradeCard | null>(null);
  const [reportTarget, setReportTarget] = useState<string | null>(null);
  const [confirmReport, setConfirmReport] = useState<"user" | "card" | null>(null);
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
  const [showUnsetPriceNotice, setShowUnsetPriceNotice] = useState(false);
  const [offerStates, setOfferStates] = useState<Record<string, OfferState>>(
    {},
  );
  const [activeOffersByRecipient, setActiveOffersByRecipient] = useState<
    Record<string, number>
  >({});
  const [offerTarget, setOfferTarget] = useState<TradeCard | null>(null);
  const [isLightMode, setIsLightMode] = useState(() => {
    if (typeof document === "undefined") return false;
    const root = document.documentElement;
    return (
      root.dataset.theme === "light" ||
      root.classList.contains("light") ||
      (root.dataset.theme !== "spooky" && !root.classList.contains("dark"))
    );
  });
  const [strikeCounts, setStrikeCounts] = useState<Record<string, number>>({});
  const [sortOpen, setSortOpen] = useState(false);
  const marketRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!loading) return;
    setLoadingSeconds(0);
    const timer = window.setInterval(() => setLoadingSeconds((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(timer);
  }, [loading, reload, setId]);
  useEffect(() => {
    const element = marketRef.current;
    if (!element) return;
    const measure = () => {
      const top = Math.max(0, element.getBoundingClientRect().top + window.scrollY);
      const offset = `${Math.round(top)}px`;
      if (element.style.getPropertyValue("--tp-page-top") !== offset) element.style.setProperty("--tp-page-top", offset);
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (element.parentElement) observer.observe(element.parentElement);
    window.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("resize", measure);
    };
  }, [showLoginModal]);
  useEffect(() => {
    if (!sortOpen) return;
    const dismiss = (event: KeyboardEvent) => { if (event.key === "Escape") setSortOpen(false); };
    window.addEventListener("keydown", dismiss);
    return () => window.removeEventListener("keydown", dismiss);
  }, [sortOpen]);
  useEffect(() => {
    const syncTheme = () => {
      const root = document.documentElement;
      setIsLightMode(
        root.dataset.theme === "light" ||
          root.classList.contains("light") ||
          (root.dataset.theme !== "spooky" && !root.classList.contains("dark")),
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
    if (!selectedCard && !reportTarget && !showUnsetPriceNotice && !openProfile)
      return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedCard, reportTarget, showUnsetPriceNotice, openProfile]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || isReporting || isReportingCard) return;
      if (confirmReport) { setConfirmReport(null); return; }
      if (showUnsetPriceNotice) { setShowUnsetPriceNotice(false); return; }
      if (reportTarget) { setReportTarget(null); return; }
      if (offerTarget) return;
      if (selectedCard) { setSelectedCard(null); return; }
      setOpenProfile(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [confirmReport, showUnsetPriceNotice, reportTarget, offerTarget, selectedCard, isReporting, isReportingCard]);
  const USERS_PER_PAGE = 10;
  const setNames: Record<string, string> = {
    ...Object.fromEntries(chineseSets.map(set => [set.id, set.name])),
    "1": "Eternal Moon: First Edition",
    "5": "Rainbow: First Edition",
    "7": "Fun Moments: First Edition",
    "2": "Eternal Moon: Second Edition",
    "8": "Fun Moments: Second Edition",
    "3": "Eternal Moon: Third Edition",
    "13": "Eternal Moon: Fourth Edition",
    "11": "Fun Moments: Third Edition",
    "4": "Star: First Edition",
    "6": "Rainbow: Second Edition",
    "9": "Promo Cards",
    friendshipsbegin: "Friendships Begin",
    FW: "Fantasy Wonderland",
    "12": "Discord",
    "14": "Nightmare Night",
    "hearthswarming-eve": "HearthsWarming Eve",
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
    if (!setId || (language === "chinese" ? !chineseSet : setId.startsWith("cn-"))) { setLoading(false); return; }
    let active = true;
    let requestVersion = 0;
    let hasLoaded = false;
    const load = async () => {
      if (!active) return;
      const version = ++requestVersion;
      const isCurrent = () => active && version === requestVersion;
      if (!hasLoaded) setLoading(true);
      setLoadError("");
      try {
      setLoadStage(0);
      let allTrades: any[] = [];
      let from = 0;
      const pageSize = 1000;
      const databaseSetId = setId === "SD" ? "friendshipsbegin" : setId;
      while (true) {
        let query = supabase
          .from("card_market_listings")
          .select(
            "user_id, set_id, card_key, is_for_trade, is_for_sale, asking_price, trade_quantity, sale_quantity",
          )
          .order("user_id", { ascending: true })
          .order("card_key", { ascending: true })
          .range(from, from + pageSize - 1);
        query = query.eq("set_id", databaseSetId);
        const { data, error } = await query;
        if (!isCurrent()) return;
        if (error) throw error;
        if (!data || data.length === 0) break;
        allTrades = [...allTrades, ...data];
        if (data.length < pageSize) break;
        from += pageSize;
      }
      setLoadStage(1);
      const uniqueTrades = Array.from(
        new Map(
          allTrades.map((card) => [
            `${card.user_id}-${card.set_id}-${card.card_key}`,
            card,
          ]),
        ).values(),
      );
      const trades = uniqueTrades
        .filter((card) => (card.is_for_trade || card.is_for_sale) && (card.set_id !== ENGLISH_MERCHANDISE_SET_ID || Boolean(profileViewCard(card))))
        .map((card) => ({
          ...card,
          id: `${card.user_id}-${card.set_id}-${card.card_key}`,
        }));
      const { data: sessionData } = await supabase.auth.getSession();
      if (!isCurrent()) return;
      const sessionUserId = sessionData.session?.user.id;
      let heroCandidates: TradeCard[] = trades.map((card) => ({ ...card, id: `${card.user_id}-${card.set_id}-${card.card_key}` }));
      if (sessionUserId) {
        const collectionSetIds = ["SD", "friendshipsbegin"].includes(setId)
          ? ["SD", "friendshipsbegin", "SD_STARTERS", "SD_BONUS"]
          : [databaseSetId];
        const { data: collectionData, error: collectionError } = await supabase
          .from("collection_progress_raw")
          .select("set_id, progress")
          .eq("user_id", sessionUserId)
          .in("set_id", collectionSetIds);
        if (!isCurrent()) return;
        if (collectionError) {
          setOwnedCardKeys(new Set());
          setIsoError("Your ISO could not be loaded. Please try again.");
        } else {
          setIsoError("");
          heroCandidates = [...heroCandidates, ...(collectionData || []).flatMap((row: { progress: unknown }) =>
            Object.keys((row.progress || {}) as Record<string, unknown>).map((key) => ({
              id: `hero-${key}`,
              user_id: sessionUserId,
              set_id: databaseSetId,
              card_key: key.replace(/^(?:BONUS|STARTER|STARTERS)-/, ""),
              is_for_trade: false,
              is_for_sale: false,
              asking_price: null,
              trade_quantity: 0,
              sale_quantity: 0,
            })),
          )];
          setOwnedCardKeys(new Set((collectionData || []).flatMap((row: { progress: unknown }) =>
            Object.entries((row.progress || {}) as Record<string, unknown>)
              .filter(([, value]) => isOwnedProgress(value))
              .map(([key]) => normalizeCollectionKey(key)),
          )));
        }
      } else {
        setOwnedCardKeys(new Set());
      }
      if (setId === "hearthswarming-eve" && heroCandidates.length === 0) {
        heroCandidates = HEARTHSWARMING_EVE_CARDS.map(({ key }) => ({
          id: `hero-bp04-${key}`,
          user_id: sessionUserId || "",
          set_id: "hearthswarming-eve",
          card_key: key,
          is_for_trade: false,
          is_for_sale: false,
          asking_price: null,
          trade_quantity: 0,
          sale_quantity: 0,
        }));
      }
      setHeroCards((current) => current.length ? current : randomHeroCards(heroCandidates));
      const participantIds = Array.from(
        new Set([
          ...trades.map((card) => card.user_id),
          ...(sessionUserId ? [sessionUserId] : []),
        ]),
      );
      const nextStrikeCounts: Record<string, number> = {};
      if (sessionUserId) {
        const { data: moderatorRows, error: moderatorError } = await supabase
          .from("leaderboard_moderators")
          .select("user_id")
          .eq("user_id", sessionUserId);
        if (!isCurrent()) return;
        const canReadAll = !moderatorError && (moderatorRows || []).some((row: { user_id: string }) => row.user_id === sessionUserId);
        const strikeUserIds = canReadAll ? participantIds : [sessionUserId];
        let strikeOffset = 0;
        let strikesAvailable = true;
        strikeUserIds.forEach((id) => { nextStrikeCounts[id] = 0; });
        while (strikeUserIds.length) {
          const { data: strikeRows, error: strikeError } = await supabase
            .from("trade_offer_expiration_strikes")
            .select("recipient_user_id")
            .in("recipient_user_id", strikeUserIds)
            .is("cleared_at", null)
            .order("id", { ascending: true })
            .range(strikeOffset, strikeOffset + 999);
          if (!isCurrent()) return;
          if (strikeError) { strikesAvailable = false; break; }
          (strikeRows || []).forEach((row: { recipient_user_id: string }) => {
            nextStrikeCounts[row.recipient_user_id] = (nextStrikeCounts[row.recipient_user_id] || 0) + 1;
          });
          if (!strikeRows || strikeRows.length < 1000) break;
          strikeOffset += 1000;
        }
        if (!strikesAvailable) Object.keys(nextStrikeCounts).forEach((id) => { delete nextStrikeCounts[id]; });
      }
      const [profilesResult, tradingProfilesResult] = participantIds.length
        ? await Promise.all([
            supabase
              .from("profiles")
              .select("id, username, avatar_url, vacation_mode, chinese_cards_enabled")
              .in("id", participantIds),
            supabase
              .from("trading_profiles")
              .select("user_id, discord_username, trade_access_revoked")
              .in("user_id", participantIds),
          ])
        : [{ data: [] }, { data: [] }];
      if (!isCurrent()) return;
      if ("error" in profilesResult && profilesResult.error) throw profilesResult.error;
      if ("error" in tradingProfilesResult && tradingProfilesResult.error) throw tradingProfilesResult.error;
      setLoadStage(2);
      const profileData = profilesResult.data;
      const tradingData = tradingProfilesResult.data;
      let reportData: { reported_user_id: string }[] = [];
      let cardReportData: {
        reported_user_id: string;
        set_id: string;
        card_key: string;
      }[] = [];
      let sentOfferData: {
        recipient_id: string;
        target_set_id: string;
        target_card_key: string;
        status: string;
        expires_at: string;
        created_at: string;
        attempt_number: number;
      }[] = [];
      let activeOfferData: { recipient_id: string }[] = [];
      if (sessionUserId) {
        setCurrentUserId(sessionUserId);
        const [
          userReportsResult,
          cardReportsResult,
          sentOffersResult,
          activeOffersResult,
        ] = await Promise.all([
          supabase
            .from("trading_post_user_reports")
            .select("reported_user_id")
            .eq("reporter_user_id", sessionUserId),
          supabase
            .from("trading_post_card_reports")
            .select("reported_user_id, set_id, card_key")
            .eq("reporter_user_id", sessionUserId),
          supabase
            .from("trade_offers")
            .select(
              "recipient_id, target_set_id, target_card_key, status, expires_at, created_at, attempt_number",
            )
            .eq("sender_id", sessionUserId)
            .eq("target_set_id", databaseSetId),
          supabase
            .from("trade_offers")
            .select("recipient_id")
            .eq("sender_id", sessionUserId)
            .eq("status", "pending")
            .gt("expires_at", new Date().toISOString()),
        ]);
        if (!isCurrent()) return;
        reportData = userReportsResult.data || [];
        cardReportData = cardReportsResult.data || [];
        sentOfferData = sentOffersResult.data || [];
        activeOfferData = activeOffersResult.data || [];
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
          (language === "chinese" && profileMap[card.user_id]?.chinese_cards_enabled !== true) ||
          (language === "chinese" && !getChineseCard(card.set_id, card.card_key)) ||
          profileMap[card.user_id]?.vacation_mode ||
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
      if (!isCurrent()) return;
        setStrikeCounts(nextStrikeCounts);
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
        const nextOfferStates: Record<string, OfferState> = {};
        const nextActiveCounts: Record<string, number> = {};
        sentOfferData.forEach((offer) => {
          const key = offerKeyFor(
            offer.recipient_id,
            offer.target_set_id,
            offer.target_card_key,
          );
          const current = nextOfferStates[key];
          const attempts = Math.max(
            current?.attempts || 0,
            Number(offer.attempt_number || 1),
          );
          if (
            !current ||
            new Date(offer.created_at).getTime() >=
              new Date(current.latestCreatedAt).getTime()
          ) {
            nextOfferStates[key] = {
              attempts,
              latestStatus: offer.status,
              latestExpiresAt: offer.expires_at,
              latestCreatedAt: offer.created_at,
            };
          } else {
            nextOfferStates[key].attempts = attempts;
          }
        });
        activeOfferData.forEach((offer) => {
          nextActiveCounts[offer.recipient_id] =
            (nextActiveCounts[offer.recipient_id] || 0) + 1;
        });
        setOfferStates(nextOfferStates);
        setActiveOffersByRecipient(nextActiveCounts);
        hasLoaded = true;
      } catch (error) {
        if (isCurrent()) {
          console.error("Unable to load marketplace:", error);
          setLoadError("The marketplace could not be loaded. Please try again.");
        }
      } finally {
        if (isCurrent()) setLoading(false);
      }
    };
    load();
    const channel = supabase
      .channel("trades")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "card_market_listings", filter: `set_id=eq.${setId === "SD" ? "friendshipsbegin" : setId}` },
        () => load(),
      )
      .subscribe();
    return () => {
      active = false;
      requestVersion++;
      supabase.removeChannel(channel);
    };
  }, [setId, reload, language]);
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
        setConfirmReport(null);
        setReportTarget(null);
        setReportComment("");
        setWantsStaffContact(false);
        setReporterDiscord("");
      } else {
        console.error("Failed to report trading-post user:", error);
        setReportError("Your report could not be submitted. Please try again.");
        setConfirmReport(null);
      }
      setIsReporting(false);
      return;
    }
    setReportedUsers((current) => new Set(current).add(reportTarget));
    setConfirmReport(null);
    setReportTarget(null);
    setReportComment("");
    setWantsStaffContact(false);
    setReporterDiscord("");
    setIsReporting(false);
  };
  const submitCardReport = async () => {
    if (!selectedCard || !currentUserId || !selectedCard.is_for_sale) return;
    if (Number(selectedCard.asking_price ?? 0) <= 0) {
      setCardReportError("");
      setShowUnsetPriceNotice(true);
      return;
    }
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
      setConfirmReport(null);
      setIsReportingCard(false);
      return;
    }
    setReportedCardKeys((current) => new Set(current).add(reportKey));
    setConfirmReport(null);
    setIsReportingCard(false);
  };
  const getOfferAction = (card: TradeCard) => {
    const key = offerKeyFor(card.user_id, card.set_id, card.card_key);
    const state = offerStates[key];
    if (state?.attempts >= 2) {
      return { enabled: false, label: "No offers left" };
    }
    if (state?.attempts === 1 && state.latestStatus === "declined") {
      if ((activeOffersByRecipient[card.user_id] || 0) >= 2) {
        return { enabled: false, label: "2 active offers sent" };
      }
      return { enabled: true, label: "1 try left. Offer again?" };
    }
    if (state) {
      return { enabled: false, label: "Offer already sent" };
    }
    if ((activeOffersByRecipient[card.user_id] || 0) >= 2) {
      return { enabled: false, label: "2 active offers sent" };
    }
    return { enabled: true, label: "Make an offer" };
  };
  const openOfferComposer = (card: TradeCard) => {
    if (!currentUserId || currentUserId === card.user_id || !getOfferAction(card).enabled) return;
    setSelectedCard(null);
    setOfferTarget(card);
  };
  const recordSentOffer = (target: TradeCard) => {
    const key = offerKeyFor(target.user_id, target.set_id, target.card_key);
    const now = new Date();
    setOfferStates(current => ({ ...current, [key]: { attempts: (current[key]?.attempts ?? 0) + 1, latestStatus: "pending", latestCreatedAt: now.toISOString(), latestExpiresAt: new Date(now.getTime() + 7 * 86400000).toISOString() } }));
    setActiveOffersByRecipient(current => ({ ...current, [target.user_id]: (current[target.user_id] ?? 0) + 1 }));
  };
  if (language === "chinese" && !chineseSet) return <main className="px-4 py-6"><h1 className="text-xl font-semibold">Set not found</h1><button type="button" className="mt-3 text-primary" onClick={() => navigate(basePath)}>All Chinese sets</button></main>;
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
            onClick={() => navigate(basePath)}
            className="mt-5 w-full rounded-2xl bg-[#FFD54A] px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-[#ffe06a]"
          >
            Return to Trading Post
          </button>
        </div>
      </div>
    );
  }
  const getRarity = (key: string) => {
    if (merchandise) return profileViewGroup({ set_id: ENGLISH_MERCHANDISE_SET_ID, card_key: key });
    if (language === "chinese") return getChineseCard(setId ?? "", key)?.rarity ?? "";
    if (setId === "hearthswarming-eve") return getHeartswarmingEveRarity(key);
    if (setId === "14") {
      const match = key.match(
        /^(P?)BP03-(SPR|SR|ER|GR|CR|RR|C|U)\d{2}(?:-[ABC]2?)?$/,
      );
      return match ? `${match[1]}${match[2]}` : "";
    }
    if (key.startsWith("RR")) return "PR";
    if (setId === "friendshipsbegin" || setId === "SD") {
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
  const matchesCard = (card: TradeCard) => {
    const rarityMatches = !selectedRarity || getRarity(card.card_key) === selectedRarity;
    const typeMatches = listingType === "iso"
      ? Boolean(currentUserId) && !isoError && card.user_id !== currentUserId && !ownedCardKeys.has(normalizeCollectionKey(card.card_key)) && (card.is_for_trade || card.is_for_sale)
      : listingType === "all" || (listingType === "trade" ? card.is_for_trade : card.is_for_sale);
    const term = search.trim().toLowerCase();
    const searchMatches = !term || [profiles[card.user_id]?.username, tradingProfiles[card.user_id]?.discord_username].some((value) => String(value || "").toLowerCase().includes(term));
    return rarityMatches && typeMatches && searchMatches;
  };
  const filterCardsForRarity = (cards: TradeCard[]) => cards.filter(matchesCard);
  const visibleUsers = Object.entries(groupedTrades).filter(([userId, cards]) => tradingProfiles[userId] && cards.some(matchesCard));
  const totalPages = Math.ceil(visibleUsers.length / USERS_PER_PAGE);
  const currentPage = Math.min(page, Math.max(0, totalPages - 1));
  const sortedVisibleUsers = [...visibleUsers].sort(([idA, cardsA], [idB, cardsB]) =>
    sortBy === "name"
      ? String(profiles[idA]?.username || idA).localeCompare(String(profiles[idB]?.username || idB))
      : filterCardsForRarity(cardsB).length - filterCardsForRarity(cardsA).length,
  );
  const pagedUsers = sortedVisibleUsers.slice(currentPage * USERS_PER_PAGE, (currentPage + 1) * USERS_PER_PAGE);
  const allListings = Object.values(groupedTrades).flat();
  const collectionTotal = COLLECTION_SET_TOTALS[setId || ""] || 0;
  const collectionOwned = Math.min(collectionTotal, merchandise ? merchandiseSets.flatMap(set => set.items).filter(item => ownedCardKeys.has(normalizeCollectionKey(item.key))).length : chineseSet ? chineseSet.cards.filter(card => ownedCardKeys.has(card.key)).length : ownedCardKeys.size);
  const collectionMissing = Math.max(0, collectionTotal - collectionOwned);
  const collectionPercent = collectionTotal ? Math.round(collectionOwned / collectionTotal * 100) : 0;
  const availableMissingCards = new Set(allListings
    .filter((card) => card.user_id !== currentUserId && (card.is_for_trade || card.is_for_sale) && !ownedCardKeys.has(normalizeCollectionKey(card.card_key)))
    .map((card) => normalizeCollectionKey(card.card_key))).size;
  const visibleListingCount = visibleUsers.reduce((count, [, cards]) => count + filterCardsForRarity(cards).length, 0);
  const resetFilters = () => { setSearch(""); setSelectedRarity(null); setListingType("iso"); setPage(0); };
  return (
    <div
      ref={marketRef}
      className={`tp-market ${language === "chinese" ? "tp-chinese" : ""} ${isLightMode ? "tp-light" : ""} font-['Oxanium'] transition-colors ${
        isLightMode ? "text-zinc-900" : "text-white"
      }`}
    >
      <style>{`
        .tp-market{--tp-panel:#171b23;--tp-soft:#202631;--tp-line:#ffffff12;--tp-muted:#a0a9b8;--tp-accent:#ffd54a;--tp-action:#ffd54a;--tp-action-ink:#29230e;--tp-glow-rgb:255,213,74;--tp-ink:#f7f8fc;background:hsl(var(--background))!important;color:var(--tp-ink)!important;overflow-x:clip;display:flex;flex-direction:column;box-sizing:border-box;min-height:calc(100vh - var(--tp-page-top,0px));min-height:calc(100dvh - var(--tp-page-top,0px));padding-bottom:0}
        .tp-market.tp-light{--tp-panel:#fff;--tp-soft:#f3f4f7;--tp-line:#18223814;--tp-muted:#606b7d;--tp-accent:#b18100;--tp-ink:#202635;background:hsl(var(--background))!important}
        html[data-theme="spooky"] .tp-market{--tp-accent:#c9acff;--tp-action:#7544ad;--tp-action-ink:#fff;--tp-glow-rgb:201,172,255}
        html[data-theme="spooky"] .tp-market .tp-type button[aria-pressed=true],html[data-theme="spooky"] .tp-market .tp-rarities button[aria-pressed=true],html[data-theme="spooky"] .tp-market .tp-empty>button,html[data-theme="spooky"] .tp-market .tp-profile-btn:hover{background:var(--tp-action);border-color:var(--tp-action);color:var(--tp-action-ink)}
        html[data-theme="spooky"] .tp-market .tp-collector-head{background:transparent;padding:12px 0}
        html[data-theme="spooky"] .tp-market .tp-strikes-warning{background:rgba(167,123,232,.12)}
        html[data-theme="spooky"] .tp-market .tp-card-tags span{color:#c9acff}
        html[data-theme="spooky"] .tp-market .tp-load-track span,html[data-theme="spooky"] .tp-market .tp-collection-track span{background:linear-gradient(90deg,transparent,#c9acff,transparent)}
        html[data-theme="spooky"] .tp-market [class*="bg-[#FFD54A]"]:not([class*="bg-[#FFD54A]/"]),html[data-theme="spooky"] .tp-market [class*="bg-[#ffe06a]"]:not([class*="bg-[#ffe06a]/"]){background-color:#7544ad!important;color:#fff!important}
        html[data-theme="spooky"] .tp-market [class*="bg-[#FFD54A]/"],html[data-theme="spooky"] .tp-market [class*="bg-[#ffe06a]/"]{background-color:rgba(167,123,232,.12)!important}
        html[data-theme="spooky"] .tp-market [class*="text-[#b88a00]"],html[data-theme="spooky"] .tp-market [class*="text-[#FFE27A]"]{color:#c9acff!important}
        html[data-theme="spooky"] .tp-market [class*="border-[#FFD54A]"]{border-color:rgba(201,172,255,.58)!important}
        html[data-theme="spooky"] .tp-market [class*="ring-[#FFD54A]"]{--tw-ring-color:rgba(201,172,255,.58)!important}
        html[data-theme="spooky"] .tp-market [class*="accent-[#FFD54A]"]{accent-color:#c9acff!important}
        .tp-main{display:flex;flex-direction:column;flex:1;box-sizing:border-box;width:100%;max-width:none;margin:0;padding:18px clamp(16px,3vw,64px) max(12px,env(safe-area-inset-bottom,0px))}
        .tp-market button,.tp-market input,.tp-market select{font:inherit}
        .tp-market button{cursor:pointer}.tp-market button:disabled{cursor:default;opacity:.45}.tp-market button:focus-visible,.tp-market input:focus-visible,.tp-market select:focus-visible{outline:3px solid var(--tp-accent);outline-offset:3px}
        .tp-back{align-self:flex-start;flex-shrink:0;display:inline-flex;align-items:center;gap:8px;font-size:13px!important;color:var(--tp-muted);margin-bottom:10px}
        .tp-hero{flex-shrink:0;display:grid;grid-template-columns:minmax(0,1fr) minmax(210px,.6fr) auto minmax(240px,.75fr);gap:24px;align-items:center;padding:0 0 14px;margin-bottom:16px;border-bottom:1px solid var(--tp-line)}.tp-hero>.tp-toolbar{display:grid;grid-template-columns:minmax(0,1fr);gap:8px;margin:0;min-width:0}.tp-hero>.tp-toolbar .tp-search{width:100%}.tp-hero>.tp-toolbar .tp-sort{width:100%;max-width:none;height:36px}.tp-hero>.tp-toolbar .tp-search input{height:44px}
        .tp-chinese .tp-hero{grid-template-columns:minmax(0,1fr) auto minmax(240px,.75fr)}
        @media(max-width:1100px){.tp-chinese .tp-hero{grid-template-columns:1fr}}
        .tp-kicker{color:var(--tp-muted);font-size:12px;font-weight:600}.tp-hero h1{font-size:clamp(24px,1.9vw,32px);font-weight:700;line-height:1.2;margin:0 0 7px;letter-spacing:-.8px;max-width:900px}.tp-hero p{font-size:12px;color:var(--tp-muted);line-height:1.6;max-width:620px}.tp-hero-copy{min-width:0}
        .tp-hero-art{display:flex;gap:12px;align-items:center;justify-content:flex-end;padding:8px 8px;min-width:0}.tp-art-card{--tp-tilt:0deg;position:relative;flex:0 1 auto;min-width:0;width:96px;aspect-ratio:5/7;border-radius:7px;overflow:hidden;box-shadow:none;animation:none;background:var(--tp-soft);transform:none}.tp-art-card:first-child{}.tp-art-card:last-child{}.tp-art-card:nth-child(2){width:104px}.tp-art-card.tp-art-double{aspect-ratio:10/7;width:136px}.tp-hero-loading{color:var(--tp-muted);font-size:12px}.tp-hero-art:has(.tp-art-card:only-child) .tp-art-card{--tp-tilt:0deg;animation:none;box-shadow:none;transform:none}
        .tp-stats{display:flex;flex-wrap:wrap;gap:22px;padding:10px 0 0;margin:0}.tp-stat{display:flex;align-items:baseline;gap:8px}.tp-stat>svg{display:none}.tp-stat>div{display:flex;align-items:baseline;gap:7px}.tp-stat strong{font-size:16px;font-weight:700}.tp-stat span{font-size:12px;color:var(--tp-muted)}
        .tp-workspace{flex:1;display:grid;grid-template-columns:240px minmax(0,1fr);align-items:stretch;gap:24px}.tp-filters{align-self:start;position:sticky;top:90px;background:transparent;border:0;border-radius:0;padding:0}.tp-filter-title{display:flex;justify-content:space-between;align-items:center;font-size:14px;font-weight:800;margin-bottom:22px}.tp-reset{font-size:12px!important;color:var(--tp-accent)}.tp-label{display:block;font-size:10px;font-weight:800;letter-spacing:1.5px;color:var(--tp-muted);text-transform:uppercase;margin:22px 0 10px}.tp-type{display:flex;flex-direction:column;gap:6px}.tp-type button{display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:11px;font-size:13px;text-align:left;background:var(--tp-soft);border:1px solid transparent;transition:background .2s,transform .2s}.tp-type button[aria-pressed=true],.tp-rarities button[aria-pressed=true]{background:var(--tp-action);color:var(--tp-action-ink);border-color:var(--tp-action)}.tp-type button:hover{transform:none}.tp-rarities{display:flex;flex-wrap:wrap;gap:6px}.tp-rarities button{border:1px solid var(--tp-line);background:var(--tp-soft);padding:8px 10px;border-radius:9px;font-size:12px;transition:transform .2s,background .2s}.tp-rarities button:hover{transform:none}
        .tp-results{display:flex;flex-direction:column;min-width:0}.tp-results-head{flex-shrink:0}.tp-results>.tp-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;background:transparent;border:0;border-radius:0}.tp-results>.tp-loading{flex:1;background:transparent;border:0;border-radius:0;box-shadow:none;padding:24px 0}.tp-results>.tp-pagination{margin-top:auto;background:transparent;border:0;border-top:1px solid var(--tp-line);border-radius:0;padding:14px 0}.tp-empty>button{flex-shrink:0}.tp-toolbar{display:flex;align-items:center;gap:12px;margin-bottom:18px}.tp-search{display:flex;align-items:center;gap:10px;background:var(--tp-panel);border:1px solid var(--tp-line);border-radius:14px;padding:0 14px;flex:1;min-width:0;color:var(--tp-muted)}.tp-search input{height:48px;background:transparent;border:0;min-width:0;width:100%;font-size:16px;color:var(--tp-ink);outline:none}.tp-search button{display:grid;place-items:center}.tp-sort{background:var(--tp-panel);border:1px solid var(--tp-line);border-radius:14px;height:48px;padding:0 12px;font-size:13px!important;color:var(--tp-ink);max-width:180px}.tp-results-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:16px}.tp-results-head h2{font-size:18px;font-weight:800}.tp-results-head p{font-size:12px;color:var(--tp-muted);margin-top:3px}
        .tp-collector{background:transparent;border:0;border-radius:0;overflow:visible;margin-bottom:26px;animation:none}.tp-collector-head{display:flex;flex-wrap:wrap;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--tp-line);background:transparent}.tp-identity{flex:1;min-width:120px}.tp-name{font-size:16px!important;font-weight:800;display:flex;align-items:center;gap:7px;text-align:left}.tp-name:hover{color:var(--tp-accent)}.tp-identity p{color:var(--tp-muted);font-size:12px;margin-top:4px;overflow-wrap:anywhere}.tp-profile-btn{display:flex;align-items:center;gap:6px;border:0;background:transparent;border-radius:4px;padding:8px 0;font-size:12px!important;font-weight:700;transition:background .2s}.tp-profile-btn:hover{background:var(--tp-action);color:var(--tp-action-ink)}.tp-report-btn{display:grid;place-items:center;padding:8px;border-radius:9px;color:var(--tp-muted)}.tp-report-btn:hover{background:#f0525220;color:#ef7070}.tp-collector-summary{display:flex;gap:12px;font-size:11px;color:var(--tp-muted);padding:10px 0 0}.tp-card-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(128px,1fr));gap:14px;padding:14px 0 20px;grid-auto-flow:dense}.tp-card{min-width:0;transition:none}.tp-card:hover{transform:none}.tp-card-image{display:block;width:100%;position:relative;aspect-ratio:5/7;border-radius:14px;overflow:hidden;background:var(--tp-soft);box-shadow:none}.tp-card-double{grid-column:span 2}.tp-card-double .tp-card-image{aspect-ratio:10/7;box-shadow:none}.tp-card-image:after{content:none;position:absolute;inset:0;background:linear-gradient(115deg,transparent 35%,#ffffff22 50%,transparent 65%);transform:translateX(-110%);transition:transform .65s;pointer-events:none}.tp-card:hover .tp-card-image:after{transform:none;content:none}.tp-card-tags{position:absolute;left:6px;top:6px;display:flex;gap:4px}.tp-card-tags span{display:grid;place-items:center;width:24px;height:24px;border-radius:7px;background:#131720e6;color:#ffd54a;box-shadow:0 2px 6px #0003}.tp-card-info{display:flex;flex-direction:column;gap:4px;padding-top:9px}.tp-card-info strong{font-size:12px;overflow-wrap:anywhere}.tp-card-info span{font-size:11px;color:var(--tp-muted)}.tp-price{color:var(--tp-accent)!important;font-weight:800}.tp-pagination{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 0;background:transparent;border:0;border-radius:0;font-size:12px;border-top:1px solid var(--tp-line)}.tp-pagination button{padding:9px 13px;border-radius:10px;background:var(--tp-soft)}
        .tp-loading{min-width:0;padding:24px 0;border:0;border-radius:0;background:transparent;box-shadow:none}.tp-loading-head{display:flex;align-items:center;gap:18px;min-width:0;margin-bottom:12px;justify-content:space-between}.tp-loading h3{font-size:clamp(18px,2vw,23px);font-weight:800;letter-spacing:-.3px}.tp-loading p,.tp-inventory-loading p{font-size:12px;color:var(--tp-muted);margin-top:6px;line-height:1.6}.tp-load-track{height:4px;border-radius:9px;background:var(--tp-soft);overflow:hidden;margin:15px 0 20px}.tp-load-track span{display:block;width:35%;height:100%;background:linear-gradient(90deg,transparent,#c9acff,transparent);animation:tp-scan 1.8s ease-in-out infinite}.tp-loading-head>div:first-child{min-width:0;flex:1}.tp-empty{text-align:center;padding:28px 20px;background:transparent;border:0;border-radius:0}.tp-empty>svg{margin:0 auto 10px;color:var(--tp-accent)}.tp-empty h3{font-size:17px;font-weight:800}.tp-empty p{color:var(--tp-muted);font-size:13px;margin:8px auto 16px;max-width:520px}.tp-empty button{background:var(--tp-action);color:var(--tp-action-ink);padding:11px 18px;border-radius:11px;font-size:13px;font-weight:700}
        .tp-profile-overlay{position:fixed;inset:0;z-index:115;display:flex;align-items:flex-start;justify-content:center;padding:calc(112px + env(safe-area-inset-top,0px)) 20px 24px;background:#0009;backdrop-filter:blur(8px)}.tp-profile-dialog{width:min(1100px,100%);max-height:min(68dvh,calc(100dvh - 148px - env(safe-area-inset-top,0px)));background:var(--tp-panel);border:1px solid var(--tp-line);border-radius:22px;overflow:auto;box-shadow:0 24px 80px #0006;animation:tp-enter .25s both}.tp-profile-dialog>header{position:sticky;top:0;z-index:5;display:flex;justify-content:space-between;align-items:center;padding:15px 20px;background:var(--tp-panel);border-bottom:1px solid var(--tp-line)}.tp-profile-body{padding:16px}.tp-inventory-loading{display:flex;align-items:center;flex-direction:column;padding:40px 20px;text-align:center;gap:12px}.tp-inventory-loading .tp-load-track{width:220px;max-width:100%}.tp-market [role=dialog]{animation:tp-enter .25s both}.tp-market input,.tp-market textarea{font-size:16px!important}
        @keyframes tp-enter{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}@keyframes tp-drift{0%,100%{transform:translateY(0) rotate(var(--tp-tilt))}50%{transform:translateY(-4px) rotate(var(--tp-tilt))}}@keyframes tp-bars{0%,100%{transform:scaleY(.45);opacity:.45}50%{transform:scaleY(1);opacity:1}}@keyframes tp-scan{from{transform:translateX(-110%)}to{transform:translateX(390%)}}@keyframes tp-shimmer{to{transform:translateX(100%)}}@keyframes tp-orbit{to{transform:rotate(360deg)}}@keyframes tp-pulse{50%{box-shadow:0 0 0 4px rgba(var(--tp-glow-rgb),.12),0 0 14px rgba(var(--tp-glow-rgb),.34)}}@keyframes tp-load-dots{0%{width:0}50%{width:1.2em}100%{width:0}}
        .tp-sort-wrap{position:relative;min-width:0}.tp-market .tp-sort{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;border-radius:14px!important;appearance:none}.tp-sort-menu{position:absolute;top:calc(100% + 6px);left:0;right:0;z-index:40;overflow:hidden;padding:6px;border:1px solid var(--tp-line);border-radius:14px;background:var(--tp-panel);box-shadow:0 12px 24px #0004}.tp-sort-menu button{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;padding:10px;border-radius:10px;font-size:12px;text-align:left}.tp-sort-menu button:hover,.tp-sort-menu button[aria-pressed=true]{background:var(--tp-soft)}.tp-name-row{display:flex;flex-wrap:wrap;align-items:center;gap:8px}.tp-strikes{display:inline-flex;align-items:center;border-radius:0;background:transparent;padding:0;font-size:10px;color:var(--tp-muted);white-space:nowrap}.tp-strikes-warning{color:var(--tp-accent);background:#ffd54a15}.tp-market input{border-radius:10px}.tp-loading-bars i{border-radius:999px}.tp-market .tp-back,.tp-market .tp-name,.tp-market .tp-reset{border-radius:10px}.tp-profile-dialog>header{border-radius:22px 22px 0 0}.tp-profile-dialog .rounded-none{border-radius:12px!important}
        .tp-collection{min-width:0;border:0;border-radius:0;padding:8px 0;background:transparent}.tp-collection-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:12px;color:var(--tp-muted)}.tp-collection-heading strong{color:var(--tp-accent);font-size:14px}.tp-collection-owned{margin-top:9px;font-size:12px;color:var(--tp-muted)}.tp-collection-owned strong{font-size:22px;line-height:1;color:var(--tp-ink)}.tp-collection-track{height:6px;border-radius:999px;background:var(--tp-soft);overflow:hidden;margin:12px 0}.tp-collection-track span{display:block;height:100%;border-radius:inherit;background:#ffd54a;transition:width .5s ease}.tp-collection-details{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;font-size:11px;color:var(--tp-muted)}.tp-collection-details button{display:inline-flex;align-items:center;gap:3px;border-radius:8px;color:var(--tp-accent)}.tp-collection-error{margin-top:12px;font-size:12px;color:var(--tp-muted)}
        @media(min-width:1201px) and (max-width:1600px){.tp-hero{grid-template-columns:minmax(0,1fr) minmax(210px,.7fr) auto;gap:14px 22px}.tp-hero>.tp-toolbar{grid-column:1/-1;grid-template-columns:minmax(0,1fr) 220px;align-items:center}.tp-hero>.tp-toolbar .tp-sort{height:44px}}
        @media(min-width:1800px){.tp-card-grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr));padding:14px 0 20px}}
        @media(max-width:1200px){.tp-hero{grid-template-columns:minmax(0,1fr) auto;gap:14px 24px}.tp-collection{grid-column:1;grid-row:2;background:transparent;border:0;border-radius:0;padding:8px 0}.tp-hero>.tp-toolbar{grid-column:2;grid-row:2;grid-template-columns:minmax(0,1fr);align-items:center}.tp-hero>.tp-toolbar .tp-sort{height:44px}}
        @media(max-width:1000px){.tp-workspace{grid-template-columns:200px minmax(0,1fr);gap:16px}.tp-filters{padding:0;background:transparent;border:0;border-radius:0}.tp-hero{gap:18px}.tp-hero-art{gap:10px}.tp-art-card{width:86px;animation:none;box-shadow:none;transform:none}.tp-art-card:nth-child(2){width:94px}.tp-card-grid{grid-template-columns:repeat(auto-fill,minmax(110px,1fr));padding:14px 0 20px}}
        @media(max-width:700px){.tp-main{padding:16px 12px max(12px,env(safe-area-inset-bottom,0px))}.tp-back{margin-bottom:12px}.tp-hero{grid-template-columns:1fr;padding:0 0 12px;gap:10px;margin-bottom:14px}.tp-collection{grid-column:auto;grid-row:auto;background:transparent;border:0;border-radius:0;padding:8px 0}.tp-hero>.tp-toolbar{grid-column:auto;grid-row:auto;grid-template-columns:minmax(0,1fr)}.tp-hero>.tp-toolbar .tp-sort{height:36px}.tp-hero h1{font-size:25px;letter-spacing:-.5px}.tp-hero-art{justify-content:center;gap:12px;padding:8px 4px}.tp-art-card{width:84px;border-radius:6px;animation:none;box-shadow:none;transform:none}.tp-art-card:nth-child(2){width:92px}.tp-art-card.tp-art-double{width:116px}.tp-stats{gap:14px;padding:8px 0 0;margin:0}.tp-stat strong{font-size:17px}.tp-stat span{font-size:11px}.tp-workspace{grid-template-columns:1fr;grid-template-rows:auto minmax(0,1fr);gap:16px}.tp-filters{position:static;padding:0;border-radius:0;background:transparent;border:0}.tp-filter-title{margin-bottom:10px}.tp-label{margin:14px 0 8px}.tp-type{flex-direction:row;flex-wrap:wrap}.tp-type button{flex:1 1 calc(50% - 6px);justify-content:center;padding:9px 7px;font-size:11px}.tp-type button:hover{transform:none}.tp-rarities{gap:5px}.tp-rarities button{padding:7px 9px;font-size:11px}.tp-toolbar{flex-wrap:wrap;gap:8px}.tp-search{flex-basis:100%}.tp-sort{max-width:none;width:100%;height:40px}.tp-collector-head{padding:12px 0;gap:9px;background:transparent}.tp-name{font-size:14px!important}.tp-profile-btn{padding:8px 0;font-size:11px!important;background:transparent;border:0;border-radius:4px}.tp-collector-summary{padding:10px 0 0}.tp-card-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;padding:14px 0 20px}.tp-card-info strong{font-size:10px}.tp-card-info span{font-size:10px}.tp-loading{padding:24px 0;background:transparent;border:0;border-radius:0;box-shadow:none}.tp-profile-overlay{padding:calc(104px + env(safe-area-inset-top,0px)) 10px 18px}.tp-profile-dialog{max-height:min(70dvh,calc(100dvh - 132px - env(safe-area-inset-top,0px)))}.tp-profile-body{padding:8px}.tp-results-head h2{font-size:16px}}
        .tp-card-square .tp-card-image,.tp-art-card.tp-art-square{aspect-ratio:1}
        @media(prefers-reduced-motion:reduce){.tp-market *,.tp-market *:before,.tp-market *:after{animation:none!important;transition:none!important;scroll-behavior:auto!important}.tp-card:hover{transform:none}}
      `}</style>
      <main className="tp-main">
        <button className="tp-back" type="button" onClick={() => navigate(basePath)}><ArrowLeft size={16} /> All Trading Post sets</button>
        <section className="tp-hero">
          <div className="tp-hero-copy">
                        <h1>{setNames[setId || ""] || getOfferSetName(setId || "")}</h1>
            <p>Find {itemWord} for trade or sale. Your ISO shows what you need.</p>
        <div className="tp-stats" aria-label="Set listing totals">
          <div className="tp-stat"><Users size={24} /><div><strong>{loading ? "--" : Object.keys(groupedTrades).length}</strong><span>Collectors</span></div></div>
          <div className="tp-stat"><Handshake size={24} /><div><strong>{loading ? "--" : allListings.filter((card) => card.is_for_trade).length}</strong><span>Trade listings</span></div></div>
          <div className="tp-stat"><ShoppingBag size={24} /><div><strong>{loading ? "--" : allListings.filter((card) => card.is_for_sale).length}</strong><span>Sale listings</span></div></div>
        </div>
          </div>
          <section className="tp-collection" aria-label="Your collection in this set">
            <div className="tp-collection-heading"><span>Your collection</span><strong>{loading || isoError || loadError ? "--" : `${collectionPercent}%`}</strong></div>
            {isoError || loadError ? <p className="tp-collection-error">Collection progress is unavailable.</p> : <>
              <div className="tp-collection-owned">{loading ? "Loading your progress..." : <><strong>{collectionOwned}</strong><span> / {collectionTotal} owned</span></>}</div>
              <div className="tp-collection-track" role="progressbar" aria-label="Set completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={loading ? undefined : collectionPercent} aria-valuetext={loading ? "Loading collection progress" : `${collectionOwned} of ${collectionTotal} ${itemWord} owned`}><span style={{ width: loading ? "0%" : `${collectionPercent}%` }} /></div>
              <div className="tp-collection-details"><span>{loading ? "--" : collectionMissing} missing</span><button type="button" disabled={loading} onClick={resetFilters}>{loading ? "--" : availableMissingCards} available <ChevronRight size={12} /></button></div>
            </>}
          </section>
          {language !== "chinese" && (<div className="tp-hero-art" aria-hidden="true">{heroCards.map((card) => <div key={card.card_key} className={`tp-art-card ${isSquareTradeCard(card) ? "tp-art-square" : isWideTradeCard(card) ? "tp-art-double" : ""}`}><ListingCardImage card={card} /></div>)}{heroCards.length === 0 && loading && <div className="tp-hero-loading">Finding {itemWord} from this collection...</div>}</div>)}
            <div className="tp-toolbar">
              <label className="tp-search"><Search size={19} /><input aria-label="Search collectors or Discord usernames" placeholder="Search collectors..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} />{search && <button type="button" aria-label="Clear search" onClick={() => { setSearch(""); setPage(0); }}><X size={16} /></button>}</label>
              <div className="tp-sort-wrap" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setSortOpen(false); }}><button type="button" className="tp-sort" aria-label="Sort collectors" aria-expanded={sortOpen} aria-controls="tp-sort-options" onClick={() => setSortOpen((value) => !value)}>{sortBy === "cards" ? `Most matching ${itemWord}` : "Collector name A-Z"}<ChevronDown size={16} /></button>{sortOpen && <div className="tp-sort-menu" id="tp-sort-options">{[{ value: "cards", label: `Most matching ${itemWord}` }, { value: "name", label: "Collector name A-Z" }].map((option) => <button type="button" key={option.value} aria-pressed={sortBy === option.value} onClick={() => { setSortBy(option.value); setPage(0); setSortOpen(false); }}>{option.label}{sortBy === option.value && <Check size={14} />}</button>)}</div>}</div>
            </div>
        </section>
        <div className="tp-workspace">
          <aside className="tp-filters" aria-label="Listing filters">
            <div className="tp-filter-title"><span className="flex items-center gap-2"><SlidersHorizontal size={16} /> Filters</span><button type="button" className="tp-reset" onClick={resetFilters}>Reset</button></div>
            <span className="tp-label">Show</span>
            <div className="tp-type">{([{ key: "iso", label: "Your ISO", icon: Search }, { key: "all", label: "All listings", icon: Layers }, { key: "trade", label: "For trade", icon: Handshake }, { key: "sale", label: "For sale", icon: ShoppingBag }] as const).map(({ key, label, icon: Icon }) => <button key={key} type="button" aria-pressed={listingType === key} onClick={() => { setListingType(key); setPage(0); }}><Icon size={16} />{label}</button>)}</div>
            <span className="tp-label">{merchandise ? "Collection" : "Rarity"}</span>
            <div className="tp-rarities">{["ALL", ...(rarityMap[setId === "SD" ? "friendshipsbegin" : setId || ""] || [])].map((rarity) => <button key={rarity} type="button" aria-pressed={rarity === "ALL" ? !selectedRarity : selectedRarity === rarity} onClick={() => { setSelectedRarity(rarity === "ALL" ? null : rarity); setPage(0); }}>{getOfferRarityLabel(setId || "", rarity)}</button>)}</div>
          </aside>
          <section className="tp-results" aria-label="Collector listings" aria-busy={loading}>
            <div className="tp-results-head"><div><h2>{listingType === "iso" ? "Your ISO" + (selectedRarity ? " / " + getOfferRarityLabel(setId || "", selectedRarity) : "") : selectedRarity ? getOfferRarityLabel(setId || "", selectedRarity) + " listings" : "Listings"}</h2><p>{loading ? "Loading listings" : `${visibleListingCount} matching listings from ${visibleUsers.length} collectors`}</p></div></div>
            {loadError && !loading && <div className="tp-empty" role="alert"><ShieldAlert size={28} /><h3>Unable to load the marketplace</h3><p>{loadError}</p><button type="button" onClick={() => setReload((value) => value + 1)}>Try again</button></div>}
            {loading ? <div className="tp-loading" role="status" aria-live="polite">
              <div className="tp-loading-head"><div><h3>Loading listings...</h3><p>{[`Loading this collection's ${itemWord}.`, "Loading collector details.", "Checking availability and offers."][loadStage]}</p></div><span className="text-xs text-zinc-500" aria-live="off">{loadingSeconds}s</span></div>
              <div className="tp-load-track" aria-hidden="true"><span /></div>
            </div> : loadError ? null : listingType === "iso" && isoError ? <div className="tp-empty" role="alert"><ShieldAlert size={36} /><h3>Unable to load your ISO</h3><p>{isoError}</p><button type="button" onClick={() => setReload((value) => value + 1)}>Try again</button></div> : pagedUsers.length === 0 ? <div className="tp-empty"><Search size={36} /><h3>{listingType === "iso" ? "No ISO matches right now" : allListings.length ? "No matching listings" : "No listings yet"}</h3><p>{listingType === "iso" ? `No missing ${itemWord} are currently listed for trade or sale.` : allListings.length ? `Try a different ${merchandise ? "collection" : "rarity"}, listing type, or collector name.` : `${merchandise ? "Items" : "Cards"} will appear here when collectors list them for trade or sale.`}</p><button type="button" onClick={() => { setSearch(""); setSelectedRarity(null); setListingType("all"); setPage(0); }}>Browse all listings</button></div> : <div key={`${selectedRarity}-${listingType}-${currentPage}`}>
              {pagedUsers.map(([userId, cards], index) => {
                const filteredCards = filterCardsForRarity(cards);
                const assets = getProfileAssets(profiles[userId]);
                return <article key={userId} className="tp-collector" style={{ animationDelay: `${Math.min(index, 5) * 55}ms` }}>
                  <header className="tp-collector-head">
                    <ProfileAvatar profile={{ ...profiles[userId], id: userId }} src={assets.avatar} alt={profiles[userId]?.username || "Collector"} className="h-11 w-11 shrink-0 rounded-xl object-cover" />
                    <div className="tp-identity"><div className="tp-name-row"><button className="tp-name" type="button" onClick={() => setOpenProfile(userId)}>{profiles[userId]?.username || "Collector"}{assets.verification && <CardImage src={assets.verification.badge} alt={assets.verification.label} title={assets.verification.label} className="h-4 w-4 shrink-0 object-contain" />}</button>{Number(strikeCounts[userId] || 0) > 0 && <span className={`tp-strikes ${Number(strikeCounts[userId] || 0) > 0 ? "tp-strikes-warning" : ""}`} title={strikeCounts[userId] === undefined ? "Strike counts are visible to the collector and moderators" : "Active offer expiration strikes"}>{strikeCounts[userId] === undefined ? "Strikes unavailable" : `${strikeCounts[userId]} strike${strikeCounts[userId] === 1 ? "" : "s"}`}</span>}</div><p>Discord: {tradingProfiles[userId]?.discord_username}</p></div>
                    <button className="tp-profile-btn" type="button" onClick={() => setOpenProfile(userId)}>View profile <ChevronRight size={14} /></button>
                    {currentUserId !== userId && <button className="tp-report-btn" type="button" disabled={reportedUsers.has(userId)} aria-label={reportedUsers.has(userId) ? "Collector already reported" : "Report inactive or unresponsive collector"} title={reportedUsers.has(userId) ? "Already reported" : "Report collector"} onClick={() => { setReportError(""); setReportTarget(userId); }}>{reportedUsers.has(userId) ? <ShieldCheck size={17} /> : <ShieldAlert size={17} />}</button>}
                  </header>
                  <div className="tp-collector-summary"><span>{filteredCards.length} matching {itemWord}</span><span>{filteredCards.filter((card) => card.is_for_trade).length} for trade</span><span>{filteredCards.filter((card) => card.is_for_sale).length} for sale</span></div>
                  <div className="tp-card-grid">{[...filteredCards].sort((a, b) => setId === "9" ? comparePromoCards(a, b) : a.card_key.localeCompare(b.card_key, undefined, { numeric: true })).map((card) => {
                    const double = isWideTradeCard(card);
                    const price = Number(card.asking_price || 0);
                    return <div key={card.id} className={`tp-card ${isSquareTradeCard(card) ? "tp-card-square" : double ? "tp-card-double" : ""}`}><button type="button" className="tp-card-image" aria-label={`Open ${getListingDisplayCode(card)}, ${card.is_for_trade ? "for trade" : ""} ${card.is_for_sale ? "for sale" : ""}`} onClick={() => { setCardReportError(""); setSelectedCard(card); }}><ListingCardImage card={card} /><div className="tp-card-tags">{card.is_for_trade && <span title="For trade"><Handshake size={14} /></span>}{card.is_for_sale && <span title="For sale">$</span>}</div></button><div className="tp-card-info"><strong>{getListingDisplayCode(card)}</strong>{card.is_for_sale && <span className="tp-price">{price > 0 ? `$${price.toFixed(2)}` : "Ask collector for price"}</span>}<span>{card.is_for_trade && `Trade x${card.trade_quantity || 1}`}{card.is_for_trade && card.is_for_sale && " / "}{card.is_for_sale && `Sale x${card.sale_quantity || 1}`}</span></div></div>;
                  })}</div>
                </article>;
              })}
            </div>}
            {!loading && totalPages > 1 && <nav className="tp-pagination" aria-label="Collector pages"><button type="button" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Previous</button><span>Page {currentPage + 1} of {totalPages}</span><button type="button" disabled={currentPage >= totalPages - 1} onClick={() => setPage(currentPage + 1)}>Next</button></nav>}
          </section>
        </div>
      </main>
      {openProfile && <div className="tp-profile-overlay" onMouseDown={() => setOpenProfile(null)}><div className="tp-profile-dialog" role="dialog" aria-modal="true" aria-labelledby="tp-profile-title" onMouseDown={(event) => event.stopPropagation()}><header><div><h2 id="tp-profile-title" className="font-bold">{profiles[openProfile]?.username || "Collector"}</h2><p className="text-xs opacity-60">Profile / ISO / Wishlist / Trades</p></div><button type="button" className="tp-profile-btn" onClick={() => setOpenProfile(null)} aria-label="Close collector profile"><X size={18} /> Close</button></header><div className="tp-profile-body"><ExploreProfile user={profiles[openProfile]} tradingProfile={tradingProfiles[openProfile]} onClose={() => setOpenProfile(null)} /></div></div></div>}
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
                <div
                  className="relative overflow-hidden rounded-xl"
                  style={{
                    width: "min(220px, 22.85dvh)",
                    aspectRatio: isSquareTradeCard(selectedCard) ? "1 / 1" : isWideTradeCard(selectedCard) ? "10 / 7" : "5 / 7",
                  }}
                >
                  <ListingCardImage imageSize="original" card={selectedCard} />
                </div>
              </div>
              <div className="p-3.5 sm:p-4">
                <div className="flex items-center gap-3">
                  <ProfileAvatar
                    profile={{ ...profiles[selectedCard.user_id], id: selectedCard.user_id }}
                    src={
                      getProfileAssets(profiles[selectedCard.user_id]).avatar
                    }
                    alt=""
                    className="h-10 w-10 rounded-[22%] object-cover"
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
                <div className="mt-3 text-sm font-bold">{getListingDisplayCode(selectedCard)}</div>
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
                {selectedCard.is_for_trade &&
                  currentUserId !== selectedCard.user_id &&
                  (() => {
                    const action = getOfferAction(selectedCard);
                    return (
                      <button
                        type="button"
                        onClick={() => void openOfferComposer(selectedCard)}
                        disabled={!action.enabled}
                        className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                          !action.enabled
                            ? isLightMode
                              ? "bg-zinc-100 text-zinc-400"
                              : "bg-white/[0.04] text-zinc-500"
                            : "bg-[#FFD54A] text-zinc-900 hover:bg-[#ffe06a]"
                        }`}
                      >
                        {!action.enabled ? (
                          <Check size={17} />
                        ) : (
                          <Handshake size={17} />
                        )}
                        {action.label}
                      </button>
                    );
                  })()}
                {selectedCard.is_for_sale &&
                  currentUserId !== selectedCard.user_id &&
                  (() => {
                    const reportKey = `${selectedCard.user_id}-${selectedCard.set_id}-${selectedCard.card_key}`;
                    const alreadyReported = reportedCardKeys.has(reportKey);
                    return (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            if (Number(selectedCard.asking_price ?? 0) <= 0) {
                              setCardReportError("");
                              setShowUnsetPriceNotice(true);
                              return;
                            }
                            setCardReportError("");
                            setConfirmReport("card");
                          }}
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
                            : `Report overpriced ${merchandise ? "item" : "card"}`}
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
      {offerTarget && currentUserId && <TradeOfferComposer key={`${currentUserId}:${offerTarget.id}`} target={offerTarget} currentUserId={currentUserId} defaultContact={tradingProfiles[currentUserId]?.discord_username ?? ""} isLightMode={isLightMode} onClose={() => setOfferTarget(null)} onSent={recordSentOffer} />}
      {showUnsetPriceNotice && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="unset-price-title"
            className={`w-full max-w-sm rounded-[20px] p-5 shadow-2xl ${
              isLightMode ? "bg-white text-zinc-900" : "bg-[#17191a] text-white"
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFD54A]/15 text-[#b88a00]">
              <ShieldAlert size={20} />
            </div>
            <h2 id="unset-price-title" className="mt-3 text-lg font-bold">
              Price not set yet
            </h2>
            <p
              className={`mt-2 text-sm leading-relaxed ${
                isLightMode ? "text-zinc-600" : "text-zinc-300"
              }`}
            >
              A price of $0.00 means this person has not set their asking price
              since the new pricing update rolled out. It is not an overpriced
              listing and cannot be reported.
            </p>
            <button
              type="button"
              onClick={() => setShowUnsetPriceNotice(false)}
              className="mt-5 w-full rounded-xl bg-[#FFD54A] px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-[#ffe06a]"
            >
              Got it
            </button>
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
                onClick={() => {
                  if (wantsStaffContact && !reporterDiscord.trim()) {
                    setReportError(
                      "Enter your Discord username so a staff member can contact you.",
                    );
                    return;
                  }
                  setReportError("");
                  setConfirmReport("user");
                }}
                disabled={isReporting}
                className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isReporting ? "Reporting..." : "Report user"}
              </button>
            </div>
          </div>
        </div>
      )}
      {confirmReport && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-report-title"
            aria-describedby="confirm-report-description"
            className={`w-full max-w-sm rounded-[20px] p-5 shadow-2xl ${
              isLightMode ? "bg-white text-zinc-900" : "bg-[#17191a] text-white"
            }`}
          >
            <h2 id="confirm-report-title" className="text-lg font-bold">
              Are you sure?
            </h2>
            <p
              id="confirm-report-description"
              className={`mt-2 text-sm leading-relaxed ${
                isLightMode ? "text-zinc-600" : "text-zinc-300"
              }`}
            >
              {confirmReport === "card"
                ? `You are about to submit a formal report about this ${merchandise ? "item" : "card"}'s price. Please review general pricing on `
                : "You are about to submit a report about this user. You can only report this user once."}
              {confirmReport === "card" && (
                <>
                  <a
                    href="/selling"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#b88a00] underline underline-offset-2"
                  >
                    /selling
                  </a>
                  {" before submitting."}
                </>
              )}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfirmReport(null)}
                disabled={isReporting || isReportingCard}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${
                  isLightMode ? "bg-zinc-100 text-zinc-700" : "bg-white/[0.07] text-zinc-200"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmReport === "card") void submitCardReport();
                  else void submitReport();
                }}
                disabled={isReporting || isReportingCard}
                className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isReporting || isReportingCard ? "Reporting..." : "Submit report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
