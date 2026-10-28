import { CHINESE_MOON_THIRTEEN_CODES, CHINESE_MOON_ONE_CODES, CHINESE_MOON_TWO_CODES, CHINESE_MOON_THREE_CODES, CHINESE_MOON_FOUR_CODES, CHINESE_MOON_FIVE_CODES, CHINESE_MOON_SIX_CODES, CHINESE_MOON_SEVEN_CODES, CHINESE_MOON_EIGHT_CODES, CHINESE_MOON_NINE_CODES, CHINESE_MOON_TEN_CODES, CHINESE_MOON_ELEVEN_CODES, CHINESE_MOON_TWELVE_CODES, CHINESE_FUN_ONE_CODES, CHINESE_FUN_TWO_CODES, CHINESE_FUN_THREE_CODES, CHINESE_FUN_FOUR_CODES, CHINESE_FUN_FIVE_CODES, CHINESE_FUN_SIX_CODES, CHINESE_FUN_SEVEN_CODES, CHINESE_FUN_EIGHT_CODES, CHINESE_FUN_NINE_CODES, CHINESE_RAINBOW_ONE_CODES, CHINESE_RAINBOW_TWO_CODES, CHINESE_RAINBOW_THREE_CODES, CHINESE_RAINBOW_FOUR_CODES, CHINESE_RAINBOW_FIVE_CODES, CHINESE_STAR_ONE_CODES, CHINESE_STAR_TWO_CODES, CHINESE_STAR_THREE_CODES, CHINESE_PROMOS_CODES, CHINESE_STARDUST_ONE_CODES, CHINESE_STARDUST_TWO_CODES, CHINESE_MAGICBOOK_ONE_CODES, CHINESE_NEWYEARS_ONE_CODES, CHINESE_NEWYEARS_TWO_CODES, CHINESE_KUJI_RAFFLES_CODES, CHINESE_LASER_TICKETS_CODES } from "./Chinese Codes + Char/Chinese-Codes";
import { useEffect, useState, type CSSProperties } from "react";
import { supabase } from "@/lib/supabase";
import { onAuthIdentityChange } from "@/lib/auth-identity";
import { CARD_IMAGE_WORKER_URL } from "@/lib/card-images";
import { getCachedCardImage } from "@/lib/card-image-cache";
export const CHINESE_REPLACEMENT_FRONT_CODES = new Set(["YH-T05-047", "YH-T05-050", ...Array.from({ length: 10 }, (_, index) => `YH-T05-${String(index + 51).padStart(3, "0")}`), ...Array.from({ length: 16 }, (_, index) => `HY06-UR-${String(index + 1).padStart(3, "0")}`)]);
export function getChineseReplacementFront(code: string): string | undefined {
  return CHINESE_REPLACEMENT_FRONT_CODES.has(code) ? getChineseCardImage(`card-backs/Chinese/Replacements/${code}.webp`) : undefined;
}
export const CN_MOON_ONE_F01_R_REFRESH = "20261027-f01-r009-032-replaced-v1";
export const CN_MOON_TWO_T01_SR_REFRESH = "20261027-t01-sr009-016-replaced-v1";
export const CN_MOON_ONE_UR_REFRESH = "20261027-m1-ur001-018-replaced-v2";
export function refreshChineseMoonOneFront(src: string): string {
  const url = new URL(src);
  const path = decodeURIComponent(url.pathname);
  const revision = /^\/Chinese Sets\/Rainbow-One-CN\/CN-R1-R(?:9|[12]\d|3[0-2])\.webp$/.test(path) ? CN_MOON_ONE_F01_R_REFRESH : /^\/Chinese Sets\/Moon-Two-CN\/CN-M2-SR[1-8]\.webp$/.test(path) ? CN_MOON_TWO_T01_SR_REFRESH : /^\/Chinese Sets\/(?:Rainbow-One-CN\/CN-R1-UR(?:[1-9]|1[0-2])|Moon-One-CN\/CN-M1-UR1[3-8])\.webp$/.test(path) ? CN_MOON_ONE_UR_REFRESH : undefined;
  if (!revision) return src;
  url.searchParams.set("v", revision);
  url.searchParams.set("refresh", revision);
  return url.href;
}
function withChineseReplacementFront<T extends { code: string; image: string }>(card: T): T {
  const image = refreshChineseMoonOneFront(getChineseReplacementFront(card.code) ?? card.image);
  return image !== card.image ? { ...card, image } : card;
}
const replacementFrontStyles = new Map<string, { node: HTMLStyleElement; users: number }>();
function retainUncroppedFrontStyle(source: string, resolved: string): () => void {
  const url = new URL(source);
  const code = decodeURIComponent(url.pathname).match(/^\/card-backs\/Chinese\/Replacements\/((?:YH-T05|HY06-UR)-\d{3})\.webp$/)?.[1];
  const freshMoonSixLSR = /^\/Chinese Sets\/Moon-Six-CN\/CN-M6-LSR\d+\.webp$/.test(decodeURIComponent(url.pathname)) && url.searchParams.get("refresh") === CN_MOON_SIX_LSR_REVISION;
  if ((!code || !CHINESE_REPLACEMENT_FRONT_CODES.has(code)) && !freshMoonSixLSR) return () => {};
  let entry = replacementFrontStyles.get(resolved);
  if (!entry) {
    const node = document.createElement("style");
    const framing = code === "HY06-UR-016"
      ? "transform:translate(-50%,-50%) rotate(-90deg)!important;inset:auto!important;left:50%!important;top:50%!important;width:140%!important;height:71.4285714286%!important"
      : "transform:none!important;inset:0!important;left:0!important;top:0!important;width:100%!important;height:100%!important";
    node.textContent = `img[src=${JSON.stringify(resolved)}]{object-fit:contain!important;object-position:center!important;transform-origin:center!important;${framing};max-width:none!important;max-height:none!important}`;
    document.head.appendChild(node);
    entry = { node, users: 0 };
    replacementFrontStyles.set(resolved, entry);
  }
  entry.users += 1;
  const retained = entry;
  return () => {
    retained.users -= 1;
    if (retained.users === 0) { retained.node.remove(); replacementFrontStyles.delete(resolved); }
  };
}
export const CN_MOON_ONE_IMAGE_REVISION = "20261021-m1-gallery-157-v2";
export const CN_MOON_TWO_IMAGE_REVISION = "20261022-m2-cloudflare-replaced-images-v4";
export const CN_MOON_THREE_IMAGE_REVISION = "20261021-m3-complete-115-v1";
export const CN_MOON_FOUR_IMAGE_REVISION = "20261021-m4-complete-132-v1";
export const CN_MOON_FIVE_IMAGE_REVISION = "20261021-m5-complete-134-v1";
export const CN_MOON_SIX_LSR_REVISION = "20261027-m6-lsr-replaced-v1";
export const CN_MOON_SIX_IMAGE_REVISION = "20261021-m6-complete-152-v1";
export const CN_MOON_SEVEN_IMAGE_REVISION = "20261021-m7-complete-186-v1";
export const CN_MOON_EIGHT_IMAGE_REVISION = "20261021-m8-complete-189-v1";
export const CN_MOON_NINE_IMAGE_REVISION = "20261021-m9-complete-158-v1";
export const CN_MOON_TEN_IMAGE_REVISION = "20261021-m10-complete-158-v1";
export const CN_MOON_ELEVEN_IMAGE_REVISION = "20261022-m11-complete-162-v1";
export const CN_MOON_THIRTEEN_IMAGE_REVISION = "20261027-m13-code-fronts-backs-v1";
export const CN_MOON_TWELVE_IMAGE_REVISION = "20261022-m12-complete-164-v1";
const CN_IMAGE_ROOT = "Chinese Sets/Moon-One-CN";
export function getChineseCardImage(path: string): string {
const normalized = path.replace(/^\/+/, "").replace(/^mlpekayou-card-images\//, "");
    return `${CARD_IMAGE_WORKER_URL.replace(/\/$/, "")}/${normalized.split("/").map(encodeURIComponent).join("/")}`;
}
export const getChineseMoonFourHRImageNumber = (number: number) => {
const sourceNumber = number === 23 ? 28 : number >= 24 && number <= 28 ? number - 1 : number;
    return sourceNumber === 16 ? 29 : sourceNumber >= 17 && sourceNumber <= 29 ? sourceNumber - 1 : sourceNumber;
};
export const cardImagePathsCN = {
    moonTwelve: (rarity: string, number: number | string): string => {
const code = rarity.trim().toUpperCase();
const index = Number(number);
        if (!/^[A-Z]+$/.test(code) || !Number.isSafeInteger(index) || index < 1)
            throw new Error("Invalid Chinese Moon Twelve card code.");
const filename = `CN-M12-${code}${index}.webp`;
        return `${getChineseCardImage(`Chinese Sets/Moon-Twelve-CN/${filename}`)}?v=${CN_MOON_TWELVE_IMAGE_REVISION}`;
    },
    moonEleven: (rarity: string, number: number | string): string => {
const code = rarity.trim().toUpperCase();
const index = Number(number);
        if (!/^[A-Z]+$/.test(code) || !Number.isSafeInteger(index) || index < 1)
            throw new Error("Invalid Chinese Moon Eleven card code.");
const filename = `CN-M11-${code}${index}.webp`;
        return `${getChineseCardImage(`Chinese Sets/Moon-Eleven-CN/${filename}`)}?v=${CN_MOON_ELEVEN_IMAGE_REVISION}`;
    },
    moonTen: (rarity: string, number: number | string): string => {
const code = rarity.trim().toUpperCase();
const index = Number(number);
        if (!/^[A-Z]+$/.test(code) || !Number.isSafeInteger(index) || index < 1)
            throw new Error("Invalid Chinese Moon Ten card code.");
const filename = `CN-M10-${code}${index}.webp`;
        return `${getChineseCardImage(`Chinese Sets/Moon-Ten-CN/${filename}`)}?v=${CN_MOON_TEN_IMAGE_REVISION}`;
    },
    moonNine: (rarity: string, number: number | string): string => {
const code = rarity.trim().toUpperCase();
const index = Number(number);
        if (!/^[A-Z]+$/.test(code) || !Number.isSafeInteger(index) || index < 1)
            throw new Error("Invalid Chinese Moon Nine card code.");
const filename = code === "DZR" ? "CN-M9-DZR.webp" : `CN-M9-${code}${index}.webp`;
        return `${getChineseCardImage(`Chinese Sets/Moon-Nine-CN/${filename}`)}?v=${CN_MOON_NINE_IMAGE_REVISION}${code === "R" && index === 29 ? "&refresh=20261024-m9-r29-replaced-v1" : ""}`;
    },
    moonEight: (rarity: string, number: number | string): string => {
const code = rarity.trim().toUpperCase();
const index = Number(number);
        if (!/^[A-Z]+$/.test(code) || !Number.isSafeInteger(index) || index < 1)
            throw new Error("Invalid Chinese Moon Eight card code.");
const filename = code === "DZR" ? "CN-M8-DZR.webp" : `CN-M8-${code}${index}.webp`;
        return `${getChineseCardImage(`Chinese Sets/Moon-Eight-CN/${filename}`)}?v=${CN_MOON_EIGHT_IMAGE_REVISION}`;
    },
    moonSeven: (rarity: string, number: number | string): string => {
const code = rarity.trim().toUpperCase();
const index = Number(number);
        if (!/^[A-Z]+$/.test(code) || !Number.isSafeInteger(index) || index < 1)
            throw new Error("Invalid Chinese Moon Seven card code.");
        return `${getChineseCardImage(`Chinese Sets/Moon-Seven-CN/CN-M7-${code}${index}.webp`)}?v=${CN_MOON_SEVEN_IMAGE_REVISION}`;
    },
    moonSix: (rarity: string, number: number | string): string => {
const code = rarity.trim().toUpperCase();
const index = Number(number);
        if (!/^[A-Z]+$/.test(code) || !Number.isSafeInteger(index) || index < 1)
            throw new Error("Invalid Chinese Moon Six card code.");
        if (code === "LSR") return `${getChineseCardImage(`Chinese Sets/Moon-Six-CN/CN-M6-${code}${index}.webp`)}?v=${CN_MOON_SIX_LSR_REVISION}&refresh=${CN_MOON_SIX_LSR_REVISION}`;
        return `${getChineseCardImage(`Chinese Sets/Moon-Six-CN/CN-M6-${code}${index}.webp`)}?v=${CN_MOON_SIX_IMAGE_REVISION}`;
    },
    moonFive: (rarity: string, number: number | string): string => {
const code = rarity.trim().toUpperCase();
const index = Number(number);
        if (!/^[A-Z]+$/.test(code) || !Number.isSafeInteger(index) || index < 1)
            throw new Error("Invalid Chinese Moon Five card code.");
        if (code === "R" && index >= 21 && index <= 35)
            return getChineseMoonFourFront(index - 20, "R");
        if (code === "R" && index >= 36 && index <= 40)
            return getChineseMoonThreeFront(index - 28, "R");
const filePrefix = ["R", "SR", "HR"].includes(code) ? "CN-M4" : "CN-M5";
        return `${getChineseCardImage(`Chinese Sets/Moon-Five-CN/${filePrefix}-${code}${index}.webp`)}?v=${CN_MOON_FIVE_IMAGE_REVISION}`;
    },
    moonFour: (rarity: string, number: number | string): string => {
const code = rarity.trim().toUpperCase();
const index = Number(number);
        if (!/^[A-Z]+$/.test(code) || !Number.isSafeInteger(index) || index < 1)
            throw new Error("Invalid Chinese Moon Four card code.");
        if (code === "R" && index >= 21 && index <= 32)
            return getChineseMoonThreeFront(index - 20, "R");
        if (code === "R" && index >= 33 && index <= 40)
            return getChineseMoonTwoFront(index - 24, "R");
const imageNumber = code === "HR" ? getChineseMoonFourHRImageNumber(index) : index;
        return `${getChineseCardImage(`Chinese Sets/Moon-Four-CN/CN-M4-${code}${imageNumber}.webp`)}?v=${CN_MOON_FOUR_IMAGE_REVISION}${code === "SC" && index >= 1 && index <= 6 ? "&refresh=20261024-m4-sc13-18-replaced-v1" : ""}${code === "UR" && index >= 1 && index <= 15 ? "&refresh=20261024-m4-ur40-54-replaced-v1" : ""}`;
    },
    moonThree: (rarity: string, number: number | string): string => {
const code = rarity.trim().toUpperCase();
const index = Number(number);
        if (!/^[A-Z]+$/.test(code) || !Number.isSafeInteger(index) || index < 1)
            throw new Error("Invalid Chinese Moon Three card code.");
        if (code === "R" && index >= 13 && index <= 20)
            return getChineseMoonTwoFront(index - 4, "R");
        if (code === "R" && index >= 21 && index <= 28)
            return getChineseMoonOneFront(index - 20, "R");
        if (code === "R" && index >= 29 && index <= 41)
            return `${getChineseCardImage(`Chinese Sets/Rainbow-One-CN/CN-R1-R${index - 21}.webp`)}?v=${CN_MOON_THREE_IMAGE_REVISION}`;
        if (code === "SR" && index >= 13 && index <= 20)
            return getChineseMoonTwoFront(index - 4, "SR");
        if (code === "SSR" && index >= 16 && index <= 19)
            return getChineseMoonTwoFront(index + 3, "SSR");
        if (code === "SSR" && index === 20)
            return `${getChineseCardImage("Chinese Sets/Rainbow-Two-CN/CN-R2-SSR12.webp")}?v=${CN_MOON_THREE_IMAGE_REVISION}`;
        if (code === "UR" && index >= 10 && index <= 12)
            return getChineseMoonTwoFront(index + 12, "UR");
        if (code === "UR" && index >= 13 && index <= 18)
            return `${getChineseCardImage(`Chinese Sets/Rainbow-Two-CN/CN-R2-UR${index - 12}.webp`)}?v=${CN_MOON_THREE_IMAGE_REVISION}`;
const imageIndex = code === "HR" && index >= 15 && index <= 30 ? index + 1 : index;
        return `${getChineseCardImage(`Chinese Sets/Moon-Three-CN/CN-M3-${code}${imageIndex}.webp`)}?v=${CN_MOON_THREE_IMAGE_REVISION}`;
    },
    moonOne: (rarity: string, number: number | string): string => {
const code = rarity.trim().toUpperCase();
const index = Number(number);
        if (!/^[A-Z]+$/.test(code) || !Number.isSafeInteger(index) || index < 1)
            throw new Error("Invalid Chinese Moon One card code.");
        if (code === "R" && index === 3)
            return `${getChineseCardImage("Chinese Sets/Moon-One-CN/YH-T01-003.webp")}?v=20261026-t01-003-correct-image-v1`;
        if (code === "R" && index === 8)
            return `${getChineseCardImage("Chinese Sets/Moon-One-CN/YH-T01-008.webp")}?v=20261026-t01-008-correct-image-v1`;
        return `${getChineseCardImage(`${CN_IMAGE_ROOT}/CN-M1-${code}${index}.webp`)}?v=${CN_MOON_ONE_IMAGE_REVISION}${code === "UR" && index >= 13 && index <= 18 ? "&refresh=20261024-m1-ur13-18-replaced-v1" : ""}`;
    },
};
export const getChineseMoonOneFront = (number: number | string, rarity = "R") => cardImagePathsCN.moonOne(rarity, number);
export const CN_MOON_ONE_SET_ID = "cn-moon-one";
export const CN_MOON_ONE_CARDS = CHINESE_MOON_ONE_CODES.map(card => {
const printedNumber = Number(card.code.split("-").pop());
    if (card.code.startsWith("YH-F01-")) {
const imageNumber = printedNumber - (card.rarity === "SR" ? 40 : card.rarity === "SSR" ? 60 : 0);
        return { ...card, image: `${getChineseCardImage(`Chinese Sets/Rainbow-One-CN/CN-R1-${card.rarity}${imageNumber}.webp`)}?v=${CN_MOON_ONE_IMAGE_REVISION}` };
    }
    if (card.rarity === "R" && card.code.startsWith("YH-T01-"))
        return { ...card, image: getChineseMoonOneFront(printedNumber, "R") };
    if (card.rarity === "SR" && card.code.startsWith("YH-T01-"))
        return { ...card, image: `${getChineseCardImage(`Chinese Sets/Moon-Two-CN/CN-M2-SR${printedNumber - 8}.webp`)}?v=${CN_MOON_TWO_IMAGE_REVISION}` };
    if (card.rarity === "UR" && printedNumber <= 12)
        return { ...card, image: `${getChineseCardImage(`Chinese Sets/Rainbow-One-CN/CN-R1-UR${printedNumber}.webp`)}?v=${CN_MOON_TWO_IMAGE_REVISION}` };
    return { ...card, image: getChineseMoonOneFront(card.number, card.rarity) };
}).map(withChineseReplacementFront);
const CN_MOON_ONE_LOGO_REVISION = "20261027-m1-shared-corner-v1";
const moonOneLogoFrontPaths = new Set(CN_MOON_ONE_CARDS.filter(card => (card.rarity === "R" && /^YH-F01-0(?:09|[12]\d|3[0-2])$/.test(card.code)) || (card.rarity === "SR" && /^YH-T01-0(?:09|1[0-6])$/.test(card.code))).map(card => decodeURIComponent(new URL(card.image).pathname)));
export function hasChineseMoonOneCornerLogo(src: string): boolean {
  try { return moonOneLogoFrontPaths.has(decodeURIComponent(new URL(src).pathname)); } catch { return false; }
}
type MoonOneLogoEntry = { users: number; promise: Promise<string>; url?: string };
const moonOneLogoImages = new Map<string, MoonOneLogoEntry>();
let moonOneCornerLogo: Promise<HTMLImageElement> | undefined;
function readMoonOneLogoImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = () => reject(new Error("Moon One card image could not load.")); image.src = src; });
}
async function retainMoonOneLogoFront(source: string, resolved: string, userId: string): Promise<{ url: string; release: () => void }> {
  if (!hasChineseMoonOneCornerLogo(source)) return { url: resolved, release: () => {} };
  const key = JSON.stringify([userId, resolved, CN_MOON_ONE_LOGO_REVISION]);
  let entry = moonOneLogoImages.get(key);
  if (!entry) {
    const created: MoonOneLogoEntry = { users: 0, promise: Promise.resolve("") };
    created.promise = (async () => {
      if (!moonOneCornerLogo) moonOneCornerLogo = readMoonOneLogoImage("/kayou's-assets/chinesecornerlogo.webp").catch(error => { moonOneCornerLogo = undefined; throw error; });
      const [front, logo] = await Promise.all([readMoonOneLogoImage(resolved), moonOneCornerLogo]);
      const canvas = document.createElement("canvas"); canvas.width = front.naturalWidth; canvas.height = front.naturalHeight;
      const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Moon One card image could not be prepared.");
      ctx.drawImage(front, 0, 0);
      const width = canvas.width * .238;
      ctx.drawImage(logo, canvas.width * .0315, canvas.height * .0203, width, width * 1.024);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error("Moon One card image could not be prepared.")), "image/png"));
      const url = URL.createObjectURL(blob); created.url = url; return url;
    })();
    entry = created; moonOneLogoImages.set(key, entry);
  }
  const retained = entry; retained.users += 1;
  let released = false;
  const release = () => {
    if (released) return; released = true; retained.users -= 1;
    if (retained.users === 0) { if (retained.url) URL.revokeObjectURL(retained.url); if (moonOneLogoImages.get(key) === retained) moonOneLogoImages.delete(key); }
  };
  try { return { url: await retained.promise, release }; } catch (error) { release(); throw error; }
}
export const CN_MOON_THIRTEEN_SET_ID = "cn-moon-thirteen";
export const CN_MOON_THIRTEEN_ROTATED_KEYS = new Set([...Array.from({ length: 30 }, (_, index) => `R-${index + 1}`), ...Array.from({ length: 22 }, (_, index) => `HR-${index + 1}`), "SR-2", "LSR-2", "ZR-7"]);
export function getChineseMoonThirteenImageStyle(key: string): CSSProperties {
  return CN_MOON_THIRTEEN_ROTATED_KEYS.has(key) ? { position: "absolute", left: "50%", top: "50%", width: "140%", height: "71.4285714286%", maxWidth: "none", objectFit: "contain", objectPosition: "center", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center", borderRadius: "4.36% / 6.1%", clipPath: "inset(0 round 4.36% / 6.1%)" } : { transform: "none", transformOrigin: "center", objectFit: "contain", objectPosition: "center", borderRadius: "6.1% / 4.36%", clipPath: "inset(0 round 6.1% / 4.36%)" };
}
export function getChineseMoonThirteenFront(number: number | string, rarity = "R"): string {
  const code = rarity.trim().toUpperCase(); const index = Number(number);
  const card = CHINESE_MOON_THIRTEEN_CODES.find(item => item.rarity === code && item.number === index);
  if (!card) throw new Error("Invalid Chinese Moon Thirteen card code.");
  return `${getChineseCardImage(`Chinese Sets/Moon-Thirteen-CN/${card.code.replace("◇ZR", "DZR")}.webp`)}?v=${CN_MOON_THIRTEEN_IMAGE_REVISION}`;
}
export function getChineseMoonThirteenBack(card: { key: string; rarity: string }): ChineseCardBack {
  const sideways = CN_MOON_THIRTEEN_ROTATED_KEYS.has(card.key);
  const file = card.key === "SR-2" ? "HY13-SIDEWAYS-BACK" : card.key === "LSR-2" ? "HY13-STANDARD-BACK-LANDSCAPE" : card.rarity === "R" ? "HY13-R-BACK" : card.rarity === "SR" ? "HY13-SR-BACK" : card.rarity === "SSR" ? "HY13-SSR-BACK" : card.rarity === "UR" ? "HY13-UR-BACK" : card.rarity === "SGR" ? "HY13-SGR-BACK" : card.rarity === "DZR" ? "HY13-DZR-BACK" : card.rarity === "ZR" || card.rarity === "SC" ? sideways ? "HY13-HIGH-TIER-BACK-LANDSCAPE" : "HY13-HIGH-TIER-BACK" : card.rarity === "HR" && sideways ? "HY13-STANDARD-BACK-LANDSCAPE" : "HY13-STANDARD-BACK";
  return { image: `${getChineseCardImage(`card-backs/Chinese/Moon-Thirteen-CN/${file}.webp`)}?v=${CN_MOON_THIRTEEN_IMAGE_REVISION}`, rotation: sideways ? 90 : 0, ...(["ZR", "SC", "DZR"].includes(card.rarity) ? { silverStamp: true, silverStampLandscape: card.rarity === "ZR" && sideways, silverStampDiamond: card.rarity === "DZR" } : {}) };
}
export const CN_MOON_THIRTEEN_CARDS = CHINESE_MOON_THIRTEEN_CODES.map(card => ({ ...card, image: getChineseMoonThirteenFront(card.number, card.rarity), back: getChineseMoonThirteenBack(card) }));
export const CN_MOON_TWO_SET_ID = "cn-moon-two";
export const getChineseMoonTwoFront = (number: number | string, rarity = "R") => {
const code = rarity.trim().toUpperCase();
const index = Number(number);
    if (!/^[A-Z]+$/.test(code) || !Number.isSafeInteger(index) || index < 1)
        throw new Error("Invalid Chinese Moon Two card code.");
    if (code === "R" && index <= 8)
        return getChineseMoonOneFront(index, "R");
    if (code === "R" && index >= 17 && index <= 36)
        return `${getChineseCardImage(`Chinese Sets/Rainbow-One-CN/CN-R1-R${index - 4}.webp`)}?v=${CN_MOON_TWO_IMAGE_REVISION}`;
    if (code === "SR" && index >= 17 && index <= 20)
        return `${getChineseCardImage(`Chinese Sets/Rainbow-One-CN/CN-R1-SR${index - 8}.webp`)}?v=${CN_MOON_TWO_IMAGE_REVISION}`;
    if (code === "SSR" && index <= 9)
        return getChineseMoonOneFront(index + 15, "SSR");
    if (code === "HR")
        return `${getChineseCardImage(`Chinese Sets/Moon-Two-CN/CN-M2-HR${index}.webp`)}?v=20261022-m2-hr-direct-30-v3`;
    if (code === "UR" && index >= 19 && index <= 24)
        return `${getChineseCardImage(`Chinese Sets/Moon-Two-CN/CN-M2-UR${index - 18}.webp`)}?v=20261024-m2-ur19-24-replaced-v2&refresh=20261024-m2-ur19-24-replaced-v2`;
    if (code === "UR" && index <= 12)
        return `${getChineseCardImage(`Chinese Sets/Rainbow-One-CN/CN-R1-UR${index}.webp`)}?v=${CN_MOON_TWO_IMAGE_REVISION}`;
    if (code === "UR")
        return getChineseMoonOneFront(index, "UR");
const fileNumber = code === "R" && index === 1 ? "01" : String(index);
    return `${getChineseCardImage(`Chinese Sets/Moon-Two-CN/CN-M2-${code}${fileNumber}.webp`)}?v=${CN_MOON_TWO_IMAGE_REVISION}${code === "SC" && index >= 1 && index <= 6 ? "&refresh=20261024-m2-sc-replaced-v1" : ""}${code === "SGR" && index >= 1 && index <= 7 && index !== 3 ? "&refresh=20261024-m2-sgr-correct-files-replaced-v2" : ""}`;
};
export type ChineseCardBack = { image: string; rotation: 0 | 90; silverStamp?: boolean; silverStampLandscape?: boolean; silverStampDiamond?: boolean };
export const CN_MOON_TWO_BACK_IMAGES = {
  standard: getChineseCardImage("card-backs/Chinese/Moon-Two/CHINESE-STANDARD-BACK.webp"),
  sideways: getChineseCardImage("card-backs/Chinese/Moon-Two/CHINESE-SIDEWAYS-STANDARD-BACK.webp"),
  sgr: getChineseCardImage("card-backs/Chinese/Moon-Two/CHINESE-M2-SGR-BACK.webp"),
  ur: getChineseCardImage("card-backs/Chinese/Moon-Two/CHINESE-OLD-UR-BACK.webp"),
} as const;
const CN_MOON_TWO_SIDEWAYS_BACK_CODES = new Set(["YH-HR-038", "YH-HR-039", "YH-HR-047", "YH-HR-058", "YH-HR-059", "YH-HR-060"]);
export function getChineseMoonTwoBack(card: { code: string; rarity: string }): ChineseCardBack {
  if (card.rarity === "SGR") return { image: CN_MOON_TWO_BACK_IMAGES.sgr, rotation: 0 };
  if (card.rarity === "UR") return { image: CN_MOON_TWO_BACK_IMAGES.ur, rotation: 0 };
  if (card.rarity === "HR" && CN_MOON_TWO_SIDEWAYS_BACK_CODES.has(card.code)) return { image: CN_MOON_TWO_BACK_IMAGES.sideways, rotation: 90 };
  return { image: CN_MOON_TWO_BACK_IMAGES.standard, rotation: 0 };
}
export function getChineseCardBackStyle(back: ChineseCardBack): CSSProperties {
  return back.rotation === 90
    ? { position: "absolute", left: "50%", top: "50%", width: "140%", height: "71.4285714286%", maxWidth: "none", objectFit: "contain", objectPosition: "center", transform: "translate(-50%, -50%) rotate(90deg)", transformOrigin: "center" }
    : { position: "absolute", inset: 0, width: "100%", height: "100%", maxWidth: "none", objectFit: "contain", objectPosition: "center", transform: "none" };
}
export const CN_MOON_TWO_CARDS = CHINESE_MOON_TWO_CODES.map(card => ({ ...card, image: getChineseMoonTwoFront(card.number, card.rarity), back: getChineseMoonTwoBack(card) })).map(withChineseReplacementFront);
export const getChineseMoonThreeFront = (number: number | string, rarity = "R") => cardImagePathsCN.moonThree(rarity, number);
export const CN_MOON_THREE_SET_ID = "cn-moon-three";
export const CN_OLDER_R_BACK_ROOT = "card-backs/Chinese/R-Cards-Older-Sets";
export function getChineseMoonThreeBack(card: { key: string; code: string; rarity: string }): ChineseCardBack {
  if (card.rarity === "R") return { image: getChineseCardImage(`${CN_OLDER_R_BACK_ROOT}/${card.code}.webp`), rotation: 0 };
  if (card.rarity === "UR") return { image: CN_MOON_TWO_BACK_IMAGES.ur, rotation: 0 };
  if (card.rarity === "HR" && /^HR-(?:16|2[4-9])$/.test(card.key)) return { image: CN_MOON_TWO_BACK_IMAGES.sideways, rotation: 90 };
  return { image: CN_MOON_TWO_BACK_IMAGES.standard, rotation: 0 };
}
export const CN_MOON_THREE_CARDS = CHINESE_MOON_THREE_CODES.filter(card => card.code !== "YH-F01-008").map(card => ({ ...card, image: getChineseMoonThreeFront(card.number, card.rarity), back: getChineseMoonThreeBack(card) })).map(withChineseReplacementFront);
export const getChineseMoonFourFront = (number: number | string, rarity = "R") => cardImagePathsCN.moonFour(rarity, number);
export const CN_MOON_FOUR_SET_ID = "cn-moon-four";
export const CN_MOON_FOUR_SC_BACK = getChineseCardImage("card-backs/Chinese/SC-CARDS/MOON-4-SCS.webp");
export const CN_MOON_FOUR_SC_ALTERNATE_BACK = getChineseCardImage("card-backs/Chinese/SC-CARDS/SC-4-ALTERNATE.webp");
export function getChineseMoonFourBack(card: { key: string; code: string; rarity: string }, alternateSCBack = false): ChineseCardBack {
  if (card.rarity === "R") return { image: getChineseCardImage(`${CN_OLDER_R_BACK_ROOT}/${card.code}.webp`), rotation: 0 };
  if (card.rarity === "UR") return { image: CN_MOON_TWO_BACK_IMAGES.ur, rotation: 0 };
  if (card.rarity === "SC") return { image: alternateSCBack ? CN_MOON_FOUR_SC_ALTERNATE_BACK : CN_MOON_FOUR_SC_BACK, rotation: 0, silverStamp: true };
  if (card.rarity === "HR") {
    const imageKey = `HR-${getChineseMoonFourHRImageNumber(Number(card.key.slice(3)))}`;
    if (/^HR-(?:6|19|2[0-8]|30)$/.test(imageKey)) return { image: CN_MOON_TWO_BACK_IMAGES.sideways, rotation: 90 };
  }
  return { image: CN_MOON_TWO_BACK_IMAGES.standard, rotation: 0 };
}
export const CN_MOON_FOUR_CARDS = CHINESE_MOON_FOUR_CODES.map(card => ({ ...card, image: getChineseMoonFourFront(card.number, card.rarity), back: getChineseMoonFourBack(card) })).map(withChineseReplacementFront);
export const getChineseMoonFiveFront = (number: number | string, rarity = "R") => {
  const card = CHINESE_MOON_FIVE_CODES.find(card => card.rarity === rarity && card.number === Number(number));
  return (card && getChineseReplacementFront(card.code)) ?? cardImagePathsCN.moonFive(rarity, number);
};
export const CN_MOON_FIVE_SET_ID = "cn-moon-five";
export function getChineseMoonFiveBack(card: { key: string; code: string; rarity: string }): ChineseCardBack {
  if (card.rarity === "R") return { image: getChineseCardImage(`${CN_OLDER_R_BACK_ROOT}/${card.code}.webp`), rotation: 0 };
  if (card.rarity === "UR") return { image: CN_MOON_TWO_BACK_IMAGES.ur, rotation: 0 };
  if (card.rarity === "HR" && /^HR-(?:2[6-9]|30)$/.test(card.key)) return { image: CN_MOON_TWO_BACK_IMAGES.sideways, rotation: 90 };
  return { image: CN_MOON_TWO_BACK_IMAGES.standard, rotation: 0, ...(card.rarity === "SC" ? { silverStamp: true } : {}) };
}
export const CN_MOON_FIVE_CARDS = CHINESE_MOON_FIVE_CODES.map(card => ({ ...card, image: getChineseMoonFiveFront(card.number, card.rarity), back: getChineseMoonFiveBack(card) })).map(withChineseReplacementFront);
export const getChineseMoonSixFront = (number: number | string, rarity = "R") => {
  const card = CHINESE_MOON_SIX_CODES.find(card => card.rarity === rarity.trim().toUpperCase() && card.number === Number(number));
  return (card && getChineseReplacementFront(card.code)) ?? cardImagePathsCN.moonSix(rarity, number);
};
export const CN_MOON_SIX_SET_ID = "cn-moon-six";
export const CN_MOON_SIX_BACK_ROOT = "card-backs/Chinese/Moon-Six";
export const CN_MOON_SIX_PTR_LANDSCAPE_KEYS = new Set(["PTR-2", "PTR-3", "PTR-5", "PTR-7", "PTR-13", "PTR-15", "PTR-16", "PTR-17", "PTR-20", "PTR-22", "PTR-23", "PTR-24", "PTR-25", "PTR-28", "PTR-29", "PTR-30", "PTR-32", "PTR-35", "PTR-36"]);
export function getChineseMoonSixBack(card: { key: string; code: string; rarity: string }): ChineseCardBack {
  if (card.rarity === "R") return { image: getChineseCardImage(`${CN_MOON_SIX_BACK_ROOT}/${card.code}.webp`), rotation: 0 };
  if (card.rarity === "PTR") {
    const landscape = CN_MOON_SIX_PTR_LANDSCAPE_KEYS.has(card.key);
    return { image: getChineseCardImage(`${CN_MOON_SIX_BACK_ROOT}/PTR-${landscape ? "LANDSCAPE" : "PORTRAIT"}.webp`), rotation: landscape ? 90 : 0 };
  }
  if (card.rarity === "UR" && card.key === "UR-16") return { image: getChineseCardImage("card-backs/Chinese/Moon-Two/LANDSCAPE-UR.webp"), rotation: 90 };
  if (card.rarity === "UR") return { image: CN_MOON_TWO_BACK_IMAGES.ur, rotation: 0 };
  if (card.rarity === "SC" && card.key === "SC-7") return { image: CN_MOON_TWO_BACK_IMAGES.sideways, rotation: 90, silverStamp: true, silverStampLandscape: true };
  return { image: CN_MOON_TWO_BACK_IMAGES.standard, rotation: 0, ...(card.rarity === "SC" ? { silverStamp: true } : {}) };
}
export const CN_MOON_SIX_CARDS = CHINESE_MOON_SIX_CODES.map(card => ({ ...card, image: getChineseMoonSixFront(card.number, card.rarity), back: getChineseMoonSixBack(card) })).map(withChineseReplacementFront);
export const getChineseMoonSevenFront = (number: number | string, rarity = "R") => cardImagePathsCN.moonSeven(rarity, number);
export const CN_MOON_SEVEN_SET_ID = "cn-moon-seven";
export const CN_MOON_SEVEN_CARDS = CHINESE_MOON_SEVEN_CODES.map(card => ({ ...card, image: getChineseMoonSevenFront(card.number, card.rarity) })).map(withChineseReplacementFront);
export const getChineseMoonEightFront = (number: number | string, rarity = "R") => cardImagePathsCN.moonEight(rarity, number);
export const CN_MOON_EIGHT_SET_ID = "cn-moon-eight";
export const CN_MOON_EIGHT_CARDS = CHINESE_MOON_EIGHT_CODES.map(card => ({ ...card, image: getChineseMoonEightFront(card.number, card.rarity) })).map(withChineseReplacementFront);
export const getChineseMoonNineFront = (number: number | string, rarity = "R") => cardImagePathsCN.moonNine(rarity, number);
export const CN_MOON_NINE_SET_ID = "cn-moon-nine";
export const CN_MOON_NINE_CARDS = CHINESE_MOON_NINE_CODES.map(card => ({ ...card, image: getChineseMoonNineFront(card.number, card.rarity) })).map(withChineseReplacementFront);
export const getChineseMoonTenFront = (number: number | string, rarity = "R") => cardImagePathsCN.moonTen(rarity, number);
export const CN_MOON_TEN_SET_ID = "cn-moon-ten";
export const CN_MOON_TEN_CARDS = CHINESE_MOON_TEN_CODES.map(card => ({ ...card, image: getChineseMoonTenFront(card.number, card.rarity) })).map(withChineseReplacementFront);
export const getChineseMoonElevenFront = (number: number | string, rarity = "R") => cardImagePathsCN.moonEleven(rarity, number);
export const CN_MOON_ELEVEN_SET_ID = "cn-moon-eleven";
export const CN_MOON_ELEVEN_CARDS = CHINESE_MOON_ELEVEN_CODES.map(card => ({ ...card, image: getChineseMoonElevenFront(card.number, card.rarity) })).map(withChineseReplacementFront);
export const getChineseMoonTwelveFront = (number: number | string, rarity = "R") => cardImagePathsCN.moonTwelve(rarity, number);
export const CN_MOON_TWELVE_SET_ID = "cn-moon-twelve";
export const CN_MOON_TWELVE_CARDS = CHINESE_MOON_TWELVE_CODES.map(card => ({ ...card, image: getChineseMoonTwelveFront(card.number, card.rarity) })).map(withChineseReplacementFront);
export const CN_FUN_ONE_IMAGE_REVISION = "20261022-f1-complete-121-v1";
export const CN_FUN_ONE_SET_ID = "cn-fun-one";
export const CN_FUN_ONE_CARDS = CHINESE_FUN_ONE_CODES.map(card => {
    if (["N", "DN", "CR"].includes(card.rarity))
        return { ...card, image: `${getChineseCardImage(`Chinese Sets/Fun-One-CN/CN-F1-${card.rarity}${card.number}.webp`)}?v=${CN_FUN_ONE_IMAGE_REVISION}` };
const sourceCards = card.code.startsWith("YH-T03-") ? CN_MOON_THREE_CARDS : CN_MOON_FOUR_CARDS;
const source = sourceCards.find(item => item.rarity === card.rarity && item.code === card.code);
    if (!source)
        throw new Error(`Missing Chinese Fun One source card: ${card.code}`);
    return { ...card, image: source.image };
}).map(withChineseReplacementFront);
export const CN_FUN_TWO_IMAGE_REVISION = "20261022-f2-complete-137-v1";
export const CN_FUN_TWO_SET_ID = "cn-fun-two";
export const CN_FUN_TWO_CARDS = CHINESE_FUN_TWO_CODES.map(card => {
    if (["N", "DN", "CR"].includes(card.rarity))
        return { ...card, image: `${getChineseCardImage(`Chinese Sets/Fun-Two-CN/CN-F2-${card.rarity}${card.number}.webp`)}?v=${CN_FUN_TWO_IMAGE_REVISION}` };
const sourceCards = card.code.startsWith("YH-T04-") ? CN_MOON_FOUR_CARDS : CN_MOON_FIVE_CARDS;
const source = sourceCards.find(item => item.rarity === card.rarity && item.code === card.code);
    if (!source)
        throw new Error(`Missing Chinese Fun Two source card: ${card.code}`);
    return { ...card, image: source.image };
}).map(withChineseReplacementFront);
export const CN_FUN_THREE_IMAGE_REVISION = "20261022-f3-complete-134-v1";
export const CN_FUN_THREE_SET_ID = "cn-fun-three";
export const CN_FUN_THREE_CARDS = CHINESE_FUN_THREE_CODES.map(card => {
    if (["N", "DN", "CR"].includes(card.rarity))
        return { ...card, image: `${getChineseCardImage(`Chinese Sets/Fun-Three-CN/CN-F3-${card.rarity}${card.number}.webp`)}?v=${CN_FUN_THREE_IMAGE_REVISION}` };
const sourceCode = card.rarity === "SR"
    ? `HY06-SR-${String(card.number <= 7 ? card.number : card.number + 5).padStart(3, "0")}`
    : card.code.replace(/^QY03-(SR|UR)-/, "HY06-$1-");
const sourceCards = sourceCode.startsWith("YH-T05-") ? CN_MOON_FIVE_CARDS : CN_MOON_SIX_CARDS;
const source = sourceCards.find(item => item.rarity === card.rarity && item.code === sourceCode);
    if (!source)
        throw new Error(`Missing Chinese Fun Three source card: ${card.code}`);
    return { ...card, image: source.image };
}).map(withChineseReplacementFront);
export const CN_FUN_FOUR_IMAGE_REVISION = "20261022-f4-complete-127-v1";
export const CN_FUN_FOUR_SET_ID = "cn-fun-four";
export const CN_FUN_FOUR_CARDS = CHINESE_FUN_FOUR_CODES.map(card => {
    if (!["R", "UR"].includes(card.rarity))
        return { ...card, image: `${getChineseCardImage(`Chinese Sets/Fun-Four-CN/CN-F4-${card.rarity}${card.number}.webp`)}?v=${CN_FUN_FOUR_IMAGE_REVISION}` };
const sourceNumber = [1, 2, 3, 4, 5, 6, 10, 11, 12, 14][card.number - 1];
const sourceCode = card.rarity === "UR" ? `HY07-UR-${String(sourceNumber).padStart(3, "0")}` : card.code;
const sourceCards = sourceCode.startsWith("HY06-") ? CN_MOON_SIX_CARDS : CN_MOON_SEVEN_CARDS;
const source = sourceCards.find(item => item.rarity === card.rarity && item.code === sourceCode);
    if (!source)
        throw new Error(`Missing Chinese Fun Four source card: ${card.code}`);
    return { ...card, image: source.image };
}).map(withChineseReplacementFront);
export const CN_FUN_FIVE_IMAGE_REVISION = "20261022-f5-complete-141-v1";
export const CN_FUN_FIVE_SET_ID = "cn-fun-five";
export const CN_FUN_FIVE_CARDS = CHINESE_FUN_FIVE_CODES.map(card => {
    if (!["R", "UR"].includes(card.rarity))
        return { ...card, image: `${getChineseCardImage(`Chinese Sets/Fun-Five-CN/CN-F5-${card.rarity}${card.number}.webp`)}?v=${CN_FUN_FIVE_IMAGE_REVISION}` };
const sourceCards = card.code.startsWith("HY07-") ? CN_MOON_SEVEN_CARDS : CN_MOON_EIGHT_CARDS;
const source = sourceCards.find(item => item.rarity === card.rarity && item.code === card.code);
    if (!source)
        throw new Error(`Missing Chinese Fun Five source card: ${card.code}`);
    return { ...card, image: source.image };
}).map(withChineseReplacementFront);
export const CN_FUN_SIX_IMAGE_REVISION = "20261022-f6-complete-152-v1";
export const CN_FUN_SIX_SET_ID = "cn-fun-six";
export const CN_FUN_SIX_CARDS = CHINESE_FUN_SIX_CODES.map(card => {
    if (card.rarity === "UR")
        return { ...card, image: getChineseCardImage(`Chinese Sets/Rainbow-Five-CN/CN-R5-UR${card.number}.webp`) };
    if (!["R", "SR"].includes(card.rarity))
        return { ...card, image: `${getChineseCardImage(`Chinese Sets/Fun-Six-CN/CN-F6-${card.rarity}${card.number}.webp`)}?v=${CN_FUN_SIX_IMAGE_REVISION}` };
const sourceCards = card.code.startsWith("HY08-") ? CN_MOON_EIGHT_CARDS : CN_MOON_NINE_CARDS;
const source = sourceCards.find(item => item.rarity === card.rarity && item.code === card.code);
    if (!source)
        throw new Error(`Missing Chinese Fun Six source card: ${card.code}`);
    return { ...card, image: source.image };
}).map(withChineseReplacementFront);
export const CN_FUN_SEVEN_IMAGE_REVISION = "20261022-f7-complete-151-v1";
export const CN_FUN_SEVEN_SET_ID = "cn-fun-seven";
export const CN_FUN_SEVEN_CARDS = CHINESE_FUN_SEVEN_CODES.map(card => {
    if (!["R", "SR"].includes(card.rarity))
        return { ...card, image: `${getChineseCardImage(`Chinese Sets/Fun-Seven-CN/CN-F7-${card.rarity}${card.number}.webp`)}?v=${CN_FUN_SEVEN_IMAGE_REVISION}` };
const sourceCode = card.rarity === "SR" ? card.code.replace("QY07-SR-", "HY10-SR-") : card.code;
const sourceCards = sourceCode.startsWith("HY09-") ? CN_MOON_NINE_CARDS : CN_MOON_TEN_CARDS;
const source = sourceCards.find(item => item.rarity === card.rarity && item.code === sourceCode);
    if (!source)
        throw new Error(`Missing Chinese Fun Seven source card: ${card.code}`);
    return { ...card, image: source.image };
}).map(withChineseReplacementFront);
export const CN_FUN_EIGHT_IMAGE_REVISION = "20261022-f8-complete-151-v1";
export const CN_FUN_EIGHT_SET_ID = "cn-fun-eight";
export const CN_FUN_EIGHT_CARDS = CHINESE_FUN_EIGHT_CODES.map(card => {
    if (!["R", "SR"].includes(card.rarity))
        return { ...card, image: `${getChineseCardImage(`Chinese Sets/Fun-Eight-CN/CN-F8-${card.rarity}${card.number}.webp`)}?v=${CN_FUN_EIGHT_IMAGE_REVISION}` };
const sourceCode = card.rarity === "SR" ? card.code.replace("QY08-SR-", "HY11-SR-") : card.code;
const sourceCards = sourceCode.startsWith("HY10-") ? CN_MOON_TEN_CARDS : CN_MOON_ELEVEN_CARDS;
const source = sourceCards.find(item => item.rarity === card.rarity && item.code === sourceCode);
    if (!source)
        throw new Error(`Missing Chinese Fun Eight source card: ${card.code}`);
    return { ...card, image: source.image };
}).map(withChineseReplacementFront);
export const CN_FUN_NINE_IMAGE_REVISION = "20261022-f9-complete-151-v1";
export const CN_FUN_NINE_SET_ID = "cn-fun-nine";
export const CN_FUN_NINE_CARDS = CHINESE_FUN_NINE_CODES.map(card => {
    if (card.rarity !== "SR")
        return { ...card, image: `${getChineseCardImage(`Chinese Sets/Fun-Nine-CN/CN-F9-${card.rarity}${card.number}.webp`)}?v=${CN_FUN_NINE_IMAGE_REVISION}` };
const source = CN_MOON_TWELVE_CARDS.find(item => item.rarity === card.rarity && item.code === card.code);
    if (!source)
        throw new Error(`Missing Chinese Fun Nine source card: ${card.code}`);
    return { ...card, image: source.image };
}).map(withChineseReplacementFront);
export const CN_RAINBOW_ONE_IMAGE_REVISION = "20261022-r1-complete-107-v1";
export const CN_RAINBOW_ONE_SET_ID = "cn-rainbow-one";
export const CN_RAINBOW_ONE_CARDS = CHINESE_RAINBOW_ONE_CODES.map(card => ({ ...card, image: `${getChineseCardImage(`Chinese Sets/Rainbow-One-CN/CN-R1-${card.rarity}${card.number}.webp`)}?v=${CN_RAINBOW_ONE_IMAGE_REVISION}` })).map(withChineseReplacementFront);
export const CN_RAINBOW_TWO_IMAGE_REVISION = "20261022-r2-complete-39-v1";
export const CN_RAINBOW_TWO_SET_ID = "cn-rainbow-two";
export const CN_RAINBOW_TWO_CARDS = CHINESE_RAINBOW_TWO_CODES.map(card => {
const printedNumber = Number(card.code.split("-").pop());
const sourceCards = card.code.startsWith("YH-F01-") ? CN_RAINBOW_ONE_CARDS
    : card.code.startsWith("YH-T01-") || card.rarity === "UR" && printedNumber <= 18 ? CN_MOON_ONE_CARDS
    : card.code.startsWith("YH-T02-") || card.rarity === "UR" && printedNumber <= 24 ? CN_MOON_TWO_CARDS
    : null;
    if (sourceCards) {
const source = sourceCards.find(item => item.rarity === card.rarity && item.code === card.code);
        if (!source) throw new Error(`Missing Chinese Rainbow Two source card: ${card.code}`);
        return { ...card, image: source.image };
    }
    return { ...card, image: `${getChineseCardImage(`Chinese Sets/Rainbow-Two-CN/CN-R2-${card.rarity}${card.number}.webp`)}?v=${CN_RAINBOW_TWO_IMAGE_REVISION}` };
}).map(withChineseReplacementFront);
export const CN_RAINBOW_THREE_IMAGE_REVISION = "20261022-r3-complete-133-v1";
export const CN_RAINBOW_THREE_SET_ID = "cn-rainbow-three";
export const CN_RAINBOW_THREE_CARDS = CHINESE_RAINBOW_THREE_CODES.map(card => {
    if (!["R", "SR", "SSR", "UR"].includes(card.rarity))
        return { ...card, image: `${getChineseCardImage(`Chinese Sets/Rainbow-Three-CN/CN-R3-${card.rarity}${card.number}.webp`)}?v=${CN_RAINBOW_THREE_IMAGE_REVISION}` };
const sourceCards = card.code.startsWith("YH-T04-") || /^YH-UR-04[0-9]$/.test(card.code) ? CN_MOON_FOUR_CARDS : CN_MOON_FIVE_CARDS;
const source = sourceCards.find(item => item.rarity === card.rarity && item.code === card.code);
    if (!source)
        throw new Error(`Missing Chinese Rainbow Three source card: ${card.code}`);
    return { ...card, image: source.image };
}).map(withChineseReplacementFront);
export const CN_RAINBOW_FOUR_IMAGE_REVISION = "20261022-r4-complete-141-v1";
export const CN_RAINBOW_FOUR_SET_ID = "cn-rainbow-four";
export const CN_RAINBOW_FOUR_CARDS = CHINESE_RAINBOW_FOUR_CODES.map(card => {
    if (!["R", "SR", "SSR", "UR"].includes(card.rarity))
        return { ...card, image: `${getChineseCardImage(`Chinese Sets/Rainbow-Four-CN/CN-R4-${card.rarity}${card.number}.webp`)}?v=${CN_RAINBOW_FOUR_IMAGE_REVISION}` };
const ssrSources = ["HY06-SSR-007", "HY06-SSR-008", "HY06-SSR-009", "HY06-SSR-010", "HY06-SSR-011", "HY06-SSR-012", "HY06-SSR-016", "HY06-SSR-017", "HY06-SSR-020", "YH-T05-047", "YH-T05-050", "YH-T05-051", "YH-T05-052", "YH-T05-057", "YH-T05-058"];
const sourceCode = card.rarity === "SSR" ? ssrSources[card.number - 1] : card.rarity === "UR" ? card.code.replace("CH04-UR-", "HY06-UR-") : card.code;
const sourceCards = card.rarity === "SR" ? CN_FUN_THREE_CARDS : sourceCode.startsWith("YH-T05-") ? CN_MOON_FIVE_CARDS : CN_MOON_SIX_CARDS;
const source = sourceCards.find(item => item.rarity === card.rarity && item.code === sourceCode);
    if (!source)
        throw new Error(`Missing Chinese Rainbow Four source card: ${card.code}`);
    return { ...card, image: source.image };
}).map(withChineseReplacementFront);
export const CN_RAINBOW_FIVE_IMAGE_REVISION = "20261022-r5-complete-170-v1";
export const CN_RAINBOW_FIVE_SET_ID = "cn-rainbow-five";
export const CN_RAINBOW_FIVE_CARDS = CHINESE_RAINBOW_FIVE_CODES.map(card => {
    if (card.code.startsWith("HY08-") || card.code.startsWith("HY09-")) {
const sourceCards = card.code.startsWith("HY08-") ? CN_MOON_EIGHT_CARDS : CN_MOON_NINE_CARDS;
const source = sourceCards.find(item => item.rarity === card.rarity && item.code === card.code);
        if (!source)
            throw new Error(`Missing Chinese Rainbow Five source card: ${card.code}`);
        return { ...card, image: source.image };
    }
const imageNumber = card.rarity === "SSR" ? 1 : card.number;
    return { ...card, image: `${getChineseCardImage(`Chinese Sets/Rainbow-Five-CN/CN-R5-${card.rarity}${imageNumber}.webp`)}?v=${CN_RAINBOW_FIVE_IMAGE_REVISION}` };
}).map(withChineseReplacementFront);
export const CN_STAR_ONE_IMAGE_REVISION = "20261022-s1-complete-82-v1";
export const CN_STAR_ONE_SET_ID = "cn-star-one";
export const CN_STAR_ONE_CARDS = CHINESE_STAR_ONE_CODES.map(card => ({ ...card, image: `${getChineseCardImage(`Chinese Sets/Star-One-CN/CN-S1-${card.rarity}${card.number}.webp`)}?v=${CN_STAR_ONE_IMAGE_REVISION}` })).map(withChineseReplacementFront);
export const CN_STAR_TWO_IMAGE_REVISION = "20261022-s2-complete-105-v1";
export const CN_STAR_TWO_SET_ID = "cn-star-two";
export const CN_STAR_TWO_CARDS = CHINESE_STAR_TWO_CODES.map(card => ({ ...card, image: `${getChineseCardImage(`Chinese Sets/Star-Two-CN/CN-S2-${card.rarity}${card.number}.webp`)}?v=${CN_STAR_TWO_IMAGE_REVISION}` })).map(withChineseReplacementFront);
export const CN_STAR_THREE_IMAGE_REVISION = "20261022-s3-complete-143-v1";
export const CN_STAR_THREE_SET_ID = "cn-star-three";
export const CN_STAR_THREE_CARDS = CHINESE_STAR_THREE_CODES.map(card => ({ ...card, image: `${getChineseCardImage(`Chinese Sets/Star-Three-CN/CN-S3-${card.rarity}${card.number}.webp`)}?v=${CN_STAR_THREE_IMAGE_REVISION}` })).map(withChineseReplacementFront);
export const CN_PROMOS_IMAGE_REVISION = "20261022-pr-complete-83-v2";
export const CN_PROMOS_SET_ID = "cn-promos";
export const CN_PROMOS_CARDS = CHINESE_PROMOS_CODES.map(card => ({ ...card, image: `${getChineseCardImage(`Chinese Sets/Promotional-Cards/${(card.rarity === "KB" || card.rarity === "SPR" || card.rarity === "ANN40") ? card.code : card.rarity === "TFXMLP" ? `TFXMLP${card.number}` : `CN-PR-${card.key === "PR-D19" ? "D19" : String(card.number).padStart(3, "0")}`}.webp`)}?v=${CN_PROMOS_IMAGE_REVISION}` })).map(withChineseReplacementFront);
export const CN_STARDUST_ONE_IMAGE_REVISION = "20261023-sd1-lsr-replaced-v2";
export const CN_STARDUST_ONE_SET_ID = "cn-stardust-one";
export const CN_STARDUST_ONE_CARDS = CHINESE_STARDUST_ONE_CODES.map(card => ({ ...card, image: `${getChineseCardImage(`Chinese Sets/Stardust-One-CN/CN-SD1-${card.rarity}${card.number}.webp`)}?v=${CN_STARDUST_ONE_IMAGE_REVISION}` })).map(withChineseReplacementFront);
export const CN_STARDUST_TWO_IMAGE_REVISION = "20261023-sd2-complete-111-v1";
export const CN_STARDUST_TWO_SET_ID = "cn-stardust-two";
export const CN_STARDUST_TWO_CARDS = CHINESE_STARDUST_TWO_CODES.map(card => ({ ...card, image: `${getChineseCardImage(`Chinese Sets/Stardust-Two-CN/CN-SD2-${card.rarity}${card.number}.webp`)}?v=${CN_STARDUST_TWO_IMAGE_REVISION}` })).map(withChineseReplacementFront);
export const CN_MAGICBOOK_ONE_IMAGE_REVISION = "20261023-eg1-complete-87-v1";
export const CN_MAGICBOOK_ONE_SET_ID = "cn-magicbook-one";
export const CN_MAGICBOOK_ONE_CARDS = CHINESE_MAGICBOOK_ONE_CODES.map(card => ({ ...card, image: `${getChineseCardImage(`Chinese Sets/Equestria-Girls-One-CN/CN-EG1-${card.rarity}${card.number}.webp`)}?v=${CN_MAGICBOOK_ONE_IMAGE_REVISION}` })).map(withChineseReplacementFront);
export const CN_NEWYEARS_ONE_IMAGE_REVISION = "20261023-ny1-complete-24-v1";
export const CN_NEWYEARS_ONE_SET_ID = "cn-newyears-one";
export const CN_NEWYEARS_ONE_CARDS = CHINESE_NEWYEARS_ONE_CODES.map(card => ({ ...card, image: `${getChineseCardImage(`Chinese Sets/NewYears-One-CN/CN-NY1-${card.rarity}${card.number}.webp`)}?v=${CN_NEWYEARS_ONE_IMAGE_REVISION}` })).map(withChineseReplacementFront);
export const CN_KUJI_RAFFLES_IMAGE_REVISION = "20261024-all-kuji-images-refresh-v1";
export const CN_KUJI_RAFFLES_SET_ID = "cn-kuji-raffles";
export const CN_KUJI_RAFFLES_CARDS = CHINESE_KUJI_RAFFLES_CODES.map(({ imageFile, ...card }) => ({ ...card, image: `${getChineseCardImage(`Chinese Sets/Kuji-Sets/${imageFile}`)}?v=${CN_KUJI_RAFFLES_IMAGE_REVISION}${/^KUJI4-B[1-4]\.webp$/.test(imageFile) ? "&refresh=20261024-kuji4-b-replaced-v1" : ""}${imageFile === "KUJI1-D1.webp" ? "&refresh=20261024-kuji1-d1-replaced-v1" : ""}${/^KUJI3-(?:TICKET[0-9]+|C[1-6])\.webp$/.test(imageFile) ? "&refresh=20261024-kuji3-tickets-replaced-v2" : /^KUJI3-(?:TICKET[0-9]+|B[1-4]|A[1-2]|S|LAST)\.webp$/.test(imageFile) ? "&refresh=20261024-kuji3-all-replaced-v1" : /^KUJI2-(?:TICKET[0-9]+|B[1-4]|A[1-2]|S|LAST)\.webp$/.test(imageFile) ? "&refresh=20261024-kuji2-all-replaced-v2" : imageFile === "KUJI2-TICKET20.webp" ? "&refresh=20261024-kuji2-ticket20-replaced-v1" : /^KUJI[1-4]-TICKET[0-9]+\.webp$/.test(imageFile) ? "&refresh=20261024-kuji-tickets-replaced-v3" : /^KUJI1-(?:B[1-4]|A[1-2]|S|LAST)\.webp$/.test(imageFile) ? "&refresh=20261024-kuji1-prizes-replaced-v1" : ""}` })).map(withChineseReplacementFront);
export const CN_NEWYEARS_TWO_IMAGE_REVISION = "20261023-ny2-complete-91-v1";
export const CN_NEWYEARS_TWO_SET_ID = "cn-newyears-two";
export const CN_NEWYEARS_TWO_CARDS = CHINESE_NEWYEARS_TWO_CODES.map(card => ({ ...card, image: `${getChineseCardImage(`Chinese Sets/NewYears-Two-CN/CN-NY2-${card.rarity}${card.number}.webp`)}?v=${CN_NEWYEARS_TWO_IMAGE_REVISION}` })).map(withChineseReplacementFront);
let sessionPending: ReturnType<typeof supabase.auth.getSession> | null = null;
let refreshPending: ReturnType<typeof supabase.auth.refreshSession> | null = null;
function readChineseImageSession() {
    if (sessionPending)
        return sessionPending;
const pending = supabase.auth.getSession();
    sessionPending = pending;
    void pending.finally(() => { if (sessionPending === pending)
        sessionPending = null; }).catch(() => { });
    return pending;
}
function refreshChineseImageSession() {
    if (refreshPending)
        return refreshPending;
const pending = supabase.auth.refreshSession();
    refreshPending = pending;
    void pending.finally(() => { if (refreshPending === pending)
        refreshPending = null; }).catch(() => { });
    return pending;
}
export function useChineseCardImage(src: string) {
const [authVersion, setAuthVersion] = useState(0);
const [state, setState] = useState<{
        source: string;
        url: string;
        error: string;
    }>({ source: "", url: "", error: "" });
    useEffect(() => {
const { data: { subscription } } = onAuthIdentityChange(() => {
            setState({ source: "", url: "", error: "" });
            setAuthVersion(value => value + 1);
        });
        return () => subscription.unsubscribe();
    }, []);
    useEffect(() => {
let active = true;
let release: (() => void) | undefined;
      let releaseStyle: (() => void) | undefined;
        setState({ source: src, url: "", error: "" });
const load = async () => {
            try {
const url = new URL(refreshChineseMoonOneFront(src));
                if (decodeURIComponent(url.pathname).startsWith("/Chinese Sets/Moon-Two-CN/"))
                    url.searchParams.set("v", ["20261024-m2-sgr-correct-files-replaced-v2", "20261024-m2-sc-replaced-v1", CN_MOON_TWO_T01_SR_REFRESH].includes(url.searchParams.get("refresh") ?? "") ? url.searchParams.get("refresh")! : CN_MOON_TWO_IMAGE_REVISION);
                if (["20261024-m4-ur40-54-replaced-v1", "20261024-m4-sc13-18-replaced-v1"].includes(url.searchParams.get("refresh") ?? ""))
                    url.searchParams.set("v", url.searchParams.get("refresh")!);
if (/^\/Chinese Sets\/Moon-Six-CN\/CN-M6-LSR\d+\.webp$/.test(decodeURIComponent(url.pathname)) && url.searchParams.get("refresh") === CN_MOON_SIX_LSR_REVISION)
                    url.searchParams.set("v", CN_MOON_SIX_LSR_REVISION);
const requestUrl = url.href;
                if (url.origin !== new URL(CARD_IMAGE_WORKER_URL).origin || (!decodeURIComponent(url.pathname).startsWith("/Chinese Sets/") && !/^\/card-backs\/Chinese\/Moon-Two\/(?:CHINESE-STANDARD-BACK|CHINESE-SIDEWAYS-STANDARD-BACK|CHINESE-M2-SGR-BACK|CHINESE-OLD-UR-BACK|LANDSCAPE-UR)\.webp$/.test(decodeURIComponent(url.pathname)) && !/^\/card-backs\/Chinese\/R-Cards-Older-Sets\/[A-Z0-9]+(?:-[A-Z0-9]+)+\.webp$/.test(decodeURIComponent(url.pathname)) && !/^\/card-backs\/Chinese\/SC-CARDS\/(?:MOON-4-SCS|SC-4-ALTERNATE)\.webp$/.test(decodeURIComponent(url.pathname)) && !/^\/card-backs\/Chinese\/Replacements\/(?:YH-T05-0(?:47|5[0-9]|60)|HY06-UR-0(?:0[1-9]|1[0-6]))\.webp$/.test(decodeURIComponent(url.pathname)) && !/^\/card-backs\/Chinese\/Moon-Thirteen-CN\/HY13-(?:DZR-BACK|HIGH-TIER-BACK(?:-LANDSCAPE)?|R-BACK|SGR-BACK|SIDEWAYS-BACK|SR-BACK|SSR-BACK|STANDARD-BACK(?:-LANDSCAPE)?|UR-BACK)\.webp$/.test(decodeURIComponent(url.pathname)) && !/^\/card-backs\/Chinese\/Moon-Six\/(?:HY06-R-\d{3}|PTR-LANDSCAPE|PTR-PORTRAIT)\.webp$/.test(decodeURIComponent(url.pathname))))
                    throw new Error("Invalid Chinese image source.");
const { data, error } = await readChineseImageSession();
                if (!active)
                    return;
                if (error || !data.session?.access_token)
                    throw new Error("Log in to load card images.");
const userId = data.session.user.id;
const token = data.session.access_token;
let downloadError = "Card image could not load. Please try again.";
const image = await getCachedCardImage(requestUrl, userId, async (signal) => {
const request = (accessToken: string) => fetch(requestUrl, { signal, credentials: "omit", headers: { Authorization: `Bearer ${accessToken}` } });
let response = await request(token);
                    if (response.status === 401) {
const refreshed = await refreshChineseImageSession();
                        if (refreshed.error || refreshed.data.session?.user.id !== userId || !refreshed.data.session?.access_token) {
                            downloadError = "Your session expired. Please log in again.";
                            return undefined;
                        }
                        if (signal.aborted)
                            return undefined;
                        response = await request(refreshed.data.session.access_token);
                    }
                    if (!response.ok) {
                        downloadError = response.status === 404 ? "The image server could not find or allow this Chinese card path." : `Card image could not load (${response.status}).`;
                        return undefined;
                    }
                    if (!response.headers.get("Content-Type")?.startsWith("image/")) {
                        downloadError = "The image server did not return an image.";
                        return undefined;
                    }
                    return response;
                });
                if (!image)
                    throw new Error(downloadError);
                if (!active) { image.release(); return; }
let rendered: { url: string; release: () => void };
                try { rendered = await retainMoonOneLogoFront(src, image.url, userId); } catch (cause) { image.release(); throw cause; }
                if (!active) { rendered.release(); image.release(); return; }
                release = () => { rendered.release(); image.release(); };
                releaseStyle = retainUncroppedFrontStyle(src, rendered.url);
                setState({ source: src, url: rendered.url, error: "" });
            }
            catch (cause) {
                if (active)
                    setState({ source: src, url: "", error: cause instanceof Error ? cause.message : "Card image could not load." });
            }
        };
        void load();
        return () => {
            active = false;
            releaseStyle?.();
            release?.();
        };
    }, [src, authVersion]);
    return state.source === src ? state : { source: src, url: "", error: "" };
}
export const CN_LASER_TICKETS_SET_ID = "cn-laser-tickets";
export const CN_LASER_TICKETS_IMAGE_REVISION = "20261024-laser-tickets-v1";
export const CN_LASER_TICKETS_CARDS = CHINESE_LASER_TICKETS_CODES.map(card => ({ ...card, image: `${getChineseCardImage(`Chinese Sets/Laser-Tickets-CN/LT-${card.rarity === "SH" ? "SH" : "FWM"}-${card.number}.webp`)}?v=${CN_LASER_TICKETS_IMAGE_REVISION}${card.rarity === "LTR" && card.number === 6 ? "&refresh=20261024-laser-ticket6-replaced-v2" : card.rarity === "LTR" && card.number === 2 ? "&refresh=20261024-laser-tickets-2-6-replaced-v1" : ""}` })).map(withChineseReplacementFront);
