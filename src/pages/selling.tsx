import KeeganAvatar from "@/assets/avatars/keeganpfp2.webp";
import { useState } from "react";
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
      ["HIDDEN ZR", "$150"],
      ["SC", "$65"],
      ["HIDDEN SC", "$200"],
      ["CHILDHOOD ◇ZR", "UNKNOWN"],
      ["CRYSTAL ◇ZR", "UNKNOWN"],
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
      "These prices are due to the extremely high hit rates in this box set. All rarities are evenly ditributed in Fun Moments 3 and easily attainable.",
  },
];

  const [selectedFilter, setSelectedFilter] = useState("All Sets");

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
    <div className="min-h-screen bg-[#171717] pb-24 font-['Oxanium'] text-white sm:pb-10">

      {/* TECH GRID */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.018]"
        style={{
          backgroundImage:
            "linear-gradient(#FFD400 1px, transparent 1px), linear-gradient(90deg, #FFD400 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* AMBIENT GOLD */}
      <div className="pointer-events-none fixed left-1/2 top-0 h-[420px] w-[700px] -translate-x-1/2 bg-[#FFD400]/[0.025] blur-[120px]" />

      <main className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* ========================================================= */}
        {/* SYSTEM HEADER */}
        {/* ========================================================= */}

        <header className="relative mb-8 overflow-hidden border border-white/[0.08] bg-[#111111]">

          <div className="absolute left-0 top-0 h-7 w-7 border-l border-t border-[#FFD400]/60" />
          <div className="absolute right-0 top-0 h-7 w-7 border-r border-t border-[#FFD400]/30" />
          <div className="absolute bottom-0 left-0 h-5 w-5 border-b border-l border-[#FFD400]/20" />
          <div className="absolute bottom-0 right-0 h-5 w-5 border-b border-r border-[#FFD400]/35" />

          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5 sm:px-6">

            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-[#FFD400] shadow-[0_0_8px_rgba(255,212,0,.7)]" />

              <span className="font-mono text-[6px] font-bold uppercase tracking-[0.24em] text-white/25">
                MLPEKAYOU // MARKET INTELLIGENCE
              </span>
            </div>

            <span className="font-mono text-[6px] font-bold uppercase tracking-[0.2em] text-[#FFD400]/45">
              COMMUNITY DATA
            </span>

          </div>

          <div className="px-5 py-8 sm:px-8 sm:py-10">

            <div className="mb-3 flex items-center gap-3">
              <span className="font-mono text-[7px] font-bold uppercase tracking-[0.28em] text-[#FFD400]/60">
                MODULE 07
              </span>

              <div className="h-px w-12 bg-[#FFD400]/25" />

              <span className="font-mono text-[7px] uppercase tracking-[0.18em] text-white/20">
                MARKET VALUE DATABASE
              </span>
            </div>

            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">

              <div>
                <h1 className="text-4xl font-black uppercase leading-none tracking-[0.08em] text-white sm:text-6xl">
                  Guide to Selling
                </h1>

                <p className="mt-3 max-w-xl font-mono text-[7px] uppercase leading-[1.8] tracking-[0.14em] text-white/25 sm:text-[8px]">
                  Community-maintained collector pricing intelligence.
                  Values are estimates based on rarity, availability,
                  pull rates, and collector demand.
                </p>
              </div>
            </div>
          </div>
        </header>


        {/* ========================================================= */}
        {/* INTRODUCTION */}
        {/* ========================================================= */}

        <section className="relative mb-10 overflow-hidden border border-white/[0.08] bg-[#111111]">

          <div className="border-b border-white/[0.06] px-5 py-2.5 sm:px-6">
            <div className="flex items-center gap-2">
              <span className="h-1 w-1 bg-[#FFD400]" />

              <span className="font-mono text-[6px] font-bold uppercase tracking-[0.22em] text-white/25">
                SYSTEM NOTES // PRICE METHODOLOGY
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-7">

            <div className="mb-6 flex items-center gap-4">

              <div className="relative shrink-0">
                <img
                  src={KeeganAvatar}
                  alt="Pricing Guide"
                  className="h-12 w-12 rounded-sm border border-[#FFD400]/35 object-cover"
                />

                <span className="absolute -bottom-1 -right-1 h-2 w-2 bg-[#FFD400] shadow-[0_0_7px_rgba(255,212,0,.7)]" />
              </div>

              <div>
                <div className="font-mono text-[6px] uppercase tracking-[0.2em] text-[#FFD400]/50">
                  COMMUNITY PRICING GUIDE
                </div>

                <h2 className="mt-1 text-xl font-black uppercase tracking-[0.04em] text-white sm:text-2xl">
                  How Prices Are Determined
                </h2>
              </div>

            </div>

            <div className="grid gap-4 lg:grid-cols-2">

              <div className="border border-white/[0.06] bg-[#171717] p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-1 w-1 bg-[#FFD400]" />

                  <span className="font-mono text-[6px] font-bold uppercase tracking-[0.18em] text-[#FFD400]/55">
                    EVALUATION
                  </span>
                </div>

                <p className="text-sm leading-7 text-white/55">
                  Prices are established by an experienced council of
                  collectors who were collecting long before the arrival
                  of North American Kayou products. Values are based on
                  rarity, pull rates, product availability, and long-term
                  collector demand rather than inflated resale listings
                  or speculative pricing. The goal is to keep this hobby
                  accessible for everyone of all financial backgrounds.
                </p>
              </div>

              <div className="border border-white/[0.06] bg-[#171717] p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-1 w-1 bg-[#FFD400]" />

                  <span className="font-mono text-[6px] font-bold uppercase tracking-[0.18em] text-[#FFD400]/55">
                    What about TCG?
                  </span>
                </div>

                <p className="text-sm leading-7 text-white/55">
                 The My Little Pony Kayou TCG market is much more unpredicatable
                 than the CCG market. Cards may be lower in rarity and easier to 
                 pull yet because of their favorable playability, they may be more
                 valuable than all other cards in that rarity. For TCG pricing guesstimates and
                 information, please ask in the TCG chat in the Discord server, where many
                 experts reside.
                </p>
              </div>

            </div>

          </div>
        </section>


        {/* ========================================================= */}
        {/* CARDS WITH VALUE */}
        {/* ========================================================= */}

        <section className="mb-10">

          <div className="mb-4 flex items-end justify-between">

            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1 w-1 bg-[#FFD400]" />

                <span className="font-mono text-[6px] font-bold uppercase tracking-[0.24em] text-[#FFD400]/55">
                  MARKET SIGNAL
                </span>
              </div>

              <h2 className="text-2xl font-black uppercase tracking-[0.04em] text-white sm:text-3xl">
                Cards With Value
              </h2>
            </div>

            <span className="hidden font-mono text-[6px] uppercase tracking-[0.18em] text-white/15 sm:block">
              HIGHER-TIER RARITIES
            </span>

          </div>

          <div className="border border-white/[0.08] bg-[#111111]">

            {higherTier.map(([name, rarities], index) => (
              <div
                key={name}
                className={`group flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-[#161616] sm:flex-row sm:items-center sm:justify-between ${
                  index !== higherTier.length - 1
                    ? "border-b border-white/[0.05]"
                    : ""
                }`}
              >

                <div className="flex items-center gap-4">

                  <span className="font-mono text-[7px] text-white/10">
                    {(index + 1).toString().padStart(2, "0")}
                  </span>

                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.04em] text-white/80">
                      {name}
                    </h3>

                    <p className="mt-1 font-mono text-[7px] tracking-[0.1em] text-white/25">
                      {rarities}
                    </p>
                  </div>

                </div>

                <span className="w-fit border border-[#FFD400]/20 bg-[#FFD400]/[0.05] px-3 py-1.5 font-mono text-[6px] font-bold uppercase tracking-[0.18em] text-[#FFD400]/70">
                  HIGH VALUE
                </span>

              </div>
            ))}

          </div>
        </section>


        {/* ========================================================= */}
        {/* FILTER */}
        {/* ========================================================= */}

        <section className="mb-7">

          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1 w-1 bg-[#FFD400]" />

                <span className="font-mono text-[6px] font-bold uppercase tracking-[0.24em] text-[#FFD400]/55">
                  DATABASE QUERY
                </span>
              </div>

              <h2 className="text-2xl font-black uppercase tracking-[0.04em] text-white">
                Filter By Set
              </h2>
            </div>

            <div className="border border-white/[0.06] bg-[#111111] px-3 py-2">
              <span className="font-mono text-[6px] uppercase tracking-[0.18em] text-white/20">
                ACTIVE //
              </span>

              <span className="ml-2 font-mono text-[6px] font-bold uppercase tracking-[0.14em] text-[#FFD400]/65">
                {selectedFilter}
              </span>
            </div>

          </div>

          <div className="flex flex-wrap gap-1.5">

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
                className={`
                  border
                  px-4
                  py-2.5
                  font-mono
                  text-[7px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  transition-all
                  duration-200
                  ${
                    selectedFilter === filter
                      ? "border-[#FFD400] bg-[#FFD400] text-[#171717] shadow-[0_0_12px_rgba(255,212,0,.15)]"
                      : "border-white/[0.08] bg-[#111111] text-white/35 hover:border-[#FFD400]/35 hover:bg-[#171717] hover:text-white/75"
                  }
                `}
              >
                {filter}
              </button>
            ))}

          </div>
        </section>


        {/* ========================================================= */}
        {/* PRICING GRID */}
        {/* ========================================================= */}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

          {filteredPricingCards.map((card, index) => (

            <Link
              key={card.title}
              to={card.to}
              className="
                group
                relative
                overflow-hidden
                border
                border-white/[0.08]
                bg-[#111111]
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:border-[#FFD400]/35
                hover:shadow-[0_10px_30px_rgba(0,0,0,.3)]
              "
            >

              {/* TECHNICAL CORNERS */}
              <div className="pointer-events-none absolute left-0 top-0 z-20 h-4 w-4 border-l border-t border-[#FFD400]/45" />
              <div className="pointer-events-none absolute right-0 top-0 z-20 h-4 w-4 border-r border-t border-[#FFD400]/20" />

              {/* HEADER IMAGE */}
              <div
                className="relative h-28 overflow-hidden"
                style={{
                  backgroundImage: `url(${setHeaderImages[card.title] || "/thumbnails/moon-fe.webp"})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >

                <div className="absolute inset-0 bg-[#080808]/55" />

                <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/80 via-transparent to-[#080808]/55" />

                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#FFD400]/50 to-transparent" />

                <div className="absolute left-4 top-3 flex items-center gap-2">

                  <span className="h-px w-5 bg-[#FFD400]/25" />

                  <span className="font-mono text-[6px] uppercase tracking-[0.14em] text-white/25">
                    VALUE DATA
                  </span>

                </div>

                <div className="absolute bottom-4 left-4 right-4">

                  <h3 className="text-xl font-black uppercase leading-none tracking-[0.035em] text-white drop-shadow-lg">
                    {card.title}
                  </h3>

                  <p className="mt-1.5 font-mono text-[6px] font-bold uppercase tracking-[0.2em] text-[#FFD400]/70">
                    {card.subtitle}
                  </p>

                </div>

              </div>


              {/* PRICE DATA */}
              <div className="p-4">

                <div className="mb-3 flex items-center justify-between border-b border-white/[0.05] pb-2">

                  <span className="font-mono text-[6px] font-bold uppercase tracking-[0.18em] text-white/20">
                    RARITY
                  </span>

                  <span className="font-mono text-[6px] font-bold uppercase tracking-[0.18em] text-[#FFD400]/45">
                    EST. VALUE
                  </span>

                </div>

                <div>

                  {card.rows.map(([rarity, price], rowIndex) => (

                    <div
                      key={`${card.title}-${rarity}`}
                      className={`
                        flex
                        items-center
                        justify-between
                        py-2.5
                        ${
                          rowIndex !== card.rows.length - 1
                            ? "border-b border-white/[0.04]"
                            : ""
                        }
                      `}
                    >

                      <div className="flex items-center gap-2">

                        <span className="h-1 w-1 bg-white/15 transition-colors group-hover:bg-[#FFD400]/45" />

                        <span className="font-['Oxanium'] text-[10px] font-bold uppercase tracking-[0.04em] text-white/65">
                          {rarity}
                        </span>

                      </div>

                      {price === "UNK" || price === "UNKNOWN" ? (
                        <span className="border border-white/[0.08] bg-white/[0.025] px-2.5 py-1 font-mono text-[7px] font-bold uppercase tracking-[0.1em] text-white/25">
                          UNKNOWN
                        </span>
                      ) : (
                        <span className="border border-[#FFD400]/25 bg-[#FFD400]/[0.06] px-2.5 py-1 font-['Oxanium'] text-[10px] font-black tracking-[0.04em] text-[#FFD400]">
                          {price}
                        </span>
                      )}

                    </div>

                  ))}

                </div>

                {card.note && (
                  <div className="mt-4 border-l border-[#FFD400]/35 bg-[#FFD400]/[0.025] px-3 py-2.5">

                    <div className="mb-1 font-mono text-[6px] font-bold uppercase tracking-[0.16em] text-[#FFD400]/55">
                      ANALYST NOTE
                    </div>

                    <p className="font-mono text-[6px] leading-[1.7] tracking-[0.04em] text-white/25">
                      {card.note}
                    </p>

                  </div>
                )}

              </div>


              {/* STATUS RAIL */}
              <div className="flex items-center justify-between border-t border-white/[0.05] bg-[#0d0d0d] px-4 py-2">

                <span className="font-mono text-[5px] uppercase tracking-[0.18em] text-white/15">
                  FAIR ESTIMATES // {String(index + 1).padStart(2, "0")}
                </span>

                <span className="flex items-center gap-1.5 font-mono text-[5px] font-bold uppercase tracking-[0.16em] text-[#FFD400]/40">
                  <span className="h-1 w-1 bg-[#FFD400]/70" />
                  ACTIVE
                </span>

              </div>

            </Link>

          ))}

        </section>


        {/* ========================================================= */}
        {/* DISCLAIMER */}
        {/* ========================================================= */}

        <section className="mt-10 border border-white/[0.07] bg-[#111111]">

          <div className="border-b border-white/[0.05] px-5 py-2.5">

            <div className="flex items-center gap-2">
              <span className="h-1 w-1 bg-[#FFD400]" />

              <span className="font-mono text-[6px] font-bold uppercase tracking-[0.22em] text-white/20">
                DATA NOTICE
              </span>
            </div>

          </div>

          <div className="p-5">

            <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.06em] text-white/60">
              Pricing Disclaimer
            </h3>

            <p className="max-w-5xl font-mono text-[7px] leading-[1.9] tracking-[0.06em] text-white/25 sm:text-[8px]">
              Prices reflect changes as products age and become more difficult
              to obtain. Community demand also influences value, meaning rarities
              with lower pull rates are not always the most desirable. Trading
              Card Game prices fluctuate independently and should be referenced
              using recently completed eBay sales.
            </p>

          </div>

        </section>

      </main>
    </div>
  );
}