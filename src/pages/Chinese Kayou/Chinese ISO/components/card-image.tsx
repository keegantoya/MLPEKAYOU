import { useEffect, useRef, useState } from "react";
import { getCachedCardImage } from "@/lib/card-image-cache";
import { useChineseCardImage } from "../../card-images-cn";
import { type ChineseISOCard, isWideChineseCard, isChineseTicket, isChineseKujiPrize, getChineseCardAspectRatio, getChineseCardLabel } from "../catalog/catalog";
import { getChineseISOImageStyle } from "../catalog/image-styles";
function LoadedChineseImage({ card }: { card: ChineseISOCard }) {
  const image = useChineseCardImage(card.image);
  const [failedUrl, setFailedUrl] = useState("");
  const failed = !!image.error || (!!image.url && image.url === failedUrl);
  return image.url && !failed ? <img src={image.url} alt={getChineseCardLabel(card)} draggable={false} className="block h-full w-full object-cover object-center" style={getChineseISOImageStyle(card)} onError={() => setFailedUrl(image.url)} /> : <span className="flex h-full w-full items-center justify-center p-2 text-center text-[10px] leading-snug text-muted-foreground sm:text-xs" role="status">{failed ? card.family === "promos" ? "No image was available for this promo..." : "Image unavailable" : "Loading..."}</span>;
}
function PublicChineseImage({ card }: { card: ChineseISOCard }) {
  const [image, setImage] = useState<{ source: string; url: string; failed: boolean }>({ source: "", url: "", failed: false });
  useEffect(() => {
    let active = true;
    let release: (() => void) | undefined;
    setImage({ source: card.image, url: "", failed: false });
    const url = new URL(card.image);
    url.searchParams.set("publicProfile", "1");
    void getCachedCardImage(url.href, "chinese-public-profile", signal => fetch(url.href, { signal, credentials: "omit" })).then(source => {
      if (!active) { source?.release(); return; }
      release = source?.release;
      setImage({ source: card.image, url: source?.url ?? "", failed: !source });
    }).catch(() => { if (active) setImage({ source: card.image, url: "", failed: true }); });
    return () => { active = false; release?.(); };
  }, [card.image]);
  const current = image.source === card.image;
  return current && image.url && !image.failed ? <img src={image.url} alt={getChineseCardLabel(card)} draggable={false} className="block h-full w-full object-cover object-center" style={getChineseISOImageStyle(card)} onError={() => setImage(value => ({ ...value, failed: true }))} /> : <span className="flex h-full items-center justify-center p-2 text-center text-[10px] leading-snug text-muted-foreground sm:text-xs" role="status">{current && image.failed ? card.family === "promos" ? "No image was available for this promo..." : "Image unavailable" : "Loading..."}</span>;
}
export default function ChineseISOImage({ card, publicView = false }: { card: ChineseISOCard; publicView?: boolean }) {
  const element = useRef<HTMLDivElement>(null);
  const [nearby, setNearby] = useState(false);
  useEffect(() => {
    if (nearby) return;
    if (typeof IntersectionObserver === "undefined") { setNearby(true); return; }
    const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { setNearby(true); observer.disconnect(); } }, { rootMargin: "300px" });
    if (element.current) observer.observe(element.current);
    return () => observer.disconnect();
  }, [nearby]);
  return <div ref={element} data-cn-ticket={isChineseTicket(card) ? "true" : undefined} data-cn-kuji-prize={isChineseKujiPrize(card) ? "true" : undefined} className={`relative w-full overflow-hidden bg-muted ${isWideChineseCard(card) ? "aspect-[10/7]" : "aspect-[5/7]"}`} style={{ aspectRatio: getChineseCardAspectRatio(card), borderRadius: isChineseTicket(card) ? 0 : "4% / 2.857%" }}>
    {nearby && (publicView ? <PublicChineseImage card={card} /> : <LoadedChineseImage card={card} />)}
  </div>;
}
