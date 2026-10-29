import { Link } from "react-router-dom";
import { useState, type ReactNode } from "react";
export type InventoryListingView = "all" | "listed" | "sale" | "trade";
export type InventoryListingState = { is_for_trade?: boolean; is_for_sale?: boolean; trade_quantity?: number; sale_quantity?: number };
export const inventoryListingMatches = (listing: InventoryListingState | undefined, view: InventoryListingView = "listed") => {
  if (view === "all") return true;
  const trade = !!listing?.is_for_trade && Number(listing.trade_quantity) > 0;
  const sale = !!listing?.is_for_sale && Number(listing.sale_quantity) > 0;
  return view === "trade" ? trade : view === "sale" ? sale : trade || sale;
};
export function InventoryListingFilters({ value, onChange }: { value: InventoryListingView; onChange: (value: InventoryListingView) => void }) {
  return <div className="my-4 flex min-w-0 flex-wrap gap-2" role="group" aria-label="Show inventory"><style>{`.inv-listing-filter{min-height:44px;padding:8px 12px;border:1px solid hsl(var(--border));border-radius:8px;color:hsl(var(--foreground));background:hsl(var(--background));font-size:12px;font-weight:600}.inv-listing-filter[aria-pressed=true]{background:hsl(var(--primary));color:hsl(var(--primary-foreground));border-color:hsl(var(--primary))}.inv-listing-filter:focus-visible{outline:2px solid hsl(var(--primary));outline-offset:3px}`}</style>{([{ id: "all", label: "All inventory" }, { id: "listed", label: "For sale or trade" }, { id: "sale", label: "For sale" }, { id: "trade", label: "For trade" }] as const).map(option => <button key={option.id} type="button" className="inv-listing-filter" aria-pressed={value === option.id} onClick={() => onChange(option.id)}>{option.label}</button>)}</div>;
}
export function InventoryListingBadges({ listing }: { listing?: InventoryListingState }) {
  return <span className="pointer-events-none absolute left-1 right-1 top-1 z-10 flex flex-wrap gap-1">{inventoryListingMatches(listing, "trade") && <span style={{ background: "#065f46", color: "#fff", border: "1px solid #a7f3d0", boxShadow: "0 1px 4px #0008" }} className="rounded px-1.5 py-1 text-[9px] font-bold leading-tight sm:text-[10px]">For trade · {listing?.trade_quantity}</span>}{inventoryListingMatches(listing, "sale") && <span style={{ background: "#1e40af", color: "#fff", border: "1px solid #bfdbfe", boxShadow: "0 1px 4px #0008" }} className="rounded px-1.5 py-1 text-[9px] font-bold leading-tight sm:text-[10px]">For sale · {listing?.sale_quantity}</span>}</span>;
}
export type InventoryOverviewListing = { id: string; code: string; setName: string; href: string; image: ReactNode; listing: InventoryListingState };
export type InventoryOverviewSet = {
    id: string;
    family: string;
    name: string;
    href: string;
    total: number;
    owned: number;
    listed: number;
    hidden: boolean;
    available: boolean;
    preview?: ReactNode;
    merchandise?: boolean;
};
type Props = {
    listingItems?: InventoryOverviewListing[];
    title: string;
    categories: {
        id: string;
        name: string;
    }[];
    category: string;
    onCategoryChange: (id: string) => void;
    sets: InventoryOverviewSet[];
    loading: boolean;
    listingsLoading?: boolean;
    error: string;
    checklistHref: string;
    onRetry: () => void;
};
export default function InventoryOverview({ title, categories, category, onCategoryChange, sets, loading, listingsLoading = false, error, checklistHref, onRetry, listingItems = [] }: Props) {
    const [listingView, setListingView] = useState<InventoryListingView>("all");
    const activeItems = listingItems.filter(item => inventoryListingMatches(item.listing, listingView));
    const availableSets = sets.filter(set => set.available || set.listed > 0);
    const navigation = categories.filter(item => sets.some(set => set.family === item.id && !set.hidden));
    const activeCategory = navigation.some(item => item.id === category) ? category : navigation[0]?.id ?? "";
    const visibleSets = availableSets.filter(set => !set.hidden && set.family === activeCategory);
    const activeSets = sets.filter(set => set.listed > 0);
    const ownedCount = sets.filter(set => !set.merchandise).reduce((total, set) => total + set.owned, 0);
    const merchandiseCount = sets.filter(set => set.merchandise).reduce((total, set) => total + set.owned, 0);
    const listedCount = sets.reduce((total, set) => total + set.listed, 0);
    const label = navigation.find(item => item.id === activeCategory)?.name ?? "Inventory";
    return <main className="min-h-screen bg-background pb-24 text-foreground"><div className="mx-auto max-w-[1500px] px-3 py-4 sm:px-5 lg:px-7">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5"><div><h1 className="text-2xl font-bold sm:text-3xl">{title}</h1><p className="mt-1 text-sm text-muted-foreground">Your collected sets, quantities, trades, and sales.</p></div><div className="flex flex-wrap gap-2"><div className="px-3 py-1 text-center"><strong className="block text-lg">{ownedCount.toLocaleString()}</strong><span className="text-xs text-muted-foreground">Cards owned</span></div><div className="px-3 py-1 text-center"><strong className="block text-lg">{listedCount.toLocaleString()}</strong><span className="text-xs text-muted-foreground">Listed items</span></div>{sets.some(set => set.merchandise) && <div className="px-3 py-1 text-center"><strong className="block text-lg">{merchandiseCount.toLocaleString()}</strong><span className="text-xs text-muted-foreground">Merchandise collected</span></div>}</div></header>
        <InventoryListingFilters value={listingView} onChange={setListingView} />
        {error && <div role="alert" className="mb-4 border-b border-red-500/30 pb-3 text-sm text-red-500">{error}<button type="button" onClick={onRetry} className="ml-3 min-h-11 underline">Retry</button></div>}
        {listingView !== "all" ? <section aria-label="Active sale and trade listings"><p className="mb-3 text-xs text-muted-foreground">All sets · select a card to edit its listing.</p>{loading || listingsLoading ? <p role="status" className="py-10 text-sm text-muted-foreground">Loading listings...</p> : <div className="grid grid-cols-2 gap-3 min-[400px]:grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">{activeItems.map(item => <Link key={item.id} to={item.href} className="min-w-0 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"><span className="relative block overflow-hidden rounded-lg border-2 border-primary/60 bg-muted"><span className="block [&_img]:block [&_img]:h-auto [&_img]:w-full">{item.image}</span><InventoryListingBadges listing={item.listing}/></span><strong className="mt-2 block break-words text-xs">{item.code}</strong><span className="block break-words text-[11px] text-muted-foreground">{item.setName}</span></Link>)}{!activeItems.length && <p className="col-span-full py-10 text-sm text-muted-foreground">No active listings match this filter.</p>}</div>}</section> : loading ? <p role="status" className="py-12 text-center text-sm text-muted-foreground">Loading inventory...</p> : <div className="grid items-start gap-5 xl:grid-cols-[200px_minmax(0,1fr)_220px] xl:gap-6">
            <nav aria-label={`${title} categories`} className="flex min-w-0 gap-1.5 overflow-x-auto border-b border-border pb-4 xl:flex-col xl:border-b-0 xl:border-r xl:pb-0 xl:pr-5">{navigation.map(item => <button key={item.id} type="button" aria-pressed={activeCategory === item.id} onClick={() => onCategoryChange(item.id)} className={`flex min-h-11 shrink-0 items-center rounded-lg border px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${activeCategory === item.id ? "border-primary/50 bg-primary/15 font-semibold text-primary" : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"}`}>{item.name}</button>)}</nav>
            <section className="min-w-0"><div className="mb-2 flex items-center justify-between gap-3 border-b border-border pb-3"><h2 className="text-lg font-semibold">{label}</h2><span className="text-sm text-muted-foreground">{visibleSets.length} {visibleSets.length === 1 ? "set" : "sets"}</span></div><div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">{visibleSets.map(set => {
                const percent = Math.min(100, Math.round(set.owned / Math.max(1, set.total) * 100));
                return <Link key={set.id} to={set.href} className="group min-w-0 border-b border-border py-4 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"><div className="flex min-h-28 items-center gap-4">{set.preview && <span aria-hidden="true" className="pointer-events-none flex w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg sm:w-24">{set.preview}</span>}<div className="min-w-0 flex-1"><h3 className="font-semibold leading-tight">{set.name}</h3><p className="mt-2 text-xs text-muted-foreground">{set.owned.toLocaleString()} of {set.total.toLocaleString()} {set.merchandise ? "items" : "cards"}</p>{set.listed > 0 && <p className="mt-2 text-xs text-muted-foreground">{set.listed} {set.merchandise ? set.listed === 1 ? "item" : "items" : set.listed === 1 ? "card" : "cards"} listed</p>}<span className="mt-3 block text-xs text-muted-foreground">Open set <span aria-hidden="true">&rarr;</span></span></div></div><div className="mt-3 flex items-center gap-3"><div className="h-1 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${percent}%` }}/></div><span className="text-xs tabular-nums text-muted-foreground">{percent}%</span></div></Link>;
            })}{visibleSets.length === 0 && <p className="col-span-full py-12 text-center text-sm text-muted-foreground">No collected sets in this category.</p>}</div></section>
            <aside className="border-t border-border pt-4 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0"><h2 className="text-sm font-semibold">Active trades and sales</h2>{listingsLoading ? <p role="status" className="py-6 text-sm text-muted-foreground">Loading listings...</p> : activeSets.length ? <div className="mt-3 space-y-2">{activeSets.map(set => <Link key={set.id} to={set.href} className="flex min-h-12 items-center justify-between gap-3 border-b border-border py-2 text-sm transition-colors hover:text-primary"><span className="font-medium">{set.name}</span><span className="shrink-0 text-xs tabular-nums text-muted-foreground">{set.listed} listed</span></Link>)}</div> : <p className="py-6 text-sm text-muted-foreground">No active listings.</p>}<Link to={checklistHref} className="mt-4 block border-t border-border pt-4 text-sm text-muted-foreground hover:text-foreground">Open checklists</Link></aside>
        </div>}
    </div></main>;
}
