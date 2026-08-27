import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getTradeCardImage } from "@/lib/card-images";
import ISOChecking from "./iso-checking";
type Card = {
  set_id: string;
  card_key: string;
};
const isTCGCard = (setId: string) =>
  setId === "FW" ||
  setId === "SD" ||
  setId === "12" ||
  setId === "tcgpromos";
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
  const removeFromWishlist = async (setId: string, cardKey: string) => {
    await supabase
      .from("wishlists")
      .delete()
      .eq("user_id", userId)
      .eq("card_key", `${setId}:${cardKey}`);
    setCards((prev) =>
      prev.filter(
        (card) =>
          !(card.set_id === setId && card.card_key === cardKey)
      )
    );
  };
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
            <h1 className="text-xl font-semibold sm:text-2xl">Wishlist</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Cards you want to find.
            </p>
          </div>
          <div className="rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-semibold text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300">
            {cards.length} {cards.length === 1 ? "card" : "cards"}
          </div>
        </div>
      </section>
      {cards.length === 0 ? (
        <section className="rounded-[24px] border border-black/10 bg-white px-6 py-12 text-center shadow-sm dark:border-white/[0.08] dark:bg-[#17191a]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-pink-50 text-xl dark:bg-pink-400/[0.08]">
            ♡
          </div>
          <h2 className="mt-4 text-base font-semibold">Your wishlist is empty</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Add cards from the ISO view and they will appear here.
          </p>
        </section>
      ) : (
        <section className="rounded-[24px] border border-black/10 bg-white p-3 shadow-sm dark:border-white/[0.08] dark:bg-[#17191a] sm:p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Wishlisted cards</h2>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Tap a card to manage it
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-4 md:grid-cols-5 md:gap-3 lg:grid-cols-6 xl:grid-cols-7">
            {cards.map((card) => {
              const allowZoom = !isTCGCard(card.set_id);
              return (
                <div
                  key={`${card.set_id}:${card.card_key}`}
                  className="group relative overflow-visible"
                >
                  <ISOChecking
                    userId={userId}
                    setId={card.set_id}
                    cardKey={card.card_key}
                    wishlistMode
                    isWishlisted
                    toggleWishlist={removeFromWishlist}
                  >
                    <div className="relative overflow-hidden rounded-xl border border-black/10 bg-zinc-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/[0.08] dark:bg-white/[0.04]">
                      <img
                        src={getTradeCardImage(card)}
                        alt={card.card_key}
                        className={`aspect-[5/7] w-full object-cover ${
                          allowZoom
                            ? "transition-transform duration-300 ease-out group-hover:scale-[1.045]"
                            : ""
                        }`}
                        loading="lazy"
                        draggable={false}
                      />
                    </div>
                  </ISOChecking>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
