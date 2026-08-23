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

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(145,100,120,.35) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* OUTER FRAME */}
        <div className="pointer-events-none absolute inset-[1.2%] border-[3px] border-[#d4afbf]" />
        <div className="pointer-events-none absolute inset-[1.8%] border-2 border-white/90" />

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
        <header className="absolute left-[4.5%] right-[4.5%] top-[3.5%] h-[8%]">
          <div className="flex h-full items-center gap-4">

            <div className="flex aspect-square h-[min(72px,6.5vh)] shrink-0 items-center justify-center rounded-[20px] border-[3px] border-white bg-[#dfbfce] text-[32px] text-white shadow-[0_8px_20px_rgba(100,65,85,.12)]">
              ♡
            </div>

            <div className="text-[clamp(32px,3.5vw,62px)] font-black uppercase leading-none tracking-[0.035em]">
              MLPE
              <span className="text-[#b77f99]">KAYOU</span>
            </div>

            <div className="ml-auto flex items-center gap-3 rounded-full border-2 border-white bg-[#fffafd] px-5 py-2 shadow-[0_6px_15px_rgba(100,65,85,.08)]">
              <span className="h-3 w-3 rounded-full bg-[#b77f99]" />
              <span className="text-[clamp(13px,.9vw,18px)] font-black uppercase tracking-[0.16em] text-[#876675]">
                LIVE
              </span>
            </div>

          </div>
        </header>

        {/* MAIN */}
        <main className="absolute bottom-[6.5%] left-[4.5%] right-[4.5%] top-[13%] flex min-h-0 gap-[1.6%]">

          {/* LEFT */}
          <section className="flex min-h-0 w-[69%] shrink-0 flex-col gap-4">

            {/* HAND CAM */}
            <div className="relative min-h-0 flex-[1.55] overflow-hidden border-[5px] border-white bg-[#ead8e0] shadow-[0_14px_30px_rgba(100,65,85,.12)]">

              <div className="absolute left-5 top-5 z-10 flex items-center gap-3 bg-[#dfbfce] px-6 py-3 shadow-[0_5px_12px_rgba(100,65,85,.08)]">
                <span className="h-3 w-3 rounded-full bg-[#b77f99]" />
                <span className="text-[clamp(14px,1vw,20px)] font-black uppercase tracking-[0.18em] text-[#5d4651]">
                  HAND CAM
                </span>
              </div>

            </div>

            {/* DISCORD TCG */}
            <section className="min-h-0 flex-[0.72] overflow-hidden border-[5px] border-white bg-[#fffafd] px-5 py-4 shadow-[0_14px_30px_rgba(100,65,85,.12)]">

              <div className="mb-3 flex h-[13%] min-h-[34px] items-center justify-between">

                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-[#b77f99]" />

                  <div className="text-[clamp(21px,1.55vw,30px)] font-black uppercase leading-none tracking-[0.025em]">
                    <span className="text-[#503c47]">
                      STONES
                    </span>
                    <span className="text-[#b77f99]">
                      TRADING CO
                    </span>
                  </div>
                </div>

                <span className="text-[25px] text-[#c18ea5]">
                  ✦
                </span>

              </div>

              <div className="grid h-[calc(87%-12px)] min-h-0 grid-cols-[1.4fr_1fr] gap-4">

                {/* PRODUCT IMAGE */}
                <div className="relative min-h-0 overflow-hidden border-[3px] border-[#ead5df] bg-white">

                  <img
                    src="/set-pictures/discordselling.webp"
                    alt="Discord TCG"
                    className="h-full w-full object-contain p-3"
                  />

                </div>

                {/* PRODUCT INFO */}
                <div className="flex min-h-0 flex-col justify-center border-[3px] border-[#ead5df] bg-[#f8edf2] p-5">

                  <div className="mb-2 text-[clamp(15px,1vw,20px)] font-black uppercase tracking-[0.12em] text-[#876675]">
                    MY LITTLE PONY
                  </div>

                  <div className="text-[clamp(25px,2vw,40px)] font-black uppercase leading-[0.9] tracking-[0.02em] text-[#503c47]">
                    DISCORD
                  </div>

                  <div className="mt-1 text-[clamp(20px,1.5vw,30px)] font-black uppercase leading-none text-[#b77f99]">
                    TCG
                  </div>

                  <div className="my-5 h-[2px] w-full bg-[#dfbfce]" />

                  <div className="text-[clamp(13px,.8vw,17px)] font-black uppercase tracking-[0.1em] text-[#876675]">
                    AVAILABLE NOW
                  </div>

                  <div className="mt-1 text-[clamp(25px,1.8vw,36px)] font-black leading-none text-[#503c47]">
                    $59.80
                  </div>

                  <div className="mt-1 text-[clamp(12px,.75vw,16px)] font-black uppercase tracking-[0.12em] text-[#b77f99]">
                    PER BOX
                  </div>

                </div>

              </div>

            </section>
          </section>

          {/* RIGHT */}
          <aside className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">

            {/* FACE CAM */}
            <section className="relative min-h-0 flex-[1.05] overflow-hidden border-[5px] border-white bg-[#ead8e0] shadow-[0_14px_30px_rgba(100,65,85,.12)]">

              <div className="absolute left-5 top-5 z-10 flex items-center gap-3 bg-[#dfbfce] px-6 py-3 shadow-[0_5px_12px_rgba(100,65,85,.08)]">

                <span className="h-3 w-3 rounded-full bg-[#b77f99]" />

                <span className="text-[clamp(14px,1vw,19px)] font-black uppercase tracking-[0.18em] text-[#5d4651]">
                  FACE CAM
                </span>

              </div>

              <div className="absolute right-5 top-5 text-[27px] text-[#c18ea5]">
                ♡
              </div>

            </section>

            {/* SUPPORTERS */}
            <section className="min-h-0 flex-[0.95]">

              <div className="flex h-full min-h-0 flex-col border-[5px] border-white bg-[#fffafd] px-5 py-5 shadow-[0_14px_30px_rgba(100,65,85,.12)]">

                <div className="mb-4 flex shrink-0 items-center justify-between">

                  <div className="flex items-center gap-3">

                    <div className="h-3 w-3 rounded-full bg-[#b77f99]" />

                    <div className="text-[clamp(22px,1.6vw,32px)] font-black uppercase leading-none tracking-[0.02em]">
                      Top Supporters
                    </div>

                  </div>

                  <span className="text-[28px] text-[#c18ea5]">
                    ✦
                  </span>

                </div>

                <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-5 gap-2.5">

                  {supporters.map((supporter, index) => (
                    <div
                      key={supporter}
                      className={`flex min-h-0 items-center justify-center px-3 text-center text-[clamp(14px,.9vw,19px)] font-black uppercase leading-none ${
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

          </aside>
        </main>

        {/* FOOTER */}
        <footer className="absolute bottom-[2%] left-[4.5%] right-[4.5%]">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <span className="text-[22px] text-[#c18ea5]">
                ♡
              </span>

              <span className="text-[clamp(12px,.7vw,16px)] font-black uppercase tracking-[0.15em] text-[#876675]">
                MLPEKAYOU.COMMUNITY
              </span>

            </div>

            <div className="text-[clamp(11px,.65vw,15px)] font-black uppercase tracking-[0.12em] text-[#a18391]">
              KAYOU CARD COLLECTING
            </div>

          </div>

        </footer>

      </div>
    </div>
  );
}