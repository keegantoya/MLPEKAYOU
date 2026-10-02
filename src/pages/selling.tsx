import CardImage from "@/components/CardImage";
import KeeganAvatar from "@/assets/avatars/keeganpfp3.webp";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
export default function Selling() {
const higherTier = [
    ["Moon Editions", "SGR, ZR, SC, \u25C7ZR"],
    ["Rainbow Editions", "USR, XR"],
    ["Fun Moments Editions", "UGR, CR, \u25C7CR"],
    ["Star Editions", "AR, OR, BP, \u25C7AR"],
  ];
const pricingCards = [
  {
    title: "Star Edition One",
    subtitle: "STAR EDITION",
    to: "/star-one",
    gradient: "",
    rows: [
      ["AR", "$25"],
      ["OR", "$40"],
      ["BP", "$65"],
      ["\u25C7AR", "$150+"],
    ],
  },
  {
    title: "Moon Edition One",
    subtitle: "MOON EDITION",
    to: "/moon-one",
    gradient: "",
    rows: [
      ["SGR", "$12"],
      ["SC", "$68"],
      ["HIDDEN SC", "$200"],
    ],
  },
  {
    title: "Moon Edition Two",
    subtitle: "MOON EDITION",
    to: "/moon-two",
    gradient: "",
    rows: [
      ["SGR", "$11"],
      ["ZR", "$25"],
      ["HIDDEN ZR", "$145"],
      ["SC", "$45"],
      ["HIDDEN SC", "$150"],
      ["\u25C7ZR", "$275"],
    ],
  },
  {
    title: "Moon Edition Three",
    subtitle: "MOON EDITION",
    to: "/moon-three",
    gradient: "",
    rows: [
      ["SGR", "$10"],
      ["CHILDHOOD ZR", "$20"],
      ["CRYSTAL ZR", "$30"],
      ["HIDDEN ZR", "$85"],
      ["SC", "$65"],
      ["HIDDEN SC", "$250"],
      ["CHILDHOOD \u25C7ZR", "$200"],
      ["CRYSTAL \u25C7ZR", "$250"],
    ],
  },
  {
    title: "Moon Edition Four",
    subtitle: "MOON EDITION",
    to: "/moon-four",
    gradient: "",
    rows: [
      ["SGR", "$8"],
      ["ZR", "$20"],
      ["SC", "$65"],
      ["\u25C7ZR", "$200"],
    ],
  },
  {
    title: "Rainbow Edition One",
    subtitle: "RAINBOW EDITION",
    to: "/rainbow-one",
    gradient: "",
    rows: [
      ["USR", "$12"],
      ["XR", "$29"],
    ],
  },
  {
    title: "Rainbow Edition Two",
    subtitle: "RAINBOW EDITION",
    to: "/rainbow-two",
    gradient: "",
    rows: [
      ["USR", "$15"],
      ["XR", "$28"],
      ["HIDDEN XR", "$100"],
    ],
  },
  {
    title: "Fun Moments Edition One",
    subtitle: "FUN MOMENTS EDITION",
    to: "/fun-moments-one",
    gradient: "",
    rows: [
      ["CR", "$18"],
      ["HIDDEN CR", "$30"],
    ],
  },
  {
    title: "Fun Moments Edition Two",
    subtitle: "FUN MOMENTS EDITION",
    to: "/fun-moments-two",
    gradient: "",
    rows: [
      ["UGR", "$8"],
      ["CR", "$17"],
      ["HIDDEN CR", "$35"],
    ],
  },
  {
    title: "Fun Moments Edition Three",
    subtitle: "FUN MOMENTS EDITION",
    to: "/fun-moments-three",
    gradient: "",
    rows: [
      ["UGR", "$8"],
      ["CR", "$20"],
      ["HIDDEN CR", "$30"],
      ["\u25C7CR", "$35"],
    ],
    note:
      "",
  },
];
const [selectedFilter, setSelectedFilter] = useState("All Sets");
const pricingGridRef = useRef<HTMLDivElement>(null);
const [columnCount, setColumnCount] = useState(1);
useEffect(() => {
  const element = pricingGridRef.current;
  if (!element) return;
  const updateColumns = () => {
    const width = element.getBoundingClientRect().width;
    setColumnCount(Math.max(1, Math.min(3, Math.floor((width + 16) / 366))));
  };
  updateColumns();
  if (typeof ResizeObserver !== "undefined") {
    const observer = new ResizeObserver(updateColumns);
    observer.observe(element);
    return () => observer.disconnect();
  }
  window.addEventListener("resize", updateColumns);
  return () => window.removeEventListener("resize", updateColumns);
}, []);
const [isLightMode, setIsLightMode] = useState(() => {
  if (typeof document === "undefined") return false;
const root = document.documentElement;
  return root.dataset.theme === "light" || root.classList.contains("light") || !root.classList.contains("dark");
});
useEffect(() => {
const syncTheme = () => {
const root = document.documentElement;
    setIsLightMode(
      root.dataset.theme === "light" ||
      root.classList.contains("light") ||
      !root.classList.contains("dark")
    );
  };
  syncTheme();
const observer = new MutationObserver(syncTheme);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-theme"],
  });
  window.addEventListener("themechange", syncTheme);
  return () => {
    observer.disconnect();
    window.removeEventListener("themechange", syncTheme);
  };
}, []);
const setHeaderImages: Record<string, string> = {
    "Star Edition One": "/thumbnails/staronesetimage.webp",
    "Moon Edition One": "/thumbnails/moononesetimage.webp",
    "Moon Edition Two": "/thumbnails/moontwosetimage.webp",
    "Moon Edition Three": "/thumbnails/moonthreesetimage.webp",
    "Moon Edition Four": "/thumbnails/moonfoursetimage.webp",
    "Rainbow Edition One": "/thumbnails/rainbowonesetimage.webp",
    "Rainbow Edition Two": "/thumbnails/rainbowtwosetimage.webp",
    "Fun Moments Edition One": "/thumbnails/funonesetimage.webp",
    "Fun Moments Edition Two": "/thumbnails/funtwosetimage.webp",
    "Fun Moments Edition Three": "/thumbnails/funthreesetimage.webp",
  };
const filteredPricingCards =
    selectedFilter === "All Sets"
      ? pricingCards
      : pricingCards.filter((card) => {
          if (selectedFilter === "Moon") {
            return card.title.includes("Moon");
          }
          if (selectedFilter === "Rainbow") {
            return card.title.includes("Rainbow");
          }
          if (selectedFilter === "Fun Moments") {
            return card.title.includes("Fun Moments");
          }
          if (selectedFilter === "Star") {
            return card.title.includes("Star");
          }
          return true;
        });
  return (
    <div className={`min-h-screen pb-24 font-['Oxanium'] sm:pb-10 ${isLightMode ? "bg-[#f6f5f1] text-zinc-900" : "bg-[#0e1011] text-zinc-100"}`}>
      <main className="w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8 2xl:px-10">
        <header className={`mb-6 flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-end ${isLightMode ? "border-black/10" : "border-white/10"}`}>
          <div>
            <p className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] ${isLightMode ? "text-[#8a6b1b]" : "text-[#D9BC68]"}`}>Community pricing guide</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Guide to <span className={isLightMode ? "text-[#8a6b1b]" : "text-[#E6CD86]"}>Selling</span></h1>
            <p className={`mt-2 max-w-2xl text-sm leading-6 ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>Fair-value estimates based on rarity, availability, pull rates, and collector demand.</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <CardImage src={KeeganAvatar} alt="Keegan" className="h-10 w-10 rounded-full object-cover ring-2 ring-[#D9BC68]/20" />
            <div><div className="text-xs font-semibold">MLPEKAYOU / KEEGAN</div><div className={`mt-0.5 text-[11px] ${isLightMode ? "text-zinc-500" : "text-zinc-500"}`}>Collector pricing reference</div></div>
          </div>
        </header>
        <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,1fr)_280px] 2xl:grid-cols-[minmax(0,1fr)_300px]">
          <section aria-labelledby="set-prices-title" className="min-w-0">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
              <div><h2 id="set-prices-title" className="text-lg font-semibold">Pricing by set</h2><p className={`mt-1 text-xs ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>Select a collection to narrow the guide.</p></div>
              <div role="group" aria-label="Filter pricing by collection" className="flex max-w-full flex-wrap gap-1.5">
                {["All Sets", "Moon", "Rainbow", "Fun Moments", "Star"].map((filter) => (
                  <button key={filter} type="button" aria-pressed={selectedFilter === filter} onClick={() => setSelectedFilter(filter)} className={`min-h-10 rounded-lg border px-3 py-2 text-xs font-semibold transition ${selectedFilter === filter ? isLightMode ? "border-[#c9ac59] bg-[#efe4c5] text-[#70551a]" : "border-[#D9BC68]/30 bg-[#D9BC68]/10 text-[#E6CD86]" : isLightMode ? "border-black/[0.08] text-zinc-500 hover:bg-white" : "border-white/[0.08] text-zinc-400 hover:bg-white/[0.04]"}`}>{filter}</button>
                ))}
              </div>
            </div>
            <div ref={pricingGridRef} className="grid items-start gap-4" style={{gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`}}>
              {Array.from({length: columnCount}, (_, column) => (
                <div key={column} className="flex min-w-0 flex-col gap-4">
                  {filteredPricingCards.filter((_, index) => index % columnCount === column).map((card) => (
                <article key={card.title} className={`group w-full overflow-hidden rounded-xl border transition duration-200 ${isLightMode ? "border-black/[0.07] bg-white shadow-[0_3px_16px_rgba(0,0,0,0.025)] hover:border-[#bca04e]/40" : "border-white/[0.07] bg-[#17191b] shadow-[0_3px_16px_rgba(0,0,0,0.12)] hover:border-[#D9BC68]/30"}`}>
                  <Link to={card.to} className={`flex items-center gap-3 border-b p-4 transition ${isLightMode ? "border-black/[0.06] hover:bg-[#fbf9f3]" : "border-white/[0.06] hover:bg-white/[0.02]"}`}>
                    <CardImage src={setHeaderImages[card.title]} alt={card.title} className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1"><p className={`text-[9px] font-semibold uppercase tracking-[0.12em] ${isLightMode ? "text-[#91752f]" : "text-[#bfa865]"}`}>{card.subtitle}</p><h3 className="mt-1 text-sm font-semibold leading-5 sm:text-base">{card.title}</h3></div>
                    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`shrink-0 transition-transform group-hover:translate-x-0.5 ${isLightMode ? "text-zinc-400" : "text-zinc-500"}`}><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
                  </Link>
                  <div className="px-4 pb-2 pt-3">
                    <div className={`mb-1 flex justify-between text-[10px] font-medium uppercase tracking-wider ${isLightMode ? "text-zinc-400" : "text-zinc-500"}`}><span>Rarity</span><span>Est. value</span></div>
                    <dl>{card.rows.map(([rarity, price], index) => (
                      <div key={`${card.title}-${rarity}`} className={`flex items-center justify-between gap-3 py-3 ${index !== card.rows.length - 1 ? isLightMode ? "border-b border-black/[0.04]" : "border-b border-white/[0.04]" : ""}`}>
                        <dt className={`text-xs font-medium sm:text-sm ${isLightMode ? "text-zinc-600" : "text-zinc-300"}`}>{rarity}</dt>
                        <dd className={`shrink-0 text-sm font-semibold tabular-nums ${price === "UNK" || price === "UNKNOWN" ? "text-zinc-500" : isLightMode ? "text-[#80621c]" : "text-[#E6CD86]"}`}>{price === "UNK" || price === "UNKNOWN" ? "Unknown" : price}</dd>
                      </div>
                    ))}</dl>
                  </div>
                  {card.note && <p className={`mx-4 mb-4 border-l-2 border-[#D9BC68]/40 pl-3 text-xs leading-5 ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>{card.note}</p>}
                </article>
                  ))}
                </div>
              ))}
            </div>
          </section>
          <aside className="min-w-0 space-y-5 xl:sticky xl:top-6">
            <section className={`rounded-xl border p-4 ${isLightMode ? "border-[#bca04e]/20 bg-[#f0eadb]/60" : "border-[#D9BC68]/15 bg-[#D9BC68]/[0.035]"}`}>
              <div className={`mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider ${isLightMode ? "text-[#80621c]" : "text-[#D9BC68]"}`}><span className="h-1.5 w-1.5 rounded-full bg-[#D9BC68]" />Higher-tier rarities</div>
              <h2 className="mb-3 text-base font-semibold">Cards With Value</h2>
              <dl className="space-y-3">{higherTier.map(([name, rarities]) => <div key={name}><dt className="text-xs font-semibold">{name}</dt><dd className={`mt-1 text-xs leading-5 ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>{rarities}</dd></div>)}</dl>
            </section>
            <details className={`group border-b pb-4 ${isLightMode ? "border-black/10" : "border-white/10"}`}>
              <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">How prices are determined<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 transition-transform group-open:rotate-180"><path d="m6 9 6 6 6-6" /></svg></summary>
              <p className={`mt-2 text-xs leading-6 ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>Prices are established by experienced collectors and reflect rarity, pull rates, product availability, and long-term collector demand rather than inflated resale listings or speculative pricing. The goal is to keep the hobby accessible across different budgets.</p>
            </details>
            <section><h2 className="text-sm font-semibold">What about TCG?</h2><p className={`mt-2 text-xs leading-6 ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>TCG values are less predictable because playability can outweigh rarity. For current TCG pricing estimates, ask in the TCG chat in the Discord server.</p></section>
            <section className={`border-t pt-4 ${isLightMode ? "border-black/10" : "border-white/10"}`}><h2 className={`text-[11px] font-semibold uppercase tracking-wider ${isLightMode ? "text-zinc-400" : "text-zinc-500"}`}>Pricing disclaimer</h2><p className={`mt-2 text-xs leading-6 ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>Prices change as products age and become harder to obtain. Community demand also affects value, so lower pull rates do not always mean higher demand. TCG prices fluctuate independently and should be compared with recently completed sales.</p></section>
          </aside>
        </div>
      </main>
    </div>
  );
}
