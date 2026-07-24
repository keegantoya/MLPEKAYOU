import { Link } from "react-router-dom";

export default function Index() {
  const products = [1, 2, 3, 4];

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
    <main className="min-h-screen bg-[#171717] text-white">

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* HERO */}

        <section className="grid lg:grid-cols-[1.4fr_.9fr] gap-6">

          <div className="rounded-3xl bg-[#202020] border border-[#2f2f2f] p-10">

            <span className="inline-block px-3 py-1 rounded-full bg-[#2a2a2a] text-[#E7C84B] text-xs uppercase tracking-[.3em]">
              MY LITTLE PONY KAYOU
            </span>

            <h1 className="mt-6 text-6xl font-black uppercase leading-none">
              Track
              <br />
              Every Card.
            </h1>

            <p className="mt-6 max-w-lg text-gray-400">
              MLPEKAYOU is owned and run by Keegan, but backed and supported
              by Kayou US. All resources and permissions are provided by Kayou U.S.
              All rights to card images and information belong to Kayou U.S.
            </p>

            <div className="mt-8 flex gap-3">

              <Link
                to="/collections"
                className="rounded-xl bg-[#E7C84B] text-black px-6 py-3 font-bold"
              >
                Collections
              </Link>

              <Link
                to="/explore"
                className="rounded-xl border border-[#3a3a3a] bg-[#262626] px-6 py-3"
              >
                Community
              </Link>

            </div>

          </div>

<div className="rounded-3xl bg-[#202020] border border-[#2f2f2f] p-5">

  <div className="grid grid-cols-3 gap-3">

    {heroCards.map((card, index) => (

      <Link
        key={index}
        to={card.link}
        className="group relative overflow-hidden rounded-2xl"
      >

        <div className="absolute inset-0 rounded-2xl bg-[#E7C84B]/20 opacity-0 blur-xl transition-all duration-500 group-hover:opacity-100 group-hover:scale-125" />

        <div
          className="
  relative
  overflow-hidden
  rounded-[20px]
  border
  border-[#3b3b3b]
  bg-[#202020]
  transition-all
  duration-500
  group-hover:border-[#E7C84B]
  group-hover:-translate-y-2
  group-hover:rotate-[1.5deg]
  group-hover:scale-[1.04]
"
        >

<img
  src={card.image}
  alt=""
  draggable={false}
  className="
    block
    w-full
    scale-[1.06]
    rounded-[18px]
    transition-all
    duration-700
    group-hover:scale-[1.16]
  "
/>

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              -translate-x-[160%]
              skew-x-[-20deg]
              bg-gradient-to-r
              from-transparent
              via-white/25
              to-transparent
              transition-transform
              duration-700
              group-hover:translate-x-[180%]
            "
          />

        </div>

      </Link>

    ))}

  </div>

</div>

        </section>

        {/* PONYREC */}

<section className="rounded-2xl border border-[#3a3a3a] bg-[#1d1d1d] px-6 py-5">

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
    title: "Discord TCG (BP03)",
    status: "Coming Soon",
    date: "August 7, 2026",
    note: "",
    image: "/set-pictures/discordsetposter.webp",
  },
  {
    title: "Moon Edition Four",
    status: "Coming Soon",
    date: "September 2026",
    note: "Date subject to change • Poster shown is the Chinese placeholder.",
    image: "/set-pictures/moonfourpostercn.webp",
  },
  {
    title: "Moon Edition Twelve (CN)",
    status: "Coming to America in 2027",
    date: "Month not yet known",
    note: "",
    image: "/set-pictures/moontwelvecnposter.webp",
  },
  {
    title: "Nightmare Night TCG (BP04)",
    status: "Coming Soon",
    date: "October 2026",
    note: "Date subject to change • Poster shown is the Chinese placeholder.",
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