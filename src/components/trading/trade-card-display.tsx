import { merchandiseSets, ENGLISH_MERCHANDISE_SET_ID } from "@/lib/english-merchandise-catalog";
import { profileViewCard, profileViewCode, profileViewImage, profileViewStyle, profileViewSquare, profileViewGroup, profileViewName } from "@/lib/english-card-views";
import { useState } from "react";
import CardImage from "@/components/CardImage";
import { cardImagePaths, getMoonFourFront, getHeartswarmingEveFront } from "@/lib/card-images";
import { HEARTHSWARMING_EVE_RARITIES, getHeartswarmingEveRarity, getHeartswarmingEveDisplayCode } from "@/lib/hearthswarming-eve";
import { chineseSets, getChineseCard, isWideChineseCard } from "@/pages/Chinese Kayou/Chinese ISO/catalog/catalog";
import ChineseISOImage from "@/pages/Chinese Kayou/Chinese ISO/components/card-image";
export type TradeCard = {
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
export type InventoryCard = {
  id: string;
  set_id: string;
  card_key: string;
};
export type OfferState = {
  attempts: number;
  latestStatus: string;
  latestExpiresAt: string;
  latestCreatedAt: string;
};
export const OFFER_SET_ORDER = [
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
  "hearthswarming-eve",
  "tcgpromos",
  ENGLISH_MERCHANDISE_SET_ID,
];
export const OFFER_RARITY_ORDER = [
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
export const displayFunCode = (
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
export const displayRainbowCode = (
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
export const getListingDisplayCode = (card: { set_id: string; card_key: string }) => {
  const setId = String(card.set_id);
  if (setId === ENGLISH_MERCHANDISE_SET_ID) return `${profileViewName(profileViewGroup(card))} - ${profileViewCode(card)}`;
  if (setId.startsWith("cn-")) return getChineseCard(setId, card.card_key)?.code ?? card.card_key;
  const key = card.card_key.replace(/^(?:BONUS|STARTER|STARTERS)-/, "");
  if (setId === "hearthswarming-eve") return getHeartswarmingEveDisplayCode(key);
  if (/^(?:MLPME|MLPSE|MLPEPR|FME|INT|RBE)\d/i.test(key)) return key;
  if (["SD", "friendshipsbegin", "FW", "12", "14", "hearthswarming-eve"].includes(setId)) {
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
export const COLLECTION_SET_TOTALS: Record<string, number> = {
  "hearthswarming-eve": 197,
  "1": 186, "2": 189, "3": 290, "13": 162, "4": 105,
  "5": 146, "6": 170, "7": 127, "8": 136, "11": 148,
  "9": 14, SD: 68, friendshipsbegin: 68, FW: 191,
  "12": 191, "14": 190, tcgpromos: 28,
};
export const normalizeCollectionKey = (key: string) => key
  .toUpperCase()
  .replace(/^(?:BONUS|STARTER|STARTERS)-/, "")
  .replace(/^P(BP\d+)-/, "$1P")
  .replace(/SHINING[ -]*ZR|\u25C7[ -]*ZR|\u2B26[ -]*ZR/g, "SZR")
  .replace(/[^A-Z0-9]/g, "")
  .replace(/\d+/g, (number) => String(Number(number)));
export const isOwnedProgress = (value: unknown) => value === true || Boolean(value && typeof value === "object" && (value as { owned?: boolean }).owned === true);
export const randomHeroCards = (cards: TradeCard[]) => {
  const unique = [...new Map(cards.filter((card) => Boolean(getCardImage(card))).map((card) => [normalizeCollectionKey(card.card_key), card])).values()];
  for (let index = unique.length - 1; index > 0; index--) {
    const swap = Math.floor(Math.random() * (index + 1));
    [unique[index], unique[swap]] = [unique[swap], unique[index]];
  }
  return unique.slice(0, 3);
};
export const offerKeyFor = (recipientId: string, setId: string, cardKey: string) =>
  [recipientId, setId, cardKey].join("-");
export const inventoryRarity = (cardKey: string) => {
  const item = profileViewCard({ set_id: ENGLISH_MERCHANDISE_SET_ID, card_key: cardKey });
  if (item?.merchandiseSetId) return item.merchandiseSetId;
  const key = cardKey.toUpperCase().replace(/\u203B/g, "");
  if (/^P?BP04-/.test(key)) return getHeartswarmingEveRarity(key);
  const nightmareParallel = key.match(/^PBP03-(ER|SPR|GR|CR|RR)\d{2}(?:-[ABC]2?)?$/);
  if (nightmareParallel) return `P${nightmareParallel[1]}`;
  const prefixed = key.match(
    /(?:BP|SD)\d{2}-?(BASE|PER|PSPR|PGR|PCR|PRR|SPR|SSR|SCR|SAR|SGR|UGR|USR|TGR|MTR|LSR|SZR|ZR|XR|HR|FR|TR|ST|SR|UR|GR|CR|ER|RR|SC|BP|AR|OR|PR|R|U|C|N|SN)/,
  );
  if (prefixed) return prefixed[1];
  return key.split("-")[0].replace(/\d+$/g, "") || "Other";
};
export const rarityMap: Record<string, string[]> = {
  "hearthswarming-eve": Object.keys(HEARTHSWARMING_EVE_RARITIES),
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
export const CCG_PROMO_ORDER = [1, 2, 3, 4, 5, 7, 14, 8, 9, 10, 11, 12, 13, 15].map((number) => `PR-${number}`);
export const comparePromoCards = (a: { card_key: string }, b: { card_key: string }) => {
  const indexA = CCG_PROMO_ORDER.indexOf(a.card_key);
  const indexB = CCG_PROMO_ORDER.indexOf(b.card_key);
  return (indexA < 0 ? CCG_PROMO_ORDER.length : indexA) - (indexB < 0 ? CCG_PROMO_ORDER.length : indexB);
};
export const isFriendshipsBeginSet = (setId: string) =>
  ["SD", "friendshipsbegin", "SD_STARTERS", "SD_BONUS"].includes(setId);
export const getOfferCollectionSet = (setId: string) =>
  isFriendshipsBeginSet(setId) ? "SD" : setId;
export const getFriendshipsBeginImageKey = (cardKey: string) => {
  const key = cardKey.trim().toUpperCase()
    .replace(/^(?:(?:BONUS|STARTER|STARTERS)[-_ ])+/, "")
    .replace(/\.(?:webp|png|jpe?g)$/i, "")
    .replace(/[\s_-]+/g, "");
  const match = key.match(/^(?:SD01)?(PER|PRR|SPR|SR|ER|GR|CR|RR|C|U)(\d+)$/);
  return match ? `SD01${match[1]}${String(Number(match[2])).padStart(2, "0")}` : key;
};
export const getCardImage = (card: TradeCard) => {
  if (card.set_id === ENGLISH_MERCHANDISE_SET_ID) return profileViewCard(card) ? profileViewImage(card) : "";
  if (card.set_id.startsWith("cn-")) return getChineseCard(card.set_id, card.card_key)?.image ?? "";
  if (String(card.set_id) === "13") return getMoonFourFront(card.card_key);
  const [rarity, number] = card.card_key.split("-");
  if (isFriendshipsBeginSet(String(card.set_id))) {
    return cardImagePaths.friendshipsBegin(getFriendshipsBeginImageKey(card.card_key));
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
  if (String(card.set_id) === "hearthswarming-eve") return getHeartswarmingEveFront(card.card_key);
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
export const standardOfferZoomSets = new Set([
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
export const getOfferCardNumber = (cardKey: string) => {
  const match = cardKey.match(/(\d+)$/);
  return match ? Number(match[1]) : null;
};
export const getOfferImageClassName = (card: { set_id: string; card_key: string }) => {
  const base = "absolute inset-0 h-full w-full max-w-none";
  const offerSetId = String(card.set_id);
  if (isFriendshipsBeginSet(offerSetId)) return `${base} object-contain object-center`;
  if (offerSetId === "13") return `${base} scale-[1.045] object-contain object-center`;
  if (standardOfferZoomSets.has(offerSetId)) {
    return `${base} scale-[1.06] object-contain object-center`;
  }
  const cardNumber = getOfferCardNumber(card.card_key);
  if (offerSetId === "9") {
    if (cardNumber === 15) {
      return `${base} scale-[1.025] object-contain object-center`;
    }
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
  const contained = ["SD", "friendshipsbegin", "FW", "12", "14", "hearthswarming-eve"].includes(
    offerSetId,
  );
  return `${base} ${contained ? "object-contain object-center" : "object-cover object-center"}`;
};
export function ListingCardImage({
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
  const chineseCard = getChineseCard(card.set_id, card.card_key);
  if (chineseCard) return <ChineseISOImage key={chineseCard.identity} card={chineseCard} />;
  if (!src || failedSrc === src) {
    return (
      <div className="absolute inset-0 flex items-center justify-center rounded-[inherit] bg-zinc-300 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-100">
        <span className="px-2 text-center text-xs font-bold">COMING SOON</span>
      </div>
    );
  }
  if (card.set_id === ENGLISH_MERCHANDISE_SET_ID) return <CardImage src={src} alt={getListingDisplayCode(card)} publicProfile imageSize="original" loading={offerMode ? "eager" : "lazy"} draggable={false} style={profileViewStyle(card)} onError={() => setFailedSrc(src)} />;
  return (
    <CardImage loading={offerMode ? "eager" : "lazy"} imageSize={(isFriendshipsBeginSet(String(card.set_id)) && offerMode) ? "original" : imageSize ?? (((String(card.set_id) === "9" && card.card_key === "PR-14") || (String(card.set_id) === "tcgpromos" && card.card_key === "RR28")) ? "original" : undefined)}
      src={src}
      alt={getListingDisplayCode(card)}
      onError={() => setFailedSrc(src)}
      draggable={false}
      className={
        isLandscape
          ? "absolute object-contain"
          : offerMode || (String(card.set_id) === "9" && card.card_key === "PR-15")
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
            : { transform: ["SD", "friendshipsbegin", "FW", "12", "14", "hearthswarming-eve"].includes(String(card.set_id)) ? undefined : "scale(1.045)" }
      }
    />
  );
}
export function InventoryCardImage({
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
rarityMap[ENGLISH_MERCHANDISE_SET_ID] = merchandiseSets.map(set => set.id);
COLLECTION_SET_TOTALS[ENGLISH_MERCHANDISE_SET_ID] = merchandiseSets.reduce((total, set) => total + set.items.length, 0);
export const isSquareTradeCard = (card: { set_id: string; card_key: string }) => card.set_id === ENGLISH_MERCHANDISE_SET_ID && profileViewSquare(card);
for (const set of chineseSets) {
  rarityMap[set.id] = Array.from(new Set(set.cards.map(card => card.rarity)));
  COLLECTION_SET_TOTALS[set.id] = set.cards.length;
}
export const isWideTradeCard = (card: { set_id: string; card_key: string }) => {
  const chineseCard = getChineseCard(card.set_id, card.card_key);
  return chineseCard ? isWideChineseCard(chineseCard) : card.set_id === "3" && /^SZR-0*1$/.test(card.card_key);
};
export const getOfferRarityLabel = (offerSetId: string, rarity: string) => {
    if (offerSetId === ENGLISH_MERCHANDISE_SET_ID) return rarity === "ALL" ? "All collections" : profileViewName(rarity);
    if (rarity === "DN") return "\u25C7N";
    if (rarity === "DAR") return "\u25C7AR";
    if (rarity === "DCR") return "\u25C7CR";
    if (rarity === "DZR") return "\u25C7ZR";
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
export const getOfferSetName = (id: string) => id === ENGLISH_MERCHANDISE_SET_ID ? "Merchandise" : chineseSets.find(set => set.id === id)?.name ?? ({ "1": "Moon One", "2": "Moon Two", "3": "Moon Three", "13": "Moon Four", "4": "Star One", "5": "Rainbow One", "6": "Rainbow Two", "7": "Fun Moments One", "8": "Fun Moments Two", "11": "Fun Moments Three", "9": "CCG Promos", SD: "Friendships Begin", friendshipsbegin: "Friendships Begin", FW: "Fantasy Wonderland", "12": "Discord", "14": "Nightmare Night", "hearthswarming-eve": "HeartsWarming Eve", tcgpromos: "TCG Promos" } as Record<string, string>)[id] ?? id;
