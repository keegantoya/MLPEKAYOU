import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getTradeCardImage } from "@/lib/card-images";
import ISOChecking from "./iso-checking";

type Card = {
  set_id: string;
  card_key: string;
};

export default function Wishlist() {
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

      const { data } = await supabase
        .from("wishlists")
        .select("card_key")
        .eq("user_id", session.user.id)
        .order("card_key");

      const parsed: Card[] = (data ?? []).map(
        (row: { card_key: string }) => {
          const [set_id, ...rest] = row.card_key.split(":");

          return {
            set_id,
            card_key: rest.join(":"),
          };
        }
      );

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
        Wishlist
      </h1>

      {cards.length === 0 ? (
        <div className="text-zinc-400">
          Your wishlist is empty.
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 md:gap-3">
          {cards.map((card) => (
            <ISOChecking
              key={`${card.set_id}:${card.card_key}`}
              userId={userId}
              setId={card.set_id}
              cardKey={card.card_key}
              wishlistMode
              isWishlisted
              toggleWishlist={async (setId, cardKey) => {
                await supabase
                  .from("wishlists")
                  .delete()
                  .eq("user_id", userId)
                  .eq("card_key", `${setId}:${cardKey}`);

                setCards((prev) =>
                  prev.filter(
                    (c) =>
                      !(
                        c.set_id === setId &&
                        c.card_key === cardKey
                      )
                  )
                );
              }}
            >
              <img
                src={getTradeCardImage(card)}
                alt={card.card_key}
                className="w-full rounded-lg aspect-[5/7] object-cover"
                loading="lazy"
                draggable={false}
              />
            </ISOChecking>
          ))}
        </div>
      )}
    </div>
  );
}