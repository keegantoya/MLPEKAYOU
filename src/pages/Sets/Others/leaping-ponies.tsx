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
    <div className="min-h-screen bg-[#f5f5f7] pb-24 text-zinc-900 transition-colors dark:bg-[#101112] dark:text-white sm:pb-8">
      <div className="mx-auto max-w-[1800px] px-3 py-3 sm:px-6 sm:py-6">
        <header className="mb-4 flex items-center justify-between gap-3 rounded-[24px] border border-black/10 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#1c1c1e] sm:p-4">
          <button
            type="button"
            onClick={() => navigate("/collections")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xl font-semibold text-zinc-700 transition hover:bg-zinc-200 active:scale-95 dark:bg-white/[0.08] dark:text-zinc-200 dark:hover:bg-white/[0.12]"
            aria-label="Back to collections"
          >
            ‹
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">
              Leaping Ponies
            </h1>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Tap a plush to mark it collected.
            </p>
          </div>
          <div className="shrink-0 rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-semibold text-zinc-600 dark:bg-white/[0.07] dark:text-zinc-300">
            {completedCount}/{merchItems.length}
          </div>
        </header>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="xl:sticky xl:top-[64px] xl:self-start">
            <div className="rounded-[24px] border border-black/10 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#1c1c1e] sm:p-4">
              <div>
                <h2 className="text-base font-semibold">Collection status</h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Six Leaping Ponies plush items.
                </p>
              </div>
              <div className="my-4 h-px bg-black/[0.07] dark:bg-white/[0.08]" />
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-2xl bg-zinc-100 px-3 py-3 dark:bg-white/[0.06]">
                  <div className="text-lg font-semibold">{completedCount}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">Collected</div>
                </div>
                <div className="rounded-2xl bg-zinc-100 px-3 py-3 dark:bg-white/[0.06]">
                  <div className="text-lg font-semibold">{remainingCount}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">Remaining</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  <span>Progress</span>
                  <span>{Math.round((completedCount / merchItems.length) * 100)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/[0.08]">
                  <div
                    className="h-full rounded-full bg-[#FFD54A] transition-all duration-500"
                    style={{
                      width: `${(completedCount / merchItems.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </aside>
          <main className="min-w-0">
            <section className="rounded-[24px] border border-black/10 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#1c1c1e] sm:p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold sm:text-lg">Plush collection</h2>
                  <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                    {merchItems.length} items
                  </p>
                </div>
                {completedCount === merchItems.length && (
                  <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                    Complete
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {merchItems.map((item) => {
                  const owned = completed.includes(item.id);
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className="group relative overflow-hidden rounded-2xl text-left transition-transform duration-200 ease-out focus:outline-none focus:ring-4 focus:ring-[#FFD54A]/20 md:hover:z-20 md:hover:scale-[1.035]"
                    >
                      <div className={`relative aspect-square overflow-hidden rounded-2xl border bg-zinc-100 shadow-sm transition-shadow duration-200 group-hover:shadow-lg dark:bg-white/[0.04] ${
                        owned
                          ? "border-[#FFD54A]/80"
                          : "border-black/10 dark:border-white/10"
                      }`}>
                        <img
                          src={item.image}
                          alt={item.title}
                          className="absolute inset-0 h-full w-full scale-[1.03] object-cover object-center"
                        />
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent px-3 pb-3 pt-10">
                          <div className="text-sm font-semibold text-white">
                            {item.title}
                          </div>
                        </div>
                        {owned && (
                          <div className="pointer-events-none absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white shadow-sm">
                            ✓
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};
export default LeapingPonies;
