import CardImage from "@/components/CardImage";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Layers, Search, X } from "lucide-react";

const setButtons = [
  {
    title: "Eternal Moon I",
    subtitle: "186 Cards",
    group: "Moon",
    to: "/trading-post/1",
    image: "/thumbnails/moononesetimage.webp",
  },
  {
    title: "Eternal Moon II",
    subtitle: "189 Cards",
    group: "Moon",
    to: "/trading-post/2",
    image: "/thumbnails/moontwosetimage.webp",
  },
  {
    title: "Eternal Moon III",
    subtitle: "290 Cards",
    group: "Moon",
    to: "/trading-post/3",
    image: "/thumbnails/moonthreesetimage.webp",
  },
  {
    title: "Eternal Moon IV",
    subtitle: "162 Cards",
    group: "Moon",
    to: "/trading-post/13",
    image: "/thumbnails/moonfoursetimage.webp",
  },
  {
    title: "Star I",
    subtitle: "105 Cards",
    group: "Star",
    to: "/trading-post/4",
    image: "/thumbnails/staronesetimage.webp",
  },
  {
    title: "Rainbow I",
    subtitle: "146 Cards",
    group: "Rainbow",
    to: "/trading-post/5",
    image: "/thumbnails/rainbowonesetimage.webp",
  },
  {
    title: "Rainbow II",
    subtitle: "170 Cards",
    group: "Rainbow",
    to: "/trading-post/6",
    image: "/thumbnails/rainbowtwosetimage.webp",
  },
  {
    title: "Fun Moments I",
    subtitle: "127 Cards",
    group: "Fun Moments",
    to: "/trading-post/7",
    image: "/thumbnails/funonesetimage.webp",
  },
  {
    title: "Fun Moments II",
    subtitle: "136 Cards",
    group: "Fun Moments",
    to: "/trading-post/8",
    image: "/thumbnails/funtwosetimage.webp",
  },
  {
    title: "Fun Moments III",
    subtitle: "148 Cards",
    group: "Fun Moments",
    to: "/trading-post/11",
    image: "/thumbnails/funthreesetimage.webp",
  },
  {
    title: "Promo Cards",
    subtitle: "13 Cards",
    group: "Promos",
    to: "/trading-post/9",
    image: "/thumbnails/promossetimage.webp",
  },
  {
    title: "Friendships Begin",
    subtitle: "194 Cards",
    group: "TCG",
    to: "/trading-post/friendshipsbegin",
    image: "/thumbnails/friendshipsbeginsetimage.webp",
  },
  {
    title: "Fantasy Wonderland",
    subtitle: "191 Cards",
    group: "TCG",
    to: "/trading-post/FW",
    image: "/thumbnails/fantasysetimage.webp",
  },
  {
    title: "Discord",
    subtitle: "191 Cards",
    group: "TCG",
    to: "/trading-post/12",
    image: "/thumbnails/discordsetimage.webp",
  },
  {
    title: "Nightmare Night",
    subtitle: "190 Cards",
    group: "TCG",
    to: "/trading-post/14",
    image: "/thumbnails/nightmarenightsetimage.webp",
  },
  {
    title: "TCG Promos",
    subtitle: "28 Cards",
    group: "Promos",
    to: "/trading-post/tcgpromos",
    image: "/thumbnails/tcgpromossetimage.webp",
  },
];
const groups = [
  "All",
  "Moon",
  "Star",
  "Rainbow",
  "Fun Moments",
  "TCG",
  "Promos",
];

type SetButton = (typeof setButtons)[number];

function SetPreview({ set }: { set: SetButton }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <div className="tp-index-preview">
      {!loaded && !failed && <div className="tp-index-shimmer" aria-hidden="true" />}
      {failed ? <div className="tp-index-preview-error"><Layers size={26} /><span>Preview unavailable</span></div> : <CardImage src={set.image} alt={set.title} draggable={false} onLoad={() => setLoaded(true)} onError={() => setFailed(true)} className={`tp-index-image ${loaded ? "is-loaded" : ""}`} />}
      <span className="tp-index-category">{set.group}</span>
    </div>
  );
}

export default function TradingPost() {
  const [activeGroup, setActiveGroup] = useState("All");
  const [search, setSearch] = useState("");
  const [isLightMode, setIsLightMode] = useState(() => {
    if (typeof document === "undefined") return false;
    const root = document.documentElement;
    return root.dataset.theme === "light" || root.classList.contains("light") || !root.classList.contains("dark");
  });
  const pageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const syncTheme = () => {
      const root = document.documentElement;
      setIsLightMode(root.dataset.theme === "light" || root.classList.contains("light") || !root.classList.contains("dark"));
    };
    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    window.addEventListener("themechange", syncTheme);
    return () => {
      observer.disconnect();
      window.removeEventListener("themechange", syncTheme);
    };
  }, []);
  useEffect(() => {
    const element = pageRef.current;
    if (!element) return;
    const measure = () => {
      const offset = `${Math.round(Math.max(0, element.getBoundingClientRect().top + window.scrollY))}px`;
      if (element.style.getPropertyValue("--tp-index-top") !== offset) element.style.setProperty("--tp-index-top", offset);
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (element.parentElement) observer.observe(element.parentElement);
    window.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("resize", measure);
    };
  }, []);
  const term = search.trim().toLowerCase();
  const visibleSets = setButtons.filter((set) => (activeGroup === "All" || set.group === activeGroup) && (!term || `${set.title} ${set.group}`.toLowerCase().includes(term)));
  return (
    <div ref={pageRef} className={`tp-index font-['Oxanium'] ${isLightMode ? "tp-index-light" : ""}`}>
      <style>{`
        .tp-index{--index-bg:#10131a;--index-panel:#171b23;--index-soft:#202631;--index-line:#ffffff12;--index-ink:#f7f8fc;--index-muted:#a0a9b8;--index-accent:#ffd54a;display:flex;flex-direction:column;min-height:calc(100vh - var(--tp-index-top,0px));min-height:calc(100dvh - var(--tp-index-top,0px));background:var(--index-bg);color:var(--index-ink);overflow-x:clip}
        .tp-index-light{--index-bg:#f5f5f8;--index-panel:#fff;--index-soft:#f0f1f5;--index-line:#18223818;--index-ink:#202635;--index-muted:#606b7d;--index-accent:#9b7400}
        .tp-index *{box-sizing:border-box}.tp-index button,.tp-index input{font:inherit}.tp-index button{cursor:pointer}.tp-index button:focus-visible,.tp-index a:focus-visible,.tp-index input:focus-visible{outline:3px solid var(--index-accent);outline-offset:4px}
        .tp-index-main{display:flex;flex-direction:column;flex:1;width:100%;max-width:none;padding:26px clamp(16px,3vw,64px) max(16px,env(safe-area-inset-bottom,0px))}
        .tp-index-header{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,390px);align-items:center;gap:24px;padding-bottom:22px;border-bottom:1px solid var(--index-line)}.tp-index-title-line{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.tp-index h1{font-size:clamp(28px,2.8vw,42px);font-weight:750;letter-spacing:-1px;line-height:1.15;margin:0}.tp-index-set-count{border:1px solid var(--index-line);background:var(--index-panel);color:var(--index-muted);border-radius:999px;padding:5px 10px;font-size:12px}.tp-index-header p{font-size:13px;line-height:1.7;color:var(--index-muted);margin:10px 0 0}
        .tp-index-search{display:flex;align-items:center;gap:10px;border:1px solid var(--index-line);background:var(--index-panel);border-radius:14px;padding:0 14px;color:var(--index-muted);min-width:0}.tp-index-search input{width:100%;min-width:0;height:46px;background:transparent;border:0;border-radius:10px;color:var(--index-ink);font-size:16px;outline:none}.tp-index-search button{display:grid;place-items:center;flex-shrink:0;background:var(--index-soft);border:0;border-radius:8px;padding:5px;color:var(--index-muted)}
        .tp-index-filters{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:20px 0}.tp-index-filters button{display:flex;align-items:center;gap:8px;border:1px solid var(--index-line);border-radius:12px;background:var(--index-panel);padding:9px 13px;color:var(--index-muted);font-size:12px;font-weight:600;transition:background .18s,color .18s,border-color .18s}.tp-index-filters button:hover{color:var(--index-ink);border-color:#d5b44355}.tp-index-filters button[aria-pressed=true]{background:#ffd54a;border-color:#ffd54a;color:#29230e}.tp-index-filters span{display:grid;place-items:center;min-width:20px;height:20px;padding:0 4px;border-radius:7px;background:#88888815;font-size:10px}
        .tp-index-results{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin:0 0 14px}.tp-index-results h2{font-size:17px;font-weight:700;margin:0}.tp-index-results p{font-size:12px;color:var(--index-muted);margin:0}.tp-index-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:18px;align-content:start}.tp-index-card{display:flex;flex-direction:column;min-width:0;overflow:hidden;border:1px solid var(--index-line);border-radius:18px;background:var(--index-panel);color:var(--index-ink);text-decoration:none;animation:tp-index-enter .35s both;transition:transform .2s,border-color .2s,box-shadow .2s}.tp-index-card:hover{transform:translateY(-3px);border-color:#d5b44366;box-shadow:0 10px 24px #0002}
        .tp-index-preview{position:relative;aspect-ratio:16/10;overflow:hidden;background:var(--index-soft);border-radius:17px 17px 0 0}.tp-index-image{display:block;position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .25s,transform .5s}.tp-index-image.is-loaded{opacity:1}.tp-index-card:hover .tp-index-image{transform:scale(1.025)}.tp-index-category{position:absolute;left:10px;bottom:10px;border-radius:9px;background:#111820e6;color:#fff;padding:5px 9px;font-size:10px;line-height:1.3}.tp-index-shimmer{position:absolute;inset:0;overflow:hidden;border-radius:inherit;background:var(--index-soft)}.tp-index-shimmer:after{content:"";position:absolute;inset:0;background:linear-gradient(110deg,transparent,#bfc5d422,transparent);transform:translateX(-100%);animation:tp-index-shimmer 1.6s linear infinite}.tp-index-preview-error{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;position:absolute;inset:0;color:var(--index-muted);font-size:12px}
        .tp-index-card-content{display:flex;flex-direction:column;flex:1;gap:12px;padding:15px}.tp-index-card-title{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.tp-index-card h3{font-size:16px;font-weight:700;line-height:1.4;margin:0}.tp-index-card-title>svg{flex-shrink:0;color:var(--index-accent);margin-top:3px;transition:transform .2s}.tp-index-card:hover .tp-index-card-title>svg{transform:translateX(3px)}.tp-index-card-footer{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:auto;font-size:12px;color:var(--index-muted)}.tp-index-card-footer span:last-child{color:var(--index-accent);font-size:11px}.tp-index-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;border:1px solid var(--index-line);background:var(--index-panel);border-radius:18px;padding:36px 20px;gap:12px}.tp-index-empty h3{font-size:18px;margin:0}.tp-index-empty p{font-size:13px;color:var(--index-muted);margin:0}.tp-index-empty button{margin-top:6px;border:0;border-radius:12px;background:#ffd54a;color:#29230e;padding:10px 16px;font-size:12px;font-weight:700}
        @keyframes tp-index-enter{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes tp-index-shimmer{to{transform:translateX(100%)}}
        @media(min-width:1800px){.tp-index-grid{grid-template-columns:repeat(auto-fill,minmax(280px,1fr))}}
        @media(max-width:760px){.tp-index-main{padding:18px 12px max(12px,env(safe-area-inset-bottom,0px))}.tp-index-header{grid-template-columns:1fr;gap:16px;padding-bottom:16px}.tp-index h1{font-size:30px}.tp-index-header p{font-size:12px;margin-top:8px}.tp-index-filters{gap:6px;margin:16px 0}.tp-index-filters button{padding:8px 10px;font-size:11px;border-radius:10px}.tp-index-filters span{height:18px;min-width:18px;font-size:9px}.tp-index-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.tp-index-preview{aspect-ratio:1.25}.tp-index-card{border-radius:15px}.tp-index-preview{border-radius:14px 14px 0 0}.tp-index-card-content{padding:11px;gap:10px}.tp-index-card h3{font-size:13px}.tp-index-card-title>svg{width:14px;height:14px}.tp-index-card-footer{align-items:flex-start;flex-direction:column;gap:5px;font-size:11px}.tp-index-category{left:7px;bottom:7px;font-size:9px;padding:4px 7px}.tp-index-results h2{font-size:15px}.tp-index-results p{font-size:11px}}
        @media(prefers-reduced-motion:reduce){.tp-index *,.tp-index *:after{animation:none!important;transition:none!important}.tp-index-card:hover,.tp-index-card:hover .tp-index-image,.tp-index-card:hover .tp-index-card-title>svg{transform:none}}
      `}</style>
      <main className="tp-index-main">
        <header className="tp-index-header">
          <div><div className="tp-index-title-line"><h1>Trading Post</h1><span className="tp-index-set-count">{setButtons.length} sets</span></div><p>Choose a set to find cards for trade or sale. Your ISO appears first.</p></div>
          <label className="tp-index-search"><Search size={18} /><input aria-label="Find a set" placeholder="Find a set..." value={search} onChange={(event) => setSearch(event.target.value)} />{search && <button type="button" onClick={() => setSearch("")} aria-label="Clear set search"><X size={14} /></button>}</label>
        </header>
        <nav className="tp-index-filters" aria-label="Set categories">{groups.map((group) => <button type="button" key={group} aria-pressed={activeGroup === group} onClick={() => setActiveGroup(group)}>{group}<span>{group === "All" ? setButtons.length : setButtons.filter((set) => set.group === group).length}</span></button>)}</nav>
        <div className="tp-index-results"><h2>{activeGroup === "All" ? "All sets" : activeGroup}</h2><p aria-live="polite">{visibleSets.length} {visibleSets.length === 1 ? "set" : "sets"}{term ? " found" : " available"}</p></div>
        {visibleSets.length ? <div className="tp-index-grid" key={activeGroup}>{visibleSets.map((set, index) => <Link key={set.to} to={set.to} className="tp-index-card" style={{ animationDelay: `${Math.min(index, 5) * 35}ms` }} aria-label={`Browse ${set.title} trading listings`}><SetPreview set={set} /><div className="tp-index-card-content"><div className="tp-index-card-title"><h3>{set.title}</h3><ArrowRight size={17} /></div><div className="tp-index-card-footer"><span>{set.subtitle}</span><span>View listings</span></div></div></Link>)}</div> : <div className="tp-index-empty"><Search size={28} /><h3>No sets match your search</h3><p>Try another name or choose a different category.</p><button type="button" onClick={() => { setSearch(""); setActiveGroup("All"); }}>Show all sets</button></div>}
      </main>
    </div>
  );
}