import { getISOCharacters, resolveISOCard } from "./catalog-adapter";
export const getWishlistCharacters = (setId: string, cardKey: string): string[] => { const card = resolveISOCard(setId, cardKey); return card ? getISOCharacters(card) : []; };
