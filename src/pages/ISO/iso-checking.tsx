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
  }, [userId, cardKey]);


  async function saveStatus(
    newStatus: Status
  ) {
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

    // Remove trade/purchase status
await supabase
  .from("iso_status")
  .delete()
  .eq("user_id", userId)
  .eq("card_key", isoCardKey);


    // Load existing collection progress
    const { data } = await supabase
      .from("collection_progress_raw")
      .select("progress")
      .eq("user_id", userId)
      .eq("set_id", setId)
      .single();


    const progress =
      data?.progress || {};


    let progressKey = cardKey;

if (setId === "SD") {
  progressKey = `BONUS-${cardKey}`;
}

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
onComplete?.();
  }


  return (
<div
  className={`relative inline-block w-full transition-opacity duration-200 ${
    open ? "z-[60]" : ""
  } ${className ?? ""}`}
  ref={menuRef}
>
<div
  className={`relative cursor-pointer overflow-hidden rounded-lg transition-all duration-200 ${
    open
      ? "z-50 shadow-[0_12px_32px_rgba(0,0,0,0.6)]"
      : ""
  }`}
  onClick={(e) => {
  const rect = (
    e.currentTarget as HTMLDivElement
  ).getBoundingClientRect();

const menuHeight = wishlistMode ? 220 : 430;
const menuWidth = 320;
const gap = 12;
const padding = 12;

  const openAbove =
    rect.bottom + menuHeight + gap > window.innerHeight;

  const top = openAbove
    ? Math.max(padding, rect.top - menuHeight - gap)
    : Math.min(
        window.innerHeight - menuHeight - padding,
        rect.bottom + gap
      );

  const centerX = rect.left + rect.width / 2;

  let left: number;

  if (centerX < menuWidth / 2 + padding) {
    left = padding;
    setMenuPosition("left");
  } else if (
    centerX >
    window.innerWidth - menuWidth / 2 - padding
  ) {
    left = window.innerWidth - menuWidth - padding;
    setMenuPosition("right");
  } else {
    left = centerX - menuWidth / 2;
    setMenuPosition("center");
  }

  setOpenAbove(openAbove);
  setMenuCoords({
    top,
    left,
  });

  setOpen((v) => !v);
}}
      >
        {children}

        {isWishlisted && (
  <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-lg">
    {/* Pink HUD tint */}
    <div className="absolute inset-0 bg-pink-500/[0.10]" />

    {/* Scanline grid */}
    <div
      className="absolute inset-0 opacity-40"
      style={{
        backgroundImage:
          "linear-gradient(rgba(244,114,182,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(244,114,182,0.22) 1px, transparent 1px)",
        backgroundSize: "14px 14px",
      }}
    />

    {/* Stark-style scan beam */}
    <div className="absolute left-0 right-0 top-1/2 h-px bg-pink-300/80 shadow-[0_0_12px_rgba(244,114,182,0.95)]" />

    {/* Top HUD bar */}
    <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent shadow-[0_0_12px_rgba(244,114,182,0.9)]" />

    {/* Bottom HUD glow */}
    <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-pink-500/25 to-transparent" />

    {/* Wishlist indicator */}
<div className="absolute right-1 top-1 border border-pink-300/70 bg-[#160d14]/90 px-1 py-0.5 shadow-[0_0_10px_rgba(244,114,182,0.4)] backdrop-blur-sm">
  <span className="font-oxanium text-[5px] font-bold uppercase tracking-[0.12em] text-pink-300 md:text-[7px] md:tracking-[0.18em]">
    WISHLIST
  </span>
</div>

    {/* Corner brackets */}
    <div className="absolute left-1.5 top-1.5 h-3 w-3 border-l border-t border-pink-300/80" />
    <div className="absolute bottom-1.5 left-1.5 h-3 w-3 border-b border-l border-pink-300/80" />
    <div className="absolute right-1.5 bottom-1.5 h-3 w-3 border-b border-r border-pink-300/80" />
  </div>
)}


{status === "purchase_in_progress" && (
  <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 overflow-hidden rounded-b-lg border-t border-red-400/70 bg-[#160b0b]/95 shadow-[0_-3px_12px_rgba(239,68,68,0.2)]">
    <div className="absolute inset-0 opacity-15 bg-[repeating-linear-gradient(135deg,rgba(248,113,113,0.8)_0px,rgba(248,113,113,0.8)_2px,transparent_2px,transparent_7px)]" />

    <div className="relative flex items-center gap-1.5 px-1.5 py-1 md:gap-2 md:px-2.5 md:py-1.5">
      <div className="flex h-4 w-4 shrink-0 items-center justify-center border border-red-400/60 bg-red-500/10 text-[8px] font-bold text-red-300 md:h-5 md:w-5 md:text-[10px]">
        $
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate font-oxanium text-[5px] font-bold uppercase tracking-[0.08em] text-red-300 md:text-[9px] md:tracking-[0.14em]">
          PURCHASE
        </div>
        <div className="hidden font-mono text-[7px] uppercase tracking-[0.08em] text-red-200/40 md:block">
          ACQUISITION ACTIVE
        </div>
      </div>

      <div className="flex shrink-0 gap-0.5">
        <span className="h-1 w-1 bg-red-400 shadow-[0_0_4px_rgba(248,113,113,0.9)]" />
        <span className="h-1 w-1 bg-red-400/50" />
        <span className="h-1 w-1 bg-red-400/20" />
      </div>
    </div>
  </div>
)}

{status === "trade_in_progress" && (
  <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 overflow-hidden rounded-b-lg border-t border-emerald-400/70 bg-[#071510]/95 shadow-[0_-3px_12px_rgba(16,185,129,0.2)]">
    <div
      className="absolute inset-0 opacity-15"
      style={{
        backgroundImage:
          "linear-gradient(90deg,rgba(52,211,153,0.5) 1px,transparent 1px),linear-gradient(rgba(52,211,153,0.5) 1px,transparent 1px)",
        backgroundSize: "7px 7px",
      }}
    />

    <div className="relative flex items-center gap-1.5 px-1.5 py-1 md:gap-2 md:px-2.5 md:py-1.5">
      <div className="flex h-4 w-4 shrink-0 items-center justify-center border border-emerald-400/60 bg-emerald-500/10 text-[9px] font-bold text-emerald-300 md:h-5 md:w-5 md:text-[11px]">
        ⇄
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate font-oxanium text-[5px] font-bold uppercase tracking-[0.08em] text-emerald-300 md:text-[9px] md:tracking-[0.14em]">
          TRADE
        </div>
        <div className="hidden font-mono text-[7px] uppercase tracking-[0.08em] text-emerald-200/40 md:block">
          EXCHANGE ACTIVE
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-0.5 text-emerald-400">
        <span className="text-[6px]">←</span>
        <span className="h-px w-2 bg-emerald-400/70 md:w-3" />
        <span className="text-[6px]">→</span>
      </div>
    </div>
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
      className="fixed z-[999999] w-72 rounded-2xl border border-[#4a4a4a] bg-[#1b1b1b] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.85)]"
      style={{
        top: `${menuCoords.top}px`,
        left: `${menuCoords.left}px`,
      }}
    >
{wishlistMode ? (
  <>
    {/* WISHLIST HEADER */}
    <div className="mb-3 border-b border-[#34343a] pb-3">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 shrink-0 bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.8)]" />

        <span className="font-oxanium text-[10px] font-bold uppercase tracking-[0.22em] text-pink-400">
          Wishlist Control
        </span>

        <span className="ml-auto font-mono text-[7px] uppercase tracking-[0.16em] text-zinc-600">
          ISO DATABASE
        </span>
      </div>

      <div className="mt-2 font-mono text-[8px] uppercase tracking-[0.1em] text-zinc-500">
        {isWishlisted
          ? "CARD CURRENTLY ON WISHLIST"
          : "CARD NOT CURRENTLY WISHLISTED"}
      </div>
    </div>

    {isWishlisted ? (
      <button
        onClick={async () => {
          if (toggleWishlist) {
            await toggleWishlist(setId, cardKey);
          }

          setOpen(false);
        }}
        className="group w-full overflow-hidden border border-pink-500/30 bg-[#111518] px-4 py-3 text-left transition-all duration-200 hover:border-pink-400 hover:bg-pink-500/[0.06] hover:shadow-[0_0_20px_rgba(236,72,153,0.10)]"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-pink-500/30 bg-pink-500/[0.06] font-mono text-[13px] text-pink-400 transition-all group-hover:border-pink-400/60 group-hover:bg-pink-500/10">
            −
          </span>

          <div className="min-w-0">
            <div className="font-oxanium text-[10px] font-bold uppercase tracking-[0.12em] text-pink-400">
              Remove From Wishlist
            </div>

            <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.08em] text-zinc-500">
              No longer want this card
            </div>
          </div>

          <span className="ml-auto text-pink-500/40 transition-all group-hover:translate-x-0.5 group-hover:text-pink-400">
            →
          </span>
        </div>
      </button>
    ) : (
      <button
        onClick={async () => {
          if (toggleWishlist) {
            await toggleWishlist(setId, cardKey);
          }

          setOpen(false);
        }}
        className="group w-full overflow-hidden border border-pink-500/30 bg-[#111518] px-4 py-3 text-left transition-all duration-200 hover:border-pink-400 hover:bg-pink-500/[0.06] hover:shadow-[0_0_20px_rgba(236,72,153,0.10)]"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-pink-500/30 bg-pink-500/[0.06] font-mono text-[13px] text-pink-400 transition-all group-hover:border-pink-400/60 group-hover:bg-pink-500/10">
            +
          </span>

          <div className="min-w-0">
            <div className="font-oxanium text-[10px] font-bold uppercase tracking-[0.12em] text-pink-400">
              Add To Wishlist
            </div>

            <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.08em] text-zinc-500">
              Add this card to your public wishlist
            </div>
          </div>

          <span className="ml-auto text-pink-500/40 transition-all group-hover:translate-x-0.5 group-hover:text-pink-400">
            →
          </span>
        </div>
      </button>
    )}
  </>
) : (
        <>
          <div className="mb-3 border-b border-zinc-700 pb-2 text-center">
            <div className="text-sm font-bold uppercase tracking-[0.15em] text-[#d4af37]">
              Card Status
            </div>
          </div>

          <div className="mb-3 flex items-center gap-2 border-b border-[#30363a] pb-2">
            <span className="h-1.5 w-1.5 bg-yellow-400 shadow-[0_0_8px_#facc15]" />

            <span className="font-oxanium text-[9px] font-bold uppercase tracking-[0.22em] text-yellow-400">
              Card Status
            </span>

            <span className="ml-auto font-mono text-[7px] uppercase tracking-[0.15em] text-zinc-600">
              ISO CONTROL
            </span>
          </div>

          <button
            onClick={() => saveStatus("purchase_in_progress")}
            className="group mb-2 w-full overflow-hidden border border-red-500/30 bg-[#111518] px-4 py-3 text-left transition-all duration-200 hover:border-red-400 hover:bg-red-500/[0.06] hover:shadow-[0_0_18px_rgba(239,68,68,0.08)]"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-red-500/30 bg-red-500/[0.06] font-mono text-[11px] text-red-400 transition-all group-hover:border-red-400/60 group-hover:bg-red-500/10">
                $
              </span>

              <div className="min-w-0">
                <div className="font-oxanium text-[10px] font-bold uppercase tracking-[0.12em] text-red-400">
                  Purchase In Progress
                </div>

                <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.08em] text-zinc-500">
                  Currently acquiring this card
                </div>
              </div>

              <span className="ml-auto text-red-500/40 transition-all group-hover:translate-x-0.5 group-hover:text-red-400">
                →
              </span>
            </div>
          </button>

          <button
            onClick={() => saveStatus("trade_in_progress")}
            className="group mb-2 w-full overflow-hidden border border-emerald-500/30 bg-[#111518] px-4 py-3 text-left transition-all duration-200 hover:border-emerald-400 hover:bg-emerald-500/[0.06] hover:shadow-[0_0_18px_rgba(16,185,129,0.08)]"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-emerald-500/30 bg-emerald-500/[0.06] font-mono text-[11px] text-emerald-400 transition-all group-hover:border-emerald-400/60 group-hover:bg-emerald-500/10">
                ⇄
              </span>

              <div className="min-w-0">
                <div className="font-oxanium text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-400">
                  Trade In Progress
                </div>

                <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.08em] text-zinc-500">
                  Currently trading for this card
                </div>
              </div>

              <span className="ml-auto text-emerald-500/40 transition-all group-hover:translate-x-0.5 group-hover:text-emerald-400">
                →
              </span>
            </div>
          </button>

          <button
            onClick={markComplete}
            className="group w-full overflow-hidden border border-yellow-400/30 bg-[#111518] px-4 py-3 text-left transition-all duration-200 hover:border-yellow-400 hover:bg-yellow-400/[0.05] hover:shadow-[0_0_18px_rgba(250,204,21,0.08)]"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-yellow-400/30 bg-yellow-400/[0.06] font-mono text-[11px] text-yellow-400 transition-all group-hover:border-yellow-400/60 group-hover:bg-yellow-400/10">
                ✓
              </span>

              <div className="min-w-0">
                <div className="font-oxanium text-[10px] font-bold uppercase tracking-[0.12em] text-yellow-400">
                  Mark as Complete
                </div>

                <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.08em] text-zinc-500">
                  Remove card from ISO
                </div>
              </div>

              <span className="ml-auto text-yellow-500/40 transition-all group-hover:translate-x-0.5 group-hover:text-yellow-400">
                →
              </span>
            </div>
          </button>
        </>
      )}
    </div>,
    document.body
  )}
    </div>
  );
}