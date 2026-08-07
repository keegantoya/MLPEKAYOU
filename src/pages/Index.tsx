import React, { useState } from "react";

type HomeTab = "updates" | "tutorial" | "resources" | "partnership";

export default function Index() {
  const [activeTab, setActiveTab] = useState<HomeTab>("updates");

  return (
    <main className="min-h-screen bg-[#111111] text-white">

      {/* Top Banner */}
      <section className="relative overflow-hidden border-b border-yellow-400/15 bg-[#171717]">

        {/* Background glow */}
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-yellow-400/10 blur-3xl" />

          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(250,204,21,0.06) 1px, transparent 1px),
                linear-gradient(90deg, rgba(250,204,21,0.06) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-8 py-10">

          <div className="text-center">
            <p className="mb-2 font-oxanium text-xs uppercase tracking-[0.6rem] text-yellow-400">
              Welcome To
            </p>

            <h1 className="font-oxanium text-5xl font-black uppercase tracking-[0.3rem] text-white">
              MLPEKAYOU
            </h1>

            <div className="mx-auto mt-4 h-1 w-28 rounded-full bg-yellow-400 shadow-[0_0_20px_#facc15]" />

<a
  href="https://discord.gg/mlpekayou"
  target="_blank"
  rel="noopener noreferrer"
  className="group mx-auto mt-6 flex w-fit transition-transform duration-300 hover:scale-105"
>
  <img
    src="/website-assets/discordlogo.webp"
    alt="Join the MLPEKAYOU Discord"
    className="h-14 w-auto drop-shadow-[0_0_20px_rgba(250,204,21,0.25)] transition-all duration-300 group-hover:drop-shadow-[0_0_35px_rgba(250,204,21,0.55)]"
  />
</a>
          </div>

          {/* Tabs */}
          <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { id: "updates", label: "UPDATES" },
              { id: "tutorial", label: "TUTORIAL" },
              { id: "resources", label: "RESOURCES" },
              { id: "partnership", label: "PARTNERSHIP" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as HomeTab)}
                className={`rounded-xl border px-6 py-4 font-oxanium text-sm font-bold uppercase tracking-[0.2em] transition-all duration-200 ${
                  activeTab === tab.id
                    ? "border-yellow-400 bg-yellow-400 text-black"
                    : "border-[#333] bg-[#1a1a1a] text-white hover:border-yellow-400 hover:text-yellow-400"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>

      </section>

      {/* Tab Content */}
      <section className="mx-auto max-w-7xl px-8 py-8">
        <div className="rounded-2xl border border-[#333] bg-[#1a1a1a] p-8">
          {activeTab === "updates" && (
  <div className="space-y-6">

    <div className="group relative overflow-hidden border border-[#3a3a3a] bg-[#151515]">

      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(250,204,21,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(250,204,21,0.04)_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Moving Scan Line */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/2 top-0 h-full w-1/3 skew-x-[-25deg] bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent animate-[scan_5s_linear_infinite]" />
      </div>

      {/* Accent Line */}
      <div className="absolute left-0 top-0 h-full w-[4px] bg-yellow-400" />

      {/* Corner Accents */}
      <div className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-yellow-400" />
      <div className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-yellow-400" />
      <div className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-yellow-400" />
      <div className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-yellow-400" />

      <div className="relative p-8">

        <div className="mb-6 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="h-3 w-3 bg-yellow-400 shadow-[0_0_12px_#facc15]" />

            <span className="font-oxanium text-xs font-bold uppercase tracking-[0.4em] text-yellow-400">
              WEBSITE UPDATE
            </span>

          </div>

          <span className="border border-[#404040] bg-[#1b1b1b] px-4 py-2 font-oxanium text-xs uppercase tracking-[0.2em] text-gray-400">
            08 / 07 / 2026
          </span>

        </div>

        <h2 className="font-oxanium text-3xl font-black uppercase tracking-[0.12em] text-white">
          Share Your Collection
        </h2>

        <div className="mt-4 h-px w-full bg-gradient-to-r from-yellow-400 via-yellow-400/30 to-transparent" />

        <p className="mt-6 max-w-4xl text-[15px] leading-8 text-gray-300">
          Click
          <span className="mx-2 border border-yellow-400 bg-yellow-400/10 px-2 py-1 font-semibold text-yellow-400">
            Share
          </span>
          in your profile to instantly create a public page that anyone can
          view. Share your
          <span className="font-semibold text-white"> ISO</span>,
          <span className="font-semibold text-white"> Wishlist</span>, and
          <span className="font-semibold text-white"> Trades</span> with
          collectors outside of MLPEKayou.
        </p>

      </div>

<div className="group relative overflow-hidden border border-[#3a3a3a] bg-[#151515]">

  {/* Background */}
  <div className="absolute inset-0 bg-[linear-gradient(rgba(250,204,21,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(250,204,21,0.04)_1px,transparent_1px)] bg-[size:32px_32px]" />

  {/* Moving Scan Line */}
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute -left-1/2 top-0 h-full w-1/3 skew-x-[-25deg] bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent animate-[scan_5s_linear_infinite]" />
  </div>

  {/* Accent Line */}
  <div className="absolute left-0 top-0 h-full w-[4px] bg-yellow-400" />

  {/* Corner Accents */}
  <div className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-yellow-400" />
  <div className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-yellow-400" />
  <div className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-yellow-400" />
  <div className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-yellow-400" />

  <div className="relative p-8">

    <div className="mb-6 flex items-center justify-between">

      <div className="flex items-center gap-3">

        <div className="h-3 w-3 bg-yellow-400 shadow-[0_0_12px_#facc15]" />

        <span className="font-oxanium text-xs font-bold uppercase tracking-[0.4em] text-yellow-400">
          LEADERBOARD
        </span>

      </div>

      <span className="border border-[#404040] bg-[#1b1b1b] px-4 py-2 font-oxanium text-xs uppercase tracking-[0.2em] text-gray-400">
        07 / 29 / 2026
      </span>

    </div>

    <h2 className="font-oxanium text-3xl font-black uppercase tracking-[0.12em] text-white">
      Leaderboard Under Construction
    </h2>

    <div className="mt-4 h-px w-full bg-gradient-to-r from-yellow-400 via-yellow-400/30 to-transparent" />

    <p className="mt-6 max-w-4xl text-[15px] leading-8 text-gray-300">
      The leaderboard is currently being rebuilt to improve overall website
      performance and reduce server workload. This update will help prevent
      crashes during periods of heavy traffic while introducing separate
      <span className="font-semibold text-white"> CCG</span> and
      <span className="font-semibold text-white"> TCG</span> leaderboards,
      giving collectors who focus on only one game an equal opportunity to
      compete for a top spots. (Totally... not because Keegan hates TCG...)
    </p>

  </div>

</div>

    </div>

  </div>
  
)}

{activeTab === "tutorial" && (
  <div className="space-y-5">

    {[
      {
        title: "Collections",
        href: "/collections",
        body: "Flip cards over to show their backs. That means you officially own that card.",
      },
      {
        title: "ISO & Wishlist",
        href: "/iso",
        body: "Your ISO builds automatically from cards you do not own. Hide sets you don't want to collect, make your ISO private, search every card by character or card code, and create a public wishlist. Collectors who only chase specific characters or individual cards typically disable their ISO and only use a wishlist.",
      },
      {
        title: "Inventory",
        href: "/inventory",
        body: "Mark cards as For Trade or For Sale and edit the quantity you own. Inventory is automatically set to 1 for owned cards. After making changes, scroll back to the top of the page and press Save before leaving.",
      },
      {
        title: "Binders",
        href: "/binders",
        body: "View every card organized into digital binders so you can browse your collection even when you're away from home. Missing cards leave empty spaces, making it easy to organize physical binders. You can also view other collectors' binders.",
      },
    ].map((item) => (
      <div
        key={item.title}
        className="group relative overflow-hidden border border-[#303030] bg-[#141414] transition-all duration-300 hover:border-yellow-400 hover:shadow-[0_0_30px_rgba(250,204,21,0.12)]"
      >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(250,204,21,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(250,204,21,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />

        <div className="absolute left-0 top-0 h-full w-[3px] bg-yellow-400" />

        <div className="absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-yellow-400" />
        <div className="absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2 border-yellow-400" />
        <div className="absolute bottom-0 left-0 h-5 w-5 border-l-2 border-b-2 border-yellow-400" />
        <div className="absolute bottom-0 right-0 h-5 w-5 border-r-2 border-b-2 border-yellow-400" />

        <div className="relative p-7">

          <div className="flex items-center justify-between">
            <a
              href={item.href}
              className="font-oxanium text-2xl font-black uppercase tracking-[0.15em] text-yellow-400 transition hover:text-white"
            >
              {item.title}
            </a>

            <div className="h-3 w-3 bg-yellow-400 shadow-[0_0_10px_#facc15]" />
          </div>

          <div className="mt-4 h-px w-full bg-gradient-to-r from-yellow-400 via-yellow-400/25 to-transparent" />

          <p className="mt-5 leading-8 text-gray-300">
            {item.body}
          </p>

        </div>
      </div>
    ))}

    <div className="group relative overflow-hidden border border-[#303030] bg-[#141414] transition-all duration-300 hover:border-yellow-400 hover:shadow-[0_0_30px_rgba(250,204,21,0.12)]">

      <div className="absolute inset-0 bg-[linear-gradient(rgba(250,204,21,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(250,204,21,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />

      <div className="absolute left-0 top-0 h-full w-[3px] bg-yellow-400" />

      <div className="absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-yellow-400" />
      <div className="absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2 border-yellow-400" />
      <div className="absolute bottom-0 left-0 h-5 w-5 border-l-2 border-b-2 border-yellow-400" />
      <div className="absolute bottom-0 right-0 h-5 w-5 border-r-2 border-b-2 border-yellow-400" />

      <div className="relative p-7">

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/my-progress"
            className="font-oxanium text-2xl font-black uppercase tracking-[0.15em] text-yellow-400 hover:text-white"
          >
            Progress CCG
          </a>

          <span className="text-gray-600">/</span>

          <a
            href="/progress-tcg"
            className="font-oxanium text-2xl font-black uppercase tracking-[0.15em] text-yellow-400 hover:text-white"
          >
            Progress TCG
          </a>
        </div>

        <div className="mt-4 h-px w-full bg-gradient-to-r from-yellow-400 via-yellow-400/25 to-transparent" />

        <p className="mt-5 leading-8 text-gray-300">
          See which sets you've mastered and track your overall completion
          separately for CCG and TCG collections.
        </p>

      </div>
    </div>

    {[
      {
        title: "Inbox",
        href: "/inbox",
        body: "Accept friend requests, view your friends' ISO, Wishlist, and Trades, and privately message other collectors. Friend requests are sent from Explore.",
      },
      {
        title: "Explore",
        href: "/explore",
        body: "Search for any collector on MLPEKayou, send friend requests, view their profile, collection statistics, binders, and more.",
      },
      {
        title: "First Finishers",
        href: "/community",
        body: "Leaderboards for individual sets. The collector displayed on each set completed it first and verified completion with Keegan using photos and video.",
      },
      {
        title: "Leaderboard",
        href: "/leaderboard",
        body: "See who owns the most cards on MLPEKayou. Rankings are separated into CCG and TCG leaderboards.",
      },
      {
        title: "Selling",
        href: "/selling",
        body: "Suggested community guidelines for buying and selling cards. This is not an official price guide, but recommendations created by experienced Kayou collectors to help keep the hobby affordable and accessible instead of becoming Pokémon 2.0.",
      },
      {
        title: "Shop",
        href: "/shop",
        body: "Purchase select products through Keegan at StonesTradingCo. Redeem your Discord roles and experience live card rips in the MLPEKayou Discord server (discord.gg/mlpekayou).",
      },
    ].map((item) => (
      <div
        key={item.title}
        className="group relative overflow-hidden border border-[#303030] bg-[#141414] transition-all duration-300 hover:border-yellow-400 hover:shadow-[0_0_30px_rgba(250,204,21,0.12)]"
      >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(250,204,21,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(250,204,21,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />

        <div className="absolute left-0 top-0 h-full w-[3px] bg-yellow-400" />

        <div className="absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-yellow-400" />
        <div className="absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2 border-yellow-400" />
        <div className="absolute bottom-0 left-0 h-5 w-5 border-l-2 border-b-2 border-yellow-400" />
        <div className="absolute bottom-0 right-0 h-5 w-5 border-r-2 border-b-2 border-yellow-400" />

        <div className="relative p-7">

          <div className="flex items-center justify-between">
            <a
              href={item.href}
              className="font-oxanium text-2xl font-black uppercase tracking-[0.15em] text-yellow-400 transition hover:text-white"
            >
              {item.title}
            </a>

            <div className="h-3 w-3 bg-yellow-400 shadow-[0_0_10px_#facc15]" />
          </div>

          <div className="mt-4 h-px w-full bg-gradient-to-r from-yellow-400 via-yellow-400/25 to-transparent" />

          <p className="mt-5 leading-8 text-gray-300">
            {item.body}
          </p>

        </div>
      </div>
    ))}

  </div>
)}
{activeTab === "resources" && (
  <div className="space-y-6">

    {[
      {
        title: "PonyRec",
        href: "https://www.ponyrec.net/",
        image: "/website-assets/ponyreclogo.webp",
        imageClass:
          "bg-[#0f0f0f] object-contain p-8",
        description: (
          <>
            <span className="font-semibold text-white">PonyRec</span> was
            created by <span className="text-yellow-400">Tangent</span>. A
            fan-run Kayou resource dedicated to deck building, TCG mechanics,
            competitive play, and everything related to the My Little Pony
            Trading Card Game.
          </>
        ),
      },
      {
        title: "Doodle Binder",
        href: "https://www.doodlebinder.com/",
        image: "/website-assets/binder1custom.webp",
        imageClass:
          "object-cover object-center scale-110",
        description: (
          <>
            <span className="font-semibold text-white">Doodle Binder</span> was
            created by <span className="text-yellow-400">Eternal</span>. Each
            binder is individually customized using acrylic paints, mixed
            materials, and hand-finished artwork built specifically for Kayou
            collectors.
          </>
        ),
      },
    ].map((resource) => (
      <a
        key={resource.title}
        href={resource.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block overflow-hidden border border-[#343434] bg-[#121212] transition-all duration-300 hover:border-yellow-400 hover:shadow-[0_0_40px_rgba(250,204,21,0.18)]"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(250,204,21,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(250,204,21,0.025)_1px,transparent_1px)] bg-[size:30px_30px]" />

        {/* Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,#facc1515,transparent_65%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Scan */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-1/2 h-full w-1/4 skew-x-[-25deg] bg-gradient-to-r from-transparent via-yellow-400/15 to-transparent animate-[scan_7s_linear_infinite]" />
        </div>

        {/* Accent */}
        <div className="absolute left-0 top-0 h-full w-[4px] bg-yellow-400" />

        {/* Corners */}
        <div className="absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-yellow-400" />
        <div className="absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2 border-yellow-400" />
        <div className="absolute bottom-0 left-0 h-5 w-5 border-l-2 border-b-2 border-yellow-400" />
        <div className="absolute bottom-0 right-0 h-5 w-5 border-r-2 border-b-2 border-yellow-400" />

        <div className="relative grid md:grid-cols-[320px_1fr]">

          {/* Image */}
          <div className="relative flex h-72 items-center justify-center overflow-hidden border-b border-[#303030] bg-[#0d0d0d] md:border-b-0 md:border-r">
            <img
              src={resource.image}
              alt={resource.title}
              className={`h-full w-full transition-transform duration-500 group-hover:scale-105 ${resource.imageClass}`}
            />
          </div>

          {/* Content */}
          <div className="flex flex-col justify-center p-8">

            <div className="flex items-center justify-between">

              <div>
                <p className="font-oxanium text-xs uppercase tracking-[0.45em] text-yellow-400">
                  COMMUNITY RESOURCE
                </p>

                <h2 className="mt-2 font-oxanium text-4xl font-black uppercase tracking-[0.15em] text-white transition group-hover:text-yellow-400">
                  {resource.title}
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center border border-yellow-400/40 bg-yellow-400/10 transition group-hover:bg-yellow-400 group-hover:text-black">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 17L17 7M17 7H9M17 7v8"
                  />
                </svg>
              </div>

            </div>

            <div className="mt-5 h-[2px] bg-gradient-to-r from-yellow-400 via-yellow-400/25 to-transparent" />

            <p className="mt-6 max-w-3xl leading-8 text-gray-300">
              {resource.description}
            </p>

          </div>

        </div>

      </a>
    ))}

  </div>
)}
          {activeTab === "partnership" && (
  <div className="space-y-6">

    {/* About MLPEKAYOU */}
    <div className="relative overflow-hidden border border-[#343434] bg-[#121212]">

      <div className="absolute inset-0 bg-[linear-gradient(rgba(250,204,21,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(250,204,21,0.025)_1px,transparent_1px)] bg-[size:30px_30px]" />
      <div className="absolute left-0 top-0 h-full w-[4px] bg-yellow-400" />

      <div className="relative p-8">

        <p className="font-oxanium text-xs uppercase tracking-[0.45em] text-yellow-400">
          ABOUT MLPEKAYOU
        </p>

        <h2 className="mt-2 font-oxanium text-4xl font-black uppercase tracking-[0.15em] text-white">
          Fan Project
        </h2>

        <div className="mt-5 h-[2px] bg-gradient-to-r from-yellow-400 via-yellow-400/25 to-transparent" />

        <p className="mt-6 leading-8 text-gray-300">
          <span className="font-semibold text-white">MLPEKAYOU</span> is owned
          and operated by <span className="text-yellow-400">Sam Keegan</span>.
          Keegan is a U.S. Army Veteran (Prior Service Infantry - 11C) and <span className="font-semibold text-white">is not employed by Kayou. </span>
          Kayou retains ownership of all My Little Pony artwork, characters, and
          related intellectual property used throughout this website. Images are
          provided by Kayou for use on MLPEKAYOU.
        </p>

      </div>

    </div>

    {/* Disclaimer */}
    <div className="relative overflow-hidden border border-red-500/40 bg-gradient-to-r from-red-950/50 to-[#121212]">

      <div className="absolute left-0 top-0 h-full w-[4px] bg-red-500" />

      <div className="relative p-8">

        <p className="font-oxanium text-xs uppercase tracking-[0.45em] text-red-400">
          IMPORTANT DISCLAIMER
        </p>

        <h2 className="mt-2 font-oxanium text-4xl font-black uppercase tracking-[0.15em] text-white">
          MLPEKAYOU Is Not Kayou US
        </h2>

        <div className="mt-5 h-[2px] bg-gradient-to-r from-red-500 via-red-500/25 to-transparent" />

        <p className="mt-6 text-lg font-semibold uppercase leading-9 text-white">
          MLPEKAYOU IS A FAN WEBSITE. IT IS NOT OWNED, OPERATED, OR MANAGED BY
          KAYOU US.
        </p>

        <p className="mt-6 leading-8 text-gray-300">
          MLPEKAYOU generates <span className="font-bold text-yellow-400">$0.00</span>
          {" "}in revenue and will never display advertisements, subscriptions,
          premium memberships, or paywalls. The goal of this project has always
          been to provide a completely free resource for the My Little Pony
          Kayou community.
        </p>

      </div>

    </div>

    {/* StonesTradingCo */}
    <a
      href="https://stonestradingco.com/collections/my-little-pony"
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block overflow-hidden border border-[#343434] bg-[#121212] transition-all duration-300 hover:border-yellow-400 hover:shadow-[0_0_40px_rgba(250,204,21,0.18)]"
    >

      <div className="absolute inset-0 bg-[linear-gradient(rgba(250,204,21,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(250,204,21,0.025)_1px,transparent_1px)] bg-[size:30px_30px]" />

      <div className="absolute left-0 top-0 h-full w-[4px] bg-yellow-400" />

      <div className="relative p-8">

        <div className="flex items-center justify-between">

          <div>

            <p className="font-oxanium text-xs uppercase tracking-[0.45em] text-yellow-400">
              OFFICIAL PARTNER
            </p>

            <h2 className="mt-2 font-oxanium text-4xl font-black uppercase tracking-[0.15em] text-white group-hover:text-yellow-400">
              StonesTradingCo
            </h2>

          </div>

          <svg
            className="h-8 w-8 text-yellow-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 17L17 7M17 7H9M17 7v8"
            />
          </svg>

        </div>

        <div className="mt-5 h-[2px] bg-gradient-to-r from-yellow-400 via-yellow-400/25 to-transparent" />

        <p className="mt-6 leading-8 text-gray-300">
          Purchasing My Little Pony products through
          <span className="font-semibold text-white"> StonesTradingCo</span>
          {" "}comes directly through Keegan. The MLPEKAYOU Discord regularly
          hosts <span className="text-yellow-400">Live Rip Nights</span>, where
          products are opened live for collectors.
        </p>

        <p className="mt-6 leading-8 text-gray-300">
          StonesTradingCo pays Keegan a commission on these purchases, which is
          used to fund server costs, development, and maintenance of
          <span className="font-semibold text-white"> MLPEKAYOU</span> while
          keeping every feature completely free for the community.
        </p>

      </div>

    </a>

  </div>
)}
        </div>
      </section>

    </main>
  );
}