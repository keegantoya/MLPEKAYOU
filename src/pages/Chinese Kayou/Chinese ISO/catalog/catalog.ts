import { CHINESE_REPLACEMENT_FRONT_CODES } from "../../card-images-cn";
import type { CSSProperties } from "react";
import { CN_MOON_ONE_CARDS, CN_MOON_ONE_SET_ID } from "../../Chinese Sets/Moon Editions/CN-Moon-One";
import { CN_MOON_TWO_CARDS, CN_MOON_TWO_SET_ID } from "../../Chinese Sets/Moon Editions/CN-Moon-Two";
import { CN_MOON_THREE_CARDS, CN_MOON_THREE_SET_ID } from "../../Chinese Sets/Moon Editions/CN-Moon-Three";
import { CN_MOON_FOUR_CARDS, CN_MOON_FOUR_SET_ID } from "../../Chinese Sets/Moon Editions/CN-Moon-Four";
import { CN_MOON_FIVE_CARDS, CN_MOON_FIVE_SET_ID } from "../../Chinese Sets/Moon Editions/CN-Moon-Five";
import { CN_MOON_SIX_CARDS, CN_MOON_SIX_SET_ID } from "../../Chinese Sets/Moon Editions/CN-Moon-Six";
import { getChineseMoonFourHRImageNumber, CN_MOON_SEVEN_CARDS, CN_MOON_SEVEN_SET_ID, CN_MOON_EIGHT_CARDS, CN_MOON_EIGHT_SET_ID, CN_MOON_NINE_CARDS, CN_MOON_NINE_SET_ID, CN_MOON_TEN_CARDS, CN_MOON_TEN_SET_ID, CN_MOON_ELEVEN_CARDS, CN_MOON_ELEVEN_SET_ID, CN_MOON_TWELVE_CARDS, CN_MOON_TWELVE_SET_ID, CN_FUN_ONE_CARDS, CN_FUN_ONE_SET_ID, CN_FUN_TWO_CARDS, CN_FUN_TWO_SET_ID, CN_FUN_THREE_CARDS, CN_FUN_THREE_SET_ID, CN_FUN_FOUR_CARDS, CN_FUN_FOUR_SET_ID, CN_FUN_FIVE_CARDS, CN_FUN_FIVE_SET_ID, CN_FUN_SIX_CARDS, CN_FUN_SIX_SET_ID, CN_FUN_SEVEN_CARDS, CN_FUN_SEVEN_SET_ID, CN_FUN_EIGHT_CARDS, CN_FUN_EIGHT_SET_ID, CN_FUN_NINE_CARDS, CN_FUN_NINE_SET_ID, CN_RAINBOW_ONE_CARDS, CN_RAINBOW_ONE_SET_ID, CN_RAINBOW_TWO_CARDS, CN_RAINBOW_TWO_SET_ID, CN_RAINBOW_THREE_CARDS, CN_RAINBOW_THREE_SET_ID, CN_RAINBOW_FOUR_CARDS, CN_RAINBOW_FOUR_SET_ID, CN_RAINBOW_FIVE_CARDS, CN_RAINBOW_FIVE_SET_ID, CN_STAR_ONE_CARDS, CN_STAR_ONE_SET_ID, CN_STAR_TWO_CARDS, CN_STAR_TWO_SET_ID, CN_STAR_THREE_CARDS, CN_STAR_THREE_SET_ID, CN_PROMOS_CARDS, CN_PROMOS_SET_ID, CN_STARDUST_ONE_CARDS, CN_STARDUST_ONE_SET_ID, CN_STARDUST_TWO_CARDS, CN_STARDUST_TWO_SET_ID, CN_MAGICBOOK_ONE_CARDS, CN_MAGICBOOK_ONE_SET_ID, CN_NEWYEARS_ONE_CARDS, CN_NEWYEARS_ONE_SET_ID, CN_NEWYEARS_TWO_CARDS, CN_NEWYEARS_TWO_SET_ID, CN_KUJI_RAFFLES_CARDS, CN_KUJI_RAFFLES_SET_ID, CN_LASER_TICKETS_CARDS, CN_LASER_TICKETS_SET_ID } from "../../card-images-cn";
export type ChineseFamily = "moon" | "fun" | "rainbow" | "star" | "promos" | "other" | "misc";
export type ChineseCard = { key: string; rarity: string; number: number; code: string; image: string; displayName?: string };
export type ChineseSet = { id: string; name: string; family: ChineseFamily; href: string; imageUrl?: string; cards: ChineseCard[]; imageStyle?: (key: string) => CSSProperties; wideKeys?: string[] };
export type ChineseISOCard = ChineseCard & { setId: string; setName: string; family: ChineseFamily; identity: string };
export const chineseFamilies: { id: ChineseFamily; name: string }[] = [{ id: "moon", name: "Moon" }, { id: "fun", name: "Fun Moments" }, { id: "rainbow", name: "Rainbow" }, { id: "star", name: "Star" }, { id: "promos", name: "Promos" }, { id: "other", name: "Gift Sets" }, { id: "misc", name: "Other" }];
export const CHINESE_KUJI_TICKET_ZOOM = 1.05;
const kujiTicketZooms: Record<string, number> = {
  "2-TICKET-22": 1.115,
  "3-TICKET-1": 1.03,
  "3-TICKET-3": 1,
  "4-TICKET-2": 1.085,
  "4-TICKET-4": 1.12,
  "4-TICKET-5": 1.105,
  "4-TICKET-6": 1.095,
  "4-TICKET-7": 1.075,
  "4-TICKET-8": 1.08,
  "4-TICKET-9": 1.105,
  "4-TICKET-10": 1.08,
  "4-TICKET-11": 1.065,
  "4-TICKET-12": 1.095,
  "4-TICKET-13": 1.085,
  "4-TICKET-14": 1.08,
};
const getKujiTicketZoom = (key: string) => kujiTicketZooms[key] ?? CHINESE_KUJI_TICKET_ZOOM;
const getKujiTicketTransform = (key: string) => `${key === "3-TICKET-1" ? "translateY(-1.2%) " : key === "3-TICKET-7" ? "translateY(-0.5%) " : ""}scale(${getKujiTicketZoom(key)})`;
const kujiCPrizeTransforms: Record<string, string> = {
  "2-C-1": "translate(-0.91243%, 0.64262%) scale(1.096738)",
  "2-C-2": "translate(1.28754%, -0.10795%) scale(1.105442)",
  "2-C-3": "translate(0.09155%, 1.18213%) scale(1.100451)",
  "2-C-4": "translate(-1.91573%, -1.31633%) scale(1.123272)",
  "2-C-5": "translate(1.29320%, -0.28790%) scale(1.072018)",
  "2-C-6": "translate(0.63655%, -0.05337%) scale(1.093049)",
  "3-C-7": "translate(-0.20799%, 0.09766%) scale(1.000000)",
  "3-C-8": "translate(-0.21829%, 0.25623%) scale(1.049516)",
  "3-C-9": "translate(0.43009%, -0.65631%) scale(1.033934)",
  "3-C-10": "translate(1.18576%, 0.48974%) scale(1.055766)",
  "3-C-11": "translate(0.62718%, 12.14725%) scale(1.256443)",
  "3-C-12": "translate(-0.17140%, 0.62873%) scale(1.030111)",
  "3-C-13": "translate(0.85927%, 2.21899%) scale(1.032839)",
  "3-C-14": "translate(0.17798%, 1.01848%) scale(1.069665)"
};
function kujiRafflesImageStyle(key: string): CSSProperties {
  if (/^[12]-C-\d+$/.test(key) || (/^3-C-\d+$/.test(key) && Number(key.split("-")[2]) >= 7)) return { objectFit: "contain", objectPosition: "center", transform: kujiCPrizeTransforms[key] ?? "none", transformOrigin: "center" };
  if (/^3-E-\d+$/.test(key)) return Number(key.split("-")[2]) <= 6
    ? { position: "absolute", left: "50%", top: "50%", width: `${1080 / 644 * 100}%`, height: `${644 / 1080 * 100}%`, maxWidth: "none", maxHeight: "none", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center", objectFit: "contain" }
    : { objectFit: "contain", objectPosition: "center", transform: "none", transformOrigin: "center" };
  if (/^3-D-\d+$/.test(key)) return Number(key.split("-")[2]) >= 5
    ? { position: "absolute", left: "50%", top: "50%", width: `${885 / 625 * 100}%`, height: `${625 / 885 * 100}%`, maxWidth: "none", maxHeight: "none", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center", objectFit: "cover" }
    : { objectFit: "cover", objectPosition: "center", transform: "none", transformOrigin: "center" };
  if (/^4-F-\d+$/.test(key)) return { objectFit: "cover", objectPosition: "center", transform: "none", transformOrigin: "center" };
  if (/^4-C-\d+$/.test(key)) return Number(key.split("-")[2]) >= 9
    ? { position: "absolute", left: "50%", top: "50%", width: `${885 / 625 * 100}%`, height: `${625 / 885 * 100}%`, maxWidth: "none", maxHeight: "none", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center", objectFit: "cover" }
    : { objectFit: "cover", objectPosition: "center", transform: "none", transformOrigin: "center" };
  if (/^4-D-\d+$/.test(key)) return Number(key.split("-")[2]) >= 16
    ? { position: "absolute", left: "50%", top: "50%", width: `${839 / 508 * 100}%`, height: `${508 / 839 * 100}%`, maxWidth: "none", maxHeight: "none", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center", objectFit: "cover" }
    : { objectFit: "cover", objectPosition: "center", transform: "none", transformOrigin: "center" };
  if (/^4-E-\d+$/.test(key)) return { objectFit: "cover", objectPosition: "center", transform: "none", transformOrigin: "center" };
  if (/^1-E-(7|8)$/.test(key) || /^3-F-[1-6]$/.test(key)) return { position: "absolute", left: "50%", top: "50%", width: `${1025 / 616 * 100}%`, height: `${616 / 1025 * 100}%`, maxWidth: "none", maxHeight: "none", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center", objectFit: "contain" };
  if (/^2-E-\d+$/.test(key)) return Number(key.split("-")[2]) >= 7
    ? { position: "absolute", left: "50%", top: "50%", width: `${839 / 508 * 100}%`, height: `${508 / 839 * 100}%`, maxWidth: "none", maxHeight: "none", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center", objectFit: "cover" }
    : { objectFit: "cover", objectPosition: "center", transform: "none", transformOrigin: "center" };
  return { transform: /^[1-4]-(TICKET|C)-\d+$/.test(key) ? getKujiTicketTransform(key) : "none", transformOrigin: key === "3-TICKET-1" ? "center top" : "center", objectFit: "contain" };
}
function laserTicketsImageStyle(key: string): CSSProperties {
  if (/^SH-\d+$/.test(key)) return { position: "absolute", left: "50%", top: "50%", width: `${1263 / 481 * 100}%`, height: `${481 / 1263 * 100}%`, maxWidth: "none", maxHeight: "none", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center", objectFit: "contain" };
  return { transform: "rotate(180deg)", transformOrigin: "center", objectFit: "contain" };
}
export const chineseSets: ChineseSet[] = [
  { id: CN_MOON_ONE_SET_ID, name: "Moon One", family: "moon", href: "/cn-moon-one", imageUrl: "/Chinese-Thumbnails/moon1setimagecn.webp", cards: CN_MOON_ONE_CARDS },
  { id: CN_MOON_TWO_SET_ID, name: "Moon Two", family: "moon", href: "/cn-moon-two", imageUrl: "/Chinese-Thumbnails/moon2setimagecn.webp", cards: CN_MOON_TWO_CARDS },
  { id: CN_MOON_THREE_SET_ID, name: "Moon Three", family: "moon", href: "/cn-moon-three", imageUrl: "/Chinese-Thumbnails/moon3setimagecn.webp", cards: CN_MOON_THREE_CARDS },
  { id: CN_MOON_FOUR_SET_ID, name: "Moon Four", family: "moon", href: "/cn-moon-four", imageUrl: "/Chinese-Thumbnails/moon4setimagecn.webp", cards: CN_MOON_FOUR_CARDS },
  { id: CN_MOON_FIVE_SET_ID, name: "Moon Five", family: "moon", href: "/cn-moon-five", imageUrl: "/Chinese-Thumbnails/moon5setimagecn.webp", cards: CN_MOON_FIVE_CARDS },
  { id: CN_MOON_SIX_SET_ID, name: "Moon Six", family: "moon", href: "/cn-moon-six", imageUrl: "/Chinese-Thumbnails/moon6setimagecn.webp", cards: CN_MOON_SIX_CARDS },
  { id: CN_MOON_SEVEN_SET_ID, name: "Moon Seven", family: "moon", href: "/cn-moon-seven", imageUrl: "/thumbnails/moononesetimage.webp", cards: CN_MOON_SEVEN_CARDS },
  { id: CN_MOON_EIGHT_SET_ID, name: "Moon Eight", family: "moon", href: "/cn-moon-eight", imageUrl: "/thumbnails/moontwosetimage.webp", cards: CN_MOON_EIGHT_CARDS },
  { id: CN_MOON_NINE_SET_ID, name: "Moon Nine", family: "moon", href: "/cn-moon-nine", imageUrl: "/thumbnails/moonthreesetimage.webp", cards: CN_MOON_NINE_CARDS, wideKeys: ["DZR-1"] },
  { id: CN_MOON_TEN_SET_ID, name: "Moon Ten", family: "moon", href: "/cn-moon-ten", imageUrl: "/Chinese-Thumbnails/moon10setimagecn.webp", cards: CN_MOON_TEN_CARDS },
  { id: CN_MOON_ELEVEN_SET_ID, name: "Moon Eleven", family: "moon", href: "/cn-moon-eleven", imageUrl: "/thumbnails/moonfoursetimage.webp", cards: CN_MOON_ELEVEN_CARDS },
  { id: CN_MOON_TWELVE_SET_ID, name: "Moon Twelve", family: "moon", href: "/cn-moon-twelve", imageUrl: "/Chinese-Thumbnails/moon12setimagecn.webp", cards: CN_MOON_TWELVE_CARDS },
  { id: CN_FUN_ONE_SET_ID, name: "Fun Moments One", family: "fun", href: "/cn-fun-one", imageUrl: "/Chinese-Thumbnails/funmoments1setimagecn.webp", cards: CN_FUN_ONE_CARDS },
  { id: CN_FUN_TWO_SET_ID, name: "Fun Moments Two", family: "fun", href: "/cn-fun-two", imageUrl: "/Chinese-Thumbnails/funmoments2setimagecn.webp", cards: CN_FUN_TWO_CARDS },
  { id: CN_FUN_THREE_SET_ID, name: "Fun Moments Three", family: "fun", href: "/cn-fun-three", imageUrl: "/Chinese-Thumbnails/funmoments3setimagecn.webp", cards: CN_FUN_THREE_CARDS },
  { id: CN_FUN_FOUR_SET_ID, name: "Fun Moments Four", family: "fun", href: "/cn-fun-four", imageUrl: "/thumbnails/funonesetimage.webp", cards: CN_FUN_FOUR_CARDS },
  { id: CN_FUN_FIVE_SET_ID, name: "Fun Moments Five", family: "fun", href: "/cn-fun-five", imageUrl: "/thumbnails/funtwosetimage.webp", cards: CN_FUN_FIVE_CARDS },
  { id: CN_FUN_SIX_SET_ID, name: "Fun Moments Six", family: "fun", href: "/cn-fun-six", imageUrl: "/thumbnails/funthreesetimage.webp", cards: CN_FUN_SIX_CARDS },
  { id: CN_FUN_SEVEN_SET_ID, name: "Fun Moments Seven", family: "fun", href: "/cn-fun-seven", imageUrl: "/Chinese-Thumbnails/funmoments7setimagecn.webp", cards: CN_FUN_SEVEN_CARDS },
  { id: CN_FUN_EIGHT_SET_ID, name: "Fun Moments Eight", family: "fun", href: "/cn-fun-eight", imageUrl: "/Chinese-Thumbnails/funmoments8setimagecn.webp", cards: CN_FUN_EIGHT_CARDS },
  { id: CN_FUN_NINE_SET_ID, name: "Fun Moments Nine", family: "fun", href: "/cn-fun-nine", imageUrl: "/Chinese-Thumbnails/funmoments9setimagecn.webp", cards: CN_FUN_NINE_CARDS },
  { id: CN_RAINBOW_ONE_SET_ID, name: "Rainbow One", family: "rainbow", href: "/cn-rainbow-one", imageUrl: "/Chinese-Thumbnails/rainbow1setimagecn.webp", cards: CN_RAINBOW_ONE_CARDS },
  { id: CN_RAINBOW_TWO_SET_ID, name: "Rainbow Two", family: "rainbow", href: "/cn-rainbow-two", imageUrl: "/Chinese-Thumbnails/rainbow2setimagecn.webp", cards: CN_RAINBOW_TWO_CARDS },
  { id: CN_RAINBOW_THREE_SET_ID, name: "Rainbow Three", family: "rainbow", href: "/cn-rainbow-three", imageUrl: "/Chinese-Thumbnails/rainbow3setimagecn.webp", cards: CN_RAINBOW_THREE_CARDS },
  { id: CN_RAINBOW_FOUR_SET_ID, name: "Rainbow Four", family: "rainbow", href: "/cn-rainbow-four", imageUrl: "/thumbnails/rainbowonesetimage.webp", cards: CN_RAINBOW_FOUR_CARDS },
  { id: CN_RAINBOW_FIVE_SET_ID, name: "Rainbow Five", family: "rainbow", href: "/cn-rainbow-five", imageUrl: "/thumbnails/rainbowtwosetimage.webp", cards: CN_RAINBOW_FIVE_CARDS },
  { id: CN_STAR_ONE_SET_ID, name: "Star One", family: "star", href: "/cn-star-one", imageUrl: "/Chinese-Thumbnails/star1setimagecn.webp", cards: CN_STAR_ONE_CARDS },
  { id: CN_STAR_TWO_SET_ID, name: "Star Two", family: "star", href: "/cn-star-two", imageUrl: "/thumbnails/staronesetimage.webp", cards: CN_STAR_TWO_CARDS },
  { id: CN_STAR_THREE_SET_ID, name: "Star Three", family: "star", href: "/cn-star-three", imageUrl: "/Chinese-Thumbnails/star3setimagecn.webp", cards: CN_STAR_THREE_CARDS },
  { id: CN_STARDUST_ONE_SET_ID, name: "Stardust One", family: "other", href: "/cn-stardust-one", imageUrl: "/Chinese-Thumbnails/stardust1setimagecn.webp", cards: CN_STARDUST_ONE_CARDS, imageStyle: stardustOneImageStyle },
  { id: CN_STARDUST_TWO_SET_ID, name: "Stardust Two", family: "other", href: "/cn-stardust-two", imageUrl: "/Chinese-Thumbnails/stardust2setimagecn.webp", cards: CN_STARDUST_TWO_CARDS, imageStyle: stardustTwoImageStyle },
  { id: CN_MAGICBOOK_ONE_SET_ID, name: "Equestria Girls: Magic Book", family: "other", href: "/cn-magicbook-one", imageUrl: "/Chinese-Thumbnails/equestriagirls1setimagecn.webp", cards: CN_MAGICBOOK_ONE_CARDS, imageStyle: magicBookOneImageStyle },
  { id: CN_NEWYEARS_ONE_SET_ID, name: "New Years One", family: "other", href: "/cn-newyears-one", imageUrl: "/Chinese-Thumbnails/newyears1setimagecn.webp", cards: CN_NEWYEARS_ONE_CARDS, imageStyle: newYearsOneImageStyle },
  { id: CN_NEWYEARS_TWO_SET_ID, name: "New Years Two", family: "other", href: "/cn-newyears-two", imageUrl: "/Chinese-Thumbnails/newyears2setimagecn.webp", cards: CN_NEWYEARS_TWO_CARDS, imageStyle: newYearsTwoImageStyle },
  { id: CN_KUJI_RAFFLES_SET_ID, name: "Kuji Raffles", family: "misc", href: "/cn-kuji-raffles", imageUrl: "/Chinese-Thumbnails/kujisetimagecn.webp", cards: CN_KUJI_RAFFLES_CARDS, imageStyle: kujiRafflesImageStyle },
  { id: CN_LASER_TICKETS_SET_ID, name: "Laser Tickets", family: "misc", href: "/cn-laser-tickets", imageUrl: "/Chinese-Thumbnails/ticketsetimagecn.webp", cards: CN_LASER_TICKETS_CARDS, imageStyle: laserTicketsImageStyle },
  { id: CN_PROMOS_SET_ID, name: "All Promotional Cards", family: "promos", href: "/cn-promos", imageUrl: "/Chinese-Thumbnails/promossetimagecn.webp", cards: CN_PROMOS_CARDS },
 ];
export const chineseCards: ChineseISOCard[] = chineseSets.flatMap(set => set.cards.map(card => ({ ...card, setId: set.id, setName: set.name, family: set.family, identity: `${set.id}:${card.key}` })));
export const chineseCardsByIdentity = new Map(chineseCards.map(card => [card.identity, card]));
export const getChineseCard = (setId: string, cardKey: string) => chineseCardsByIdentity.get(`${setId}:${cardKey}`);
export const getChineseCardLabel = (card: ChineseCard | null | undefined) => card?.displayName ?? card?.code ?? "";
export const hasChineseCardCode = (card: ChineseCard | null | undefined) => !!card?.code.trim();
export const CHINESE_LASER_TICKET_ASPECT_RATIO = 481 / 1263;
export const isChineseLaserTicket = (card: Pick<ChineseISOCard, "setId" | "key">) => card.setId === CN_LASER_TICKETS_SET_ID;
export const CHINESE_TICKET_ASPECT_RATIO = 1195 / 2048;
export const isChineseKujiFPrize = (card: Pick<ChineseISOCard, "setId" | "key">) => card.setId === "cn-kuji-raffles" && /^4-F-\d+$/.test(card.key);
export const isChineseKujiCPrize = (card: Pick<ChineseISOCard, "setId" | "key">) => card.setId === "cn-kuji-raffles" && (/^[12]-C-\d+$/.test(card.key) || (/^3-C-\d+$/.test(card.key) && Number(card.key.split("-")[2]) >= 7));
export const isChineseKujiStickerBook = (card: Pick<ChineseISOCard, "setId" | "key">) => card.setId === "cn-kuji-raffles" && /^3-E-\d+$/.test(card.key);
export const isChineseKujiMat = (card: Pick<ChineseISOCard, "setId" | "key">) => card.setId === "cn-kuji-raffles" && /^(3-D|4-C)-\d+$/.test(card.key);
export const isChineseTicket = (card: Pick<ChineseISOCard, "setId" | "key">) => card.setId === "cn-kuji-raffles" && (/^(?:[1-4]-TICKET)-\d+$/.test(card.key) || /^3-C-[1-6]$/.test(card.key));
export const isChineseKujiPrize = (card: Pick<ChineseISOCard, "setId" | "key">) => card.setId === "cn-kuji-raffles" && (/^[1-4]-(E|D|B|A|S|LAST)-\d+$/.test(card.key) || /^4-(C|F)-\d+$/.test(card.key) || /^3-F-\d+$/.test(card.key) || isChineseKujiCPrize(card));
export const isChineseRoundedKujiPrize = (card: Pick<ChineseISOCard, "setId" | "key">) => card.setId === "cn-kuji-raffles" && /^(2-E|4-D)-\d+$/.test(card.key);
export const isChineseRoundKujiPin = (card: Pick<ChineseISOCard, "setId" | "key">) => card.setId === "cn-kuji-raffles" && /^4-E-\d+$/.test(card.key);
export const isChineseKujiPin = (card: Pick<ChineseISOCard, "setId" | "key">) => card.setId === "cn-kuji-raffles" && (/^[14]-E-\d+$/.test(card.key) || /^3-F-\d+$/.test(card.key));
export const getChineseCardBorderRadius = (card: Pick<ChineseISOCard, "setId" | "key">) => card.setId === "cn-kuji-raffles" && /^[12]-D-\d+$/.test(card.key) ? "2%" : isChineseKujiStickerBook(card) ? "1.5% / 0.894%" : isChineseKujiCPrize(card) ? 0 : isChineseKujiFPrize(card) ? "3% / 2.16%" : isChineseKujiMat(card) ? "3.2% / 2.26%" : isChineseRoundedKujiPrize(card) ? (card.key.startsWith("2-E-") ? "24% / 14.53%" : "12% / 7.27%") : isChineseRoundKujiPin(card) ? "50%" : isChineseLaserTicket(card) || isChineseTicket(card) ? 0 : isChineseKujiPin(card) ? (card.key.startsWith("3-F-") ? "24% / 14.424%" : "8% / 4.808%") : "4% / 2.857%";
export const getChineseCardAspectRatio = (card: Pick<ChineseISOCard, "setId" | "key">) => isChineseKujiStickerBook(card) ? 644 / 1080 : isChineseKujiCPrize(card) ? 1202 / 2048 : isChineseKujiFPrize(card) ? 925 / 1285 : isChineseKujiMat(card) ? 625 / 885 : isChineseRoundedKujiPrize(card) ? 508 / 839 : isChineseRoundKujiPin(card) ? 1 : isChineseLaserTicket(card) ? CHINESE_LASER_TICKET_ASPECT_RATIO : isChineseTicket(card) ? CHINESE_TICKET_ASPECT_RATIO : isChineseKujiPin(card) ? 616 / 1025 : isChineseKujiPrize(card) ? 1 : chineseSets.find(set => set.id === card.setId)?.wideKeys?.includes(card.key) ? 10 / 7 : 5 / 7;
const ticketCards = chineseCards.filter(isChineseTicket);
const ticketImageSelectors = ticketCards.flatMap(card => [`img[alt=${JSON.stringify(getChineseCardLabel(card))}]`, `img[alt=${JSON.stringify(card.key)}]`]).join(",");
const ticketPocketSelectors = ticketCards.flatMap(card => [`[class*="aspect-"][aria-label^=${JSON.stringify(getChineseCardLabel(card) + ",")}]`, `[class*="aspect-"][title^=${JSON.stringify(getChineseCardLabel(card) + " /")}]`]).join(",");
const ticketZoomOverrides = ticketCards.filter(card => getKujiTicketTransform(card.key) !== `scale(${CHINESE_KUJI_TICKET_ZOOM})`).map(card => `img[alt=${JSON.stringify(getChineseCardLabel(card))}],img[alt=${JSON.stringify(card.key)}]{transform:${getKujiTicketTransform(card.key)}!important;transform-origin:${card.key === "3-TICKET-1" ? "center top" : "center"}!important}`).join("\n");
const ticketLayoutCSS = ticketCards.length ? `
:is([class*="aspect-"],.cn-art,.tp-art-card,.tp-card-image):has(:is([data-cn-ticket],${ticketImageSelectors})),[data-cn-ticket],${ticketPocketSelectors}{aspect-ratio:1195/2048!important;border-radius:0!important}
:is(${ticketImageSelectors}){object-fit:contain!important;transform:scale(${CHINESE_KUJI_TICKET_ZOOM})!important;transform-origin:center!important}
${ticketZoomOverrides}
` : "";
const kujiPrizeCards = chineseCards.filter(card => isChineseKujiPrize(card) && !isChineseKujiPin(card) && !isChineseRoundedKujiPrize(card) && !isChineseKujiMat(card) && !isChineseKujiStickerBook(card) && !isChineseKujiFPrize(card) && !isChineseKujiCPrize(card));
const kujiPrizeImageSelectors = kujiPrizeCards.flatMap(card => [`img[alt=${JSON.stringify(getChineseCardLabel(card))}]`, `img[alt=${JSON.stringify(card.key)}]`]).join(",");
const kujiPrizePocketSelectors = kujiPrizeCards.flatMap(card => [`[class*="aspect-"][aria-label^=${JSON.stringify(getChineseCardLabel(card) + ",")}]`, `[class*="aspect-"][title^=${JSON.stringify(getChineseCardLabel(card) + " /")}]`]).join(",");
const kujiPrizeLayoutCSS = kujiPrizeCards.length ? `
:is([class*="aspect-"],.cn-art,.tp-art-card,.tp-card-image):has(:is(${kujiPrizeImageSelectors})),${kujiPrizePocketSelectors}{aspect-ratio:1!important}
:is(${kujiPrizeImageSelectors}){object-fit:contain!important}
` : "";
const kujiPinCards = chineseCards.filter(card => isChineseKujiPin(card) && !isChineseRoundKujiPin(card));
const kujiPinImageSelectors = kujiPinCards.flatMap(card => [`img[alt=${JSON.stringify(getChineseCardLabel(card))}]`, `img[alt=${JSON.stringify(card.key)}]`]).join(",");
const kujiPinPocketSelectors = kujiPinCards.flatMap(card => [`[class*="aspect-"][aria-label^=${JSON.stringify(getChineseCardLabel(card) + ",")}]`, `[class*="aspect-"][title^=${JSON.stringify(getChineseCardLabel(card) + " /")}]`]).join(",");
const rotatedKujiPinSelectors = kujiPinCards.filter(card => /^1-E-(7|8)$/.test(card.key) || /^3-F-[1-6]$/.test(card.key)).flatMap(card => [`img[alt=${JSON.stringify(getChineseCardLabel(card))}]`, `img[alt=${JSON.stringify(card.key)}]`]).join(",");
const kujiThreeFPinImages = kujiPinCards.filter(card => card.key.startsWith("3-F-")).flatMap(card => [`img[alt=${JSON.stringify(getChineseCardLabel(card))}]`, `img[alt=${JSON.stringify(card.key)}]`]).join(",");
const kujiThreeFPinPockets = kujiPinCards.filter(card => card.key.startsWith("3-F-")).flatMap(card => [`[class*="aspect-"][aria-label^=${JSON.stringify(getChineseCardLabel(card) + ",")}]`, `[class*="aspect-"][title^=${JSON.stringify(getChineseCardLabel(card) + " /")}]`]).join(",");
const kujiPinLayoutCSS = kujiPinCards.length ? `
:is([class*="aspect-"],.cn-art,.tp-art-card,.tp-card-image):has(:is(${kujiPinImageSelectors})),${kujiPinPocketSelectors}{aspect-ratio:616/1025!important;border-radius:8% / 4.808%!important;background:transparent!important;overflow:hidden}
:is(${kujiPinImageSelectors}){object-fit:contain!important}
${kujiThreeFPinImages ? `:is([class*="aspect-"],.cn-art,.tp-art-card,.tp-card-image):has(:is(${kujiThreeFPinImages})),:is(div,button,span):has(> :is(${kujiThreeFPinImages})),${kujiThreeFPinPockets}{border-radius:24% / 14.424%!important}` : ""}
${rotatedKujiPinSelectors ? `:is(${rotatedKujiPinSelectors}){position:absolute!important;left:50%!important;top:50%!important;width:${1025 / 616 * 100}%!important;height:${616 / 1025 * 100}%!important;max-width:none!important;max-height:none!important;transform:translate(-50%,-50%) rotate(-90deg)!important;transform-origin:center!important}` : ""}
` : "";
const laserTicketCards = chineseCards.filter(isChineseLaserTicket);
const laserTicketImageSelectors = laserTicketCards.flatMap(card => [`img[alt=${JSON.stringify(card.code)}]`, `img[alt=${JSON.stringify(card.key)}]`]).join(",");
const laserTicketPocketSelectors = laserTicketCards.flatMap(card => [`[class*="aspect-"][aria-label^=${JSON.stringify(card.code + ",")}]`, `[class*="aspect-"][title^=${JSON.stringify(card.code + " /")}]`]).join(",");
const shiningNoteImageSelectors = laserTicketCards.filter(card => card.rarity === "SH").flatMap(card => [`img[alt=${JSON.stringify(card.code)}]`, `img[alt=${JSON.stringify(card.key)}]`]).join(",");
const laserTicketLayoutCSS = laserTicketCards.length ? `
:is([class*="aspect-"],.cn-art,.tp-art-card,.tp-card-image):has(:is(${laserTicketImageSelectors})),${laserTicketPocketSelectors}{aspect-ratio:481/1263!important;border-radius:0!important;background:transparent!important;overflow:hidden}
:is(${laserTicketImageSelectors}){object-fit:contain!important;transform:rotate(180deg)!important;transform-origin:center!important}
${shiningNoteImageSelectors ? `:is(${shiningNoteImageSelectors}){position:absolute!important;left:50%!important;top:50%!important;width:${1263 / 481 * 100}%!important;height:${481 / 1263 * 100}%!important;max-width:none!important;max-height:none!important;transform:translate(-50%,-50%) rotate(-90deg)!important;transform-origin:center!important}` : ""}
` : "";
const roundKujiPinCards = chineseCards.filter(isChineseRoundKujiPin);
const roundKujiPinImageSelectors = roundKujiPinCards.flatMap(card => [`img[alt=${JSON.stringify(getChineseCardLabel(card))}]`, `img[alt=${JSON.stringify(card.key)}]`]).join(",");
const roundKujiPinPocketSelectors = roundKujiPinCards.flatMap(card => [`[class*="aspect-"][aria-label^=${JSON.stringify(getChineseCardLabel(card) + ",")}]`, `[class*="aspect-"][title^=${JSON.stringify(getChineseCardLabel(card) + " /")}]`]).join(",");
const roundKujiPinLayoutCSS = roundKujiPinCards.length ? `
:is([class*="aspect-"],.cn-art,.tp-art-card,.tp-card-image):has(:is(${roundKujiPinImageSelectors})),${roundKujiPinPocketSelectors}{aspect-ratio:1!important;border-radius:50%!important;background:transparent!important;overflow:hidden}
:is(${roundKujiPinImageSelectors}){object-fit:cover!important;object-position:center!important;border-radius:50%!important;transform:none!important}
` : "";
const roundedKujiPrizeCards = chineseCards.filter(isChineseRoundedKujiPrize);
const roundedKujiPrizeImageSelectors = roundedKujiPrizeCards.flatMap(card => [`img[alt=${JSON.stringify(getChineseCardLabel(card))}]`, `img[alt=${JSON.stringify(card.key)}]`]).join(",");
const roundedKujiPrizePocketSelectors = roundedKujiPrizeCards.flatMap(card => [`[class*="aspect-"][aria-label^=${JSON.stringify(getChineseCardLabel(card) + ",")}]`, `[class*="aspect-"][title^=${JSON.stringify(getChineseCardLabel(card) + " /")}]`]).join(",");
const rotatedKujiDImageSelectors = roundedKujiPrizeCards.filter(card => card.number >= (card.key.startsWith("2-E-") ? 7 : 16)).flatMap(card => [`img[alt=${JSON.stringify(getChineseCardLabel(card))}]`, `img[alt=${JSON.stringify(card.key)}]`]).join(",");
const kujiTwoEImages = roundedKujiPrizeCards.filter(card => card.key.startsWith("2-E-")).flatMap(card => [`img[alt=${JSON.stringify(getChineseCardLabel(card))}]`, `img[alt=${JSON.stringify(card.key)}]`]).join(",");
const kujiTwoEPockets = roundedKujiPrizeCards.filter(card => card.key.startsWith("2-E-")).flatMap(card => [`[class*="aspect-"][aria-label^=${JSON.stringify(getChineseCardLabel(card) + ",")}]`, `[class*="aspect-"][title^=${JSON.stringify(getChineseCardLabel(card) + " /")}]`]).join(",");
const roundedKujiPrizeLayoutCSS = roundedKujiPrizeCards.length ? `
:is([class*="aspect-"],.cn-art,.tp-art-card,.tp-card-image):has(:is(${roundedKujiPrizeImageSelectors})),:is(div,button,span):has(> :is(${roundedKujiPrizeImageSelectors})),${roundedKujiPrizePocketSelectors}{aspect-ratio:508/839!important;border-radius:12% / 7.27%!important;background:transparent!important;overflow:hidden}
:is(${roundedKujiPrizeImageSelectors}){object-fit:cover!important;object-position:center!important}
${kujiTwoEImages ? `:is([class*="aspect-"],.cn-art,.tp-art-card,.tp-card-image):has(:is(${kujiTwoEImages})),:is(div,button,span):has(> :is(${kujiTwoEImages})),${kujiTwoEPockets}{border-radius:24% / 14.53%!important}` : ""}
${rotatedKujiDImageSelectors ? `:is(${rotatedKujiDImageSelectors}){position:absolute!important;left:50%!important;top:50%!important;width:${839 / 508 * 100}%!important;height:${508 / 839 * 100}%!important;max-width:none!important;max-height:none!important;transform:translate(-50%,-50%) rotate(-90deg)!important;transform-origin:center!important}` : ""}
` : "";
const kujiMatCards = chineseCards.filter(isChineseKujiMat);
const kujiMatImageSelectors = kujiMatCards.flatMap(card => [`img[alt=${JSON.stringify(getChineseCardLabel(card))}]`, `img[alt=${JSON.stringify(card.key)}]`]).join(",");
const kujiMatPocketSelectors = kujiMatCards.flatMap(card => [`[class*="aspect-"][aria-label^=${JSON.stringify(getChineseCardLabel(card) + ",")}]`, `[class*="aspect-"][title^=${JSON.stringify(getChineseCardLabel(card) + " /")}]`]).join(",");
const rotatedKujiMatImageSelectors = kujiMatCards.filter(card => card.number >= (card.key.startsWith("3-D-") ? 5 : 9)).flatMap(card => [`img[alt=${JSON.stringify(getChineseCardLabel(card))}]`, `img[alt=${JSON.stringify(card.key)}]`]).join(",");
const kujiMatLayoutCSS = kujiMatCards.length ? `
:is([class*="aspect-"],.cn-art,.tp-art-card,.tp-card-image):has(:is(${kujiMatImageSelectors})),:is(div,button,span):has(> :is(${kujiMatImageSelectors})),${kujiMatPocketSelectors}{aspect-ratio:625/885!important;border-radius:3.2% / 2.26%!important;background:transparent!important;overflow:hidden}
:is(${kujiMatImageSelectors}){object-fit:cover!important;object-position:center!important}
${rotatedKujiMatImageSelectors ? `:is(${rotatedKujiMatImageSelectors}){position:absolute!important;left:50%!important;top:50%!important;width:${885 / 625 * 100}%!important;height:${625 / 885 * 100}%!important;max-width:none!important;max-height:none!important;transform:translate(-50%,-50%) rotate(-90deg)!important;transform-origin:center!important}` : ""}
` : "";
const kujiFPrizeCards = chineseCards.filter(isChineseKujiFPrize);
const kujiFPrizeImageSelectors = kujiFPrizeCards.flatMap(card => [`img[alt=${JSON.stringify(getChineseCardLabel(card))}]`, `img[alt=${JSON.stringify(card.key)}]`]).join(",");
const kujiFPrizePocketSelectors = kujiFPrizeCards.flatMap(card => [`[class*="aspect-"][aria-label^=${JSON.stringify(getChineseCardLabel(card) + ",")}]`, `[class*="aspect-"][title^=${JSON.stringify(getChineseCardLabel(card) + " /")}]`]).join(",");
const kujiFPrizeLayoutCSS = kujiFPrizeCards.length ? `
:is([class*="aspect-"],.cn-art,.tp-art-card,.tp-card-image):has(:is(${kujiFPrizeImageSelectors})),:is(div,button,span):has(> :is(${kujiFPrizeImageSelectors})),${kujiFPrizePocketSelectors}{aspect-ratio:925/1285!important;border-radius:3% / 2.16%!important;background:transparent!important;overflow:hidden}
:is(${kujiFPrizeImageSelectors}){object-fit:cover!important;object-position:center!important;transform:none!important}
` : "";
const kujiCPrizeCards = chineseCards.filter(isChineseKujiCPrize);
const kujiCPrizeImageSelectors = kujiCPrizeCards.flatMap(card => [`img[alt=${JSON.stringify(getChineseCardLabel(card))}]`, `img[alt=${JSON.stringify(card.key)}]`]).join(",");
const kujiCPrizePocketSelectors = kujiCPrizeCards.flatMap(card => [`[class*="aspect-"][aria-label^=${JSON.stringify(getChineseCardLabel(card) + ",")}]`, `[class*="aspect-"][title^=${JSON.stringify(getChineseCardLabel(card) + " /")}]`]).join(",");
const kujiCPrizeLayoutCSS = kujiCPrizeCards.length ? `
:is([class*="aspect-"],.cn-art,.tp-art-card,.tp-card-image):has(:is(${kujiCPrizeImageSelectors})),:is(div,button,span):has(> :is(${kujiCPrizeImageSelectors})),${kujiCPrizePocketSelectors}{aspect-ratio:1202/2048!important;border-radius:0!important;background:transparent!important;overflow:hidden}
:is(${kujiCPrizeImageSelectors}){object-fit:contain!important;object-position:center!important;transform-origin:center!important}
${kujiCPrizeCards.map(card => `:is(img[alt=${JSON.stringify(getChineseCardLabel(card))}],img[alt=${JSON.stringify(card.key)}]){transform:${kujiCPrizeTransforms[card.key] ?? "none"}!important}`).join("\n")}
` : "";
const kujiStickerBookCards = chineseCards.filter(isChineseKujiStickerBook);
const kujiStickerBookImageSelectors = kujiStickerBookCards.flatMap(card => [`img[alt=${JSON.stringify(getChineseCardLabel(card))}]`, `img[alt=${JSON.stringify(card.key)}]`]).join(",");
const kujiStickerBookPocketSelectors = kujiStickerBookCards.flatMap(card => [`[class*="aspect-"][aria-label^=${JSON.stringify(getChineseCardLabel(card) + ",")}]`, `[class*="aspect-"][title^=${JSON.stringify(getChineseCardLabel(card) + " /")}]`]).join(",");
const rotatedKujiStickerBookImageSelectors = kujiStickerBookCards.filter(card => card.number <= 6).flatMap(card => [`img[alt=${JSON.stringify(getChineseCardLabel(card))}]`, `img[alt=${JSON.stringify(card.key)}]`]).join(",");
const kujiStickerBookLayoutCSS = kujiStickerBookCards.length ? `
:is([class*="aspect-"],.cn-art,.tp-art-card,.tp-card-image):has(:is(${kujiStickerBookImageSelectors})),:is(div,button,span):has(> :is(${kujiStickerBookImageSelectors})),${kujiStickerBookPocketSelectors}{aspect-ratio:644/1080!important;border-radius:1.5% / 0.894%!important;background:transparent!important;overflow:hidden}
:is(${kujiStickerBookImageSelectors}){object-fit:contain!important;object-position:center!important;transform:none!important}
${rotatedKujiStickerBookImageSelectors ? `:is(${rotatedKujiStickerBookImageSelectors}){position:absolute!important;left:50%!important;top:50%!important;width:${1080 / 644 * 100}%!important;height:${644 / 1080 * 100}%!important;max-width:none!important;max-height:none!important;transform:translate(-50%,-50%) rotate(-90deg)!important;transform-origin:center!important}` : ""}
` : "";
const squareKujiStickerBooks = chineseCards.filter(card => card.setId === "cn-kuji-raffles" && /^[12]-D-\d+$/.test(card.key));
const squareKujiStickerBookImages = squareKujiStickerBooks.flatMap(card => [`img[alt=${JSON.stringify(getChineseCardLabel(card))}]`, `img[alt=${JSON.stringify(card.key)}]`]).join(",");
const squareKujiStickerBookPockets = squareKujiStickerBooks.flatMap(card => [`[class*="aspect-"][aria-label^=${JSON.stringify(getChineseCardLabel(card) + ",")}]`, `[class*="aspect-"][title^=${JSON.stringify(getChineseCardLabel(card) + " /")}]`]).join(",");
const squareKujiStickerBookCSS = squareKujiStickerBooks.length ? `
:is([class*="aspect-"],.cn-art,.tp-art-card,.tp-card-image):has(:is(${squareKujiStickerBookImages})),:is(div,button,span):has(> :is(${squareKujiStickerBookImages})),${squareKujiStickerBookPockets}{aspect-ratio:1!important;border-radius:2%!important;background:transparent!important;overflow:hidden}
:is(${squareKujiStickerBookImages}){object-fit:contain!important;object-position:center!important;transform:none!important}
` : "";
const moonFourUncroppedURSelectors = Array.from({ length: 15 }, (_, index) => `img[alt=${JSON.stringify(`YH-UR-${String(index + 40).padStart(3, "0")}`)}]`).join(",");
const moonFourUncroppedURCSS = `:is(${moonFourUncroppedURSelectors}){position:absolute!important;inset:0!important;width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;transform:none!important;transform-origin:center!important;object-fit:contain!important;object-position:center!important}`;
const moonFourUncroppedSCSelectors = Array.from({ length: 6 }, (_, index) => `img[alt=${JSON.stringify(`YH-SC-${String(index + 13).padStart(3, "0")}`)}]`).join(",");
const moonFourUncroppedSCCSS = `:is(${moonFourUncroppedSCSelectors}){position:absolute!important;inset:0!important;width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;transform:none!important;transform-origin:center!important;object-fit:contain!important;object-position:center!important}`;
export const chineseTicketLayoutCSS = ticketLayoutCSS + kujiPrizeLayoutCSS + kujiPinLayoutCSS + laserTicketLayoutCSS + roundKujiPinLayoutCSS + roundedKujiPrizeLayoutCSS + kujiMatLayoutCSS + kujiFPrizeLayoutCSS + kujiCPrizeLayoutCSS + kujiStickerBookLayoutCSS + squareKujiStickerBookCSS + moonFourUncroppedURCSS + moonFourUncroppedSCCSS;
export const isWideChineseCard = (card: ChineseISOCard) => !!chineseSets.find(set => set.id === card.setId)?.wideKeys?.includes(card.key);
export const chineseRarityLabel = (rarity: string) => ({ LTR: "Fly With Me 2026", SH: "Shining Note", ANN40: "40th", DST: "\u25C7ST", DSP: "\u25C7SP", SM: "L3", CB: "L4", T: "L4B", S: "L5", DN: "\u25C7N", DCR: "\u25C7CR", DZR: "\u25C7ZR", DAR: "\u25C7AR", DUR: "\u25C7UR", DLSR: "\u25C7LSR" }[rarity] ?? rarity);
export const isChineseSetId = (setId: string | number) => String(setId).toLowerCase().startsWith("cn-");
const SMALL_ZOOM_CODES = new Set(["YH-F01-033", "YH-F01-036", "YH-F01-037", "YH-F01-038", "YH-F01-040", "YH-F01-043", "YH-F01-053", "YH-F01-054", "YH-F01-055", "YH-F01-056", "YH-F01-057", "YH-F01-058", "YH-F01-059", "YH-F01-060", "YH-F01-063", "YH-F01-065", "YH-F01-066", "YH-F01-073", "YH-T01-027", "YH-UR-001", "YH-UR-004", "YH-UR-005", "YH-UR-007", "YH-UR-008", "YH-UR-009", "YH-UR-010", "YH-UR-011", "YH-UR-012", "YH-UR-013"]);
const EXTRA_ZOOM_CODES = new Set(["YH-F01-043", "YH-F01-053", "YH-F01-054", "YH-F01-055", "YH-F01-059", "YH-F01-060", "YH-F01-069", "YH-UR-004", "YH-UR-005", "YH-UR-006", "YH-UR-007", "YH-UR-008", "YH-UR-009", "YH-UR-011", "YH-UR-012", "YH-UR-014"]);
const ADDITIONAL_ZOOM_CODES = new Set(["YH-F01-033", "YH-F01-038", "YH-F01-035", "YH-F01-058", "YH-UR-013"]);
function moonOneImageStyle(key: string): CSSProperties {
const code = chineseSets.find(set => set.id === "cn-moon-one")!.cards.find(card => card.key === key)?.code ?? "";
  if ((code === "YH-T01-003" || code === "YH-T01-008")) return { transform: "none", transformOrigin: "center", objectFit: "contain", objectPosition: "center" };
  if (code.startsWith("YH-F01-")) return { transform: "scale(1.05)", transformOrigin: "center" };
  if (/^YH-UR-00[1-9]$|^YH-UR-01[0-2]$/.test(code)) return { transform: "none", transformOrigin: "center" };
  if (/^(LSR|SGR)-/.test(key)) return { transform: "none" };
  if (["YH-T01-001", "YH-T01-004", "YH-T01-006", "YH-T01-007", "YH-T01-008"].includes(code)) return { transform: "scale(1.035)", transformOrigin: "center" };
const baseScale = key === "SGR-7" ? 1 : /^(LSR|SGR)-/.test(key) ? 1.035 : /^UR-[1-3]$/.test(key) ? 1.025 : 1;
const scale = baseScale + (SMALL_ZOOM_CODES.has(code) ? .025 : 0) + (EXTRA_ZOOM_CODES.has(code) || key.startsWith("HR-") ? .025 : 0) + (ADDITIONAL_ZOOM_CODES.has(code) ? .025 : 0);
  if (/^HR-(27|28|29|30)$/.test(key)) return { position: "absolute", left: "50%", top: "50%", width: "140%", height: "71.428571%", maxWidth: "none", transform: `translate(-50%, -50%) rotate(-90deg) scale(${scale})`, transformOrigin: "center" };
  return { transform: `scale(${scale})`, transformOrigin: "center", ...(key.startsWith("SSR-") ? { position: "absolute", inset: "-3px", width: "calc(100% + 6px)", height: "calc(100% + 6px)", maxWidth: "none" } : {}) };
}
const EXTRA_SSR_ZOOM_CODES = new Set(["YH-T02-017", "YH-T02-018", "YH-T02-020", "YH-T02-023", "YH-T02-026", "YH-T02-027", "YH-T02-028"]);
function moonTwoImageStyle(key: string): CSSProperties {
  const rCode = CN_MOON_TWO_CARDS.find(card => card.key === key)?.code ?? "";
  if (/^SC-[1-6]$/.test(key)) return { transform: "none", transformOrigin: "center", objectFit: "contain", objectPosition: "center" };
  if (/^YH-SGR-0(?:08|09|11|12|13|14)$/.test(rCode)) return { transform: "none", transformOrigin: "center", objectFit: "contain", objectPosition: "center" };
  if (key.startsWith("R-") && rCode.startsWith("YH-F01-")) return rainbowOneImageStyle(`R-${Number(rCode.split("-").pop())}`);
  if (key.startsWith("R-") && rCode.startsWith("YH-T01-")) return moonOneImageStyle(key);
  if (key.startsWith("SR-") && rCode.startsWith("YH-F01-")) return rainbowOneImageStyle(`SR-${Number(rCode.split("-").pop()) - 40}`);
  if (key.startsWith("SSR-") && rCode.startsWith("YH-T01-")) return moonOneImageStyle(`SSR-${Number(rCode.split("-").pop()) - 1}`);
  if (/^UR-(?:[1-9]|1[0-8])$/.test(key)) {
    const number = Number(key.split("-")[1]);
    if (number <= 12) return rainbowOneImageStyle(`UR-${number}`);
    return moonOneImageStyle(key);
  }
  if (/^UR-(?:19|2[0-4])$/.test(key)) return { transform: "none", transformOrigin: "center", objectFit: "contain", objectPosition: "center" };
  if (key.startsWith("HR-")) return { transform: "scale(1.05)", transformOrigin: "center" };
const code = chineseSets.find(set => set.id === "cn-moon-two")!.cards.find(card => card.key === key)?.code ?? "";
const scale = ["YH-T01-024", "YH-T02-020"].includes(code) ? 1.01 : code === "YH-T01-021" ? 1.035 : ["YH-T02-017", "YH-T02-018", "YH-T02-021"].includes(code) ? 1.12 : code === "YH-SGR-010" ? 1.005 : code === "YH-SGR-013" ? 1.015 : key.startsWith("SGR-") || key.startsWith("SC-") ? 1.035 : EXTRA_SSR_ZOOM_CODES.has(code) ? 1.045 : key === "SSR-5" ? 1.11 : ["SSR-1", "SSR-11", "SSR-12"].includes(key) ? 1.045 : key === "SSR-9" ? 1.03 : key.startsWith("SSR-") ? 1.02 : 1;
  if (code === "YH-T02-026") return { position: "absolute", left: -3, top: -3, width: "calc(100% + 6px)", height: "calc(100% + 6px)", maxWidth: "none", transform: `scale(${scale})`, transformOrigin: "center" };
  return { transform: `scale(${scale})`, transformOrigin: "center", ...(key === "SSR-5" && code !== "YH-T01-021" ? { position: "absolute", left: -2, top: -2, width: "calc(100% + 4px)", height: "calc(100% + 4px)", maxWidth: "none" } : {}) };
}
function moonThreeImageStyle(key: string): CSSProperties {
const code = chineseSets.find(set => set.id === "cn-moon-three")!.cards.find(card => card.key === key)?.code ?? "";
  if (key.startsWith("R-") && code.startsWith("YH-F01-")) return rainbowOneImageStyle(`R-${Number(code.split("-").pop())}`);
  if (key.startsWith("R-") && code.startsWith("YH-T01-")) return moonOneImageStyle(`R-${Number(code.split("-").pop())}`);
  if ((key.startsWith("R-") || key.startsWith("SR-") || key.startsWith("SSR-")) && code.startsWith("YH-T02-")) {
    const source = CN_MOON_TWO_CARDS.find(card => card.rarity === key.split("-")[0] && card.code === code);
    if (source) return moonTwoImageStyle(source.key);
  }
  if (key.startsWith("SSR-") && code === "YH-F02-012") return rainbowTwoImageStyle("SSR-12");
  if (key.startsWith("UR-")) {
    const printed = Number(code.split("-").pop());
    if (printed >= 22 && printed <= 24) return moonTwoImageStyle(`UR-${printed}`);
    if (printed >= 25 && printed <= 30) return rainbowTwoImageStyle(`UR-${printed - 24}`);
  }
const scale = ["YH-T03-031", "YH-T03-032"].includes(code) ? 1.08 : key.startsWith("HR-") ? 1.05 : /^YH-UR-03[7-9]$/.test(code) ? 1.06 : /^SC-[2-6]$/.test(key) ? 1.1 : 1;
  if (code === "YH-UR-032") return { position: "absolute", left: -2, top: -2, width: "calc(100% + 4px)", height: "calc(100% + 4px)", maxWidth: "none", transform: "none", transformOrigin: "center" };
  if (key === "HR-16") return { position: "absolute", left: "50%", top: "50%", width: "140%", height: "71.428571%", maxWidth: "none", objectFit: "contain", transform: `translate(-50%, -50%) rotate(-90deg) scale(${scale})`, transformOrigin: "center" };
  if (/^HR-(?:16|2[4-9])$/.test(key)) return { position: "absolute", left: "50%", top: "50%", width: "140%", height: "71.428571%", maxWidth: "none", transform: `translate(-50%, -50%) rotate(-90deg) scale(${scale})`, transformOrigin: "center" };
  return { transform: scale === 1 ? "none" : `scale(${scale})`, transformOrigin: "center" };
}
const MOON_FOUR_SSR_ZOOM_CODES = new Set(["YH-T04-042", "YH-T04-045", "YH-T04-049", "YH-T04-050", "YH-T04-051", "YH-T04-053", "YH-T04-054"]);
function moonFourImageStyle(key: string): CSSProperties {
  if (/^HR-\d+$/.test(key)) key = `HR-${getChineseMoonFourHRImageNumber(Number(key.slice(3)))}`;
const code = chineseSets.find(set => set.id === "cn-moon-four")!.cards.find(card => card.key === key)?.code ?? "";
const scale = ["YH-UR-040", "YH-UR-044"].includes(code) ? 1.12 : /^YH-UR-04[1-9]$/.test(code) ? 1.04 : /^YH-SC-01[4-8]$/.test(code) ? 1.15 : MOON_FOUR_SSR_ZOOM_CODES.has(code) ? 1.035 : 1;
  if (["YH-UR-042", "YH-UR-043"].includes(code)) return { position: "absolute", left: -3, top: -3, width: "calc(100% + 6px)", height: "calc(100% + 6px)", maxWidth: "none", transform: `scale(${scale})`, transformOrigin: "center" };
const hrCrop = /^YH-HR-1(?:0[7-9]|1[0-9]|20)$/.test(code) ? 6 : 3;
  if (/^HR-(?:6|19|2[0-8]|30)$/.test(key)) return { position: "absolute", left: "50%", top: "50%", width: `calc(140% + ${hrCrop * 2}px)`, height: `calc(71.428571% + ${hrCrop * 2}px)`, maxWidth: "none", objectFit: "contain", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center" };
  if (key.startsWith("HR-")) return { position: "absolute", left: -hrCrop, top: -hrCrop, width: `calc(100% + ${hrCrop * 2}px)`, height: `calc(100% + ${hrCrop * 2}px)`, maxWidth: "none", transform: "none", transformOrigin: "center" };
  return { transform: scale === 1 ? "none" : `scale(${scale})`, transformOrigin: "center" };
}
const MOON_FIVE_SSR_ZOOM_CODES = new Set(["YH-T05-051", "YH-T05-052", "YH-T05-055", "YH-T05-056", "YH-T05-057", "YH-T05-058", "YH-T05-059", "YH-T05-060"]);
const MOON_FIVE_UR_ZOOM_CODES = new Set(["YH-UR-055", "YH-UR-056", "YH-UR-057", "YH-UR-058", "YH-UR-059"]);
const MOON_FIVE_UR_EXTRA_ZOOM_CODES = new Set(["YH-UR-060", "YH-UR-061", "YH-UR-062", "YH-UR-063", "YH-UR-068"]);
function moonFiveImageStyle(key: string): CSSProperties {
const code = chineseSets.find(set => set.id === "cn-moon-five")!.cards.find(card => card.key === key)?.code ?? "";
  if (/^(LSR|SGR)-/.test(key)) return { position: "absolute", left: -4, top: -4, width: "calc(100% + 8px)", height: "calc(100% + 8px)", maxWidth: "none", transform: "none", transformOrigin: "center" };
  if (/^HR-2[6-9]$|^HR-30$/.test(key)) return { position: "absolute", left: "50%", top: "50%", width: "140%", height: "71.428571%", maxWidth: "none", objectFit: "contain", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center" };
const scale = code === "YH-T05-047" ? 1.04 : ["YH-T05-050", "YH-T05-053"].includes(code) ? 1.15 : MOON_FIVE_SSR_ZOOM_CODES.has(code) ? 1.035 : MOON_FIVE_UR_EXTRA_ZOOM_CODES.has(code) ? 1.09 : MOON_FIVE_UR_ZOOM_CODES.has(code) ? 1.045 : code === "YH-UR-066" ? 1.025 : 1;
  if (code === "YH-UR-066") return { position: "absolute", left: -4, top: -4, width: "calc(100% + 8px)", height: "calc(100% + 8px)", maxWidth: "none", transform: `scale(${scale})`, transformOrigin: "center" };
  return { transform: scale === 1 ? "none" : `scale(${scale})`, transformOrigin: "center" };
}
const MOON_SIX_ROTATED_KEYS = new Set(["PTR-2", "PTR-3", "PTR-5", "PTR-7", "PTR-13", "PTR-15", "PTR-16", "PTR-17", "PTR-20", "PTR-22", "PTR-23", "PTR-24", "PTR-25", "PTR-28", "PTR-29", "PTR-30", "PTR-32", "PTR-35", "PTR-36", "UR-16", "SC-7"]);
const MOON_SIX_FOUR_PIXEL_KEYS = new Set(["SSR-6", "SSR-13", "SSR-14", "SSR-15", "SSR-18", "SSR-19", "LSR-1", "LSR-2", "LSR-6", "LSR-7", "LSR-9", "LSR-10", "LSR-11", "LSR-12", "LSR-13", "LSR-14"]);
const MOON_SIX_EXTRA_CROP_KEYS = new Set(["SSR-16", "SSR-17", "SSR-20"]);
const MOON_SIX_FIVE_PIXEL_KEYS = new Set(["UR-8", "UR-10", "UR-11", "UR-12", "UR-13", "UR-14", "UR-15", "UR-16"]);
function moonSixImageStyle(key: string): CSSProperties {
  if (key === "UR-9") return { width: "100%", height: "100%", objectFit: "fill", transform: "none", transformOrigin: "center" };
const crop = MOON_SIX_EXTRA_CROP_KEYS.has(key) ? 8 : MOON_SIX_FOUR_PIXEL_KEYS.has(key) ? 4 : MOON_SIX_FIVE_PIXEL_KEYS.has(key) ? 5 : 0;
  if (MOON_SIX_ROTATED_KEYS.has(key)) return { position: "absolute", left: "50%", top: "50%", width: crop ? `calc(140% + ${crop * 2}px)` : "140%", height: crop ? `calc(71.428571% + ${crop * 2}px)` : "71.428571%", maxWidth: "none", objectFit: "contain", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center" };
  if (crop) return { position: "absolute", left: -crop, top: -crop, width: `calc(100% + ${crop * 2}px)`, height: `calc(100% + ${crop * 2}px)`, maxWidth: "none", transform: "none", transformOrigin: "center" };
  return { transform: "none", transformOrigin: "center" };
}
const MOON_SEVEN_ROTATED_KEYS = new Set(["HR-8", "HR-9", "HR-10", "HR-18", "HR-19", "HR-21", "HR-23", "HR-27", "HR-32", "HR-34", "HR-36", "SC-7"]);
function moonSevenImageStyle(key: string): CSSProperties {
const crop = key.startsWith("R-") ? 3 : key.startsWith("UR-") ? 5 : 0;
  if (crop) return { position: "absolute", left: -crop, top: -crop, width: `calc(100% + ${crop * 2}px)`, height: `calc(100% + ${crop * 2}px)`, maxWidth: "none", transform: "none", transformOrigin: "center" };
  if (MOON_SEVEN_ROTATED_KEYS.has(key)) return { position: "absolute", left: "50%", top: "50%", width: "140%", height: "71.428571%", maxWidth: "none", objectFit: key === "HR-21" ? "cover" : "contain", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center" };
  return { transform: "none", transformOrigin: "center" };
}
const MOON_EIGHT_ROTATED_KEYS = new Set([...Array.from({ length: 22 }, (_, index) => `HR-${index + 1}`), "UR-16", "SC-7", "DZR-1"]);
function moonEightImageStyle(key: string): CSSProperties {
  if (MOON_EIGHT_ROTATED_KEYS.has(key)) return { position: "absolute", left: "50%", top: "50%", width: "140%", height: "71.428571%", maxWidth: "none", objectFit: "contain", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center" };
  return { transform: "none", transformOrigin: "center" };
}
const MOON_NINE_ROTATED_KEYS = new Set(Array.from({ length: 22 }, (_, index) => `HR-${index + 1}`));
function moonNineImageStyle(key: string): CSSProperties {
  if (key === "DZR-1") return { objectFit: "contain", transform: "none", transformOrigin: "center" };
  if (MOON_NINE_ROTATED_KEYS.has(key)) return { position: "absolute", left: "50%", top: "50%", width: "140%", height: "71.428571%", maxWidth: "none", objectFit: "contain", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center" };
  return { transform: "none", transformOrigin: "center" };
}
const MOON_TEN_ROTATED_KEYS = new Set([...Array.from({ length: 22 }, (_, index) => `HR-${index + 1}`), "UR-15", "UR-16", "UR-17", "UR-18", "ZR-7"]);
function moonTenImageStyle(key: string): CSSProperties {
  if (MOON_TEN_ROTATED_KEYS.has(key)) return { position: "absolute", left: "50%", top: "50%", width: "140%", height: "71.428571%", maxWidth: "none", objectFit: "contain", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center" };
  if (key === "DZR-2") return { transform: "scale(1.105)", transformOrigin: "center" };
  return { transform: "none", transformOrigin: "center" };
}
const MOON_ELEVEN_ROTATED_KEYS = new Set([...Array.from({ length: 30 }, (_, index) => `R-${index + 1}`), ...Array.from({ length: 22 }, (_, index) => `HR-${index + 1}`), "UR-16", "ZR-7"]);
function moonElevenImageStyle(key: string): CSSProperties {
  if (MOON_ELEVEN_ROTATED_KEYS.has(key)) return { position: "absolute", left: "50%", top: "50%", width: "140%", height: "71.428571%", maxWidth: "none", objectFit: "contain", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center" };
  return { transform: "none", transformOrigin: "center" };
}
const MOON_TWELVE_ROTATED_KEYS = new Set([...Array.from({ length: 30 }, (_, index) => `R-${index + 1}`), ...Array.from({ length: 22 }, (_, index) => `HR-${index + 1}`), "UR-16", "SGR-9", "SGR-10", "SC-7", "DZR-1", "DZR-2"]);
function moonTwelveImageStyle(key: string): CSSProperties {
  if (MOON_TWELVE_ROTATED_KEYS.has(key)) return { position: "absolute", left: "50%", top: "50%", width: "140%", height: "71.428571%", maxWidth: "none", objectFit: "contain", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center" };
  return { transform: "none", transformOrigin: "center" };
}
const FUN_ONE_ROTATED_KEYS = new Set([...Array.from({ length: 20 }, (_, index) => `N-${index + 1}`), ...Array.from({ length: 20 }, (_, index) => `DN-${index + 1}`), "CR-9"]);
function funOneImageStyle(key: string): CSSProperties {
  if (FUN_ONE_ROTATED_KEYS.has(key)) return { position: "absolute", left: "50%", top: "50%", width: "140%", height: "71.428571%", maxWidth: "none", objectFit: "contain", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center" };
const code = chineseSets.find(set => set.id === "cn-fun-one")!.cards.find(card => card.key === key)?.code ?? "";
const scale = ["YH-T03-031", "YH-T03-032"].includes(code) ? 1.08 : ["YH-UR-040", "YH-UR-044"].includes(code) ? 1.12 : /^YH-UR-04[1-9]$/.test(code) ? 1.04 : ["YH-T04-049", "YH-T04-050", "YH-T04-051", "YH-T04-053", "YH-T04-054"].includes(code) ? 1.035 : 1;
  if (["YH-UR-042", "YH-UR-043"].includes(code)) return { position: "absolute", left: -3, top: -3, width: "calc(100% + 6px)", height: "calc(100% + 6px)", maxWidth: "none", transform: `scale(${scale})`, transformOrigin: "center" };
  return { transform: scale === 1 ? "none" : `scale(${scale})`, transformOrigin: "center" };
}
const FUN_TWO_ROTATED_KEYS = new Set([...Array.from({ length: 20 }, (_, index) => `N-${index + 1}`), ...Array.from({ length: 20 }, (_, index) => `DN-${index + 1}`), "CR-10", "CR-11", "CR-12"]);
function funTwoImageStyle(key: string): CSSProperties {
  if (FUN_TWO_ROTATED_KEYS.has(key)) return { position: "absolute", left: "50%", top: "50%", width: "140%", height: "71.428571%", maxWidth: "none", objectFit: "contain", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center" };
const code = chineseSets.find(set => set.id === "cn-fun-two")!.cards.find(card => card.key === key)?.code ?? "";
const scale = ["YH-T04-042", "YH-T04-045", "YH-T04-049", "YH-T04-050", "YH-T04-051", "YH-T04-053", "YH-T04-054", "YH-T05-055", "YH-T05-056", "YH-T05-057", "YH-T05-058", "YH-T05-059", "YH-T05-060"].includes(code) ? 1.035 : code === "YH-UR-060" ? 1.09 : /^YH-UR-05[5-9]$/.test(code) ? 1.045 : code === "YH-UR-066" ? 1.025 : 1;
  if (code === "YH-UR-066") return { position: "absolute", left: -4, top: -4, width: "calc(100% + 8px)", height: "calc(100% + 8px)", maxWidth: "none", transform: `scale(${scale})`, transformOrigin: "center" };
  return { transform: scale === 1 ? "none" : `scale(${scale})`, transformOrigin: "center" };
}
const FUN_THREE_ROTATED_KEYS = new Set([...Array.from({ length: 20 }, (_, index) => `N-${index + 1}`), ...Array.from({ length: 20 }, (_, index) => `DN-${index + 1}`), "CR-10", "CR-11", "CR-12"]);
function funThreeImageStyle(key: string): CSSProperties {
  if (FUN_THREE_ROTATED_KEYS.has(key)) return { position: "absolute", left: "50%", top: "50%", width: "140%", height: "71.428571%", maxWidth: "none", objectFit: "contain", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center" };
const code = chineseSets.find(set => set.id === "cn-fun-three")!.cards.find(card => card.key === key)?.code ?? "";
  if (code === "QY03-UR-009") return { width: "100%", height: "100%", objectFit: "fill", transform: "none", transformOrigin: "center" };
const crop = ["HY06-SSR-016", "HY06-SSR-017", "HY06-SSR-020"].includes(code) ? 8 : ["HY06-SSR-013", "HY06-SSR-014", "HY06-SSR-015", "HY06-SSR-018", "HY06-SSR-019"].includes(code) ? 4 : ["QY03-UR-008", "QY03-UR-010"].includes(code) ? 5 : 0;
  if (crop) return { position: "absolute", left: -crop, top: -crop, width: `calc(100% + ${crop * 2}px)`, height: `calc(100% + ${crop * 2}px)`, maxWidth: "none", transform: "none", transformOrigin: "center" };
const scale = code === "YH-T05-050" ? 1.15 : ["YH-T05-051", "YH-T05-052", "YH-T05-057", "YH-T05-058"].includes(code) ? 1.035 : code === "YH-T05-047" ? 1.04 : 1;
  return { transform: scale === 1 ? "none" : `scale(${scale})`, transformOrigin: "center" };
}
const FUN_FOUR_ROTATED_KEYS = new Set([...Array.from({ length: 20 }, (_, index) => `N-${index + 1}`), ...Array.from({ length: 20 }, (_, index) => `DN-${index + 1}`), "CR-10", "CR-11", "CR-12"]);
function funFourImageStyle(key: string): CSSProperties {
  if (FUN_FOUR_ROTATED_KEYS.has(key)) return { position: "absolute", left: "50%", top: "50%", width: "140%", height: "71.428571%", maxWidth: "none", objectFit: "contain", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center" };
const code = chineseSets.find(set => set.id === "cn-fun-four")!.cards.find(card => card.key === key)?.code ?? "";
const crop = code.startsWith("HY07-R-") ? 3 : key.startsWith("UR-") ? 5 : 0;
  if (crop) return { position: "absolute", left: -crop, top: -crop, width: `calc(100% + ${crop * 2}px)`, height: `calc(100% + ${crop * 2}px)`, maxWidth: "none", transform: "none", transformOrigin: "center" };
  return { transform: "none", transformOrigin: "center" };
}
const FUN_FIVE_ROTATED_KEYS = new Set([...Array.from({ length: 20 }, (_, index) => `N-${index + 1}`), ...Array.from({ length: 20 }, (_, index) => `DN-${index + 1}`), "CR-10", "CR-11", "CR-12"]);
function funFiveImageStyle(key: string): CSSProperties {
  if (FUN_FIVE_ROTATED_KEYS.has(key)) return { position: "absolute", left: "50%", top: "50%", width: "140%", height: "71.428571%", maxWidth: "none", objectFit: "contain", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center" };
const code = chineseSets.find(set => set.id === "cn-fun-five")!.cards.find(card => card.key === key)?.code ?? "";
const crop = code.startsWith("HY07-R-") ? 3 : 0;
  if (crop) return { position: "absolute", left: -crop, top: -crop, width: `calc(100% + ${crop * 2}px)`, height: `calc(100% + ${crop * 2}px)`, maxWidth: "none", transform: "none", transformOrigin: "center" };
  return { transform: "none", transformOrigin: "center" };
}
const FUN_SIX_ROTATED_KEYS = new Set([...Array.from({ length: 20 }, (_, index) => `N-${index + 1}`), ...Array.from({ length: 20 }, (_, index) => `DN-${index + 1}`), "CR-10", "CR-11", "CR-12"]);
function funSixImageStyle(key: string): CSSProperties {
  if (FUN_SIX_ROTATED_KEYS.has(key)) return { position: "absolute", left: "50%", top: "50%", width: "140%", height: "71.428571%", maxWidth: "none", objectFit: "contain", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center" };
  return { transform: "none", transformOrigin: "center" };
}
const FUN_SEVEN_ROTATED_KEYS = new Set([...Array.from({ length: 20 }, (_, index) => `N-${index + 1}`), ...Array.from({ length: 20 }, (_, index) => `DN-${index + 1}`)]);
function funSevenImageStyle(key: string): CSSProperties {
  if (FUN_SEVEN_ROTATED_KEYS.has(key)) return { position: "absolute", left: "50%", top: "50%", width: "140%", height: "71.428571%", maxWidth: "none", objectFit: "contain", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center" };
const scale = key.startsWith("CR-") ? 1.095 : key.startsWith("DCR-") && key !== "DCR-1" ? 1.11 : 1;
  return { transform: scale === 1 ? "none" : `scale(${scale})`, transformOrigin: "center" };
}
const FUN_EIGHT_ROTATED_KEYS = new Set([...Array.from({ length: 20 }, (_, index) => `N-${index + 1}`), ...Array.from({ length: 20 }, (_, index) => `DN-${index + 1}`), ...Array.from({ length: 20 }, (_, index) => `R-${index + 16}`), "DCR-11", "DCR-12"]);
function funEightImageStyle(key: string): CSSProperties {
  if (FUN_EIGHT_ROTATED_KEYS.has(key)) return { position: "absolute", left: "50%", top: "50%", width: "140%", height: "71.428571%", maxWidth: "none", objectFit: "contain", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center" };
  return { transform: "none", transformOrigin: "center" };
}
const FUN_NINE_ROTATED_KEYS = new Set([...Array.from({ length: 20 }, (_, index) => `N-${index + 1}`), ...Array.from({ length: 20 }, (_, index) => `DN-${index + 1}`), ...Array.from({ length: 35 }, (_, index) => `R-${index + 1}`), ...Array.from({ length: 9 }, (_, index) => `UGR-${index + 1}`), "CR-10", "CR-11", "CR-12"]);
function funNineImageStyle(key: string): CSSProperties {
  if (FUN_NINE_ROTATED_KEYS.has(key)) return { position: "absolute", left: "50%", top: "50%", width: "140%", height: "71.428571%", maxWidth: "none", objectFit: "contain", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center" };
  return { transform: key === "CR-5" ? "scale(1.05)" : "none", transformOrigin: "center" };
}
function rainbowOneImageStyle(key: string): CSSProperties {
const rarity = key.split("-")[0];
  return { transform: ["R", "SR", "SSR", "TR", "TGR"].includes(rarity) ? "scale(1.05)" : "none", transformOrigin: "center" };
}
function rainbowTwoImageStyle(key: string): CSSProperties {
const card = CN_RAINBOW_TWO_CARDS.find(item => item.key === key);
    if (card) {
const printedNumber = Number(card.code.split("-").pop());
        if (card.code.startsWith("YH-F01-")) return rainbowOneImageStyle(card.key);
        if (card.code.startsWith("YH-T01-") || card.rarity === "UR" && printedNumber <= 18) {
const source = CN_MOON_ONE_CARDS.find(item => item.rarity === card.rarity && item.code === card.code);
            if (source) return moonOneImageStyle(source.key);
        }
        if (card.code.startsWith("YH-T02-") || card.rarity === "UR" && printedNumber <= 24) {
const source = CN_MOON_TWO_CARDS.find(item => item.rarity === card.rarity && item.code === card.code);
            if (source) return moonTwoImageStyle(source.key);
        }
    }
const scale = /^SSR-(?:[7-9]|1[0-2])$/.test(key) ? 1.07 : ["UR-1", "UR-2", "UR-4", "UR-5", "UR-6"].includes(key) ? 1.05 : 1;
  return { transform: scale === 1 ? "none" : `scale(${scale})`, transformOrigin: "center" };
}
export { rainbowTwoImageStyle as getChineseRainbowTwoImageStyle };
function rainbowThreeImageStyle(key: string): CSSProperties {
  if (key === "XR-7") return { position: "absolute", left: "50%", top: "50%", width: "140%", height: "71.428571%", maxWidth: "none", objectFit: "contain", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center" };
const code = chineseSets.find(set => set.id === "cn-rainbow-three")!.cards.find(card => card.key === key)?.code ?? "";
const scale = /^YH-UR-04[5-9]$/.test(code) ? 1.04 : ["YH-T04-042", "YH-T04-045", "YH-T04-049", "YH-T04-050", "YH-T04-051", "YH-T04-053", "YH-T04-054", "YH-T05-055", "YH-T05-056", "YH-T05-057", "YH-T05-058", "YH-T05-059", "YH-T05-060"].includes(code) ? 1.035 : code === "YH-UR-060" ? 1.09 : /^YH-UR-05[5-9]$/.test(code) ? 1.045 : code === "YH-UR-066" ? 1.025 : 1;
  if (code === "YH-UR-066") return { position: "absolute", left: -4, top: -4, width: "calc(100% + 8px)", height: "calc(100% + 8px)", maxWidth: "none", transform: `scale(${scale})`, transformOrigin: "center" };
  return { transform: scale === 1 ? "none" : `scale(${scale})`, transformOrigin: "center" };
}
function rainbowFourImageStyle(key: string): CSSProperties {
  if (key === "UR-9") return { width: "100%", height: "100%", objectFit: "fill", transform: "none", transformOrigin: "center" };
const crop = key.startsWith("FR-") ? 4 : ["SSR-7", "SSR-8", "SSR-9"].includes(key) ? 8 : ["UR-8", "UR-10", "UR-11", "UR-12", "UR-13", "UR-14", "UR-15"].includes(key) ? 5 : 0;
  if (crop) return { position: "absolute", left: -crop, top: -crop, width: `calc(100% + ${crop * 2}px)`, height: `calc(100% + ${crop * 2}px)`, maxWidth: "none", transform: "none", transformOrigin: "center" };
const scale = key.startsWith("MTR-") ? 1.04 : key === "SSR-10" ? 1.04 : key === "SSR-11" ? 1.15 : ["SSR-12", "SSR-13", "SSR-14", "SSR-15"].includes(key) ? 1.035 : 1;
  return { transform: scale === 1 ? "none" : `scale(${scale})`, transformOrigin: "center" };
}
function rainbowFiveImageStyle(key: string): CSSProperties {
  if (key === "XR-8") return { position: "absolute", left: "50%", top: "50%", width: "140%", height: "71.428571%", maxWidth: "none", objectFit: "contain", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center" };
  return { transform: "none", transformOrigin: "center" };
}
function starOneImageStyle(key: string): CSSProperties {
  if (["USR-2", "USR-5", "USR-7"].includes(key)) return { position: "absolute", left: "50%", top: "50%", width: "140%", height: "71.428571%", maxWidth: "none", objectFit: "contain", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center" };
  return { transform: "none", transformOrigin: "center" };
}
function starTwoImageStyle(key: string): CSSProperties {
  if (["USR-1", "USR-3", "USR-6", "USR-13", "USR-14"].includes(key)) return { position: "absolute", left: "50%", top: "50%", width: "140%", height: "71.428571%", maxWidth: "none", objectFit: "contain", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center" };
  return { transform: "none", transformOrigin: "center" };
}
function starThreeImageStyle(key: string): CSSProperties {
  if (/^(UR|USR)-/.test(key)) return { position: "absolute", left: "50%", top: "50%", width: "140%", height: "71.428571%", maxWidth: "none", objectFit: "contain", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center" };
  return { transform: "none", transformOrigin: "center" };
}
function promosImageStyle(key: string): CSSProperties {
  if (key === "ANN40-1") return { position: "absolute", left: "50%", top: "50%", width: "140%", height: "71.428571%", maxWidth: "none", objectFit: "contain", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center" };
  if (key === "PR-6") return { transform: "scale(1.035)", transformOrigin: "center" };
  if (key === "KB-3") return { transform: "scale(1.035)", transformOrigin: "center" };
  if (/^KB-[123]$/.test(key)) return { transform: "scale(1.025)", transformOrigin: "center" };
  if (key === "TFXMLP-1") return { position: "absolute", left: -2, top: -2, width: "calc(100% + 4px)", height: "calc(100% + 4px)", maxWidth: "none", transform: "none", transformOrigin: "center" };
  if (key === "TFXMLP-2") return { transform: "scale(1.035)", transformOrigin: "center" };
const scale = ["PR-35", "PR-76", "PR-50", "PR-24", "PR-20", "PR-4", "PR-5"].includes(key) ? 1.05 : key === "PR-26" ? 1.11 : key === "PR-81" ? 1.105 : key === "PR-72" ? 1.09 : key === "PR-82" ? 1.06 : ["PR-10", "PR-11", "PR-17", "PR-18", "PR-19", "PR-D19", "PR-23", "PR-25", "PR-27", "PR-47", "PR-48", "PR-69", "PR-70"].includes(key) ? 1.035 : 1;
  if (["PR-21", "PR-25", "PR-27", "PR-51", "PR-53", "PR-67", "PR-68"].includes(key)) return { position: "absolute", left: "50%", top: "50%", width: "140%", height: "71.428571%", maxWidth: "none", objectFit: "contain", transform: `translate(-50%, -50%) rotate(-90deg) scale(${scale})`, transformOrigin: "center" };
  return { transform: scale === 1 ? "none" : `scale(${scale})`, transformOrigin: "center" };
}
const imageStyles: Record<string, (key: string) => CSSProperties> = {
  "cn-moon-one": moonOneImageStyle,
  "cn-moon-two": moonTwoImageStyle,
  "cn-moon-three": moonThreeImageStyle,
  "cn-moon-four": moonFourImageStyle,
  "cn-moon-five": moonFiveImageStyle,
  "cn-moon-six": moonSixImageStyle,
  "cn-moon-seven": moonSevenImageStyle,
  "cn-moon-eight": moonEightImageStyle,
  "cn-moon-nine": moonNineImageStyle,
  "cn-moon-ten": moonTenImageStyle,
  "cn-moon-eleven": moonElevenImageStyle,
  "cn-moon-twelve": moonTwelveImageStyle,
  "cn-fun-one": funOneImageStyle,
  "cn-fun-two": funTwoImageStyle,
  "cn-fun-three": funThreeImageStyle,
  "cn-fun-four": funFourImageStyle,
  "cn-fun-five": funFiveImageStyle,
  "cn-fun-six": funSixImageStyle,
  "cn-fun-seven": funSevenImageStyle,
  "cn-fun-eight": funEightImageStyle,
  "cn-fun-nine": funNineImageStyle,
  "cn-rainbow-one": rainbowOneImageStyle,
  "cn-rainbow-two": rainbowTwoImageStyle,
  "cn-rainbow-three": rainbowThreeImageStyle,
  "cn-rainbow-four": rainbowFourImageStyle,
  "cn-rainbow-five": rainbowFiveImageStyle,
  "cn-star-one": starOneImageStyle,
  "cn-star-two": starTwoImageStyle,
  "cn-star-three": starThreeImageStyle,
  "cn-promos": promosImageStyle,
};
export const getChineseISOImageStyle = (card: ChineseISOCard): CSSProperties => (/^HY06-LSR-\d{3}$/.test(card.code) || /\/Chinese(?:%20| )Sets\/Moon-Six-CN\/CN-M6-LSR\d+\.webp/.test(card.image)) ? { position: "absolute", inset: 0, width: "100%", height: "100%", maxWidth: "none", transform: "none", transformOrigin: "center", objectFit: "contain", objectPosition: "center" } : (card.code === "HY06-UR-016" || card.image.includes("/HY06-UR-016.webp")) ? { position: "absolute", left: "50%", top: "50%", width: "140%", height: "71.4285714286%", maxWidth: "none", objectFit: "contain", objectPosition: "center", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center" } : (CHINESE_REPLACEMENT_FRONT_CODES.has(card.code) || card.image.includes("/card-backs/Chinese/Replacements/")) ? { position: "absolute", inset: 0, width: "100%", height: "100%", maxWidth: "none", transform: "none", transformOrigin: "center", objectFit: "contain", objectPosition: "center" } : (card.code === "YH-T01-003" || card.code === "YH-T01-008") ? { transform: "none", transformOrigin: "center", objectFit: "contain", objectPosition: "center" } : /^YH-(?:UR-0(?:4[0-9]|5[0-4])|SC-01[3-8])$/.test(card.code) ? { transform: "none", transformOrigin: "center", objectFit: "contain", objectPosition: "center" } : chineseSets.find(set => set.id === card.setId)?.imageStyle?.(card.key) ?? imageStyles[card.setId]?.(card.key) ?? {};
function stardustOneImageStyle(key: string): CSSProperties {
  if (key === "DUR-7" || key === "DLSR-7" || /^SP-[1-5]$/.test(key)) return { position: "absolute", left: "50%", top: "50%", width: "140%", height: "71.428571%", maxWidth: "none", objectFit: "contain", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center" };
  return { transform: "none", transformOrigin: "center" };
}
function stardustTwoImageStyle(key: string): CSSProperties {
  const [rarity, value] = key.split("-");
  const number = Number(value);
  const rotated = (rarity === "SGR" && [1, 3, 4, 5, 8, 9].includes(number)) || (rarity === "DLSR" && number === 10) || (rarity === "SP" && [7, 8, 9, 10, 12, 13].includes(number));
  if (rotated) return { position: "absolute", left: "50%", top: "50%", width: "140%", height: "71.428571%", maxWidth: "none", objectFit: "contain", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center" };
  return { transform: "none", transformOrigin: "center" };
}
function magicBookOneImageStyle(key: string): CSSProperties {
  if (key === "ZP-19" || key === "ZP-20") return { position: "absolute", left: "50%", top: "50%", width: "140%", height: "71.428571%", maxWidth: "none", objectFit: "contain", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center" };
  return { transform: "none", transformOrigin: "center" };
}
function newYearsOneImageStyle(key: string): CSSProperties {
  if (/^T-[1-6]$/.test(key)) return { objectFit: "contain", objectPosition: "center", transform: "none", transformOrigin: "center" };
  if (/^SM-[1-6]$/.test(key)) return { position: "absolute", left: "50%", top: "50%", width: "140%", height: "71.428571%", maxWidth: "none", objectFit: "contain", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center" };
  return { transform: "none", transformOrigin: "center" };
}
function newYearsTwoImageStyle(key: string): CSSProperties {
  if (/^ZH-[1-8]$/.test(key)) return { objectFit: "contain", objectPosition: "center", transform: "none", transformOrigin: "center" };
  if (key === "TR-2") return { position: "absolute", left: "50%", top: "50%", width: "140%", height: "71.428571%", maxWidth: "none", objectFit: "contain", transform: "translate(-50%, -50%) rotate(-90deg) scale(1.07)", transformOrigin: "center" };
  if (key === "SP-7" || key === "SP-8" || /^MT-[1-6]$/.test(key) || /^TR-(?:[1-9]|1[0-8])$/.test(key)) return { position: "absolute", left: "50%", top: "50%", width: "140%", height: "71.428571%", maxWidth: "none", objectFit: "contain", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center" };
  return { transform: "none", transformOrigin: "center" };
}
