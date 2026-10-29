import { useWishlist } from "./wishlist-in-iso";
import { ISOCardCaption, isoGridClass } from "@/components/iso/ISOShared";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fetchISOStatuses, buildInProgressCards, resolveISOCard, getWishlistIdentity, isoActionKey, type ISOStatus } from "./catalog-adapter";
import ISOCardImage from "./catalog-image";
import ISOChecking from "./iso-checking";
type Card = {
    set_id: string;
    card_key: string;
    status: ISOStatus;
};
export default function InProgress() {
    const { wishlist, toggleWishlist } = useWishlist();
    const [cards, setCards] = useState<Card[]>([]);
    const [userId, setUserId] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    useEffect(() => {
        let disposed = false, requestId = 0, activeUserId = "";
        const load = async () => {
            const request = ++requestId;
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (disposed || request !== requestId)
                    return;
                if (!session?.user) {
                    setCards([]);
                    setUserId("");
                    return;
                }
                activeUserId = session.user.id;
                setUserId(activeUserId);
                const { data, error } = await fetchISOStatuses(activeUserId);
                if (error)
                    throw error;
                if (!disposed && request === requestId) {
                    setCards(buildInProgressCards(data ?? []));
                    setLoadError("");
                }
            }
            catch (cause) {
                if (!disposed && request === requestId)
                    setLoadError("Cards in progress could not be loaded. Please refresh and try again.");
            }
            finally {
                if (!disposed && request === requestId)
                    setLoading(false);
            }
        };
        const refresh = () => { void load(); };
        const changed = (event: Event) => {
            if ((event as CustomEvent<{
                userId: string;
            }>).detail?.userId === activeUserId)
                refresh();
        };
        window.addEventListener("focus", refresh);
        window.addEventListener("iso-status-changed", changed);
        window.addEventListener("iso-collection-changed", changed);
        void load();
        return () => { disposed = true; requestId++; window.removeEventListener("focus", refresh); window.removeEventListener("iso-status-changed", changed); window.removeEventListener("iso-collection-changed", changed); };
    }, []);
    const removeCard = (card: Card) => {
        setCards((prev) => prev.filter((item) => !(item.set_id === card.set_id && item.card_key === card.card_key)));
    };
    if (loading) {
        return <div className="py-8 text-center text-sm text-zinc-500">Loading...</div>;
    }
    if (loadError)
        return <p role="alert" className="py-8 text-sm text-red-600 dark:text-red-400">{loadError}</p>;
    return (<div className="space-y-4">
      <section className="mb-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold sm:text-2xl">In Progress</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Cards you are currently buying or trading for.
            </p>
          </div>
          <div className="rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-semibold text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300">
            {cards.length} {cards.some(card => resolveISOCard(card.set_id, card.card_key)?.family === "merch") ? (cards.length === 1 ? "item" : "items") : (cards.length === 1 ? "card" : "cards")}
          </div>
        </div>
      </section>
      {cards.length === 0 ? (<section className="px-3 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-xl text-zinc-500 dark:bg-white/[0.06] dark:text-zinc-300">&#x2713;</div>
          <h2 className="mt-4 text-base font-semibold">Nothing in progress</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Cards marked as buying or trading will appear here.</p>
        </section>) : (<section className="min-w-0">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Active cards</h2>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Tap a card to update its status</span>
          </div>
          <div className={isoGridClass}>
            {cards.map((card) => (<article key={`${card.set_id}:${card.card_key}`} className={`min-w-0 ${resolveISOCard(card.set_id, card.card_key)?.wide ? "col-span-2" : ""}`}><ISOChecking contentClassName="!rounded-[2px]" contentStyle={{ borderRadius: "2px" }} userId={userId} initialStatus={card.status} isWishlisted={wishlist.has(getWishlistIdentity(card.set_id,isoActionKey(resolveISOCard(card.set_id,card.card_key)!)))} toggleWishlist={toggleWishlist} setId={card.set_id} cardKey={isoActionKey(resolveISOCard(card.set_id, card.card_key)!)} onStatusChange={(nextStatus) => {
                    if (nextStatus === null)
                        removeCard(card);
                }} onComplete={() => removeCard(card)}>
                <div className={`relative ${resolveISOCard(card.set_id, card.card_key)?.square ? "aspect-square" : resolveISOCard(card.set_id, card.card_key)?.wide ? "aspect-[10/7]" : "aspect-[5/7]"} overflow-hidden rounded-[7px] bg-transparent transition hover:-translate-y-0.5`}>
                  <ISOCardImage card={card}/>
                </div>
              </ISOChecking><ISOCardCaption code={resolveISOCard(card.set_id,card.card_key)?.code ?? card.card_key} setName={resolveISOCard(card.set_id,card.card_key)?.setName ?? card.set_id}/></article>))}
          </div>
        </section>)}
    </div>);
}
