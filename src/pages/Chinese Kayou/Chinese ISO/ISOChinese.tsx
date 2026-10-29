import { ISOSetSidebar, ISOMobileViewControl } from "@/components/iso/ISOShared";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, SlidersHorizontal, Search, X } from "lucide-react";
import { chineseCards, chineseFamilies, chineseSets, chineseRarityLabel, type ChineseISOCard } from "./catalog/catalog";
import { buildChineseISOState, searchChineseCards, type ChineseISOSection } from "./data/model";
import { useChineseISO } from "./data/use-chinese-iso";
import ChineseCardGrid from "./components/card-grid";
import ChineseCardActions from "./components/card-actions";
import ChineseISOControls from "./components/controls";
export default function ISOChinese() {
  const [mobileColumns, setMobileColumns] = useState(4);
  const controller = useChineseISO();
  const { data, loading, busy, error } = controller;
  const state = useMemo(() => buildChineseISOState(data), [data]);
  const [section, setSection] = useState<ChineseISOSection>("moon");
  const [query, setQuery] = useState("");
  const [controls, setControls] = useState(false);
  const [viewAll, setViewAll] = useState(false);
  const [wishlistMode, setWishlistMode] = useState(false);
  const [selected, setSelected] = useState<ChineseISOCard | null>(null);
  const [limit, setLimit] = useState(96);
  const [setFilter, setSetFilter] = useState("all");
  const [rarity, setRarity] = useState("all");
  const searching = !!query.trim();
  const browsingAll = viewAll || wishlistMode;
  useEffect(() => { setSelected(null); setControls(false); setQuery(""); setViewAll(false); setWishlistMode(false); setSection("moon"); }, [controller.userId]);
  const tabs = useMemo(() => [
    ...(state.missing.length < 100 ? [{ id: "full" as const, name: "Full ISO", count: state.missing.length }] : []),
    { id: "wishlist" as const, name: "Wishlist", count: state.wishlisted.length },
    { id: "progress" as const, name: "In Progress", count: state.inProgress.length },
    ...chineseFamilies.filter(family => family.id === section || browsingAll || searching || state.missing.some(card => card.family === family.id)).map(family => ({ id: family.id, name: family.name, count: state.missing.filter(card => card.family === family.id).length })),
  ], [state, browsingAll, searching, section]);
  const activeSection = tabs.some(tab => tab.id === section) ? section : tabs.find(tab => tab.id !== "wishlist")?.id ?? "wishlist";
  const baseCards = useMemo(() => {
    if (activeSection === "wishlist") return state.wishlisted;
    if (activeSection === "progress") return state.inProgress;
    const pool = browsingAll ? chineseCards : searching ? chineseCards.filter(card => !state.owned.has(card.identity) && !state.statuses.has(card.identity)) : state.missing;
    const wanted = pool.filter(card => !state.hidden.has(`${card.setId}:${card.key}`));
    return searching || activeSection === "full" ? wanted : wanted.filter(card => card.family === activeSection);
  }, [activeSection, state, browsingAll, searching]);
  const searchedCards = useMemo(() => searchChineseCards(baseCards, query), [baseCards, query]);
  const availableSets = useMemo(() => {
    const counts = new Map<string, number>();
    for (const card of searchedCards) counts.set(card.setId, (counts.get(card.setId) ?? 0) + 1);
    return chineseSets.filter(set => counts.has(set.id) || (set.id === setFilter && !state.hidden.has(set.id) && (activeSection === "full" || set.family === activeSection))).map(set => ({ ...set, count: counts.get(set.id) ?? 0 }));
  }, [searchedCards, setFilter, activeSection, state.hidden]);
  const activeSet = availableSets.find(set => set.id === setFilter) ?? availableSets[0];
  const acrossSets = activeSection === "full" || activeSection === "progress" || activeSection === "wishlist" || searching;
  const setCards = useMemo(() => acrossSets && setFilter === "all" ? searchedCards : searchedCards.filter(card => card.setId === activeSet?.id), [searchedCards, activeSet?.id, acrossSets, setFilter]);
  const availableRarities = Array.from(new Set(setCards.map(card => card.rarity)));
  const activeRarity = rarity === "all" || availableRarities.includes(rarity) ? rarity : "all";
  const filteredCards = useMemo(() => setCards.filter(card => activeRarity === "all" || card.rarity === activeRarity), [setCards, activeRarity]);
  const renderedCards = filteredCards.slice(0, limit);
  useEffect(() => { setLimit(96); }, [activeSection, query, activeSet?.id, activeRarity, browsingAll]);
  const chooseSection = (value: ChineseISOSection) => { setSection(value); if (value === "progress" || value === "wishlist") { setViewAll(false); setWishlistMode(false); } setQuery(""); setSetFilter("all"); setRarity("all"); };
  const changeQuery = (value: string) => { setQuery(value); setSetFilter("all"); setRarity("all"); };
  const nav = <nav aria-label="Chinese ISO sections" className="flex gap-1 overflow-x-auto border-b border-border pb-2">{tabs.map(tab => <button key={tab.id} type="button" aria-pressed={activeSection === tab.id} onClick={() => chooseSection(tab.id)} className={`flex min-h-10 shrink-0 items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold transition ${activeSection === tab.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}><span>{tab.name}</span><span className="text-[11px] tabular-nums opacity-70">{tab.count}</span></button>)}</nav>;
  if (loading) return <main className="mx-auto max-w-7xl px-4 py-12 text-center text-sm text-muted-foreground" role="status">Loading Chinese cards...</main>;
  if (!data.settings.chinese_cards_enabled) return <main className="mx-auto max-w-xl px-4 py-10 text-foreground"><Link to="/collections-chinese" className="hidden md:inline-flex min-h-10 items-center gap-2 text-sm text-muted-foreground"><ArrowLeft size={16} />Chinese checklists</Link><section className="mt-5 rounded-3xl border border-border bg-background p-6 sm:p-8"><h1 className="text-2xl font-semibold tracking-tight">Activate Chinese cards on your profile?</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Enable your Chinese ISO, wishlist, and cards in progress, and show Chinese card sections on your public profile.</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Your existing Chinese checklist progress is already saved. You can deactivate these features later without losing it.</p>{error && <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}<button type="button" disabled={busy || !controller.userId} onClick={() => { void controller.settings({ chinese_cards_enabled: true }).catch(() => {}); }} className="mt-6 min-h-12 w-full rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">{busy ? "Activating..." : "Activate Chinese cards"}</button>{error && <button type="button" onClick={() => void controller.refresh()} className="mt-2 min-h-10 w-full text-sm text-muted-foreground">Retry loading</button>}</section></main>;
  return <div className="iso-page min-h-screen bg-background text-foreground" data-iso-columns={mobileColumns}><div className="w-full max-w-none px-3 py-3 sm:px-5 md:px-6"><header className="mb-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-2 md:flex md:flex-wrap md:justify-between md:gap-x-3 md:gap-y-1"><div className="col-span-2 flex min-w-0 flex-wrap items-center gap-x-4"><h1 className="text-xl font-semibold tracking-tight">Chinese ISO</h1><Link to="/collections-chinese" className="hidden md:inline-flex min-h-8 items-center gap-1.5 text-xs text-muted-foreground"><ArrowLeft size={13} />Chinese checklists</Link></div><div className="contents md:flex md:items-center md:gap-2"><ISOMobileViewControl columns={mobileColumns} onChange={setMobileColumns} /><button type="button" onClick={() => setControls(true)} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 text-sm"><SlidersHorizontal size={16} /><span>Controls</span></button></div></header>
    <div className="mb-3">{nav}</div><div className="mb-3 flex flex-wrap items-center gap-2"><label className="relative min-w-0 flex-1 basis-32"><span className="sr-only">Look up a Chinese card code</span><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} /><input type="search" value={query} onChange={event => changeQuery(event.target.value)} placeholder="Find a card code..." className="h-11 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-base outline-none focus:ring-2 focus:ring-primary" /></label><label><span className="sr-only">Filter by rarity</span><select value={activeRarity} onChange={event => setRarity(event.target.value)} className="h-11 max-w-full rounded-xl border border-border bg-background px-2 text-sm"><option value="all">All rarities</option>{availableRarities.map(value => <option key={value} value={value}>{chineseRarityLabel(value)}</option>)}</select></label></div><div className={availableSets.length ? "iso-set-layout" : "min-w-0"}>
    {availableSets.length > 0 && <ISOSetSidebar label="Chinese ISO sets" activeId={acrossSets && setFilter === "all" ? "all" : activeSet?.id} onSelect={id => { setSetFilter(id); setRarity("all"); setLimit(96); setSelected(null); }} items={[...(acrossSets ? [{ id: "all", label: "All sets", name: "All sets", count: searchedCards.length }] : []), ...availableSets.map(set => ({ id: set.id, name: set.name, label: ["moon", "fun", "rainbow", "star"].includes(set.family) ? set.name.replace(/^(?:Moon|Fun Moments|Fun|Rainbow|Star)\s+/i, "") : set.name, imageUrl: set.imageUrl, imagePosition: set.id === "cn-moon-three" ? "center 25%" : undefined, count: set.count }))]} />}
    <main className="iso-set-content min-w-0">
      {(viewAll || wishlistMode) && <div className="mb-4 flex flex-wrap gap-2">{viewAll && <button type="button" onClick={() => setViewAll(false)} className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs">Viewing all cards<X size={12} /></button>}{wishlistMode && <button type="button" onClick={() => setWishlistMode(false)} className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs">Building wishlist<X size={12} /></button>}</div>}
      {error && <div role="alert" className="mb-4 rounded-xl border border-red-500/30 p-3 text-sm text-red-600 dark:text-red-400">{error}<button type="button" className="ml-3 underline" onClick={() => void controller.refresh()}>Retry</button></div>}
      <section className="min-w-0"><div className="mb-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-2 md:flex md:flex-wrap md:justify-between md:gap-x-3 md:gap-y-1"><h2 className="text-lg font-semibold">{acrossSets && setFilter === "all" ? (searching ? "Search results" : tabs.find(tab => tab.id === activeSection)?.name) : activeSet?.name ?? "No cards"}</h2><span className="text-xs tabular-nums text-muted-foreground">{filteredCards.length.toLocaleString()} {filteredCards.length === 1 ? "card" : "cards"}</span></div>
      {filteredCards.length ? <><ChineseCardGrid key={`${activeSection}:${activeSet?.id ?? "empty"}`} cards={renderedCards} wishlist={state.wishlist} statuses={state.statuses} busy={busy} onSelect={setSelected} />{renderedCards.length < filteredCards.length && <button type="button" onClick={() => setLimit(value => value + 96)} className="mt-6 min-h-11 w-full rounded-xl border border-border text-sm">Show more ({filteredCards.length - renderedCards.length} remaining)</button>}</> : <div className="px-3 py-12 text-center"><h3 className="text-base font-semibold">{searching || activeRarity !== "all" ? "No matching cards" : activeSection === "wishlist" ? "Your Chinese wishlist is empty" : activeSection === "progress" ? "Nothing in progress" : "No cards remaining in this ISO"}</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{searching || activeRarity !== "all" ? "Try another code, set, or rarity. Cards you are buying or trading for are under In Progress." : activeSection === "wishlist" ? "Choose Edit wishlist in Controls, then tap a card to add it." : state.inProgress.length ? "Cards you are buying or trading for are in In Progress." : "Use Edit wishlist in Controls to save cards, or choose which sets to show."}</p></div>}
      </section>
    </main></div>
  </div><ChineseISOControls open={controls} onOpenChange={setControls} controller={controller} viewAll={viewAll} onViewAll={setViewAll} wishlistMode={wishlistMode} onWishlistMode={setWishlistMode} /><ChineseCardActions card={selected} onClose={() => setSelected(null)} controller={controller} wishlistOnly={wishlistMode || activeSection === "wishlist"} status={selected ? state.statuses.get(selected.identity) : undefined} wishlisted={!!selected && state.wishlist.has(selected.identity)} owned={!!selected && state.owned.has(selected.identity)} /></div>;
}
