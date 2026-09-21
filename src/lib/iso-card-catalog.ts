// Save as src/lib/iso-card-catalog.ts. Shared source for ISO and moderation.
export const funCatalog = (() => {
const getRarityCode = (rarity: string) => {
  return rarity;
};
const getDisplayCardCode = (
  setId: string,
  rarity: string,
  number: number
) => {
const rarityCode = getRarityCode(rarity);
const cardNumber = String(number).padStart(3, "0");
const setCodeMap: Record<string, string> = {
    "7": "FME01",
    "8": "FME02",
    "11": "FME03",
  };
  if (setId === "7" && rarity === "SN") {
    return `FME01-◇N-${cardNumber}`;
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
    return `FME02-◇N-${cardNumber}`;
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
    return `FME03-◇N-${cardNumber}`;
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
    return `FME03-◇CR-${cardNumber}`;
  }
const baseCode = setCodeMap[setId] || "";
  return `${baseCode}-${rarityCode}-${cardNumber}`;
};
const sets = [
  {
    id: "7",
    name: "Fun Moments First Edition",
    folder: "fun-moments-one",
    prefix: "FM1",
    rarities: {
      N: 20,
      SN: 20,
      R: 35,
      SR: 15,
      SSR: 15,
      UR: 10,
      CR: 12,
    },
  },
  {
    id: "8",
    name: "Fun Moments Second Edition",
    folder: "fun-moments-two",
    prefix: "FM2",
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
    name: "Fun Moments Third Edition",
    folder: "fun-moments-three",
    prefix: "FM3",
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
];
return { sets, getDisplayCardCode, getRarityCode };
})();
export const moonCatalog = (() => {
const getRarityCode = (rarity: string) => {
  if (rarity === "SHINING ZR") return "SZR";
  return rarity;
};
const getDisplayCardCode = (
  setId: string,
  rarity: string,
  number: number
) => {
const rarityCode = getRarityCode(rarity);
const cardNumber = String(number).padStart(3, "0");
  if (setId === "2" && rarity === "HR") {
    return `INT03-HR-${cardNumber}`;
  }
  if (
    setId === "2" &&
    (rarity === "SHINING ZR" || rarity === "SZR")
  ) {
    return `MLPME02-◇ZR-${cardNumber}`;
  }
  if (setId === "3" && rarity === "SZR") {
    return `MLPME03-◇ZR-${cardNumber}`;
  }
const setCodeMap: Record<string, string> = {
    "1": "MLPME01",
    "2": "MLPME02",
    "3": "MLPME03",
  };
  return `${setCodeMap[setId]}-${rarityCode}-${cardNumber}`;
};
const sets = [
  {
    id: "1",
    name: "Moon First Edition",
    folder: "first-edition-moon",
    prefix: "M1",
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
    name: "Moon Second Edition",
    folder: "second-edition-moon",
    prefix: "M2",
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
    name: "Moon Third Edition",
    folder: "third-edition-moon",
    prefix: "M3",
    rarities: {
      R: 60,
      SR: 40,
      SSR: 40,
      HR: 60,
      LSR: 32,
      UR: 18,
      SGR: 16,
      ZR: 14,
      SC: 7,
      SZR: 3,
    },
  },
]
return { sets, getDisplayCardCode, getRarityCode };
})();
export const promosCatalog = (() => {
const ccgCards = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13];
const tcgCards = Array.from({ length: 27 }, (_, i) => i + 1);
const getDisplayCardCode = (
  setId: string,
  number: number
) => {
  if (setId === "9") {
// Standard CCG Promos
    if (number <= 7) {
      return `MLPE-PR-${String(number).padStart(3, "0")}`;
    }
// SDCC Promos
    return `SDCC-${String(number - 7).padStart(3, "0")}`;
  }
  if (setId === "tcgpromos") {
// RR-01 through RR-06
    if (number <= 6) {
      return `RR-${String(number).padStart(2, "0")}`;
    }
// BP01 CR-07 through CR-12
    if (number <= 12) {
      return `BP01-CR-${String(number).padStart(2, "0")}`;
    }
// BP02 CR-01 through CR-06
    if (number <= 18) {
      return `BP02-CR-${String(number - 12).padStart(2, "0")}`;
    }
const newPromoNames: Record<number, string> = {
      19: "TK-01",
      20: "※TK-01",
      21: "※TK-01",
      22: "※BP03-CR-01",
      23: "※BP03-CR-02",
      24: "※BP03-CR-03",
      25: "※BP01-CR-04",
      26: "※BP01-CR-05",
      27: "※BP01-CR-06",
    };
    return newPromoNames[number] || `RR-${String(number).padStart(2, "0")}`;
  }
  return `RR-${String(number).padStart(2, "0")}`;
};
const getCardKey = (
  setId: string,
  number: number
) => {
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
const getDisplayCardCode = (
  setId: string,
  rarity: string,
  number: number
) => {
const rarityCode = getRarityCode(rarity);
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
const sets = [
  {
    id: "5",
    name: "Rainbow First Edition",
    folder: "rainbow-one",
    prefix: "R1",
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
    name: "Rainbow Second Edition",
    folder: "rainbow-two",
    prefix: "R2",
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
];
return { sets, getDisplayCardCode, getRarityCode };
})();
export const starCatalog = (() => {
const getRarityCode = (rarity: string) => {
  return rarity;
};
const getDisplayCardCode = (
  setId: string,
  rarity: string,
  number: number
) => {
const rarityCode = getRarityCode(rarity);
const cardNumber = String(number).padStart(3, "0");
  if (setId === "4" && rarity === "SAR") {
    return `MLPSE01-◇AR-${cardNumber}`;
  }
const baseCode = "MLPSE01";
  return `${baseCode}-${rarity === "SAR" ? "◇AR" : rarityCode}-${cardNumber}`;
};
const sets = [
  {
    id: "4",
    name: "Star First Edition",
    folder: "star-one",
    prefix: "S1",
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
];
return { sets, getDisplayCardCode, getRarityCode };
})();
export const tcgCatalog = (() => {
const sets: { id: string; name: string; folder: string; prefix: string; rarities: Record<string, number> }[] = [
  {
    id: "SD",
    name: "FRIENDSHIPS BEGIN",
    folder: "friendships-begin",
    prefix: "SD",
    rarities: {
      C: 9,
      U: 7,
      SR: 6,
      SPR: 10,
      GR: 6,
      CR: 6,
      ER: 6,
      PER: 12,
      PRR: 6,
    },
  },
  {
    id: "FW",
    name: "FANTASY WONDERLAND",
    folder: "fantasy-wonderland",
    prefix: "BP01",
    rarities: {
      C: 48,
      U: 18,
      ER: 6,
      SR: 14,
      SPR: 28,
      GR: 12,
      CR: 12,
      RR: 6,
      PER: 12,
      PSPR: 11,
      PGR: 6,
      PCR: 12,
      PRR: 6,
    },
  },
  {
    id: "12",
    name: "DISCORD",
    folder: "discord",
    prefix: "BP02",
    rarities: {
      C: 48,
      U: 18,
      ER: 6,
      SR: 14,
      SPR: 28,
      GR: 12,
      CR: 12,
      RR: 6,
      PER: 12,
      PGR: 6,
      PSPR: 11,
      PCR: 12,
      PRR: 6,
    },
  },
  {
    id: "14",
    name: "NIGHTMARE NIGHT",
    folder: "nightmare-night",
    prefix: "BP03",
    rarities: {
      C: 48,
      U: 18,
      ER: 6,
      SR: 14,
      SPR: 28,
      GR: 12,
      CR: 12,
      RR: 6,
      PER: 12,
      PGR: 5,
      PSPR: 11,
      PCR: 12,
      PRR: 6,
    },
  },
];
const getCards = (set: { id: string; rarities: Record<string, number> }, TCGCharacterMap: Record<string, string[]> = {}) => {
return Object.entries(set.rarities).flatMap(
  ([rarity, count]) => {
    if (set.id === "SD") {
      if (rarity === "PER") {
        return Array.from({ length: count as number }, (_, i) => ({
          rarity,
          key: `SD01PER${String(i + 7).padStart(2, "0")}`,
          characters:
            TCGCharacterMap[`SD-PER-${i + 7}`] ?? [],
        }));
      }
      return Array.from({ length: count as number }, (_, i) => ({
        rarity,
        key: `SD01${rarity}${String(i + 1).padStart(2, "0")}`,
        characters:
          TCGCharacterMap[`SD-${rarity}-${i + 1}`] ?? [],
      }));
    }
    if (set.id === "14") {
      if (rarity === "ER") {
        return ["01", "02"].flatMap((number) =>
          ["AA", "BB", "CC"].map((variant) => ({
            rarity,
            key: `BP03-ER${number}-${variant}`,
            characters:
              TCGCharacterMap[`BP03-ER${number}-${variant}`] ?? [],
          })),
        );
      }
      if (rarity === "PER") {
        return ["01", "02"].flatMap((number) =>
          ["A", "A2", "B", "B2", "C", "C2"].map((variant) => ({
            rarity,
            key: `PBP03-ER${number}-${variant}`,
            characters:
              TCGCharacterMap[`PBP03-ER${number}-${variant}`] ?? [],
          })),
        );
      }
      if (rarity === "PGR") {
        return ["07", "08", "09", "11", "12"].map((number) => ({
          rarity,
          key: `PBP03-GR${number}`,
          characters:
            TCGCharacterMap[`PBP03-GR${number}`] ?? [],
        }));
      }
      if (rarity === "PSPR") {
        return ["03", "04", "06", "08", "11", "16", "17", "19", "20", "23", "25"].map((number) => ({
          rarity,
          key: `PBP03-SPR${number}`,
          characters:
            TCGCharacterMap[`PBP03-SPR${number}`] ?? [],
        }));
      }
      if (rarity === "PCR") {
        return Array.from({ length: 12 }, (_, i) => ({
          rarity,
          key: `PBP03-CR${String(i + 1).padStart(2, "0")}`,
          characters:
            TCGCharacterMap[
              `PBP03-CR${String(i + 1).padStart(2, "0")}`
            ] ?? [],
        }));
      }
      if (rarity === "PRR") {
        return Array.from({ length: 6 }, (_, i) => ({
          rarity,
          key: `PBP03-RR${String(i + 1).padStart(2, "0")}`,
          characters:
            TCGCharacterMap[
              `PBP03-RR${String(i + 1).padStart(2, "0")}`
            ] ?? [],
        }));
      }
      return Array.from({ length: count as number }, (_, i) => ({
        rarity,
        key: `BP03-${rarity}${String(i + 1).padStart(2, "0")}`,
        characters:
          TCGCharacterMap[
            `BP03-${rarity}${String(i + 1).padStart(2, "0")}`
          ] ?? [],
      }));
    }
    if (set.id === "12") {
      if (rarity === "PER") {
        return Array.from({ length: 6 }, (_, i) => [
          {
            rarity,
            key: `BP02-PER${String(i + 1).padStart(2, "0")}-A2`,
            characters:
              TCGCharacterMap[`12-PER-${i * 2 + 1}`] ?? [],
          },
          {
            rarity,
            key: `BP02-PER${String(i + 1).padStart(2, "0")}-B2`,
            characters:
              TCGCharacterMap[`12-PER-${i * 2 + 2}`] ?? [],
          },
        ]).flat();
      }
const countNum = count as number;
      return Array.from({ length: countNum }, (_, i) => ({
        rarity,
        key: `BP02-${rarity}${String(i + 1).padStart(2, "0")}`,
        characters:
  TCGCharacterMap[
    `BP02-${rarity}${String(i + 1).padStart(2, "0")}`
  ] ?? [],
      }));
    }
    if (rarity === "ER") {
      return Array.from({ length: 6 }, (_, i) => ({
        rarity,
        key: `BP01ER${String(i + 7).padStart(2, "0")}`,
        characters:
          TCGCharacterMap[`FW-ER-${i + 7}`] ?? [],
      }));
    }
    if (rarity === "PSPR") {
const numbers = [1, 2, 3, 5, 7, 8, 9, 12, 13, 18, 21];
      return numbers.map((n, index) => ({
        rarity,
        key: `BP01PSPR${String(n).padStart(2, "0")}`,
        characters:
          TCGCharacterMap[`FW-PSPR-${index + 1}`] ?? [],
      }));
    }
    return Array.from({ length: count as number }, (_, i) => ({
      rarity,
      key: `BP01${rarity}${String(i + 1).padStart(2, "0")}`,
      characters:
        TCGCharacterMap[`FW-${rarity}-${i + 1}`] ?? [],
    }));
  }
);
};
const getDisplayCardCode = (setId: string, card: { rarity: string; key: string }) => {
const set = { id: setId };
let displayCode = "";
  if (set.id === "SD") {
    if (card.rarity === "PER") {
const num = parseInt(card.key.slice(-2), 10);
const displayNum = Math.ceil((num - 6) / 2) + 6;
      displayCode = `※SD01-ER${String(displayNum).padStart(2, "0")}`;
    } else if (card.rarity === "PRR") {
      displayCode = `※SD01-RR${card.key.slice(-2)}`;
    } else {
      displayCode = card.key.replace(/^SD01/, "SD01-");
    }
  } else if (set.id === "14") {
    if (card.rarity === "PER") {
const match = card.key.match(/PBP03-ER(\d{2})/);
      displayCode = match ? `※BP03-ER${match[1]}` : card.key;
    } else if (card.rarity === "PSPR") {
      displayCode = `※BP03-SPR${card.key.slice(-2)}`;
    } else if (card.rarity === "PGR") {
      displayCode = `※BP03-GR${card.key.slice(-2)}`;
    } else if (card.rarity === "PCR") {
      displayCode = `※BP03-CR${card.key.slice(-2)}`;
    } else if (card.rarity === "PRR") {
      displayCode = `※BP03-RR${card.key.slice(-2)}`;
    } else {
      displayCode = card.key;
    }
  } else if (set.id === "12") {
    if (card.rarity === "PER") {
const match = card.key.match(/PER(\d{2})/);
      displayCode = match ? `※BP02-ER${match[1]}` : card.key;
    } else if (card.rarity === "PSPR") {
const displayMap = [
        "01","02","05","10","14","15",
        "16","18","23","24","26",
      ];
const index = parseInt(card.key.slice(-2), 10) - 1;
      displayCode = `※BP02-SPR${displayMap[index]}`;
    } else if (card.rarity === "PGR") {
      displayCode = `※BP02-GR${card.key.slice(-2)}`;
    } else if (card.rarity === "PCR") {
      displayCode = `※BP02-CR${card.key.slice(-2)}`;
    } else if (card.rarity === "PRR") {
      displayCode = `※BP02-RR${card.key.slice(-2)}`;
    } else {
      displayCode = card.key.replace(/^BP02-?/, "BP02-");
    }
  } else {
    if (card.rarity === "ER") {
      displayCode = `BP01-ER${card.key.slice(-2)}`;
    } else if (card.rarity === "PER") {
const perMap = [
        "01","02","02","02","03","03",
        "04","04","05","05","06","06",
      ];
const index = parseInt(card.key.slice(-2), 10) - 1;
      displayCode = `※BP01-ER${perMap[index]}`;
    } else if (card.rarity === "PSPR") {
      displayCode = `※BP01-SPR${card.key.slice(-2)}`;
    } else if (card.rarity === "PGR") {
      displayCode = `※BP01-GR${card.key.slice(-2)}`;
    } else if (card.rarity === "PCR") {
      displayCode = `※BP01-CR${card.key.slice(-2)}`;
    } else if (card.rarity === "PRR") {
      displayCode = `※BP01-RR${card.key.slice(-2)}`;
    } else {
      displayCode = card.key.replace(/^BP01/, "BP01-");
    }
  }
return displayCode;
};
const getDisplayRarity = (rarity: string) => rarity.startsWith("P") ? `※${rarity.slice(1)}` : rarity;
return { sets, getCards, getDisplayCardCode, getDisplayRarity };
})();

const catalogGroups = [funCatalog, moonCatalog, promosCatalog, rainbowCatalog, starCatalog, tcgCatalog];
export const getISOSetId = (setId: string) => ({
  discord: "12", friendshipsbegin: "SD", "friendships-begin": "SD",
  "fantasy-wonderland": "FW", "nightmare-night": "14",
} as Record<string, string>)[String(setId)] || String(setId);
export const getISOSetName = (setId: string) => {
  const id = getISOSetId(setId);
  for (const group of catalogGroups) {
    const set = group.sets.find((entry) => entry.id === id);
    if (set) return set.name;
  }
  return "Unknown collection";
};
export const getISOCardCode = (setId: string, cardKey: string) => {
  const id = getISOSetId(setId);
  const original = String(cardKey || "");
  let key = original;
  for (const prefix of [`${setId}:`, `${id}:`, `${setId}-`, `${id}-`]) {
    if (key.startsWith(prefix)) { key = key.slice(prefix.length); break; }
  }
  key = key.replace(/^BONUS-/, "");
  if (promosCatalog.sets.some((set) => set.id === id)) {
    const match = key.match(id === "9" ? /^PR-?(\d+)$/ : /^RR-?(\d+)$/);
    return match ? promosCatalog.getDisplayCardCode(id, Number(match[1])) : original;
  }
  for (const group of [funCatalog, moonCatalog, rainbowCatalog, starCatalog]) {
    if (!group.sets.some((set) => set.id === id)) continue;
    const match = key.match(/^(.+)-(\d+)$/);
    if (!match || !/^[A-Z ]+$/.test(match[1])) return original;
    return group.getDisplayCardCode(id, match[1], Number(match[2]));
  }
  const tcgSet = tcgCatalog.sets.find((set) => set.id === id);
  if (tcgSet) {
    // Stored BP03 base emerald keys sometimes use A/B/C instead of AA/BB/CC.
    if (id === "14") key = key.replace(/^(BP03-ER\d{2})-([ABC])$/, "$1-$2$2");
    const card = tcgCatalog.getCards(tcgSet).find((entry) => entry.key === key);
    if (card) return tcgCatalog.getDisplayCardCode(id, card);
  }
  // Keep unrecognized or already-formatted identifiers intact.
  return original;
};
