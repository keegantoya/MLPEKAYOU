export const MOON_FOUR_RARITIES: Record<string, number> = { R: 30, SR: 20, SSR: 26, HR: 30, UR: 16, LSR: 16, SGR: 8, ZR: 7, SC: 7, SZR: 2 };
export const MOON_FOUR_CARDS = Object.entries(MOON_FOUR_RARITIES).flatMap(([rarity, count]) => Array.from({ length: count }, (_, index) => ({ rarity, number: index + 1, key: `${rarity}-${index + 1}` })));
export const MOON_FOUR_KEYS = MOON_FOUR_CARDS.map(card => card.key);
export const getMoonFourDisplayCode = (key: string) => {
  const match = String(key).match(/^(R|SR|SSR|HR|UR|LSR|SGR|ZR|SC|SZR|SHINING ZR)-(\d+)$/);
  if (!match) return key;
  const rarity = match[1] === "SZR" || match[1] === "SHINING ZR" ? "\u25c7ZR" : match[1];
  return `MLPME04-${rarity}-${String(Number(match[2])).padStart(3, "0")}`;
};
