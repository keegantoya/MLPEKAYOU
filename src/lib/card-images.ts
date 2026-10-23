export { cardImagePaths, getMoonFourFront, getFunMomentsOneBack, getFunMomentsThreeBack, getFunMomentsTwoBack, getMoonOneBack, getMoonThreeBack, getMoonTwoBack, getPromotionalCardsBack, getRainbowOneBack, getRainbowTwoBack, getStarOneBack, getDiscordBack, getDiscordFront, getHeartswarmingEveFront, getHeartswarmingEveBack, getFantasyWonderlandBack, getFantasyWonderlandFront, getFriendshipsBeginBack, getFriendshipsBeginFront, getNightmareNightBack, getNightmareNightFront, getTradeCardImage } from "./english-card-catalog";
export const CARD_IMAGE_WORKER_URL = "https\://mlpekayou-images.keegan-586.workers.dev";
export const CARD_IMAGE_PLACEHOLDER = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent('<svg xmlns="http\://www.w3.org/2000/svg" width="744" height="1040"><rect width="744" height="1040" rx="28" fill="#e5e7eb"/></svg>')}`;
const PROTECTED_PREFIXES = ["cards/", "card-backs/", "fantasy-wonderland/", "friendships-begin/", "fun-moments-one-backs/", "fun-moments-two-backs/", "fun-moments-three-backs/", "moon-1-other-backs/", "moon-2-other-backs/", "promo-cards/", "rainbow-1-backs/", "tcg-card-backs/", "tcgpromos/"];
export function getProtectedCardPath(src?: string) {
    if (!src || /^(data:|blob:)/i.test(src))
        return null;
    try {
        const pathname = /^https?:\/\//i.test(src) ? new URL(src).pathname : src;
        const path = decodeURIComponent(pathname.split(/[?#]/)[0].replace(/^\/+/, ""));
        return PROTECTED_PREFIXES.some(prefix => path.startsWith(prefix)) ? path : null;
    }
    catch {
        return null;
    }
}
export const CARD_IMAGE_BYTES_TTL_MS = 365 * 24 * 60 * 60 * 1000;
export const CARD_IMAGE_BYTES_CACHE = "mlpekayou:card-image-bytes:v1";
export const CARD_IMAGE_REVISIONS: Record<string, string> = {
    "promo-cards/mlpepr014.webp": "20261002-promos-3",
    "tcgpromos/RR28.webp": "20261002-promos-3",
};
export function isMoonFourBackRefreshTarget(path: string) {
    return /(?:^|\/)M4R(?:18|19|20)BACK\.webp$/i.test(path.split(/[?#]/)[0]);
}
export function getCardImageRevision(path: string) {
    if (isMoonFourBackRefreshTarget(path))
        return "20261003-moon4-backs-rotation-2";
    return CARD_IMAGE_REVISIONS[path] ?? "1";
}
