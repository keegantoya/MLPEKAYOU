export default function LinksPage() {
  const products = [
    {
      name: "FUN MOMENTS 3",
      image: "/set-pictures/funmomentsthreeboxstone.webp",
    },
    {
      name: "STAR 1 - 25% OFF",
      image: "/set-pictures/staronebox.webp",
    },
    {
      name: "DISCORD TCG",
      image: "/set-pictures/discordselling.webp",
    },
  ];

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

        {/* Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,#fffafd_0%,transparent_28%),radial-gradient(circle_at_88%_22%,#ead4df_0%,transparent_30%),radial-gradient(circle_at_65%_95%,#fdf5f8_0%,transparent_38%)]" />

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.11]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(145,100,120,.25) 1px, transparent 1px)",
            backgroundSize: "34px 34px",
          }}
        />

        <div className="pointer-events-none absolute inset-[1.4%] rounded-[42px] border-[3px] border-[#d4afbf]" />
        <div className="pointer-events-none absolute inset-[2%] rounded-[37px] border-2 border-white" />

        {/* Decorations */}
        <div className="pointer-events-none absolute left-[3.5%] top-[6%] text-[42px] text-[#c89caf]/50">
          ✦
        </div>

        <div className="pointer-events-none absolute right-[4%] top-[6%] text-[44px] text-[#c89caf]/50">
          ♡
        </div>

        <div className="pointer-events-none absolute bottom-[5%] right-[4%] text-[46px] text-[#d3afbf]/45">
          ♡
        </div>

        {/* Header */}
        <header className="absolute left-[5%] right-[5%] top-[4%] h-[9%]">
          <div className="flex h-full items-center gap-5">
            <div className="flex aspect-square h-[min(80px,7vh)] shrink-0 items-center justify-center rounded-[25px] border-[3px] border-white bg-[#dfbfce] text-[clamp(28px,2.2vw,38px)] text-white shadow-[0_10px_25px_rgba(100,65,85,.12)]">
              ♡
            </div>

            <div className="text-[clamp(34px,4vw,72px)] font-black uppercase leading-[.9] tracking-[0.04em]">
              MLPE<span className="text-[#b77f99]">KAYOU</span>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="absolute bottom-[7%] left-[5%] right-[5%] top-[14%] flex min-h-0 gap-[2%]">

          {/* LEFT / HAND CAM + STONES TRADING CO */}
          <section className="flex min-h-0 w-[70%] shrink-0 flex-col gap-5">

            {/* HAND CAM */}
            <div className="relative min-h-0 flex-[1.55]">
              <div className="absolute left-8 top-8 z-10 px-7 py-3.5 text-[16px] font-black uppercase tracking-[0.2em] text-[#5d4651]">

              </div>
            </div>

            {/* STONES TRADING CO */}
            <div className="min-h-0 flex-[0.55] rounded-[30px] border-[5px] border-white bg-[#fffafd] px-6 py-4 shadow-[0_14px_30px_rgba(100,65,85,.12)]">

              <div className="mb-3 flex items-center justify-between">
                <div className="text-[clamp(20px,1.5vw,30px)] font-black uppercase leading-none">
                  <span className="text-[#503c47]">
                    STONES
                  </span>
                  <span className="text-[#b77f99]">
                    TRADINGCO
                  </span>
                </div>

                <span className="text-[26px] text-[#c18ea5]">
                  ✦
                </span>
              </div>

              <div className="grid h-[calc(100%-40px)] min-h-0 grid-cols-3 gap-3">
                {products.map((product) => (
                  <div
                    key={product.name}
                    className="flex min-h-0 flex-col overflow-hidden rounded-[20px] border-[3px] border-[#ead5df] bg-white shadow-[0_8px_18px_rgba(100,65,85,.08)]"
                  >
                    <div className="flex shrink-0 items-center justify-center bg-[#dfbfce] px-2 py-2.5">
                      <span className="text-center text-[clamp(13px,1vw,20px)] font-black uppercase leading-tight tracking-[0.04em] text-[#5d4651]">
                        {product.name}
                      </span>
                    </div>

                    <div className="min-h-0 flex-1 p-2">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* RIGHT SIDE */}
          <aside className="flex min-h-0 min-w-0 flex-1 flex-col gap-5">

            {/* FACE CAM */}
            <section className="relative min-h-0 flex-[1]">

              <div className="absolute left-5 top-5 z-10 rounded-full bg-[#dfbfce] px-7 py-3 text-[16px] font-black uppercase tracking-[0.18em] text-[#5d4651]">
                FACE CAM
              </div>

              <div className="absolute right-5 top-5 z-10 text-[28px] text-[#c18ea5]">
                ♡
              </div>

            </section>

            {/* SUPPORTERS */}
            <section className="min-h-0 flex-[1.15]">
              <div className="flex h-full min-h-0 flex-col justify-center rounded-[30px] border-[5px] border-white bg-[#fffafd] px-6 py-6 shadow-[0_14px_30px_rgba(100,65,85,.12)]">

                <div className="mb-5 flex shrink-0 items-center justify-between">
                  <div className="text-[clamp(24px,1.8vw,36px)] font-black uppercase leading-none tracking-[0.02em]">
                    Top Supporters
                  </div>

                  <span className="text-[30px] text-[#c18ea5]">
                    ✦
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-3">
                  {supporters.map((supporter, index) => (
                    <div
                      key={supporter}
                      className={`flex min-h-[48px] items-center justify-center rounded-xl px-2 py-3 text-center text-[clamp(16px,1.05vw,22px)] font-black uppercase leading-none ${
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

        {/* Footer */}
        <footer className="absolute bottom-[2.5%] left-[5%] right-[5%]">
          <div className="flex items-center gap-3">
            <span className="text-[25px] text-[#c18ea5]">
              ♡
            </span>

            <span className="text-[clamp(13px,.8vw,18px)] font-black uppercase tracking-[0.16em] text-[#876675]">
              MLPEKAYOU.COMMUNITY
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}