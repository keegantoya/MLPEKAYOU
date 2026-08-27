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
      name: "Discord",
      category: "BP02",
      price: "$59.80",
      image: "/set-pictures/discordselling.webp",
      scale: "scale-125",
      disclaimer:
        "Every two boxes comes with one Discord promo. If you want a specific one, ask! I have 1.4 cases left as of 08/13/2026.",
      link: "https://stonestradingco.com/collections/my-little-pony/products/discord",
    },
    {
      name: "Fun Moments 3 Booster Box PREORDER",
      category: "FME03",
      price: "$39.80",
      image: "/set-pictures/funmomentsthreeboxstone.webp",
      scale: "scale-95",
      disclaimer:
        "To make way for Fun Moments 4, the current stock of Fun Moments 3 will be the last of our stock.",
      link: "https://stonestradingco.com/collections/my-little-pony/products/kayou-mlp-fun-moments-3-friendship-eternal",
    }
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
    "Moon Four",
    "Nightmare Night",
    "Nightmare Night Binder Sets",
    "Fun Moments Four",
    "Chinese Moon Twelve",
    "Chinese Mistmane Binder Sets",
    "Nightmare Night Raffle Set",
  ];
  return (
    <div
      className={`min-h-screen pb-24 transition-colors duration-200 sm:pb-10 ${
        isLightMode ? "bg-[#f5f5f3] text-zinc-900" : "bg-[#0d0f10] text-white"
      }`}
      style={{ fontFamily: '"Oxanium", sans-serif' }}
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
                  <div className={`mt-1 text-lg font-semibold ${isLightMode ? "text-zinc-900" : "text-white"}`}>
                    StonesTradingCo
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
              Clicking a product below will take you to StonesTradingCo. My Little Pony
              orders placed through these links will be packed by the developer of MLPEKAYOU.
              Live openings are available in the Discord server.
            </p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {products.map((product) => (
              <a
                key={product.name}
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`group overflow-hidden rounded-[24px] border transition-all duration-200 ${
                  isLightMode
                    ? "border-black/10 bg-zinc-50 hover:bg-zinc-100/80"
                    : "border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.05]"
                }`}
              >
                <div
                  className={`relative h-80 overflow-hidden sm:h-96 ${
                    isLightMode ? "bg-white" : "bg-[#0d0f10]"
                  }`}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className={`h-full w-full object-contain p-2 sm:p-3 ${product.scale} transition-transform duration-300 group-hover:scale-[1.03]`}
                  />
                </div>
                <div className="p-5">
                  <h3
                    className={`text-xl font-semibold ${
                      isLightMode ? "text-zinc-950" : "text-white"
                    }`}
                  >
                    {product.name}
                  </h3>
                  <div
                    className={`mt-3 text-3xl font-semibold ${
                      isLightMode ? "text-[#725700]" : "text-[#FFE27A]"
                    }`}
                  >
                    {product.price}
                  </div>
                  {product.disclaimer && (
                    <p
                      className={`mt-3 text-sm leading-6 ${
                        isLightMode ? "text-zinc-600" : "text-zinc-400"
                      }`}
                    >
                      {product.disclaimer}
                    </p>
                  )}
                  <div
                    className={`mt-5 flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold ${
                      isLightMode
                        ? "bg-[#c89d13]/12 text-[#725700]"
                        : "bg-[#FFD54A]/10 text-[#FFE27A]"
                    }`}
                  >
                    <span>View Product</span>
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
