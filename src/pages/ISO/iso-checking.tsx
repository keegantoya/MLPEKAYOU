import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase";
import { useWishlist } from "./wishlist-in-iso";
type Status =
  | "purchase_in_progress"
  | "trade_in_progress";
interface ISOCheckingProps {
  className?: string;
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
const [openAbove, setOpenAbove] = useState(false);
const isoCardKey =
    setId === "FW" || setId === "SD"
      ? cardKey
      : `${setId}-${cardKey}`;
const [menuPosition, setMenuPosition] = useState<
    "left" | "center" | "right"
  >("center");
const [menuCoords, setMenuCoords] = useState({
    top: 0,
    left: 0,
  });
const menuRef = useRef<HTMLDivElement>(null);
const menuPanelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
function handleClick(e: MouseEvent) {
const target = e.target as Node;
      if (
        menuRef.current?.contains(target) ||
        menuPanelRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);
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
        className={`relative cursor-pointer overflow-hidden rounded-xl transition ${open ? "ring-2 ring-[#FFD54A]/50 shadow-lg" : ""}`}
        onClick={(e) => {
const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
const menuHeight = wishlistMode ? 170 : toggleWishlist ? 380 : 300;
const menuWidth = 300;
const gap = 10;
const padding = 12;
const shouldOpenAbove = rect.bottom + menuHeight + gap > window.innerHeight;
const top = shouldOpenAbove
            ? Math.max(padding, rect.top - menuHeight - gap)
            : Math.min(window.innerHeight - menuHeight - padding, rect.bottom + gap);
const centerX = rect.left + rect.width / 2;
let left: number;
          if (centerX < menuWidth / 2 + padding) {
            left = padding;
            setMenuPosition("left");
          } else if (centerX > window.innerWidth - menuWidth / 2 - padding) {
            left = window.innerWidth - menuWidth - padding;
            setMenuPosition("right");
          } else {
            left = centerX - menuWidth / 2;
            setMenuPosition("center");
          }
          setOpenAbove(shouldOpenAbove);
          setMenuCoords({ top, left });
          setOpen((v) => !v);
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
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[999990] bg-black/25 backdrop-blur-[1px]"
            onMouseDown={() => setOpen(false)}
          />,
          document.body
        )}
      {open &&
        createPortal(
          <div
            ref={menuPanelRef}
            className="fixed z-[999999] w-[300px] overflow-hidden rounded-[22px] border border-black/10 bg-[#f5f5f7] p-2 text-zinc-900 shadow-2xl dark:border-white/10 dark:bg-[#1c1c1e] dark:text-white"
            style={{
              top: `${menuCoords.top}px`,
              left: `${menuCoords.left}px`,
            }}
          >
            {wishlistMode ? (
              <>
                <div className="px-3 pb-2 pt-2">
                  <div className="text-[15px] font-semibold">Wishlist</div>
                  <div className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                    {isWishlisted ? "This card is on your wishlist." : "Add this card to your wishlist."}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (toggleWishlist) {
                      await toggleWishlist(setId, cardKey);
                    }
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-2xl bg-white px-3.5 py-3 text-left text-[15px] font-semibold shadow-sm transition hover:bg-zinc-50 dark:bg-white/[0.07] dark:hover:bg-white/[0.1]"
                >
                  <span>{isWishlisted ? "Remove from wishlist" : "Add to wishlist"}</span>
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full ${isWishlisted ? "bg-pink-50 text-pink-500 dark:bg-pink-400/10" : "bg-zinc-100 text-zinc-500 dark:bg-white/[0.08] dark:text-zinc-300"}`}>
                    <svg viewBox="0 0 24 24" aria-hidden="true" className={`block h-[18px] w-[18px] ${isWishlisted ? "fill-current" : "fill-none stroke-current"}`}>
                      <path d="M12 21s-7.2-4.35-9.55-8.42C.58 9.34 2.08 5.25 5.85 4.38 8.02 3.88 10.08 4.7 12 6.8c1.92-2.1 3.98-2.92 6.15-2.42 3.77.87 5.27 4.96 3.4 8.2C19.2 16.65 12 21 12 21Z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>
              </>
            ) : (
              <>
                <div className="px-3 pb-2 pt-2">
                  <div className="text-[15px] font-semibold">Card status</div>
                  <div className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                    Update what is happening with this card.
                  </div>
                </div>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => saveStatus("purchase_in_progress")}
                    disabled={loading}
                    className={`flex w-full items-center justify-between rounded-2xl px-3.5 py-3 text-left transition ${
                      status === "purchase_in_progress"
                        ? "bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-300"
                        : "bg-white text-zinc-700 hover:bg-zinc-50 dark:bg-white/[0.07] dark:text-zinc-200 dark:hover:bg-white/[0.1]"
                    }`}
                  >
                    <div>
                      <div className="text-[15px] font-semibold">Buying</div>
                      <div className="mt-0.5 text-sm opacity-70">{status === "purchase_in_progress" ? "Tap again to clear" : "Purchase in progress"}</div>
                    </div>
                    <span className="text-lg">›</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => saveStatus("trade_in_progress")}
                    disabled={loading}
                    className={`flex w-full items-center justify-between rounded-2xl px-3.5 py-3 text-left transition ${
                      status === "trade_in_progress"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"
                        : "bg-white text-zinc-700 hover:bg-zinc-50 dark:bg-white/[0.07] dark:text-zinc-200 dark:hover:bg-white/[0.1]"
                    }`}
                  >
                    <div>
                      <div className="text-[15px] font-semibold">Trading</div>
                      <div className="mt-0.5 text-sm opacity-70">{status === "trade_in_progress" ? "Tap again to clear" : "Trade in progress"}</div>
                    </div>
                    <span className="text-lg">›</span>
                  </button>
                  <button
                    type="button"
                    onClick={markComplete}
                    disabled={loading}
                    className="flex w-full items-center justify-between rounded-2xl bg-[#FFD54A] px-3.5 py-3 text-left text-zinc-900 transition hover:brightness-95"
                  >
                    <div>
                      <div className="text-[15px] font-semibold">Mark complete</div>
                      <div className="mt-0.5 text-sm text-zinc-700">Move this card into your collection</div>
                    </div>
                    <span className="text-lg">✓</span>
                  </button>
                  {toggleWishlist && (
                    <button
                      type="button"
                      onClick={async () => {
                        await toggleWishlist(setId, cardKey);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-2xl px-3.5 py-3 text-left transition ${isWishlisted ? "bg-pink-50 text-pink-700 hover:bg-pink-100 dark:bg-pink-400/10 dark:text-pink-300 dark:hover:bg-pink-400/15" : "bg-white text-zinc-700 hover:bg-zinc-50 dark:bg-white/[0.07] dark:text-zinc-200 dark:hover:bg-white/[0.1]"}`}
                    >
                      <div>
                        <div className="text-[15px] font-semibold">{isWishlisted ? "Remove from wishlist" : "Add to wishlist"}</div>
                        <div className="mt-0.5 text-sm opacity-70">{isWishlisted ? "Take this card off your wishlist" : "Save this card to your wishlist"}</div>
                      </div>
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full ${isWishlisted ? "bg-white/70 text-pink-500 dark:bg-white/[0.08]" : "bg-zinc-100 text-zinc-500 dark:bg-white/[0.08] dark:text-zinc-300"}`}>
                        <svg viewBox="0 0 24 24" aria-hidden="true" className={`block h-[18px] w-[18px] ${isWishlisted ? "fill-current" : "fill-none stroke-current"}`}>
                          <path d="M12 21s-7.2-4.35-9.55-8.42C.58 9.34 2.08 5.25 5.85 4.38 8.02 3.88 10.08 4.7 12 6.8c1.92-2.1 3.98-2.92 6.15-2.42 3.77.87 5.27 4.96 3.4 8.2C19.2 16.65 12 21 12 21Z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
