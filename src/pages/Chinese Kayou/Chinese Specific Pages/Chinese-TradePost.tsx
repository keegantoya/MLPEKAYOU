import { useState } from "react";
import { Link } from "react-router-dom";
import { chineseSets, chineseFamilies, type ChineseFamily } from "@/pages/Chinese Kayou/Chinese ISO/catalog/catalog";
export default function ChineseTradePost() {
  const [family, setFamily] = useState<ChineseFamily | "all">("all");
  const [search, setSearch] = useState("");
  const term = search.trim().toLowerCase();
  const sets = chineseSets.filter(set => (family === "all" || set.family === family) && set.name.toLowerCase().includes(term));
  return <main className="w-full min-w-0 px-4 pb-20 pt-3 font-['Oxanium'] text-foreground sm:px-6 sm:py-6 lg:px-8">
    <header className="flex flex-col gap-5 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Chinese Trading Post</h1><p className="mt-2 text-sm text-muted-foreground">Find Chinese cards for trade or sale. Choose a set to see collector listings.</p></div>
      <label className="block w-full sm:max-w-xs"><span className="sr-only">Find a Chinese set</span><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Find a set..." className="min-h-11 w-full border-b border-border bg-transparent px-0 py-2 text-base outline-none focus:border-primary" /></label>
    </header>
    <nav aria-label="Chinese set categories" className="my-5 flex gap-5 overflow-x-auto border-b border-border">
      {[{ id: "all", name: "All" }, ...chineseFamilies].map(item => <button type="button" key={item.id} aria-pressed={family === item.id} onClick={() => setFamily(item.id as ChineseFamily | "all")} className={`shrink-0 border-b-2 pb-3 text-sm font-medium transition-colors ${family === item.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{item.name}</button>)}
    </nav>
    <p aria-live="polite" className="mb-2 text-xs text-muted-foreground">{sets.length} {sets.length === 1 ? "set" : "sets"}</p>
    <div className="grid gap-x-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{sets.map(set => <Link key={set.id} to={`/trading-post-chinese/${set.id}`} className="flex min-h-20 items-center justify-between gap-3 border-b border-border py-4 transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"><span className="font-semibold">{set.name}</span><span className="shrink-0 text-xs text-muted-foreground">View listings</span></Link>)}</div>
    {sets.length === 0 && <div className="py-12"><p className="text-muted-foreground">No sets match your search.</p><button type="button" onClick={() => { setSearch(""); setFamily("all"); }} className="mt-3 text-sm font-semibold text-primary">Show all sets</button></div>}
  </main>;
}
