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
    ...(state.inProgress.length ? [{ id: "progress" as const, name: "In Progress", count: state.inProgress.length }] : []),
    ...chineseFamilies.filter(family => browsingAll || searching || state.missing.some(card => card.family === family.id)).map(family => ({ id: family.id, name: family.name, count: state.missing.filter(card => card.family === family.id).length })),
  ], [state, browsingAll, searching]);
  const activeSection = tabs.some(tab => tab.id === section) ? section : tabs.find(tab => tab.id !== "wishlist")?.id ?? "wishlist";
  const baseCards = useMemo(() => {
    if (activeSection === "wishlist") return state.wishlisted;
    if (activeSection === "progress") return state.inProgress;
    const pool = browsingAll ? chineseCards : searching ? chineseCards.filter(card => !state.owned.has(card.identity) && !state.statuses.has(card.identity)) : state.missing;
    return searching || activeSection === "full" ? pool : pool.filter(card => card.family === activeSection);
  }, [activeSection, state, browsingAll, searching]);
  const searchedCards = useMemo(() => searchChineseCards(baseCards, query), [baseCards, query]);
  const availableSets = useMemo(() => {
    const counts = new Map<string, number>();
    for (const card of searchedCards) counts.set(card.setId, (counts.get(card.setId) ?? 0) + 1);
    return chineseSets.filter(set => counts.has(set.id)).map(set => ({ ...set, count: counts.get(set.id)! }));
  }, [searchedCards]);
  const activeSet = availableSets.find(set => set.id === setFilter) ?? availableSets[0];
  const setCards = useMemo(() => searchedCards.filter(card => card.setId === activeSet?.id), [searchedCards, activeSet?.id]);
  const availableRarities = Array.from(new Set(setCards.map(card => card.rarity)));
  const activeRarity = rarity === "all" || availableRarities.includes(rarity) ? rarity : "all";
  const filteredCards = useMemo(() => setCards.filter(card => activeRarity === "all" || card.rarity === activeRarity), [setCards, activeRarity]);
  const renderedCards = filteredCards.slice(0, limit);
  useEffect(() => { setLimit(96); }, [activeSection, query, activeSet?.id, activeRarity, browsingAll]);
  const chooseSection = (value: ChineseISOSection) => { setSection(value); setQuery(""); setSetFilter("all"); setRarity("all"); };
  const changeQuery = (value: string) => { setQuery(value); setSetFilter("all"); setRarity("all"); };
  const nav = <nav aria-label="Chinese ISO sections" className="flex gap-2 overflow-x-auto pb-2 md:flex-col md:overflow-visible">{tabs.map(tab => <button key={tab.id} type="button" aria-pressed={activeSection === tab.id} onClick={() => chooseSection(tab.id)} className={`flex shrink-0 items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${activeSection === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}><span>{tab.name}</span><span className="text-[11px] tabular-nums opacity-70">{tab.count}</span></button>)}</nav>;
  if (loading) return <main className="mx-auto max-w-7xl px-4 py-12 text-center text-sm text-muted-foreground" role="status">Loading Chinese cards...</main>;
  if (!data.settings.chinese_cards_enabled) return <main className="mx-auto max-w-xl px-4 py-10 text-foreground"><Link to="/collections-chinese" className="inline-flex min-h-10 items-center gap-2 text-sm text-muted-foreground"><ArrowLeft size={16} />Chinese checklists</Link><section className="mt-5 rounded-3xl border border-border bg-background p-6 sm:p-8"><h1 className="text-2xl font-semibold tracking-tight">Activate Chinese cards on your profile?</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Enable your Chinese ISO, wishlist, and cards in progress, and show Chinese card sections on your public profile.</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Your existing Chinese checklist progress is already saved. You can deactivate these features later without losing it.</p>{error && <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}<button type="button" disabled={busy || !controller.userId} onClick={() => { void controller.settings({ chinese_cards_enabled: true }).catch(() => {}); }} className="mt-6 min-h-12 w-full rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">{busy ? "Activating..." : "Activate Chinese cards"}</button>{error && <button type="button" onClick={() => void controller.refresh()} className="mt-2 min-h-10 w-full text-sm text-muted-foreground">Retry loading</button>}</section></main>;
  return <div className="min-h-screen bg-background text-foreground"><div className="mx-auto max-w-[1600px] px-3 py-3 sm:px-5 md:px-6"><header className="mb-3 flex items-center justify-between gap-3"><div className="min-w-0"><h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Chinese ISO</h1><Link to="/collections-chinese" className="inline-flex min-h-8 items-center gap-1.5 text-xs text-muted-foreground"><ArrowLeft size={13} />Chinese checklists</Link></div><button type="button" onClick={() => setControls(true)} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 text-sm"><SlidersHorizontal size={16} /><span>Controls</span></button></header>
    <div className="flex gap-6"><aside className="hidden w-48 shrink-0 md:block"><div className="sticky top-4">{nav}</div></aside><main className="min-w-0 flex-1"><div className="mb-3 md:hidden">{nav}</div>
      <div className="mb-3 flex flex-wrap items-center gap-2"><label className="relative min-w-[200px] flex-1"><span className="sr-only">Look up a Chinese card code</span><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} /><input type="search" value={query} onChange={event => changeQuery(event.target.value)} placeholder="Find a card code..." className="h-11 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-base outline-none focus:ring-2 focus:ring-primary" /></label><label><span className="sr-only">Filter by rarity</span><select value={activeRarity} onChange={event => setRarity(event.target.value)} className="h-11 rounded-xl border border-border bg-background px-2 text-base"><option value="all">All rarities</option>{availableRarities.map(value => <option key={value} value={value}>{chineseRarityLabel(value)}</option>)}</select></label></div>
      {(viewAll || wishlistMode) && <div className="mb-4 flex flex-wrap gap-2">{viewAll && <button type="button" onClick={() => setViewAll(false)} className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs">Viewing all cards<X size={12} /></button>}{wishlistMode && <button type="button" onClick={() => setWishlistMode(false)} className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs">Building wishlist<X size={12} /></button>}</div>}
      {error && <div role="alert" className="mb-4 rounded-xl border border-red-500/30 p-3 text-sm text-red-600 dark:text-red-400">{error}<button type="button" className="ml-3 underline" onClick={() => void controller.refresh()}>Retry</button></div>}
      {availableSets.length > 0 && <nav aria-label="Chinese ISO sets" className="mb-3 flex gap-2 overflow-x-auto rounded-2xl border border-border bg-muted/20 p-2">{availableSets.map(set => <button key={set.id} type="button" aria-pressed={activeSet?.id === set.id} onClick={() => { setSetFilter(set.id); setRarity("all"); setLimit(96); setSelected(null); }} className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors motion-reduce:transition-none ${activeSet?.id === set.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}><span>{set.name}</span><span className="text-[11px] tabular-nums opacity-70">{set.count}</span></button>)}</nav>}
      <section className="rounded-2xl border border-border bg-background p-3 sm:p-4"><div className="mb-5 flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">{activeSet?.name ?? (searching ? "Code search" : tabs.find(tab => tab.id === activeSection)?.name)}</h2><span className="text-xs tabular-nums text-muted-foreground">{filteredCards.length.toLocaleString()} {filteredCards.length === 1 ? "card" : "cards"}</span></div>
      {filteredCards.length ? <><ChineseCardGrid key={`${activeSection}:${activeSet?.id ?? "empty"}`} cards={renderedCards} wishlist={state.wishlist} statuses={state.statuses} busy={busy} onSelect={setSelected} />{renderedCards.length < filteredCards.length && <button type="button" onClick={() => setLimit(value => value + 96)} className="mt-6 min-h-11 w-full rounded-xl border border-border text-sm">Show more ({filteredCards.length - renderedCards.length} remaining)</button>}</> : <div className="px-3 py-12 text-center"><h3 className="text-base font-semibold">{searching || activeRarity !== "all" ? "No matching cards" : activeSection === "wishlist" ? "Your Chinese wishlist is empty" : activeSection === "progress" ? "Nothing in progress" : "No cards remaining in this ISO"}</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{searching || activeRarity !== "all" ? "Try another code, set, or rarity. Turn on View all cards to include cards you own and cards already in progress." : activeSection === "wishlist" ? "Use Build wishlist from all cards in Controls, then tap a card to add it." : state.inProgress.length ? "Cards you are buying or trading for are in In Progress." : "Use Controls to browse all cards or restore hidden sets."}</p></div>}
      </section>
    </main></div>
  </div><ChineseISOControls open={controls} onOpenChange={setControls} controller={controller} viewAll={viewAll} onViewAll={setViewAll} wishlistMode={wishlistMode} onWishlistMode={setWishlistMode} /><ChineseCardActions card={selected} onClose={() => setSelected(null)} controller={controller} status={selected ? state.statuses.get(selected.identity) : undefined} wishlisted={!!selected && state.wishlist.has(selected.identity)} owned={!!selected && state.owned.has(selected.identity)} /></div>;
}
