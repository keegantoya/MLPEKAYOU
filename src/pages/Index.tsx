import { useState } from "react";

export default function Index() {
  const [activeTab, setActiveTab] = useState<"updates" | "community">("updates");

const heroCards = [
  {
    image: "/cards/third-edition-moon/M3ZR006.webp",
    link: "/moon-three",
  },
  {
    image: "/cards/rainbow-two/R2USR007.webp",
    link: "/rainbow-two",
  },
  {
    image: "/cards/star-one/S1SAR008.webp",
    link: "/star-one",
  },
];

  return (
   <main className="min-h-screen overflow-x-hidden bg-[#171717] text-white">

      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6">

{/* HERO */}

<section className="relative pt-16 pb-20">

  <div className="relative max-w-7xl mx-auto px-8">

    {/* DESKTOP */}
    <div className="hidden lg:grid lg:grid-cols-[1.1fr_.9fr] items-center gap-8">

      {/* LEFT */}

      <div>

        <div className="flex items-center gap-4">

          <div className="h-px w-16 bg-[#E7C84B]" />

          <span className="text-xs tracking-[.5em] uppercase text-[#E7C84B]">
            MLPEKAYOU
          </span>

        </div>

        <h1 className="mt-10 text-[6rem] leading-[0.88] font-black uppercase">
          Every
          <br />
          Collection
          <br />
          Starts
          <br />
          Somewhere.
        </h1>

        <p className="mt-5 text-sm font-medium uppercase tracking-[0.35em] text-gray-400">
  Start in the Right Place
</p>

<div className="mt-20 flex gap-8">

  <button
    onClick={() => setActiveTab("updates")}
    className={`border-b-2 pb-2 text-lg font-bold transition ${
      activeTab === "updates"
        ? "border-[#E7C84B] text-[#E7C84B]"
        : "border-transparent text-gray-500 hover:text-white"
    }`}
  >
    Updates
  </button>

  <button
    onClick={() => setActiveTab("community")}
    className={`border-b-2 pb-2 text-lg font-bold transition ${
      activeTab === "community"
        ? "border-[#E7C84B] text-[#E7C84B]"
        : "border-transparent text-gray-500 hover:text-white"
    }`}
  >
    Community
  </button>

</div>

      </div>

      {/* RIGHT */}

      <div className="relative h-[540px]">

        <div className="absolute right-24 top-8 z-30 w-[300px] rotate-[2deg] overflow-hidden rounded-[12px] shadow-[0_35px_70px_rgba(0,0,0,.45)]">
          <img
            src="/cards/star-one/S1SAR008.webp"
            draggable={false}
            className="block w-full scale-[1.049]"
          />
        </div>

        <div className="absolute right-0 top-[300px] w-[220px] rotate-[10deg] overflow-hidden rounded-[10px] shadow-[0_20px_40px_rgba(0,0,0,.35)]">
          <img
            src="/cards/rainbow-two/R2USR007.webp"
            draggable={false}
            className="block w-full scale-[1.049]"
          />
        </div>

        <div className="absolute right-60 top-[240px] w-[220px] -rotate-[12deg] overflow-hidden rounded-[10px] opacity-70 shadow-[0_20px_40px_rgba(0,0,0,.35)]">
          <img
            src="/cards/third-edition-moon/M3ZR006.webp"
            draggable={false}
            className="block w-full scale-[1.04]"
          />
        </div>

      </div>

    </div>

    {/* MOBILE */}
    <div className="lg:hidden">

      <div className="text-center">

        <div className="flex items-center justify-center gap-3">

          <div className="h-px w-10 bg-[#E7C84B]" />

          <span className="text-[10px] tracking-[.45em] uppercase text-[#E7C84B]">
            MLPEKAYOU
          </span>

          <div className="h-px w-10 bg-[#E7C84B]" />

        </div>

        <h1 className="mt-6 text-[2.5rem] sm:text-[3rem] leading-[0.9] font-black uppercase break-words">
          Every
          <br />
          Collection
          <br />
          Starts
          <br />
          Somewhere.
        </h1>


      </div>

      <div className="relative mx-auto mt-2 h-[280px] w-[260px] sm:h-[320px] sm:w-[300px]">

        <div className="absolute left-1/2 top-0 z-30 w-[150px] sm:w-[175px] -translate-x-1/2 rotate-[2deg] overflow-hidden rounded-[12px] shadow-[0_30px_60px_rgba(0,0,0,.45)]">
          <img
            src="/cards/star-one/S1SAR008.webp"
            draggable={false}
            className="block w-full scale-[1.049]"
          />
        </div>

        <div className="absolute left-2 bottom-4 w-[120px] -rotate-[14deg] overflow-hidden rounded-[10px] shadow-[0_20px_40px_rgba(0,0,0,.35)]">
          <img
            src="/cards/third-edition-moon/M3ZR006.webp"
            draggable={false}
            className="block w-full scale-[1.04]"
          />
        </div>

        <div className="absolute right-2 bottom-4 w-[120px] rotate-[14deg] overflow-hidden rounded-[10px] shadow-[0_20px_40px_rgba(0,0,0,.35)]">
          <img
            src="/cards/rainbow-two/R2USR007.webp"
            draggable={false}
            className="block w-full scale-[1.049]"
          />
        </div>

      </div>
<div className="mt-8 flex justify-center gap-8">

  <button
    onClick={() => setActiveTab("updates")}
    className={`border-b-2 pb-2 text-base font-bold transition ${
      activeTab === "updates"
        ? "border-[#E7C84B] text-[#E7C84B]"
        : "border-transparent text-gray-500 hover:text-white"
    }`}
  >
    Updates
  </button>

  <button
    onClick={() => setActiveTab("community")}
    className={`border-b-2 pb-2 text-base font-bold transition ${
      activeTab === "community"
        ? "border-[#E7C84B] text-[#E7C84B]"
        : "border-transparent text-gray-500 hover:text-white"
    }`}
  >
    Community
  </button>

</div>
    </div>

  </div>

</section>

{activeTab === "community" && (

<div className="space-y-6">

  {/* PonyRec */}

  <section className="rounded-2xl border border-[#3a3a3a] bg-[#1d1d1d] px-8 py-6">

    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

      <div>

        <div className="text-xs font-semibold uppercase tracking-[.25em] text-[#E7C84B]">
          Community Resource
        </div>

        <h2 className="mt-1 text-2xl font-black">
          Looking for more TCG resources?
        </h2>

        <p className="mt-3 text-gray-400 leading-7">
          Check out{" "}
          <a
            href="https://ponyrec.net/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#E7C84B] hover:underline"
          >
            PonyRec
          </a>{" "}
          by Tangent for deck-building tools, competitive resources, tournament
          information, and more.
        </p>

        <p className="mt-3 text-sm text-gray-500">
          PonyRec is affiliated with Kayou U.S. in the same way MLPEKAYOU is.
        </p>

      </div>

      <a
        href="https://ponyrec.net/"
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 rounded-xl border border-[#E7C84B] px-6 py-3 font-semibold text-[#E7C84B] transition hover:bg-[#E7C84B] hover:text-black"
      >
        Visit PonyRec →
      </a>

    </div>

  </section>

  {/* Doodle Binder */}

  <section className="rounded-2xl border border-[#3a3a3a] bg-[#1d1d1d] px-8 py-6">

    <div className="flex flex-col lg:flex-row gap-8 items-center">

      <div className="flex-1">

        <div className="text-xs font-semibold uppercase tracking-[.25em] text-[#E7C84B]">
          Community Partner
        </div>

        <h2 className="mt-1 text-2xl font-black">
          Doodle Binder
        </h2>

        <p className="mt-3 text-gray-400 leading-7">
          Looking for a unique way to store your Kayou collection? Eternal (Doodle Binder)
          offers custom-designed binders made specifically for My Little Pony
          Kayou collectors and other IPs at request.
        </p>

        <p className="mt-3 text-sm text-gray-500">
          Designed by Eternal and available through Doodle Binder.
        </p>

        <a
          href="https://www.doodlebinder.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex rounded-xl border border-[#E7C84B] px-6 py-3 font-semibold text-[#E7C84B] transition hover:bg-[#E7C84B] hover:text-black"
        >
          Shop Custom Binders →
        </a>

      </div>

      <div className="grid w-full max-w-md grid-cols-2 gap-5 lg:w-[420px]">

        <img
          src="/website-assets/binder1custom.webp"
          alt="Custom Kayou Binder"
          className="w-full rounded-xl border border-[#3a3a3a] shadow-lg transition duration-300 hover:-translate-y-1 hover:scale-[1.02]"
        />

        <img
          src="/website-assets/binder3custom.webp"
          alt="Custom Kayou Binder"
          className="w-full rounded-xl border border-[#3a3a3a] shadow-lg transition duration-300 hover:-translate-y-1 hover:scale-[1.02]"
        />

      </div>

    </div>

  </section>

</div>

)}

        {/* UPDATES */}

{activeTab === "updates" && (

<section className="rounded-3xl border border-[#2f2f2f] bg-[#202020]">

  <div className="flex items-center justify-between border-b border-[#2d2d2d] px-6 py-5">

    <div>
      <h2 className="text-2xl font-black uppercase">
        Recent Updates
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        Stay up to date with the latest additions and improvements to MLPEKAYOU.
      </p>
    </div>

  </div>

  <div className="divide-y divide-[#2d2d2d]">

{[
    {
    date: "07/29/2026",
    title: "Functional Changes",
    description:
      "In your profile, you can now share it so others can instantly view your ISO, Wishlist, and Trades from a link. You can now share others' profiles from explore, or in trading post. Simply click on the username of the person with a card you'd like to trade for and see their ISO. Trading post also recieved a major redesign.",
  },
  {
    alert: true,
    title: "MLPEKAYOU Service Notice",
    description:
      "The service in which all account data is living is currently experiencing outages. On occasion, you will experience degraded performance or simply be unable to use the website. Please allow ten to twenty minutes for the database to reset. There is nothing I can do about this, it is out of my hands until they figure themselves out.",
  },
  {
    date: "07/24/2026",
    title: "Functional Changes",
    description:
      "The homepage has been redesigned for less confusion among newer members. The Wishlist page has been removed and condensed into the ISO page for easier access.",
  },
].map((update, index) => (

  <div
    key={index}
    className="flex gap-6 px-6 py-6 hover:bg-[#242424] transition-colors"
  >

    {/* Left Column */}

    <div className="w-40 shrink-0 flex items-center justify-center">

      {update.alert ? (

        <div className="flex flex-col items-center text-center">

          <div className="text-5xl leading-none">
            ⚠️
          </div>

          <div className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-red-400">
            Notice
          </div>

        </div>

      ) : (

        <div className="rounded-full bg-[#E7C84B] px-4 py-2 text-sm font-bold text-black">
          {update.date}
        </div>

      )}

    </div>

    {/* Right Column */}

    <div className="flex-1">

      <h3 className={update.alert ? "text-xl font-black text-red-400" : "text-xl font-bold"}>
        {update.title}
      </h3>

      <p className="mt-2 text-gray-400 leading-7">
        {update.description}
      </p>

    </div>

  </div>

))}

  </div>

</section>

)}

      </div>

    </main>
  );
}