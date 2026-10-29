import { chineseSets, chineseCards, chineseRarityLabel, getChineseCardLabel, isWideChineseCard } from "../Chinese ISO/catalog/catalog";
import { useEffect, useMemo, useDeferredValue, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { RefreshCw, ArrowUpRight, ChevronRight, Search, X, Heart } from "lucide-react";
import { getChineseCardCharacters, matchesChineseCharacter, normalizeChineseCharacterName } from "../Chinese Codes + Char/Chinese-Characters";
import ChineseISOImage from "../Chinese ISO/components/card-image";
import { useChineseISO } from "../Chinese ISO/data/use-chinese-iso";
import { ISOCardCaption } from "@/components/iso/ISOShared";
import { supabase } from "@/lib/supabase";
type ChineseCollection = {
  id: string;
  title: string;
  edition: string;
  category: string;
  href: string;
  cardKeys: string[];
  rarities: string;
  catalogComplete: boolean;
  imageUrl?: string;
};
const collections: ChineseCollection[] = chineseSets.map(set => ({
  id: set.id,
  title: set.name,
  edition: "",
  category: set.family === "moon" ? "eternal-moon" : set.family === "fun" ? "fun-moments" : set.family,
  href: set.href,
  imageUrl: set.imageUrl,
  cardKeys: set.cards.map(card => card.key),
  rarities: Array.from(new Set(set.cards.map(card => chineseRarityLabel(card.rarity)))).join(" / "),
  catalogComplete: true,
}));
const normalizeCardCode = (value: string) => value.normalize("NFKC").toUpperCase().replace(/<>|[\u25C6\u2662]/g, "\u25C7").replace(/[\u2010-\u2015\u2212]/g, "-").replace(/\s+/g, "");
const compactCardCode = (value: string) => value.replace(/[^A-Z0-9\u25C7]/g, "");
const cardCodeMatches = (code: string, query: string) => {
const value = normalizeCardCode(code);
const search = normalizeCardCode(query);
    if (!compactCardCode(search)) return false;
const unpadded = (text: string) => text.replace(/-(\d+)$/, (_, number: string) => `-${Number(number)}`);
    return value.includes(search) || compactCardCode(value).includes(compactCardCode(search)) || unpadded(value) === unpadded(search);
};
const isOwned = (value: unknown): boolean => value === true || Boolean(value && typeof value === "object" && "owned" in value && value.owned === true);
export default function CollectionsChinese() {
const wishlistController=useChineseISO();
const savedCards=useMemo(()=>new Set(wishlistController.data.wishlist.map(row=>`${row.set_id}:${row.card_key}`)),[wishlistController.data.wishlist]);
const [savingWishlist,setSavingWishlist]=useState("");
const [wishlistMessage,setWishlistMessage]=useState("");
const [characterSearch,setCharacterSearch]=useState("");
const [resultLimit,setResultLimit]=useState(96);
const deferredCharacter=useDeferredValue(characterSearch);
const [notCollecting, setNotCollecting] = useState<string[]>([]);
const [counts, setCounts] = useState<Record<string, number>>({});
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [retry, setRetry] = useState(0);
const [codeSearch, setCodeSearch] = useState("");
const deferredCode=useDeferredValue(codeSearch);
const [category, setCategory] = useState("eternal-moon");
const [hideMastered, setHideMastered] = useState(true);
const [isLightMode, setIsLightMode] = useState(() => document.documentElement.dataset.theme === "light");
  useEffect(() => {
const syncTheme = () => setIsLightMode(document.documentElement.dataset.theme === "light");
const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    syncTheme();
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
let active = true;
let request = 0;
let userId: string | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
const load = async () => {
const ticket = ++request;
      setLoading(true);
      setError("");
      try {
const { data, error: authError } = await supabase.auth.getUser();
        if (!active || ticket !== request) return;
        if (authError || !data.user) throw new Error("Log in to view your Chinese collection progress.");
        userId = data.user.id;
const [progressResult, profileResult] = await Promise.all([
          supabase.from("collection_progress_raw").select("set_id, progress").eq("user_id", userId).in("set_id", collections.map(set => set.id)),
          supabase.from("profiles").select("chinese_iso_hidden_sets").eq("id", userId).maybeSingle(),
        ]);
const { data: rows, error: progressError } = progressResult;
      if (!active || ticket !== request) return;
        if (progressError) throw progressError;
      if (profileResult.error) throw profileResult.error;
      setNotCollecting(Array.isArray(profileResult.data?.chinese_iso_hidden_sets) ? profileResult.data.chinese_iso_hidden_sets : []);
const next: Record<string, number> = {};
        collections.forEach(set => {
const row = rows?.find(item => item.set_id === set.id);
const progress = row?.progress && typeof row.progress === "object" && !Array.isArray(row.progress) ? row.progress : {};
          next[set.id] = set.cardKeys.filter(key => isOwned(progress[key])).length;
        });
        setCounts(next);
      } catch (cause) {
        if (active && ticket === request) {
          setCounts({});
        setNotCollecting([]);
          setError(cause instanceof Error ? cause.message : "Your collection could not be loaded. Please try again.");
        }
      } finally {
        if (active && ticket === request) setLoading(false);
      }
    };
const scheduleLoad = () => {
      clearTimeout(timer);
      timer = setTimeout(() => { if (active) void load(); }, 0);
    };
const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "INITIAL_SESSION" && (session?.user.id ?? null) !== userId) {
        ++request;
        setCounts({});
        setNotCollecting([]);
        scheduleLoad();
      }
    });
const onSaved = (event: Event) => {
const detail = (event as CustomEvent<{ setId: string }>).detail;
      if (collections.some(set => set.id === detail?.setId)) scheduleLoad();
    };
    void load();
      window.addEventListener("collection-progress-saved", onSaved);
    window.addEventListener("chinese-iso-changed", scheduleLoad);
    return () => {
      active = false;
      ++request;
      clearTimeout(timer);
      subscription.unsubscribe();
        window.removeEventListener("collection-progress-saved", onSaved);
    window.removeEventListener("chinese-iso-changed", scheduleLoad);
    };
  }, [retry]);
const notCollectingIds = new Set(notCollecting);
const collectingSets = collections.filter(set => !notCollectingIds.has(set.id));
const total = collectingSets.reduce((sum, set) => sum + set.cardKeys.length, 0);
const owned = collectingSets.reduce((sum, set) => sum + (counts[set.id] ?? 0), 0);
const percent = total ? Math.round(owned / total * 100) : 0;
const searchingCode=compactCardCode(normalizeCardCode(deferredCode)).length>0;
const searchingCharacter=!!normalizeChineseCharacterName(deferredCharacter);
const searching=searchingCode||searchingCharacter;
const matchedCards=useMemo(()=>searching?chineseCards.filter(card=>(!searchingCode||cardCodeMatches(card.code,deferredCode))&&matchesChineseCharacter(card,deferredCharacter)):[],[searching,searchingCode,deferredCode,deferredCharacter]);
const matchedSetIds=useMemo(()=>new Set(matchedCards.map(card=>card.setId)),[matchedCards]);
const setLinks=useMemo(()=>new Map(chineseSets.map(set=>[set.id,set.href])),[]);
const mappedCardCount=useMemo(()=>chineseCards.filter(card=>getChineseCardCharacters(card).length>0).length,[]);
useEffect(()=>setResultLimit(96),[deferredCode,deferredCharacter]);
const visibleSets=searching?collections.filter(set=>matchedSetIds.has(set.id)):collections.filter(set=>category==="not-collecting"?notCollectingIds.has(set.id):!notCollectingIds.has(set.id)&&set.category===category&&(!hideMastered||!set.catalogComplete||(counts[set.id]??0)<set.cardKeys.length));
const toggleWishlist=async(card:typeof chineseCards[number])=>{
 if(wishlistController.busy||savingWishlist)return;
 setSavingWishlist(card.identity);setWishlistMessage("");
 try{await wishlistController.wishlist(card,!savedCards.has(card.identity));}
 catch(cause){setWishlistMessage(cause instanceof Error?cause.message:"Your wishlist could not be updated. Please retry.");}
 finally{setSavingWishlist("");}
};
const unknown = loading || Boolean(error);
const totalSets = collectingSets.length;
const completedSets = collectingSets.filter(set => set.catalogComplete && set.cardKeys.length > 0 && (counts[set.id] ?? 0) >= set.cardKeys.length).length;
const totalCardsCollected = owned;
const totalCardsAvailable = total;
const completionRate = percent;
const activeCategory = category;
const setActiveCategory = setCategory;
const categoryOptions = [{ label: "Moon", value: "eternal-moon" }, { label: "Fun Moments", value: "fun-moments" }, { label: "Rainbow", value: "rainbow" }, { label: "Star", value: "star" }, { label: "Gift Sets", value: "other" }, { label: "Other", value: "misc" }, { label: "Promos", value: "promos" }, { label: "Not Collecting", value: "not-collecting" }];
  return (
    <div className={`collections-workspace min-h-screen pb-24 font-['Oxanium'] transition-colors duration-200 sm:pb-10 ${isLightMode ? "bg-[#f5f5f3] text-zinc-900" : "bg-[#0d0f10] text-white"}`}>
      <main className="w-full max-w-none px-4 py-5 sm:px-6 sm:py-8">
        <section className="collections-summary" aria-label="Chinese collection progress">
          <div className="cn-summary-top"><div className="collections-summary-title"><h1>Chinese Collections</h1><span>{totalSets} sets in your collection</span></div><button className="cn-mastered-compact md:hidden" type="button" aria-pressed={!hideMastered} onClick={() => setHideMastered(value => !value)}>{hideMastered ? "Show mastered" : "Hide mastered"}</button></div>
          <div className="collections-summary-stats">
            <div><strong>{unknown ? "--" : completedSets}<small> / {totalSets}</small></strong><span>Sets mastered</span></div>
            <div><strong>{unknown ? "--" : totalCardsCollected.toLocaleString()}<small> / {totalCardsAvailable.toLocaleString()}</small></strong><span>Cards collected</span></div>
            <div><strong>{unknown ? "--" : completionRate}<small>%</small></strong><span>Catalog collected</span></div>
          </div>
          <div className="collections-summary-track" role="progressbar" aria-label="Overall Chinese collection completion" aria-valuenow={unknown ? undefined : completionRate} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${unknown ? 0 : completionRate}%` }} /></div>
        </section>
        <aside aria-label="Chinese catalog update notice" className="mt-4 border-l-2 border-primary/50 pl-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">
        <p className="font-semibold text-foreground">Catalog updates in progress</p>
        <p className="mt-1">Some Chinese sets, especially older editions, are still being revised as more information becomes available. Card lists and details may change.</p>
        <p className="mt-1">Some sets now support 3D viewing, while others are still waiting. Every individual card back needs to be found and uploaded before 3D viewing can be added to a set.</p>
      </aside>
      <nav aria-label="Chinese collection pages" className="mt-4 grid grid-cols-2 gap-x-5 gap-y-1 border-b border-border pb-3 sm:grid-cols-3 xl:grid-cols-5">
        {[{ href: "/iso-chinese", label: "Chinese ISO & Wishlist" }, { href: "/trading-post-chinese", label: "Chinese Trading Post" }, { href: "/inventory-chinese", label: "Chinese Inventory" }, { href: "/binders-chinese", label: "Chinese Binders" }, { href: "/leaderboard-chinese", label: "Chinese Leaderboard" }].map(item => <Link key={item.href} to={item.href} className="group flex min-h-11 min-w-0 items-center justify-between gap-2 py-2 text-xs font-semibold text-foreground transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary sm:text-sm"><span>{item.label}</span><ArrowUpRight size={14} aria-hidden="true" className="shrink-0 text-muted-foreground transition-colors group-hover:text-primary" /></Link>)}
      </nav>
        <div className="cn-category-scroll mt-4 flex gap-2 md:hidden" role="group" aria-label="Chinese set categories">
          {categoryOptions.map(item => <button key={item.value} type="button" aria-pressed={activeCategory === item.value} onClick={() => setActiveCategory(item.value)} className={`collections-mobile-category rounded-full border px-3 py-2 text-sm font-semibold transition-colors ${isLightMode ? "border-black/10 bg-white text-zinc-600" : "border-white/10 bg-[#151718] text-zinc-300"}`}>{item.label}</button>)}
        </div>
        <div className="mt-4 flex gap-6">
          <aside className="catalog-filter hidden md:block">
            <nav aria-label="Chinese set categories">
              <h2>Browse sets</h2>
              <div className="catalog-filter-categories">{categoryOptions.map(item => <button key={item.value} type="button" aria-pressed={activeCategory === item.value} onClick={() => setActiveCategory(item.value)}><span>{item.label}</span><ChevronRight size={14} aria-hidden="true" /></button>)}</div>
              <div className="catalog-filter-options"><button className="catalog-filter-toggle" type="button" onClick={() => setHideMastered(value => !value)} aria-pressed={hideMastered}><span>Hide mastered</span><span className="catalog-filter-switch" aria-hidden="true"><span /></span></button></div>
            </nav>
          </aside>
          <div className="min-w-0 flex-1">
            <div className="cn-character-search" role="search" aria-label="Search Chinese checklists">
              <label><Search size={15} aria-hidden="true"/><span className="sr-only">Find a card code across all Chinese sets</span><input type="search" value={codeSearch} onChange={event=>setCodeSearch(event.target.value)} onKeyDown={event=>{if(event.key==="Escape")setCodeSearch("");}} placeholder="Find a card code..." maxLength={120} autoCapitalize="characters" autoComplete="off" spellCheck={false}/>{codeSearch&&<button type="button" onClick={()=>setCodeSearch("")} aria-label="Clear card code search"><X size={15}/></button>}</label>
              <label><Search size={15} aria-hidden="true"/><span className="sr-only">Find cards featuring a character across all Chinese sets</span><input type="search" value={characterSearch} onChange={event=>setCharacterSearch(event.target.value)} onKeyDown={event=>{if(event.key==="Escape")setCharacterSearch("");}} placeholder="Find a character..." maxLength={120} autoComplete="off" spellCheck={false}/>{characterSearch&&<button type="button" onClick={()=>setCharacterSearch("")} aria-label="Clear character search"><X size={15}/></button>}</label>
            </div>
            <div className="collections-results cn-search-results" aria-live="polite"><h2>{searchingCharacter?`Cards featuring ${deferredCharacter.trim()}`:searchingCode?"Cards matching this code":categoryOptions.find(item=>item.value===activeCategory)?.label||"Collections"}</h2><span>{searching?`${matchedCards.length} ${matchedCards.length===1?"card":"cards"} · ${matchedSetIds.size} ${matchedSetIds.size===1?"set":"sets"}`:`${visibleSets.length} ${visibleSets.length===1?"set":"sets"}`}</span></div>
            {searching&&<p className="mb-3 text-xs leading-5 text-muted-foreground">Searching every Chinese set, including completed sets and sets you do not collect.</p>}
            {searchingCharacter&&mappedCardCount<chineseCards.length&&<p className="mb-3 text-xs leading-5 text-muted-foreground">Character names are still being added. Cards without names will not appear in character searches yet.</p>}
            {(wishlistMessage||wishlistController.error)&&<p role="alert" className="mb-3 text-sm text-red-600 dark:text-red-400">{wishlistMessage||wishlistController.error}<button type="button" onClick={()=>{setWishlistMessage("");void wishlistController.refresh();}} className="ml-2 min-h-10 underline">Retry wishlist</button></p>}
            {searching&&!wishlistController.loading&&!wishlistController.data.settings.chinese_cards_enabled&&<p className="mb-3 text-xs leading-5 text-muted-foreground"><Link to="/iso-chinese" className="underline underline-offset-2">Activate your Chinese wishlist</Link> to save cards from these results.</p>}
            {error && <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-500/30 p-4 text-sm"><span>{error}</span><button type="button" onClick={() => setRetry(value => value + 1)} className="inline-flex min-h-10 items-center gap-2 rounded-full border px-4"><RefreshCw size={14} /> Retry</button></div>}
            {loading && <p role="status" className="mb-4 text-sm text-zinc-500">Loading your collection progress...</p>}
            {searching?<>
              {matchedCards.length?<div className="grid grid-cols-2 items-start gap-x-3 gap-y-4 min-[420px]:grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">{matchedCards.slice(0,resultLimit).map(card=>{
                const saved=savedCards.has(card.identity);const pending=savingWishlist===card.identity;const href=setLinks.get(card.setId)!;
                return <article key={card.identity} className={`min-w-0 ${isWideChineseCard(card)?"col-span-2":""}`}><Link to={href} aria-label={`Open ${getChineseCardLabel(card)} in ${card.setName}`} className="relative block w-full rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"><ChineseISOImage card={card}/>{saved&&<span className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-pink-600 text-white shadow-sm"><Heart size={14} fill="currentColor" aria-label="Already on your wishlist"/></span>}</Link><ISOCardCaption code={getChineseCardLabel(card)} setName={card.setName}/><div className="mt-1 flex flex-wrap items-center justify-between gap-x-1"><Link to={href} aria-label={`Open set: ${card.setName} for ${getChineseCardLabel(card)}`} className="inline-flex min-h-11 items-center gap-1 text-[10px] font-semibold text-muted-foreground hover:text-primary">Open set<ArrowUpRight size={11}/></Link><button type="button" aria-label={`${saved?"Remove":"Add"} ${getChineseCardLabel(card)} ${saved?"from":"to"} wishlist`} aria-pressed={saved} disabled={wishlistController.loading||wishlistController.busy||!wishlistController.userId||!wishlistController.data.settings.chinese_cards_enabled} onClick={()=>{void toggleWishlist(card);}} className={`inline-flex min-h-11 items-center gap-1 text-[10px] font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50 ${saved?"text-pink-500":"text-muted-foreground hover:text-pink-500"}`}><Heart size={13} fill={saved?"currentColor":"none"}/>{pending?"Saving…":saved?"Wishlisted":"Wishlist"}</button></div></article>;
              })}</div>:<p role="status" className="py-10 text-center text-sm text-muted-foreground">{searchingCode&&searchingCharacter?"No cards match both searches. Try another code or character name.":searchingCharacter?"No labelled cards match that character yet. Try part of their name or search by card code.":"No cards match that code. Try a shorter code or check the spelling."}</p>}
              {resultLimit<matchedCards.length&&<button type="button" onClick={()=>setResultLimit(value=>value+96)} className="mt-5 min-h-11 w-full rounded-lg border border-border px-3 text-sm">Show more cards ({matchedCards.length-resultLimit} remaining)</button>}
            </>:visibleSets.length === 0 ? <div className={`rounded-2xl border border-dashed p-10 text-center text-sm ${isLightMode ? "border-black/10 bg-zinc-50 text-zinc-500" : "border-white/10 bg-white/[0.03] text-zinc-400"}`}>{searchingCode ? "No Chinese sets contain that card code. Try a shorter code or check the spelling." : category === "not-collecting" ? "Sets marked as not collecting will appear here." : "No sets to show with the current filters."}</div> : <div className="cn-set-bars">
              {visibleSets.map((set, index) => {
const collected = counts[set.id] ?? 0;
const setPercent = set.cardKeys.length ? Math.min(100, Math.floor(collected / set.cardKeys.length * 100)) : 0;
                return <Link key={set.id} to={set.href} aria-label={`Open Chinese ${set.title} ${set.edition}`} className="collection-tile collection-grid-item" style={{ "--entry-delay": `${Math.min(index, 8) * 25}ms` } as CSSProperties}>
                  {set.imageUrl && <div className="cn-set-thumbnail" aria-hidden="true"><img src={set.imageUrl} alt="" loading="lazy" decoding="async" draggable={false} onError={event => { event.currentTarget.parentElement?.setAttribute("hidden", ""); }} /></div>}
                  <div className="collection-tile-body">
                    <div className="collection-tile-title"><h2>{set.title} {set.edition}</h2></div>
                    <div className="collection-tile-progress">
                      <div className="collection-tile-count"><span><strong>{unknown ? "--" : collected.toLocaleString()}</strong><span> / {set.cardKeys.length.toLocaleString()}</span></span><strong className="collection-tile-percent">{unknown ? "--" : `${setPercent}%`}</strong></div>
                      <div className="collection-tile-track" role="progressbar" aria-label={`${set.title} ${set.edition} collected`} aria-valuenow={unknown ? undefined : setPercent} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${unknown ? 0 : setPercent}%` }} /></div>
                      <div className="collection-tile-detail"><span>{unknown ? "-- remaining" : set.catalogComplete && collected >= set.cardKeys.length && set.cardKeys.length > 0 ? "Set complete" : `${Math.max(0, set.cardKeys.length - collected).toLocaleString()} remaining`}</span><span className="collection-tile-checklist">View checklist<ArrowUpRight size={11} aria-hidden="true" /></span></div>
                    </div>
                  </div>
                </Link>;
              })}
            </div>}
          </div>
        </div>
        <section className="cn-collection-faq" aria-labelledby="cn-collection-faq-title">
          <h2 id="cn-collection-faq-title">Chinese Collections FAQ</h2>
          <div className="cn-collection-faq-items">
            <details><summary>Why are the images in the sets so low quality?<span aria-hidden="true">+</span></summary><div><p>Older Kayou CN sets were not documented well and are nearly impossible to find. All of my images inside each set and representing each set generously came from HeiManTou's Dropbox with his last five years of tracking, data, and research.</p></div></details>
            <details><summary>Well, now I know what cards are in each set. How do I find them?<span aria-hidden="true">+</span></summary><div><p>Do not use AliExpress. It is <strong>only</strong> resealed or fake product and nothing else. You will get nothing authentic unless it's a trick box, sent to you so that you tell everyone you found a trusted source on AliExpress. Kayou has <strong>no official presence</strong> in that cesspool.</p><p>I only get my Chinese products and singles from Amber and Hao, my beloved Chinese friends, who live in Shenzhen and run <a href="https://www.pakracards.com/" target="_blank" rel="noopener noreferrer">PakraCards</a>. They are an extremely reputable and highly trusted source... they also don't condone scammer pricing. Some cards are naturally higher because of their limited quantities or availability, but 99% of the singles on their website don't even break the 5-10 USD limit.</p></div></details>
            <details><summary>Why do some cards have the My Little Pony logo and others don't?<span aria-hidden="true">+</span></summary><div><p>Some of it is just a matter of whether or not that card was documented. Kayou CN MLP did not pick up popularity until it was a few sets in, therefore nobody was running any kind of documentation or databases.</p></div></details>
            <details><summary>Why did you add CN MLP to MLPEKAYOU?<span aria-hidden="true">+</span></summary><div><p>High demand. This will drastically increase website costs, but I did it in the hopes that you would be able to safely branch out.</p></div></details>
            <details><summary>How can we help offset website costs?<span aria-hidden="true">+</span></summary><div><p>Buy through <strong>StonesTradingCo</strong>!</p></div></details>
          </div>
        </section>
      </main>
      <style>{`
.cn-character-search{display:flex;flex-wrap:wrap;gap:10px 20px;margin-bottom:16px;min-width:0}.cn-character-search>label{display:flex;flex:1 1 210px;align-items:center;gap:8px;max-width:360px;min-width:0;border-bottom:1px solid #80808040;color:var(--collections-muted)}.cn-character-search>label:focus-within{border-color:var(--collections-accent);color:var(--collections-accent)}.cn-character-search input{flex:1;min-width:0;width:100%;min-height:44px;border:0;outline:none;background:transparent;color:hsl(var(--foreground));font:inherit;font-size:16px}.cn-character-search input::placeholder{font-size:13px;color:var(--collections-muted)}.cn-character-search input::-webkit-search-cancel-button{-webkit-appearance:none}.cn-character-search button{display:flex;align-items:center;justify-content:center;flex-shrink:0;width:36px;min-height:44px;color:var(--collections-muted)}.cn-character-search button:focus-visible{outline:2px solid var(--collections-accent);outline-offset:2px}.cn-search-results{display:flex!important;flex-wrap:wrap}.cn-search-results h2{overflow-wrap:anywhere}
@media(max-width:767px){.cn-character-search>label{max-width:none;flex-basis:100%}.cn-search-results{gap:6px}.cn-search-results h2{font-size:13px}}
`}</style>
      <style>{`
.cn-collection-faq{margin-top:32px;border-top:1px solid #80808025;padding-top:22px}
.cn-collection-faq h2{margin:0 0 12px;font-size:15px;font-weight:650;letter-spacing:-.02em}
.cn-collection-faq-items{border:1px solid #80808025;border-radius:12px;overflow:hidden}
.cn-collection-faq details+details{border-top:1px solid #80808025}
.cn-collection-faq summary{display:flex;align-items:center;justify-content:space-between;gap:18px;min-height:50px;padding:14px 16px;list-style:none;cursor:pointer;font-size:12px;font-weight:600;line-height:1.6;transition:background .18s}
.cn-collection-faq summary::-webkit-details-marker{display:none}
.cn-collection-faq summary::marker{content:""}
.cn-collection-faq summary>span{flex-shrink:0;font-size:20px;font-weight:400;color:var(--collections-accent);transition:transform .2s}
.cn-collection-faq details[open] summary>span{transform:rotate(45deg)}
.cn-collection-faq details[open] summary{background:#80808008}
.cn-collection-faq details>div{padding:0 16px 16px;font-size:12px;line-height:1.9;color:var(--collections-muted);overflow-wrap:anywhere}
.cn-collection-faq p{margin:0;max-width:92ch}
.cn-collection-faq p+p{margin-top:12px}
.cn-collection-faq strong{color:inherit;font-weight:700}
.cn-collection-faq a{color:var(--collections-accent);text-decoration:underline;text-underline-offset:3px}
.cn-collection-faq summary:focus-visible,.cn-collection-faq a:focus-visible{outline:2px solid var(--collections-accent);outline-offset:-3px;border-radius:4px}
@media(hover:hover){.cn-collection-faq summary:hover{background:#8080800e}}
@media(max-width:767px){.cn-collection-faq{margin-top:24px}.cn-collection-faq summary{padding:13px 12px;gap:12px}.cn-collection-faq details>div{padding:0 12px 14px}}
@media(prefers-reduced-motion:reduce){.cn-collection-faq summary,.cn-collection-faq summary>span{transition:none}}
      `}</style>
      <style>{`
.cn-summary-top{display:contents}
.cn-category-scroll{flex-wrap:nowrap;overflow-x:auto;overscroll-behavior-x:contain;scrollbar-width:none;padding:2px 0 6px;-webkit-overflow-scrolling:touch}
.cn-category-scroll::-webkit-scrollbar{display:none}
.cn-category-scroll>button{flex-shrink:0;white-space:nowrap}
.cn-mastered-compact{flex-shrink:0;min-height:44px;padding:6px 0 6px 10px;background:transparent;border:0;color:var(--collections-accent);font-size:10px;font-weight:600;white-space:nowrap}
.cn-mastered-compact:focus-visible{outline:2px solid var(--collections-accent);outline-offset:2px;border-radius:5px}
@media(max-width:767px){.cn-summary-top{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;width:100%}.cn-summary-top .collections-summary-title{min-width:0}.cn-summary-top .collections-summary-title h1{font-size:clamp(17px,4.7vw,21px)}}
.collections-workspace{--collections-accent:hsl(var(--primary));--collections-muted:#92969e}
html[data-theme="light"] .collections-workspace{--collections-muted:#6b7078}
.collections-summary{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:24px;padding:0 0 24px;margin-bottom:26px;border-bottom:1px solid #80808025}
.collections-summary-title h1{margin:0 0 6px;font-size:24px;line-height:1.2;letter-spacing:-.035em;font-weight:650}
.collections-summary-title>span{font-size:11px;color:var(--collections-muted)}
.collections-summary-stats{display:flex;align-items:center;gap:32px}
.collections-summary-stats>div{display:flex;flex-direction:column;gap:5px}
.collections-summary-stats strong{font-size:24px;line-height:1.2;font-weight:650;font-variant-numeric:tabular-nums;letter-spacing:-.04em}
.collections-summary-stats small{font-size:12px;font-weight:400;letter-spacing:0;color:var(--collections-muted)}
.collections-summary-stats>div>span{font-size:10px;color:var(--collections-muted)}
.collections-summary-stats>div:last-child strong{color:var(--collections-accent)}
.collections-summary-track{flex-basis:100%;height:4px;border-radius:4px;background:#80808020;overflow:hidden}
.collections-summary-track>span{display:block;height:100%;background:var(--collections-accent);border-radius:inherit;transition:width .7s ease}
.collections-results{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:0 0 17px}
.collections-results h2{margin:0;font-size:14px;font-weight:600}
.collections-results>span{font-size:11px;color:var(--collections-muted)}
.collections-mobile-category[aria-pressed="true"]{background:var(--collections-accent)!important;border-color:var(--collections-accent)!important;color:hsl(var(--primary-foreground))!important}
.collection-grid-item{animation:collection-enter .3s ease backwards;animation-delay:var(--entry-delay)}
.collections-mobile-options{align-items:center;justify-content:space-between;margin-bottom:16px;color:var(--collections-muted);font-size:11px}
.collections-mobile-options button{min-height:36px;padding:6px 10px;border:1px solid #80808030;border-radius:7px}
.collections-mobile-options label{display:flex;align-items:center;gap:8px}
.collections-mobile-options select{font-size:16px;background:hsl(var(--background));border:1px solid #80808030;border-radius:7px;padding:6px;color:inherit}
@media(max-width:767px){.collections-results{display:none}.collections-summary{gap:18px;margin-bottom:16px;padding-bottom:18px}.collections-summary-title h1{font-size:21px}.collections-summary-stats{width:100%;justify-content:space-between;gap:12px}.collections-summary-stats strong{font-size:22px}.collections-summary-stats small{font-size:10px}.collections-summary-stats>div>span{font-size:9px}.collections-mobile-options{display:flex}}
@keyframes collection-enter{from{opacity:0}to{opacity:1}}
@media(prefers-reduced-motion:reduce){.collection-grid-item{animation:none}.collections-summary-track>span{transition:none}}
      `}</style>
      <style>{`
.catalog-filter{width:194px;flex-shrink:0;color:#c5c7cb;--filter-accent:hsl(var(--primary))}
html[data-theme="light"] .catalog-filter{color:#4d5158}
.catalog-filter h2{margin:0 0 15px;padding:0 12px;font-size:13px;font-weight:650;color:inherit}
.catalog-filter-categories{display:grid;gap:3px}
.catalog-filter-categories>button{position:relative;display:flex;align-items:center;justify-content:space-between;width:100%;min-height:41px;padding:10px 12px;border:0;border-radius:8px;background:transparent;color:inherit;text-align:left;font-size:12px;transition:background .18s,color .18s}
.catalog-filter-categories>button:before{content:"";position:absolute;left:0;top:12px;bottom:12px;width:2px;border-radius:2px;background:var(--filter-accent);transform:scaleY(0);transition:transform .2s}
.catalog-filter-categories>button svg{opacity:0;transform:translateX(-4px);transition:opacity .2s,transform .2s}
.catalog-filter-categories>button:hover{background:#8080800c}
.catalog-filter-categories>button[aria-pressed="true"]{background:#80808014;color:var(--filter-accent)}
.catalog-filter-categories>button[aria-pressed="true"]:before{transform:scaleY(1)}
.catalog-filter-categories>button[aria-pressed="true"] svg{opacity:1;transform:translateX(0)}
.catalog-filter-options{margin-top:22px;padding:19px 12px 0;border-top:1px solid #80808025}
.catalog-filter h3{margin:0 0 10px;font-size:10px;font-weight:500;color:inherit;opacity:.75}
.catalog-filter-sort{position:relative;display:grid;grid-template-columns:1fr 1fr;padding:3px;border-radius:9px;background:#80808015}
.catalog-filter-sort>span{position:absolute;top:3px;bottom:3px;left:3px;width:calc(50% - 3px);border:1px solid #80808028;border-radius:6px;background:#8080801a;transition:transform .22s ease}
.catalog-filter-sort button{position:relative;min-height:31px;font-size:11px;color:inherit}
.catalog-filter-sort button[aria-pressed="true"]{color:var(--filter-accent)}
.catalog-filter-toggle{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;min-height:46px;margin-top:12px;font-size:11px;text-align:left}
.catalog-filter-switch{width:30px;height:18px;padding:3px;border-radius:20px;background:#80808050;transition:background .2s}
.catalog-filter-switch>span{display:block;width:12px;height:12px;border-radius:50%;background:white;transition:transform .2s}
.catalog-filter-toggle[aria-pressed="true"] .catalog-filter-switch{background:var(--filter-accent)}
.catalog-filter-toggle[aria-pressed="true"] .catalog-filter-switch>span{transform:translateX(12px);background:hsl(var(--primary-foreground))}
.catalog-filter button:focus-visible{outline:2px solid var(--filter-accent);outline-offset:2px}
@media(prefers-reduced-motion:reduce){.catalog-filter *,.catalog-filter *:before{transition:none!important}}
    `}</style>
      <style>{`
.cn-set-bars{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr));gap:12px}.collection-tile{display:flex;align-items:stretch;min-width:0;min-height:112px;height:100%;overflow:hidden;border:1px solid #ffffff13;border-radius:16px;background:#191b1e;color:#f4f4f5;text-decoration:none;transition:border-color .2s,box-shadow .2s;--tile-muted:#92969e;--tile-accent:hsl(var(--primary))}
html[data-theme="light"] .collection-tile{background:#fff;color:#202226;border-color:#00000015;--tile-muted:#70747c}
.collection-tile-art{position:relative;aspect-ratio:4/3;overflow:hidden;background:#00000009}
.collection-tile-image{display:block;width:100%;height:100%;object-fit:cover;object-position:center;transition:transform .35s ease}
.cn-set-thumbnail{position:relative;flex:0 0 104px;align-self:stretch;overflow:hidden}.cn-set-thumbnail[hidden]{display:none}.cn-set-thumbnail img{position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:cover;object-position:center}.collection-tile-body{flex:1;min-width:0;align-self:center;padding:12px}
.collection-tile-title{min-height:0;display:flex;flex-direction:column;align-items:flex-start;gap:3px}
.collection-tile-title h2{margin:0;font-size:13px;line-height:1.3;font-weight:650;letter-spacing:-.025em}
.collection-tile-progress{margin-top:8px;padding-top:8px;border-top:1px solid #80808026}
.collection-tile-count{display:flex;align-items:baseline;justify-content:space-between;gap:5px;font-variant-numeric:tabular-nums}
.collection-tile-count>span>strong{font-size:17px;font-weight:650;letter-spacing:-.04em}
.collection-tile-count>span>span{font-size:11px;color:var(--tile-muted)}
.collection-tile-percent{font-size:12px;color:var(--tile-accent)}
.collection-tile-track{height:5px;overflow:hidden;border-radius:5px;background:#80808025;margin:6px 0 6px}
.collection-tile-track>span{display:block;height:100%;border-radius:inherit;background:var(--tile-accent);transition:width .65s cubic-bezier(.2,.7,.2,1)}
.collection-tile-detail{display:flex;align-items:center;justify-content:space-between;gap:4px;font-size:9px;line-height:1.5;color:var(--tile-muted)}
.collection-tile-checklist{display:inline-flex;align-items:center;gap:3px;white-space:nowrap}
.collection-tile-detail>svg{color:var(--tile-accent)}
.collection-tile:focus-visible{outline:2px solid var(--tile-accent);outline-offset:3px}
@media(hover:hover){.collection-tile:hover{border-color:var(--tile-accent);box-shadow:0 8px 25px #0002}.collection-tile:hover .collection-tile-image{transform:scale(1.035)}.collection-tile:hover .collection-tile-detail>span:last-child{color:var(--tile-accent)}}
@media(max-width:480px){.cn-set-thumbnail{flex-basis:96px}.collection-tile-body{padding:10px}.collection-tile-title h2{font-size:13px}.collection-tile-count>span>strong{font-size:17px}.collection-tile-detail{font-size:8px}}
@media(prefers-reduced-motion:reduce){.collection-tile,.collection-tile *{transition:none!important}}
.cn-code-search{display:flex;align-items:center;flex-wrap:wrap;gap:6px 10px;margin-bottom:12px;min-width:0;color:hsl(var(--foreground))}.cn-code-search>label{display:flex;align-items:center;gap:8px;width:min(100%,320px);min-width:0;border-bottom:1px solid #80808040;color:var(--collections-muted)}.cn-code-search input{width:100%;min-width:0;min-height:40px;padding:6px 0;border:0;outline:none;background:transparent;color:inherit;font:inherit;font-size:16px}.cn-code-search input::placeholder{font-size:13px}.cn-code-search input::-webkit-search-cancel-button{-webkit-appearance:none}.cn-code-search label:focus-within{border-color:hsl(var(--primary));color:hsl(var(--primary))}.cn-code-search>button{display:flex;align-items:center;justify-content:center;min-height:40px;width:34px;border:0;background:transparent;color:var(--collections-muted);border-radius:6px}.cn-code-search>button:focus-visible{outline:2px solid hsl(var(--primary));outline-offset:2px}.cn-code-search>span{font-size:11px;color:var(--collections-muted)}.collection-tile[data-code-match="true"]{border-color:hsl(var(--primary));box-shadow:0 0 0 1px hsl(var(--primary)/.35),0 0 22px hsl(var(--primary)/.2)}.cn-code-match-detail{margin-top:7px;font-size:10px;line-height:1.5;color:hsl(var(--primary));overflow-wrap:anywhere}.cn-code-match-detail p{margin:0}.cn-code-match-detail>span{display:block;margin-top:3px;color:var(--tile-muted);font-size:9px}
      `}</style>
    </div>
  );
}
