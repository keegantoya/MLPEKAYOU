import { ChevronRight } from "lucide-react";
type Category = { name: string; slug: string };
const categories: Category[] = [
  { name: "All Collections", slug: "all" },
  { name: "Moon", slug: "eternal-moon" },
  { name: "Star", slug: "star" },
  { name: "Rainbow", slug: "rainbow" },
  { name: "Fun Moments", slug: "fun-moments" },
  { name: "Card Game", slug: "tcg" },
  { name: "Promotional", slug: "promos" },
  { name: "Other", slug: "merch" },
];
interface CatalogSidebarProps {
  activeCategory: string;
  onCategoryChange: (slug: string) => void;
  hideMastered: boolean;
  onToggleHideMastered: () => void;
  sortBy: "release" | "set";
  onSortChange: (value: "release" | "set") => void;
}
const CatalogSidebar = ({ activeCategory, onCategoryChange, hideMastered, onToggleHideMastered, sortBy, onSortChange }: CatalogSidebarProps) => (
  <aside className="catalog-filter hidden md:block">
    <nav aria-label="Collection categories">
      <h2>Browse sets</h2>
      <div className="catalog-filter-categories">
        {categories.map(cat => <button type="button" key={cat.slug} onClick={() => onCategoryChange(cat.slug)} aria-pressed={activeCategory === cat.slug}><span>{cat.name}</span><ChevronRight size={14} aria-hidden="true" /></button>)}
      </div>
      <div className="catalog-filter-options">
        <h3>Order by</h3>
        <div className="catalog-filter-sort">
          <span aria-hidden="true" style={{ transform: sortBy === "set" ? "translateX(100%)" : "translateX(0)" }} />
          <button type="button" aria-pressed={sortBy === "release"} onClick={() => onSortChange("release")}>Release</button>
          <button type="button" aria-pressed={sortBy === "set"} onClick={() => onSortChange("set")}>Set</button>
        </div>
        <button className="catalog-filter-toggle" type="button" onClick={onToggleHideMastered} aria-pressed={hideMastered}><span>Hide mastered</span><span className="catalog-filter-switch" aria-hidden="true"><span /></span></button>
      </div>
    </nav>
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
  </aside>
);
export { categories };
export default CatalogSidebar;
