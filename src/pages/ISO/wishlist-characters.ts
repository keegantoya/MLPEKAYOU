import { moonCharacterMap } from "./Card Characters/card-characters-moon";
import { funCharacterMap } from "./Card Characters/card-characters-fun";
import { rainbowCharacterMap } from "./Card Characters/card-characters-rainbow";
import { starCharacterMap } from "./Card Characters/card-characters-star";
import { promoCharacterMap } from "./Card Characters/card-characters-promos";
import { TCGCharacterMap } from "./Card Characters/card-characters-tcg";
const characterMaps: Record<string, string[]>[] = [moonCharacterMap, funCharacterMap, rainbowCharacterMap, starCharacterMap, promoCharacterMap, TCGCharacterMap];
export const getWishlistCharacters = (setId: string, cardKey: string): string[] => {
  const id = setId === "friendshipsbegin" ? "SD" : setId;
  const key = cardKey.replace(/^(BONUS|STARTER)-/, "");
  const candidates = new Set([key, `${id}-${key}`]);
  const ccg = key.match(/^(SHINING ZR|[A-Z]+)-(\d+)$/);
  if (ccg) {
    candidates.add(`${id}-${ccg[1]}-${Number(ccg[2])}`);
    candidates.add(`${id}-${ccg[1] === "SZR" ? "SHINING ZR" : ccg[1]}-${Number(ccg[2])}`);
  }
  const tcg = key.match(/^(P?)BP0[1-4]-?([A-Z]+)(\d{2})(?:-.*)?$/);
  if (tcg) candidates.add(`${id}-${tcg[1]}${tcg[2]}-${Number(tcg[3])}`);
  const sd = key.match(/^SD01([A-Z]+)(\d{2})$/);
  if (sd) candidates.add(`SD-${sd[1]}-${Number(sd[2])}`);
  const promo = key.match(/^RR(\d{2})$/);
  if (promo) candidates.add(`${id}-RR-${Number(promo[1])}`);
  return Array.from(new Set(characterMaps.flatMap((map) => Array.from(candidates).flatMap((candidate) => map[candidate] ?? []))));
};
