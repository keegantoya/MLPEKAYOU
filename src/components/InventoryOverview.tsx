import { Link } from "react-router-dom";
import type { ReactNode } from "react";
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
};
type Props = {
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
export default function InventoryOverview({ title, categories, category, onCategoryChange, sets, loading, listingsLoading = false, error, checklistHref, onRetry }: Props) {
    const availableSets = sets.filter(set => set.available || set.listed > 0);
    const visibleSets = availableSets.filter(set => !set.hidden && set.family === category);
    const activeSets = sets.filter(set => set.listed > 0);
    const ownedCount = sets.reduce((total, set) => total + set.owned, 0);
    const listedCount = sets.reduce((total, set) => total + set.listed, 0);
    const navigation = categories;
    const label = navigation.find(item => item.id === category)?.name ?? "Inventory";
    return <main className="min-h-screen bg-background pb-24 text-foreground"><div className="mx-auto max-w-[1500px] px-3 py-4 sm:px-5 lg:px-7">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5"><div><h1 className="text-2xl font-bold sm:text-3xl">{title}</h1><p className="mt-1 text-sm text-muted-foreground">Your collected sets, quantities, trades, and sales.</p></div><div className="flex gap-2"><div className="px-3 py-1 text-center"><strong className="block text-lg">{ownedCount.toLocaleString()}</strong><span className="text-xs text-muted-foreground">Cards owned</span></div><div className="px-3 py-1 text-center"><strong className="block text-lg">{listedCount.toLocaleString()}</strong><span className="text-xs text-muted-foreground">Listed cards</span></div></div></header>
        {error && <div role="alert" className="mb-4 border-b border-red-500/30 pb-3 text-sm text-red-500">{error}<button type="button" onClick={onRetry} className="ml-3 min-h-11 underline">Retry</button></div>}
        {loading ? <p role="status" className="py-12 text-center text-sm text-muted-foreground">Loading inventory...</p> : <div className="grid items-start gap-5 xl:grid-cols-[200px_minmax(0,1fr)_220px] xl:gap-6">
            <nav aria-label={`${title} categories`} className="flex min-w-0 gap-1.5 overflow-x-auto border-b border-border pb-4 xl:flex-col xl:border-b-0 xl:border-r xl:pb-0 xl:pr-5">{navigation.map(item => <button key={item.id} type="button" aria-pressed={category === item.id} onClick={() => onCategoryChange(item.id)} className={`flex min-h-11 shrink-0 items-center rounded-lg border px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${category === item.id ? "border-primary/50 bg-primary/15 font-semibold text-primary" : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"}`}>{item.name}</button>)}</nav>
            <section className="min-w-0"><div className="mb-2 flex items-center justify-between gap-3 border-b border-border pb-3"><h2 className="text-lg font-semibold">{label}</h2><span className="text-sm text-muted-foreground">{visibleSets.length} {visibleSets.length === 1 ? "set" : "sets"}</span></div><div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">{visibleSets.map(set => {
                const percent = Math.min(100, Math.round(set.owned / Math.max(1, set.total) * 100));
                return <Link key={set.id} to={set.href} className="group min-w-0 border-b border-border py-4 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"><div className="flex min-h-28 items-center gap-4">{set.preview && <span aria-hidden="true" className="pointer-events-none flex w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg sm:w-24">{set.preview}</span>}<div className="min-w-0 flex-1"><h3 className="font-semibold leading-tight">{set.name}</h3><p className="mt-2 text-xs text-muted-foreground">{set.owned.toLocaleString()} of {set.total.toLocaleString()} cards</p>{set.listed > 0 && <p className="mt-2 text-xs text-muted-foreground">{set.listed} {set.listed === 1 ? "card" : "cards"} listed</p>}<span className="mt-3 block text-xs text-muted-foreground">Open set <span aria-hidden="true">&rarr;</span></span></div></div><div className="mt-3 flex items-center gap-3"><div className="h-1 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${percent}%` }}/></div><span className="text-xs tabular-nums text-muted-foreground">{percent}%</span></div></Link>;
            })}{visibleSets.length === 0 && <p className="col-span-full py-12 text-center text-sm text-muted-foreground">No collected sets in this category.</p>}</div></section>
            <aside className="border-t border-border pt-4 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0"><h2 className="text-sm font-semibold">Active trades and sales</h2>{listingsLoading ? <p role="status" className="py-6 text-sm text-muted-foreground">Loading listings...</p> : activeSets.length ? <div className="mt-3 space-y-2">{activeSets.map(set => <Link key={set.id} to={set.href} className="flex min-h-12 items-center justify-between gap-3 border-b border-border py-2 text-sm transition-colors hover:text-primary"><span className="font-medium">{set.name}</span><span className="shrink-0 text-xs tabular-nums text-muted-foreground">{set.listed} listed</span></Link>)}</div> : <p className="py-6 text-sm text-muted-foreground">No active listings.</p>}<Link to={checklistHref} className="mt-4 block border-t border-border pt-4 text-sm text-muted-foreground hover:text-foreground">Open checklists</Link></aside>
        </div>}
    </div></main>;
}
