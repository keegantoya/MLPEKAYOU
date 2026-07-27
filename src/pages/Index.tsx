import { Link } from "react-router-dom";
import { useState } from "react";

export default function Index() {
  const [activeTab, setActiveTab] = useState<
    "collections" | "community" | "tutorial"
  >("collections");

const heroCards = [
  {
    image: "/cards/third-edition-moon/M3ZR006.webp",
    link: "/moon-three",
  },
  {
    image: "/cards/fun-moments-three/FM3SCR004.webp",
    link: "/fun-moments-three",
  },
  {
    image: "/cards/rainbow-two/R2USR007.webp",
    link: "/rainbow-two",
  },
  {
    image: "/cards/star-one/S1SAR008.webp",
    link: "/star-one",
  },
  {
    image: "/cards/first-edition-moon/M1LSR011.webp",
    link: "/moon-one",
  },
  {
    image: "/cards/rainbow-one/R1XR004.webp",
    link: "/rainbow-one",
  },
];

  return (
   <main className="min-h-screen overflow-x-hidden bg-[#171717] text-white">

      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6">

{/* HERO */}

<section className="relative pt-16 pb-24">

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

        <div className="mt-10 flex gap-8">

<div className="mt-10 flex gap-8">

  <button
    onClick={() => setActiveTab("collections")}
    className={`text-lg font-bold pb-2 border-b-2 transition ${
      activeTab === "collections"
        ? "border-[#E7C84B] text-[#E7C84B]"
        : "border-transparent text-gray-500 hover:text-white"
    }`}
  >
    Collections
  </button>

  <button
    onClick={() => setActiveTab("community")}
    className={`text-lg font-bold pb-2 border-b-2 transition ${
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

      {/* RIGHT */}

      <div className="relative h-[620px]">

        <div className="absolute right-20 top-4 z-30 w-[340px] rotate-[2deg] overflow-hidden rounded-[12px] shadow-[0_35px_70px_rgba(0,0,0,.45)]">
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

        <div className="mt-8 flex justify-center gap-8">
<div className="mt-10 flex gap-8">
</div>
        </div>

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

    </div>

  </div>

</section>

        {/* PONYREC */}

<section className="rounded-2xl border border-[#3a3a3a] bg-[#1d1d1d] px-8 py-5">

  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

    <div>

      <div className="text-xs uppercase tracking-[.25em] text-[#E7C84B] font-semibold">
        Community Resource
      </div>

      <h2 className="mt-1 text-xl font-black">
        Looking for more TCG resources?
      </h2>

      <p className="mt-2 text-gray-400">
        Check out{" "}
        <a
          href="https://ponyrec.net/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[#E7C84B] hover:underline"
        >
          PonyRec
        </a>{" "}
        by Tangent for deck-building tools, competitive resources, and more.
      </p>

      <p className="mt-2 text-xs text-gray-500">
        PonyRec is affiliated with Kayou U.S. in the same way MLPEKAYOU is.
      </p>

    </div>

    <a
      href="https://ponyrec.net/"
      target="_blank"
      rel="noopener noreferrer"
      className="shrink-0 rounded-xl border border-[#E7C84B] px-5 py-3 font-semibold text-[#E7C84B] transition hover:bg-[#E7C84B] hover:text-black"
    >
      Visit PonyRec →
    </a>

  </div>

</section>

        {/* FEATURED PRODUCTS */}

        <section className="rounded-3xl bg-[#202020] border border-[#2f2f2f]">

          <div className="flex justify-between items-center px-6 py-5 border-b border-[#2d2d2d]">

            <h2 className="text-2xl font-black uppercase">
              Featured New Products
            </h2>

          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 p-5">

{[
  {
    title: "Discord TCG (BP02)",
    status: "Coming Soon",
    date: "August 7, 2026",
    note: "",
    image: "/set-pictures/discordsetposter.webp",
  },
  {
    title: "Moon Edition Four",
    status: "Coming Soon",
    date: "September 2026",
    note: "Date subject to change • Poster shown is the Chinese placeholder",
    image: "/set-pictures/moonfourpostercn.webp",
  },
  {
    title: "Moon Edition Twelve (CN)",
    status: "2027 (NA)",
    date: "August 2026 CN, UNKNOWN 2027 NA",
    note: "",
    image: "/set-pictures/moontwelvecnposter.webp",
  },
  {
    title: "Nightmare Night TCG (BP03)",
    status: "Coming Soon",
    date: "October 2026",
    note: "Date subject to change • Poster shown is the Chinese placeholder",
    image: "/nightmarenight-assets/nightmarenightposter.webp",
  },
].map((product) => (

  <div
    key={product.title}
    className="group overflow-hidden rounded-2xl border border-[#353535] bg-[#262626] transition-all duration-300 hover:-translate-y-1 hover:border-[#E7C84B]"
  >

    <div className="overflow-hidden">
      <img
        src={product.image}
        alt={product.title}
        className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-105"
        draggable={false}
      />
    </div>

    <div className="p-4">

      <div className="inline-block rounded-full bg-[#E7C84B] px-2 py-1 text-xs font-bold uppercase text-black">
        {product.status}
      </div>

      <h3 className="mt-3 text-lg font-bold leading-tight">
        {product.title}
      </h3>

      <p className="mt-1 text-sm text-gray-300">
        {product.date}
      </p>

      {product.note && (
        <p className="mt-3 text-xs leading-5 text-gray-500">
          {product.note}
        </p>
      )}

    </div>

  </div>

))}

          </div>

        </section>

        {/* QUICK NAV */}

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          {[
            ["Collections", "/collections"],
            ["CCG Progress", "/my-progress"],
            ["ISO and Wishlist", "/iso"],
            ["Trading", "/trading-post"],
          ].map(([title, link]) => (

            <Link
              key={title}
              to={link}
              className="rounded-2xl bg-[#202020] border border-[#2f2f2f] p-6 hover:border-[#E7C84B] transition"
            >
              <div className="text-[#E7C84B] text-xs uppercase tracking-[.2em]">
                Explore
              </div>

              <div className="mt-2 text-2xl font-black">
                {title}
              </div>

            </Link>

          ))}

        </section>

        {/* UPDATES */}

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

      </div>

    </main>
  );
}