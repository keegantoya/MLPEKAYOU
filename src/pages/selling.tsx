import KeeganAvatar from "@/assets/avatars/keeganpfp.webp";
import { useState } from "react";

export default function Selling() {
  const stats = [

  ];

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
    ["Star Editions", "USR, AR, OR, BP, ◇AR"],
  ];

  const pricingCards = [
    {
      title: "Star Edition One",
      subtitle: "STAR EDITION",
      gradient: "from-purple-700 via-violet-600 to-fuchsia-500",
      rows: [
        ["USR", "$15"],
        ["AR", "$20"],
        ["OR", "$40"],
        ["BP", "$65"],
        ["◇AR", "$150"],
      ],
    },
    {
      title: "Moon Edition One",
      subtitle: "MOON EDITION",
      gradient: "from-indigo-700 via-blue-600 to-indigo-500",
      rows: [
        ["SGR", "$12"],
        ["SC", "$68"],
        ["HIDDEN SC", "$200"],
      ],
    },
    {
      title: "Moon Edition Two",
      subtitle: "MOON EDITION",
      gradient: "from-indigo-700 via-blue-600 to-indigo-500",
      rows: [
        ["SGR", "$11"],
        ["ZR", "$20"],
        ["HIDDEN ZR", "$145"],
        ["SC", "$50"],
        ["HIDDEN SC", "$150"],
        ["◇ZR", "$250"],
      ],
    },
    {
      title: "Moon Edition Three",
      subtitle: "MOON EDITION",
      gradient: "from-indigo-700 via-blue-600 to-indigo-500",
      rows: [
        ["SGR", "$10"],
        ["CHILDHOOD ZR", "$25"],
        ["CRYSTAL ZR", "$35"],
        ["HIDDEN ZR", "$150"],
        ["SC", "$62"],
        ["HIDDEN SC", "$245"],
        ["CHILDHOOD ◇ZR", "UNKNOWN"],
        ["CRYSTAL ◇ZR", "UNKNOWN"],
      ],
    },
    {
      title: "Rainbow Edition One",
      subtitle: "RAINBOW EDITION",
      gradient: "from-pink-500 via-yellow-400 via-green-400 to-blue-500",
      rows: [
        ["USR", "$12"],
        ["XR", "$29"],
      ],
    },
    {
      title: "Rainbow Edition Two",
      subtitle: "RAINBOW EDITION",
      gradient: "from-pink-500 via-yellow-400 via-green-400 to-blue-500",
      rows: [
        ["USR", "$15"],
        ["XR", "$28"],
        ["HIDDEN XR", "UNKNOWN"],
      ],
    },
    {
      title: "Fun Moments Edition One",
      subtitle: "FUN MOMENTS EDITION",
      gradient: "from-pink-500 via-rose-400 to-fuchsia-500",
      rows: [
        ["CR", "$18"],
        ["HIDDEN CR", "$28"],
      ],
    },
    {
      title: "Fun Moments Edition Two",
      subtitle: "FUN MOMENTS EDITION",
      gradient: "from-pink-500 via-rose-400 to-fuchsia-500",
      rows: [
        ["UGR", "$8"],
        ["CR", "$17"],
        ["HIDDEN CR", "$35"],
      ],
    },
    {
      title: "Fun Moments Edition Three",
      subtitle: "FUN MOMENTS EDITION",
      gradient: "from-pink-500 via-rose-400 to-fuchsia-500",
      rows: [
        ["UGR", "$8"],
        ["CR", "$15"],
        ["HIDDEN CR", "$20"],
        ["◇CR", "$25"],
      ],
      note:
        "These prices are due to the extremely high hit rates in this box set. All rarities are evenly ditributed in Fun Moments 3 and easily attainable.",
    },
  ];

const [selectedFilter, setSelectedFilter] = useState("All Sets");


  const setHeaderImages: Record<string, string> = {
  "Star Edition One": "/thumbnails/s1-thumbnail.webp",
  "Moon Edition One": "/thumbnails/moon-fe.webp",
  "Moon Edition Two": "/thumbnails/moon-se.webp",
  "Moon Edition Three": "/thumbnails/moon-te.webp",
  "Rainbow Edition One": "/thumbnails/rainbow1thumbnail.webp",
  "Rainbow Edition Two": "/thumbnails/rainbow2thumbnail.webp",
  "Fun Moments Edition One": "/thumbnails/fme01TN.webp",
  "Fun Moments Edition Two": "/thumbnails/fme02TN.webp",
  "Fun Moments Edition Three": "/thumbnails/fme03TN.webp",
  "Fantasy Wonderland": "/thumbnails/fantasy-wonderland-thumbnail.webp",
  "Friendships Begin": "/thumbnails/friendship-begins-thumbnail.webp",
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
  className="min-h-screen bg-[#333333] text-zinc-900 pb-24 sm:pb-0"
>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-5">
        {/* HERO */}
        <section className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-zinc-800 border border-zinc-600 shadow-lg text-zinc-100 -mt-1 mb-6">
            <span className="text-yellow-500">✦</span>
            <span className="text-sm sm:text-base font-semibold tracking-wide text-zinc-100">
              Unofficial Community Price Guide
            </span>
            <span className="text-yellow-500">✦</span>
          </div>

{/* INTRODUCTION */}
<div className="max-w-5xl mx-auto mb-10">

  <div className="flex items-center gap-5 mb-5">
    <img
      src={KeeganAvatar}
      alt="Pricing Guide"
      className="w-16 h-16 rounded-lg border border-zinc-600 shadow-lg"
    />

    <div>

      <h2 className="text-4xl font-black uppercase leading-none text-zinc-900">
        How Prices Are Determined
      </h2>
    </div>
  </div>

  <div className="border-t-2 border-yellow-500 mb-6" />

  <div className="bg-zinc-800 border border-zinc-600 rounded-xl overflow-hidden">

    <div className="px-6 py-6">

      <p className="text-zinc-300 leading-8">
        Prices are established by an experienced council of collectors who were
        collecting long before the arrival of North American Kayou products.
        Values are based on rarity, pull rates, product availability, and
        long-term collector demand rather than inflated resale listings or
        speculative pricing.
      </p>

      <p className="mt-5 text-zinc-300 leading-8">
        This guide exists to encourage fair trades within the community. Trading
        Card Game products are intentionally excluded because their values are
        driven by gameplay and fluctuate too frequently to maintain reliable
        community pricing.
      </p>

    </div>

  </div>

</div>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mb-10">
            {stats.map((stat) => (
              <div
                key={`${stat.value}-${stat.label}`}
                className="flex items-center justify-center gap-3"
              >
                <div className="text-2xl sm:text-3xl">{stat.icon}</div>
                <div className="text-left">
                  <div className="text-2xl sm:text-4xl font-extrabold text-violet-700 leading-none">
                    {stat.value}
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold tracking-[0.18em] text-violet-600 mt-1">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

{/* CARDS WITH VALUE */}
<section className="mb-12">

  <div className="flex items-center gap-4 mb-6">

    <div>
      <p className="text-xs uppercase tracking-[0.3em] text-zinc-600 font-semibold">
        Community Guide
      </p>

      <h2 className="text-4xl font-black uppercase leading-none text-zinc-900">
        Cards with Value
      </h2>
    </div>
  </div>

  <div className="border-t-2 border-yellow-500 mb-6" />

  <div className="bg-zinc-800 border border-zinc-600 rounded-xl overflow-hidden">

    {higherTier.map(([name, rarities], index) => (
      <div
        key={name}
        className={`flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-6 py-5 ${
          index !== higherTier.length - 1
            ? "border-b border-zinc-700"
            : ""
        }`}
      >
        <div>
          <h3 className="text-lg font-bold text-zinc-100">
            {name}
          </h3>

          <p className="mt-1 text-sm text-zinc-400">
            {rarities}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-md bg-gradient-to-r from-[#fff7c2] via-[#f6d365] to-[#d4af37] text-[#4a3200] text-xs font-bold uppercase tracking-wide">
            Valuable
          </span>
        </div>
      </div>
    ))}

  </div>

</section>

{/* SET FILTER */}
<section className="mb-10">

  <div className="flex items-center justify-between mb-4">
    <div>
      <p className="text-xs uppercase tracking-[0.3em] font-semibold text-zinc-500">
        General Estimates
      </p>

      <h2 className="text-3xl font-black uppercase leading-none text-zinc-900 mt-1">
        Filter by Set
      </h2>
    </div>
  </div>

  <div className="h-px bg-yellow-500 mb-6" />

  <div className="flex flex-wrap gap-3">

    {[
      "All Sets",
      "Moon",
      "Rainbow",
      "Fun Moments",
      "Star",
    ].map((filter) => (
      <button
        key={filter}
        onClick={() => setSelectedFilter(filter)}
        className={`px-5 py-3 rounded-lg border text-sm font-bold uppercase tracking-wide transition-all duration-200 ${
          selectedFilter === filter
            ? "text-[#4a3200] border-[#d4af37] bg-gradient-to-br from-[#fff7c2] via-[#f6d365] to-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.45)]"
            : "bg-zinc-800 border-zinc-600 text-zinc-100 hover:bg-zinc-700 hover:border-zinc-500"
        }`}
      >
        {filter}
      </button>
    ))}

  </div>

</section>

        {/* PRICING GRID */}
        <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {filteredPricingCards.map((card) => (
            <div
              key={card.title}
              className="bg-zinc-800 rounded-xl overflow-hidden border border-zinc-600 shadow-lg hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
            >
<div
  className="relative px-5 py-4 overflow-hidden"
  style={{
    backgroundImage: `url(${setHeaderImages[card.title] || "/thumbnails/moon-fe.webp"})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>
  {/* Dark overlay for readability */}
  <div className="absolute inset-0 bg-black/45" />

  {/* Purple tint to match your site aesthetic */}
  <div className="absolute inset-0 bg-violet-900/35" />

  {/* Subtle top highlight */}
  <div className="absolute inset-x-0 top-0 h-px bg-white/40" />

  {/* Content */}
  <div className="relative z-10">
    <h3 className="text-white text-2xl font-bold leading-tight drop-shadow-lg">
      {card.title}
    </h3>
    <p className="text-white/90 text-xs font-bold tracking-[0.18em] mt-1 drop-shadow">
      {card.subtitle}
    </p>
  </div>
</div>

              <div className="p-5">
                <div className="space-y-2">
                  {card.rows.map(([rarity, price]) => (
                    <div
                      key={`${card.title}-${rarity}`}
                      className="flex items-center justify-between py-1 border-b border-zinc-700 last:border-0"
                    >
                      <span className="text-sm font-medium text-zinc-100">
                        {rarity}
                      </span>

                      {price === "UNK" ? (
                        <span className="px-3 py-1 rounded-full bg-zinc-700 text-zinc-100 text-xs font-bold">
                          UNK
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#fff7c2] via-[#f6d365] to-[#d4af37] text-[#4a3200] text-xs font-bold">
                          {price}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

              </div>
            </div>
          ))}
        </section>

{/* FOOTER NOTE */}
<section className="mt-12 border-t border-zinc-500 pt-8">
  <div className="max-w-5xl mx-auto">
    <h3 className="text-lg font-bold uppercase tracking-wide text-zinc-500 mb-3">
      Pricing Disclaimer
    </h3>

    <p className="text-sm leading-7 text-zinc-300">
      Prices reflect changes as products age and become more difficult to
      obtain. Community demand also influences value, meaning rarities with
      lower pull rates are not always the most desirable. Trading Card Game
      prices fluctuate independently and should be referenced using recently
      completed eBay sales.
    </p>
  </div>
</section>
      </main>
    </div>
  );
}