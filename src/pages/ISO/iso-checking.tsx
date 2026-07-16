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
  className={`relative inline-block w-full ${className ?? ""}`}
  ref={menuRef}
>
      <div
        className="relative cursor-pointer"
        onClick={() => setOpen((v) => !v)}
      >
        {children}


        {status === "purchase_in_progress" && (
          <div className="absolute left-0 right-0 top-0 rounded-t-lg bg-red-600/70 py-1 text-center text-[10px] font-bold uppercase text-white">
            PURCHASING
          </div>
        )}


        {status === "trade_in_progress" && (
          <div className="absolute left-0 right-0 top-0 rounded-t-lg bg-green-800/70 py-1 text-center text-[10px] font-bold uppercase text-white">
            TRADING FOR
          </div>
        )}
      </div>


      {open && (
        <div className="absolute left-1/2 top-full z-50 mt-2 w-56 -translate-x-1/2 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl">

          <button
            onClick={() =>
              saveStatus("purchase_in_progress")
            }
            className="w-full px-4 py-3 text-left hover:bg-zinc-800"
          >
            🛒 Purchase In Progress
          </button>


          <button
            onClick={() =>
              saveStatus("trade_in_progress")
            }
            className="w-full px-4 py-3 text-left hover:bg-zinc-800"
          >
            🤝 Trade In Progress
          </button>


          <button
            onClick={markComplete}
            className="w-full px-4 py-3 text-left hover:bg-zinc-800"
          >
            ✅ Complete
          </button>


          <div className="border-t border-zinc-700" />


          <button
            onClick={removeStatus}
            className="w-full px-4 py-3 text-left text-red-400 hover:bg-zinc-800"
          >
            Obtained
          </button>

        </div>
      )}
    </div>
  );
}