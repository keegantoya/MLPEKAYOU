export const HEARTHSWARMING_EVE_ID = "hearthswarming-eve";
export const HEARTHSWARMING_EVE_NAME = "HeartsWarming Eve";
export const HEARTHSWARMING_EVE_RARITIES: Record<string, number> = {
  C: 48, U: 18, ER: 6, SR: 14, SPR: 28, GR: 12, CR: 12, RR: 6,
  PER: 12, PGR: 6, PSPR: 11, PCR: 12, PRR: 6,
};
export const getHeartswarmingEveRarity = (key: string) => {
  const match = key.match(/^(P?)BP0[24]-(SPR|SR|ER|GR|CR|RR|C|U)(\d{2})$/);
  return match ? `${match[1]}${match[2]}` : "";
};
export const getHeartswarmingEveRarityLabel = (key: string) => {
  const rarity = getHeartswarmingEveRarity(key);
  return rarity.startsWith("P") ? `\u203b${rarity.slice(1)}` : rarity;
};
export const HEARTHSWARMING_EVE_PSPR_PRINTED_NUMBERS = [2, 3, 4, 6, 9, 11, 17, 25, 26, 27, 28];
export const getHeartswarmingEveDisplayCode = (key: string) => {
  const sapphire = key.match(/^PBP04-SPR(\d{2})$/);
  if (sapphire) {
    const printed = HEARTHSWARMING_EVE_PSPR_PRINTED_NUMBERS[Number(sapphire[1]) - 1];
    if (printed !== undefined) return `\u203bBP04-SPR${String(printed).padStart(2, "0")}`;
  }
  if (key.startsWith("BP02-GR")) return key.replace(/^BP02-GR/, "BP04-GR");
  return key.startsWith("PBP04-") ? `\u203b${key.slice(1)}` : key;
};
export const HEARTHSWARMING_EVE_CARDS = Object.entries(HEARTHSWARMING_EVE_RARITIES).flatMap(([rarity, count]) => {
  const shining = rarity.startsWith("P");
  const prefix = shining ? "PBP04" : rarity === "GR" ? "BP02" : "BP04";
  const code = shining ? rarity.slice(1) : rarity;
  return Array.from({ length: count }, (_, index) => {
    const number = index + 1;
    const key = `${prefix}-${code}${String(number).padStart(2, "0")}`;
    return { key, rarity, number, characters: [] as string[], image: `/cards/hearthswarming-eve/${key.replace(/^BP02-GR/, "BP04-GR")}.webp` };
  });
});
export const HEARTHSWARMING_EVE_KEYS = HEARTHSWARMING_EVE_CARDS.map(card => card.key);
export const isHeartswarmingEveOwned = (value: unknown) => value === true || (typeof value === "object" && value !== null && "owned" in value && value.owned === true);
