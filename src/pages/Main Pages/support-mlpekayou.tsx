import "@fontsource/oxanium/400.css";
import "@fontsource/oxanium/600.css";
import "@fontsource/oxanium/700.css";
import { useEffect, useState } from "react";

const stonesUrl = "https://stonestradingco.com/collections/my-little-pony";
const pakraUrl = "https://pakracards.com/collections/mlpekayou-guest-picks";

function Arrow() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Support() {
  const [isLightMode, setIsLightMode] = useState(
    () => typeof document !== "undefined" && document.documentElement.dataset.theme === "light"
  );

  useEffect(() => {
    const syncTheme = () => setIsLightMode(document.documentElement.dataset.theme === "light");
    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  const bodyText = isLightMode ? "text-zinc-600" : "text-zinc-400";
  const goldText = isLightMode ? "text-[#775c0e]" : "text-[#FFE27A]";
  const panel = isLightMode ? "border-black/10 bg-white" : "border-white/10 bg-[#151718]";
  const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E7C84B] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--support-bg)]";

  return (
    <div
      className={`min-h-screen px-3 pb-24 pt-5 sm:px-6 sm:pb-12 sm:pt-9 lg:px-8 ${isLightMode ? "bg-[#f4f4f1] text-zinc-900" : "bg-[#0d0f10] text-white"}`}
      style={{ fontFamily: '"Oxanium", sans-serif', ...{ "--support-bg": isLightMode ? "#f4f4f1" : "#0d0f10" } }}
    >
      <main className="mx-auto w-full max-w-6xl">
        <header className="mb-6 max-w-3xl sm:mb-9">
          <div className={`flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] sm:text-xs ${goldText}`}>
            <span aria-hidden="true" className="h-px w-8 bg-current" />
            MLPEKAYOU shop partners
          </div>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            Shop your way.
            <span className={`block ${goldText}`}>Keep MLPEKAYOU going.</span>
          </h1>
          <p className={`mt-4 max-w-2xl text-sm leading-6 sm:text-base sm:leading-7 ${bodyText}`}>
            Head straight to our partner stores to browse their latest stock. Qualifying purchases earn me a commission at no additional cost to you and help keep MLPEKAYOU free.
          </p>
        </header>

        <section aria-label="Shop partner stores" className="grid items-stretch gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <article className={`relative flex min-w-0 flex-col overflow-hidden rounded-3xl border p-5 sm:p-7 ${panel}`}>
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#B68A24] via-[#FFE898] to-[#B68A24]" />
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-[0.16em] ${goldText}`}>English releases</span>
              <span aria-hidden="true" className={bodyText}>/</span>
              <span className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${bodyText}`}>Packed by me</span>
            </div>
            <h2 className="mt-3 break-words text-2xl font-bold tracking-tight sm:text-3xl">StonesTradingCo</h2>
            <p className={`mt-3 text-sm leading-6 ${bodyText}`}>
              Have your order shipped to you, or arrange a live opening on StonesTradingCo TikTok or in the MLPEKAYOU Discord server.
            </p>

            <div className={`my-5 rounded-2xl border p-4 sm:p-5 ${isLightMode ? "border-[#D3AE18]/35 bg-[#fff9df]" : "border-[#E7C84B]/25 bg-[#E7C84B]/[0.06]"}`}>
              <p className={`text-[10px] font-bold uppercase tracking-[0.16em] ${goldText}`}>Before you finish checkout</p>
              <h3 className="mt-2 text-lg font-bold leading-6">Choose MLPEKAYOU</h3>
              <p className={`mt-2 text-sm leading-6 ${bodyText}`}>
                Under "Where did you hear about us?", select MLPEKAYOU so your purchase is credited to me.
              </p>
              <div className={`mt-4 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 ${isLightMode ? "border-[#D3AE18]/40 bg-white" : "border-[#E7C84B]/35 bg-[#111313]"}`}>
                <span className={`text-sm font-bold tracking-wide ${goldText}`}>MLPEKAYOU</span>
                <svg aria-hidden="true" className={goldText} width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className={`mt-3 text-xs leading-5 ${bodyText}`}>
                Choosing TikTok, Discord, Google, or another option means I do not receive the commission, even if you use the link below.
              </p>
            </div>

            <a href={stonesUrl} target="_blank" rel="noopener noreferrer" className={`mt-auto flex min-h-12 items-center justify-between gap-3 rounded-xl bg-[#E7C84B] px-4 py-3 text-sm font-bold text-[#111111] transition-colors hover:bg-[#FFE477] sm:px-5 ${focusRing}`}>
              <span>Shop StonesTradingCo<span className="sr-only"> (opens in a new tab)</span></span>
              <Arrow />
            </a>
          </article>

          <article className={`relative flex min-w-0 flex-col overflow-hidden rounded-3xl border p-5 sm:p-7 ${panel}`}>
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#796482] via-[#DEC6E7] to-[#796482]" />
            <span className={`text-[10px] font-bold uppercase tracking-[0.16em] ${isLightMode ? "text-[#735080]" : "text-[#DCC5E5]"}`}>Chinese releases & merchandise</span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">PakraCards</h2>
            <p className={`mt-3 text-sm leading-6 ${bodyText}`}>
              Explore selected Chinese Kayou releases and merchandise through the MLPEKAYOU guest picks collection.
            </p>
            <div className={`my-5 rounded-2xl border p-4 sm:p-5 ${isLightMode ? "border-[#91749c]/20 bg-[#f7f2f9]" : "border-[#B99FC5]/20 bg-[#B99FC5]/[0.06]"}`}>
              <p className="text-base font-bold">Browse the latest selection</p>
              <p className={`mt-2 text-sm leading-6 ${bodyText}`}>
                Visit the store for current availability, prices, and preorder details.
              </p>
            </div>
            <a href={pakraUrl} target="_blank" rel="noopener noreferrer" className={`mt-auto flex min-h-12 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-bold transition-colors sm:px-5 ${isLightMode ? "border-[#91749c]/35 bg-[#f3edf6] text-[#654471] hover:bg-[#e9dfef]" : "border-[#B99FC5]/35 bg-[#B99FC5]/10 text-[#E5D2ED] hover:bg-[#B99FC5]/20"} ${focusRing}`}>
              <span>Shop PakraCards<span className="sr-only"> (opens in a new tab)</span></span>
              <Arrow />
            </a>
          </article>
        </section>

        <footer className={`mt-5 rounded-2xl border px-4 py-4 sm:px-5 ${panel}`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <p className={`max-w-3xl text-xs leading-5 sm:text-sm ${bodyText}`}>
              Ordering from StonesTradingCo? Ask me about a poster. Each Kayou case typically includes five, so availability is limited. One per customer per day.
            </p>
            <a href="https://discord.gg/mlpekayou" target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-11 shrink-0 items-center gap-2 self-start rounded-lg px-1 text-xs font-bold sm:self-auto sm:text-sm ${goldText} ${focusRing}`}>
              Join the Discord<span className="sr-only"> (opens in a new tab)</span>
              <Arrow />
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
