import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

// Pages load their initial session themselves. Supabase can emit SIGNED_IN again
// on tab focus; that is not a new login and must not reset page/image state.
export function onAuthIdentityChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
  let identity: string | null | undefined;
  let active = true;
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const result = supabase.auth.onAuthStateChange((event, session) => {
    const next = session?.user.id ?? null;
    if (event === "INITIAL_SESSION") {
      if (identity === undefined) identity = next;
      return;
    }
    const changed = next !== identity;
    identity = next;
    if (!changed && event !== "USER_UPDATED" && event !== "PASSWORD_RECOVERY") return;
    // Never run page queries while Supabase holds its auth lock.
    const timer = setTimeout(() => {
      timers.delete(timer);
      if (active) callback(event, session);
    }, 0);
    timers.add(timer);
  });
  return { data: { subscription: {
    unsubscribe() {
      active = false;
      for (const timer of timers) clearTimeout(timer);
      timers.clear();
      result.data.subscription.unsubscribe();
    },
  } } };
}
