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
    <div className="h-screen w-screen overflow-hidden bg-[#ead8e0] font-['Oxanium'] text-[#503c47]">
      <div className="relative h-full w-full overflow-hidden bg-[#f7edf2]">

        {/* BACKGROUND */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,#fffafd_0%,transparent_28%),radial-gradient(circle_at_88%_15%,#ead4df_0%,transparent_30%),radial-gradient(circle_at_55%_100%,#fdf5f8_0%,transparent_40%)]" />

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

          .mlp-sparkle {
            position: absolute;
            pointer-events: none;
            z-index: 1;
            color: #c18ea5;
            font-size: 16px;
            line-height: 1;
            animation: sparkleDrift 4.5s ease-in-out infinite;
            will-change: transform, opacity;
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
        <div className="pointer-events-none absolute left-[2.8%] top-[3.2%] text-[38px] text-[#c89caf]/45">
          ✦
        </div>

        <div className="pointer-events-none absolute right-[3%] top-[3.2%] text-[42px] text-[#c89caf]/45">
          ♡
        </div>

        <div className="pointer-events-none absolute bottom-[3%] right-[3%] text-[40px] text-[#d3afbf]/40">
          ♡
        </div>

        {/* HEADER */}
        <header className="absolute left-[4.5%] right-[4.5%] top-[2.5%] h-[8%]">
          <div className="relative flex h-full items-center justify-center">

            <div className="text-[clamp(38px,4.1vw,72px)] font-black uppercase leading-none tracking-[0.075em] text-[#b77f99]">
              MLP
              <span className="mx-[0.08em] inline-block text-[1.16em] text-[#8f536f]">
                E
              </span>
              KAYOU
            </div>

            <div className="absolute right-0 flex items-center gap-4 rounded-full border-2 border-white bg-[#fffafd] px-7 py-3 shadow-[0_8px_20px_rgba(100,65,85,.10)]">
              <span className="h-4 w-4 rounded-full bg-[#b77f99]" />

              <span className="text-[clamp(16px,1.15vw,23px)] font-black uppercase tracking-[0.16em] text-[#876675]">
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

            {/* DISCORD BOX */}
            <section className="relative min-h-0 flex-[0.75] overflow-hidden rounded-[18px]">
              <img
                src="/set-pictures/discordselling.webp"
                alt="Discord TCG"
                className="h-full w-full rounded-[18px] object-contain"
              />
            </section>

          </aside>

        </main>

        {/* TOP SUPPORTERS — FULL WIDTH BOTTOM BAR */}
        <section className="absolute bottom-[6%] left-[2%] right-[2%] h-[15%]">

          <div className="flex h-full min-h-0 flex-col rounded-[22px] border-[5px] border-white bg-[#fffafd] px-5 py-4 shadow-[0_16px_34px_rgba(100,65,85,.13)]">

            <div className="relative mb-3 flex shrink-0 items-center justify-center">

              <div className="text-[clamp(20px,1.45vw,29px)] font-black uppercase leading-none tracking-[0.02em]">
                Top Supporters
              </div>

              <span className="absolute right-0 text-[30px] text-[#c18ea5]">
                ✦
              </span>

            </div>

            {/* PILL-SHAPED SUPPORTER ITEMS */}
            <div className="grid min-h-0 flex-1 grid-cols-5 grid-rows-2 gap-2">

              {supporters.map((supporter, index) => (

                <div
                  key={supporter}
                  className={`flex min-h-0 items-center justify-center rounded-full px-4 text-center text-[clamp(14px,.85vw,18px)] font-black uppercase leading-none ${
                    index === 0
                      ? "bg-[#dfbfce] text-[#5b4350]"
                      : "bg-[#f2e3ea] text-[#755664]"
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

              <span className="text-[28px] text-[#c18ea5]">
                ♡
              </span>

              <span className="text-[clamp(15px,.95vw,21px)] font-black uppercase tracking-[0.18em] text-[#876675]">
                STONESTRADINGCO
              </span>

            </div>

          </div>

        </footer>

      </div>
    </div>
  );
}
