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
const parts = row.card_key.split("-");

const set_id = parts.shift()!;
const card_key = parts.join("-");

parsed.push({
  set_id,
  card_key,
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
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold text-white">
        In Progress
      </h1>

      {cards.length === 0 ? (
        <div className="text-zinc-400">
          You have no cards in progress.
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 md:gap-3">
          {cards.map((card) => (
            <ISOChecking
              key={`${card.set_id}:${card.card_key}`}
              userId={userId}
              setId={card.set_id}
              cardKey={card.card_key}
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