import CardImage from "@/components/CardImage";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { getProfileAssets } from "./profile-assets";
import { usePublicProfileCards } from "@/lib/public-profile-cards";
import { getTradeCardImage } from "@/lib/card-images";
type CardImageCard = {
  set_id: string | number;
  card_key: string;
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
const canonicalOfferSetId = (setId: string | number) =>
  String(setId) === "SD" ? "friendshipsbegin" : String(setId);
const offerKeyFor = (
  recipientId: string,
  setId: string | number,
  cardKey: string,
) => [recipientId, canonicalOfferSetId(setId), cardKey].join("-");
const buildOfferState = (rows: any[]) => {
  const states: Record<string, OfferState> = {};
  rows.forEach((offer) => {
    const key = offerKeyFor(
      offer.recipient_id,
      offer.target_set_id,
      offer.target_card_key,
    );
    const current = states[key];
    const attempts = Math.max(
      current?.attempts || 0,
      Number(offer.attempt_number || 1),
    );
    if (
      !current ||
      new Date(offer.created_at).getTime() >=
        new Date(current.latestCreatedAt).getTime()
    ) {
      states[key] = {
        attempts,
        latestStatus: offer.status,
        latestExpiresAt: offer.expires_at,
        latestCreatedAt: offer.created_at,
      };
    } else {
      states[key].attempts = attempts;
    }
  });
  return states;
};
const standardZoomSets = new Set([
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
const getCardNumber = (cardKey: string) => {
  const match = cardKey.match(/(\d+)$/);
  return match ? Number(match[1]) : null;
};
const getCardImageClassName = (
  card: CardImageCard,
  position: "block" | "absolute" = "block",
) => {
  const base = `${position === "absolute" ? "absolute inset-0" : "block"} h-full w-full max-w-none`;
  const setId = String(card.set_id);
  if (standardZoomSets.has(setId)) {
    return `${base} scale-[1.05] object-contain object-center`;
  }
  const cardNumber = getCardNumber(card.card_key);
  if (setId === "9") {
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
  if (setId === "tcgpromos") {
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
  const contained = ["SD", "FW", "12", "14"].includes(setId);
  return `${base} ${contained ? "object-contain object-center" : "object-cover object-center"}`;
};
type SafeCardImageProps = {
  src: string;
  alt: string;
  className: string;
};
const SafeCardImage = ({ src, alt, className }: SafeCardImageProps) => {
  const [failed, setFailed] = useState(false);
  const landscapeCommon =
    /\/nightmare-night\/BP03-C(2[5-9]|3[0-9]|4[0-8])\.webp(?:[?#].*)?$/.test(
      src,
    );
  useEffect(() => {
    setFailed(false);
  }, [src]);
  if (failed) {
    return (
      <div
        role="img"
        aria-label={`${alt} image coming soon`}
        className={`${className} aspect-[5/7] min-h-[180px] w-full flex items-center justify-center bg-zinc-300 grayscale dark:bg-zinc-700`}
      >
        <span className="rounded-lg bg-zinc-800/80 px-2 py-1 text-center text-[10px] font-black tracking-wider text-white sm:text-xs">
          COMING SOON
        </span>
      </div>
    );
  }
  if (landscapeCommon) {
    return (
      <span
        className={`${className} block aspect-[5/7] overflow-hidden rounded-[inherit]`}
        style={{
          position: className.includes("absolute") ? "absolute" : "relative",
        }}
      >
        <CardImage
          src={src}
          alt={alt}
          className="absolute left-1/2 top-1/2 h-[71.4286%] w-[140%] max-w-none rounded-[inherit] object-contain"
          style={{
            backgroundColor: "transparent",
            backgroundImage: "none",
            transform: "translate(-50%, -50%) rotate(-90deg)",
          }}
          onError={() => setFailed(true)}
        />
      </span>
    );
  }
  return (
    <CardImage
      src={src}
      alt={alt}
      className={className}
      style={{ backgroundColor: "transparent", backgroundImage: "none" }}
      onError={() => setFailed(true)}
    />
  );
};
interface ExploreProfileProps {
  user: any;
  tradingProfile: any;
  onClose: () => void;
}
const ExploreProfile = ({
  user,
  tradingProfile,
  onClose,
}: ExploreProfileProps) => {
  const [userStats, setuserStats] = useState({
    trades: 0,
    owned: 0,
    completed: 0,
  });
  const {
    isoCards: userIsoCards,
    wishlistCards: userWishlistCards,
    tradeCards,
  } = usePublicProfileCards(user?.id);
  // Preserve the existing public trade-card source exactly as-is.
  const userTradeCards = tradeCards.filter(
    (x: any) => (x.listing_type || "trade") === "trade",
  );
  const [saleListings, setSaleListings] = useState<any[]>([]);
  const [salesLoading, setSalesLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [userProfileSettings, setuserProfileSettings] = useState({
    hide_iso: false,
    hide_wishlist: false,
    hidden_iso_sets: [] as string[],
  });
  const [userTab, setuserTab] = useState<
    "trades" | "purchases" | "iso" | "wishlist"
  >("trades");
  const [collapsedSets, setCollapsedSets] = useState<Record<string, boolean>>(
    {},
  );
  const [selectedSet, setSelectedSet] = useState("");
  const [selectedSection, setSelectedSection] = useState<
    "iso" | "trade" | "wishlist"
  >("iso");
  const [quickViewCard, setQuickViewCard] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestPending, setRequestPending] = useState(false);
  const [notAcceptingRequests, setNotAcceptingRequests] = useState(false);
  const [alreadyFriends, setAlreadyFriends] = useState(false);
  const [copied, setCopied] = useState(false);
  const [discordUsername, setDiscordUsername] = useState("");
  const [currentUserContact, setCurrentUserContact] = useState("");
  const [lastActivityAt, setLastActivityAt] = useState<string | null>(null);
  const [copiedDiscord, setCopiedDiscord] = useState(false);
  const [offerStates, setOfferStates] = useState<Record<string, OfferState>>(
    {},
  );
  const [activeOfferCount, setActiveOfferCount] = useState(0);
  const [offerTarget, setOfferTarget] = useState<any>(null);
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
  const [isLightMode, setIsLightMode] = useState(
    () => document.documentElement.dataset.theme === "light",
  );
  const navigate = useNavigate();
  const { avatar, verification: badge } = getProfileAssets(user);
  useEffect(() => {
    if (!user?.id) return;
    setProfileLoading(true);
    async function loadProfile() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setCurrentUserId(session?.user?.id || "");
      if (session?.user) {
        const [contactResult, offersResult] = await Promise.all([
          supabase
            .from("trading_profiles")
            .select("discord_username")
            .eq("user_id", session.user.id)
            .maybeSingle(),
          supabase
            .from("trade_offers")
            .select(
              "recipient_id, target_set_id, target_card_key, status, expires_at, created_at, attempt_number",
            )
            .eq("sender_id", session.user.id)
            .eq("recipient_id", user.id),
        ]);
        setCurrentUserContact(
          contactResult.data?.discord_username?.trim() || "",
        );
        const offerRows = offersResult.data || [];
        setOfferStates(buildOfferState(offerRows));
        setActiveOfferCount(
          offerRows.filter(
            (offer: any) =>
              offer.status === "pending" &&
              new Date(offer.expires_at).getTime() > Date.now(),
          ).length,
        );
      } else {
        setCurrentUserContact("");
        setOfferStates({});
        setActiveOfferCount(0);
      }
      if (session?.user && session.user.id !== user.id) {
        const { data: friendship } = await supabase
          .from("friends")
          .select("id")
          .eq("user_id", session.user.id)
          .eq("friend_id", user.id)
          .maybeSingle();
        setAlreadyFriends(!!friendship);
      }
      if (session?.user && session.user.id !== user.id) {
        const { data: existingRequest } = await supabase
          .from("friend_requests")
          .select("id")
          .eq("sender_id", session.user.id)
          .eq("receiver_id", user.id)
          .eq("status", "pending")
          .maybeSingle();
        setRequestPending(!!existingRequest);
      }
      const { data: tradingProfileData } = await supabase
        .from("trading_profiles")
        .select("discord_username")
        .eq("user_id", user.id)
        .maybeSingle();
      setDiscordUsername(tradingProfileData?.discord_username || "");
      // Sales use the current listing table. Trades continue to use usePublicProfileCards above.
      const { data: saleRows, error: salesError } = await supabase
        .from("card_market_listings")
        .select(
          "user_id, set_id, card_key, is_for_sale, asking_price, sale_quantity",
        )
        .eq("user_id", user.id);
      if (salesError)
        console.error("Failed to load sale listings:", salesError);
      setSaleListings(
        (saleRows || [])
          .filter((row: any) => Boolean(row.is_for_sale))
          .map((row: any) => ({
            ...row,
            id: `${row.user_id}-${row.set_id}-${row.card_key}-sale`,
            type: "sale",
          })),
      );
      setSalesLoading(false);
      const { data: activityData } = await supabase
        .from("user_activity")
        .select("last_activity_at")
        .eq("user_id", user.id)
        .maybeSingle();
      setLastActivityAt(activityData?.last_activity_at || null);
      const { data: profileSettings } = await supabase
        .from("profiles")
        .select("hide_iso, hide_wishlist, iso_hidden_sets, iso_hidden_sets")
        .eq("id", user.id)
        .single();
      const legacyHidden: string[] = profileSettings?.iso_hidden_sets || [];
      const hiddenIsoSets: string[] = [
        ...(profileSettings?.iso_hidden_sets?.length
          ? profileSettings.iso_hidden_sets
          : legacyHidden),
        ...(profileSettings?.iso_hidden_sets?.length
          ? profileSettings.iso_hidden_sets
          : legacyHidden),
      ];
      setuserProfileSettings({
        hide_iso: profileSettings?.hide_iso ?? false,
        hide_wishlist: profileSettings?.hide_wishlist ?? false,
        hidden_iso_sets: hiddenIsoSets,
      });
      const { data: wishlistRows } = await supabase
        .from("wishlists")
        .select("card_key")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      const wishlistCards = (wishlistRows || []).map((row: any) => {
        const [set_id, card_key] = String(row.card_key).split(":");
        return {
          id: row.card_key,
          set_id,
          card_key,
        };
      });
      if (!(profileSettings?.hide_iso ?? false)) {
        setuserTab("iso");
      } else if (!(profileSettings?.hide_wishlist ?? false)) {
        setuserTab("wishlist");
      } else {
        setuserTab("trades");
      }
      const { data: isoProgress } = await supabase
        .from("collection_progress")
        .select("set_id, progress")
        .eq("user_id", user.id);
      const { data: isoStatusRows } = await supabase
        .from("iso_status")
        .select("card_key, status")
        .eq("user_id", user.id);
      const inProgressCards = new Set(
        (isoStatusRows || [])
          .filter(
            (row: any) =>
              row.status === "trade_in_progress" ||
              row.status === "purchase_in_progress",
          )
          .map((row: any) => String(row.card_key)),
      );
      const ownedCards: Record<string, boolean> = {};
      (isoProgress || []).forEach((set: any) => {
        Object.entries(set.progress || {}).forEach(([key, value]) => {
          if (value) {
            ownedCards[`${set.set_id}-${key}`] = true;
          }
        });
      });
      const isoCards: any[] = [];
      const isoSets = [
        {
          id: "1",
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
          id: "3",
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
          id: "5",
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
          rarities: {
            BASE: 18,
            R: 30,
            SR: 14,
            ST: 20,
            SSR: 15,
            FR: 18,
            TR: 12,
            TGR: 8,
            UR: 19,
            USR: 8,
            XR: 8,
          },
        },
        {
          id: "7",
          rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, CR: 12 },
        },
        {
          id: "8",
          rarities: {
            N: 20,
            SN: 20,
            R: 35,
            SR: 15,
            SSR: 15,
            UR: 10,
            UGR: 9,
            CR: 12,
          },
        },
        {
          id: "11",
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
        { id: "9", rarities: { PR: 12 } },
        { id: "SD", rarities: {} },
        { id: "FW", rarities: {} },
        { id: "12", rarities: {} },
        { id: "14", rarities: {} },
        { id: "tcgpromos", rarities: { RR: 27 } },
      ];
      isoSets.forEach((set) => {
        if (set.id === "9") {
          [
            "PR-1",
            "PR-2",
            "PR-3",
            "PR-4",
            "PR-5",
            "PR-7",
            "PR-8",
            "PR-9",
            "PR-10",
            "PR-11",
            "PR-12",
            "PR-13",
          ].forEach((cardKey) => {
            const fullKey = `${set.id}-${cardKey}`;
            if (!ownedCards[fullKey] && !inProgressCards.has(fullKey)) {
              isoCards.push({
                id: fullKey,
                set_id: set.id,
                card_key: cardKey,
              });
            }
          });
          return;
        }
        if (hiddenIsoSets.includes(String(set.id))) {
          return;
        }
        if (set.id === "FW") {
          const progressRow = (isoProgress || []).find(
            (row: any) => String(row.set_id) === "FW",
          );
          const progress = progressRow?.progress || {};
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
            for (let i = 0; i < count; i++) {
              let num = i + 1;
              if (prefix === "BP01ER") {
                num = i + 7;
              }
              if (prefix === "BP01PSPR") {
                const PSPR_NUMBERS = [1, 2, 3, 5, 7, 8, 9, 12, 13, 18, 21];
                num = PSPR_NUMBERS[i];
                if (!num) continue;
              }
              const cardKey = `${prefix}${String(num).padStart(2, "0")}`;
              if (progress[cardKey] !== true && !inProgressCards.has(cardKey)) {
                isoCards.push({
                  id: `FW-${cardKey}`,
                  set_id: "FW",
                  card_key: cardKey,
                });
              }
            }
          });
          return;
        }
        if (set.id === "12") {
          const progressRow = (isoProgress || []).find(
            (row: any) => String(row.set_id) === "12",
          );
          const progress = progressRow?.progress || {};
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
            for (let i = 0; i < count; i++) {
              let cardKey = "";
              if (prefix === "BP02-PER") {
                const num = Math.floor(i / 2) + 1;
                const side = i % 2 === 0 ? "A2" : "B2";
                cardKey = `${prefix}${String(num).padStart(2, "0")}-${side}`;
              } else if (prefix === "BP02-PSPR") {
                cardKey = `${prefix}${String(i + 1).padStart(2, "0")}`;
              } else {
                cardKey = `${prefix}${String(i + 1).padStart(2, "0")}`;
              }
              if (progress[cardKey] !== true && !inProgressCards.has(cardKey)) {
                isoCards.push({
                  id: `12-${cardKey}`,
                  set_id: "12",
                  card_key: cardKey,
                });
              }
            }
          });
          return;
        }
        if (
          set.id === "SD" &&
          (hiddenIsoSets.includes("SD_STARTERS") ||
            hiddenIsoSets.includes("SD_BONUS"))
        ) {
          return;
        }
        if (set.id === "SD") {
          const progressRow = (isoProgress || []).find(
            (row: any) => String(row.set_id) === "SD",
          );
          const progress = progressRow?.progress || {};
          const SD_STRUCTURE = [
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
          SD_STRUCTURE.forEach(({ prefix, count }) => {
            for (let i = 0; i < count; i++) {
              let num = i + 1;
              if (prefix === "SD01PER") {
                num = i + 7;
                if (num > 18) continue;
              }
              const cardKey = `${prefix}${String(num).padStart(2, "0")}`;
              const isOwned =
                progress[cardKey] === true ||
                progress[`BONUS-${cardKey}`] === true ||
                progress[`STARTER-${cardKey}`] === true;
              const isInProgress =
                inProgressCards.has(cardKey) ||
                inProgressCards.has(`BONUS-${cardKey}`);
              if (!isOwned && !isInProgress) {
                isoCards.push({
                  id: `SD-${cardKey}`,
                  set_id: "SD",
                  card_key: cardKey,
                });
              }
            }
          });
          return;
        }
        if (set.id === "14") {
          const nightmareNightStructure = [
            ["C", 48],
            ["U", 18],
            ["ER", 6],
            ["SR", 14],
            ["SPR", 28],
            ["GR", 12],
            ["CR", 12],
            ["RR", 6],
            ["PER", 12],
            ["PSPR", 11],
            ["PGR", 5],
            ["PCR", 12],
            ["PRR", 6],
          ] as const;
          nightmareNightStructure.forEach(([rarity, count]) => {
            for (let i = 1; i <= count; i++) {
              const number = String(i).padStart(2, "0");
              const cardKey = `BP03-${rarity}${number}`;
              const fullKey = `14-${cardKey}`;
              if (!ownedCards[fullKey] && !inProgressCards.has(fullKey)) {
                isoCards.push({ id: fullKey, set_id: "14", card_key: cardKey });
              }
            }
          });
          return;
        }
        if (set.id === "tcgpromos") {
          for (let i = 1; i <= 27; i++) {
            const cardKey = `RR${String(i).padStart(2, "0")}`;
            const fullKey = `tcgpromos-${cardKey}`;
            if (!ownedCards[fullKey] && !inProgressCards.has(fullKey)) {
              isoCards.push({
                id: fullKey,
                set_id: "tcgpromos",
                card_key: cardKey,
              });
            }
          }
          return;
        }
        Object.entries(set.rarities).forEach(([rarity, count]) => {
          for (let i = 1; i <= (count as number); i++) {
            const cardKey = `${rarity}-${i}`;
            const fullKey = `${set.id}-${cardKey}`;
            if (inProgressCards.has(fullKey)) {
              continue;
            }
            if (!ownedCards[fullKey] && !inProgressCards.has(fullKey)) {
              isoCards.push({
                id: fullKey,
                set_id: set.id,
                card_key: cardKey,
              });
            }
          }
        });
      });
      const { data: collection } = await supabase
        .from("collection_progress_raw")
        .select("set_id, progress")
        .eq("user_id", user.id);
      let owned = 0;
      (collection || []).forEach((row: any) => {
        if (row.set_id === "OTHERMERCH") {
          return;
        }
        owned += Object.values(row.progress || {}).filter(
          (value: any) =>
            value === true ||
            (typeof value === "object" && value?.owned === true),
        ).length;
      });
      let completed = 0;
      const progressMap = new Map(
        (isoProgress || []).map((row: any) => [String(row.set_id), row]),
      );
      const sets = [
        {
          id: "1",
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
          id: "5",
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
          id: "7",
          rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, CR: 12 },
        },
        {
          id: "2",
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
          id: "3",
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
          id: "8",
          rarities: {
            N: 20,
            SN: 20,
            R: 35,
            SR: 15,
            SSR: 15,
            UR: 10,
            UGR: 9,
            CR: 12,
          },
        },
        { id: "TCG_PROMOS", name: "TCG Promos" },
      ];
      sets.forEach((set) => {
        const found = progressMap.get(set.id);
        if (!found?.progress) return;
        let ownedInSet = 0;
        let totalInSet = 0;
        Object.entries(set.rarities).forEach(([rarity, count]) => {
          totalInSet += count as number;
          for (let i = 1; i <= (count as number); i++) {
            const key = `${rarity}-${i}`;
            if (found.progress[key]) {
              ownedInSet++;
            }
          }
        });
        if (totalInSet > 0 && ownedInSet === totalInSet) {
          completed++;
        }
      });
      const nightmareNightProgress = progressMap.get("14")?.progress || {};
      const nightmareNightOwned = Object.values(nightmareNightProgress).filter(
        (value: any) =>
          value === true ||
          (typeof value === "object" && value?.owned === true),
      ).length;
      if (nightmareNightOwned >= 190) {
        completed++;
      }
      const { data: fwProgress } = await supabase
        .from("collection_progress_raw")
        .select("progress")
        .eq("user_id", user.id)
        .eq("set_id", "FW");
      const fwRow = fwProgress?.[0];
      if (fwRow) {
        const STRUCTURE = [
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
        const validKeys = new Set(
          STRUCTURE.flatMap(({ prefix, count }) => {
            if (prefix === "BP01ER") {
              return Array.from(
                { length: 6 },
                (_, i) => `BP01ER${String(i + 7).padStart(2, "0")}`,
              );
            }
            if (prefix === "BP01PSPR") {
              return [1, 2, 3, 5, 7, 8, 9, 12, 13, 18, 21].map(
                (n) => `BP01PSPR${String(n).padStart(2, "0")}`,
              );
            }
            return Array.from(
              { length: count },
              (_, i) => `${prefix}${String(i + 1).padStart(2, "0")}`,
            );
          }),
        );
        const ownedFW = Object.entries(fwRow.progress || {}).filter(
          ([key, val]) => val && validKeys.has(key),
        ).length;
        if (ownedFW === validKeys.size) {
          completed++;
        }
      }
      setuserStats({
        trades: (tradeCards || []).length,
        owned,
        completed,
      });
    }
    loadProfile().finally(() => setProfileLoading(false));
  }, [user?.id]);
  useEffect(() => {
    if (!quickViewCard && !offerTarget) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (!isSendingOffer) {
          setOfferTarget(null);
          setQuickViewCard(null);
        }
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [quickViewCard, offerTarget, isSendingOffer]);
  async function sendFriendRequest() {
    if (!currentUserId) return;
    if (currentUserId === user.id) return;
    setSendingRequest(true);
    const { data: profile } = await supabase
      .from("profiles")
      .select("allow_friend_requests")
      .eq("id", user.id)
      .single();
    if (profile && !profile.allow_friend_requests) {
      setNotAcceptingRequests(true);
      setSendingRequest(false);
      return;
    }
    const { error } = await supabase.from("friend_requests").insert({
      sender_id: currentUserId,
      receiver_id: user.id,
      status: "pending",
    });
    if (!error) {
      setRequestPending(true);
    }
    setSendingRequest(false);
  }
  function getOfferAction(card: any) {
    const key = offerKeyFor(user.id, card.set_id, card.card_key);
    const state = offerStates[key];
    if (state?.attempts >= 2) {
      return { enabled: false, label: "No offers left" };
    }
    if (state?.attempts === 1 && state.latestStatus === "declined") {
      if (activeOfferCount >= 2) {
        return { enabled: false, label: "2 active offers sent" };
      }
      return { enabled: true, label: "1 try left. Offer again?" };
    }
    if (state) {
      return { enabled: false, label: "Offer already sent" };
    }
    if (activeOfferCount >= 2) {
      return { enabled: false, label: "2 active offers sent" };
    }
    return { enabled: true, label: "Make an offer" };
  }
  async function openOfferComposer(card: any) {
    if (!currentUserId || currentUserId === user.id || card.type !== "trade")
      return;
    if (!getOfferAction(card).enabled) return;
    setOfferTarget(card);
    setQuickViewCard(null);
    setSelectedOfferCards([]);
    setOfferRarity("ALL");
    setOfferStep("compose");
    setOfferError("");
    setOfferContact(currentUserContact);
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
              id: [row.set_id, cardKey].join("-"),
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
  }
  function toggleOfferCard(card: InventoryCard) {
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
  }
  function reviewOffer() {
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
  }
  async function submitOffer() {
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
    const targetSetId = canonicalOfferSetId(offerTarget.set_id);
    const offerKey = offerKeyFor(user.id, targetSetId, offerTarget.card_key);
    const { error } = await supabase.from("trade_offers").insert({
      sender_id: currentUserId,
      recipient_id: user.id,
      target_set_id: targetSetId,
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
    setActiveOfferCount((current) => current + 1);
    setOfferStep("sent");
    setIsSendingOffer(false);
  }
  function isMoon3DoubleWide(card: any) {
    if (!card) return false;
    const setId = String(card.set_id);
    const cardKey = String(card.card_key).toUpperCase();
    return setId === "3" && /^SZR-0*1(?:L5)?$/.test(cardKey);
  }
  function getSetName(setId: string) {
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
      FW: "Fantasy Wonderland",
      "12": "Discord",
      "14": "Nightmare Night",
      SD: "Friendships Begin",
      friendshipsbegin: "Friendships Begin",
      tcgpromos: "TCG Promos",
    };
    return names[String(setId)] || `Set ${setId}`;
  }
  const visibleIsoCards = userIsoCards.filter((card) => {
    const setId = String(card.set_id);
    const hidden = userProfileSettings.hidden_iso_sets;
    if (hidden.includes(setId)) {
      return false;
    }
    if (setId === "FW" && hidden.includes("FW")) {
      return false;
    }
    if (setId === "12" && hidden.includes("12")) {
      return false;
    }
    if (setId === "tcgpromos" && hidden.includes("TCG_PROMOS")) {
      return false;
    }
    if (
      setId === "SD" &&
      (hidden.includes("SD") ||
        hidden.includes("SD_STARTERS") ||
        hidden.includes("SD_BONUS"))
    ) {
      return false;
    }
    return true;
  });
  const ISO_SET_TABS = Array.from(
    new Set(visibleIsoCards.map((card) => String(card.set_id))),
  ).map((setId) => ({
    id: setId,
    name: getSetName(setId),
  }));
  const filteredIsoCards = visibleIsoCards.filter(
    (card) => String(card.set_id) === selectedSet,
  );
  const allTradeCards = [
    ...userTradeCards.map((card: any) => ({
      ...card,
      type: "trade",
    })),
    ...saleListings,
  ];
  const TRADE_SET_TABS = Array.from(
    new Set(allTradeCards.map((card) => String(card.set_id))),
  ).map((setId) => ({
    id: setId,
    name: getSetName(setId),
  }));
  const WISHLIST_SET_TABS = Array.from(
    new Set(userWishlistCards.map((card) => String(card.set_id))),
  ).map((setId) => ({
    id: setId,
    name: getSetName(setId),
  }));
  useEffect(() => {
    let tabs: { id: string }[] = [];
    if (selectedSection === "iso") {
      tabs = ISO_SET_TABS;
    } else if (selectedSection === "trade") {
      tabs = TRADE_SET_TABS;
    } else {
      tabs = WISHLIST_SET_TABS;
    }
    if (tabs.length === 0) {
      setSelectedSet("");
      return;
    }
    if (!tabs.some((x) => x.id === selectedSet)) {
      setSelectedSet(tabs[0].id);
    }
  }, [
    selectedSection,
    selectedSet,
    ISO_SET_TABS,
    TRADE_SET_TABS,
    WISHLIST_SET_TABS,
  ]);
  const RARITY_ORDER = [
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
  function getRarity(cardKey: string) {
    const key = String(cardKey);
    if (
      key.startsWith("BP01") ||
      key.startsWith("BP02") ||
      key.startsWith("SD01")
    ) {
      const match = key.match(
        /(BASE|PER|PSPR|PGR|PCR|PRR|SPR|SSR|SCR|SAR|SGR|UGR|USR|TGR|MTR|LSR|SZR|ZR|XR|HR|FR|TR|ST|SR|UR|GR|CR|ER|RR|SC|BP|AR|OR|PR|R|U|C|N|SN)/,
      );
      return match?.[1] ?? "";
    }
    return key.split("-")[0];
  }
  function getOfferRarity(card: InventoryCard) {
    return card.set_id === "tcgpromos" ? "PR" : getRarity(card.card_key);
  }
  function getOfferRarityRank(setId: string, rarity: string) {
    if (["SHINING ZR", "SZR"].includes(rarity)) return 1001;
    if (setId === "4" && rarity === "SAR") return 1002;
    if (["7", "8", "11"].includes(setId) && rarity === "SCR") return 1002;
    const rank = RARITY_ORDER.indexOf(rarity);
    return rank === -1 ? 0 : rank;
  }
  function getOfferRarityLabel(setId: string, rarity: string) {
    if (rarity === "ALL") {
      return ["7", "8", "11"].includes(setId) ? "All" : "All rarities";
    }
    if (rarity === "SHINING ZR") return "◇ ZR";
    if (rarity === "SZR") return "◇ZR";
    if (rarity === "SAR") return "◇AR";
    if (["7", "8", "11"].includes(setId) && rarity === "SN") return "◇N";
    if (["7", "8", "11"].includes(setId) && rarity === "SCR") return "◇CR";
    const parallelLabels: Record<string, string> = {
      PER: "※ER",
      PSPR: "※SPR",
      PGR: "※GR",
      PCR: "※CR",
      PRR: "※RR",
    };
    return parallelLabels[rarity] || rarity;
  }
  function sortByIsoOrder(cards: any[]) {
    return [...cards].sort((a, b) => {
      if (String(a.set_id) !== String(b.set_id)) {
        return String(a.set_id).localeCompare(String(b.set_id), undefined, {
          numeric: true,
        });
      }
      const rarityA = getRarity(a.card_key);
      const rarityB = getRarity(b.card_key);
      const rarityDiff =
        RARITY_ORDER.indexOf(rarityA) - RARITY_ORDER.indexOf(rarityB);
      if (rarityDiff !== 0) return rarityDiff;
      const numA = Number(String(a.card_key).match(/d+/)?.[0] ?? 0);
      const numB = Number(String(b.card_key).match(/d+/)?.[0] ?? 0);
      return numA - numB;
    });
  }
  const filteredTradeCards = sortByIsoOrder(
    allTradeCards.filter((card) => String(card.set_id) === selectedSet),
  );
  const filteredWishlistCards = sortByIsoOrder(
    userWishlistCards.filter((card) => String(card.set_id) === selectedSet),
  );
  const offerSetOptions = OFFER_SET_ORDER.filter((setId) =>
    inventoryCards.some((card) => card.set_id === setId),
  );
  const currentOfferSetIndex = Math.max(0, offerSetOptions.indexOf(offerSet));
  function changeOfferSet(direction: -1 | 1) {
    const nextSet = offerSetOptions[currentOfferSetIndex + direction];
    if (!nextSet) return;
    setOfferSet(nextSet);
    setOfferRarity("ALL");
  }
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
  const isJacob = user?.id === "94a1c998-d040-4dd2-b2fb-5f606287139d";
  if (profileLoading) {
    return (
      <div
        className={`flex min-h-[70dvh] w-full items-center justify-center rounded-[30px] border px-4 py-10 [overflow-anchor:none] ${
          isLightMode
            ? "border-black/10 bg-white"
            : "border-white/[0.08] bg-[#151718]"
        }`}
      >
        <div
          role="status"
          aria-live="polite"
          className={`flex max-w-full items-center gap-3 rounded-[24px] border px-4 py-3 shadow-sm sm:gap-4 sm:px-5 sm:py-4 ${
            isLightMode
              ? "border-black/10 bg-white text-zinc-800"
              : "border-white/10 bg-[#151718] text-white"
          }`}
        >
          <div className="relative shrink-0">
            <div className="absolute -inset-1 animate-pulse rounded-[20px] bg-[#FFD54A]/25" />
            <CardImage
              src={avatar}
              alt={user?.username || "User"}
              className={`relative h-12 w-12 rounded-[17px] border object-cover sm:h-14 sm:w-14 sm:rounded-[19px] ${
                isLightMode ? "border-black/10" : "border-white/10"
              }`}
            />
          </div>
          <div className="min-w-0">
            <p className="flex min-w-0 flex-wrap items-center text-sm font-semibold sm:text-base">
              <span>Loading&nbsp;</span>
              <span className="max-w-[180px] truncate sm:max-w-[280px]">
                {user?.username || "user"}'s
              </span>
              <span>&nbsp;data</span>
              <span
                className="ml-0.5 inline-flex items-end gap-0.5"
                aria-hidden="true"
              >
                <span className="animate-bounce [animation-delay:-0.3s]">
                  .
                </span>
                <span className="animate-bounce [animation-delay:-0.15s]">
                  .
                </span>
                <span className="animate-bounce">.</span>
              </span>
            </p>
            <p
              className={`mt-0.5 text-xs ${
                isLightMode ? "text-zinc-500" : "text-zinc-400"
              }`}
            >
              Gathering their collection details
            </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div
      className={`w-full transition-colors duration-200 [overflow-anchor:none] ${
        isLightMode ? "text-zinc-900" : "text-white"
      }`}
    >
      <section
        className={`relative overflow-hidden rounded-[30px] border ${
          isLightMode
            ? "border-black/10 bg-white shadow-[0_14px_36px_rgba(0,0,0,.05)]"
            : "border-white/[0.08] bg-[#151718]"
        }`}
      >
        <div
          className={`absolute inset-0 bg-cover bg-center ${
            isLightMode ? "opacity-[0.08]" : "opacity-[0.07]"
          }`}
          style={{
            backgroundImage: "url('/website-assets/exploreequestria.webp')",
          }}
        />
        <div
          className={`absolute inset-0 ${
            isLightMode
              ? "bg-gradient-to-r from-white via-white/95 to-white/80"
              : "bg-gradient-to-r from-[#151718] via-[#151718]/95 to-[#151718]/80"
          }`}
        />
        <div className="relative p-5 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                isLightMode
                  ? "border-black/10 bg-white/80 text-zinc-700 hover:bg-zinc-100"
                  : "border-white/10 bg-black/20 text-zinc-300 hover:bg-white/[0.06]"
              }`}
            >
              ← Back
            </button>
            <div
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                isLightMode
                  ? activityStatus.lightClass
                  : activityStatus.darkClass
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${activityStatus.dotClass}`}
              />
              {activityStatus.label}
            </div>
          </div>
          <div className="mt-3 grid grid-cols-[80px_minmax(0,1fr)] items-start gap-3 sm:mt-6 sm:flex sm:items-center sm:gap-5">
            <CardImage
              src={avatar}
              alt={user?.username}
              className={`h-20 w-20 rounded-[22px] border object-cover sm:h-28 sm:w-28 sm:rounded-[30px] ${
                isLightMode ? "border-black/10" : "border-white/10"
              }`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1
                  className={`min-w-0 break-words text-2xl font-semibold leading-tight tracking-tight sm:text-4xl ${
                    isLightMode ? "text-zinc-950" : "text-white"
                  }`}
                >
                  {user?.username}
                </h1>
                {badge && (
                  <CardImage
                    src={badge.badge}
                    alt={badge.label}
                    title={badge.label}
                    className="h-5 w-5 shrink-0 object-contain sm:h-6 sm:w-6"
                  />
                )}
              </div>
              {discordUsername && (
                <div
                  className={`mt-1 text-xs sm:mt-2 sm:text-sm ${
                    isLightMode ? "text-zinc-600" : "text-zinc-400"
                  }`}
                >
                  Discord:{" "}
                  <span
                    className={
                      isLightMode
                        ? "font-medium text-[#725700]"
                        : "font-medium text-[#FFE27A]"
                    }
                  >
                    {discordUsername}
                  </span>
                </div>
              )}
              <div className="mt-2 flex flex-wrap gap-2 sm:mt-4">
                {currentUserId !== user.id && (
                  <button
                    type="button"
                    onClick={() => {
                      if (alreadyFriends) {
                        navigate("/inbox");
                        return;
                      }
                      if (!requestPending && !notAcceptingRequests) {
                        sendFriendRequest();
                      }
                    }}
                    disabled={
                      sendingRequest ||
                      (requestPending && !alreadyFriends) ||
                      notAcceptingRequests
                    }
                    className={`rounded-xl px-3 py-2 text-xs font-semibold transition-colors sm:px-4 sm:py-2.5 sm:text-sm ${
                      alreadyFriends
                        ? isLightMode
                          ? "bg-[#c89d13]/15 text-[#725700]"
                          : "bg-[#FFD54A]/10 text-[#FFE27A]"
                        : notAcceptingRequests
                          ? isLightMode
                            ? "cursor-not-allowed bg-red-700/[0.06] text-red-700"
                            : "cursor-not-allowed bg-red-500/[0.08] text-red-400"
                          : requestPending
                            ? isLightMode
                              ? "cursor-not-allowed bg-zinc-100 text-zinc-500"
                              : "cursor-not-allowed bg-white/[0.05] text-zinc-500"
                            : "bg-[#FFD54A] text-black hover:bg-[#FFE27A]"
                    }`}
                  >
                    {alreadyFriends
                      ? "Manage Friendship"
                      : notAcceptingRequests
                        ? "Requests Disabled"
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
                    const url = `https://www.mlpekayou.community/${encodeURIComponent(
                      user?.username ?? "",
                    )}`;
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
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors sm:px-4 sm:py-2.5 sm:text-sm ${
                    isLightMode
                      ? "border-black/10 bg-white/70 text-zinc-700 hover:bg-zinc-100"
                      : "border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]"
                  }`}
                >
                  {copied ? "Link Copied" : "Share Profile"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="mt-4 grid grid-cols-3 gap-3">
        {[
          ["Cards Owned", userStats.owned.toLocaleString()],
          ["Sets Completed", userStats.completed],
          ["Listings", userStats.trades],
        ].map(([label, value]) => (
          <div
            key={label}
            className={`rounded-2xl border p-4 sm:p-5 ${
              isLightMode
                ? "border-black/10 bg-white"
                : "border-white/[0.08] bg-[#151718]"
            }`}
          >
            <div
              className={`text-xs font-medium ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}
            >
              {label}
            </div>
            <div className="mt-1 text-2xl font-semibold sm:text-3xl">
              {value}
            </div>
          </div>
        ))}
      </section>
      <section
        className={`mt-4 flex h-[72dvh] min-h-[520px] max-h-[820px] flex-col overflow-hidden rounded-[28px] border [overflow-anchor:none] ${
          isLightMode
            ? "border-black/10 bg-white"
            : "border-white/[0.08] bg-[#151718]"
        }`}
      >
        <div
          className={`grid grid-cols-3 border-b ${
            isLightMode ? "border-black/[0.08]" : "border-white/[0.07]"
          }`}
        >
          {[
            ["iso", "ISO"],
            ["trade", "Trades"],
            ["wishlist", "Wishlist"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setSelectedSection(key as "iso" | "trade" | "wishlist");
                setSelectedSet("");
              }}
              className={`px-3 py-3.5 text-sm font-semibold transition-colors ${
                selectedSection === key
                  ? isLightMode
                    ? "bg-[#c89d13]/10 text-[#725700]"
                    : "bg-[#FFD54A]/10 text-[#FFE27A]"
                  : isLightMode
                    ? "text-zinc-500 hover:bg-zinc-50"
                    : "text-zinc-500 hover:bg-white/[0.04]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [overflow-anchor:none]">
          {selectedSection === "iso" ? (
            userProfileSettings.hide_iso ? (
              <div
                className={`p-10 text-center text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}
              >
                This Superfan has hidden their ISO.
              </div>
            ) : (
              <>
                <div
                  className={`border-b p-3 sm:p-4 ${isLightMode ? "border-black/[0.08]" : "border-white/[0.07]"}`}
                >
                  <div className="flex flex-wrap gap-2">
                    {ISO_SET_TABS.map((set) => (
                      <button
                        key={set.id}
                        type="button"
                        onClick={() => setSelectedSet(set.id)}
                        className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold ${
                          selectedSet === set.id
                            ? isLightMode
                              ? "border-[#8a6a00]/25 bg-[#c89d13]/15 text-[#725700]"
                              : "border-[#FFD54A]/25 bg-[#FFD54A]/10 text-[#FFE27A]"
                            : isLightMode
                              ? "border-black/10 bg-zinc-50 text-zinc-600"
                              : "border-white/10 bg-white/[0.04] text-zinc-400"
                        }`}
                      >
                        {set.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-3 sm:p-5">
                  {filteredIsoCards.length === 0 ? (
                    <div
                      className={`py-10 text-center text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-500"}`}
                    >
                      No cards to show.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-7">
                      {filteredIsoCards.map((card) => (
                        <button
                          key={`${card.set_id}-${card.card_key}`}
                          type="button"
                          onClick={() => setQuickViewCard(card)}
                          className={`relative overflow-hidden rounded-[10px] border-0 bg-transparent p-0 shadow-none ${
                            isMoon3DoubleWide(card) ? "col-span-2" : ""
                          }`}
                        >
                          <SafeCardImage
                            src={getTradeCardImage(card)}
                            alt={card.card_key}
                            className={getCardImageClassName(card)}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )
          ) : selectedSection === "trade" ? (
            <>
              <div
                className={`border-b p-3 sm:p-4 ${isLightMode ? "border-black/[0.08]" : "border-white/[0.07]"}`}
              >
                <div className="flex flex-wrap gap-2">
                  {TRADE_SET_TABS.map((set) => (
                    <button
                      key={set.id}
                      type="button"
                      onClick={() => setSelectedSet(set.id)}
                      className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold ${
                        selectedSet === set.id
                          ? isLightMode
                            ? "border-[#8a6a00]/25 bg-[#c89d13]/15 text-[#725700]"
                            : "border-[#FFD54A]/25 bg-[#FFD54A]/10 text-[#FFE27A]"
                          : isLightMode
                            ? "border-black/10 bg-zinc-50 text-zinc-600"
                            : "border-white/10 bg-white/[0.04] text-zinc-400"
                      }`}
                    >
                      {set.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-3 sm:p-5">
                {salesLoading ? (
                  <div
                    className={`py-10 text-center text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-500"}`}
                  >
                    Loading listings…
                  </div>
                ) : filteredTradeCards.length === 0 ? (
                  <div
                    className={`py-10 text-center text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-500"}`}
                  >
                    No listings to show.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-7">
                    {filteredTradeCards.map((card: any) => (
                      <button
                        key={`${card.set_id}-${card.card_key}-${card.type}`}
                        type="button"
                        onClick={() => setQuickViewCard(card)}
                        className={`relative overflow-hidden rounded-[10px] border-0 bg-transparent p-0 shadow-none ${
                          isMoon3DoubleWide(card) ? "col-span-2" : ""
                        }`}
                      >
                        <SafeCardImage
                          src={getTradeCardImage(card)}
                          alt={card.card_key}
                          className={getCardImageClassName(card)}
                        />
                        <span
                          className={`absolute bottom-2 left-2 rounded-full px-2 py-1 text-[10px] font-semibold ${
                            isLightMode
                              ? "bg-white/90 text-zinc-700"
                              : "bg-black/70 text-white"
                          }`}
                        >
                          {card.type === "sale"
                            ? `For Sale · $${Number(card.asking_price || 0).toFixed(2)}`
                            : "Trade"}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : userProfileSettings.hide_wishlist ? (
            <div
              className={`p-10 text-center text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}
            >
              This Superfan has hidden their wishlist.
            </div>
          ) : (
            <>
              <div
                className={`border-b p-3 sm:p-4 ${isLightMode ? "border-black/[0.08]" : "border-white/[0.07]"}`}
              >
                <div className="flex flex-wrap gap-2">
                  {WISHLIST_SET_TABS.map((set) => (
                    <button
                      key={set.id}
                      type="button"
                      onClick={() => setSelectedSet(set.id)}
                      className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold ${
                        selectedSet === set.id
                          ? isLightMode
                            ? "border-[#8a6a00]/25 bg-[#c89d13]/15 text-[#725700]"
                            : "border-[#FFD54A]/25 bg-[#FFD54A]/10 text-[#FFE27A]"
                          : isLightMode
                            ? "border-black/10 bg-zinc-50 text-zinc-600"
                            : "border-white/10 bg-white/[0.04] text-zinc-400"
                      }`}
                    >
                      {set.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-3 sm:p-5">
                {filteredWishlistCards.length === 0 ? (
                  <div
                    className={`py-10 text-center text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-500"}`}
                  >
                    No wishlist cards to show.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-7">
                    {filteredWishlistCards.map((card) => (
                      <button
                        key={`${card.set_id}-${card.card_key}`}
                        type="button"
                        onClick={() => setQuickViewCard(card)}
                        className={`relative overflow-hidden rounded-[10px] border-0 bg-transparent p-0 shadow-none ${
                          isMoon3DoubleWide(card) ? "col-span-2" : ""
                        }`}
                      >
                        <SafeCardImage
                          src={getTradeCardImage(card)}
                          alt={card.card_key}
                          className={getCardImageClassName(card)}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
      {quickViewCard && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-md ${
            isLightMode ? "bg-white/25" : "bg-black/80"
          }`}
          onClick={() => setQuickViewCard(null)}
        >
          {quickViewCard.type === "sale" || quickViewCard.type === "trade" ? (
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Card details"
              onClick={(e) => e.stopPropagation()}
              className={`relative max-h-[calc(100dvh-2rem)] w-[min(94vw,590px)] overflow-y-auto rounded-[20px] border p-2.5 shadow-2xl sm:max-h-[min(520px,calc(100dvh-3rem))] sm:p-3 ${
                isLightMode
                  ? "border-black/10 bg-white"
                  : "border-white/10 bg-[#17191a]"
              }`}
            >
              <button
                type="button"
                aria-label="Close card details"
                onClick={() => setQuickViewCard(null)}
                className={`absolute right-3 top-3 z-10 rounded-full px-3 py-1.5 text-sm font-semibold ${
                  isLightMode
                    ? "bg-white/90 text-zinc-700 shadow"
                    : "bg-black/70 text-white"
                }`}
              >
                ×
              </button>
              <div
                className={
                  isMoon3DoubleWide(quickViewCard)
                    ? "grid grid-cols-1 gap-3"
                    : "grid grid-cols-[minmax(0,150px)_minmax(0,1fr)] items-start gap-3 sm:grid-cols-[minmax(0,280px)_230px]"
                }
              >
                <div
                  className={`relative mx-auto w-full overflow-hidden rounded-[12px] ${isMoon3DoubleWide(quickViewCard) ? "max-w-[440px] aspect-[10/7]" : "max-w-[150px] aspect-[5/7] sm:max-w-[280px]"}`}
                  style={{ clipPath: "inset(0 round 12px)" }}
                >
                  <SafeCardImage
                    src={getTradeCardImage(quickViewCard)}
                    alt={quickViewCard.card_key}
                    className={`${getCardImageClassName(quickViewCard, "absolute")} rounded-[12px]`}
                  />
                </div>
                <div
                  className={`min-w-0 p-0.5 ${isMoon3DoubleWide(quickViewCard) ? "mx-auto grid w-full max-w-[440px] gap-3 sm:grid-cols-2" : "pt-9 sm:pt-2"}`}
                >
                  {quickViewCard.type === "sale" ? (
                    <div
                      className={`rounded-2xl border p-3 ${isLightMode ? "border-black/10 bg-zinc-50" : "border-white/10 bg-white/[0.04]"}`}
                    >
                      <div
                        className={`text-xs font-medium ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}
                      >
                        For sale
                      </div>
                      <div className="mt-2 text-sm">
                        Price:{" "}
                        <span className="font-semibold">
                          ${Number(quickViewCard.asking_price || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="mt-2 text-sm">
                        Available:{" "}
                        <span className="font-semibold">
                          {quickViewCard.sale_quantity ?? 0}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`rounded-2xl border p-3 ${isLightMode ? "border-black/10 bg-zinc-50" : "border-white/10 bg-white/[0.04]"}`}
                    >
                      <div
                        className={`text-xs font-medium ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}
                      >
                        Available for trade
                      </div>
                      {quickViewCard.trade_quantity != null && (
                        <div className="mt-2 text-sm">
                          Trade quantity:{" "}
                          <span className="font-semibold">
                            {quickViewCard.trade_quantity}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  <div
                    className={`mt-3 rounded-2xl border p-3 ${isLightMode ? "border-black/10 bg-white" : "border-white/10 bg-white/[0.03]"}`}
                  >
                    {quickViewCard.type === "trade" &&
                      currentUserId &&
                      currentUserId !== user.id &&
                      (() => {
                        const action = getOfferAction(quickViewCard);
                        return (
                          <button
                            type="button"
                            onClick={() =>
                              void openOfferComposer(quickViewCard)
                            }
                            disabled={!action.enabled}
                            className="mb-3 w-full rounded-xl bg-[#FFD54A] px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-[#ffe073] disabled:cursor-not-allowed disabled:bg-zinc-500/15 disabled:text-zinc-500"
                          >
                            {action.label}
                          </button>
                        );
                      })()}
                    <div className="flex items-center gap-3">
                      <CardImage
                        src={avatar}
                        alt={user?.username}
                        className="h-11 w-11 rounded-xl object-cover"
                      />
                      <div className="min-w-0">
                        <div className="truncate font-semibold">
                          {user?.username}
                        </div>
                        <div
                          className={`text-xs ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}
                        >
                          Listing owner
                        </div>
                      </div>
                    </div>
                    {discordUsername ? (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(
                              discordUsername,
                            );
                            setCopiedDiscord(true);
                            window.setTimeout(
                              () => setCopiedDiscord(false),
                              2500,
                            );
                          } catch {
                            console.error("Could not copy Discord username");
                          }
                        }}
                        className={`mt-3 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium ${isLightMode ? "bg-[#c89d13]/12 text-[#725700] hover:bg-[#c89d13]/20" : "bg-[#FFD54A]/10 text-[#FFE27A] hover:bg-[#FFD54A]/15"}`}
                      >
                        <span>Discord: {discordUsername}</span>
                        <span>{copiedDiscord ? "Copied" : "Copy"}</span>
                      </button>
                    ) : (
                      <div
                        className={`mt-3 text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}
                      >
                        This user has not shared a Discord username.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              aria-label="Close card preview"
              onClick={(event) => event.stopPropagation()}
              className={`relative overflow-hidden rounded-[12px] bg-transparent ${isMoon3DoubleWide(quickViewCard) ? "w-[min(82vw,440px)] aspect-[10/7]" : "h-[min(46dvh,340px)] aspect-[5/7] sm:h-[min(55vh,420px)]"}`}
              style={{ clipPath: "inset(0 round 12px)" }}
            >
              <SafeCardImage
                src={getTradeCardImage(quickViewCard)}
                alt={quickViewCard.card_key}
                className={`${getCardImageClassName(quickViewCard, "absolute")} rounded-[12px]`}
              />
            </button>
          )}
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
            aria-labelledby="profile-offer-title"
            onMouseDown={(event) => event.stopPropagation()}
            className={
              "flex max-h-[70dvh] w-full max-w-[680px] flex-col overflow-hidden rounded-[18px] border shadow-2xl lg:max-w-5xl " +
              (isLightMode
                ? "border-black/10 bg-white text-zinc-900"
                : "border-white/10 bg-[#17191a] text-white")
            }
          >
            <div
              className={
                "flex items-center justify-between gap-3 border-b p-2.5 sm:p-3 " +
                (isLightMode ? "border-black/10" : "border-white/10")
              }
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[#b88a00] dark:text-[#FFE27A]">
                  {offerStep === "sent" ? "Complete" : "Trade offer"}
                </div>
                <h2
                  id="profile-offer-title"
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
                className={
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg " +
                  (isLightMode ? "bg-zinc-100" : "bg-white/[0.07]")
                }
              >
                ×
              </button>
            </div>
            {offerStep === "compose" && (
              <>
                <div className="min-h-0 flex-1 overflow-y-auto p-2.5 sm:p-3 md:overflow-hidden">
                  <div className="grid min-h-0 gap-3 md:grid-cols-[130px_minmax(0,1fr)] lg:grid-cols-[160px_minmax(0,1fr)]">
                    <div className="space-y-2.5">
                      <div
                        className={
                          "rounded-xl border p-2.5 " +
                          (isLightMode
                            ? "border-black/10 bg-zinc-50"
                            : "border-white/[0.08] bg-white/[0.03]")
                        }
                      >
                        <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                          You want
                        </div>
                        <div className="relative mx-auto mt-2 aspect-[5/7] w-full max-w-[112px] overflow-hidden rounded-[6px]">
                          <SafeCardImage
                            src={getTradeCardImage(offerTarget)}
                            alt={offerTarget.card_key}
                            className={getCardImageClassName(
                              offerTarget,
                              "absolute",
                            )}
                          />
                        </div>
                        <div className="mt-1 text-center text-xs text-zinc-500">
                          {getSetName(offerTarget.set_id)}
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
                          className={
                            "w-full rounded-xl border px-3 py-2 text-base outline-none focus:border-[#d5ad24] " +
                            (isLightMode
                              ? "border-black/10 bg-white"
                              : "border-white/10 bg-white/[0.05]")
                          }
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
                            {getSetName(setId)}
                          </button>
                        ))}
                      </div>
                      {offerSetOptions.length > 0 && (
                        <div
                          className={
                            "mt-3 hidden grid-cols-[40px_minmax(0,1fr)_40px] items-center gap-2 rounded-xl border p-1.5 md:grid " +
                            (isLightMode
                              ? "border-black/10 bg-zinc-50"
                              : "border-white/10 bg-white/[0.03]")
                          }
                        >
                          <button
                            type="button"
                            onClick={() => changeOfferSet(-1)}
                            disabled={currentOfferSetIndex === 0}
                            aria-label="Previous set"
                            className={
                              "flex h-9 w-9 items-center justify-center rounded-lg text-xl font-bold disabled:opacity-25 " +
                              (isLightMode
                                ? "bg-white text-zinc-700 shadow-sm"
                                : "bg-white/[0.07] text-zinc-200")
                            }
                          >
                            ‹
                          </button>
                          <div className="min-w-0 text-center">
                            <div className="truncate text-sm font-semibold text-[#b88a00] dark:text-[#FFE27A]">
                              {getSetName(offerSet)}
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
                            className={
                              "flex h-9 w-9 items-center justify-center rounded-lg text-xl font-bold disabled:opacity-25 " +
                              (isLightMode
                                ? "bg-white text-zinc-700 shadow-sm"
                                : "bg-white/[0.07] text-zinc-200")
                            }
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
                          className={
                            "mt-4 rounded-2xl border p-8 text-center text-sm " +
                            (isLightMode
                              ? "border-black/10 bg-zinc-50 text-zinc-500"
                              : "border-white/[0.08] bg-white/[0.03] text-zinc-400")
                          }
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
                                className={
                                  "group relative overflow-hidden rounded-[6px] border-0 bg-transparent p-0 text-left transition disabled:opacity-35 " +
                                  (selected
                                    ? "ring-2 ring-[#FFD54A] ring-offset-1 ring-offset-transparent"
                                    : isLightMode
                                      ? "hover:ring-2 hover:ring-[#c89d13]/40"
                                      : "hover:ring-2 hover:ring-[#FFD54A]/30")
                                }
                              >
                                <span className="relative block aspect-[5/7] overflow-hidden rounded-[6px]">
                                  <SafeCardImage
                                    src={getTradeCardImage(card)}
                                    alt={card.card_key}
                                    className={getCardImageClassName(
                                      card,
                                      "absolute",
                                    )}
                                  />
                                </span>
                                {selected && (
                                  <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FFD54A] text-xs font-black text-zinc-900 shadow-lg">
                                    ✓
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
                      className={
                        "mt-2.5 rounded-xl border p-2 " +
                        (isLightMode
                          ? "border-[#c89d13]/20 bg-[#c89d13]/[0.05]"
                          : "border-[#FFD54A]/15 bg-[#FFD54A]/[0.05]")
                      }
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
                            <SafeCardImage
                              src={getTradeCardImage(card)}
                              alt={card.card_key}
                              className={getCardImageClassName(
                                card,
                                "absolute",
                              )}
                            />
                            <span className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/75 text-xs text-white">
                              ×
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
                  className={
                    "grid grid-cols-2 gap-2 border-t p-2.5 sm:flex sm:justify-end " +
                    (isLightMode ? "border-black/10" : "border-white/10")
                  }
                >
                  <button
                    type="button"
                    onClick={() => setOfferTarget(null)}
                    disabled={isSendingOffer}
                    className={
                      "rounded-xl px-4 py-2 text-sm font-semibold " +
                      (isLightMode
                        ? "bg-zinc-100 text-zinc-700"
                        : "bg-white/[0.07] text-zinc-200")
                    }
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
                      className={
                        "flex flex-col rounded-2xl border p-3 md:min-h-[230px] " +
                        (isLightMode
                          ? "border-black/10 bg-zinc-50"
                          : "border-white/[0.08] bg-white/[0.03]")
                      }
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
                              <SafeCardImage
                                src={getTradeCardImage(card)}
                                alt={card.card_key}
                                className={getCardImageClassName(
                                  card,
                                  "absolute",
                                )}
                              />
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
                      className={
                        "flex flex-col rounded-2xl border p-3 text-center md:min-h-[230px] " +
                        (isLightMode
                          ? "border-black/10 bg-zinc-50"
                          : "border-white/[0.08] bg-white/[0.03]")
                      }
                    >
                      <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        You want
                      </div>
                      <div className="flex flex-1 flex-col items-center justify-center">
                        <div className="relative h-32 aspect-[5/7] overflow-hidden rounded-[6px]">
                          <SafeCardImage
                            src={getTradeCardImage(offerTarget)}
                            alt={offerTarget.card_key}
                            className={getCardImageClassName(
                              offerTarget,
                              "absolute",
                            )}
                          />
                        </div>
                        <div className="mt-2 text-sm font-bold">
                          {getSetName(offerTarget.set_id)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className={
                      "mt-4 rounded-xl border px-3 py-2 text-sm " +
                      (isLightMode
                        ? "border-black/10 bg-white"
                        : "border-white/10 bg-white/[0.04]")
                    }
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
                  className={
                    "grid grid-cols-2 gap-2 border-t p-2.5 sm:flex sm:justify-end " +
                    (isLightMode ? "border-black/10" : "border-white/10")
                  }
                >
                  <button
                    type="button"
                    onClick={() => setOfferStep("compose")}
                    disabled={isSendingOffer}
                    className={
                      "rounded-xl px-4 py-2 text-sm font-semibold " +
                      (isLightMode
                        ? "bg-zinc-100 text-zinc-700"
                        : "bg-white/[0.07] text-zinc-200")
                    }
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
                        <SafeCardImage
                          src={getTradeCardImage(card)}
                          alt={card.card_key}
                          className={getCardImageClassName(card, "absolute")}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div
                  className={
                    "border-t p-2.5 sm:flex sm:justify-end " +
                    (isLightMode ? "border-black/10" : "border-white/10")
                  }
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
    </div>
  );
};
export default ExploreProfile;
