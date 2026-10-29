import { ISOCardCaption, isoGridClass } from "@/components/iso/ISOShared";
import { Heart, ShoppingBag, ArrowLeftRight } from "lucide-react";
import { getChineseCardLabel, isWideChineseCard, type ChineseISOCard } from "../catalog/catalog";
import type { ChineseStatus } from "../data/model";
import ChineseISOImage from "./card-image";
type Props = { cards: ChineseISOCard[]; wishlist?: Set<string>; statuses?: Map<string, ChineseStatus>; onSelect?: (card: ChineseISOCard) => void; publicView?: boolean; busy?: boolean };
export default function ChineseCardGrid({ cards, wishlist = new Set(), statuses = new Map(), onSelect, publicView = false, busy = false }: Props) {
  return <div className={isoGridClass}>
    {cards.map(card => {
      const status = statuses.get(card.identity);
      const art = <><ChineseISOImage card={card} publicView={publicView} /><span className="pointer-events-none absolute bottom-1.5 left-1.5 right-1.5 flex items-end justify-between gap-1">{status ? <span className={`flex items-center gap-1 rounded-full px-1.5 py-1 text-[9px] font-semibold text-white ${status === "purchase_in_progress" ? "bg-red-600/90" : "bg-emerald-700/90"}`}>{status === "purchase_in_progress" ? <ShoppingBag size={10} /> : <ArrowLeftRight size={10} />}<span>{status === "purchase_in_progress" ? "Buying" : "Trading"}</span></span> : <span />}{wishlist.has(card.identity) && <span className="rounded-full bg-background/90 p-1 text-pink-500"><Heart size={12} fill="currentColor" aria-label="Wishlisted" /></span>}</span></>;
      return <article key={card.identity} className={`min-w-0 ${isWideChineseCard(card) ? "col-span-2" : ""}`}>
        {onSelect ? <button type="button" className="relative block w-full rounded-lg text-left transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transform-none" disabled={busy} aria-label={`Manage ${getChineseCardLabel(card)} from ${card.setName}`} onClick={() => onSelect(card)}>{art}</button> : <div className="relative">{art}</div>}
        <ISOCardCaption code={getChineseCardLabel(card)} setName={card.setName}/>
      </article>;
    })}
  </div>;
}
