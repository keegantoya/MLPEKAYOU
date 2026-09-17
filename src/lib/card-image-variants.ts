import { cardImageThumbnails } from "./card-image-thumbnails";

export type CardImageSize = "grid" | "original";

export function getCardImageStoragePath(path: string | null, size: CardImageSize): string | null {
  if (!path || size === "original") return path;
  return cardImageThumbnails[path] || path;
}
