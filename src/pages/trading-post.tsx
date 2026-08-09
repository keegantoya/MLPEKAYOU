import { useState } from "react";
import { Link } from "react-router-dom";

const setButtons = [
  {
    title: "Eternal Moon I",
    subtitle: "186 Cards",
    group: "Moon",
    to: "/trading-post/1",
    image: "/thumbnails/moononesetimage.webp",
  },
  {
    title: "Eternal Moon II",
    subtitle: "189 Cards",
    group: "Moon",
    to: "/trading-post/2",
    image: "/thumbnails/moontwosetimage.webp",
  },
  {
    title: "Eternal Moon III",
    subtitle: "290 Cards",
    group: "Moon",
    to: "/trading-post/3",
    image: "/thumbnails/moonthreesetimage.webp",
  },
  {
    title: "Star I",
    subtitle: "105 Cards",
    group: "Star",
    to: "/trading-post/4",
    image: "/thumbnails/staronesetimage.webp",
  },
  {
    title: "Rainbow I",
    subtitle: "146 Cards",
    group: "Rainbow",
    to: "/trading-post/5",
    image: "/thumbnails/rainbowonesetimage.webp",
  },
  {
    title: "Rainbow II",
    subtitle: "170 Cards",
    group: "Rainbow",
    to: "/trading-post/6",
    image: "/thumbnails/rainbowtwosetimage.webp",
  },
  {
    title: "Fun Moments I",
    subtitle: "127 Cards",
    group: "Fun Moments",
    to: "/trading-post/7",
    image: "/thumbnails/funonesetimage.webp",
  },
  {
    title: "Fun Moments II",
    subtitle: "136 Cards",
    group: "Fun Moments",
    to: "/trading-post/8",
    image: "/thumbnails/funtwosetimage.webp",
  },
  {
    title: "Fun Moments III",
    subtitle: "188 Cards",
    group: "Fun Moments",
    to: "/trading-post/11",
    image: "/thumbnails/funthreesetimage.webp",
  },
  {
    title: "Promo Cards",
    subtitle: "5 Cards",
    group: "Promos",
    to: "/trading-post/9",
    image: "/thumbnails/promossetimage.webp",
  },
  {
    title: "Friendships Begin",
    subtitle: "244 Cards",
    group: "TCG",
    to: "/trading-post/friendshipsbegin",
    image: "/thumbnails/friendshipsbeginsetimage.webp",
  },
  {
    title: "Fantasy Wonderland",
    subtitle: "201 Cards",
    group: "TCG",
    to: "/trading-post/FW",
    image: "/thumbnails/fantasysetimage.webp",
  },
  {
    title: "Discord",
    subtitle: "191 Cards",
    group: "TCG",
    to: "/trading-post/12",
    image: "/thumbnails/discordsetimage.webp",
  },
  {
    title: "TCG Promos",
    subtitle: "18 Cards",
    group: "Promos",
    to: "/trading-post/tcgpromos",
    image: "/thumbnails/tcgpromossetimage.webp",
  },
];

const groups = [
  "All",
  "Moon",
  "Star",
  "Rainbow",
  "Fun Moments",
  "TCG",
  "Promos",
];

export default function TradingPost() {
  const [activeGroup, setActiveGroup] = useState("All");

  const visibleSets =
    activeGroup === "All"
      ? setButtons
      : setButtons.filter(
          (set) => set.group === activeGroup
        );

  return (
    <div className="min-h-screen bg-[#171717] font-['Oxanium'] text-white">
      {/* BACKGROUND GRID */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.018]"
        style={{
          backgroundImage:
            "linear-gradient(#FFD400 1px, transparent 1px), linear-gradient(90deg, #FFD400 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* SOFT AMBIENT LIGHT */}
      <div className="pointer-events-none fixed left-1/2 top-[-180px] h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-[#FFD400]/[0.025] blur-[120px]" />

      <main className="relative mx-auto max-w-7xl px-4 pb-12 pt-5 sm:px-6 lg:px-8">
        {/* HEADER */}
        <header className="mb-6">
          <div className="flex items-center justify-between gap-4 border-b border-white/[0.07] pb-4">
            <div className="flex items-center gap-3">
              {/* System indicator */}
              <div className="relative flex h-8 w-8 items-center justify-center border border-[#FFD400]/35 bg-[#121212]">
                <div className="h-2 w-2 bg-[#FFD400] shadow-[0_0_10px_rgba(255,212,0,.65)]" />

                <div className="absolute left-0 top-0 h-2 w-2 border-l border-t border-[#FFD400]" />
                <div className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-[#FFD400]/50" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[7px] font-bold uppercase tracking-[0.25em] text-[#FFD400]/65">
                    KAYOU MARKET NETWORK
                  </span>

                  <span className="h-1 w-1 rounded-full bg-[#FFD400]/60" />
                </div>

                <h1 className="mt-0.5 text-2xl font-black uppercase tracking-[0.06em] text-white sm:text-3xl">
                  Trading Post
                </h1>
              </div>
            </div>

            <div className="hidden text-right sm:block">
              <div className="font-mono text-[6px] uppercase tracking-[0.2em] text-white/20">
                COLLECTION INDEX
              </div>

              <div className="mt-1 font-mono text-[8px] font-bold tracking-[0.12em] text-[#FFD400]/60">
                {setButtons.length
                  .toString()
                  .padStart(2, "0")}{" "}
                SETS
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <p className="font-mono text-[7px] uppercase tracking-[0.16em] text-white/25 sm:text-[8px]">
              Select a collection to access its trading network
            </p>

            <span className="hidden h-px flex-1 bg-gradient-to-r from-[#FFD400]/20 to-transparent sm:ml-5 sm:block" />
          </div>
        </header>

        {/* CATEGORY FILTER */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex min-w-max items-center gap-1 border border-white/[0.06] bg-[#121212] p-1">
            {groups.map((group) => {
              const active = activeGroup === group;

              return (
                <button
                  key={group}
                  onClick={() => setActiveGroup(group)}
                  className={`
                    relative
                    px-3
                    py-2
                    font-mono
                    text-[7px]
                    font-bold
                    uppercase
                    tracking-[0.16em]
                    transition-all
                    duration-200
                    sm:px-4
                    ${
                      active
                        ? "bg-[#FFD400] text-[#111111] shadow-[0_0_12px_rgba(255,212,0,.12)]"
                        : "text-white/30 hover:bg-white/[0.04] hover:text-white/70"
                    }
                  `}
                >
                  {group}
                </button>
              );
            })}
          </div>
        </div>

        {/* SET GRID */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
          {visibleSets.map((set, index) => (
            <Link
              key={set.to}
              to={set.to}
              className="
                group
                relative
                overflow-hidden
                border
                border-white/[0.08]
                bg-[#121212]
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:border-[#FFD400]/45
                hover:shadow-[0_8px_28px_rgba(0,0,0,.28)]
              "
            >
              {/* IMAGE */}
              <div className="relative aspect-[16/10] overflow-hidden bg-[#0d0d0d]">
                <img
                  src={set.image}
                  alt={set.title}
                  className="
                    h-full
                    w-full
                    object-cover
                    transition-transform
                    duration-500
                    group-hover:scale-[1.045]
                  "
                />

                {/* Dark image gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-black/10" />

                {/* Hover gold wash */}
                <div className="absolute inset-0 bg-[#FFD400]/0 transition-colors duration-300 group-hover:bg-[#FFD400]/[0.035]" />

                {/* Technical corners */}
                <div className="absolute left-1.5 top-1.5 h-3.5 w-3.5 border-l border-t border-[#FFD400]/45 transition-colors duration-300 group-hover:border-[#FFD400]" />

                <div className="absolute right-1.5 top-1.5 h-3.5 w-3.5 border-r border-t border-[#FFD400]/25 transition-colors duration-300 group-hover:border-[#FFD400]/70" />

                {/* Set index */}
                <div className="absolute right-2 bottom-2 border border-white/10 bg-[#111111]/80 px-1.5 py-1 backdrop-blur-sm">
                  <span className="font-mono text-[6px] font-bold tracking-[0.12em] text-white/35">
                    {(index + 1)
                      .toString()
                      .padStart(2, "0")}
                  </span>
                </div>
              </div>

              {/* INFO */}
              <div className="relative px-3 py-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="h-1 w-1 shrink-0 bg-[#FFD400] opacity-70 transition-all duration-300 group-hover:opacity-100 group-hover:shadow-[0_0_6px_rgba(255,212,0,.7)]" />

                  <span className="truncate font-mono text-[6px] font-bold uppercase tracking-[0.16em] text-[#FFD400]/55">
                    {set.group}
                  </span>
                </div>

                <div className="mt-1 flex items-center justify-between gap-2">
                  <h2 className="truncate text-[11px] font-bold uppercase tracking-[0.025em] text-white/90 transition-colors duration-300 group-hover:text-[#FFD400] sm:text-xs">
                    {set.title}
                  </h2>

                  <span className="shrink-0 font-mono text-[10px] text-white/15 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-[#FFD400]">
                    →
                  </span>
                </div>

                <div className="mt-1.5 flex items-center justify-between">
                  <span className="font-mono text-[6px] uppercase tracking-[0.12em] text-white/20">
                    {set.subtitle}
                  </span>

                  <span className="font-mono text-[6px] uppercase tracking-[0.12em] text-white/15">
                    ACCESS
                  </span>
                </div>
              </div>

              {/* Bottom hover rail */}
              <div className="absolute bottom-0 left-1/2 h-px w-0 -translate-x-1/2 bg-[#FFD400] shadow-[0_0_8px_rgba(255,212,0,.5)] transition-all duration-300 group-hover:w-1/2" />
            </Link>
          ))}
        </div>

        {/* FOOTER STATUS */}
        <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-3">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FFD400] shadow-[0_0_7px_rgba(255,212,0,.5)]" />

            <span className="font-mono text-[6px] font-bold uppercase tracking-[0.2em] text-white/20">
              TRADING NETWORK ONLINE
            </span>
          </div>

          <span className="font-mono text-[6px] uppercase tracking-[0.16em] text-white/15">
            {visibleSets.length} COLLECTION
            {visibleSets.length === 1 ? "" : "S"}{" "}
            AVAILABLE
          </span>
        </div>
      </main>
    </div>
  );
}