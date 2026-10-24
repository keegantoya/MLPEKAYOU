import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { chineseFamilies, chineseSets } from "../catalog/catalog";
import type { ChineseISOController } from "../data/use-chinese-iso";
import { CHINESE_KUJI_VISIBILITY_SET_ID, chineseKujiRaffles, isChineseKujiRaffleHidden, setChineseKujiRaffleHidden } from "../data/model";
type Props = { cardCodeSearch?: string; onCardCodeSearchChange?: (value: string) => void; open: boolean; onOpenChange: (open: boolean) => void; controller: ChineseISOController; viewAll: boolean; onViewAll: (value: boolean) => void; wishlistMode: boolean; onWishlistMode: (value: boolean) => void };
type ToggleProps = { title: string; description?: string; checked: boolean; disabled?: boolean; onChange: (value: boolean) => void };
const switchClass = (active: boolean, disabled = false) => `relative h-6 w-10 shrink-0 rounded-full transition-colors motion-reduce:transition-none sm:h-7 sm:w-12 ${disabled ? "cursor-not-allowed bg-zinc-200 opacity-50 dark:bg-white/10" : active ? "bg-[#FFD54A]" : "bg-zinc-200 dark:bg-white/10"}`;
function ControlToggle({ title, description, checked, disabled = false, onChange }: ToggleProps) {
  return <label className={`flex items-center justify-between gap-1.5 rounded-xl p-1.5 sm:gap-4 sm:rounded-2xl sm:p-2 ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
    <span className="min-w-0"><span className="block text-sm font-semibold sm:text-[15px]">{title}</span>{description && <span className="mt-0.5 hidden text-sm leading-5 text-zinc-500 sm:block dark:text-zinc-400">{description}</span>}</span>
    <input type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={event => onChange(event.target.checked)} className="peer sr-only" />
    <span aria-hidden="true" className={`${switchClass(checked, disabled)} peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-[#FFD54A]`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-[left] motion-reduce:transition-none sm:h-5 sm:w-5 ${checked ? "left-5 sm:left-6" : "left-1"}`} /></span>
  </label>;
}
export default function ChineseISOControls({ open, onOpenChange, controller, viewAll, onViewAll, wishlistMode, onWishlistMode }: Props) {
const settings = controller.data.settings;
const [showHideSets, setShowHideSets] = useState(false);
const [expanded, setExpanded] = useState<string | null>(null);
const [kujiExpanded, setKujiExpanded] = useState(false);
  useEffect(() => { if (!open) { setShowHideSets(false); setExpanded(null); setKujiExpanded(false); } }, [open]);
const save = (patch: Parameters<ChineseISOController["settings"]>[0]) => { void controller.settings(patch).catch(() => {}); };
const hiddenKujiRaffles = chineseKujiRaffles.filter(raffle => isChineseKujiRaffleHidden(settings.chinese_iso_hidden_sets, raffle)).length;
const hiddenCount = chineseSets.filter(set => set.id !== CHINESE_KUJI_VISIBILITY_SET_ID && settings.chinese_iso_hidden_sets.includes(set.id)).length + hiddenKujiRaffles;
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className={`flex max-h-[82dvh] w-[calc(100%-2rem)] flex-col !gap-0 overflow-hidden !rounded-[22px] border-black/10 bg-[#f5f5f7] !p-0 text-zinc-900 shadow-xl sm:rounded-[28px] dark:border-white/10 dark:bg-[#1c1c1e] dark:text-white [&>button]:hidden ${showHideSets ? "!max-w-[500px]" : "!max-w-3xl"}`}>
    <div className="shrink-0 px-3 pb-1 pt-2 sm:px-6 sm:pb-2 sm:pt-3">
      <div className="mb-1 flex items-center justify-between sm:mb-3">
        <button type="button" onClick={() => onOpenChange(false)} className="group flex h-4 w-4 items-center justify-center rounded-full bg-[#ff5f57] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff5f57] sm:h-5 sm:w-5" aria-label="Close Chinese ISO controls" title="Close"><span aria-hidden="true" className="text-[11px] font-bold leading-none text-[#7a1f1b] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">&times;</span></button>
        {showHideSets && <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-zinc-500 shadow-sm dark:bg-white/[0.07] dark:text-zinc-400">{hiddenCount} hidden</span>}
      </div>
      <DialogTitle className="text-lg font-bold tracking-tight sm:text-xl">{showHideSets ? "Set Visibility" : "ISO Controls"}</DialogTitle>
      <DialogDescription className="mt-0.5 hidden text-sm text-zinc-500 sm:block dark:text-zinc-400">{showHideSets ? "Choose which Chinese sets are hidden from your ISO." : "Choose what appears in your ISO."}</DialogDescription>
    </div>
    {showHideSets ? <>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-3 pb-3">
        {chineseFamilies.map(family => {
const sets = chineseSets.filter(set => set.family === family.id);
const isExpanded = expanded === family.id;
const hidden = sets.filter(set => settings.chinese_iso_hidden_sets.includes(set.id)).length;
          return <section key={family.id} className="overflow-hidden rounded-[22px] bg-white shadow-sm dark:bg-white/[0.06]">
            <button type="button" aria-expanded={isExpanded} aria-controls={`chinese-visibility-${family.id}`} onClick={() => setExpanded(isExpanded ? null : family.id)} className="flex min-h-12 w-full items-center gap-3 p-3 text-left transition hover:bg-black/[0.025] dark:hover:bg-white/[0.04]">
              <span className="min-w-0 flex-1"><span className="block text-[15px] font-semibold">{family.name}</span><span className="mt-0.5 block text-sm text-zinc-500 dark:text-zinc-400">{sets.length} {sets.length === 1 ? "set" : "sets"}{hidden > 0 ? ` / ${hidden} hidden` : ""}</span></span>
              <span aria-hidden="true" className={`flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-lg text-zinc-500 transition-transform motion-reduce:transition-none dark:bg-white/[0.08] dark:text-zinc-300 ${isExpanded ? "rotate-90" : ""}`}>&rsaquo;</span>
            </button>
            <div id={`chinese-visibility-${family.id}`} hidden={!isExpanded} className="border-t border-black/[0.06] px-2 py-2 dark:border-white/[0.07]">
              {sets.map(set => set.id === CHINESE_KUJI_VISIBILITY_SET_ID ? <div key={set.id} className="rounded-2xl px-1">
                <button type="button" aria-expanded={kujiExpanded} aria-controls="chinese-kuji-raffle-visibility" onClick={() => setKujiExpanded(value => !value)} className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl p-1.5 text-left transition hover:bg-zinc-100 sm:p-2 dark:hover:bg-white/[0.05]">
                  <span className="min-w-0"><span className="block text-sm font-semibold sm:text-[15px]">{set.name}</span><span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">{hiddenKujiRaffles} of {chineseKujiRaffles.length} raffles hidden</span></span>
                  <span aria-hidden="true" className={`flex h-7 w-7 shrink-0 items-center justify-center text-lg text-zinc-500 transition-transform motion-reduce:transition-none dark:text-zinc-300 ${kujiExpanded ? "rotate-90" : ""}`}>&rsaquo;</span>
                </button>
                <div id="chinese-kuji-raffle-visibility" hidden={!kujiExpanded} className="mb-1 ml-3 border-l border-black/[0.08] pl-2 dark:border-white/10">
                  {chineseKujiRaffles.map(raffle => <ControlToggle key={raffle} title={`Raffle ${raffle}`} checked={isChineseKujiRaffleHidden(settings.chinese_iso_hidden_sets, raffle)} disabled={controller.busy} onChange={hidden => save({ chinese_iso_hidden_sets: setChineseKujiRaffleHidden(settings.chinese_iso_hidden_sets, raffle, hidden) })} />)}
                </div>
              </div> : <div key={set.id} className="rounded-2xl px-1 transition hover:bg-zinc-100 dark:hover:bg-white/[0.05]"><ControlToggle title={set.name} checked={settings.chinese_iso_hidden_sets.includes(set.id)} disabled={controller.busy} onChange={hidden => save({ chinese_iso_hidden_sets: hidden ? Array.from(new Set([...settings.chinese_iso_hidden_sets, set.id])) : settings.chinese_iso_hidden_sets.filter(id => id !== set.id) })} /></div>)}
            </div>
          </section>;
        })}
        <p className="px-1 pt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">Turn a switch on to hide that set or raffle. Hidden sets stay available through code searches and wishlist browsing.</p>
      </div>
      <div className="shrink-0 border-t border-black/[0.06] bg-white/90 p-4 backdrop-blur dark:border-white/[0.07] dark:bg-[#1c1c1e]/95"><button type="button" onClick={() => setShowHideSets(false)} className="min-h-11 w-full rounded-2xl bg-[#FFD54A] px-4 py-2.5 text-[15px] font-semibold text-zinc-900 transition hover:brightness-95 active:scale-[0.99]">Done</button></div>
    </> : <div className="min-h-0 overflow-y-auto overscroll-contain px-2 pb-2 sm:px-4 sm:pb-3">
      <div className="grid grid-cols-2 items-start gap-1.5 sm:gap-3">
        <section className="min-w-0 rounded-2xl bg-white p-1.5 shadow-sm sm:rounded-[22px] sm:p-2.5 dark:bg-white/[0.06]"><ControlToggle title="Show all cards" description="Include cards you already own and cards in progress." checked={viewAll} disabled={wishlistMode} onChange={onViewAll} /></section>
        <section className="min-w-0 rounded-2xl bg-white p-1.5 shadow-sm sm:rounded-[22px] sm:p-2.5 dark:bg-white/[0.06]"><ControlToggle title="Wishlist mode" description="Add or remove cards from your wishlist, including cards you own." checked={wishlistMode} disabled={viewAll} onChange={onWishlistMode} /></section>
      <section className="col-span-2 overflow-hidden rounded-2xl bg-white shadow-sm sm:rounded-[22px] dark:bg-white/[0.06]">
          <div className="px-2 py-1 sm:px-3 sm:py-2"><ControlToggle title="Private ISO" description="Hide your Chinese ISO from your public profile." checked={settings.chinese_hide_iso} disabled={controller.busy} onChange={value => save({ chinese_hide_iso: value })} /></div>
          <div className="mx-4 h-px bg-black/[0.06] dark:bg-white/[0.07]" />
          <div className="px-2 py-1 sm:px-3 sm:py-2"><ControlToggle title="Private wishlist" description="Hide your Chinese wishlist from your public profile." checked={settings.chinese_hide_wishlist} disabled={controller.busy} onChange={value => save({ chinese_hide_wishlist: value })} /></div>
          <div className="mx-4 h-px bg-black/[0.06] dark:bg-white/[0.07]" />
          <button type="button" onClick={() => setShowHideSets(true)} className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-black/[0.025] dark:hover:bg-white/[0.04]"><span className="min-w-0"><span className="block text-[15px] font-semibold">Set visibility</span><span className="mt-0.5 hidden text-sm leading-5 text-zinc-500 sm:block dark:text-zinc-400">Choose which collection sets appear.</span></span><span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-lg text-zinc-500 sm:h-8 sm:w-8 dark:bg-white/[0.08] dark:text-zinc-300">&rsaquo;</span></button>
        </section>
      </div>
      <button type="button" disabled={controller.busy} onClick={() => { void controller.settings({ chinese_cards_enabled: false }).then(() => onOpenChange(false)).catch(() => {}); }} className="mt-3 min-h-11 w-full rounded-2xl px-3 text-sm text-zinc-500 transition hover:bg-black/[0.04] disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-white/[0.05]">Deactivate Chinese cards on my profile</button>
    </div>}
    {controller.error && <p role="alert" className="shrink-0 px-4 pb-4 text-sm text-red-600 dark:text-red-400">{controller.error}</p>}
  </DialogContent></Dialog>;
}
