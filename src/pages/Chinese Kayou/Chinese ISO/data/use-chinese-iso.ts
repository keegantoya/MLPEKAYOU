import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { ChineseISOCard } from "../catalog/catalog";
import { emptyChineseISOData, type ChineseSettings, type ChineseStatus, type ChineseISOData } from "./model";
import { loadChineseISOData, saveChineseSettings, saveChineseStatus, saveChineseWishlist, completeChineseCard } from "./repository";
export function useChineseISO() {
  const [data, setData] = useState(emptyChineseISOData);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const alive = useRef(false);
  const generation = useRef(0);
  const identity = useRef("");
  const saving = useRef(false);
  const refresh = useCallback(async () => {
    const ticket = ++generation.current;
    try {
      const { data: auth, error: authError } = await supabase.auth.getSession();
      if (!alive.current || ticket !== generation.current) return;
      if (authError) throw authError;
      const id = auth.session?.user.id ?? "";
      if (id !== identity.current) { identity.current = id; setUserId(id); setData(emptyChineseISOData()); }
      if (!id) throw new Error("Log in to use your Chinese ISO and wishlist.");
      const next = await loadChineseISOData(id);
      if (alive.current && ticket === generation.current) { setData(next); setError(""); }
    } catch (cause) {
      if (alive.current && ticket === generation.current) setError(cause instanceof Error ? cause.message : "Your Chinese cards could not be loaded. Please retry.");
    } finally {
      if (alive.current && ticket === generation.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    alive.current = true;
    const reload = () => { if (!saving.current) void refresh(); };
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      const changed = event === "SIGNED_OUT" || (!!identity.current && session?.user.id !== identity.current);
      if (changed) {
        generation.current += 1;
        identity.current = "";
        setUserId("");
        setData(emptyChineseISOData());
        setLoading(true);
      }
      window.setTimeout(changed ? () => { void refresh(); } : reload, 0);
    });
    window.addEventListener("focus", reload);
    window.addEventListener("chinese-iso-changed", reload);
    void refresh();
    return () => { alive.current = false; generation.current += 1; subscription.subscription.unsubscribe(); window.removeEventListener("focus", reload); window.removeEventListener("chinese-iso-changed", reload); };
  }, [refresh]);
  const run = async (operation: (id: string) => Promise<void>, apply?: (previous: ChineseISOData) => ChineseISOData) => {
    if (saving.current || !identity.current) return;
    const id = identity.current;
    saving.current = true;
    generation.current += 1;
    setBusy(true);
    setError("");
    try {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || auth.user?.id !== id || identity.current !== id) throw new Error("Your login changed. Reload before updating this card.");
      await operation(id);
      if (!alive.current || identity.current !== id) return;
      if (apply) setData(previous => apply(previous));
      else await refresh();
      window.dispatchEvent(new CustomEvent("chinese-iso-changed", { detail: { userId: id } }));
    } catch (cause) {
      if (alive.current && identity.current === id) setError(cause instanceof Error ? cause.message : "The update could not be saved. Please retry.");
      throw cause;
    } finally { saving.current = false; if (alive.current) setBusy(false); }
  };
  const settings = (patch: Partial<ChineseSettings>) => run(async id => { await saveChineseSettings(id, patch); });
  const status = (card: ChineseISOCard, value: ChineseStatus | null) => run(id => saveChineseStatus(id, card.setId, card.key, value), previous => ({ ...previous, statuses: [...previous.statuses.filter(row => row.set_id !== card.setId || row.card_key !== card.key), ...(value ? [{set_id:card.setId,card_key:card.key,status:value}] : [])] }));
  const wishlist = (card: ChineseISOCard, add: boolean) => run(id => saveChineseWishlist(id, card.setId, card.key, add), previous => ({ ...previous, wishlist: [...previous.wishlist.filter(row => row.set_id !== card.setId || row.card_key !== card.key), ...(add ? [{set_id:card.setId,card_key:card.key}] : [])] }));
  const complete = (card: ChineseISOCard) => run(() => completeChineseCard(card.setId, card.key), previous => ({...previous, progress:[...previous.progress.filter(row => row.set_id !== card.setId), {set_id:card.setId,progress:{...previous.progress.find(row => row.set_id === card.setId)?.progress,[card.key]:true}}], statuses:previous.statuses.filter(row => row.set_id !== card.setId || row.card_key !== card.key)}));
  return { data, userId, loading, busy, error, refresh, settings, status, wishlist, complete };
}
export type ChineseISOController = ReturnType<typeof useChineseISO>;
