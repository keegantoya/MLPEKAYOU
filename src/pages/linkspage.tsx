import { useEffect, useState } from "react";

const supporters = [
  "Mari",
  "Badger",
  "Violet",
  "Vy",
  "Brea",
  "Panda",
  "Hyve",
  "Rain",
  "Kotoshi",
  "Zen",
];

const productImages = [
  {
    src: "/set-pictures/nightmarenightbox.webp",
    alt: "Nightmare Night standard box",
  },
  {
    src: "/set-pictures/nightmarenightgiftbox.webp",
    alt: "Nightmare Night gift box",
  },
];

function formatElapsed(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export default function LinksPage() {
  const [clock, setClock] = useState(() => new Date());
  const [elapsed, setElapsed] = useState(0);
  const [featuredSupporter, setFeaturedSupporter] = useState(0);
  const [productIndex, setProductIndex] = useState(0);

  useEffect(() => {
    const clockTimer = window.setInterval(() => {
      setClock(new Date());
      setElapsed((current) => current + 1);
    }, 1000);
    const supporterTimer = window.setInterval(() => {
      setFeaturedSupporter((current) => (current + 1) % supporters.length);
    }, 2600);
    const productTimer = window.setInterval(() => {
      setProductIndex((current) => (current + 1) % productImages.length);
    }, 6000);
    return () => {
      window.clearInterval(clockTimer);
      window.clearInterval(supporterTimer);
      window.clearInterval(productTimer);
    };
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0c0d0e] font-['Oxanium'] text-[#f5f2e9]">
      <style>{`
        @keyframes livePulse {
          0%, 100% { opacity: .65; transform: scale(.82); }
          50% { opacity: 1; transform: scale(1.18); }
        }
        @keyframes scanLine {
          0% { transform: translateX(-130%); }
          100% { transform: translateX(430%); }
        }
        @keyframes stoneDrift {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); opacity: .12; }
          50% { transform: translate3d(16px, -18px, 0) rotate(12deg); opacity: .3; }
        }
        @keyframes productSwap {
          0% { opacity: 0; transform: translateY(12px) scale(.97); }
          12%, 88% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-8px) scale(.985); }
        }
        .live-dot { animation: livePulse 1.45s ease-in-out infinite; }
        .product-image { animation: productSwap 6s ease-in-out infinite; }
        .scan-line { animation: scanLine 6.5s linear infinite; }
        .stone-mark { animation: stoneDrift 7s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .live-dot, .product-image, .scan-line, .stone-mark { animation: none; }
        }
      `}</style>

      <div className="relative h-full w-full overflow-hidden bg-[radial-gradient(circle_at_10%_0%,rgba(231,200,75,.13),transparent_25%),radial-gradient(circle_at_91%_13%,rgba(255,255,255,.07),transparent_22%),linear-gradient(145deg,#141618_0%,#090a0b_58%,#17140c_100%)]">
        <div className="pointer-events-none absolute inset-0 opacity-[.16] [background-image:linear-gradient(rgba(255,255,255,.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.055)_1px,transparent_1px)] [background-size:42px_42px]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] overflow-hidden bg-[#e7c84b]/20">
          <span className="scan-line absolute h-full w-[30%] bg-gradient-to-r from-transparent via-[#ffe772] to-transparent" />
        </div>

        <div className="stone-mark pointer-events-none absolute left-[2.5%] top-[16%] h-10 w-10 rotate-12 rounded-[12px] border border-[#e7c84b]/40" />
        <div className="stone-mark pointer-events-none absolute bottom-[17%] right-[2.7%] h-7 w-7 -rotate-12 rounded-[9px] border border-white/20" style={{ animationDelay: "2.2s" }} />

        <header className="absolute left-[3.5%] right-[3.5%] top-[2.5%] h-[8%]">
          <div className="flex h-full items-center justify-between gap-6">
            <div className="min-w-0">
              <div className="min-w-0">
                <div className="truncate text-[clamp(25px,3vw,54px)] font-black uppercase leading-none tracking-[0.055em] text-white">
                  Stones<span className="text-[#e7c84b]">TradingCo</span>
                </div>
                <div className="mt-1 text-[clamp(10px,.75vw,14px)] font-bold uppercase tracking-[0.3em] text-zinc-400">
                  Live breaks with Keegan
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="hidden rounded-2xl border border-white/10 bg-white/[.045] px-5 py-3 text-right lg:block">
                <div className="text-[10px] font-bold uppercase tracking-[.22em] text-zinc-500">Stream time</div>
                <div className="mt-0.5 text-[clamp(15px,1vw,19px)] font-black tabular-nums text-zinc-200">{formatElapsed(elapsed)}</div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-[#e7c84b]/45 bg-[#1b1c1d] px-5 py-3 shadow-[0_0_24px_rgba(231,200,75,.12)]">
                <span className="live-dot h-3 w-3 rounded-full bg-[#e7c84b] shadow-[0_0_12px_rgba(231,200,75,.9)]" />
                <div>
                  <div className="text-[clamp(13px,.95vw,18px)] font-black uppercase leading-none tracking-[.18em] text-[#fff0a5]">Live</div>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-[.16em] text-zinc-500">
                    {clock.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="pointer-events-none absolute bottom-[22%] left-[3.5%] right-[3.5%] top-[12%]">
          <div className="absolute bottom-0 right-0 flex h-[38%] w-[22%] items-center justify-center">
            <img
              key={productIndex}
              src={productImages[productIndex].src}
              alt={productImages[productIndex].alt}
              className="product-image h-full max-h-full w-full max-w-full object-contain object-center drop-shadow-[0_22px_30px_rgba(0,0,0,.6)]"
            />
          </div>
        </main>

        <section className="absolute bottom-[5.5%] left-[3.5%] right-[3.5%] h-[14.5%]">
          <div className="flex h-full min-h-0 flex-col rounded-[24px] border border-white/10 bg-[#151718]/95 px-[clamp(16px,1.4vw,26px)] py-[clamp(12px,1.1vw,18px)] shadow-[0_18px_50px_rgba(0,0,0,.42)]">
            <div className="mb-3 flex shrink-0 items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rotate-45 bg-[#e7c84b]" />
                <span className="text-[clamp(13px,1vw,19px)] font-black uppercase tracking-[.16em] text-white">Top supporters</span>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-[.22em] text-zinc-500">Stones crew roll call</span>
            </div>
            <div className="grid min-h-0 flex-1 grid-cols-5 grid-rows-2 gap-2">
              {supporters.map((supporter, index) => (
                <div
                  key={supporter}
                  className={`flex min-h-0 items-center justify-center rounded-xl border px-3 text-center text-[clamp(11px,.78vw,16px)] font-black uppercase leading-none tracking-[.06em] transition-all duration-500 ${
                    index === featuredSupporter
                      ? "scale-[1.025] border-[#e7c84b] bg-[#e7c84b] text-[#111315] shadow-[0_0_18px_rgba(231,200,75,.25)]"
                      : "border-white/[.06] bg-white/[.045] text-zinc-300"
                  }`}
                >
                  {supporter}
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="absolute bottom-[1.4%] left-[3.5%] right-[3.5%] flex items-center justify-between text-[clamp(9px,.68vw,13px)] font-bold uppercase tracking-[.24em] text-zinc-500">
          <span>StonesTradingCo</span>
          <span className="text-[#e7c84b]/80">Cards. Community. Live with Keegan.</span>
          <span>MLPEKAYOU</span>
        </footer>
      </div>
    </div>
  );
}
