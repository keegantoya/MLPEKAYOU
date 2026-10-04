import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import CardImage from "@/components/CardImage";
import { supabase } from "@/lib/supabase";
import { cardImagePaths, getNightmareNightFront } from "@/lib/card-images";
import { getISOSetId, funCatalog, moonCatalog, rainbowCatalog, starCatalog, tcgCatalog } from "@/lib/iso-card-catalog";
import { getProfileAssets } from "@/pages/Everypony/profile-assets";

type ListingWarning = {
  id: string;
  recipient_user_id: string;
  set_id: string;
  card_key: string;
  card_code: string;
  listed_price: number;
  suggested_price: string;
  explanation: string;
  moderator_user_id: string | null;
  moderator_username: string;
  moderator_avatar_url: string | null;
  created_at: string;
  acknowledged_at: string | null;
};

export const buildListingWarningMessage = (username: string, cardCode: string, price: string) =>
  `Good afternoon, ${username}. We received a report regarding ${cardCode} listed from your account. We have decided it is within best action to let you know that your card was listed at a price high enough to be reported, and not dismissed by moderators. This particular rarity typically sells for ${price || "(price)"}. Please reach out to us in the MLPEKayou Discord server if you want to appeal or have any questions.`;
const getReportedCardImage = (setId: string, cardKey: string): string => {
  const id = getISOSetId(setId);
  let key = cardKey;
  for (const prefix of [`${setId}:`, `${id}:`, `${setId}-`, `${id}-`]) {
    if (key.startsWith(prefix)) { key = key.slice(prefix.length); break; }
  }
  key = key.replace(/^BONUS-/, "");
  if (id === "9" || id === "tcgpromos") {
    const match = key.match(id === "9" ? /^PR-?(\d+)$/ : /^RR-?(\d+)$/);
    if (!match) return "";
    return id === "9" ? cardImagePaths.ccgPromo(match[1].padStart(3, "0"))
      : cardImagePaths.tcgRubyPromo(match[1].padStart(2, "0"));
  }
  for (const group of [funCatalog, moonCatalog, rainbowCatalog, starCatalog]) {
    const set = group.sets.find((entry) => entry.id === id);
    if (!set) continue;
    const match = key.match(/^([A-Z ]+)-(\d+)$/);
    return match ? cardImagePaths.ccg(set.folder, set.prefix, group.getRarityCode(match[1]), match[2].padStart(3, "0")) : "";
  }
  const set = tcgCatalog.sets.find((entry) => entry.id === id);
  if (!set) return "";
  if (id === "14") {
    key = key.replace(/^(BP03-ER0[12])-([ABC])\2$/, "$1-$2");
    return getNightmareNightFront(key);
  }
  if (id === "12") return cardImagePaths.discord(key);
  if (key.startsWith("BP01ER")) return cardImagePaths.fantasyEmerald(key.slice(-2));
  if (key.startsWith("BP01PER")) return cardImagePaths.fantasyParallelEmerald(key.slice(-2));
  return cardImagePaths.byFolder(set.folder, key);
};

function WarningCard({ warning, isLightMode }: { warning: ListingWarning; isLightMode: boolean }) {
  const src = getReportedCardImage(warning.set_id, warning.card_key);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return (
    <article className={`rounded-2xl border p-4 ${isLightMode ? "border-red-200 bg-white" : "border-red-400/20 bg-white/[0.03]"}`}>
      <div className="flex items-start gap-4">
        <div className="flex h-36 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-500/10 sm:h-44 sm:w-28">
          {src && !failed ? <CardImage src={src} alt={warning.card_code} onError={() => setFailed(true)} className="h-full w-full object-contain" /> : <span className="p-2 text-center text-xs">Image unavailable</span>}
        </div>
        <div className="min-w-0">
          <h3 className="break-all font-mono text-sm font-bold sm:text-base">{warning.card_code}</h3>
          <p className="mt-3 text-sm">Removed price: <strong>${Number(warning.listed_price).toFixed(2)}</strong></p>
          <p className="mt-2 break-words text-sm">Typical price: <strong>{warning.suggested_price}</strong></p>
          <p className="mt-2 text-xs opacity-60">{new Date(warning.created_at).toLocaleString()}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <CardImage src={getProfileAssets({ avatar_url: warning.moderator_avatar_url }).avatar} alt={warning.moderator_username}
          className="h-10 w-10 shrink-0 rounded-full object-cover" />
        <div className="min-w-0"><p className="break-words text-sm font-semibold">{warning.moderator_username}</p><p className="text-xs opacity-60">Moderator</p></div>
      </div>
      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed">{warning.explanation}</p>
      {warning.acknowledged_at && <p className="mt-3 text-xs opacity-60">Accepted {new Date(warning.acknowledged_at).toLocaleString()}</p>}
    </article>
  );
}

function useListingWarnings(pendingOnly: boolean) {
  const [warnings, setWarnings] = useState<ListingWarning[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    let request = 0;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let channelUser: string | null = null;
    const load = async () => {
      const version = ++request;
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!active || version !== request) return;
        const userId = session?.user.id;
        if (channelUser !== (userId || null)) {
          if (channel) void supabase.removeChannel(channel);
          channel = null;
          channelUser = userId || null;
          setWarnings([]);
          if (userId) {
            channel = supabase.channel(`listing-warnings-${pendingOnly ? "pending" : "history"}-${userId}`)
              .on("postgres_changes", { event: "*", schema: "public", table: "listing_moderation_warnings", filter: `recipient_user_id=eq.${userId}` }, () => void load())
              .subscribe();
          }
        }
        if (!userId) { setWarnings([]); setError(""); setLoading(false); return; }
        let query = (supabase as any).from("listing_moderation_warnings").select("*").eq("recipient_user_id", userId).order("created_at", { ascending: !pendingOnly });
        if (pendingOnly) query = query.is("acknowledged_at", null);
        const rows: ListingWarning[] = [];
        for (let offset = 0; ; offset += 500) {
          const { data, error: queryError } = await query.range(offset, offset + 499);
          if (queryError) throw queryError;
          if (!active || version !== request) return;
          rows.push(...(data || []));
          if (!data || data.length < 500) break;
        }
        if (!active || version !== request) return;
        setWarnings(rows);
        setError("");
      } catch (cause: any) {
        if (active && version === request) setError(cause.message || "Unable to load listing warnings.");
      } finally {
        if (active && version === request) setLoading(false);
      }
    };
    const refresh = () => void load();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") { ++request; setWarnings([]); setError(""); }
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") window.setTimeout(refresh, 0);
    });
    window.addEventListener("focus", refresh);
    window.addEventListener("listing-warning-update", refresh);
    void load();
    return () => {
      active = false;
      subscription.unsubscribe();
      window.removeEventListener("focus", refresh);
      window.removeEventListener("listing-warning-update", refresh);
      if (channel) void supabase.removeChannel(channel);
    };
  }, [pendingOnly, revision]);
  return { warnings, setWarnings, error, loading, retry: () => setRevision((value) => value + 1) };
}

export function ListingWarningGate() {
  const { warnings, setWarnings, error, retry } = useListingWarnings(true);
  const [isLightMode, setIsLightMode] = useState(() => document.documentElement.dataset.theme === "light");
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState("");
  const panel = useRef<HTMLDivElement>(null);
  const acceptButton = useRef<HTMLButtonElement>(null);
  const open = warnings.length > 0;
  useEffect(() => {
    const observer = new MutationObserver(() => setIsLightMode(document.documentElement.dataset.theme === "light"));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    acceptButton.current?.focus();
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); return; }
      if (event.key !== "Tab" || !panel.current) return;
      const elements = Array.from(panel.current.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], [tabindex="0"]'));
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!first) { event.preventDefault(); panel.current.focus(); }
      else if (event.shiftKey && (document.activeElement === first || !panel.current.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !panel.current.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    const containFocus = (event: FocusEvent) => {
      if (panel.current && !panel.current.contains(event.target as Node)) panel.current.focus();
    };
    document.addEventListener("keydown", trapFocus, true);
    document.addEventListener("focusin", containFocus);
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overscrollBehavior = previousOverscroll;
      document.removeEventListener("keydown", trapFocus, true);
      document.removeEventListener("focusin", containFocus);
      previousFocus?.focus();
    };
  }, [open]);
  const accept = async () => {
    if (accepting) return;
    const ids = warnings.map((warning) => warning.id);
    setAccepting(true);
    setAcceptError("");
    try {
      const { data, error: rpcError } = await (supabase as any).rpc("acknowledge_listing_warnings", { p_warning_ids: ids });
      if (rpcError) throw rpcError;
      const acknowledged = new Set<string>(data || []);
      setWarnings((current) => current.filter((warning) => !acknowledged.has(warning.id)));
      window.dispatchEvent(new CustomEvent("listing-warning-update"));
      window.dispatchEvent(new CustomEvent("header-inbox-update"));
    } catch (cause: any) {
      setAcceptError(cause.message || "Unable to accept the warning. Please try again.");
    } finally { setAccepting(false); }
  };
  if (!open) return error ? <div role="alert" className="m-4 rounded-xl bg-red-500/10 p-4 text-sm text-red-500">Unable to check listing warnings. <button type="button" onClick={retry} className="underline">Retry</button></div> : null;
  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-5">
      <div ref={panel} tabIndex={-1} role="alertdialog" aria-modal="true" aria-labelledby="listing-warning-heading" aria-describedby="listing-warning-description"
        className={`flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border shadow-2xl outline-none ${isLightMode ? "border-red-200 bg-zinc-50 text-zinc-900" : "border-red-400/30 bg-[#151718] text-white"}`}>
        <div className="shrink-0 border-b border-red-500/20 p-4 sm:p-5">
          <h2 id="listing-warning-heading" className="text-xl font-bold">Sale listing {warnings.length === 1 ? "warning" : "warnings"}</h2>
          <p id="listing-warning-description" className="mt-2 text-sm leading-relaxed opacity-80">{warnings.length === 1 ? "A sale listing was" : `${warnings.length} sale listings were`} removed after moderator review. Accept the warning to continue. You can then open your inventory and relist at the suggested price.</p>
        </div>
        <div tabIndex={0} aria-label="Listing warning details" className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-4 sm:p-5">
          {warnings.map((warning) => <WarningCard key={warning.id} warning={warning} isLightMode={isLightMode} />)}
        </div>
        <div className="shrink-0 border-t border-red-500/20 p-4 sm:p-5">
          {(acceptError || error) && <p role="alert" className="mb-3 text-sm text-red-500">{acceptError || error}</p>}
          <p className="mb-3 text-xs opacity-70">A copy remains in your inbox history.</p>
          <button ref={acceptButton} type="button" disabled={accepting} onClick={() => void accept()} className="w-full rounded-xl bg-red-600 px-4 py-3 text-base font-bold text-white disabled:opacity-50">{accepting ? "Accepting..." : warnings.length === 1 ? "Accept warning" : "Accept all warnings"}</button>
        </div>
      </div>
    </div>, document.body,
  );
}

export function ListingWarningHistory({ isLightMode }: { isLightMode: boolean }) {
  const { warnings, error, loading, retry } = useListingWarnings(false);
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(warnings.length / 10));
  const currentPage = Math.min(page, pageCount);
  if (loading) return <p className="py-3 text-sm opacity-60">Loading moderation history...</p>;
  if (error) return <p role="alert" className="py-3 text-sm text-red-500">Unable to load moderation history. <button type="button" onClick={retry} className="underline">Retry</button></p>;
  if (!warnings.length) return null;
  return (
    <section className="mt-5 space-y-3" aria-label="Moderation warning history">
      <h3 className="px-1 text-xs font-semibold uppercase tracking-[0.14em] opacity-60">History - listing warnings</h3>
      {warnings.slice((currentPage - 1) * 10, currentPage * 10).map((warning) => <WarningCard key={warning.id} warning={warning} isLightMode={isLightMode} />)}
      {pageCount > 1 && <nav aria-label="Warning history pages" className="flex items-center justify-between gap-3 text-sm">
        <button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="rounded-xl border border-zinc-500/30 p-3 disabled:opacity-40">Previous</button>
        <span>{currentPage} / {pageCount}</span>
        <button type="button" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} className="rounded-xl border border-zinc-500/30 p-3 disabled:opacity-40">Next</button>
      </nav>}
    </section>
  );
}
