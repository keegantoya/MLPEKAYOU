import { useEffect, useState } from "react";
import { Check, Heart, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getChineseCardLabel, isChineseKujiPrize, type ChineseISOCard } from "../catalog/catalog";
import type { ChineseStatus } from "../data/model";
import type { ChineseISOController } from "../data/use-chinese-iso";
import ChineseISOImage from "./card-image";
type Props = { card: ChineseISOCard | null; onClose: () => void; controller: ChineseISOController; status?: ChineseStatus; wishlisted: boolean; owned: boolean };
export default function ChineseCardActions({ card, onClose, controller, status, wishlisted, owned }: Props) {
  const [error, setError] = useState("");
  const prize = !!card && isChineseKujiPrize(card);
  useEffect(() => setError(""), [card?.identity]);
  const act = async (operation: () => Promise<void>) => {
    if (controller.busy) return;
    setError("");
    try { await operation(); onClose(); } catch (cause) { setError(cause instanceof Error ? cause.message : "The update could not be saved."); }
  };
  return <Dialog open={!!card} onOpenChange={open => { if (!open && !controller.busy) onClose(); }}><DialogContent className="flex max-h-[calc(100dvh-24px)] sm:max-h-[calc(100dvh-48px)] w-[calc(100%-1.5rem)] sm:w-[calc(100%-3rem)] !max-w-[640px] flex-col !gap-0 overflow-hidden !rounded-3xl border-black/10 bg-white !p-0 text-zinc-900 dark:border-white/10 dark:bg-[#17191a] dark:text-zinc-100 shadow-2xl [&>button]:hidden" aria-busy={controller.busy} onEscapeKeyDown={event => { if (controller.busy) event.preventDefault(); }} onPointerDownOutside={event => { if (controller.busy) event.preventDefault(); }}>
    <header className="flex shrink-0 items-start justify-between gap-3 border-b border-black/[0.06] px-4 py-3 sm:px-5 sm:py-4 dark:border-white/[0.08]">
      <div className="min-w-0"><DialogDescription className="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">{card?.setName}</DialogDescription><DialogTitle className="break-words text-base font-semibold sm:text-lg">{getChineseCardLabel(card)}</DialogTitle></div>
      <button type="button" disabled={controller.busy} onClick={onClose} aria-label={prize ? "Close prize details" : "Close card details"} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD54A] disabled:opacity-50 dark:bg-white/[0.07] dark:text-zinc-300 dark:hover:bg-white/[0.12]"><X size={20} /></button>
    </header>
    {card && <div className="min-h-0 overflow-y-auto overscroll-contain p-3 sm:p-5"><div className="grid items-start gap-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-5">
      <div className="pointer-events-none mx-auto w-[min(180px,24dvh)] overflow-hidden rounded-xl shadow-lg sm:rounded-2xl sm:w-full"><ChineseISOImage card={card} /></div>
      <div className="min-w-0">
        <div><h2 className="mb-2 text-sm font-semibold sm:mb-0">{owned ? "In your collection" : prize ? "Update prize status" : "Update card status"}</h2><p className="mb-3 mt-1 hidden text-xs leading-5 text-zinc-500 sm:block dark:text-zinc-400">{owned ? `Manage this ${prize ? "prize" : "card"} on your wishlist.` : status === "purchase_in_progress" ? "Purchase in progress" : status === "trade_in_progress" ? "Trade in progress" : `Choose how you are getting this ${prize ? "prize" : "card"}.`}</p></div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
        {!owned && (["purchase_in_progress", "trade_in_progress"] as const).map(value => <button key={value} type="button" disabled={controller.busy} aria-pressed={status === value} onClick={() => void act(() => controller.status(card, status === value ? null : value))} className={`flex min-h-12 min-w-0 w-full items-center gap-2 rounded-xl border px-2.5 py-2.5 sm:gap-3 sm:px-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD54A] disabled:cursor-wait disabled:opacity-50 sm:min-h-14 ${status === value ? "border-[#FFD54A]/70 bg-[#FFD54A]/15 dark:bg-[#FFD54A]/10" : "border-black/[0.08] bg-white hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.07]"}`}>
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${value === "purchase_in_progress" ? "bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300"}`}>{value === "purchase_in_progress" ? <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M6 7h12l2 14H4L6 7Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg> : <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 7h15m-4-4 4 4-4 4M20 17H5m4-4-4 4 4 4" /></svg>}</span>
          <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{value === "purchase_in_progress" ? "Buying" : "Trading"}</span><span className="mt-0.5 hidden text-xs text-zinc-500 sm:block dark:text-zinc-400">{status === value ? "Selected - tap to clear" : value === "purchase_in_progress" ? "Purchase in progress" : "Trade in progress"}</span></span>{status === value && <Check size={16} className="shrink-0" aria-hidden="true" />}
        </button>)}
        {!owned && <button type="button" disabled={controller.busy} onClick={() => void act(() => controller.complete(card))} className="col-span-2 flex min-h-11 w-full items-center justify-between gap-2 rounded-xl sm:col-span-1 bg-[#FFD54A] px-3 py-3 text-sm font-semibold text-zinc-900 transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-50 sm:min-h-12"><span>Mark complete</span><Check size={16} /></button>}
        <button type="button" disabled={controller.busy} aria-pressed={wishlisted} onClick={() => void act(() => controller.wishlist(card, !wishlisted))} className="col-span-2 flex min-h-11 w-full items-center justify-center gap-2 sm:col-span-1 rounded-xl border border-black/[0.08] px-3 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-pink-50 hover:text-pink-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 disabled:cursor-wait disabled:opacity-50 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-pink-400/10 dark:hover:text-pink-300"><Heart size={16} className={wishlisted ? "fill-pink-500 text-pink-500" : ""} />{wishlisted ? "Remove from wishlist" : "Add to wishlist"}</button>
        </div>
        {status && <button type="button" disabled={controller.busy} onClick={() => void act(() => controller.status(card, null))} className="mt-2 min-h-10 w-full rounded-lg text-xs font-medium text-zinc-500 transition hover:text-zinc-900 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-white">Clear in-progress status</button>}
        {controller.busy && <p role="status" className="mt-3 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400"><span className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700 motion-reduce:animate-none dark:border-zinc-600 dark:border-t-zinc-200" aria-hidden="true" />Saving...</p>}
        {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
    </div></div>}
  </DialogContent></Dialog>;
}
