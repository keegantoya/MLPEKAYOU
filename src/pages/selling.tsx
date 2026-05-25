import KayouHeader from "@/components/KayouHeader";
import sellingBadge from "@/assets/avatars/sellingbadge.png";
import KeeganAvatar from "@/assets/avatars/keeganpfp.jpg";
import { useState } from "react";

import elementOfMagic from "/website-assets/elementofmagic.png";
import elementOfLoyalty from "/website-assets/elementofloyalty.png";
import elementOfKindness from "/website-assets/elementofkindness.png";
import elementOfGenerosity from "/website-assets/elementofgenerosity.png";
import elementOfHonesty from "/website-assets/elementofhonesty.png";
import elementOfLaughter from "/website-assets/elementoflaughter.png";

export default function Selling() {
  const stats = [

  ];

  const lowerTier = [
    ["Moon Editions", "R, SR, HR, SSR, UR, LSR"],
    ["Rainbow Editions", "BASE, ST, R, SR, FR, TR, TGR"],
    ["Fun Moments Editions", "N, ◇N, R, SR, SSR, UR"],
    ["Star Editions", "SSR, SCR, UR"],
    ["TCG Boxes", "C, U, SR, SPR, ER, GR, CR, RR"],
    ["Starter Decks", "C, U, SR, SPR, ER, GR, CR"],
  ];

  const higherTier = [
    ["Moon Editions", "SGR, ZR, SC, ◇ZR"],
    ["Rainbow Editions", "USR, XR"],
    ["Fun Moments Editions", "UGR, CR, ◇CR"],
    ["Star Editions", "USR, AR, OR, BP, ◇AR"],
    ["Fantasy Wonderland", "※ER, ※GR, ※SPR, ※CR, ※RR"],
    ["Starter Decks", "※ER, ※RR"],
  ];

  const pricingCards = [
    {
      title: "Star Edition One",
      subtitle: "STAR EDITION",
      gradient: "from-purple-700 via-violet-600 to-fuchsia-500",
      rows: [
        ["USR", "UNKNOWN"],
        ["AR", "UNKNOWN"],
        ["OR", "UNKNOWN"],
        ["BP", "UNKNOWN"],
        ["◇AR", "UNKNOWN"],
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
        ["SGR", "$13"],
        ["ZR", "$27"],
        ["HIDDEN ZR", "$145"],
        ["SC", "$59"],
        ["HIDDEN SC", "$200"],
        ["◇ZR", "$200"],
      ],
    },
    {
      title: "Moon Edition Three",
      subtitle: "MOON EDITION",
      gradient: "from-indigo-700 via-blue-600 to-indigo-500",
      rows: [
        ["SGR", "$9"],
        ["ZR", "$30"],
        ["HIDDEN ZR", "UNKNOWN"],
        ["SC", "$62"],
        ["HIDDEN SC", "UNKNOWN"],
        ["◇ZR", "UNKNOWN"],
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
        ["USR", "UNKNOWN"],
        ["XR", "UNKNOWN"],
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
        ["UGR", "$13"],
        ["CR", "$13"],
        ["HIDDEN CR", "$13"],
        ["◇CR", "$13"],
      ],
      note:
        "These prices are due to the extremely high hit rates in this box set. All rarities are evenly ditributed in Fun Moments 3 and easily attainable.",
    },
    {
      title: "Fantasy Wonderland",
      subtitle: "TRADING CARD GAME",
      gradient: "from-emerald-600 via-teal-500 to-cyan-500",
      rows: [
        ["※ER", "$15"],
        ["※GR", "$25"],
        ["※SPR", "$30"],
        ["※CR", "$50"],
        ["※RR", "$150"],
      ],
    },
    {
      title: "Friendships Begin",
      subtitle: "TRADING CARD GAME BONUS PACKS",
      gradient: "from-violet-600 via-purple-500 to-pink-500",
      rows: [
        ["※ER", "$15"],
        ["※RR", "$135"],
      ],
    },
  ];

const [selectedFilter, setSelectedFilter] = useState("All Sets");


  const setHeaderImages: Record<string, string> = {
  "Star Edition One": "/thumbnails/s1-thumbnail.jpg",
  "Moon Edition One": "/thumbnails/moon-fe.jpg",
  "Moon Edition Two": "/thumbnails/moon-se.jpg",
  "Moon Edition Three": "/thumbnails/moon-te.jpg",
  "Rainbow Edition One": "/thumbnails/rainbow1thumbnail.jpg",
  "Rainbow Edition Two": "/thumbnails/rainbow2thumbnail.jpg",
  "Fun Moments Edition One": "/thumbnails/fme01TN.jpg",
  "Fun Moments Edition Two": "/thumbnails/fme02TN.jpg",
  "Fun Moments Edition Three": "/thumbnails/fme03TN.jpg",
  "Fantasy Wonderland": "/thumbnails/fantasy-wonderland-thumbnail.jpg",
  "Friendships Begin": "/thumbnails/friendship-begins-thumbnail.jpg",
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

        if (selectedFilter === "TCG") {
          return (
            card.title === "Fantasy Wonderland" ||
            card.title === "Friendships Begin"
          );
        }

        return true;
      });

  return (
    <div
      className="min-h-screen text-neutral-800"
    style={{
  backgroundColor: "#F8F3FF",
  backgroundImage: `
    radial-gradient(circle at 15% 20%, rgba(244, 200, 74, 0.12) 0%, transparent 35%),
    radial-gradient(circle at 85% 15%, rgba(236, 72, 153, 0.08) 0%, transparent 30%),
    radial-gradient(circle at 25% 75%, rgba(168, 85, 247, 0.10) 0%, transparent 35%),
    radial-gradient(circle at 75% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 30%),
    linear-gradient(
      180deg,
      #FCF9FF 0%,
      #F8F1FF 35%,
      #F5EEFF 65%,
      #FAF6FF 100%
    )
  `,
}}
    >
      <KayouHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-5">
        {/* HERO */}
        <section className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/80 border border-yellow-300 shadow-md -mt-1 mb-6">
            <span className="text-yellow-500">✦</span>
            <span className="text-sm sm:text-base font-semibold tracking-wide text-violet-800">
              Unofficial Community Price Guide
            </span>
            <span className="text-yellow-500">✦</span>
          </div>

          {/* DESCRIPTION CARD */}
          <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm border border-yellow-300 rounded-[28px] shadow-xl p-6 sm:p-8 mb-8">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-100 to-white border-4 border-yellow-200 shadow-lg p-1 shrink-0">
  <img
    src={KeeganAvatar}
    alt="Princess Luna"
    className="w-full h-full rounded-full object-cover"
  />
</div>

              <p className="text-sm sm:text-base leading-8 text-violet-900 text-center sm:text-left">
                Prices are established by a council of experienced collectors
                based on pull rates, rarity, and sealed product costs. These
                values are intended to promote fair trading and preserve the
                accessibility of MLP Kayou for every collector. My Little Pony
                Kayou products are not intended for profiting like Pokemon. Please
                refrain from buying cards simply to sell.
              </p>
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

        {/* TIER CARDS */}
        <section className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* LOWER */}
          <div className="bg-white/90 border border-violet-200 rounded-[32px] shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-violet-100 to-white px-6 py-5 border-b border-violet-100">
              <div className="bg-gradient-to-r from-violet-100 to-white px-6 py-5 border-b border-violet-100">
  <h2 className="text-3xl font-bold text-violet-900 flex items-center gap-3">
    <img
      src="/website-assets/elementoflaughter.png"
      alt="Lower Tier"
      className="w-10 h-10 object-contain drop-shadow-sm"
    />
    <span>Lower Tier Cards</span>
  </h2>
</div>
            </div>

            <div className="p-6 space-y-3">
              {lowerTier.map(([name, rarities]) => (
                <div
                  key={name}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-violet-100 last:border-0 last:pb-0"
                >
                  <span className="text-sm sm:text-base text-violet-900">
                    <span className="font-semibold">{name}</span> — {rarities}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold whitespace-nowrap">
                    Common
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* HIGHER */}
          <div className="bg-white/90 border border-yellow-300 rounded-[32px] shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-100 to-amber-50 px-6 py-5 border-b border-yellow-200">
              <div className="bg-gradient-to-r from-yellow-100 to-amber-50 px-6 py-5 border-b border-yellow-200">
  <h2 className="text-3xl font-bold text-violet-900 flex items-center gap-3">
    <img
      src="/website-assets/elementofgenerosity.png"
      alt="Higher Tier"
      className="w-10 h-10 object-contain drop-shadow-sm"
    />
    <span>Higher Tier Cards</span>
  </h2>
</div>
            </div>

            <div className="p-6 space-y-3">
              {higherTier.map(([name, rarities]) => (
                <div
                  key={name}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-yellow-100 last:border-0 last:pb-0"
                >
                  <span className="text-sm sm:text-base text-violet-900">
                    <span className="font-semibold">{name}</span> — {rarities}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-yellow-100 text-amber-700 text-xs font-semibold whitespace-nowrap">
                    Valuable
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FILTER BAR */}
<section className="bg-white/80 backdrop-blur-sm border border-violet-100 rounded-2xl shadow-lg p-4 mb-8">
  <div className="flex flex-wrap gap-2 justify-center">
    {[
      "All Sets",
      "Moon",
      "Rainbow",
      "Fun Moments",
      "Star",
      "TCG",
    ].map((filter) => (
      <button
        key={filter}
        onClick={() => setSelectedFilter(filter)}
        className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
          selectedFilter === filter
            ? "bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-md"
            : "bg-white border border-violet-200 text-violet-700 hover:bg-violet-50"
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
              className="bg-white/95 backdrop-blur-sm rounded-[28px] overflow-hidden border border-white shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
            >
<div
  className="relative px-5 py-4 overflow-hidden"
  style={{
    backgroundImage: `url(${setHeaderImages[card.title] || "/thumbnails/moon-fe.jpg"})`,
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
                      className="flex items-center justify-between py-1 border-b border-violet-50 last:border-0"
                    >
                      <span className="text-sm font-medium text-violet-900">
                        {rarity}
                      </span>

                      {price === "UNK" ? (
                        <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-600 text-xs font-bold">
                          UNK
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-yellow-100 text-amber-700 text-xs font-bold">
                          {price}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {card.note && (
                  <div className="mt-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 leading-relaxed">
                    {card.note}
                  </div>
                )}

              </div>
            </div>
          ))}
        </section>

        {/* FOOTER NOTE */}
        <section className="mt-8">
          <div className="max-w-3xl mx-auto bg-white/80 border border-violet-100 rounded-full shadow-md px-6 py-4 text-center">
            <p className="text-sm font-medium text-violet-700">
              Prices reflect consistent changes as sets get older
              and go out of print. Rarity worth may change as the
              Kayou community itself decides a certain rarity isn't
              sought after even despite its hit rate.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}