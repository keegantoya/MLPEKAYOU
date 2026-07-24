import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useWishlist() {
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadWishlist = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user) return;

      const { data: items } = await supabase
        .from("wishlists")
        .select("card_key")
        .eq("user_id", user.id);

      setWishlist(
  new Set(
    (items || []).map((item) =>
      item.card_key.replace(/-(\d+)$/, (_, n) => `-${Number(n)}`)
    )
  )
);
    };

    loadWishlist();
  }, []);

const toggleWishlist = async (
  setId: string,
  cardKey: string
) => {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;

  if (!user) return;

  const fullKey = `${setId}:${cardKey}`;

  if (
  wishlist.has(fullKey) ||
  wishlist.has(
    `${setId}:${cardKey.replace(/-(\d+)$/, (_, n) => `-${String(Number(n)).padStart(3, "0")}`)}`
  )
) {
    const { error } = await supabase
      .from("wishlists")
      .delete()
      .eq("user_id", user.id)
      .in("card_key", [
        fullKey,
        `${setId}:${cardKey.replace(/-(\d+)$/, (_, n) => `-${String(Number(n)).padStart(3, "0")}`)}`,
      ]);

    if (error) {
      console.error(error);
      return;
    }

setWishlist((prev) => {
  const next = new Set(prev);

  next.delete(fullKey);
  next.delete(
    `${setId}:${cardKey.replace(/-(\d+)$/, (_, n) => `-${String(Number(n)).padStart(3, "0")}`)}`
  );

  return next;
});
  } else {
    const { error } = await supabase
      .from("wishlists")
      .insert({
        user_id: user.id,
        card_key: fullKey,
      });

    if (error) {
      console.error(error);
      return;
    }

    setWishlist((prev) => {
      const next = new Set(prev);
      next.add(fullKey);
      return next;
    });
  }
};

  return {
    wishlist,
    toggleWishlist,
  };
}