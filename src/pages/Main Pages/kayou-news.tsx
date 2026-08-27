import React, { useEffect, useState } from "react";
type Product = {
  date: string;
  title: string;
  notes: string;
};
type Tab = "products" | "events";
export default function KayouNews() {
  const [activeTab, setActiveTab] = useState<Tab>("products");
  const [isLightMode, setIsLightMode] = useState(
    () => document.documentElement.dataset.theme === "light"
  );
const upcomingProducts: Product[] = [
    {
      date: "October 2026",
      title: "Moon: Volume Four",
      notes: "U.S. Moon Four will be a reprint of Chinese Moon 11.",
    },
    {
      date: "November 2026",
      title: "Fun Moments: Volume Four",
      notes: "No allowed notes at this time.",
    },
    {
      date: "October 2026",
      title: "My Little Pony TCG: Nightmare Night",
      notes: "No allowed notes at this time.",
    },
    {
      date: "October 2026",
      title: "My Little Pony TCG: Nightmare Night Binder Set",
      notes: "No allowed notes at this time.",
    },
  ];
  useEffect(() => {
    const syncTheme = () => {
      setIsLightMode(document.documentElement.dataset.theme === "light");
    };
    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    return () => observer.disconnect();
  }, []);
  const renderProducts = () => (
    <section
      className={`rounded-[28px] border p-4 sm:p-6 ${
        isLightMode
          ? "border-black/10 bg-white"
          : "border-white/[0.08] bg-[#151718]"
      }`}
    >
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div
            className={`text-sm font-semibold ${
              isLightMode ? "text-[#725700]" : "text-[#FFE27A]"
            }`}
          >
            Release Calendar
          </div>
          <h2
            className={`mt-1 text-2xl font-semibold tracking-tight sm:text-3xl ${
              isLightMode ? "text-zinc-950" : "text-white"
            }`}
          >
            Upcoming Products
          </h2>
        </div>
        <div className={`text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
          {upcomingProducts.length} upcoming releases
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {upcomingProducts.map((product, index) => (
          <article
            key={index}
            className={`rounded-2xl border p-4 transition-colors sm:p-5 ${
              isLightMode
                ? "border-black/10 bg-zinc-50 hover:bg-zinc-100/70"
                : "border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.05]"
            }`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h3
                  className={`text-lg font-semibold leading-snug sm:text-xl ${
                    isLightMode ? "text-zinc-950" : "text-white"
                  }`}
                >
                  {product.title}
                </h3>
                <p
                  className={`mt-2 text-sm leading-6 sm:text-base ${
                    isLightMode ? "text-zinc-600" : "text-zinc-400"
                  }`}
                >
                  {product.notes || "—"}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold ${
                  isLightMode
                    ? "border-[#8a6a00]/20 bg-[#c89d13]/10 text-[#725700]"
                    : "border-[#FFD54A]/20 bg-[#FFD54A]/[0.08] text-[#FFE27A]"
                }`}
              >
                {product.date}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
  const renderEvents = () => (
    <section
      className={`rounded-[28px] border p-5 sm:p-7 ${
        isLightMode
          ? "border-black/10 bg-white"
          : "border-white/[0.08] bg-[#151718]"
      }`}
    >
      <div className="max-w-2xl">
        <div
          className={`text-sm font-semibold ${
            isLightMode ? "text-[#725700]" : "text-[#FFE27A]"
          }`}
        >
          Events
        </div>
        <h2
          className={`mt-1 text-2xl font-semibold tracking-tight sm:text-3xl ${
            isLightMode ? "text-zinc-950" : "text-white"
          }`}
        >
          New Events
        </h2>
        <div
          className={`mt-5 rounded-2xl border p-6 sm:p-8 ${
            isLightMode
              ? "border-black/10 bg-zinc-50"
              : "border-white/[0.07] bg-white/[0.03]"
          }`}
        >
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl font-medium ${
              isLightMode
                ? "bg-[#c89d13]/10 text-[#725700]"
                : "bg-[#FFD54A]/10 text-[#FFE27A]"
            }`}
          >
            +
          </div>
          <h3
            className={`mt-5 text-xl font-semibold sm:text-2xl ${
              isLightMode ? "text-zinc-950" : "text-white"
            }`}
          >
            No new events yet
          </h3>
          <p
            className={`mt-2 text-sm leading-6 sm:text-base ${
              isLightMode ? "text-zinc-600" : "text-zinc-400"
            }`}
          >
            New events will be announced when they are passed down by Kayou.
          </p>
          <p className={`mt-2 text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-500"}`}>
            No current event schedule has been provided.
          </p>
        </div>
      </div>
    </section>
  );
  return (
    <div
      className={`min-h-screen pb-24 transition-colors duration-200 sm:pb-10 ${
        isLightMode ? "bg-[#f5f5f3] text-zinc-900" : "bg-[#0d0f10] text-white"
      }`}
    >
      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
        <section
          className={`relative overflow-hidden rounded-[30px] border ${
            isLightMode
              ? "border-black/10 bg-white shadow-[0_14px_36px_rgba(0,0,0,.05)]"
              : "border-white/[0.08] bg-[#151718]"
          }`}
        >
          <div
            className={`absolute inset-0 bg-cover bg-center ${
              isLightMode ? "opacity-[0.08]" : "opacity-[0.07]"
            }`}
            style={{ backgroundImage: "url('/website-assets/exploreequestria.webp')" }}
          />
          <div
            className={`absolute inset-0 ${
              isLightMode
                ? "bg-gradient-to-r from-white via-white/95 to-white/80"
                : "bg-gradient-to-r from-[#151718] via-[#151718]/95 to-[#151718]/80"
            }`}
          />
          <div className="relative p-5 sm:p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div
                  className={`text-sm font-semibold ${
                    isLightMode ? "text-[#725700]" : "text-[#FFE27A]"
                  }`}
                >
                  News & Releases
                </div>
                <h1
                  className={`mt-1 text-4xl font-semibold tracking-tight sm:text-5xl ${
                    isLightMode ? "text-zinc-950" : "text-white"
                  }`}
                >
                  Kayou News
                </h1>
                <p
                  className={`mt-3 max-w-2xl text-base leading-7 ${
                    isLightMode ? "text-zinc-600" : "text-zinc-400"
                  }`}
                >
                  Official announcements, release dates, product launches, and future event information.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:min-w-[290px]">
                <div
                  className={`rounded-2xl border p-4 ${
                    isLightMode
                      ? "border-black/10 bg-white/85"
                      : "border-white/10 bg-black/20"
                  }`}
                >
                  <div className={`text-sm font-medium ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                    Products
                  </div>
                  <div className="mt-1 text-3xl font-semibold">{upcomingProducts.length}</div>
                </div>
                <div
                  className={`rounded-2xl border p-4 ${
                    isLightMode
                      ? "border-black/10 bg-white/85"
                      : "border-white/10 bg-black/20"
                  }`}
                >
                  <div className={`text-sm font-medium ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                    Events
                  </div>
                  <div className={`mt-1 text-3xl font-semibold ${isLightMode ? "text-zinc-400" : "text-zinc-500"}`}>
                    —
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-2 sm:max-w-md">
              <button
                type="button"
                onClick={() => setActiveTab("products")}
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                  activeTab === "products"
                    ? "bg-[#FFD54A] text-black"
                    : isLightMode
                    ? "border border-black/10 bg-white/70 text-zinc-600 hover:bg-zinc-100"
                    : "border border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]"
                }`}
              >
                Upcoming Products
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("events")}
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                  activeTab === "events"
                    ? "bg-[#FFD54A] text-black"
                    : isLightMode
                    ? "border border-black/10 bg-white/70 text-zinc-600 hover:bg-zinc-100"
                    : "border border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]"
                }`}
              >
                New Events
              </button>
            </div>
          </div>
        </section>
        <div className="mt-4">
          {activeTab === "products" ? renderProducts() : renderEvents()}
        </div>
      </main>
    </div>
  );
}
