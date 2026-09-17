// All card-front and card-back asset paths live here.
// Inputs retain each caller's existing card-key formatting; filenames are not normalized.
type ImagePathPart = string | number;
export const cardImagePaths = {
  ccg: (folder: ImagePathPart, prefix: ImagePathPart, rarity: ImagePathPart, number: ImagePathPart) => `/cards/${folder}/${prefix}${rarity}${number}.webp`,
  ccgPromo: (number: ImagePathPart) => `/promo-cards/mlpepr${number}.webp`,
  tcgPromo: (key: ImagePathPart) => `/tcgpromos/${key}.webp`,
  friendshipsBegin: (key: ImagePathPart) => `/friendships-begin/${key}.webp`,
  fantasyEmerald: (number: ImagePathPart) => `/fantasy-wonderland/SD01ER${number}.webp`,
  fantasyParallelEmerald: (number: ImagePathPart) => `/fantasy-wonderland/SD01PER${number}.webp`,
  fantasyWonderland: (key: ImagePathPart) => `/fantasy-wonderland/${key}.webp`,
  discord: (key: ImagePathPart) => `/cards/discord/${key}.webp`,
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

type Card = {
  set_id: string;
  card_key: string;
};

const sets: Record<
  string,
  {
    folder: string;
    prefix: string;
  }
> = {
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

function getRarityCode(rarity: string) {
  if (rarity === "SHINING ZR") return "SZR";
  return rarity;
}

export function getTradeCardImage(card: Card) {
  const setId = String(card.set_id);

  //
  // Moon / Star / Rainbow / Fun
  //
  const set = sets[setId];

  if (set) {
    const [rarity, number] = String(card.card_key).split("-");

    return cardImagePaths.ccg(set.folder, set.prefix, getRarityCode(
      rarity
    ), String(number).padStart(3, "0"));
  }

  //
  // CCG Promos
  //
  if (setId === "9") {
    const number = String(card.card_key).replace("PR-", "");

    return cardImagePaths.ccgPromo(String(number).padStart(3, "0"));
  }

  //
  // TCG Promos
  //
  if (setId === "tcgpromos") {
    return cardImagePaths.tcgPromo(card.card_key);
  }

  //
  // Friendships Begin
  //
  if (setId === "SD" || setId === "friendshipsbegin") {
    const key = String(card.card_key)
      .replace(/^BONUS-/, "")
      .replace(/^STARTER-/, "");

    return cardImagePaths.friendshipsBegin(key);
  }

  //
  // Fantasy Wonderland
  //
  if (setId === "FW") {
    const key = String(card.card_key);

    return key.startsWith("BP01ER")
      ? cardImagePaths.fantasyEmerald(key.slice(-2))
      : key.startsWith("BP01PER")
      ? cardImagePaths.fantasyParallelEmerald(key.slice(-2))
      : cardImagePaths.fantasyWonderland(key);
  }

  //
  // Discord
  //
  if (setId === "12") {
    return cardImagePaths.discord(card.card_key);
  }

    if (setId === "14") {
    return cardImagePaths.nightmareNight(card.card_key);
  }

  return "/placeholder-card.webp";
}
// Set-specific front and back selection rules.
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
  if (
    rarity === "HR" &&
    (
      (number >= 1 && number <= 22) ||
      (number >= 31 && number <= 52)
    )
  ) {
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
  if (
    rarity === "USR" ||
    rarity === "ST" ||
    rarity === "TR" ||
    rarity === "TGR"
  ) {
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
// C25-C48 have unique backs
  if (key.startsWith("BP02-C")) {
const num = Number(key.replace("BP02-C", ""));
    if (num >= 25 && num <= 48) {
      return cardImagePaths.discordBack(key);
    }
  }
// RR01-RR06 have unique backs
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
// Emerald Rares and Shining Emeralds use the scene back
  if (key.startsWith("SD01ER") || key.startsWith("SD01PER")) {
    return cardImagePaths.fixed.tcgCardBacksSCENECARDBACK;
  }
// Shining Ruby Rares have unique backs
  if (key.startsWith("SD01PRR")) {
    return cardImagePaths.parallelRubyBack(key.slice(-2));
  }
// Everything else uses the standard TCG back
  return cardImagePaths.fixed.cardBacksTcgdefaultback;
};

export const getFriendshipsBeginFront = (key: string) => {
  return cardImagePaths.friendshipsBegin(key);
};

export const getNightmareNightBack = (key: string) => {
    if (key.startsWith("BP03-ER") || key.startsWith("PBP03-ER")) {
      return cardImagePaths.fixed.tcgCardBacksSCENECARDBACK;
    }
    // C25-C48 have unique backs
    if (key.startsWith("BP03-C")) {
      const num = Number(key.replace("BP03-C", ""));
      if (num >= 25 && num <= 48) {
        return cardImagePaths.nightmareBack(key);
      }
    }
    // RR01-RR06 have unique backs
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

// Shared protected-image configuration and source recognition.
export const CARD_IMAGE_WORKER_URL = "https://mlpekayou-images.keegan-586.workers.dev";
export const CARD_IMAGE_PLACEHOLDER = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="744" height="1040"><rect width="744" height="1040" rx="28" fill="#e5e7eb"/></svg>')}`;
const PROTECTED_PREFIXES = ["cards/", "card-backs/", "fantasy-wonderland/", "friendships-begin/", "fun-moments-one-backs/", "fun-moments-two-backs/", "fun-moments-three-backs/", "moon-1-other-backs/", "moon-2-other-backs/", "promo-cards/", "rainbow-1-backs/", "tcg-card-backs/", "tcgpromos/"];
export function getProtectedCardPath(src?: string) {
  if (!src || /^(data:|blob:)/i.test(src)) return null;
  try {
    const pathname = /^https?:\/\//i.test(src) ? new URL(src).pathname : src;
    const path = decodeURIComponent(pathname.split(/[?#]/)[0].replace(/^\/+/, ""));
    return PROTECTED_PREFIXES.some(prefix => path.startsWith(prefix)) ? path : null;
  } catch { return null; }
}

// Actual image bytes are reusable for 365 days, independently of signed URLs.
export const CARD_IMAGE_BYTES_TTL_MS = 365 * 24 * 60 * 60 * 1000;
export const CARD_IMAGE_BYTES_CACHE = "mlpekayou:card-image-bytes:v1";
// Increment only an affected image's revision after replacing it in R2.
export const CARD_IMAGE_REVISIONS: Record<string, string> = {};
export function getCardImageRevision(path: string) {
  return CARD_IMAGE_REVISIONS[path] ?? "1";
}
