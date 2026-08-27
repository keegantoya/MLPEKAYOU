import KeeganAvatar from "@/assets/avatars/keeganpfp2.webp";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
export default function Selling() {
const stats = [];
const lowerTier = [
    ["Moon Editions", "R, SR, HR, SSR, UR, LSR"],
    ["Rainbow Editions", "BASE, ST, R, SR, FR, TR, TGR"],
    ["Fun Moments Editions", "N, ◇N, R, SR, SSR, UR"],
    ["Star Editions", "SSR, SCR, UR"],
  ];
const higherTier = [
    ["Moon Editions", "SGR, ZR, SC, ◇ZR"],
    ["Rainbow Editions", "USR, XR"],
    ["Fun Moments Editions", "UGR, CR, ◇CR"],
    ["Star Editions", "AR, OR, BP, ◇AR"],
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
      ["◇AR", "$150+"],
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
      ["◇ZR", "$275"],
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
      ["CHILDHOOD ◇ZR", "$200"],
      ["CRYSTAL ◇ZR", "$250"],
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
      ["◇CR", "$35"],
    ],
    note:
      "",
  },
];
const [selectedFilter, setSelectedFilter] = useState("All Sets");
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
    <div
      className={`min-h-screen pb-24 font-['Oxanium'] transition-colors sm:pb-10 ${
        isLightMode ? "bg-[#f6f4ef] text-zinc-900" : "bg-[#0f1112] text-zinc-100"
      }`}
    >
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-56"
        style={{
          background: isLightMode
            ? "radial-gradient(circle at 50% 0%, rgba(255,213,74,.11), transparent 65%)"
            : "radial-gradient(circle at 50% 0%, rgba(255,213,74,.06), transparent 65%)",
        }}
      />
      <main className="relative mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <header
          className={`mb-5 overflow-hidden rounded-[26px] border ${
            isLightMode ? "border-black/10 bg-white" : "border-white/[0.08] bg-[#17191a]"
          }`}
        >
          <div className="h-1 bg-gradient-to-r from-[#FFD54A] via-[#e7c444] to-transparent" />
          <div className="flex items-center gap-4 p-4 sm:p-5">
            <img
              src={KeeganAvatar}
              alt="Pricing Guide"
              className={`h-14 w-14 shrink-0 rounded-2xl border object-cover ${
                isLightMode ? "border-black/10" : "border-white/10"
              }`}
            />
            <div className="min-w-0">
              <div className={`text-sm font-medium ${isLightMode ? "text-[#806100]" : "text-[#E8CA55]"}`}>
                Community pricing guide
              </div>
              <h1 className="mt-0.5 text-2xl font-semibold sm:text-3xl">Guide to Selling</h1>
              <p className={`mt-1 max-w-2xl text-sm leading-relaxed ${
                isLightMode ? "text-zinc-600" : "text-zinc-400"
              }`}>
                Fair-value estimates based on rarity, availability, pull rates, and collector demand.
              </p>
            </div>
          </div>
        </header>
        <section
          className={`mb-5 rounded-[24px] border p-4 sm:p-5 ${
            isLightMode ? "border-black/10 bg-white" : "border-white/[0.08] bg-[#17191a]"
          }`}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <h2 className="text-lg font-semibold">How prices are determined</h2>
              <p className={`mt-2 text-sm leading-6 ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>
                Prices are established by experienced collectors and reflect rarity, pull rates, product availability, and long-term collector demand rather than inflated resale listings or speculative pricing. The goal is to keep the hobby accessible across different budgets.
              </p>
            </div>
            <div
              className={`rounded-[20px] border p-4 ${
                isLightMode ? "border-[#d8bd55]/35 bg-[#fff9df]" : "border-[#FFD54A]/15 bg-[#FFD54A]/[0.05]"
              }`}
            >
              <h3 className={`text-sm font-semibold ${isLightMode ? "text-[#725800]" : "text-[#E8CA55]"}`}>
                What about TCG?
              </h3>
              <p className={`mt-2 text-sm leading-6 ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>
                TCG values are less predictable because playability can outweigh rarity. For current TCG pricing estimates, ask in the TCG chat in the Discord server.
              </p>
            </div>
          </div>
        </section>
        <section className="mb-6">
          <div className="mb-3">
            <div className={`text-sm font-medium ${isLightMode ? "text-[#806100]" : "text-[#E8CA55]"}`}>
              Higher-tier rarities
            </div>
            <h2 className="mt-0.5 text-xl font-semibold">Cards With Value</h2>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {higherTier.map(([name, rarities]) => (
              <div
                key={name}
                className={`rounded-[20px] border p-4 ${
                  isLightMode ? "border-black/10 bg-white" : "border-white/[0.08] bg-[#17191a]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold">{name}</h3>
                    <p className={`mt-1 text-sm leading-5 ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                      {rarities}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      isLightMode ? "bg-[#fff1ad] text-[#725800]" : "bg-[#FFD54A]/10 text-[#E8CA55]"
                    }`}
                  >
                    High value
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="mb-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Pricing by set</h2>
              <p className={`mt-1 text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                Select a collection to narrow the guide.
              </p>
            </div>
            <span
              className={`hidden rounded-full px-3 py-1.5 text-sm sm:block ${
                isLightMode ? "bg-white text-zinc-600" : "bg-white/[0.05] text-zinc-300"
              }`}
            >
              {selectedFilter}
            </span>
          </div>
          <div
            className={`flex gap-2 overflow-x-auto rounded-[20px] border p-1.5 ${
              isLightMode ? "border-black/10 bg-white" : "border-white/[0.08] bg-[#17191a]"
            }`}
          >
            {["All Sets", "Moon", "Rainbow", "Fun Moments", "Star"].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setSelectedFilter(filter)}
                className={`shrink-0 rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition ${
                  selectedFilter === filter
                    ? "bg-[#FFD54A] text-zinc-900"
                    : isLightMode
                    ? "text-zinc-600 hover:bg-zinc-100"
                    : "text-zinc-300 hover:bg-white/[0.06]"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredPricingCards.map((card) => (
            <Link
              key={card.title}
              to={card.to}
              className={`group overflow-hidden rounded-[24px] border transition hover:-translate-y-0.5 ${
                isLightMode
                  ? "border-black/10 bg-white hover:border-[#c8a62d]/45 hover:shadow-[0_12px_30px_rgba(73,55,0,.08)]"
                  : "border-white/[0.08] bg-[#17191a] hover:border-[#FFD54A]/30 hover:shadow-[0_12px_30px_rgba(0,0,0,.25)]"
              }`}
            >
              <div
                className="relative h-32 overflow-hidden"
                style={{
                  backgroundImage: `url(${setHeaderImages[card.title] || "/thumbnails/moon-fe.webp"})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className={`absolute inset-0 ${
                  isLightMode
                    ? "bg-gradient-to-t from-black/65 via-black/15 to-black/10"
                    : "bg-gradient-to-t from-black/75 via-black/20 to-black/10"
                }`} />
                <div className="absolute bottom-3 left-4 right-4">
                  <div className="text-lg font-semibold text-white drop-shadow-md">{card.title}</div>
                  <div className="mt-1 text-xs font-medium text-[#FFE27A]">{card.subtitle}</div>
                </div>
              </div>
              <div className="p-4">
                <div
                  className={`mb-2 flex items-center justify-between border-b pb-2 text-sm font-medium ${
                    isLightMode ? "border-black/[0.06] text-zinc-500" : "border-white/[0.06] text-zinc-400"
                  }`}
                >
                  <span>Rarity</span>
                  <span>Est. value</span>
                </div>
                <div>
                  {card.rows.map(([rarity, price], rowIndex) => (
                    <div
                      key={`${card.title}-${rarity}`}
                      className={`flex items-center justify-between gap-3 py-2.5 ${
                        rowIndex !== card.rows.length - 1
                          ? isLightMode
                            ? "border-b border-black/[0.05]"
                            : "border-b border-white/[0.05]"
                          : ""
                      }`}
                    >
                      <span className="text-sm font-medium">{rarity}</span>
                      {price === "UNK" || price === "UNKNOWN" ? (
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs ${
                            isLightMode ? "bg-zinc-100 text-zinc-500" : "bg-white/[0.05] text-zinc-400"
                          }`}
                        >
                          Unknown
                        </span>
                      ) : (
                        <span
                          className={`rounded-full px-2.5 py-1 text-sm font-semibold ${
                            isLightMode ? "bg-[#fff1ad] text-[#725800]" : "bg-[#FFD54A]/10 text-[#E8CA55]"
                          }`}
                        >
                          {price}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                {card.note && (
                  <div
                    className={`mt-3 rounded-2xl border p-3 text-sm leading-5 ${
                      isLightMode
                        ? "border-[#d8bd55]/30 bg-[#fff9df] text-zinc-600"
                        : "border-[#FFD54A]/15 bg-[#FFD54A]/[0.04] text-zinc-400"
                    }`}
                  >
                    <span className={`font-semibold ${isLightMode ? "text-[#725800]" : "text-[#E8CA55]"}`}>
                      Note:
                    </span>{" "}
                    {card.note}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </section>
        <section
          className={`mt-6 rounded-[22px] border p-4 sm:p-5 ${
            isLightMode ? "border-black/10 bg-white" : "border-white/[0.08] bg-[#17191a]"
          }`}
        >
          <h3 className="text-sm font-semibold">Pricing disclaimer</h3>
          <p className={`mt-2 text-sm leading-6 ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>
            Prices change as products age and become harder to obtain. Community demand also affects value, so lower pull rates do not always mean higher demand. TCG prices fluctuate independently and should be compared with recently completed sales.
          </p>
        </section>
      </main>
    </div>
  );
}
