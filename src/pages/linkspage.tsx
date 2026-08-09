import keeganPfp from "@/assets/avatars/keeganpfp2.webp";

export default function LinksPage() {
  const links = [
    {
      label: "TikTok",
      description: "FOLLOW ON TIKTOK",
      href: "https://www.tiktok.com/@samrykee?_r=1&_t=ZP-98j3fEzWpV1",
      code: "SOCIAL // 01",
    },
    {
      label: "Instagram",
      description: "FOLLOW ON INSTAGRAM",
      href: "https://www.instagram.com/sammikiii/",
      code: "SOCIAL // 02",
    },
    {
      label: "Discord",
      description: "JOIN THE MLPEKAYOU COMMUNITY",
      href: "https://discord.gg/mlpekayou",
      code: "COMMUNITY // 01",
    },
    {
      label: "MLPEKayou",
      description: "VISIT MLPEKAYOU",
      href: "https://www.mlpekayou.com/",
      code: "PROJECT // 01",
    },
    {
      label: "MyPrismaTCG",
      description: "VISIT MYPRISMATCG",
      href: "https://www.myprismatcg.com/",
      code: "PROJECT // 02",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#171717] px-4 py-8 font-['Oxanium'] text-white sm:py-12">

      {/* SUBTLE TECH GRID */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.018]"
        style={{
          backgroundImage:
            "linear-gradient(#FFD400 1px, transparent 1px), linear-gradient(90deg, #FFD400 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* AMBIENT GOLD */}
      <div className="pointer-events-none fixed left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 bg-[#FFD400]/[0.025] blur-[130px]" />

      <main className="relative mx-auto w-full max-w-md">

        {/* ===================================================== */}
        {/* PROFILE HEADER */}
        {/* ===================================================== */}

        <section className="relative overflow-hidden border border-white/[0.08] bg-[#111111]">

          {/* Technical corners */}
          <div className="pointer-events-none absolute left-0 top-0 h-7 w-7 border-l border-t border-[#FFD400]/60" />
          <div className="pointer-events-none absolute right-0 top-0 h-7 w-7 border-r border-t border-[#FFD400]/30" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-6 w-6 border-b border-l border-[#FFD400]/20" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-6 w-6 border-b border-r border-[#FFD400]/40" />

          {/* System label */}
          <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#0d0d0d] px-4 py-2.5">

            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-[#FFD400] shadow-[0_0_8px_rgba(255,212,0,.7)]" />

              <span className="font-mono text-[6px] font-bold uppercase tracking-[0.22em] text-white/25">
                PERSONAL // LINKS
              </span>
            </div>

            <span className="font-mono text-[6px] uppercase tracking-[0.18em] text-[#FFD400]/40">
              ONLINE
            </span>

          </div>

          {/* Profile */}
          <div className="px-6 pb-7 pt-7 text-center">

            {/* Avatar */}
            <div className="relative mx-auto h-28 w-28">

              <div className="absolute -inset-1 border border-[#FFD400]/30" />

              <div className="absolute -left-1 -top-1 h-5 w-5 border-l border-t border-[#FFD400]/70" />
              <div className="absolute -right-1 -top-1 h-5 w-5 border-r border-t border-[#FFD400]/40" />
              <div className="absolute -bottom-1 -left-1 h-5 w-5 border-b border-l border-[#FFD400]/25" />
              <div className="absolute -bottom-1 -right-1 h-5 w-5 border-b border-r border-[#FFD400]/55" />

              <img
                src={keeganPfp}
                alt="Keegan"
                className="h-full w-full object-cover"
              />

              {/* Online indicator */}
              <span className="absolute -bottom-1.5 -right-1.5 flex h-5 w-5 items-center justify-center border border-[#111111] bg-[#FFD400]">
                <span className="h-1.5 w-1.5 bg-[#171717]" />
              </span>

            </div>

            {/* Name */}
            <div className="mt-6">

              <div className="mb-2 flex items-center justify-center gap-2">
                <span className="h-px w-6 bg-[#FFD400]/30" />

                <span className="font-mono text-[6px] font-bold uppercase tracking-[0.25em] text-[#FFD400]/55">
                  CREATOR PROFILE
                </span>

                <span className="h-px w-6 bg-[#FFD400]/30" />
              </div>

              <h1 className="text-3xl font-black uppercase tracking-[0.05em] text-white">
                Keegan's Links
              </h1>

              <p className="mt-2 font-mono text-[7px] uppercase tracking-[0.14em] text-white/20">
                MLPEKAYOU // SOCIAL & COMMUNITY HUB
              </p>

            </div>

          </div>
        </section>


        {/* ===================================================== */}
        {/* LINKS */}
        {/* ===================================================== */}

        <section className="mt-4">

          <div className="mb-2 flex items-center justify-between px-1">

            <span className="font-mono text-[6px] font-bold uppercase tracking-[0.22em] text-white/20">
              AVAILABLE DESTINATIONS
            </span>

            <span className="font-mono text-[6px] uppercase tracking-[0.16em] text-[#FFD400]/35">
              {links.length.toString().padStart(2, "0")} LINKS
            </span>

          </div>

          <div className="space-y-2">

            {links.map((link, index) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  group
                  relative
                  block
                  overflow-hidden
                  border
                  border-white/[0.07]
                  bg-[#111111]
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:border-[#FFD400]/40
                  hover:bg-[#141414]
                  hover:shadow-[0_8px_24px_rgba(0,0,0,.28)]
                "
              >

                {/* Hover sweep */}
                <div className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-[#FFD400]/[0.06] to-transparent transition-transform duration-700 group-hover:translate-x-[520%]" />

                {/* Gold left rail */}
                <div className="absolute bottom-0 left-0 top-0 w-px bg-[#FFD400]/0 transition-colors duration-200 group-hover:bg-[#FFD400]/70" />

                <div className="relative flex min-h-[72px] items-center gap-4 px-4 py-3">

                  {/* Number */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/[0.07] bg-[#0d0d0d] transition-colors duration-200 group-hover:border-[#FFD400]/25">

                    <span className="font-mono text-[7px] font-bold text-white/20 transition-colors group-hover:text-[#FFD400]/65">
                      {(index + 1).toString().padStart(2, "0")}
                    </span>

                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1 text-left">

                    <div className="flex items-center gap-2">

                      <h2 className="truncate text-sm font-black uppercase tracking-[0.06em] text-white/85 transition-colors duration-200 group-hover:text-[#FFD400]">
                        {link.label}
                      </h2>

                      <span className="shrink-0 font-mono text-[6px] text-white/10 transition-colors group-hover:text-[#FFD400]/40">
                        ↗
                      </span>

                    </div>

                    <p className="mt-1 truncate font-mono text-[6px] uppercase tracking-[0.14em] text-white/20 transition-colors group-hover:text-white/30">
                      {link.description}
                    </p>

                  </div>

                  {/* Technical code */}
                  <div className="hidden shrink-0 text-right sm:block">

                    <div className="font-mono text-[5px] uppercase tracking-[0.12em] text-white/10">
                      {link.code}
                    </div>

                    <div className="mt-1 flex items-center justify-end gap-1.5">
                      <span className="h-1 w-1 bg-[#FFD400]/30 transition-all group-hover:bg-[#FFD400] group-hover:shadow-[0_0_6px_rgba(255,212,0,.7)]" />

                      <span className="font-mono text-[5px] uppercase tracking-[0.12em] text-white/10">
                        OPEN
                      </span>
                    </div>

                  </div>

                  {/* Arrow */}
                  <span className="shrink-0 text-sm text-white/15 transition-all duration-200 group-hover:translate-x-1 group-hover:text-[#FFD400]">
                    →
                  </span>

                </div>

              </a>
            ))}

          </div>
        </section>


        {/* ===================================================== */}
        {/* FOOTER */}
        {/* ===================================================== */}

        <footer className="mt-6 text-center">

          <div className="mx-auto mb-3 flex items-center justify-center gap-2">

            <span className="h-px w-8 bg-white/[0.06]" />

            <span className="h-1 w-1 bg-[#FFD400]/40" />

            <span className="h-px w-8 bg-white/[0.06]" />

          </div>

          <div className="font-mono text-[5px] uppercase tracking-[0.2em] text-white/10">
            MLPEKAYOU • CREATOR LINKS • SYSTEM ONLINE
          </div>

        </footer>

      </main>
    </div>
  );
}