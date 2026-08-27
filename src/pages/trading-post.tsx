import { useEffect, useState } from "react";
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
const [isLightMode, setIsLightMode] = useState(() => {
  if (typeof document === "undefined") return false;
  const root = document.documentElement;
  return (
    root.dataset.theme === "light" ||
    root.classList.contains("light") ||
    !root.classList.contains("dark")
  );
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
const visibleSets =
  activeGroup === "All"
    ? setButtons
    : setButtons.filter((set) => set.group === activeGroup);
  return (
    <div
      className={`min-h-screen font-['Oxanium'] transition-colors ${
        isLightMode
          ? "bg-[#f6f4ef] text-zinc-900"
          : "bg-[#0f1112] text-zinc-100"
      }`}
    >
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-56"
        style={{
          background: isLightMode
            ? "radial-gradient(circle at 50% 0%, rgba(255,213,74,.12), transparent 65%)"
            : "radial-gradient(circle at 50% 0%, rgba(255,213,74,.07), transparent 65%)",
        }}
      />
      <main className="relative mx-auto max-w-7xl px-4 pb-12 pt-5 sm:px-6 lg:px-8">
        <header
          className={`mb-5 overflow-hidden rounded-[26px] border ${
            isLightMode
              ? "border-black/10 bg-white"
              : "border-white/[0.08] bg-[#151718]"
          }`}
        >
          <div className="h-1 bg-gradient-to-r from-[#FFD54A] via-[#e6c445] to-transparent" />
          <div className="flex items-center justify-between gap-4 p-4 sm:p-5">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
                  isLightMode
                    ? "border-[#d6b43d]/30 bg-[#fff3b8]"
                    : "border-[#FFD54A]/20 bg-[#FFD54A]/10"
                }`}
              >
                <span className="h-2.5 w-2.5 rounded-full bg-[#d4aa16] shadow-[0_0_10px_rgba(212,170,22,.35)]" />
              </div>
              <div className="min-w-0">
                <div
                  className={`text-sm font-medium ${
                    isLightMode ? "text-[#806100]" : "text-[#E8CA55]"
                  }`}
                >
                  Trading Network
                </div>
                <h1 className="mt-0.5 text-2xl font-semibold sm:text-3xl">
                  Trading Post
                </h1>
                <p
                  className={`mt-1 text-sm ${
                    isLightMode ? "text-zinc-500" : "text-zinc-400"
                  }`}
                >
                  Choose a collection to browse cards for sale or trade.
                </p>
              </div>
            </div>
            <div
              className={`hidden rounded-full px-3 py-1.5 text-sm font-medium sm:block ${
                isLightMode
                  ? "bg-zinc-100 text-zinc-600"
                  : "bg-white/[0.05] text-zinc-300"
              }`}
            >
              {setButtons.length} sets
            </div>
          </div>
        </header>
        <div
          className={`mb-5 overflow-x-auto rounded-[22px] border p-1.5 ${
            isLightMode
              ? "border-black/10 bg-white"
              : "border-white/[0.08] bg-[#151718]"
          }`}
        >
          <div className="flex min-w-max items-center gap-1.5">
            {groups.map((group) => {
              const active = activeGroup === group;
              return (
                <button
                  key={group}
                  type="button"
                  onClick={() => setActiveGroup(group)}
                  className={`rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition ${
                    active
                      ? isLightMode
                        ? "bg-[#f5e6a0] text-[#654e00] shadow-sm"
                        : "bg-[#FFD54A] text-[#111]"
                      : isLightMode
                      ? "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                      : "text-zinc-400 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  {group}
                </button>
              );
            })}
          </div>
        </div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">
              {activeGroup === "All" ? "All Collections" : activeGroup}
            </h2>
            <p
              className={`mt-0.5 text-sm ${
                isLightMode ? "text-zinc-500" : "text-zinc-400"
              }`}
            >
              {visibleSets.length} {visibleSets.length === 1 ? "set" : "sets"} available
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {visibleSets.map((set) => (
            <Link
              key={set.to}
              to={set.to}
              className={`group relative overflow-hidden rounded-[22px] border transition hover:-translate-y-0.5 ${
                isLightMode
                  ? "border-black/10 bg-white hover:border-[#c9a62d]/45 hover:shadow-[0_12px_28px_rgba(73,55,0,.08)]"
                  : "border-white/[0.08] bg-[#151718] hover:border-[#FFD54A]/35 hover:shadow-[0_12px_28px_rgba(0,0,0,.28)]"
              }`}
            >
              <div className="absolute inset-x-0 top-0 z-20 h-1 bg-gradient-to-r from-[#FFD54A] via-[#e4c13f] to-transparent opacity-80" />
              <div
                className={`relative aspect-[16/10] overflow-hidden ${
                  isLightMode ? "bg-zinc-100" : "bg-[#0d0f10]"
                }`}
              >
                <img
                  src={set.image}
                  alt={set.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                />
                <div
                  className={`absolute inset-0 ${
                    isLightMode
                      ? "bg-gradient-to-t from-white/25 via-transparent to-transparent"
                      : "bg-gradient-to-t from-black/35 via-transparent to-black/5"
                  }`}
                />
                <span
                  className={`absolute bottom-2 left-2 rounded-full px-2.5 py-1 text-sm font-medium backdrop-blur-sm ${
                    isLightMode
                      ? "bg-white/90 text-[#735900]"
                      : "bg-[#111]/80 text-[#E8CA55]"
                  }`}
                >
                  {set.group}
                </span>
              </div>
              <div className="p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="min-w-0 text-sm font-semibold leading-snug sm:text-base">
                    {set.title}
                  </h3>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm transition group-hover:translate-x-0.5 ${
                      isLightMode
                        ? "bg-zinc-100 text-[#806100]"
                        : "bg-white/[0.05] text-[#E8CA55]"
                    }`}
                  >
                    →
                  </span>
                </div>
                <div
                  className={`mt-2 text-sm ${
                    isLightMode ? "text-zinc-500" : "text-zinc-400"
                  }`}
                >
                  {set.subtitle}
                </div>
                <div
                  className={`mt-3 h-px w-full ${
                    isLightMode ? "bg-black/[0.06]" : "bg-white/[0.06]"
                  }`}
                />
                <div
                  className={`mt-2.5 text-sm font-medium ${
                    isLightMode ? "text-[#806100]" : "text-[#E8CA55]"
                  }`}
                >
                  Browse trading post
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

