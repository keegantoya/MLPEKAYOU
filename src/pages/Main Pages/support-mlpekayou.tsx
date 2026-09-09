import "@fontsource/oxanium/400.css";
import "@fontsource/oxanium/600.css";
import "@fontsource/oxanium/700.css";
import { useEffect, useState } from "react";
export default function Support() {
const [isLightMode, setIsLightMode] = useState(
    () => document.documentElement.dataset.theme === "light"
  );
const products = [
    {
      name: "Nightmare Night Gift Set",
      price: "$119.99",
      image: "/set-pictures/nightmarenightgiftset.webp",
      scale: "scale-95",
      preorder: true,
      releaseDate: "SEPT 25, 2026",
      chineseEdition: false,
      promo: "",
      link: "https://stonestradingco.com/collections/my-little-pony",
    },
    {
      name: "Nightmare Night",
      price: "$59.80",
      image: "/set-pictures/nightmarenightbox.webp",
      scale: "scale-95",
      preorder: true,
      releaseDate: "SEPT 25, 2026",
      chineseEdition: false,
      promo: "",
      link: "https://stonestradingco.com/collections/my-little-pony",
    },
    {
      name: "Moon 4",
      price: "$47.88",
      image: "/set-pictures/moonfourbox.webp",
      scale: "scale-95",
      preorder: true,
      releaseDate: "OCT 16, 2026",
      chineseEdition: false,
      promo: "",
      link: "https://stonestradingco.com/collections/my-little-pony",
    },
    {
      name: "Moon 12",
      price: "$39.00",
      image: "/set-pictures/moontwelvecn.webp",
      scale: "scale-95",
      preorder: false,
      releaseDate: "",
      chineseEdition: true,
      promo: "",
      link: "https://pakracards.com/collections/mlpekayou-guest-picks",
    },
    {
      name: "Mistmane Gift Set",
      price: "$150.00",
      image: "/set-pictures/mistmanebinderset.webp",
      scale: "scale-95",
      preorder: false,
      releaseDate: "",
      chineseEdition: true,
      promo: "Use code 7301HXEKZ5PF for $22 off",
      link: "https://pakracards.com/collections/mlpekayou-guest-picks",
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
const upcoming = [
    "Fun Moments Four",
    "Raffle Sets 1, 2, 3, and 4",
    "Endless Kayou CN Merch"
  ];
  return (
    <div
      className={`min-h-screen pb-24 transition-colors duration-200 sm:pb-10 ${
        isLightMode ? "bg-[#f5f5f3] text-zinc-900" : "bg-[#0d0f10] text-white"
      }`}
      style={{ fontFamily: '"Oxanium", sans-serif' }}
    >
      <style>{`
        @keyframes preorder-shine {
          0% { transform: translateX(-160%) skewX(-20deg); }
          55%, 100% { transform: translateX(360%) skewX(-20deg); }
        }
      `}</style>
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
          <div className="relative px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
            <div className="grid gap-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,.65fr)] lg:items-end">
              <div>
              <div
                className={`text-sm font-semibold ${
                  isLightMode ? "text-[#725700]" : "text-[#FFE27A]"
                }`}
              >
                Support MLPEKayou
              </div>
              <h1
                className={`mt-1 text-4xl font-semibold tracking-tight sm:text-5xl ${
                  isLightMode ? "text-zinc-950" : "text-white"
                }`}
              >
                Support the site through card purchases
              </h1>
              <p
                className={`mt-4 max-w-3xl text-base leading-7 sm:text-lg ${
                  isLightMode ? "text-zinc-600" : "text-zinc-400"
                }`}
              >
                Every purchase helps support MLPEKayou while growing your collection.
                Everything will always be MSRP with occasional discounts shared in the
                Discord server. You can also ask for posters; every case comes with several.
              </p>
              </div>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
                <div
                  className={`rounded-2xl border p-4 ${
                    isLightMode
                      ? "border-black/10 bg-white/80"
                      : "border-white/10 bg-black/20"
                  }`}
                >
                  <div className={`text-sm font-medium ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                    Current products
                  </div>
                  <div className="mt-1 text-3xl font-semibold">{products.length}</div>
                </div>
                <div
                  className={`rounded-2xl border p-4 ${
                    isLightMode
                      ? "border-black/10 bg-white/80"
                      : "border-white/10 bg-black/20"
                  }`}
                >
                  <div className={`text-sm font-medium ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                    Purchase through
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${isLightMode ? "bg-zinc-100 text-zinc-900" : "bg-white/[0.07] text-white"}`}>
                      StonesTradingCo
                    </span>
                    <span className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${isLightMode ? "bg-[#eee9f0] text-[#55485c]" : "bg-[#85728f]/15 text-[#d8cadf]"}`}>
                      PakraCards
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className={`mt-4 rounded-[28px] border p-5 sm:p-6 ${
            isLightMode
              ? "border-black/10 bg-white"
              : "border-white/[0.08] bg-[#151718]"
          }`}
        >
          <div className="max-w-3xl">
            <div
              className={`text-sm font-semibold ${
                isLightMode ? "text-[#725700]" : "text-[#FFE27A]"
              }`}
            >
              How to Purchase
            </div>
            <h2
              className={`mt-1 text-2xl font-semibold tracking-tight sm:text-3xl ${
                isLightMode ? "text-zinc-950" : "text-white"
              }`}
            >
              Current Products
            </h2>
            <p
              className={`mt-3 text-sm leading-6 sm:text-base ${
                isLightMode ? "text-zinc-600" : "text-zinc-400"
              }`}
            >
              Each product opens at either StonesTradingCo or PakraCards. StonesTradingCo
              orders are packed by the developer of MLPEKAYOU, and live openings are
              available in the Discord server.
            </p>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
            {products.map((product) => (
              <a
                key={product.name}
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex min-w-0 flex-col overflow-hidden rounded-[20px] border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
                  isLightMode
                    ? "border-black/10 bg-zinc-50 hover:bg-zinc-100/80"
                    : "border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.05]"
                }`}
              >
                <div
                  className={`relative aspect-square overflow-hidden ${
                    isLightMode ? "bg-white" : "bg-[#0d0f10]"
                  }`}
                >
                  {product.preorder && (
                    <div className="absolute inset-x-0 top-0 z-10 overflow-hidden border-b border-[#d4b45d]/50 bg-gradient-to-r from-[#22282e] via-[#333c45] to-[#22282e] px-2 py-2 text-center text-[#f8edc9] shadow-[0_4px_14px_rgba(0,0,0,.22)]">
                      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-[#f8edc9]/25 to-transparent animate-[preorder-shine_4s_ease-in-out_infinite]" />
                      <div className="relative text-[10px] font-bold tracking-[0.14em] sm:text-xs">✦ PREORDER ✦</div>
                      <div className="relative mt-0.5 text-[9px] font-semibold text-[#ded2ad] sm:text-[10px]">RELEASES {product.releaseDate}</div>
                    </div>
                  )}
                  {product.chineseEdition && (
                    <div className="absolute inset-x-0 top-0 z-10 border-b border-[#a896ad]/35 bg-gradient-to-r from-[#302b33] via-[#4a404f] to-[#302b33] px-2 py-2.5 text-center text-[10px] font-bold tracking-[0.12em] text-[#e8dee9] shadow-[0_4px_14px_rgba(0,0,0,.2)] sm:text-xs">
                      ◆ CHINESE EDITION ◆
                    </div>
                  )}
                  <img
                    src={product.image}
                    alt={product.name}
                    className={`h-full w-full object-contain p-2 pt-11 sm:p-3 sm:pt-14 ${product.scale} transition-transform duration-300 group-hover:scale-[1.03]`}
                  />
                </div>
                <div className="flex flex-1 flex-col p-3 sm:p-4">
                  <h3
                    className={`line-clamp-2 text-sm font-semibold leading-5 sm:text-base ${
                      isLightMode ? "text-zinc-950" : "text-white"
                    }`}
                  >
                    {product.name}
                  </h3>
                  <div
                    className={`mt-1.5 text-xl font-semibold sm:text-2xl ${
                      isLightMode ? "text-[#725700]" : "text-[#FFE27A]"
                    }`}
                  >
                    {product.price}
                  </div>
                  {product.preorder && (
                    <div className={`mt-2 text-[10px] font-semibold leading-4 sm:text-xs ${
                      isLightMode
                        ? "text-[#6f5a20]"
                        : "text-[#d8c78e]"
                    }`}>
                      Ships after {product.releaseDate}
                    </div>
                  )}
                  {product.promo && (
                    <div className={`mt-2 rounded-lg border px-2 py-2 text-[10px] font-semibold leading-4 sm:text-xs ${
                      isLightMode
                        ? "border-[#7d6a84]/20 bg-[#f3eff4] text-[#5a4a60]"
                        : "border-[#a896ad]/20 bg-[#8b7694]/10 text-[#d8cadf]"
                    }`}>
                      {product.promo}
                    </div>
                  )}
                  <div
                    className={`mt-auto flex items-center justify-between pt-3 text-[10px] font-semibold sm:text-xs ${
                      isLightMode
                        ? "text-[#725700]"
                        : "text-[#FFE27A]"
                    }`}
                  >
                    <span>{product.chineseEdition ? "View at PakraCards" : "View at Stones"}</span>
                    <span>→</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
        <section className="mt-4 grid gap-4 lg:grid-cols-2">
          <div
            className={`rounded-[26px] border p-5 sm:p-6 ${
              isLightMode
                ? "border-black/10 bg-white"
                : "border-white/[0.08] bg-[#151718]"
            }`}
          >
            <div
              className={`text-sm font-semibold ${
                isLightMode ? "text-[#725700]" : "text-[#FFE27A]"
              }`}
            >
              Why Buy Through MLPEKayou?
            </div>
            <h2
              className={`mt-1 text-2xl font-semibold ${
                isLightMode ? "text-zinc-950" : "text-white"
              }`}
            >
              Your purchase directly supports the community
            </h2>
            <div className="mt-5 space-y-3">
              {[
                "Helps cover website hosting costs.",
                "Supports development of new features.",
                "Keeps the community strong and centralized.",
                "Keegan gets to keep doing what she loves (:",
              ].map((item) => (
                <div
                  key={item}
                  className={`rounded-2xl border px-4 py-3 text-sm sm:text-base ${
                    isLightMode
                      ? "border-black/10 bg-zinc-50 text-zinc-700"
                      : "border-white/[0.07] bg-white/[0.03] text-zinc-300"
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div
            className={`rounded-[26px] border p-5 sm:p-6 ${
              isLightMode
                ? "border-black/10 bg-white"
                : "border-white/[0.08] bg-[#151718]"
            }`}
          >
            <div
              className={`text-sm font-semibold ${
                isLightMode ? "text-[#725700]" : "text-[#FFE27A]"
              }`}
            >
              Coming Soon
            </div>
            <h2
              className={`mt-1 text-2xl font-semibold ${
                isLightMode ? "text-zinc-950" : "text-white"
              }`}
            >
              More Products
            </h2>
            <p
              className={`mt-3 text-sm leading-6 sm:text-base ${
                isLightMode ? "text-zinc-600" : "text-zinc-400"
              }`}
            >
              Keep an eye out here to see what will be available next. When a product
              is ready for purchase, it will appear above.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {upcoming.map((item) => (
                <span
                  key={item}
                  className={`rounded-full border px-3 py-2 text-sm ${
                    isLightMode
                      ? "border-black/10 bg-zinc-50 text-zinc-600"
                      : "border-white/10 bg-white/[0.04] text-zinc-300"
                  }`}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
