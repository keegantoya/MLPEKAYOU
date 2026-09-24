import { cardImagePaths } from "@/lib/card-images";
import CardImage from "@/components/CardImage";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Check,
  Handshake,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import { getProfileAssets } from "@/pages/Everypony/profile-assets";
type TradeCard = {
  id: string;
  user_id: string;
  set_id: string;
  card_key: string;
  is_for_trade: boolean;
  is_for_sale: boolean;
  asking_price: number | null;
  trade_quantity: number;
  sale_quantity: number;
};
type InventoryCard = {
  id: string;
  set_id: string;
  card_key: string;
};
type OfferState = {
  attempts: number;
  latestStatus: string;
  latestExpiresAt: string;
  latestCreatedAt: string;
};
const OFFER_SET_ORDER = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "11",
  "9",
  "tcgpromos",
];
const OFFER_RARITY_ORDER = [
  "BASE",
  "C",
  "U",
  "N",
  "SN",
  "R",
  "SR",
  "SSR",
  "SCR",
  "HR",
  "FR",
  "TR",
  "TGR",
  "MTR",
  "ST",
  "UR",
  "USR",
  "UGR",
  "XR",
  "LSR",
  "SGR",
  "ZR",
  "SHINING ZR",
  "SZR",
  "SAR",
  "AR",
  "OR",
  "BP",
  "CR",
  "ER",
  "SPR",
  "GR",
  "RR",
  "PER",
  "PSPR",
  "PGR",
  "PCR",
  "PRR",
  "SC",
  "PR",
];
const offerKeyFor = (recipientId: string, setId: string, cardKey: string) =>
  [recipientId, setId, cardKey].join("-");
const inventoryRarity = (cardKey: string) => {
  const key = cardKey.toUpperCase().replace(/※/g, "");
  const prefixed = key.match(
    /(?:BP|SD)\d{2}-?(PER|PSPR|PGR|PCR|PRR|SPR|SSR|SCR|SAR|SGR|UGR|USR|TGR|MTR|LSR|SZR|ZR|XR|HR|FR|TR|ST|SR|UR|GR|CR|ER|RR|SC|BP|AR|OR|PR|R|U|C|N|SN)/,
  );
  if (prefixed) return prefixed[1];
  return key.split("-")[0].replace(/\d+$/g, "") || "Other";
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
const getCardImage = (card: TradeCard) => {
  const [rarity, number] = card.card_key.split("-");
  if (card.set_id === "SD" || card.set_id === "friendshipsbegin") {
    return cardImagePaths.friendshipsBegin(card.card_key);
  }
  if (card.set_id === "FW") {
    const num = card.card_key.slice(-2);
    if (card.card_key.startsWith("BP01ER")) {
      return cardImagePaths.fantasyEmerald(num);
    }
    if (card.card_key.startsWith("BP01PER")) {
      return cardImagePaths.fantasyParallelEmerald(num);
    }
    return cardImagePaths.fantasyWonderland(card.card_key);
  }
  if (String(card.set_id) === "14") {
    const erMatch = card.card_key.match(/^BP03-ER(0[12])-([ABC])$/);
    const imageKey = erMatch ? `${card.card_key}${erMatch[2]}` : card.card_key;
    return cardImagePaths.nightmareNight(imageKey);
  }
  if (card.set_id === "12") {
    return cardImagePaths.discord(card.card_key);
  }
  if (card.set_id === "9") {
    return cardImagePaths.ccgPromo(String(number).padStart(3, "0"));
  }
  if (card.set_id === "tcgpromos") {
    return cardImagePaths.tcgPromo(card.card_key);
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
  return cardImagePaths.ccgWithExtension(c.folder, c.prefix, getRarityCode(rarity), String(number).padStart(3, "0"), card.set_id === "6" && ["ST", "TR", "TGR"].includes(rarity)
      ? ".webp"
      : ".webp");
};
const standardOfferZoomSets = new Set([
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "11",
]);
const getOfferCardNumber = (cardKey: string) => {
  const match = cardKey.match(/(\d+)$/);
  return match ? Number(match[1]) : null;
};
const getOfferImageClassName = (card: { set_id: string; card_key: string }) => {
  const base = "absolute inset-0 h-full w-full max-w-none";
  const offerSetId = String(card.set_id);
  if (standardOfferZoomSets.has(offerSetId)) {
    return `${base} scale-[1.05] object-contain object-center`;
  }
  const cardNumber = getOfferCardNumber(card.card_key);
  if (offerSetId === "9") {
    if (cardNumber === 1) {
      return `${base} scale-[1.01] object-contain object-center`;
    }
    if (cardNumber === 7) {
      return `${base} scale-[1.05] object-contain object-center`;
    }
    if (cardNumber !== null && [2, 3, 4, 5].includes(cardNumber)) {
      return `${base} scale-[1.05] object-contain object-center`;
    }
    return `${base} scale-[1.08] object-contain object-center`;
  }
  if (offerSetId === "tcgpromos") {
    if (cardNumber === 11) {
      return `${base} translate-y-[2px] scale-[1.02] object-cover object-center`;
    }
    if (cardNumber === 10) {
      return `${base} scale-[1.02] object-cover object-center`;
    }
    if (cardNumber === 9) {
      return `${base} -translate-y-px scale-[1.01] object-cover object-center`;
    }
    if (cardNumber === 12) {
      return `${base} -translate-y-[2px] object-cover object-center`;
    }
    return `${base} scale-[1.01] object-contain object-center`;
  }
  const contained = ["SD", "friendshipsbegin", "FW", "12", "14"].includes(
    offerSetId,
  );
  return `${base} ${contained ? "object-contain object-center" : "object-cover object-center"}`;
};
function ListingCardImage({
  card,
  offerMode = false,
  imageSize,
}: {
  card: TradeCard;
  offerMode?: boolean;
  imageSize?: "grid" | "original";
}) {
  const src = getCardImage(card);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const isLandscape =
    String(card.set_id) === "14" &&
    /^BP03-C(2[5-9]|3[0-9]|4[0-8])$/.test(card.card_key);
  if (!src || failedSrc === src) {
    return (
      <div className="absolute inset-0 flex items-center justify-center rounded-[inherit] bg-zinc-300 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-100">
        <span className="px-2 text-center text-xs font-bold">COMING SOON</span>
      </div>
    );
  }
  return (
    <CardImage imageSize={imageSize}
      src={src}
      alt={card.card_key}
      onError={() => setFailedSrc(src)}
      draggable={false}
      className={
        isLandscape
          ? "absolute object-contain"
          : offerMode
            ? getOfferImageClassName(card)
            : "absolute inset-0 h-full w-full object-cover"
      }
      style={
        isLandscape
          ? {
              left: "50%",
              top: "50%",
              width: "140%",
              height: "71.4285714286%",
              maxWidth: "none",
              transform: "translate(-50%, -50%) rotate(-90deg)",
            }
          : offerMode
            ? undefined
            : { transform: "scale(1.035)" }
      }
    />
  );
}
function InventoryCardImage({
  card,
  offerMode = false,
  imageSize,
}: {
  card: InventoryCard;
  offerMode?: boolean;
  imageSize?: "grid" | "original";
}) {
  return (
    <ListingCardImage
      card={{
        ...card,
        user_id: "",
        is_for_trade: false,
        is_for_sale: false,
        asking_price: null,
        trade_quantity: 0,
        sale_quantity: 0,
      }}
      offerMode={offerMode}
    />
  );
}
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
  const [inventoryCards, setInventoryCards] = useState<InventoryCard[]>([]);
  const [inventoryLoaded, setInventoryLoaded] = useState(false);
  const [selectedOfferCards, setSelectedOfferCards] = useState<InventoryCard[]>(
    [],
  );
  const [offerContact, setOfferContact] = useState("");
  const [offerSet, setOfferSet] = useState("");
  const [offerRarity, setOfferRarity] = useState("ALL");
  const [offerStep, setOfferStep] = useState<"compose" | "review" | "sent">(
    "compose",
  );
  const [offerError, setOfferError] = useState("");
  const [isSendingOffer, setIsSendingOffer] = useState(false);
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
    if (!selectedCard && !reportTarget && !showUnsetPriceNotice && !offerTarget)
      return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedCard, reportTarget, showUnsetPriceNotice, offerTarget]);
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
    "14": "Nightmare Night",
    tcgpromos: "TCG Promos",
  };
  const getOfferSetName = (offerSetId: string) => {
    const names: Record<string, string> = {
      "1": "Moon One",
      "2": "Moon Two",
      "3": "Moon Three",
      "4": "Star One",
      "5": "Rainbow One",
      "6": "Rainbow Two",
      "7": "Fun Moments One",
      "8": "Fun Moments Two",
      "11": "Fun Moments Three",
      "9": "CCG Promos",
      tcgpromos: "TCG Promos",
    };
    return names[offerSetId] || setNames[offerSetId] || offerSetId;
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
            "user_id, set_id, card_key, is_for_trade, is_for_sale, asking_price, trade_quantity, sale_quantity",
          )
          .order("user_id", { ascending: true })
          .order("card_key", { ascending: true })
          .range(from, from + pageSize - 1);
        query = query.eq("set_id", databaseSetId);
        const { data } = await query;
        if (!data || data.length === 0) break;
        allTrades = [...allTrades, ...data];
        if (data.length < pageSize) break;
        from += pageSize;
      }
      const uniqueTrades = Array.from(
        new Map(
          allTrades.map((card) => [
            `${card.user_id}-${card.set_id}-${card.card_key}`,
            card,
          ]),
        ).values(),
      );
      const trades = uniqueTrades
        .filter((card) => card.is_for_trade || card.is_for_sale)
        .map((card) => ({
          ...card,
          id: `${card.user_id}-${card.set_id}-${card.card_key}`,
        }));
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUserId = sessionData.session?.user.id;
      const participantIds = Array.from(
        new Set([
          ...trades.map((card) => card.user_id),
          ...(sessionUserId ? [sessionUserId] : []),
        ]),
      );
      const [profilesResult, tradingProfilesResult] = participantIds.length
        ? await Promise.all([
            supabase
              .from("profiles")
              .select("id, username, avatar_url")
              .in("id", participantIds),
            supabase
              .from("trading_profiles")
              .select("user_id, discord_username, trade_access_revoked")
              .in("user_id", participantIds),
          ])
        : [{ data: [] }, { data: [] }];
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
  const openOfferComposer = async (card: TradeCard) => {
    if (!currentUserId || currentUserId === card.user_id) return;
    if (!getOfferAction(card).enabled) return;
    setOfferTarget(card);
    setSelectedCard(null);
    setSelectedOfferCards([]);
    setOfferRarity("ALL");
    setOfferStep("compose");
    setOfferError("");
    setOfferContact(
      tradingProfiles[currentUserId]?.discord_username?.trim() || "",
    );
    if (inventoryLoaded) return;
    const { data, error } = await supabase
      .from("collection_progress_raw")
      .select("set_id, progress")
      .eq("user_id", currentUserId);
    if (error) {
      console.error("Unable to load offer inventory:", error);
      setOfferError("Your inventory could not be loaded. Please try again.");
      return;
    }
    const ownedCards = (data || []).flatMap((row: any) =>
      OFFER_SET_ORDER.includes(String(row.set_id))
        ? Object.entries(row.progress || {})
            .filter(([, value]) => {
              if (value === true) return true;
              return Boolean(
                value &&
                typeof value === "object" &&
                (value as { owned?: boolean }).owned,
              );
            })
            .map(([cardKey]) => ({
              id: `${row.set_id}-${cardKey}`,
              set_id: String(row.set_id),
              card_key: cardKey,
            }))
        : [],
    );
    ownedCards.sort(
      (a: InventoryCard, b: InventoryCard) =>
        OFFER_SET_ORDER.indexOf(a.set_id) - OFFER_SET_ORDER.indexOf(b.set_id) ||
        a.card_key.localeCompare(b.card_key, undefined, { numeric: true }),
    );
    setInventoryCards(ownedCards);
    setOfferSet(ownedCards[0]?.set_id || "");
    setInventoryLoaded(true);
  };
  const toggleOfferCard = (card: InventoryCard) => {
    setOfferError("");
    setSelectedOfferCards((current) => {
      if (current.some((selected) => selected.id === card.id)) {
        return current.filter((selected) => selected.id !== card.id);
      }
      if (current.length >= 10) {
        setOfferError("You can include a maximum of 10 cards.");
        return current;
      }
      return [...current, card];
    });
  };
  const reviewOffer = () => {
    const discordUsername = offerContact.trim();
    if (selectedOfferCards.length === 0) {
      setOfferError("Choose at least one card from your inventory.");
      return;
    }
    if (!discordUsername) {
      setOfferError("Enter your Discord username to send an offer.");
      return;
    }
    if (discordUsername.length > 100) {
      setOfferError("Your Discord username must be 100 characters or fewer.");
      return;
    }
    setOfferError("");
    setOfferStep("review");
  };
  const submitOffer = async () => {
    if (!offerTarget || !currentUserId || isSendingOffer) return;
    const contact = offerContact.trim();
    if (selectedOfferCards.length === 0) {
      setOfferError("Choose at least one card from your inventory.");
      return;
    }
    if (!contact) {
      setOfferError("Enter your Discord username to send an offer.");
      return;
    }
    if (contact.length > 100) {
      setOfferError("Your Discord username must be 100 characters or fewer.");
      return;
    }
    setIsSendingOffer(true);
    setOfferError("");
    const offerKey = offerKeyFor(
      offerTarget.user_id,
      offerTarget.set_id,
      offerTarget.card_key,
    );
    const { error } = await supabase.from("trade_offers").insert({
      sender_id: currentUserId,
      recipient_id: offerTarget.user_id,
      target_set_id: offerTarget.set_id,
      target_card_key: offerTarget.card_key,
      offered_cards: selectedOfferCards.map((card) => ({
        set_id: card.set_id,
        card_key: card.card_key,
      })),
      contact,
    });
    if (error) {
      console.error("Unable to send trade offer:", error);
      setOfferError(
        error.message?.includes("offer_recipient_active_limit")
          ? "You already have 2 active offers sent to this user."
          : error.message?.includes("offer_attempt_limit_reached")
            ? "You have used both offers for this card."
            : error.message?.includes("offer_retry_requires_decline") ||
                error.code === "23505"
              ? "You can only offer again after the first offer is declined."
              : error.code === "42501"
                ? "This card is no longer available for trade."
                : "Your offer could not be sent. Please try again.",
      );
      setOfferStep("compose");
      setIsSendingOffer(false);
      return;
    }
    const previousAttempts = offerStates[offerKey]?.attempts || 0;
    const createdAt = new Date().toISOString();
    setOfferStates((current) => ({
      ...current,
      [offerKey]: {
        attempts: previousAttempts + 1,
        latestStatus: "pending",
        latestCreatedAt: createdAt,
        latestExpiresAt: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
    }));
    setActiveOffersByRecipient((current) => ({
      ...current,
      [offerTarget.user_id]: (current[offerTarget.user_id] || 0) + 1,
    }));
    setOfferStep("sent");
    setIsSendingOffer(false);
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
    if (setId === "14") {
      const match = key.match(
        /^(P?)BP03-(SPR|SR|ER|GR|CR|RR|C|U)\d{2}(?:-[ABC]2?)?$/,
      );
      return match ? `${match[1]}${match[2]}` : "";
    }
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
  const getOfferRarity = (card: InventoryCard) =>
    card.set_id === "tcgpromos" ? "PR" : inventoryRarity(card.card_key);
  const getOfferRarityRank = (offerSetId: string, rarity: string) => {
    if (["SHINING ZR", "SZR"].includes(rarity)) return 1001;
    if (offerSetId === "4" && rarity === "SAR") return 1002;
    if (["7", "8", "11"].includes(offerSetId) && rarity === "SCR") return 1002;
    const rank = OFFER_RARITY_ORDER.indexOf(rarity);
    return rank === -1 ? 0 : rank;
  };
  const getOfferRarityLabel = (offerSetId: string, rarity: string) => {
    if (rarity === "ALL") {
      return ["7", "8", "11"].includes(offerSetId) ? "All" : "All rarities";
    }
    if (rarity === "SHINING ZR") return "◇ ZR";
    if (rarity === "SZR") return "◇ZR";
    if (rarity === "SAR") return "◇AR";
    if (["7", "8", "11"].includes(offerSetId) && rarity === "SN") return "◇N";
    if (["7", "8", "11"].includes(offerSetId) && rarity === "SCR") return "◇CR";
    const parallelLabels: Record<string, string> = {
      PER: "※ER",
      PSPR: "※SPR",
      PGR: "※GR",
      PCR: "※CR",
      PRR: "※RR",
    };
    return parallelLabels[rarity] || rarity;
  };
  const offerSetOptions = OFFER_SET_ORDER.filter((offerSetId) =>
    inventoryCards.some((card) => card.set_id === offerSetId),
  );
  const currentOfferSetIndex = Math.max(0, offerSetOptions.indexOf(offerSet));
  const changeOfferSet = (direction: -1 | 1) => {
    const nextSet = offerSetOptions[currentOfferSetIndex + direction];
    if (!nextSet) return;
    setOfferSet(nextSet);
    setOfferRarity("ALL");
  };
  const offerRarityOptions = Array.from(
    new Set(
      inventoryCards
        .filter((card) => card.set_id === offerSet)
        .map((card) => getOfferRarity(card)),
    ),
  ).sort(
    (a, b) =>
      getOfferRarityRank(offerSet, a) - getOfferRarityRank(offerSet, b) ||
      a.localeCompare(b),
  );
  const visibleOfferInventory = inventoryCards
    .filter((card) => {
      return (
        card.set_id === offerSet &&
        (offerRarity === "ALL" || getOfferRarity(card) === offerRarity)
      );
    })
    .sort((a, b) => {
      if (offerRarity === "ALL") {
        const rarityDifference =
          getOfferRarityRank(offerSet, getOfferRarity(b)) -
          getOfferRarityRank(offerSet, getOfferRarity(a));
        if (rarityDifference !== 0) return rarityDifference;
      }
      return a.card_key.localeCompare(b.card_key, undefined, {
        numeric: true,
      });
    })
    .slice(0, 150);
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
                      ? "\u2B26ZR"
                      : rarity === "SN"
                        ? "\u2B26N"
                        : rarity === "LC"
                          ? "PR"
                          : rarity === "SCR" && setId !== "4"
                            ? "\u2B26CR"
                            : rarity === "SAR"
                              ? "\u25C7AR"
                              : (setId === "FW" ||
                                    setId === "friendshipsbegin" ||
                                    setId === "12" ||
                                    setId === "14") &&
                                  rarity.startsWith("P")
                                ? `\u203B${rarity.slice(1)}`
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
              Loading listings...
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
                        <CardImage
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
                            Collector profile &middot; ISO &middot; Wishlist
                            &middot; Trades
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
                    <CardImage
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
                          <CardImage
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
                      View profile &rarr;
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
                          if (setId === "friendshipsbegin" || setId === "14") {
                            return a.card_key.localeCompare(
                              b.card_key,
                              undefined,
                              { numeric: true },
                            );
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
                              className={`relative overflow-hidden rounded-[14px] ${
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
                                <ListingCardImage card={card} />
                                <div className="absolute left-1.5 top-1.5 flex gap-1">
                                  {card.is_for_trade && (
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/75 text-xs font-bold text-[#FFD54A]">
                                      &#8644;
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
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        if (
                                          Number(card.asking_price ?? 0) <= 0
                                        ) {
                                          setShowUnsetPriceNotice(true);
                                          return;
                                        }
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
              &larr; Previous
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
              Next &rarr;
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
                <div
                  className="relative overflow-hidden rounded-xl"
                  style={{
                    width: "min(220px, 22.85dvh)",
                    aspectRatio:
                      selectedCard.set_id === "3" &&
                      selectedCard.card_key === "SZR-001"
                        ? "10 / 7"
                        : "5 / 7",
                  }}
                >
                  <ListingCardImage imageSize="original" card={selectedCard} />
                </div>
              </div>
              <div className="p-3.5 sm:p-4">
                <div className="flex items-center gap-3">
                  <CardImage
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
      {offerTarget && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm"
          onMouseDown={() => !isSendingOffer && setOfferTarget(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="offer-title"
            onMouseDown={(event) => event.stopPropagation()}
            className={`flex max-h-[70dvh] w-full max-w-[680px] flex-col overflow-hidden rounded-[18px] border shadow-2xl lg:max-w-5xl ${
              isLightMode
                ? "border-black/10 bg-white text-zinc-900"
                : "border-white/10 bg-[#17191a] text-white"
            }`}
          >
            <div
              className={`flex items-center justify-between gap-3 border-b p-2.5 sm:p-3 ${
                isLightMode ? "border-black/10" : "border-white/10"
              }`}
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[#b88a00] dark:text-[#FFE27A]">
                  {offerStep === "sent" ? "Complete" : "Trade offer"}
                </div>
                <h2
                  id="offer-title"
                  className="mt-0.5 truncate text-lg font-bold"
                >
                  {offerStep === "compose"
                    ? "Choose your cards"
                    : offerStep === "review"
                      ? "Are you sure you want to send this?"
                      : "Offer sent"}
                </h2>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {offerStep === "compose"
                    ? "Choose up to 10 cards. This offer expires after 7 days."
                    : offerStep === "review"
                      ? "Review both sides of the trade before confirming."
                      : "The collector will see your offer in their inbox."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOfferTarget(null)}
                disabled={isSendingOffer}
                aria-label="Close offer"
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  isLightMode ? "bg-zinc-100" : "bg-white/[0.07]"
                }`}
              >
                <X size={18} />
              </button>
            </div>
            {offerStep === "compose" && (
              <>
                <div className="min-h-0 flex-1 overflow-y-auto p-2.5 sm:p-3 md:overflow-hidden">
                  <div className="grid min-h-0 gap-3 md:grid-cols-[130px_minmax(0,1fr)] lg:grid-cols-[160px_minmax(0,1fr)]">
                    <div className="space-y-2.5">
                      <div
                        className={`rounded-xl border p-2.5 ${
                          isLightMode
                            ? "border-black/10 bg-zinc-50"
                            : "border-white/[0.08] bg-white/[0.03]"
                        }`}
                      >
                        <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                          You want
                        </div>
                        <div className="relative mx-auto mt-2 aspect-[5/7] w-full max-w-[112px] overflow-hidden rounded-[6px]">
                          <ListingCardImage card={offerTarget} offerMode />
                        </div>
                        <div className="mt-1 text-center text-xs text-zinc-500">
                          {getOfferSetName(offerTarget.set_id)}
                        </div>
                      </div>
                      <label className="block">
                        <span className="mb-1 block text-sm font-semibold">
                          Discord username{" "}
                          <span className="text-red-500">*</span>
                        </span>
                        <span className="mb-1.5 block text-[11px] leading-snug text-zinc-500">
                          Required so the other collector can contact you about
                          the trade.
                        </span>
                        <input
                          value={offerContact}
                          onChange={(event) =>
                            setOfferContact(event.target.value)
                          }
                          maxLength={100}
                          placeholder="Discord username"
                          required
                          autoCapitalize="none"
                          spellCheck={false}
                          className={`w-full rounded-xl border px-3 py-2 text-base outline-none focus:border-[#d5ad24] ${
                            isLightMode
                              ? "border-black/10 bg-white"
                              : "border-white/10 bg-white/[0.05]"
                          }`}
                        />
                      </label>
                    </div>
                    <div className="min-h-0 min-w-0">
                      <div>
                        <div>
                          <h3 className="font-semibold">Your inventory</h3>
                          <p className="text-sm text-zinc-500">
                            {selectedOfferCards.length} of 10 cards selected
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 md:hidden">
                        {offerSetOptions.map((setId) => (
                          <button
                            key={setId}
                            type="button"
                            onClick={() => {
                              setOfferSet(setId);
                              setOfferRarity("ALL");
                            }}
                            className={
                              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold " +
                              (offerSet === setId
                                ? "border-[#FFD54A] bg-[#FFD54A]/15 text-[#b88a00] dark:text-[#FFE27A]"
                                : isLightMode
                                  ? "border-black/10 bg-zinc-50 text-zinc-600"
                                  : "border-white/10 bg-white/[0.04] text-zinc-400")
                            }
                          >
                            {getOfferSetName(setId)}
                          </button>
                        ))}
                      </div>
                      {offerSetOptions.length > 0 && (
                        <div
                          className={`mt-3 hidden grid-cols-[40px_minmax(0,1fr)_40px] items-center gap-2 rounded-xl border p-1.5 md:grid ${
                            isLightMode
                              ? "border-black/10 bg-zinc-50"
                              : "border-white/10 bg-white/[0.03]"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => changeOfferSet(-1)}
                            disabled={currentOfferSetIndex === 0}
                            aria-label="Previous set"
                            className={`flex h-9 w-9 items-center justify-center rounded-lg text-xl font-bold disabled:opacity-25 ${
                              isLightMode
                                ? "bg-white text-zinc-700 shadow-sm"
                                : "bg-white/[0.07] text-zinc-200"
                            }`}
                          >
                            ‹
                          </button>
                          <div className="min-w-0 text-center">
                            <div className="truncate text-sm font-semibold text-[#b88a00] dark:text-[#FFE27A]">
                              {getOfferSetName(offerSet)}
                            </div>
                            <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                              Set {currentOfferSetIndex + 1} of{" "}
                              {offerSetOptions.length}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => changeOfferSet(1)}
                            disabled={
                              currentOfferSetIndex >= offerSetOptions.length - 1
                            }
                            aria-label="Next set"
                            className={`flex h-9 w-9 items-center justify-center rounded-lg text-xl font-bold disabled:opacity-25 ${
                              isLightMode
                                ? "bg-white text-zinc-700 shadow-sm"
                                : "bg-white/[0.07] text-zinc-200"
                            }`}
                          >
                            ›
                          </button>
                        </div>
                      )}
                      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                        {["ALL", ...offerRarityOptions].map((rarity) => (
                          <button
                            key={rarity}
                            type="button"
                            onClick={() => setOfferRarity(rarity)}
                            className={
                              "shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold " +
                              (offerRarity === rarity
                                ? "border-[#FFD54A] bg-[#FFD54A]/15 text-[#b88a00] dark:text-[#FFE27A]"
                                : isLightMode
                                  ? "border-black/10 bg-white text-zinc-600"
                                  : "border-white/10 bg-white/[0.03] text-zinc-400")
                            }
                          >
                            {getOfferRarityLabel(offerSet, rarity)}
                          </button>
                        ))}
                      </div>
                      {!inventoryLoaded ? (
                        <div className="py-16 text-center text-sm text-zinc-500">
                          Loading your inventory...
                        </div>
                      ) : visibleOfferInventory.length === 0 ? (
                        <div
                          className={`mt-4 rounded-2xl border p-8 text-center text-sm ${
                            isLightMode
                              ? "border-black/10 bg-zinc-50 text-zinc-500"
                              : "border-white/[0.08] bg-white/[0.03] text-zinc-400"
                          }`}
                        >
                          You do not own any cards in this set and rarity.
                        </div>
                      ) : (
                        <div className="mt-2.5 grid max-h-[230px] grid-cols-5 gap-2 overflow-y-auto pr-1 sm:grid-cols-6">
                          {visibleOfferInventory.map((card) => {
                            const selected = selectedOfferCards.some(
                              (item) => item.id === card.id,
                            );
                            const selectionFull =
                              selectedOfferCards.length >= 10 && !selected;
                            return (
                              <button
                                key={card.id}
                                type="button"
                                onClick={() => toggleOfferCard(card)}
                                disabled={selectionFull}
                                className={`group relative overflow-hidden rounded-[6px] border-0 bg-transparent p-0 text-left transition ${
                                  selected
                                    ? "ring-2 ring-[#FFD54A] ring-offset-1 ring-offset-transparent"
                                    : isLightMode
                                      ? "hover:ring-2 hover:ring-[#c89d13]/40"
                                      : "hover:ring-2 hover:ring-[#FFD54A]/30"
                                } disabled:opacity-35`}
                              >
                                <span className="relative block aspect-[5/7] overflow-hidden rounded-[6px]">
                                  <InventoryCardImage card={card} offerMode />
                                </span>
                                {selected && (
                                  <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FFD54A] text-zinc-900 shadow-lg">
                                    <Check size={14} />
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedOfferCards.length > 0 && (
                    <div
                      className={`mt-2.5 rounded-xl border p-2 ${
                        isLightMode
                          ? "border-[#c89d13]/20 bg-[#c89d13]/[0.05]"
                          : "border-[#FFD54A]/15 bg-[#FFD54A]/[0.05]"
                      }`}
                    >
                      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                        Cards in your offer
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedOfferCards.map((card) => (
                          <button
                            key={card.id}
                            type="button"
                            onClick={() => toggleOfferCard(card)}
                            aria-label="Remove selected card"
                            className="relative h-12 aspect-[5/7] overflow-hidden rounded-[6px] border border-[#FFD54A]/40"
                          >
                            <InventoryCardImage card={card} offerMode />
                            <span className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/75 text-white">
                              <X size={11} />
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {offerError && (
                    <p className="mt-3 rounded-xl bg-red-500/10 px-3 py-2 text-sm font-medium text-red-500">
                      {offerError}
                    </p>
                  )}
                </div>
                <div
                  className={`grid grid-cols-2 gap-2 border-t p-2.5 sm:flex sm:justify-end ${
                    isLightMode ? "border-black/10" : "border-white/10"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOfferTarget(null)}
                    disabled={isSendingOffer}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                      isLightMode
                        ? "bg-zinc-100 text-zinc-700"
                        : "bg-white/[0.07] text-zinc-200"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={reviewOffer}
                    disabled={isSendingOffer || !inventoryLoaded}
                    className="rounded-xl bg-[#FFD54A] px-4 py-2 text-sm font-semibold text-zinc-900 disabled:opacity-50"
                  >
                    Review offer
                  </button>
                </div>
              </>
            )}
            {offerStep === "review" && (
              <>
                <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
                  <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-stretch">
                    <div
                      className={`flex flex-col rounded-2xl border p-3 md:min-h-[230px] ${
                        isLightMode
                          ? "border-black/10 bg-zinc-50"
                          : "border-white/[0.08] bg-white/[0.03]"
                      }`}
                    >
                      <div className="text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        You are offering
                      </div>
                      <div className="mt-3 flex flex-1 flex-col items-center justify-center overflow-y-auto">
                        <div className="flex flex-wrap justify-center gap-2">
                          {selectedOfferCards.map((card) => (
                            <div
                              key={card.id}
                              className="relative h-32 aspect-[5/7] overflow-hidden rounded-[6px]"
                            >
                              <InventoryCardImage card={card} offerMode />
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 text-sm font-bold">
                          {selectedOfferCards.length}{" "}
                          {selectedOfferCards.length === 1 ? "card" : "cards"}
                        </div>
                      </div>
                    </div>
                    <div className="self-center text-center text-xl font-black text-[#c89d13]">
                      for
                    </div>
                    <div
                      className={`flex flex-col rounded-2xl border p-3 text-center md:min-h-[230px] ${
                        isLightMode
                          ? "border-black/10 bg-zinc-50"
                          : "border-white/[0.08] bg-white/[0.03]"
                      }`}
                    >
                      <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        You want
                      </div>
                      <div className="flex flex-1 flex-col items-center justify-center">
                        <div className="relative h-32 aspect-[5/7] overflow-hidden rounded-[6px]">
                          <ListingCardImage card={offerTarget} offerMode />
                        </div>
                        <div className="mt-2 text-sm font-bold">
                          {getOfferSetName(offerTarget.set_id)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`mt-4 rounded-xl border px-3 py-2 text-sm ${
                      isLightMode
                        ? "border-black/10 bg-white"
                        : "border-white/10 bg-white/[0.04]"
                    }`}
                  >
                    <span className="font-semibold">Discord username:</span>{" "}
                    {offerContact.trim()}
                  </div>
                  {offerError && (
                    <p className="mt-3 rounded-xl bg-red-500/10 px-3 py-2 text-sm font-medium text-red-500">
                      {offerError}
                    </p>
                  )}
                </div>
                <div
                  className={`grid grid-cols-2 gap-2 border-t p-2.5 sm:flex sm:justify-end ${
                    isLightMode ? "border-black/10" : "border-white/10"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOfferStep("compose")}
                    disabled={isSendingOffer}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                      isLightMode
                        ? "bg-zinc-100 text-zinc-700"
                        : "bg-white/[0.07] text-zinc-200"
                    }`}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => void submitOffer()}
                    disabled={isSendingOffer}
                    className="rounded-xl bg-[#FFD54A] px-4 py-2 text-sm font-semibold text-zinc-900 disabled:opacity-50"
                  >
                    {isSendingOffer ? "Sending..." : "Confirm and send"}
                  </button>
                </div>
              </>
            )}
            {offerStep === "sent" && (
              <>
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto p-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-3xl font-black text-emerald-500">
                    ✓
                  </div>
                  <h3 className="mt-3 text-xl font-bold">
                    Your offer was sent
                  </h3>
                  <p className="mt-1 max-w-md text-sm text-zinc-500">
                    Your offer is active for 7 days. You will be notified when
                    the collector responds.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {selectedOfferCards.map((card) => (
                      <div
                        key={card.id}
                        className="relative h-20 aspect-[5/7] overflow-hidden rounded-[6px]"
                      >
                        <InventoryCardImage card={card} offerMode />
                      </div>
                    ))}
                  </div>
                </div>
                <div
                  className={`border-t p-2.5 sm:flex sm:justify-end ${
                    isLightMode ? "border-black/10" : "border-white/10"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setOfferTarget(null);
                      setSelectedOfferCards([]);
                    }}
                    className="w-full rounded-xl bg-[#FFD54A] px-5 py-2 text-sm font-semibold text-zinc-900 sm:w-auto"
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
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
                ? "You are about to submit a formal report about this card's price. Please review general pricing on "
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
