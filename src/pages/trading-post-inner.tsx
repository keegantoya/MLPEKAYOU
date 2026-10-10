import ProfileAvatar from "@/components/ProfileAvatar";
import { cardImagePaths, getMoonFourFront } from "@/lib/card-images";
import CardImage from "@/components/CardImage";
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  Users,
  Layers,
  ChevronRight,
  ChevronDown,
  ShoppingBag,
  Check,
  Handshake,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import { getProfileAssets } from "@/pages/Everypony/profile-assets";
import ExploreProfile from "@/pages/Everypony/explore-profile";
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
  "13",
  "4",
  "5",
  "6",
  "7",
  "8",
  "11",
  "9",
  "SD",
  "FW",
  "12",
  "14",
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
const displayFunCode = (
  setId: string,
  rarity: string,
  number: number
) => {
const rarityCode = rarity;
const cardNumber = String(number).padStart(3, "0");
const setCodeMap: Record<string, string> = {
    "7": "FME01",
    "8": "FME02",
    "11": "FME03",
  };
  if (setId === "7" && rarity === "SN") {
    return `FME01-\u25C7N-${cardNumber}`;
  }
  if (setId === "7" && rarity === "R") {
    if (number <= 6) {
      return `INT01-R-${cardNumber}`;
    }
    if (number <= 15) {
      return `INT01-R-${String(number + 5).padStart(3, "0")}`;
    }
    return `INT02-R-${String(number - 15).padStart(3, "0")}`;
  }
  if (setId === "7" && rarity === "UR") {
    if (number <= 6) {
      return `INT02-UR-${cardNumber}`;
    }
const specialNumbers = [10, 11, 12, 14];
    return `INT02-UR-${String(
      specialNumbers[number - 7]
    ).padStart(3, "0")}`;
  }
  if (setId === "8" && rarity === "SN") {
    return `FME02-\u25C7N-${cardNumber}`;
  }
  if (setId === "8" && rarity === "R") {
    if (number <= 20) {
      return `INT03-R-${cardNumber}`;
    }
    if (number <= 27) {
      return `INT02-R-${String(number - 20).padStart(3, "0")}`;
    }
    return `INT02-R-${String(number - 15).padStart(3, "0")}`;
  }
  if (setId === "8" && rarity === "UR") {
    if (number <= 6) {
      return `INT03-UR-${cardNumber}`;
    }
const specialNumbers = [12, 13, 14, 15];
    return `INT03-UR-${String(
      specialNumbers[number - 7]
    ).padStart(3, "0")}`;
  }
  if (setId === "11" && rarity === "N") {
    return `FME03-N-${cardNumber}`;
  }
  if (setId === "11" && rarity === "SN") {
    return `FME03-\u25C7N-${cardNumber}`;
  }
  if (setId === "11" && rarity === "R") {
    if (number <= 15) {
      return `MLPME02-R-${cardNumber}`;
    }
    return `MLPME03-R-${String(number - 15).padStart(3, "0")}`;
  }
  if (setId === "11" && rarity === "SR") {
    return `MLPME03-SR-${cardNumber}`;
  }
  if (setId === "11" && rarity === "SSR") {
    return `FME03-SSR-${cardNumber}`;
  }
  if (setId === "11" && rarity === "UR") {
    return `RBE02-UR-${cardNumber}`;
  }
  if (setId === "11" && rarity === "UGR") {
    return `FME03-UGR-${cardNumber}`;
  }
  if (setId === "11" && rarity === "CR") {
    return `FME03-CR-${cardNumber}`;
  }
  if (setId === "11" && rarity === "SCR") {
    return `FME03-\u25C7CR-${cardNumber}`;
  }
const baseCode = setCodeMap[setId] || "";
  return `${baseCode}-${rarity === "SCR" ? "\u25C7CR" : rarityCode}-${cardNumber}`;
};

const displayRainbowCode = (
  setId: string,
  rarity: string,
  number: number
) => {
const rarityCode = rarity;
const cardNumber = String(number).padStart(3, "0");
  if (setId === "5" && rarity === "R") {
    if (number <= 20) {
      return `INT01-R-${cardNumber}`;
    }
    return `RBE01-R-${String(number - 20).padStart(3, "0")}`;
  }
  if (setId === "5" && rarity === "SR") {
const actualNumber =
      number <= 7
        ? number
        : [13, 14, 15, 16, 17, 18, 19, 20][number - 8];
    return `INT01-SR-${String(actualNumber).padStart(3, "0")}`;
  }
  if (setId === "5" && rarity === "SSR") {
    if (number <= 6) {
      return `INT01-SSR-${String(number + 6).padStart(3, "0")}`;
    }
    if (number <= 9) {
const specialNumbers = [16, 17, 20];
      return `INT01-SSR-${String(
        specialNumbers[number - 7]
      ).padStart(3, "0")}`;
    }
    return `RBE01-SSR-${String(number - 9).padStart(3, "0")}`;
  }
  if (setId === "6" && rarity === "R") {
    if (number <= 15) {
      return `MLPME02-R-${String(number).padStart(3, "0")}`;
    }
    return `MLPME03-R-${String(number - 15).padStart(3, "0")}`;
  }
  if (setId === "6" && rarity === "SR") {
const actualNumbers = [
      1, 3, 5, 7, 9, 11, 13,
      14, 15, 16, 17, 18, 19, 20,
    ];
    return `MLPME03-SR-${String(
      actualNumbers[number - 1]
    ).padStart(3, "0")}`;
  }
  if (setId === "6" && rarity === "SSR") {
    if (number <= 6) {
      return `MLPME03-SSR-${cardNumber}`;
    }
    if (number <= 14) {
      return `MLPME03-SSR-${String(number + 6).padStart(3, "0")}`;
    }
    return `RBE02-SSR-001`;
  }
const setCodeMap: Record<string, string> = {
    "5": "RBE01",
    "6": "RBE02",
  };
const baseCode = setCodeMap[setId] || "";
  return `${baseCode}-${rarityCode}-${cardNumber}`;
};

const getListingDisplayCode = (card: { set_id: string; card_key: string }) => {
  const setId = String(card.set_id);
  const key = card.card_key.replace(/^(?:BONUS|STARTER|STARTERS)-/, "");
  if (/^(?:MLPME|MLPSE|MLPEPR|FME|INT|RBE)\d/i.test(key)) return key;
  if (["SD", "friendshipsbegin", "FW", "12", "14"].includes(setId)) {
    const match = key.match(/^(P?)(BP\d{2}|SD\d{2})-?(P?)([A-Z]+)(\d{2})(.*)$/i);
    if (!match) return key;
    const [, before, prefix, after, rawRarity, number, suffix] = match;
    const parallel = Boolean(before || after || rawRarity === "PER");
    const rarity = rawRarity === "PER" ? "ER" : rawRarity;
    let displayNumber = number;
    if (parallel && prefix === "BP01" && rarity === "ER") {
      displayNumber = ["01", "02", "02", "02", "03", "03", "04", "04", "05", "05", "06", "06"][Number(number) - 1] || number;
    }
    if (parallel && prefix === "SD01" && rarity === "ER") displayNumber = String(Math.ceil((Number(number) - 6) / 2) + 6).padStart(2, "0");
    return `${parallel ? "\u203B" : ""}${prefix}-${rarity}${displayNumber}${suffix}`;
  }
  if (setId === "tcgpromos") return key;
  const match = key.match(/^(.+?)-(\d+)$/);
  if (!match) return key;
  const [, rarity, rawNumber] = match;
  const number = Number(rawNumber);
  const padded = String(number).padStart(3, "0");
  if (["7", "8", "11"].includes(setId)) return displayFunCode(setId, rarity, number);
  if (["5", "6"].includes(setId)) return displayRainbowCode(setId, rarity, number);
  if (setId === "9") return `MLPEPR${padded}`;
  if (setId === "4") return `MLPSE01-${rarity === "SAR" ? "\u25C7AR" : rarity}-${padded}`;
  if (["1", "2", "3", "13"].includes(setId)) {
    if (setId === "2" && rarity === "HR") return `INT03-HR-${padded}`;
    const edition = ({ "1": "01", "2": "02", "3": "03", "13": "04" } as Record<string, string>)[setId];
    const displayRarity = ["SHINING ZR", "SZR"].includes(rarity) ? "\u25C7ZR" : rarity;
    return `MLPME${edition}-${displayRarity}-${padded}`;
  }
  return key;
};

const COLLECTION_SET_TOTALS: Record<string, number> = {
  "1": 186, "2": 189, "3": 290, "13": 162, "4": 105,
  "5": 146, "6": 170, "7": 127, "8": 136, "11": 148,
  "9": 13, SD: 68, friendshipsbegin: 68, FW: 191,
  "12": 191, "14": 190, tcgpromos: 28,
};
const normalizeCollectionKey = (key: string) => key
  .toUpperCase()
  .replace(/^(?:BONUS|STARTER|STARTERS)-/, "")
  .replace(/^P(BP\d+)-/, "$1P")
  .replace(/SHINING[ -]*ZR|\u25C7[ -]*ZR|\u2B26[ -]*ZR/g, "SZR")
  .replace(/[^A-Z0-9]/g, "")
  .replace(/\d+/g, (number) => String(Number(number)));
const isOwnedProgress = (value: unknown) => value === true || Boolean(value && typeof value === "object" && (value as { owned?: boolean }).owned === true);
const randomHeroCards = (cards: TradeCard[]) => {
  const unique = [...new Map(cards.filter((card) => Boolean(getCardImage(card))).map((card) => [normalizeCollectionKey(card.card_key), card])).values()];
  for (let index = unique.length - 1; index > 0; index--) {
    const swap = Math.floor(Math.random() * (index + 1));
    [unique[index], unique[swap]] = [unique[swap], unique[index]];
  }
  return unique.slice(0, 3);
};
const offerKeyFor = (recipientId: string, setId: string, cardKey: string) =>
  [recipientId, setId, cardKey].join("-");
const inventoryRarity = (cardKey: string) => {
  const key = cardKey.toUpperCase().replace(/\u203B/g, "");
  const nightmareParallel = key.match(/^PBP03-(ER|SPR|GR|CR|RR)\d{2}(?:-[ABC]2?)?$/);
  if (nightmareParallel) return `P${nightmareParallel[1]}`;
  const prefixed = key.match(
    /(?:BP|SD)\d{2}-?(BASE|PER|PSPR|PGR|PCR|PRR|SPR|SSR|SCR|SAR|SGR|UGR|USR|TGR|MTR|LSR|SZR|ZR|XR|HR|FR|TR|ST|SR|UR|GR|CR|ER|RR|SC|BP|AR|OR|PR|R|U|C|N|SN)/,
  );
  if (prefixed) return prefixed[1];
  return key.split("-")[0].replace(/\d+$/g, "") || "Other";
};
const rarityMap: Record<string, string[]> = {
  "1": ["R", "SR", "SSR", "HR", "UR", "LSR", "SGR", "SC"],
  "2": ["R", "SR", "SSR", "HR", "UR", "LSR", "SGR", "ZR", "SC", "SHINING ZR"],
  "3": ["R", "SR", "SSR", "HR", "UR", "LSR", "SGR", "ZR", "SC", "SZR"],
  "13": ["R", "SR", "SSR", "HR", "UR", "LSR", "SGR", "ZR", "SC", "SZR"],
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
const CCG_PROMO_ORDER = [1, 2, 3, 4, 5, 7, 14, 8, 9, 10, 11, 12, 13].map((number) => `PR-${number}`);
const comparePromoCards = (a: { card_key: string }, b: { card_key: string }) => {
  const indexA = CCG_PROMO_ORDER.indexOf(a.card_key);
  const indexB = CCG_PROMO_ORDER.indexOf(b.card_key);
  return (indexA < 0 ? CCG_PROMO_ORDER.length : indexA) - (indexB < 0 ? CCG_PROMO_ORDER.length : indexB);
};
const getCardImage = (card: TradeCard) => {
  if (String(card.set_id) === "13") return getMoonFourFront(card.card_key);
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
  if (offerSetId === "13") return `${base} scale-[1.045] object-contain object-center`;
  if (standardOfferZoomSets.has(offerSetId)) {
    return `${base} scale-[1.06] object-contain object-center`;
  }
  const cardNumber = getOfferCardNumber(card.card_key);
  if (offerSetId === "9") {
    if (cardNumber === 1) {
      return `${base} scale-[1.02] object-contain object-center`;
    }
    if (cardNumber === 7) {
      return `${base} scale-[1.06] object-contain object-center`;
    }
    if (cardNumber !== null && [2, 3, 4, 5].includes(cardNumber)) {
      return `${base} scale-[1.06] object-contain object-center`;
    }
    return `${base} scale-[1.09] object-contain object-center`;
  }
  if (offerSetId === "tcgpromos") {
    if (cardNumber === 11) {
      return `${base} translate-y-[2px] scale-[1.03] object-cover object-center`;
    }
    if (cardNumber === 10) {
      return `${base} scale-[1.03] object-cover object-center`;
    }
    if (cardNumber === 9) {
      return `${base} -translate-y-px scale-[1.02] object-cover object-center`;
    }
    if (cardNumber === 12) {
      return `${base} -translate-y-[2px] object-cover object-center`;
    }
    return `${base} scale-[1.02] object-contain object-center`;
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
    <CardImage imageSize={imageSize ?? (((String(card.set_id) === "9" && card.card_key === "PR-14") || (String(card.set_id) === "tcgpromos" && card.card_key === "RR28")) ? "original" : undefined)}
      src={src}
      alt={getListingDisplayCode(card)}
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
            : { transform: ["SD", "friendshipsbegin", "FW", "12", "14"].includes(String(card.set_id)) ? undefined : "scale(1.045)" }
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
      imageSize={imageSize}
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
  const [search, setSearch] = useState("");
  const [listingType, setListingType] = useState<"iso" | "all" | "trade" | "sale">("iso");
  const [sortBy, setSortBy] = useState("cards");
  const [loadStage, setLoadStage] = useState(0);
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
  const [strikeCounts, setStrikeCounts] = useState<Record<string, number>>({});
  const [sortOpen, setSortOpen] = useState(false);
  const marketRef = useRef<HTMLDivElement>(null);
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
    if (!selectedCard && !reportTarget && !showUnsetPriceNotice && !offerTarget && !openProfile)
      return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedCard, reportTarget, showUnsetPriceNotice, offerTarget, openProfile]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || isSendingOffer || isReporting || isReportingCard) return;
      if (confirmReport) { setConfirmReport(null); return; }
      if (showUnsetPriceNotice) { setShowUnsetPriceNotice(false); return; }
      if (reportTarget) { setReportTarget(null); return; }
      if (offerTarget) { setOfferTarget(null); return; }
      if (selectedCard) { setSelectedCard(null); return; }
      setOpenProfile(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [confirmReport, showUnsetPriceNotice, reportTarget, offerTarget, selectedCard, isSendingOffer, isReporting, isReportingCard]);
  const USERS_PER_PAGE = 10;
  const setNames: Record<string, string> = {
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
    tcgpromos: "TCG Promos",
  };
  const getOfferSetName = (offerSetId: string) => {
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
      "9": "CCG Promos",
      SD: "Friendships Begin",
      FW: "Fantasy Wonderland",
      "12": "Discord",
      "14": "Nightmare Night",
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
        .filter((card) => card.is_for_trade || card.is_for_sale)
        .map((card) => ({
          ...card,
          id: `${card.user_id}-${card.set_id}-${card.card_key}`,
        }));
      const { data: sessionData } = await supabase.auth.getSession();
      if (!isCurrent()) return;
      const sessionUserId = sessionData.session?.user.id;
      let heroCandidates: TradeCard[] = uniqueTrades.map((card) => ({ ...card, id: `${card.user_id}-${card.set_id}-${card.card_key}` }));
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
              .select("id, username, avatar_url, vacation_mode")
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
  }, [setId, reload]);
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
        (a.set_id === "9" ? comparePromoCards(a, b) : a.card_key.localeCompare(b.card_key, undefined, { numeric: true })),
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
  const collectionOwned = Math.min(collectionTotal, ownedCardKeys.size);
  const collectionMissing = Math.max(0, collectionTotal - collectionOwned);
  const collectionPercent = collectionTotal ? Math.round(collectionOwned / collectionTotal * 100) : 0;
  const availableMissingCards = new Set(allListings
    .filter((card) => card.user_id !== currentUserId && (card.is_for_trade || card.is_for_sale) && !ownedCardKeys.has(normalizeCollectionKey(card.card_key)))
    .map((card) => normalizeCollectionKey(card.card_key))).size;
  const visibleListingCount = visibleUsers.reduce((count, [, cards]) => count + filterCardsForRarity(cards).length, 0);
  const resetFilters = () => { setSearch(""); setSelectedRarity(null); setListingType("iso"); setPage(0); };
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
    if (rarity === "SHINING ZR") return "\u25C7 ZR";
    if (rarity === "SZR") return "\u25C7ZR";
    if (rarity === "SAR") return "\u25C7AR";
    if (["7", "8", "11"].includes(offerSetId) && rarity === "SN") return "\u25C7N";
    if (["7", "8", "11"].includes(offerSetId) && rarity === "SCR") return "\u25C7CR";
    const parallelLabels: Record<string, string> = {
      PER: "\u203BER",
      PSPR: "\u203BSPR",
      PGR: "\u203BGR",
      PCR: "\u203BCR",
      PRR: "\u203BRR",
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
      if (offerSet === "9") return comparePromoCards(a, b);
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
      ref={marketRef}
      className={`tp-market ${isLightMode ? "tp-light" : ""} font-['Oxanium'] transition-colors ${
        isLightMode ? "text-zinc-900" : "text-white"
      }`}
    >
      <style>{`
        .tp-market{--tp-panel:#171b23;--tp-soft:#202631;--tp-line:#ffffff12;--tp-muted:#a0a9b8;--tp-accent:#ffd54a;--tp-ink:#f7f8fc;background:hsl(var(--background))!important;color:var(--tp-ink)!important;overflow-x:clip;display:flex;flex-direction:column;box-sizing:border-box;min-height:calc(100vh - var(--tp-page-top,0px));min-height:calc(100dvh - var(--tp-page-top,0px));padding-bottom:0}
        .tp-market.tp-light{--tp-panel:#fff;--tp-soft:#f3f4f7;--tp-line:#18223814;--tp-muted:#606b7d;--tp-accent:#b18100;--tp-ink:#202635;background:hsl(var(--background))!important}
        .tp-main{display:flex;flex-direction:column;flex:1;box-sizing:border-box;width:100%;max-width:none;margin:0;padding:18px clamp(16px,3vw,64px) max(12px,env(safe-area-inset-bottom,0px))}
        .tp-market button,.tp-market input,.tp-market select{font:inherit}
        .tp-market button{cursor:pointer}.tp-market button:disabled{cursor:default;opacity:.45}.tp-market button:focus-visible,.tp-market input:focus-visible,.tp-market select:focus-visible{outline:3px solid var(--tp-accent);outline-offset:3px}
        .tp-back{align-self:flex-start;flex-shrink:0;display:inline-flex;align-items:center;gap:8px;font-size:13px!important;color:var(--tp-muted);margin-bottom:10px}
        .tp-hero{flex-shrink:0;display:grid;grid-template-columns:minmax(0,1fr) minmax(210px,.6fr) auto minmax(240px,.75fr);gap:24px;align-items:center;padding:0 0 14px;margin-bottom:16px;border-bottom:1px solid var(--tp-line)}.tp-hero>.tp-toolbar{display:grid;grid-template-columns:minmax(0,1fr);gap:8px;margin:0;min-width:0}.tp-hero>.tp-toolbar .tp-search{width:100%}.tp-hero>.tp-toolbar .tp-sort{width:100%;max-width:none;height:36px}.tp-hero>.tp-toolbar .tp-search input{height:44px}
        .tp-kicker{color:var(--tp-muted);font-size:12px;font-weight:600}.tp-hero h1{font-size:clamp(24px,1.9vw,32px);font-weight:700;line-height:1.2;margin:0 0 7px;letter-spacing:-.8px;max-width:900px}.tp-hero p{font-size:12px;color:var(--tp-muted);line-height:1.6;max-width:620px}.tp-hero-copy{min-width:0}
        .tp-hero-art{display:flex;gap:12px;align-items:center;justify-content:flex-end;padding:8px 8px;min-width:0}.tp-art-card{--tp-tilt:0deg;position:relative;flex:0 1 auto;min-width:0;width:96px;aspect-ratio:5/7;border-radius:7px;overflow:hidden;box-shadow:0 6px 14px #0002;animation:tp-drift 8s ease-in-out infinite;background:var(--tp-soft);transform:rotate(var(--tp-tilt))}.tp-art-card:first-child{--tp-tilt:-3deg;animation-delay:-2s}.tp-art-card:last-child{--tp-tilt:3deg;animation-delay:-5s}.tp-art-card:nth-child(2){width:104px;animation-delay:-1s}.tp-art-card.tp-art-double{aspect-ratio:10/7;width:136px}.tp-hero-loading{color:var(--tp-muted);font-size:12px}.tp-hero-art:has(.tp-art-card:only-child) .tp-art-card{--tp-tilt:0deg}
        .tp-stats{display:flex;flex-wrap:wrap;gap:22px;padding:10px 0 0;margin:0}.tp-stat{display:flex;align-items:baseline;gap:8px}.tp-stat>svg{display:none}.tp-stat>div{display:flex;align-items:baseline;gap:7px}.tp-stat strong{font-size:16px;font-weight:700}.tp-stat span{font-size:12px;color:var(--tp-muted)}
        .tp-workspace{flex:1;display:grid;grid-template-columns:240px minmax(0,1fr);align-items:stretch;gap:24px}.tp-filters{align-self:start;position:sticky;top:90px;background:var(--tp-panel);border:1px solid var(--tp-line);border-radius:22px;padding:20px}.tp-filter-title{display:flex;justify-content:space-between;align-items:center;font-size:14px;font-weight:800;margin-bottom:22px}.tp-reset{font-size:12px!important;color:var(--tp-accent)}.tp-label{display:block;font-size:10px;font-weight:800;letter-spacing:1.5px;color:var(--tp-muted);text-transform:uppercase;margin:22px 0 10px}.tp-type{display:flex;flex-direction:column;gap:6px}.tp-type button{display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:11px;font-size:13px;text-align:left;background:var(--tp-soft);border:1px solid transparent;transition:background .2s,transform .2s}.tp-type button[aria-pressed=true],.tp-rarities button[aria-pressed=true]{background:#ffd54a;color:#29230e;border-color:#ffd54a}.tp-type button:hover{transform:translateX(3px)}.tp-rarities{display:flex;flex-wrap:wrap;gap:6px}.tp-rarities button{border:1px solid var(--tp-line);background:var(--tp-soft);padding:8px 10px;border-radius:9px;font-size:12px;transition:transform .2s,background .2s}.tp-rarities button:hover{transform:translateY(-2px)}.tp-guide{border-top:1px solid var(--tp-line);margin-top:24px;padding-top:18px;color:var(--tp-muted);font-size:12px;line-height:1.7}.tp-guide strong{display:block;color:var(--tp-ink);margin-bottom:6px}
        .tp-results{display:flex;flex-direction:column;min-width:0}.tp-results-head{flex-shrink:0}.tp-results>.tp-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center}.tp-results>.tp-loading{flex:1}.tp-results>.tp-pagination{margin-top:auto}.tp-empty>button{flex-shrink:0}.tp-toolbar{display:flex;align-items:center;gap:12px;margin-bottom:18px}.tp-search{display:flex;align-items:center;gap:10px;background:var(--tp-panel);border:1px solid var(--tp-line);border-radius:14px;padding:0 14px;flex:1;min-width:0;color:var(--tp-muted)}.tp-search input{height:48px;background:transparent;border:0;min-width:0;width:100%;font-size:16px;color:var(--tp-ink);outline:none}.tp-search button{display:grid;place-items:center}.tp-sort{background:var(--tp-panel);border:1px solid var(--tp-line);border-radius:14px;height:48px;padding:0 12px;font-size:13px!important;color:var(--tp-ink);max-width:180px}.tp-results-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:16px}.tp-results-head h2{font-size:18px;font-weight:800}.tp-results-head p{font-size:12px;color:var(--tp-muted);margin-top:3px}.tp-result-badge{background:#ffd54a15;color:var(--tp-accent);border:1px solid #d9b33c30;padding:7px 11px;border-radius:30px;font-size:12px;white-space:nowrap}
        .tp-collector{background:var(--tp-panel);border:1px solid var(--tp-line);border-radius:22px;overflow:hidden;margin-bottom:18px;animation:tp-enter .4s both}.tp-collector-head{display:flex;flex-wrap:wrap;align-items:center;gap:12px;padding:18px 20px;border-bottom:1px solid var(--tp-line);background:linear-gradient(90deg,#ffd54a06,transparent)}.tp-identity{flex:1;min-width:120px}.tp-name{font-size:16px!important;font-weight:800;display:flex;align-items:center;gap:7px;text-align:left}.tp-name:hover{color:var(--tp-accent)}.tp-identity p{color:var(--tp-muted);font-size:12px;margin-top:4px;overflow-wrap:anywhere}.tp-profile-btn{display:flex;align-items:center;gap:6px;border:1px solid var(--tp-line);background:var(--tp-soft);border-radius:11px;padding:9px 12px;font-size:12px!important;font-weight:700;transition:background .2s}.tp-profile-btn:hover{background:#ffd54a;color:#29230e}.tp-report-btn{display:grid;place-items:center;padding:8px;border-radius:9px;color:var(--tp-muted)}.tp-report-btn:hover{background:#f0525220;color:#ef7070}.tp-collector-summary{display:flex;gap:12px;font-size:11px;color:var(--tp-muted);padding:12px 20px 0}.tp-card-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(128px,1fr));gap:14px;padding:16px 20px 20px;grid-auto-flow:dense}.tp-card{min-width:0;transition:transform .25s}.tp-card:hover{transform:translateY(-5px)}.tp-card-image{display:block;width:100%;position:relative;aspect-ratio:5/7;border-radius:14px;overflow:hidden;background:var(--tp-soft);box-shadow:0 5px 12px #0002}.tp-card-double{grid-column:span 2}.tp-card-double .tp-card-image{aspect-ratio:10/7}.tp-card-image:after{content:"";position:absolute;inset:0;background:linear-gradient(115deg,transparent 35%,#ffffff22 50%,transparent 65%);transform:translateX(-110%);transition:transform .65s;pointer-events:none}.tp-card:hover .tp-card-image:after{transform:translateX(110%)}.tp-card-tags{position:absolute;left:6px;top:6px;display:flex;gap:4px}.tp-card-tags span{display:grid;place-items:center;width:24px;height:24px;border-radius:7px;background:#131720e6;color:#ffd54a;box-shadow:0 2px 6px #0003}.tp-card-info{display:flex;flex-direction:column;gap:4px;padding-top:9px}.tp-card-info strong{font-size:12px;overflow-wrap:anywhere}.tp-card-info span{font-size:11px;color:var(--tp-muted)}.tp-price{color:var(--tp-accent)!important;font-weight:800}.tp-pagination{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px;background:var(--tp-panel);border:1px solid var(--tp-line);border-radius:16px;font-size:12px}.tp-pagination button{padding:9px 13px;border-radius:10px;background:var(--tp-soft)}
        .tp-loading{min-width:0;padding:28px;border:1px solid var(--tp-line);border-radius:22px;background:var(--tp-panel)}.tp-loading-head{display:flex;align-items:center;gap:18px;min-width:0;margin-bottom:22px}.tp-loading-bars{display:flex;align-items:center;gap:4px;flex-shrink:0;height:20px;margin-left:auto;color:var(--tp-accent)}.tp-loading-bars i{display:block;width:3px;height:16px;border-radius:1px;background:currentColor;transform:scaleY(.45);animation:tp-bars 1.2s ease-in-out infinite}.tp-loading-bars i:nth-child(2){animation-delay:.15s}.tp-loading-bars i:nth-child(3){animation-delay:.3s}.tp-loading h3{font-size:17px;font-weight:800}.tp-loading p,.tp-inventory-loading p{font-size:12px;color:var(--tp-muted);margin-top:5px;line-height:1.6}.tp-load-steps{display:flex;gap:10px;flex-wrap:wrap;margin:20px 0;font-size:11px;color:var(--tp-muted)}.tp-load-steps span{padding:7px 0;margin-right:14px}.tp-load-steps .tp-step-active{color:var(--tp-accent)}.tp-load-track{height:3px;border-radius:9px;background:var(--tp-soft);overflow:hidden;margin:18px 0}.tp-load-track span{display:block;width:35%;height:100%;background:linear-gradient(90deg,transparent,#ffd54a,transparent);animation:tp-scan 1.8s ease-in-out infinite}.tp-skeleton{position:relative;background:var(--tp-soft);border-radius:12px;overflow:hidden}.tp-skeleton:after{content:"";position:absolute;inset:0;background:linear-gradient(110deg,transparent,#c1c4d518,transparent);transform:translateX(-100%);animation:tp-shimmer 1.6s infinite}.tp-skeleton-grid{display:grid;min-width:0;width:100%;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px}.tp-skeleton-grid>div{height:clamp(90px,10vw,150px);min-width:0;aspect-ratio:auto}.tp-loading-head>div:first-child{min-width:0;flex:1}.tp-load-steps span{min-width:0;overflow-wrap:anywhere}.tp-empty{text-align:center;padding:28px 20px;background:var(--tp-panel);border:1px solid var(--tp-line);border-radius:22px}.tp-empty>svg{margin:0 auto 10px;color:var(--tp-accent)}.tp-empty h3{font-size:17px;font-weight:800}.tp-empty p{color:var(--tp-muted);font-size:13px;margin:8px auto 16px;max-width:520px}.tp-empty button{background:#ffd54a;color:#29230e;padding:11px 18px;border-radius:11px;font-size:13px;font-weight:700}
        .tp-profile-overlay{position:fixed;inset:0;z-index:115;display:flex;align-items:flex-start;justify-content:center;padding:calc(112px + env(safe-area-inset-top,0px)) 20px 24px;background:#0009;backdrop-filter:blur(8px)}.tp-profile-dialog{width:min(1100px,100%);max-height:min(68dvh,calc(100dvh - 148px - env(safe-area-inset-top,0px)));background:var(--tp-panel);border:1px solid var(--tp-line);border-radius:22px;overflow:auto;box-shadow:0 24px 80px #0006;animation:tp-enter .25s both}.tp-profile-dialog>header{position:sticky;top:0;z-index:5;display:flex;justify-content:space-between;align-items:center;padding:15px 20px;background:var(--tp-panel);border-bottom:1px solid var(--tp-line)}.tp-profile-body{padding:16px}.tp-inventory-loading{display:flex;align-items:center;flex-direction:column;padding:40px 20px;text-align:center;gap:12px}.tp-inventory-loading .tp-load-track{width:220px;max-width:100%}.tp-market [role=dialog]{animation:tp-enter .25s both}.tp-market input,.tp-market textarea{font-size:16px!important}
        @keyframes tp-enter{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}@keyframes tp-drift{0%,100%{transform:translateY(0) rotate(var(--tp-tilt))}50%{transform:translateY(-4px) rotate(var(--tp-tilt))}}@keyframes tp-bars{0%,100%{transform:scaleY(.45);opacity:.45}50%{transform:scaleY(1);opacity:1}}@keyframes tp-scan{from{transform:translateX(-110%)}to{transform:translateX(390%)}}@keyframes tp-shimmer{to{transform:translateX(100%)}}
        .tp-sort-wrap{position:relative;min-width:0}.tp-market .tp-sort{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;border-radius:14px!important;appearance:none}.tp-sort-menu{position:absolute;top:calc(100% + 6px);left:0;right:0;z-index:40;overflow:hidden;padding:6px;border:1px solid var(--tp-line);border-radius:14px;background:var(--tp-panel);box-shadow:0 12px 24px #0004}.tp-sort-menu button{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;padding:10px;border-radius:10px;font-size:12px;text-align:left}.tp-sort-menu button:hover,.tp-sort-menu button[aria-pressed=true]{background:var(--tp-soft)}.tp-name-row{display:flex;flex-wrap:wrap;align-items:center;gap:8px}.tp-strikes{display:inline-flex;align-items:center;border-radius:999px;background:var(--tp-soft);padding:4px 8px;font-size:10px;color:var(--tp-muted);white-space:nowrap}.tp-strikes-warning{color:var(--tp-accent);background:#ffd54a15}.tp-market input{border-radius:10px}.tp-loading-bars i{border-radius:999px}.tp-market .tp-back,.tp-market .tp-name,.tp-market .tp-reset{border-radius:10px}.tp-profile-dialog>header{border-radius:22px 22px 0 0}.tp-profile-dialog .rounded-none{border-radius:12px!important}
        .tp-collection{min-width:0;border:1px solid var(--tp-line);border-radius:16px;padding:14px 16px;background:var(--tp-panel)}.tp-collection-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:12px;color:var(--tp-muted)}.tp-collection-heading strong{color:var(--tp-accent);font-size:14px}.tp-collection-owned{margin-top:9px;font-size:12px;color:var(--tp-muted)}.tp-collection-owned strong{font-size:22px;line-height:1;color:var(--tp-ink)}.tp-collection-track{height:6px;border-radius:999px;background:var(--tp-soft);overflow:hidden;margin:12px 0}.tp-collection-track span{display:block;height:100%;border-radius:inherit;background:#ffd54a;transition:width .5s ease}.tp-collection-details{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;font-size:11px;color:var(--tp-muted)}.tp-collection-details button{display:inline-flex;align-items:center;gap:3px;border-radius:8px;color:var(--tp-accent)}.tp-collection-error{margin-top:12px;font-size:12px;color:var(--tp-muted)}
        @media(min-width:1201px) and (max-width:1600px){.tp-hero{grid-template-columns:minmax(0,1fr) minmax(210px,.7fr) auto;gap:14px 22px}.tp-hero>.tp-toolbar{grid-column:1/-1;grid-template-columns:minmax(0,1fr) 220px;align-items:center}.tp-hero>.tp-toolbar .tp-sort{height:44px}}
        @media(min-width:1800px){.tp-card-grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}}
        @media(max-width:1200px){.tp-hero{grid-template-columns:minmax(0,1fr) auto;gap:14px 24px}.tp-collection{grid-column:1;grid-row:2}.tp-hero>.tp-toolbar{grid-column:2;grid-row:2;grid-template-columns:minmax(0,1fr);align-items:center}.tp-hero>.tp-toolbar .tp-sort{height:44px}}
        @media(max-width:1000px){.tp-workspace{grid-template-columns:200px minmax(0,1fr);gap:16px}.tp-filters{padding:16px}.tp-hero{gap:18px}.tp-hero-art{gap:10px}.tp-art-card{width:86px}.tp-art-card:nth-child(2){width:94px}.tp-card-grid{grid-template-columns:repeat(auto-fill,minmax(110px,1fr))}}
        @media(max-width:700px){.tp-main{padding:16px 12px max(12px,env(safe-area-inset-bottom,0px))}.tp-back{margin-bottom:12px}.tp-hero{grid-template-columns:1fr;padding:0 0 12px;gap:10px;margin-bottom:14px}.tp-collection{grid-column:auto;grid-row:auto}.tp-hero>.tp-toolbar{grid-column:auto;grid-row:auto;grid-template-columns:minmax(0,1fr)}.tp-hero>.tp-toolbar .tp-sort{height:36px}.tp-hero h1{font-size:25px;letter-spacing:-.5px}.tp-hero-art{justify-content:center;gap:12px;padding:8px 4px}.tp-art-card{width:84px;border-radius:6px}.tp-art-card:nth-child(2){width:92px}.tp-art-card.tp-art-double{width:116px}.tp-stats{gap:14px;padding:8px 0 0;margin:0}.tp-stat strong{font-size:17px}.tp-stat span{font-size:11px}.tp-workspace{grid-template-columns:1fr;grid-template-rows:auto minmax(0,1fr);gap:16px}.tp-filters{position:static;padding:14px;border-radius:18px}.tp-filter-title{margin-bottom:10px}.tp-label{margin:14px 0 8px}.tp-type{flex-direction:row;flex-wrap:wrap}.tp-type button{flex:1 1 calc(50% - 6px);justify-content:center;padding:9px 7px;font-size:11px}.tp-type button:hover{transform:none}.tp-guide{display:none}.tp-rarities{gap:5px}.tp-rarities button{padding:7px 9px;font-size:11px}.tp-toolbar{flex-wrap:wrap;gap:8px}.tp-search{flex-basis:100%}.tp-sort{max-width:none;width:100%;height:40px}.tp-collector-head{padding:14px 12px;gap:9px}.tp-name{font-size:14px!important}.tp-profile-btn{padding:8px;font-size:11px!important}.tp-collector-summary{padding:12px 12px 0}.tp-card-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;padding:12px}.tp-card-info strong{font-size:10px}.tp-card-info span{font-size:10px}.tp-loading{padding:20px 14px}.tp-skeleton-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.tp-profile-overlay{padding:calc(104px + env(safe-area-inset-top,0px)) 10px 18px}.tp-profile-dialog{max-height:min(70dvh,calc(100dvh - 132px - env(safe-area-inset-top,0px)))}.tp-profile-body{padding:8px}.tp-results-head h2{font-size:16px}.tp-result-badge{font-size:10px}}
        @media(prefers-reduced-motion:reduce){.tp-market *,.tp-market *:before,.tp-market *:after{animation:none!important;transition:none!important;scroll-behavior:auto!important}.tp-card:hover{transform:none}}
      `}</style>
      <main className="tp-main">
        <button className="tp-back" type="button" onClick={() => navigate("/trading-post")}><ArrowLeft size={16} /> All Trading Post sets</button>
        <section className="tp-hero">
          <div className="tp-hero-copy">
                        <h1>{setNames[setId || ""] || getOfferSetName(setId || "")}</h1>
            <p>Find cards for trade or sale. Your ISO shows what you need.</p>
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
              <div className="tp-collection-track" role="progressbar" aria-label="Set completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={loading ? undefined : collectionPercent} aria-valuetext={loading ? "Loading collection progress" : `${collectionOwned} of ${collectionTotal} cards owned`}><span style={{ width: loading ? "0%" : `${collectionPercent}%` }} /></div>
              <div className="tp-collection-details"><span>{loading ? "--" : collectionMissing} missing</span><button type="button" disabled={loading} onClick={resetFilters}>{loading ? "--" : availableMissingCards} available <ChevronRight size={12} /></button></div>
            </>}
          </section>
          <div className="tp-hero-art" aria-hidden="true">{heroCards.map((card) => <div key={card.card_key} className={`tp-art-card ${card.set_id === "3" && /^SZR-0*1$/.test(card.card_key) ? "tp-art-double" : ""}`}><ListingCardImage card={card} /></div>)}{heroCards.length === 0 && loading && <div className="tp-hero-loading">Finding cards from this set...</div>}</div>
            <div className="tp-toolbar">
              <label className="tp-search"><Search size={19} /><input aria-label="Search collectors or Discord usernames" placeholder="Search collectors..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} />{search && <button type="button" aria-label="Clear search" onClick={() => { setSearch(""); setPage(0); }}><X size={16} /></button>}</label>
              <div className="tp-sort-wrap" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setSortOpen(false); }}><button type="button" className="tp-sort" aria-label="Sort collectors" aria-expanded={sortOpen} aria-controls="tp-sort-options" onClick={() => setSortOpen((value) => !value)}>{sortBy === "cards" ? "Most matching cards" : "Collector name A-Z"}<ChevronDown size={16} /></button>{sortOpen && <div className="tp-sort-menu" id="tp-sort-options">{[{ value: "cards", label: "Most matching cards" }, { value: "name", label: "Collector name A-Z" }].map((option) => <button type="button" key={option.value} aria-pressed={sortBy === option.value} onClick={() => { setSortBy(option.value); setPage(0); setSortOpen(false); }}>{option.label}{sortBy === option.value && <Check size={14} />}</button>)}</div>}</div>
            </div>

        </section>
        <div className="tp-workspace">
          <aside className="tp-filters" aria-label="Listing filters">
            <div className="tp-filter-title"><span className="flex items-center gap-2"><SlidersHorizontal size={16} /> Refine listings</span><button type="button" className="tp-reset" onClick={resetFilters}>Reset</button></div>
            <span className="tp-label">I'm looking for</span>
            <div className="tp-type">{([{ key: "iso", label: "Your ISO", icon: Search }, { key: "all", label: "All listings", icon: Layers }, { key: "trade", label: "For trade", icon: Handshake }, { key: "sale", label: "For sale", icon: ShoppingBag }] as const).map(({ key, label, icon: Icon }) => <button key={key} type="button" aria-pressed={listingType === key} onClick={() => { setListingType(key); setPage(0); }}><Icon size={16} />{label}</button>)}</div>
            <span className="tp-label">Rarity</span>
            <div className="tp-rarities">{["ALL", ...(rarityMap[setId === "SD" ? "friendshipsbegin" : setId || ""] || [])].map((rarity) => <button key={rarity} type="button" aria-pressed={rarity === "ALL" ? !selectedRarity : selectedRarity === rarity} onClick={() => { setSelectedRarity(rarity === "ALL" ? null : rarity); setPage(0); }}>{rarity === "ALL" ? "All rarities" : getOfferRarityLabel(setId || "", rarity)}</button>)}</div>
            <div className="tp-guide"><strong>Your missing cards, matched</strong><p>Your ISO shows cards missing from your collection that other collectors have for trade or sale. Open a card to see quantities, price, and offer options. Open a collector's profile to explore their ISO and wishlist. Use their Discord username to discuss a purchase.</p></div>
          </aside>
          <section className="tp-results" aria-label="Collector listings" aria-busy={loading}>
            <div className="tp-results-head"><div><h2>{listingType === "iso" ? "Your ISO" + (selectedRarity ? " / " + getOfferRarityLabel(setId || "", selectedRarity) : "") : selectedRarity ? getOfferRarityLabel(setId || "", selectedRarity) + " listings" : "Explore listings"}</h2><p>{loading ? "Gathering this set's collector listings" : `${visibleListingCount} matching listings from ${visibleUsers.length} collectors`}</p></div><span className="tp-result-badge">{listingType === "iso" ? "Missing from your collection" : listingType === "all" ? "Trade + sale" : listingType === "trade" ? "For trade" : "For sale"}</span></div>
            {loadError && !loading && <div className="tp-empty" role="alert"><ShieldAlert size={28} /><h3>Unable to load the marketplace</h3><p>{loadError}</p><button type="button" onClick={() => setReload((value) => value + 1)}>Try again</button></div>}
            {loading ? <div className="tp-loading" role="status">
              <div className="tp-loading-head"><div><h3>Loading listings</h3><p>{["Fetching card listings for this set.", "Loading collector profiles and contact details.", "Checking availability and your offer history."][loadStage]}</p></div><div className="tp-loading-bars" aria-hidden="true"><i /><i /><i /></div></div>
              <div className="tp-load-steps">{["Card listings", "Collector profiles", "Offer history"].map((label, index) => <span key={label} className={index === loadStage ? "tp-step-active" : ""}>{index < loadStage ? "Done: " : `${index + 1}. `}{label}</span>)}</div>
              <div className="tp-load-track" aria-hidden="true"><span /></div><div className="tp-skeleton-grid" aria-hidden="true">{Array.from({ length: 6 }, (_, index) => <div key={index} className="tp-skeleton" style={{ animationDelay: `${index * 40}ms` }} />)}</div>
            </div> : loadError ? null : listingType === "iso" && isoError ? <div className="tp-empty" role="alert"><ShieldAlert size={36} /><h3>Unable to load your ISO</h3><p>{isoError}</p><button type="button" onClick={() => setReload((value) => value + 1)}>Try again</button></div> : pagedUsers.length === 0 ? <div className="tp-empty"><Search size={36} /><h3>{listingType === "iso" ? "No ISO matches right now" : allListings.length ? "No matches this time" : "This set is waiting for listings"}</h3><p>{listingType === "iso" ? "Nothing from your ISO in this set is for sale or trade right now, try again another time." : allListings.length ? "Try a different rarity, listing type, or collector name." : "Collector cards will appear here when they become available for trade or sale."}</p><button type="button" onClick={() => { setSearch(""); setSelectedRarity(null); setListingType("all"); setPage(0); }}>Browse all listings</button></div> : <div key={`${selectedRarity}-${listingType}-${currentPage}`}>
              {pagedUsers.map(([userId, cards], index) => {
                const filteredCards = filterCardsForRarity(cards);
                const assets = getProfileAssets(profiles[userId]);
                return <article key={userId} className="tp-collector" style={{ animationDelay: `${Math.min(index, 5) * 55}ms` }}>
                  <header className="tp-collector-head">
                    <ProfileAvatar profile={{ ...profiles[userId], id: userId }} src={assets.avatar} alt={profiles[userId]?.username || "Collector"} className="h-11 w-11 shrink-0 rounded-xl object-cover" />
                    <div className="tp-identity"><div className="tp-name-row"><button className="tp-name" type="button" onClick={() => setOpenProfile(userId)}>{profiles[userId]?.username || "Collector"}{assets.verification && <CardImage src={assets.verification.badge} alt={assets.verification.label} title={assets.verification.label} className="h-4 w-4 shrink-0 object-contain" />}</button><span className={`tp-strikes ${Number(strikeCounts[userId] || 0) > 0 ? "tp-strikes-warning" : ""}`} title={strikeCounts[userId] === undefined ? "Strike counts are visible to the collector and moderators" : "Active offer expiration strikes"}>{strikeCounts[userId] === undefined ? "Strikes unavailable" : `${strikeCounts[userId]} strike${strikeCounts[userId] === 1 ? "" : "s"}`}</span></div><p>Discord: {tradingProfiles[userId]?.discord_username}</p></div>
                    <button className="tp-profile-btn" type="button" onClick={() => setOpenProfile(userId)}>View profile <ChevronRight size={14} /></button>
                    {currentUserId !== userId && <button className="tp-report-btn" type="button" disabled={reportedUsers.has(userId)} aria-label={reportedUsers.has(userId) ? "Collector already reported" : "Report inactive or unresponsive collector"} title={reportedUsers.has(userId) ? "Already reported" : "Report collector"} onClick={() => { setReportError(""); setReportTarget(userId); }}>{reportedUsers.has(userId) ? <ShieldCheck size={17} /> : <ShieldAlert size={17} />}</button>}
                  </header>
                  <div className="tp-collector-summary"><span>{filteredCards.length} matching cards</span><span>{filteredCards.filter((card) => card.is_for_trade).length} for trade</span><span>{filteredCards.filter((card) => card.is_for_sale).length} for sale</span></div>
                  <div className="tp-card-grid">{[...filteredCards].sort((a, b) => setId === "9" ? comparePromoCards(a, b) : a.card_key.localeCompare(b.card_key, undefined, { numeric: true })).map((card) => {
                    const double = card.set_id === "3" && /^SZR-0*1$/.test(card.card_key);
                    const price = Number(card.asking_price || 0);
                    return <div key={card.id} className={`tp-card ${double ? "tp-card-double" : ""}`}><button type="button" className="tp-card-image" aria-label={`Open ${getListingDisplayCode(card)}, ${card.is_for_trade ? "for trade" : ""} ${card.is_for_sale ? "for sale" : ""}`} onClick={() => { setCardReportError(""); setSelectedCard(card); }}><ListingCardImage card={card} /><div className="tp-card-tags">{card.is_for_trade && <span title="For trade"><Handshake size={14} /></span>}{card.is_for_sale && <span title="For sale">$</span>}</div></button><div className="tp-card-info"><strong>{getListingDisplayCode(card)}</strong>{card.is_for_sale && <span className="tp-price">{price > 0 ? `$${price.toFixed(2)}` : "Ask collector for price"}</span>}<span>{card.is_for_trade && `Trade x${card.trade_quantity || 1}`}{card.is_for_trade && card.is_for_sale && " / "}{card.is_for_sale && `Sale x${card.sale_quantity || 1}`}</span></div></div>;
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
                            &lsaquo;
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
                            &rsaquo;
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
                        <div role="status" className="tp-inventory-loading">
                          <div className="tp-loading-bars" aria-hidden="true" style={{ marginLeft: 0 }}><i /><i /><i /></div>
                          <strong>Opening your collection</strong>
                          <p>Finding owned cards you can include in this offer.</p>
                          <div className="tp-load-track"><span /></div>
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
                            aria-label={`Remove ${getListingDisplayCode(card)} from your offer`}
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
                    &#10003;
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