export default function LinksPage() {
  return (
    <div className="min-h-screen bg-[#090a0a] font-['Oxanium'] text-white">
      <div className="relative mx-auto aspect-[2/1] min-h-screen w-full max-w-[2200px] overflow-hidden bg-[#0b0c0c]">
        {/* ========================================================= */}
        {/* BACKGROUND HUD / TECH GRID                               */}
        {/* ========================================================= */}

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,212,0,.16) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,212,0,.16) 1px, transparent 1px),
              linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px, 80px 80px, 20px 20px, 20px 20px",
          }}
        />

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_45%_45%,rgba(255,212,0,.045),transparent_42%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,212,0,.035),transparent_20%,transparent_80%,rgba(255,212,0,.025))]" />

        {/* ========================================================= */}
        {/* OUTER FRAME                                               */}
        {/* ========================================================= */}

        <div className="pointer-events-none absolute inset-[1.2%] border border-[#FFD400]/30" />
        <div className="pointer-events-none absolute inset-[1.7%] border border-white/[0.035]" />

        {/* Top-left technical corner */}
        <div className="absolute left-[1.2%] top-[1.2%] h-[9%] w-[18%] border-l-2 border-t-2 border-[#FFD400]/80" />
        <div className="absolute left-[1.2%] top-[1.2%] h-px w-[28%] bg-[#FFD400]/30" />
        <div className="absolute left-[1.2%] top-[1.2%] h-[1px] w-[7%] bg-[#FFD400]" />

        {/* Top-right technical corner */}
        <div className="absolute right-[1.2%] top-[1.2%] h-[9%] w-[18%] border-r-2 border-t-2 border-[#FFD400]/50" />
        <div className="absolute right-[1.2%] top-[1.2%] h-px w-[28%] bg-[#FFD400]/20" />

        {/* Bottom corners */}
        <div className="absolute bottom-[1.2%] left-[1.2%] h-[7%] w-[14%] border-b-2 border-l-2 border-[#FFD400]/40" />
        <div className="absolute bottom-[1.2%] right-[1.2%] h-[7%] w-[14%] border-b-2 border-r-2 border-[#FFD400]/40" />

        {/* ========================================================= */}
        {/* HEADER                                                     */}
        {/* ========================================================= */}

        <header className="absolute left-[3%] right-[3%] top-[2.4%] flex items-center justify-between">
          <div className="flex items-center">
            <div className="relative flex h-14 w-14 items-center">
            </div>

            <div>
              <div className="text-[clamp(22px,2.8vw,52px)] font-black uppercase leading-none tracking-[0.12em]">
                MLPE<span className="text-[#FFD400]">KAYOU</span>
              </div>
              <div className="mt-2 font-mono text-[clamp(15px,.55vw,11px)] uppercase tracking-[0.35em] text-white/30">
                TRADING CARDS // CREATOR SYSTEM
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <div className="text-right">
              <div className="font-mono text-[18px] uppercase tracking-[0.3em] text-[#FFD400]/70">
                STREAM STATUS
              </div>
              <div className="mt-1 flex items-center justify-end gap-2 font-mono text-[25px] uppercase tracking-[0.2em] text-white/30">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FFD400] shadow-[0_0_10px_#FFD400]" />
                SYSTEMS ONLINE
              </div>
            </div>

            <div className="h-10 w-px bg-[#FFD400]/20" />

            <div className="font-mono text-[25px] uppercase tracking-[0.22em] text-white/50">
              01 // LIVE
            </div>
          </div>
        </header>

        {/* ========================================================= */}
        {/* HANDCAM                                                   */}
        {/* ========================================================= */}

        <section className="absolute bottom-[15%] left-[3%] top-[18%] w-[65.5%]">
          {/* Clean camera frame: nothing extends into the camera area. */}
          <div className="absolute inset-0 border border-[#FFD400]/55 bg-[#050606]/20 shadow-[0_0_45px_rgba(255,212,0,.035)]" />
        </section>

        {/* ========================================================= */}
        {/* RIGHT COLUMN                                               */}
        {/* ========================================================= */}

        <aside className="absolute bottom-[15%] right-[3%] top-[18%] w-[28%]">
          {/* ======================================================= */}
          {/* FACECAM                                                   */}
          {/* ======================================================= */}

          <section className="absolute left-0 right-0 top-0 h-[43%]">
            {/* Clean camera frame: nothing extends into the camera area. */}
            <div className="absolute inset-0 border border-[#FFD400]/45 bg-[#050606]/20" />
          </section>

          {/* ======================================================= */}
          {/* AVAILABLE PRODUCTS                                       */}
          {/* ======================================================= */}

          <section className="absolute bottom-[15%] left-0 right-0 top-[40%]">
            <div className="absolute inset-0 border border-[#FFD400]/45 bg-[#0a0b0b]/90" />
            <div className="absolute left-0 top-0 h-full w-1 bg-[#FFD400]" />

            <div className="absolute -top-3 left-5 bg-[#0b0c0c] px-3 font-mono text-[25px] font-bold uppercase tracking-[0.25em] text-[#FFD400]/70">
              AVAILABLE PRODUCTS
            </div>

            <div className="relative grid h-full grid-cols-2 gap-3 px-4 pb-4 pt-5">
              <div className="flex min-h-0 items-center justify-center border border-white/[0.06] bg-black/20 p-1">
                <img
                  src="/set-pictures/discordselling.webp"
                  alt="Discord"
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="flex min-h-0 items-center justify-center border border-white/[0.06] bg-black/20 p-1">
                <img
                  src="/set-pictures/funmomentsthreeboxstone.webp"
                  alt="Fun Moments 3"
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="flex min-h-0 items-center justify-center border border-white/[0.06] bg-black/20 p-1">
                <img
                  src="/set-pictures/moonthreebox.webp"
                  alt="Moon 3"
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="flex min-h-0 items-center justify-center border border-white/[0.06] bg-black/20 p-1">
                <img
                  src="/set-pictures/staronebox.webp"
                  alt="Star 1"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          </section>

          {/* ======================================================= */}
          {/* TOP SUPPORTERS                                          */}
          {/* ======================================================= */}

          <section className="absolute bottom-0 left-0 right-0 h-[15%]">
            <div className="absolute inset-0 border border-[#FFD400]/45 bg-[#0a0b0b]/90" />
            <div className="absolute left-0 top-0 h-full w-1 bg-[#FFD400]/70" />

            <div className="absolute -top-3 left-5 bg-[#0b0c0c] px-3 font-mono text-[20px] font-bold uppercase tracking-[0.25em] text-[#FFD400]/70">
              TOP SUPPORTERS
            </div>

            <div className="relative flex h-full items-center px-7">
              <div className="grid w-full grid-cols-3 gap-x-5 gap-y-0.5 font-mono text-[clamp(20px,.6vw,12px)] font-bold uppercase tracking-[0.12em] text-white/75">
                <span className="text-[#FFD400]">Mari</span>
                <span>Badger</span>
                <span>Violet</span>
                <span>Vy</span>
                <span>Brea</span>
                <span>Panda</span>
                <span>Hyve</span>
                <span>Rain</span>
                <span>Kotoshi</span>
              </div>
            </div>
          </section>
        </aside>

        {/* ========================================================= */}
        {/* BOTTOM HUD BAR                                             */}
        {/* ========================================================= */}

        <footer className="absolute bottom-[3.2%] left-[3%] right-[3%] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[30px] uppercase tracking-[0.3em] text-[#FFD400]/50">
              MLPEKAYOU.COM
            </span>
            <span className="h-px w-14 bg-[#FFD400]/20" />
            <span className="hidden font-mono text-[25px] uppercase tracking-[0.25em] text-white/35 sm:inline">
              COLLECT // TRADE // COMPETE
            </span>
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden items-center gap-2 sm:flex">
              <span className="h-1 w-5 bg-[#FFD400]" />
              <span className="h-1 w-3 bg-[#FFD400]/50" />
              <span className="h-1 w-1 bg-[#FFD400]/25" />
            </div>

            <span className="font-mono text-[35px] uppercase tracking-[0.3em] text-white/40">
              LIVE
            </span>

            <span className="h-2 w-2 rounded-full bg-[#FFD400] shadow-[0_0_12px_#FFD400]" />
          </div>
        </footer>

        {/* Decorative HUD dots / lines */}
        <div className="pointer-events-none absolute left-[3%] top-[12%] flex gap-1">
          <span className="h-1 w-8 bg-[#FFD400]/40" />
          <span className="h-1 w-3 bg-[#FFD400]/20" />
          <span className="h-1 w-1 bg-[#FFD400]" />
        </div>

        <div className="pointer-events-none absolute right-[3%] top-[12%] font-mono text-[25px] uppercase tracking-[0.3em] text-white/35">
          KEEGAN // KAYOU INTERFACE
        </div>
      </div>
    </div>
  );
}