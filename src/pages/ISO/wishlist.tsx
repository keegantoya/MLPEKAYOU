import CardImage from "@/components/CardImage";
import { useEffect, useState, type CSSProperties } from "react";
import { supabase } from "@/lib/supabase";
import { getTradeCardImage } from "@/lib/card-images";
import ISOChecking from "./iso-checking";
type Card = {
  set_id: string;
  card_key: string;
};
const standardZoomSets = new Set(["1", "2", "3", "4", "5", "6", "7", "8", "11"]);

const getCardNumber = (cardKey: string) => {
  const match = cardKey.match(/(\d+)$/);
  return match ? Number(match[1]) : null;
};

const getImageClassName = (card: Card) => {
  const base = "absolute inset-0 h-full w-full";

  if (standardZoomSets.has(card.set_id)) {
    return `${base} scale-[1.05] object-contain object-center`;
  }

  const cardNumber = getCardNumber(card.card_key);

  if (card.set_id === "9") {
    if (cardNumber === 1) {
      return `${base} scale-[1.02] object-contain object-center`;
    }
    if (cardNumber === 7) {
      return `${base} scale-[1.06] object-contain object-center`;
    }
    if (cardNumber !== null && [2, 3, 4, 5].includes(cardNumber)) {
      return `${base} scale-[1.05] object-contain object-center`;
    }
    return `${base} scale-[1.08] object-contain object-center`;
  }

  if (card.set_id === "tcgpromos") {
    if (cardNumber === 11) {
      return `${base} translate-y-[2px] scale-[1.02] object-cover object-center`;
    }
    if (cardNumber === 10) {
      return `${base} scale-[1.02] object-cover object-center`;
    }
    if (cardNumber === 9) {
      return `${base} -translate-y-px scale-[1.01] object-cover object-center`;
    }
    if (cardNumber === 12) {
      return `${base} -translate-y-[2px] object-cover object-center`;
    }
    return `${base} scale-[1.01] object-contain object-center`;
  }

  const contained = ["SD", "FW", "12", "14"].includes(card.set_id);
  return `${base} ${contained ? "object-contain object-center" : "object-cover object-center"}`;
};

const WishlistImage = ({ card }: { card: Card }) => {
  const isLandscape =
    card.set_id === "14" &&
    /^BP03-C(2[5-9]|3[0-9]|4[0-8])$/.test(card.card_key);
  const style: CSSProperties = {
    backgroundColor: "transparent",
    backgroundImage: "none",
    ...(isLandscape
      ? { transform: "translate(-50%, -50%) rotate(-90deg)" }
      : {}),
  };

  return (
    <CardImage
      src={getTradeCardImage(card)}
      alt={card.card_key}
      className={
        isLandscape
          ? "absolute left-1/2 top-1/2 h-[71.4286%] w-[140%] max-w-none object-cover"
          : getImageClassName(card)
      }
      style={style}
      loading="lazy"
      draggable={false}
    />
  );
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
              return (
                <div
                  key={`${card.set_id}:${card.card_key}`}
                  className="group relative overflow-visible"
                >
                  <ISOChecking
                    contentClassName="!rounded-[2px]"
                    contentStyle={{ borderRadius: "2px" }}
                    userId={userId}
                    setId={card.set_id}
                    cardKey={card.card_key}
                    wishlistMode
                    isWishlisted
                    toggleWishlist={removeFromWishlist}
                  >
                    <div className="relative aspect-[5/7] overflow-hidden rounded-[6px] bg-transparent transition hover:-translate-y-0.5">
                      <WishlistImage card={card} />
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
