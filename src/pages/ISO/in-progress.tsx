import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getTradeCardImage } from "@/lib/card-images";
import ISOChecking from "./iso-checking";

type Card = {
  set_id: string;
  card_key: string;
};

export default function InProgress() {
  const [cards, setCards] = useState<Card[]>([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setLoading(false);
        return;
      }

      setUserId(session.user.id);

      const { data, error } = await supabase
        .from("iso_status")
        .select("card_key, status")
        .eq("user_id", session.user.id);

      if (error) {
        setLoading(false);
        return;
      }

      const parsed: Card[] = [];

      (data ?? []).forEach((row: any) => {
        if (
          row.status !== "purchase_in_progress" &&
          row.status !== "trade_in_progress"
        ) {
          return;
        }

        /*
         * FRIENDSHIPS BEGIN
         *
         * iso_status stores these as:
         * BONUS-SD01ER10
         * BONUS-SD01RR06
         * BONUS-SD01PER13
         *
         * The image system needs:
         * set_id = SD
         * card_key = SD01ER10
         */
        if (row.card_key.startsWith("BONUS-")) {
          parsed.push({
            set_id: "SD",
            card_key: row.card_key.substring(6),
          });

          return;
        }

        /*
         * Existing FW / SD prefixed keys
         */
        if (
          row.card_key.startsWith("FW-") ||
          row.card_key.startsWith("SD-")
        ) {
          const dash = row.card_key.indexOf("-");

          parsed.push({
            set_id: row.card_key.substring(0, dash),
            card_key: row.card_key.substring(dash + 1),
          });

          return;
        }

        /*
         * Fantasy Wonderland / Friendships Begin direct card keys
         */
        if (
          row.card_key.startsWith("BP01") ||
          row.card_key.startsWith("SD01")
        ) {
          parsed.push({
            set_id: row.card_key.startsWith("BP01") ? "FW" : "SD",
            card_key: row.card_key,
          });

          return;
        }

        /*
         * Standard set-prefixed keys
         */
        const parts = row.card_key.split("-");

        parsed.push({
          set_id: parts.shift()!,
          card_key: parts.join("-"),
        });
      });

      setCards(parsed);
      setLoading(false);
    };

    load();
  }, []);

  if (loading) {
    return <div className="p-6 text-white">Loading...</div>;
  }

  return (
    <div className="relative pt-[5px]">

      {/* SYSTEM HEADER */}
      <div className="mb-6 border-b border-[#2b3034] pb-4">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 bg-yellow-400 shadow-[0_0_8px_#facc15]" />

          <span className="font-oxanium text-[8px] font-bold uppercase tracking-[0.45em] text-yellow-400">
            SYSTEM MODULE 02
          </span>
        </div>

        <div className="mt-2 flex items-end justify-between gap-4">
          <div>
            <h1 className="font-oxanium text-2xl font-black uppercase tracking-[0.12em] text-white">
              IN PROGRESS
            </h1>

            <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-600">
              ACTIVE ACQUISITION QUEUE
            </p>
          </div>

          <div className="hidden border border-[#30363a] bg-[#101417] px-3 py-2 text-right sm:block">
            <div className="font-mono text-[7px] uppercase tracking-[0.2em] text-zinc-600">
              ACTIVE
            </div>

            <div className="font-oxanium text-sm font-bold text-yellow-400">
              {cards.length.toString().padStart(2, "0")}
            </div>
          </div>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="border border-[#30363a] bg-[#101417] px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center border border-yellow-400/30 bg-yellow-400/5">
              <span className="font-mono text-sm text-yellow-400">
                ✓
              </span>
            </div>

            <div>
              <div className="font-oxanium text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-300">
                QUEUE CLEAR
              </div>

              <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.1em] text-zinc-600">
                No active acquisition records detected
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 md:gap-3">
          {cards.map((card) => (
            <ISOChecking
              key={`${card.set_id}:${card.card_key}`}
              userId={userId}
              setId={card.set_id}
              cardKey={
                card.set_id === "SD"
                  ? `BONUS-${card.card_key}`
                  : card.card_key
              }
            >
              <div className="relative overflow-hidden rounded-lg aspect-[5/7]">
                <img
                  src={getTradeCardImage({
                    set_id: card.set_id,
                    card_key: card.card_key,
                  })}
                  alt={card.card_key}
                  className="absolute"
                  style={{
                    width: "100%",
                    height: "calc(100% + 12px)",
                    left: 0,
                    top: "-6px",
                    objectFit: "cover",
                  }}
                  loading="lazy"
                  draggable={false}
                />
              </div>
            </ISOChecking>
          ))}
        </div>
      )}
    </div>
  );
}