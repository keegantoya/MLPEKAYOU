import type { CSSProperties } from "react";
export const funCatalog = (() => {
    const getRarityCode = (rarity: string) => {
        return rarity;
    };
    const getDisplayCardCode = (setId: string, rarity: string, number: number) => {
        const rarityCode = getRarityCode(rarity);
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
            return `INT02-UR-${String(specialNumbers[number - 7]).padStart(3, "0")}`;
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
            return `INT03-UR-${String(specialNumbers[number - 7]).padStart(3, "0")}`;
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
        return `${baseCode}-${rarityCode}-${cardNumber}`;
    };
    const sets: {
        id: string;
        name: string;
        folder: string;
        prefix: string;
        rarities: Record<string, number>;
    }[] = [
        {
            id: "7",
            name: "Fun Moments First Edition",
            folder: "fun-moments-one",
            prefix: "FM1",
            rarities: { "N": 20, "SN": 20, "R": 35, "SR": 15, "SSR": 15, "UR": 10, "CR": 12 },
        },
        {
            id: "8",
            name: "Fun Moments Second Edition",
            folder: "fun-moments-two",
            prefix: "FM2",
            rarities: { "N": 20, "SN": 20, "R": 35, "SR": 15, "SSR": 15, "UR": 10, "UGR": 9, "CR": 12 },
        },
        {
            id: "11",
            name: "Fun Moments Third Edition",
            folder: "fun-moments-three",
            prefix: "FM3",
            rarities: { "N": 20, "SN": 20, "R": 35, "SR": 15, "SSR": 15, "UR": 10, "UGR": 9, "CR": 12, "SCR": 12 },
        },
    ];
    return { sets, getDisplayCardCode, getRarityCode };
})();
export const moonCatalog = (() => {
    const getRarityCode = (rarity: string) => {
        if (rarity === "SHINING ZR")
            return "SZR";
        return rarity;
    };
    const getDisplayCardCode = (setId: string, rarity: string, number: number) => {
        const rarityCode = getRarityCode(rarity);
        const cardNumber = String(number).padStart(3, "0");
        if (setId === "2" && rarity === "HR") {
            return `INT03-HR-${cardNumber}`;
        }
        if (setId === "2" &&
            (rarity === "SHINING ZR" || rarity === "SZR")) {
            return `MLPME02-\u25C7ZR-${cardNumber}`;
        }
        if (setId === "13" && (rarity === "SZR" || rarity === "SHINING ZR")) {
            return `MLPME04-\u25C7ZR-${cardNumber}`;
        }
        if (setId === "3" && rarity === "SZR") {
            return `MLPME03-\u25C7ZR-${cardNumber}`;
        }
        const setCodeMap: Record<string, string> = {
            "1": "MLPME01",
            "2": "MLPME02",
            "3": "MLPME03",
            "13": "MLPME04",
        };
        return `${setCodeMap[setId]}-${rarityCode}-${cardNumber}`;
    };
    const sets: {
        id: string;
        name: string;
        folder: string;
        prefix: string;
        rarities: Record<string, number>;
    }[] = [
        {
            id: "1",
            name: "Moon First Edition",
            folder: "first-edition-moon",
            prefix: "M1",
            rarities: { "R": 30, "SR": 20, "SSR": 54, "HR": 36, "UR": 16, "LSR": 15, "SGR": 8, "SC": 7 },
        },
        {
            id: "2",
            name: "Moon Second Edition",
            folder: "second-edition-moon",
            prefix: "M2",
            rarities: { "R": 30, "SR": 20, "SSR": 54, "HR": 30, "UR": 16, "LSR": 16, "SGR": 8, "ZR": 7, "SC": 7, "SHINING ZR": 1 },
        },
        {
            id: "3",
            name: "Moon Third Edition",
            folder: "third-edition-moon",
            prefix: "M3",
            rarities: { "R": 60, "SR": 40, "SSR": 40, "HR": 60, "LSR": 32, "UR": 18, "SGR": 16, "ZR": 14, "SC": 7, "SZR": 3 },
        },
        {
            id: "13",
            name: "Moon Fourth Edition",
            folder: "fourth-edition-moon",
            prefix: "M4",
            rarities: { "R": 30, "SR": 20, "SSR": 26, "HR": 30, "LSR": 16, "UR": 16, "SGR": 8, "ZR": 7, "SC": 7, "SZR": 2 },
        },
    ];
    return { sets, getDisplayCardCode, getRarityCode };
})();
export const promosCatalog = (() => {
    const ccgCards = [1, 2, 3, 4, 5, 7, 14, 8, 9, 10, 11, 12, 13, 15];
    const tcgCards = Array.from({ length: 28 }, (_, i) => i + 1);
    const getDisplayCardCode = (setId: string, number: number) => {
        if (setId === "9") {
            if (number === 14)
                return "MLPE-PR-009";
            if (number === 15)
                return "NYCC-001";
            if (number <= 7) {
                return `MLPE-PR-${String(number).padStart(3, "0")}`;
            }
            return `SDCC-${String(number - 7).padStart(3, "0")}`;
        }
        if (setId === "tcgpromos") {
            if (number <= 6) {
                return `RR-${String(number).padStart(2, "0")}`;
            }
            if (number <= 12) {
                return `BP01-CR-${String(number).padStart(2, "0")}`;
            }
            if (number <= 18) {
                return `BP02-CR-${String(number - 12).padStart(2, "0")}`;
            }
            const newPromoNames: Record<number, string> = {
                19: "TK-01",
                20: "\u203BTK-01",
                21: "\u203BTK-01",
                22: "\u203BBP03-CR-01",
                23: "\u203BBP03-CR-02",
                24: "\u203BBP03-CR-03",
                25: "\u203BBP01-CR-04",
                26: "\u203BBP01-CR-05",
                27: "\u203BBP01-CR-06",
            };
            return newPromoNames[number] || `RR-${String(number).padStart(2, "0")}`;
        }
        return `RR-${String(number).padStart(2, "0")}`;
    };
    const getCardKey = (setId: string, number: number) => {
        if (setId === "9") {
            return `PR-${number}`;
        }
        return `RR${String(number).padStart(2, "0")}`;
    };
    const sets = [
        {
            id: "9",
            name: "CCG Promos",
            cards: ccgCards,
        },
        {
            id: "tcgpromos",
            name: "TCG Promos",
            cards: tcgCards,
        },
    ];
    return { sets, getDisplayCardCode, getCardKey };
})();
export const rainbowCatalog = (() => {
    const getRarityCode = (rarity: string) => {
        return rarity;
    };
    const getDisplayCardCode = (setId: string, rarity: string, number: number) => {
        const rarityCode = getRarityCode(rarity);
        const cardNumber = String(number).padStart(3, "0");
        if (setId === "5" && rarity === "R") {
            if (number <= 20) {
                return `INT01-R-${cardNumber}`;
            }
            return `RBE01-R-${String(number - 20).padStart(3, "0")}`;
        }
        if (setId === "5" && rarity === "SR") {
            const actualNumber = number <= 7
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
                return `INT01-SSR-${String(specialNumbers[number - 7]).padStart(3, "0")}`;
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
            return `MLPME03-SR-${String(actualNumbers[number - 1]).padStart(3, "0")}`;
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
    const sets: {
        id: string;
        name: string;
        folder: string;
        prefix: string;
        rarities: Record<string, number>;
    }[] = [
        {
            id: "5",
            name: "Rainbow First Edition",
            folder: "rainbow-one",
            prefix: "R1",
            rarities: { "R": 30, "SR": 15, "FR": 18, "TR": 12, "TGR": 8, "MTR": 18, "SSR": 15, "UR": 15, "USR": 8, "XR": 7 },
        },
        {
            id: "6",
            name: "Rainbow Second Edition",
            folder: "rainbow-two",
            prefix: "R2",
            rarities: { "BASE": 18, "R": 30, "SR": 14, "ST": 20, "SSR": 15, "FR": 18, "TR": 12, "TGR": 8, "UR": 19, "USR": 8, "XR": 8 },
        },
    ];
    return { sets, getDisplayCardCode, getRarityCode };
})();
export const starCatalog = (() => {
    const getRarityCode = (rarity: string) => {
        return rarity;
    };
    const getDisplayCardCode = (setId: string, rarity: string, number: number) => {
        const rarityCode = getRarityCode(rarity);
        const cardNumber = String(number).padStart(3, "0");
        if (setId === "4" && rarity === "SAR") {
            return `MLPSE01-\u25C7AR-${cardNumber}`;
        }
        const baseCode = "MLPSE01";
        return `${baseCode}-${rarity === "SAR" ? "\u25C7AR" : rarityCode}-${cardNumber}`;
    };
    const sets: {
        id: string;
        name: string;
        folder: string;
        prefix: string;
        rarities: Record<string, number>;
    }[] = [
        {
            id: "4",
            name: "Star First Edition",
            folder: "star-one",
            prefix: "S1",
            rarities: { "SSR": 20, "SCR": 18, "UR": 18, "USR": 15, "AR": 9, "OR": 7, "BP": 9, "SAR": 9 },
        },
    ];
    return { sets, getDisplayCardCode, getRarityCode };
})();
export const tcgCatalog = (() => {
    const sets: {
        id: string;
        name: string;
        folder: string;
        prefix: string;
        rarities: Record<string, number>;
    }[] = [
        {
            id: "SD",
            name: "FRIENDSHIPS BEGIN",
            folder: "friendships-begin",
            prefix: "SD",
            rarities: { "C": 9, "U": 7, "SR": 6, "SPR": 10, "GR": 6, "CR": 6, "ER": 6, "PER": 12, "PRR": 6 },
        },
        {
            id: "FW",
            name: "FANTASY WONDERLAND",
            folder: "fantasy-wonderland",
            prefix: "BP01",
            rarities: { "C": 48, "U": 18, "ER": 6, "SR": 14, "SPR": 28, "GR": 12, "CR": 12, "RR": 6, "PER": 12, "PSPR": 11, "PGR": 6, "PCR": 12, "PRR": 6 },
        },
        {
            id: "12",
            name: "DISCORD",
            folder: "discord",
            prefix: "BP02",
            rarities: { "C": 48, "U": 18, "ER": 6, "SR": 14, "SPR": 28, "GR": 12, "CR": 12, "RR": 6, "PER": 12, "PGR": 6, "PSPR": 11, "PCR": 12, "PRR": 6 },
        },
        {
            id: "14",
            name: "NIGHTMARE NIGHT",
            folder: "nightmare-night",
            prefix: "BP03",
            rarities: { "C": 48, "U": 18, "ER": 6, "SR": 14, "SPR": 28, "GR": 12, "CR": 12, "RR": 6, "PER": 12, "PGR": 5, "PSPR": 11, "PCR": 12, "PRR": 6 },
        },
    ];
    const getCards = (set: {
        id: string;
        rarities: Record<string, number>;
    }, TCGCharacterMap: Record<string, string[]> = {}) => {
        return Object.entries(set.rarities).flatMap(([rarity, count]) => {
            if (set.id === "SD") {
                if (rarity === "PER") {
                    return Array.from({ length: count as number }, (_, i) => ({
                        rarity,
                        key: `SD01PER${String(i + 7).padStart(2, "0")}`,
                        characters: TCGCharacterMap[`SD-PER-${i + 7}`] ?? [],
                    }));
                }
                return Array.from({ length: count as number }, (_, i) => ({
                    rarity,
                    key: `SD01${rarity}${String(i + 1).padStart(2, "0")}`,
                    characters: TCGCharacterMap[`SD-${rarity}-${i + 1}`] ?? [],
                }));
            }
            if (set.id === "14") {
                if (rarity === "ER") {
                    return ["01", "02"].flatMap((number) => ["A", "B", "C"].map((variant) => ({
                        rarity,
                        key: `BP03-ER${number}-${variant}`,
                        characters: TCGCharacterMap[`BP03-ER${number}-${variant}`] ?? [],
                    })));
                }
                if (rarity === "PER") {
                    return ["01", "02"].flatMap((number) => ["A", "A2", "B", "B2", "C", "C2"].map((variant) => ({
                        rarity,
                        key: `PBP03-ER${number}-${variant}`,
                        characters: TCGCharacterMap[`PBP03-ER${number}-${variant}`] ?? [],
                    })));
                }
                if (rarity === "PGR") {
                    return ["07", "08", "09", "11", "12"].map((number) => ({
                        rarity,
                        key: `PBP03-GR${number}`,
                        characters: TCGCharacterMap[`PBP03-GR${number}`] ?? [],
                    }));
                }
                if (rarity === "PSPR") {
                    return ["03", "04", "06", "08", "11", "16", "17", "19", "20", "23", "25"].map((number) => ({
                        rarity,
                        key: `PBP03-SPR${number}`,
                        characters: TCGCharacterMap[`PBP03-SPR${number}`] ?? [],
                    }));
                }
                if (rarity === "PCR") {
                    return Array.from({ length: 12 }, (_, i) => ({
                        rarity,
                        key: `PBP03-CR${String(i + 1).padStart(2, "0")}`,
                        characters: TCGCharacterMap[`PBP03-CR${String(i + 1).padStart(2, "0")}`] ?? [],
                    }));
                }
                if (rarity === "PRR") {
                    return Array.from({ length: 6 }, (_, i) => ({
                        rarity,
                        key: `PBP03-RR${String(i + 1).padStart(2, "0")}`,
                        characters: TCGCharacterMap[`PBP03-RR${String(i + 1).padStart(2, "0")}`] ?? [],
                    }));
                }
                return Array.from({ length: count as number }, (_, i) => ({
                    rarity,
                    key: `BP03-${rarity}${String(i + 1).padStart(2, "0")}`,
                    characters: TCGCharacterMap[`BP03-${rarity}${String(i + 1).padStart(2, "0")}`] ?? [],
                }));
            }
            if (set.id === "12") {
                if (rarity === "PER") {
                    return Array.from({ length: 6 }, (_, i) => [
                        {
                            rarity,
                            key: `BP02-PER${String(i + 1).padStart(2, "0")}-A2`,
                            characters: TCGCharacterMap[`12-PER-${i * 2 + 1}`] ?? [],
                        },
                        {
                            rarity,
                            key: `BP02-PER${String(i + 1).padStart(2, "0")}-B2`,
                            characters: TCGCharacterMap[`12-PER-${i * 2 + 2}`] ?? [],
                        },
                    ]).flat();
                }
                const countNum = count as number;
                return Array.from({ length: countNum }, (_, i) => ({
                    rarity,
                    key: `BP02-${rarity}${String(i + 1).padStart(2, "0")}`,
                    characters: TCGCharacterMap[`BP02-${rarity}${String(i + 1).padStart(2, "0")}`] ?? [],
                }));
            }
            if (rarity === "ER") {
                return Array.from({ length: 6 }, (_, i) => ({
                    rarity,
                    key: `BP01ER${String(i + 7).padStart(2, "0")}`,
                    characters: TCGCharacterMap[`FW-ER-${i + 7}`] ?? [],
                }));
            }
            if (rarity === "PSPR") {
                const numbers = [1, 2, 3, 5, 7, 8, 9, 12, 13, 18, 21];
                return numbers.map((n, index) => ({
                    rarity,
                    key: `BP01PSPR${String(n).padStart(2, "0")}`,
                    characters: TCGCharacterMap[`FW-PSPR-${index + 1}`] ?? [],
                }));
            }
            return Array.from({ length: count as number }, (_, i) => ({
                rarity,
                key: `BP01${rarity}${String(i + 1).padStart(2, "0")}`,
                characters: TCGCharacterMap[`FW-${rarity}-${i + 1}`] ?? [],
            }));
        });
    };
    const getDisplayCardCode = (setId: string, card: {
        rarity: string;
        key: string;
    }) => {
        const set = { id: setId };
        let displayCode = "";
        if (set.id === "SD") {
            if (card.rarity === "PER") {
                const num = parseInt(card.key.slice(-2), 10);
                const displayNum = Math.ceil((num - 6) / 2) + 6;
                displayCode = `\u203BSD01-ER${String(displayNum).padStart(2, "0")}`;
            }
            else if (card.rarity === "PRR") {
                displayCode = `\u203BSD01-RR${card.key.slice(-2)}`;
            }
            else {
                displayCode = card.key.replace(/^SD01/, "SD01-");
            }
        }
        else if (set.id === "14") {
            if (card.rarity === "PER") {
                const match = card.key.match(/PBP03-ER(\d{2})/);
                displayCode = match ? `\u203BBP03-ER${match[1]}` : card.key;
            }
            else if (card.rarity === "PSPR") {
                displayCode = `\u203BBP03-SPR${card.key.slice(-2)}`;
            }
            else if (card.rarity === "PGR") {
                displayCode = `\u203BBP03-GR${card.key.slice(-2)}`;
            }
            else if (card.rarity === "PCR") {
                displayCode = `\u203BBP03-CR${card.key.slice(-2)}`;
            }
            else if (card.rarity === "PRR") {
                displayCode = `\u203BBP03-RR${card.key.slice(-2)}`;
            }
            else {
                displayCode = card.key;
            }
        }
        else if (set.id === "12") {
            if (card.rarity === "PER") {
                const match = card.key.match(/PER(\d{2})/);
                displayCode = match ? `\u203BBP02-ER${match[1]}` : card.key;
            }
            else if (card.rarity === "PSPR") {
                const displayMap = [
                    "01", "02", "05", "10", "14", "15",
                    "16", "18", "23", "24", "26",
                ];
                const index = parseInt(card.key.slice(-2), 10) - 1;
                displayCode = `\u203BBP02-SPR${displayMap[index]}`;
            }
            else if (card.rarity === "PGR") {
                displayCode = `\u203BBP02-GR${card.key.slice(-2)}`;
            }
            else if (card.rarity === "PCR") {
                displayCode = `\u203BBP02-CR${card.key.slice(-2)}`;
            }
            else if (card.rarity === "PRR") {
                displayCode = `\u203BBP02-RR${card.key.slice(-2)}`;
            }
            else {
                displayCode = card.key.replace(/^BP02-?/, "BP02-");
            }
        }
        else {
            if (card.rarity === "ER") {
                displayCode = `BP01-ER${card.key.slice(-2)}`;
            }
            else if (card.rarity === "PER") {
                const perMap = [
                    "01", "02", "02", "02", "03", "03",
                    "04", "04", "05", "05", "06", "06",
                ];
                const index = parseInt(card.key.slice(-2), 10) - 1;
                displayCode = `\u203BBP01-ER${perMap[index]}`;
            }
            else if (card.rarity === "PSPR") {
                displayCode = `\u203BBP01-SPR${card.key.slice(-2)}`;
            }
            else if (card.rarity === "PGR") {
                displayCode = `\u203BBP01-GR${card.key.slice(-2)}`;
            }
            else if (card.rarity === "PCR") {
                displayCode = `\u203BBP01-CR${card.key.slice(-2)}`;
            }
            else if (card.rarity === "PRR") {
                displayCode = `\u203BBP01-RR${card.key.slice(-2)}`;
            }
            else {
                displayCode = card.key.replace(/^BP01/, "BP01-");
            }
        }
        return displayCode;
    };
    const getDisplayRarity = (rarity: string) => rarity.startsWith("P") ? `\u203B${rarity.slice(1)}` : rarity;
    return { sets, getCards, getDisplayCardCode, getDisplayRarity };
})();
const catalogGroups = [funCatalog, moonCatalog, promosCatalog, rainbowCatalog, starCatalog, tcgCatalog];
export const getISOSetId = (setId: string) => ({
    discord: "12", friendshipsbegin: "SD", "friendships-begin": "SD",
    "fantasy-wonderland": "FW", "nightmare-night": "14",
} as Record<string, string>)[String(setId)] || String(setId);
export const getISOSetName = (setId: string) => {
    const id = getISOSetId(setId);
    if (id === "hearthswarming-eve")
        return HEARTHSWARMING_EVE_NAME;
    for (const group of catalogGroups) {
        const set = group.sets.find((entry) => entry.id === id);
        if (set)
            return set.name;
    }
    return "Unknown collection";
};
export const getISOCardCode = (setId: string, cardKey: string) => {
    const id = getISOSetId(setId);
    const original = String(cardKey || "");
    let key = original;
    for (const prefix of [`${setId}:`, `${id}:`, `${setId}-`, `${id}-`]) {
        if (key.startsWith(prefix)) {
            key = key.slice(prefix.length);
            break;
        }
    }
    key = key.replace(/^BONUS-/, "");
    if (promosCatalog.sets.some((set) => set.id === id)) {
        const match = key.match(id === "9" ? /^PR-?(\d+)$/ : /^RR-?(\d+)$/);
        return match ? promosCatalog.getDisplayCardCode(id, Number(match[1])) : original;
    }
    for (const group of [funCatalog, moonCatalog, rainbowCatalog, starCatalog]) {
        if (!group.sets.some((set) => set.id === id))
            continue;
        const match = key.match(/^(.+)-(\d+)$/);
        if (!match || !/^[A-Z ]+$/.test(match[1]))
            return original;
        return group.getDisplayCardCode(id, match[1], Number(match[2]));
    }
    if (id === "hearthswarming-eve")
        return getHeartswarmingEveDisplayCode(key);
    const tcgSet = tcgCatalog.sets.find((set) => set.id === id);
    if (tcgSet) {
        if (id === "14")
            key = key.replace(/^(BP03-ER0[12])-([ABC])\2$/, "$1-$2");
        const card = tcgCatalog.getCards(tcgSet).find((entry) => entry.key === key);
        if (card)
            return tcgCatalog.getDisplayCardCode(id, card);
    }
    return original;
};
type ImagePathPart = string | number;
export const cardImagePaths = {
    ccg: (folder: ImagePathPart, prefix: ImagePathPart, rarity: ImagePathPart, number: ImagePathPart) => `/cards/${folder}/${prefix}${rarity}${number}.webp`,
    ccgPromo: (number: ImagePathPart) => `/promo-cards/mlpepr${String(number).padStart(3, "0")}.webp`,
    tcgPromo: (key: ImagePathPart) => `/tcgpromos/${key}.webp`,
    friendshipsBegin: (key: ImagePathPart) => `/friendships-begin/${key}.webp`,
    fantasyEmerald: (number: ImagePathPart) => `/fantasy-wonderland/SD01ER${number}.webp`,
    fantasyParallelEmerald: (number: ImagePathPart) => `/fantasy-wonderland/SD01PER${number}.webp`,
    fantasyWonderland: (key: ImagePathPart) => `/fantasy-wonderland/${key}.webp`,
    hearthswarmingEve: (key: ImagePathPart) => /^BP04-TK0[1-6]$/.test(String(key)) ? `/cards/hearthswarming-eve/TK-${String(Number(String(key).slice(-2)) + 1).padStart(2, "0")}.webp` : `/cards/hearthswarming-eve/${String(key).replace(/^BP02-GR/, "BP04-GR")}.webp`,
    discord: (key: ImagePathPart) => `/cards/discord/${key}.webp`,
    moonFour: (key: ImagePathPart) => getMoonFourImagePath(String(key)),
    nightmareNight: (key: ImagePathPart) => `/cards/nightmare-night/${key}.webp`,
    tcgRubyPromo: (number: ImagePathPart) => `/tcgpromos/RR${number}.webp`,
    fantasyParallelSapphire: (number: ImagePathPart) => `/fantasy-wonderland/BP01PSPR${number}.webp`,
    fantasyByPrefix: (prefix: ImagePathPart, number: ImagePathPart) => `/fantasy-wonderland/${prefix}${number}.webp`,
    discordParallelEmeraldA: (number: ImagePathPart) => `/cards/discord/BP02-PER${number}-A2.webp`,
    discordParallelEmeraldB: (number: ImagePathPart) => `/cards/discord/BP02-PER${number}-B2.webp`,
    discordByRarity: (rarity: ImagePathPart, number: ImagePathPart) => `/cards/discord/BP02-${rarity}${number}.webp`,
    friendshipsByPrefix: (prefix: ImagePathPart, number: ImagePathPart) => `/friendships-begin/${prefix}${number}.webp`,
    discordByPrefix: (prefix: ImagePathPart, number: ImagePathPart) => `/cards/discord/${prefix}${number}.webp`,
    ccgWithExtension: (folder: ImagePathPart, prefix: ImagePathPart, rarity: ImagePathPart, number: ImagePathPart, extension: ImagePathPart) => `/cards/${folder}/${prefix}${rarity}${number}${extension}`,
    funOneNormalBack: (number: ImagePathPart) => `/fun-moments-one-backs/FM1BACKN${number}.webp`,
    funOneRareBack: (number: ImagePathPart) => `/fun-moments-one-backs/FM1RB${number}.webp`,
    funOneSuperRareBack: (number: ImagePathPart) => `/fun-moments-one-backs/FM1SRB${number}.webp`,
    funThreeNormalBack: (number: ImagePathPart) => `/fun-moments-three-backs/FM3NBACK${number}.webp`,
    funThreeRareBack: (number: ImagePathPart) => `/fun-moments-three-backs/FM3RBACK${number}.webp`,
    funTwoNormalBack: (number: ImagePathPart) => `/fun-moments-two-backs/FM2NBACK${number}.webp`,
    funTwoRareBack: (number: ImagePathPart) => `/fun-moments-two-backs/FM2RBACK${number}.webp`,
    funTwoSuperRareBack: (number: ImagePathPart) => `/fun-moments-two-backs/FM2SRBACK${number}.webp`,
    moonOneRareBack: (number: ImagePathPart) => `/moon-1-other-backs/M1RBK${number}.webp`,
    moonOneSuperRareBack: (number: ImagePathPart) => `/moon-1-other-backs/M1SRB${number}.webp`,
    moonTwoRareBack: (number: ImagePathPart) => `/moon-2-other-backs/M2RB${number}.webp`,
    moonTwoSuperRareBack: (number: ImagePathPart) => `/moon-2-other-backs/M2SRB${number}.webp`,
    rainbowOneRareBack: (number: ImagePathPart) => `/rainbow-1-backs/R1RB${number}.webp`,
    rainbowOneSuperRareBack: (number: ImagePathPart) => `/rainbow-1-backs/R1SRB${number}.webp`,
    starBrilliantBack: (number: ImagePathPart) => `/card-backs/star-one/S1BPBACK${number}.webp`,
    discordBack: (key: ImagePathPart) => `/card-backs/discord/${key}-BACK.webp`,
    parallelRubyBack: (number: ImagePathPart) => `/tcg-card-backs/PRR${number}BACK.webp`,
    starterRubyBack: (number: ImagePathPart) => `/tcg-card-backs/SDRR${number}BACK.webp`,
    tcgBack: (key: ImagePathPart) => `/tcg-card-backs/${key}BACK.webp`,
    nightmareBack: (key: ImagePathPart) => `/card-backs/nightmare-night/${key}.webp`,
    discordRubyBack: (number: ImagePathPart) => `/tcg-card-backs/BP02-RR${number}.webp`,
    byFolder: (folder: ImagePathPart, key: ImagePathPart) => `/${folder}/${key}.webp`,
    fixed: {
        cardBacksM1HRBACK: "/card-backs/M1HRBACK.webp",
        cardBacksM1HRSIDEWAYSBACK: "/card-backs/M1HRSIDEWAYSBACK.webp",
        cardBacksM1RSRSGRSCBACK: "/card-backs/M1R-SR-SGR-SCBACK.webp",
        cardBacksM1SCBACK: "/card-backs/M1SCBACK.webp",
        cardBacksM1SGRBACK: "/card-backs/M1SGRBACK.webp",
        cardBacksM1SSRBACK: "/card-backs/M1SSRBACK.webp",
        cardBacksM1URBACK: "/card-backs/M1URBACK.webp",
        cardBacksM1URSIDEWAYSBACK: "/card-backs/M1URSIDEWAYSBACK.webp",
        cardBacksM2SC007BACK: "/card-backs/M2SC007BACK.webp",
        cardBacksM2SCBACK: "/card-backs/M2SCBACK.webp",
        cardBacksM2SGRBACK: "/card-backs/M2SGRBACK.webp",
        cardBacksM2SSRBACK: "/card-backs/M2SSRBACK.webp",
        cardBacksM2SZRBACK: "/card-backs/M2SZRBACK.webp",
        cardBacksM2ZRBACK: "/card-backs/M2ZRBACK.webp",
        cardBacksPromosSdccboombacks: "/card-backs/promos/sdccboombacks.webp",
        cardBacksPromosPr009back: "/card-backs/promos/pr009back.webp",
        cardBacksPromosPr15back: "/card-backs/promos/pr15back.webp",
        cardBacksR1FRBACK: "/card-backs/R1FRBACK.webp",
        cardBacksRainbowTwoR2BASEBACKS: "/card-backs/rainbow-two/R2BASEBACKS.webp",
        cardBacksRainbowTwoR2FRBACK: "/card-backs/rainbow-two/R2FRBACK.webp",
        cardBacksRainbowTwoR2SRBACK: "/card-backs/rainbow-two/R2SRBACK.webp",
        cardBacksRainbowTwoR2SSRBACK: "/card-backs/rainbow-two/R2SSRBACK.webp",
        cardBacksRainbowTwoR2URBACK: "/card-backs/rainbow-two/R2URBACK.webp",
        cardBacksRainbowTwoR2USRBACK: "/card-backs/rainbow-two/R2USRBACK.webp",
        cardBacksRainbowTwoR2XRBACK1: "/card-backs/rainbow-two/R2XRBACK1.webp",
        cardBacksRainbowTwoR2XRBACK2: "/card-backs/rainbow-two/R2XRBACK2.webp",
        cardBacksStarOneS1ARBACK: "/card-backs/star-one/S1ARBACK.webp",
        cardBacksStarOneS1ORBACK: "/card-backs/star-one/S1ORBACK.webp",
        cardBacksStarOneS1SARBACK: "/card-backs/star-one/S1SARBACK.webp",
        cardBacksStarOneS1SCRBACK: "/card-backs/star-one/S1SCRBACK.webp",
        cardBacksStarOneS1SSRBACK: "/card-backs/star-one/S1SSRBACK.webp",
        cardBacksStarOneS1URBACK: "/card-backs/star-one/S1URBACK.webp",
        cardBacksStarOneS1USRBACK1: "/card-backs/star-one/S1USRBACK1.webp",
        cardBacksStarOneS1USRBACK2: "/card-backs/star-one/S1USRBACK2.webp",
        cardBacksTcgdefaultback: "/card-backs/tcgdefaultback.webp",
        cardBacksThirdMoonEditionBacksM3scback: "/card-backs/third-moon-edition-backs/m3scback.webp",
        cardBacksThirdMoonEditionBacksM3SZR001BACK: "/card-backs/third-moon-edition-backs/M3SZR001BACK.webp",
        cardBacksThirdMoonEditionBacksM3SZRBINDERVER: "/card-backs/third-moon-edition-backs/M3SZRBINDERVER.webp",
        cardBacksThirdMoonEditionBacksM3zrback1: "/card-backs/third-moon-edition-backs/m3zrback1.webp",
        cardBacksThirdMoonEditionBacksMoon3defaultback: "/card-backs/third-moon-edition-backs/moon3defaultback.webp",
        cardBacksThirdMoonEditionBacksMoon3sdhrback: "/card-backs/third-moon-edition-backs/moon3sdhrback.webp",
        cardBacksThirdMoonEditionBacksMoon3sdurback: "/card-backs/third-moon-edition-backs/moon3sdurback.webp",
        cardBacksThirdMoonEditionBacksMoon3sdzrback2: "/card-backs/third-moon-edition-backs/moon3sdzrback2.webp",
        cardBacksThirdMoonEditionBacksMoon3sgrback1: "/card-backs/third-moon-edition-backs/moon3sgrback1.webp",
        cardBacksThirdMoonEditionBacksMoon3sgrback2: "/card-backs/third-moon-edition-backs/moon3sgrback2.webp",
        cardBacksThirdMoonEditionBacksMoon3srback: "/card-backs/third-moon-edition-backs/moon3srback.webp",
        cardBacksThirdMoonEditionBacksMoon3ssrback: "/card-backs/third-moon-edition-backs/moon3ssrback.webp",
        cardBacksThirdMoonEditionBacksMoon3urback: "/card-backs/third-moon-edition-backs/moon3urback.webp",
        cardBacksThirdMoonEditionBacksMoon3zrback2: "/card-backs/third-moon-edition-backs/moon3zrback2.webp",
        cardsThirdEditionMoonM3SZR001: "/cards/third-edition-moon/M3SZR001.webp",
        funMomentsOneBacksFM1CRBACK001: "/fun-moments-one-backs/FM1CRBACK001.webp",
        funMomentsOneBacksFM1CRBACK002: "/fun-moments-one-backs/FM1CRBACK002.webp",
        funMomentsThreeBacksFM3CRBACK001: "/fun-moments-three-backs/FM3CRBACK001.webp",
        funMomentsThreeBacksFM3CRBACK002: "/fun-moments-three-backs/FM3CRBACK002.webp",
        funMomentsThreeBacksFM3SCRBACK: "/fun-moments-three-backs/FM3SCRBACK.webp",
        funMomentsThreeBacksFM3SRBACK: "/fun-moments-three-backs/FM3SRBACK.webp",
        funMomentsThreeBacksFM3SSRBACK: "/fun-moments-three-backs/FM3SSRBACK.webp",
        funMomentsThreeBacksFM3UGRBACK: "/fun-moments-three-backs/FM3UGRBACK.webp",
        funMomentsThreeBacksFM3URBACK: "/fun-moments-three-backs/FM3URBACK.webp",
        funMomentsTwoBacksFM2UGRBACKS: "/fun-moments-two-backs/FM2UGRBACKS.webp",
        tcgCardBacksPRR01BACK: "/tcg-card-backs/PRR01BACK.webp",
        tcgCardBacksPRR02BACK: "/tcg-card-backs/PRR02BACK.webp",
        tcgCardBacksPRR03BACK: "/tcg-card-backs/PRR03BACK.webp",
        tcgCardBacksPRR04BACK: "/tcg-card-backs/PRR04BACK.webp",
        tcgCardBacksPRR05BACK: "/tcg-card-backs/PRR05BACK.webp",
        tcgCardBacksPRR06BACK: "/tcg-card-backs/PRR06BACK.webp",
        tcgCardBacksSCENECARDBACK: "/tcg-card-backs/SCENECARDBACK.webp",
        tcgpromosRR07: "/tcgpromos/RR07.webp",
        tcgpromosRR09: "/tcgpromos/RR09.webp",
    },
} as const;
function getMoonFourImagePath(key: string) {
    const normalized = key.trim().toUpperCase().replace(/^M4/, "").replace(/^SHINING[ _-]?ZR/, "SZR");
    const match = normalized.match(/^(SZR|SSR|SGR|LSR|HR|SR|UR|ZR|SC|R)[ _-]?(\d+)$/);
    if (!match)
        return "/placeholder-card.webp";
    const number = Number(match[2]);
    const counts: Record<string, number> = moonCatalog.sets.find(set => set.id === "13")!.rarities;
    if (number < 1 || number > counts[match[1]])
        return "/placeholder-card.webp";
    const padded = String(number).padStart(match[1] === "SZR" ? 3 : 2, "0");
    return `/cards/fourth-edition-moon/M4${match[1]}${padded}.webp`;
}
export const getMoonFourFront = (key: string) => cardImagePaths.moonFour(key);
type Card = {
    set_id: string;
    card_key: string;
};
const sets: Record<string, {
    folder: string;
    prefix: string;
}> = Object.fromEntries([funCatalog, moonCatalog, rainbowCatalog, starCatalog].flatMap(group => group.sets.map(set => [set.id, { folder: set.folder, prefix: set.prefix }])));
function getRarityCode(rarity: string) {
    if (rarity === "SHINING ZR")
        return "SZR";
    return rarity;
}
function getLegacyTradeCardImage(card: Card) {
    const setId = String(card.set_id);
    if (setId === "13") {
        return cardImagePaths.moonFour(card.card_key);
    }
    const set = sets[setId];
    if (set) {
        const [rarity, number] = String(card.card_key).split("-");
        return cardImagePaths.ccg(set.folder, set.prefix, getRarityCode(rarity), String(number).padStart(3, "0"));
    }
    if (setId === "9") {
        const number = String(card.card_key).replace("PR-", "");
        return cardImagePaths.ccgPromo(String(number).padStart(3, "0"));
    }
    if (setId === "tcgpromos") {
        return cardImagePaths.tcgPromo(card.card_key);
    }
    if (setId === "SD" || setId === "friendshipsbegin") {
        const key = String(card.card_key)
            .replace(/^BONUS-/, "")
            .replace(/^STARTER-/, "");
        return cardImagePaths.friendshipsBegin(key);
    }
    if (setId === "FW") {
        const key = String(card.card_key);
        return key.startsWith("BP01ER")
            ? cardImagePaths.fantasyEmerald(key.slice(-2))
            : key.startsWith("BP01PER")
                ? cardImagePaths.fantasyParallelEmerald(key.slice(-2))
                : cardImagePaths.fantasyWonderland(key);
    }
    if (setId === "hearthswarming-eve") {
        return cardImagePaths.hearthswarmingEve(card.card_key);
    }
    if (setId === "12") {
        return cardImagePaths.discord(card.card_key);
    }
    if (setId === "14") {
        return getNightmareNightFront(card.card_key);
    }
    return "/placeholder-card.webp";
}
export const getFunMomentsOneBack = (rarity: string, number: number) => {
    if (rarity === "N" || rarity === "SN") {
        return cardImagePaths.funOneNormalBack(String(number).padStart(3, "0"));
    }
    if (rarity === "R") {
        return cardImagePaths.funOneRareBack(String(number).padStart(3, "0"));
    }
    if (rarity === "SR") {
        return cardImagePaths.funOneSuperRareBack(String(number).padStart(3, "0"));
    }
    if (rarity === "UR") {
        return cardImagePaths.fixed.cardBacksM1URBACK;
    }
    if (rarity === "CR") {
        if (number <= 9) {
            return cardImagePaths.fixed.funMomentsOneBacksFM1CRBACK001;
        }
        return cardImagePaths.fixed.funMomentsOneBacksFM1CRBACK002;
    }
    return cardImagePaths.fixed.cardBacksM1RSRSGRSCBACK;
};
export const getFunMomentsThreeBack = (rarity: string, number: number) => {
    if (rarity === "CR") {
        if (number <= 9) {
            return cardImagePaths.fixed.funMomentsThreeBacksFM3CRBACK001;
        }
        return cardImagePaths.fixed.funMomentsThreeBacksFM3CRBACK002;
    }
    if (rarity === "SCR") {
        return cardImagePaths.fixed.funMomentsThreeBacksFM3SCRBACK;
    }
    if (rarity === "UGR") {
        return cardImagePaths.fixed.funMomentsThreeBacksFM3UGRBACK;
    }
    if (rarity === "N" || rarity === "SN") {
        return cardImagePaths.funThreeNormalBack(String(number).padStart(3, "0"));
    }
    if (rarity === "R") {
        return cardImagePaths.funThreeRareBack(String(number).padStart(3, "0"));
    }
    if (rarity === "SR") {
        return cardImagePaths.fixed.funMomentsThreeBacksFM3SRBACK;
    }
    if (rarity === "SSR") {
        return cardImagePaths.fixed.funMomentsThreeBacksFM3SSRBACK;
    }
    if (rarity === "UR") {
        return cardImagePaths.fixed.funMomentsThreeBacksFM3URBACK;
    }
    return cardImagePaths.fixed.cardBacksM1RSRSGRSCBACK;
};
export const getFunMomentsTwoBack = (rarity: string, number: number) => {
    if (rarity === "CR") {
        if (number <= 9) {
            return cardImagePaths.fixed.funMomentsOneBacksFM1CRBACK001;
        }
        return cardImagePaths.fixed.funMomentsOneBacksFM1CRBACK002;
    }
    if (rarity === "UGR") {
        return cardImagePaths.fixed.funMomentsTwoBacksFM2UGRBACKS;
    }
    if (rarity === "N" || rarity === "SN") {
        return cardImagePaths.funTwoNormalBack(String(number).padStart(3, "0"));
    }
    if (rarity === "R") {
        return cardImagePaths.funTwoRareBack(String(number).padStart(3, "0"));
    }
    if (rarity === "SR") {
        return cardImagePaths.funTwoSuperRareBack(String(number).padStart(3, "0"));
    }
    if (rarity === "UR") {
        return cardImagePaths.fixed.cardBacksM1URBACK;
    }
    return cardImagePaths.fixed.cardBacksM1RSRSGRSCBACK;
};
export const getMoonOneBack = (rarity: string, number: number) => {
    const padded = String(number).padStart(3, "0");
    if (rarity === "R") {
        return cardImagePaths.moonOneRareBack(padded);
    }
    if (rarity === "SR") {
        return cardImagePaths.moonOneSuperRareBack(padded);
    }
    if (rarity === "HR") {
        const sideways = [8, 9, 10, 18, 19, 21, 23, 27, 32, 34, 36];
        if (sideways.includes(number)) {
            return cardImagePaths.fixed.cardBacksM1HRSIDEWAYSBACK;
        }
        return cardImagePaths.fixed.cardBacksM1HRBACK;
    }
    if (rarity === "SSR") {
        return cardImagePaths.fixed.cardBacksM1SSRBACK;
    }
    if (rarity === "UR") {
        if (number === 16) {
            return cardImagePaths.fixed.cardBacksM1URSIDEWAYSBACK;
        }
        return cardImagePaths.fixed.cardBacksM1URBACK;
    }
    if (rarity === "SGR") {
        return cardImagePaths.fixed.cardBacksM1SGRBACK;
    }
    if (rarity === "SC") {
        if (number === 7) {
            return cardImagePaths.fixed.cardBacksM1SCBACK;
        }
        return cardImagePaths.fixed.cardBacksM1RSRSGRSCBACK;
    }
    if (rarity === "LSR") {
        return cardImagePaths.fixed.cardBacksM1RSRSGRSCBACK;
    }
    return cardImagePaths.fixed.cardBacksM1RSRSGRSCBACK;
};
export const getMoonThreeBack = (rarity: string, number: number) => {
    if (rarity === "SZR" && number === 1) {
        return cardImagePaths.fixed.cardBacksThirdMoonEditionBacksM3SZR001BACK;
    }
    if (rarity === "SZR" && number >= 2 && number <= 3) {
        return cardImagePaths.fixed.cardBacksThirdMoonEditionBacksMoon3zrback2;
    }
    if (rarity === "SC") {
        return cardImagePaths.fixed.cardBacksThirdMoonEditionBacksM3scback;
    }
    if (rarity === "ZR" && number === 14) {
        return cardImagePaths.fixed.cardBacksThirdMoonEditionBacksMoon3sdzrback2;
    }
    if (rarity === "ZR" && number >= 8 && number <= 13) {
        return cardImagePaths.fixed.cardBacksThirdMoonEditionBacksMoon3zrback2;
    }
    if (rarity === "ZR" && number >= 1 && number <= 7) {
        return cardImagePaths.fixed.cardBacksThirdMoonEditionBacksM3zrback1;
    }
    if (rarity === "UR" && number >= 15 && number <= 18) {
        return cardImagePaths.fixed.cardBacksThirdMoonEditionBacksMoon3sdurback;
    }
    if (rarity === "UR" && number >= 1 && number <= 14) {
        return cardImagePaths.fixed.cardBacksThirdMoonEditionBacksMoon3urback;
    }
    if (rarity === "SGR" && number >= 1 && number <= 8) {
        return cardImagePaths.fixed.cardBacksThirdMoonEditionBacksMoon3sgrback1;
    }
    if (rarity === "SGR" && number >= 9 && number <= 16) {
        return cardImagePaths.fixed.cardBacksThirdMoonEditionBacksMoon3sgrback2;
    }
    if (rarity === "HR" &&
        ((number >= 1 && number <= 22) ||
            (number >= 31 && number <= 52))) {
        return cardImagePaths.fixed.cardBacksThirdMoonEditionBacksMoon3sdhrback;
    }
    if (rarity === "SR") {
        return cardImagePaths.fixed.cardBacksThirdMoonEditionBacksMoon3srback;
    }
    if (rarity === "SSR") {
        return cardImagePaths.fixed.cardBacksThirdMoonEditionBacksMoon3ssrback;
    }
    return cardImagePaths.fixed.cardBacksThirdMoonEditionBacksMoon3defaultback;
};
export const getMoonTwoBack = (rarity: string, number: number) => {
    const padded = String(number).padStart(3, "0");
    if (rarity === "R") {
        return cardImagePaths.moonTwoRareBack(padded);
    }
    if (rarity === "SR") {
        return cardImagePaths.moonTwoSuperRareBack(padded);
    }
    if (rarity === "HR") {
        if (number <= 22) {
            return cardImagePaths.fixed.cardBacksM1SCBACK;
        }
        return cardImagePaths.fixed.cardBacksM1RSRSGRSCBACK;
    }
    if (rarity === "SSR") {
        return cardImagePaths.fixed.cardBacksM2SSRBACK;
    }
    if (rarity === "UR") {
        return cardImagePaths.fixed.cardBacksM1URBACK;
    }
    if (rarity === "SGR") {
        return cardImagePaths.fixed.cardBacksM2SGRBACK;
    }
    if (rarity === "ZR") {
        return cardImagePaths.fixed.cardBacksM2ZRBACK;
    }
    if (rarity === "SC") {
        if (number === 7) {
            return cardImagePaths.fixed.cardBacksM2SC007BACK;
        }
        return cardImagePaths.fixed.cardBacksM2SCBACK;
    }
    if (rarity === "SHINING ZR") {
        return cardImagePaths.fixed.cardBacksM2SZRBACK;
    }
    if (rarity === "LSR") {
        return cardImagePaths.fixed.cardBacksM1RSRSGRSCBACK;
    }
    return cardImagePaths.fixed.cardBacksM1RSRSGRSCBACK;
};
export const getPromotionalCardsBack = (number?: number) => {
    if (number === 15) {
        return cardImagePaths.fixed.cardBacksPromosPr15back;
    }
    if (number === 14) {
        return cardImagePaths.fixed.cardBacksPromosPr009back;
    }
    if (number && number >= 8) {
        return cardImagePaths.fixed.cardBacksPromosSdccboombacks;
    }
    return cardImagePaths.fixed.cardBacksM1RSRSGRSCBACK;
};
export const getRainbowOneBack = (rarity: string, number: number) => {
    const padded = String(number).padStart(3, "0");
    if (rarity === "R") {
        return cardImagePaths.rainbowOneRareBack(padded);
    }
    if (rarity === "SR") {
        return cardImagePaths.rainbowOneSuperRareBack(padded);
    }
    if (rarity === "FR") {
        return cardImagePaths.fixed.cardBacksR1FRBACK;
    }
    if (rarity === "UR") {
        return cardImagePaths.fixed.cardBacksM1URBACK;
    }
    if (["TR", "TGR", "MTR", "SSR", "USR", "XR"].includes(rarity)) {
        return cardImagePaths.fixed.cardBacksM1RSRSGRSCBACK;
    }
    return cardImagePaths.fixed.cardBacksM1RSRSGRSCBACK;
};
export const getRainbowTwoBack = (rarity: string, number: number) => {
    if (rarity === "BASE") {
        return cardImagePaths.fixed.cardBacksRainbowTwoR2BASEBACKS;
    }
    if (rarity === "R") {
        return cardImagePaths.fixed.cardBacksRainbowTwoR2USRBACK;
    }
    if (rarity === "SR") {
        return cardImagePaths.fixed.cardBacksRainbowTwoR2SRBACK;
    }
    if (rarity === "SSR") {
        return cardImagePaths.fixed.cardBacksRainbowTwoR2SSRBACK;
    }
    if (rarity === "UR") {
        return cardImagePaths.fixed.cardBacksRainbowTwoR2URBACK;
    }
    if (rarity === "FR") {
        return cardImagePaths.fixed.cardBacksRainbowTwoR2FRBACK;
    }
    if (rarity === "USR" ||
        rarity === "ST" ||
        rarity === "TR" ||
        rarity === "TGR") {
        return cardImagePaths.fixed.cardBacksRainbowTwoR2USRBACK;
    }
    if (rarity === "XR") {
        if (number === 8) {
            return cardImagePaths.fixed.cardBacksRainbowTwoR2XRBACK2;
        }
        return cardImagePaths.fixed.cardBacksRainbowTwoR2XRBACK1;
    }
    return cardImagePaths.fixed.cardBacksRainbowTwoR2SRBACK;
};
export const getStarOneBack = (rarity: string, number?: number) => {
    if (rarity === "SAR") {
        return cardImagePaths.fixed.cardBacksStarOneS1SARBACK;
    }
    if (rarity === "OR") {
        return cardImagePaths.fixed.cardBacksStarOneS1ORBACK;
    }
    if (rarity === "BP" && number) {
        return cardImagePaths.starBrilliantBack(String(number).padStart(3, "0"));
    }
    if (rarity === "AR") {
        return cardImagePaths.fixed.cardBacksStarOneS1ARBACK;
    }
    if (rarity === "USR") {
        const specialBack2 = [1, 3, 6, 13, 14];
        if (number && specialBack2.includes(number)) {
            return cardImagePaths.fixed.cardBacksStarOneS1USRBACK2;
        }
        return cardImagePaths.fixed.cardBacksStarOneS1USRBACK1;
    }
    if (rarity === "UR") {
        return cardImagePaths.fixed.cardBacksStarOneS1URBACK;
    }
    if (rarity === "SCR") {
        return cardImagePaths.fixed.cardBacksStarOneS1SCRBACK;
    }
    if (rarity === "SSR") {
        return cardImagePaths.fixed.cardBacksStarOneS1SSRBACK;
    }
    return cardImagePaths.fixed.cardBacksStarOneS1SSRBACK;
};
export const getDiscordBack = (key: string) => {
    if (key.startsWith("BP02-C")) {
        const num = Number(key.replace("BP02-C", ""));
        if (num >= 25 && num <= 48) {
            return cardImagePaths.discordBack(key);
        }
    }
    if (key.startsWith("BP02-RR")) {
        return cardImagePaths.discordBack(key);
    }
    if (key.startsWith("BP02-PRR")) {
        return cardImagePaths.parallelRubyBack(key.slice(-2));
    }
    return cardImagePaths.fixed.cardBacksTcgdefaultback;
};
export const getDiscordFront = (key: string) => {
    return cardImagePaths.discord(key);
};
export const getHeartswarmingEveFront = (key: string) => cardImagePaths.hearthswarmingEve(key);
export const getHeartswarmingEveBack = (key: string) => {
    const common = key.match(/^BP04-C(\d{2})$/);
    if (common && Number(common[1]) >= 25 && Number(common[1]) <= 48)
        return `/card-backs/hearthswarming-eve/${key}.webp`;
    if (/^BP04-RR0[1-6]$/.test(key))
        return `/card-backs/hearthswarming-eve/${key}.webp`;
    if (/^P?BP04-ER\d{2}$/.test(key))
        return cardImagePaths.fixed.tcgCardBacksSCENECARDBACK;
    if (/^PBP04-RR0[1-6]$/.test(key))
        return cardImagePaths.parallelRubyBack(key.slice(-2));
    return cardImagePaths.fixed.cardBacksTcgdefaultback;
};
export const getFantasyWonderlandBack = (key: string) => {
    if (key.startsWith("BP01PRR")) {
        return cardImagePaths.parallelRubyBack(key.slice(-2));
    }
    if (key.startsWith("BP01RR")) {
        return cardImagePaths.starterRubyBack(key.slice(-2));
    }
    if (key.startsWith("BP01ER") || key.startsWith("BP01PER")) {
        return cardImagePaths.fixed.tcgCardBacksSCENECARDBACK;
    }
    return cardImagePaths.fixed.cardBacksTcgdefaultback;
};
export const getFantasyWonderlandFront = (key: string) => {
    if (key.startsWith("BP01ER")) {
        return cardImagePaths.fantasyEmerald(key.slice(-2));
    }
    if (key.startsWith("BP01PER")) {
        return cardImagePaths.fantasyParallelEmerald(key.slice(-2));
    }
    return cardImagePaths.fantasyWonderland(key);
};
export const getFriendshipsBeginBack = (key: string) => {
    if (key.startsWith("SD01ER") || key.startsWith("SD01PER")) {
        return cardImagePaths.fixed.tcgCardBacksSCENECARDBACK;
    }
    if (key.startsWith("SD01PRR")) {
        return cardImagePaths.parallelRubyBack(key.slice(-2));
    }
    return cardImagePaths.fixed.cardBacksTcgdefaultback;
};
export const getFriendshipsBeginFront = (key: string) => {
    return cardImagePaths.friendshipsBegin(key);
};
export const getNightmareNightBack = (key: string) => {
    if (key.startsWith("BP03-ER") || key.startsWith("PBP03-ER")) {
        return cardImagePaths.fixed.tcgCardBacksSCENECARDBACK;
    }
    if (key.startsWith("BP03-C")) {
        const num = Number(key.replace("BP03-C", ""));
        if (num >= 25 && num <= 48) {
            return cardImagePaths.nightmareBack(key);
        }
    }
    const rrMatch = key.match(/^BP03-RR(0[1-6])$/);
    if (rrMatch) {
        return cardImagePaths.discordRubyBack(rrMatch[1]);
    }
    const prrMatch = key.match(/^PBP03-RR(0[1-6])$/);
    if (prrMatch) {
        return cardImagePaths.parallelRubyBack(prrMatch[1]);
    }
    return cardImagePaths.fixed.cardBacksTcgdefaultback;
};
export const getNightmareNightFront = (key: string) => {
    const erMatch = key.match(/^BP03-ER(0[12])-([ABC])$/);
    const imageKey = erMatch ? `${key}${erMatch[2]}` : key;
    return cardImagePaths.nightmareNight(imageKey);
};
export const HEARTHSWARMING_EVE_ID = "hearthswarming-eve";
export const HEARTHSWARMING_EVE_NAME = "HeartsWarming Eve";
export const HEARTHSWARMING_EVE_RARITIES: Record<string, number> = { C: 48, U: 18, ER: 6, SR: 14, SPR: 28, GR: 12, CR: 12, RR: 6, PER: 12, PGR: 6, PSPR: 11, PCR: 12, PRR: 6, TK: 6 };
export const getHeartswarmingEveRarity = (key: string) => {
    if (/^BP04-TK0[1-6]$/.test(key))
        return "TK";
    const match = key.match(/^(P?)BP0[24]-(SPR|SR|ER|GR|CR|RR|C|U)(\d{2})$/);
    return match ? `${match[1]}${match[2]}` : "";
};
export const getHeartswarmingEveRarityLabel = (key: string) => { const rarity = getHeartswarmingEveRarity(key); return rarity.startsWith("P") ? `\u203b${rarity.slice(1)}` : rarity; };
export const HEARTHSWARMING_EVE_PSPR_PRINTED_NUMBERS = [2, 3, 4, 6, 9, 11, 17, 25, 26, 27, 28];
export const getHeartswarmingEveDisplayCode = (key: string) => {
    const sapphire = key.match(/^PBP04-SPR(\d{2})$/);
    if (sapphire) {
        const printed = HEARTHSWARMING_EVE_PSPR_PRINTED_NUMBERS[Number(sapphire[1]) - 1];
        if (printed !== undefined)
            return `\u203bBP04-SPR${String(printed).padStart(2, "0")}`;
    }
    if (key.startsWith("BP02-GR"))
        return key.replace(/^BP02-GR/, "BP04-GR");
    return key.startsWith("PBP04-") ? `\u203b${key.slice(1)}` : key;
};
export const HEARTHSWARMING_EVE_CARDS = Object.entries(HEARTHSWARMING_EVE_RARITIES).flatMap(([rarity, count]) => {
    const shining = rarity.startsWith("P");
    const prefix = shining ? "PBP04" : rarity === "GR" ? "BP02" : "BP04";
    const code = shining ? rarity.slice(1) : rarity;
    return Array.from({ length: count }, (_, index) => { const number = index + 1; const key = `${prefix}-${code}${String(number).padStart(2, "0")}`; return { key, rarity, number, characters: [] as string[], image: rarity === "TK" ? `/cards/hearthswarming-eve/TK-${String(number + 1).padStart(2, "0")}.webp` : `/cards/hearthswarming-eve/${key.replace(/^BP02-GR/, "BP04-GR")}.webp` }; });
});
export const HEARTHSWARMING_EVE_KEYS = HEARTHSWARMING_EVE_CARDS.map(card => card.key);
export const isHeartswarmingEveOwned = (value: unknown) => value === true || (typeof value === "object" && value !== null && "owned" in value && value.owned === true);
type EnglishSourceRules = {
    getChecklistCode?: (rarity: string, number: number) => string;
    rarityNames?: Record<string, string>;
    starterDeckGroups?: {
        name: string;
        code: string;
    }[];
    starterDeckImages?: string[];
    getDisplayRarityCode?: (rarity: string) => string;
    rarityLabel?: (rarity: string) => string;
    hasSilverStamp?: (key: string) => boolean;
    hasSidewaysStamp?: (key: string) => boolean;
    hasCenteredStamp?: (key: string) => boolean;
    hasRotatedBack?: (key: string) => boolean;
    getFrontStyle?: (key: string, inspect?: boolean) => CSSProperties;
    getBackStyle?: (key: string, inspect?: boolean) => CSSProperties;
    getCardBack?: (rarity: string, number: number) => string;
    getStarterBack?: (key: string) => string;
    getDeckCards?: (code: string) => string[];
    getFallbackDisplayCardCode?: (key: string) => string;
};
const englishSourceRules: Record<string, EnglishSourceRules> = { "7": (() => {
        const getDisplayRarityCode = (rarity: string) => rarity === "SN" ? "\u25c7N" : rarity;
        const hasSilverStamp = (key: string) => key.startsWith("CR-");
        const hasSidewaysStamp = (key: string) => key === "CR-10" || key === "CR-11" || key === "CR-12";
        const hasRotatedBack = (key: string) => key.startsWith("N-") || key.startsWith("SN-") || hasSidewaysStamp(key);
        const rarityNames: Record<string, string> = { N: "Episode Cards", SN: "Shining Episode Cards", R: "Rare Cards", SR: "Super Rare Cards", SSR: "Super Spark Rare Cards", UR: "Ultra Rare Cards", CR: "Creative Rare Cards" };
        const getDisplayCardCode = funCatalog.getDisplayCardCode;
        const getChecklistCode = (rarity: string, number: number) => { const card = { rarity, number }; const set = { setId: "7" }; return getDisplayCardCode(set.setId, card.rarity, card.number); };
        return { getDisplayRarityCode, hasSilverStamp, hasSidewaysStamp, hasRotatedBack, rarityNames, getDisplayCardCode, getChecklistCode };
    })(),
    "11": (() => {
        const getDisplayRarityCode = (rarity: string) => rarity === "SN" ? "\u25c7N" : rarity === "SCR" ? "\u25c7CR" : rarity;
        const hasSilverStamp = (key: string) => key.startsWith("CR-") || key.startsWith("SCR-");
        const hasSidewaysStamp = (key: string) => key === "CR-10" || key === "CR-11" || key === "CR-12";
        const rarityNames: Record<string, string> = { N: "Episode Cards", SN: "Shining Episode Cards", R: "Rare Cards", SR: "Super Rare Cards", SSR: "Super Spark Rare Cards", UR: "Ultra Rare Cards", UGR: "Ultra Golden Rare Cards", CR: "Creative Rare Cards", SCR: "Shining Creative Rare Cards" };
        const getDisplayCardCode = funCatalog.getDisplayCardCode;
        const getChecklistCode = (rarity: string, number: number) => { const card = { rarity, number }; const set = { setId: "11" }; return getDisplayCardCode(set.setId, card.rarity, card.number); };
        return { getDisplayRarityCode, hasSilverStamp, hasSidewaysStamp, rarityNames, getDisplayCardCode, getChecklistCode };
    })(),
    "8": (() => {
        const getDisplayRarityCode = (rarity: string) => rarity === "SN" ? "\u25c7N" : rarity;
        const hasSilverStamp = (key: string) => key.startsWith("CR-");
        const hasSidewaysStamp = (key: string) => key === "CR-10" || key === "CR-11" || key === "CR-12";
        const hasRotatedBack = (key: string) => hasSidewaysStamp(key);
        const rarityNames: Record<string, string> = { N: "Episode Cards", SN: "Shining Episode Cards", R: "Rare Cards", SR: "Super Rare Cards", SSR: "Super Spark Rare Cards", UR: "Ultra Rare Cards", UGR: "Ultra Golden Rare Cards", CR: "Creative Rare Cards" };
        const getDisplayCardCode = funCatalog.getDisplayCardCode;
        const getChecklistCode = (rarity: string, number: number) => { const card = { rarity, number }; const set = { setId: "8" }; return getDisplayCardCode(set.setId, card.rarity, card.number); };
        return { getDisplayRarityCode, hasSilverStamp, hasSidewaysStamp, hasRotatedBack, rarityNames, getDisplayCardCode, getChecklistCode };
    })(),
    "13": (() => {
        const getDisplayRarityCode = (rarity: string) => rarity === "SHINING ZR" || rarity === "SZR" ? "\u25c7ZR" : rarity;
        const hasSilverStamp = (key: string) => key.startsWith("ZR-") || key.startsWith("SC-") || key.startsWith("SZR-");
        const hasSidewaysStamp = (key: string) => key === "ZR-7";
        const getCardBack = (rarity: string, number: number) => {
            const folder = "/card-backs/moon-four";
            if (rarity === "R")
                return `${folder}/M4R${String(number).padStart(2, "0")}BACK.webp`;
            if (rarity === "SR")
                return `${folder}/M4SR22BACK.webp`;
            if (rarity === "SSR")
                return `${folder}/M4SSRBACK.webp`;
            if (rarity === "HR")
                return `${folder}/${number <= 22 ? "M4HRSIDEWAYSBACK" : "M4HRBACK"}.webp`;
            if (rarity === "ZR")
                return `${folder}/${number === 7 ? "M4ZRBACKSIDEWAYS" : "M4ZRBACK"}.webp`;
            return `${folder}/M4${rarity}BACK.webp`;
        };
        const rarityNames: Record<string, string> = { R: "Rare", SR: "Super Rare", SSR: "Super Spark Rare", HR: "Holographic Rare", UR: "Ultra Rare", LSR: "Limited Super Rare", SGR: "Super Golden Rare", ZR: "Zenith Rare", SC: "Secret Card", SZR: "Shining Zenith Rare" };
        const getChecklistCode = (rarity: string, number: number) => { const card = { rarity, number }; const set = { setId: "13" }; return `MLPME04-${getDisplayRarityCode(card.rarity)}-${String(card.number).padStart(3, "0")}`; };
        return { getDisplayRarityCode, hasSilverStamp, hasSidewaysStamp, getCardBack, rarityNames, getChecklistCode };
    })(),
    "1": (() => {
        const rarityNames: Record<string, string> = { R: "Rare", SR: "Super Rare", SSR: "Super Spark Rare", HR: "Holographic Rare", UR: "Ultra Rare", LSR: "Limited Secret Rare", SGR: "Super Golden Rare", SC: "Secret Card" };
        const getChecklistCode = (rarity: string, number: number) => { const card = { rarity, number }; const set = { setId: "1" }; return `MLPME01-${card.rarity}-${String(card.number).padStart(3, "0")}`; };
        return { rarityNames, getChecklistCode };
    })(),
    "3": (() => {
        const getDisplayRarityCode = (rarity: string) => rarity === "SHINING ZR" || rarity === "SZR" ? "\u25c7ZR" : rarity;
        const hasSilverStamp = (key: string) => key.startsWith("ZR-") || key.startsWith("SC-") || key.startsWith("SZR-");
        const hasSidewaysStamp = (key: string) => key === "ZR-14";
        const rarityNames: Record<string, string> = { R: "Rare", SR: "Super Rare", SSR: "Super Spark Rare", HR: "Holographic Rare", UR: "Ultra Rare", LSR: "Limited Super Rare", SGR: "Super Golden Rare", ZR: "Zenith Rare", SC: "Secret Card", SZR: "Shining Zenith Rare" };
        const getChecklistCode = (rarity: string, number: number) => { const card = { rarity, number }; const set = { setId: "3" }; return `MLPME03-${getDisplayRarityCode(card.rarity)}-${String(card.number).padStart(3, "0")}`; };
        return { getDisplayRarityCode, hasSilverStamp, hasSidewaysStamp, rarityNames, getChecklistCode };
    })(),
    "2": (() => {
        const getDisplayRarityCode = (rarity: string) => rarity === "SHINING ZR" || rarity === "SZR" ? "\u25c7ZR" : rarity;
        const hasSilverStamp = (key: string) => key.startsWith("ZR-") || key.startsWith("SC-") || key.startsWith("SHINING ZR-");
        const hasSidewaysStamp = (key: string) => key === "SC-7" || key.startsWith("SHINING ZR-");
        const rarityNames: Record<string, string> = { R: "Rare", SR: "Super Rare", SSR: "Super Spark Rare", HR: "Holographic Rare", UR: "Ultra Rare", LSR: "Limited Secret Rare", SGR: "Super Golden Rare", ZR: "Zenith Rare", SC: "Secret Card", "SHINING ZR": "Celebration Zenith Rare" };
        const getChecklistCode = (rarity: string, number: number) => { const card = { rarity, number }; const set = { setId: "2" }; return `MLPME02-${getDisplayRarityCode(card.rarity)}-${String(card.number).padStart(3, "0")}`; };
        return { getDisplayRarityCode, hasSilverStamp, hasSidewaysStamp, rarityNames, getChecklistCode };
    })(),
    "5": (() => {
        const getDisplayRarityCode = (rarity: string) => rarity;
        const hasSilverStamp = (key: string) => key.startsWith("XR-") || key.startsWith("USR-");
        const rarityNames: Record<string, string> = { R: "Rare", SR: "Super Rare", FR: "Fun Rare", TR: "Transparent Rare", TGR: "Transparent Golden Rare", MTR: "Miracle Transparent Rare", SSR: "Super Spark Rare", UR: "Ultra Rare", USR: "Ultra Special Rare", XR: "Extreme Rare" };
        const getChecklistCode = (rarity: string, number: number) => { const card = { rarity, number }; const set = { setId: "5" }; return `RBE01-${getDisplayRarityCode(card.rarity)}-${String(card.number).padStart(3, "0")}`; };
        return { getDisplayRarityCode, hasSilverStamp, rarityNames, getChecklistCode };
    })(),
    "6": (() => {
        const getDisplayRarityCode = (rarity: string) => rarity;
        const hasSilverStamp = (key: string) => key.startsWith("XR-") || key.startsWith("USR-");
        const hasSidewaysStamp = (key: string) => key === "XR-8";
        const rarityNames: Record<string, string> = { BASE: "Base", R: "Rare", SR: "Super Rare", ST: "Sticker", SSR: "Super Spark Rare", FR: "Fun Rare", TR: "Transparent Rare", TGR: "Transparent Golden Rare", UR: "Ultra Rare", USR: "Ultra Special Rare", XR: "Extreme Rare" };
        const getChecklistCode = (rarity: string, number: number) => { const card = { rarity, number }; const set = { setId: "6" }; return `RBE02-${getDisplayRarityCode(card.rarity)}-${String(card.number).padStart(3, "0")}`; };
        return { getDisplayRarityCode, hasSilverStamp, hasSidewaysStamp, rarityNames, getChecklistCode };
    })(),
    "4": (() => {
        const getDisplayRarityCode = (rarity: string) => rarity === "SAR" ? "\u25c7AR" : rarity;
        const hasSilverStamp = (key: string) => key.startsWith("BP-") || key.startsWith("SAR-");
        const hasCenteredStamp = (key: string) => key.startsWith("SAR-");
        const rarityNames: Record<string, string> = { SSR: "Super Spark Rare", SCR: "Sketch Rare", UR: "Ultra Rare", USR: "Ultra Special Rare", AR: "Art Rare", OR: "Origin Rare", BP: "Brilliant Print", SAR: "Shining Art Rare" };
        const getChecklistCode = (rarity: string, number: number) => { const card = { rarity, number }; const set = { setId: "4" }; return `MLPSE01-${getDisplayRarityCode(card.rarity)}-${String(card.number).padStart(3, "0")}`; };
        return { getDisplayRarityCode, hasSilverStamp, hasCenteredStamp, rarityNames, getChecklistCode };
    })(),
    "hearthswarming-eve": (() => {
        const rarityLabel = (rarity: string) => rarity.startsWith("P") ? `\u203b${rarity.slice(1)}` : rarity;
        const getBackStyle = (key: string, inspect = false): CSSProperties => {
            const match = key.match(/^BP04-C(\d{2})$/);
            const number = match ? Number(match[1]) : 0;
            if (number >= 25 && number <= 48)
                return { objectFit: "cover", transform: inspect ? "none" : "scale(1.035)" };
            return inspect ? { transform: /^PBP04-RR0[1-6]$/.test(key) ? "scale(1.07)" : "scale(1.035)" } : /^PBP04-RR0[1-6]$/.test(key) ? { transform: "scale(1.07)" } : {};
        };
        const rarityNames: Record<string, string> = {
            C: "COMMON",
            U: "UNCOMMON",
            ER: "EMERALD RARE",
            SR: "SILVER RARE",
            SPR: "SAPPHIRE RARE",
            GR: "GOLD RARE",
            CR: "COLORFUL RARE",
            RR: "RUBY RARE",
            PER: "SHINING EMERALD RARE",
            PSPR: "SHINING SAPPHIRE RARE",
            PGR: "SHINING GOLD RARE",
            PCR: "SHINING COLORFUL RARE",
            PRR: "SHINING RUBY RARE",
            TK: "TK",
        };
        return { rarityLabel, getBackStyle, rarityNames };
    })(),
    "12": (() => {
        const rarityLabel = (rarity: string) => tcgCatalog.getDisplayRarity(rarity);
        const getBackStyle = (key: string, inspect = false): CSSProperties => {
            const match = key.match(/^BP02-C(\d{2})$/);
            const number = match ? Number(match[1]) : 0;
            if (number >= 25 && number <= 48)
                return { objectFit: "cover", transform: `rotate(180deg)${inspect ? "" : " scale(1.035)"}` };
            return inspect ? { transform: "scale(1.035)" } : {};
        };
        const rarityNames: Record<string, string> = {
            C: "COMMON",
            U: "UNCOMMON",
            ER: "EMERALD RARE",
            SR: "SILVER RARE",
            SPR: "SAPPHIRE RARE",
            GR: "GOLD RARE",
            CR: "COLORFUL RARE",
            RR: "RUBY RARE",
            PER: "SHINING EMERALD RARE",
            PSPR: "SHINING SAPPHIRE RARE",
            PGR: "SHINING GOLD RARE",
            PCR: "SHINING COLORFUL RARE",
            PRR: "SHINING RUBY RARE",
        };
        return { rarityLabel, getBackStyle, rarityNames };
    })(),
    "FW": (() => {
        const rarityLabel = (rarity: string) => tcgCatalog.getDisplayRarity(rarity);
        const rarityNames: Record<string, string> = {
            C: "COMMON",
            U: "UNCOMMON",
            ER: "EMERALD RARE",
            SR: "SILVER RARE",
            SPR: "SAPPHIRE RARE",
            GR: "GOLD RARE",
            CR: "COLORFUL RARE",
            RR: "RUBY RARE",
            PER: "SHINING EMERALD RARE",
            PSPR: "SHINING SAPPHIRE RARE",
            PGR: "SHINING GOLD RARE",
            PCR: "SHINING COLORFUL RARE",
            PRR: "SHINING RUBY RARE",
        };
        return { rarityLabel, rarityNames };
    })(),
    "SD": (() => {
        const getFallbackDisplayCardCode = (key: string) => {
            const deckMatch = key.match(/^(SD01[A-F])(C|U|SR|SPR)(\d{2})$/);
            if (deckMatch) {
                const [, deck, rarity, number] = deckMatch;
                return `${deck}-${rarity}${number}`;
            }
            const specialMatch = key.match(/^SD01(ER|RR)(\d{2})$/);
            if (specialMatch) {
                const [, rarity, number] = specialMatch;
                const deckLetter = String.fromCharCode(64 + Number(number));
                return `${"SD01" + deckLetter}-${rarity}${number}`;
            }
            const match = key.match(/^SD01(C|U|SR|SPR|GR|CR|ER|RR|PER|PRR)(\d{2})$/);
            if (!match)
                return key;
            const [, rarity, number] = match;
            if (rarity === "PRR") {
                return `\u203bSD01-RR${number}`;
            }
            if (rarity === "PER") {
                const sourceNumber = Number(number);
                const displayNumber = Math.ceil(sourceNumber / 2);
                return `\u203bSD01-ER${String(displayNumber).padStart(2, "0")}`;
            }
            return `SD01-${rarity}${number}`;
        };
        const getDeckCards = (deckCode: string) => {
            const cards: string[] = [];
            const deckLetter = deckCode.slice(-1);
            const deckIndex = deckLetter.charCodeAt(0) - 64;
            const add = (rarity: string, count: number) => {
                for (let i = 1; i <= count; i++) {
                    cards.push(`${deckCode}${rarity}${String(i).padStart(2, "0")}`);
                }
            };
            add("C", 9);
            add("U", 4);
            add("SR", 2);
            cards.push(`SD01ER${String(deckIndex).padStart(2, "0")}`);
            add("SPR", 4);
            cards.push(`SD01RR${String(deckIndex).padStart(2, "0")}`);
            return cards;
        };
        const rarityLabel = (rarity: string) => rarity === "STARTER" ? "Starter Decks" : tcgCatalog.getDisplayRarity(rarity);
        const getStarterBack = (key: string) => key.includes("C06") || key.includes("C07") || key.includes("C08") || key.includes("C09") ? cardImagePaths.tcgBack(key) : key.startsWith("SD01RR") ? cardImagePaths.starterRubyBack(key.slice(-2)) : key.includes("ER") && !key.includes("PER") ? cardImagePaths.fixed.tcgCardBacksSCENECARDBACK : cardImagePaths.fixed.cardBacksTcgdefaultback;
        const starterDeckImages = [
            "/starter-decks-boxes/SDTWILIGHT.webp",
            "/starter-decks-boxes/SDFLUTTERSHY.webp",
            "/starter-decks-boxes/SDPINKIEPIE.webp",
            "/starter-decks-boxes/SDAPPLEJACK.webp",
            "/starter-decks-boxes/SDRAINBOWDASH.webp",
            "/starter-decks-boxes/SDRARITY.webp",
        ];
        const starterDeckGroups = [
            { name: "Twilight Sparkle", code: "SD01A" },
            { name: "Fluttershy", code: "SD01B" },
            { name: "Pinkie Pie", code: "SD01C" },
            { name: "Applejack", code: "SD01D" },
            { name: "Rainbow Dash", code: "SD01E" },
            { name: "Rarity", code: "SD01F" },
        ];
        const rarityNames: Record<string, string> = {
            C: "COMMON",
            U: "UNCOMMON",
            SR: "SILVER RARE",
            SPR: "SAPPHIRE RARE",
            GR: "GOLD RARE",
            CR: "COLORFUL RARE",
            ER: "EMERALD RARE",
            PER: "SHINING EMERALD RARE",
            PRR: "SHINING RUBY RARE",
        };
        return { getFallbackDisplayCardCode, getDeckCards, rarityLabel, getStarterBack, starterDeckImages, starterDeckGroups, rarityNames };
    })(),
    "14": (() => {
        const rarityLabel = (rarity: string) => tcgCatalog.getDisplayRarity(rarity);
        const isLandscapeCommon = (key: string) => {
            const match = key.match(/^BP03-C(\d{2})$/);
            const number = match ? Number(match[1]) : 0;
            return number >= 25 && number <= 48;
        };
        const getFrontStyle = (key: string, inspect = false): CSSProperties => isLandscapeCommon(key) ? {
            inset: "auto", left: "50%", top: "50%", width: "140%", height: inspect ? "100%" : "71.4286%", maxWidth: "none", objectFit: inspect ? "contain" : "cover", transform: "translate(-50%, -50%) rotate(-90deg)"
        } : { objectFit: inspect ? "scale-down" : "cover", transform: "none" };
        const getBackStyle = (key: string, inspect = false): CSSProperties => isLandscapeCommon(key) ? {
            inset: "auto", left: "50%", top: "50%", width: "140%", height: "71.4285714286%", maxWidth: "none", objectFit: "cover", transform: `translate(-50%, -50%) rotate(90deg)${inspect ? "" : " scale(1.035)"}`
        } : { objectFit: inspect && /^BP03-RR0[1-6]$/.test(key) ? "scale-down" : "cover", transform: inspect && /^BP03-RR0[1-6]$/.test(key) ? "none" : `scale(${inspect ? 1.05 : 1.035})` };
        const rarityNames: Record<string, string> = {
            C: "COMMON",
            U: "UNCOMMON",
            ER: "EMERALD RARE",
            SR: "SILVER RARE",
            SPR: "SAPPHIRE RARE",
            GR: "GOLD RARE",
            CR: "COLORFUL RARE",
            RR: "RUBY RARE",
            PER: "SHINING EMERALD RARE",
            PSPR: "SHINING SAPPHIRE RARE",
            PGR: "SHINING GOLD RARE",
            PCR: "SHINING COLORFUL RARE",
            PRR: "SHINING RUBY RARE",
        };
        return { rarityLabel, isLandscapeCommon, getFrontStyle, getBackStyle, rarityNames };
    })() };
const englishPromoRules = (() => {
    const CCG_PROMO_SOURCES: Record<string, string> = {
        "PR-1": "Thailand Exclusive",
        "PR-2": "Moon One 24-Pack Box",
        "PR-3": "Rainbow One Box",
        "PR-4": "Fun Moments One Box",
        "PR-5": "Moon Two 12-Pack Box",
        "PR-7": "Rainbow Two Box",
        "PR-14": "Moon Four 12-Pack Box",
        "PR-15": "New York Comic-Con 2026",
        "PR-8": "San Diego Comic-Con 2026",
        "PR-9": "San Diego Comic-Con 2026",
        "PR-10": "San Diego Comic-Con 2026",
        "PR-11": "San Diego Comic-Con 2026",
        "PR-12": "San Diego Comic-Con 2026",
        "PR-13": "San Diego Comic-Con 2026",
    };
    const TCG_PROMO_SOURCES: Record<string, string> = {
        RR01: "Tournament Prize",
        RR02: "Tournament Prize",
        RR03: "Tournament Prize",
        RR04: "Tournament Prize",
        RR05: "Tournament Prize",
        RR06: "Tournament Prize",
        RR07: "Anime Expo 2026",
        RR08: "Anime Expo 2026",
        RR09: "Anime Expo 2026",
        RR10: "Anime Expo 2026",
        RR11: "Anime Expo 2026",
        RR12: "Anime Expo 2026",
        RR13: "Discord Box",
        RR14: "Discord Box",
        RR15: "Discord Box",
        RR16: "Discord Box",
        RR17: "Discord Box",
        RR18: "Discord Box",
        RR19: "Nightmare Night Box",
        RR20: "Nightmare Night Box",
        RR21: "Nightmare Night Box",
        RR22: "Nightmare Night Binder Set",
        RR23: "Nightmare Night Binder Set",
        RR24: "Nightmare Night Binder Set",
        RR25: "Nightmare Night Binder Set",
        RR26: "Nightmare Night Binder Set",
        RR27: "Nightmare Night Binder Set",
        RR28: "NYCC 2026",
    };
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
        "PR-15": 1.02,
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
        backgroundColor: "transparent",
        backgroundImage: "none",
        transform: key === "RR09" ? "translateY(-0.75%) scale(1.035, 1.02)" : `scale(${key.startsWith("PR-") ? CCG_CARD_ZOOM[key] ?? 1 : TCG_CARD_ZOOM[key] ?? 1})`
    });
    const isEventCCGPromo = (key: string) => ["PR-1", "PR-8", "PR-9", "PR-10", "PR-11", "PR-12", "PR-13", "PR-15"].includes(key);
    return { CCG_PROMO_SOURCES, TCG_PROMO_SOURCES, getPromoFrontStyle, isEventCCGPromo };
})();
export type EnglishFamily = "moon" | "star" | "rainbow" | "fun" | "tcg" | "promos";
export type EnglishCard = {
    setId: string;
    setName: string;
    family: EnglishFamily;
    key: string;
    stateKey: string;
    identity: string;
    rarity: string;
    number: number;
    code: string;
    checklistCode: string;
    front: string;
    back: string;
    image: string;
    isoEligible: boolean;
    wide: boolean;
    original: boolean;
    source?: string;
    starterDeck?: string;
};
export type EnglishSet = {
    id: string;
    setId: string;
    name: string;
    folder: string;
    prefix: string;
    rarities: Record<string, number>;
    family: EnglishFamily;
    promotional: boolean;
};
const ccgGroups = [{ catalog: moonCatalog, family: "moon" }, { catalog: starCatalog, family: "star" }, { catalog: rainbowCatalog, family: "rainbow" }, { catalog: funCatalog, family: "fun" }] as const;
export const englishSets: EnglishSet[] = [
    ...ccgGroups.flatMap(({ catalog, family }) => catalog.sets.map(set => ({ ...set, rarities: set.rarities as Record<string, number>, setId: set.id, family, promotional: false }))),
    ...tcgCatalog.sets.map(set => ({ ...set, setId: set.id, family: "tcg" as const, promotional: false })),
    { id: HEARTHSWARMING_EVE_ID, setId: HEARTHSWARMING_EVE_ID, name: HEARTHSWARMING_EVE_NAME, folder: "hearthswarming-eve", prefix: "BP04", rarities: HEARTHSWARMING_EVE_RARITIES, family: "tcg", promotional: false },
    ...promosCatalog.sets.map(set => ({ id: set.id, setId: set.id, name: set.name, folder: set.id === "9" ? "promo-cards" : "tcgpromos", prefix: set.id === "9" ? "PR" : "RR", rarities: { [set.id === "9" ? "PR" : "RR"]: set.cards.length }, family: "promos" as const, promotional: true }))
];
export const getEnglishSet = (id: string) => englishSets.find(set => set.id === getISOSetId(id));
export const englishStarterDecks = (englishSourceRules.SD.starterDeckGroups ?? []).map((deck, index) => ({ ...deck, image: englishSourceRules.SD.starterDeckImages?.[index] ?? "" }));
const ccgBacks: Record<string, (rarity: string, number: number) => string> = { "1": getMoonOneBack, "2": getMoonTwoBack, "3": getMoonThreeBack, "13": (rarity, number) => englishSourceRules["13"].getCardBack!(rarity, number), "4": getStarOneBack, "5": getRainbowOneBack, "6": getRainbowTwoBack, "7": getFunMomentsOneBack, "8": getFunMomentsTwoBack, "11": getFunMomentsThreeBack };
const tcgBacks: Record<string, (key: string) => string> = { SD: getFriendshipsBeginBack, FW: getFantasyWonderlandBack, "12": getDiscordBack, "14": getNightmareNightBack, "hearthswarming-eve": getHeartswarmingEveBack };
const createEnglishCard = (set: EnglishSet, key: string, rarity: string, number: number, isoEligible = true, starterDeck?: string): EnglishCard => {
    const stateKey = set.id === "SD" ? `${isoEligible ? "BONUS" : "STARTER"}-${key}` : key;
    const front = getLegacyTradeCardImage({ set_id: set.id, card_key: key });
    const back = !isoEligible ? englishSourceRules.SD.getStarterBack!(key) : ccgBacks[set.id]?.(rarity, number) ?? tcgBacks[set.id]?.(key) ?? (set.id === "9" ? getPromotionalCardsBack(number) : cardImagePaths.fixed.cardBacksTcgdefaultback);
    const code = !isoEligible ? (getISOCardCode(set.id, key) === key ? englishSourceRules.SD.getFallbackDisplayCardCode!(key) : getISOCardCode(set.id, key)) : set.id === HEARTHSWARMING_EVE_ID ? getHeartswarmingEveDisplayCode(key) : getISOCardCode(set.id, key);
    return { setId: set.id, setName: set.name, family: set.family, key, stateKey, identity: `${set.id}:${stateKey}`, rarity, number, code, checklistCode: englishSourceRules[set.id]?.getChecklistCode?.(rarity, number) ?? code, front, back, starterDeck, image: front, isoEligible, wide: set.id === "3" && key === "SZR-1", original: set.id === "9" && number === 14 || set.id === "tcgpromos" && number === 28, source: set.id === "9" ? englishPromoRules.CCG_PROMO_SOURCES[key] : set.id === "tcgpromos" ? englishPromoRules.TCG_PROMO_SOURCES[key] : undefined };
};
const cardsForSet = (set: EnglishSet): EnglishCard[] => {
    if (set.id === HEARTHSWARMING_EVE_ID)
        return HEARTHSWARMING_EVE_CARDS.map(card => createEnglishCard(set, card.key, card.rarity, card.number));
    if (set.family === "promos")
        return (promosCatalog.sets.find(entry => entry.id === set.id)?.cards ?? []).map(number => createEnglishCard(set, promosCatalog.getCardKey(set.id, number), set.id === "9" ? "PR" : "RR", number));
    if (set.family === "tcg") {
        const cards = tcgCatalog.getCards(set);
        const positions: Record<string, number> = {};
        const bonus = cards.map(card => createEnglishCard(set, card.key, card.rarity, positions[card.rarity] = (positions[card.rarity] ?? 0) + 1));
        if (set.id !== "SD")
            return bonus;
        return [...bonus, ...englishStarterDecks.flatMap(deck => englishSourceRules.SD.getDeckCards!(deck.code).map((key, index) => createEnglishCard(set, key, "STARTER", index + 1, false, deck.code)))];
    }
    return Object.entries(set.rarities).flatMap(([rarity, count]) => Array.from({ length: count }, (_, index) => createEnglishCard(set, `${rarity}-${index + 1}`, rarity, index + 1)));
};
export const englishChecklistCards: EnglishCard[] = englishSets.flatMap(cardsForSet);
export const englishCards: EnglishCard[] = englishChecklistCards.filter(card => card.isoEligible);
const englishCardsBySet = new Map(englishSets.map(set => [set.id, englishChecklistCards.filter(card => card.setId === set.id)]));
const canonicalKey = (id: string, key: string) => {
    let value = String(key);
    for (const prefix of [`${id}:`, `${id}-`])
        if (value.startsWith(prefix)) {
            value = value.slice(prefix.length);
            break;
        }
    if (id === "SD")
        return value.replace(/^BONUS-/, "");
    if (id === "14")
        return value.replace(/^(BP03-ER0[12])-([ABC])\2$/, "$1-$2");
    if (!["SD", "FW", "12", "14", "hearthswarming-eve", "tcgpromos"].includes(id))
        return value.replace(/^SHINING ZR-/, "SZR-").replace(/-(\d+)$/, (_, number) => `-${Number(number)}`);
    return value;
};
const lookupKey = (id: string, key: string) => `${id}:${canonicalKey(id, key)}`;
const englishCardsByKey = new Map<string, EnglishCard>();
for (const card of englishChecklistCards) {
    englishCardsByKey.set(lookupKey(card.setId, card.stateKey), card);
    if (card.isoEligible)
        englishCardsByKey.set(lookupKey(card.setId, card.key), card);
}
export const getEnglishCards = (setId: string, options: {
    includeStarterDecks?: boolean;
} = {}) => (englishCardsBySet.get(getISOSetId(setId)) ?? []).filter(card => options.includeStarterDecks || card.isoEligible);
export const getEnglishCard = (setId: string, key: string) => { const id = getISOSetId(setId); const prefix = `${setId}:`; const supplied = key.startsWith(prefix) ? key.slice(prefix.length) : key; return englishCardsByKey.get(lookupKey(id, supplied)); };
export const getTradeCardImage = (card: Card) => getEnglishCard(card.set_id, card.card_key)?.front ?? getLegacyTradeCardImage({ set_id: getISOSetId(card.set_id), card_key: card.card_key });
export const isEnglishCardOwned = (value: unknown): boolean => value === true || (typeof value === "object" && value !== null && "owned" in value && value.owned === true);
export const searchEnglishCards = (query: string, setId?: string) => { const needle = query.trim().toLowerCase(); const cards = setId ? getEnglishCards(setId) : englishCards.filter(card => card.isoEligible); return needle ? cards.filter(card => `${card.code} ${card.checklistCode} ${card.key} ${card.setName}`.toLowerCase().includes(needle)) : cards; };
export const getEnglishCardStamp = (card: EnglishCard) => { const rules = englishSourceRules[card.setId]; return { silver: rules?.hasSilverStamp?.(card.key) ?? (card.setId === "1" && card.rarity === "SC"), sideways: rules?.hasSidewaysStamp?.(card.key) ?? (card.setId === "1" && card.key === "SC-7"), centered: rules?.hasCenteredStamp?.(card.key) ?? false, landscapeLeft: card.setId === "2" && (rules?.hasSidewaysStamp?.(card.key) ?? false), doubleWide: card.wide }; };
export const getEnglishCardImageStyle = (card: EnglishCard, options: {
    side?: "front" | "back";
    inspect?: boolean;
    mobile?: boolean;
} = {}): CSSProperties => {
    const { side = "front", inspect = false, mobile = false } = options;
    const back = side === "back";
    const rules = englishSourceRules[card.setId];
    const base: CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", maxWidth: "none", maxHeight: "none", objectFit: "cover", objectPosition: "50% 50%", transformOrigin: "50% 50%" };
    if (card.family === "promos")
        return { ...base, ...(back ? { transform: "scale(1.035)" } : englishPromoRules.getPromoFrontStyle(card.key)) };
    if (card.family === "tcg")
        return { ...base, transform: back && ["SD", "FW"].includes(card.setId) ? "scale(1.035)" : "scale(1)", ...(back ? rules?.getBackStyle?.(card.key, inspect) : rules?.getFrontStyle?.(card.key, inspect)) };
    const older = ["1", "2", "3"].includes(card.setId);
    if (card.wide)
        return { ...base, transform: back ? "scale(1.035)" : "none" };
    let result: CSSProperties = older ? { ...base, transform: `scale(${inspect ? 1.045 : 1.04})` } : { ...base, inset: "-2px", width: "calc(100% + 4px)", height: "calc(100% + 4px)", transform: `scale(${back && card.setId === "4" ? 1.05 : 1.035})` };
    if (back && older && !inspect)
        result = { ...result, inset: "auto", left: mobile ? "-1px" : 0, top: "-7px", width: mobile ? "calc(100% + 2px)" : "100%", height: "calc(100% + 14px)", transform: "none" };
    const rotate = back && (card.setId === "2" ? rules?.hasSidewaysStamp?.(card.key) : rules?.hasRotatedBack?.(card.key));
    if (rotate)
        result.transform = `rotate(180deg) ${result.transform ?? ""}`;
    return result;
};
export const getEnglishRarityNames = (setId: string): Record<string, string> => { const set = getEnglishSet(setId); const names = englishSourceRules[getISOSetId(setId)]?.rarityNames ?? {}; return Object.fromEntries(Object.keys(set?.rarities ?? {}).map(rarity => [rarity, names[rarity] ?? rarity])); };
export const getEnglishRarityLabel = (setId: string, rarity: string) => { const rules = englishSourceRules[getISOSetId(setId)]; return rules?.getDisplayRarityCode?.(rarity) ?? rules?.rarityLabel?.(rarity) ?? rarity; };
export const getEnglishCollectionImageProps = (setId: string, key: string, side: "front" | "back" = "front", inspect = false): {
    src: string;
    style: CSSProperties;
    imageSize?: "original";
} => {
    const card = getEnglishCard(setId, key);
    if (!card)
        throw new Error(`Unknown English card: ${setId}:${key}`);
    const style = getEnglishCardImageStyle(card, { side, inspect });
    if (card.wide && side === "back")
        style.transform = `scale(${1 / 1.035}) ${style.transform ?? "none"}`;
    if (side === "back" && !inspect && ["1", "2", "3"].includes(card.setId) && !card.wide) {
        style.left = "var(--english-back-left, 0px)";
        style.width = "var(--english-back-width, 100%)";
    }
    return { src: side === "back" ? card.back : card.front, style, ...(card.original && side === "front" ? { imageSize: "original" as const } : {}) };
};
export const getEnglishStarterDeckCards = (code: string) => getEnglishCards("SD", { includeStarterDecks: true }).filter(card => card.starterDeck === code);
export const isEnglishEventPromo = (key: string) => englishPromoRules.isEventCCGPromo(key);
