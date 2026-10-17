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
    name: "HearthsWarming Eve",
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
.community-hub{--ch-bg:#111315;--ch-panel:#181b1e;--ch-soft:#202428;--ch-text:#f2f3f4;--ch-muted:#a1a7ae;--ch-line:#ffffff14;--ch-accent:#e7c84b;--ch-wash:#e7c84b0d;--ch-on-accent:#211c0c;width:100%;min-height:calc(100dvh - 80px);padding:22px 24px max(88px,env(safe-area-inset-bottom));background:var(--ch-bg);color:var(--ch-text);font-family:inherit}
.community-hub[data-mode="light"]{--ch-bg:hsl(var(--background,0 0% 98%));--ch-panel:#fff;--ch-soft:#f1f3f4;--ch-text:#20262b;--ch-muted:#68727b;--ch-line:#19242d18;--ch-wash:#c49b1210}.community-hub[data-mode="spooky"]{--ch-accent:#be9af9;--ch-wash:#be9af911;--ch-on-accent:#251a39}.community-hub *{box-sizing:border-box}.community-hub button,.community-hub input{font:inherit}.community-hub button{cursor:pointer}.community-hub button:focus-visible,.community-hub input:focus-visible{outline:2px solid var(--ch-accent);outline-offset:3px}.ch-wrap{width:100%;max-width:none;margin:0}.ch-topline{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:18px}.ch-kicker{display:flex;align-items:center;gap:8px;color:var(--ch-muted);font-size:10px;letter-spacing:.07em;font-weight:650}.ch-kicker i{width:6px;height:6px;border-radius:50%;background:var(--ch-accent)}.ch-top-link{display:flex;align-items:center;gap:6px;border:0;background:none;color:var(--ch-muted);font-size:12px;padding:8px 0}.ch-top-link:hover{color:var(--ch-text)}
.ch-hero{display:grid;grid-template-columns:minmax(250px,.8fr) minmax(0,1.2fr);gap:26px;align-items:center;margin-bottom:22px}.ch-intro h1{font-size:32px;line-height:1.15;letter-spacing:-.04em;margin:0 0 10px}.ch-intro>p{font-size:13px;line-height:1.65;color:var(--ch-muted);margin:0;max-width:430px}.ch-intro-facts{display:flex;gap:20px;flex-wrap:wrap;margin-top:12px}.ch-fact{display:flex;align-items:baseline;gap:6px;color:var(--ch-muted);font-size:11px}.ch-fact strong{font-size:17px;color:var(--ch-text)}
.ch-spotlight{border:1px solid var(--ch-line);border-radius:18px;background:linear-gradient(115deg,var(--ch-wash),transparent 75%),var(--ch-panel);padding:20px 22px;position:relative;overflow:hidden}.ch-spotlight:before{content:"";position:absolute;left:0;top:20px;bottom:20px;width:3px;background:var(--ch-accent);border-radius:0 3px 3px 0}.ch-champion-content{display:grid;grid-template-columns:auto minmax(0,1fr);gap:10px 22px;align-items:center}.ch-spotlight-label{grid-column:1 / -1;display:flex;align-items:center;gap:7px;color:var(--ch-accent);font-size:11px;font-weight:650}.ch-spotlight-person{display:flex;align-items:center;gap:14px;min-width:0}.ch-champion-avatar{width:64px;height:64px;border-radius:17px;object-fit:cover;flex-shrink:0;background:var(--ch-soft)}.ch-champion-name{display:flex;align-items:center;gap:7px;font-size:25px;font-weight:700;min-width:0}.ch-champion-name>span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ch-verification{height:19px;width:19px;object-fit:contain}.ch-champion-role{margin:4px 0 0;font-size:11px;color:var(--ch-muted)}.ch-spotlight-note{margin:0;font-size:11px;line-height:1.75;color:var(--ch-muted)}.ch-champion-details{min-width:0}
.ch-browse{border-top:1px solid var(--ch-line);padding-top:18px;display:grid;grid-template-columns:minmax(0,1fr) minmax(220px,300px);gap:18px}.ch-browse-top{display:contents}.ch-section-title{display:none}.ch-search{grid-column:2;grid-row:1;display:flex;align-items:center;gap:9px;width:100%;height:43px;border:1px solid var(--ch-line);border-radius:11px;background:var(--ch-panel);padding:0 12px;color:var(--ch-muted)}.ch-search input{background:none;border:0;outline:none;width:100%;min-width:0;color:var(--ch-text);font-size:16px;padding:9px 0}.ch-search input::placeholder{font-size:12px;color:var(--ch-muted)}.ch-search button{display:flex;align-items:center;justify-content:center;padding:4px;border:0;background:none;color:var(--ch-muted)}.ch-tabs{grid-column:1;grid-row:1;display:flex;flex-wrap:wrap;gap:8px}.ch-tab{display:flex;align-items:center;justify-content:center;gap:7px;flex-shrink:0;min-height:43px;padding:9px 14px;border:1px solid var(--ch-line);border-radius:11px;background:var(--ch-panel);color:var(--ch-muted);font-size:12px;transition:background .2s,color .2s,transform .2s}.ch-tab img{width:18px;height:18px;object-fit:contain}.ch-tab[aria-pressed="true"]{background:var(--ch-accent);color:var(--ch-on-accent);border-color:var(--ch-accent)}.ch-tab:hover{transform:translateY(-1px)}.ch-rows,.ch-error,.ch-empty,.ch-footer{grid-column:1 / -1}.ch-rows{display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:16px;align-items:stretch}
.ch-row{width:100%;display:grid;grid-template-columns:minmax(0,1fr);grid-template-rows:auto auto;align-content:start;gap:18px;padding:22px;border:1px solid var(--ch-line);border-radius:17px;background:var(--ch-panel);color:var(--ch-text);text-align:left;position:relative;overflow:hidden;animation:ch-enter .38s ease both;transition:transform .2s,border-color .2s,box-shadow .2s}.ch-row:before{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(110deg,transparent 20%,var(--ch-wash),transparent 80%);opacity:0;transition:opacity .25s}.ch-row:hover{transform:translateY(-3px);border-color:var(--ch-accent);box-shadow:0 8px 22px #00000018}.ch-row:hover:before{opacity:1}.ch-finisher{grid-row:1;display:flex;align-items:center;gap:16px;min-width:0;padding:0;margin:0;z-index:1}.ch-finisher-avatar,.ch-open-icon{width:62px;height:62px;border-radius:17px;flex-shrink:0;background:var(--ch-soft);object-fit:cover}.ch-open-icon{display:flex;align-items:center;justify-content:center;color:var(--ch-accent)}.ch-open-icon svg{width:24px;height:24px}.ch-finisher-copy{display:flex;flex-direction:column-reverse;gap:7px;min-width:0}.ch-finisher-name{display:block;font-size:23px;line-height:1.2;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ch-finisher-caption{display:flex;align-items:center;gap:6px;color:var(--ch-accent);font-size:11px;line-height:1.4}.ch-finisher-caption svg{width:13px;height:13px;flex-shrink:0}.ch-unclaimed .ch-finisher-name{font-size:17px;font-weight:600;color:var(--ch-muted)}.ch-unclaimed .ch-finisher-caption{color:var(--ch-muted)}
.ch-set{grid-row:2;display:flex;align-items:center;gap:12px;min-width:0;padding:16px 28px 0 0;border-top:1px solid var(--ch-line);z-index:1}.ch-set-art{width:48px;height:54px;display:flex;align-items:center;justify-content:center;flex-shrink:0;padding:2px;background:none;border-radius:7px;overflow:hidden}.ch-set-art img{width:100%;height:100%;max-width:none;object-fit:contain}.ch-set-copy{min-width:0}.ch-set-family{display:block;font-size:9px;color:var(--ch-muted);margin-bottom:4px}.ch-set-title{display:block;font-size:15px;line-height:1.3;font-weight:600}.ch-set-mobile-count{display:block;font-size:11px;color:var(--ch-muted);margin-top:4px}.ch-arrow{position:absolute;right:20px;bottom:31px;width:24px;height:24px;display:flex;align-items:center;justify-content:center;color:var(--ch-muted);transition:transform .2s,color .2s}.ch-row:hover .ch-arrow{transform:translate(2px,-2px);color:var(--ch-accent)}
.ch-footer{display:flex;justify-content:space-between;align-items:start;gap:16px;font-size:10px;line-height:1.7;color:var(--ch-muted);padding:0 0 12px}.ch-footer-note{display:flex;gap:7px}.ch-footer-note svg{flex-shrink:0;margin-top:2px;color:var(--ch-accent)}.ch-footer>span{white-space:nowrap}.ch-empty{border:1px dashed var(--ch-line);border-radius:16px;text-align:center;padding:32px 16px;color:var(--ch-muted)}.ch-empty h3{color:var(--ch-text);font-size:18px;margin:12px 0 8px}.ch-empty p{font-size:12px}.ch-clear,.ch-error button{padding:9px 13px;border:1px solid var(--ch-line);border-radius:9px;background:var(--ch-soft);color:var(--ch-text);font-size:12px}.ch-error{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px;border:1px solid var(--ch-line);border-radius:12px;font-size:12px;color:var(--ch-muted)}.ch-skeleton{display:block;width:110px;height:15px;border-radius:5px;background:var(--ch-soft);animation:ch-pulse 1.8s ease-in-out infinite}.ch-skeleton-small{width:70px;height:10px;margin-top:8px}@keyframes ch-enter{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes ch-pulse{50%{opacity:.4}}
@media(max-width:1100px){.ch-hero{grid-template-columns:1fr;gap:18px}.ch-champion-content{grid-template-columns:auto minmax(0,1fr)}.ch-browse{grid-template-columns:1fr}.ch-search{grid-column:1;grid-row:1}.ch-tabs{grid-column:1;grid-row:2;flex-wrap:nowrap;overflow-x:auto;padding-bottom:4px}.ch-rows{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:680px){.community-hub{padding:16px 14px max(88px,env(safe-area-inset-bottom))}.ch-topline{margin-bottom:16px}.ch-kicker{font-size:9px}.ch-intro h1{font-size:27px}.ch-intro>p{font-size:12px}.ch-intro-facts{gap:17px;margin-top:10px}.ch-hero{gap:16px;margin-bottom:18px}.ch-spotlight{padding:17px}.ch-champion-content{grid-template-columns:1fr;gap:12px}.ch-champion-avatar{height:58px;width:58px;border-radius:16px}.ch-champion-name{font-size:24px}.ch-spotlight-note{font-size:11px;line-height:1.7}.ch-browse{gap:14px;padding-top:15px}.ch-tab{min-height:41px;padding:9px 12px;font-size:11px}.ch-rows{grid-template-columns:minmax(0,1fr);gap:13px}.ch-row{padding:20px;gap:16px;border-radius:16px}.ch-finisher{gap:15px}.ch-finisher-avatar,.ch-open-icon{height:62px;width:62px;border-radius:17px}.ch-finisher-name{font-size:24px}.ch-finisher-caption{font-size:12px}.ch-set{padding-top:14px;gap:12px}.ch-set-art{width:46px;height:52px}.ch-set-title{font-size:15px}.ch-set-mobile-count{font-size:11px}.ch-arrow{right:20px;bottom:29px}.ch-footer{flex-direction:column;gap:8px}.ch-footer>span{padding-left:20px}}
@media(prefers-reduced-motion:reduce){.community-hub *{animation:none!important;transition:none!important}.ch-row:hover,.ch-tab:hover{transform:none}}

.ch-families{grid-column:1 / -1;display:grid;gap:28px}.ch-family-group{min-width:0}.ch-family-heading{display:flex;align-items:center;gap:10px;margin:0 0 14px;font-size:19px;font-weight:650;letter-spacing:-.02em}.ch-family-heading img{height:24px;width:24px;object-fit:contain}.ch-family-heading:after{content:"";height:1px;flex:1;background:var(--ch-line);margin-left:8px}.ch-rows{grid-template-columns:repeat(auto-fill,minmax(295px,1fr));gap:16px}.ch-row{grid-template-rows:auto auto;gap:18px;padding:22px;border-radius:17px;background:var(--ch-panel)}.ch-set{grid-row:1;display:flex;align-items:center;gap:18px;padding:0;border-top:0;min-height:100px}.ch-set-art{height:98px;width:84px;flex-shrink:0;padding:4px;background:var(--ch-soft);border-radius:12px}.ch-set-art img{width:100%;height:100%;object-fit:contain}.ch-set-family{display:none}.ch-set-title{font-size:21px;font-weight:700;line-height:1.25}.ch-set-mobile-count{font-size:12px;line-height:1.4;margin-top:8px}.ch-finisher{grid-row:2;gap:11px;align-items:center;border-top:1px solid var(--ch-line);padding:15px 25px 0 0}.ch-finisher-avatar,.ch-open-icon{height:40px;width:40px;border-radius:12px}.ch-finisher-copy{display:flex;flex-direction:column;gap:4px}.ch-finisher-name{font-size:16px;line-height:1.3;font-weight:600}.ch-finisher-caption{font-size:10px;line-height:1.4;color:var(--ch-muted)}.ch-finisher-caption svg{width:11px;height:11px;color:var(--ch-accent)}.ch-unclaimed .ch-finisher-name{font-size:13px;font-weight:500}.ch-unclaimed .ch-finisher-caption{font-size:10px}.ch-open-icon svg{width:18px;height:18px}.ch-arrow{right:20px;bottom:29px}
@media(min-width:1600px){.ch-rows{grid-template-columns:repeat(auto-fill,minmax(330px,1fr))}}
@media(max-width:900px){.ch-rows{grid-template-columns:repeat(2,minmax(0,1fr))}.ch-set{gap:13px}.ch-set-art{width:70px;height:86px}.ch-set-title{font-size:19px}.ch-row{padding:18px}}
@media(max-width:680px){.ch-families{gap:24px}.ch-family-heading{font-size:18px;margin-bottom:12px}.ch-rows{grid-template-columns:minmax(0,1fr);gap:13px}.ch-row{padding:20px;gap:17px}.ch-set{grid-row:1;gap:18px;min-height:96px;padding:0}.ch-set-art{width:86px;height:100px;border-radius:12px}.ch-set-title{font-size:22px;line-height:1.25}.ch-set-mobile-count{font-size:12px;margin-top:8px}.ch-finisher{grid-row:2;gap:12px;padding:15px 26px 0 0}.ch-finisher-avatar,.ch-open-icon{height:40px;width:40px;border-radius:12px}.ch-finisher-name{font-size:16px}.ch-finisher-caption{font-size:11px}.ch-unclaimed .ch-finisher-name{font-size:14px}.ch-arrow{bottom:28px}}

.community-hub .ch-set-art{width:84px;height:84px;aspect-ratio:1;flex-shrink:0;padding:0;background:transparent;border:0;border-radius:12px;overflow:hidden;display:block}.community-hub .ch-set-art img{display:block;position:static;width:100%;height:100%;max-width:none;margin:0;padding:0;object-fit:cover;object-position:center;border-radius:inherit}
@media(max-width:900px){.community-hub .ch-set-art{width:76px;height:76px}}
@media(max-width:680px){.community-hub .ch-set-art{width:84px;height:84px}}
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
            <h1>Community leaderboards</h1>
            <p>Browse collections, first finishers, and collector rankings.</p>
            <div className="ch-intro-facts">
              <span className="ch-fact"><strong>{sets.length}</strong>collections</span>
              <span className="ch-fact"><strong>{recordedFinishes}</strong>first finishes recorded</span>
            </div>
          </div>
          <section className="ch-spotlight" aria-label="Community champion"><div className="ch-champion-content">
            <div className="ch-spotlight-label"><Crown size={15} />Community champion</div>
            <div className="ch-spotlight-person">
              {champion && championAssets ? <ProfileAvatar profile={champion} src={championAssets.avatar} alt={champion.username || "Community champion"} className="ch-champion-avatar" /> : <div className="ch-champion-avatar" aria-hidden="true" />}
              <div style={{ minWidth: 0 }}>
                <div className="ch-champion-name">{loading ? <span className="ch-skeleton" /> : <span>{champion?.username || "Mari"}</span>}{championAssets?.verification && <CardImage src={championAssets.verification.badge} alt={championAssets.verification.label} title={championAssets.verification.label} className="ch-verification" />}</div>
                <p className="ch-champion-role">Top Mastersetter</p>
              </div>
            </div>
            <div className="ch-champion-details"><p className="ch-spotlight-note">Mari is a top supporter of MLPEKayou and a pillar of the community. She rules both the TCG and CCG leaderboards and has been personally verified to be a North American-only collector.</p></div>
          </div></section>
        </header>
        <section className="ch-browse" aria-labelledby="ch-leaderboards-title">
          <div className="ch-browse-top">
            <div className="ch-section-title"><h2 id="ch-leaderboards-title">Set leaderboards</h2><span className="ch-count">{sets.length}</span></div>
            <div className="ch-search"><Search size={15} aria-hidden="true" /><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Find a collection..." aria-label="Find a collection" />{search && <button type="button" aria-label="Clear collection search" onClick={() => setSearch("")}><X size={14} /></button>}</div>
          </div>
          <nav className="ch-tabs" aria-label="Collection category">{categories.map(category => <button type="button" className="ch-tab" key={category.id} aria-pressed={activeCategory === category.id} onClick={() => setActiveCategory(category.id)}>{category.icon ? <CardImage src={category.icon} alt="" /> : <Layers size={15} />}<span>{category.label}</span></button>)}</nav>
          {loadError && <div className="ch-error" role="status"><span>Collector profiles could not be loaded. You can still open any leaderboard.</span><button type="button" onClick={() => setRetry(value => value + 1)}>Try again</button></div>}
          <div className="ch-families" aria-label={`${selectedLabel} leaderboards`}>
          {categories.filter(category => category.id !== "all" && visibleSets.some(set => collectionPresentation[set.id]?.category === category.id)).map(category => (
            <section className="ch-family-group" key={category.id} aria-label={`${category.label} leaderboards`}>
              <h2 className="ch-family-heading">{category.icon && <CardImage src={category.icon} alt="" />}<span>{category.label}</span></h2>
              <div className="ch-rows">
            {visibleSets.filter(set => collectionPresentation[set.id]?.category === category.id).map((set, index) => {
const presentation = collectionPresentation[set.id];
const winnerId = manualFirstFinishers[set.id]?.id;
const winner = winnerId ? profiles[winnerId] : undefined;
const assets = winner ? getProfileAssets(winner) : null;
              return <button type="button" className="ch-row" style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }} key={set.id} onClick={() => navigate(`/community/${set.id}`)} aria-label={`Open ${set.name} leaderboard`}>
                
                <span className="ch-set"><span className="ch-set-art"><CardImage src={presentation.image} alt="" /></span><span className="ch-set-copy"><span className="ch-set-family">{categories.find(category => category.id === presentation.category)?.label}</span><span className="ch-set-title">{presentation.title}</span><span className="ch-set-mobile-count">{set.total} cards</span></span></span>
                
                {loading && winnerId ? <span className="ch-finisher"><span className="ch-finisher-avatar" /><span><span className="ch-skeleton" /><span className="ch-skeleton ch-skeleton-small" /></span></span> : winner && assets ? <span className="ch-finisher"><ProfileAvatar profile={winner} src={assets.avatar} alt="" className="ch-finisher-avatar" /><span className="ch-finisher-copy"><span className="ch-finisher-name">{winner.username || "Collector"}</span><span className="ch-finisher-caption"><Trophy size={10} />First finisher</span></span></span> : <span className="ch-finisher ch-unclaimed"><span className="ch-open-icon"><Flag size={14} /></span><span className="ch-finisher-copy"><span className="ch-finisher-name">{winnerId ? "Finisher recorded" : "No finisher recorded"}</span><span className="ch-finisher-caption">{winnerId ? "View leaderboard" : "Explore the leaderboard"}</span></span></span>}
                <span className="ch-arrow" aria-hidden="true"><ArrowUpRight size={15} /></span>
              </button>;
            })}
              </div>
            </section>
          ))}
          </div>
          {visibleSets.length === 0 && <div className="ch-empty"><Search size={24} /><h3>No collections found</h3><p>Try a different name or browse all collections.</p><button type="button" className="ch-clear" onClick={() => { setSearch(""); setActiveCategory("all"); }}>Show all collections</button></div>}
          <footer className="ch-footer"><div className="ch-footer-note"><ShieldCheck size={13} /><span>Discord verification is required for leaderboard placement and first-finisher claims.</span></div><span role="status" aria-live="polite">Showing {visibleSets.length} of {sets.length} collections</span></footer>
        </section>
      </main>
    </div>
  );
};
export default Community;
