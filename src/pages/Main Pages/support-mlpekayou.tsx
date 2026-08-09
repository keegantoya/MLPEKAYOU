import "@fontsource/oxanium/400.css";
import "@fontsource/oxanium/600.css";
import "@fontsource/oxanium/700.css";

export default function Support() {
  const products = [
    {
      name: "Discord",
      category: "TCG",
      price: "$59.80",
      image: "/set-pictures/discordselling.webp",
      scale: "scale-125",
      disclaimer:
        "Kayou US gave enough Discord promos to give one out for every two boxes. Last stream will be 08/10/2026. Discord will not be restocked to make room for Nightmare Night TCG.",
      link: "https://stonestradingco.com/collections/my-little-pony/products/discord",
    },
    {
      name: "Star 1 Booster Box",
      category: "Star",
      price: "$127.84",
      image: "/set-pictures/staronebox.webp",
      scale: "scale-115",
      disclaimer:
        "Use code MLPEKAYOU at checkout for 20% off any purchase of Star 1. Once the current stock sells out, this will not be back!",
      link: "https://stonestradingco.com/collections/my-little-pony/products/kayou-my-little-pony-friendship-eternal-cards-star-edition-english-series-1-display-box",
    },
    {
      name: "Moon 3 Booster Box",
      category: "Moon",
      price: "$47.88",
      image: "/set-pictures/moonthreebox.webp",
      scale: "scale-95",
      disclaimer:
        "To make way for Moon 4, the current stock of Moon 3 1st Ed. will be the last of our stock.",
      link: "https://stonestradingco.com/collections/my-little-pony/products/kayou-my-little-pony-friendship-eternal-cards-moon-edition-english-series-3-display-box",
    },
    {
      name: "Fun Moments 3 Booster Box PREORDER",
      category: "Fun Moments",
      price: "$39.80",
      image: "/set-pictures/funmomentsthreeboxstone.webp",
      scale: "scale-95",
      disclaimer:
        "To make way for Fun Moments 4, the current stock of Fun Moments 3 will be the last of our stock.",
      link: "https://stonestradingco.com/collections/my-little-pony/products/kayou-mlp-fun-moments-3-friendship-eternal",
    },
  ];

  return (
    <div
      className="min-h-screen overflow-hidden bg-[#090909] text-white"
      style={{ fontFamily: '"Oxanium", sans-serif' }}
    >
      {/* ========================================================= */}
      {/* GLOBAL BACKGROUND SYSTEM */}
      {/* ========================================================= */}

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Technical grid */}
        <div
          className="absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,213,74,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(255,213,74,0.55) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        {/* Smaller grid */}
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "10px 10px",
          }}
        />

        {/* Top center reactor glow */}
        <div className="absolute left-1/2 top-[-350px] h-[750px] w-[1000px] -translate-x-1/2 rounded-full bg-yellow-400/[0.055] blur-[180px]" />

        {/* Side glows */}
        <div className="absolute left-[-250px] top-[25%] h-[600px] w-[600px] rounded-full bg-yellow-500/[0.025] blur-[160px]" />

        <div className="absolute right-[-300px] top-[55%] h-[700px] w-[700px] rounded-full bg-amber-400/[0.025] blur-[180px]" />

        {/* Scanline */}
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 5px)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1500px] px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:py-8">
        {/* ========================================================= */}
        {/* TOP SYSTEM BAR */}
        {/* ========================================================= */}

        <div className="mb-4 flex items-center justify-between border-y border-yellow-400/10 bg-[#0d0d0d]/80 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.25em] text-zinc-600 backdrop-blur-sm sm:px-5">
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.9)]" />
            <span>MLPEKAYOU // SUPPORT NETWORK</span>
          </div>

          <div className="hidden items-center gap-5 sm:flex">
            <span>SYS.STATUS: ONLINE</span>
            <span className="text-yellow-400/50">SECURE CHANNEL</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* HERO / COMMAND PANEL */}
        {/* ========================================================= */}

        <section className="relative mb-10 overflow-hidden border border-yellow-400/25 bg-[#111111] shadow-[0_0_80px_rgba(250,204,21,0.025)]">
          {/* Outer technical corners */}
          <div className="absolute left-0 top-0 h-16 w-16 border-l border-t border-yellow-400/60" />
          <div className="absolute right-0 top-0 h-16 w-16 border-r border-t border-yellow-400/30" />
          <div className="absolute bottom-0 left-0 h-16 w-16 border-b border-l border-yellow-400/30" />
          <div className="absolute bottom-0 right-0 h-16 w-16 border-b border-r border-yellow-400/60" />

          {/* Horizontal scan lines */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.025] [background-image:repeating-linear-gradient(0deg,#fff_0px,#fff_1px,transparent_1px,transparent_7px)]" />

          {/* Hero grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(250,204,21,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(250,204,21,0.6) 1px, transparent 1px)",
              backgroundSize: "70px 70px",
            }}
          />

          {/* Reactor glow */}
          <div className="pointer-events-none absolute right-[-180px] top-[-220px] h-[600px] w-[600px] rounded-full bg-yellow-400/[0.075] blur-[130px]" />

          <div className="relative grid lg:grid-cols-[1fr_330px]">
            {/* Main hero content */}
            <div className="relative p-7 sm:p-10 lg:p-14">
{/* System identifier */}
<div className="mb-5 flex items-center gap-3">
  <span className="font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-yellow-400">
    SYSTEM MODULE 03
  </span>

  <div className="h-px w-10 bg-yellow-400/40" />

  <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-zinc-600">
    COMMUNITY FUNDING
  </span>
</div>

<h1 className="max-w-3xl text-3xl font-bold uppercase leading-none tracking-tight text-white sm:text-4xl lg:text-5xl">
  Support{" "}
  <span className="text-yellow-300 drop-shadow-[0_0_14px_rgba(250,204,21,0.15)]">
    MLPEKayou
  </span>
</h1>

<div className="mt-5 flex items-center gap-2">
  <div className="h-[3px] w-12 bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.6)]" />
  <div className="h-[3px] w-2 bg-yellow-400/40" />
  <div className="h-[3px] w-1.5 bg-yellow-400/20" />
</div>

<p className="mt-5 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-[15px]">
  Every purchase helps support MLPEKayou while growing your
  collection. Everything will always be MSRP with spontaneous
  Discounts, join the Discord server to find them!
</p>
              {/* Status modules */}
              <div className="mt-9 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="border border-yellow-400/20 bg-[#0b0b0b]/80 p-3">
                  <div className="mb-2 font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-600">
                    NETWORK
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold uppercase text-yellow-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 shadow-[0_0_7px_rgba(250,204,21,0.9)]" />
                    ACTIVE
                  </div>
                </div>

                <div className="border border-zinc-800 bg-[#0b0b0b]/80 p-3">
                  <div className="mb-2 font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-600">
                    PARTNERS
                  </div>

                  <div className="text-xs font-semibold uppercase text-zinc-300">
                    VERIFIED
                  </div>
                </div>

                <div className="hidden border border-zinc-800 bg-[#0b0b0b]/80 p-3 sm:block">
                  <div className="mb-2 font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-600">
                    ORDERS
                  </div>

                  <div className="text-xs font-semibold uppercase text-zinc-300">
                    EXTERNAL SOURCES
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom status strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-yellow-400/10 bg-[#0b0b0b] px-5 py-3 font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-600">
            <span>MLPEKAYOU / COMMUNITY / SUPPORT</span>
            <span className="text-yellow-400/50">
              DIRECT PARTNER PURCHASE SYSTEM
            </span>
          </div>
        </section>

        {/* ========================================================= */}
        {/* PURCHASE HEADER */}
        {/* ========================================================= */}

        <section>
          <div className="mb-6 border border-zinc-800 bg-[#0e0e0e]">
            <div className="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-yellow-400">
                    MODULE 01
                  </span>

                  <div className="h-px w-8 bg-yellow-400/30" />
                </div>

                <h2 className="text-2xl font-bold uppercase tracking-tight sm:text-3xl">
                  How to Purchase
                </h2>

                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-yellow-400/50">
                  AVAILABLE PRODUCT INVENTORY
                </p>
              </div>

              <div className="flex items-center gap-3 border border-zinc-800 bg-[#090909] px-4 py-3">
                <span className="h-2 w-2 animate-pulse rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]" />

                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">
                  LIVE CATALOG
                </span>
              </div>
            </div>

            <div className="border-t border-zinc-800 px-5 py-4 sm:px-6">
              <p className="max-w-6xl text-sm leading-6 text-zinc-400">
                Clicking a product below will redirect you to a partner&apos;s
                page. Any My Little Pony orders placed on the partner&apos;s
                page will be shipped and fulfilled by the developer of
                MLPEKayou. This will also be the same way to purchase for
                Discord streams. Thank you for your support! This will begin
                around 07/09/2026.
              </p>
            </div>
          </div>

          {/* ========================================================= */}
          {/* PRODUCT GRID */}
          {/* ========================================================= */}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {products.map((product, index) => (
              <a
                key={product.name}
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex min-h-[570px] flex-col overflow-hidden border border-zinc-800 bg-[#111111] transition-all duration-300 hover:-translate-y-1 hover:border-yellow-400/60 hover:bg-[#141414] hover:shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_35px_rgba(250,204,21,0.05)]"
              >
                {/* Technical corner brackets */}
                <div className="absolute left-0 top-0 z-20 h-8 w-8 border-l border-t border-yellow-400/0 transition-colors duration-300 group-hover:border-yellow-400/70" />
                <div className="absolute right-0 top-0 z-20 h-8 w-8 border-r border-t border-yellow-400/0 transition-colors duration-300 group-hover:border-yellow-400/70" />
                <div className="absolute bottom-0 left-0 z-20 h-8 w-8 border-b border-l border-yellow-400/0 transition-colors duration-300 group-hover:border-yellow-400/70" />
                <div className="absolute bottom-0 right-0 z-20 h-8 w-8 border-b border-r border-yellow-400/0 transition-colors duration-300 group-hover:border-yellow-400/70" />

                {/* Product number */}
                <div className="absolute right-4 top-4 z-20 font-mono text-[9px] tracking-[0.2em] text-zinc-600">
                  0{index + 1}
                </div>

                {/* Product image system */}
                <div className="relative h-72 overflow-hidden border-b border-zinc-800 bg-[#090909]">
                  {/* Image grid */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.08]"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(250,204,21,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(250,204,21,0.5) 1px, transparent 1px)",
                      backgroundSize: "28px 28px",
                    }}
                  />

                  {/* Product spotlight */}
                  <div className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-400/[0.045] blur-[70px] transition-all duration-500 group-hover:bg-yellow-400/[0.08]" />

                  {/* Image */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className={`relative z-10 h-full w-full object-contain ${product.scale} transition-transform duration-500 group-hover:scale-[1.04]`}
                  />

                  {/* Image scanline */}
                  <div className="pointer-events-none absolute inset-0 z-10 opacity-[0.025] [background-image:repeating-linear-gradient(0deg,#fff_0px,#fff_1px,transparent_1px,transparent_6px)]" />

                  {/* Bottom fade */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-[#111111] to-transparent" />

                  {/* Category */}
                  <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-yellow-400 shadow-[0_0_7px_rgba(250,204,21,0.9)]" />

                    <span className="font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-yellow-300">
                      {product.category}
                    </span>
                  </div>
                </div>

                {/* Product content */}
                <div className="relative flex flex-1 flex-col p-5">
                  {/* Product ID */}
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-600">
                      PRODUCT NODE
                    </span>

                    <span className="font-mono text-[8px] text-zinc-700">
                      {String(index + 1).padStart(2, "0")} / 04
                    </span>
                  </div>

                  <h3 className="min-h-[52px] text-lg font-bold uppercase leading-6 text-white transition-colors group-hover:text-yellow-100">
                    {product.name}
                  </h3>

                  {/* Price terminal */}
                  <div className="mt-5 border border-zinc-800 bg-[#0b0b0b] p-4 transition-colors group-hover:border-yellow-400/20">
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-600">
                          CURRENT PRICE
                        </div>

                        <div className="mt-1 text-3xl font-bold tracking-tight text-yellow-400">
                          {product.price}
                        </div>
                      </div>

                      <div className="mb-2 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                        <span className="font-mono text-[7px] uppercase tracking-wider text-zinc-600">
                          READY
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="mt-3 min-h-[60px]">
                    {product.disclaimer ? (
                      <div className="border-l-2 border-yellow-400/50 bg-yellow-400/[0.035] px-3 py-2">
                        <p className="text-[11px] leading-5 text-yellow-200/75">
                          {product.disclaimer}
                        </p>
                      </div>
                    ) : (
                      <div className="h-[60px]" />
                    )}
                  </div>

                  {/* Purchase control */}
                  <div className="mt-auto pt-5">
                    <div className="relative flex items-center justify-between overflow-hidden border border-yellow-400/25 bg-yellow-400/[0.04] px-4 py-3.5 transition-all duration-200 group-hover:border-yellow-400 group-hover:bg-yellow-400 group-hover:text-black">
                      {/* Button sweep */}
                      <div className="absolute inset-y-0 left-[-100%] w-full bg-yellow-300/20 transition-all duration-500 group-hover:left-[100%]" />

                      <span className="relative font-mono text-[10px] font-bold uppercase tracking-[0.2em]">
                        Access Product
                      </span>

                      <span className="relative text-lg transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* INFORMATION MODULES */}
        {/* ========================================================= */}

        <section className="mt-10 grid gap-4 lg:grid-cols-2">
          {/* Why buy */}
          <div className="relative overflow-hidden border border-zinc-800 bg-[#0f0f0f]">
            {/* Grid */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.025]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(250,204,21,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(250,204,21,0.7) 1px, transparent 1px)",
                backgroundSize: "35px 35px",
              }}
            />

            <div className="relative">
              <div className="flex items-center justify-between border-b border-zinc-800 bg-[#0b0b0b] px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-yellow-400">
                    MODULE 02
                  </span>

                  <div className="h-px w-8 bg-yellow-400/30" />
                </div>

                <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-700">
                  BENEFITS
                </span>
              </div>

              <div className="p-6 sm:p-8">
                <h3 className="text-2xl font-bold uppercase text-yellow-300 sm:text-3xl">
                  Why Buy Through MLPEKayou?
                </h3>

                <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-600">
                  DIRECT COMMUNITY SUPPORT
                </p>

                <div className="mt-7 space-y-2">
                  <div className="group flex items-center gap-4 border border-zinc-800 bg-[#0b0b0b] px-4 py-4 transition-colors hover:border-yellow-400/30">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-yellow-400/30 bg-yellow-400/[0.04] font-mono text-xs text-yellow-400">
                      01
                    </span>

                    <span className="text-sm text-zinc-300">
                      Helps cover website hosting costs.
                    </span>
                  </div>

                  <div className="group flex items-center gap-4 border border-zinc-800 bg-[#0b0b0b] px-4 py-4 transition-colors hover:border-yellow-400/30">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-yellow-400/30 bg-yellow-400/[0.04] font-mono text-xs text-yellow-400">
                      02
                    </span>

                    <span className="text-sm text-zinc-300">
                      Supports development of new features.
                    </span>
                  </div>

                  <div className="group flex items-center gap-4 border border-zinc-800 bg-[#0b0b0b] px-4 py-4 transition-colors hover:border-yellow-400/30">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-yellow-400/30 bg-yellow-400/[0.04] font-mono text-xs text-yellow-400">
                      03
                    </span>

                    <span className="text-sm text-zinc-300">
                      Keeps the community strong and centralized.
                    </span>
                  </div>

                  <div className="group flex items-center gap-4 border border-zinc-800 bg-[#0b0b0b] px-4 py-4 transition-colors hover:border-yellow-400/30">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-yellow-400/30 bg-yellow-400/[0.04] font-mono text-xs text-yellow-400">
                      04
                    </span>

                    <span className="text-sm text-zinc-300">
                      Supports the My Little Pony Kayou community.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coming soon */}
          <div className="relative overflow-hidden border border-yellow-400/20 bg-[#0f0f0f]">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(250,204,21,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(250,204,21,0.7) 1px, transparent 1px)",
                backgroundSize: "35px 35px",
              }}
            />

            <div className="pointer-events-none absolute right-[-100px] top-[-100px] h-72 w-72 rounded-full bg-yellow-400/[0.055] blur-[100px]" />

            <div className="relative">
              <div className="flex items-center justify-between border-b border-yellow-400/10 bg-[#0b0b0b] px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-yellow-400">
                    MODULE 03
                  </span>

                  <div className="h-px w-8 bg-yellow-400/30" />
                </div>

                <span className="flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.2em] text-yellow-400/60">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-400" />
                  IN DEVELOPMENT
                </span>
              </div>

              <div className="p-6 sm:p-8">
                <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-yellow-400/60">
                  EXPANSION PIPELINE
                </p>

                <h3 className="mt-3 text-2xl font-bold uppercase text-yellow-300 sm:text-3xl">
                  More Products
                  <span className="block">Coming Soon</span>
                </h3>

                <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-400">
                  Keep an eye out here to see what Keegan will have availabe next. When a product is ready for purchase, it will appear above.
                </p>

                <div className="mt-7 grid grid-cols-2 gap-2">
                  <div className="border border-zinc-800 bg-[#0b0b0b] p-3">
                    <div className="font-mono text-[8px] uppercase tracking-wider text-zinc-600">
                      QUEUED
                    </div>

                    <div className="mt-1 text-xs font-semibold uppercase text-zinc-300">
                      Moon Four
                    </div>
                  </div>

                  <div className="border border-zinc-800 bg-[#0b0b0b] p-3">
                    <div className="font-mono text-[8px] uppercase tracking-wider text-zinc-600">
                      QUEUED
                    </div>

                    <div className="mt-1 text-xs font-semibold uppercase text-zinc-300">
                      Nightmare Night
                    </div>
                  </div>

                  <div className="border border-zinc-800 bg-[#0b0b0b] p-3">
                    <div className="font-mono text-[8px] uppercase tracking-wider text-zinc-600">
                      QUEUED
                    </div>

                    <div className="mt-1 text-xs font-semibold uppercase text-zinc-300">
                      Nightmare Night Binder Sets
                    </div>
                  </div>

                  <div className="border border-zinc-800 bg-[#0b0b0b] p-3">
                    <div className="font-mono text-[8px] uppercase tracking-wider text-zinc-600">
                      QUEUED
                    </div>

                    <div className="mt-1 text-xs font-semibold uppercase text-zinc-300">
                      Fun Moments Four
                    </div>
                  </div>

                  <div className="border border-zinc-800 bg-[#0b0b0b] p-3">
                    <div className="font-mono text-[8px] uppercase tracking-wider text-zinc-600">
                      QUEUED
                    </div>

                    <div className="mt-1 text-xs font-semibold uppercase text-zinc-300">
                      Chinese Moon Twelve
                    </div>
                  </div>

                  <div className="border border-zinc-800 bg-[#0b0b0b] p-3">
                    <div className="font-mono text-[8px] uppercase tracking-wider text-zinc-600">
                      QUEUED
                    </div>

                    <div className="mt-1 text-xs font-semibold uppercase text-zinc-300">
                      Chinese Mistmane Binder Sets
                    </div>
                  </div>

                  <div className="border border-zinc-800 bg-[#0b0b0b] p-3">
                    <div className="font-mono text-[8px] uppercase tracking-wider text-zinc-600">
                      QUEUED
                    </div>

                    <div className="mt-1 text-xs font-semibold uppercase text-zinc-300">
                      Kayou Raffle Tickets
                    </div>
                  </div>

                  <div className="border border-yellow-400/15 bg-yellow-400/[0.025] p-3">
                    <div className="font-mono text-[8px] uppercase tracking-wider text-yellow-400/50">
                      STATUS
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-xs font-semibold uppercase text-yellow-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
                      EXPANDING
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* FOOTER SYSTEM BAR */}
        {/* ========================================================= */}

        <div className="mt-6 flex flex-col gap-2 border-t border-zinc-800 pt-4 font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-700 sm:flex-row sm:items-center sm:justify-between">
          <span>MLPEKAYOU // SUPPORT SYSTEM</span>

          <span className="text-yellow-400/30">
            CONNECTION ESTABLISHED // END OF MODULE
          </span>
        </div>
      </div>
    </div>
  );
}