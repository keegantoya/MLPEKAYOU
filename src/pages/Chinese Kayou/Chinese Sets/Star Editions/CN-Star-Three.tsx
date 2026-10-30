import ChineseCardInspector from "../../ChineseCardInspector";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ScanSearch } from "lucide-react";
import { CN_STAR_THREE_CARDS, CN_STAR_THREE_SET_ID, CN_STAR_THREE_IMAGE_REVISION, getChineseStarThreeImageStyle, useChineseCardImage } from "../../card-images-cn";
export { CN_STAR_THREE_CARDS, CN_STAR_THREE_SET_ID };
import type { CSSProperties } from "react";
import { supabase } from "@/lib/supabase";
import { saveCollectionProgress } from "@/lib/saveCollectionProgress";
type Progress = Record<string, boolean>;
function ChineseCardFront({ src, alt, className, style }: { src: string; alt: string; className?: string; style?: CSSProperties }) {
const image = useChineseCardImage(src);
  return image.url ? <img src={image.url} alt={alt} draggable={false} className={className} style={style} /> : <span className="flex h-full w-full items-center justify-center p-4 text-center text-xs text-muted-foreground" title={image.error || undefined} role="status">{image.error ? "Image unavailable" : "Loading card..."}</span>;
}
export default function ChineseStarThree() {
const [inspected, setInspected] = useState<string | null>(null);
const [cardSize, setCardSize] = useState(160);
const imageRevision = CN_STAR_THREE_IMAGE_REVISION;
const imageSource = (src: string) => { const url = new URL(src); url.searchParams.set("v", imageRevision); return url.href; };
const [search, setSearch] = useState("");
const inspectorCard = CN_STAR_THREE_CARDS.find(card => card.key === inspected);
const [progress, setProgress] = useState<Progress>({});
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState<string | null>(null);
const [error, setError] = useState("");
const [activeRarity, setActiveRarity] = useState("MTR");
const [filter, setFilter] = useState<"all" | "missing" | "collected">("all");
const [retry, setRetry] = useState(0);
const [ready, setReady] = useState(false);
const identity = useRef<string | null>(null);
const generation = useRef(0);
const savingRef = useRef(false);
  useEffect(() => {
let mounted = true;
const load = async () => {
const ticket = ++generation.current;
      setLoading(true);
      setReady(false);
      setError("");
      setProgress({});
      identity.current = null;
      try {
const { data, error: authError } = await supabase.auth.getUser();
        if (!mounted || ticket !== generation.current) return;
        if (authError || !data.user) throw new Error("Log in to view and save your Chinese Star Three collection.");
        identity.current = data.user.id;
const { data: row, error: loadError } = await supabase
          .from("collection_progress_raw")
          .select("progress")
          .eq("user_id", data.user.id)
          .eq("set_id", CN_STAR_THREE_SET_ID)
          .maybeSingle();
        if (!mounted || ticket !== generation.current) return;
        if (loadError) throw loadError;
const next: Progress = {};
        if (row?.progress && typeof row.progress === "object" && !Array.isArray(row.progress)) {
          Object.entries(row.progress).forEach(([key, value]) => {
            next[key] = value === true || Boolean(value && typeof value === "object" && !Array.isArray(value) && "owned" in value && value.owned === true);
          });
        }
        setProgress(next);
        setReady(true);
      } catch (cause) {
        if (mounted && ticket === generation.current) setError(cause instanceof Error ? cause.message : "Your collection could not be loaded. Try again.");
      } finally {
        if (mounted && ticket === generation.current) setLoading(false);
      }
    };
    void load();
const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "INITIAL_SESSION" && (session?.user.id ?? null) !== identity.current) {
        ++generation.current;
        identity.current = null;
        setReady(false);
        setProgress({});
        setSaving(null);
        savingRef.current = false;
        setRetry(value => value + 1);
      }
    });
    return () => {
      mounted = false;
      ++generation.current;
      subscription.unsubscribe();
    };
  }, [retry]);
const toggle = async (key: string) => {
    if (!ready || loading || savingRef.current || !identity.current) return;
    savingRef.current = true;
    setSaving(key);
    setError("");
const previous = progress;
const next = { ...previous, [key]: !previous[key] };
const ticket = generation.current;
const userId = identity.current;
    setProgress(next);
    try {
const { data, error: authError } = await supabase.auth.getUser();
      if (authError || data.user?.id !== userId) throw new Error("Your session changed. Reload your collection before saving.");
      if (ticket !== generation.current) return;
const saveError = await saveCollectionProgress(CN_STAR_THREE_SET_ID, next);
      if (saveError) throw saveError;
    } catch {
      if (ticket === generation.current) {
        setProgress(previous);
        setError("That change could not be saved. Your previous collection has been restored. Please try again.");
      }
    } finally {
      if (ticket === generation.current) {
        savingRef.current = false;
        setSaving(null);
      }
    }
  };
const collected = CN_STAR_THREE_CARDS.filter(card => progress[card.key]).length;
const percent = Math.round(collected / CN_STAR_THREE_CARDS.length * 100);
const rarities = Array.from(new Set(CN_STAR_THREE_CARDS.map(card => card.key.split("-")[0])));
const query = search.trim().toLowerCase();
const visibleCards = CN_STAR_THREE_CARDS.filter(card => (query ? card.code.toLowerCase().includes(query) : card.rarity === activeRarity) && (filter === "all" || (filter === "collected" ? progress[card.key] : !progress[card.key])));
const searchCodes = (value: string) => {
  setSearch(value);
  if (value.trim()) {
    setFilter("all");
const match = CN_STAR_THREE_CARDS.find(card => card.code.toLowerCase().includes(value.trim().toLowerCase()));
    if (match) setActiveRarity(match.rarity);
  }
};
  return (
    <main className="cn-gallery min-h-screen min-w-0 bg-background px-4 pb-28 pt-6 text-foreground sm:px-6 sm:pb-12 sm:pt-8">
      <style>{`
        .cn-gallery { font-family:'Oxanium',sans-serif; }
        .cn-gallery * { box-sizing:border-box; }
        .cn-shell { display:grid;grid-template-columns:150px minmax(0,1fr);gap:28px;align-items:start; }
        .cn-rarities { display:flex;flex-direction:column;gap:5px; }
        .cn-rarity { display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:48px;padding:10px 12px;border-radius:10px;color:hsl(var(--muted-foreground));text-align:left; }
        .cn-rarity[aria-pressed=true] { background:hsl(var(--primary) / .12);color:hsl(var(--primary));box-shadow:inset 3px 0 hsl(var(--primary)); }
        .cn-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,var(--cn-card-size)),1fr));gap:24px 16px; }
        .cn-art { display:block;position:relative;width:100%;aspect-ratio:5/7;overflow:hidden;border-radius:12px;background:hsl(var(--muted)); }
        .cn-art img { transition:filter .2s,opacity .2s; }
        .cn-inspect { position:absolute;bottom:8px;right:8px;display:flex;align-items:center;gap:5px;padding:6px 8px;border-radius:8px;background:rgba(0,0,0,.78);color:white;font-size:10px; }
        .cn-art:focus-visible,.cn-rarity:focus-visible { outline:2px solid hsl(var(--primary));outline-offset:4px; }
        @media(max-width:767px) { .cn-shell { grid-template-columns:minmax(0,1fr);gap:20px; }.cn-rarities { flex-direction:row;flex-wrap:wrap;gap:6px; }.cn-rarity { flex:1 0 80px;min-height:42px;border:1px solid hsl(var(--border));padding:8px 10px; }.cn-rarity[aria-pressed=true] { box-shadow:none;border-color:hsl(var(--primary)); }.cn-grid { gap:20px 12px;grid-template-columns:repeat(auto-fill,minmax(min(100%,var(--cn-card-size)),1fr)); } }
        @media(max-width:480px) { .cn-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
        @media(prefers-reduced-motion:reduce) { .cn-art img { transition:none; } }
      `}</style>
      <header className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3"><Link to="/collections-chinese" aria-label="Back to Chinese Collections" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"><ArrowLeft size={16} aria-hidden="true" /></Link><div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-primary">Chinese Kayou / Star Series</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Star Three<span className="ml-3 align-middle text-xs font-normal tracking-normal text-muted-foreground">{CN_STAR_THREE_CARDS.length} cards</span></h1></div></div>
        <div className="w-full sm:w-60" aria-live="polite"><div className="mb-2 flex items-baseline justify-between gap-6"><span className="text-xs text-muted-foreground">Progress on Star Three</span><span className="text-xl font-semibold tabular-nums">{ready ? collected : "--"}<span className="text-xs font-normal text-muted-foreground"> / {CN_STAR_THREE_CARDS.length}</span></span></div><div className="h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Star Three collection" aria-valuemin={0} aria-valuemax={CN_STAR_THREE_CARDS.length} aria-valuenow={ready ? collected : 0}><div className="h-full bg-primary" style={{ width: `${ready ? percent : 0}%` }} /></div></div>
      </header>
      <p role="note" className="mb-5 text-xs leading-5 text-muted-foreground">The 3D renders for this set are not finished yet because Kayou CN has not uploaded all the proper back files. SCR, MTR, and SSR use a blurred placeholder for now.</p>
      <div className="cn-shell">
        <aside aria-label="Card rarities"><p className="mb-3 text-[10px] font-semibold uppercase tracking-[.18em] text-muted-foreground">Rarities</p><div className="cn-rarities">{rarities.map(rarity => <button type="button" key={rarity} onClick={() => { setActiveRarity(rarity); setSearch(""); }} aria-pressed={activeRarity === rarity} className="cn-rarity"><span className="text-sm font-semibold">{rarity === "DAR" ? "\u25C7AR" : rarity === "DN" ? "\u25C7N" : rarity === "DCR" ? "\u25C7CR" : rarity}</span><span className="text-[10px] tabular-nums">{CN_STAR_THREE_CARDS.filter(card => card.rarity === rarity && progress[card.key]).length}/{CN_STAR_THREE_CARDS.filter(card => card.rarity === rarity).length}</span></button>)}</div></aside>
        <section className="min-w-0" aria-label={`${activeRarity} cards`}>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-lg font-semibold">{query ? "Search results" : activeRarity === "DAR" ? "\u25C7AR" : activeRarity === "DN" ? "\u25C7N" : activeRarity === "DCR" ? "\u25C7CR" : activeRarity}<span className="ml-2 text-xs font-normal text-muted-foreground">{visibleCards.length} cards</span></h2></div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="sr-only" htmlFor="cn-search">Search card codes</label><input id="cn-search" type="search" value={search} onChange={event => searchCodes(event.target.value)} placeholder="Find a code..." className="h-10 w-40 min-w-0 rounded-lg border border-border bg-card px-3 text-base" />
              <label className="sr-only" htmlFor="cn-filter">Collection filter</label><select id="cn-filter" value={filter} onChange={event => setFilter(event.target.value as typeof filter)} className="h-10 rounded-lg border border-border bg-card px-2 text-base"><option value="all">All cards</option><option value="missing">Missing</option><option value="collected">Collected</option></select>
              <label className="sr-only" htmlFor="cn-size">Card size</label><select id="cn-size" value={cardSize} onChange={event => setCardSize(Number(event.target.value))} className="hidden h-10 rounded-lg border border-border bg-card px-2 text-base sm:block"><option value={120}>Compact</option><option value={160}>Standard</option><option value={200}>Large</option></select>
            </div>
          </div>
          {error && <div role="alert" className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm">{error}{!ready && <button type="button" onClick={() => setRetry(value => value + 1)} className="ml-3 underline">Retry</button>}</div>}
          {loading ? <div role="status" className="py-16 text-center text-sm text-muted-foreground">Loading your collection...</div> : !ready ? null : visibleCards.length === 0 ? <p className="py-16 text-center text-sm text-muted-foreground">No matching cards. Adjust your search or filter.</p> : <div className="cn-grid" style={{ "--cn-card-size": `${cardSize}px` } as CSSProperties}>{visibleCards.map(card => {
const owned = Boolean(progress[card.key]);
            return <article key={card.key} className="min-w-0">
              <div className="relative"><button type="button" disabled={saving !== null} onClick={() => void toggle(card.key)} aria-pressed={owned} aria-label={`${card.code}, ${owned ? "collected; mark missing" : "missing; mark collected"}`} className="cn-art"><ChineseCardFront src={imageSource(card.image)} alt={card.code} className="h-full w-full object-cover" style={{ ...getChineseStarThreeImageStyle(card.key), filter: owned ? "none" : "grayscale(1)", opacity: owned ? 1 : .65 }} /></button><button type="button" onClick={() => { setInspected(card.key); }} aria-label={`Inspect ${card.code}`} className="cn-inspect min-h-9"><ScanSearch size={12} aria-hidden="true" /> 3D</button></div>
              <p className="mb-2 mt-3 break-words text-xs font-semibold tracking-tight">{card.code}</p>
              <button type="button" disabled={saving !== null} aria-pressed={owned} onClick={() => void toggle(card.key)} aria-label={`${card.code}, ${owned ? "collected; mark missing" : "missing; mark collected"}`} className={`min-h-9 w-full rounded-lg border px-2 text-[11px] font-medium disabled:cursor-wait ${owned ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}>{saving === card.key ? "Saving..." : owned ? "Collected" : "Missing"}</button>
            </article>;
          })}</div>}
          <p role="status" aria-live="polite" className="mt-4 min-h-5 text-xs text-muted-foreground">{saving ? "Saving your collection..." : ""}</p>
        </section>
      </div>
      <ChineseCardInspector card={inspectorCard ? { key: inspectorCard.key, code: inspectorCard.code, front: imageSource(inspectorCard.image), back: inspectorCard.back, frontStyle: getChineseStarThreeImageStyle(inspectorCard.key) } : null} onClose={() => setInspected(null)} onPrevious={() => { const index = visibleCards.findIndex(card => card.key === inspected); setInspected(visibleCards[(index - 1 + visibleCards.length) % visibleCards.length]?.key ?? null); }} onNext={() => { const index = visibleCards.findIndex(card => card.key === inspected); setInspected(visibleCards[(index + 1) % visibleCards.length]?.key ?? null); }}/>
    </main>
  );
}
