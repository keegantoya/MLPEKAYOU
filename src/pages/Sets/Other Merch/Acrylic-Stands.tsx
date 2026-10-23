import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ScanSearch, Check } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { CARD_IMAGE_WORKER_URL } from "@/lib/card-images";
import { getCachedCardImage } from "@/lib/card-image-cache";
import { ENGLISH_MERCHANDISE_SET_ID, getMerchandiseSet, isMerchandiseOwned, type MerchandiseItem } from "@/lib/english-merchandise-catalog";
const set = getMerchandiseSet("acrylic-stands")!;
const seriesNames = Array.from(new Set(set.items.map(item => item.series)));
type SessionImage = { userId: string; token: string };
function StandImage({ item, session, owned = true }: { item: MerchandiseItem; session: SessionImage; owned?: boolean }) {
  const [source, setSource] = useState<{ path: string; userId: string; url: string } | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    let release: (() => void) | undefined;
    setSource(null);
    setFailed(false);
    void getCachedCardImage(item.image, session.userId, async signal => {
      const url = `${CARD_IMAGE_WORKER_URL.replace(/\/$/, "")}/${item.image.split("/").map(encodeURIComponent).join("/")}`;
      const request = (token: string) => fetch(url, { signal, credentials: "omit", headers: { Authorization: `Bearer ${token}` } });
      const response = await request(session.token);
      if (response.status !== 401 || signal.aborted) return response;
      const { data, error } = await supabase.auth.refreshSession();
      if (error || data.session?.user.id !== session.userId || signal.aborted) return response;
      return request(data.session.access_token);
    }).then(image => {
      if (cancelled) { image?.release(); return; }
      release = image?.release;
      if (image) setSource({ path: item.image, userId: session.userId, url: image.url });
      else setFailed(true);
    }).catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; release?.(); };
  }, [item.image, session.userId, session.token]);
  if (failed) return <span className="flex h-full items-center justify-center px-2 text-center text-xs text-muted-foreground">Image unavailable</span>;
  if (!source || source.path !== item.image || source.userId !== session.userId) return <span role="status" className="flex h-full items-center justify-center text-xs text-muted-foreground">Loading...</span>;
  return <img src={source.url} alt={`Acrylic stand ${item.number}, ${item.level}`} draggable={false} loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-contain transition-[filter,opacity] duration-200 motion-reduce:transition-none" style={{ filter: owned ? "none" : "grayscale(1)", opacity: owned ? 1 : .6 }} />;
}
function StandInspector({ item, session }: { item: MerchandiseItem; session: SessionImage }) {
  const [zoom, setZoom] = useState(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const stage = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const move = (x: number, y: number) => {
    const node = stage.current;
    if (!node) return;
    const maxX = node.clientWidth * (zoom / 100 - 1) / 2;
    const maxY = node.clientHeight * (zoom / 100 - 1) / 2;
    setPan({ x: Math.max(-maxX, Math.min(maxX, x)), y: Math.max(-maxY, Math.min(maxY, y)) });
  };
  return <>
    <div ref={stage} role="group" tabIndex={0} aria-label="Stand image. Zoom and drag, or use arrow keys to move." className="relative min-h-0 flex-1 overflow-hidden bg-muted/30 outline-none focus-visible:ring-2 focus-visible:ring-primary" style={{ touchAction: "none", cursor: zoom > 100 ? "grab" : "default" }} onKeyDown={event => {
      const offset = { ArrowLeft: [-20, 0], ArrowRight: [20, 0], ArrowUp: [0, -20], ArrowDown: [0, 20] }[event.key];
      if (offset) { event.preventDefault(); move(pan.x + offset[0], pan.y + offset[1]); }
    }} onPointerDown={event => {
      if (zoom <= 100 || (event.pointerType === "mouse" && event.button !== 0)) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      drag.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y };
    }} onPointerMove={event => { if (drag.current) move(drag.current.panX + event.clientX - drag.current.x, drag.current.panY + event.clientY - drag.current.y); }} onPointerUp={event => { drag.current = null; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }} onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }}>
      <div className="h-full w-full p-3" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})` }}><StandImage item={item} session={session} /></div>
    </div>
    <label className="flex shrink-0 items-center gap-2 text-xs"><span>Zoom</span><input aria-label="Stand image zoom" type="range" min={100} max={400} step={10} value={zoom} onChange={event => { setZoom(Number(event.target.value)); setPan({ x: 0, y: 0 }); drag.current = null; }} className="min-w-0 flex-1 accent-primary"/><output className="w-10 text-right">{zoom}%</output><button type="button" onClick={() => { setZoom(100); setPan({ x: 0, y: 0 }); }} className="min-h-10 rounded-lg border border-border px-3">Reset</button></label>
  </>;
}
const acrylicStandsStyles = `
.stand-page{--stand-bg:hsl(var(--background));--stand-panel:hsl(var(--card));--stand-subtle:hsl(var(--muted));--stand-ink:hsl(var(--foreground));--stand-muted:hsl(var(--muted-foreground));--stand-border:hsl(var(--border));--stand-accent:hsl(var(--primary));--stand-accent-ink:hsl(var(--primary-foreground));--stand-green:#15803d;min-height:calc(100dvh - var(--kayou-header-bottom,64px));background:var(--stand-bg);color:var(--stand-ink);font-family:Oxanium,system-ui,sans-serif;padding-bottom:max(12px,env(safe-area-inset-bottom))}
.dark .stand-page{--stand-green:#86efac}
.stand-page *{box-sizing:border-box}
.stand-page button{font:inherit;cursor:pointer;color:inherit;border:0;touch-action:manipulation}
.stand-page button:disabled{cursor:wait;opacity:.7}
.stand-page button:focus-visible,.stand-icon-button:focus-visible{outline:2px solid var(--stand-accent);outline-offset:4px}
.stand-main{width:100%;padding:16px 24px}
.stand-header{display:flex;align-items:center;gap:18px;padding:20px;background:var(--stand-panel);border:1px solid var(--stand-border);border-radius:22px}
.stand-icon-button{width:42px;height:42px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border-radius:13px;background:var(--stand-subtle);color:inherit;text-decoration:none}
.stand-heading{flex:1;min-width:0}.stand-eyebrow{margin:0 0 5px;font-size:10px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--stand-muted)}
.stand-heading h1{font-size:clamp(24px,2.5vw,34px);line-height:1.1;margin:0;letter-spacing:-.035em}
.stand-heading>p:last-child{margin:8px 0 0;font-size:12px;color:var(--stand-muted);line-height:1.5}
.stand-total{display:flex;flex-direction:column;gap:7px;min-width:175px;max-width:260px;flex:1}
.stand-total strong{font-size:26px;line-height:1}.stand-total strong span{font-size:16px;font-weight:500;color:var(--stand-muted)}.stand-total>span{font-size:11px;color:var(--stand-muted)}
.stand-progress-track{height:5px;border-radius:8px;background:var(--stand-subtle);overflow:hidden}.stand-progress-track>div{height:100%;background:var(--stand-accent);border-radius:8px;transition:width .25s}
.stand-mode,.stand-filters{display:flex;padding:4px;gap:4px;border-radius:14px;background:var(--stand-subtle)}
.stand-mode button,.stand-filters button{display:flex;align-items:center;justify-content:center;gap:7px;min-height:40px;white-space:nowrap;border-radius:11px;background:transparent;padding:9px 13px;font-size:12px;font-weight:600;color:var(--stand-muted)}
.stand-mode .is-active{background:var(--stand-accent);color:var(--stand-accent-ink)}.stand-filters .is-active{background:var(--stand-panel);color:var(--stand-ink);box-shadow:0 1px 5px #00000008}
.stand-rarities{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:14px 0}
.stand-rarities button{flex:0 0 auto;width:auto;max-width:100%;min-height:48px;white-space:nowrap;line-height:1.25;display:flex;align-items:center;justify-content:center;gap:10px;border:1px solid var(--stand-border);background:var(--stand-panel);border-radius:13px;padding:9px 12px;transition:background .15s,transform .15s}
.stand-rarities strong{font-size:14px;white-space:nowrap}.stand-rarities button>span{flex-shrink:0;white-space:nowrap;font-size:11px;color:var(--stand-muted)}.stand-rarities .is-complete{color:var(--stand-green)}.stand-rarities .is-active{background:var(--stand-accent);border-color:transparent;color:var(--stand-accent-ink)}.stand-rarities .is-active>span{color:inherit;opacity:.8}
.stand-catalog{background:var(--stand-panel);border:1px solid var(--stand-border);border-radius:22px;padding:20px}
.stand-catalog-header{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:18px}.stand-catalog-header h2{font-size:20px;margin:0;letter-spacing:-.02em}.stand-catalog-header p{margin:5px 0 0;font-size:12px;color:var(--stand-muted)}
.stand-card-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:18px 14px}.stand-grid-card{min-width:0}.stand-card-button{display:block;position:relative;width:100%;aspect-ratio:1/1;overflow:hidden;border-radius:8px!important;background:var(--stand-subtle);transition:transform .18s,box-shadow .18s;box-shadow:0 3px 10px #0000000a;padding:0}
.stand-owned-badge,.stand-inspect-badge{position:absolute;display:flex;align-items:center;justify-content:center;gap:4px;padding:5px;border-radius:8px;background:#128347;color:#fff;top:7px;right:7px;pointer-events:none;box-shadow:0 2px 7px #00000020}.stand-inspect-badge{background:#151719d9;color:#fff;top:auto;bottom:7px;font-size:10px;padding:5px 7px}
.stand-card-caption{display:flex;align-items:center;justify-content:space-between;gap:5px;padding:9px 1px 0;font-size:clamp(9px,.8vw,11px);font-weight:500;color:var(--stand-muted)}.stand-owned-dot,.stand-missing-dot{width:5px;height:5px;flex-shrink:0;border-radius:5px;background:#22c55e}.stand-missing-dot{background:var(--stand-muted);opacity:.4}
.stand-empty{text-align:center;padding:45px 20px;color:var(--stand-muted);border:1px dashed var(--stand-border);border-radius:16px}.stand-empty>svg{margin:0 auto 10px}.stand-empty h3{font-size:16px;color:var(--stand-ink);margin:0 0 8px}.stand-empty p{font-size:13px;margin:0}.stand-empty button{margin-top:18px;padding:12px 18px;background:var(--stand-accent);color:var(--stand-accent-ink);border-radius:12px;font-size:12px;font-weight:600}
.stand-error{display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-bottom:16px;font-size:13px;color:#dc2626}.stand-error button{min-height:40px;padding:8px 12px;border:1px solid var(--stand-border);border-radius:10px;color:var(--stand-ink);background:var(--stand-subtle)}.stand-loading{padding:40px 0;font-size:13px;color:var(--stand-muted)}.stand-saving{margin:14px 0 0;font-size:12px;color:var(--stand-muted)}
@media(hover:hover){.stand-card-button:hover{transform:translateY(-3px);box-shadow:0 7px 18px #00000018}.stand-rarities button:hover{transform:translateY(-1px)}.stand-icon-button:hover{filter:brightness(.95)}}
@media(max-width:1000px){.stand-header{flex-wrap:wrap;gap:14px}.stand-heading{flex-basis:calc(100% - 60px)}.stand-total{max-width:none;min-width:120px}.stand-mode{flex-shrink:0}.stand-card-grid{grid-template-columns:repeat(auto-fill,minmax(145px,1fr))}}
@media(max-width:767px){.stand-card-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:14px 8px}}
@media(max-width:600px){.stand-main{padding:10px 10px 0}.stand-header{padding:14px;border-radius:18px;gap:12px}.stand-heading h1{font-size:25px}.stand-heading>p:last-child{font-size:11px}.stand-total{flex-basis:100%;gap:6px}.stand-total strong{font-size:23px}.stand-mode{width:100%}.stand-mode button{flex:1}.stand-rarities{gap:6px;padding:10px 0}.stand-rarities button{padding:8px 12px;gap:7px;min-height:44px}.stand-rarities strong{font-size:12px}.stand-rarities button>span{font-size:10px}.stand-catalog{padding:12px;border-radius:18px}.stand-catalog-header{flex-wrap:wrap;gap:10px;margin-bottom:14px}.stand-catalog-header h2{font-size:17px}.stand-filters{width:100%}.stand-filters button{flex:1;min-height:36px;font-size:11px}.stand-card-caption{font-size:10px}.stand-owned-badge{top:5px;right:5px;padding:4px}.stand-inspect-badge{right:5px;bottom:5px;font-size:9px}}
@media(prefers-reduced-motion:reduce){.stand-page *{transition:none!important}.stand-card-button:hover,.stand-rarities button:hover{transform:none}}
`;
export default function AcrylicStands() {
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);
  const [session, setSession] = useState<SessionImage | null>(null);
  const [progress, setProgress] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [saving, setSaving] = useState<string | null>(null);
  const [activeSeries, setActiveSeries] = useState(seriesNames[0] ?? "");
  const [viewMode, setViewMode] = useState(false);
  const [filter, setFilter] = useState<"all" | "collected" | "missing">("all");
  const [inspected, setInspected] = useState<string | null>(null);
  const identity = useRef<string | null>(null);
  const generation = useRef(0);
  const saveLock = useRef(false);
  useEffect(() => {
    let disposed = false;
    const ticket = ++generation.current;
    setLoading(true); setReady(false); setError(""); setProgress({}); setSession(null); setInspected(null);
    const load = async () => {
      const { data, error: authError } = await supabase.auth.getSession();
      if (disposed || ticket !== generation.current) return;
      if (authError || !data.session) throw new Error("Sign in to view and save your acrylic stands.");
      identity.current = data.session.user.id;
      const nextSession = { userId: data.session.user.id, token: data.session.access_token };
      const { data: row, error: loadError } = await supabase.from("collection_progress_raw").select("progress").eq("user_id", nextSession.userId).eq("set_id", ENGLISH_MERCHANDISE_SET_ID).maybeSingle();
      if (disposed || ticket !== generation.current) return;
      if (loadError) throw loadError;
      const saved = row?.progress;
      setProgress(saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {});
      setSession(nextSession); setReady(true);
    };
    void load().catch(cause => { if (!disposed && ticket === generation.current) setError(cause instanceof Error ? cause.message : "Your stands could not be loaded. Try again."); }).finally(() => { if (!disposed && ticket === generation.current) setLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === "INITIAL_SESSION" || (next?.user.id ?? null) === identity.current) return;
      ++generation.current; identity.current = next?.user.id ?? null; saveLock.current = false; setSaving(null); setReady(false); setSession(null); setProgress({}); setInspected(null); setRetry(value => value + 1);
    });
    return () => { disposed = true; ++generation.current; subscription.unsubscribe(); };
  }, [retry]);
  const toggle = async (item: MerchandiseItem) => {
    if (!ready || !session || saveLock.current) return;
    saveLock.current = true; setSaving(item.key); setError("");
    const ticket = generation.current;
    const owned = !isMerchandiseOwned(progress[item.key]);
    const previous = progress;
    const value = previous[item.key];
    setProgress({ ...previous, [item.key]: value && typeof value === "object" && !Array.isArray(value) ? { ...value, owned } : owned });
    try {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (ticket !== generation.current) return;
      if (authError || auth.user?.id !== session.userId) throw new Error("Your session changed. Reload before saving.");
      const { data, error: saveError } = await supabase.rpc("set_english_merchandise_owned", { p_key: item.key, p_owned: owned });
      if (ticket !== generation.current) return;
      if (saveError) throw saveError;
      if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("The saved collection could not be confirmed.");
      setProgress(data);
      window.dispatchEvent(new CustomEvent("english-merchandise-changed", { detail: { userId: session.userId } }));
    } catch (cause) {
      if (ticket === generation.current) { setProgress(previous); setError(cause instanceof Error ? cause.message : "That change could not be saved. Please try again."); }
    } finally { if (ticket === generation.current) { saveLock.current = false; setSaving(null); } }
  };
  const collected = set.items.filter(item => isMerchandiseOwned(progress[item.key])).length;
  const items = set.items.filter(item => item.series === activeSeries && (filter === "all" || (filter === "collected" ? isMerchandiseOwned(progress[item.key]) : !isMerchandiseOwned(progress[item.key]))));
  const item = set.items.find(value => value.key === inspected);
  const adjacent = (direction: number) => { if (!item || !items.length) return; const index = items.findIndex(value => value.key === item.key); setInspected(items[(index + direction + items.length) % items.length].key); };
  const seriesItems = set.items.filter(stand => stand.series === activeSeries);
  const seriesCollected = seriesItems.filter(stand => isMerchandiseOwned(progress[stand.key])).length;
  return <div className="stand-page">
    <style>{acrylicStandsStyles}</style>
    <main className="stand-main">
      <header className="stand-header">
        <Link to="/collections" state={{ category: "merch" }} className="stand-icon-button" aria-label="Back to collections"><ArrowLeft size={20}/></Link>
        <div className="stand-heading"><p className="stand-eyebrow">Merchandise</p><h1>Acrylic Stands</h1><p>{viewMode ? "Choose a stand to inspect it up close." : "Tap a stand to mark it collected or missing."}</p></div>
        <div className="stand-total"><strong>{ready ? collected : "--"}<span> / {set.items.length}</span></strong><span>{ready ? `${set.items.length - collected} still to collect` : "Loading your collection"}</span><div className="stand-progress-track" role="progressbar" aria-label="Acrylic stands collected" aria-valuemin={0} aria-valuemax={set.items.length} aria-valuenow={ready ? collected : 0}><div style={{ width: `${collected / set.items.length * 100}%` }}/></div></div>
        <div className="stand-mode" role="group" aria-label="Stand interaction mode"><button type="button" aria-pressed={!viewMode} className={!viewMode ? "is-active" : ""} onClick={() => setViewMode(false)}><Check size={16}/>Collect</button><button type="button" aria-pressed={viewMode} className={viewMode ? "is-active" : ""} onClick={() => setViewMode(true)}><ScanSearch size={16}/>Inspect</button></div>
      </header>
      <nav className="stand-rarities" aria-label="Acrylic stand editions">{seriesNames.map(series => {
        const stands = set.items.filter(stand => stand.series === series);
        const owned = stands.filter(stand => isMerchandiseOwned(progress[stand.key])).length;
        return <button key={series} type="button" aria-pressed={activeSeries === series} className={`${activeSeries === series ? "is-active" : ""} ${ready && owned === stands.length ? "is-complete" : ""}`} onClick={() => { setActiveSeries(series); setInspected(null); }}><strong>{series}</strong><span>{ready ? owned : "--"}/{stands.length}</span>{ready && owned === stands.length && <Check size={13}/>}</button>;
      })}</nav>
      <section className="stand-catalog" aria-label={`${activeSeries} acrylic stands`}>
        <div className="stand-catalog-header"><div><h2>{activeSeries}</h2><p>{ready ? seriesCollected : "--"} of {seriesItems.length} collected</p></div><div className="stand-filters" role="group" aria-label="Filter stands">{(["all", "missing", "collected"] as const).map(value => <button type="button" key={value} aria-pressed={filter === value} className={filter === value ? "is-active" : ""} onClick={() => setFilter(value)}>{value === "all" ? "All stands" : value === "collected" ? "Collected" : "Missing"}</button>)}</div></div>
        {error && <div role="alert" className="stand-error"><span>{error}</span>{!ready && <button type="button" onClick={() => setRetry(value => value + 1)}>Retry</button>}</div>}
        {loading ? <p role="status" className="stand-loading">Loading your stands...</p> : ready && session ? items.length ? <div className="stand-card-grid">{items.map(stand => {
          const owned = isMerchandiseOwned(progress[stand.key]);
          return <article key={stand.key} className={`stand-grid-card ${owned ? "is-owned" : ""}`}><button type="button" disabled={!viewMode && saving !== null} onClick={() => { if (viewMode) setInspected(stand.key); else void toggle(stand); }} aria-pressed={viewMode ? undefined : owned} aria-label={viewMode ? `Inspect stand ${stand.number}, ${stand.level}` : `Stand ${stand.number}, ${stand.level}, ${owned ? "collected; mark missing" : "missing; mark collected"}`} className="stand-card-button"><StandImage item={stand} session={session} owned={owned}/>{owned && <span className="stand-owned-badge"><Check size={13}/><span className="sr-only">Collected</span></span>}{viewMode && <span className="stand-inspect-badge"><ScanSearch size={13}/>Inspect</span>}</button><div className="stand-card-caption"><span>{stand.level}</span><span className={owned ? "stand-owned-dot" : "stand-missing-dot"} aria-label={owned ? "Collected" : "Missing"}/></div></article>;
        })}</div> : <div className="stand-empty"><Check size={24}/><h3>{filter === "missing" ? "This edition is complete" : "No collected stands here yet"}</h3><p>{filter === "missing" ? "Every stand in this edition is in your collection." : "Switch to All stands to start tracking your collection."}</p><button type="button" onClick={() => setFilter("all")}>Show all stands</button></div> : null}
        {saving && <p role="status" className="stand-saving">Saving...</p>}
      </section>
    </main>
    <Dialog open={!!item && !!session} onOpenChange={open => { if (!open) setInspected(null); }}><DialogContent className="flex h-[min(560px,80dvh)] max-h-[calc(100dvh_-_24px)] w-[calc(100%_-_24px)] max-w-[340px] flex-col gap-2 overflow-hidden rounded-2xl bg-background p-3 text-foreground sm:h-[min(640px,85dvh)] sm:max-w-lg" style={{ zIndex: 100001 }}><DialogTitle className="pr-8 text-base">Acrylic Stand {item?.number}</DialogTitle><DialogDescription className="text-xs">{item?.series} / {item?.level}</DialogDescription>{item && session && <StandInspector key={item.key} item={item} session={session}/>}<div className="flex shrink-0 justify-between gap-3"><button type="button" disabled={items.length < 2} onClick={() => adjacent(-1)} className="min-h-10 rounded-lg border border-border px-3 text-xs">Previous</button><button type="button" disabled={items.length < 2} onClick={() => adjacent(1)} className="min-h-10 rounded-lg border border-border px-3 text-xs">Next</button></div></DialogContent></Dialog>
  </div>;
}
