import { CHINESE_MOON_ONE_CODES, CHINESE_MOON_TWO_CODES, CHINESE_MOON_THREE_CODES, CHINESE_MOON_FOUR_CODES, CHINESE_MOON_FIVE_CODES, CHINESE_MOON_SIX_CODES, CHINESE_MOON_SEVEN_CODES, CHINESE_MOON_EIGHT_CODES, CHINESE_MOON_NINE_CODES, CHINESE_MOON_TEN_CODES, CHINESE_MOON_ELEVEN_CODES, CHINESE_MOON_TWELVE_CODES, CHINESE_FUN_ONE_CODES, CHINESE_FUN_TWO_CODES, CHINESE_FUN_THREE_CODES, CHINESE_FUN_FOUR_CODES, CHINESE_FUN_FIVE_CODES, CHINESE_FUN_SIX_CODES, CHINESE_FUN_SEVEN_CODES, CHINESE_FUN_EIGHT_CODES, CHINESE_FUN_NINE_CODES, CHINESE_RAINBOW_ONE_CODES, CHINESE_RAINBOW_TWO_CODES, CHINESE_RAINBOW_THREE_CODES, CHINESE_RAINBOW_FOUR_CODES, CHINESE_RAINBOW_FIVE_CODES, CHINESE_STAR_ONE_CODES, CHINESE_STAR_TWO_CODES, CHINESE_STAR_THREE_CODES, CHINESE_PROMOS_CODES, CHINESE_STARDUST_ONE_CODES, CHINESE_STARDUST_TWO_CODES, CHINESE_MAGICBOOK_ONE_CODES, CHINESE_NEWYEARS_ONE_CODES, CHINESE_NEWYEARS_TWO_CODES, CHINESE_KUJI_RAFFLES_CODES, CHINESE_LASER_TICKETS_CODES } from "./Chinese Codes + Char/Chinese-Codes";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { onAuthIdentityChange } from "@/lib/auth-identity";
import { CARD_IMAGE_WORKER_URL } from "@/lib/card-images";
import { getCachedCardImage } from "@/lib/card-image-cache";
export const CN_MOON_ONE_IMAGE_REVISION = "20261021-m1-gallery-157-v2";
export const CN_MOON_TWO_IMAGE_REVISION = "20261022-m2-cloudflare-replaced-images-v4";
export const CN_MOON_THREE_IMAGE_REVISION = "20261021-m3-complete-115-v1";
export const CN_MOON_FOUR_IMAGE_REVISION = "20261021-m4-complete-132-v1";
export const CN_MOON_FIVE_IMAGE_REVISION = "20261021-m5-complete-134-v1";
export const CN_MOON_SIX_IMAGE_REVISION = "20261021-m6-complete-152-v1";
export const CN_MOON_SEVEN_IMAGE_REVISION = "20261021-m7-complete-186-v1";
export const CN_MOON_EIGHT_IMAGE_REVISION = "20261021-m8-complete-189-v1";
export const CN_MOON_NINE_IMAGE_REVISION = "20261021-m9-complete-158-v1";
export const CN_MOON_TEN_IMAGE_REVISION = "20261021-m10-complete-158-v1";
export const CN_MOON_ELEVEN_IMAGE_REVISION = "20261022-m11-complete-162-v1";
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
        return `${getChineseCardImage(`Chinese Sets/Moon-Six-CN/CN-M6-${code}${index}.webp`)}?v=${CN_MOON_SIX_IMAGE_REVISION}`;
    },
    moonFive: (rarity: string, number: number | string): string => {
        const code = rarity.trim().toUpperCase();
        const index = Number(number);
        if (!/^[A-Z]+$/.test(code) || !Number.isSafeInteger(index) || index < 1)
            throw new Error("Invalid Chinese Moon Five card code.");
        const filePrefix = ["R", "SR", "HR"].includes(code) ? "CN-M4" : "CN-M5";
        return `${getChineseCardImage(`Chinese Sets/Moon-Five-CN/${filePrefix}-${code}${index}.webp`)}?v=${CN_MOON_FIVE_IMAGE_REVISION}`;
    },
    moonFour: (rarity: string, number: number | string): string => {
        const code = rarity.trim().toUpperCase();
        const index = Number(number);
        if (!/^[A-Z]+$/.test(code) || !Number.isSafeInteger(index) || index < 1)
            throw new Error("Invalid Chinese Moon Four card code.");
        const imageNumber = code === "HR" ? getChineseMoonFourHRImageNumber(index) : index;
        return `${getChineseCardImage(`Chinese Sets/Moon-Four-CN/CN-M4-${code}${imageNumber}.webp`)}?v=${CN_MOON_FOUR_IMAGE_REVISION}`;
    },
    moonThree: (rarity: string, number: number | string): string => {
        const code = rarity.trim().toUpperCase();
        const index = Number(number);
        if (!/^[A-Z]+$/.test(code) || !Number.isSafeInteger(index) || index < 1)
            throw new Error("Invalid Chinese Moon Three card code.");
        const imageIndex = code === "HR" && index >= 15 && index <= 30 ? index + 1 : index;
        return `${getChineseCardImage(`Chinese Sets/Moon-Three-CN/CN-M3-${code}${imageIndex}.webp`)}?v=${CN_MOON_THREE_IMAGE_REVISION}`;
    },
    moonOne: (rarity: string, number: number | string): string => {
        const code = rarity.trim().toUpperCase();
        const index = Number(number);
        if (!/^[A-Z]+$/.test(code) || !Number.isSafeInteger(index) || index < 1)
            throw new Error("Invalid Chinese Moon One card code.");
        return `${getChineseCardImage(`${CN_IMAGE_ROOT}/CN-M1-${code}${index}.webp`)}?v=${CN_MOON_ONE_IMAGE_REVISION}`;
    },
};
export const getChineseMoonOneFront = (number: number | string, rarity = "R") => cardImagePathsCN.moonOne(rarity, number);
export const CN_MOON_ONE_SET_ID = "cn-moon-one";
export const CN_MOON_ONE_CARDS = CHINESE_MOON_ONE_CODES.map(card => ({ ...card, image: getChineseMoonOneFront(card.number, card.rarity) }));
export const CN_MOON_TWO_SET_ID = "cn-moon-two";
export const getChineseMoonTwoFront = (number: number | string, rarity = "R") => {
    const code = rarity.trim().toUpperCase();
    const index = Number(number);
    if (!/^[A-Z]+$/.test(code) || !Number.isSafeInteger(index) || index < 1)
        throw new Error("Invalid Chinese Moon Two card code.");
    if (code === "UR")
        return getChineseMoonOneFront(index, "UR");
    const fileNumber = code === "R" && index === 1 ? "01" : String(index);
    return `${getChineseCardImage(`Chinese Sets/Moon-Two-CN/CN-M2-${code}${fileNumber}.webp`)}?v=${CN_MOON_TWO_IMAGE_REVISION}`;
};
export const CN_MOON_TWO_CARDS = CHINESE_MOON_TWO_CODES.map(card => ({ ...card, image: getChineseMoonTwoFront(card.number, card.rarity) }));
export const getChineseMoonThreeFront = (number: number | string, rarity = "R") => cardImagePathsCN.moonThree(rarity, number);
export const CN_MOON_THREE_SET_ID = "cn-moon-three";
export const CN_MOON_THREE_CARDS = CHINESE_MOON_THREE_CODES.map(card => ({ ...card, image: getChineseMoonThreeFront(card.number, card.rarity) }));
export const getChineseMoonFourFront = (number: number | string, rarity = "R") => cardImagePathsCN.moonFour(rarity, number);
export const CN_MOON_FOUR_SET_ID = "cn-moon-four";
export const CN_MOON_FOUR_CARDS = CHINESE_MOON_FOUR_CODES.map(card => ({ ...card, image: getChineseMoonFourFront(card.number, card.rarity) }));
export const getChineseMoonFiveFront = (number: number | string, rarity = "R") => cardImagePathsCN.moonFive(rarity, number);
export const CN_MOON_FIVE_SET_ID = "cn-moon-five";
export const CN_MOON_FIVE_CARDS = CHINESE_MOON_FIVE_CODES.map(card => ({ ...card, image: getChineseMoonFiveFront(card.number, card.rarity) }));
export const getChineseMoonSixFront = (number: number | string, rarity = "R") => cardImagePathsCN.moonSix(rarity, number);
export const CN_MOON_SIX_SET_ID = "cn-moon-six";
export const CN_MOON_SIX_CARDS = CHINESE_MOON_SIX_CODES.map(card => ({ ...card, image: getChineseMoonSixFront(card.number, card.rarity) }));
export const getChineseMoonSevenFront = (number: number | string, rarity = "R") => cardImagePathsCN.moonSeven(rarity, number);
export const CN_MOON_SEVEN_SET_ID = "cn-moon-seven";
export const CN_MOON_SEVEN_CARDS = CHINESE_MOON_SEVEN_CODES.map(card => ({ ...card, image: getChineseMoonSevenFront(card.number, card.rarity) }));
export const getChineseMoonEightFront = (number: number | string, rarity = "R") => cardImagePathsCN.moonEight(rarity, number);
export const CN_MOON_EIGHT_SET_ID = "cn-moon-eight";
export const CN_MOON_EIGHT_CARDS = CHINESE_MOON_EIGHT_CODES.map(card => ({ ...card, image: getChineseMoonEightFront(card.number, card.rarity) }));
export const getChineseMoonNineFront = (number: number | string, rarity = "R") => cardImagePathsCN.moonNine(rarity, number);
export const CN_MOON_NINE_SET_ID = "cn-moon-nine";
export const CN_MOON_NINE_CARDS = CHINESE_MOON_NINE_CODES.map(card => ({ ...card, image: getChineseMoonNineFront(card.number, card.rarity) }));
export const getChineseMoonTenFront = (number: number | string, rarity = "R") => cardImagePathsCN.moonTen(rarity, number);
export const CN_MOON_TEN_SET_ID = "cn-moon-ten";
export const CN_MOON_TEN_CARDS = CHINESE_MOON_TEN_CODES.map(card => ({ ...card, image: getChineseMoonTenFront(card.number, card.rarity) }));
export const getChineseMoonElevenFront = (number: number | string, rarity = "R") => cardImagePathsCN.moonEleven(rarity, number);
export const CN_MOON_ELEVEN_SET_ID = "cn-moon-eleven";
export const CN_MOON_ELEVEN_CARDS = CHINESE_MOON_ELEVEN_CODES.map(card => ({ ...card, image: getChineseMoonElevenFront(card.number, card.rarity) }));
export const getChineseMoonTwelveFront = (number: number | string, rarity = "R") => cardImagePathsCN.moonTwelve(rarity, number);
export const CN_MOON_TWELVE_SET_ID = "cn-moon-twelve";
export const CN_MOON_TWELVE_CARDS = CHINESE_MOON_TWELVE_CODES.map(card => ({ ...card, image: getChineseMoonTwelveFront(card.number, card.rarity) }));
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
});
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
});
export const CN_FUN_THREE_IMAGE_REVISION = "20261022-f3-complete-134-v1";
export const CN_FUN_THREE_SET_ID = "cn-fun-three";
export const CN_FUN_THREE_CARDS = CHINESE_FUN_THREE_CODES.map(card => {
    if (["N", "DN", "CR"].includes(card.rarity))
        return { ...card, image: `${getChineseCardImage(`Chinese Sets/Fun-Three-CN/CN-F3-${card.rarity}${card.number}.webp`)}?v=${CN_FUN_THREE_IMAGE_REVISION}` };
    const sourceCode = card.code.replace(/^QY03-(SR|UR)-/, "HY06-$1-");
    const sourceCards = sourceCode.startsWith("YH-T05-") ? CN_MOON_FIVE_CARDS : CN_MOON_SIX_CARDS;
    const source = sourceCards.find(item => item.rarity === card.rarity && item.code === sourceCode);
    if (!source)
        throw new Error(`Missing Chinese Fun Three source card: ${card.code}`);
    return { ...card, image: source.image };
});
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
});
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
});
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
});
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
});
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
});
export const CN_FUN_NINE_IMAGE_REVISION = "20261022-f9-complete-151-v1";
export const CN_FUN_NINE_SET_ID = "cn-fun-nine";
export const CN_FUN_NINE_CARDS = CHINESE_FUN_NINE_CODES.map(card => {
    if (card.rarity !== "SR")
        return { ...card, image: `${getChineseCardImage(`Chinese Sets/Fun-Nine-CN/CN-F9-${card.rarity}${card.number}.webp`)}?v=${CN_FUN_NINE_IMAGE_REVISION}` };
    const source = CN_MOON_TWELVE_CARDS.find(item => item.rarity === card.rarity && item.code === card.code);
    if (!source)
        throw new Error(`Missing Chinese Fun Nine source card: ${card.code}`);
    return { ...card, image: source.image };
});
export const CN_RAINBOW_ONE_IMAGE_REVISION = "20261022-r1-complete-107-v1";
export const CN_RAINBOW_ONE_SET_ID = "cn-rainbow-one";
export const CN_RAINBOW_ONE_CARDS = CHINESE_RAINBOW_ONE_CODES.map(card => ({ ...card, image: `${getChineseCardImage(`Chinese Sets/Rainbow-One-CN/CN-R1-${card.rarity}${card.number}.webp`)}?v=${CN_RAINBOW_ONE_IMAGE_REVISION}` }));
export const CN_RAINBOW_TWO_IMAGE_REVISION = "20261022-r2-complete-39-v1";
export const CN_RAINBOW_TWO_SET_ID = "cn-rainbow-two";
export const CN_RAINBOW_TWO_CARDS = CHINESE_RAINBOW_TWO_CODES.map(card => ({ ...card, image: `${getChineseCardImage(`Chinese Sets/Rainbow-Two-CN/CN-R2-${card.rarity}${card.number}.webp`)}?v=${CN_RAINBOW_TWO_IMAGE_REVISION}` }));
export const CN_RAINBOW_THREE_IMAGE_REVISION = "20261022-r3-complete-133-v1";
export const CN_RAINBOW_THREE_SET_ID = "cn-rainbow-three";
export const CN_RAINBOW_THREE_CARDS = CHINESE_RAINBOW_THREE_CODES.map(card => {
    if (!["R", "SR", "SSR", "UR"].includes(card.rarity))
        return { ...card, image: `${getChineseCardImage(`Chinese Sets/Rainbow-Three-CN/CN-R3-${card.rarity}${card.number}.webp`)}?v=${CN_RAINBOW_THREE_IMAGE_REVISION}` };
    const sourceCards = card.code.startsWith("YH-T04-") || /^YH-UR-04[5-9]$/.test(card.code) ? CN_MOON_FOUR_CARDS : CN_MOON_FIVE_CARDS;
    const source = sourceCards.find(item => item.rarity === card.rarity && item.code === card.code);
    if (!source)
        throw new Error(`Missing Chinese Rainbow Three source card: ${card.code}`);
    return { ...card, image: source.image };
});
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
});
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
});
export const CN_STAR_ONE_IMAGE_REVISION = "20261022-s1-complete-82-v1";
export const CN_STAR_ONE_SET_ID = "cn-star-one";
export const CN_STAR_ONE_CARDS = CHINESE_STAR_ONE_CODES.map(card => ({ ...card, image: `${getChineseCardImage(`Chinese Sets/Star-One-CN/CN-S1-${card.rarity}${card.number}.webp`)}?v=${CN_STAR_ONE_IMAGE_REVISION}` }));
export const CN_STAR_TWO_IMAGE_REVISION = "20261022-s2-complete-105-v1";
export const CN_STAR_TWO_SET_ID = "cn-star-two";
export const CN_STAR_TWO_CARDS = CHINESE_STAR_TWO_CODES.map(card => ({ ...card, image: `${getChineseCardImage(`Chinese Sets/Star-Two-CN/CN-S2-${card.rarity}${card.number}.webp`)}?v=${CN_STAR_TWO_IMAGE_REVISION}` }));
export const CN_STAR_THREE_IMAGE_REVISION = "20261022-s3-complete-143-v1";
export const CN_STAR_THREE_SET_ID = "cn-star-three";
export const CN_STAR_THREE_CARDS = CHINESE_STAR_THREE_CODES.map(card => ({ ...card, image: `${getChineseCardImage(`Chinese Sets/Star-Three-CN/CN-S3-${card.rarity}${card.number}.webp`)}?v=${CN_STAR_THREE_IMAGE_REVISION}` }));
export const CN_PROMOS_IMAGE_REVISION = "20261022-pr-complete-83-v2";
export const CN_PROMOS_SET_ID = "cn-promos";
export const CN_PROMOS_CARDS = CHINESE_PROMOS_CODES.map(card => ({ ...card, image: `${getChineseCardImage(`Chinese Sets/Promotional-Cards/${(card.rarity === "KB" || card.rarity === "SPR" || card.rarity === "ANN40") ? card.code : card.rarity === "TFXMLP" ? `TFXMLP${card.number}` : `CN-PR-${card.key === "PR-D19" ? "D19" : String(card.number).padStart(3, "0")}`}.webp`)}?v=${CN_PROMOS_IMAGE_REVISION}` }));
export const CN_STARDUST_ONE_IMAGE_REVISION = "20261023-sd1-lsr-replaced-v2";
export const CN_STARDUST_ONE_SET_ID = "cn-stardust-one";
export const CN_STARDUST_ONE_CARDS = CHINESE_STARDUST_ONE_CODES.map(card => ({ ...card, image: `${getChineseCardImage(`Chinese Sets/Stardust-One-CN/CN-SD1-${card.rarity}${card.number}.webp`)}?v=${CN_STARDUST_ONE_IMAGE_REVISION}` }));
export const CN_STARDUST_TWO_IMAGE_REVISION = "20261023-sd2-complete-111-v1";
export const CN_STARDUST_TWO_SET_ID = "cn-stardust-two";
export const CN_STARDUST_TWO_CARDS = CHINESE_STARDUST_TWO_CODES.map(card => ({ ...card, image: `${getChineseCardImage(`Chinese Sets/Stardust-Two-CN/CN-SD2-${card.rarity}${card.number}.webp`)}?v=${CN_STARDUST_TWO_IMAGE_REVISION}` }));
export const CN_MAGICBOOK_ONE_IMAGE_REVISION = "20261023-eg1-complete-87-v1";
export const CN_MAGICBOOK_ONE_SET_ID = "cn-magicbook-one";
export const CN_MAGICBOOK_ONE_CARDS = CHINESE_MAGICBOOK_ONE_CODES.map(card => ({ ...card, image: `${getChineseCardImage(`Chinese Sets/Equestria-Girls-One-CN/CN-EG1-${card.rarity}${card.number}.webp`)}?v=${CN_MAGICBOOK_ONE_IMAGE_REVISION}` }));
export const CN_NEWYEARS_ONE_IMAGE_REVISION = "20261023-ny1-complete-24-v1";
export const CN_NEWYEARS_ONE_SET_ID = "cn-newyears-one";
export const CN_NEWYEARS_ONE_CARDS = CHINESE_NEWYEARS_ONE_CODES.map(card => ({ ...card, image: `${getChineseCardImage(`Chinese Sets/NewYears-One-CN/CN-NY1-${card.rarity}${card.number}.webp`)}?v=${CN_NEWYEARS_ONE_IMAGE_REVISION}` }));
export const CN_KUJI_RAFFLES_IMAGE_REVISION = "20261024-all-kuji-images-refresh-v1";
export const CN_KUJI_RAFFLES_SET_ID = "cn-kuji-raffles";
export const CN_KUJI_RAFFLES_CARDS = CHINESE_KUJI_RAFFLES_CODES.map(({ imageFile, ...card }) => ({ ...card, image: `${getChineseCardImage(`Chinese Sets/Kuji-Sets/${imageFile}`)}?v=${CN_KUJI_RAFFLES_IMAGE_REVISION}${/^KUJI4-B[1-4]\.webp$/.test(imageFile) ? "&refresh=20261024-kuji4-b-replaced-v1" : ""}${imageFile === "KUJI1-D1.webp" ? "&refresh=20261024-kuji1-d1-replaced-v1" : ""}${/^KUJI3-(?:TICKET[0-9]+|C[1-6])\.webp$/.test(imageFile) ? "&refresh=20261024-kuji3-tickets-replaced-v2" : /^KUJI3-(?:TICKET[0-9]+|B[1-4]|A[1-2]|S|LAST)\.webp$/.test(imageFile) ? "&refresh=20261024-kuji3-all-replaced-v1" : /^KUJI2-(?:TICKET[0-9]+|B[1-4]|A[1-2]|S|LAST)\.webp$/.test(imageFile) ? "&refresh=20261024-kuji2-all-replaced-v2" : imageFile === "KUJI2-TICKET20.webp" ? "&refresh=20261024-kuji2-ticket20-replaced-v1" : /^KUJI[1-4]-TICKET[0-9]+\.webp$/.test(imageFile) ? "&refresh=20261024-kuji-tickets-replaced-v3" : /^KUJI1-(?:B[1-4]|A[1-2]|S|LAST)\.webp$/.test(imageFile) ? "&refresh=20261024-kuji1-prizes-replaced-v1" : ""}` }));
export const CN_NEWYEARS_TWO_IMAGE_REVISION = "20261023-ny2-complete-91-v1";
export const CN_NEWYEARS_TWO_SET_ID = "cn-newyears-two";
export const CN_NEWYEARS_TWO_CARDS = CHINESE_NEWYEARS_TWO_CODES.map(card => ({ ...card, image: `${getChineseCardImage(`Chinese Sets/NewYears-Two-CN/CN-NY2-${card.rarity}${card.number}.webp`)}?v=${CN_NEWYEARS_TWO_IMAGE_REVISION}` }));
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
        setState({ source: src, url: "", error: "" });
        const load = async () => {
            try {
                const url = new URL(src);
                if (decodeURIComponent(url.pathname).startsWith("/Chinese Sets/Moon-Two-CN/"))
                    url.searchParams.set("v", CN_MOON_TWO_IMAGE_REVISION);
                const requestUrl = url.href;
                if (url.origin !== new URL(CARD_IMAGE_WORKER_URL).origin || !decodeURIComponent(url.pathname).startsWith("/Chinese Sets/"))
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
                if (!active) {
                    image.release();
                    return;
                }
                release = image.release;
                setState({ source: src, url: image.url, error: "" });
            }
            catch (cause) {
                if (active)
                    setState({ source: src, url: "", error: cause instanceof Error ? cause.message : "Card image could not load." });
            }
        };
        void load();
        return () => {
            active = false;
            release?.();
        };
    }, [src, authVersion]);
    return state.source === src ? state : { source: src, url: "", error: "" };
}
export const CN_LASER_TICKETS_SET_ID = "cn-laser-tickets";
export const CN_LASER_TICKETS_IMAGE_REVISION = "20261024-laser-tickets-v1";
export const CN_LASER_TICKETS_CARDS = CHINESE_LASER_TICKETS_CODES.map(card => ({ ...card, image: `${getChineseCardImage(`Chinese Sets/Laser-Tickets-CN/LT-${card.rarity === "SH" ? "SH" : "FWM"}-${card.number}.webp`)}?v=${CN_LASER_TICKETS_IMAGE_REVISION}${card.rarity === "LTR" && card.number === 6 ? "&refresh=20261024-laser-ticket6-replaced-v2" : card.rarity === "LTR" && card.number === 2 ? "&refresh=20261024-laser-tickets-2-6-replaced-v1" : ""}` }));
