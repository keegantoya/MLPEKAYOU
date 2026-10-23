export const ENGLISH_MERCHANDISE_SET_ID = "OTHERMERCH";
export type MerchandiseItem = { key: string; number: number; series: string; level: string; image: string };
export type MerchandiseSet = { id: string; title: string; href: string; thumbnail: string; aspect?: "portrait" | "square"; items: MerchandiseItem[] };
export const merchandiseSets: MerchandiseSet[] = [{
  id: "gel-pens",
  title: "Gel Pens",
  href: "/gel-pens",
  thumbnail: "/thumbnails/penssetimage.webp",
  items: Array.from({ length: 13 }, (_, index) => {
    const number = index + 1;
    const key = `PEN-S1-${number}`;
    return { key, number, series: "Series One", level: number <= 7 ? "Common" : number <= 10 ? "Precious" : "Secret", image: `Other-Merch/${key}.webp` };
  }),
}, {
  id: "acrylic-stands",
  aspect: "square",
  title: "Acrylic Stands",
  href: "/acrylic-stands",
  thumbnail: "/thumbnails/acrylicstandssetimage.webp",
  items: Array.from({ length: 19 }, (_, index) => index + 1).map(number => {
    const key = `AS-S1-${number}`;
    const level = number <= 4 ? "Luminous" : number <= 9 ? "Grainy" : number <= 12 ? "Starcrown" : number <= 18 ? "Stellar" : "Dawnlight";
    return { key, number, series: "Adventure Edition", level, image: `Other-Merch/${key}.webp` };
  }).concat(Array.from({ length: 18 }, (_, index) => {
    const number = index + 1;
    const key = `AS-S2-${number}`;
    const level = number <= 5 ? "Delicious" : number <= 11 ? "Vitality" : number <= 15 ? "Energy" : number === 16 ? "Special" : "Friendship";
    return { key, number, series: "Fantasy Edition", level, image: `Other-Merch/${key}.webp` };
  })),
}, {
  id: "badges-pins",
  aspect: "square",
  title: "Badges and Pins",
  href: "/badges-pins",
  thumbnail: "/thumbnails/pinsbadgessetimage.webp",
  items: Array.from({ length: 6 }, (_, index) => {
    const number = index + 1;
    const key = `B-S1-${number}`;
    return { key, number, series: "Magic Garden", level: "Magic Garden", image: `Other-Merch/${key}.webp` };
  }),
}];
export const getMerchandiseSet = (id: string) => merchandiseSets.find(set => set.id === id);
export const isMerchandiseOwned = (value: unknown) => value === true || (typeof value === "object" && value !== null && "owned" in value && value.owned === true);
export function getMerchandiseOwnedCount(progress: unknown, setId?: string, hiddenIds: readonly string[] = []): number {
  if (!progress || typeof progress !== "object" || Array.isArray(progress) || hiddenIds.includes(ENGLISH_MERCHANDISE_SET_ID)) return 0;
  const values = progress as Record<string, unknown>;
  if (setId) {
    const set = getMerchandiseSet(setId);
    return !set || hiddenIds.includes(setId) ? 0 : set.items.filter(item => isMerchandiseOwned(values[item.key])).length;
  }
  const hiddenKeys = new Set(merchandiseSets.filter(set => hiddenIds.includes(set.id)).flatMap(set => set.items.map(item => item.key)));
  return Object.entries(values).filter(([key, value]) => !hiddenKeys.has(key) && isMerchandiseOwned(value)).length;
}
