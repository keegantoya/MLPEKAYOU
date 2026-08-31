import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
const normalizeWishlistKey = (key: string) =>
  key.replace(/-(\d+)$/, (_, number) => `-${Number(number)}`);
const getWishlistKeyVariants = (setId: string, cardKey: string) => {
  const fullKey = `${setId}:${cardKey}`;
  const normalizedKey = normalizeWishlistKey(fullKey);
  const paddedCardKey = cardKey.replace(
    /-(\d+)$/,
    (_, number) => `-${String(Number(number)).padStart(3, "0")}`
  );
  return {
    fullKey,
    normalizedKey,
    variants: Array.from(
      new Set([fullKey, normalizedKey, `${setId}:${paddedCardKey}`])
    ),
  };
};
export function useWishlist() {
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const wishlistRef = useRef<Set<string>>(new Set());
  const pendingKeysRef = useRef<Set<string>>(new Set());
  const updateWishlist = (updater: (current: Set<string>) => Set<string>) => {
    setWishlist((current) => {
      const next = updater(current);
      wishlistRef.current = next;
      return next;
    });
  };
  useEffect(() => {
    const loadWishlist = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) return;
      const { data: items, error } = await supabase
        .from("wishlists")
        .select("card_key")
        .eq("user_id", user.id);
      if (error) {
        console.error(error);
        return;
      }
      const loadedWishlist = new Set(
        (items || []).map((item) => normalizeWishlistKey(item.card_key))
      );
      wishlistRef.current = loadedWishlist;
      setWishlist(loadedWishlist);
    };
    loadWishlist();
  }, []);
  const toggleWishlist = async (setId: string, cardKey: string) => {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (!user) return;
    const { fullKey, normalizedKey, variants } = getWishlistKeyVariants(
      setId,
      cardKey
    );
    if (pendingKeysRef.current.has(normalizedKey)) return;
    pendingKeysRef.current.add(normalizedKey);
    try {
      if (wishlistRef.current.has(normalizedKey)) {
        const { error } = await supabase
          .from("wishlists")
          .delete()
          .eq("user_id", user.id)
          .in("card_key", variants);
        if (error) {
          console.error(error);
          return;
        }
        updateWishlist((current) => {
          const next = new Set(current);
          next.delete(normalizedKey);
          return next;
        });
        return;
      }
      const { data: existingItems, error: lookupError } = await supabase
        .from("wishlists")
        .select("card_key")
        .eq("user_id", user.id)
        .in("card_key", variants)
        .limit(1);
      if (lookupError) {
        console.error(lookupError);
        return;
      }
      if (existingItems && existingItems.length > 0) {
        updateWishlist((current) => {
          const next = new Set(current);
          next.add(normalizedKey);
          return next;
        });
        return;
      }
      const { error } = await supabase.from("wishlists").upsert(
        {
          user_id: user.id,
          card_key: fullKey,
        },
        {
          onConflict: "user_id,card_key",
          ignoreDuplicates: true,
        }
      );
      if (error) {
        console.error(error);
        return;
      }
      updateWishlist((current) => {
        const next = new Set(current);
        next.add(normalizedKey);
        return next;
      });
    } finally {
      pendingKeysRef.current.delete(normalizedKey);
    }
  };
  return {
    wishlist,
    toggleWishlist,
  };
}
