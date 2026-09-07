export default function LinksPage() {
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

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#120d18] font-['Oxanium'] text-[#f2d9a7]">
      <div className="relative h-full w-full overflow-hidden bg-[#1b1223]">
        {/* BACKGROUND */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,#41234f_0%,transparent_28%),radial-gradient(circle_at_88%_15%,#35182b_0%,transparent_30%),radial-gradient(circle_at_55%_100%,#2c1b17_0%,transparent_40%)]" />

        {/* ANIMATED BACKGROUND SPARKLES */}
        <style>{`
          @keyframes sparkleDrift {
            0% {
              transform: translate3d(0, 18px, 0) scale(.65) rotate(0deg);
              opacity: 0;
            }
            15% {
              opacity: .35;
            }
            50% {
              transform: translate3d(24px, -12px, 0) scale(1.15) rotate(45deg);
              opacity: .8;
            }
            85% {
              opacity: .35;
            }
            100% {
              transform: translate3d(-18px, -42px, 0) scale(.6) rotate(90deg);
              opacity: 0;
            }
          }

          @keyframes eeriePulse {
            0%, 100% {
              opacity: .55;
              filter: drop-shadow(0 0 3px rgba(238, 126, 43, .35));
            }
            50% {
              opacity: 1;
              filter: drop-shadow(0 0 9px rgba(238, 126, 43, .75));
            }
          }

          .mlp-sparkle {
            position: absolute;
            pointer-events: none;
            z-index: 1;
            color: #ee7e2b;
            font-size: 16px;
            line-height: 1;
            animation: sparkleDrift 4.5s ease-in-out infinite;
            will-change: transform, opacity;
          }

          .halloween-glow {
            animation: eeriePulse 2.8s ease-in-out infinite;
          }
        `}</style>

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <span className="mlp-sparkle left-[3%] top-[18%]" style={{ animationDelay: "0s" }}>✦</span>
          <span className="mlp-sparkle left-[8%] top-[42%]" style={{ animationDelay: "1.2s" }}>✧</span>
          <span className="mlp-sparkle left-[13%] top-[68%]" style={{ animationDelay: "2.4s" }}>✦</span>
          <span className="mlp-sparkle left-[18%] top-[28%]" style={{ animationDelay: "3.6s" }}>✧</span>
          <span className="mlp-sparkle left-[23%] top-[76%]" style={{ animationDelay: "4.8s" }}>✦</span>
          <span className="mlp-sparkle left-[28%] top-[12%]" style={{ animationDelay: "1.8s" }}>✧</span>
          <span className="mlp-sparkle left-[33%] top-[54%]" style={{ animationDelay: "3.1s" }}>✦</span>
          <span className="mlp-sparkle left-[38%] top-[82%]" style={{ animationDelay: "4.2s" }}>✧</span>
          <span className="mlp-sparkle left-[43%] top-[22%]" style={{ animationDelay: "0.7s" }}>✦</span>
          <span className="mlp-sparkle left-[48%] top-[64%]" style={{ animationDelay: "2.9s" }}>✧</span>
          <span className="mlp-sparkle left-[53%] top-[8%]" style={{ animationDelay: "4.4s" }}>✦</span>
          <span className="mlp-sparkle left-[58%] top-[45%]" style={{ animationDelay: "1.5s" }}>✧</span>
          <span className="mlp-sparkle left-[63%] top-[73%]" style={{ animationDelay: "3.8s" }}>✦</span>
          <span className="mlp-sparkle left-[68%] top-[17%]" style={{ animationDelay: "5.1s" }}>✧</span>
          <span className="mlp-sparkle left-[73%] top-[58%]" style={{ animationDelay: "2.1s" }}>✦</span>
          <span className="mlp-sparkle left-[78%] top-[31%]" style={{ animationDelay: "3.3s" }}>✧</span>
          <span className="mlp-sparkle left-[83%] top-[79%]" style={{ animationDelay: "4.7s" }}>✦</span>
          <span className="mlp-sparkle left-[88%] top-[14%]" style={{ animationDelay: "0.9s" }}>✧</span>
          <span className="mlp-sparkle left-[93%] top-[47%]" style={{ animationDelay: "2.7s" }}>✦</span>
          <span className="mlp-sparkle left-[97%] top-[70%]" style={{ animationDelay: "5.4s" }}>✧</span>
          <span className="mlp-sparkle left-[6%] top-[86%] text-[10px]" style={{ animationDelay: "2.2s" }}>✦</span>
          <span className="mlp-sparkle left-[16%] top-[52%] text-[11px]" style={{ animationDelay: "4.1s" }}>✧</span>
          <span className="mlp-sparkle left-[26%] top-[36%] text-[12px]" style={{ animationDelay: "1.1s" }}>✦</span>
          <span className="mlp-sparkle left-[36%] top-[70%] text-[11px]" style={{ animationDelay: "3.7s" }}>✧</span>
          <span className="mlp-sparkle left-[46%] top-[30%] text-[10px]" style={{ animationDelay: "5.2s" }}>✦</span>
          <span className="mlp-sparkle left-[56%] top-[88%] text-[12px]" style={{ animationDelay: "1.9s" }}>✧</span>
          <span className="mlp-sparkle left-[66%] top-[38%] text-[10px]" style={{ animationDelay: "4.5s" }}>✦</span>
          <span className="mlp-sparkle left-[76%] top-[88%] text-[11px]" style={{ animationDelay: "2.6s" }}>✧</span>
          <span className="mlp-sparkle left-[86%] top-[63%] text-[12px]" style={{ animationDelay: "0.4s" }}>✦</span>
        </div>

        {/* DECORATIONS */}
        <div className="halloween-glow pointer-events-none absolute left-[2.8%] top-[3.2%] text-[38px] text-[#ee7e2b]/70">
          ☾
        </div>

        <div className="halloween-glow pointer-events-none absolute right-[3%] top-[3.2%] text-[42px] text-[#b383d1]/70">
          🦇
        </div>

        <div className="halloween-glow pointer-events-none absolute bottom-[3%] right-[3%] text-[40px] text-[#ee7e2b]/60">
          ☠
        </div>

        {/* HEADER */}
        <header className="absolute left-[4.5%] right-[4.5%] top-[2.5%] h-[8%]">
          <div className="relative flex h-full items-center justify-center">
            <div className="text-[clamp(38px,4.1vw,72px)] font-black uppercase leading-none tracking-[0.075em] text-[#d0a1e8] drop-shadow-[0_3px_0_#452351]">
              MLP
              <span className="mx-[0.08em] inline-block text-[1.16em] text-[#ee7e2b] drop-shadow-[0_0_10px_rgba(238,126,43,.45)]">
                E
              </span>
              KAYOU
            </div>

            <div className="absolute right-0 flex items-center gap-4 rounded-full border-2 border-[#6e4a7d] bg-[#25172e] px-7 py-3 shadow-[0_8px_20px_rgba(0,0,0,.35)]">
              <span className="h-4 w-4 rounded-full bg-[#ee7e2b] shadow-[0_0_10px_rgba(238,126,43,.9)]" />
              <span className="text-[clamp(16px,1.15vw,23px)] font-black uppercase tracking-[0.16em] text-[#e8cbee]">
                LIVE
              </span>
            </div>
          </div>
        </header>

        {/* MAIN CAM AREA */}
        <main className="absolute left-[4.5%] right-[4.5%] top-[13%] bottom-[21%] flex min-h-0 gap-[1.6%]">
          {/* HAND CAM */}
          <section className="min-h-0 w-[69%] shrink-0">
            <div className="relative h-full min-h-0 overflow-hidden rounded-[18px]" />
          </section>

          {/* RIGHT COLUMN */}
          <aside className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
            {/* FACE CAM */}
            <section className="relative min-h-0 flex-[1] overflow-hidden rounded-[18px]" />
          </aside>
        </main>

        {/* TOP SUPPORTERS — FULL WIDTH BOTTOM BAR */}
        <section className="absolute bottom-[6%] left-[2%] right-[2%] h-[15%]">
          <div className="flex h-full min-h-0 flex-col rounded-[22px] border-[5px] border-[#4e315c] bg-[#25172e] px-5 py-4 shadow-[0_16px_34px_rgba(0,0,0,.38)]">
            <div className="relative mb-3 flex shrink-0 items-center justify-center">
              <div className="text-[clamp(20px,1.45vw,29px)] font-black uppercase leading-none tracking-[0.02em] text-[#f1d4a3]">
                Top Supporters
              </div>

              <span className="halloween-glow absolute right-0 text-[30px] text-[#ee7e2b]">
                🎃
              </span>
            </div>

            {/* PILL-SHAPED SUPPORTER ITEMS */}
            <div className="grid min-h-0 flex-1 grid-cols-5 grid-rows-2 gap-2">
              {supporters.map((supporter, index) => (
                <div
                  key={supporter}
                  className={`flex min-h-0 items-center justify-center rounded-full px-4 text-center text-[clamp(14px,.85vw,18px)] font-black uppercase leading-none ${
                    index === 0
                      ? "bg-[#ee7e2b] text-[#25140c] shadow-[0_0_12px_rgba(238,126,43,.35)]"
                      : "bg-[#3b2547] text-[#e6c9ed]"
                  }`}
                >
                  {supporter}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="absolute bottom-[1.5%] left-[4.5%] right-[4.5%]">
          <div className="flex items-center">
            <div className="flex items-center gap-3">
              <span className="text-[28px] text-[#ee7e2b]">
                🦇
              </span>

              <span className="text-[clamp(15px,.95vw,21px)] font-black uppercase tracking-[0.18em] text-[#c9a8d4]">
                PAKRACARDS
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}