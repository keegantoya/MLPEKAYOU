type InventoryTarget = {
    set_id: string;
    card_key: string;
};
type InventoryCard = {
    key: string;
    code: string;
    checklistCode?: string;
};
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
export type BulkListing = {
    is_for_trade: boolean;
    is_for_sale: boolean;
    asking_price: number | null;
    trade_quantity: number;
    sale_quantity: number;
};
export type BulkDraft = {
    quantity: string;
    trade: boolean;
    sale: boolean;
    tradeQuantity: string;
    saleQuantity: string;
    price: string;
};
type SavedRow = {
    key: string;
    quantity: number;
    listing: BulkListing;
};
export type InventoryBulkEditProps = {
    setId: string;
    setName: string;
    storageSetId?: string;
    merchandise?: boolean;
    cards: InventoryCard[];
    quantities: Record<string, number>;
    listings: Record<string, BulkListing>;
    quantityTargets: Record<string, InventoryTarget>;
    listingTargets: Record<string, InventoryTarget>;
    onSaved: (row: SavedRow) => void;
    onClose: () => void;
};
export function validateBulkDraft(code: string, draft: BulkDraft): SavedRow {
    const integer = (text: string, label: string) => {
        const n = Number(text);
        if (!text.trim() || !Number.isSafeInteger(n) || n < 1)
            throw new Error(`${code}: ${label} must be a whole number of at least 1.`);
        return n;
    };
    const quantity = integer(draft.quantity, "Personal quantity");
    const trade_quantity = draft.trade ? integer(draft.tradeQuantity, "Trade quantity") : 0;
    const sale_quantity = draft.sale ? integer(draft.saleQuantity, "Sale quantity") : 0;
    const asking_price = draft.sale ? Number(draft.price) : null;
    if (draft.sale && (!/^\d+(?:\.\d{1,2})?$/.test(draft.price) || !Number.isFinite(asking_price) || asking_price! < 0))
        throw new Error(`${code}: enter a sale price with up to two decimal places.`);
    return { key: "", quantity, listing: { is_for_trade: draft.trade, is_for_sale: draft.sale, asking_price, trade_quantity, sale_quantity } };
}
export async function saveBulkInventoryRow(userId: string, setId: string, key: string, value: SavedRow, quantityTarget?: InventoryTarget, listingTarget?: InventoryTarget) {
    const quantity = await supabase.from("card_quantity").upsert({ user_id: userId, ...(quantityTarget ?? { set_id: setId, card_key: key }), quantity: value.quantity }, { onConflict: "user_id,set_id,card_key" });
    if (quantity.error)
        throw quantity.error;
    const target = listingTarget ?? { set_id: setId, card_key: key };
    const result = value.listing.is_for_trade || value.listing.is_for_sale
        ? await supabase.from("card_market_listings").upsert({ user_id: userId, ...target, ...value.listing }, { onConflict: "user_id,set_id,card_key" })
        : await supabase.from("card_market_listings").delete().eq("user_id", userId).eq("set_id", target.set_id).eq("card_key", target.card_key);
    if (result.error)
        throw result.error;
}
export default function InventoryBulkEdit({ setId, storageSetId, merchandise = false, setName, cards, quantities, listings, quantityTargets, listingTargets, onSaved, onClose }: InventoryBulkEditProps) {
    const initial = () => Object.fromEntries(cards.map(card => { const listing = listings[card.key]; return [card.key, { quantity: String(quantities[card.key] ?? 1), trade: listing?.is_for_trade ?? false, sale: listing?.is_for_sale ?? false, tradeQuantity: String(listing?.trade_quantity || 1), saleQuantity: String(listing?.sale_quantity || 1), price: listing?.asking_price == null ? "" : String(listing.asking_price) }]; }));
    const [drafts, setDrafts] = useState<Record<string, BulkDraft>>(initial);
    const baseline = useRef<Record<string, BulkDraft>>(initial());
    const dialog = useRef<HTMLDialogElement>(null);
    const busyRef = useRef(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [progress, setProgress] = useState("");
    const [confirmClose, setConfirmClose] = useState(false);
    const changed = cards.filter(card => JSON.stringify(drafts[card.key]) !== JSON.stringify(baseline.current[card.key]));
    useEffect(() => { const node = dialog.current; node?.showModal(); const old = document.body.style.overflow; document.body.style.overflow = "hidden"; return () => { node?.close(); document.body.style.overflow = old; }; }, []);
    useEffect(() => {
        const viewport = window.visualViewport;
        const resize = () => {
            const node = dialog.current;
            if (!node)
                return;
            const height = viewport?.height ?? window.innerHeight;
            const width = viewport?.width ?? window.innerWidth;
            node.style.setProperty("--bulk-viewport-height", `${Math.floor(height * 0.72)}px`);
            node.style.setProperty("--bulk-viewport-width", `${Math.max(0, width - 16)}px`);
            node.style.setProperty("--bulk-viewport-top", `${(viewport?.offsetTop ?? 0) + height / 2}px`);
            node.style.setProperty("--bulk-viewport-left", `${(viewport?.offsetLeft ?? 0) + width / 2}px`);
        };
        resize();
        viewport?.addEventListener("resize", resize);
        viewport?.addEventListener("scroll", resize);
        window.addEventListener("resize", resize);
        return () => { viewport?.removeEventListener("resize", resize); viewport?.removeEventListener("scroll", resize); window.removeEventListener("resize", resize); };
    }, []);
    useEffect(() => {
        const preventUnload = (event: BeforeUnloadEvent) => {
            if (!changed.length && !busyRef.current)
                return;
            event.preventDefault();
            event.returnValue = "";
        };
        window.addEventListener("beforeunload", preventUnload);
        return () => window.removeEventListener("beforeunload", preventUnload);
    }, [changed.length]);
    const close = () => {
        if (busyRef.current)
            return;
        if (changed.length)
            setConfirmClose(true);
        else
            onClose();
    };
    const update = (key: string, patch: Partial<BulkDraft>) => { setDrafts(previous => ({ ...previous, [key]: { ...previous[key], ...patch } })); setConfirmClose(false); };
    const save = async () => {
        if (busyRef.current || !changed.length)
            return;
        setError("");
        let pending: {
            card: InventoryCard;
            row: SavedRow;
            draft: BulkDraft;
        }[];
        try {
            pending = changed.map(card => ({ card, row: { ...validateBulkDraft(card.code, drafts[card.key]), key: card.key }, draft: { ...drafts[card.key] } }));
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Check your entries.");
            return;
        }
        busyRef.current = true;
        setBusy(true);
        setConfirmClose(false);
        try {
            const { data, error: authError } = await supabase.auth.getSession();
            if (authError || !data.session?.user)
                throw new Error("Please sign in again before saving.");
            for (let index = 0; index < pending.length; index++) {
                const { card, row, draft } = pending[index];
                setProgress(`Saving ${index + 1} of ${pending.length}`);
                try {
                    await saveBulkInventoryRow(data.session.user.id, storageSetId ?? setId, card.key, row, quantityTargets[card.key], listingTargets[card.key]);
                }
                catch {
                    throw new Error(`${card.code} could not be fully saved. Earlier completed rows are saved; remaining changes are still here. Retry to finish.`);
                }
                baseline.current[card.key] = draft;
                onSaved(row);
            }
            onClose();
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Changes could not be saved.");
        }
        finally {
            busyRef.current = false;
            setBusy(false);
            setProgress("");
        }
    };
    const inputClass = "min-h-11 w-16 rounded-md sm:w-20 border border-black/15 bg-white px-2 text-base text-zinc-900 disabled:opacity-40 dark:border-white/15 dark:bg-[#111314] dark:text-white";
    const buttonClass = "min-h-11 rounded-lg border border-black/15 px-3 py-2 text-sm font-semibold hover:bg-black/[0.04] disabled:opacity-40 dark:border-white/15 dark:hover:bg-white/[0.05]";
    return <dialog ref={dialog} aria-labelledby="bulk-inventory-title" onCancel={event => { event.preventDefault(); close(); }} style={{ height: "min(600px, var(--bulk-viewport-height, 72dvh))", width: "min(64rem, var(--bulk-viewport-width, calc(100% - 1rem)))", top: "var(--bulk-viewport-top, 50%)", left: "var(--bulk-viewport-left, 50%)", right: "auto", bottom: "auto", margin: 0, transform: "translate(-50%, -50%)", boxSizing: "border-box" }} className="fixed flex max-h-none max-w-none flex-col overflow-hidden rounded-xl border border-black/10 bg-white p-0 text-zinc-900 shadow-2xl backdrop:bg-black/65 backdrop:backdrop-blur-sm dark:border-white/10 dark:bg-[#17191a] dark:text-white">
    <header className="flex shrink-0 items-center justify-between gap-3 border-b border-black/10 p-2 dark:border-white/10 sm:p-4">
      <div className="min-w-0"><h2 id="bulk-inventory-title" className="text-base font-semibold sm:text-xl">Bulk edit</h2><p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400 sm:mt-1 sm:text-sm">{setName} &#183; {cards.length} owned cards</p></div>
      <button type="button" onClick={close} disabled={busy} className={buttonClass} aria-label="Close bulk edit">Close</button>
    </header>
    <div className="min-h-0 flex-1 overflow-auto overscroll-contain">
      <table className="w-full border-collapse text-left text-sm"><thead className="sticky top-0 z-10 bg-zinc-100 dark:bg-[#202324]"><tr>{[merchandise ? "Item" : "Card code", "Personal qty", "Trade", "Trade qty", "Sale", "Sale qty", "Price (USD)"].map(label => <th key={label} scope="col" className="whitespace-nowrap px-2 py-2 font-semibold sm:px-3 sm:py-3">{label}</th>)}</tr></thead><tbody>
        {cards.map(card => {
            const draft = drafts[card.key];
            return <tr key={card.key} className="border-b border-black/[0.07] dark:border-white/[0.07]">
          <th scope="row" className="sticky left-0 z-[1] whitespace-nowrap bg-white px-2 py-1 font-medium dark:bg-[#17191a] sm:px-3 sm:py-2">{card.code}</th>
          <td className="px-2 py-1 sm:px-3 sm:py-2"><input aria-label={`${card.code} personal quantity`} disabled={busy} inputMode="numeric" value={draft.quantity} onChange={event => update(card.key, { quantity: event.target.value })} className={inputClass}/></td>
          <td className="px-2 py-1 sm:px-3 sm:py-2"><label className="flex min-h-11 min-w-11 items-center justify-center"><input type="checkbox" aria-label={`${card.code} for trade`} checked={draft.trade} disabled={busy} onChange={event => update(card.key, { trade: event.target.checked })} className="h-5 w-5 accent-[#E7C84B]"/></label></td>
          <td className="px-2 py-1 sm:px-3 sm:py-2"><input aria-label={`${card.code} trade quantity`} disabled={busy || !draft.trade} inputMode="numeric" value={draft.tradeQuantity} onChange={event => update(card.key, { tradeQuantity: event.target.value })} className={inputClass}/></td>
          <td className="px-2 py-1 sm:px-3 sm:py-2"><label className="flex min-h-11 min-w-11 items-center justify-center"><input type="checkbox" aria-label={`${card.code} for sale`} checked={draft.sale} disabled={busy} onChange={event => update(card.key, { sale: event.target.checked })} className="h-5 w-5 accent-[#E7C84B]"/></label></td>
          <td className="px-2 py-1 sm:px-3 sm:py-2"><input aria-label={`${card.code} sale quantity`} disabled={busy || !draft.sale} inputMode="numeric" value={draft.saleQuantity} onChange={event => update(card.key, { saleQuantity: event.target.value })} className={inputClass}/></td>
          <td className="px-2 py-1 sm:px-3 sm:py-2"><input aria-label={`${card.code} price in USD`} disabled={busy || !draft.sale} inputMode="decimal" value={draft.price} onChange={event => update(card.key, { price: event.target.value })} className={inputClass}/></td>
        </tr>;
        })}
      </tbody></table>
      {!cards.length && <p className="p-6 text-center text-sm text-zinc-500">No {merchandise ? "items" : "cards"} in this inventory.</p>}
    </div>
    <footer className="max-h-[35%] shrink-0 space-y-2 overflow-y-auto border-t border-black/10 p-2 dark:border-white/10 sm:p-3">
      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {confirmClose && <div className="flex flex-wrap items-center gap-2 text-sm"><span>Discard unsaved bulk changes?</span><button type="button" className={buttonClass} onClick={onClose}>Discard and close</button><button type="button" className={buttonClass} onClick={() => setConfirmClose(false)}>Keep editing</button></div>}
      <div className="flex items-center justify-between gap-2"><p role="status" className="text-sm text-zinc-500 dark:text-zinc-400">{progress || `${changed.length} ${merchandise ? "items" : "cards"} changed`}</p><button type="button" onClick={() => void save()} disabled={busy || !changed.length} className="min-h-11 shrink-0 rounded-lg bg-[#E7C84B] px-3 py-2 text-sm font-semibold text-black disabled:opacity-40 sm:px-5">{busy ? "Saving..." : "Save changes"}</button></div>
    </footer>
  </dialog>;
}
