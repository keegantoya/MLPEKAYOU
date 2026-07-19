import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type Status =
  | "purchase_in_progress"
  | "trade_in_progress";

interface ISOCheckingProps {
  className?: string;
  userId: string;
  setId: string;
  cardKey: string;
  children: React.ReactNode;
  onStatusChange?: (status: Status | null) => void;
  onComplete?: () => void;
}

export default function ISOChecking({
  className,
  userId,
  setId,
  cardKey,
  children,
  onStatusChange,
  onComplete,
}: ISOCheckingProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const [openAbove, setOpenAbove] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
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
        .eq("card_key", `${setId}-${cardKey}`)
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
    .eq("card_key", `${setId}-${cardKey}`);

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
          card_key: `${setId}-${cardKey}`,
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
      .eq("card_key", `${setId}-${cardKey}`);


    // Load existing collection progress
    const { data } = await supabase
      .from("collection_progress_raw")
      .select("progress")
      .eq("user_id", userId)
      .eq("set_id", setId)
      .single();


    const progress =
      data?.progress || {};


    progress[cardKey] = true;


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
      .eq("card_key", `${setId}-${cardKey}`);

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
className={`relative cursor-pointer transition-all duration-200 ${
  open
  ? "z-50 scale-[1.01] -translate-y-2 shadow-[0_12px_32px_rgba(0,0,0,0.6)]"
  : ""
}`}
        onClick={(e) => {
  const rect = (
    e.currentTarget as HTMLDivElement
  ).getBoundingClientRect();

  const menuHeight = 185;

  const spaceBelow =
    window.innerHeight - rect.bottom;

  setOpenAbove(spaceBelow < menuHeight);
  setOpen((v) => !v);
}}
      >
        {children}


{status === "purchase_in_progress" && (
  <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-red-600/90 py-1 text-center text-[11px] font-semibold text-white pointer-events-none">
    Purchase In Progress
  </div>
)}

{status === "trade_in_progress" && (
  <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-green-700/90 py-1 text-center text-[11px] font-semibold text-white pointer-events-none">
    Trade In Progress
  </div>
)}
      </div>


{open && (
  <div
    className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[1px]"
    onClick={() => setOpen(false)}
  />
)}

{open && (
  <div
    className={`absolute left-1/2 z-[60]  w-72 -translate-x-1/2 rounded-2xl border border-[#4a4a4a] bg-[#1b1b1b] p-3 shadow-2xl ${
      openAbove
        ? "bottom-full mb-3"
        : "top-full mt-3"
    }`}
  >
    <div className="mb-3 border-b border-zinc-700 pb-2 text-center">
      <div className="text-sm font-bold uppercase tracking-[0.15em] text-[#d4af37]">
        Card Status
      </div>
    </div>

    <button
      onClick={() => saveStatus("purchase_in_progress")}
      className="mb-2 w-full rounded-xl border border-red-700/40 bg-[#242424] px-4 py-3 text-left transition hover:border-red-500 hover:bg-red-900/20"
    >
      <div className="font-semibold text-white">
        Purchase In Progress
      </div>
      <div className="mt-1 text-xs text-zinc-400">
        Mark this card as one you're currently buying.
      </div>
    </button>

    <button
      onClick={() => saveStatus("trade_in_progress")}
      className="mb-2 w-full rounded-xl border border-green-700/40 bg-[#242424] px-4 py-3 text-left transition hover:border-green-500 hover:bg-green-900/20"
    >
      <div className="font-semibold text-white">
        Trade In Progress
      </div>
      <div className="mt-1 text-xs text-zinc-400">
        Mark this card as one you're actively trading for.
      </div>
    </button>

    <button
      onClick={markComplete}
      className="w-full rounded-xl border border-[#d4af37]/40 bg-[#242424] px-4 py-3 text-left transition hover:border-[#d4af37] hover:bg-[#303030]"
    >
      <div className="font-semibold text-[#d4af37]">
        Mark as Complete
      </div>
      <div className="mt-1 text-xs text-zinc-400">
        Remove this card from your ISO list.
      </div>
    </button>
  </div>
)}
    </div>
  );
}