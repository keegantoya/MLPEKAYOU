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

    return `/cards/${set.folder}/${set.prefix}${getRarityCode(
      rarity
    )}${String(number).padStart(3, "0")}.webp`;
  }

  //
  // CCG Promos
  //
  if (setId === "9") {
    const number = String(card.card_key).replace("PR-", "");

    return `/promo-cards/mlpepr${String(number).padStart(3, "0")}.webp`;
  }

  //
  // TCG Promos
  //
  if (setId === "tcgpromos") {
    return `/tcgpromos/${card.card_key}.webp`;
  }

  //
  // Friendships Begin
  //
  if (setId === "SD" || setId === "friendshipsbegin") {
    const key = String(card.card_key)
      .replace(/^BONUS-/, "")
      .replace(/^STARTER-/, "");

    return `/friendships-begin/${key}.webp`;
  }

  //
  // Fantasy Wonderland
  //
  if (setId === "FW") {
    const key = String(card.card_key);

    return key.startsWith("BP01ER")
      ? `/fantasy-wonderland/SD01ER${key.slice(-2)}.webp`
      : key.startsWith("BP01PER")
      ? `/fantasy-wonderland/SD01PER${key.slice(-2)}.webp`
      : `/fantasy-wonderland/${key}.webp`;
  }

  //
  // Discord
  //
  if (setId === "12") {
    return `/cards/discord/${card.card_key}.webp`;
  }

  return "/placeholder-card.webp";
}