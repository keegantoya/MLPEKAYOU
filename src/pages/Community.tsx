import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getProfileAssets } from "./Everypony/profile-assets";
import elementOfMagic from "/website-assets/elementofmagic.webp";
import elementOfLoyalty from "/website-assets/elementofloyalty.webp";
import elementOfKindness from "/website-assets/elementofkindness.webp";
import elementOfGenerosity from "/website-assets/elementofgenerosity.webp";
import elementOfHonesty from "/website-assets/elementofhonesty.webp";
const sets = [
  { id: "1", name: "Eternal Moon First Edition", total: 186 },
  { id: "5", name: "Eternal Rainbow First Edition", total: 146 },
  { id: "7", name: "Fun Moments First Edition", total: 127 },
  { id: "2", name: "Eternal Moon Second Edition", total: 189 },
  { id: "8", name: "Fun Moments Second Edition", total: 136 },
  { id: "3", name: "Eternal Moon Third Edition", total: 290 },
  { id: "11", name: "Fun Moments Third Edition", total: 148 },
  { id: "4", name: "Star First Edition", total: 105 },
  { id: "6", name: "Eternal Rainbow Second Edition", total: 170 },
  {
    id: "friendshipsbegin",
    dbId: "SD",
    name: "Friendships Begin",
    total: 194,
  },
  {
    id: "fantasywonderland",
    dbId: "FW",
    name: "Fantasy Wonderland",
    total: 191,
    folder: "fantasywonderland",
    prefix: "BP01",
    rarities: {
      C: 48,
      U: 18,
      ER: 6,
      SR: 14,
      SPR: 28,
      GR: 12,
      CR: 12,
      RR: 6,
      PER: 12,
      PSPR: 11,
      PGR: 6,
      PCR: 12,
      PRR: 6,
    },
  },
  {
    id: "discord",
    dbId: "12",
    name: "Discord",
    total: 191,
  },
];
const manualFirstFinishers: Record<
  string,
  {
    id: string;
  }
> = {
  "1": {
    id: "94a1c998-d040-4dd2-b2fb-5f606287139d",
  },
  "2": {
    id: "94a1c998-d040-4dd2-b2fb-5f606287139d",
  },
  "3": {
    id: "2692c7a3-bce3-45b7-8636-5e18bf39edc3",
  },
  "5": {
    id: "17e57e39-bc0c-44e7-b373-ac34c6690185",
  },
  "6": {
    id: "2692c7a3-bce3-45b7-8636-5e18bf39edc3",
  },
  "7": {
    id: "94a1c998-d040-4dd2-b2fb-5f606287139d",
  },
  "8": {
    id: "2692c7a3-bce3-45b7-8636-5e18bf39edc3",
  },
  "11": {
    id: "2692c7a3-bce3-45b7-8636-5e18bf39edc3",
  },
  friendshipsbegin: {
    id: "2692c7a3-bce3-45b7-8636-5e18bf39edc3",
  },
  fantasywonderland: {
    id: "948dcf0c-0ec3-4123-8b8e-f23ad334fb30",
  },
};
type Category =
  | "star"
  | "ccg"
  | "rainbow"
  | "funmoments"
  | "tcg";
const Community = () => {
const navigate = useNavigate();
const [activeCategory, setActiveCategory] =
    useState<Category>("ccg");
const [firstFinishers, setFirstFinishers] =
    useState<any>({});
const [topCollector, setTopCollector] =
    useState<any>(null);
const [isLightMode, setIsLightMode] = useState(() => {
  if (typeof document === "undefined") return false;
  const root = document.documentElement;
  return root.dataset.theme === "light" || root.classList.contains("light");
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
  useEffect(() => {
async function loadProfiles() {
const ids = [
        ...new Set([
          ...Object.values(manualFirstFinishers).map(
            (x) => x.id
          ),
          "2692c7a3-bce3-45b7-8636-5e18bf39edc3",
        ]),
      ];
const { data } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", ids);
const profileMap = Object.fromEntries(
        (data ?? []).map((p) => [p.id, p])
      );
const finishers: any = {};
      for (const [setId, value] of Object.entries(
        manualFirstFinishers
      )) {
        finishers[setId] = profileMap[value.id];
      }
      setFirstFinishers(finishers);
      setTopCollector(
        profileMap[
          "2692c7a3-bce3-45b7-8636-5e18bf39edc3"
        ]
      );
    }
    loadProfiles();
  }, []);
const categoryConfig: Record<
    Category,
    {
      label: string;
      description: string;
      icon: string;
    }
  > = {
    star: {
      label: "STAR",
      description: "Star Edition",
      icon: elementOfMagic,
    },
    ccg: {
      label: "MOON",
      description: "Eternal Moon",
      icon: elementOfKindness,
    },
    rainbow: {
      label: "RAINBOW",
      description: "Eternal Rainbow",
      icon: elementOfLoyalty,
    },
    funmoments: {
      label: "FUN MOMENTS",
      description: "Fun Moments",
      icon: elementOfGenerosity,
    },
    tcg: {
      label: "TCG",
      description: "Trading Card Game",
      icon: elementOfHonesty,
    },
  };
const activeConfig = categoryConfig[activeCategory];
const visibleSets =
    activeCategory === "tcg"
      ? sets.filter((set) =>
          [
            "fantasywonderland",
            "discord",
            "friendshipsbegin",
          ].includes(set.id)
        )
      : sets.filter((set) => {
          if (activeCategory === "star") {
            return ["4"].includes(set.id);
          }
          if (activeCategory === "ccg") {
            return ["1", "2", "3"].includes(set.id);
          }
          if (activeCategory === "rainbow") {
            return ["5", "6"].includes(set.id);
          }
          if (activeCategory === "funmoments") {
            return ["7", "8", "11"].includes(set.id);
          }
          return false;
        });
const CategoryButton = ({ category }: { category: Category }) => {
  const config = categoryConfig[category];
  const active = activeCategory === category;
  return (
    <button
      type="button"
      onClick={() => setActiveCategory(category)}
      className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-[20px] border px-3 py-3 text-left transition ${
        active
          ? isLightMode
            ? "border-[#d6b43d]/60 bg-[#fff8d8] text-zinc-900"
            : "border-[#FFD54A]/45 bg-[#FFD54A]/10 text-white"
          : isLightMode
          ? "border-black/10 bg-white text-zinc-700 hover:bg-zinc-50"
          : "border-white/[0.08] bg-[#17191a] text-zinc-300 hover:bg-white/[0.05]"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
          active
            ? isLightMode
              ? "border-[#d6b43d]/35 bg-[#f5e8a8]"
              : "border-[#FFD54A]/20 bg-[#FFD54A]/12"
            : isLightMode
            ? "border-black/5 bg-zinc-100"
            : "border-white/[0.06] bg-white/[0.05]"
        }`}
      >
        <img src={config.icon} alt="" className="h-6 w-6 object-contain" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{config.label}</span>
        <span
          className={`mt-0.5 block text-sm ${
            isLightMode ? "text-zinc-500" : "text-zinc-400"
          }`}
        >
          {config.description}
        </span>
      </span>
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          active
            ? isLightMode
              ? "bg-[#f0df8c] text-[#725700]"
              : "bg-[#FFD54A]/12 text-[#FFE27A]"
            : isLightMode
            ? "bg-zinc-100 text-zinc-400"
            : "bg-white/[0.04] text-zinc-500"
        }`}
      >
        →
      </span>
    </button>
  );
};
const LeaderboardCard = ({ set }: { set: (typeof sets)[number] }) => {
  const winner = firstFinishers[String(set.id)];
  return (
    <button
      type="button"
      onClick={() => navigate(`/community/${set.id}`)}
      className={`group relative min-h-[190px] overflow-hidden rounded-[24px] border p-5 text-left transition hover:-translate-y-0.5 ${
        isLightMode
          ? "border-black/10 bg-white hover:border-[#c9a62d]/45 hover:shadow-lg"
          : "border-white/[0.08] bg-[#17191a] hover:border-[#FFD54A]/35 hover:bg-[#1b1d1e]"
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#FFD54A] via-[#E8C54A] to-transparent" />
      <div
        className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-3xl ${
          isLightMode ? "bg-[#FFD54A]/12" : "bg-[#FFD54A]/7"
        }`}
      />
      <div className="flex h-full gap-4">
        <div className="min-w-0 flex-1 pr-2">
          <div
            className={`text-sm font-medium ${
              isLightMode ? "text-[#806100]" : "text-[#E8CA55]"
            }`}
          >
            {activeCategory === "tcg" ? "Top Collector" : "Set Leaderboard"}
          </div>
          <h2 className="mt-3 text-lg font-semibold leading-snug">{set.name}</h2>
          <div
            className={`mt-3 text-sm leading-relaxed ${
              isLightMode ? "text-zinc-500" : "text-zinc-400"
            }`}
          >
          </div>
          <div
            className={`mt-5 inline-flex rounded-full px-3 py-1.5 text-sm ${
              isLightMode
                ? "bg-zinc-100 text-zinc-600"
                : "bg-white/[0.05] text-zinc-300"
            }`}
          >
            {set.total} cards
          </div>
          <span
            className={`ml-2 text-sm font-medium ${
              isLightMode ? "text-[#806100]" : "text-[#E8CA55]"
            }`}
          >
            Open →
          </span>
        </div>
        <div className="flex w-[92px] shrink-0 flex-col items-center justify-center text-center">
          {winner ? (
            <>
              <div className="relative">
                <img
                  src={getProfileAssets(winner).avatar}
                  alt={winner.username}
                  className="h-16 w-16 rounded-full border-2 border-[#D8B83F] object-cover"
                />
                <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#FFD54A] px-1 text-sm font-bold text-black">
                  ★
                </span>
              </div>
              <div className="mt-2 max-w-[92px] truncate text-sm font-semibold">
                {winner.username}
              </div>
              <div
                className={`mt-0.5 text-sm ${
                  isLightMode ? "text-zinc-500" : "text-zinc-400"
                }`}
              >
                First finisher
              </div>
            </>
          ) : (
            <>
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full border-2 text-base font-bold ${
                  isLightMode
                    ? "border-[#d5bb55] bg-[#fff8d8] text-[#806100]"
                    : "border-[#FFD54A]/35 bg-[#FFD54A]/10 text-[#FFE27A]"
                }`}
              >
                ★
              </div>
              <div className="mt-2 text-sm font-semibold">Unclaimed</div>
              <div
                className={`mt-0.5 text-sm ${
                  isLightMode ? "text-zinc-500" : "text-zinc-400"
                }`}
              >
                Be first
              </div>
            </>
          )}
        </div>
      </div>
    </button>
  );
};
const ChampionPanel = ({ mobile = false }: { mobile?: boolean }) => {
  const assets = getProfileAssets(topCollector);
  return (
    <div
      className={`relative overflow-hidden rounded-[26px] border ${
        mobile ? "w-full" : "w-[280px]"
      } ${
        isLightMode
          ? "border-[#d6b43d]/35 bg-[#fffdf5]"
          : "border-[#FFD54A]/20 bg-[#17191a]"
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-[#FFD54A]" />
      <div className="p-5">
        <div
          className={`text-sm font-medium ${
            isLightMode ? "text-[#806100]" : "text-[#E8CA55]"
          }`}
        >
          Community Champion
        </div>
        <h2 className="mt-1 text-xl font-semibold">Top Mastersetter</h2>
        <div
          className={`mt-5 rounded-[20px] border p-4 ${
            isLightMode
              ? "border-black/5 bg-white/80"
              : "border-white/[0.07] bg-white/[0.03]"
          }`}
        >
          <div className="flex items-center gap-4">
          <img
            src={assets.avatar}
            alt="Top Collector Avatar"
            className="h-20 w-20 shrink-0 rounded-full border-2 border-[#D8B83F] object-cover"
          />
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="truncate text-base font-semibold">
                {topCollector?.username || "Loading..."}
              </span>
              {assets.verification && (
                <img
                  src={assets.verification.badge}
                  alt={assets.verification.label}
                  title={assets.verification.label}
                  className="h-5 w-5 shrink-0 object-contain"
                />
              )}
            </div>
            <div
              className={`mt-1 text-sm ${
                isLightMode ? "text-zinc-500" : "text-zinc-400"
              }`}
            >
              Verified Top Member
            </div>
          </div>
        </div>
        </div>
        <div
          className={`mt-5 rounded-2xl p-3 text-sm leading-relaxed ${
            isLightMode
              ? "bg-[#fff6cb] text-[#6f5900]"
              : "bg-[#FFD54A]/[0.08] text-[#F0D86F]"
          }`}
        >
          Mari is a top supporter of MLPEKayou and a pillar of the community. She rules both the
          TCG and CCG leaderboards and has been personally verified to be a North American-only
          collector.
        </div>
      </div>
    </div>
  );
};
return (
  <div
    className={`min-h-screen pb-24 transition-colors ${
      isLightMode
        ? "bg-[#f6f4ef] text-zinc-900"
        : "bg-[#0d0f10] text-zinc-100"
    }`}
  >
    <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mb-4 xl:hidden">
        <ChampionPanel mobile />
      </div>
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[250px_minmax(0,1fr)_280px]">
        <aside className="xl:sticky xl:top-5">
          <div
            className={`rounded-[26px] border p-3 ${
              isLightMode
                ? "border-black/10 bg-white"
                : "border-white/[0.08] bg-[#131516]"
            }`}
          >
            <div className="px-2 pb-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Categories</h2>
                <span
                  className={`rounded-full px-2.5 py-1 text-sm ${
                    isLightMode ? "bg-zinc-100 text-zinc-500" : "bg-white/[0.05] text-zinc-400"
                  }`}
                >
                  5
                </span>
              </div>
              <p
                className={`mt-1 text-sm ${
                  isLightMode ? "text-zinc-500" : "text-zinc-400"
                }`}
              >
                Browse set leaderboards.
              </p>
            </div>
            <div className="space-y-2">
              <CategoryButton category="star" />
              <CategoryButton category="ccg" />
              <CategoryButton category="rainbow" />
              <CategoryButton category="funmoments" />
              <CategoryButton category="tcg" />
            </div>
            <div
              className={`mt-3 rounded-2xl border p-3 text-sm leading-relaxed ${
                isLightMode
                  ? "border-black/5 bg-[#faf8f1] text-zinc-600"
                  : "border-white/[0.06] bg-white/[0.04] text-zinc-400"
              }`}
            >
              <span className={isLightMode ? "font-medium text-[#806100]" : "font-medium text-[#E8CA55]"}>
                Verification required.
              </span>{" "}
              Discord verification is needed for leaderboard placement and first-finisher claims.
            </div>
          </div>
        </aside>
        <main className="min-w-0">
          <section
            className={`relative mb-4 flex items-center justify-between gap-4 overflow-hidden rounded-[24px] border p-4 ${
              isLightMode
                ? "border-black/10 bg-white"
                : "border-white/[0.08] bg-[#131516]"
            }`}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#FFD54A] via-[#E8C54A] to-transparent" />
            <div className="relative flex min-w-0 items-center gap-3">
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                  isLightMode ? "bg-[#fff3b8]" : "bg-[#FFD54A]/10"
                }`}
              >
                <img
                  src={activeConfig.icon}
                  alt=""
                  className="h-7 w-7 object-contain"
                />
              </span>
              <div className="min-w-0">
                <div className={isLightMode ? "text-sm font-medium text-[#806100]" : "text-sm font-medium text-[#E8CA55]"}>
                  Active Category
                </div>
                <h1 className="mt-0.5 text-xl font-semibold">{activeConfig.label}</h1>
                <div
                  className={`mt-0.5 text-sm ${
                    isLightMode ? "text-zinc-500" : "text-zinc-400"
                  }`}
                >
                  {activeConfig.description}
                </div>
              </div>
            </div>
            <div
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ${
                isLightMode
                  ? "bg-zinc-100 text-zinc-600"
                  : "bg-white/[0.05] text-zinc-300"
              }`}
            >
              {visibleSets.length} {visibleSets.length === 1 ? "set" : "sets"}
            </div>
          </section>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 2xl:grid-cols-3">
            {visibleSets.map((set) => (
              <LeaderboardCard key={set.id} set={set} />
            ))}
          </div>
        </main>
        <aside className="hidden xl:block xl:sticky xl:top-5">
          <ChampionPanel />
        </aside>
      </div>
    </div>
  </div>
);
};
export default Community;
