import { ISOCardCaption, isoGridClass } from "@/components/iso/ISOShared";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fetchEnglishWishlist, fetchISOStatuses, buildEnglishWishlistCards, buildISOStatusMap, getWishlistVariants, getWishlistIdentity, resolveWishlistCard, getISOCharacters, isoCardIdentity, type StoredWishlistCard, type ISOStatus } from "./catalog-adapter";
import ISOCardImage from "./catalog-image";
import ISOChecking from "./iso-checking";
type Card = StoredWishlistCard;
export default function Wishlist({ characterSearch = "" }: {
    characterSearch?: string;
} = {}) {
    const [cards, setCards] = useState<Card[]>([]);
    const [userId, setUserId] = useState("");
    const [statuses, setStatuses] = useState<Map<string, ISOStatus>>(new Map());
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    useEffect(() => {
        let disposed = false;
        let requestId = 0;
        let activeUserId = "";
        const load = async () => {
            const request = ++requestId;
            try {
                const { data: { session }, } = await supabase.auth.getSession();
                if (disposed || request !== requestId)
                    return;
                if (!session?.user) {
                    setUserId("");
                    setCards([]);
                    setLoading(false);
                    return;
                }
                activeUserId = session.user.id;
                setUserId(activeUserId);
                const [{ data, error }, statusResult] = await Promise.all([fetchEnglishWishlist(activeUserId), fetchISOStatuses(activeUserId)]);
                if (disposed || request !== requestId)
                    return;
                if (error || statusResult.error)
                    throw error ?? statusResult.error;
                setCards(buildEnglishWishlistCards(data ?? []));
                setStatuses(buildISOStatusMap(statusResult.data ?? []));
                setLoadError("");
            }
            catch (cause) {
                if (!disposed && request === requestId)
                    setLoadError("Your wishlist could not be loaded. Please refresh and try again.");
            }
            finally {
                if (!disposed && request === requestId)
                    setLoading(false);
            }
        };
        const refresh = () => {
            void load();
        };
        const onWishlistChange = (event: Event) => {
            const detail = (event as CustomEvent<{
                userId: string;
                setId: string;
                cardKey: string;
                removed?: boolean;
            }>).detail;
            if (!detail || detail.userId !== activeUserId)
                return;
            if (detail.removed) {
                setCards((previous) => previous.filter((card) => !(card.set_id === detail.setId && card.card_key === detail.cardKey)));
            }
            refresh();
        };
        window.addEventListener("iso-wishlist-changed", onWishlistChange);
        window.addEventListener("focus", refresh);
        window.addEventListener("iso-status-changed", refresh);
        void load();
        return () => {
            disposed = true;
            requestId += 1;
            window.removeEventListener("iso-wishlist-changed", onWishlistChange);
            window.removeEventListener("focus", refresh);
            window.removeEventListener("iso-status-changed", refresh);
        };
    }, []);
    const removeFromWishlist = async (setId: string, cardKey: string) => {
        const { error } = await supabase
            .from("wishlists")
            .delete()
            .eq("user_id", userId)
            .in("card_key", [...new Set([...getWishlistVariants(setId, cardKey), ...(cards.find(card => getWishlistIdentity(card.set_id, card.card_key) === getWishlistIdentity(setId, cardKey))?.storedKeys ?? [])])]);
        if (error)
            throw error;
        setCards((previous) => previous.filter((card) => !(card.set_id === setId && card.card_key === cardKey)));
    };
    const query = characterSearch.trim().toLowerCase();
    const visibleCards = query
        ? cards.filter((card) => getISOCharacters(resolveWishlistCard(card.set_id,card.card_key)!).some((name) => name.toLowerCase().includes(query)))
        : cards;
    if (loading)
        return (<div className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">Loading...</div>);
    if (loadError)
        return <p role="alert" className="py-8 text-sm text-red-600 dark:text-red-400">{loadError}</p>;
    return (<div className="space-y-3">
      <section className="mb-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold sm:text-2xl">Wishlist</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Cards you have saved, including cards you already own.</p>
          </div>
        </div>
      </section>
      {visibleCards.length === 0 ? (<section className="px-3 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-pink-50 text-xl dark:bg-pink-400/[0.08]">
            &#9825;
          </div>
          <h2 className="mt-4 text-base font-semibold">
            {cards.length === 0 ? "Your wishlist is empty" : "No matching wishlisted cards"}
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {cards.length === 0
                ? "Save cards from Collections or use Edit wishlist in Controls."
                : "Try another character name or clear the search."}
          </p>
        </section>) : (<section className="min-w-0">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Wishlisted Items</h2>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Tap a card to manage it
            </span>
          </div>
          <div className={isoGridClass}>
            {visibleCards.map((card) => (<div key={`${card.set_id}:${card.card_key}`} className={`group relative overflow-visible ${resolveWishlistCard(card.set_id, card.card_key)?.wide ? "col-span-2" : ""}`}>
                <ISOChecking contentClassName="!rounded-[2px]" contentStyle={{ borderRadius: "2px" }} userId={userId} initialStatus={resolveWishlistCard(card.set_id,card.card_key)!.isoEligible ? statuses.get(isoCardIdentity(resolveWishlistCard(card.set_id, card.card_key)!)) ?? null : null} setId={card.set_id} cardKey={card.card_key} wishlistMode isWishlisted toggleWishlist={removeFromWishlist}>
                  <div className={`relative ${resolveWishlistCard(card.set_id, card.card_key)?.square ? "aspect-square" : resolveWishlistCard(card.set_id, card.card_key)?.wide ? "aspect-[10/7]" : "aspect-[5/7]"} overflow-hidden rounded-[6px] bg-transparent transition hover:-translate-y-0.5`}>
                    <ISOCardImage card={resolveWishlistCard(card.set_id,card.card_key)!}/>
                  </div>
                </ISOChecking><ISOCardCaption code={resolveWishlistCard(card.set_id,card.card_key)?.code ?? card.card_key} setName={resolveWishlistCard(card.set_id,card.card_key)?.setName ?? card.set_id}/>
              </div>))}
          </div>
        </section>)}
    </div>);
}
