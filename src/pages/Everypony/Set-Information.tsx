import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { supabase } from "@/lib/supabase";
import { CARD_IMAGE_WORKER_URL } from "@/lib/card-images";
import { getCachedCardImage } from "@/lib/card-image-cache";
import { onAuthIdentityChange } from "@/lib/auth-identity";

type Language = "english" | "chinese";
type BoxKind = "display" | "collector" | "gift" | "starter" | "merchandise";
type Probability = { ratio: string; contents: string };
type BoxVariant = {
  id: string;
  label: string;
  kind: BoxKind;
  image: string | null;
  model?: string | null;
  packs: number | null;
  cardsPerPack: number | null;
  cardCount?: number | null;
  release?: string | null;
  source: string | null;
  sourceLabel: string | null;
  probabilities: Probability[];
};
type BoxSet = {
  id: string;
  name: string;
  subtitle: string;
  language: Language;
  family: string;
  variants: BoxVariant[];
  cardCount: number | null;
  pending: boolean;
};

const families = [
  { id: "all", label: "All sets" },
  { id: "moon", label: "Moon" },
  { id: "fun", label: "Fun Moments" },
  { id: "rainbow", label: "Rainbow" },
  { id: "star", label: "Star" },
  { id: "tcg", label: "TCG" },
  { id: "other", label: "Other" },
];
const kindNames: Record<BoxKind, string> = {
  display: "Display box",
  collector: "Collector box",
  gift: "Gift box",
  starter: "Starter deck",
  merchandise: "Merchandise",
};
const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

function Icon({ name, size = 20 }: { name: "box" | "search" | "close" | "arrow" | "link"; size?: number }) {
  const paths = {
    box: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="M3 8v9l9 5 9-5V8M12 13v9M7.5 5.5l9 5" /></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    link: <><path d="M14 3h7v7m0-7L10 14" /><path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function BoxImage({ src, alt, large = false }: { src: string | null; alt: string; large?: boolean }) {
  const [image, setImage] = useState<{ path: string; url: string } | null>(null);
  const [failedPath, setFailedPath] = useState<string | null>(null);
  const [authVersion, setAuthVersion] = useState(0);
  useEffect(() => {
    const { data: { subscription } } = onAuthIdentityChange(event => {
    if (event === "SIGNED_OUT" || event === "SIGNED_IN") {
      setImage(null);
      setFailedPath(null);
      setAuthVersion(value => value + 1);
    }
    });
    return () => subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!src) return;
    const path = src.replace(/^\/+/, "").replace(/^mlpekayou-card-images\//, "");
    let disposed = false;
    let release: (() => void) | undefined;
    setFailedPath(null);
    void (async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (disposed) return;
      if (!session?.user) throw new Error("A signed-in session is required to load box images.");
      const userId = session.user.id;
      const encodedPath = path.split("/").map(encodeURIComponent).join("/");
      const url = `${CARD_IMAGE_WORKER_URL.replace(/\/$/, "")}/${encodedPath}`;
      const source = await getCachedCardImage(path, userId, async signal => {
        const request = (token: string) => fetch(url, {
          signal,
          credentials: "omit",
          headers: { Authorization: `Bearer ${token}` },
        });
        let response = await request(session.access_token);
        if (response.status === 401 && !signal.aborted) {
          const refreshed = await supabase.auth.refreshSession();
          if (!refreshed.error && refreshed.data.session?.user.id === userId && !signal.aborted) {
            response = await request(refreshed.data.session.access_token);
          }
        }
        return response;
      });
      if (disposed) { source?.release(); return; }
      if (!source) { setFailedPath(src); return; }
      release = source.release;
      setImage({ path: src, url: source.url });
    })().catch(() => { if (!disposed) setFailedPath(src); });
    return () => { disposed = true; release?.(); };
  }, [src, authVersion]);
  const resolved = image?.path === src ? image.url : null;
  const failed = !!src && failedPath === src;
  const waiting = !!src && !failed && !resolved;
  if (!src || waiting || failed) return <div className="si-image-fallback" role={waiting ? "status" : undefined} aria-busy={waiting || undefined}><Icon name="box" size={large ? 66 : 48} /><span>{waiting ? "Loading box image..." : src ? "Box image unavailable" : "Photo coming soon"}</span></div>;
  return <img src={resolved ?? undefined} alt={alt} loading={large ? "eager" : "lazy"} decoding="async" draggable={false} onError={() => setFailedPath(src)} />;
}

function configurationLabel(variant: BoxVariant) {
  if (variant.kind === "merchandise") return "Merchandise";
  if (variant.kind === "starter") return "Starter deck";
  if (variant.kind === "gift") return "Gift box";
  return variant.packs ? `${variant.packs}-pack ${variant.kind === "collector" ? "collector" : "display"}` : kindNames[variant.kind];
}

function setTitle(set: BoxSet) {
  const series = set.subtitle.match(/\bSeries\s+(\d+)\b/i)?.[1];
  const familyNames: Record<string, string> = { moon: "Moon", fun: "Fun Moments", rainbow: "Rainbow", star: "Star" };
  if (series && familyNames[set.family]) return `${familyNames[set.family]} ${series}`;
  return set.subtitle && set.subtitle !== "Booster Pack" ? `${set.name} - ${set.subtitle}` : set.name;
}

function matchesSearch(set: BoxSet, query: string) {
  const normalized = query.trim().toLowerCase();
  const requestedSeries = normalized.match(/\bseries\s*(\d+)\b/);
  const familySeries = normalized.match(/\b(moon|rainbow|star|fun(?: moments)?)\s+(?:edition\s+|series\s+)?(\d+)\b/);
  const series = set.subtitle.match(/\bseries\s+(\d+)\b/i)?.[1];
  if (requestedSeries && series !== requestedSeries[1]) return false;
  if (familySeries && (set.family !== (familySeries[1].startsWith("fun") ? "fun" : familySeries[1]) || series !== familySeries[2])) return false;
  const content = [setTitle(set), set.name, set.subtitle, set.family, set.language, ...set.variants.flatMap(v => [v.label, v.release, configurationLabel(v)])].filter(Boolean).join(" ").toLowerCase();
  return query.trim().toLowerCase().split(/\s+/).every(word => content.includes(word));
}

const styles = `
.set-info-root{--si-bg:hsl(var(--background,0 0% 10%));--si-fg:hsl(var(--foreground,0 0% 95%));--si-card:hsl(var(--card,var(--background,0 0% 12%)));--si-muted:hsl(var(--muted-foreground,0 0% 60%));--si-border:hsl(var(--border,0 0% 24%));--si-accent:hsl(var(--primary,48 77% 60%));--si-accent-fg:hsl(var(--primary-foreground,0 0% 8%));color:var(--si-fg);background:var(--si-bg);min-height:100vh;width:100%;font-family:inherit}
.set-info-root *{box-sizing:border-box}
.si-shell{max-width:1480px;margin:auto;padding:28px clamp(16px,3vw,44px) 72px}
.si-eyebrow{color:var(--si-muted);font-size:12px;margin:0 0 12px}
.si-heading{margin-bottom:26px}.si-heading h1{font-size:clamp(28px,4vw,40px);font-weight:650;letter-spacing:-.035em;line-height:1.15;margin:0 0 10px}
.si-intro{color:var(--si-muted);font-size:14px;line-height:1.6;margin:0;max-width:600px}
.si-controls{border-bottom:1px solid var(--si-border);margin-bottom:24px;padding-bottom:0}
.si-control-top{display:flex;gap:18px;align-items:center;flex-wrap:wrap}
.si-language{display:flex;gap:20px;flex-shrink:0}.si-language button,.si-chip,.si-reset,.si-close{font:inherit;cursor:pointer}
.si-language button{border:0;border-bottom:2px solid transparent;background:none;color:var(--si-muted);font-size:14px;padding:12px 0;font-weight:500}
.si-language button[aria-pressed=true]{border-bottom-color:var(--si-accent);color:var(--si-fg)}
.si-search{display:flex;align-items:center;gap:10px;padding:0 12px;border:1px solid var(--si-border);border-radius:5px;flex:1;min-width:180px;color:var(--si-muted)}
.si-search:focus-within{outline:2px solid var(--si-accent);outline-offset:2px}
.si-search input{font:inherit;font-size:16px;background:none;color:var(--si-fg);height:42px;min-width:0;width:100%;border:0;outline:0}.si-search input::placeholder{color:var(--si-muted)}
.si-clear{display:grid;place-items:center;border:0;background:none;color:var(--si-muted);cursor:pointer;padding:6px}
.si-select{font:inherit;font-size:16px;background:var(--si-bg);color:var(--si-fg);border:1px solid var(--si-border);border-radius:5px;min-height:42px;padding:7px 32px 7px 10px;max-width:100%}
.si-families{display:flex;gap:22px;flex-wrap:wrap;margin-top:18px}
.si-chip{border:0;border-bottom:2px solid transparent;background:none;color:var(--si-muted);padding:10px 0;font-size:13px;font-weight:500;border-radius:0}
.si-chip:hover{color:var(--si-fg)}.si-chip[aria-pressed=true]{border-bottom-color:var(--si-accent);color:var(--si-fg)}
.si-results-bar{display:flex;justify-content:space-between;gap:16px;margin-bottom:18px;font-size:12px;line-height:1.6;color:var(--si-muted)}.si-results-bar strong{font-weight:600;color:var(--si-fg)}
.si-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,240px),1fr));column-gap:24px;row-gap:30px}
.si-card{appearance:none;text-align:left;display:flex;flex-direction:column;min-width:0;width:100%;border:0;border-bottom:1px solid var(--si-border);background:none;color:var(--si-fg);padding:0 0 16px;cursor:pointer;font:inherit;border-radius:0}
.si-card-image{height:220px;width:100%;padding:18px;display:flex;align-items:center;justify-content:center;background:var(--si-card);border-radius:5px}
.si-card-image img{height:100%;width:100%;object-fit:contain;transition:transform .2s}.si-card:hover .si-card-image img{transform:translateY(-3px)}
.si-card-content{padding:16px 0 0;flex:1;display:flex;flex-direction:column}.si-card-content h2{font-size:17px;line-height:1.4;font-weight:600;letter-spacing:-.015em;margin:0 0 3px;overflow-wrap:anywhere}
.si-card-bottom{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:auto;padding-top:14px;font-size:12px;color:var(--si-muted)}.si-card-bottom svg{color:var(--si-muted)}
.si-card:focus-visible,.set-info-root button:focus-visible,.si-select:focus-visible,.set-info-root a:focus-visible{outline:2px solid var(--si-accent);outline-offset:4px}
.si-image-fallback{display:flex;flex-direction:column;justify-content:center;align-items:center;gap:12px;text-align:center;color:var(--si-muted);width:100%;height:100%;font-size:12px}.si-image-fallback svg{opacity:.35}
.si-empty{padding:48px 20px;text-align:center;border-bottom:1px solid var(--si-border);color:var(--si-muted)}.si-empty svg{margin:auto auto 16px}.si-empty h2{font-size:20px;font-weight:600;color:var(--si-fg);margin:0 0 8px}.si-empty p{font-size:14px}.si-reset{background:none;color:var(--si-accent);font-size:13px;border:0;border-bottom:1px solid currentColor;border-radius:0;padding:6px 0}

.si-format-label{display:block;font-size:12px;color:var(--si-muted);margin-bottom:7px}.si-format-select{width:100%;font-size:16px;min-height:40px}
.si-detail-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin:20px 0 10px;padding-bottom:16px;border-bottom:1px solid var(--si-border)}.si-detail-stat{min-width:0}.si-detail-stat strong{display:block;font-size:22px;font-weight:600;line-height:1.1}.si-detail-stat span{display:block;color:var(--si-muted);font-size:10px;line-height:1.4;margin-top:6px}
.si-specs{margin:0}.si-spec-row{display:grid;grid-template-columns:90px minmax(0,1fr);gap:14px;padding:10px 0;border-bottom:1px solid var(--si-border);font-size:12px;line-height:1.6}.si-spec-row dt{color:var(--si-muted)}.si-spec-row dd{margin:0;overflow-wrap:anywhere}

.si-section-label{font-size:13px;font-weight:600;line-height:1.4;margin:20px 0 8px}
.si-probability{display:grid;grid-template-columns:40px minmax(0,1fr);gap:12px;border-bottom:1px solid var(--si-border);padding:8px 0;font-size:11px;line-height:1.6}.si-probability strong{font-weight:600}.si-probability span{overflow-wrap:anywhere}
.si-source{display:inline-flex;gap:7px;align-items:center;color:var(--si-muted);font-size:11px;margin-top:20px;text-decoration:underline;text-underline-offset:3px}

.si-listing{min-width:0}.si-listing[data-open=true]{grid-column:1/-1;border-top:1px solid var(--si-accent);border-bottom:1px solid var(--si-border)}
.si-listing[data-open=true]>.si-card{padding:14px 0;border:0}.si-listing[data-open=true]>.si-card .si-card-image{display:none}.si-listing[data-open=true]>.si-card .si-card-content{padding:0;flex-direction:row;align-items:center;justify-content:space-between;gap:16px}.si-listing[data-open=true]>.si-card .si-card-bottom{margin:0;padding:0}
.si-expansion{min-width:0;animation:si-reveal .18s ease-out}.si-expansion-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);align-items:start;gap:clamp(20px,3vw,44px);padding:8px 0 26px}
.si-expansion-visual{min-width:0;position:sticky;top:20px}.si-expansion-image{height:clamp(280px,30vw,420px);width:100%;display:flex;align-items:center;justify-content:center}.si-expansion-image img{display:block;width:100%;height:100%;object-fit:contain;object-position:center}
.si-expansion-details{min-width:0;padding:4px 0}.si-expansion-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:18px}.si-expansion-heading h2{font-size:clamp(20px,2.5vw,28px);font-weight:650;line-height:1.2;margin:0;letter-spacing:-.025em}
.si-close{font:inherit;cursor:pointer;border:0;background:none;color:var(--si-fg);width:40px;height:40px;display:grid;place-items:center;flex-shrink:0;margin-top:-8px}
.si-detail-stats{grid-template-columns:repeat(auto-fit,minmax(90px,1fr))}
@keyframes si-reveal{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}
.si-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@media(max-width:640px){.si-shell{padding-top:20px}.si-heading h1{font-size:30px}.si-control-top{gap:12px}.si-language{width:100%}.si-search{flex-basis:100%;min-width:0}.si-control-top>label:last-child{width:100%}.si-control-top .si-select{width:100%}.si-families{column-gap:20px;row-gap:0;margin-top:12px}.si-results-bar>span:last-child{display:none}.si-card-image{height:220px;padding:8px}.si-expansion-grid{grid-template-columns:1fr;gap:16px}.si-expansion-visual{position:static}.si-expansion-image{height:280px}.si-expansion-details{padding:0}.si-listing[data-open=true]>.si-card .si-card-bottom{font-size:11px}.si-listing[data-open=true]>.si-card h2{font-size:16px}}
@media(prefers-reduced-motion:reduce){.set-info-root *{transition:none!important;animation:none!important}.si-card:hover .si-card-image img{transform:none}}
`;


export default function SetInformation() {
  const [language, setLanguage] = useState<Language>("english");
  const [family, setFamily] = useState("all");
  const [kind, setKind] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [variantId, setVariantId] = useState<string | null>(null);
  const selected = boxSets.find(set => set.id === selectedId) ?? null;
  const variant = selected?.variants.find(item => item.id === variantId) ?? selected?.variants[0] ?? null;
  const languageSets = useMemo(() => boxSets.filter(set => set.language === language), [language]);
  const visibleSets = useMemo(() => languageSets.filter(set => (family === "all" || set.family === family) && (kind === "all" || set.variants.some(v => v.kind === kind)) && matchesSearch(set, query)).sort((a, b) => families.findIndex(f => f.id === a.family) - families.findIndex(f => f.id === b.family) || collator.compare(`${a.name} ${a.subtitle}`, `${b.name} ${b.subtitle}`)), [languageSets, family, kind, query]);
  const knownKinds = Array.from(new Set(languageSets.flatMap(set => set.variants.map(v => v.kind))));
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setSelectedId(null); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);
  useEffect(() => { setSelectedId(null); setVariantId(null); }, [language, family, kind, query]);
  const openSet = (set: BoxSet) => {
    setVariantId((kind !== "all" ? set.variants.find(v => v.kind === kind) : null)?.id ?? set.variants[0]?.id ?? null);
    setSelectedId(current => current === set.id ? null : set.id);
  };
  const closeDetails = () => setSelectedId(null);
  const selectLanguage = (value: Language) => { setLanguage(value); setFamily("all"); setKind("all"); };
  const resetFilters = () => { setQuery(""); setFamily("all"); setKind("all"); };
  const imageLabel = selected && variant ? `${setTitle(selected)} - ${variant.label}` : "Box image";
  const themeStyle = { colorScheme: "light dark" } satisfies CSSProperties;
  return (
    <main className="set-info-root" style={themeStyle}>
      <style>{styles}</style>
      <div className="si-shell">
        <header className="si-heading">
          <div><h1>Set information</h1><p className="si-intro">Box formats and packaging details for English and Chinese Kayou releases.</p></div>
        </header>
        <section className="si-controls" aria-label="Directory filters">
          <div className="si-control-top">
            <div className="si-language" aria-label="Card language"><button type="button" aria-pressed={language === "english"} onClick={() => selectLanguage("english")}>English</button><button type="button" aria-pressed={language === "chinese"} onClick={() => selectLanguage("chinese")}>Chinese</button></div>
            <label className="si-search"><Icon name="search" /><span className="si-sr-only">Search sets</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Find a set..." />{query && <button type="button" className="si-clear" onClick={() => setQuery("")} aria-label="Clear search"><Icon name="close" size={16} /></button>}</label>
            <label><span className="si-sr-only">Box format</span><select className="si-select" value={kind} onChange={event => setKind(event.target.value)}><option value="all">All box formats</option>{knownKinds.map(value => <option key={value} value={value}>{kindNames[value]}</option>)}</select></label>
          </div>
          <div className="si-families" aria-label="Set family">{families.map(item => { const count = languageSets.filter(set => item.id === "all" || set.family === item.id).length; return count > 0 ? <button key={item.id} type="button" className="si-chip" aria-pressed={family === item.id} onClick={() => setFamily(item.id)}>{item.label}</button> : null; })}</div>
        </section>
        <div className="si-results-bar" role="status" aria-live="polite"><span><strong>{visibleSets.length}</strong> {visibleSets.length === 1 ? "release" : "releases"} in {language === "english" ? "English" : "Chinese"}</span><span>Select a set to compare its boxes</span></div>
        {visibleSets.length ? <div className="si-grid">{visibleSets.map(set => {
          const cover = (kind !== "all" ? set.variants.find(item => item.kind === kind) : null) ?? set.variants.find(item => item.image) ?? set.variants[0];
          const expanded = selectedId === set.id;
          return <article key={set.id} className="si-listing" data-open={expanded ? "true" : undefined}><button type="button" className="si-card" aria-expanded={expanded} aria-controls={expanded ? `si-details-${set.id}` : undefined} onClick={() => openSet(set)} aria-label={`View ${set.language} ${setTitle(set)} box information`}>
            <div className="si-card-image"><BoxImage src={cover?.image ?? null} alt={`${setTitle(set)} packaging`} /></div>
            <div className="si-card-content"><h2>{setTitle(set)}</h2><div className="si-card-bottom"><span>{`${set.variants.length} ${set.variants.length === 1 ? "configuration" : "configurations"}`}</span><Icon name="arrow" size={18} /></div></div>
          </button>
        {expanded && selected && variant && <section id={`si-details-${set.id}`} className="si-expansion" aria-labelledby={`si-title-${set.id}`}>
          <div className="si-expansion-grid">
          <div className="si-expansion-visual"><div className="si-expansion-image"><BoxImage src={variant.image} alt={imageLabel} large /></div></div>
          <div className="si-expansion-details"><p className="si-eyebrow">{families.find(item => item.id === selected.family)?.label ?? "Other"}</p><div className="si-expansion-heading"><h2 id={`si-title-${set.id}`}>{setTitle(selected)}</h2><button type="button" className="si-close" onClick={closeDetails} aria-label="Close box details"><Icon name="close" /></button></div>
            {selected.variants.length > 1 && <label className="si-format-label">Configuration<select className="si-select si-format-select" value={variant.id} onChange={event => setVariantId(event.target.value)}>{selected.variants.map(item => <option key={item.id} value={item.id}>{item.label}{item.packs && !item.label.toLowerCase().includes("pack") ? ` / ${item.packs} packs` : ""}</option>)}</select></label>}
            <div className="si-detail-stats">{variant.packs !== null && <div className="si-detail-stat"><strong>{variant.packs}</strong><span>{variant.kind === "gift" ? "booster packs" : "packs per box"}</span></div>}{variant.cardsPerPack !== null && <div className="si-detail-stat"><strong>{variant.cardsPerPack}</strong><span>cards per pack</span></div>}{(variant.cardCount ?? selected.cardCount) !== null && <div className="si-detail-stat"><strong>{variant.cardCount ?? selected.cardCount}</strong><span>cards in set</span></div>}</div>
            <dl className="si-specs"><div className="si-spec-row"><dt>Language</dt><dd>{selected.language === "english" ? "English" : "Chinese"}</dd></div><div className="si-spec-row"><dt>Box format</dt><dd>{kindNames[variant.kind]}</dd></div>{variant.release && <div className="si-spec-row"><dt>Listed release</dt><dd>{variant.release}</dd></div>}</dl>
            {variant.probabilities.length > 0 && <><h3 className="si-section-label">Published pack configurations</h3><div>{variant.probabilities.map((item, index) => <div className="si-probability" key={`${item.ratio}-${index}`}><strong>{item.ratio}</strong><span>{item.contents}</span></div>)}</div></>}
            {variant.source && <a className="si-source" href={variant.source} target="_blank" rel="noopener noreferrer">View {variant.sourceLabel ?? "product"} source<Icon name="link" size={15} /></a>}
          </div>
          </div>
        </section>}
          </article>;
        })}</div> : <div className="si-empty"><Icon name="search" size={38} /><h2>No matching boxes</h2><p>Try another set name or box format.</p><button type="button" className="si-reset" onClick={resetFilters}>Clear filters</button></div>}
      </div>

    </main>
  );
}

const boxSets: BoxSet[] =
[
  {
    "id": "en-series-0m4ou242",
    "name": "Moon Edition",
    "subtitle": "Series 4",
    "language": "english",
    "family": "moon",
    "variants": [
      {
        "id": "product-lsmavg8m",
        "label": "Version A",
        "kind": "display",
        "image": "Assets/Boxes/Moon-Edition-Series-4-Version-A-MLP-KP-HY-004A-NA.webp",
        "model": "MLP-KP-HY-004A-NA",
        "packs": 12,
        "cardsPerPack": 8,
        "release": "October 2026",
        "source": null,
        "sourceLabel": null,
        "probabilities": [
          {
            "ratio": "8:12",
            "contents": "3R+1SR+1SSR+1HR+1UR/SGR+1SR/LSR"
          },
          {
            "ratio": "4:12",
            "contents": "3R+2SR+1HR+1SSR+1 UR/ZR/SC/\u25c7ZR"
          }
        ]
      },
      {
        "id": "product-twwos9pg",
        "label": "Version C",
        "kind": "display",
        "image": "Assets/Boxes/Moon-Edition-Series-4-Version-C-MLP-KP-HY-004C-NA.webp",
        "model": "MLP-KP-HY-004C-NA",
        "packs": 12,
        "cardsPerPack": 8,
        "release": "October 2026",
        "source": null,
        "sourceLabel": null,
        "probabilities": [
          {
            "ratio": "8:12",
            "contents": "3R+1SR+1SSR+1HR+1UR/SGR+1SR/LSR"
          },
          {
            "ratio": "4:12",
            "contents": "3R+2SR+1HR+1SSR+1 UR/ZR/SC/\u25c7ZR"
          }
        ]
      }
    ],
    "cardCount": 162,
    "pending": false
  },
  {
    "id": "en-series-5r09mbdf",
    "name": "Moon Edition",
    "subtitle": "Series 3",
    "language": "english",
    "family": "moon",
    "variants": [
      {
        "id": "product-rp4v38y4",
        "label": "Version A",
        "kind": "display",
        "image": "Assets/Boxes/Moon-Edition-Series-3-Version-A-MLP-KP-YYYH-HY-003NA.webp",
        "model": "MLP-KP-YYYH-HY-003NA",
        "packs": 24,
        "cardsPerPack": 8,
        "release": "March 2026",
        "source": null,
        "sourceLabel": null,
        "probabilities": [
          {
            "ratio": "12:24",
            "contents": "3R+2SR+1SSR+1HR+1LSR"
          },
          {
            "ratio": "12:24",
            "contents": "3R+2SR+1SSR+1HR+1UR/SGR/ZR/SC/\u25c7ZR"
          }
        ]
      },
      {
        "id": "product-at79ak0p",
        "label": "Version C",
        "kind": "display",
        "image": "Assets/Boxes/Moon-Edition-Series-3-Version-C-MLP-KP-YYYH-HY-003C-NA.webp",
        "model": "MLP-KP-YYYH-HY-003C-NA",
        "packs": 24,
        "cardsPerPack": 8,
        "release": "March 2026",
        "source": null,
        "sourceLabel": null,
        "probabilities": []
      },
      {
        "id": "product-zxxylbuv",
        "label": "Version D",
        "kind": "display",
        "image": "Assets/Boxes/Moon-Edition-Series-3-Version-D-MLP-KP-YYYH-HY-003D-NA.webp",
        "model": "MLP-KP-YYYH-HY-003D-NA",
        "packs": 12,
        "cardsPerPack": 8,
        "release": "March 2026",
        "source": null,
        "sourceLabel": null,
        "probabilities": []
      },
      {
        "id": "product-77wuym51",
        "label": "Bundle(5 Packs)",
        "kind": "collector",
        "image": "Assets/Boxes/Moon-Edition-Series-3-Bundle-5-Packs-MLP-KP-HYLH-003-5P.webp",
        "model": "MLP-KP-HYLH-003-5P",
        "packs": 5,
        "cardsPerPack": 8,
        "release": "March 2026",
        "source": null,
        "sourceLabel": null,
        "probabilities": []
      }
    ],
    "cardCount": 290,
    "pending": false
  },
  {
    "id": "en-series-wusnjcxp",
    "name": "Moon Edition",
    "subtitle": "Series 2",
    "language": "english",
    "family": "moon",
    "variants": [
      {
        "id": "product-jrgowbpz",
        "label": "Version A",
        "kind": "display",
        "image": "Assets/Boxes/Moon-Edition-Series-2-Version-A-MLP-KP-YH-HY-002A-NA.webp",
        "model": "MLP-KP-YH-HY-002A-NA",
        "packs": 20,
        "cardsPerPack": 8,
        "release": "October 2025",
        "source": null,
        "sourceLabel": null,
        "probabilities": [
          {
            "ratio": "8:12",
            "contents": "3R+1SR+1HR+1SSR+2HR/UR/LSR/SGR"
          },
          {
            "ratio": "4:12",
            "contents": "3R+1SR+2HR+1SSR+1LSR/ZR/SC/\u25c7ZR"
          }
        ]
      },
      {
        "id": "product-1os0urcn",
        "label": "Version B",
        "kind": "display",
        "image": "Assets/Boxes/Moon-Edition-Series-2-Version-B-MLP-KP-YH-HY-002B-NA.webp",
        "model": "MLP-KP-YH-HY-002B-NA",
        "packs": 6,
        "cardsPerPack": 8,
        "release": "December 2025",
        "source": null,
        "sourceLabel": null,
        "probabilities": []
      },
      {
        "id": "product-7kfd9sgu",
        "label": "Version C",
        "kind": "display",
        "image": "Assets/Boxes/Moon-Edition-Series-2-Version-C-MLP-KP-YH-HY-002C-NA.webp",
        "model": "MLP-KP-YH-HY-002C-NA",
        "packs": 24,
        "cardsPerPack": 8,
        "release": "December 2025",
        "source": null,
        "sourceLabel": null,
        "probabilities": []
      },
      {
        "id": "product-55b07ham",
        "label": "Version E",
        "kind": "display",
        "image": "Assets/Boxes/Moon-Edition-Series-2-Version-E-MLP-KP-YH-HY-002E-NA.webp",
        "model": "MLP-KP-YH-HY-002E-NA",
        "packs": 24,
        "cardsPerPack": 8,
        "release": "December 2025",
        "source": null,
        "sourceLabel": null,
        "probabilities": []
      },
      {
        "id": "product-bo8xrzma",
        "label": "NYCC Exclusive",
        "kind": "display",
        "image": "Assets/Boxes/Moon-Edition-Series-2-NYCC-Exclusive-MLP-KP-YH-HY-NYCC-NA.webp",
        "model": "MLP-KP-YH-HY-NYCC-NA",
        "packs": 12,
        "cardsPerPack": 8,
        "release": "December 2025",
        "source": null,
        "sourceLabel": null,
        "probabilities": [
          {
            "ratio": "8:12",
            "contents": "3R+1SR+1SSR+1UR/SGR+1LSR/1HR+1HR"
          },
          {
            "ratio": "4:12",
            "contents": "3R+1SR+2HR+1SSR+1UR/ZR/SC/\u25c7ZR"
          }
        ]
      },
      {
        "id": "product-9c7rieib",
        "label": "Bundle A",
        "kind": "collector",
        "image": "Assets/Boxes/Moon-Edition-Series-2-Bundle-A-MLP-KP-HYLH-001A-NA.webp",
        "model": "MLP-KP-HYLH-001A-NA",
        "packs": 5,
        "cardsPerPack": 8,
        "release": "December 2025",
        "source": null,
        "sourceLabel": null,
        "probabilities": []
      },
      {
        "id": "product-j9qh7fue",
        "label": "Bundle B",
        "kind": "collector",
        "image": "Assets/Boxes/Moon-Edition-Series-2-Bundle-B-MLP-KP-HYLH-001B-NA.webp",
        "model": "MLP-KP-HYLH-001B-NA",
        "packs": 3,
        "cardsPerPack": 8,
        "release": "December 2025",
        "source": null,
        "sourceLabel": null,
        "probabilities": []
      }
    ],
    "cardCount": 189,
    "pending": false
  },
  {
    "id": "en-series-7zzyc8zq",
    "name": "Moon Edition",
    "subtitle": "Series 1",
    "language": "english",
    "family": "moon",
    "variants": [
      {
        "id": "product-uetqqmm9",
        "label": "Version A",
        "kind": "display",
        "image": "Assets/Boxes/Moon-Edition-Series-1-Version-A-MLP-KP-YH-HY-001A-NA.webp",
        "model": "MLP-KP-YH-HY-001A-NA",
        "packs": 24,
        "cardsPerPack": 8,
        "release": "September 2025",
        "source": null,
        "sourceLabel": null,
        "probabilities": [
          {
            "ratio": "20:24",
            "contents": "3R + 1SR + 1HR + 1SSR + 2HR/SSR/UR/LSR"
          },
          {
            "ratio": "4:24",
            "contents": "3R + 1SR + 1HR + 1SSR + 2LSR/SGR/SC"
          }
        ]
      },
      {
        "id": "product-og6uph5r",
        "label": "Version B",
        "kind": "display",
        "image": "Assets/Boxes/Moon-Edition-Series-1-Version-B-MLP-KP-YH-HY-001B-NA.webp",
        "model": "MLP-KP-YH-HY-001B-NA",
        "packs": 24,
        "cardsPerPack": 8,
        "release": "September 2025",
        "source": null,
        "sourceLabel": null,
        "probabilities": [
          {
            "ratio": "20:24",
            "contents": "3R+1SR+1HR+1SSR+2HR/SSR/UR/LSR"
          },
          {
            "ratio": "4:24",
            "contents": "3R+1SR+1HR+1SSR+2LSR/SGR/SC"
          }
        ]
      },
      {
        "id": "product-1s9h40by",
        "label": "Version C",
        "kind": "display",
        "image": "Assets/Boxes/Moon-Edition-Series-1-Version-C-MLP-KP-YH-HY-001C-NA.webp",
        "model": "MLP-KP-YH-HY-001C-NA",
        "packs": 6,
        "cardsPerPack": 8,
        "release": "September 2025",
        "source": null,
        "sourceLabel": null,
        "probabilities": [
          {
            "ratio": "5:6",
            "contents": "3R+1SR+1HR+1SSR+2HR/SSR/UR/LSR"
          },
          {
            "ratio": "1:6",
            "contents": "3R=1SR+1HR+1SSR+2LSR/SGR/SC"
          }
        ]
      }
    ],
    "cardCount": 186,
    "pending": false
  },
  {
    "id": "en-series-7nthr0lb",
    "name": "Fun Moments Edition",
    "subtitle": "Series 4",
    "language": "english",
    "family": "fun",
    "variants": [
      {
        "id": "product-b2b498j0",
        "label": "Version A",
        "kind": "display",
        "image": "Assets/Boxes/Fun-Moments-Edition-Series-4-Version-A-MLP-KP-YYYH-QY-004-NA.webp",
        "model": "MLP-KP-YYYH-QY-004-NA",
        "packs": 20,
        "cardsPerPack": 7,
        "release": "October 2026",
        "source": null,
        "sourceLabel": null,
        "probabilities": [
          {
            "ratio": "3:20",
            "contents": "2N/\u25c7N+2R+1SR+1SSR+1CR/\u25c7CR/UGR"
          },
          {
            "ratio": "17:20",
            "contents": "2N/\u25c7N+2R+1SR+1SSR+1R/SSR/UR"
          }
        ]
      }
    ],
    "cardCount": null,
    "pending": false
  },
  {
    "id": "en-series-rpfua4fi",
    "name": "Fun Moments Edition",
    "subtitle": "Series 3",
    "language": "english",
    "family": "fun",
    "variants": [
      {
        "id": "product-7kd0rhi6",
        "label": "Version A",
        "kind": "display",
        "image": "Assets/Boxes/Fun-Moments-Edition-Series-3-Version-A-MLP-KP-YYYH-QY-003A-NA.webp",
        "model": "MLP-KP-YYYH-QY-003A-NA",
        "packs": 20,
        "cardsPerPack": 7,
        "release": "March 2026",
        "source": null,
        "sourceLabel": null,
        "probabilities": [
          {
            "ratio": "17:20",
            "contents": "2N/\u25c7N+2R+1SR+1SSR+1R/SSR/UR"
          },
          {
            "ratio": "3:20",
            "contents": "2N/\u25c7N+2R+1SR+1SSR+1CR/UGR/\u25c7CR"
          }
        ]
      },
      {
        "id": "product-6s3knntv",
        "label": "Bundle(10 Packs)",
        "kind": "collector",
        "image": "Assets/Boxes/Fun-Moments-Edition-Series-3-Bundle-10-Packs-MLP-KP-QYLH-003A-10P-NA.webp",
        "model": "MLP-KP-QYLH-003A-10P-NA",
        "packs": 10,
        "cardsPerPack": null,
        "release": "March 2026",
        "source": null,
        "sourceLabel": null,
        "probabilities": []
      }
    ],
    "cardCount": 148,
    "pending": false
  },
  {
    "id": "en-series-bkh5xfg6",
    "name": "Fun Moments Edition",
    "subtitle": "Series 2",
    "language": "english",
    "family": "fun",
    "variants": [
      {
        "id": "product-d2b02uea",
        "label": "Version A",
        "kind": "display",
        "image": "Assets/Boxes/Fun-Moments-Edition-Series-2-Version-A-MLP-KP-YH-QY-002A-NA.webp",
        "model": "MLP-KP-YH-QY-002A-NA",
        "packs": 20,
        "cardsPerPack": 8,
        "release": "October 2025",
        "source": null,
        "sourceLabel": null,
        "probabilities": [
          {
            "ratio": "18:20",
            "contents": "2N/\u25c7N+2R+1SR+1SSR+2SSR/UR/CR/UGR"
          },
          {
            "ratio": "2:20",
            "contents": "2N/\u25c7N+2R+1SR+2SSR+1UGR"
          }
        ]
      }
    ],
    "cardCount": 136,
    "pending": false
  },
  {
    "id": "en-series-uwn0xy7l",
    "name": "Fun Moments Edition",
    "subtitle": "Series 1",
    "language": "english",
    "family": "fun",
    "variants": [
      {
        "id": "product-iwids607",
        "label": "Version A",
        "kind": "display",
        "image": "Assets/Boxes/Fun-Moments-Edition-Series-1-Version-A-MLP-KP-YH-QY-001A-NA.webp",
        "model": "MLP-KP-YH-QY-001A-NA",
        "packs": 12,
        "cardsPerPack": 8,
        "release": "September 2025",
        "source": null,
        "sourceLabel": null,
        "probabilities": [
          {
            "ratio": "11:12",
            "contents": "2N+1\u25c7N+1R+1SR+1SSR+1UR+1SR/SSR/UR"
          },
          {
            "ratio": "1:12",
            "contents": "2N+1\u25c7N+1R+1SR+1SSR+1UR+1CR"
          }
        ]
      }
    ],
    "cardCount": 127,
    "pending": false
  },
  {
    "id": "en-series-6j45wgxd",
    "name": "Rainbow Edition",
    "subtitle": "Series 2",
    "language": "english",
    "family": "rainbow",
    "variants": [
      {
        "id": "product-4sqbsod4",
        "label": "Version A",
        "kind": "display",
        "image": "Assets/Boxes/Rainbow-Edition-Series-2-Version-A-MLP-KP-YH-CH-002A-NA.webp",
        "model": "MLP-KP-YH-CH-002A-NA",
        "packs": 20,
        "cardsPerPack": 5,
        "release": "January 2026",
        "source": null,
        "sourceLabel": null,
        "probabilities": [
          {
            "ratio": "10:20",
            "contents": "1BASE+1ST+1TR/TGR+1SR+1FR"
          },
          {
            "ratio": "10:20",
            "contents": "1BASE+1ST+1TR/TGR+1R+1USR/XR"
          }
        ]
      },
      {
        "id": "product-ai4315nh",
        "label": "Bundle A",
        "kind": "collector",
        "image": "Assets/Boxes/Rainbow-Edition-Series-2-Bundle-A-MLP-KP-CHLH-002A-NA.webp",
        "model": "MLP-KP-CHLH-002A-NA",
        "packs": 5,
        "cardsPerPack": 5,
        "release": "January 2026",
        "source": null,
        "sourceLabel": null,
        "probabilities": []
      }
    ],
    "cardCount": 170,
    "pending": false
  },
  {
    "id": "en-series-mjrrqnhj",
    "name": "Rainbow Edition",
    "subtitle": "Series 1",
    "language": "english",
    "family": "rainbow",
    "variants": [
      {
        "id": "product-wmzrylue",
        "label": "Version A",
        "kind": "display",
        "image": "Assets/Boxes/Rainbow-Edition-Series-1-Version-A-MLP-KP-YH-CH-001A-NA.webp",
        "model": "MLP-KP-YH-CH-001A-NA",
        "packs": 20,
        "cardsPerPack": 5,
        "release": "September 2025",
        "source": null,
        "sourceLabel": null,
        "probabilities": [
          {
            "ratio": "13:20",
            "contents": "1R+1SR+1FR+1TR/TR+1MTR/SSR"
          },
          {
            "ratio": "7:20",
            "contents": "1R+1FR+1MTR+1TGR/TR+1FR/SSR/UR/USR/XR"
          }
        ]
      }
    ],
    "cardCount": 146,
    "pending": false
  },
  {
    "id": "en-series-nogr2a7b",
    "name": "Star Edition",
    "subtitle": "Series 1",
    "language": "english",
    "family": "star",
    "variants": [
      {
        "id": "product-mbaqkor8",
        "label": "Version A",
        "kind": "display",
        "image": "Assets/Boxes/Star-Edition-Series-1-Version-A-MLP-KP-YYYH-FX-001A-NA.webp",
        "model": "MLP-KP-YYYH-FX-001A-NA",
        "packs": 16,
        "cardsPerPack": 3,
        "release": "February 2026",
        "source": null,
        "sourceLabel": null,
        "probabilities": [
          {
            "ratio": "10:16",
            "contents": "1SCR/2SSR/UR"
          },
          {
            "ratio": "5:16",
            "contents": "1SSR+1SCR/UR+1USR/AR"
          },
          {
            "ratio": "1:16",
            "contents": "1OR/BP/\u25c7AR+2SSR/SCR"
          }
        ]
      }
    ],
    "cardCount": 105,
    "pending": false
  },
  {
    "id": "en-friendships-begin",
    "name": "Friendships Begin",
    "subtitle": "",
    "language": "english",
    "family": "tcg",
    "variants": [
      {
        "id": "product-1faie7kw",
        "label": "Pinkie Pie",
        "kind": "starter",
        "image": "Assets/Boxes/Friendships-Begin-Pinkie-Pie-Version-A-MLP-KP-YYQH-PP-001A-NA.webp",
        "model": "MLP-KP-YYQH-PP-001A-NA",
        "packs": null,
        "cardsPerPack": null,
        "release": "March 2026",
        "source": null,
        "sourceLabel": null,
        "probabilities": [],
        "cardCount": 21
      },
      {
        "id": "product-f3gtjdqx",
        "label": "Applejack",
        "kind": "starter",
        "image": "Assets/Boxes/Friendships-Begin-Applejack-Version-A-MLP-KP-YYQH-AJ-001A-NA.webp",
        "model": "MLP-KP-YYQH-AJ-001A-NA",
        "packs": null,
        "cardsPerPack": null,
        "release": "March 2026",
        "source": null,
        "sourceLabel": null,
        "probabilities": [],
        "cardCount": 21
      },
      {
        "id": "product-rheehee3",
        "label": "Fluttershy",
        "kind": "starter",
        "image": "Assets/Boxes/Friendships-Begin-Fluttershy-Version-A-MLP-KP-YYQH-FS-001A-NA.webp",
        "model": "MLP-KP-YYQH-FS-001A-NA",
        "packs": null,
        "cardsPerPack": null,
        "release": "March 2026",
        "source": null,
        "sourceLabel": null,
        "probabilities": [],
        "cardCount": 21
      },
      {
        "id": "product-58zg4lt4",
        "label": "Rainbow Dash",
        "kind": "starter",
        "image": "Assets/Boxes/Friendships-Begin-Rainbow-Dash-Version-A-MLP-KP-YYQH-RD-001A-NA.webp",
        "model": "MLP-KP-YYQH-RD-001A-NA",
        "packs": null,
        "cardsPerPack": null,
        "release": "March 2026",
        "source": null,
        "sourceLabel": null,
        "probabilities": [],
        "cardCount": 21
      },
      {
        "id": "product-5s3gfk1f",
        "label": "Rarity",
        "kind": "starter",
        "image": "Assets/Boxes/Friendships-Begin-Rarity-Version-A-MLP-KP-YYQH-RT-001A-NA.webp",
        "model": "MLP-KP-YYQH-RT-001A-NA",
        "packs": null,
        "cardsPerPack": null,
        "release": "March 2026",
        "source": null,
        "sourceLabel": null,
        "probabilities": [],
        "cardCount": 21
      },
      {
        "id": "product-ogt1bn42",
        "label": "Twilight Sparkle",
        "kind": "starter",
        "image": "Assets/Boxes/Friendships-Begin-Twilight-Sparkle-Version-A-MLP-KP-YYQH-TS-001A-NA.webp",
        "model": "MLP-KP-YYQH-TS-001A-NA",
        "packs": null,
        "cardsPerPack": null,
        "release": "March 2026",
        "source": null,
        "sourceLabel": null,
        "probabilities": [],
        "cardCount": 21
      },
      {
        "id": "product-pyg73p19",
        "label": "Bonus Pack",
        "kind": "starter",
        "image": "Assets/Boxes/Friendships-Begin-Bonus-Pack-Version-A-MLP-KP-YYQH-AS-001A-NA.webp",
        "model": "MLP-KP-YYQH-AS-001A-NA",
        "packs": null,
        "cardsPerPack": null,
        "release": "March 2026",
        "source": null,
        "sourceLabel": null,
        "probabilities": [
          {
            "ratio": "2:3",
            "contents": "2C+1U/SPR+1ER/\u203bER+1SR"
          },
          {
            "ratio": "1:3",
            "contents": "2C+1U/SPR+1ER/\u203bER+1SR/GR/CR/\u203bRR"
          }
        ],
        "cardCount": 68
      }
    ],
    "cardCount": null,
    "pending": false
  },
  {
    "id": "en-series-i9q374dz",
    "name": "Hearth's Warming Eve",
    "subtitle": "Booster Pack",
    "language": "english",
    "family": "tcg",
    "variants": [
      {
        "id": "product-1wm37l0q",
        "label": "Version A",
        "kind": "display",
        "image": "Assets/Boxes/Booster-Pack-Hearth-s-Warming-Eve-Version-A-MLP-KP-NLQH-004B-NA.webp",
        "model": "MLP-KP-NLQH-004B-NA",
        "packs": 20,
        "cardsPerPack": 5,
        "release": "October 2026",
        "source": null,
        "sourceLabel": null,
        "probabilities": [
          {
            "ratio": "6:20",
            "contents": "1C+1C/TK+2U/SPR+1ER"
          },
          {
            "ratio": "14:20",
            "contents": "2C+1U/SPR+1U/SPR/SR/GR/CR/SPR\u203b/GR\u203b/RR/RR\u203b/CR\u203b+1ER/ER\u203b"
          }
        ]
      },
      {
        "id": "product-tgy1c7r4",
        "label": "Bundle A",
        "kind": "collector",
        "image": "Assets/Boxes/Booster-Pack-Hearth-s-Warming-Eve-Bundle-A-MLP-KP-NLQH-004B-NA-CP.webp",
        "model": "MLP-KP-NLQH-004B-NA-CP",
        "packs": 5,
        "cardsPerPack": 5,
        "release": "October 2026",
        "source": null,
        "sourceLabel": null,
        "probabilities": []
      },
      {
        "id": "product-nar0alj3",
        "label": "Bundle B",
        "kind": "collector",
        "image": "Assets/Boxes/Booster-Pack-Hearth-s-Warming-Eve-Bundle-B-MLP-KP-NLQH-004B-NA-BD01.webp",
        "model": "MLP-KP-NLQH-004B-NA-BD01",
        "packs": 10,
        "cardsPerPack": null,
        "release": "October 2026",
        "source": null,
        "sourceLabel": null,
        "probabilities": []
      },
      {
        "id": "product-4zg18x1h",
        "label": "Bundle C",
        "kind": "collector",
        "image": "Assets/Boxes/Booster-Pack-Hearth-s-Warming-Eve-Bundle-C-MLP-KP-NLQH-004B-NA-BD02.webp",
        "model": "MLP-KP-NLQH-004B-NA-BD02",
        "packs": null,
        "cardsPerPack": null,
        "release": "October 2026",
        "source": null,
        "sourceLabel": null,
        "probabilities": []
      }
    ],
    "cardCount": 197,
    "pending": false
  },
  {
    "id": "en-series-27z4pa09",
    "name": "Nightmare Night",
    "subtitle": "Booster Pack",
    "language": "english",
    "family": "tcg",
    "variants": [
      {
        "id": "product-nsog5q8x",
        "label": "Version A",
        "kind": "display",
        "image": "Assets/Boxes/Booster-Pack-Nightmare-Night-Version-A-MLP-KP-MYZY-003B-NA.webp",
        "model": "MLP-KP-MYZY-003B-NA",
        "packs": 20,
        "cardsPerPack": 5,
        "release": "September 2026",
        "source": null,
        "sourceLabel": null,
        "probabilities": [
          {
            "ratio": "6:20",
            "contents": "2C+2U/SPR+1ER"
          },
          {
            "ratio": "14:20",
            "contents": "2C+1U/SPR+1U/SPR/SR/RR/GR/CR/GR\u203b/SPR\u203b/CR\u203b/RR\u203b+1ER/ER\u203b"
          }
        ]
      },
      {
        "id": "product-59jdnh6k",
        "label": "Bundle A",
        "kind": "collector",
        "image": "Assets/Boxes/Booster-Pack-Nightmare-Night-Bundle-A-MLP-KP-MYZY-003B-NA-CP.webp",
        "model": "MLP-KP-MYZY-003B-NA-CP",
        "packs": 5,
        "cardsPerPack": 8,
        "release": "September 2026",
        "source": null,
        "sourceLabel": null,
        "probabilities": [
          {
            "ratio": "3:5",
            "contents": "2C+1U/SPR+1U/SPR/SR+1ER"
          },
          {
            "ratio": "2:5",
            "contents": "2C+1U/SPR+1U/SPR/SR/RR/GR/CR/GR\u203b/SPR\u203b/CR\u203b/RR\u203b+1ER/ER\u203b"
          }
        ]
      }
    ],
    "cardCount": 190,
    "pending": false
  },
  {
    "id": "en-series-ry03llcx",
    "name": "Discord!!!",
    "subtitle": "Booster Pack",
    "language": "english",
    "family": "tcg",
    "variants": [
      {
        "id": "product-ex6d549u",
        "label": "Version B",
        "kind": "display",
        "image": "Assets/Boxes/Booster-Pack-Discord-Version-B-MLP-KP-WXSK-002B-NA.webp",
        "model": "MLP-KP-WXSK-002B-NA",
        "packs": 20,
        "cardsPerPack": 5,
        "release": "TBD",
        "source": null,
        "sourceLabel": null,
        "probabilities": [
          {
            "ratio": "6\uff1a20",
            "contents": "2C+2U/SPR+1ER"
          },
          {
            "ratio": "14:20",
            "contents": "2C+1U/SPR+1U/SPR/SR/RR/GR/CR/GR\u203b/SPR\u203b/CR\u203b/RR\u203b+1ER/ER\u203b"
          }
        ]
      },
      {
        "id": "product-rpgl26c1",
        "label": "Version A",
        "kind": "display",
        "image": "Assets/Boxes/Booster-Pack-Discord-Version-A-MLP-KP-WXSK-002A-NA.webp",
        "model": "MLP-KP-WXSK-002A-NA",
        "packs": 12,
        "cardsPerPack": 5,
        "release": "August 2026",
        "source": null,
        "sourceLabel": null,
        "probabilities": [
          {
            "ratio": "6:20",
            "contents": "2C+2U/SPR+1ER"
          },
          {
            "ratio": "14:20",
            "contents": "2C+1U/SPR+1U/SPR/SR/RR/GR/CR/GR\u203b/SPR\u203b/CR\u203b/RR\u203b+1ER/ER\u203b"
          }
        ]
      }
    ],
    "cardCount": 191,
    "pending": false
  },
  {
    "id": "en-series-2nicsllo",
    "name": "Fantasy Wonderland",
    "subtitle": "Booster Pack",
    "language": "english",
    "family": "tcg",
    "variants": [
      {
        "id": "product-zjuy986e",
        "label": "Version A",
        "kind": "display",
        "image": "Assets/Boxes/Booster-Pack-Fantasy-Wonderland-Version-A-MLP-KP-HXQJ-001-NA.webp",
        "model": "MLP-KP-HXQJ-001-NA",
        "packs": 20,
        "cardsPerPack": 5,
        "release": "March 2026",
        "source": null,
        "sourceLabel": null,
        "probabilities": [
          {
            "ratio": "6:20",
            "contents": "2C+2U/SPR+1ER"
          },
          {
            "ratio": "14:20",
            "contents": "2C+1U/SPR+1SR/RR/GR/CR/GR\u203b/SPR\u203b/CR\u203b/RR\u203b+1ER/ER\u203b"
          }
        ]
      }
    ],
    "cardCount": 191,
    "pending": false
  },
  {
    "id": "en-series-qehxs6c6",
    "name": "Gel Pen - Fantasy Edition",
    "subtitle": "Series 1",
    "language": "english",
    "family": "other",
    "variants": [
      {
        "id": "product-gyiozhns",
        "label": "Version A",
        "kind": "merchandise",
        "image": "Assets/Boxes/Gel-Pen-Fantasy-Edition-Series-1-Version-A-MLP-ZXB-QH-001.webp",
        "model": "MLP-ZXB-QH-001",
        "packs": null,
        "cardsPerPack": null,
        "release": "October 2026",
        "source": null,
        "sourceLabel": null,
        "probabilities": []
      }
    ],
    "cardCount": null,
    "pending": false
  },
  {
    "id": "en-series-8gse15td",
    "name": "Acrylic Stand - Adventure Edition",
    "subtitle": "Series 1",
    "language": "english",
    "family": "other",
    "variants": [
      {
        "id": "product-6jw2emk3",
        "label": "Version A",
        "kind": "merchandise",
        "image": "Assets/Boxes/Acrylic-Stand-Adventure-Edition-Series-1-Version-A-MLP-LP-QY-001.webp",
        "model": "MLP-LP-QY-001",
        "packs": null,
        "cardsPerPack": null,
        "release": "October 2026",
        "source": null,
        "sourceLabel": null,
        "probabilities": [
          {
            "ratio": "1\uff1a12",
            "contents": "Starcrown Style"
          },
          {
            "ratio": "3:12",
            "contents": "Grainy Style"
          },
          {
            "ratio": "89:216",
            "contents": "Stellar Style"
          },
          {
            "ratio": "3:12",
            "contents": "Luminous Style"
          },
          {
            "ratio": "1:216",
            "contents": "Dawnlight Style"
          }
        ]
      }
    ],
    "cardCount": null,
    "pending": false
  },
  {
    "id": "en-series-ysh7t0mu",
    "name": "Acrylic Stand - Fantasy Edition",
    "subtitle": "Series 1",
    "language": "english",
    "family": "other",
    "variants": [
      {
        "id": "product-k5hph1i2",
        "label": "Version A",
        "kind": "merchandise",
        "image": "Assets/Boxes/Acrylic-Stand-Fantasy-Edition-Series-1-Version-A-MLP-LP-MH-001.webp",
        "model": "MLP-LP-MH-001",
        "packs": null,
        "cardsPerPack": null,
        "release": "October 2026",
        "source": null,
        "sourceLabel": null,
        "probabilities": []
      }
    ],
    "cardCount": null,
    "pending": false
  },
  {
    "id": "en-series-3zamajbz",
    "name": "Magic Garden - Metal Enamel Magnetic Badge",
    "subtitle": "Series 1",
    "language": "english",
    "family": "other",
    "variants": [
      {
        "id": "product-kimmlpot",
        "label": "Version A",
        "kind": "merchandise",
        "image": "Assets/Boxes/Magic-Garden-Metal-Enamel-Magnetic-Badge-Series-1-Version-A-MLP-MG-BXT.webp",
        "model": "MLP-MG-BXT",
        "packs": null,
        "cardsPerPack": null,
        "release": "October 2026",
        "source": null,
        "sourceLabel": null,
        "probabilities": []
      }
    ],
    "cardCount": null,
    "pending": false
  }
];
