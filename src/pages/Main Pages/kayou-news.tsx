import React, { useState } from "react";

type Product = {
  date: string;
  title: string;
  notes: string;
};

type Tab = "products" | "events";

export default function KayouNews() {
  const [activeTab, setActiveTab] = useState<Tab>("products");
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const upcomingProducts: Product[] = [
    {
      date: "August 2026",
      title: "My Little Pony TCG: Discord!",
      notes: "Will release on the seventh of August.",
    },
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

  const renderProducts = () => (
    <section className="overflow-hidden border border-white/[0.08] bg-[#111313] shadow-[0_24px_70px_rgba(0,0,0,.35)]">
      <div className="border-b border-white/[0.06] bg-[#0c0e0e] px-5 py-4 sm:px-7">
        <div className="mb-1 flex items-center gap-2">
          <span className="h-1.5 w-1.5 bg-[#FFD400] shadow-[0_0_9px_rgba(255,212,0,.8)]" />
          <span className="font-mono text-[6px] font-bold uppercase tracking-[0.25em] text-[#FFD400]/55">
            RELEASE INTELLIGENCE
          </span>
        </div>

        <div className="flex items-end justify-between gap-4">
          <h2 className="font-['Oxanium'] text-xl font-black uppercase tracking-[0.08em] text-white sm:text-2xl">
            Upcoming Products
          </h2>

          <span className="hidden font-mono text-[6px] uppercase tracking-[0.18em] text-white/20 sm:block">
            {upcomingProducts.length.toString().padStart(2, "0")} ENTRIES
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="grid gap-3 lg:grid-cols-2">
          {upcomingProducts.map((product, index) => (
            <article
              key={index}
              className="group relative overflow-hidden border border-white/[0.07] bg-[#0b0d0d] p-4 transition-all duration-200 hover:border-[#FFD400]/30 hover:bg-[#101313]"
            >
              <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-[#FFD400]/70 via-[#FFD400]/10 to-transparent" />

              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="font-mono text-[6px] font-bold uppercase tracking-[0.2em] text-[#FFD400]/65">
                  RELEASE WINDOW
                </span>

                <span className="border border-[#FFD400]/15 bg-[#FFD400]/[0.04] px-2 py-1 font-mono text-[6px] font-bold uppercase tracking-[0.12em] text-[#FFD400]/65">
                  {product.date}
                </span>
              </div>

              <h3 className="font-['Oxanium'] text-base font-bold uppercase leading-tight tracking-[0.03em] text-white transition-colors group-hover:text-[#f5d37a] sm:text-lg">
                {product.title}
              </h3>

              <div className="mt-4 border-t border-white/[0.05] pt-3">
                <span className="font-mono text-[5px] font-bold uppercase tracking-[0.18em] text-white/20">
                  INTEL
                </span>

                <p className="mt-1 font-mono text-[8px] leading-relaxed text-white/45">
                  {product.notes || "—"}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );

  const renderEvents = () => (
    <section className="relative overflow-hidden border border-white/[0.08] bg-[#111313] shadow-[0_24px_70px_rgba(0,0,0,.35)]">
      <div className="border-b border-white/[0.06] bg-[#0c0e0e] px-5 py-4 sm:px-7">
        <div className="mb-1 flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse bg-[#FFD400] shadow-[0_0_9px_rgba(255,212,0,.8)]" />
          <span className="font-mono text-[6px] font-bold uppercase tracking-[0.25em] text-[#FFD400]/55">
            EVENT INTELLIGENCE
          </span>
        </div>

        <h2 className="font-['Oxanium'] text-xl font-black uppercase tracking-[0.08em] text-white sm:text-2xl">
          New Events
        </h2>
      </div>

      <div className="px-5 py-12 text-center sm:px-10 sm:py-16">
        <div className="mx-auto flex h-16 w-16 items-center justify-center border border-[#FFD400]/20 bg-[#FFD400]/[0.03] shadow-[0_0_30px_rgba(255,212,0,.05)]">
          <span className="font-['Oxanium'] text-2xl font-black text-[#FFD400]/70">
            +
          </span>
        </div>

        <div className="mx-auto mt-6 max-w-xl">
          <div className="mb-2 font-mono text-[6px] font-bold uppercase tracking-[0.28em] text-[#FFD400]/50">
            AWAITING KAYOU INTEL
          </div>

          <p className="font-['Oxanium'] text-lg font-bold uppercase tracking-[0.03em] text-white sm:text-xl">
            New events will be announced when they are passed down by Kayou.
          </p>

          <p className="mt-3 font-mono text-[7px] uppercase leading-relaxed tracking-[0.14em] text-white/20">
            No current event schedule has been provided.
          </p>
        </div>
      </div>

      <div className="border-t border-white/[0.05] bg-[#0c0e0e] px-5 py-2.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[5px] uppercase tracking-[0.18em] text-white/15">
            EVENT FEED
          </span>
          <span className="font-mono text-[5px] uppercase tracking-[0.18em] text-[#FFD400]/35">
            STANDBY
          </span>
        </div>
      </div>
    </section>
  );

  return (
    <div
      className="min-h-screen overflow-hidden bg-[#090a0a] text-white"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMouse({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }}
    >
      {/* TECH GRID */}
      <div
        className="pointer-events-none fixed inset-0 opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,212,0,.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,212,0,.025) 1px, transparent 1px)
          `,
          backgroundSize: "42px 42px",
        }}
      />

      {/* AMBIENT CURSOR GLOW */}
      <div
        className="pointer-events-none absolute h-[460px] w-[460px] rounded-full bg-[#FFD400]/[0.035] blur-[100px]"
        style={{
          left: mouse.x - 230,
          top: mouse.y - 230,
        }}
      />

      {/* HERO */}
      <section className="relative border-b border-white/[0.07] bg-[#0c0e0e]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,212,0,.07),transparent_42%)]" />

        <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-8 sm:px-8 sm:pb-12 sm:pt-10">
          <div className="mb-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 bg-[#FFD400] shadow-[0_0_12px_rgba(255,212,0,.9)]" />
              <span className="font-mono text-[7px] font-bold uppercase tracking-[0.28em] text-[#FFD400]/60">
                KAYOU INTELLIGENCE NETWORK
              </span>
            </div>

            <span className="font-mono text-[6px] uppercase tracking-[0.2em] text-white/15">
              MODULE 07 // LIVE FEED
            </span>
          </div>

          <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="h-px w-10 bg-[#FFD400]/40" />
                <span className="font-mono text-[6px] font-bold uppercase tracking-[0.3em] text-[#FFD400]/45">
                  OFFICIAL RELEASE INTELLIGENCE
                </span>
              </div>

              <h1 className="font-['Oxanium'] text-4xl font-black uppercase leading-none tracking-[0.04em] text-[#f5d37a] sm:text-6xl">
                Kayou News
              </h1>

              <p className="mt-5 max-w-2xl font-mono text-[8px] uppercase leading-relaxed tracking-[0.14em] text-white/30 sm:text-[9px]">
                Official announcements, release dates, product launches, and
                future event intelligence.
              </p>
            </div>

            <div className="grid grid-cols-2 border border-white/[0.07] bg-[#101212]">
              <div className="border-r border-white/[0.06] px-5 py-4">
                <div className="font-mono text-[5px] uppercase tracking-[0.2em] text-white/20">
                  PRODUCTS
                </div>
                <div className="mt-1 font-['Oxanium'] text-2xl font-black text-[#FFD400]">
                  {upcomingProducts.length}
                </div>
              </div>

              <div className="px-5 py-4">
                <div className="font-mono text-[5px] uppercase tracking-[0.2em] text-white/20">
                  EVENTS
                </div>
                <div className="mt-1 font-['Oxanium'] text-2xl font-black text-white/35">
                  —
                </div>
              </div>
            </div>
          </div>

          {/* NAV MODULES */}
          <div className="mt-9 flex flex-wrap gap-2">
            {[
              { id: "products", label: "Upcoming Products" },
              { id: "events", label: "New Events" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`group relative border px-4 py-2.5 font-mono text-[7px] font-bold uppercase tracking-[0.16em] transition-all ${
                  activeTab === tab.id
                    ? "border-[#FFD400]/60 bg-[#FFD400] text-[#0b0b0b]"
                    : "border-white/[0.08] bg-[#111313] text-white/35 hover:border-[#FFD400]/35 hover:text-[#FFD400]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <main className="relative mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        {activeTab === "products" ? renderProducts() : renderEvents()}
      </main>

      {/* FOOTER STATUS */}
      <footer className="border-t border-white/[0.06] bg-[#0c0e0e]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8">
          <span className="font-mono text-[5px] uppercase tracking-[0.2em] text-white/15">
            MLPEKAYOU // KAYOU NEWS
          </span>

          <div className="flex items-center gap-2">
            <span className="h-1 w-1 bg-emerald-400 shadow-[0_0_7px_rgba(52,211,153,.8)]" />
            <span className="font-mono text-[5px] uppercase tracking-[0.18em] text-emerald-400/40">
              FEED ONLINE
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}