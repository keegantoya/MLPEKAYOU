import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#171717] px-4 font-['Oxanium'] text-white">

      {/* SUBTLE TECH GRID */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage:
            "linear-gradient(#FFD400 1px, transparent 1px), linear-gradient(90deg, #FFD400 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* AMBIENT GOLD */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 bg-[#FFD400]/[0.025] blur-[120px]" />

      <main className="relative w-full max-w-lg -translate-y-8">

        {/* TECHNICAL CORNERS */}
        <div className="pointer-events-none absolute -left-px -top-px z-20 h-8 w-8 border-l border-t border-[#FFD400]/60" />
        <div className="pointer-events-none absolute -right-px -top-px z-20 h-8 w-8 border-r border-t border-[#FFD400]/30" />
        <div className="pointer-events-none absolute -bottom-px -left-px z-20 h-7 w-7 border-b border-l border-[#FFD400]/20" />
        <div className="pointer-events-none absolute -bottom-px -right-px z-20 h-7 w-7 border-b border-r border-[#FFD400]/35" />

        <div className="overflow-hidden border border-white/[0.08] bg-[#111111] shadow-[0_20px_70px_rgba(0,0,0,.45)]">

          {/* SYSTEM BAR */}
          <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#0d0d0d] px-4 py-2.5">

            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-[#FFD400] shadow-[0_0_8px_rgba(255,212,0,.7)]" />

              <span className="font-mono text-[6px] font-bold uppercase tracking-[0.24em] text-white/25">
                MLPEKAYOU // ROUTING SYSTEM
              </span>
            </div>

            <span className="font-mono text-[6px] font-bold uppercase tracking-[0.18em] text-red-400/55">
              ERROR
            </span>

          </div>

          {/* ERROR CONTENT */}
          <div className="px-6 py-10 text-center sm:px-10 sm:py-12">

            {/* ERROR ICON */}
            <div className="relative mx-auto mb-7 flex h-20 w-20 items-center justify-center border border-[#FFD400]/25 bg-[#181818]">

              <div className="absolute left-0 top-0 h-4 w-4 border-l border-t border-[#FFD400]/60" />
              <div className="absolute right-0 top-0 h-4 w-4 border-r border-t border-[#FFD400]/30" />
              <div className="absolute bottom-0 left-0 h-4 w-4 border-b border-l border-[#FFD400]/20" />
              <div className="absolute bottom-0 right-0 h-4 w-4 border-b border-r border-[#FFD400]/40" />

              <span className="text-4xl font-black tracking-[-0.05em] text-[#FFD400] drop-shadow-[0_0_14px_rgba(255,212,0,.18)]">
                404
              </span>
            </div>

            {/* SYSTEM LABEL */}
            <div className="mb-3 flex items-center justify-center gap-2">

              <span className="h-px w-8 bg-[#FFD400]/25" />

              <span className="font-mono text-[6px] font-bold uppercase tracking-[0.25em] text-[#FFD400]/55">
                ROUTE NOT FOUND
              </span>

              <span className="h-px w-8 bg-[#FFD400]/25" />

            </div>

            <h1 className="text-2xl font-black uppercase tracking-[0.06em] text-white sm:text-3xl">
              Page Not Found
            </h1>

            <p className="mx-auto mt-3 max-w-sm font-mono text-[7px] uppercase leading-[1.8] tracking-[0.1em] text-white/25">
              The requested destination could not be located
              within the MLPEKAYOU network.
            </p>

            {/* REQUESTED ROUTE */}
            <div className="mx-auto mt-6 max-w-sm border border-white/[0.06] bg-[#0d0d0d] px-4 py-3 text-left">

              <div className="mb-1 font-mono text-[6px] font-bold uppercase tracking-[0.18em] text-white/15">
                REQUESTED ROUTE
              </div>

              <div className="truncate font-mono text-[8px] tracking-[0.04em] text-[#FFD400]/60">
                {location.pathname}
              </div>

            </div>

            {/* RETURN HOME */}
            <Link
              to="/"
              className="
                mx-auto
                mt-6
                flex
                h-11
                w-full
                max-w-sm
                items-center
                justify-center
                border
                border-[#FFD400]
                bg-[#FFD400]
                font-['Oxanium']
                text-[8px]
                font-black
                uppercase
                tracking-[0.14em]
                text-[#171717]
                transition-all
                duration-200
                hover:bg-[#ffe45c]
                hover:shadow-[0_0_18px_rgba(255,212,0,.18)]
              "
            >
              Return to Home
              <span className="ml-2 text-sm leading-none">
                →
              </span>
            </Link>

          </div>

          {/* FOOTER STATUS */}
          <div className="flex items-center justify-between border-t border-white/[0.05] bg-[#0d0d0d] px-5 py-2.5">

            <span className="font-mono text-[5px] uppercase tracking-[0.18em] text-white/15">
              ROUTING NODE // 404
            </span>

            <span className="flex items-center gap-1.5 font-mono text-[5px] font-bold uppercase tracking-[0.16em] text-red-400/40">
              <span className="h-1 w-1 bg-red-400/70" />
              DESTINATION INVALID
            </span>

          </div>

        </div>

        {/* BOTTOM SYSTEM TEXT */}
        <div className="mt-3 flex justify-center gap-3 font-mono text-[5px] uppercase tracking-[0.18em] text-white/10">
          <span>MLPEKAYOU</span>
          <span>•</span>
          <span>ROUTING SYSTEM</span>
        </div>

      </main>
    </div>
  );
};

export default NotFound;