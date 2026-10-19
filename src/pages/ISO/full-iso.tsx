import CardImage from "@/components/CardImage";
import { getTradeCardImage, getMoonFourFront, getHeartswarmingEveFront } from "@/lib/card-images";
import { getISOSetId, getISOSetName, getISOCardCode } from "@/lib/iso-card-catalog";
import { HEARTHSWARMING_EVE_CARDS, getHeartswarmingEveDisplayCode } from "@/lib/hearthswarming-eve";
import { getMoonFourDisplayCode } from "@/lib/moon-four-catalog";
import type { CSSProperties } from "react";
import { ISO_EXPECTED_KEYS, isISOOwned, normalizeISOKey } from "./iso-visibility";
import ISOChecking from "./iso-checking";
export type FullISOCard = { set_id: string; card_key: string };
export type FullISOProgressRow = {
  set_id: string | number;
  progress: Record<string, unknown> | null;
};
export type FullISOStatusRow = { card_key: string; status: string };
const setOrder = [
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
];
const normalizeSet = (id: string | number) =>
  String(id) === "FB" ? "SD" : String(id) === "TCG_PROMOS" ? "tcgpromos" : getISOSetId(String(id));
const statusIdentity = (setId: string, cardKey: string) =>
  `${setId}:${normalizeISOKey(setId, cardKey)}`;
const getStatusIdentity = (key: string) => {
  for (const id of setOrder) {
    for (const prefix of [`${id}:`, `${id}-`]) {
      if (key.startsWith(prefix)) return statusIdentity(id, key.slice(prefix.length));
    }
  }
  if (key.startsWith("BONUS-") || key.startsWith("STARTER-") || key.startsWith("SD01"))
    return statusIdentity("SD", key);
  if (/^(BP01|SD01)/.test(key)) return statusIdentity("FW", key);
  return key;
};
export const buildFullISOCards = (
  rows: FullISOProgressRow[],
  hiddenSets: string[],
  statuses: FullISOStatusRow[],
): FullISOCard[] => {
  const hidden = new Set(hiddenSets.map(normalizeSet));
  const owned = new Set<string>();
  for (const row of rows) {
    const id = normalizeSet(row.set_id);
    for (const [key, value] of Object.entries(row.progress || {})) {
      if (isISOOwned(value)) owned.add(statusIdentity(id, key));
    }
  }
  const inProgress = new Set(
    statuses
      .filter((row) => row.status === "purchase_in_progress" || row.status === "trade_in_progress")
      .map((row) => getStatusIdentity(row.card_key)),
  );
  const expected: Record<string, string[]> = {
    ...ISO_EXPECTED_KEYS,
    "hearthswarming-eve": HEARTHSWARMING_EVE_CARDS.map((card) => card.key),
  };
  const cards: FullISOCard[] = [];
  for (const id of setOrder) {
    if (hidden.has(id)) continue;
    for (const key of new Set(expected[id] || [])) {
      const identity = statusIdentity(id, key);
      if (!owned.has(identity) && !inProgress.has(identity))
        cards.push({ set_id: id, card_key: key });
    }
  }
  return cards;
};
const getCode = (card: FullISOCard) =>
  card.set_id === "13"
    ? getMoonFourDisplayCode(card.card_key)
    : card.set_id === "hearthswarming-eve"
      ? getHeartswarmingEveDisplayCode(card.card_key)
      : card.card_key.startsWith("STARTER-")
        ? card.card_key.slice(8)
        : getISOCardCode(card.set_id, card.card_key);
const getSetName = (id: string) =>
  id === "13"
    ? "Moon Fourth Edition"
    : id === "hearthswarming-eve"
      ? "Hearthswarming Eve"
      : getISOSetName(id);
const CCG_CARD_ZOOM: Record<string, number> = {
  "PR-1": 1.009,
  "PR-2": 1.04,
  "PR-3": 1.035,
  "PR-4": 1.035,
  "PR-5": 1.033,
  "PR-7": 1.035,
  "PR-14": 1.035,
  "PR-8": 1.04,
  "PR-9": 1.04,
  "PR-10": 1.04,
  "PR-11": 1.04,
  "PR-12": 1.04,
  "PR-13": 1.04,
  "PR-15": 1.025,
};
const TCG_CARD_ZOOM: Record<string, number> = {
  RR01: 0.99,
  RR02: 0.99,
  RR03: 0.99,
  RR04: 0.99,
  RR05: 0.99,
  RR06: 0.99,
  RR07: 0.99,
  RR08: 0.99,
  RR09: 1.035,
  RR10: 1.025,
  RR11: 1.025,
  RR12: 1.025,
  RR13: 0.99,
  RR14: 0.99,
  RR15: 0.99,
  RR16: 0.99,
  RR17: 0.99,
  RR18: 0.99,
  RR19: 0.99,
  RR20: 0.99,
  RR21: 0.99,
  RR22: 0.99,
  RR23: 0.99,
  RR24: 0.99,
  RR25: 0.99,
  RR26: 0.99,
  RR27: 0.99,
  RR28: 0.99,
};
const getPromoFrontStyle = (key: string): CSSProperties => ({
  display: "block",
  width: "100%",
  height: "100%",
  margin: 0,
  objectFit: "cover",
  objectPosition: "50% 50%",
  transformOrigin: "50% 50%",
  backgroundColor: "transparent",
  backgroundImage: "none",
  transform:
    key === "RR09"
      ? "translateY(-0.75%) scale(1.035, 1.02)"
      : `scale(${key.startsWith("PR-") ? (CCG_CARD_ZOOM[key] ?? 1) : (TCG_CARD_ZOOM[key] ?? 1)})`,
});
type FullISOProps = {
  cards: FullISOCard[];
  userId: string;
  wishlist: Set<string>;
  toggleWishlist: (setId: string, cardKey: string) => Promise<void>;
};
export default function FullISO({ cards, userId, wishlist, toggleWishlist }: FullISOProps) {
  return (
    <section className="rounded-[24px] border border-black/10 bg-white p-3 shadow-sm dark:border-white/[0.08] dark:bg-[#17191a] sm:p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Full ISO</h1>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {cards.length} {cards.length === 1 ? "card" : "cards"}
        </span>
      </div>
      {cards.length === 0 ? (
        <p className="py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
          No cards remaining in your ISO.
        </p>
      ) : (
        <div className="grid grid-cols-5 items-start gap-x-1 gap-y-2 min-[400px]:grid-cols-6 sm:gap-x-2 sm:gap-y-3 xl:grid-cols-7">
          {cards.map((card) => {
            const landscape =
              card.set_id === "14" && /^BP03-C(2[5-9]|3[0-9]|4[0-8])$/.test(card.card_key);
            const wide = card.set_id === "3" && card.card_key === "SZR-1";
            const promo = card.set_id === "9" || card.set_id === "tcgpromos";
            const src =
              card.set_id === "13"
                ? getMoonFourFront(card.card_key)
                : card.set_id === "hearthswarming-eve"
                  ? getHeartswarmingEveFront(card.card_key)
                  : getTradeCardImage(card);
            const key =
              card.set_id === "SD" && !card.card_key.startsWith("STARTER-")
                ? `BONUS-${card.card_key}`
                : card.card_key;
            const style: CSSProperties = landscape
              ? {
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: "140%",
                  height: "71.4286%",
                  maxWidth: "none",
                  transform: "translate(-50%, -50%) rotate(-90deg)",
                }
              : promo
                ? getPromoFrontStyle(card.card_key)
                : {
                    transform: ["1", "2", "3", "13", "4", "5", "6", "7", "8", "11"].includes(
                      card.set_id,
                    )
                      ? "scale(1.035)"
                      : undefined,
                  };
            return (
              <article
                key={`${card.set_id}:${card.card_key}`}
                className={`min-w-0 flex flex-col ${wide ? "col-span-2" : ""}`}
              >
                <p className="mb-0.5 w-full break-words text-center text-[clamp(5px,0.95vw,7px)] font-semibold leading-tight tracking-tight sm:text-[8px] lg:text-[10px] xl:text-xs">
                  {getCode(card)}
                </p>
                <ISOChecking
                  className="!block leading-none"
                  contentClassName="!rounded-none"
                  userId={userId}
                  setId={card.set_id}
                  cardKey={key}
                  isWishlisted={wishlist.has(`${card.set_id}:${key}`)}
                  toggleWishlist={toggleWishlist}
                >
                  <div
                    className={`relative overflow-hidden ${wide ? "aspect-[10/7]" : "aspect-[5/7]"}`}
                    style={{ borderRadius: "4% / 2.857%" }}
                  >
                    <CardImage
                      src={src}
                      alt={getCode(card)}
                      className="block h-full w-full object-cover object-center"
                      style={style}
                      imageSize={
                        (card.set_id === "9" && card.card_key === "PR-14") ||
                        (card.set_id === "tcgpromos" && card.card_key === "RR28")
                          ? "original"
                          : "grid"
                      }
                      loading="lazy"
                      draggable={false}
                    />
                  </div>
                </ISOChecking>
                <p className="mt-0.5 break-words text-center text-[6px] leading-tight text-zinc-500 dark:text-zinc-400 sm:text-[8px] lg:text-[10px] xl:text-xs">
                  {getSetName(card.set_id)}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
