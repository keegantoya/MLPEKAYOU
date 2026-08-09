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
  <div className="min-h-screen bg-[#0b0d0f] text-white">

    {/* PAGE HEADER */}
    <section className="relative overflow-hidden border-b border-[#2d3337] bg-[#0d1113]">

      {/* Technical grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(231,200,75,1) 1px, transparent 1px), linear-gradient(90deg, rgba(231,200,75,1) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Gold glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-80 -translate-x-1/2 bg-[#E7C84B]/[0.045] blur-3xl" />

      <div className="relative mx-auto max-w-[1800px] px-4 py-8 sm:px-6 lg:px-8">

        {/* System identifier */}
        <div className="mb-5 flex items-center gap-3">
          <span className="font-mono text-[8px] font-bold uppercase tracking-[0.35em] text-[#E7C84B]/70">
            COLLECTION MODULE
          </span>

          <span className="h-px w-10 bg-[#E7C84B]/30" />

          <span className="font-mono text-[7px] uppercase tracking-[0.25em] text-zinc-600">
            PERSONAL TARGETS
          </span>
        </div>

        {/* Title */}
        <div className="flex items-end justify-between gap-4">

          <div>
            <h1 className="text-2xl font-black uppercase tracking-[0.12em] text-white sm:text-3xl">
              Wishlist
            </h1>

            <p className="mt-2 max-w-xl font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-500 sm:text-[9px]">
              Cards marked for acquisition
            </p>
          </div>

          {/* Card count */}
          <div className="relative shrink-0 border border-[#30363a] bg-[#101417] px-4 py-2.5 text-right">

            <span className="absolute left-0 top-0 h-2 w-2 border-l border-t border-[#E7C84B]/70" />
            <span className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-[#E7C84B]/50" />

            <div className="font-mono text-[7px] uppercase tracking-[0.25em] text-zinc-600">
              TARGETS
            </div>

            <div className="mt-0.5 text-lg font-black tracking-[0.08em] text-[#E7C84B]">
              {cards.length}
            </div>
          </div>

        </div>

        {/* Header status rail */}
        <div className="mt-6 flex items-center gap-2">

          <span className="h-1.5 w-1.5 bg-[#E7C84B] shadow-[0_0_8px_rgba(231,200,75,0.8)]" />

          <span className="font-mono text-[7px] font-bold uppercase tracking-[0.25em] text-[#E7C84B]/70">
            WISHLIST ACTIVE
          </span>

          <span className="h-px flex-1 bg-gradient-to-r from-[#E7C84B]/30 to-transparent" />

        </div>

      </div>
    </section>

    {/* CONTENT */}
    <main className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8">

      {cards.length === 0 ? (
        <div className="relative overflow-hidden border border-[#30363a] bg-[#0d1113] px-6 py-16 text-center">

          {/* HUD corners */}
          <span className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-[#E7C84B]/60" />
          <span className="absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-[#E7C84B]/40" />
          <span className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-[#E7C84B]/40" />
          <span className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-[#E7C84B]/60" />

          <div className="mx-auto max-w-md">

            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center border border-[#E7C84B]/30 bg-[#151a1d]">
              <span className="font-mono text-xs font-black text-[#E7C84B]">
                ISO
              </span>
            </div>

            <div className="font-mono text-[8px] font-bold uppercase tracking-[0.3em] text-zinc-500">
              NO TARGETS FOUND
            </div>

            <p className="mt-2 text-sm text-zinc-600">
              Your wishlist is empty.
            </p>

          </div>
        </div>
      ) : (
        <>

          {/* GRID STATUS */}
          <div className="mb-4 flex items-center justify-between border-b border-[#252a2e] pb-3">

            <div className="flex items-center gap-2">
              <span className="h-1 w-1 bg-[#E7C84B]" />

              <span className="font-mono text-[8px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                TARGET CARD MATRIX
              </span>
            </div>

            <span className="font-mono text-[7px] uppercase tracking-[0.2em] text-zinc-700">
              {cards.length} {cards.length === 1 ? "CARD" : "CARDS"}
            </span>

          </div>

          {/* CARD GRID */}
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-4 md:grid-cols-5 md:gap-3 lg:grid-cols-6 xl:grid-cols-7">

            {cards.map((card) => (
              <div
                key={`${card.set_id}:${card.card_key}`}
                className="group relative"
              >

                {/* Technical frame */}
                <div className="pointer-events-none absolute -inset-[1px] z-20 border border-[#30363a] transition-all duration-200 group-hover:border-[#E7C84B]/70 group-hover:shadow-[0_0_18px_rgba(231,200,75,0.14)]" />

                {/* Corner brackets */}
                <span className="pointer-events-none absolute left-0 top-0 z-30 h-3 w-3 border-l-2 border-t-2 border-[#E7C84B]/70 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                <span className="pointer-events-none absolute right-0 top-0 z-30 h-3 w-3 border-r-2 border-t-2 border-[#E7C84B]/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                <span className="pointer-events-none absolute bottom-0 left-0 z-30 h-3 w-3 border-b-2 border-l-2 border-[#E7C84B]/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                <span className="pointer-events-none absolute bottom-0 right-0 z-30 h-3 w-3 border-b-2 border-r-2 border-[#E7C84B]/70 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

                <ISOChecking
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
                    className="aspect-[5/7] w-full object-cover transition-transform duration-200 group-hover:scale-[1.01]"
                    loading="lazy"
                    draggable={false}
                  />
                </ISOChecking>

              </div>
            ))}

          </div>
        </>

      )}

    </main>
  </div>
);
}