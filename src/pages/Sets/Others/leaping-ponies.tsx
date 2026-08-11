import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const LeapingPonies = () => {
  const navigate = useNavigate();

  const merchItems = [
    { id: 1, title: "Twilight Sparkle", image: "/otherkayoumerch/twilightplushone.webp" },
    { id: 2, title: "Pinkie Pie", image: "/otherkayoumerch/pinkieplushone.webp" },
    { id: 3, title: "Fluttershy", image: "/otherkayoumerch/fluttershyplushone.webp" },
    { id: 4, title: "Rainbow Dash", image: "/otherkayoumerch/rainbowdashplushone.webp" },
    { id: 5, title: "Rarity", image: "/otherkayoumerch/rarityplushone.webp" },
    { id: 6, title: "Applejack", image: "/otherkayoumerch/applejackplushone.webp" },
  ];

  const [completed, setCompleted] = useState<number[]>([]);
  useEffect(() => {
    const loadProgress = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;

      if (!user) {
        return;
      }

      const { data } = await supabase
        .from("collection_progress_raw")
        .select("progress")
        .eq("user_id", user.id)
        .eq("set_id", "OTHERMERCH")
        .maybeSingle();

      if (data?.progress && typeof data.progress === "object") {
        const progress = data.progress as Record<string, unknown>;
        const completedIds = Object.keys(progress)
          .filter((key) => Boolean(progress[key]))
          .map((key) => Number(key))
          .filter((id) => Number.isFinite(id));

        setCompleted(completedIds);
      }

    };

    loadProgress();
  }, []);

  const toggleItem = async (id: number) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;

    if (!user) return;

    const updated = completed.includes(id)
      ? completed.filter((itemId) => itemId !== id)
      : [...completed, id];

    setCompleted(updated);

    const progressObject: Record<string, boolean> = {};
    updated.forEach((itemId) => {
      progressObject[String(itemId)] = true;
    });

    await supabase.from("collection_progress_raw").upsert(
      {
        user_id: user.id,
        set_id: "OTHERMERCH",
        progress: progressObject,
      },
      {
        onConflict: "user_id,set_id",
      }
    );
  };

  const completedCount = completed.length;
  const remainingCount = merchItems.length - completedCount;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050707] pb-28 text-white sm:pb-0">
      {/* STARK GRID */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.34]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,212,74,.032) 1px, transparent 1px), linear-gradient(90deg, rgba(255,212,74,.032) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div className="pointer-events-none fixed inset-0 opacity-[0.055] bg-[repeating-linear-gradient(0deg,transparent_0px,transparent_3px,rgba(255,255,255,.08)_4px)]" />
      <div className="pointer-events-none fixed left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-[#FFD54A] to-transparent" />

      <div className="relative mx-auto max-w-[1800px] px-3 py-3 sm:px-6 sm:py-6">
        {/* SYSTEM HEADER */}
        <header className="mb-4 border border-white/[0.08] bg-[#080b0b] shadow-[0_18px_55px_rgba(0,0,0,.5)]">
          <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#050707] px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.9)]" />
              <span className="font-mono text-[8px] font-bold uppercase tracking-[0.3em] text-emerald-300/95">
                COLLECTION NETWORK // ONLINE
              </span>
            </div>
            <span className="font-mono text-[8px] uppercase tracking-[0.24em] text-zinc-400">
              MERCH / ASSET NODE
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 px-3 py-3 sm:px-5">
            <button
              onClick={() => navigate("/collections")}
              className="group flex items-center gap-3 border border-[#FFD54A]/20 bg-[#0a0d0d] px-3 py-2 transition hover:border-[#FFD54A]/60 hover:bg-[#101414]"
            >
              <span className="flex h-8 w-8 items-center justify-center border border-[#FFD54A]/20 bg-[#060909] text-[#FFD54A]">
                ←
              </span>
              <span className="text-left">
                <span className="block font-mono text-[8px] uppercase tracking-[0.26em] text-zinc-300">
                  COLLECTIONS
                </span>
                <span className="mt-1 block font-['Oxanium'] text-[9px] font-black uppercase tracking-[0.12em] text-zinc-200">
                  Back to Collections
                </span>
              </span>
            </button>

            <div className="hidden items-center gap-3 sm:flex">
              <div className="text-right">
                <div className="font-mono text-[8px] uppercase tracking-[0.25em] text-zinc-400">
                  SYSTEM
                </div>
                <div className="mt-1 font-mono text-[8px] font-bold uppercase tracking-[0.15em] text-emerald-300">
                  SYNC ACTIVE
                </div>
              </div>
              <span className="h-2 w-2 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.9)]" />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[330px_minmax(0,1fr)]">
          {/* CONTROL DECK */}
          <aside className="xl:sticky xl:top-4 xl:self-start">
            <div className="overflow-hidden border border-white/[0.09] bg-[#080b0b] shadow-[0_20px_55px_rgba(0,0,0,.5)]">
              <div className="border-b border-white/[0.07] bg-[#050707] px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[8px] font-bold uppercase tracking-[0.3em] text-zinc-300">
                    CONTROL DECK
                  </span>
                  <span className="font-mono text-[5px] uppercase tracking-[0.2em] text-[#FFD54A]/60">
                    MERCH
                  </span>
                </div>
              </div>

              <div className="relative border-b border-white/[0.07] p-4 sm:p-5">
                <div className="pointer-events-none absolute right-0 top-0 h-10 w-10 border-r border-t border-[#FFD54A]/30" />

                <div className="font-mono text-[8px] font-bold uppercase tracking-[0.32em] text-zinc-300">
                  SERIES IDENTIFICATION
                </div>

                <h1 className="mt-3 font-['Oxanium'] text-3xl font-black uppercase leading-[0.92] tracking-tight text-white sm:text-4xl">
                  Leaping
                  <span className="block text-[#FFD54A]">Ponies</span>
                </h1>

                <div className="mt-4 h-px bg-gradient-to-r from-[#FFD54A]/50 to-transparent" />

                <p className="mt-4 font-mono text-[7px] uppercase leading-5 tracking-[0.08em] text-zinc-500">
                  Merchandise collection module. Click an asset to mark it as
                  collected and synchronize your progress.
                </p>
              </div>

              {/* TELEMETRY */}
              <div className="grid grid-cols-2 gap-px border-b border-white/[0.07] bg-white/[0.06]">
                <div className="bg-[#070a0a] p-4">
                  <div className="font-mono text-[8px] uppercase tracking-[0.22em] text-zinc-400">
                    ASSETS
                  </div>
                  <div className="mt-1 font-['Oxanium'] text-2xl font-black text-[#FFD54A]">
                    06
                  </div>
                </div>

                <div className="bg-[#070a0a] p-4">
                  <div className="font-mono text-[8px] uppercase tracking-[0.22em] text-zinc-400">
                    TYPE
                  </div>
                  <div className="mt-1 font-['Oxanium'] text-2xl font-black text-white">
                    PLUSH
                  </div>
                </div>

                <div className="bg-[#070a0a] p-4">
                  <div className="font-mono text-[8px] uppercase tracking-[0.22em] text-zinc-400">
                    COLLECTED
                  </div>
                  <div className="mt-1 font-['Oxanium'] text-2xl font-black text-emerald-400">
                    {String(completedCount).padStart(2, "0")}
                  </div>
                </div>

                <div className="bg-[#070a0a] p-4">
                  <div className="font-mono text-[8px] uppercase tracking-[0.22em] text-zinc-400">
                    REMAINING
                  </div>
                  <div className="mt-1 font-['Oxanium'] text-2xl font-black text-zinc-300">
                    {String(remainingCount).padStart(2, "0")}
                  </div>
                </div>
              </div>

              {/* PROGRESS */}
              <div className="border-b border-white/[0.07] p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-[8px] font-bold uppercase tracking-[0.28em] text-zinc-300">
                    COLLECTION STATUS
                  </span>
                  <span className="font-mono text-[6px] font-bold text-[#FFD54A]">
                    {Math.round((completedCount / merchItems.length) * 100)}%
                  </span>
                </div>

                <div className="h-1.5 overflow-hidden bg-[#171b1b]">
                  <div
                    className="h-full bg-gradient-to-r from-[#B58D16] via-[#FFD54A] to-[#FFF0A6] shadow-[0_0_12px_rgba(255,212,74,.45)] transition-all duration-500"
                    style={{
                      width: `${(completedCount / merchItems.length) * 100}%`,
                    }}
                  />
                </div>

                <div className="mt-3 flex justify-between font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-400">
                  <span>LOCAL PROGRESS</span>
                  <span>{completedCount} / {merchItems.length}</span>
                </div>
              </div>

              {/* PRODUCT DATA */}
              <div className="p-4 sm:p-5">
                <div className="mb-4 font-mono text-[8px] font-bold uppercase tracking-[0.28em] text-zinc-300">
                  PRODUCT DATA
                </div>

                <div className="space-y-3">
                  <div className="border-l border-[#FFD54A]/25 pl-3">
                    <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-400">
                      PRODUCT NAME
                    </div>
                    <div className="mt-1 text-xs font-bold uppercase text-zinc-200">
                      Leaping Ponies
                    </div>
                  </div>

                  <div className="border-l border-white/[0.08] pl-3">
                    <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-400">
                      CATEGORY
                    </div>
                    <div className="mt-1 text-xs font-bold uppercase text-zinc-400">
                      Plush Merchandise
                    </div>
                  </div>

                  <div className="border-l border-white/[0.08] pl-3">
                    <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-400">
                      STORAGE NODE
                    </div>
                    <div className="mt-1 font-mono text-[8px] font-bold uppercase tracking-[0.12em] text-zinc-300">
                      OTHER MERCH
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* ASSET MATRIX */}
          <main className="min-w-0">
            <div className="mb-4 flex items-center justify-between border border-white/[0.08] bg-[#080b0b] px-4 py-3">
              <div>
                <div className="font-mono text-[5px] font-bold uppercase tracking-[0.3em] text-zinc-700">
                  MERCHANDISE ASSET MATRIX
                </div>
                <div className="mt-1 font-['Oxanium'] text-sm font-black uppercase tracking-[0.08em] text-white">
                  Leaping Ponies Collection
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-emerald-400 shadow-[0_0_9px_rgba(52,211,153,.8)]" />
                <span className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-emerald-300/95">
                  LIVE
                </span>
              </div>
            </div>

            <section className="relative overflow-hidden border border-white/[0.08] bg-[#080b0b] p-3 shadow-[0_18px_45px_rgba(0,0,0,.42)] sm:p-4">
              <div className="pointer-events-none absolute left-0 top-0 h-8 w-8 border-l border-t border-[#FFD54A]/45" />
              <div className="pointer-events-none absolute right-0 top-0 h-8 w-8 border-r border-t border-[#FFD54A]/20" />

              <div className="mb-4 flex items-end justify-between border-b border-white/[0.07] pb-3">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="font-mono text-[5px] font-bold uppercase tracking-[0.25em] text-zinc-700">
                      NODE 01
                    </span>
                    <span className="h-px w-8 bg-[#FFD54A]/25" />
                    <span className="font-mono text-[5px] uppercase tracking-[0.18em] text-[#FFD54A]/60">
                      ACTIVE
                    </span>
                  </div>

                  <h2 className="font-['Oxanium'] text-2xl font-black uppercase leading-none text-white sm:text-3xl">
                    Plush
                    <span className="ml-2 text-zinc-500">Assets</span>
                  </h2>

                  <p className="mt-2 font-mono text-[6px] uppercase tracking-[0.2em] text-zinc-700">
                    06 ASSETS / {completedCount === merchItems.length ? "COMPLETE" : "IN PROGRESS"}
                  </p>
                </div>

                <div className="font-['Oxanium'] text-3xl font-black text-[#FFD54A]/25 sm:text-5xl">
                  01
                </div>
              </div>

              {/* Six per row on desktop */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {merchItems.map((item) => {
                  const owned = completed.includes(item.id);

                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`group relative aspect-square overflow-hidden rounded-md border bg-[#050707] text-left shadow-[0_10px_25px_rgba(0,0,0,.42)] transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-[#FFD54A]/60 ${
                        owned
                          ? "border-[#FFD54A]/70 shadow-[0_0_24px_rgba(255,212,74,.12)]"
                          : "border-white/[0.08]"
                      } md:hover:z-20 md:hover:-translate-y-2 md:hover:border-[#FFD54A]/45 md:hover:shadow-[0_18px_38px_rgba(0,0,0,.58)]`}
                    >
                      <div className="absolute inset-0 bg-[#0a0d0d]" />

                      <img
                        src={item.image}
                        alt={item.title}
                        className={`absolute inset-0 h-full w-full scale-[1.05] object-cover object-center rounded-md transition duration-300 ${
                          owned ? "brightness-110" : "brightness-[0.92]"
                        }`}
                      />

                      {/* Technical scan overlay */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                      <div className="pointer-events-none absolute inset-0 border border-white/[0.04]" />

                      <div className="pointer-events-none absolute left-2 top-2 flex items-center gap-1.5">
                        <span
                          className={`h-1.5 w-1.5 ${
                            owned
                              ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.9)]"
                              : "bg-zinc-600"
                          }`}
                        />
                        <span className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-white/90">
                          ASSET {String(item.id).padStart(2, "0")}
                        </span>
                      </div>

                      {owned && (
                        <div className="pointer-events-none absolute right-2 top-2 flex h-6 w-6 items-center justify-center border border-emerald-400/40 bg-[#07100d]/90 font-mono text-[10px] font-black text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,.15)]">
                          ✓
                        </div>
                      )}

                      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-2.5">
                        <div className="font-['Oxanium'] text-[10px] font-black uppercase leading-tight text-white sm:text-[11px]">
                          {item.title}
                        </div>
                        <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.16em] text-[#FFD54A]/85">
                          {owned ? "COLLECTED" : "AVAILABLE"}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-white/[0.05] pt-2">
                <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-zinc-400">
                  OTHER MERCH / PLUSH NODE
                </span>
                <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-zinc-400">
                  06 CARDLESS ASSETS
                </span>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default LeapingPonies;