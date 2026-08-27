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
        /**
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
        /**
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
        /**
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
        /**
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
    return (
      <div className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Loading...
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <section className="rounded-[24px] border border-black/10 bg-white p-4 shadow-sm dark:border-white/[0.08] dark:bg-[#17191a] sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold sm:text-2xl">In Progress</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Cards you are currently buying or trading for.
            </p>
          </div>
          <div className="rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-semibold text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300">
            {cards.length} {cards.length === 1 ? "card" : "cards"}
          </div>
        </div>
      </section>
      {cards.length === 0 ? (
        <section className="rounded-[24px] border border-black/10 bg-white px-6 py-12 text-center shadow-sm dark:border-white/[0.08] dark:bg-[#17191a]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-xl text-zinc-500 dark:bg-white/[0.06] dark:text-zinc-300">
            ✓
          </div>
          <h2 className="mt-4 text-base font-semibold">Nothing in progress</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Cards marked as buying or trading will appear here.
          </p>
        </section>
      ) : (
        <section className="rounded-[24px] border border-black/10 bg-white p-3 shadow-sm dark:border-white/[0.08] dark:bg-[#17191a] sm:p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Active cards</h2>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Tap a card to update its status
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-4 md:grid-cols-5 md:gap-3 lg:grid-cols-6 xl:grid-cols-7">
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
                onStatusChange={(nextStatus) => {
                  if (nextStatus === null) {
                    setCards((prev) =>
                      prev.filter(
                        (item) =>
                          !(
                            item.set_id === card.set_id &&
                            item.card_key === card.card_key
                          )
                      )
                    );
                  }
                }}
                onComplete={() =>
                  setCards((prev) =>
                    prev.filter(
                      (item) =>
                        !(
                          item.set_id === card.set_id &&
                          item.card_key === card.card_key
                        )
                    )
                  )
                }
              >
                <div className="relative aspect-[5/7] overflow-hidden rounded-xl border border-black/10 bg-zinc-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/[0.08] dark:bg-white/[0.04]">
                  <img
                    src={getTradeCardImage({
                      set_id: card.set_id,
                      card_key: card.card_key,
                    })}
                    alt={card.card_key}
                    className="absolute left-0 top-[-6px] h-[calc(100%+12px)] w-full object-cover"
                    loading="lazy"
                    draggable={false}
                  />
                </div>
              </ISOChecking>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
