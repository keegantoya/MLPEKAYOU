import CardImage from "@/components/CardImage";
import "@fontsource/oxanium/400.css";
import "@fontsource/oxanium/600.css";
import "@fontsource/oxanium/700.css";
import { useEffect, useState } from "react";

type Product = {
  name: string;
  price: string;
  image: string;
  preorder: boolean;
  releaseDate: string;
  chineseEdition: boolean;
  promo: string;
  link: string;
  store: "StonesTradingCo" | "PakraCards";
};

const products: Product[] = [
  {
    name: "Nightmare Night Gift Set",
    price: "$119.99",
    image: "/set-pictures/nightmarenightgiftset.webp",
    preorder: true,
    releaseDate: "SEPT 25, 2026",
    chineseEdition: false,
    promo: "",
    link: "https://stonestradingco.com/collections/my-little-pony",
    store: "StonesTradingCo",
  },
  {
    name: "Nightmare Night",
    price: "$59.80",
    image: "/set-pictures/nightmarenightbox.webp",
    preorder: true,
    releaseDate: "SEPT 25, 2026",
    chineseEdition: false,
    promo: "",
    link: "https://stonestradingco.com/collections/my-little-pony",
    store: "StonesTradingCo",
  },
  {
    name: "Moon 4",
    price: "$47.88",
    image: "/set-pictures/moonfourbox.webp",
    preorder: true,
    releaseDate: "OCT 16, 2026",
    chineseEdition: false,
    promo: "",
    link: "https://stonestradingco.com/collections/my-little-pony",
    store: "StonesTradingCo",
  },
  {
    name: "Moon 12",
    price: "$39.00",
    image: "/set-pictures/moontwelvecn.webp",
    preorder: false,
    releaseDate: "",
    chineseEdition: true,
    promo: "",
    link: "https://pakracards.com/collections/mlpekayou-guest-picks",
    store: "PakraCards",
  },
  {
    name: "Mistmane Gift Set",
    price: "$150.00",
    image: "/set-pictures/mistmanebinderset.webp",
    preorder: false,
    releaseDate: "",
    chineseEdition: true,
    promo: "Use code 7301HXEKZ5PF for $22 off",
    link: "https://pakracards.com/collections/mlpekayou-guest-picks",
    store: "PakraCards",
  },
];

const upcoming = [
  "Fun Moments Four",
  "Raffle Sets 1, 2, 3, and 4",
  "More Kayou CN merchandise",
];

export default function Support() {
  const [isLightMode, setIsLightMode] = useState(
    () => document.documentElement.dataset.theme === "light"
  );

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

  const panel = isLightMode
    ? "border-black/10 bg-white shadow-[0_16px_45px_rgba(0,0,0,0.05)]"
    : "border-white/[0.08] bg-[#151718]";
  const inset = isLightMode
    ? "border-black/10 bg-zinc-50"
    : "border-white/[0.08] bg-white/[0.035]";
  const bodyText = isLightMode ? "text-zinc-600" : "text-zinc-400";
  const mutedText = isLightMode ? "text-zinc-500" : "text-zinc-500";
  const goldText = isLightMode ? "text-[#725700]" : "text-[#FFE27A]";

  return (
    <div
      className={`min-h-screen pb-24 transition-colors duration-200 sm:pb-12 ${
        isLightMode ? "bg-[#f4f4f1] text-zinc-900" : "bg-[#0d0f10] text-white"
      }`}
      style={{ fontFamily: '"Oxanium", sans-serif' }}
    >
      <style>{`
        @keyframes productShine {
          0% { transform: translateX(-180%) skewX(-18deg); }
          52%, 100% { transform: translateX(420%) skewX(-18deg); }
        }
        @keyframes checkoutMenu {
          0%, 12%, 78%, 100% { opacity: 0; transform: translateY(-6px); visibility: hidden; }
          18%, 70% { opacity: 1; transform: translateY(0); visibility: visible; }
        }
        @keyframes checkoutCursor {
          0%, 20% { opacity: 0; transform: translate(24px, -8px); }
          26% { opacity: 1; transform: translate(24px, -8px); }
          50%, 62% { opacity: 1; transform: translate(0, 68px); }
          70%, 100% { opacity: 0; transform: translate(0, 68px); }
        }
        @keyframes checkoutOption {
          0%, 46% { background-color: transparent; }
          53%, 100% { background-color: rgba(231, 200, 75, 0.34); }
        }
        @keyframes checkoutPlaceholder {
          0%, 68% { opacity: 1; }
          74%, 100% { opacity: 0; }
        }
        @keyframes checkoutSelected {
          0%, 68% { opacity: 0; }
          76%, 100% { opacity: 1; }
        }
        @keyframes checkoutConfirmation {
          0%, 74% { opacity: 0; transform: translateY(6px); }
          82%, 96% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(0); }
        }
        @keyframes checkoutChevron {
          0%, 12%, 78%, 100% { transform: rotate(45deg); }
          18%, 70% { transform: rotate(225deg); }
        }
        .checkout-menu { animation: checkoutMenu 6s ease-in-out infinite; }
        .checkout-cursor { animation: checkoutCursor 6s ease-in-out infinite; }
        .checkout-option { animation: checkoutOption 6s ease-in-out infinite; }
        .checkout-placeholder { animation: checkoutPlaceholder 6s ease-in-out infinite; }
        .checkout-selected { animation: checkoutSelected 6s ease-in-out infinite; }
        .checkout-confirmation { animation: checkoutConfirmation 6s ease-in-out infinite; }
        .checkout-chevron { animation: checkoutChevron 6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .product-shine { display: none; }
          .checkout-menu, .checkout-cursor, .checkout-placeholder { display: none; animation: none; }
          .checkout-option, .checkout-selected, .checkout-confirmation { animation: none; opacity: 1; transform: none; }
          .checkout-chevron { animation: none; transform: rotate(45deg); }
        }
      `}</style>

      <main className="w-full px-3 py-4 sm:px-4 sm:py-5 lg:px-6 2xl:px-8">
        <section className={`relative overflow-hidden rounded-[24px] border ${panel}`}>
          <div
            className={`absolute inset-0 bg-cover bg-center ${isLightMode ? "opacity-[0.06]" : "opacity-[0.08]"}`}
            style={{ backgroundImage: "url('/website-assets/exploreequestria.webp')" }}
          />
          <div
            className={`absolute inset-0 ${
              isLightMode
                ? "bg-gradient-to-r from-white via-white/95 to-[#fff7cc]/85"
                : "bg-gradient-to-r from-[#151718] via-[#151718]/95 to-[#28230d]/85"
            }`}
          />
          <div className="relative grid gap-5 px-4 py-5 sm:px-6 sm:py-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(440px,0.65fr)] lg:items-center lg:px-8 lg:py-7">
            <div>
              <span className="inline-flex rounded-full bg-[#E7C84B] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#111111]">
                MLPEKAYOU shop partners
              </span>
              <h1 className="mt-3 max-w-4xl text-3xl font-bold leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl">
                Cards for you.
                <span className={`block ${goldText}`}>Support for MLPEKAYOU.</span>
              </h1>
              <p className={`mt-3 max-w-4xl text-sm leading-6 sm:text-base ${bodyText}`}>
                I earn a significant commission from qualifying purchases at no additional cost to you. StonesTradingCo orders are personally packed and shipped by me, or you can have your products opened live on TikTok or in the MLPEKAYOU Discord server.
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <a
                  href="https://stonestradingco.com/collections/my-little-pony"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#E7C84B] px-5 py-2.5 text-sm font-bold text-[#111111] transition-colors hover:bg-[#FFE477]"
                >
                  Shop StonesTradingCo
                </a>
                <a
                  href="https://discord.gg/mlpekayou"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex min-h-11 items-center justify-center rounded-xl border px-5 py-2.5 text-sm font-bold transition-colors ${
                    isLightMode
                      ? "border-black/15 bg-white/70 text-zinc-900 hover:bg-white"
                      : "border-white/15 bg-white/[0.05] text-white hover:bg-white/[0.1]"
                  }`}
                >
                  Join the Discord
                </a>
              </div>
            </div>

            <div className={`rounded-[20px] border p-4 backdrop-blur-sm ${
              isLightMode ? "border-black/10 bg-white/75" : "border-white/10 bg-black/25"
            }`}>
              <p className={`text-xs font-bold uppercase tracking-[0.16em] ${goldText}`}>
                Order your way
              </p>
              <div className="mt-3 grid gap-2 xl:grid-cols-3">
                {[
                  ["01", "Ship it", "I pack your order and send it directly to you."],
                  ["02", "TikTok rip", "Have your products opened live on StonesTradingCo TikTok."],
                  ["03", "Discord rip", "Join a live opening inside the MLPEKAYOU server."],
                ].map(([number, title, description]) => (
                  <div key={number} className={`flex gap-3 rounded-xl border p-3 ${inset}`}>
                    <span className={`text-sm font-bold ${goldText}`}>{number}</span>
                    <div>
                      <p className="text-sm font-bold">{title}</p>
                      <p className={`mt-0.5 text-[11px] leading-4 ${bodyText}`}>{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={`mt-3 overflow-hidden rounded-[22px] border ${panel}`}>
          <div className="grid lg:grid-cols-[minmax(0,0.85fr)_minmax(420px,1.15fr)] lg:items-center">
            <div className="p-4 sm:p-5 lg:p-6">
              <span className={`text-xs font-bold uppercase tracking-[0.16em] ${goldText}`}>
                One required step
              </span>
              <h2 className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">
                Select MLPEKAYOU at checkout
              </h2>
              <p className={`mt-3 text-sm leading-6 ${bodyText}`}>
                For StonesTradingCo orders, choose <strong className={isLightMode ? "text-zinc-950" : "text-white"}>MLPEKAYOU</strong> under “Where did you hear about us?” If you choose TikTok, Discord, Google, or anything else, the sale is not credited to me and I do not receive the commission.
              </p>
              <div className={`mt-3 rounded-xl border px-4 py-2.5 text-xs font-semibold leading-5 ${
                isLightMode
                  ? "border-[#D3AE18]/35 bg-[#fff9df] text-[#5e4b0c]"
                  : "border-[#E7C84B]/25 bg-[#E7C84B]/[0.08] text-[#FFE995]"
              }`}>
                The store selected at checkout matters more than the link you clicked to get there.
              </div>
            </div>

            <div className={`border-t p-4 sm:p-5 lg:border-l lg:border-t-0 lg:p-6 ${
              isLightMode ? "border-black/10 bg-zinc-50" : "border-white/[0.08] bg-black/15"
            }`}>
              <div className={`mx-auto max-w-lg rounded-2xl border p-4 ${
                isLightMode ? "border-black/10 bg-white shadow-sm" : "border-white/10 bg-[#111313]"
              }`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-wide">Where did you hear about us?</p>
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${mutedText}`}>Required</span>
                </div>
                <div className="relative mt-3 h-[10.5rem]">
                  <div className={`relative flex min-h-14 items-center justify-between rounded-xl border-2 border-[#E7C84B] px-4 ${
                    isLightMode ? "bg-[#fffdf3]" : "bg-[#17160f]"
                  }`}>
                    <span className={`checkout-placeholder absolute left-4 text-sm font-semibold ${mutedText}`}>
                      Select an option
                    </span>
                    <span className="checkout-selected absolute left-4 text-base font-bold tracking-wide">
                      MLPEKAYOU
                    </span>
                    <span aria-hidden="true" className="checkout-chevron ml-auto h-2.5 w-2.5 border-b-2 border-r-2 border-current" />
                  </div>
                  <div className={`checkout-menu pointer-events-none absolute left-0 right-0 top-16 z-10 overflow-hidden rounded-xl border shadow-xl ${
                    isLightMode ? "border-zinc-200 bg-white" : "border-white/15 bg-[#171717]"
                  }`}>
                    <div className={`px-4 py-1.5 text-sm font-semibold ${mutedText}`}>TikTok</div>
                    <div className={`border-t px-4 py-1.5 text-sm font-semibold ${isLightMode ? "border-zinc-200" : "border-white/10"}`}>
                      Discord
                    </div>
                    <div className={`checkout-option border-t px-4 py-2 text-sm font-bold ${isLightMode ? "border-zinc-200" : "border-white/10"}`}>
                      MLPEKAYOU
                    </div>
                    <span aria-hidden="true" className="checkout-cursor absolute right-6 top-2 h-6 w-4 bg-[#E7C84B] shadow-md [clip-path:polygon(0_0,0_100%,28%_73%,45%_100%,58%_93%,42%_67%,74%_67%)]" />
                  </div>
                  <div className="checkout-confirmation absolute inset-x-0 top-20 rounded-xl border border-[#E7C84B]/50 bg-[#E7C84B]/10 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.12em]">
                    MLPEKAYOU selected — your order now counts
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-7 sm:mt-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className={`text-xs font-bold uppercase tracking-[0.16em] ${goldText}`}>
                Available and upcoming
              </span>
              <h2 className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">Shop current products</h2>
            </div>
            <p className={`max-w-xl text-sm leading-6 sm:text-right ${bodyText}`}>
              StonesTradingCo carries English releases. PakraCards carries selected Chinese products and merchandise.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            {products.map((product) => (
              <a
                key={product.name}
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex min-w-0 flex-col overflow-hidden rounded-[18px] border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${panel}`}
              >
                <div className={`relative aspect-[4/3] overflow-hidden ${isLightMode ? "bg-zinc-50" : "bg-[#101212]"}`}>
                  <div className="absolute left-3 top-3 z-10 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-2">
                    <span className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] backdrop-blur-md sm:text-[10px] ${
                      product.store === "StonesTradingCo"
                        ? "border-[#E7C84B]/40 bg-[#17160f]/85 text-[#FFE27A]"
                        : "border-[#b3a0ba]/35 bg-[#2f2932]/90 text-[#e4d7e8]"
                    }`}>
                      {product.store}
                    </span>
                    {product.preorder && (
                      <span className="relative overflow-hidden rounded-full border border-[#E7C84B]/40 bg-[#17160f]/85 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-[#FFE27A] backdrop-blur-md sm:text-[10px]">
                        <span className="product-shine absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-[productShine_4s_ease-in-out_infinite]" />
                        <span className="relative">Preorder</span>
                      </span>
                    )}
                    {product.chineseEdition && (
                      <span className="rounded-full border border-white/15 bg-black/70 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-white backdrop-blur-md sm:text-[10px]">
                        Chinese edition
                      </span>
                    )}
                  </div>
                  <CardImage
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain p-2 pt-11 transition-transform duration-300 group-hover:scale-[1.025] sm:p-3 sm:pt-12"
                  />
                </div>
                <div className="flex flex-1 flex-col p-3 sm:p-4">
                  <h3 className="line-clamp-2 text-sm font-bold leading-5 sm:text-base">{product.name}</h3>
                  <div className={`mt-1 text-lg font-bold sm:text-xl ${goldText}`}>{product.price}</div>
                  {product.preorder && (
                    <p className={`mt-2 text-[10px] font-semibold uppercase tracking-wide sm:text-xs ${mutedText}`}>
                      Releases {product.releaseDate}
                    </p>
                  )}
                  {product.promo && (
                    <div className={`mt-3 rounded-xl border px-3 py-2 text-[10px] font-semibold leading-4 sm:text-xs ${
                      isLightMode
                        ? "border-[#7d6a84]/20 bg-[#f3eff4] text-[#5a4a60]"
                        : "border-[#a896ad]/20 bg-[#8b7694]/10 text-[#d8cadf]"
                    }`}>
                      {product.promo}
                    </div>
                  )}
                  <div className={`mt-auto flex items-center justify-between gap-2 pt-4 text-[10px] font-bold uppercase tracking-wide sm:text-xs ${goldText}`}>
                    <span>View product</span>
                    <span aria-hidden="true">→</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-4 grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
          <div className={`rounded-[22px] border p-4 sm:p-5 ${panel}`}>
            <span className={`text-xs font-bold uppercase tracking-[0.16em] ${goldText}`}>
              What your order supports
            </span>
            <h2 className="mt-1.5 text-xl font-bold tracking-tight sm:text-2xl">A free site built for collectors</h2>
            <p className={`mt-2 max-w-3xl text-sm leading-6 ${bodyText}`}>
              Commission from qualifying purchases helps fund the tools, infrastructure, and ongoing work behind MLPEKAYOU without adding ads or paywalls.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {[
                ["Free access", "Collection tools remain available to everyone."],
                ["New features", "More useful tools can continue to be built."],
                ["Reliable service", "Hosting and infrastructure stay maintained."],
              ].map(([title, description]) => (
                <div key={title} className={`rounded-xl border p-3 ${inset}`}>
                  <p className="text-sm font-bold">{title}</p>
                  <p className={`mt-2 text-xs leading-5 ${bodyText}`}>{description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-[22px] border p-4 sm:p-5 ${panel}`}>
            <span className={`text-xs font-bold uppercase tracking-[0.16em] ${goldText}`}>Coming next</span>
            <h2 className="mt-1.5 text-xl font-bold tracking-tight sm:text-2xl">More products are on the way</h2>
            <div className="mt-4 space-y-2">
              {upcoming.map((item, index) => (
                <div key={item} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${inset}`}>
                  <span className={`text-xs font-bold ${goldText}`}>{String(index + 1).padStart(2, "0")}</span>
                  <span className="text-sm font-semibold">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`mt-4 rounded-[18px] border px-4 py-3.5 text-center sm:px-6 ${
          isLightMode
            ? "border-[#D3AE18]/35 bg-[#fff9df] text-[#5e4b0c]"
            : "border-[#E7C84B]/25 bg-[#E7C84B]/[0.08] text-[#FFE995]"
        }`}>
          <p className="text-sm font-bold sm:text-base">Ordering something? Ask me about a posters! Each Kayou case typically comes with 5, so quantity is limited! One per customer per day.</p>
        </section>
      </main>
    </div>
  );
}
