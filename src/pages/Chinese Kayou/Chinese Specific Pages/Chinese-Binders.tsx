import CardImage from "@/components/CardImage";
import { ChevronLeft, ChevronRight, GripVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getProfileAssets } from "@/pages/Everypony/profile-assets";
import { chineseSets, chineseFamilies, chineseRarityLabel, isWideChineseCard, type ChineseISOCard } from "../Chinese ISO/catalog/catalog";
import { isChineseOwned } from "../Chinese ISO/data/model";
import ChineseISOImage from "../Chinese ISO/components/card-image";
const sets = chineseSets;
const binders = ["All Cards", ...chineseFamilies.map(family => family.name)];
const binderSets: Record<string, { id: string; label: string }[]> = {
  "All Cards": chineseSets.map(set => ({ id: set.id, label: set.name })),
  ...Object.fromEntries(chineseFamilies.map(family => [family.name, chineseSets.filter(set => set.family === family.id).map(set => ({ id: set.id, label: set.name }))])),
};
type BinderCard = ChineseISOCard & { progressKey: string };
type BinderSlot = BinderCard | { continuation: true } | null;
const isBinderCard = (slot: BinderSlot | undefined): slot is BinderCard => !!slot && "identity" in slot;
export default function ChineseBinders() {
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
          !root.classList.contains("dark"),
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
  const [selectedBinder, setSelectedBinder] = useState("Moon");
  const [selectedSetId, setSelectedSetId] = useState(chineseSets[0]?.id ?? "");
  const [progressMap, setProgressMap] = useState<Record<string, any>>({});
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [viewingProfile, setViewingProfile] = useState<any>(null);
  const [viewingUsername, setViewingUsername] = useState("My Collection");
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const [spread, setSpread] = useState(1);
  const [layout, setLayout] = useState<"3x3" | "4x3" | "4x4" | "2x2" | "6x6">(
    "3x3",
  );
    const [showCustomization, setShowCustomization] = useState(false);
  const [previewLayout, setPreviewLayout] = useState<
    "3x3" | "4x3" | "4x4" | "2x2" | "6x6"
  >("3x3");
  const [startSlot, setStartSlot] = useState(0);
  const [rarityOrder, setRarityOrder] = useState<string[]>([]);
  const [rarityDrag, setRarityDrag] = useState<{
    rarity: string;
    x: number;
    y: number;
    width: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const draggedRarity = useRef<string | null>(null);
  const lastRarityTarget = useRef<string | null>(null);
  const touchStartX = useRef(0);
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches);
  const [binderLoading, setBinderLoading] = useState(true);
  const [binderError, setBinderError] = useState("");
  const [publicBlocked, setPublicBlocked] = useState(false);
  const [authVersion, setAuthVersion] = useState(0);
  const searchRequest = useRef(0);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(media.matches);
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(event => { if (event !== "INITIAL_SESSION" && event !== "TOKEN_REFRESHED") { setProgressMap({}); setViewingProfile(null); setSearchResults([]); searchRequest.current++; setBinderLoading(true); setAuthVersion(value => value + 1); } });
    return () => subscription.unsubscribe();
  }, []);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const [hiddenCCGSets, setHiddenCCGSets] = useState<string[]>([]);
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setProgressMap({});
      setHiddenCCGSets([]);
      setBinderLoading(true);
      setBinderError("");
      setPublicBlocked(false);
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (cancelled) return;
        if (authError || !user) throw new Error("Log in to view Chinese binders.");
        const targetUserId = viewingUserId ?? user.id;
        const { data: profile, error: profileError } = await supabase.from("profiles").select("id, username, avatar_url, chinese_cards_enabled, chinese_iso_hidden_sets, chinese_hide_iso, hide_iso").eq("id", targetUserId).single();
        if (cancelled) return;
        if (profileError || !profile) throw new Error("This collector's profile could not be loaded.");
        setViewingProfile(profile);
        setViewingUsername(profile.username || "My Collection");
        setHiddenCCGSets(Array.isArray(profile.chinese_iso_hidden_sets) ? profile.chinese_iso_hidden_sets : []);
        if (targetUserId !== user.id && (!profile.chinese_cards_enabled || profile.chinese_hide_iso || profile.hide_iso)) { setPublicBlocked(true); return; }
        const map: Record<string, any> = {};
        for (let from = 0; ; from += 500) {
          const { data: progress, error } = await supabase.from("collection_progress_raw").select("set_id, progress").eq("user_id", targetUserId).like("set_id", "cn-%").order("set_id").range(from, from + 499);
          if (cancelled) return;
          if (error) throw new Error("This Chinese collection could not be loaded.");
          for (const row of progress ?? []) map[row.set_id] = row.progress ?? {};
          if (!progress || progress.length < 500) break;
        }
        if (!cancelled) setProgressMap(map);
      } catch (cause) {
        if (!cancelled) setBinderError(cause instanceof Error ? cause.message : "The binder could not be loaded.");
      } finally {
        if (!cancelled) setBinderLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [viewingUserId, authVersion]);
  const defaultCCGOrder = chineseSets.map(set => set.id);
  const visibleCCGOrder = defaultCCGOrder.filter(id => !hiddenCCGSets.includes(id));
  const activeSetIds = selectedBinder === "All Cards" ? visibleCCGOrder : [selectedSetId];
  const rarityResetKey = selectedBinder === "All Cards" ? "All Cards" : selectedSetId;
  useEffect(() => { setRarityOrder([]); setSpread(1); }, [rarityResetKey, viewingUserId]);
  const selectedSet = sets.find(set => set.id === activeSetIds[0]) ?? sets[0];
  let cards: BinderCard[] = activeSetIds.flatMap(setId => {
    const set = sets.find(set => set.id === setId);
    return set ? set.cards.map(card => ({ ...card, setId: set.id, setName: set.name, family: set.family, identity: `${set.id}:${card.key}`, progressKey: card.key })) : [];
  });
  const defaultRarityOrder = Array.from(
    new Set(cards.map((card) => String(card.rarity)).filter(Boolean)),
  );
  const activeRarityOrder = [
    ...rarityOrder.filter((rarity) => defaultRarityOrder.includes(rarity)),
    ...defaultRarityOrder.filter((rarity) => !rarityOrder.includes(rarity)),
  ];
  const rarityRank = new Map(
    activeRarityOrder.map((rarity, index) => [rarity, index]),
  );
  cards = cards
    .map((card, originalIndex) => ({ card, originalIndex }))
    .sort((a, b) => {
      if (selectedBinder === "All Cards") {
        const setDifference =
          visibleCCGOrder.indexOf(a.card.setId) -
          visibleCCGOrder.indexOf(b.card.setId);
        if (setDifference !== 0) return setDifference;
      }
      const rarityDifference =
        (rarityRank.get(a.card.rarity) ?? Number.MAX_SAFE_INTEGER) -
        (rarityRank.get(b.card.rarity) ?? Number.MAX_SAFE_INTEGER);
      return rarityDifference || a.originalIndex - b.originalIndex;
    })
    .map(({ card }) => card);
  const moveRarity = (movingRarity: string, targetRarity: string) => {
    if (movingRarity === targetRarity) return;
    setRarityOrder((currentOrder) => {
      const nextOrder = currentOrder.length
        ? [...currentOrder]
        : [...defaultRarityOrder];
      const fromIndex = nextOrder.indexOf(movingRarity);
      const toIndex = nextOrder.indexOf(targetRarity);
      if (fromIndex < 0 || toIndex < 0) return nextOrder;
      nextOrder.splice(fromIndex, 1);
      nextOrder.splice(toIndex, 0, movingRarity);
      return nextOrder;
    });
    setStartSlot(0);
    setSpread(1);
  };
  const handleRarityPointerMove = (clientX: number, clientY: number) => {
    const target = document
      .elementFromPoint(clientX, clientY)
      ?.closest<HTMLElement>("[data-rarity]");
    const targetRarity = target?.dataset.rarity;
    if (
      draggedRarity.current &&
      targetRarity &&
      targetRarity !== lastRarityTarget.current
    ) {
      lastRarityTarget.current = targetRarity;
      moveRarity(draggedRarity.current, targetRarity);
    }
  };
    const layoutMap = {
    "2x2": { cols: 2, rows: 2, width: 240 },
    "3x3": { cols: 3, rows: 3, width: 360 },
    "4x3": { cols: 4, rows: 3, width: 480 },
    "4x4": { cols: 4, rows: 4, width: 480 },
    "6x6": { cols: 6, rows: 6, width: 960 },
  };
  const { cols, rows, width } = layoutMap[layout];
  const slotsPerPage = cols * rows;
  const binderSlots: BinderSlot[] = Array.from({ length: startSlot }, (): BinderSlot => null);
  for (const card of cards) {
    const wide = isWideChineseCard(card);
    if (wide && binderSlots.length % cols === cols - 1) binderSlots.push(null);
    binderSlots.push(card);
    if (wide) binderSlots.push({ continuation: true });
  }
  const totalSleeves = binderSlots.length;
  const totalPages = Math.ceil(totalSleeves / slotsPerPage);
  const totalSpreads = Math.max(1, Math.ceil(totalPages / 2));
  useEffect(() => { setSpread(value => Math.max(1, Math.min(totalSpreads, value))); }, [totalSpreads]);
  const getCCGSpreadForSet = (setId: string) => {
    const index = binderSlots.findIndex(slot => slot && !("continuation" in slot) && slot.setId === setId);
    return index < 0 ? 1 : Math.floor(index / (slotsPerPage * 2)) + 1;
  };
  const getCurrentCCGSet = () => {
    if (selectedBinder !== "All Cards") return selectedSetId;
    const first = (spread - 1) * slotsPerPage * 2;
    const visible = binderSlots.slice(first, first + slotsPerPage * 2).find((slot): slot is BinderCard => !!slot && !("continuation" in slot));
    return visible?.setId ?? visibleCCGOrder[0] ?? selectedSetId;
  };
  const currentSidebarSet = getCurrentCCGSet();
  const hidden = selectedBinder === "All Cards" ? visibleCCGOrder.length === 0 : hiddenCCGSets.includes(selectedSetId);
  const showClosedBinder = hidden || binderLoading || !!binderError || publicBlocked;
  const renderPage = (physicalPageStart: number) => Array.from({ length: slotsPerPage }).map((_, slot) => {
    const globalSlot = physicalPageStart + slot;
    const entry = binderSlots[globalSlot];
    if (entry && !isBinderCard(entry)) return null;
    const card = isBinderCard(entry) ? entry : null;
    const wide = !!card && isWideChineseCard(card);
    const owned = !!card && isChineseOwned(progressMap[card.setId]?.[card.progressKey]);
    if (!card || !owned) return <div key={globalSlot} title={card ? `${card.code} / Missing` : "Empty pocket"} aria-label={card ? `${card.code}, missing` : "Empty pocket"} className={`rounded-lg border-2 ${wide ? "col-span-2 aspect-[10/7]" : "aspect-[5/7]"} ${isLightMode ? "border-zinc-300 bg-white" : "border-zinc-600 bg-zinc-800"}`} />;
    return <div key={card.identity} title={`${card.code} / ${card.setName}`} aria-label={`${card.code}, ${card.setName}`} className={`relative overflow-hidden rounded-lg ${wide ? "col-span-2" : ""}`}><ChineseISOImage card={card} /></div>;
  });
  const binderWidth =
    layout === "2x2"
      ? 560
      : layout === "4x3" || layout === "4x4"
        ? 900
        : layout === "6x6"
          ? 1200
          : 980;
  const mobileScale =
    layout === "2x2"
      ? 0.48
      : layout === "3x3"
        ? 0.45
        : layout === "4x3"
          ? 0.45
          : layout === "4x4"
            ? 0.35
            : layout === "6x6"
              ? 0.38
              : 0.32;
  const androidScale = /Android/i.test(navigator.userAgent)
    ? mobileScale * 0.96
    : mobileScale;
  const mobileBinderHeight =
    layout === "2x2"
      ? 275
      : layout === "3x3"
        ? 500
        : layout === "4x3"
          ? 635
          : layout === "4x4"
            ? 515
            : layout === "6x6"
              ? 500
              : 520;
  const rotateMobileBinder = isMobile && layout !== "2x2";
  return (
    <div
      className={`min-h-screen flex flex-col ${
        isLightMode ? "bg-[#f6f6f3] text-zinc-950" : "bg-[#090a0a] text-white"
      }`}
    >
      <main className="mx-auto w-full max-w-[1500px] flex-1 px-3 pb-20 pt-4 sm:px-5 sm:pt-6">
        <section
          className={`rounded-[24px] border p-3 sm:p-4 ${
            isLightMode
              ? "border-black/10 bg-white"
              : "border-black/10 dark:border-white/[0.08] bg-[#151718]"
          }`}
        >
          <div className="grid gap-3 lg:grid-cols-[1fr_1.35fr_auto]">
            <div
              className={`flex items-center gap-3 rounded-2xl border p-3 ${
                isLightMode
                  ? "border-black/10 bg-zinc-50"
                  : "border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03]"
              }`}
            >
              <CardImage
                src={getProfileAssets(viewingProfile).avatar}
                alt={viewingUsername}
                className="h-10 w-10 shrink-0 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-1.5">
                  <div className="truncate text-sm font-semibold">
                    {viewingUsername}
                  </div>
                  {getProfileAssets(viewingProfile).verification && (
                    <CardImage
                      src={getProfileAssets(viewingProfile).verification!.badge}
                      alt={getProfileAssets(viewingProfile).verification!.label}
                      title={
                        getProfileAssets(viewingProfile).verification!.label
                      }
                      className="h-4 w-4 shrink-0"
                    />
                  )}
                </div>
                <div
                  className={`mt-0.5 text-xs ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}
                >
                  {viewingUserId ? "Viewing Chinese collection" : "Your Chinese collection"}
                </div>
              </div>
              {viewingUserId && (
                <button
                  type="button"
                  onClick={() => { setProgressMap({}); setBinderLoading(true); setViewingUserId(null); }}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
                    isLightMode
                      ? "border-black/10 bg-white text-zinc-700"
                      : "border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-white/[0.04] text-zinc-300"
                  }`}
                >
                  Back
                </button>
              )}
            </div>
            <div ref={searchRef} className="relative">
              <input
                value={userSearch}
                onChange={async (e) => {
                  const value = e.target.value;
                  const ticket = ++searchRequest.current;
                  setUserSearch(value);
                  if (!value.trim()) { setSearchResults([]); return; }
                  const { data: profiles, error } = await supabase.from("profiles").select("id, username, avatar_url").eq("chinese_cards_enabled", true).eq("chinese_hide_iso", false).eq("hide_iso", false).ilike("username", `%${value.trim()}%`).order("username").limit(20);
                  if (ticket !== searchRequest.current) return;
                  setSearchResults(error ? [] : profiles ?? []);
                }}
                placeholder="Search Chinese collectors"
                className={`h-full min-h-[66px] w-full rounded-2xl border px-4 text-base outline-none ${
                  isLightMode
                    ? "border-black/10 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400"
                    : "border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] text-white placeholder:text-zinc-500"
                }`}
              />
              {searchResults.length > 0 && (
                <div
                  className={`absolute left-0 right-0 top-full z-[120] mt-2 overflow-hidden rounded-2xl border shadow-xl ${
                    isLightMode
                      ? "border-black/10 bg-white"
                      : "border-black/10 dark:border-white/10 bg-[#151718]"
                  }`}
                >
                  {searchResults.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      className={`rounded-xl flex w-full items-center gap-3 border-b px-3 py-2.5 text-left last:border-b-0 ${
                        isLightMode
                          ? "border-black/[0.06] hover:bg-zinc-50"
                          : "border-black/[0.08] dark:border-white/[0.06] hover:bg-zinc-100 dark:bg-white/[0.04]"
                      }`}
                      onClick={() => {
                        setProgressMap({});
                        setBinderLoading(true);
                        setViewingUserId(u.id);
                        setViewingUsername(u.username);
                        setViewingProfile(u);
                        setSearchResults([]);
                        setUserSearch("");
                      }}
                    >
                      <CardImage
                        src={getProfileAssets(u).avatar}
                        alt={u.username}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span className="truncate text-sm font-semibold">
                          {u.username}
                        </span>
                        {getProfileAssets(u).verification && (
                          <CardImage
                            src={getProfileAssets(u).verification!.badge}
                            alt={getProfileAssets(u).verification!.label}
                            title={getProfileAssets(u).verification!.label}
                            className="h-4 w-4 shrink-0"
                          />
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 lg:min-w-[220px]">
              <button
                type="button"
                onClick={() => {
                  const layouts = ["2x2", "3x3", "4x3", "4x4", "6x6"] as const;
                  const current = (layouts as readonly string[]).includes(
                    layout,
                  )
                    ? layout
                    : "3x3";
                  const next =
                    layouts[
                      (layouts.indexOf(current as never) + 1) % layouts.length
                    ];
                  setLayout(next);
                  setPreviewLayout(next);
                  setSpread(1);
                }}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                  isLightMode
                    ? "border-black/10 bg-zinc-50 text-zinc-700"
                    : "border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] text-zinc-300"
                }`}
              >
                View {layout}
              </button>
              <button
                type="button"
                onClick={() => setShowCustomization(true)}
                className="rounded-xl bg-[#FFD54A] px-3 py-2 text-sm font-semibold text-black"
              >
                Customize
              </button>
            </div>
          </div>
        </section>
        <section
          className={`mt-4 rounded-[24px] border p-3 ${
            isLightMode
              ? "border-black/10 bg-white"
              : "border-black/10 dark:border-white/[0.08] bg-[#151718]"
          }`}
        >
          <div className="flex flex-wrap gap-2">
            {binders.map((binder) => (
              <button
                key={binder}
                type="button"
                onClick={() => {
                  setSelectedBinder(binder);
                  if (binder === "All Cards") {
                    setSelectedSetId(visibleCCGOrder[0] ?? chineseSets[0]?.id ?? "");
                  } else {
                    setSelectedSetId(
                      binderSets[binder as keyof typeof binderSets][0].id,
                    );
                  }
                  setSpread(1);
                }}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                  selectedBinder === binder
                    ? "border-[#FFD54A] bg-[#FFD54A] text-black"
                    : isLightMode
                      ? "border-black/10 bg-zinc-50 text-zinc-600"
                      : "border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] text-zinc-400"
                }`}
              >
                {binder}
              </button>
            ))}
          </div>
        </section>
        <section
          className={`mt-4 rounded-[24px] border p-3 xl:hidden ${isLightMode ? "border-black/10 bg-white" : "border-black/10 dark:border-white/[0.08] bg-[#151718]"}`}
        >
          <div className="mb-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Sets
          </div>
          <div className="flex flex-wrap gap-2">
            {binderSets[selectedBinder as keyof typeof binderSets].map(
              (set) => {
                const isHidden =
                  hiddenCCGSets.includes(set.id);
                const active = currentSidebarSet === set.id;
                return (
                  <button
                    key={set.id}
                    type="button"
                    disabled={isHidden}
                    onClick={() => {
                      if (selectedBinder === "All Cards") {
                        setSpread(getCCGSpreadForSet(set.id));
                      } else {
                        setSelectedSetId(set.id);
                        setSpread(1);
                      }
                    }}
                    className={`rounded-xl border px-3 py-2 text-left text-sm font-medium transition-colors ${
                      active
                        ? "border-[#FFD54A] bg-[#FFD54A] text-black"
                        : isLightMode
                          ? "border-black/10 bg-zinc-50 text-zinc-600"
                          : "border-white/10 bg-white/[0.03] text-zinc-400"
                    } ${isHidden ? "opacity-30 line-through" : ""}`}
                  >
                    {set.label}
                  </button>
                );
              },
            )}
          </div>
        </section>
        <section
          className={`mt-4 overflow-hidden rounded-[28px] border ${
            isLightMode
              ? "border-black/10 bg-white"
              : "border-black/10 dark:border-white/[0.08] bg-[#151718]"
          }`}
        >
          <div
            className={`rounded-xl flex items-center justify-between border-b px-4 py-3 ${
              isLightMode
                ? "border-black/[0.08]"
                : "border-black/[0.08] dark:border-white/[0.07]"
            }`}
          >
            <div>
              <div className="text-base font-semibold">{selectedBinder === "All Cards" ? "All Chinese Cards" : selectedSet.name}</div>
              <div
                className={`mt-0.5 text-xs ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}
              >
                Spread {spread} of {totalSpreads}
              </div>
            </div>
          </div>
          <div className="grid gap-2 p-2 sm:gap-3 sm:p-4 xl:grid-cols-[220px_minmax(0,1fr)]">
            <aside className="rounded-xl hidden xl:block border border-black/10 dark:border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-[#0b0d0d] p-3">
              <div className="mb-2 flex items-center justify-between px-1">
                <span
                  className={`text-sm font-semibold ${isLightMode ? "text-zinc-700" : "text-zinc-300"}`}
                >
                  Sets
                </span>
                <span
                  className={`text-xs ${isLightMode ? "text-zinc-400" : "text-zinc-500"}`}
                >
                  {binderSets[selectedBinder as keyof typeof binderSets].length}
                </span>
              </div>
              <div className="space-y-1">
                {binderSets[selectedBinder as keyof typeof binderSets].map(
                  (set) => {
                    const isHidden =
                      hiddenCCGSets.includes(set.id);
                    const active = currentSidebarSet === set.id;
                    return (
                      <button
                        key={set.id}
                        type="button"
                        disabled={isHidden}
                        onClick={() => {
                          if (selectedBinder === "All Cards") {
                            setSpread(getCCGSpreadForSet(set.id));
                          } else {
                            setSelectedSetId(set.id);
                            setSpread(1);
                          }
                        }}
                        className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                          active
                            ? isLightMode
                              ? "bg-[#c89d13]/12 text-[#725700]"
                              : "bg-[#FFD54A]/10 text-[#FFE27A]"
                            : isLightMode
                              ? "text-zinc-600 hover:bg-white hover:text-zinc-900"
                              : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                        } ${isHidden ? "opacity-30 line-through" : ""}`}
                      >
                        {set.label}
                      </button>
                    );
                  },
                )}
              </div>
            </aside>
            {showClosedBinder ? (
              <div className="rounded-xl flex min-h-[420px] items-center justify-center border border-black/10 dark:border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-[#0b0d0d] p-8">
                <div className="max-w-md text-center">
                  <div className="rounded-xl mx-auto mb-3 flex h-12 w-12 items-center justify-center border border-[#FFD400]/20 bg-[#FFD400]/[0.04] font-mono text-lg text-[#725700] dark:text-[#725700] dark:text-[#FFD400]/55">
                  </div>
                  <div className="font-['Oxanium'] text-sm font-bold uppercase tracking-[0.12em] text-zinc-600 dark:text-zinc-700 dark:text-white/55">
                    {binderLoading ? "Loading binder" : binderError ? "Unable to load binder" : publicBlocked ? "Chinese collection private" : "Set hidden"}
                  </div>
                  <div className="mt-2 text-sm text-zinc-400 dark:text-zinc-500 dark:text-white/55">
                    {binderLoading ? "Loading Chinese checklist progress..." : binderError || (publicBlocked ? "This collector has not enabled public Chinese cards or has hidden their Chinese ISO." : "This set is hidden in the Chinese ISO controls.")}
                    {binderError && <button type="button" onClick={() => setAuthVersion(value => value + 1)} className="mt-3 block w-full underline">Retry</button>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl relative min-w-0 overflow-hidden border border-black/10 dark:border-black/10 dark:border-white/10 bg-zinc-100 p-1.5 dark:bg-[#080909] sm:p-2">
                <div
                  className="relative flex justify-center overflow-hidden"
                  style={{
                    height: isMobile ? `${mobileBinderHeight}px` : "auto",
                    minHeight: isMobile ? `${mobileBinderHeight}px` : undefined,
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      maxWidth: isMobile
                        ? layout === "2x2"
                          ? "560px"
                          : layout === "4x3" || layout === "4x4"
                            ? "900px"
                            : "980px"
                        : "none",
                      display: "flex",
                      justifyContent: "center",
                      position: isMobile ? "absolute" : "relative",
                      left: isMobile ? "50%" : undefined,
                      top: isMobile ? "50%" : undefined,
                      transform: isMobile
                        ? rotateMobileBinder
                          ? `translate(-50%, -50%) rotate(90deg) scale(${androidScale})`
                          : `translate(-50%, -50%) scale(${androidScale})`
                        : layout === "6x6"
                          ? "scale(.86)"
                          : layout === "4x3"
                            ? "scale(.72)"
                            : layout === "4x4"
                              ? "scale(.72)"
                              : layout === "3x3"
                                ? "scale(.94)"
                                : "scale(.9)",
                      transformOrigin: isMobile
                        ? "center center"
                        : "top center",
                    }}
                  >
                    <div
                      className="relative flex items-center gap-0"
                      onTouchStart={(e) => {
                        if (rotateMobileBinder) return;
                        touchStartX.current = e.touches[0].clientX;
                      }}
                      onTouchEnd={(e) => {
                        if (!isMobile || rotateMobileBinder) return;
                        const delta =
                          e.changedTouches[0].clientX - touchStartX.current;
                        if (Math.abs(delta) < 50) return;
                        if (delta < 0) {
                          setSpread((s) => Math.min(totalSpreads, s + 1));
                        } else {
                          setSpread((s) => Math.max(1, s - 1));
                        }
                      }}
                      style={{
                        touchAction: rotateMobileBinder
                          ? "manipulation"
                          : "pan-x",
                        padding: isMobile ? "34px" : "24px",
                        borderRadius: "24px",
                        background: isLightMode
                          ? "linear-gradient(145deg,#f9d9e7 0%,#f4c7da 48%,#edb7cf 100%)"
                          : "linear-gradient(145deg,#242727 0%,#1a1d1d 48%,#111313 100%)",
                        boxShadow: isLightMode
                          ? "0 24px 55px rgba(126,55,86,.18), inset 0 2px 2px rgba(255,255,255,.55), inset 0 -10px 20px rgba(153,72,108,.12)"
                          : "0 35px 70px rgba(0,0,0,.55), inset 0 2px 2px rgba(255,255,255,.08), inset 0 -10px 20px rgba(0,0,0,.35)",
                      }}
                    >
                      <div className="pointer-events-none absolute inset-[10px] rounded-[18px] border border-black/10 dark:border-black/10 dark:border-white/10" />
                      <div
                        className={`pointer-events-none absolute inset-[18px] rounded-[14px] border border-dashed ${isLightMode ? "border-[#b85c82]" : "border-[#FFD400]/45"}`}
                      />
                      <button
                        onClick={() => setSpread((s) => Math.max(1, s - 1))}
                        className="rounded-xl absolute left-[-22px] top-1/2 z-50 hidden h-11 w-11 -translate-y-1/2 items-center justify-center border border-[#FFD400]/25 bg-white dark:bg-[#111414] text-[#725700] dark:text-[#725700] dark:text-[#FFD400]/75 transition hover:border-[#FFD400]/60 hover:bg-zinc-100 dark:bg-[#171a1a] hover:text-[#725700] dark:text-[#FFD400] md:flex"
                      >
                        <ChevronLeft size={19} />
                      </button>
                      <button
                        onClick={() =>
                          setSpread((s) => Math.min(totalSpreads, s + 1))
                        }
                        className="rounded-xl absolute right-[-22px] top-1/2 z-50 hidden h-11 w-11 -translate-y-1/2 items-center justify-center border border-[#FFD400]/25 bg-white dark:bg-[#111414] text-[#725700] dark:text-[#725700] dark:text-[#FFD400]/75 transition hover:border-[#FFD400]/60 hover:bg-zinc-100 dark:bg-[#171a1a] hover:text-[#725700] dark:text-[#FFD400] md:flex"
                      >
                        <ChevronRight size={19} />
                      </button>
                      <div
                        key={`left-${viewingUserId ?? "self"}-${selectedBinder}-${selectedSetId}-${layout}-${spread}`}
                        role={rotateMobileBinder ? "button" : undefined}
                        tabIndex={rotateMobileBinder ? 0 : undefined}
                        onClick={() => {
                          if (rotateMobileBinder)
                            setSpread((s) => Math.max(1, s - 1));
                        }}
                        className={`relative overflow-visible rounded-xl border border-black/10 dark:border-white/10 bg-[#e8e8e3] dark:bg-[#d8d8d4]/80 px-3 py-3 ${
                          rotateMobileBinder ? "cursor-pointer" : ""
                        }`}
                        style={{ backdropFilter: "blur(1.5px)" }}
                      >
                        <div
                          className="grid mx-auto"
                          style={{
                            gridTemplateColumns: `repeat(${cols}, ${layout === "6x6" ? 82 : 152}px)`,
                            gap: layout === "6x6" ? "5px" : "10px",
                            justifyContent: "center",
                            alignContent: "center",
                            minHeight: layout === "2x2" ? "420px" : undefined,
                          }}
                        >
                          {renderPage((spread - 1) * (slotsPerPage * 2))}
                        </div>
                      </div>
                      <div className="w-2 shrink-0" aria-hidden="true" />
                      <div
                        key={`right-${viewingUserId ?? "self"}-${selectedBinder}-${selectedSetId}-${layout}-${spread}`}
                        role={rotateMobileBinder ? "button" : undefined}
                        tabIndex={rotateMobileBinder ? 0 : undefined}
                        onClick={() => {
                          if (rotateMobileBinder)
                            setSpread((s) => Math.min(totalSpreads, s + 1));
                        }}
                        className={`relative overflow-visible rounded-xl border border-black/10 dark:border-white/10 bg-[#e8e8e3] dark:bg-[#d8d8d4]/80 px-3 py-3 ${
                          rotateMobileBinder ? "cursor-pointer" : ""
                        }`}
                        style={{ backdropFilter: "blur(1.5px)" }}
                      >
                        <div
                          className="grid mx-auto"
                          style={{
                            gridTemplateColumns: `repeat(${cols}, ${layout === "6x6" ? 82 : 152}px)`,
                            gap: layout === "6x6" ? "5px" : "10px",
                            justifyContent: "center",
                            alignContent: "center",
                            minHeight: layout === "2x2" ? "420px" : undefined,
                          }}
                        >
                          {renderPage(
                            (spread - 1) * (slotsPerPage * 2) + slotsPerPage,
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {isMobile && (
                  <div
                    className={`mt-2 px-2 text-center text-[11px] ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}
                  >
                    {layout === "2x2"
                      ? "Swipe left or right to turn the pages."
                      : "Click anywhere on each page to flip that page."}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
      {showCustomization && (
        <div className="fixed inset-0 z-[2147483647] flex items-center justify-center p-3 sm:p-6">
          <div
            className={`absolute inset-0 backdrop-blur-sm ${isLightMode ? "bg-white/60" : "bg-black/75"}`}
            onClick={() => setShowCustomization(false)}
          />
          <div
            className={`relative z-10 flex max-h-[calc(100dvh-24px)] w-full max-w-[760px] flex-col overflow-hidden rounded-[24px] border ${
              isLightMode
                ? "border-black/10 bg-white"
                : "border-white/10 bg-[#101212]"
            }`}
          >
            <div
              className={`flex shrink-0 items-center justify-between rounded-[24px] border-b px-4 py-3 sm:px-5 ${
                isLightMode
                  ? "border-black/10 bg-zinc-50"
                  : "border-white/10 bg-[#0c0e0e]"
              }`}
            >
              <div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  CUSTOMIZE
                </div>
                <h2
                  className={`mt-1 font-['Oxanium'] text-base font-bold uppercase tracking-[0.1em] sm:text-lg ${
                    isLightMode ? "text-zinc-900" : "text-white"
                  }`}
                >
                  Customize Binder
                </h2>
              </div>
              <button
                onClick={() => setShowCustomization(false)}
                className="rounded-xl flex h-8 w-8 items-center justify-center border border-black/10 dark:border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-[#151717] font-mono text-xs text-zinc-600 dark:text-white/50 transition hover:border-[#FFD400]/50 hover:text-[#725700] dark:text-[#FFD400]"
              >
                &#x2715;
              </button>
            </div>
            <div className="min-h-0 overflow-y-auto">
              <div className="p-4 sm:p-5">
                <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-600 dark:text-white/50">
                  Choose a layout, starting slot, and rarity order.
                </p>
                <div
                  className={`mb-5 rounded-[18px] border p-3 ${
                    isLightMode
                      ? "border-black/10 bg-zinc-50"
                      : "border-white/10 bg-[#080909]"
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <div
                        className={`text-sm font-semibold ${
                          isLightMode ? "text-zinc-800" : "text-zinc-200"
                        }`}
                      >
                        Rarity order
                      </div>
                      <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        Drag rarities into the order you want to see them.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setRarityOrder([]);
                        setStartSlot(0);
                        setSpread(1);
                      }}
                      className="shrink-0 rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600 transition hover:border-[#FFD400]/60 dark:border-white/10 dark:bg-[#151717] dark:text-zinc-300"
                    >
                      Reset
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {activeRarityOrder.map((rarity, index) => (
                      <div
                        key={chineseRarityLabel(rarity)}
                        data-rarity={chineseRarityLabel(rarity)}
                        onPointerDown={(event) => {
                          const bounds =
                            event.currentTarget.getBoundingClientRect();
                          event.currentTarget.setPointerCapture(
                            event.pointerId,
                          );
                          draggedRarity.current = rarity;
                          lastRarityTarget.current = rarity;
                          setRarityDrag({
                            rarity,
                            x: event.clientX,
                            y: event.clientY,
                            width: bounds.width,
                            offsetX: event.clientX - bounds.left,
                            offsetY: event.clientY - bounds.top,
                          });
                        }}
                        onPointerMove={(event) => {
                          if (!draggedRarity.current) return;
                          setRarityDrag((current) =>
                            current
                              ? {
                                  ...current,
                                  x: event.clientX,
                                  y: event.clientY,
                                }
                              : null,
                          );
                          handleRarityPointerMove(event.clientX, event.clientY);
                        }}
                        onPointerUp={(event) => {
                          if (
                            event.currentTarget.hasPointerCapture(
                              event.pointerId,
                            )
                          ) {
                            event.currentTarget.releasePointerCapture(
                              event.pointerId,
                            );
                          }
                          draggedRarity.current = null;
                          lastRarityTarget.current = null;
                          setRarityDrag(null);
                        }}
                        onPointerCancel={() => {
                          draggedRarity.current = null;
                          lastRarityTarget.current = null;
                          setRarityDrag(null);
                        }}
                        className={`flex touch-none select-none cursor-grab items-center gap-2 rounded-xl border px-2.5 py-2 text-sm font-semibold transition-opacity active:cursor-grabbing ${
                          isLightMode
                            ? "border-black/10 bg-white text-zinc-700"
                            : "border-white/10 bg-[#151717] text-zinc-200"
                        } ${rarityDrag?.rarity === rarity ? "opacity-25" : "opacity-100"}`}
                      >
                        <GripVertical
                          className="h-4 w-4 shrink-0 text-zinc-400"
                          aria-hidden="true"
                        />
                        <span className="min-w-0 flex-1 truncate">
                          {chineseRarityLabel(rarity)}
                        </span>
                        <span className="text-[10px] tabular-nums text-zinc-400">
                          {index + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                {rarityDrag && (
                  <div
                    className={`pointer-events-none fixed z-[2147483647] flex items-center gap-2 rounded-xl border px-2.5 py-2 text-sm font-semibold shadow-2xl ring-2 ring-[#FFD400]/70 ${
                      isLightMode
                        ? "border-black/10 bg-white text-zinc-700"
                        : "border-white/10 bg-[#151717] text-zinc-200"
                    }`}
                    style={{
                      left: rarityDrag.x - rarityDrag.offsetX,
                      top: rarityDrag.y - rarityDrag.offsetY,
                      width: rarityDrag.width,
                      transform: "rotate(2deg) scale(1.04)",
                    }}
                    aria-hidden="true"
                  >
                    <GripVertical className="h-4 w-4 shrink-0 text-[#C39700]" />
                    <span className="min-w-0 flex-1 truncate">
                      {chineseRarityLabel(rarityDrag.rarity)}
                    </span>
                  </div>
                )}
                <div className="mb-5 flex flex-wrap justify-center gap-2">
                  {(["3x3", "4x3", "4x4", "2x2", "6x6"] as const).map(
                    (value) => (
                      <button
                        key={value}
                        onClick={() => {
                          setLayout(value);
                          setPreviewLayout(value);
                          setStartSlot(0);
                          setSpread(1);
                        }}
                        className={`rounded-xl min-w-[58px] border px-3 py-2 text-sm font-semibold transition ${
                          layout === value
                            ? "border-[#FFD400]/70 bg-[#FFD400] text-[#0b0b0b]"
                            : "border-black/10 dark:border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-[#151717] text-zinc-700 dark:text-white/55 hover:border-[#FFD400]/35 hover:text-[#725700] dark:text-[#FFD400]"
                        }`}
                      >
                        {value}
                      </button>
                    ),
                  )}
                </div>
                <div
                  className={`relative flex justify-center overflow-hidden rounded-[18px] border p-2 sm:p-6 ${
                    isLightMode
                      ? "border-black/10 bg-zinc-50"
                      : "border-white/10 bg-[#080909]"
                  }`}
                  style={{
                    height: isMobile
                      ? previewLayout === "6x6"
                        ? "390px"
                        : previewLayout === "4x4"
                          ? "300px"
                          : previewLayout === "4x3"
                            ? "235px"
                            : previewLayout === "3x3"
                              ? "250px"
                              : "220px"
                      : "auto",
                  }}
                >
                  <div
                    className="flex justify-center"
                    style={{
                      position: isMobile ? "absolute" : "relative",
                      left: isMobile ? "50%" : undefined,
                      top: isMobile ? "50%" : undefined,
                      transform: isMobile
                        ? previewLayout === "6x6"
                          ? "translate(-50%, -50%) scale(.56)"
                          : previewLayout === "4x4"
                            ? "translate(-50%, -50%) scale(.68)"
                            : previewLayout === "4x3"
                              ? "translate(-50%, -50%) scale(.68)"
                              : previewLayout === "3x3"
                                ? "translate(-50%, -50%) scale(1)"
                                : "translate(-50%, -50%) scale(1)"
                        : "none",
                      transformOrigin: "center center",
                    }}
                  >
                    <div
                      className={`flex items-center gap-2 rounded-[14px] border p-3 sm:gap-3 sm:p-3.5 ${
                        isLightMode
                          ? "border-[#c98aa5] bg-gradient-to-br from-[#f8dbe7] to-[#efbfd2]"
                          : "border-white/10 bg-gradient-to-br from-[#242727] to-[#111313]"
                      }`}
                    >
                      {(["left", "right"] as const).map((side) => {
                        const pageSize =
                          previewLayout === "2x2"
                            ? 4
                            : previewLayout === "3x3"
                              ? 9
                              : previewLayout === "4x3"
                                ? 12
                                : previewLayout === "4x4"
                                  ? 16
                                  : 36;
                        const offset = side === "right" ? pageSize : 0;
                        const previewCols =
                          previewLayout === "2x2"
                            ? 2
                            : previewLayout === "3x3"
                              ? 3
                              : previewLayout === "4x3"
                                ? 4
                                : previewLayout === "4x4"
                                  ? 4
                                  : 6;
                        const slotSize =
                          previewLayout === "6x6" ? "38px" : "42px";
                        return (
                          <div
                            key={side}
                            className={`grid shrink-0 rounded-lg border p-2 ${
                              isLightMode
                                ? "border-[#c98aa5]/50 bg-[#f3d2df]/80"
                                : "border-white/10 bg-[#d8d8d4]/70"
                            }`}
                            style={{
                              gridTemplateColumns: `repeat(${previewCols}, ${slotSize})`,
                              gap: previewLayout === "6x6" ? "4px" : "6px",
                            }}
                          >
                            {Array.from({ length: pageSize }).map((_, i) => {
                              const index = i + offset;
                              return (
                                <button
                                  key={i}
                                  onClick={() => {
                                    setSpread(1);
                                    setStartSlot(index);
                                  }}
                                  aria-label={`Start slot ${index + 1}`}
                                  className={`relative flex aspect-[2.5/3.5] items-center justify-center rounded border-2 transition ${
                                    startSlot === index
                                      ? isLightMode
                                        ? "border-zinc-400 bg-zinc-300/80"
                                        : "border-[#FFD400] bg-[#FFD400]/30"
                                      : isLightMode
                                        ? "border-[#b87b94]/35 bg-white/80 hover:border-[#b87b94]/60"
                                        : "border-white/15 bg-white/70 hover:border-[#FFD400]/50"
                                  }`}
                                >
                                  {side === "right" && i === 0 && (
                                    <span
                                      className="pointer-events-none text-[15px] leading-none text-[#9A7200]"
                                      aria-hidden="true"
                                    >
                                      &#x2605;
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-start justify-center gap-2 px-2 text-center text-xs leading-relaxed">
                  <span className="shrink-0 text-[#9A7200]" aria-hidden="true">
                    &#x2605;
                  </span>
                  <span
                    className={isLightMode ? "text-zinc-600" : "text-zinc-400"}
                  >
                    If you're starting on the first page of a fresh binder, this
                    is the slot you want to choose for easiest organizing!
                  </span>
                </div>
              </div>
            </div>
            <div
              className={`flex shrink-0 items-center justify-between rounded-[24px] border-t px-4 py-2.5 ${
                isLightMode
                  ? "border-black/10 bg-zinc-50"
                  : "border-white/10 bg-[#0c0e0e]"
              }`}
            >
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Layout: {layout}
              </span>
              <button
                onClick={() => setShowCustomization(false)}
                className="rounded-xl border border-[#FFD400]/25 bg-zinc-100 dark:bg-[#151717] px-3 py-1.5 font-mono text-[6px] font-bold uppercase tracking-[0.12em] text-[#725700] dark:text-[#725700] dark:text-[#FFD400]/75 hover:border-[#FFD400]/55 hover:text-[#725700] dark:text-[#FFD400]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
