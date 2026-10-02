import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase";
import { getISOCardCode, getISOSetName } from "@/lib/iso-card-catalog";
type Status =
  | "purchase_in_progress"
  | "trade_in_progress";
interface ISOCheckingProps {
  className?: string;
  contentClassName?: string;
  contentStyle?: CSSProperties;
  userId: string;
  setId: string;
  cardKey: string;
  children: React.ReactNode;
  wishlistMode?: boolean;
  isWishlisted?: boolean;
  toggleWishlist?: (setId: string, cardKey: string) => Promise<void>;
  onStatusChange?: (status: Status | null) => void;
  onComplete?: () => void;
}
export default function ISOChecking({
  className,
  contentClassName,
  contentStyle,
  userId,
  setId,
  cardKey,
  children,
  wishlistMode = false,
  isWishlisted = false,
  toggleWishlist,
  onStatusChange,
  onComplete,
}: ISOCheckingProps) {
const [open, setOpen] = useState(false);
const [loading, setLoading] = useState(false);
const [status, setStatus] = useState<Status | null>(null);

const isoCardKey =
    setId === "FW" || setId === "SD"
      ? cardKey
      : `${setId}-${cardKey}`;
const menuRef = useRef<HTMLDivElement>(null);
const menuPanelRef = useRef<HTMLDivElement>(null);
const cardCode = getISOCardCode(setId, cardKey);
const setName = getISOSetName(setId);
useEffect(() => {
  if (!open) return;
  const previouslyFocused = document.activeElement as HTMLElement | null;
  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  menuPanelRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && !loading) setOpen(false);
    if (event.key !== "Tab") return;
    const controls = Array.from(menuPanelRef.current?.querySelectorAll<HTMLElement>("button:not(:disabled), [href], input:not(:disabled), [tabindex='0']") ?? []);
    if (!controls.length) {
      event.preventDefault();
      menuPanelRef.current?.focus();
      return;
    }
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === menuPanelRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  document.addEventListener("keydown", handleKeyDown);
  return () => {
    document.body.style.overflow = previousOverflow;
    document.removeEventListener("keydown", handleKeyDown);
    previouslyFocused?.focus();
  };
}, [open, loading]);
  useEffect(() => {
async function loadStatus() {
      if (!userId) return;
const { data } = await supabase
        .from("iso_status")
        .select("status")
        .eq("user_id", userId)
        .eq("card_key", isoCardKey)
        .maybeSingle();
      if (
        data?.status === "purchase_in_progress" ||
        data?.status === "trade_in_progress"
      ) {
        setStatus(data.status);
      } else {
        setStatus(null);
      }
    }
    loadStatus();
  }, [userId, cardKey, isoCardKey]);
async function saveStatus(newStatus: Status) {
    if (loading) return;
    setLoading(true);
    if (status === newStatus) {
const { error } = await supabase
        .from("iso_status")
        .delete()
        .eq("user_id", userId)
        .eq("card_key", isoCardKey);
      setLoading(false);
      if (error) {
        console.error(error);
        return;
      }
      setStatus(null);
      setOpen(false);
      onStatusChange?.(null);
      return;
    }
const { error } = await supabase
      .from("iso_status")
      .upsert(
        {
          user_id: userId,
          card_key: isoCardKey,
          status: newStatus,
        },
        {
          onConflict: "user_id,card_key",
        }
      );
    setLoading(false);
    if (error) {
      console.error(error);
      return;
    }
    setStatus(newStatus);
    setOpen(false);
    onStatusChange?.(newStatus);
  }
async function markComplete() {
    if (loading) return;
    setLoading(true);
    await supabase
      .from("iso_status")
      .delete()
      .eq("user_id", userId)
      .eq("card_key", isoCardKey);
const { data } = await supabase
      .from("collection_progress_raw")
      .select("progress")
      .eq("user_id", userId)
      .eq("set_id", setId)
      .single();
const progress = data?.progress || {};
const progressKey = cardKey;
    progress[progressKey] = true;
const { error } = await supabase
      .from("collection_progress_raw")
      .upsert(
        {
          user_id: userId,
          set_id: setId,
          progress,
        },
        {
          onConflict: "user_id,set_id",
        }
      );
    setLoading(false);
    if (error) {
      console.error(error);
      return;
    }
    setStatus(null);
    setOpen(false);
    onStatusChange?.(null);
    onComplete?.();
  }
async function removeStatus() {
    if (loading) return;
    setLoading(true);
const { error } = await supabase
      .from("iso_status")
      .delete()
      .eq("user_id", userId)
      .eq("card_key", isoCardKey);
    setLoading(false);
    if (error) {
      console.error(error);
      return;
    }
    setStatus(null);
    setOpen(false);
    onStatusChange?.(null);
  }
  return (
    <div
      className={`relative inline-block w-full ${open ? "z-[60]" : ""} ${className ?? ""}`}
      ref={menuRef}
    >
      <div
        className={`relative cursor-pointer overflow-hidden rounded-[6px] transition sm:rounded-xl ${contentClassName ?? ""} ${open ? "ring-2 ring-[#FFD54A]/50 shadow-lg" : ""}`}
        style={contentStyle}
        role="button"
        tabIndex={0}
        aria-label={`Update ${cardCode}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        {children}
        {isWishlisted && (
          <div className="pointer-events-none absolute bottom-2 right-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-pink-500 shadow-sm backdrop-blur dark:bg-black/70">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="block h-4 w-4 fill-current">
              <path d="M12 21s-7.2-4.35-9.55-8.42C.58 9.34 2.08 5.25 5.85 4.38 8.02 3.88 10.08 4.7 12 6.8c1.92-2.1 3.98-2.92 6.15-2.42 3.77.87 5.27 4.96 3.4 8.2C19.2 16.65 12 21 12 21Z" />
            </svg>
          </div>
        )}
        {status === "purchase_in_progress" && (
          <div className="pointer-events-none absolute bottom-2 left-2 z-20 rounded-full bg-red-500/90 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm backdrop-blur">
            Buying
          </div>
        )}
        {status === "trade_in_progress" && (
          <div className="pointer-events-none absolute bottom-2 left-2 z-20 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm backdrop-blur">
            Trading For
          </div>
        )}
      </div>
      {open && createPortal(
        <div
          className="fixed inset-0 z-[999999] flex items-center justify-center overflow-y-auto bg-zinc-950/65 p-3 backdrop-blur-sm sm:p-6"
          onClick={(event) => {
            if (event.target === event.currentTarget && !loading) setOpen(false);
          }}
        >
          <div
            ref={menuPanelRef}
            role="dialog"
            aria-modal="true"
            aria-label={`${wishlistMode ? "Wishlist" : "Card status"}: ${cardCode}`}
            aria-busy={loading}
            tabIndex={-1}
            className="relative max-h-[calc(100dvh-24px)] w-full max-w-[640px] overflow-y-auto overscroll-contain rounded-3xl border border-black/10 bg-white text-zinc-900 shadow-2xl outline-none dark:border-white/10 dark:bg-[#17191a] dark:text-zinc-100 sm:max-h-[calc(100dvh-48px)]"
          >
            <div className="flex items-start justify-between gap-3 border-b border-black/[0.06] px-4 py-3 dark:border-white/[0.08] sm:px-5 sm:py-4">
              <div className="min-w-0">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{setName}</p>
                <h2 className="mt-1 break-words text-base font-semibold sm:text-lg">{cardCode}</h2>
              </div>
              <button type="button" aria-label="Close card popup" disabled={loading} onClick={() => setOpen(false)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xl text-zinc-600 transition hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD54A] disabled:opacity-50 dark:bg-white/[0.07] dark:text-zinc-300 dark:hover:bg-white/[0.12]">&times;</button>
            </div>
            <div className="grid items-start gap-3 p-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-5 sm:p-5">
              <div className="flex min-w-0 items-start justify-center self-start">
                <div className={`pointer-events-none w-[min(180px,24dvh)] overflow-hidden rounded-md shadow-lg [&>*]:w-full sm:w-full ${contentClassName ?? ""}`} style={contentStyle} aria-hidden="true">
                  {children}
                </div>
              </div>
              <div className="flex min-w-0 flex-col">
                <h3 className="mb-2 text-sm font-semibold sm:mb-0">{wishlistMode ? "Wishlist" : "Update card status"}</h3>
                <p className="mb-3 mt-1 hidden text-xs leading-5 sm:block text-zinc-500 dark:text-zinc-400">
                  {wishlistMode ? "Keep track of the cards you want." : status === "purchase_in_progress" ? "Purchase in progress" : status === "trade_in_progress" ? "Trade in progress" : "Choose how you are getting this card."}
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
                  {!wishlistMode && (
                    <>
                      {(["purchase_in_progress", "trade_in_progress"] as const).map((option) => (
                        <button key={option} type="button" onClick={() => saveStatus(option)} disabled={loading} aria-pressed={status === option} className={`flex min-h-12 min-w-0 w-full items-center gap-2 rounded-xl border px-2.5 py-2.5 sm:min-h-14 sm:gap-3 sm:px-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD54A] disabled:cursor-wait disabled:opacity-50 ${status === option ? "border-[#FFD54A]/70 bg-[#FFD54A]/15 dark:bg-[#FFD54A]/10" : "border-black/[0.08] bg-white hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.07]"}`}>
                          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${option === "purchase_in_progress" ? "bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300"}`}>
                            {option === "purchase_in_progress" ? <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M6 7h12l2 14H4L6 7Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg> : <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 7h15m-4-4 4 4-4 4M20 17H5m4-4-4 4 4 4" /></svg>}
                          </span>
                          <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{option === "purchase_in_progress" ? "Buying" : "Trading"}</span><span className="mt-0.5 hidden text-xs text-zinc-500 dark:text-zinc-400 sm:block">{status === option ? "Selected - tap to clear" : option === "purchase_in_progress" ? "Purchase in progress" : "Trade in progress"}</span></span>
                          {status === option && <span className="text-sm" aria-hidden="true">&#10003;</span>}
                        </button>
                      ))}
                      <button type="button" onClick={markComplete} disabled={loading} className="col-span-2 flex min-h-11 w-full items-center justify-between gap-2 sm:col-span-1 sm:min-h-12 rounded-xl bg-[#FFD54A] px-3 py-3 text-sm font-semibold text-zinc-900 transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-50"><span>Mark complete</span><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg></button>
                    </>
                  )}
                  {toggleWishlist && <button type="button" disabled={loading} onClick={async () => { if (loading) return; setLoading(true); try { await toggleWishlist(setId, cardKey); setOpen(false); } finally { setLoading(false); } }} className="col-span-2 flex min-h-11 w-full items-center justify-center gap-2 sm:col-span-1 rounded-xl border border-black/[0.08] px-3 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-pink-50 hover:text-pink-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 disabled:cursor-wait disabled:opacity-50 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-pink-400/10 dark:hover:text-pink-300"><svg className={`h-4 w-4 ${isWishlisted ? "fill-pink-500 stroke-pink-500" : "fill-none stroke-current"}`} viewBox="0 0 24 24" strokeWidth="1.8" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" /></svg>{isWishlisted ? "Remove from wishlist" : "Add to wishlist"}</button>}
                  {!wishlistMode && status && <button type="button" disabled={loading} onClick={removeStatus} className="col-span-2 min-h-10 w-full rounded-lg sm:col-span-1 text-xs font-medium text-zinc-500 transition hover:text-zinc-900 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-white">Clear in-progress status</button>}
                </div>
                {loading && <p role="status" className="mt-3 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400"><span className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700 motion-reduce:animate-none dark:border-zinc-600 dark:border-t-zinc-200" aria-hidden="true" />Saving...</p>}
              </div>
            </div>
          </div>
        </div>, document.body
      )}
    </div>
  );
}