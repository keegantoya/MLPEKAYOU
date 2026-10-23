import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fetchEnglishWishlist, buildEnglishWishlistCards, getWishlistIdentity, getWishlistVariants } from "./catalog-adapter";
export function useWishlist() {
    const [wishlist, setWishlist] = useState<Set<string>>(new Set());
    const wishlistRef = useRef<Set<string>>(new Set());
    const pending = useRef(new Set<string>());
    const activeUser = useRef("");
    useEffect(() => {
        let disposed = false, requestId = 0;
        const load = async () => {
            const request = ++requestId;
            try {
                const { data } = await supabase.auth.getSession();
                if (disposed || request !== requestId)
                    return;
                const user = data.session?.user;
                if (!user) {
                    activeUser.current = "";
                    wishlistRef.current = new Set();
                    setWishlist(new Set());
                    return;
                }
                if (activeUser.current !== user.id) {
                    activeUser.current = user.id;
                    wishlistRef.current = new Set();
                    setWishlist(new Set());
                }
                const { data: rows, error } = await fetchEnglishWishlist(user.id);
                if (error)
                    throw error;
                if (disposed || request !== requestId || activeUser.current !== user.id)
                    return;
                const next = new Set(buildEnglishWishlistCards(rows ?? []).map(card => getWishlistIdentity(card.set_id, card.card_key)));
                wishlistRef.current = next;
                setWishlist(next);
            }
            catch (cause) {
                console.error(cause);
            }
        };
        const refresh = () => { void load(); };
        window.addEventListener("focus", refresh);
        window.addEventListener("iso-wishlist-changed", refresh);
        void load();
        return () => { disposed = true; requestId++; window.removeEventListener("focus", refresh); window.removeEventListener("iso-wishlist-changed", refresh); };
    }, []);
    const toggleWishlist = async (setId: string, cardKey: string) => {
        const { data } = await supabase.auth.getSession();
        const user = data.session?.user;
        if (!user)
            return;
        if (activeUser.current !== user.id) {
            activeUser.current = user.id;
            wishlistRef.current = new Set();
            setWishlist(new Set());
        }
        const identity = getWishlistIdentity(setId, cardKey);
        if (pending.current.has(identity))
            return;
        pending.current.add(identity);
        try {
            const variants = getWishlistVariants(setId, cardKey);
            let removed = false;
            if (wishlistRef.current.has(identity)) {
                const { error } = await supabase.from("wishlists").delete().eq("user_id", user.id).in("card_key", variants);
                if (error)
                    throw error;
                removed = true;
            }
            else {
                const { error } = await supabase.from("wishlists").upsert({ user_id: user.id, card_key: identity }, { onConflict: "user_id,card_key", ignoreDuplicates: true });
                if (error)
                    throw error;
            }
            if (activeUser.current !== user.id)
                return;
            const next = new Set(wishlistRef.current);
            if (removed)
                next.delete(identity);
            else
                next.add(identity);
            wishlistRef.current = next;
            setWishlist(next);
            window.dispatchEvent(new CustomEvent("iso-wishlist-changed", { detail: { userId: user.id, setId, cardKey, removed } }));
        }
        finally {
            pending.current.delete(identity);
        }
    };
    return { wishlist, toggleWishlist };
}
