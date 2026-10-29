import { ENGLISH_MERCHANDISE_SET_ID, merchandiseSets, getMerchandiseSet, getMerchandiseOwnedCount } from "@/lib/english-merchandise-catalog";
import { useState, useEffect, useMemo, useDeferredValue, type CSSProperties } from "react";
import { ArrowUpRight, ChevronRight, Search, X, Heart } from "lucide-react";
import { isoCards, getISOCharacters, getWishlistIdentity, isoActionKey, type ISOCard } from "@/pages/ISO/catalog-adapter";
import { englishChecklistCards } from "@/lib/english-card-catalog";
import { useWishlist } from "@/pages/ISO/wishlist-in-iso";
import ISOCardImage from "@/pages/ISO/catalog-image";
import { ISOCardCaption } from "@/components/iso/ISOShared";
import { supabase } from "@/lib/supabase";
import { Link, useLocation } from "react-router-dom";
type Collection = {
  id: string;
  title: string;
  setName: string;
  imageUrl: string;
  totalCards: number;
  category: string;
  progress?: number;
  collectedCards?: number;
  released: boolean;
};
const collections: Collection[] = [
  {
    id: "1",
    title: "Moon",
    setName: "One",
    imageUrl: "/thumbnails/moononesetimage.webp",
    totalCards: 186,
    category: "eternal-moon",
    released: true,
  },
  {
    id: "5",
    title: "Rainbow",
    setName: "One",
    imageUrl: "/thumbnails/rainbowonesetimage.webp",
    totalCards: 146,
    category: "rainbow",
    released: true,
  },
  {
    id: "7",
    title: "Fun Moments",
    setName: "One",
    imageUrl: "/thumbnails/funonesetimage.webp",
    totalCards: 127,
    category: "fun-moments",
    released: true,
  },
  {
    id: "2",
    title: "Moon",
    setName: "Two",
    imageUrl: "/thumbnails/moontwosetimage.webp",
    totalCards: 189,
    category: "eternal-moon",
    released: true,
  },
  {
    id: "8",
    title: "Fun Moments",
    setName: "Two",
    imageUrl: "/thumbnails/funtwosetimage.webp",
    totalCards: 136,
    category: "fun-moments",
    released: true,
  },
  {
    id: "tcg",
    title: "Fantasy Wonderland",
    setName: "TCG",
    imageUrl: "/thumbnails/fantasysetimage.webp",
    totalCards: 191,
    category: "tcg",
    released: true,
  },
  {
    id: "friendshipsbegin",
    title: "Friendships Begin",
    setName: "TCG",
    imageUrl: "/thumbnails/friendshipsbeginsetimage.webp",
    totalCards: 194,
    category: "tcg",
    released: true,
  },
  {
    id: "3",
    title: "Moon",
    setName: "Three",
    imageUrl: "/thumbnails/moonthreesetimage.webp",
    totalCards: 290,
    category: "eternal-moon",
    released: true,
  },
  {
    id: "11",
    title: "Fun Moments",
    setName: "Three",
    imageUrl: "/thumbnails/funthreesetimage.webp",
    totalCards: 148,
    category: "fun-moments",
    released: true,
  },
  {
    id: "4",
    title: "Star",
    setName: "One",
    imageUrl: "/thumbnails/staronesetimage.webp",
    totalCards: 105,
    category: "star",
    released: true,
  },
  {
    id: "6",
    title: "Rainbow",
    setName: "Two",
    imageUrl: "/thumbnails/rainbowtwosetimage.webp",
    totalCards: 170,
    category: "rainbow",
    released: true,
  },
  {
    id: "12",
    title: "Discord",
    setName: "TCG",
    imageUrl: "/thumbnails/discordsetimage.webp",
    totalCards: 191,
    category: "tcg",
    released: true,
  },
  {
    id: "14",
    title: "Nightmare Night",
    setName: "TCG",
    imageUrl: "/thumbnails/nightmarenightsetimage.webp",
    totalCards: 190,
    category: "tcg",
    released: true,
  },
  {
    id: "13",
    title: "Moon",
    setName: "Four",
    imageUrl: "/thumbnails/moonfoursetimage.webp",
    totalCards: 162,
    category: "eternal-moon",
    released: true,
  },
{
    id: "hearthswarming-eve",
    title: "HearthsWarming Eve",
    setName: "TCG",
    imageUrl: "/thumbnails/hearthswarmingsetimage.png",
    totalCards: 197,
    category: "tcg",
    released: true,
  },
  {
    id: "9",
    title: "Promos",
    setName: "Promotional Cards",
    imageUrl: "/thumbnails/promossetimage.webp",
    totalCards: 42,
    category: "promos",
    released: true,
  },
  ...merchandiseSets.map(set => ({ id: set.id, title: set.title, setName: "", imageUrl: set.thumbnail, totalCards: set.items.length, category: "merch", released: true })),
];
const unreleasedSetIds: string[] = [];
const databaseSetId: Record<string, string> = {
  tcg: "FW",
  friendshipsbegin: "SD",
};
const checklistPaths: Record<string, string> = { "1":"/moon-one", "2":"/moon-two", "3":"/moon-three", "4":"/star-one", "5":"/rainbow-one", "6":"/rainbow-two", "7":"/fun-moments-one", "8":"/fun-moments-two", "11":"/fun-moments-three", "12":"/discord", "13":"/moon-four", "14":"/nightmare-night", tcg:"/fantasy-wonderland", friendshipsbegin:"/friendships-begin", "hearthswarming-eve":"/hearthswarming-eve", "9":"/promotional-cards" };
const collectionIdForCard = (card: ISOCard): string => card.merchandiseSetId ?? ({ FW:"tcg",SD:"friendshipsbegin",tcgpromos:"9",TCG_PROMOS:"9" } as Record<string,string>)[card.setId] ?? card.setId;
const hrefForCollection = (id: string) => getMerchandiseSet(id)?.href ?? checklistPaths[id];
const normalizeSearchCode = (value: string) => value.normalize("NFKC").toUpperCase().replace(/<>|[\u25C6\u2662]/g,"◇").replace(/<(ZR|AR|CR|N)/g,"◇$1").replace(/#/g,"※").replace(/[\u2010-\u2015\u2212]/g,"-").replace(/\s+/g,"");
const compactCode = (value: string) => normalizeSearchCode(value).replace(/[^A-Z0-9◇※]/g,"");
const codeMatches = (card: ISOCard, query: string) => {
 const search = normalizeSearchCode(query);if (!compactCode(search)) return true;
 const unpad = (text: string) => text.replace(/-(\d+)$/,(_,number:string)=>`-${Number(number)}`);
 return [card.code,card.checklistCode,card.key].some(raw=>{const value=normalizeSearchCode(raw);return value.includes(search)||compactCode(value).includes(compactCode(search))||unpad(value)===unpad(search);});
};
const normalizeCharacter = (value:string) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const collectionSearchCards: ISOCard[] = [...englishChecklistCards, ...isoCards.filter(card=>card.family === "merch")];
const searchableCards = collectionSearchCards.filter(card => !!hrefForCollection(collectionIdForCard(card))).map(card => ({card,characters:getISOCharacters(card).map(normalizeCharacter)}));
const categoryOptions = [{label:"All",value:"all"},{label:"Star",value:"star"},{label:"Moon",value:"eternal-moon"},{label:"Rainbow",value:"rainbow"},{label:"Fun Moments",value:"fun-moments"},{label:"TCG",value:"tcg"},{label:"Promos",value:"promos"},{label:"Other",value:"merch"},{label:"Not collecting",value:"not-collecting"}];
const Collections = () => {
const location = useLocation();
const {wishlist,toggleWishlist,loading:wishlistLoading,error:wishlistError,pendingCards,retry:retryWishlist}=useWishlist();
const [codeSearch,setCodeSearch] = useState("");
const [characterSearch,setCharacterSearch] = useState("");
const [resultLimit,setResultLimit] = useState(96);
const deferredCode = useDeferredValue(codeSearch);
const deferredCharacter = useDeferredValue(characterSearch);
const searchingCode = !!compactCode(deferredCode);
const searchingCharacter = !!normalizeCharacter(deferredCharacter);
const searching = searchingCode || searchingCharacter;
const matches = useMemo(() => {
 if (!searching) return [];
 const words=normalizeCharacter(deferredCharacter).split(" ").filter(Boolean);
 return searchableCards.filter(({card,characters}) => codeMatches(card,deferredCode) && (!words.length || characters.some(name=>words.every(word=>name.includes(word))))).map(item=>item.card);
},[searching,deferredCode,deferredCharacter]);
const matchedCodes = useMemo(()=>{const result=new Map<string,string[]>();for(const card of matches){const id=collectionIdForCard(card);const codes=result.get(id)??[];if(!codes.includes(card.code))codes.push(card.code);result.set(id,codes);}return result;},[matches]);
useEffect(()=>setResultLimit(96),[deferredCode,deferredCharacter]);
const [activeCategory, setActiveCategory] = useState(
    location.state?.category || "all",
  );
const [merchandiseCollected, setMerchandiseCollected] = useState<number | null>(null);
const [sets, setSets] = useState<Collection[]>([]);
const [hiddenSets, setHiddenSets] = useState<string[]>([]);
const [hideMastered, setHideMastered] = useState(true);
const [sortBy, setSortBy] = useState<"release" | "set">("release");
const [isLightMode, setIsLightMode] = useState(
    () => document.documentElement.dataset.theme === "light",
  );
  useEffect(() => {
const syncTheme = () => {
      setIsLightMode(document.documentElement.dataset.theme === "light");
    };
    syncTheme();
const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (location.state?.category) {
      setActiveCategory(location.state.category);
    }
  }, [location.state]);
  useEffect(() => {
let active = true;
let request = 0;
const load = async (userOverride?: any) => {
const ticket = ++request;
let user = userOverride;
      if (!user) {
const { data } = await supabase.auth.getSession();
        user = data.session?.user;
      }
      if (!active || ticket !== request) return;
      if (!user) {
        setMerchandiseCollected(0);
        setHiddenSets([]);
        setSets(
          collections.map((set) => ({
            ...set,
            progress: 0,
            collectedCards: 0,
          })),
        );
        return;
      }
const { data: collectionData, error: collectionError } = await supabase
        .from("collection_progress")
        .select("set_id, progress")
        .eq("user_id", user.id);
      if (collectionError) {
        console.error("Failed to load collection progress:", collectionError);
      }
const { data: merchandiseRows, error: merchandiseError } = await supabase
        .from("collection_progress_raw")
        .select("progress")
        .eq("user_id", user.id)
        .eq("set_id", ENGLISH_MERCHANDISE_SET_ID);
      if (merchandiseError) console.error("Failed to load merchandise progress:", merchandiseError);
const progressRows = new Map<string, any>(
        (collectionData || []).map((row: any) => [String(row.set_id), row]),
      );
const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("iso_hidden_sets")
        .eq("id", user.id)
        .single();
      if (!active || ticket !== request) return;
      if (profileError) {
        console.error("Failed to load hidden collection sets:", profileError);
      }
const storedHiddenSets: string[] = Array.isArray(profile?.iso_hidden_sets)
        ? profile.iso_hidden_sets
        : [];
const mappedHiddenSets = storedHiddenSets.flatMap((id: string) => {
        switch (id) {
          case "FW":
            return ["tcg"];
          case "SD":
          case "SD_STARTERS":
          case "SD_BONUS":
            return ["friendshipsbegin"];
          case "TCG_PROMOS":
          case "tcgpromos":
            return ["tcgpromos"];
          default:
            return [id];
        }
      });
const uniqueHiddenSets = [...new Set(mappedHiddenSets)];
      setHiddenSets(uniqueHiddenSets);
const merchandiseProgress: Record<string, unknown> = Object.assign({}, ...(merchandiseRows || []).map(row => row.progress && typeof row.progress === "object" && !Array.isArray(row.progress) ? row.progress : {}));
      setMerchandiseCollected(merchandiseError ? null : getMerchandiseOwnedCount(merchandiseProgress, undefined, uniqueHiddenSets));
const countProgress = (row: any, setId: string): number => {
        if (!row?.progress) {
          return 0;
        }
        if (setId === "3") {
const validKeys = new Set<string>();
const rarities: Record<string, number> = {
            R: 60,
            SR: 40,
            SSR: 40,
            HR: 60,
            LSR: 32,
            UR: 18,
            SGR: 16,
            ZR: 14,
            SC: 7,
            SZR: 3,
          };
          Object.entries(rarities).forEach(([rarity, count]) => {
            for (let i = 1; i <= count; i++) {
              validKeys.add(`${rarity}-${i}`);
            }
          });
          return Object.entries(row.progress).filter(
            ([key, value]) => Boolean(value) && validKeys.has(key),
          ).length;
        }
        return Object.values(row.progress).filter(Boolean).length;
      };
const progressMap: Record<string, number> = {};
      collections.forEach((set) => {
const dbId = databaseSetId[set.id] || set.id;
const row = progressRows.get(dbId);
        progressMap[set.id] = set.category === "merch" ? getMerchandiseOwnedCount(merchandiseProgress, set.id) : countProgress(row, String(dbId));
      });
      progressMap["tcgpromos"] = countProgress(
        progressRows.get("tcgpromos"),
        "tcgpromos",
      );
const updated = collections.map((set) => {
let collected = progressMap[set.id] || 0;
let totalCards = set.totalCards;
        if (set.id === "9") {
const ccgPromosHidden = uniqueHiddenSets.includes("9");
const tcgPromosHidden = uniqueHiddenSets.includes("tcgpromos");
const ccgCollected = progressMap["9"] || 0;
const tcgCollected = progressMap["tcgpromos"] || 0;
const visibleCCGCollected = ccgPromosHidden
            ? 0
            : Math.min(ccgCollected, 14);
const visibleTCGCollected = tcgPromosHidden
            ? 0
            : Math.min(tcgCollected, 28);
const visibleCCGTotal = ccgPromosHidden ? 0 : 14;
const visibleTCGTotal = tcgPromosHidden ? 0 : 28;
          collected = visibleCCGCollected + visibleTCGCollected;
          totalCards = visibleCCGTotal + visibleTCGTotal;
        }
const progress =
          totalCards > 0
            ? Math.min(100, Math.floor((collected / totalCards) * 100))
            : 0;
        return {
          ...set,
          collectedCards: collected,
          totalCards,
          progress,
        };
      });
      setSets(updated);
    };
    load();
const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      load(session?.user);
    });
    return () => {
      active = false;
      ++request;
      subscription.unsubscribe();
    };
  }, []);
const setOrder: Record<string, number> = {
    star: 1,
    "eternal-moon": 2,
    rainbow: 3,
    "fun-moments": 4,
    tcg: 5,
    promos: 6,
    merch: 7,
  };
const promoNodeFullyHidden =
    hiddenSets.includes("9") && hiddenSets.includes("tcgpromos");
const isHiddenCollection = (set:Collection) => set.id === "9" ? promoNodeFullyHidden : hiddenSets.includes(set.id) || (set.category === "merch" && hiddenSets.includes(ENGLISH_MERCHANDISE_SET_ID));
const filtered = sets.filter(set => set.released || unreleasedSetIds.includes(set.id)).filter(set => {
 if (searching) return matchedCodes.has(set.id);
 if (activeCategory === "not-collecting") return isHiddenCollection(set);
 return !isHiddenCollection(set) && (activeCategory === "all" || set.category === activeCategory) && (!hideMastered || set.progress !== 100);
}).sort((a,b)=>{if(sortBy === "set"){const diff=(setOrder[a.category]??999)-(setOrder[b.category]??999);if(diff)return diff;}return collections.findIndex(set=>set.id===a.id)-collections.findIndex(set=>set.id===b.id);});
const ccgSets = sets.filter(
    (set) =>
      set.released &&
      set.category !== "merch" &&
      set.id !== ENGLISH_MERCHANDISE_SET_ID &&
      set.id !== "9" &&
      set.id !== "tcgpromos" &&
      !hiddenSets.includes(set.id),
  );
const totalSets = ccgSets.length;
const completedSets = ccgSets.filter((set) => set.progress === 100).length;
const ccgCardsCollected = ccgSets.reduce(
    (sum, set) => sum + (set.collectedCards || 0),
    0,
  );
const ccgCardsAvailable = ccgSets.reduce(
    (sum, set) => sum + (set.totalCards || 0),
    0,
  );
const promoSet = sets.find((set) => set.id === "9");
const promoCardsCollected = promoSet?.collectedCards || 0;
const promoCardsAvailable = promoSet?.totalCards || 0;
const totalCardsCollected = ccgCardsCollected + promoCardsCollected;
const totalCardsAvailable = ccgCardsAvailable + promoCardsAvailable;
const completionRate =
    totalCardsAvailable > 0
      ? Math.round((totalCardsCollected / totalCardsAvailable) * 100)
      : 0;
  return (
    <div
      className={`collections-workspace min-h-screen pb-24 font-['Oxanium'] transition-colors duration-200 sm:pb-10 ${
        isLightMode ? "bg-[#f5f5f3] text-zinc-900" : "bg-[#0d0f10] text-white"
      }`}
    >
      <main className="w-full max-w-none px-4 py-5 sm:px-6 sm:py-8">
        <section className="collections-summary" aria-label="Collection progress">
          <div className="cn-summary-top"><div className="collections-summary-title"><h1>English Collections</h1><span>{totalSets} sets in your collection</span></div><button className="cn-mastered-compact md:hidden" type="button" aria-pressed={!hideMastered} onClick={()=>setHideMastered(value=>!value)}>{hideMastered ? "Show mastered" : "Hide mastered"}</button></div>
          <div className="collections-summary-stats">
            <div><strong>{completedSets}<small> / {totalSets}</small></strong><span>Sets mastered</span></div>
            <div><strong>{totalCardsCollected.toLocaleString()}<small> / {totalCardsAvailable.toLocaleString()}</small></strong><span>Cards collected</span></div>
            <div><strong>{merchandiseCollected === null ? "--" : merchandiseCollected.toLocaleString()}</strong><span>Merchandise collected</span></div>
            <div><strong>{completionRate}<small>%</small></strong><span>Complete</span></div>
          </div>
          <div className="collections-summary-track" role="progressbar" aria-label="Overall collection completion" aria-valuenow={Math.min(100, Math.max(0, completionRate))} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${Math.min(100, Math.max(0, completionRate))}%` }} /></div>
        </section>
        <nav aria-label="English collection pages" className="mt-4 grid grid-cols-2 gap-x-5 gap-y-1 border-b border-border pb-3 sm:grid-cols-3 xl:grid-cols-5">{[{href:"/iso",label:"English ISO & Wishlist"},{href:"/trading-post",label:"English Trading Post"},{href:"/inventory",label:"English Inventory"},{href:"/binders",label:"English Binders"},{href:"/leaderboard",label:"English Leaderboard"}].map(item=><Link key={item.href} to={item.href} className="group flex min-h-11 min-w-0 items-center justify-between gap-2 py-2 text-xs font-semibold text-foreground transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary sm:text-sm"><span>{item.label}</span><ArrowUpRight size={14} aria-hidden="true" className="shrink-0 text-muted-foreground group-hover:text-primary"/></Link>)}</nav>
        <div className="cn-category-scroll mt-4 flex gap-2 md:hidden" role="group" aria-label="English set categories">{categoryOptions.map(item=><button key={item.value} type="button" aria-pressed={activeCategory===item.value} onClick={()=>setActiveCategory(item.value)} className={`collections-mobile-category rounded-full border px-3 py-2 text-sm font-semibold transition-colors ${isLightMode ? "border-black/10 bg-white text-zinc-600" : "border-white/10 bg-[#151718] text-zinc-300"}`}>{item.label}</button>)}</div>
        <div className="mt-4 flex gap-6">
          <aside className="catalog-filter hidden md:block"><nav aria-label="English set categories"><h2>Browse sets</h2><div className="catalog-filter-categories">{categoryOptions.map(item=><button key={item.value} type="button" aria-pressed={activeCategory===item.value} onClick={()=>setActiveCategory(item.value)}><span>{item.label}</span><ChevronRight size={14} aria-hidden="true"/></button>)}</div><div className="catalog-filter-options"><h3>Sort sets</h3><div className="catalog-filter-sort"><span aria-hidden="true" style={{transform:sortBy==="set"?"translateX(100%)":"none"}}/>{(["release","set"] as const).map(value=><button key={value} type="button" aria-pressed={sortBy===value} onClick={()=>setSortBy(value)}>{value==="release"?"Release":"Set"}</button>)}</div><button className="catalog-filter-toggle" type="button" aria-pressed={hideMastered} onClick={()=>setHideMastered(value=>!value)}><span>Hide mastered</span><span className="catalog-filter-switch" aria-hidden="true"><span/></span></button></div></nav></aside>
          <div className="min-w-0 flex-1">
            <div className="en-card-search" role="search" aria-label="Search English checklists">
              <label><Search size={15} aria-hidden="true"/><span className="sr-only">Find a card code across all English sets</span><input type="search" value={codeSearch} onChange={event=>setCodeSearch(event.target.value)} onKeyDown={event=>{if(event.key==="Escape")setCodeSearch("");}} placeholder="Find a card code..." maxLength={120} autoCapitalize="characters" autoComplete="off" spellCheck={false}/>{codeSearch && <button type="button" onClick={()=>setCodeSearch("")} aria-label="Clear card code search"><X size={15}/></button>}</label>
              <label><Search size={15} aria-hidden="true"/><span className="sr-only">Find cards featuring a character across all English sets</span><input type="search" value={characterSearch} onChange={event=>setCharacterSearch(event.target.value)} onKeyDown={event=>{if(event.key==="Escape")setCharacterSearch("");}} placeholder="Find a character..." maxLength={120} autoComplete="off" spellCheck={false}/>{characterSearch && <button type="button" onClick={()=>setCharacterSearch("")} aria-label="Clear character search"><X size={15}/></button>}</label>
            </div>
            <div className="collections-results en-search-results" aria-live="polite"><h2>{searchingCharacter ? `Cards featuring ${deferredCharacter.trim()}` : searchingCode ? "Cards matching this code" : categoryOptions.find(item=>item.value===activeCategory)?.label??"Collections"}</h2><span>{searching ? `${matches.length} ${matches.length===1?"card":"cards"} · ${filtered.length} ${filtered.length===1?"set":"sets"}` : `${filtered.length} ${filtered.length===1?"set":"sets"}`}</span></div>
            {searching && <p className="mb-3 text-xs leading-5 text-muted-foreground">Searching every English set, including completed sets and sets you do not collect.</p>}
            {!searching && <div className="collections-mobile-options md:hidden"><label>Sort <select aria-label="Sort collections" value={sortBy} onChange={event=>setSortBy(event.target.value as "release"|"set")}><option value="release">Release</option><option value="set">Set</option></select></label></div>}
            {wishlistError && <p role="alert" className="mb-3 text-sm text-red-600 dark:text-red-400">{wishlistError}<button type="button" onClick={()=>void retryWishlist()} className="ml-2 min-h-10 underline">Retry wishlist</button></p>}
            {searching ? <>
              {matches.length ? <div className="grid grid-cols-2 items-start gap-x-3 gap-y-4 min-[420px]:grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">{matches.slice(0,resultLimit).map(card=>{
                const key=isoActionKey(card);const identity=getWishlistIdentity(card.setId,key);const saved=wishlist.has(identity);const pending=pendingCards.has(identity);
                return <article key={card.identity} className={`min-w-0 ${card.wide ? "col-span-2" : ""}`}><Link to={hrefForCollection(collectionIdForCard(card))!} aria-label={`Open ${card.code} in ${card.setName}`} className="group relative block w-full rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"><div className={`relative w-full overflow-hidden rounded-lg ${card.square?"aspect-square":card.wide?"aspect-[10/7]":"aspect-[5/7]"}`}><ISOCardImage card={card}/></div>{saved&&<span className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-pink-600 text-white shadow-sm"><Heart size={14} fill="currentColor" aria-label="Already on your wishlist"/></span>}</Link><ISOCardCaption code={card.code} setName={card.setName}/><div className="mt-1 flex flex-wrap items-center justify-between gap-x-1"><Link to={hrefForCollection(collectionIdForCard(card))!} className="inline-flex min-h-11 items-center gap-1 text-[10px] font-semibold text-muted-foreground hover:text-primary" aria-label={`Open set: ${card.setName} for ${card.code}`}>Open set<ArrowUpRight size={11}/></Link><button type="button" aria-label={`${saved?"Remove":"Add"} ${card.code} ${saved?"from":"to"} wishlist`} aria-pressed={saved} disabled={wishlistLoading||pending} onClick={()=>{void toggleWishlist(card.setId,key).catch(()=>{});}} className={`inline-flex min-h-11 items-center gap-1 text-[10px] font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50 ${saved?"text-pink-500":"text-muted-foreground hover:text-pink-500"}`}><Heart size={13} fill={saved?"currentColor":"none"}/>{pending?"Saving…":saved?"Wishlisted":"Wishlist"}</button></div></article>;
              })}</div> : <p role="status" className="py-10 text-center text-sm text-muted-foreground">{searchingCode&&searchingCharacter ? "No cards match both searches. Try a different code or character name." : searchingCharacter ? "No cards found for that character. Try part of their name." : "No cards found for that code. Try a shorter code or check the spelling."}</p>}
              {resultLimit<matches.length && <button type="button" onClick={()=>setResultLimit(value=>value+96)} className="mt-5 min-h-11 w-full rounded-lg border border-border px-3 text-sm">Show more cards ({matches.length-resultLimit} remaining)</button>}
            </> : filtered.length ? <div className="en-set-bars">{filtered.map((col,index)=>{
              const collected=col.collectedCards??0;const percent=col.progress??0;const codes=matchedCodes.get(col.id)??[];const href=hrefForCollection(col.id);
              return <Link key={col.id} to={href??"/collections"} aria-label={`Open ${col.title} ${col.setName}`} className="collection-tile collection-grid-item" data-code-match={searchingCode?"true":undefined} style={{"--entry-delay":`${Math.min(index,8)*25}ms`} as CSSProperties}>
                {col.imageUrl && <div className="en-set-thumbnail" aria-hidden="true"><img src={col.imageUrl} alt="" loading="lazy" decoding="async" draggable={false} onError={event=>event.currentTarget.parentElement?.setAttribute("hidden","")}/></div>}
                <div className="collection-tile-body"><div className="collection-tile-title"><h2>{col.title} {col.setName}</h2></div>{isHiddenCollection(col)&&<p className="mt-1 text-[10px] text-muted-foreground">Not collecting</p>}{searchingCode&&<div className="cn-code-match-detail"><p>{codes.slice(0,2).join(" / ")}{codes.length>2?` +${codes.length-2} more`:""}</p></div>}
                  <div className="collection-tile-progress"><div className="collection-tile-count"><span><strong>{collected.toLocaleString()}</strong><span> / {col.totalCards.toLocaleString()}</span></span><strong className="collection-tile-percent">{percent}%</strong></div><div className="collection-tile-track" role="progressbar" aria-label={`${col.title} ${col.setName} collected`} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><span style={{width:`${percent}%`}}/></div><div className="collection-tile-detail"><span>{collected>=col.totalCards&&col.totalCards>0?"Set complete":`${Math.max(0,col.totalCards-collected).toLocaleString()} remaining`}</span><span className="collection-tile-checklist">View checklist<ArrowUpRight size={11} aria-hidden="true"/></span></div></div>
                </div>
              </Link>;
            })}</div> : <p role="status" className="py-10 text-center text-sm text-muted-foreground">{searchingCode ? "No sets contain that card code. Try a shorter code or check the spelling." : activeCategory==="not-collecting" ? "Sets you choose to hide from your needed cards will appear here." : "No sets to show with the current filters."}</p>}
          </div>
        </div>
      </main>
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
.en-set-bars{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr));gap:12px}.collection-tile{display:flex;align-items:stretch;min-width:0;min-height:112px;height:100%;overflow:hidden;border:1px solid #ffffff13;border-radius:16px;background:#191b1e;color:#f4f4f5;text-decoration:none;transition:border-color .2s,box-shadow .2s;--tile-muted:#92969e;--tile-accent:hsl(var(--primary))}
html[data-theme="light"] .collection-tile{background:#fff;color:#202226;border-color:#00000015;--tile-muted:#70747c}
.collection-tile-art{position:relative;aspect-ratio:4/3;overflow:hidden;background:#00000009}
.collection-tile-image{display:block;width:100%;height:100%;object-fit:cover;object-position:center;transition:transform .35s ease}
.en-set-thumbnail{position:relative;flex:0 0 104px;align-self:stretch;overflow:hidden}.en-set-thumbnail[hidden]{display:none}.en-set-thumbnail img{position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:cover;object-position:center}.collection-tile-body{flex:1;min-width:0;align-self:center;padding:12px}
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
@media(max-width:480px){.en-set-thumbnail{flex-basis:96px}.collection-tile-body{padding:10px}.collection-tile-title h2{font-size:13px}.collection-tile-count>span>strong{font-size:17px}.collection-tile-detail{font-size:8px}}
@media(prefers-reduced-motion:reduce){.collection-tile,.collection-tile *{transition:none!important}}
.cn-code-search{display:flex;align-items:center;flex-wrap:wrap;gap:6px 10px;margin-bottom:12px;min-width:0;color:hsl(var(--foreground))}.cn-code-search>label{display:flex;align-items:center;gap:8px;width:min(100%,320px);min-width:0;border-bottom:1px solid #80808040;color:var(--collections-muted)}.cn-code-search input{width:100%;min-width:0;min-height:40px;padding:6px 0;border:0;outline:none;background:transparent;color:inherit;font:inherit;font-size:16px}.cn-code-search input::placeholder{font-size:13px}.cn-code-search input::-webkit-search-cancel-button{-webkit-appearance:none}.cn-code-search label:focus-within{border-color:hsl(var(--primary));color:hsl(var(--primary))}.cn-code-search>button{display:flex;align-items:center;justify-content:center;min-height:40px;width:34px;border:0;background:transparent;color:var(--collections-muted);border-radius:6px}.cn-code-search>button:focus-visible{outline:2px solid hsl(var(--primary));outline-offset:2px}.cn-code-search>span{font-size:11px;color:var(--collections-muted)}.collection-tile[data-code-match="true"]{border-color:hsl(var(--primary));box-shadow:0 0 0 1px hsl(var(--primary)/.35),0 0 22px hsl(var(--primary)/.2)}.cn-code-match-detail{margin-top:7px;font-size:10px;line-height:1.5;color:hsl(var(--primary));overflow-wrap:anywhere}.cn-code-match-detail p{margin:0}.cn-code-match-detail>span{display:block;margin-top:3px;color:var(--tile-muted);font-size:9px}
.en-card-search{display:flex;flex-wrap:wrap;gap:10px 20px;margin-bottom:16px;min-width:0}.en-card-search>label{display:flex;flex:1 1 210px;align-items:center;gap:8px;max-width:360px;min-width:0;border-bottom:1px solid #80808040;color:var(--collections-muted)}.en-card-search>label:focus-within{border-color:var(--collections-accent);color:var(--collections-accent)}.en-card-search input{flex:1;min-width:0;width:100%;min-height:44px;border:0;outline:none;background:transparent;color:hsl(var(--foreground));font:inherit;font-size:16px}.en-card-search input::placeholder{font-size:13px;color:var(--collections-muted)}.en-card-search input::-webkit-search-cancel-button{-webkit-appearance:none}.en-card-search button{display:flex;align-items:center;justify-content:center;flex-shrink:0;width:36px;min-height:44px;color:var(--collections-muted)}.en-card-search button:focus-visible{outline:2px solid var(--collections-accent);outline-offset:2px}.en-search-results{display:flex!important;flex-wrap:wrap}.en-search-results h2{overflow-wrap:anywhere}.collections-summary-stats{flex-wrap:wrap}
@media(max-width:767px){.collections-summary-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 18px}.en-card-search>label{max-width:none;flex-basis:100%}.en-search-results{gap:6px}.en-search-results h2{font-size:13px}}
`}</style>
    </div>
  );
};
export default Collections;
