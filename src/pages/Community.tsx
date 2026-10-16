import { ArrowUpRight, Crown, Flag, Layers, Search, ShieldCheck, Trophy, X } from "lucide-react";
import ProfileAvatar from "@/components/ProfileAvatar";
import CardImage from "@/components/CardImage";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getProfileAssets } from "./Everypony/profile-assets";
import elementOfMagic from "/website-assets/elementofmagic.webp";
import elementOfLoyalty from "/website-assets/elementofloyalty.webp";
import elementOfKindness from "/website-assets/elementofkindness.webp";
import elementOfGenerosity from "/website-assets/elementofgenerosity.webp";
import elementOfHonesty from "/website-assets/elementofhonesty.webp";
const sets = [
  { id: "1", name: "Eternal Moon First Edition", total: 186 },
  { id: "5", name: "Eternal Rainbow First Edition", total: 146 },
  { id: "7", name: "Fun Moments First Edition", total: 127 },
  { id: "2", name: "Eternal Moon Second Edition", total: 189 },
  { id: "8", name: "Fun Moments Second Edition", total: 136 },
  { id: "3", name: "Eternal Moon Third Edition", total: 290 },
  { id: "13", name: "Eternal Moon Fourth Edition", total: 162 },
  { id: "11", name: "Fun Moments Third Edition", total: 148 },
  { id: "4", name: "Star First Edition", total: 105 },
  { id: "6", name: "Eternal Rainbow Second Edition", total: 170 },
  {
    id: "friendshipsbegin",
    dbId: "SD",
    name: "Friendships Begin",
    total: 194,
  },
  {
    id: "fantasywonderland",
    dbId: "FW",
    name: "Fantasy Wonderland",
    total: 191,
    folder: "fantasywonderland",
    prefix: "BP01",
    rarities: {
      C: 48,
      U: 18,
      ER: 6,
      SR: 14,
      SPR: 28,
      GR: 12,
      CR: 12,
      RR: 6,
      PER: 12,
      PSPR: 11,
      PGR: 6,
      PCR: 12,
      PRR: 6,
    },
  },
  {
    id: "discord",
    dbId: "12",
    name: "Discord",
    total: 191,
  },
  {
    id: "14",
    dbId: "14",
    name: "Nightmare Night",
    total: 190,
  },
  {
    id: "hearthswarming-eve",
    dbId: "hearthswarming-eve",
    name: "HeartsWarming Eve",
    total: 197,
  },
];
const manualFirstFinishers: Record<
  string,
  {
    id: string;
  }
> = {
  "1": {
    id: "94a1c998-d040-4dd2-b2fb-5f606287139d",
  },
  "2": {
    id: "94a1c998-d040-4dd2-b2fb-5f606287139d",
  },
  "3": {
    id: "2692c7a3-bce3-45b7-8636-5e18bf39edc3",
  },
  "5": {
    id: "17e57e39-bc0c-44e7-b373-ac34c6690185",
  },
  "6": {
    id: "2692c7a3-bce3-45b7-8636-5e18bf39edc3",
  },
  "7": {
    id: "94a1c998-d040-4dd2-b2fb-5f606287139d",
  },
  "8": {
    id: "2692c7a3-bce3-45b7-8636-5e18bf39edc3",
  },
  "11": {
    id: "2692c7a3-bce3-45b7-8636-5e18bf39edc3",
  },
  friendshipsbegin: {
    id: "2692c7a3-bce3-45b7-8636-5e18bf39edc3",
  },
  fantasywonderland: {
    id: "948dcf0c-0ec3-4123-8b8e-f23ad334fb30",
  },
    "discord": {
    id: "2692c7a3-bce3-45b7-8636-5e18bf39edc3",
  },
    "13": {
    id: "2692c7a3-bce3-45b7-8636-5e18bf39edc3",
  },
};
type Category = "all" | "star" | "ccg" | "rainbow" | "funmoments" | "tcg";
type Collector = { id: string; username?: string; avatar_url?: string | null };
const categories: { id: Category; label: string; icon?: string }[] = [
  { id: "all", label: "All collections" },
  { id: "ccg", label: "Moon", icon: elementOfKindness },
  { id: "star", label: "Star", icon: elementOfMagic },
  { id: "rainbow", label: "Rainbow", icon: elementOfLoyalty },
  { id: "funmoments", label: "Fun Moments", icon: elementOfGenerosity },
  { id: "tcg", label: "Trading Card Game", icon: elementOfHonesty },
];
const collectionPresentation: Record<string, { category: Category; title: string; image: string }> = {
  "1": { category: "ccg", title: "Moon One", image: "/thumbnails/moononesetimage.webp" },
  "2": { category: "ccg", title: "Moon Two", image: "/thumbnails/moontwosetimage.webp" },
  "3": { category: "ccg", title: "Moon Three", image: "/thumbnails/moonthreesetimage.webp" },
  "13": { category: "ccg", title: "Moon Four", image: "/thumbnails/moonfoursetimage.webp" },
  "4": { category: "star", title: "Star One", image: "/thumbnails/staronesetimage.webp" },
  "5": { category: "rainbow", title: "Rainbow One", image: "/thumbnails/rainbowonesetimage.webp" },
  "6": { category: "rainbow", title: "Rainbow Two", image: "/thumbnails/rainbowtwosetimage.webp" },
  "7": { category: "funmoments", title: "Fun Moments One", image: "/thumbnails/funonesetimage.webp" },
  "8": { category: "funmoments", title: "Fun Moments Two", image: "/thumbnails/funtwosetimage.webp" },
  "11": { category: "funmoments", title: "Fun Moments Three", image: "/thumbnails/funthreesetimage.webp" },
  friendshipsbegin: { category: "tcg", title: "Friendships Begin", image: "/thumbnails/friendshipsbeginsetimage.webp" },
  fantasywonderland: { category: "tcg", title: "Fantasy Wonderland", image: "/thumbnails/fantasysetimage.webp" },
  discord: { category: "tcg", title: "Discord", image: "/thumbnails/discordsetimage.webp" },
  "14": { category: "tcg", title: "Nightmare Night", image: "/thumbnails/nightmarenightsetimage.webp" },
  "hearthswarming-eve": { category: "tcg", title: "HeartsWarming Eve", image: "/thumbnails/hearthswarmingsetimage.png" },
};
const collectionOrder = ["1", "2", "3", "13", "4", "5", "6", "7", "8", "11", "friendshipsbegin", "fantasywonderland", "discord", "14", "hearthswarming-eve"];
const championId = "2692c7a3-bce3-45b7-8636-5e18bf39edc3";
const readTheme = () => {
  if (typeof document === "undefined") return "dark";
  const root = document.documentElement;
  const stored = root.dataset.theme || "";
  if (stored === "spooky" || root.classList.contains("spooky")) return "spooky";
  return stored === "light" || root.classList.contains("light") ? "light" : "dark";
};
const communityStyles = `
.community-hub{--ch-bg:#111315;--ch-panel:#181b1e;--ch-soft:#202428;--ch-text:#f2f3f4;--ch-muted:#9bA3ab;--ch-line:#ffffff12;--ch-accent:#e7c84b;--ch-wash:#e7c84b12;--ch-on-accent:#211c0c;min-height:calc(100dvh - 80px);background:var(--ch-bg);color:var(--ch-text);font-family:inherit;padding:34px 28px max(92px,env(safe-area-inset-bottom));box-sizing:border-box}
.community-hub[data-mode="light"]{--ch-bg:hsl(var(--background,0 0% 98%));--ch-panel:#fff;--ch-soft:#f1f3f4;--ch-text:#20262b;--ch-muted:#6d767d;--ch-line:#19242d14;--ch-wash:#c49b1210}
.community-hub[data-mode="spooky"]{--ch-accent:#be9af9;--ch-wash:#be9af914;--ch-on-accent:#251a39}
.community-hub *{box-sizing:border-box}.community-hub button,.community-hub input{font:inherit}.community-hub button{cursor:pointer}.community-hub button:focus-visible,.community-hub input:focus-visible{outline:2px solid var(--ch-accent);outline-offset:4px}.ch-wrap{max-width:1330px;margin:auto}.ch-topline{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:30px}.ch-kicker{display:flex;align-items:center;gap:9px;color:var(--ch-muted);font-size:10px;font-weight:700;letter-spacing:.15em;text-transform:uppercase}.ch-kicker i{width:7px;height:7px;display:block;border-radius:50%;background:var(--ch-accent)}.ch-top-link{display:flex;align-items:center;gap:7px;border:0;background:none;color:var(--ch-muted);font-size:12px;padding:6px 0}.ch-top-link:hover{color:var(--ch-text)}
.ch-hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(320px,430px);gap:56px;align-items:center;margin-bottom:34px}.ch-intro h1{font-size:clamp(40px,5.4vw,68px);line-height:1.04;letter-spacing:-.055em;font-weight:750;margin:0 0 18px}.ch-intro h1 span{color:var(--ch-accent)}.ch-intro>p{max-width:510px;margin:0;font-size:14px;line-height:1.8;color:var(--ch-muted)}.ch-intro-facts{display:flex;gap:28px;margin-top:24px}.ch-fact{display:flex;align-items:baseline;gap:7px;font-size:11px;color:var(--ch-muted)}.ch-fact strong{color:var(--ch-text);font-size:20px;font-weight:700;letter-spacing:-.04em}
.ch-spotlight{position:relative;padding:24px;border:1px solid var(--ch-line);border-radius:22px;background:var(--ch-panel);overflow:hidden}.ch-spotlight:before{content:"";position:absolute;left:0;top:25px;bottom:25px;width:3px;border-radius:0 3px 3px 0;background:var(--ch-accent)}.ch-spotlight-label{display:flex;align-items:center;gap:8px;color:var(--ch-accent);font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}.ch-spotlight-person{display:flex;align-items:center;gap:16px;margin:20px 0 16px}.ch-champion-avatar{width:66px;height:66px;flex-shrink:0;border-radius:19px;object-fit:cover;background:var(--ch-soft)}.ch-champion-name{display:flex;align-items:center;gap:7px;font-size:24px;font-weight:700;letter-spacing:-.035em;min-width:0}.ch-champion-name>span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ch-verification{width:18px;height:18px;object-fit:contain}.ch-champion-role{color:var(--ch-muted);font-size:11px;margin:4px 0 0}.ch-spotlight-note{margin:0;padding-top:16px;border-top:1px solid var(--ch-line);font-size:11px;line-height:1.75;color:var(--ch-muted)}
.ch-browse{border-top:1px solid var(--ch-line);padding-top:26px}.ch-browse-top{display:flex;align-items:center;justify-content:space-between;gap:24px;margin-bottom:20px}.ch-section-title{display:flex;align-items:center;gap:12px}.ch-section-title h2{font-size:19px;margin:0;font-weight:650;letter-spacing:-.03em}.ch-count{padding:4px 8px;background:var(--ch-soft);border:1px solid var(--ch-line);border-radius:7px;color:var(--ch-muted);font-size:10px;font-variant-numeric:tabular-nums}.ch-search{display:flex;align-items:center;gap:9px;min-width:270px;background:var(--ch-panel);border:1px solid var(--ch-line);border-radius:12px;padding:0 12px;color:var(--ch-muted)}.ch-search input{width:100%;min-width:0;border:0;outline:none;background:transparent;color:var(--ch-text);font-size:16px;padding:11px 0;line-height:1.2}.ch-search input::placeholder{color:var(--ch-muted);font-size:12px}.ch-search button{padding:4px;border:0;background:none;color:var(--ch-muted);display:flex;align-items:center;justify-content:center}.ch-tabs{display:flex;gap:7px;overflow:auto;padding:3px 3px 14px;margin:0 -3px 8px;scrollbar-width:thin;scrollbar-color:var(--ch-line) transparent}.ch-tab{display:flex;align-items:center;justify-content:center;gap:8px;flex-shrink:0;border:1px solid var(--ch-line);border-radius:11px;background:var(--ch-panel);padding:10px 14px;color:var(--ch-muted);font-size:11px;transition:background .15s,color .15s,border-color .15s}.ch-tab img{width:19px;height:19px;object-fit:contain}.ch-tab b{font-size:9px;font-weight:500;opacity:.7;margin-left:2px}.ch-tab[aria-pressed="true"]{background:var(--ch-accent);border-color:var(--ch-accent);color:var(--ch-on-accent);font-weight:700}.ch-tab:not([aria-pressed="true"]):hover{border-color:var(--ch-muted);color:var(--ch-text)}
.ch-table-head{display:grid;grid-template-columns:40px minmax(0,1fr) 92px minmax(180px,250px) 34px;gap:18px;padding:8px 22px 12px;color:var(--ch-muted);font-size:9px;font-weight:600;letter-spacing:.1em;text-transform:uppercase}.ch-table-head>span:first-child{grid-column:2}.ch-rows{display:grid;gap:8px}.ch-row{width:100%;display:grid;grid-template-columns:40px minmax(0,1fr) 92px minmax(180px,250px) 34px;align-items:center;gap:18px;padding:18px 22px;text-align:left;border:1px solid var(--ch-line);border-radius:16px;background:var(--ch-panel);color:var(--ch-text);transition:border-color .15s,background .15s}.ch-row:hover{border-color:var(--ch-accent);background:var(--ch-soft)}.ch-row-number{font-size:11px;font-variant-numeric:tabular-nums;color:var(--ch-muted)}.ch-set{display:flex;align-items:center;gap:17px;min-width:0}.ch-set-art{width:57px;height:64px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border-radius:10px;background:var(--ch-soft);padding:5px;overflow:hidden}.ch-set-art img{width:100%;height:100%;object-fit:contain}.ch-set-copy{min-width:0}.ch-set-family{display:block;font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:var(--ch-muted);margin-bottom:6px}.ch-set-title{display:block;font-size:16px;line-height:1.3;letter-spacing:-.025em;font-weight:650}.ch-set-mobile-count{display:none}.ch-total{font-size:20px;font-weight:600;letter-spacing:-.035em;font-variant-numeric:tabular-nums}.ch-total span{display:block;font-size:9px;letter-spacing:0;font-weight:400;color:var(--ch-muted);margin-top:4px}.ch-finisher{display:flex;align-items:center;gap:11px;min-width:0}.ch-finisher-avatar{width:37px;height:37px;border-radius:11px;object-fit:cover;background:var(--ch-soft);flex-shrink:0}.ch-finisher-copy{min-width:0}.ch-finisher-name{display:block;font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ch-finisher-caption{display:flex;align-items:center;gap:4px;color:var(--ch-muted);font-size:9px;margin-top:5px}.ch-finisher-caption svg{color:var(--ch-accent)}.ch-open-icon{width:37px;height:37px;display:flex;align-items:center;justify-content:center;border:1px dashed var(--ch-line);border-radius:11px;color:var(--ch-muted);flex-shrink:0}.ch-unclaimed .ch-finisher-name{color:var(--ch-muted);font-weight:400;font-size:11px}.ch-arrow{height:31px;width:31px;border:1px solid var(--ch-line);border-radius:9px;display:flex;align-items:center;justify-content:center;color:var(--ch-muted);transition:background .15s,color .15s}.ch-row:hover .ch-arrow{background:var(--ch-accent);color:var(--ch-on-accent);border-color:transparent}
.ch-footer{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:21px 2px;color:var(--ch-muted);font-size:10px;line-height:1.7}.ch-footer-note{display:flex;align-items:flex-start;gap:8px}.ch-footer-note svg{flex-shrink:0;margin-top:2px;color:var(--ch-accent)}.ch-empty{border:1px dashed var(--ch-line);border-radius:16px;padding:50px 20px;text-align:center;color:var(--ch-muted)}.ch-empty h3{color:var(--ch-text);margin:14px 0 8px;font-size:18px}.ch-empty p{font-size:12px;margin:0 0 20px}.ch-clear{border:1px solid var(--ch-line);border-radius:10px;background:var(--ch-soft);color:var(--ch-text);padding:10px 16px;font-size:12px}.ch-error{display:flex;align-items:center;justify-content:space-between;gap:18px;border:1px solid var(--ch-line);background:var(--ch-wash);border-radius:12px;padding:12px 16px;margin-bottom:16px;font-size:12px;color:var(--ch-muted)}.ch-error button{border:0;background:none;color:var(--ch-accent);font-size:12px;text-decoration:underline;text-underline-offset:3px}.ch-skeleton{display:block;height:12px;width:110px;border-radius:4px;background:var(--ch-soft);animation:ch-pulse 1.6s ease-in-out infinite}.ch-skeleton-small{width:66px;height:9px;margin-top:9px}@keyframes ch-pulse{50%{opacity:.35}}
@media(min-width:1600px){.community-hub{padding-top:48px}.ch-hero{gap:100px;margin-bottom:44px}}
@media(max-width:1000px){.ch-hero{gap:28px;grid-template-columns:minmax(0,1fr) minmax(290px,360px)}.ch-intro h1{font-size:48px}.ch-table-head,.ch-row{grid-template-columns:24px minmax(0,1fr) 65px minmax(150px,200px) 30px;gap:14px;padding-left:16px;padding-right:16px}.ch-set{gap:13px}.ch-set-title{font-size:14px}.ch-set-art{width:48px;height:57px}.ch-tabs{gap:6px}.ch-tab{padding:10px 12px}}
@media(max-width:720px){.community-hub{padding:20px 14px max(92px,env(safe-area-inset-bottom))}.ch-topline{margin-bottom:26px}.ch-top-link{font-size:10px}.ch-kicker{font-size:9px;letter-spacing:.1em}.ch-hero{grid-template-columns:1fr;gap:24px;margin-bottom:25px}.ch-intro h1{font-size:46px;margin-bottom:14px}.ch-intro>p{font-size:12px;line-height:1.8}.ch-intro-facts{margin-top:18px;gap:24px}.ch-fact strong{font-size:18px}.ch-spotlight{padding:18px 20px;border-radius:17px}.ch-spotlight-person{margin:15px 0 13px;gap:13px}.ch-champion-avatar{width:48px;height:48px;border-radius:14px}.ch-champion-name{font-size:21px}.ch-spotlight-note{font-size:10px;padding-top:12px;line-height:1.8}.ch-spotlight:before{top:18px;bottom:18px}.ch-browse{padding-top:22px}.ch-browse-top{flex-wrap:wrap;gap:16px;margin-bottom:14px}.ch-search{min-width:0;width:100%}.ch-search input{padding:12px 0}.ch-section-title h2{font-size:18px}.ch-tabs{margin-bottom:5px;padding-bottom:11px}.ch-tab{padding:10px 12px;font-size:10px}.ch-tab img{height:17px;width:17px}.ch-table-head{display:none}.ch-rows{gap:9px}.ch-row{grid-template-columns:minmax(0,1fr) 27px;gap:13px;padding:16px;border-radius:15px}.ch-row-number,.ch-total{display:none}.ch-set{grid-column:1;gap:13px}.ch-set-art{width:51px;height:58px}.ch-set-title{font-size:15px}.ch-set-family{font-size:8px;margin-bottom:5px}.ch-set-mobile-count{display:block;font-size:10px;margin-top:5px;color:var(--ch-muted)}.ch-finisher{grid-column:1;gap:9px;margin-left:64px;margin-top:0;padding-top:12px;border-top:1px solid var(--ch-line)}.ch-finisher-avatar,.ch-open-icon{width:26px;height:26px;border-radius:8px}.ch-finisher-name{font-size:11px}.ch-finisher-caption{font-size:8px;margin-top:3px}.ch-finisher-caption svg{width:9px;height:9px}.ch-arrow{grid-column:2;grid-row:1 / span 2;width:27px;height:30px}.ch-unclaimed .ch-finisher-name{font-size:10px}.ch-footer{flex-direction:column;align-items:flex-start;font-size:9px;gap:10px;padding-top:18px}.ch-footer>span{padding-left:21px}.ch-error{font-size:11px;gap:12px}.ch-empty{padding:36px 16px}}
@media(prefers-reduced-motion:reduce){.community-hub *{animation:none!important;transition:none!important}}
`;
const Community = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [search, setSearch] = useState("");
  const [profiles, setProfiles] = useState<Record<string, Collector>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [theme, setTheme] = useState(readTheme);
  useEffect(() => {
    const sync = () => setTheme(readTheme());
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    window.addEventListener("themechange", sync);
    sync();
    return () => { observer.disconnect(); window.removeEventListener("themechange", sync); };
  }, []);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(false);
    const ids = Array.from(new Set([...Object.values(manualFirstFinishers).map(value => value.id), championId]));
    const load = async () => {
      try {
        const { data, error } = await supabase.from("profiles").select("id, username, avatar_url").in("id", ids);
        if (error) throw error;
        if (active) setProfiles(Object.fromEntries((data || []).map(profile => [profile.id, profile])));
      } catch {
        if (active) setLoadError(true);
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [retry]);
  const orderedSets = [...sets].sort((a, b) => collectionOrder.indexOf(a.id) - collectionOrder.indexOf(b.id));
  const visibleSets = orderedSets.filter(set => (activeCategory === "all" || collectionPresentation[set.id]?.category === activeCategory) && `${set.name} ${collectionPresentation[set.id]?.title || ""}`.toLowerCase().includes(search.trim().toLowerCase()));
  const champion = profiles[championId];
  const championAssets = champion ? getProfileAssets(champion) : null;
  const recordedFinishes = Object.keys(manualFirstFinishers).filter(id => sets.some(set => set.id === id)).length;
  const selectedLabel = categories.find(category => category.id === activeCategory)?.label || "All collections";
  return (
    <div className="community-hub" data-mode={theme}>
      <style>{communityStyles}</style>
      <main className="ch-wrap">
        <div className="ch-topline">
          <span className="ch-kicker"><i />MLPEKAYOU / THE COMMUNITY</span>
          <button type="button" className="ch-top-link" onClick={() => navigate("/collections")}>My collections<ArrowUpRight size={13} /></button>
        </div>
        <header className="ch-hero">
          <div className="ch-intro">
            <h1>Smaller Leaderboards.<br /><span>More Recognitions!</span></h1>
            <p>Your place among the collectors. Explore each set's leaderboard, celebrate its first finisher, and see who is closest to completing the collection.</p>
            <div className="ch-intro-facts">
              <span className="ch-fact"><strong>{sets.length}</strong>collections</span>
              <span className="ch-fact"><strong>{recordedFinishes}</strong>first finishes recorded</span>
            </div>
          </div>
          <section className="ch-spotlight" aria-label="Community champion">
            <div className="ch-spotlight-label"><Crown size={15} />Community champion</div>
            <div className="ch-spotlight-person">
              {champion && championAssets ? <ProfileAvatar profile={champion} src={championAssets.avatar} alt={champion.username || "Community champion"} className="ch-champion-avatar" /> : <div className="ch-champion-avatar" aria-hidden="true" />}
              <div style={{ minWidth: 0 }}>
                <div className="ch-champion-name">{loading ? <span className="ch-skeleton" /> : <span>{champion?.username || "Mari"}</span>}{championAssets?.verification && <CardImage src={championAssets.verification.badge} alt={championAssets.verification.label} title={championAssets.verification.label} className="ch-verification" />}</div>
                <p className="ch-champion-role">Top Mastersetter</p>
              </div>
            </div>
            <p className="ch-spotlight-note">Mari is a top supporter of MLPEKayou and a pillar of the community. She rules both the TCG and CCG leaderboards and has been personally verified to be a North American-only collector.</p>
          </section>
        </header>
        <section className="ch-browse" aria-labelledby="ch-leaderboards-title">
          <div className="ch-browse-top">
            <div className="ch-section-title"><h2 id="ch-leaderboards-title">Set leaderboards</h2><span className="ch-count">{sets.length}</span></div>
            <div className="ch-search"><Search size={15} aria-hidden="true" /><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Find a collection..." aria-label="Find a collection" />{search && <button type="button" aria-label="Clear collection search" onClick={() => setSearch("")}><X size={14} /></button>}</div>
          </div>
          <nav className="ch-tabs" aria-label="Collection category">{categories.map(category => <button type="button" className="ch-tab" key={category.id} aria-pressed={activeCategory === category.id} onClick={() => setActiveCategory(category.id)}>{category.icon ? <CardImage src={category.icon} alt="" /> : <Layers size={15} />}<span>{category.label}</span><b>{category.id === "all" ? sets.length : sets.filter(set => collectionPresentation[set.id]?.category === category.id).length}</b></button>)}</nav>
          {loadError && <div className="ch-error" role="status"><span>Collector profiles could not be loaded. You can still open any leaderboard.</span><button type="button" onClick={() => setRetry(value => value + 1)}>Try again</button></div>}
          <div className="ch-table-head" aria-hidden="true"><span>Collection</span><span>Set size</span><span>First finisher</span></div>
          <div className="ch-rows" aria-label={`${selectedLabel} leaderboards`}>
            {visibleSets.map((set, index) => {
              const presentation = collectionPresentation[set.id];
              const winnerId = manualFirstFinishers[set.id]?.id;
              const winner = winnerId ? profiles[winnerId] : undefined;
              const assets = winner ? getProfileAssets(winner) : null;
              return <button type="button" className="ch-row" key={set.id} onClick={() => navigate(`/community/${set.id}`)} aria-label={`Open ${set.name} leaderboard`}>
                <span className="ch-row-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="ch-set"><span className="ch-set-art"><CardImage src={presentation.image} alt="" /></span><span className="ch-set-copy"><span className="ch-set-family">{categories.find(category => category.id === presentation.category)?.label}</span><span className="ch-set-title">{presentation.title}</span><span className="ch-set-mobile-count">{set.total} cards in this set</span></span></span>
                <span className="ch-total">{set.total}<span>cards to collect</span></span>
                {loading && winnerId ? <span className="ch-finisher"><span className="ch-finisher-avatar" /><span><span className="ch-skeleton" /><span className="ch-skeleton ch-skeleton-small" /></span></span> : winner && assets ? <span className="ch-finisher"><ProfileAvatar profile={winner} src={assets.avatar} alt="" className="ch-finisher-avatar" /><span className="ch-finisher-copy"><span className="ch-finisher-name">{winner.username || "Collector"}</span><span className="ch-finisher-caption"><Trophy size={10} />First finisher</span></span></span> : <span className="ch-finisher ch-unclaimed"><span className="ch-open-icon"><Flag size={14} /></span><span className="ch-finisher-copy"><span className="ch-finisher-name">{winnerId ? "Finisher recorded" : "No finisher recorded"}</span><span className="ch-finisher-caption">{winnerId ? "View leaderboard" : "Explore the leaderboard"}</span></span></span>}
                <span className="ch-arrow" aria-hidden="true"><ArrowUpRight size={15} /></span>
              </button>;
            })}
          </div>
          {visibleSets.length === 0 && <div className="ch-empty"><Search size={24} /><h3>No collections found</h3><p>Try a different name or browse all collections.</p><button type="button" className="ch-clear" onClick={() => { setSearch(""); setActiveCategory("all"); }}>Show all collections</button></div>}
          <footer className="ch-footer"><div className="ch-footer-note"><ShieldCheck size={13} /><span>Discord verification is required for leaderboard placement and first-finisher claims.</span></div><span role="status" aria-live="polite">Showing {visibleSets.length} of {sets.length} collections</span></footer>
        </section>
      </main>
    </div>
  );
};
export default Community;
