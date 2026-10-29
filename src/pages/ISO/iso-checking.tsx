import { getISOStatusKey, getISOStatusKeyVariants, resolveISOCard, resolveWishlistCard, type ISOStatus } from "./catalog-adapter";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ISOActionButtons, ISOCardActionDialog } from "@/components/iso/ISOShared";
import { supabase } from "@/lib/supabase";
import { getISOCardCode, getISOSetName } from "@/lib/iso-card-catalog";
type Status = "purchase_in_progress" | "trade_in_progress";
interface ISOCheckingProps {
    className?: string;
    contentClassName?: string;
    contentStyle?: CSSProperties;
    userId: string;
    setId: string;
    cardKey: string;
    children: React.ReactNode;
    initialStatus?: ISOStatus | null;
    wishlistMode?: boolean;
    owned?: boolean;
    isWishlisted?: boolean;
    toggleWishlist?: (setId: string, cardKey: string) => Promise<void>;
    onStatusChange?: (status: Status | null) => void;
    onComplete?: () => void;
}
export default function ISOChecking({ className, contentClassName, contentStyle, userId, setId, cardKey, children, initialStatus, owned = false, wishlistMode = false, isWishlisted = false, toggleWishlist, onStatusChange, onComplete, }: ISOCheckingProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<Status | null>(null);
    const isoCardKey = getISOStatusKey(setId, cardKey);
    const isoCardKeys = getISOStatusKeyVariants(setId, cardKey);
    const busyRef = useRef(false);
    const [actionError, setActionError] = useState("");
    const menuRef = useRef<HTMLDivElement>(null);
    const isMerchandise = resolveISOCard(setId, cardKey)?.family === "merch";
    const displayCard = wishlistMode ? resolveWishlistCard(setId,cardKey) : resolveISOCard(setId,cardKey);
    const cardCode = displayCard?.code ?? getISOCardCode(setId, cardKey);
    const setName = displayCard?.setName ?? getISOSetName(setId);
    useEffect(() => {
        async function loadStatus() {
            if (initialStatus !== undefined) {
                setStatus(initialStatus);
                return;
            }
            if (!userId)
                return;
            const { data } = await supabase
                .from("iso_status")
                .select("status")
                .eq("user_id", userId)
                .in("card_key", isoCardKeys)
                .in("status", ["purchase_in_progress", "trade_in_progress"])
                .limit(1)
                .maybeSingle();
            if (data?.status === "purchase_in_progress" || data?.status === "trade_in_progress") {
                setStatus(data.status);
            }
            else {
                setStatus(null);
            }
        }
        loadStatus();
    }, [userId, cardKey, isoCardKey, initialStatus]);
    const emitStatus = (next: Status | null) => { setStatus(next); setOpen(false); window.dispatchEvent(new CustomEvent("iso-status-changed", { detail: { userId, cardKey: isoCardKey, status: next } })); onStatusChange?.(next); };
    const perform = async (operation: () => Promise<void>) => {
        if (busyRef.current)
            return;
        busyRef.current = true;
        setLoading(true);
        setActionError("");
        try {
            await operation();
        }
        catch (cause) {
            console.error(cause);
            setActionError(cause instanceof Error ? cause.message : "The update could not be saved.");
        }
        finally {
            busyRef.current = false;
            setLoading(false);
        }
    };
    async function saveStatus(newStatus: Status) {
        await perform(async () => {
            if (status === newStatus) {
                const { error } = await supabase.from("iso_status").delete().eq("user_id", userId).in("card_key", isoCardKeys);
                if (error)
                    throw error;
                emitStatus(null);
                return;
            }
            const { error } = await supabase.from("iso_status").upsert({ user_id: userId, card_key: isoCardKey, status: newStatus }, { onConflict: "user_id,card_key" });
            if (error)
                throw error;
            const aliases = isoCardKeys.filter(key => key !== isoCardKey);
            if (aliases.length) {
                const { error: cleanupError } = await supabase.from("iso_status").delete().eq("user_id", userId).in("card_key", aliases);
                if (cleanupError)
                    throw cleanupError;
            }
            emitStatus(newStatus);
        });
    }
    async function markComplete() {
        await perform(async () => {
            const entry = resolveISOCard(setId, cardKey);
            if (entry?.family === "merch") {
                const { error } = await supabase.rpc("set_english_merchandise_owned", { p_key: entry.stateKey, p_owned: true });
                if (error) throw error;
            } else {
            const { data, error: readError } = await supabase.from("collection_progress_raw").select("progress").eq("user_id", userId).eq("set_id", setId).maybeSingle();
            if (readError)
                throw readError;
            const progressKey = resolveISOCard(setId, cardKey)?.stateKey ?? cardKey;
            const progress = { ...(data?.progress ?? {}), [progressKey]: true };
            const { error } = await supabase.from("collection_progress_raw").upsert({ user_id: userId, set_id: setId, progress }, { onConflict: "user_id,set_id" });
            if (error)
                throw error;
            }
            const { error: statusError } = await supabase.from("iso_status").delete().eq("user_id", userId).in("card_key", isoCardKeys);
            if (statusError)
                throw statusError;
            emitStatus(null);
            onComplete?.();
            window.dispatchEvent(new CustomEvent("iso-collection-changed", { detail: { userId, setId, cardKey } }));
        });
    }
    async function removeStatus() {
        await perform(async () => {
            const { error } = await supabase.from("iso_status").delete().eq("user_id", userId).in("card_key", isoCardKeys);
            if (error)
                throw error;
            emitStatus(null);
        });
    }
    return (<div className={`relative inline-block w-full ${open ? "z-[60]" : ""} ${className ?? ""}`} ref={menuRef}>
      <div className={`relative cursor-pointer overflow-hidden rounded-[6px] transition sm:rounded-xl ${contentClassName ?? ""} ${open ? "ring-2 ring-[#FFD54A]/50 shadow-lg" : ""}`} style={contentStyle} data-iso-tour="card" role="button" tabIndex={0} aria-label={`Update ${cardCode}`} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)} onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setOpen(true);
            }
        }}>
        {children}
        {isWishlisted && (<div className="pointer-events-none absolute bottom-2 right-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-pink-500 shadow-sm backdrop-blur dark:bg-black/70">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="block h-4 w-4 fill-current">
              <path d="M12 21s-7.2-4.35-9.55-8.42C.58 9.34 2.08 5.25 5.85 4.38 8.02 3.88 10.08 4.7 12 6.8c1.92-2.1 3.98-2.92 6.15-2.42 3.77.87 5.27 4.96 3.4 8.2C19.2 16.65 12 21 12 21Z"/>
            </svg>
          </div>)}
        {status === "purchase_in_progress" && (<div className="pointer-events-none absolute bottom-2 left-2 z-20 rounded-full bg-red-500/90 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm backdrop-blur">
            Buying
          </div>)}
        {status === "trade_in_progress" && (<div className="pointer-events-none absolute bottom-2 left-2 z-20 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm backdrop-blur">
            Trading For
          </div>)}
      </div>
      <ISOCardActionDialog open={open} onOpenChange={setOpen} code={cardCode} setName={setName} busy={loading} image={<div className={contentClassName} style={contentStyle}>{children}</div>}>
        <ISOActionButtons status={status} wishlisted={isWishlisted} owned={owned} wishlistOnly={wishlistMode} busy={loading} onStatus={value => void saveStatus(value)} onComplete={() => void markComplete()} onClear={() => void removeStatus()} onWishlist={toggleWishlist ? () => { void perform(async () => { await toggleWishlist(setId, cardKey); window.dispatchEvent(new CustomEvent("iso-wishlist-changed", { detail: { userId, setId, cardKey } })); setOpen(false); }); } : undefined}/>
        {actionError && <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">{actionError}</p>}
        {loading && <p role="status" className="mt-2 text-xs text-muted-foreground">Saving...</p>}
      </ISOCardActionDialog>
    </div>);
}
